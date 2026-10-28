// Master sets for "I know how": ONE set per location.
//   loft       A · the loft: armchair + agent in the middle, console with three CRTs in front of the windows at
//              screen-left (+X), the operator at the console with her back to the room.
//   construct  B · the white void; the street of the music video rises out of it (same layout as `street`).
//   street     C · the music video: a narrow wet street, neon, the singer walking toward -Z.
//   screen     X · inserts made in the edit (terminal, loading montage, catalog, end card): a stand-in screen.
// Units metres; forward = -Z, up = +Y, a character's right hand = +X. Camera "front" of the agent = the -Z side.
import * as THREE from 'three';
import { C, mat, glow, basic, box, mesh, ink, makePerson, pose, blob, labelPlane } from './props.js';
import { TEX, M, styled, stylePerson, makeRain } from './look.js';

function scene(bg) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(bg);
  return s;
}
const lights = (o, list) => list.forEach(([l, grey, sty]) => { l.userData.lv = { grey, styled: sty }; o.push(l); });
function lookLights(arr, name) { for (const l of arr) l.intensity = l.userData.lv[name] ?? l.intensity; }

// ---------------------------------------------------------------- shared characters
// The agent: porcelain head and hands, charcoal knit sweater, black trousers, a cable socket with an amber ring.
function makeAgent() {
  const p = makePerson({ top: C.dark, bottom: C.black, skin: C.light, hair: C.light, name: 'agent' });
  const head = p.getObjectByName('head');
  head.children.filter(m => m.isMesh && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.radius > 0.115).forEach(m => (m.visible = false)); // bald
  const ring = mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 20), mat(C.grey), [0, -0.1, 0.08], [0.4, 0, 0], 'socket');
  styled(ring, M.amberGlow(4)); head.add(ring);
  // eyelids: closed = covering the eyes; open() lifts them
  const lids = new THREE.Group(); lids.name = 'lids'; head.add(lids);
  for (const s of [-1, 1]) {
    const lid = mesh(new THREE.SphereGeometry(0.02, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.light), [0.038 * s, 0.015, -0.1], [-Math.PI / 2, 0, 0]);
    lid.userData.noInk = true; styled(lid, M.porcelain()); lids.add(lid);
  }
  p.userData.eyes = k => { lids.children.forEach(l => { l.scale.set(1, 1, 1 - 0.85 * k); l.position.y = 0.015 + 0.012 * k; }); };
  const porcelain = M.porcelain();
  stylePerson(p, { top: M.std(0x2b2b2e, { map: TEX.knit() }), bottom: M.std(0x111113, { roughness: 0.6 }), hand: porcelain, skin: porcelain });
  p.getObjectByName('eyes').children.forEach(e => styled(e, M.glassEye()));
  p.getObjectByName('mouth').visible = false; // closed sculpted lips: it never talks on screen
  return p;
}
// The operator: cropped silver hair, wire-rim glasses, one-ear headset, black roll-neck, dark wool coat.
function makeOperator() {
  const p = makePerson({ top: C.grey, bottom: C.dark, hair: C.light, headset: true, name: 'operator' });
  const head = p.getObjectByName('head');
  for (const s of [-1, 1]) {
    const g = mesh(new THREE.TorusGeometry(0.02, 0.003, 4, 16), mat(C.dark), [0.038 * s, 0.015, -0.112], null, 'glasses');
    g.userData.noInk = true; styled(g, M.std(0xc9a14a, { metalness: 0.9, roughness: 0.3 })); head.add(g);
  }
  stylePerson(p, {
    top: M.std(0x262524, { map: TEX.wool() }), bottom: M.std(0x141414), hand: M.std(0xd9b49a, { roughness: 0.6 }),
    skin: M.std(0xd9b49a, { roughness: 0.6 }), hair: M.std(0xb9b9bb, { roughness: 0.8 }),
  });
  return p;
}
// The singer (music video): wet black bob, glossy cherry-red vinyl trench coat.
function makeSinger() {
  const p = makePerson({ top: C.grey, bottom: C.dark, hair: C.black, long: true, name: 'singer' });
  const coat = mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.75, 16, 1, true), mat(C.grey, { side: THREE.DoubleSide }), [0, -0.33, 0], null, 'coatSkirt');
  p.add(coat);
  const vinyl = new THREE.MeshPhysicalMaterial({ color: 0x8a0a12, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  styled(coat, vinyl);
  stylePerson(p, { top: vinyl, bottom: M.std(0x0b0b0c), hand: M.std(0xe6c9b6), skin: M.std(0xe6c9b6, { roughness: 0.5 }), hair: M.std(0x070708, { roughness: 0.15, metalness: 0.2 }) });
  ink(coat);
  return p;
}

// ---------------------------------------------------------------- A · LOFT
function makeArmchair() {
  const g = new THREE.Group(); g.name = 'armchair';
  const m = mat(0x6a6460), leg = mat(C.dark);
  const parts = [
    box(0.9, 0.18, 0.8, m, [0, 0.36, 0], 'seat'), box(0.9, 0.95, 0.18, m, [0, 0.9, 0.38], 'back'),
    box(0.16, 0.3, 0.8, m, [-0.45, 0.58, 0]), box(0.16, 0.3, 0.8, m, [0.45, 0.58, 0]),
    box(0.14, 0.45, 0.3, m, [-0.46, 1.05, 0.28], 'wingL'), box(0.14, 0.45, 0.3, m, [0.46, 1.05, 0.28], 'wingR'),
  ];
  const leather = M.std(0x6a2018, { map: TEX.leather(), roughness: 0.5 });
  for (const p of parts) { styled(p, leather); g.add(p); }
  for (const [x, z] of [[-0.38, -0.32], [0.38, -0.32], [-0.38, 0.32], [0.38, 0.32]]) g.add(styled(box(0.06, 0.27, 0.06, leg, [x, 0.135, z]), M.std(0x2a1a10)));
  ink(g);
  return g;
}
function makeCRT(name) { // screen faces -Z
  const g = new THREE.Group(); g.name = name;
  g.add(styled(box(0.48, 0.4, 0.45, mat(0x7a7a78), [0, 0.2, 0.05]), M.std(0x2a2724, { roughness: 0.5 })));
  const scr = box(0.38, 0.29, 0.01, glow(0xdadada, 0.5), [0, 0.21, -0.18], 'screen');
  scr.userData.noInk = true; styled(scr, new THREE.MeshStandardMaterial({ map: TEX.crt(), emissive: 0xffffff, emissiveMap: TEX.crt(), emissiveIntensity: 1.6 }));
  g.add(scr);
  ink(g);
  return g;
}
function windowBay(x, w, z, y0, y1, glass) {
  const g = new THREE.Group();
  const pane = box(w, y1 - y0, 0.02, glass.grey, [x, (y0 + y1) / 2, z], 'pane');
  pane.userData.noInk = true; styled(pane, glass.styled); g.add(pane);
  const frame = mat(C.black), fs = M.std(0x0a0a0b, { metalness: 0.6, roughness: 0.5 });
  for (let i = 0; i <= 5; i++) g.add(styled(box(0.04, y1 - y0, 0.06, frame, [x - w / 2 + (w / 5) * i, (y0 + y1) / 2, z]), fs));
  for (let i = 0; i <= 6; i++) g.add(styled(box(w, 0.04, 0.06, frame, [x, y0 + ((y1 - y0) / 6) * i, z]), fs));
  return g;
}
function buildLoft() {
  const s = scene(0x111216);
  const o = {}, L = [];
  o.hemi = new THREE.HemisphereLight(0xc8d0e0, 0x202024, 1); o.key = new THREE.DirectionalLight(0xffffff, 1.6);
  o.key.position.set(-3, 6, -6);
  o.moon = new THREE.DirectionalLight(0x6f8cff, 0); o.moon.position.set(-2, 4, 12);
  o.lampLight = new THREE.SpotLight(0xffb36b, 0, 9, 0.75, 0.55, 1.4); o.lampLight.position.set(-0.6, 2.75, 1.4); o.lampLight.target.position.set(-0.6, 0, 1.4);
  o.crtLight = new THREE.PointLight(0xff6a1a, 0, 5, 1.6); o.crtLight.position.set(2.6, 1.1, 3.2);
  o.scan = new THREE.PointLight(0xff5315, 0, 1.2, 2); o.scan.position.set(-0.6, 1.4, 1.1);
  s.add(o.hemi, o.key, o.moon, o.lampLight, o.lampLight.target, o.crtLight, o.scan);
  lights(L, [[o.hemi, 1, 0.12], [o.key, 1.6, 0], [o.moon, 0, 0.9], [o.lampLight, 0, 26], [o.crtLight, 0, 7], [o.scan, 0, 0]]);

  const room = new THREE.Group(); room.name = 'loft'; s.add(room);
  const wallM = mat(0x5a5c62), floorM = mat(0x46474b);
  const concrete = M.std(0x8a8884, { map: TEX.concrete(), roughness: 0.85 });
  const concreteFloor = M.std(0x6a6864, { map: TEX.concrete([6, 5]), roughness: 0.55, metalness: 0.05 });
  room.add(styled(box(14, 0.05, 13, floorM, [0, -0.025, -0.5], 'floor'), concreteFloor));
  room.add(styled(box(14, 0.1, 13, wallM, [0, 4.65, -0.5], 'ceiling'), M.std(0x1a1a1a)));
  for (const [w, h, d, p] of [[0.1, 4.6, 13, [6.9, 2.3, -0.5]], [0.1, 4.6, 13, [-7, 2.3, -0.5]], [14, 4.6, 0.1, [0, 2.3, -7]]]) room.add(styled(box(w, h, d, wallM, p), concrete));
  // back wall (+Z) with four tall window bays between brick-free concrete piers
  const glass = { grey: mat(0x9aa4b4, { transparent: true, opacity: 0.35 }), styled: new THREE.MeshStandardMaterial({ map: TEX.rainGlass(), transparent: true, color: 0xaabbdd, roughness: 0.1, metalness: 0.1, emissive: 0x0a1020, emissiveIntensity: 0.4 }) };
  o.glassTex = glass.styled.map;
  const Z = 5;
  room.add(styled(box(14, 0.9, 0.3, wallM, [0, 0.45, Z]), concrete), styled(box(14, 0.45, 0.3, wallM, [0, 4.4, Z]), concrete));
  const bays = [-5, -1.7, 1.6, 4.9];
  bays.forEach(x => room.add(windowBay(x, 3, Z, 0.9, 4.18, glass)));
  for (const x of [-6.75, -3.35, -0.05, 3.25, 6.6]) room.add(styled(box(0.32, 3.3, 0.3, wallM, [x, 2.55, Z]), concrete));
  const city = mesh(new THREE.PlaneGeometry(70, 22), basic(0x2a2d36), [0, 6, 22], [0, Math.PI, 0], 'city');
  city.userData.noInk = true; styled(city, new THREE.MeshBasicMaterial({ map: TEX.city() })); s.add(city);
  o.rain = makeRain({ n: 1400, box: [16, 9, 5], center: [0, 4.5, 9], speed: 10, len: 0.4, opacity: 0.35 });
  o.rain.userData.lookOnly = 'styled'; s.add(o.rain);

  // armchair + agent, centre, facing the camera side (-Z)
  o.chair = makeArmchair(); o.chair.position.set(-0.6, 0, 1.6); s.add(o.chair);
  o.agent = makeAgent(); s.add(o.agent);
  // hanging work lamp over the chair
  const lampG = new THREE.Group(); lampG.name = 'lamp'; s.add(lampG);
  lampG.add(styled(box(0.01, 1.7, 0.01, mat(C.black), [-0.6, 3.8, 1.4]), M.std(0x050505)));
  const shade = mesh(new THREE.ConeGeometry(0.28, 0.22, 20, 1, true), mat(0x8a8a8a, { side: THREE.DoubleSide }), [-0.6, 2.88, 1.4]);
  styled(shade, M.std(0x9a9a96, { metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide })); lampG.add(shade);
  const bulb = mesh(new THREE.SphereGeometry(0.06, 10, 8), glow(0xeeeeee, 1), [-0.6, 2.78, 1.4]); bulb.userData.noInk = true;
  styled(bulb, new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffc070, emissiveIntensity: 6 })); lampG.add(bulb);
  const pool = blob(0xffb36b, 3.2, 0.0); pool.position.set(-0.6, 0.02, 1.4); pool.rotation.x = -Math.PI / 2; o.pool = pool; s.add(pool);

  // console in front of the windows at screen-left (+X): desk, three CRTs facing the operator (-Z), keyboard
  const desk = new THREE.Group(); desk.name = 'console'; s.add(desk);
  const metal = M.std(0x3a3b3d, { metalness: 0.5, roughness: 0.6 });
  desk.add(styled(box(2.2, 0.05, 0.8, mat(0x6a6a6a), [2.6, 0.75, 3.55]), metal));
  for (const x of [1.55, 3.65]) desk.add(styled(box(0.05, 0.75, 0.75, mat(0x6a6a6a), [x, 0.375, 3.55]), metal));
  o.crts = [makeCRT('crtL'), makeCRT('crtC'), makeCRT('crtR')];
  o.crts.forEach((c, i) => { c.position.set(1.9 + i * 0.7, 0.78, 3.7); c.rotation.y = (i - 1) * 0.18; desk.add(c); });
  o.keys = styled(box(0.46, 0.035, 0.16, mat(0x8a8a8a), [2.6, 0.795, 3.28], 'keys'), M.std(0x2c2a27, { roughness: 0.4 }));
  o.keys.rotation.y = Math.PI; o.keys.userData.height = 0.32; desk.add(o.keys);
  ink(desk, 30);
  // operator on a swivel chair, back to the room, facing the CRTs (+Z)
  const stool = new THREE.Group(); stool.name = 'stool'; s.add(stool);
  stool.add(styled(box(0.48, 0.06, 0.48, mat(C.dark), [0, 0.47, 0]), metal), styled(box(0.06, 0.45, 0.06, mat(C.dark), [0, 0.23, 0]), metal));
  stool.add(styled(box(0.46, 0.5, 0.05, mat(C.dark), [0, 0.78, -0.24]), metal));
  stool.position.set(2.6, 0, 2.75); ink(stool);
  o.stool = stool;
  o.operator = makeOperator(); s.add(o.operator);

  // the cable: base of the agent's skull → floor → console
  const curve = new THREE.CatmullRomCurve3([[-0.6, 1.15, 1.68], [-0.57, 1.47, 1.95], [-0.5, 0.6, 2.25], [-0.45, 0.03, 2.45], [0.6, 0.02, 2.6], [1.7, 0.02, 3.0], [2.2, 0.4, 3.5], [2.4, 0.76, 3.75]].map(p => new THREE.Vector3(...p)));
  o.cable = mesh(new THREE.TubeGeometry(curve, 80, 0.012, 6), mat(C.black), null, null, 'cable');
  o.cable.userData.noInk = true; styled(o.cable, M.std(0x050505, { roughness: 0.3 })); s.add(o.cable);
  for (const [x, z, r] of [[1.4, 3.6, 0.22], [3.9, 3.0, 0.18]]) {
    const coil = mesh(new THREE.TorusGeometry(r, 0.015, 6, 28), mat(C.black), [x, 0.02, z], [Math.PI / 2, 0, 0]);
    coil.userData.noInk = true; styled(coil, M.std(0x070707)); s.add(coil);
  }
  ink(room, 30);
  return {
    id: 'loft', title: 'A · Loft: chair, agent, console', scene: s, o, helperFar: 1.2,
    subjects: { agent: o.agent, operator: o.operator, keys: o.keys, chair: o.chair },
    mapHome: [[-5.5, 6.5, -6.5], [0.8, 0.6, 2]],
    look(name) {
      lookLights(L, name);
      s.background.set(name === 'styled' ? 0x020203 : 0x111216);
      s.fog = name === 'styled' ? new THREE.FogExp2(0x050608, 0.035) : null;
      o.pool.material.opacity = name === 'styled' ? 0.22 : 0;
    },
    tick(T) {
      o.rain.tick(T);
      o.glassTex.offset.y = (T * 0.05) % 1;
    },
    reset() {
      const a = o.agent;
      a.position.set(-0.6, 0.53, 1.58); a.rotation.set(0, 0, 0);
      pose(a, [['sit', 1], [{ shoulderL: [0.25, 0, -0.35], elbowL: [0.6, 0, 0], shoulderR: [0.25, 0, 0.35], elbowR: [0.6, 0, 0], neck: [0.05, 0, 0] }, 1]]);
      a.userData.eyes(0);
      const p = o.operator;
      p.position.set(2.6, 0.55, 2.75); p.rotation.set(0, Math.PI, 0);
      pose(p, [['sit', 1], ['handsOnTable', 1], [{ neck: [0.12, 0, 0] }, 1]]);
      o.stool.rotation.y = 0;
      o.scan.intensity = 0;
    },
  };
}

// ---------------------------------------------------------------- the street (shared by B and C)
// Street along Z, walls at x = ±3.2, neon tubes on both walls. Returns { group, pieces, neon } so the construct can
// raise the pieces out of the white floor.
function buildStreetBits(root, { wet = true } = {}) {
  const pieces = [], neon = [];
  const brick = M.std(0x6a4a40, { map: TEX.brick(), roughness: 0.8 });
  for (const sx of [-1, 1]) for (let z = -6, i = 0; z < 26; z += 4, i++) {
    const h = 6 + ((i * 7 + (sx > 0 ? 3 : 0)) % 5) * 1.6;
    const b = styled(box(1, h, 4, mat(0x7a7c84), [sx * 3.7, h / 2, z + 2]), brick);
    b.userData.h = h; b.userData.order = i + (sx > 0 ? 0.5 : 0); root.add(b); pieces.push(b);
  }
  const tubes = [[-3.15, 2.6, 3, 1.4, 0xff2a3d], [-3.15, 3.4, 9, 2.2, 0xff8a2a], [3.15, 2.9, 5.5, 1.8, 0xff2a3d], [3.15, 2.2, 12, 1.2, 0xff8a2a], [-3.15, 4.2, 15, 1.6, 0xff2a3d], [3.15, 3.6, 18, 2.4, 0xff5315]];
  for (const [x, y, z, l, c] of tubes) {
    const t = mesh(new THREE.CylinderGeometry(0.035, 0.035, l, 8), glow(0xffffff, 0.6), [x, y, z], [Math.PI / 2, 0, 0]);
    t.userData.noInk = true; styled(t, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 5 }));
    root.add(t); neon.push(t);
    const pl = new THREE.PointLight(c, 0, 7, 1.6); pl.position.set(x * 0.85, y, z); pl.userData.neon = true; root.add(pl); neon.push(pl);
  }
  const ground = styled(box(7.4, 0.04, 34, mat(0x5a5a5e), [0, -0.02, 10], 'road'), M.std(0x0c0c0e, { map: TEX.asphalt(), roughness: wet ? 0.12 : 0.8, metalness: 0.35 }));
  root.add(ground);
  const grate = styled(box(0.8, 0.02, 0.5, mat(C.dark), [1.2, 0.01, 6]), M.std(0x1a1a1a, { metalness: 0.7 })); root.add(grate);
  return { pieces, neon, ground };
}

// ---------------------------------------------------------------- B · CONSTRUCT
function buildConstruct() {
  const s = scene(0xf2f2ef);
  const o = {}, L = [];
  o.hemi = new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 1.6); o.key = new THREE.DirectionalLight(0xffffff, 0.8); o.key.position.set(-2, 6, -4);
  s.add(o.hemi, o.key);
  lights(L, [[o.hemi, 1.6, 2.4], [o.key, 0.8, 0.6]]);
  const floor = styled(box(400, 0.02, 400, mat(0xe6e6e3), [0, -0.01, 0], 'void'), new THREE.MeshPhysicalMaterial({ color: 0xf4f2ee, roughness: 0.18, clearcoat: 0.8 }));
  floor.userData.noInk = true; s.add(floor);
  o.agent = makeAgent(); s.add(o.agent);
  o.street = new THREE.Group(); o.street.name = 'rising street'; s.add(o.street);
  Object.assign(o, buildStreetBits(o.street));
  o.ground.visible = false;
  o.rain = makeRain({ n: 900, box: [8, 7, 10], center: [0, 3.5, 2], speed: 9, opacity: 0.45 }); o.rain.userData.lookOnly = 'styled'; s.add(o.rain);
  ink(o.street, 30);
  return {
    id: 'construct', title: 'B · Construct: the white void', scene: s, o, helperFar: 2,
    subjects: { agent: o.agent },
    mapHome: [[-9, 7, -12], [0, 1, 2]],
    look(name) {
      lookLights(L, name);
      s.background.set(name === 'styled' ? 0xf6f4ef : 0xf2f2ef);
      s.fog = new THREE.Fog(name === 'styled' ? 0xf6f4ef : 0xf2f2ef, 14, 60);
      this.lookName = name;
    },
    tick(T) { o.rain.tick(T); },
    // k = 0 white void … 1 the street stands, neon on, rain falling
    build(k) {
      for (const p of o.pieces) { const d = p.userData.order / 16; const q = THREE.MathUtils.clamp((k - d * 0.5) / 0.4, 0, 1); p.scale.y = Math.max(0.001, q); p.position.y = (p.userData.h / 2) * q; p.visible = q > 0; }
      o.neon.forEach((n, i) => { const on = k > 0.45 + (i % 6) * 0.06; if (n.isLight) n.intensity = on && this.lookName === 'styled' ? 18 : 0; else n.visible = on; });
      o.rain.visible = this.lookName === 'styled' && k > 0.55;
      s.background.set(this.lookName === 'styled' ? new THREE.Color(0xf6f4ef).lerp(new THREE.Color(0x060608), THREE.MathUtils.clamp((k - 0.35) / 0.5, 0, 1)) : 0xf2f2ef);
      if (s.fog) s.fog.color.copy(s.background);
      o.hemi.intensity = (this.lookName === 'styled' ? 2.4 : 1.6) * (1 - 0.8 * THREE.MathUtils.clamp((k - 0.35) / 0.5, 0, 1));
    },
    reset() {
      const a = o.agent;
      a.position.set(0, 0.95, 0); a.rotation.set(0, 0, 0);
      pose(a, [['stand', 1]]); a.userData.eyes(1);
      this.build(0);
    },
  };
}

// ---------------------------------------------------------------- C · STREET (the music video)
function buildStreet() {
  const s = scene(0x22242c);
  const o = {}, L = [];
  o.hemi = new THREE.HemisphereLight(0xc8d0e0, 0x202024, 1.2); o.key = new THREE.DirectionalLight(0xffffff, 1.2); o.key.position.set(-2, 8, -6);
  o.rim = new THREE.SpotLight(0xff2a3d, 0, 30, 0.6, 0.6, 1.2); o.rim.position.set(0, 6, 16); o.rim.target.position.set(0, 1, 4);
  s.add(o.hemi, o.key, o.rim, o.rim.target);
  lights(L, [[o.hemi, 1.2, 0.08], [o.key, 1.2, 0], [o.rim, 0, 60]]);
  const st = new THREE.Group(); s.add(st);
  Object.assign(o, buildStreetBits(st));
  o.singer = makeSinger(); s.add(o.singer);
  o.rain = makeRain({ n: 2000, box: [7, 8, 18], center: [0, 4, 6], speed: 11, opacity: 0.5 }); o.rain.userData.lookOnly = 'styled'; s.add(o.rain);
  o.steam = blob(0xffd0c0, 3, 0); o.steam.position.set(1.2, 0.8, 6); s.add(o.steam);
  ink(st, 30);
  return {
    id: 'street', title: 'C · Street: the music video', scene: s, o, helperFar: 3,
    subjects: { singer: o.singer },
    mapHome: [[7, 6, -6], [0, 1, 6]],
    look(name) {
      lookLights(L, name);
      s.background.set(name === 'styled' ? 0x030304 : 0x22242c);
      s.fog = name === 'styled' ? new THREE.FogExp2(0x0a0306, 0.05) : null;
      o.neon.forEach(n => { if (n.isLight) n.intensity = name === 'styled' ? 16 : 0; });
      o.steam.material.opacity = name === 'styled' ? 0.12 : 0;
    },
    tick(T) { o.rain.tick(T); },
    reset() { o.singer.position.set(0, 0.95, 7); o.singer.rotation.set(0, 0, 0); pose(o.singer, [['stand', 1]]); },
  };
}

// ---------------------------------------------------------------- X · SCREEN (inserts made in the edit)
function buildScreen() {
  const s = scene(0x0b0b0d);
  const o = {};
  s.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1));
  o.screen = box(1.6, 0.9, 0.02, glow(0x2a2a2a, 0.4), [0, 1.2, 0], 'screen'); o.screen.userData.noInk = true;
  styled(o.screen, new THREE.MeshStandardMaterial({ color: 0x070708, emissive: 0x0e0602, emissiveIntensity: 1 }));
  o.screen.userData.height = 0.9; s.add(o.screen);
  const lab = labelPlane('INSERT · made in the edit (HyperFrames)', { w: 1.4, h: 0.16, bg: 'rgba(0,0,0,0)', fg: '#ff5315' });
  lab.position.set(0, 1.2, -0.02); lab.rotation.y = Math.PI; s.add(lab);
  return {
    id: 'screen', title: 'X · Inserts made in the edit', scene: s, o, helperFar: 1,
    subjects: { screen: o.screen },
    mapHome: [[2, 2, -3], [0, 1.2, 0]],
    reset() {},
  };
}

export function buildSets() {
  const sets = Object.fromEntries([buildLoft(), buildConstruct(), buildStreet(), buildScreen()].map(s => [s.id, s]));
  for (const s of Object.values(sets)) s.reset();
  return sets;
}
