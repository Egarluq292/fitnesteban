/* Maniquí 3D articulado para ver los ejercicios (FITNESTEBAN). Poses A↔B en bucle, cámara girando suave. */
import * as T from './three.module.min.js';
const d = Math.PI / 180;
let R = null, raf = 0, cv = null;
function build() {
  const S = new T.Scene(); S.fog = new T.Fog(0x05080d, 6, 14);
  S.add(new T.HemisphereLight(0x9fe8ff, 0x0a0f18, .9));
  const dl = new T.DirectionalLight(0xffffff, 1.6); dl.position.set(3, 6, 4); dl.castShadow = true; dl.shadow.mapSize.set(1024, 1024); S.add(dl);
  const rim = new T.DirectionalLight(0x22d3ee, 1.4); rim.position.set(-4, 3, -3); S.add(rim);
  const floor = new T.Mesh(new T.CircleGeometry(2.2, 64), new T.MeshStandardMaterial({ color: 0x0b1220, roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
  const ring = new T.Mesh(new T.RingGeometry(2.15, 2.2, 64), new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .5 })); ring.rotation.x = -Math.PI / 2; ring.position.y = .002; S.add(ring);
  const M = new T.MeshStandardMaterial({ color: 0xcbd5e1, roughness: .35, metalness: .15 }), J = new T.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0e7490, emissiveIntensity: .6, roughness: .3 });
  const BAG = new T.MeshStandardMaterial({ color: 0xf97316, roughness: .6 });
  const sh = m => { m.castShadow = true; return m; };
  const cap = (r, L) => { const g = sh(new T.Mesh(new T.CapsuleGeometry(r, Math.max(.01, L - 2 * r), 8, 16), M)); g.position.y = -L / 2; return g; };
  const ball = r => sh(new T.Mesh(new T.SphereGeometry(r, 20, 16), J));
  const node = (p, y, x = 0, z = 0) => { const n = new T.Group(); n.position.set(x, y, z); p.add(n); return n; };
  const root = new T.Group(); S.add(root);
  const B = {}; B.pelvis = node(root, 0);
  { const pm = sh(new T.Mesh(new T.CapsuleGeometry(.11, .16, 8, 16), M)); pm.rotation.z = Math.PI / 2; B.pelvis.add(pm); }
  B.spine = node(B.pelvis, .05); { const t = sh(new T.Mesh(new T.CapsuleGeometry(.14, .32, 8, 16), M)); t.position.y = .24; B.spine.add(t); }
  B.neck = node(B.spine, .52); { const h = sh(new T.Mesh(new T.SphereGeometry(.11, 24, 20), M)); h.position.y = .12; B.neck.add(h); }
  for (const s of [1, -1]) {
    const k = s > 0 ? 'L' : 'R';
    B['sh' + k] = node(B.spine, .44, .2 * s); B['sh' + k].add(ball(.055)); B['sh' + k].add(cap(.045, .28));
    B['el' + k] = node(B['sh' + k], -.28); B['el' + k].add(ball(.045)); B['el' + k].add(cap(.04, .27));
    B['hd' + k] = node(B['el' + k], -.27); B['hd' + k].add(sh(new T.Mesh(new T.SphereGeometry(.045, 12, 10), M)));
    B['hp' + k] = node(B.pelvis, -.04, .1 * s); B['hp' + k].add(ball(.06)); B['hp' + k].add(cap(.065, .42));
    B['kn' + k] = node(B['hp' + k], -.42); B['kn' + k].add(ball(.05)); B['kn' + k].add(cap(.052, .42));
    B['an' + k] = node(B['kn' + k], -.42); { const ft = sh(new T.Mesh(new T.BoxGeometry(.09, .06, .22), M)); ft.position.set(0, -.02, .05); B['an' + k].add(ft); }
    B['to' + k] = node(B['an' + k], -.05, 0, .16); // punta del pie (para ponerse de puntillas)
  }
  // mochila (en el pecho o en las manos según el ejercicio)
  const bag = sh(new T.Mesh(new T.BoxGeometry(.26, .32, .14), BAG)); bag.visible = false; S.add(bag);
  // silla / escalón / pared opcionales
  const prop = new T.Group(); S.add(prop);
  return { S, root, B, bag, prop };
}
let W = null;
/* Poses: ángulos en grados. hip/knee/sh/el por lado con sufijo L/R si son distintos. ground: puntos que tocan el suelo. */
const P = {
  sq0: { a: { sh: 0 }, b: { hip: 90, knee: 95, ankle: -5, spine: 30, sh: 90, hipAb: 10 }, chair: -.42 },
  sqb: { base: { sh: 15, el: 125, shAb: 25 }, a: {}, b: { hip: 100, knee: 110, ankle: -10, spine: 30, hipAb: 12 }, bag: 'chest' },
  lgb: { a: {}, b: { hipL: 85, kneeL: 85, hipR: -25, kneeR: 95, ankleR: 40, spine: 5, shAb: 15 }, ground: ['anL', 'knR'], bag: 'back' },
  br1: { base: { rootX: -90, sh: 0, shAb: 15, hip: 40, knee: 100, ankle: 10, kneeR: 0 }, a: { hip: 40 }, b: { hip: -5 }, ground: ['anL', 'neck'], lift: .14 },
  pu0: { base: { neck: -5 }, a: { rootX: 18, sh: 90, el: 0 }, b: { rootX: 30, sh: 55, shAb: 30, el: 100 }, hands: 'wall' },
  pu1: { base: { neck: -8 }, a: { rootX: 50, hip: -2, sh: 75, el: 0 }, b: { rootX: 60, sh: 25, shAb: 35, el: 95 }, hands: 'table' },
  rw1: { base: { rootX: 45, hip: 55, knee: 20, neck: -20, shL: 90, elL: 0 }, a: { shR: 85, elR: 0 }, b: { shR: 20, elR: 95 }, bag: 'hdR', hands: 'chair', hx: .25 },
  dl1: { a: { sh: 0 }, b: { rootX: 75, hipL: 80, kneeL: 15, hipR: -5, kneeR: 0, sh: 75, neck: -25 }, ground: ['anL'], bag: 'hands' },
  pk0: { base: { rootX: 72, sh: 90, el: 90, neck: -10, knee: 95 }, a: {}, b: { rootX: 74 }, ground: ['elL', 'elR', 'knL', 'knR'], lift: .05 },
  sk0: { base: { rootZ: 70, shAbL: -20, elL: 90, shL: 90, shAbR: 20, knee: 90 }, a: {}, b: { rootZ: 76 }, ground: ['elL', 'knL'], lift: .05 },
  mc0: { base: { rootX: 45, sh: 55, neck: -10 }, a: { hipL: 70, kneeL: 90, hipR: 0, kneeR: 0 }, b: { hipR: 70, kneeR: 90, hipL: 0, kneeL: 0 }, ground: ['anL', 'anR'], hands: 'table' },
  jj0: { a: { shAb: 10, hipAbL: 0 }, b: { shAb: 120, hipAbL: 20 } },
  sq: { a: { sh: 0 }, b: { hip: 100, knee: 110, ankle: -10, spine: 35, sh: 90, hipAb: 10 } },
  lg: { a: {}, b: { hipL: 85, kneeL: 85, hipR: -25, kneeR: 95, ankleR: 40, spine: 5, shAb: 15 }, ground: ['anL', 'knR'] },
  br: { base: { rootX: -90, sh: 0, shAb: 15, hip: 40, knee: 100, ankle: 10 }, a: { hip: 40 }, b: { hip: -5 }, ground: ['anL', 'anR', 'neck'], lift: .14 },
  pu: { base: { rootX: 72, hip: -2, knee: 100, neck: -12 }, a: { sh: 68, shAb: 10, el: 0 }, b: { rootX: 84, sh: -15, shAb: 35, el: 95 }, ground: ['knL', 'knR', 'hdL', 'hdR'], lift: .05 },
  rw: { base: { rootX: 45, hip: 55, knee: 20, neck: -20 }, a: { sh: 85, el: 0 }, b: { sh: 25, el: 95 }, bag: 'hands' },
  sp: { a: { sh: 150, shAb: 25, el: 100 }, b: { sh: 175, shAb: 10, el: 0 }, bag: 'hands' },
  dl: { a: { sh: 0 }, b: { rootX: 70, hip: 80, knee: 20, sh: 70, neck: -25 }, bag: 'hands' },
  pk: { base: { rootX: 80, sh: 90, el: 90, neck: -10, ankle: -60 }, a: {}, b: { rootX: 82 }, ground: ['elL', 'elR', 'anL', 'anR'], lift: .05 },
  sk: { base: { rootZ: 70, shAbL: -20, elL: 90, shL: 90, shAbR: 20 }, a: {}, b: { rootZ: 76 }, ground: ['elL', 'anL'], lift: .05 },
  db: { base: { rootX: -90, neck: 0 }, a: { hip: 90, knee: 90, sh: 90 }, b: { hipL: 10, kneeL: 0, shR: 175, hipR: 90, kneeR: 90, shL: 90 }, ground: ['pelvis', 'neck'], lift: .12 },
  bd: { base: { rootX: 90, hip: 90, knee: 90, sh: 90, neck: -15 }, a: {}, b: { hipL: -5, kneeL: 0, shR: 180 }, ground: ['knL', 'knR', 'hdL', 'hdR'], lift: .05 },
  su: { base: { rootX: 90, neck: -20 }, a: { sh: 170, hip: 0, spine: 0 }, b: { sh: 180, hip: -15, spine: -15 }, ground: ['pelvis'], lift: .12 },
  ca: { ang: .6, a: { ankle: 0 }, b: { ankle: 38 }, ground: ['toL', 'toR'], lift: .01 },
  ws: { base: { hip: 90, knee: 90, sh: 0 }, a: { spine: 0 }, b: { spine: 2 }, wall: true },
  mc: { base: { rootX: 70, sh: 70, neck: -12 }, a: { hipL: 80, kneeL: 100, hipR: 0, kneeR: 0 }, b: { hipR: 80, kneeR: 100, hipL: 0, kneeL: 0 }, ground: ['hdL', 'hdR', 'anL', 'anR'], lift: .05 },
  jj: { a: { shAb: 10, hipAb: 3 }, b: { shAb: 165, hipAb: 18 } },
  st: { a: { hipL: 75, kneeL: 85, hipR: 0, kneeR: 0 }, b: { hipL: 0, kneeL: 0, hipR: 25, kneeR: 50 }, ground: ['anL'], lift: .26, step: true },
  dp: { base: { hip: 90, knee: 90 }, a: { sh: -35, el: 0, dy: 0 }, b: { sh: -65, el: 85, dy: -.2 }, ground: ['anL', 'anR'], chair: -.62 },
  dp1: { base: { hip: 80, knee: 20, ankle: 10 }, a: { sh: -35, el: 0, dy: 0 }, b: { sh: -65, el: 85, dy: -.2 }, ground: ['anL', 'anR'], chair: -.62 }
};
const SIDES = ['L', 'R'];
function apply(p, ex) {
  const { root, B, bag } = W;
  root.rotation.set((p.rootX || 0) * d, 0, (p.rootZ || 0) * d);
  B.spine.rotation.set((p.spine || 0) * d, 0, 0); B.neck.rotation.set((p.neck || 0) * d, 0, 0);
  const g = (k, s) => p[k + s] ?? p[k] ?? 0;
  for (const k of SIDES) {
    const s = k === 'L' ? 1 : -1;
    B['hp' + k].rotation.set(-g('hip', k) * d, 0, g('hipAb', k) * d * s); B['kn' + k].rotation.set(g('knee', k) * d, 0, 0); B['an' + k].rotation.set(g('ankle', k) * d, 0, 0);
    B['sh' + k].rotation.set(-g('sh', k) * d, 0, g('shAb', k) * d * s); B['el' + k].rotation.set(-g('el', k) * d, 0, 0);
  }
  root.position.set(0, 0, 0); root.updateMatrixWorld(true);
  let mn = 1e9; const v = new T.Vector3();
  for (const e of ex.ground || ['anL', 'anR']) { B[e].getWorldPosition(v); mn = Math.min(mn, v.y); }
  root.position.y = -mn + (ex.lift ?? .06) + (ex.toes ? Math.sin(Math.abs(p.ankle || 0) * d) * .17 : 0);
  root.position.y += (p.dy || 0);
  root.updateMatrixWorld(true);
  if (ex.bag) {
    const a = new T.Vector3(), b = new T.Vector3();
    if (ex.bag === 'chest') { B.spine.getWorldPosition(a); bag.position.set(a.x, a.y + .3, a.z + .2); bag.rotation.set(root.rotation.x, 0, 0); }
    else if (ex.bag === 'back') { B.spine.getWorldPosition(a); bag.position.set(a.x, a.y + .3, a.z - .2); bag.rotation.set(root.rotation.x, 0, 0); }
    else if (ex.bag === 'hdR') { B.hdR.getWorldPosition(a); bag.position.copy(a); bag.position.y -= .12; bag.rotation.set(0, 0, 0); }
    else { B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); bag.position.copy(a.add(b).multiplyScalar(.5)); bag.position.y -= .12; bag.rotation.set(0, 0, 0); }
    bag.visible = true;
  } else bag.visible = false;
}
function props(ex, pA) {
  const { prop, B } = W; prop.clear();
  const m = new T.MeshStandardMaterial({ color: 0x334155, roughness: .8 });
  const box = (w, h, dd, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, dd), m); b.position.set(x, y, z); b.receiveShadow = true; prop.add(b); };
  if (ex.wall) box(1.4, 1.8, .06, 0, .9, -.32);
  if (ex.chair) box(.5, .45, .45, 0, .225, ex.chair);
  if (ex.step) box(.6, .2, .4, .1, .1, .12);
  if (ex.hands) { // mesa o pared donde apoyan las manos (sale de la pose inicial)
    apply(pA, ex); const a = new T.Vector3(), b = new T.Vector3(); B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); const hz = (a.z + b.z) / 2, hy = (a.y + b.y) / 2 - .05;
    if (ex.hands === 'wall') { box(.8, 1.7, .05, 0, .85, hz + .06); prop.children.at(-1).material = new T.MeshStandardMaterial({ color: 0x334155, roughness: .8, transparent: true, opacity: .55 }); }
    else if (ex.hands === 'chair') box(.45, hy, .4, ex.hx || 0, hy / 2, hz);
    else box(.9, hy, .55, 0, hy / 2, hz + .15);
  }
}
export function mount(el, id, lv = 1) {
  const ex = P[id]; if (!ex) { el.innerHTML = '<span class="text-mute text-sm">Animación en preparación. Mira el vídeo.</span>'; return; }
  stop();
  if (!R) { R = new T.WebGLRenderer({ antialias: true, alpha: true }); R.shadowMap.enabled = true; }
  if (!W) W = build();
  cv = R.domElement; el.innerHTML = ''; el.appendChild(cv);
  const w = el.clientWidth || 320, h = el.clientHeight || 260; R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(w, h);
  const cam = new T.PerspectiveCamera(38, w / h, .1, 50);
  const keys = [...new Set([...Object.keys(ex.a), ...Object.keys(ex.b)])];
  const poseAt = e => { const pick = (o, k) => o[k] ?? (/[LR]$/.test(k) ? o[k.slice(0, -1)] : undefined), p = { ...(ex.base || {}) }; for (const k of keys) { const a = pick(ex.a, k) ?? pick(ex.base || {}, k) ?? 0, b = pick(ex.b, k) ?? pick(ex.base || {}, k) ?? 0; p[k] = a + (b - a) * e; } return p; };
  props(ex, poseAt(0));
  const per = { sq: 2.8, lg: 3, sp: 2.6, ca: 2, jj: 1.4, mc: 1.2, pk: 4, sk: 4, ws: 4 }[id] || 2.6;
  const t0 = performance.now();
  const frame = now => {
    if (!cv.isConnected) { stop(); return; }
    const t = window.__man3dT ?? ((now - t0) / (per * 1000)) % 1, e = (1 - Math.cos(t * Math.PI * 2)) / 2;
    apply(poseAt(e), ex);
    const ang = (window.__man3dA ?? (.9 + Math.sin(now / 5000) * .35)) + (ex.ang || 0);
    cam.position.set(Math.sin(ang) * 3.6, 1.5, Math.cos(ang) * 3.6); cam.lookAt(0, .65, 0);
    R.render(W.S, cam); raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}
export function stop() { cancelAnimationFrame(raf); raf = 0; }
