/* Maniquí 3D para los ejercicios de los bloques (FITNESTEBAN). Copia aparte de man3d.js (el del calendario) con barra, mancuernas, banco y barra de dominadas. */
import * as T from './three.module.min.js';
const d = Math.PI / 180;
const HSIGN = 1; // sentido del giro horizontal del hombro (shH)
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
  const STEEL = new T.MeshStandardMaterial({ color: 0x9ca3af, metalness: .8, roughness: .3 }), PLATE = new T.MeshStandardMaterial({ color: 0x111827, roughness: .5, metalness: .2 });
  const cyl = (r, l, m) => { const c = sh(new T.Mesh(new T.CylinderGeometry(r, r, l, 20), m)); c.rotation.z = Math.PI / 2; return c; };
  const bar = new T.Group(); bar.add(cyl(.016, 1.7, STEEL)); for (const x of [-.68, .68]) { const pl = cyl(.2, .05, PLATE); pl.position.x = x; bar.add(pl); } bar.visible = false; S.add(bar);
  const dbs = [0, 1].map(() => { const g = new T.Group(); g.add(cyl(.014, .3, STEEL)); for (const x of [-.11, .11]) { const pl = cyl(.06, .07, PLATE); pl.position.x = x; g.add(pl); } g.visible = false; S.add(g); return g; });
  const kb = new T.Group(); { const bl = sh(new T.Mesh(new T.SphereGeometry(.11, 20, 16), PLATE)); bl.position.y = -.13; kb.add(bl); const hd = sh(new T.Mesh(new T.TorusGeometry(.06, .015, 8, 20), STEEL)); hd.position.y = -.01; kb.add(hd); } kb.visible = false; S.add(kb);
  const straps = [0, 1].map(() => { const m = new T.Mesh(new T.CylinderGeometry(.012, .012, 1, 8), new T.MeshStandardMaterial({ color: 0xfacc15, roughness: .6 })); m.visible = false; S.add(m); return m; });
  return { S, root, B, bag, prop, bar, dbs, kb, straps };
}
let W = null;
/* Poses: ángulos en grados. hip/knee/sh/el por lado con sufijo L/R si son distintos. ground: puntos que tocan el suelo. */
const P = {
  // 1 Sentadilla con barra (trasera)
  sqbar: { base: { shAb: 75, sh: 20, el: 150 }, a: {}, b: { hip: 100, knee: 115, ankle: -12, spine: 38, hipAb: 12 }, bar: 'back' },
  // 2 Press de banca (tumbado en banco)
  bench: { base: { rootX: -90, hip: 8, knee: 92, neck: 0 }, a: { sh: 90, el: 0, shAb: 8 }, b: { sh: 22, shAb: 28, el: 100 }, ground: ['anL', 'anR'], bench: [.4, .45, 1.3, 0, -.45], bar: 'hands' },
  // 3 Peso muerto rumano con barra
  rdl: { a: { sh: 0, knee: 8 }, b: { rootX: 72, hip: 88, knee: 32, ankle: -8, sh: 72, neck: -25 }, bar: 'hands' },
  // 4 Remo con barra
  bbrow: { base: { rootX: 50, hip: 60, knee: 22, neck: -20 }, a: { sh: 60, el: 0 }, b: { sh: -5, el: 95, shAb: 20 }, bar: 'hands' },
  // 5 Press militar con barra
  ohp: { cam: [3.9, 1.6, .95], a: { sh: 75, shAb: 30, el: 140 }, b: { sh: 178, shAb: 8, el: 0 }, bar: 'hands' },
  // 6 Dominadas
  pull: { cam: [4.4, 1.7, 1.35], base: { knee: 60, hip: 10 }, a: { sh: 180, shAb: 18, el: 0 }, b: { sh: 25, shAb: 10, el: 150, neck: -12, rootX: -8 }, pull: 2.25 },
  // 7 Hip thrust con barra (espalda en el banco)
  hipth: { base: { sh: 20, shAb: 40, el: 70 }, a: { rootX: -62, hip: 52, knee: 100 }, b: { rootX: -90, hip: 0, knee: 92 }, ground: ['anL', 'anR'], bar: 'hips', bench: [1.2, .42, .35, 0, -.62] },
  // 8 Curl de bíceps con mancuernas
  curl: { a: { el: 0, sh: 0 }, b: { el: 140, sh: 5 }, db: true },
  // 9 Elevaciones laterales
  lat: { a: { shAb: 8, el: 10 }, b: { shAb: 85, el: 15 }, db: true },
  // 10 Sentadilla búlgara con mancuernas
  bulg: { pin: ['pelvis', 'p'], fix: ['anL', 'anR'], base: { hipR: -35, kneeR: 80, ankleR: 30, hipL: 30, kneeL: 0 }, a: { py: .8, spine: 6 }, b: { py: .6, spine: 12 }, foot: 'anR', flat: ['anL'], db: true },
  // ---- tanda 2 ----
  incl: { base: { rootX: -55, hip: 55, knee: 90 }, a: { sh: 90, el: 0, shAb: 8 }, b: { sh: 25, shAb: 30, el: 100 }, ground: ['anL', 'anR'], incline: true, db: true },
  lunge: { a: {}, b: { hipL: 85, kneeL: 85, hipR: -25, kneeR: 95, ankleR: 40, spine: 3 }, ground: ['anL', 'knR'], db: true },
  dips: { cam: [3.9, 1.5, 1], base: { knee: 70, hip: 20 }, a: { sh: 0, el: 0, shAb: 6, rootX: 8 }, b: { sh: -50, el: 95, shAb: 8, rootX: 18 }, dip: 1.25 },
  skull: { base: { rootX: -90, hip: 8, knee: 92, neck: 0 }, a: { sh: 95, el: 0, shAb: 6 }, b: { sh: 110, el: 115, shAb: 6 }, ground: ['anL', 'anR'], bench: [.4, .45, 1.3, 0, -.45], bar: 'hands' },
  ohext: { cam: [3.9, 1.6, .95], a: { sh: 175, shAb: 6, el: 0 }, b: { sh: 170, shAb: 10, el: 135 }, db: 'one', dbRot: true },
  facep: { a: { sh: 90, el: 0, shAb: 8 }, b: { sh: 95, shAb: 80, el: 100 } },
  calfdb: { ang: .6, a: { ankle: 0 }, b: { ankle: 38 }, ground: ['toL', 'toR'], lift: .01, db: true },
  swing: { base: { hipAb: 15 }, a: { rootX: 62, hip: 82, knee: 38, ankle: -12, sh: -8, neck: -20 }, b: { rootX: -6, hip: -6, knee: 0, sh: 88, neck: 0 }, kb: true },
  pushup: { base: { rootX: 76, hip: 0, knee: 0, ankle: -50, neck: -10 }, a: { sh: 78, shAb: 8, el: 0 }, b: { rootX: 85, sh: 15, shAb: 28, el: 100 }, ground: ['hdL', 'hdR', 'anL', 'anR'], lift: .05 },
  goblet: { base: { sh: 15, el: 125, shAb: 22 }, a: {}, b: { hip: 105, knee: 115, ankle: -12, spine: 25, hipAb: 14 }, db: 'one' },
  // ---- tanda 3 ----
  dl: { a: { rootX: 48, hip: 85, knee: 75, ankle: -15, sh: 48, neck: -25 }, b: { rootX: 0, hip: 0, knee: 0, sh: 0, neck: 0 }, bar: 'hands' },
  sumo: { ang: -.75, base: { hipAb: 32, sh: 0, el: 0 }, a: {}, b: { hip: 90, knee: 105, ankle: -10, spine: 22 }, db: 'one', dbRot: true },
  stepdb: { cam: [4, 1.6, .9], ang: .5, pin: ['pelvis', 'p'], fix: ['anL'], foot: 'anL', base: { hipL: 62, kneeL: 78, ankleL: 0 }, a: { py: .92, pz: -.18, spine: 14, hipR: 0, kneeR: 0 }, b: { py: 1.18, pz: .02, spine: 2, hipR: 25, kneeR: 70 }, db: true },
  gm: { base: { shAb: 75, sh: 20, el: 150 }, a: {}, b: { rootX: 70, hip: 75, knee: 15, neck: -20 }, bar: 'back' },
  reneg: { base: { rootX: 76, hip: 0, knee: 0, ankle: -50, neck: -10, sh: 78, shAb: 8, el: 0, hipAb: 8 }, a: {}, b: { shR: 5, elR: 100, shAbR: 15 }, ground: ['hdL', 'anL', 'anR'], lift: .05, db: true },
  plank: { base: { rootX: 80, sh: 90, el: 90, neck: -10, ankle: -60 }, a: {}, b: { rootX: 82 }, ground: ['elL', 'elR', 'anL', 'anR'], lift: .05 },
  hollow: { base: { rootX: -90 }, a: { sh: 160, hip: 10, spine: 5 }, b: { sh: 175, hip: 35, spine: 22, neck: 15 }, ground: ['pelvis'], lift: .12 },
  crunch: { base: { rootX: -90, hip: 45, knee: 95, sh: 150, shAb: 40, el: 150 }, a: { spine: 0, neck: 0 }, b: { spine: 35, neck: 15 }, ground: ['pelvis', 'anL', 'anR'], lift: .1 },
  burpee: { cam: [4.1, 1.5, .85], k: [
    { rootX: 0, hip: 0, knee: 0, sh: 0, dy: 0 },
    { rootX: 50, hip: 120, knee: 130, ankle: -20, sh: 50, dy: 0 },
    { rootX: 78, hip: 0, knee: 0, ankle: -50, sh: 78, dy: 0 },
    { rootX: 50, hip: 120, knee: 130, ankle: -20, sh: 50, dy: 0 },
    { rootX: 0, hip: 0, knee: 0, sh: 175, dy: .25 }
  ], ground: ['anL', 'anR', 'hdL', 'hdR'] },
  invrow: { cam: [4, 1.2, .5], pin: ['anL', 'auto'], base: { hip: 0, knee: 0, neck: 10, shAb: 6, ankle: 10 }, anchor: [.85, -1.25], rel: true, rxMax: -45, a: { reach: .53 }, b: { reach: .2 }, pinA: -75 },
  kbpress: { a: { shR: 35, elR: 140, shAbR: 10, shL: 0 }, b: { shR: 175, elR: 0, shAbR: 8 }, kb: 'R', cam: [3.9, 1.6, .95] },
  // ---- sin material (del calendario) ----
  sq: { a: { sh: 0 }, b: { hip: 100, knee: 110, ankle: -10, spine: 35, sh: 90, hipAb: 10 } },
  br: { pin: ['neck', 'auto'], fix: ['anL', 'anR'], base: { sh: 0, shAb: 15, hip: 40, knee: 100, ankle: 10 }, a: { rootX: -92 }, b: { rootX: -118 }, ground: ['anL', 'anR', 'neck'], lift: .14 },
  br1: { pin: ['neck', 'auto'], fix: ['anL'], base: { sh: 0, shAb: 15, hipL: 40, kneeL: 100, ankleL: 10, kneeR: 0 }, a: { rootX: -92, hipR: 20 }, b: { rootX: -118, hipR: -26 }, ground: ['anL', 'neck'], lift: .14 },
  sk: { ang: -.9, base: { rootZ: -73, shAbL: 84, shL: 0, elL: 90, shR: 4, shAbR: 12, elR: 28, neck: 0 }, a: {}, b: {}, ground: ['elL', 'hdL', 'anL'], lift: .05 },
  mc: { base: { rootX: 70, sh: 70, neck: -12 }, a: { hipL: 80, kneeL: 100, hipR: 0, kneeR: 0 }, b: { hipR: 80, kneeR: 100, hipL: 0, kneeL: 0 }, ground: ['hdL', 'hdR', 'anL', 'anR'], lift: .05 },
  jj: { a: { shAb: 10, hipAb: 3 }, b: { shAb: 165, hipAb: 18 } },
  dp: { pin: ['pelvis', 'p'], fix: ['hdL', 'hdR', 'anL', 'anR'], base: { hip: 85, knee: 80, sh: -35, el: 0 }, a: { py: .47, pz: .05 }, b: { py: .24, pz: .05 }, hands: 'chair' },
  pu: { base: { rootX: 72, hip: -2, knee: 100, neck: -12 }, a: { sh: 68, shAb: 10, el: 0 }, b: { rootX: 84, sh: -15, shAb: 35, el: 95 }, ground: ['knL', 'knR', 'hdL', 'hdR'], lift: .05 },
  // ---- correcciones de Esteban ----
  curlh: { a: { el: 0, sh: 0 }, b: { el: 140, sh: 5 }, db: true, hammer: true },
  dbrow1: { base: { rootX: 45, hip: 55, knee: 20, neck: -20, shL: 90, elL: 0, hipAb: 8 }, a: { shR: 45, elR: 0 }, b: { shR: -20, elR: 105, shAbR: 10 }, db: 'R', restL: true },
  fly: { base: { rootX: -55, hip: 55, knee: 90, sh: 90, el: 15, shAb: 0 }, a: { shH: 0 }, b: { shH: 78 }, ground: ['anL', 'anR'], incline: true, db: true, hammer: true },
  flyf: { base: { rootX: -90, hip: 8, knee: 92, neck: 0, sh: 90, el: 15, shAb: 0 }, a: { shH: 0 }, b: { shH: 80 }, ground: ['anL', 'anR'], bench: [.4, .45, 1.3, 0, -.45], db: true, hammer: true },
  pushd: { cam: [3.6, 1.5, 1.2], base: { spine: 12, hip: 8, knee: 8, neck: -6, sh: 6, shAb: 8 }, a: { el: 100 }, b: { el: 4 }, strap: [0, 1.95, .5], tower: [0, .62] },
  csrow: { base: { rootX: 55, hip: 50, knee: 15, neck: -10 }, a: { sh: 55, el: 0, shAb: 6 }, b: { sh: -15, el: 100, shAb: 18 }, db: true, incline: 'front' },
  benchc: { base: { rootX: -90, hip: 8, knee: 92, neck: 0 }, a: { sh: 90, el: 0, shAb: 0 }, b: { sh: 12, shAb: 5, el: 112 }, ground: ['anL', 'anR'], bench: [.4, .45, 1.3, 0, -.45], bar: 'hands' },
  curlinc: { pin: ['pelvis', [0, .55, 0]], fix: ['anL', 'anR'], base: { rootX: -55, hip: 35, knee: 90, shAb: 6, sh: -55 }, a: { el: 0 }, b: { el: 135 }, db: true, incline: 'back' },
  curlconc: { pin: ['pelvis', [0, .5, 0]], fix: ['anL', 'anR'], base: { rootX: 35, hip: 125, knee: 90, hipAb: 22, neck: -15, shL: 70, elL: 25, shAbL: 10, shR: 38, shAbR: -10 }, a: { elR: 0 }, b: { elR: 130 }, db: 'R', seat: true },
  hipth1: { pin: ['neck', 'auto'], fix: ['anL'], base: { sh: 20, shAb: 40, el: 70, hipR: 0, kneeR: 0 }, a: { rootX: -62, hipL: 52, kneeL: 100 }, b: { rootX: -90, hipL: 0, kneeL: 92 }, ground: ['anL', 'anR'], bench: [1.2, .42, .35, 0, -.62] },
  trxfp: { cam: [4.4, 1.5, 1], pin: ['anL', 'auto'], base: { hip: 0, knee: 0, neck: 10, shAb: 6, ankle: 10 }, anchor: [2.4, .9], Ls: 1.7, a: { reach: .53 }, b: { reach: .14 }, pinA: -60 },
  towel: { cam: [4.2, 1.3, .7], pin: ['anL', 'auto'], base: { hip: 0, knee: 0, neck: 10, shAb: 6, ankle: 10 }, anchor: [1.0, .95], Ls: .55, a: { reach: .53 }, b: { reach: .18 }, pinA: -50 },
  trxrow: { cam: [4.4, 1.5, 1], pin: ['anL', 'auto'], base: { hip: 0, knee: 0, neck: 10, shAb: 6, ankle: 10 }, anchor: [2.4, .9], Ls: 1.7, a: { reach: .53 }, b: { reach: .1 }, pinA: -60 },
  lungekb: { base: { sh: 15, el: 125, shAb: 22 }, a: {}, b: { hipL: 85, kneeL: 85, hipR: -25, kneeR: 95, ankleR: 40, spine: 3 }, ground: ['anL', 'knR'], kb: true },
  gorilla: { base: { hipAb: 16, rootX: 62, hip: 70, knee: 40, ankle: -10, neck: -20, sh: 62, el: 0 }, k: [{}, { shR: 0, elR: 100 }, {}, { shL: 0, elL: 100 }], db: true },
  sldl: { a: { rootX: 0, hip: 0, knee: 5, sh: 0, neck: 0 }, b: { rootX: 80, hipL: 80, kneeL: 15, hipR: 0, kneeR: 0, sh: 80, neck: -15 }, ground: ['anL'], db: true }
};
const SIDES = ['L', 'R'];
let FIX = null; // posiciones fijas (pies, manos) tomadas de la pose inicial
const qTmp = new T.Quaternion(), qHam = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2);
/* IK de 2 huesos en el plano de la pierna o del brazo: lleva el tobillo o la mano a un punto fijo */
function ikTo(j, tgt) {
  const B = W.B, k = j.slice(-1), leg = j.startsWith('an'), parent = leg ? B.pelvis : B.spine, joint = B[(leg ? 'hp' : 'sh') + k];
  const L1 = leg ? .42 : .28, L2 = leg ? .42 : .27, loc = parent.worldToLocal(tgt.clone()).sub(joint.position);
  const L = Math.min(Math.hypot(loc.z, loc.y), L1 + L2 - 1e-3), th = Math.atan2(loc.z, -loc.y);
  const q = Math.acos(Math.max(-1, Math.min(1, (L * L - L1 * L1 - L2 * L2) / (2 * L1 * L2)))), be = Math.atan2(L2 * Math.sin(q), L1 + L2 * Math.cos(q));
  if (leg) { joint.rotation.x = -(th + be); B['kn' + k].rotation.x = q; } else { joint.rotation.x = -(th - be); B['el' + k].rotation.x = -q; }
  joint.updateMatrixWorld(true);
}
// punto de agarre: fijo, o relativo a los pies (ex.rel) para que el cuerpo llegue
const anchorOf = ex => { const A = new T.Vector3(0, ex.anchor[0], ex.anchor[1]); return ex.rel && FIX?.pin ? A.add(new T.Vector3(0, FIX.pin.y, FIX.pin.z)) : A; };
function seg(m, a, b) { const mid = a.clone().add(b).multiplyScalar(.5), len = a.distanceTo(b); m.position.copy(mid); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()); m.visible = true; }
function apply(p, ex) {
  const { root, B, bag } = W;
  root.rotation.set((p.rootX || 0) * d, 0, (p.rootZ || 0) * d);
  B.spine.rotation.set((p.spine || 0) * d, 0, 0); B.neck.rotation.set((p.neck || 0) * d, 0, 0);
  const g = (k, s) => p[k + s] ?? p[k] ?? 0;
  for (const k of SIDES) {
    const s = k === 'L' ? 1 : -1;
    B['hp' + k].rotation.set(-g('hip', k) * d, 0, g('hipAb', k) * d * s); B['kn' + k].rotation.set(g('knee', k) * d, 0, 0); B['an' + k].rotation.set(g('ankle', k) * d, 0, 0);
    const hz = p['shH' + k] ?? p.shH; // shH: abrir el brazo en horizontal (aperturas) girando todo el brazo como un bloque, sin rotar la muñeca
    if (hz != null) B['sh' + k].rotation.set(-g('sh', k) * d, hz * d * s * HSIGN, g('shAb', k) * d * s, 'YXZ'); else B['sh' + k].rotation.set(-g('sh', k) * d, 0, g('shAb', k) * d * s, 'XYZ'); B['el' + k].rotation.set(-g('el', k) * d, 0, 0);
  }
  root.position.set(0, 0, 0); root.updateMatrixWorld(true);
  let mn = 1e9; const v = new T.Vector3();
  const hang = ex.pull || ex.dip || ex.pin;
  if (ex.pin) { const [j, at] = ex.pin, tgt = at === 'p' ? new T.Vector3(p.px || 0, p.py || 0, p.pz || 0) : at === 'auto' ? (FIX?.pin || new T.Vector3()).clone() : new T.Vector3(...at); B[j].getWorldPosition(v); root.position.add(tgt.sub(v)); root.updateMatrixWorld(true); }
  else if (hang) { let mx = -1e9; for (const e of ['hdL', 'hdR']) { B[e].getWorldPosition(v); mx = Math.max(mx, v.y); } root.position.y = hang - mx + (ex.dip ? .03 : -.02); root.updateMatrixWorld(true); }
  else for (const e of ex.ground || ['anL', 'anR']) { B[e].getWorldPosition(v); mn = Math.min(mn, v.y); }
  if (!hang) root.position.y = -mn + (ex.lift ?? .06) + (ex.toes ? Math.sin(Math.abs(p.ankle || 0) * d) * .17 : 0);
  root.position.y += (p.dy || 0);
  root.updateMatrixWorld(true);
  if (ex.anchor && FIX?.pin) { // colgado de un punto fijo (barra, TRX, toalla): los pies hacen de bisagra y el cuerpo gira hacia el agarre
    const A = anchorOf(ex), reach = p.reach ?? .53, want = (ex.Ls || 0) + reach, pj = ex.pin[0];
    const place = rx => { root.rotation.x = rx; root.position.set(0, 0, 0); root.updateMatrixWorld(true); B[pj].getWorldPosition(v); root.position.add(FIX.pin.clone().sub(v)); root.updateMatrixWorld(true);
      const s1 = new T.Vector3(), s2 = new T.Vector3(); B.shL.getWorldPosition(s1); B.shR.getWorldPosition(s2); return s1.add(s2).multiplyScalar(.5).distanceTo(A); };
    let lo = -88 * d, hi = (ex.rxMax ?? -4) * d;
    for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (place(mid) > want) lo = mid; else hi = mid; }
    place((lo + hi) / 2);
    for (const k of SIDES) { const sp = new T.Vector3(); B['sh' + k].getWorldPosition(sp); const tgt = sp.clone().add(new T.Vector3(sp.x, A.y, A.z).sub(sp).normalize().multiplyScalar(reach)); ikTo('hd' + k, tgt); }
  }
  if (FIX) for (const j of ex.fix || []) if (FIX[j]) ikTo(j, FIX[j]);
  if (ex.flat) { const qr = new T.Quaternion(), qp = new T.Quaternion(); root.getWorldQuaternion(qr); for (const j of ex.flat) { B[j].parent.getWorldQuaternion(qp); B[j].quaternion.copy(qp.invert().multiply(qr)); B[j].updateMatrixWorld(true); } } // pie plano: ni punta ni talón se levantan
  if (ex.anchor && ex.Ls) { const A = anchorOf(ex); W.straps.forEach((m, i) => { const h = new T.Vector3(); B[i ? 'hdR' : 'hdL'].getWorldPosition(h); seg(m, h, new T.Vector3(h.x * .3, A.y, A.z)); }); }
  else if (ex.strap) { const A = new T.Vector3(...ex.strap); W.straps.forEach((m, i) => { const h = new T.Vector3(); B[i ? 'hdR' : 'hdL'].getWorldPosition(h); seg(m, h, A); }); } else W.straps.forEach(m => { m.visible = false; });
  if (ex.bag) {
    const a = new T.Vector3(), b = new T.Vector3();
    if (ex.bag === 'chest') { B.spine.getWorldPosition(a); bag.position.set(a.x, a.y + .3, a.z + .2); bag.rotation.set(root.rotation.x, 0, 0); }
    else if (ex.bag === 'back') { B.spine.getWorldPosition(a); bag.position.set(a.x, a.y + .3, a.z - .2); bag.rotation.set(root.rotation.x, 0, 0); }
    else if (ex.bag === 'hdR') { B.hdR.getWorldPosition(a); bag.position.copy(a); bag.position.y -= .12; bag.rotation.set(0, 0, 0); }
    else { B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); bag.position.copy(a.add(b).multiplyScalar(.5)); bag.position.y -= .12; bag.rotation.set(0, 0, 0); }
    bag.visible = true;
  } else bag.visible = false;
  const { bar, dbs } = W, a = new T.Vector3(), b = new T.Vector3();
  bar.visible = !!ex.bar; dbs[0].visible = !!ex.db; dbs[1].visible = ex.db === true; W.kb.visible = !!ex.kb;
  if (ex.db === 'R') { B.hdR.getWorldPosition(a); dbs[0].position.copy(a); dbs[0].rotation.set(0, 0, 0); }
  if (ex.kb || ex.db === 'one') { B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); const mid = ex.kb === 'R' ? b.clone() : a.clone().add(b).multiplyScalar(.5); if (ex.kb) W.kb.position.copy(mid); else { dbs[0].position.copy(mid); dbs[0].rotation.set(0, 0, ex.dbRot ? Math.PI / 2 : 0); } }
  if (ex.bar === 'hands') { B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); bar.position.copy(a.add(b).multiplyScalar(.5)); }
  if (ex.bar === 'back') { B.neck.getWorldPosition(a); const f = new T.Vector3(0, -.02, -.12).applyEuler(root.rotation); bar.position.copy(a.add(f)); }
  if (ex.bar === 'hips') { B.pelvis.getWorldPosition(a); bar.position.set(a.x, a.y + .14, a.z); }
  if (ex.db === true) { B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); dbs[0].position.copy(a); dbs[1].position.copy(b); dbs[0].rotation.set(0, 0, 0); }
  if (ex.hammer) dbs.forEach((x, i) => { B[i ? 'elR' : 'elL'].getWorldQuaternion(qTmp); x.quaternion.copy(qTmp).multiply(qHam); }); // agarre neutro: la pesa gira con el antebrazo
  else dbs.forEach(x => { if (!ex.db || ex.db === true) x.quaternion.identity(); });
}
function props(ex, pA) {
  const { prop, B } = W; prop.clear();
  const m = new T.MeshStandardMaterial({ color: 0x334155, roughness: .8 });
  const box = (w, h, dd, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, dd), m); b.position.set(x, y, z); b.receiveShadow = true; prop.add(b); };
  if (ex.wall) box(1.4, 1.8, .06, 0, .9, -.32);
  if (ex.chair) box(.5, .45, .45, 0, .225, ex.chair);
  if (ex.step) box(.6, .2, .4, .1, .1, .12);
  if (ex.bench) { const [w, h, dd, x, z] = ex.bench; box(w, h, dd, x, h / 2, z); }
  if (ex.pull) { const pb = new T.Mesh(new T.CylinderGeometry(.02, .02, 1.4, 16), new T.MeshStandardMaterial({ color: 0x9ca3af, metalness: .8, roughness: .3 })); pb.rotation.z = Math.PI / 2; pb.position.set(0, ex.pull, 0); prop.add(pb); for (const x of [-.7, .7]) box(.06, ex.pull + .05, .06, x, (ex.pull + .05) / 2, 0); }
  if (ex.dip) { apply(pA, ex); const a = new T.Vector3(); for (const h of ['hdL', 'hdR']) { B[h].getWorldPosition(a); const pb = new T.Mesh(new T.CylinderGeometry(.022, .022, 1.1, 16), new T.MeshStandardMaterial({ color: 0x9ca3af, metalness: .8, roughness: .3 })); pb.rotation.x = Math.PI / 2; pb.position.set(a.x, ex.dip, a.z); prop.add(pb); for (const z of [-.5, .5]) box(.05, ex.dip, .05, a.x, ex.dip / 2, a.z + z); } }
  if (ex.seat) { apply(pA, ex); const a = new T.Vector3(); B.pelvis.getWorldPosition(a); box(.45, a.y - .1, .45, a.x, (a.y - .1) / 2, a.z - .05); }
  if (ex.restL) { apply(pA, ex); const a = new T.Vector3(); B.hdL.getWorldPosition(a); box(.4, a.y - .04, .45, a.x, (a.y - .04) / 2, a.z); }
  if (ex.fixBar && FIX?.hdL) { const pb = new T.Mesh(new T.CylinderGeometry(.02, .02, 1.2, 16), new T.MeshStandardMaterial({ color: 0x9ca3af, metalness: .8, roughness: .3 })); pb.rotation.z = Math.PI / 2; pb.position.copy(FIX.hdL.clone().add(FIX.hdR).multiplyScalar(.5)); pb.position.y += .02; prop.add(pb); for (const x of [-.6, .6]) box(.05, pb.position.y, .05, x, pb.position.y / 2, pb.position.z); }
  if (ex.anchor) { const AP = anchorOf(ex); if (ex.Ls) { const ank = new T.Mesh(new T.SphereGeometry(.045, 12, 10), m); ank.position.copy(AP); prop.add(ank); } else { const pb = new T.Mesh(new T.CylinderGeometry(.02, .02, 1.2, 16), new T.MeshStandardMaterial({ color: 0x9ca3af, metalness: .8, roughness: .3 })); pb.rotation.z = Math.PI / 2; pb.position.copy(AP); prop.add(pb); box(1.2, .04, .7, 0, AP.y + .04, AP.z - .25); for (const x of [-.55, .55]) box(.05, AP.y, .05, x, AP.y / 2, AP.z); } }
  if (ex.tower) { const [tx, tz] = ex.tower; box(.14, 2.15, .14, tx, 1.075, tz); box(.5, .06, .14, tx, 2.03, (tz + (ex.strap?.[2] ?? tz)) / 2); }
  if (ex.strap) { const ank = new T.Mesh(new T.SphereGeometry(.04, 12, 10), m); ank.position.set(...ex.strap); prop.add(ank); }
  if (ex.incline) { apply(pA, ex); const a = new T.Vector3(), b = new T.Vector3(); B.pelvis.getWorldPosition(a); B.neck.getWorldPosition(b); const mid = a.clone().add(b).multiplyScalar(.5), dir = b.clone().sub(a), len = dir.length() + .25;
    const bk = new T.Mesh(new T.BoxGeometry(.4, len, .08), m); bk.position.copy(mid).add(new T.Vector3(0, 0, ex.incline === 'front' ? .15 : -.13).applyAxisAngle(new T.Vector3(1, 0, 0), Math.atan2(dir.z, dir.y))); bk.rotation.x = Math.atan2(dir.z, dir.y); prop.add(bk);
    if (ex.incline !== 'front') box(.4, a.y - .1, .45, 0, (a.y - .1) / 2, a.z + .1); }
  if (ex.foot) { apply(pA, ex); const a = new T.Vector3(); B[ex.foot].getWorldPosition(a); box(.45, a.y - .02, .4, a.x, (a.y - .02) / 2, a.z - .05); }
  if (ex.hands) { // mesa o pared donde apoyan las manos (sale de la pose inicial)
    apply(pA, ex); const a = new T.Vector3(), b = new T.Vector3(); B.hdL.getWorldPosition(a); B.hdR.getWorldPosition(b); const hz = (a.z + b.z) / 2, hy = (a.y + b.y) / 2 - .05;
    if (ex.hands === 'wall') { box(.8, 1.7, .05, 0, .85, hz + .06); prop.children.at(-1).material = new T.MeshStandardMaterial({ color: 0x334155, roughness: .8, transparent: true, opacity: .55 }); }
    else if (ex.hands === 'chair') box(.45, hy, .4, ex.hx || 0, hy / 2, hz);
    else box(.9, hy, .55, 0, hy / 2, hz + .15);
  }
}
export function mount(el, id, lv = 1) {
  const [pid, eq] = String(id).split(':'), base = P[pid];
  let ex = base;
  if (base && eq) { // el material sale del nombre del ejercicio: barra, mancuernas, kettlebell o nada
    const hold = base.bar === 'hands' || base.db === true || base.kb;
    ex = { ...base, bar: undefined, db: undefined, kb: undefined, bag: undefined };
    if (eq === 'bar') ex.bar = base.bar === 'back' || base.bar === 'hips' ? base.bar : hold ? 'hands' : base.bar;
    if (eq === 'db') ex.db = base.bar === 'back' || base.db === 'one' ? 'one' : true;
    if (eq === 'kb') ex.kb = base.kb === 'R' || base.db === 'R' ? 'R' : true;
    if (eq === 'db' && base.db === 'R') ex.db = 'R';
    if (eq === 'db' && base.dbRot) ex.dbRot = true;
  }
  id = pid; if (!ex) { el.innerHTML = '<span class="text-mute text-sm">Animación en preparación. Mira el vídeo.</span>'; return; }
  stop();
  if (!R) { R = new T.WebGLRenderer({ antialias: true, alpha: true }); R.shadowMap.enabled = true; }
  if (!W) W = build();
  cv = R.domElement; el.innerHTML = ''; el.appendChild(cv);
  const w = el.clientWidth || 320, h = el.clientHeight || 260; R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(w, h);
  const cam = new T.PerspectiveCamera(38, w / h, .1, 50);
  const K = ex.k || [ex.a, ex.b];
  const keys = [...new Set(K.flatMap(o => Object.keys(o)))];
  const pick = (o, k) => o[k] ?? (/[LR]$/.test(k) ? o[k.slice(0, -1)] : undefined);
  const mix = (A, Bp, e) => { const p = { ...(ex.base || {}) }; for (const k of keys) { const a = pick(A, k) ?? pick(ex.base || {}, k) ?? 0, b = pick(Bp, k) ?? pick(ex.base || {}, k) ?? 0; p[k] = a + (b - a) * e; } return p; };
  const poseAt = e => mix(K[0], K[1], e);
  const seqAt = t => { const n = K.length, x = t * n, i = Math.floor(x) % n, f = x - Math.floor(x), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; return mix(K[i], K[(i + 1) % n], e); };
  FIX = null;
  if (ex.fix || ex.pin?.[1] === 'auto') { // posiciones fijas tomadas de la pose inicial
    const save = ex.pin; if (ex.pin?.[1] === 'auto') ex.pin = null;
    apply(ex.pinA != null ? { ...poseAt(0), rootX: ex.pinA } : poseAt(0), ex); ex.pin = save; FIX = {};
    for (const j of [...(ex.fix || []), ...(ex.pin?.[1] === 'auto' ? [ex.pin[0]] : [])]) { const v = new T.Vector3(); W.B[j].getWorldPosition(v); FIX[j] = v; }
    if (ex.pin?.[1] === 'auto') FIX.pin = FIX[ex.pin[0]];
  }
  props(ex, poseAt(0));
  const per = { pull: 3, hipth: 2.6, lat: 2.4, curl: 2.2, curlh: 2.2, burpee: 4.5, plank: 4, hollow: 3.5, gorilla: 4.4, swing: 1.8, fly: 4, flyf: 4, pushd: 3.2 }[id] || 2.8;
  const t0 = performance.now();
  const frame = now => {
    if (!cv.isConnected) { stop(); return; }
    const t = window.__man3dT ?? ((((now - t0) / (per * 1000)) % 1) + 1) % 1, e = (1 - Math.cos(t * Math.PI * 2)) / 2;
    apply(ex.k ? seqAt(t) : poseAt(e), ex);
    const ang = (window.__man3dA ?? (.9 + Math.sin(now / 5000) * .35)) + (ex.ang || 0);
    const [cd, cy, ly] = ex.cam || [3.6, 1.5, .65]; cam.position.set(Math.sin(ang) * cd, cy, Math.cos(ang) * cd); cam.lookAt(0, ly, 0);
    R.render(W.S, cam); raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}
export function stop() { cancelAnimationFrame(raf); raf = 0; }
