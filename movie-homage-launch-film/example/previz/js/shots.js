// Per-shot previz for "I know how": animation (pose from time only) and hand cameras where the auto camera
// cannot know the geography (a wide that must hold the agent AND the console, an insert of the keys).
import * as THREE from 'three';
import { pose, walk } from './props.js';
import { lookNow } from './look.js';

const cl = x => Math.max(0, Math.min(1, x));
export const ramp = (x, a, b) => cl((x - a) / (b - a));
export const sm = x => x * x * (3 - 2 * x);
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const cam = (ap, at, af, bp, bt, bf, ease = 'inOut', ar = 0, br = 0) =>
  ({ a: { p: ap, t: at, fov: af, roll: ar }, b: { p: bp || ap, t: bt || at, fov: bf ?? af, roll: br }, ease });

// operator typing at the console: hands on the keys, forearms bouncing
function typing(p, lt, amt = 1) {
  const j = p.userData.j;
  j.elbowL.rotation.x += Math.sin(lt * 23) * 0.06 * amt;
  j.elbowR.rotation.x += Math.sin(lt * 19 + 1) * 0.06 * amt;
  j.shoulderL.rotation.z += Math.sin(lt * 7) * 0.03 * amt;
}
const agentHead = S => S.o.agent.userData.j.neck;

export const SHOTS = {
  // 1 · the loft: wide, high, slow push in; agent in the chair (centre-right of frame), console at screen-left
  s01: {
    cam: cam([-2.2, 2.7, -4.4], [0.9, 1.0, 2.4], 42, [-1.6, 2.35, -3.0], [0.85, 1.0, 2.4], 40),
    anim(S, c) { typing(S.o.operator, c.lt); },
  },
  // 2 · her hands on the keys, from her left side, the CRT glow behind
  s02: {
    cam: cam([3.25, 1.08, 2.9], [2.58, 0.82, 3.28], 30, [3.2, 1.05, 2.95], [2.58, 0.82, 3.28], 28, 'linear'),
    anim(S, c) {
      typing(S.o.operator, c.lt, 3.2);
      const strike = sm(ramp(c.k, 0.78, 0.86)) - sm(ramp(c.k, 0.88, 1));
      S.o.operator.userData.j.elbowR.rotation.x += 0.25 * strike;
    },
  },
  // 4 · the load begins: an amber band of light sweeps over the closed porcelain face
  s04: {
    anim(S, c) {
      S.o.scan.intensity = lookNow() === 'styled' ? 6 : 0;
      S.o.scan.position.set(THREE.MathUtils.lerp(-1.1, -0.1, c.k), 1.25, 1.25);
    },
  },
  // 6 · the eyes open
  s06: {
    anim(S, c) { S.o.agent.userData.eyes(sm(ramp(c.k, 0.12, 0.55))); },
  },
  // 7 · she swivels from the screens to the agent and lifts one side of the headset: "Show me."
  s07: {
    cam: cam([1.05, 1.32, 1.35], [2.6, 1.22, 2.75], 32, [1.15, 1.3, 1.5], [2.6, 1.22, 2.75], 30),
    anim(S, c) {
      const p = S.o.operator, turn = sm(ramp(c.k, 0.0, 0.45));
      p.rotation.y = THREE.MathUtils.lerp(Math.PI, 1.3, turn);
      S.o.stool.rotation.y = p.rotation.y - Math.PI;
      const lift = sm(ramp(c.k, 0.45, 0.75));
      pose(p, [['sit', 1], ['handsOnTable', 1 - turn], [{ shoulderL: [0.6, 0, -0.9], elbowL: [2.4, 0, 0] }, lift]]);
      S.o.agent.userData.eyes(1);
    },
  },
  // 8 · hard cut to white: the agent alone, crane down
  s08: {
    cam: cam([0, 4.2, -10.5], [0, 1.0, 0], 34, [0, 1.5, -9.2], [0, 1.1, 0], 34),
    anim(S) { S.o.agent.userData.eyes(1); },
  },
  // 9 · it raises its right hand; the street rises out of the white, neon on, rain
  s09: {
    anim(S, c) {
      const up = sm(ramp(c.k, 0.05, 0.4));
      pose(S.o.agent, [['stand', 1], [{ shoulderR: [1.35, 0, 0.15], elbowR: [0.3, 0, 0] }, up]]);
      S.build(sm(ramp(c.k, 0.2, 1)));
    },
  },
  // 10 · the music video: she walks toward us down the wet street and stops on the beat
  s10: {
    anim(S, c) {
      const g = sm(ramp(c.k, 0, 0.8)), p = S.o.singer;
      p.position.z = THREE.MathUtils.lerp(7, 3.4, g);
      if (c.k < 0.8) walk(p, c.lt, 1.0, 1); else pose(p, [['stand', 1]]);
    },
  },
  // 11 · back at the console: impressed, she turns back to the keys
  s11: {
    cam: cam([3.35, 1.32, 3.05], [2.6, 1.24, 2.75], 28, [3.25, 1.3, 3.0], [2.6, 1.24, 2.75], 25),
    anim(S, c) {
      const p = S.o.operator;
      p.rotation.y = THREE.MathUtils.lerp(Math.PI + 0.5, Math.PI, sm(ramp(c.k, 0.3, 0.9)));
      pose(p, [['sit', 1], ['handsOnTable', sm(ramp(c.k, 0.4, 1))], [{ neck: [-0.05, 0, 0] }, 1]]);
      S.o.agent.userData.eyes(1);
    },
  },
  // 13 · it turns its head from her to the lens: "Just ask."
  s13: {
    anim(S, c) {
      S.o.agent.userData.eyes(1);
      agentHead(S).rotation.y = THREE.MathUtils.lerp(-0.75, 0, sm(ramp(c.k, 0.1, 0.65)));
    },
  },
};
