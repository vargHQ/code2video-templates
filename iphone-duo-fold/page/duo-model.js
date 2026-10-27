// Loads Apple's iPhone Duo AR Quick Look USDZ straight into three.js with a chosen pose and colour.
//
// The USDZ is a small USD layer stack: the root layer payloads the geometry layer, and nested variant sets pick
// the pose (per-mesh `points` plus a referenced layer with normals) and the finish (material inputs and
// textures). three r186's composer does not merge override layers, so this flattens the stack itself, weakest
// to strongest: payload → references authored in selected variants → selected variant bodies → root-layer
// local opinions. Upstream (jadon7/iphone-duo) did the same flatten with Pixar's Python USD before loading.
import { unzipSync } from 'three/addons/libs/fflate.module.js';
import { USDAParser } from 'three/addons/loaders/usd/USDAParser.js';
import { USDComposer } from 'three/addons/loaders/usd/USDComposer.js';
import { USDCParser } from './usd-crate-listops.js';

const VARIANT_SEGMENT = /^\{(\w+)=(\w*)\}$/;
const ARC_FIELDS = ['references', 'payload', 'variantSelection', 'variantSetChildren', 'variantSetNames', 'variantChildren'];
const IMAGE = ['png', 'jpg', 'jpeg', 'avif'];

export async function loadDuo(url, { pose = 'Landscape', color = 'Star_White' } = {}) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`model not found at ${url} (run: bun render.ts --setup)`);
  const zip = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const text = new TextDecoder();
  const layers = {}, assets = {};
  for (const [name, bytes] of Object.entries(zip)) {
    const ext = name.split('.').pop().toLowerCase();
    if (IMAGE.includes(ext)) assets[name] = bytes;
    if (!['usd', 'usda', 'usdc'].includes(ext)) continue;
    const crate = bytes.length >= 8 && text.decode(bytes.subarray(0, 8)) === 'PXR-USDC';
    layers[name] = crate
      ? new USDCParser().parseData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
      : new USDAParser().parseData(text.decode(bytes));
  }
  const rootName = Object.keys(zip)[0];
  const root = layers[rootName].specsByPath;

  // Resolve variant selections: the requested Pose/Color, then whatever their bodies select, until stable.
  const selection = { Pose: pose, Color: color };
  for (let changed = true; changed;) {
    changed = false;
    for (const [path, spec] of Object.entries(root)) {
      const picks = spec.fields?.variantSelection;
      if (!picks || stripVariants(path, selection) === null) continue;
      for (const [set, value] of Object.entries(picks)) {
        if (!(set in selection)) { selection[set] = value; changed = true; }
      }
    }
  }

  const merged = {};
  const payloads = [], references = [], bodies = [], locals = [];
  for (const [path, spec] of Object.entries(root)) {
    const target = stripVariants(path, selection);
    if (target === null) continue;
    for (const arc of [spec.fields?.payload, spec.fields?.references]) {
      for (const item of arc?.items ?? []) (arc.listOp === 'payload' ? payloads : references).push({ target, item });
    }
    // Variant and variant-set specs only carry arcs and selections.
    if (spec.specType === 10 || spec.specType === 11) continue;
    (path.includes('{') ? bodies : locals).push([target, spec]);
  }
  for (const { target, item } of [...payloads, ...references]) {
    const layerName = resolveAsset(rootName, item.assetPath);
    const layer = layers[layerName];
    if (!layer) throw new Error(`USDZ arc to missing layer ${item.assetPath}`);
    const source = item.primPath || `/${layer.specsByPath['/']?.fields?.defaultPrim}`;
    const dir = layerName.includes('/') ? layerName.slice(0, layerName.lastIndexOf('/') + 1) : '';
    for (const [path, spec] of Object.entries(layer.specsByPath)) {
      if (path !== source && !path.startsWith(`${source}/`) && !path.startsWith(`${source}.`)) continue;
      if (path.includes('{')) throw new Error(`nested variants in ${layerName} are not supported`);
      merge(merged, target + path.slice(source.length), spec, dir);
    }
  }
  for (const [target, spec] of [...bodies, ...locals]) merge(merged, target, spec, '');
  merged['/'] = { specType: root['/'].specType, fields: { ...root['/'].fields } };
  for (const spec of Object.values(merged)) for (const field of ARC_FIELDS) delete spec.fields[field];

  const composer = new USDComposer();
  const group = composer.compose({ specsByPath: merged }, assets, {}, '');
  await Promise.all(composer.texturePromises);
  return { group, selection };
}

// "/A/{Set=v}/B.attr" → "/A/B.attr" when Set=v is selected, null when another value of Set is.
function stripVariants(path, selection) {
  if (!path.includes('{')) return path;
  const out = [];
  for (const segment of path.split('/')) {
    const variant = segment.match(VARIANT_SEGMENT);
    if (!variant) { out.push(segment); continue; }
    if (!variant[2] || selection[variant[1]] !== variant[2]) return null;
  }
  return out.join('/') || '/';
}

function resolveAsset(fromLayer, assetPath) {
  const dir = fromLayer.includes('/') ? fromLayer.slice(0, fromLayer.lastIndexOf('/') + 1) : '';
  return (dir + assetPath).replace(/(^|\/)\.\//g, '$1');
}

// Stronger opinions overwrite field by field. An `over` never demotes a `def`. Asset paths become zip-relative.
function merge(merged, path, spec, assetDir) {
  const fields = { ...spec.fields };
  if (assetDir && fields.typeName === 'asset' && typeof fields.default === 'string' && fields.default) {
    fields.default = (assetDir + fields.default).replace(/(^|\/)\.\//g, '$1');
  }
  const existing = merged[path];
  if (!existing) {
    merged[path] = { specType: spec.specType, fields };
    return;
  }
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    if (key === 'specifier' && existing.fields.specifier === 0) continue;
    existing.fields[key] = value;
  }
}
