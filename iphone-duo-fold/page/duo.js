// iPhone Duo fold scene. The fold deformation, projected screen UI, progressive blur and darkening are ported
// from jadon7/iphone-duo (MIT, see THIRD_PARTY_NOTICES.md). Added here: loading the USDZ directly with the
// Landscape pose, a keyframed timeline (fold, camera orbit, zoom), framing that follows the phone, captions,
// image / video-frame / built-in screens, and a frame-stepped `window.duo.seek(t)` for rendering.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadDuo } from './duo-model.js';
import { INNER, OUTER, makeCanvas, drawFit, defaultScreens } from './screens.js';

// ---------- config ----------
// Served by render.ts as /config.json. Everything has a default so the page also works on its own.
const cfg = await fetch('/config.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}));
const renderMode = new URLSearchParams(location.search).has('render') || cfg.render === true;

// Keyframes are [seconds, value] and ease with a cosine in-out between neighbours (the upstream fold curve).
// `open` is the hinge angle in degrees: 0 = closed, 180 = flat. `yaw`/`pitch` orbit the camera in degrees.
// `zoom` multiplies the auto framing. Preset times are scaled to the requested duration.
const PRESETS = {
  unfold: { duration: 6, open: [[0, 0], [0.9, 0], [3.9, 180]], yaw: [[0, -16], [0.9, -16], [3.9, 0], [6, 5]],
    pitch: [[0, 7], [3.9, 0], [6, -1.5]], zoom: [[0, 1], [6, 1.05]] },
  fold: { duration: 6, open: [[0, 180], [1.2, 180], [4.2, 0]], yaw: [[0, 0], [1.2, 0], [4.2, -16], [6, -20]],
    pitch: [[0, 0], [4.2, 7]], zoom: [[0, 1.04], [6, 1]] },
  loop: { duration: 8.6, open: [[0, 180], [1.2, 180], [4.3, 0], [5.5, 0], [8.6, 180]], yaw: [[0, 0]],
    pitch: [[0, 0]], zoom: [[0, 1]] },
  reveal: { duration: 8, open: [[0, 0], [3.4, 0], [6.4, 180]], yaw: [[0, 200], [3.4, -14], [6.4, 0], [8, 5]],
    pitch: [[0, 12], [3.4, 6], [6.4, 0]], zoom: [[0, 0.92], [3.4, 1], [8, 1.05]] },
};
const preset = PRESETS[cfg.preset] ?? PRESETS.unfold;
const duration = Number(cfg.duration) || preset.duration;
const scaleKeys = keys => keys.map(([t, v]) => [t * duration / preset.duration, v]);
const keys = {};
for (const name of ['open', 'yaw', 'pitch', 'zoom']) keys[name] = cfg.keys?.[name] ?? scaleKeys(preset[name]);

function track(list, t) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    const [t1, v1] = list[i];
    if (t <= t1) {
      const [t0, v0] = list[i - 1];
      const u = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
      return v0 + (v1 - v0) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    }
  }
  return list[list.length - 1][1];
}

// ---------- page ----------
document.body.style.setProperty('--bg', cfg.background === 'transparent' ? 'transparent' : (cfg.background ?? '#f2f1ed'));
const viewport = document.querySelector('#viewport');
const caption = document.querySelector('#caption');
const titleEl = document.querySelector('#title');
const subtitleEl = document.querySelector('#subtitle');
titleEl.textContent = cfg.title ?? '';
subtitleEl.textContent = cfg.subtitle ?? '';
const hasCaption = Boolean(cfg.title || cfg.subtitle);
const captionAt = cfg.caption_at === 'bottom' ? 'bottom' : 'top';
const captionIn = Number(cfg.caption_in ?? 0.3);
if (hasCaption) {
  caption.hidden = false;
  if (cfg.ink) document.body.style.setProperty('--ink', cfg.ink);
}

// ---------- three ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: renderMode });
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
viewport.appendChild(renderer.domElement);
const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(environment, 0.04).texture;
environment.dispose();
pmrem.dispose();
scene.environmentIntensity = 1.35;
scene.add(new THREE.HemisphereLight(0xffffff, 0xb5baa8, 1.8));
const key = new THREE.DirectionalLight(0xfffcf5, 2.6);
key.position.set(-15, 25, 30);
scene.add(key);
const rim = new THREE.DirectionalLight(0xe8edf5, 2);
rim.position.set(15, 5, -15);
scene.add(rim);

const HINGE_Z = 0.275454;
const phone = new THREE.Group();
scene.add(phone);
const bend = { value: 0 };
const uiReferenceEye = new THREE.Vector3(0, 0, 40);
const innerUIFrame = new THREE.Vector4(-7.89935, 0.34562 - 5.8974, 15.7987, 11.1035);
const outerUIFrame = new THREE.Vector4(0.23396, 0.27173 - 5.8974, 7.73936, 11.2513)
  .multiplyScalar((uiReferenceEye.z - 0.24948) / (uiReferenceEye.z - 0.825538));
const blurPx = Number(cfg.blur ?? 72); // upstream: 72 source pixels on a 1125 px tall screen

// ---------- screens ----------
// inner + outer given → each screen shows its own picture ("pair").
// only inner given     → one picture across the inner screen; the cover shows its right half ("single", upstream Custom),
//                        or the part that starts at `cover_x` (0 = left edge, 0.5 = right half).
// nothing given        → the built-in wallpaper and clock.
const sources = { inner: cfg.screens?.inner ?? null, outer: cfg.screens?.outer ?? null };
const single = Boolean(sources.inner) && !sources.outer;
const COVER_X = { left: 0, center: 0.25, right: 0.5 };
const coverStart = COVER_X[cfg.cover_x] ?? Number(cfg.cover_x ?? 0.5);
const coverX = Number.isFinite(coverStart) ? THREE.MathUtils.clamp(coverStart, 0, 0.5) : 0.5;
const canvases = { inner: makeCanvas(INNER), outer: makeCanvas(OUTER) };
if (!sources.inner && !sources.outer) {
  const built = defaultScreens(cfg.clock ?? {});
  canvases.inner.getContext('2d').drawImage(built.inner, 0, 0);
  canvases.outer.getContext('2d').drawImage(built.outer, 0, 0);
}
const screens = {};
for (const kind of ['inner', 'outer']) {
  const canvas = single ? canvases.inner : canvases[kind];
  const texture = kind === 'outer' && single ? screens.inner.texture : new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const pairOuter = kind === 'outer' && !single;
  screens[kind] = {
    canvas, texture,
    material: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    frame: { value: (pairOuter ? outerUIFrame : innerUIFrame).clone() },
    gradient: { value: kind === 'inner' ? new THREE.Vector2(0.5, 0) : single ? new THREE.Vector2(coverX, coverX + 0.5) : new THREE.Vector2(0, 1) },
    pixel: { value: new THREE.Vector2(1 / canvas.width, 1 / canvas.height) },
    blur: { value: blurPx * canvas.height / 1125 },
  };
}

const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`cannot load ${src}`));
  image.src = src;
});
// A source is { type: 'image', url } or { type: 'frames', url: '/frames/inner/%06d.jpg', count, fps }.
const shown = { inner: null, outer: null };
async function showSource(kind, t) {
  const source = sources[kind];
  if (!source) return;
  let url = source.url;
  if (source.type === 'frames') {
    const index = Math.min(source.count - 1, Math.max(0, Math.floor(t * source.fps + 1e-6)));
    url = source.url.replace('%06d', String(index + 1).padStart(6, '0'));
  }
  if (shown[kind] === url) return;
  shown[kind] = url;
  const image = await loadImage(url);
  drawFit(canvases[kind], image, cfg.fit ?? 'cover');
  screens[kind].texture.needsUpdate = true;
}

const screenShader = `
uniform float foldAngle;
uniform vec2 uiPixel;
uniform vec4 uiFrame;
uniform vec2 uiGradient;
uniform vec3 uiReferenceEye;
uniform float uiBlur;
varying vec3 vUIPosition;
vec3 screenColor() {
  // Intersect the fixed front-view ray with the unfolded inner-screen plane.
  float depth = (0.24948 - uiReferenceEye.z) / (vUIPosition.z - uiReferenceEye.z);
  vec2 projected = uiReferenceEye.xy + (vUIPosition.xy - uiReferenceEye.xy) * depth;
  vec2 sourceUV = (projected - uiFrame.xy) / uiFrame.zw;
  #ifdef INNER_UI
    float progress = clamp(foldAngle / 1.570796327, 0.0, 1.0);
  #else
    // Anchor the image to the projected hinge-side edge of the outer screen.
    float c = cos(foldAngle), s = sin(foldAngle);
    vec2 hingeEdge = vec2(-0.23396, -0.27463 - 0.275454);
    vec2 foldedEdge = vec2(c * hingeEdge.x + s * hingeEdge.y,
      -s * hingeEdge.x + c * hingeEdge.y + 0.275454);
    float edgeDepth = (0.24948 - uiReferenceEye.z) / (foldedEdge.y - uiReferenceEye.z);
    float anchorX = uiReferenceEye.x + (foldedEdge.x - uiReferenceEye.x) * edgeDepth;
    sourceUV.x = uiGradient.x + (projected.x - anchorX) / uiFrame.z;
    float progress = clamp((3.141592654 - foldAngle) / 1.570796327, 0.0, 1.0);
  #endif
  float edge = (sourceUV.x - uiGradient.x) / (uiGradient.y - uiGradient.x);
  float motion = smoothstep(0.0, 1.0, progress);
  float blurGradient = clamp(edge, 0.0, 1.0);
  float darkenGradient = clamp((edge - 0.2) / 0.8, 0.0, 1.0);
  float effect = motion * pow(darkenGradient, 1.35);
  float radius = uiBlur * motion * pow(blurGradient, 1.35);
  vec2 aa = max(fwidth(sourceUV), uiPixel * 0.5);
  vec2 dx = dFdx(sourceUV) / uiPixel;
  vec2 dy = dFdy(sourceUV) / uiPixel;
  float baseLod = log2(max(1.0, max(length(dx), length(dy))));
  vec2 coverage = smoothstep(-aa, aa, sourceUV)
    * (1.0 - smoothstep(vec2(1.0) - aa, vec2(1.0) + aa, sourceUV));
  vec3 color = textureLod(map, clamp(sourceUV, vec2(0.0), vec2(1.0)), baseLod).rgb * coverage.x * coverage.y;
  if (radius > 0.0) {
    // Use the same mip level at zero blur, then increase it continuously.
    float lod = max(baseLod, log2(max(1.0, radius)));
    vec2 footprint = max(aa, uiPixel * radius * 0.75);
    color = vec3(0.0);
    for (int y = -2; y <= 2; y++) {
      for (int x = -2; x <= 2; x++) {
        float wx = x == 0 ? 6.0 : (abs(x) == 1 ? 4.0 : 1.0);
        float wy = y == 0 ? 6.0 : (abs(y) == 1 ? 4.0 : 1.0);
        vec2 sampleUV = sourceUV + vec2(float(x), float(y)) * uiPixel * radius;
        // Blur the image and its coverage together so color spreads into the black margin.
        vec2 coverage = smoothstep(-footprint, footprint, sampleUV)
          * (1.0 - smoothstep(vec2(1.0) - footprint, vec2(1.0) + footprint, sampleUV));
        color += textureLod(map, clamp(sampleUV, vec2(0.0), vec2(1.0)), lod).rgb
          * coverage.x * coverage.y * wx * wy / 256.0;
      }
    }
  }
  return color * (1.0 - min(1.0, effect * 2.0));
}
`;

// The camera half stays in its original transform. Only the cover half rotates.
const foldShader = `
uniform float foldAngle;
vec2 rotateHinge(vec2 p) {
  float c = cos(foldAngle), s = sin(foldAngle);
  p.y -= 0.275454;
  return vec2(c * p.x + s * p.y, -s * p.x + c * p.y + 0.275454);
}
#ifdef FLEXIBLE_SCREEN
vec4 bendStrip(vec3 p) {
  float halfWidth = 0.35;
  if (p.x >= halfWidth) return vec4(p.x, p.z, 1.0, 0.0);
  if (p.x <= -halfWidth) return vec4(rotateHinge(p.xz), cos(foldAngle), -sin(foldAngle));
  float t = (p.x + halfWidth) / (2.0 * halfWidth);
  float t2 = t*t, t3 = t2*t;
  vec2 a = rotateHinge(vec2(-halfWidth, p.z));
  vec2 b = vec2(halfWidth, p.z);
  vec2 ta = 2.0 * halfWidth * vec2(cos(foldAngle), -sin(foldAngle));
  vec2 tb = vec2(2.0 * halfWidth, 0.0);
  vec2 point = (2.0*t3-3.0*t2+1.0)*a + (t3-2.0*t2+t)*ta + (-2.0*t3+3.0*t2)*b + (t3-t2)*tb;
  vec2 tangent = normalize((6.0*t2-6.0*t)*a + (3.0*t2-4.0*t+1.0)*ta + (-6.0*t2+6.0*t)*b + (3.0*t2-2.0*t)*tb);
  return vec4(point, tangent);
}
#endif
`;

// ---------- model ----------
// Apple's AR Quick Look USDZ, fetched by render.ts into assets/ (never committed), flattened in duo-model.js.
const MOVING = 'upTUAKvMVkPOMKq', FIXED = 'SiftyleUEEZwLhF';
const FLEXIBLE = ['JnJdTkxbQgUtLwU', 'xdyyaajWsatVNxN', 'UXtsBZYlaUvHoEh', 'MvKPXGSdYDVvSpk'];
const SCREEN = { UXtsBZYlaUvHoEh: 'inner', hhgAIoCGsHXeDPY: 'outer' };
const FINISH = { 'star-white': 'Star_White', 'night-sky': 'Night_Sky' };
const { group: model } = await loadDuo(cfg.model ?? '/assets/iphone-duo.usdz', { pose: 'Landscape', color: FINISH[cfg.finish] ?? 'Star_White' });
model.scale.multiplyScalar(100);
model.updateMatrixWorld(true);
const count = { moving: 0, fixed: 0, flexible: 0, screens: 0 };
const bounds = new THREE.Box3();
model.traverse(object => {
  if (!object.isMesh) return;
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  geometry.translate(0, -5.8974, 0);
  let ancestor = object;
  while (ancestor && ![MOVING, FIXED].includes(ancestor.name)) ancestor = ancestor.parent;
  const moving = ancestor?.name === MOVING;
  const flexible = FLEXIBLE.includes(object.name);
  const kind = SCREEN[object.name] ?? null;
  const material = kind ? screens[kind].material : object.material.clone();
  if (kind) {
    const p = geometry.attributes.position;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = kind === 'inner' ? (p.getX(i) + 7.89935) / 15.7987 : (-0.23396 - p.getX(i)) / 7.73936;
      uv[i * 2 + 1] = kind === 'inner' ? (p.getY(i) + 5.8974 - 0.34562) / 11.1035 : (p.getY(i) + 5.8974 - 0.27173) / 11.2513;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    count.screens++;
  }
  if (moving || flexible) {
    material.onBeforeCompile = shader => {
      shader.uniforms.foldAngle = bend;
      if (kind) {
        shader.uniforms.uiFrame = screens[kind].frame;
        shader.uniforms.uiGradient = screens[kind].gradient;
        shader.uniforms.uiReferenceEye = { value: uiReferenceEye };
        shader.uniforms.uiPixel = screens[kind].pixel;
        shader.uniforms.uiBlur = screens[kind].blur;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_pars_fragment>', `
          #include <map_pars_fragment>
          ${kind === 'inner' ? '#define INNER_UI' : ''}
          ${screenShader}
        `).replace('#include <map_fragment>', 'diffuseColor.rgb *= screenColor();');
        shader.vertexShader = `varying vec3 vUIPosition;\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
          vUIPosition = transformed;
          #include <project_vertex>
        `);
      }
      shader.vertexShader = `${flexible ? '#define FLEXIBLE_SCREEN\n' : ''}${foldShader}\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', flexible ? `
        vec4 folded = bendStrip(position);
        vec3 transformed = vec3(folded.x, position.y, folded.y);
      ` : `
        vec2 folded = rotateHinge(position.xz);
        vec3 transformed = vec3(folded.x, position.y, folded.y);
      `);
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
        vec3 objectNormal = vec3(normal);
        ${flexible ? 'vec4 strip = bendStrip(position); float a = atan(-strip.w, strip.z);' : 'float a = foldAngle;'}
        objectNormal.x = cos(a) * normal.x + sin(a) * normal.z;
        objectNormal.z = -sin(a) * normal.x + cos(a) * normal.z;
      `);
    };
    material.customProgramCacheKey = () => `${flexible ? 'fold-flexible' : 'fold-cover'}-${kind || 'body'}`;
  }
  geometry.computeBoundingBox();
  bounds.union(geometry.boundingBox);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = object.name;
  mesh.frustumCulled = false;
  phone.add(mesh);
  count[flexible ? 'flexible' : moving ? 'moving' : 'fixed']++;
});
if (count.screens !== 2 || count.moving === 0) throw new Error(`unexpected model layout ${JSON.stringify(count)}`);
const halfW = Math.max(-bounds.min.x, bounds.max.x);
const halfH = Math.max(-bounds.min.y, bounds.max.y);

// ---------- framing ----------
// The phone's front-view footprint: 2·halfW wide when open, halfW when closed. `follow` keeps it centred as it
// folds (upstream keeps the camera half fixed, so a closed phone sits right of centre).
const follow = Number(cfg.follow ?? 1);
const fill = Number(cfg.fill ?? 0.78);
let size = { width: 1, height: 1 };
function layout() {
  const { width, height } = viewport.getBoundingClientRect();
  size = { width: Math.max(1, width), height: Math.max(1, height) };
  renderer.setPixelRatio(Number(cfg.pixel_ratio) || Math.min(devicePixelRatio, 2));
  renderer.setSize(size.width, size.height, false);
  camera.aspect = size.width / size.height;
  const base = Math.min(size.width, size.height);
  document.body.style.setProperty('--title-size', `${Math.round(base * (cfg.title_size ?? 0.064))}px`);
  document.body.style.setProperty('--sub-size', `${Math.round(base * (cfg.subtitle_size ?? 0.03))}px`);
}
layout();
if (!renderMode) new ResizeObserver(layout).observe(viewport);

function place(t) {
  const open = THREE.MathUtils.clamp(track(keys.open, t), 0, 180);
  const yaw = THREE.MathUtils.degToRad(track(keys.yaw, t));
  const pitch = THREE.MathUtils.degToRad(track(keys.pitch, t));
  const zoom = track(keys.zoom, t);
  bend.value = (180 - open) / 180 * Math.PI;
  screens.outer.material.color.setScalar(open >= 180 ? 0 : 1);
  const c = Math.cos(bend.value);
  phone.position.set(-follow * halfW * (1 - c) / 4, 0, -HINGE_Z);

  // With a caption, the caption and the open phone form one block centred in the frame, so the title sits right
  // above (or below) the phone at any aspect. The block is laid out for the open phone, then every pose is fitted
  // into the room the caption leaves.
  const { width, height } = size;
  const openFit = fill / (2 * halfW);
  let centerY = height / 2, maxPhoneH = height * fill;
  if (hasCaption) {
    const margin = 0.09 * height, gap = 0.05 * height, capH = caption.offsetHeight;
    const phoneH = Math.min(width * openFit * 2 * halfH, height - 2 * margin - capH - gap);
    const top = (height - capH - gap - phoneH) / 2;
    caption.style.top = `${captionAt === 'top' ? top : top + phoneH + gap}px`;
    centerY = captionAt === 'top' ? top + capH + gap + phoneH / 2 : top + phoneH / 2;
    // A folded phone may grow (in portrait it is narrower than the open one) but keeps half the gap to the caption.
    const room = phoneH / 2 + gap / 2;
    maxPhoneH = 2 * (captionAt === 'top' ? Math.min(room, height - margin - centerY) : Math.min(centerY - margin, room));
  }
  const footW = 2 * halfW * (1 - follow) + halfW * (1.5 + 0.5 * c) * follow;
  const pixelsPerUnit = Math.min(width * fill / footW, maxPhoneH / (2 * halfH)) * zoom;
  const visibleH = height / pixelsPerUnit;
  const distance = visibleH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.position.set(
    distance * Math.sin(yaw) * Math.cos(pitch),
    distance * Math.sin(pitch),
    distance * Math.cos(yaw) * Math.cos(pitch),
  );
  camera.lookAt(0, 0, 0);
  const shift = height / 2 - centerY;
  if (shift) camera.setViewOffset(width, height, 0, shift, width, height);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();

  if (hasCaption) {
    const u = THREE.MathUtils.clamp((t - captionIn) / 0.6, 0, 1);
    const e = 1 - Math.pow(1 - u, 3);
    caption.style.opacity = String(e);
    caption.style.transform = `translateY(${(1 - e) * 0.02 * height}px)`;
  }
  return { open, yaw, pitch, zoom };
}

async function seek(t) {
  await Promise.all([showSource('inner', t), showSource('outer', t)]);
  const state = place(t);
  renderer.render(scene, camera);
  return state;
}

window.duo = {
  duration,
  keys,
  seek,
  info: () => ({ duration, keys, count, halfW, halfH, single, sources }),
};
console.info('duo ready', JSON.stringify({ count, halfW: halfW.toFixed(3), halfH: halfH.toFixed(3), duration }));
document.documentElement.dataset.ready = '1';

// ---------- live preview (not used when rendering) ----------
if (!renderMode) {
  const scrub = document.querySelector('#scrub');
  const slider = document.querySelector('#time');
  const clock = document.querySelector('#clock');
  const playButton = document.querySelector('#play');
  scrub.hidden = false;
  slider.max = String(duration);
  let playing = true, time = 0, last = performance.now(), busy = false;
  playButton.addEventListener('click', () => { playing = !playing; playButton.textContent = playing ? '❚❚' : '▶'; });
  slider.addEventListener('input', () => { playing = false; playButton.textContent = '▶'; time = Number(slider.value); });
  addEventListener('keydown', e => { if (e.code === 'Space') playButton.click(); });
  renderer.setAnimationLoop(async now => {
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (playing) time = (time + delta) % duration;
    slider.value = String(time);
    clock.textContent = `${time.toFixed(2)} s`;
    if (busy) return;
    busy = true;
    await seek(time);
    busy = false;
  });
}
