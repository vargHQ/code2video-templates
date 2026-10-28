// Two looks for the same sets:
//   grey    the grey-box with ink lines. This is what goes to Seedance as @video1 (it copies colour, so no colour here).
//   styled  materials and textures from the anchor sheets, for the director: what the film will look like.
// A mesh opts in with styled(mesh, material); everything else keeps its grey material in both looks.
// Textures are procedural (canvas), so the previz stays a folder of static files.
import * as THREE from 'three';

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function canvasTex(w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function speckle(x, w, h, n, cols, rMax = 2) {
  for (let i = 0; i < n; i++) {
    x.fillStyle = cols[Math.floor(rnd() * cols.length)];
    x.globalAlpha = 0.15 + rnd() * 0.35;
    x.beginPath(); x.arc(rnd() * w, rnd() * h, 0.4 + rnd() * rMax, 0, 7); x.fill();
  }
  x.globalAlpha = 1;
}

const T = {};
export const TEX = {
  concrete: (rep = [5, 4]) => canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#4a4946'; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 9000, ['#5c5b57', '#3a3936', '#6a6862', '#2e2d2b'], 1.6);
    for (let i = 0; i < 14; i++) { // damp stains
      const g = x.createRadialGradient(rnd() * w, rnd() * h, 0, rnd() * w, rnd() * h, 40 + rnd() * 120);
      g.addColorStop(0, 'rgba(20,20,18,0.35)'); g.addColorStop(1, 'rgba(20,20,18,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }
  }, { repeat: rep }),
  leather: () => canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#4e1610'; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 6000, ['#6b2418', '#3a0f0a', '#80301f'], 2.4);
    x.strokeStyle = 'rgba(20,4,2,0.55)'; x.lineWidth = 0.8;
    for (let i = 0; i < 220; i++) { // crackle
      let px = rnd() * w, py = rnd() * h; x.beginPath(); x.moveTo(px, py);
      for (let k = 0; k < 5; k++) { px += (rnd() - 0.5) * 30; py += (rnd() - 0.5) * 30; x.lineTo(px, py); }
      x.stroke();
    }
    const g = x.createLinearGradient(0, 0, w, h); // worn highlight
    g.addColorStop(0, 'rgba(255,170,120,0.12)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,170,120,0.08)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, { repeat: [2, 2] }),
  knit: (base = '#2b2b2e') => canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let cx = 0; cx < w; cx += 8) for (let cy = 0; cy < h; cy += 6) { // V stitches
      x.strokeStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.25)';
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + 4, cy + 6); x.lineTo(cx + 8, cy); x.stroke();
    }
  }, { repeat: [3, 3] }),
  wool: (base = '#262524') => canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 5000, ['#3a3836', '#1a1918', '#4a3a2a'], 1.2);
  }, { repeat: [3, 3] }),
  brick: () => canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#1a1210'; x.fillRect(0, 0, w, h);
    const bw = 64, bh = 24;
    for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
      const ox = (r % 2) * bw / 2, v = 40 + rnd() * 30;
      x.fillStyle = `rgb(${v + 30},${v * 0.55},${v * 0.45})`;
      x.fillRect(c * bw + ox + 2, r * bh + 2, bw - 4, bh - 4);
    }
    speckle(x, w, h, 4000, ['#000', '#2a1a14'], 1.5);
  }, { repeat: [4, 3] }),
  crt: () => canvasTex(256, 192, (x, w, h) => { // amber phosphor: abstract bars, no letters
    x.fillStyle = '#1a0800'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ff8a2a';
    for (let y = 14; y < h - 10; y += 9) {
      let px = 14;
      while (px < w - 20 && rnd() > 0.08) { const l = 4 + rnd() * 26; if (px + l > w - 14) break; x.globalAlpha = 0.55 + rnd() * 0.45; x.fillRect(px, y, l, 4); px += l + 5; }
    }
    x.globalAlpha = 1;
    for (let y = 0; y < h; y += 3) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, y, w, 1); }
    const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, 'rgba(255,120,40,0.15)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }),
  city: () => canvasTex(1024, 384, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05070d'); g.addColorStop(0.6, '#0d1626'); g.addColorStop(1, '#1a2233');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { // towers
      const bw = 20 + rnd() * 60, bh = 60 + rnd() * 260, bx = rnd() * w;
      x.fillStyle = `rgba(${8 + rnd() * 10},${12 + rnd() * 10},${22 + rnd() * 12},1)`; x.fillRect(bx, h - bh, bw, bh);
      for (let k = 0; k < bw * bh / 120; k++) {
        if (rnd() > 0.35) continue;
        x.fillStyle = rnd() > 0.7 ? 'rgba(255,190,120,0.8)' : 'rgba(170,200,255,0.5)';
        x.fillRect(bx + 3 + Math.floor(rnd() * (bw - 6) / 5) * 5, h - bh + 4 + Math.floor(rnd() * (bh - 8) / 7) * 7, 2, 3);
      }
    }
  }),
  rainGlass: () => canvasTex(256, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = 'rgba(150,170,200,0.06)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { // streaks
      const px = rnd() * w, py = rnd() * h, l = 20 + rnd() * 90;
      x.strokeStyle = `rgba(200,220,255,${0.08 + rnd() * 0.22})`; x.lineWidth = 0.6 + rnd() * 1.4;
      x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px + (rnd() - 0.5) * 6, py + l / 3, px + (rnd() - 0.5) * 6, py + l * 0.66, px, py + l); x.stroke();
    }
    for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(220,235,255,${0.1 + rnd() * 0.3})`; x.beginPath(); x.arc(rnd() * w, rnd() * h, 0.5 + rnd() * 1.6, 0, 7); x.fill(); }
  }, { repeat: [1, 1] }),
  asphalt: () => canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#0c0c0e'; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 12000, ['#1c1c20', '#050506', '#26262a'], 1.2);
  }, { repeat: [3, 12] }),
};

export const M = {
  porcelain: () => new THREE.MeshPhysicalMaterial({ color: 0xf1e9dc, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35, sheen: 0.2 }),
  glassEye: () => new THREE.MeshPhysicalMaterial({ color: 0x0c0a0a, roughness: 0.05, clearcoat: 1, emissive: 0x220600, emissiveIntensity: 1 }),
  amberGlow: (i = 3) => new THREE.MeshStandardMaterial({ color: 0xff5315, emissive: 0xff5315, emissiveIntensity: i }),
  std: (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o }),
};

// Remember both materials on the mesh.
export function styled(mesh, material) {
  mesh.userData.greyMat = mesh.material;
  mesh.userData.styledMat = material;
  return mesh;
}
// A person from props.js: map its grey materials (userData.mats) to styled ones by role.
export function stylePerson(p, roles) {
  const byMat = new Map();
  for (const [role, m] of Object.entries(p.userData.mats)) if (roles[role]) byMat.set(m, roles[role]);
  p.traverse(o => { if (o.isMesh && byMat.has(o.material)) styled(o, byMat.get(o.material)); });
  return p;
}

let current = 'grey';
export const lookNow = () => current;
// Switch every set. Each set may define look(name) for background, fog and lights.
export function setLook(sets, name, renderer) {
  current = name;
  const st = name === 'styled';
  for (const S of Object.values(sets)) {
    S.scene.traverse(o => {
      if (o.isMesh && o.userData.styledMat) o.material = st ? o.userData.styledMat : o.userData.greyMat;
      if (o.userData.isInk) o.visible = !st;
      if (o.userData.lookOnly) o.visible = o.userData.lookOnly === name;
    });
    S.look?.(name);
  }
  if (renderer) {
    renderer.toneMapping = st ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    renderer.toneMappingExposure = st ? 1.15 : 1;
  }
}

// Rain: line segments in a box, positions driven by time only (scrub-exact).
export function makeRain({ n = 1200, box = [10, 8, 6], center = [0, 4, 0], speed = 9, len = 0.35, color = 0xbcd0ff, opacity = 0.5 } = {}) {
  const pos = new Float32Array(n * 6), base = [];
  for (let i = 0; i < n; i++) base.push([(rnd() - 0.5) * box[0], rnd() * box[1], (rnd() - 0.5) * box[2], 0.7 + rnd() * 0.6]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  l.position.set(...center); l.position.y -= box[1] / 2;
  l.userData = { base, box, speed, len, noInk: true };
  l.frustumCulled = false;
  l.tick = T => {
    const a = g.attributes.position.array;
    base.forEach(([x, y, z, s], i) => {
      const yy = ((y - T * speed * s) % box[1] + box[1]) % box[1];
      a.set([x, yy, z, x + 0.02, yy + len * s, z], i * 6);
    });
    g.attributes.position.needsUpdate = true;
  };
  l.tick(0);
  return l;
}
