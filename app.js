'use strict';
/* =========================================================================
   FITNESTEBAN · PWA
   Datos: localStorage (solo en este móvil). Sin fotos guardadas.
   ========================================================================= */

const APP_VERSION = '4.7.0';
const STORE_KEY = 'fitnesteban_v4';
const OLD_KEY = 'fitnesteban_v3';
const DEFAULT_MODEL = 'gemini-3-flash-preview';
const MEAL_TYPES = ['Desayuno', 'Comida', 'Puente', 'Cena', 'Otro'];
const DEFAULT_HABITS = [
  'Finisher bici estática: 15 min continuo / HIIT',
  'Puente proteico (19:30): batido / yogur / pavo',
  'Pacto 0,0: cero alcohol hoy entre semana'
];

/* ---------- Plan por defecto (tu Push / Pull / Torso) ---------- */
const mkEx = (id, block, sets, minReps, maxReps, increment, rest, variants) => ({
  id, block, sets, minReps, maxReps, increment, rest,
  variants: variants.map(([name, note]) => ({ name, note: note || '' }))
});

const PPT_DAYS = [
    {
      id: 'day1', label: 'PUSH', rotation: true,
      title: 'Día 1 · Push + peaje de cuádriceps',
      subtitle: 'Pierna pesada al inicio + pecho, hombro y tríceps',
      exercises: [
        mkEx('d1_goblet', '🔥 Peaje quema-grasa (pierna)', 4, 10, 12, 2, 90, [['Sentadilla goblet al pecho', 'Pega la mancuerna al esternón.'], ['Sentadilla búlgara', 'Reps por pierna.']]),
        mkEx('d1_bench', '💪 Push principal', 4, 8, 10, 2, 120, [['Press de banca con mancuernas', 'Bajada controlada en 2 s.'], ['Press de banca con barra', 'Retrae escápulas.']]),
        mkEx('d1_incline', '💪 Push superior', 3, 10, 12, 2, 90, [['Press inclinado con mancuernas', 'Banco a 30º.'], ['Fondos en paralelas', 'Torso inclinado.']]),
        mkEx('d1_shoulder', '🎯 Hombro fuerza', 3, 8, 12, 2, 90, [['Press militar sentado', 'Rango completo.'], ['Press militar de pie', 'Core firme.']]),
        mkEx('d1_lat', '⚡ Superserie estética', 3, 12, 15, 1, 60, [['Elevaciones laterales con mancuernas', 'Amplitud en V.']]),
        mkEx('d1_triceps', '⚡ Superserie tríceps & core', 3, 10, 15, 1, 60, [['Extensión de tríceps TRX + rueda', 'Anota repeticiones de tríceps.']])
      ]
    },
    {
      id: 'day2', label: 'PULL', rotation: true,
      title: 'Día 2 · Pull + peaje cadena posterior',
      subtitle: 'Isquios y kettlebell al inicio + espalda en V y bíceps',
      exercises: [
        mkEx('d2_rdl', '🔥 Peaje isquios / glúteo', 4, 8, 12, 2.5, 120, [['Peso muerto rumano', 'Cadera atrás, espalda neutra.']]),
        mkEx('d2_swings', '🔥 Pareja metabólica', 4, 15, 20, 2, 60, [['Kettlebell swings', 'Golpe explosivo de cadera.']]),
        mkEx('d2_pullup', '🦅 Espalda amplitud', 4, 6, 10, 2, 120, [['Dominadas en barra', 'Pecho a la barra. 0 kg = peso corporal.']]),
        mkEx('d2_row', '🦅 Espalda densidad', 3, 10, 12, 2, 90, [['Remo a una mano con mancuerna', 'Codo hacia la cadera.']]),
        mkEx('d2_rear', '🎯 Hombro posterior', 3, 12, 15, 1, 60, [['Face pull / apertura TRX', 'Deltoides posterior.']]),
        mkEx('d2_biceps', '💪 Bombeo bíceps', 3, 10, 12, 1, 60, [['Curl con barra + curl martillo', 'Sin balancear.']])
      ]
    },
    {
      id: 'day3', label: 'TORSO', rotation: true,
      title: 'Día 3 · Torso completo + circuito espartano',
      subtitle: 'Superseries pecho/espalda + pierna y core camuflados',
      exercises: [
        mkEx('d3_ss1_push', '⚡ Superserie A1', 4, 8, 12, 2, 45, [['Press inclinado con mancuernas', 'Alterna con A2.']]),
        mkEx('d3_ss1_pull', '⚡ Superserie A2', 4, 8, 10, 2, 90, [['Dominadas supinas', 'Agarre cerrado. 0 kg = peso corporal.']]),
        mkEx('d3_ss2_push', '⚡ Superserie B1', 3, 10, 12, 2, 45, [['Fondos en paralelas', 'Baja profundo.']]),
        mkEx('d3_ss2_pull', '⚡ Superserie B2', 3, 10, 12, 2, 90, [['Remo con 2 mancuernas', 'Aprieta escápulas.']]),
        mkEx('d3_arms', '💥 Superserie brazos', 3, 12, 15, 1, 60, [['Elevaciones + bíceps + tríceps', 'Giant set sin descanso.']]),
        mkEx('d3_spartan', '🛡️ Circuito espartano', 3, 10, 12, 2, 90, [['Zancadas con kettlebells + granjero + rueda', 'A tope de intensidad.']])
      ]
    }
];

const FREE_DAYS = [
    {
      id: 'free', label: 'FREE', rotation: false,
      title: 'Día free · Entreno libre',
      subtitle: 'Añade tus ejercicios y entrena a tu aire',
      exercises: []
    }
];

const FULLBODY_DAYS = [
  {
    id: 'fb_a', label: 'FB A', rotation: true,
    title: 'Full Body A',
    subtitle: 'Sentadilla, banca y remo pesados + accesorios',
    exercises: [
      mkEx('fa_squat', '🏋️ Pierna principal', 4, 6, 8, 2.5, 150, [['Sentadilla trasera', 'Profundidad paralela o más, core apretado.']]),
      mkEx('fa_bench', '💪 Empuje principal', 4, 6, 8, 2.5, 150, [['Press de banca', 'Escápulas retraídas, pies firmes.']]),
      mkEx('fa_row', '🦅 Tirón principal', 4, 8, 10, 2.5, 120, [['Remo con barra', 'Torso a ~45º, barra al ombligo.']]),
      mkEx('fa_legcurl', '🔥 Isquios', 3, 8, 10, 2.5, 90, [['Curl femoral acostado', 'Bajada lenta en 3 s.']]),
      mkEx('fa_ohp', '🎯 Hombro', 3, 8, 10, 2.5, 120, [['Press militar de pie', 'Glúteos y abdomen apretados.']]),
      mkEx('fa_lat', '⚡ Accesorio hombro', 3, 12, 15, 1, 60, [['Elevaciones laterales', 'Sin impulso, codos ligeramente flexionados.']]),
      mkEx('fa_curl', '💪 Brazos', 3, 10, 12, 2, 60, [['Curl de bíceps con barra', 'Codos pegados, sin balanceo.']]),
      mkEx('fa_hammer', '💪 Brazos', 3, 10, 12, 1, 60, [['Curl martillo', 'Agarre neutro.']])
    ]
  },
  {
    id: 'fb_b', label: 'FB B', rotation: true,
    title: 'Full Body B',
    subtitle: 'Peso muerto, dominadas e inclinado + accesorios',
    exercises: [
      mkEx('fb_deadlift', '🏋️ Bisagra principal', 4, 6, 10, 2.5, 180, [['Peso muerto', 'Espalda neutra, empuja el suelo.']]),
      mkEx('fb_pullup', '🦅 Tirón vertical', 3, 6, 10, 2, 120, [['Dominadas pronas', '0 kg = peso corporal.']]),
      mkEx('fb_incline', '💪 Empuje superior', 4, 8, 10, 2, 120, [['Press inclinado con mancuernas', 'Banco a 30º.']]),
      mkEx('fb_squat', '🔥 Pierna', 3, 10, 12, 2, 90, [['Sentadilla con peso', 'Goblet, mancuernas o barra.']]),
      mkEx('fb_hipthrust', '🍑 Glúteo', 3, 8, 12, 5, 90, [['Hip thrust', 'Pausa de 1 s arriba.']]),
      mkEx('fb_face', '🎯 Hombro posterior', 3, 15, 20, 1, 60, [['Face pull / TRX', 'Codos altos, abre al final.']]),
      mkEx('fb_triceps', '💪 Brazos', 3, 10, 12, 2.5, 60, [['Extensión de tríceps en polea', 'Codos fijos.']]),
      mkEx('fb_calf', '🦵 Gemelos', 4, 10, 15, 2, 60, [['Elevación de gemelos de pie', 'Pausa abajo y arriba.']])
    ]
  }
];

const DEFAULT_PLAN = {
  active: 'ppt',
  programs: [
    { id: 'ppt', name: 'PPT', days: PPT_DAYS },
    { id: 'fullbody', name: 'FULL BODY', days: FULLBODY_DAYS },
    { id: 'free', name: 'FREE', days: FREE_DAYS },
    { id: 'cardio', name: 'CARDIO', icon: '🔥', type: 'cardio', days: [] }
  ]
};

/* Cardio: METs orientativos (Compendium of Physical Activities) por intensidad percibida */
const INTENSITIES = [['baja', 'Baja'], ['media-baja', 'Media-baja'], ['media', 'Media'], ['media-alta', 'Media-alta'], ['alta', 'Alta']];
const CARDIO_TYPES = {
  bike: {
    label: 'Bicicleta', icon: '🚴',
    met: { baja: 3.5, 'media-baja': 4.8, media: 6.8, 'media-alta': 8.8, alta: 11 },
    hint: { baja: 'Pedaleo suave, hablas sin esfuerzo', 'media-baja': 'Algo de esfuerzo, conversación fácil', media: 'Respiras fuerte, frases cortas', 'media-alta': 'Cuesta hablar, sudas bastante', alta: 'Casi sin poder hablar / HIIT' }
  },
  walk: {
    label: 'Caminata', icon: '🚶',
    met: { baja: 2.8, 'media-baja': 3, media: 3.5, 'media-alta': 4.3, alta: 5 },
    hint: { baja: 'Paseo tranquilo (~3 km/h)', 'media-baja': 'Paseo normal (~4 km/h)', media: 'Paso ligero (~5 km/h)', 'media-alta': 'Paso rápido (~5,5 km/h)', alta: 'Muy rápido o con cuestas (~6,5 km/h)' }
  }
};

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const uid = (p = 'x') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());
const parseISO = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const fmtDate = iso => { const d = parseISO(iso); return `${DOW[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fmtDateShort = iso => { const d = parseISO(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const num = v => { if (v === null || v === undefined || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
const r2 = n => Math.round(n * 100) / 100;
const roundStep = (n, step) => (step > 0 ? r2(Math.round(n / step) * step) : r2(n));
const fmtNum = n => String(r2(n)).replace('.', ',');
const fmtKg = w => `${fmtNum(w)} kg`;
const e1rm = (w, r) => (w > 0 && r > 0 ? w * (1 + Math.min(r, 15) / 30) : 0);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

/* ---------- Estado ---------- */
function defaultSettings() {
  return { targetKcal: 1620, targetProt: 180, targetCarbs: 90, targetFat: 60, apiKey: '', model: DEFAULT_MODEL, habits: [...DEFAULT_HABITS], lastBackup: null, eatBackCardio: false, pinHash: '', lastSeenVersion: '', driveConnected: false, driveEmail: '', driveFolderId: '', autoDrive: true, lastDriveBackup: null };
}
function defaultState() {
  return { version: 4, plan: clone(DEFAULT_PLAN), selectedVariants: {}, memory: {}, sessions: [], bodyMetrics: [], meals: {}, cardio: [], reports: [], deload: null, deloadSnooze: '', settings: defaultSettings(), drafts: {} };
}
const safeUrl = u => { const t = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(t) ? t : ''; };
const videoUrl = v => v.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(v.name + ' técnica correcta')}`;

function normalizeExercise(e) {
  const out = {
    id: e.id || uid('c_'), block: e.block || 'Ejercicio',
    sets: clamp(parseInt(e.sets, 10) || 3, 1, 10),
    minReps: clamp(parseInt(e.minReps, 10) || 8, 1, 100),
    maxReps: clamp(parseInt(e.maxReps, 10) || 12, 1, 100),
    increment: num(e.increment) ?? 2,
    rest: clamp(parseInt(e.rest, 10) || 90, 10, 600),
    variants: Array.isArray(e.variants) && e.variants.length ? e.variants.map(v => ({ name: String(v.name || 'Ejercicio'), note: String(v.note || ''), video: safeUrl(v.video) })) : [{ name: 'Ejercicio', note: '', video: '' }]
  };
  if (out.maxReps < out.minReps) out.maxReps = out.minReps;
  return out;
}
function normalizeDay(day) {
  return {
    id: day.id || uid('d_'), label: String(day.label || 'DÍA').slice(0, 10), rotation: day.rotation !== false,
    title: day.title || day.label || 'Día', subtitle: day.subtitle || '',
    exercises: (day.exercises || []).map(normalizeExercise)
  };
}
function normalizePlan(plan) {
  let programs;
  if (plan && Array.isArray(plan.programs) && plan.programs.length) programs = plan.programs;
  else if (plan && Array.isArray(plan.days) && plan.days.length) {
    // plan antiguo (solo días): pasa a ser el bloque PPT y se añade FULL BODY
    programs = [{ id: 'ppt', name: 'PPT', days: plan.days }, ...clone(DEFAULT_PLAN.programs.filter(p => p.id !== 'ppt' && p.id !== 'free'))];
  } else programs = clone(DEFAULT_PLAN.programs);
  // FREE va como bloque propio, no dentro de PPT
  if (!programs.some(p => p.id === 'free')) {
    let freeDay = null;
    programs = programs.map(p => {
      const fd = (p.days || []).find(d => d.id === 'free');
      if (fd) freeDay = fd;
      return fd ? { ...p, days: p.days.filter(d => d.id !== 'free') } : p;
    });
    programs.push({ id: 'free', name: 'FREE', days: [freeDay || clone(FREE_DAYS[0])] });
  }
  if (!programs.some(p => p.type === 'cardio')) programs.push(clone(DEFAULT_PLAN.programs.find(p => p.type === 'cardio')));
  programs = programs.map(p => ({
    id: p.id || uid('p_'), name: String(p.name || 'BLOQUE').slice(0, 16), icon: p.icon || '',
    type: p.type === 'cardio' ? 'cardio' : 'strength',
    days: p.type === 'cardio' ? [] : (p.days || []).map(normalizeDay)
  }));
  for (const p of programs) if (p.type !== 'cardio' && !p.days.length) p.days.push(normalizeDay({ label: 'DÍA 1', title: 'Día 1' }));
  const active = programs.some(p => p.id === plan?.active) ? plan.active : programs[0].id;
  return { active, programs };
}
function normalize(s) {
  const d = defaultState();
  const out = { ...d, ...s };
  out.settings = { ...d.settings, ...(s.settings || {}) };
  if (!Array.isArray(out.settings.habits)) out.settings.habits = [...DEFAULT_HABITS];
  out.plan = normalizePlan(out.plan);
  for (const k of ['selectedVariants', 'memory', 'meals', 'drafts']) if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {};
  for (const k of ['sessions', 'bodyMetrics', 'cardio', 'reports']) if (!Array.isArray(out[k])) out[k] = [];
  out.version = 4;
  return out;
}

/* Migración desde tu versión anterior (fitnesteban_v3) */
function v3DateToISO(s) {
  if (!s) return todayISO();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const p = String(s).split('/').map(x => parseInt(x, 10));
  if (p.length === 3 && p.every(Number.isFinite)) return toISO(new Date(p[2], p[1] - 1, p[0]));
  if (p.length === 2 && p.every(Number.isFinite)) {
    const now = new Date();
    let d = new Date(now.getFullYear(), p[1] - 1, p[0]);
    if (d > now) d = new Date(now.getFullYear() - 1, p[1] - 1, p[0]);
    return toISO(d);
  }
  return todayISO();
}
const normName = n => String(n || '').toLowerCase().replace(/\(.*?\)/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const cleanSets = sets => (sets || []).map(x => ({ w: num(x.w) ?? 0, r: Math.round(num(x.r) ?? 0) }));

function migrateV3(old) {
  const st = defaultState();
  if (old.settings) for (const k of ['targetKcal', 'targetProt', 'targetCarbs', 'targetFat']) if (num(old.settings[k])) st.settings[k] = num(old.settings[k]);
  const idMap = {};
  const custom = old.customExercises || {};
  for (const dayKey of Object.keys(custom)) {
    const day = st.plan.programs.flatMap(p => p.days).find(d => d.id === dayKey);
    if (!day) continue;
    (custom[dayKey] || []).forEach((c, i) => {
      const nid = uid('c_');
      idMap[`custom_${dayKey}_${i}`] = nid;
      day.exercises.push(normalizeExercise({ id: nid, block: '⚡ Personalizado', sets: c.setsCount || 3, minReps: 8, maxReps: 12, increment: 2, rest: 90, variants: [{ name: c.name }] }));
    });
  }
  for (const [k, v] of Object.entries(old.selectedVariants || {})) st.selectedVariants[idMap[k] || k] = v;
  const mapKey = k => { const m = k.match(/^(.*)_v(\d+)$/); return m ? `${idMap[m[1]] || m[1]}_v${m[2]}` : k; };
  for (const [k, v] of Object.entries(old.exerciseMemory || {})) st.memory[mapKey(k)] = { date: v3DateToISO(v.date), sets: cleanSets(v.sets) };

  const nameMap = {};
  st.plan.programs.flatMap(p => p.days).forEach(d => d.exercises.forEach(e => e.variants.forEach((v, i) => {
    const k = `${d.id}|${normName(v.name)}`;
    if (!nameMap[k]) nameMap[k] = { exId: e.id, exKey: `${e.id}_v${i}` };
  })));
  // nombres antiguos que cambiaron ligeramente
  const alias = { 'sentadilla goblet al pecho': 'd1_goblet_v0' };
  st.sessions = (old.sessions || []).map(s => ({
    id: uid('s_'), date: v3DateToISO(s.date), dayId: s.dayKey, dayTitle: s.dayTitle || '',
    habits: [s.cardioDone && DEFAULT_HABITS[0], s.bridgeDone && DEFAULT_HABITS[1], s.beerZeroDone && DEFAULT_HABITS[2]].filter(Boolean),
    exercises: (s.exercises || []).map(e => {
      const n = normName(e.name);
      const hit = nameMap[`${s.dayKey}|${n}`] || (alias[n] ? { exId: alias[n].replace(/_v\d+$/, ''), exKey: alias[n] } : null);
      return { exId: hit?.exId || null, exKey: hit?.exKey || null, name: e.name, sets: cleanSets(e.sets) };
    })
  }));
  st.bodyMetrics = (old.bodyMetrics || []).map(m => ({ id: uid('m_'), date: v3DateToISO(m.date), weight: num(m.weight), waist: num(m.waist) }))
    .filter(m => m.weight !== null || m.waist !== null);
  for (const [date, arr] of Object.entries(old.meals || {})) {
    st.meals[v3DateToISO(date)] = (arr || []).map(m => ({
      id: String(m.id || uid('f_')), type: m.mealType || 'Comida', desc: m.desc || '',
      kcal: num(m.kcal) || 0, prot: num(m.prot) || 0, carbs: num(m.carbs) || 0, fat: num(m.fat) || 0
    }));
  }
  return normalize(st);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) { const m = migrateV3(JSON.parse(old)); m._migrated = true; return m; }
  } catch (e) { console.error(e); }
  return defaultState();
}

let state = loadState();
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch (e) { toast('No se pudo guardar en el móvil: ' + e.message, 'error'); return false; }
}
function persistSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350); }
if (state._migrated) { delete state._migrated; persist(); }

/* ---------- Estado de interfaz ---------- */
const ui = {
  view: 'train',
  dayId: null,
  dietDate: todayISO(),
  mealType: guessMealType(),
  mealDesc: '',
  img: null,
  aiBusy: false,
  aiResult: null,
  progEx: null,
  showKey: false,
  aiOpen: false,
  blocksOpen: false,
  editing: null,
  reportBusy: false,
  driveBusy: false,
  mealSearch: '',
  cardio: { type: 'bike', minutes: '', intensity: 'media', date: todayISO(), weight: '', est: null, busy: false }
};
function guessMealType() {
  const h = new Date().getHours();
  if (h < 11) return 'Desayuno';
  if (h < 17) return 'Comida';
  if (h < 20) return 'Puente';
  return 'Cena';
}

/* ---------- Toasts y modales ---------- */
function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = msg;
  $('#toastRoot').appendChild(el);
  setTimeout(() => el.classList.add('toast-out'), 2600);
  setTimeout(() => el.remove(), 3000);
}
let modalHandlers = {};
function openModal(html, handlers = {}) {
  modalHandlers = handlers;
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-back" data-close></div><div class="modal-sheet" role="dialog" aria-modal="true">${html}</div>`;
  root.classList.add('open');
  document.body.classList.add('overflow-hidden');
  const first = root.querySelector('input,textarea');
  if (first && handlers.autofocus) first.focus();
}
function closeModal() {
  const root = $('#modalRoot');
  root.innerHTML = '';
  root.classList.remove('open');
  document.body.classList.remove('overflow-hidden');
  modalHandlers = {};
}
$('#modalRoot').addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return closeModal();
  const b = e.target.closest('[data-mact]');
  if (b && modalHandlers[b.dataset.mact]) modalHandlers[b.dataset.mact]($('#modalRoot'), b);
});
const mval = (root, name) => root.querySelector(`[name="${name}"]`)?.value ?? '';

/* =========================================================================
   COACH: doble progresión
   ========================================================================= */
function sortedSessions() {
  return state.sessions.map((s, i) => ({ s, i })).sort((a, b) => (a.s.date < b.s.date ? -1 : a.s.date > b.s.date ? 1 : a.i - b.i)).map(x => x.s);
}
function exHistory(exKey) {
  const h = [];
  for (const s of sortedSessions()) for (const e of s.exercises) {
    if (s.deload) continue; // las semanas de descarga no cuentan para la progresión
    if (e.exKey === exKey && e.sets.some(x => x.r > 0)) h.push({ date: s.date, sets: e.sets });
  }
  if (!h.length && state.memory[exKey]?.sets?.some(x => x.r > 0)) h.push(state.memory[exKey]);
  return h;
}
const topOf = sets => { const v = sets.filter(s => s.r > 0); if (!v.length) return null; const t = Math.max(...v.map(s => s.w || 0)); return { t, valid: v, work: v.filter(s => (s.w || 0) === t) }; };

function coach(e, exKey) {
  const { minReps: min, maxReps: max, increment: inc, sets: n } = e;
  const fill = v => Array.from({ length: n }, () => v);
  const hist = exHistory(exKey);
  const lastTop = hist.length ? topOf(hist[hist.length - 1].sets) : null;
  if (!lastTop) {
    return { tone: 'new', title: 'Sesión de calibración', text: `Busca un peso con el que hagas ${min}–${max} reps dejando 1–2 en recámara. A partir de la próxima te digo qué peso poner.`, weight: null, targets: fill(`${min}-${max}`), last: '' };
  }
  const last = hist[hist.length - 1];
  const { t: topW, valid, work } = lastTop;
  const bw = topW === 0;
  const lastStr = valid.map(s => `${fmtNum(s.w || 0)}×${s.r}`).join(' · ');
  const gap = daysBetween(last.date, todayISO());
  const deloadW = Math.max(inc || 1, roundStep(topW * 0.9, inc || 0.5));

  if (gap >= 14 && !bw) {
    return { tone: 'break', title: `Vuelta tras ${gap} días`, text: `Hace ${gap} días que no lo haces. Empieza con ${fmtKg(deloadW)} (−10 %) y recupera sensaciones antes de apretar.`, weight: deloadW, targets: fill(min), last: lastStr };
  }
  const allTop = work.length >= Math.min(n, valid.length) && work.every(s => s.r >= max);
  if (allTop) {
    if (bw) return { tone: 'up', title: 'Tope de reps alcanzado', text: `${max}+ reps en todas las series con tu peso. Añade ${fmtKg(inc)} de lastre o pasa a una variante más dura.`, weight: inc, targets: fill(min), last: lastStr };
    const w = r2(topW + inc);
    return { tone: 'up', title: `Sube a ${fmtKg(w)}`, text: `Hiciste ${max} reps en todas las series con ${fmtKg(topW)}. Toca subir: ${fmtKg(w)} y objetivo ${min} reps.`, weight: w, targets: fill(min), last: lastStr };
  }
  const below = work.some(s => s.r < min);
  if (below && !bw && hist.length > 1) {
    const p = topOf(hist[hist.length - 2].sets);
    if (p && p.t === topW && p.work.some(s => s.r < min)) {
      return { tone: 'down', title: `Baja a ${fmtKg(deloadW)}`, text: `Dos sesiones seguidas sin llegar a ${min} reps con ${fmtKg(topW)}. Descarga un 10 %, reps limpias y vuelve a subir.`, weight: deloadW, targets: fill(max), last: lastStr };
    }
  }
  if (hist.length >= 3) {
    const l3 = hist.slice(-3).map(h => topOf(h.sets));
    if (l3.every(x => x && x.t === topW)) {
      const reps = l3.map(x => x.work.reduce((a, s) => a + s.r, 0));
      if (reps[2] <= reps[0]) {
        return bw
          ? { tone: 'stall', title: 'Estancado: 3 sesiones igual', text: 'Tres sesiones sin sumar reps. Cambia de variante o ponlo antes en la sesión, cuando estés fresco.', weight: 0, targets: fill(min), last: lastStr }
          : { tone: 'stall', title: 'Estancado: 3 sesiones igual', text: `Tres sesiones con ${fmtKg(topW)} sin sumar reps. Baja a ${fmtKg(deloadW)} y reconstruye, o cambia de variante.`, weight: deloadW, targets: fill(max), last: lastStr };
      }
    }
  }
  const targets = Array.from({ length: n }, (_, i) => (work[i] ? Math.min(max, work[i].r + 1) : min));
  const wTxt = bw ? 'peso corporal' : fmtKg(topW);
  if (below) {
    return { tone: 'hold', title: `Repite ${wTxt}`, text: `Alguna serie quedó por debajo de ${min} reps. Mismo peso y busca ${min} en todas; si vuelve a pasar, bajamos.`, weight: topW, targets, last: lastStr };
  }
  return { tone: 'hold', title: `Mantén ${wTxt}`, text: `Objetivo hoy: +1 rep por serie (${targets.join(' / ')}). Cuando llegues a ${max} en todas, subimos ${fmtKg(inc)}.`, weight: topW, targets, last: lastStr };
}

const TONE = {
  new: { icon: '🧭', cls: 'coach-new' }, up: { icon: '⬆️', cls: 'coach-up' }, hold: { icon: '🎯', cls: 'coach-hold' },
  down: { icon: '⬇️', cls: 'coach-down' }, stall: { icon: '⚠️', cls: 'coach-stall' }, break: { icon: '🔁', cls: 'coach-break' }
};

function bestE1rm(exKey, sessions = state.sessions) {
  let best = 0;
  for (const s of sessions) for (const e of s.exercises) if (e.exKey === exKey) for (const x of e.sets) best = Math.max(best, e1rm(x.w, x.r));
  return best;
}

/* =========================================================================
   ENTRENO
   ========================================================================= */
function prog() {
  return state.plan.programs.find(p => p.id === state.plan.active) || state.plan.programs[0];
}
function allDays() { return state.plan.programs.flatMap(p => p.days); }
function programOfDay(dayId) { return state.plan.programs.find(p => p.days.some(d => d.id === dayId)); }
function currentDay() {
  return prog().days.find(d => d.id === ui.dayId) || prog().days[0];
}
function variantOf(e) {
  const v = clamp(state.selectedVariants[e.id] || 0, 0, e.variants.length - 1);
  return { v, key: `${e.id}_v${v}`, variant: e.variants[v] };
}
function draftOf(dayId) {
  if (!state.drafts[dayId]) state.drafts[dayId] = { sets: {}, counts: {}, done: {}, habits: {} };
  if (!state.drafts[dayId].open) state.drafts[dayId].open = {};
  return state.drafts[dayId];
}
function draftHasData(dayId) {
  const d = state.drafts[dayId];
  if (!d) return false;
  return Object.values(d.sets || {}).some(arr => (arr || []).some(c => c && (c.r !== undefined && c.r !== '')));
}
function setCount(e, key, d) { return d.counts[key] ?? (deloadActive() ? Math.max(1, Math.ceil(e.sets / 2)) : e.sets); }
function coachFor(e, key) { const c = coach(e, key); return deloadActive() ? deloadCoach(c, e, key) : c; }
function cellValue(d, key, i, field, c) {
  const v = d.sets[key]?.[i]?.[field];
  if (v !== undefined) return v;
  if (field === 'w' && c.weight !== null && c.weight !== undefined) return fmtNum(c.weight);
  return '';
}
function nextDayId() {
  if (!prog().days.length) return null;
  const rot = prog().days.filter(d => d.rotation && d.exercises.length);
  if (!rot.length) return prog().days[0].id;
  const ss = sortedSessions();
  for (let i = ss.length - 1; i >= 0; i--) {
    const idx = rot.findIndex(d => d.id === ss[i].dayId);
    if (idx >= 0) {
      if (ss[i].date === todayISO()) return rot[idx].id;
      return rot[(idx + 1) % rot.length].id;
    }
  }
  return rot[0].id;
}

function progLabel(p) { return `${p.icon ? p.icon + ' ' : ''}${esc(p.name)}`; }
function renderProgHeader() {
  const progRow = state.plan.programs.map(p => `<button class="prog ${p.id === prog().id ? 'prog-on' : ''}" data-act="pickProg" data-prog="${esc(p.id)}" type="button">${progLabel(p)}</button>`).join('')
    + `<button class="prog prog-add" data-act="addProg" type="button" aria-label="Añadir bloque">＋ Bloque</button>`;
  return `<div class="flex items-center gap-2 -mx-4 px-4 mb-2.5">
    <div class="chips-row flex-1">${progRow}</div>
    <button class="iconbtn iconbtn-sm shrink-0" data-act="editProg" type="button" aria-label="Editar bloque">✎</button>
  </div>`;
}

function renderTrain() {
  if (prog().type === 'cardio') return renderProgHeader() + renderCardio();
  const day = currentDay();
  const d = draftOf(day.id);
  const next = nextDayId();
  const today = todayISO();
  const lastSess = sortedSessions().filter(s => s.dayId === day.id).pop();

  const chips = prog().days.map(dd => {
    const doneToday = state.sessions.some(s => s.dayId === dd.id && s.date === today);
    return `<button class="chip ${dd.id === day.id ? 'chip-on' : ''}" data-act="pickDay" data-day="${esc(dd.id)}" type="button">
      ${esc(dd.label)}${doneToday ? ' ✓' : (dd.id === next ? ' <span class="dot"></span>' : '')}
    </button>`;
  }).join('') + `<button class="chip chip-add" data-act="addDay" type="button" aria-label="Añadir día">＋ Día</button>`;

  const exercises = day.exercises.map((e, idx) => renderExerciseCard(e, idx, day, d)).join('');

  const habits = state.settings.habits.map((h, i) => `
    <label class="habit">
      <input type="checkbox" data-habit="${i}" ${d.habits[h] ? 'checked' : ''} />
      <span>${esc(h)}</span>
    </label>`).join('');

  return `
  ${renderProgHeader()}
  ${renderDeloadCard()}
  <div class="chips-row -mx-4 px-4">${chips}</div>

  <section class="card p-4 mt-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="font-extrabold text-lg leading-tight">${esc(day.title)}</h2>
        ${day.subtitle ? `<p class="text-xs text-mute mt-1">${esc(day.subtitle)}</p>` : ''}
        <p class="text-[11px] mt-2 ${day.id === next ? 'text-brand font-semibold' : 'text-mute'}">
          ${day.id === next ? '● Te toca hoy según tu rotación · ' : ''}${lastSess ? `Última vez: ${fmtDate(lastSess.date)}` : 'Sin estrenar'}
        </p>
      </div>
      <button class="iconbtn" data-act="editDay" type="button" aria-label="Editar día">✎</button>
    </div>
    ${draftHasData(day.id) ? `<div class="mt-3 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 flex justify-between items-center gap-2">
      <span>Sesión en curso · se guarda sola mientras escribes</span>
      <button data-act="discardDraft" class="underline" type="button">Descartar</button></div>` : ''}
  </section>

  <div class="space-y-3 mt-3">
    ${exercises || `<div class="card p-6 text-center text-sm text-mute">Este día no tiene ejercicios todavía.</div>`}
  </div>

  <button class="btn-dashed w-full mt-3" data-act="addEx" type="button">＋ Añadir ejercicio a este día</button>

  ${state.settings.habits.length ? `<section class="card p-4 mt-4 space-y-2.5">
    <h3 class="section-title">🔥 Remate y hábitos</h3>
    ${habits}
  </section>` : ''}

  <button class="btn-save w-full mt-4" data-act="saveSession" type="button">Guardar sesión</button>
  `;
}

function renderExerciseCard(e, idx, day, d) {
  const { key, variant } = variantOf(e);
  const c = coachFor(e, key);
  const n = setCount(e, key, d);
  const tone = TONE[c.tone];
  const doneArr = d.done[key] || [];
  const isOpen = !!d.open?.[key];
  const doneCount = Array.from({ length: n }, (_, i) => !!doneArr[i]).filter(Boolean).length;
  const logged = Array.from({ length: n }, (_, i) => d.sets[key]?.[i]?.r).filter(r => r !== undefined && r !== '').length;
  const plan = c.weight !== null && c.weight !== undefined ? `${n} × ${c.weight ? fmtKg(c.weight) : 'peso corporal'}` : `${n} series`;
  let rows = '';
  for (let i = 0; i < n; i++) {
    const w = cellValue(d, key, i, 'w', c);
    const r = cellValue(d, key, i, 'r', c);
    const target = c.targets[i] ?? c.targets[c.targets.length - 1] ?? `${e.minReps}`;
    const done = !!doneArr[i];
    rows += `
      <div class="setrow ${done ? 'is-done' : ''}">
        <span class="w-7 text-xs font-bold text-mute">S${i + 1}</span>
        <div class="relative flex-1">
          <input class="field field-set" inputmode="decimal" autocomplete="off" data-in="w" data-key="${esc(key)}" data-i="${i}" value="${esc(w)}" placeholder="kg" aria-label="Peso serie ${i + 1}" />
          <span class="unit">kg</span>
        </div>
        <span class="text-mute text-xs">×</span>
        <div class="relative flex-1">
          <input class="field field-set text-brand" inputmode="numeric" autocomplete="off" data-in="r" data-key="${esc(key)}" data-i="${i}" value="${esc(r)}" placeholder="${esc(target)}" aria-label="Repeticiones serie ${i + 1}" />
          <span class="unit">reps</span>
        </div>
        <button class="checkbtn" data-act="doneSet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button" aria-label="Serie hecha">✓</button>
      </div>`;
  }
  return `
  <article class="card p-4" id="ex-${esc(e.id)}">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[11px] font-bold uppercase tracking-wider text-brand">${esc(e.block)}</div>
        <h3 class="font-extrabold text-[17px] leading-snug mt-0.5">${esc(variant.name)}</h3>
        <div class="text-[11px] text-mute mt-1">${e.sets} × ${e.minReps}–${e.maxReps} reps · descanso ${e.rest}s · +${fmtNum(e.increment)} kg</div>
      </div>
      <div class="flex gap-1.5 shrink-0">
        ${e.variants.length > 1 ? `<button class="iconbtn" data-act="variant" data-ex="${esc(e.id)}" type="button" aria-label="Cambiar variante">⇄</button>` : ''}
        <button class="iconbtn" data-act="editEx" data-ex="${esc(e.id)}" type="button" aria-label="Editar ejercicio">✎</button>
      </div>
    </div>
    <div class="flex items-center justify-between gap-3 mt-2">
      <p class="text-xs text-mute italic min-w-0">${esc(variant.note)}</p>
      <a class="btn-video" href="${esc(videoUrl(variant))}" target="_blank" rel="noopener noreferrer" aria-label="Ver técnica en YouTube">▶ Técnica${variant.video ? '' : ' 🔎'}</a>
    </div>
    <div class="coach ${tone.cls} mt-3">
      <div class="font-bold text-sm">${tone.icon} ${esc(c.title)}</div>
      <p class="text-xs mt-1 opacity-90 leading-relaxed">${esc(c.text)}</p>
      ${c.last ? `<p class="text-[11px] mt-1.5 opacity-70">Última vez: ${esc(c.last)}</p>` : ''}
    </div>
    <button class="sets-toggle ${isOpen ? 'sets-toggle-open' : ''} ${doneCount === n ? 'sets-toggle-done' : ''}" data-act="toggleSets" data-key="${esc(key)}" type="button" aria-expanded="${isOpen}">
      <span class="font-bold">${doneCount === n ? '✅' : '📝'} ${isOpen ? 'Ocultar series' : 'Registrar series'}</span>
      <span class="flex items-center gap-2 text-mute">${doneCount ? `${doneCount}/${n} hechas` : logged ? `${logged}/${n} apuntadas` : esc(plan)}<span class="tri"></span></span>
    </button>
    ${isOpen ? `<div class="mt-2 space-y-1.5">${rows}</div>
    <div class="flex items-center justify-between mt-3">
      <button class="btn-mini text-rose-300" data-act="setCount" data-key="${esc(key)}" data-ex="${esc(e.id)}" data-delta="-1" type="button">− Serie</button>
      <span class="text-[11px] text-mute">${n} ${n === 1 ? 'serie' : 'series'} hoy</span>
      <button class="btn-mini text-emerald-300" data-act="setCount" data-key="${esc(key)}" data-ex="${esc(e.id)}" data-delta="1" type="button">+ Serie</button>
    </div>` : ''}
  </article>`;
}

function keepCardioInputs() {
  const m = $('#cdMin'); if (m) ui.cardio.minutes = m.value;
  const d = $('#cdDate'); if (d) ui.cardio.date = d.value || todayISO();
  const w = $('#cdWeight'); if (w) ui.cardio.weight = w.value;
}

function findEx(exId) {
  for (const d of allDays()) { const i = d.exercises.findIndex(e => e.id === exId); if (i >= 0) return { day: d, ex: d.exercises[i], idx: i }; }
  return null;
}

function setDraftCell(key, i, field, value) {
  const d = draftOf(currentDay().id);
  if (!d.sets[key]) d.sets[key] = [];
  if (!d.sets[key][i]) d.sets[key][i] = {};
  d.sets[key][i][field] = value;
  persistSoon();
}

function markSetDone(exId, key, i) {
  const f = findEx(exId); if (!f) return;
  const day = currentDay();
  const d = draftOf(day.id);
  if (!d.done[key]) d.done[key] = [];
  const now = !d.done[key][i];
  d.done[key][i] = now;
  if (now) {
    const c = coachFor(f.ex, key);
    if (!d.sets[key]) d.sets[key] = [];
    if (!d.sets[key][i]) d.sets[key][i] = {};
    const cell = d.sets[key][i];
    if ((cell.r === undefined || cell.r === '') && typeof c.targets[i] === 'number') cell.r = String(c.targets[i]);
    if (cell.w === undefined && c.weight !== null) cell.w = fmtNum(c.weight);
    if (num(cell.r) > 0) startTimer(f.ex.rest);
    else toast('Apunta las repeticiones de la serie', 'warn');
  }
  persist();
  render();
}

function saveSession() {
  const day = currentDay();
  const d = draftOf(day.id);
  const today = todayISO();
  const exs = [];
  for (const e of day.exercises) {
    const { key, variant } = variantOf(e);
    const c = coachFor(e, key);
    const n = setCount(e, key, d);
    const sets = [];
    for (let i = 0; i < n; i++) {
      const r = num(cellValue(d, key, i, 'r', c));
      const w = num(cellValue(d, key, i, 'w', c));
      if (r && r > 0) sets.push({ w: w ?? 0, r: Math.round(r) });
    }
    if (sets.length) exs.push({ exId: e.id, exKey: key, name: variant.name, sets });
  }
  if (!exs.length) return toast('Apunta al menos una serie con repeticiones.', 'warn');

  const existingIdx = state.sessions.findIndex(s => s.date === today && s.dayId === day.id);
  if (existingIdx >= 0 && !confirm('Ya guardaste este día hoy. ¿Sustituir esa sesión por esta?')) return;
  const others = state.sessions.filter((_, i) => i !== existingIdx);

  const prs = [];
  let volume = 0, nSets = 0;
  for (const x of exs) {
    const prev = bestE1rm(x.exKey, others);
    const now = Math.max(...x.sets.map(s => e1rm(s.w, s.r)));
    if (prev > 0 && now > prev + 0.05) prs.push(`${x.name}: ${fmtNum(Math.round(now * 10) / 10)} kg de 1RM estimado`);
    for (const s of x.sets) { volume += s.w * s.r; nSets++; }
    state.memory[x.exKey] = { date: today, sets: x.sets };
  }
  const habits = state.settings.habits.filter(h => d.habits[h]);
  const session = { id: uid('s_'), date: today, dayId: day.id, dayTitle: day.title, habits, exercises: exs };
  if (deloadActive()) session.deload = true;
  state.sessions = others;
  state.sessions.push(session);
  delete state.drafts[day.id];
  if (!persist()) return;
  render();

  const nxt = prog().days.find(x => x.id === nextDayId());
  openModal(`
    <div class="text-center">
      <div class="text-4xl">💪</div>
      <h3 class="text-xl font-extrabold mt-2">Sesión guardada</h3>
      <p class="text-sm text-mute mt-1">${esc(day.title)}</p>
    </div>
    <div class="grid grid-cols-3 gap-2 mt-4 text-center">
      <div class="stat"><div class="stat-v">${exs.length}</div><div class="stat-l">ejercicios</div></div>
      <div class="stat"><div class="stat-v">${nSets}</div><div class="stat-l">series</div></div>
      <div class="stat"><div class="stat-v">${Math.round(volume).toLocaleString('es-ES')}</div><div class="stat-l">kg volumen</div></div>
    </div>
    ${prs.length ? `<div class="coach coach-up mt-4"><div class="font-bold text-sm">🏆 Récords personales</div>${prs.map(p => `<p class="text-xs mt-1">${esc(p)}</p>`).join('')}</div>` : ''}
    ${habits.length ? `<p class="text-xs text-mute mt-3">Hábitos cumplidos: ${habits.length}/${state.settings.habits.length}</p>` : ''}
    ${nxt ? `<p class="text-xs text-mute mt-1">Próxima sesión: <strong class="text-white">${esc(nxt.label)}</strong></p>` : ''}
    <button class="btn-primary w-full mt-5" data-close type="button">Hecho</button>
  `);
}

/* --- Editor de días y ejercicios --- */
function editDayModal(dayId) {
  const isNew = !dayId;
  const day = isNew ? { label: '', title: '', subtitle: '', rotation: true } : allDays().find(d => d.id === dayId);
  openModal(`
    <h3 class="modal-title">${isNew ? 'Nuevo día' : 'Editar día'}</h3>
    <label class="lbl">Nombre corto (pestaña)<input class="field mt-1" name="label" maxlength="10" value="${esc(day.label)}" placeholder="PIERNA" /></label>
    <label class="lbl">Título<input class="field mt-1" name="title" value="${esc(day.title)}" placeholder="Día 4 · Pierna completa" /></label>
    <label class="lbl">Descripción<input class="field mt-1" name="subtitle" value="${esc(day.subtitle)}" placeholder="Opcional" /></label>
    <label class="habit mt-1"><input type="checkbox" name="rotation" ${day.rotation ? 'checked' : ''} /><span>Incluir en la rotación (el coach te dice qué día toca)</span></label>
    <div class="flex gap-2 mt-5">
      ${!isNew ? `<button class="btn-ghost" data-mact="left" type="button" aria-label="Mover a la izquierda">◀</button><button class="btn-ghost" data-mact="right" type="button" aria-label="Mover a la derecha">▶</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew && programOfDay(dayId).days.length > 1 ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Eliminar este día</button>` : ''}
    ${!isNew ? `<p class="text-[11px] text-mute mt-3">Eliminar un día no borra el historial de sesiones ya guardadas.</p>` : ''}
  `, {
    autofocus: isNew,
    save: root => {
      const label = mval(root, 'label').trim().toUpperCase();
      if (!label) return toast('Ponle un nombre corto', 'warn');
      const data = { label, title: mval(root, 'title').trim() || label, subtitle: mval(root, 'subtitle').trim(), rotation: root.querySelector('[name="rotation"]').checked };
      if (isNew) {
        const nd = { id: uid('d_'), ...data, exercises: [] };
        prog().days.push(nd);
        ui.dayId = nd.id;
      } else Object.assign(day, data);
      persist(); closeModal(); render();
    },
    left: () => moveDay(dayId, -1),
    right: () => moveDay(dayId, 1),
    del: () => {
      if (!confirm(`¿Eliminar el día "${day.label}" y sus ejercicios del plan?`)) return;
      const pr = programOfDay(dayId);
      pr.days = pr.days.filter(d => d.id !== dayId);
      delete state.drafts[dayId];
      ui.dayId = prog().days[0].id;
      persist(); closeModal(); render();
    }
  });
}
function editProgModal(progId) {
  const isNew = !progId;
  const p = isNew ? { name: '' } : state.plan.programs.find(x => x.id === progId);
  openModal(`
    <h3 class="modal-title">${isNew ? 'Nuevo bloque' : 'Editar bloque'}</h3>
    <label class="lbl">Nombre del bloque<input class="field mt-1" name="name" maxlength="16" value="${esc(p.name)}" placeholder="TORSO-PIERNA" /></label>
    ${!isNew && p.type === 'cardio' ? '<p class="text-[11px] text-mute">Bloque de cardio: registra bicicleta y caminata. Se puede renombrar, no eliminar.</p>' : isNew ? '<p class="text-[11px] text-mute">Se crea con un día vacío. Añade días con «＋ Día» y ejercicios con «＋ Añadir ejercicio».</p>' : `<p class="text-[11px] text-mute">${p.days.length} días: ${esc(p.days.map(d => d.label).join(' · '))}</p>`}
    <div class="flex gap-2 mt-4">
      ${!isNew ? `<button class="btn-ghost" data-mact="left" type="button" aria-label="Mover a la izquierda">◀</button><button class="btn-ghost" data-mact="right" type="button" aria-label="Mover a la derecha">▶</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew && p.type !== 'cardio' && state.plan.programs.length > 1 ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Eliminar este bloque</button><p class="text-[11px] text-mute mt-2">Eliminar un bloque no borra el historial de sesiones ya guardadas.</p>` : ''}
  `, {
    autofocus: isNew,
    save: root => {
      const name = mval(root, 'name').trim().toUpperCase();
      if (!name) return toast('Ponle un nombre al bloque', 'warn');
      if (isNew) {
        const np = { id: uid('p_'), name, days: [normalizeDay({ id: uid('d_'), label: 'DÍA 1', title: `${name} · Día 1` })] };
        state.plan.programs.push(np);
        state.plan.active = np.id;
        ui.dayId = np.days[0].id;
      } else p.name = name;
      persist(); closeModal(); render();
    },
    left: () => moveProg(progId, -1),
    right: () => moveProg(progId, 1),
    del: () => {
      if (!confirm(`¿Eliminar el bloque "${p.name}" con todos sus días y ejercicios?`)) return;
      for (const d of p.days) delete state.drafts[d.id];
      state.plan.programs = state.plan.programs.filter(x => x.id !== progId);
      if (state.plan.active === progId) state.plan.active = state.plan.programs[0].id;
      ui.dayId = nextDayId();
      persist(); closeModal(); render();
    }
  });
}
function moveProg(progId, dir) {
  const arr = state.plan.programs; const i = arr.findIndex(p => p.id === progId); const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  persist(); render(); toast('Orden cambiado');
}

function moveDay(dayId, dir) {
  const arr = programOfDay(dayId).days; const i = arr.findIndex(d => d.id === dayId); const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  persist(); render(); toast('Orden cambiado');
}

function editExModal(exId) {
  const isNew = !exId;
  const day = currentDay();
  const f = isNew ? null : findEx(exId);
  const e = isNew ? { block: '⚡ Personalizado', sets: 3, minReps: 8, maxReps: 12, increment: 2, rest: 90, variants: [] } : f.ex;
  const variantsTxt = e.variants.map(v => [v.name, v.note, v.video].filter((x, i) => i === 0 || x).join(' | ')).join('\n');
  openModal(`
    <h3 class="modal-title">${isNew ? 'Nuevo ejercicio' : 'Editar ejercicio'}</h3>
    <label class="lbl">Variantes (una por línea · <span class="text-mute">Nombre | nota | enlace de YouTube</span>)
      <textarea class="field mt-1" name="variants" rows="3" placeholder="Curl femoral con mancuerna | Bajada lenta | https://youtu.be/…">${esc(variantsTxt)}</textarea>
    </label>
    <p class="text-[11px] text-mute -mt-1">Nota y enlace son opcionales. Sin enlace, «▶ Técnica 🔎» abre una búsqueda en YouTube del ejercicio. El historial va ligado a la posición de cada variante: añade las nuevas al final.</p>
    <label class="lbl">Bloque / etiqueta<input class="field mt-1" name="block" value="${esc(e.block)}" /></label>
    <div class="grid grid-cols-3 gap-2">
      <label class="lbl">Series<input class="field mt-1" name="sets" inputmode="numeric" value="${e.sets}" /></label>
      <label class="lbl">Reps mín<input class="field mt-1" name="minReps" inputmode="numeric" value="${e.minReps}" /></label>
      <label class="lbl">Reps máx<input class="field mt-1" name="maxReps" inputmode="numeric" value="${e.maxReps}" /></label>
      <label class="lbl">Subida (kg)<input class="field mt-1" name="increment" inputmode="decimal" value="${fmtNum(e.increment)}" /></label>
      <label class="lbl col-span-2">Descanso (seg)<input class="field mt-1" name="rest" inputmode="numeric" value="${e.rest}" /></label>
    </div>
    <p class="text-[11px] text-mute">El coach sube el peso cuando haces las reps máximas en todas las series, y baja un 10 % si fallas el mínimo dos sesiones seguidas.</p>
    <div class="flex gap-2 mt-4">
      ${!isNew ? `<button class="btn-ghost" data-mact="up" type="button" aria-label="Subir">▲</button><button class="btn-ghost" data-mact="down" type="button" aria-label="Bajar">▼</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Quitar del día</button>` : ''}
  `, {
    autofocus: isNew,
    save: root => {
      const variants = mval(root, 'variants').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const [name, ...rest] = l.split('|').map(x => x.trim());
        const video = rest.find(x => /^https?:\/\//i.test(x)) || '';
        return { name, note: rest.filter(x => x !== video).join(' | '), video: safeUrl(video.replace(/^http:/i, 'https:')) };
      });
      if (!variants.length) return toast('Escribe al menos el nombre del ejercicio', 'warn');
      const minReps = parseInt(mval(root, 'minReps'), 10), maxReps = parseInt(mval(root, 'maxReps'), 10);
      if (!(minReps > 0) || !(maxReps >= minReps)) return toast('Revisa el rango de reps (mín ≤ máx)', 'warn');
      const data = normalizeExercise({
        id: isNew ? uid('c_') : e.id, block: mval(root, 'block').trim() || 'Ejercicio', variants,
        sets: mval(root, 'sets'), minReps, maxReps, increment: num(mval(root, 'increment')) ?? 2, rest: mval(root, 'rest')
      });
      if (isNew) day.exercises.push(data); else f.day.exercises[f.idx] = data;
      persist(); closeModal(); render();
      if (isNew) setTimeout(() => document.getElementById(`ex-${data.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    },
    up: () => moveEx(exId, -1),
    down: () => moveEx(exId, 1),
    del: () => {
      if (!confirm(`¿Quitar "${e.variants[0].name}" de este día? El historial guardado se conserva.`)) return;
      f.day.exercises.splice(f.idx, 1);
      persist(); closeModal(); render();
    }
  });
}
function moveEx(exId, dir) {
  const f = findEx(exId); if (!f) return;
  const arr = f.day.exercises; const j = f.idx + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[f.idx], arr[j]] = [arr[j], arr[f.idx]];
  persist(); closeModal(); render();
  document.getElementById(`ex-${exId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* =========================================================================
   TENDENCIA DE PESO · RÉCORDS · DESCARGA · RESUMEN SEMANAL
   ========================================================================= */
/* Media móvil de 7 días por fecha de pesaje */
function trendSeries(points) {
  return points.map(p => {
    const from = addDays(p.x, -6);
    const win = points.filter(q => q.x >= from && q.x <= p.x);
    return { x: p.x, y: Math.round(win.reduce((a, q) => a + q.y, 0) / win.length * 10) / 10 };
  });
}
function trendAt(trend, date) { let v = null; for (const t of trend) if (t.x <= date) v = t; return v; }
function weightTrend() {
  const pts = [...state.bodyMetrics].filter(m => m.weight !== null).sort((a, b) => (a.date < b.date ? -1 : 1)).map(m => ({ x: m.date, y: m.weight }));
  const trend = trendSeries(pts);
  if (pts.length < 3 || daysBetween(pts[0].x, pts[pts.length - 1].x) < 7) return { pts, trend, ready: false };
  const last = trend[trend.length - 1];
  const prev = trendAt(trend, addDays(last.x, -7));
  const days = Math.max(1, daysBetween(prev.x, last.x));
  const kgWeek = (last.y - prev.y) / days * 7;
  const pctWeek = kgWeek / prev.y * 100;
  // 3 semanas: peso y cintura
  const old3 = trendAt(trend, addDays(last.x, -21));
  const waist = [...state.bodyMetrics].filter(m => m.waist !== null).sort((a, b) => (a.date < b.date ? -1 : 1));
  const wLast = waist[waist.length - 1], wOld = [...waist].reverse().find(m => m.date <= addDays(last.x, -21));
  const waistChange3 = wLast && wOld ? r2(wLast.waist - wOld.waist) : null;
  const flat3 = old3 && daysBetween(old3.x, last.x) >= 18 ? Math.abs((last.y - old3.y) / old3.y * 100) < 0.3 : false;
  let tone = 'ok', msg;
  if (pctWeek < -1) { tone = 'warn'; msg = `Bajas ${fmtNum(Math.abs(r2(pctWeek)))} % por semana: demasiado rápido para recomposición, riesgo de perder músculo. Sube 100–150 kcal.`; }
  else if (pctWeek <= -0.25) msg = `Bajas ~${fmtNum(Math.abs(r2(kgWeek)))} kg/semana (${fmtNum(Math.abs(r2(pctWeek)))} %): ritmo adecuado para recomposición.`;
  else if (pctWeek <= 0.25) {
    if (flat3 && waistChange3 !== null && waistChange3 >= 0) { tone = 'warn'; msg = 'Peso y cintura estables 3 semanas: estancado. Revisa que registras todo y baja ~100 kcal o añade cardio suave.'; }
    else msg = waistChange3 !== null && waistChange3 < 0 ? `Peso estable y cintura −${fmtNum(Math.abs(waistChange3))} cm en 3 semanas: recomposición funcionando.` : 'Peso estable. En recomposición es normal si la cintura baja: vigílala.';
  } else { tone = 'warn'; msg = `Subes ~${fmtNum(r2(kgWeek))} kg/semana. Si la cintura también sube, baja 100–150 kcal.`; }
  return { pts, trend, ready: true, last, kgWeek, pctWeek, tone, msg, waistChange3 };
}

function personalRecords() {
  const map = new Map();
  for (const s of sortedSessions()) for (const e of s.exercises) {
    if (!e.exKey) continue;
    const r = map.get(e.exKey) || { name: e.name, bestW: -1, bestWReps: 0, bestWDate: '', best1: 0, best1Date: '', bestReps: 0, bestRepsDate: '', lastPR: '' };
    r.name = e.name;
    for (const x of e.sets) {
      if (!(x.r > 0)) continue;
      if (x.w > r.bestW || (x.w === r.bestW && x.r > r.bestWReps)) { r.bestW = x.w; r.bestWReps = x.r; r.bestWDate = s.date; r.lastPR = s.date; }
      const one = e1rm(x.w, x.r);
      if (one > r.best1 + 0.05) { r.best1 = one; r.best1Date = s.date; r.lastPR = s.date; }
      if (!x.w && x.r > r.bestReps) { r.bestReps = x.r; r.bestRepsDate = s.date; r.lastPR = s.date; }
    }
    map.set(e.exKey, r);
  }
  return [...map.values()].filter(r => r.bestW >= 0).sort((a, b) => (a.lastPR < b.lastPR ? 1 : -1));
}
function renderRecords() {
  const recs = personalRecords();
  if (!recs.length) return '';
  return `<details class="card p-4 mt-3" ${openAttr('records')}>
    <summary class="flex items-center justify-between cursor-pointer select-none"><h3 class="section-title">🏆 Récords personales</h3><span class="flex items-center gap-2 text-[11px] text-mute">${recs.length} ejercicios<span class="tri"></span></span></summary>
    <div class="space-y-1.5 mt-3">
      ${recs.map(r => `<div class="bg-ink rounded-xl border border-line px-3 py-2">
        <div class="flex items-center justify-between gap-2"><span class="text-sm font-bold truncate">${esc(r.name)}</span>${r.lastPR >= addDays(todayISO(), -7) ? '<span class="text-[10px] font-bold text-emerald-300 shrink-0">NUEVO</span>' : ''}</div>
        <div class="text-[11px] text-mute mt-0.5">${r.bestW > 0
          ? `Máx. <strong class="text-white">${fmtKg(r.bestW)} × ${r.bestWReps}</strong> (${fmtDateShort(r.bestWDate)}) · 1RM est. <strong class="text-brand">${fmtKg(Math.round(r.best1 * 10) / 10)}</strong> (${fmtDateShort(r.best1Date)})`
          : `Máx. <strong class="text-white">${r.bestReps} reps</strong> con peso corporal (${fmtDateShort(r.bestRepsDate)})`}</div>
      </div>`).join('')}
    </div>
  </details>`;
}

/* ---------- Semana de descarga ---------- */
const mondayOf = iso => addDays(iso, -((parseISO(iso).getDay() + 6) % 7));
function deloadActive() { const d = state.deload; const t = todayISO(); return !!(d && d.start <= t && t <= d.end); }
function deloadStatus() {
  if (deloadActive()) return { active: true, end: state.deload.end };
  const strength = sortedSessions().filter(s => !s.deload && s.exercises.length);
  const boundary = state.deload?.end || '';
  let weeks = 0;
  let wk = addDays(mondayOf(todayISO()), -7); // última semana completa
  while (weeks < 52) {
    if (boundary && addDays(wk, 6) <= boundary) break;
    const n = strength.filter(s => s.date >= wk && s.date <= addDays(wk, 6)).length;
    if (n < 3) break;
    weeks++; wk = addDays(wk, -7);
  }
  const since = addDays(todayISO(), -21);
  const recentKeys = new Set(strength.filter(s => s.date >= since).flatMap(s => s.exercises.map(e => e.exKey)));
  let signals = 0;
  for (const day of allDays()) for (const e of day.exercises) {
    const { key } = variantOf(e);
    if (!recentKeys.has(key)) continue;
    const t = coach(e, key).tone;
    if (t === 'stall' || t === 'down') signals++;
  }
  const snoozed = state.deloadSnooze && state.deloadSnooze > todayISO();
  const recommend = !snoozed && ((weeks >= 6 && signals >= 2) || weeks >= 8);
  return { active: false, recommend, weeks, signals };
}
function renderDeloadCard() {
  const s = deloadStatus();
  if (s.active) return `<div class="coach coach-break mb-3">
      <div class="font-bold text-sm">🔋 Semana de descarga · hasta el ${esc(fmtDate(s.end))}</div>
      <p class="text-xs mt-1 opacity-90 leading-relaxed">−10 % de peso, la mitad de series y deja 3 reps en recámara. Estas sesiones no cuentan para la progresión del coach.</p>
      <button class="underline text-xs mt-1.5" data-act="deloadEnd" type="button">Terminar la descarga</button>
    </div>`;
  if (!s.recommend) return '';
  return `<div class="coach coach-stall mb-3">
      <div class="font-bold text-sm">🔋 Te toca una semana de descarga</div>
      <p class="text-xs mt-1 opacity-90 leading-relaxed">Llevas ${s.weeks} semanas seguidas con 3 o más sesiones${s.signals ? ` y ${s.signals} ejercicios estancados o bajando` : ''}. Una semana suave ahora suele desbloquear la progresión.</p>
      <div class="grid grid-cols-2 gap-2 mt-2.5">
        <button class="btn-ghost py-2 text-xs" data-act="deloadSnooze" type="button">Ahora no</button>
        <button class="btn-primary py-2 text-xs" data-act="deloadStart" type="button">Empezar esta semana</button>
      </div>
    </div>`;
}
function deloadCoach(c, e, exKey) {
  if (c.tone === 'new') return c;
  const hist = exHistory(exKey);
  const top = hist.length ? topOf(hist[hist.length - 1].sets) : null;
  const topW = top ? top.t : 0;
  const w = topW > 0 ? Math.max(e.increment || 1, roundStep(topW * 0.9, e.increment || 0.5)) : 0;
  return { ...c, tone: 'break', title: topW > 0 ? `Descarga: ${fmtKg(w)}` : 'Descarga: peso corporal', text: `Semana de descarga: ${topW > 0 ? '−10 % de peso, ' : ''}la mitad de series y ${e.minReps} reps dejando 3 en recámara.`, weight: w, targets: Array.from({ length: e.sets }, () => e.minReps) };
}

/* ---------- Resumen semanal ---------- */
function weekData() {
  const to = todayISO(), from = addDays(to, -6);
  const inRange = d => d >= from && d <= to;
  const sess = sortedSessions().filter(s => inRange(s.date));
  const before = sortedSessions().filter(s => s.date < from);
  const up = [], flat = [];
  const keys = [...new Set(sess.flatMap(s => s.exercises.map(e => e.exKey)).filter(Boolean))];
  for (const k of keys) {
    const name = sess.flatMap(s => s.exercises).find(e => e.exKey === k).name;
    const now = Math.max(...sess.flatMap(s => s.exercises.filter(e => e.exKey === k).flatMap(e => e.sets.map(x => e1rm(x.w, x.r) || x.r))));
    const prev = Math.max(0, ...before.flatMap(s => s.exercises.filter(e => e.exKey === k).flatMap(e => e.sets.map(x => e1rm(x.w, x.r) || x.r))));
    if (!prev) continue;
    if (now > prev * 1.01) up.push(name); else if (now < prev * 0.97) flat.push(`${name} (bajó)`); else flat.push(name);
  }
  const stalled = [];
  for (const day of allDays()) for (const e of day.exercises) {
    const { key, variant } = variantOf(e);
    if (!keys.includes(key)) continue;
    const t = coach(e, key).tone;
    if (t === 'stall' || t === 'down') stalled.push(variant.name);
  }
  let kc = 0, pr = 0, nd = 0, protOk = 0;
  for (let i = 0; i < 7; i++) {
    const dt = addDays(to, -i);
    if (!mealsOf(dt).length) continue;
    const t = totalsOf(dt); kc += t.kcal; pr += t.prot; nd++;
    if (t.prot >= state.settings.targetProt * 0.9) protOk++;
  }
  const cardio = state.cardio.filter(c => inRange(c.date));
  const wt = weightTrend();
  const habits = sess.reduce((a, s) => a + (s.habits?.length || 0), 0);
  return {
    periodo: `${from} a ${to}`, objetivo: 'recomposición corporal',
    sesiones_fuerza: sess.length, dias_entrenados: [...new Set(sess.map(s => s.dayTitle))],
    ejercicios_que_suben: up, ejercicios_igual_o_bajan: flat, ejercicios_estancados_segun_coach: [...new Set(stalled)],
    dias_dieta_registrados: nd, kcal_media: nd ? Math.round(kc / nd) : null, objetivo_kcal: state.settings.targetKcal,
    proteina_media_g: nd ? Math.round(pr / nd) : null, objetivo_proteina_g: state.settings.targetProt, dias_proteina_cumplida: protOk,
    cardio_sesiones: cardio.length, cardio_minutos: cardio.reduce((a, c) => a + c.minutes, 0), cardio_kcal: cardio.reduce((a, c) => a + c.kcal, 0),
    peso_tendencia_kg: wt.ready ? wt.last.y : null, cambio_peso_kg_semana: wt.ready ? r2(wt.kgWeek) : null, cambio_cintura_cm_3_semanas: wt.ready ? wt.waistChange3 : null,
    habitos_cumplidos_en_sesiones: habits, semana_de_descarga: deloadActive()
  };
}
async function generateReport() {
  const data = weekData();
  const rep = { id: uid('r_'), date: todayISO(), data, ai: null };
  if (state.settings.apiKey && navigator.onLine) {
    ui.reportBusy = true; render();
    try {
      const prompt = `Eres entrenador personal y nutricionista deportivo. Analiza la última semana de un hombre adulto cuyo objetivo es la RECOMPOSICIÓN corporal (perder grasa manteniendo o ganando músculo).
Datos (JSON, null = sin datos): ${JSON.stringify(data)}
Reglas: básate SOLO en estos datos; si faltan datos importantes, dilo en "mejorar". Sé directo, concreto y breve, en español de España. Nada de frases motivacionales vacías.
Responde SOLO con JSON válido:
{"titular": "una frase con el balance de la semana", "bien": ["máx. 3 puntos"], "mejorar": ["máx. 3 puntos"], "acciones": ["exactamente 3 acciones concretas y medibles para la próxima semana"]}`;
      const r = parseJSONLoose(await callGemini([{ text: prompt }], { timeout: 45000 }));
      const arr = v => (Array.isArray(v) ? v : []).map(String).slice(0, 3);
      rep.ai = { titular: String(r.titular || ''), bien: arr(r.bien), mejorar: arr(r.mejorar), acciones: arr(r.acciones) };
    } catch (e) { toast('IA: ' + e.message + '. Guardo solo los datos.', 'warn'); }
    finally { ui.reportBusy = false; }
  } else toast(state.settings.apiKey ? 'Sin conexión: guardo solo los datos.' : 'Sin clave de IA: guardo solo los datos.', 'warn');
  state.reports = [rep, ...state.reports.filter(x => x.date !== rep.date)].slice(0, 12);
  openKeys.weekly = true; openKeys['rep_' + rep.id] = true;
  persist(); render();
}
/* Recuerda qué plegables abriste/cerraste para que no cambien al refrescar la pantalla */
const openKeys = {};
const openAttr = (key, def = false) => `data-open-key="${key}" ${(openKeys[key] ?? def) ? 'open' : ''}`;

function renderReport(r, open) {
  const d = r.data;
  const chips = [
    `🏋️ ${d.sesiones_fuerza} sesiones`, d.kcal_media !== null ? `🍽️ ${d.kcal_media} kcal/día` : null, d.proteina_media_g !== null ? `🥩 ${d.proteina_media_g} g prot` : null,
    d.cardio_minutos ? `🔥 ${d.cardio_minutos} min cardio` : null, d.cambio_peso_kg_semana !== null ? `⚖️ ${d.cambio_peso_kg_semana > 0 ? '+' : ''}${fmtNum(d.cambio_peso_kg_semana)} kg/sem` : null
  ].filter(Boolean);
  const list = (icon, arr) => arr?.length ? `<ul class="space-y-1 mt-1">${arr.map(x => `<li class="text-xs leading-relaxed">${icon} ${esc(x)}</li>`).join('')}</ul>` : '';
  return `<details class="bg-ink rounded-xl border border-line px-3 py-2.5" ${openAttr('rep_' + r.id, open)}>
    <summary class="flex items-center justify-between cursor-pointer gap-2"><span class="text-xs font-bold truncate">${esc(fmtDate(r.date))} · ${esc(r.ai?.titular || 'Resumen de datos')}</span><span class="tri"></span></summary>
    <div class="flex flex-wrap gap-1 mt-2">${chips.map(c => `<span class="text-[10px] bg-panel border border-line rounded-full px-2 py-0.5 text-slate-300">${c}</span>`).join('')}</div>
    ${r.ai ? `${list('✅', r.ai.bien)}${list('⚠️', r.ai.mejorar)}
      ${r.ai.acciones?.length ? `<div class="mt-2 text-[11px] font-bold text-brand uppercase tracking-wider">Próxima semana</div>${list('🎯', r.ai.acciones)}` : ''}`
      : `<p class="text-[11px] text-mute mt-2">${d.ejercicios_que_suben.length ? `Suben: ${esc(d.ejercicios_que_suben.join(', '))}. ` : ''}${d.ejercicios_estancados_segun_coach.length ? `Estancados: ${esc(d.ejercicios_estancados_segun_coach.join(', '))}.` : ''}</p>`}
  </details>`;
}
function renderWeeklyCard() {
  const last = state.reports[0];
  const isMonday = parseISO(todayISO()).getDay() === 1;
  const fresh = last && daysBetween(last.date, todayISO()) < 7;
  return `<details class="card p-4 mt-3 ${isMonday && !fresh ? 'border-brand/50' : ''}" ${openAttr('weekly', false)}>
    <summary class="flex items-center justify-between cursor-pointer select-none"><h3 class="section-title">🧠 Resumen semanal</h3>
      <span class="flex items-center gap-2 text-[11px] text-mute">${isMonday && !fresh ? '<span class="font-bold text-brand">NUEVO</span>' : last ? esc(fmtDateShort(last.date)) : ''}<span class="tri"></span></span></summary>
    <div class="space-y-2.5 mt-3">
    <p class="text-[11px] text-mute">Analiza los últimos 7 días: fuerza, dieta, cardio y tendencia de peso. Mejor cada lunes.</p>
    <button class="btn-primary w-full" data-act="report" type="button" ${ui.reportBusy ? 'disabled' : ''}>${ui.reportBusy ? '<span class="spinner"></span> Analizando la semana…' : last?.date === todayISO() ? '↻ Rehacer el resumen de hoy' : '🧠 Generar resumen de la semana'}</button>
    ${last ? renderReport(last, fresh) : ''}
    ${state.reports.length > 1 ? `<details class="text-xs" ${openAttr('repsOld')}><summary class="text-mute cursor-pointer flex items-center justify-between"><span>Anteriores (${state.reports.length - 1})</span><span class="tri"></span></summary>
      <div class="space-y-1.5 mt-2">${state.reports.slice(1).map(r => renderReport(r, false)).join('')}</div></details>` : ''}
    </div>
  </details>`;
}

/* =========================================================================
   CARDIO
   ========================================================================= */
function latestWeight() {
  const w = [...state.bodyMetrics].filter(m => m.weight !== null).sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
  return w ? w.weight : null;
}
function metKcal(type, intensity, minutes, kg) {
  const met = CARDIO_TYPES[type]?.met[intensity] ?? 3.5;
  return Math.max(0, Math.round((met - 1) * kg * minutes / 60)); // netas: descontado el gasto en reposo
}
function cardioOf(date) { return state.cardio.filter(c => c.date === date); }
function burnedOf(date) { return cardioOf(date).reduce((a, c) => a + (c.kcal || 0), 0); }

function renderCardio() {
  const c = ui.cardio;
  const T = CARDIO_TYPES[c.type];
  const w = latestWeight();
  const today = todayISO();
  const dayMin = cardioOf(c.date).reduce((a, x) => a + x.minutes, 0);
  const recent = [...state.cardio].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 12);
  const est = c.est;
  return `
  <section class="card p-4 mt-1 space-y-3">
    <h2 class="font-extrabold text-lg">🔥 Registrar cardio</h2>
    <label class="lbl">Fecha<input class="field mt-1 px-2" type="date" id="cdDate" value="${c.date}" max="${today}" /></label>
    <div class="grid grid-cols-2 gap-2">
      ${Object.entries(CARDIO_TYPES).map(([k, v]) => `<button class="cardio-type ${c.type === k ? 'cardio-type-on' : ''}" data-act="cdType" data-type="${k}" type="button"><span class="text-2xl">${v.icon}</span><span>${v.label}</span></button>`).join('')}
    </div>
    <label class="lbl">Minutos<input class="field mt-1 text-lg" id="cdMin" inputmode="numeric" value="${esc(c.minutes)}" placeholder="Ej: 30" /></label>
    <div>
      <div class="lbl mb-1.5">Intensidad</div>
      <div class="flex flex-wrap gap-1.5">${INTENSITIES.map(([k, l]) => `<button class="chip chip-sm ${c.intensity === k ? 'chip-on' : ''}" data-act="cdInt" data-int="${k}" type="button">${l}</button>`).join('')}</div>
      <p class="text-[11px] text-mute mt-2">${esc(T.hint[c.intensity])}</p>
    </div>
    ${w ? `<p class="text-[11px] text-mute">Se calcula con tu último peso registrado: <strong class="text-white">${fmtKg(w)}</strong>.</p>`
        : `<label class="lbl">Tu peso (kg)<input class="field mt-1" id="cdWeight" inputmode="decimal" value="${esc(c.weight)}" placeholder="Ej: 84" /></label>`}
    ${!est ? `<button class="btn-primary w-full" data-act="cdEstimate" type="button" ${c.busy ? 'disabled' : ''}>${c.busy ? '<span class="spinner"></span> Calculando…' : '⚡ Calcular calorías con IA'}</button>` : `
    <div class="border-t border-line pt-3 space-y-3">
      <div class="text-xs text-mute bg-ink rounded-xl p-2.5 border border-line leading-relaxed">${est.ai ? '🤖 ' : '📐 '}${esc(est.note)}</div>
      <label class="lbl text-amber-300">Calorías quemadas (netas)<input class="field mt-1 text-center text-xl font-black" id="cdKcal" inputmode="numeric" value="${est.kcal}" /></label>
      ${est.warn ? `<p class="text-[11px] text-amber-300">${esc(est.warn)}</p>` : ''}
      <div class="grid grid-cols-3 gap-2">
        <button class="btn-ghost" data-act="cdCancel" type="button">Cancelar</button>
        <button class="btn-primary col-span-2" data-act="cdSave" type="button">✅ Registrar</button>
      </div>
    </div>`}
  </section>

  <section class="card p-4 mt-3">
    <div class="flex items-center justify-between">
      <h3 class="section-title">${c.date === today ? 'Hoy' : esc(fmtDate(c.date))}</h3>
      <span class="text-xs text-mute">${dayMin} min · <strong class="text-amber-300">${burnedOf(c.date)} kcal</strong></span>
    </div>
    <p class="text-[11px] text-mute mt-1">Estas calorías aparecen también en la pestaña Dieta de ese día.</p>
    <div class="space-y-1.5 mt-3">
      ${recent.map(x => `<div class="meal">
        <span class="text-xl">${CARDIO_TYPES[x.type]?.icon || '🔥'}</span>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold">${esc(CARDIO_TYPES[x.type]?.label || 'Cardio')} · ${x.minutes} min · ${esc((INTENSITIES.find(i => i[0] === x.intensity) || ['', x.intensity])[1])}</div>
          <div class="text-[11px] text-mute">${esc(fmtDate(x.date))} · <span class="text-amber-300">${x.kcal} kcal</span>${x.ai ? ' · IA' : ''}</div>
        </div>
        <button class="iconbtn iconbtn-sm" data-act="cdDel" data-id="${esc(x.id)}" type="button" aria-label="Borrar">✕</button>
      </div>`).join('') || '<p class="text-sm text-mute">Aún no has registrado cardio.</p>'}
    </div>
  </section>`;
}

async function estimateCardio() {
  const c = ui.cardio;
  keepCardioInputs();
  const minutes = parseInt(c.minutes, 10);
  if (!(minutes > 0 && minutes <= 600)) return toast('Pon los minutos (1–600)', 'warn');
  let kg = latestWeight();
  if (!kg) {
    kg = num(c.weight);
    if (!(kg >= 30 && kg <= 300)) return toast('Indica tu peso para calcularlo', 'warn');
  }
  const T = CARDIO_TYPES[c.type];
  const ref = metKcal(c.type, c.intensity, minutes, kg);
  const intLabel = INTENSITIES.find(i => i[0] === c.intensity)[1].toLowerCase();
  if (!state.settings.apiKey || !navigator.onLine) {
    c.est = { kcal: ref, ai: false, note: `Cálculo estándar (MET ${fmtNum(T.met[c.intensity])}): ${T.label.toLowerCase()} ${minutes} min a intensidad ${intLabel} con ${fmtKg(kg)}.${!state.settings.apiKey ? ' Sin clave de IA configurada.' : ' Sin conexión.'}` };
    return render();
  }
  c.busy = true; render();
  try {
    const prompt = `Eres fisiólogo del ejercicio. Estima las calorías NETAS (por encima del gasto en reposo) que ha quemado esta persona.
Actividad: ${T.label} (${c.type === 'bike' ? 'bicicleta estática o exterior' : 'caminar'}).
Duración: ${minutes} minutos.
Intensidad percibida: ${intLabel} (escala: baja, media-baja, media, media-alta, alta). Descripción: ${T.hint[c.intensity]}.
Peso corporal: ${kg} kg. Hombre adulto.
Sé conservador: relojes y máquinas suelen sobrestimar.
Responde SOLO con JSON válido: {"kcal": número entero, "explanation": "una frase breve con el razonamiento"}`;
    const r = parseJSONLoose(await callGemini([{ text: prompt }], { timeout: 30000 }));
    const k = Math.round(num(r.kcal) || 0);
    if (!(k > 0)) throw new Error('respuesta sin calorías');
    const dev = ref ? Math.abs(k - ref) / ref : 0;
    c.est = {
      kcal: k, ai: true,
      note: `${r.explanation || 'Estimación de la IA.'} Referencia estándar (MET): ${ref} kcal.`,
      warn: dev > 0.35 ? `La IA se aleja un ${Math.round(dev * 100)} % del cálculo estándar (${ref} kcal). Revisa el número antes de registrar.` : ''
    };
  } catch (e) {
    c.est = { kcal: ref, ai: false, note: `La IA no respondió (${e.message}). Uso el cálculo estándar (MET ${fmtNum(T.met[c.intensity])}).` };
  } finally {
    c.busy = false; render();
  }
}

/* =========================================================================
   DIETA
   ========================================================================= */
function mealsOf(date) { return state.meals[date] || []; }
function totalsOf(date) {
  return mealsOf(date).reduce((a, m) => ({ kcal: a.kcal + m.kcal, prot: a.prot + m.prot, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }), { kcal: 0, prot: 0, carbs: 0, fat: 0 });
}
/* Agrupa todo el historial por descripción: cuántas veces, en qué tipo y cuál fue la última */
function mealGroups() {
  const g = new Map();
  for (const dt of Object.keys(state.meals).sort()) for (const m of state.meals[dt]) {
    const k = normName(m.desc);
    if (!k) continue;
    const e = g.get(k) || { key: k, count: 0, byType: {}, lastDate: '', last: null };
    e.count++; e.byType[m.type] = (e.byType[m.type] || 0) + 1;
    if (dt >= e.lastDate) { e.lastDate = dt; e.last = m; }
    g.set(k, e);
  }
  return [...g.values()];
}
function mealPicks() {
  const groups = mealGroups();
  const q = normName(ui.mealSearch || '');
  if (q) {
    return { mode: 'search', list: groups.filter(e => e.key.includes(q)).sort((a, b) => b.count - a.count || (a.lastDate < b.lastDate ? 1 : -1)).slice(0, 20) };
  }
  const t = ui.mealType;
  const byFreq = (a, b, ka, kb) => kb - ka || (a.lastDate < b.lastDate ? 1 : a.lastDate > b.lastDate ? -1 : 0);
  const ofType = groups.filter(e => e.byType[t]).sort((a, b) => byFreq(a, b, a.byType[t], b.byType[t]));
  return { mode: 'top', list: ofType.slice(0, 10) };
}
function renderPickList() {
  const { mode, list } = mealPicks();
  ui._picks = list;
  if (!list.length) return `<p class="text-xs text-mute">${mode === 'search' ? 'Nada encontrado en tu historial.' : `Aún no has registrado ninguna comida como «${esc(ui.mealType)}». Usa el buscador para encontrar otras.`}</p>`;
  return list.map((e, i) => `<button class="chip chip-sm text-left" data-act="repeatMeal" data-i="${i}" type="button">${esc((e.last.desc || e.last.type).slice(0, 34))} <span class="text-mute">· ${Math.round(e.last.kcal)}${e.count > 1 ? ` · ×${e.count}` : ''}</span></button>`).join('');
}
function bar(label, val, target, color) {
  const pct = target ? Math.min(100, Math.round(val / target * 100)) : 0;
  const over = target && val > target * 1.05;
  return `<div>
    <div class="flex justify-between text-[11px] mb-1"><span class="font-semibold ${color.text}">${label}</span><span class="${over ? 'text-rose-300 font-bold' : 'text-mute'}">${Math.round(val)} / ${target}</span></div>
    <div class="h-2 rounded-full bg-ink overflow-hidden"><div class="h-2 rounded-full ${color.bg}" style="width:${pct}%"></div></div>
  </div>`;
}

function renderDiet() {
  const date = ui.dietDate;
  const isToday = date === todayISO();
  const st = state.settings;
  const t = totalsOf(date);
  const burned = burnedOf(date);
  const budget = st.targetKcal + (st.eatBackCardio ? burned : 0);
  const leftK = Math.round(budget - t.kcal);
  const leftP = Math.round(st.targetProt - t.prot);
  const cardioTxt = burned ? ` Con cardio has quemado ${burned} kcal (balance neto ${Math.round(t.kcal - burned)} kcal)${st.eatBackCardio ? ', ya sumadas a tu margen' : ', que no se suman a tu margen: así el déficit es real'}.` : '';
  let advice;
  if (!mealsOf(date).length) advice = (isToday ? 'Aún no has registrado comida hoy.' : 'Sin comidas registradas este día.') + cardioTxt;
  else if (leftP > 0 && leftK > 0) advice = `Llevas ${Math.round(t.kcal)} kcal y ${Math.round(t.prot)} g de proteína consumidas.${cardioTxt} Te quedan ${leftK} kcal y ${leftP} g de proteína. Prioriza la proteína: ${leftP > 40 ? 'pavo, claras, atún o un batido' : 'un yogur proteico basta'}.`;
  else if (leftP > 0) advice = `Llevas ${Math.round(t.kcal)} kcal consumidas.${cardioTxt} Calorías cubiertas pero faltan ${leftP} g de proteína: tira de fuentes magras (claras, atún, batido con agua).`;
  else if (leftK >= 0) advice = `Llevas ${Math.round(t.kcal)} kcal consumidas.${cardioTxt} Proteína cumplida ✓. Margen: ${leftK} kcal.`;
  else advice = `Llevas ${Math.round(t.kcal)} kcal consumidas.${cardioTxt} Te has pasado ${-leftK} kcal. Sin drama: mañana vuelve a tu objetivo, no compenses de más.`;

  const typeChips = MEAL_TYPES.map(tp => `<button class="chip chip-sm ${ui.mealType === tp ? 'chip-on' : ''}" data-act="mealType" data-type="${tp}" type="button">${tp}</button>`).join('');
  const hasHistory = Object.keys(state.meals).length > 0;
  const grouped = MEAL_TYPES.map(tp => {
    const items = mealsOf(date).filter(m => (m.type || 'Otro') === tp);
    if (!items.length) return '';
    const sub = items.reduce((a, m) => a + m.kcal, 0);
    return `<div class="mt-3 first:mt-0">
      <div class="flex justify-between text-[11px] uppercase tracking-wider text-mute font-bold mb-1.5"><span>${tp}</span><span>${Math.round(sub)} kcal</span></div>
      ${items.map(m => `<div class="meal">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold truncate ${ui.editing?.id === m.id ? 'text-brand' : ''}">${ui.editing?.id === m.id ? '✏️ ' : ''}${esc(m.desc || tp)}</div>
          <div class="text-[11px] text-mute font-mono mt-0.5">${Math.round(m.kcal)} kcal · P ${Math.round(m.prot)} · C ${Math.round(m.carbs)} · G ${Math.round(m.fat)}</div>
        </div>
        <button class="iconbtn iconbtn-sm" data-act="editMeal" data-id="${esc(m.id)}" type="button" aria-label="Editar">✎</button>
        <button class="iconbtn iconbtn-sm" data-act="delMeal" data-id="${esc(m.id)}" type="button" aria-label="Borrar">✕</button>
      </div>`).join('')}
    </div>`;
  }).join('');

  const ai = ui.aiResult;
  return `
  <div class="flex items-center justify-between">
    <button class="iconbtn" data-act="dietPrev" type="button" aria-label="Día anterior">‹</button>
    <div class="text-center">
      <div class="font-extrabold">${isToday ? 'Hoy' : esc(fmtDate(date))}</div>
      <div class="text-[11px] text-mute">${esc(fmtDateShort(date))}/${parseISO(date).getFullYear()}</div>
    </div>
    <button class="iconbtn ${isToday ? 'opacity-30 pointer-events-none' : ''}" data-act="dietNext" type="button" aria-label="Día siguiente">›</button>
  </div>

  <section class="card p-4 mt-3">
    <div class="flex items-end justify-between">
      <div><div class="text-[11px] text-mute font-bold uppercase tracking-wider">Calorías</div>
        <div class="text-3xl font-black">${Math.round(t.kcal)}<span class="text-sm text-mute font-semibold"> / ${budget}</span></div></div>
      <div class="text-right"><div class="text-[11px] text-mute font-bold uppercase tracking-wider">Proteína</div>
        <div class="text-3xl font-black text-brand">${Math.round(t.prot)}<span class="text-sm text-mute font-semibold"> / ${st.targetProt} g</span></div></div>
    </div>
    <div class="space-y-2.5 mt-4">
      ${bar('Proteína', t.prot, st.targetProt, { text: 'text-brand', bg: 'bg-brand' })}
      ${bar(st.eatBackCardio && burned ? 'Calorías (+cardio)' : 'Calorías', t.kcal, budget, { text: 'text-amber-300', bg: 'bg-amber-400' })}
      ${bar('Carbohidratos', t.carbs, st.targetCarbs, { text: 'text-emerald-300', bg: 'bg-emerald-400' })}
      ${bar('Grasas', t.fat, st.targetFat, { text: 'text-rose-300', bg: 'bg-rose-400' })}
    </div>
    <div class="grid grid-cols-3 gap-2 mt-4 text-center">
      <div class="bg-ink rounded-xl border border-line py-2"><div class="text-[10px] text-mute font-bold uppercase">Consumidas</div><div class="font-black">${Math.round(t.kcal)}</div></div>
      <div class="bg-ink rounded-xl border border-line py-2"><div class="text-[10px] text-mute font-bold uppercase">🔥 Cardio</div><div class="font-black text-amber-300">${burned ? '−' + burned : '0'}</div></div>
      <div class="bg-ink rounded-xl border border-line py-2"><div class="text-[10px] text-mute font-bold uppercase">Neto</div><div class="font-black">${Math.round(t.kcal - burned)}</div></div>
    </div>
    <p class="text-xs text-mute mt-3 leading-relaxed">${esc(advice)}</p>
  </section>

  <section class="card p-4 mt-3 space-y-3 ${ui.editing ? 'border-brand/50' : ''}" id="mealCard">
    ${ui.editing ? `<div class="flex items-center justify-between"><h3 class="section-title">✏️ Editar comida</h3><span class="text-[11px] text-mute">${esc(fmtDate(ui.editing.date))}</span></div>` : '<h3 class="section-title">➕ Añadir comida</h3>'}
    <div class="flex flex-wrap gap-1.5">${typeChips}</div>
    ${ui.editing ? '' : `<textarea class="field" id="mealDesc" rows="2" placeholder="${ui.img ? 'Opcional: añade lo que sepas para afinar (ej: 150 g de arroz, aceite de oliva)' : 'Ej: 200 g de pechuga a la plancha y 150 g de arroz'}">${esc(ui.mealDesc)}</textarea>
    ${ui.img ? `<div class="relative rounded-xl overflow-hidden border border-line">
        <img src="${ui.img}" alt="Foto del plato" class="w-full max-h-56 object-cover" />
        <button class="absolute top-2 right-2 iconbtn bg-ink/80" data-act="clearImg" type="button" aria-label="Quitar foto">✕</button>
        <div class="absolute bottom-0 inset-x-0 text-[10px] text-mute bg-ink/80 px-2 py-1">La foto no se guarda: solo se usa para estimar.</div>
      </div>` : ''}
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="photo" type="button">📸 Cámara</button>
      <button class="btn-ghost" data-act="gallery" type="button">🖼️ Galería</button>
    </div>
    <button class="btn-primary w-full" data-act="analyze" type="button" ${ui.aiBusy ? 'disabled' : ''}>
      ${ui.aiBusy ? '<span class="spinner"></span> Analizando…' : '⚡ Estimar macros con IA'}
    </button>
    ${!ai ? `<p class="text-center"><button class="text-xs text-mute underline" data-act="manualMeal" type="button">o introduce los macros a mano</button></p>` : ''}
    ${!state.settings.apiKey ? `<p class="text-[11px] text-amber-300">Para usar la IA, pega tu clave de Gemini en <button class="underline" data-act="goSettings" type="button">Ajustes</button>.</p>` : ''}`}
    ${ai ? renderMealResult(ai) : ''}
  </section>

  ${hasHistory && !ui.editing ? `<section class="card p-4 mt-3">
    <h3 class="section-title">⭐ Tus comidas habituales</h3>
    <p class="text-[11px] text-mute mt-1">Las que más repites en «${esc(ui.mealType)}» (hasta 10). Al tocar una podrás ajustar cantidades antes de añadirla.</p>
    <input class="field mt-2.5 py-2 text-xs" id="mealSearch" type="search" autocomplete="off" placeholder="🔍 Buscar en todo tu historial…" value="${esc(ui.mealSearch || '')}" />
    <div class="flex flex-wrap gap-1.5 mt-2.5" id="mealPicks">${renderPickList()}</div>
  </section>` : ''}

  <section class="card p-4 mt-3">
    <h3 class="section-title">🍽️ Registro ${isToday ? 'de hoy' : 'del día'}</h3>
    <div class="mt-3">${grouped || '<p class="text-sm text-mute">Nada registrado.</p>'}</div>
  </section>`;
}

/* ---------- Raciones (tras «Estimar macros con IA») ---------- */
const SIZES = [['s', 'P'], ['m', 'M'], ['l', 'G']];
function itemMacros(it) {
  const f = (it.grams || 0) / 100;
  return { kcal: it.per100.kcal * f, prot: it.per100.prot * f, carbs: it.per100.carbs * f, fat: it.per100.fat * f };
}
function recalcFromItems(ai) {
  if (!ai.items?.length) return;
  const t = ai.items.reduce((a, it) => { const m = itemMacros(it); a.kcal += m.kcal; a.prot += m.prot; a.carbs += m.carbs; a.fat += m.fat; return a; }, { kcal: 0, prot: 0, carbs: 0, fat: 0 });
  Object.assign(ai, { kcal: Math.round(t.kcal), prot: Math.round(t.prot), carbs: Math.round(t.carbs), fat: Math.round(t.fat) });
}
function syncResultFields() {
  const ai = ui.aiResult; if (!ai) return;
  for (const k of ['kcal', 'prot', 'carbs', 'fat']) { const el = document.querySelector(`[data-ai="${k}"]`); if (el) el.value = Math.round(ai[k]); }
  (ai.items || []).forEach((it, i) => { const el = document.querySelector(`[data-item-kcal="${i}"]`); if (el) el.textContent = `${Math.round(itemMacros(it).kcal)} kcal`; });
}
function renderPortions(ai) {
  const items = ai.items || [];
  if (!items.length) return '';
  const pending = items.filter(it => !it.fromDesc).length;
  const row = (it, i) => {
    const kc = `<span class="text-mute" data-item-kcal="${i}">${Math.round(itemMacros(it).kcal)} kcal</span>`;
    if (it.fromDesc) return `<div class="portion">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="font-semibold truncate">${esc(it.name)} <span class="text-mute font-normal">· ${Math.round(it.grams)} g, según tu descripción</span></span>
        <span class="flex items-center gap-2 shrink-0">${kc}<button class="underline text-brand" data-act="portionEdit" data-i="${i}" type="button">cambiar</button></span>
      </div></div>`;
    return `<div class="portion">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="font-semibold truncate">${esc(it.name)}</span>
        <span class="flex items-center gap-2 shrink-0">${kc}<button class="text-mute px-1" data-act="portionDel" data-i="${i}" type="button" aria-label="Quitar alimento">✕</button></span>
      </div>
      <div class="seg mt-1.5">
        ${SIZES.map(([k, l]) => `<button class="seg-btn ${it.sel === k ? 'seg-on' : ''}" data-act="portion" data-i="${i}" data-size="${k}" type="button">${l}<span>${Math.round(it.sizes[k])} g</span></button>`).join('')}
        ${it.sel === 'x'
          ? `<label class="seg-btn seg-on seg-input"><input inputmode="numeric" data-portion-g="${i}" value="${Math.round(it.grams)}" aria-label="Gramos de ${esc(it.name)}" /><span>g</span></label>`
          : `<button class="seg-btn" data-act="portion" data-i="${i}" data-size="x" type="button">Otra<span>… g</span></button>`}
      </div>
    </div>`;
  };
  const body = items.map(row).join('');
  if (!pending) {
    return `<details class="portions"><summary class="flex items-center justify-between cursor-pointer text-xs text-mute">
      <span>⚖️ Raciones según tu descripción (${items.length})</span><span class="tri"></span></summary>
      <div class="space-y-1.5 mt-2">${body}</div></details>`;
  }
  return `<div class="portions">
    <div class="flex items-center justify-between text-xs text-mute mb-2"><span>⚖️ ¿Qué cantidad había? <span class="text-[10px]">(P pequeña · M mediana · G grande)</span></span></div>
    <div class="space-y-1.5">${body}</div>
  </div>`;
}

function renderMealResult(ai) {
  const calc = Math.round(ai.prot * 4 + ai.carbs * 4 + ai.fat * 9);
  const mismatch = ai.kcal > 0 && Math.abs(calc - ai.kcal) / ai.kcal > 0.15;
  return `<div class="border-t border-line pt-3 space-y-3">
    ${ai.note ? `<div class="text-xs text-mute bg-ink rounded-xl p-2.5 border border-line">${ai.noteIcon || '🤖'} ${esc(ai.note)}</div>` : ''}
    ${!ai.items?.length && (ui.editing || ai.repeated) ? '<p class="text-[11px] text-mute">Esta comida se registró sin desglose por alimentos: puedes editar los totales.</p>' : ''}
    ${renderPortions(ai)}
    <label class="lbl">Descripción<input class="field mt-1" data-ai="desc" value="${esc(ai.desc)}" /></label>
    <div class="grid grid-cols-4 gap-2">
      <label class="lbl text-amber-300">kcal<input class="field mt-1 text-center" inputmode="decimal" data-ai="kcal" value="${Math.round(ai.kcal)}" /></label>
      <label class="lbl text-brand">Prot<input class="field mt-1 text-center" inputmode="decimal" data-ai="prot" value="${Math.round(ai.prot)}" /></label>
      <label class="lbl text-emerald-300">Carb<input class="field mt-1 text-center" inputmode="decimal" data-ai="carbs" value="${Math.round(ai.carbs)}" /></label>
      <label class="lbl text-rose-300">Grasa<input class="field mt-1 text-center" inputmode="decimal" data-ai="fat" value="${Math.round(ai.fat)}" /></label>
    </div>
    ${mismatch ? `<p class="text-[11px] text-amber-300">Ojo: los macros suman ${calc} kcal, no ${Math.round(ai.kcal)}. <button class="underline" data-act="fixKcal" type="button">Usar ${calc}</button></p>` : ''}
    <div class="grid grid-cols-3 gap-2">
      <button class="btn-ghost" data-act="cancelMeal" type="button">Cancelar</button>
      <button class="btn-primary col-span-2" data-act="confirmMeal" type="button">${ui.editing ? '💾 Guardar cambios' : '✅ Registrar'}</button>
    </div>
  </div>`;
}

async function compressImage(file, max = 1024) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('No se pudo leer la imagen')); i.src = url; });
    const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  } finally { URL.revokeObjectURL(url); }
}

function parseJSONLoose(text) {
  const t = String(text).replace(/```json|```/g, '').trim();
  try { return JSON.parse(t); } catch { /* sigue */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('Respuesta de la IA ilegible');
}

async function callGemini(parts, { json = true, timeout = 45000 } = {}) {
  const s = state.settings;
  if (!s.apiKey) throw new Error('Falta la clave de Gemini (Ajustes).');
  if (!navigator.onLine) throw new Error('Sin conexión a internet.');
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), timeout);
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.model || DEFAULT_MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': s.apiKey },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: json ? { responseMimeType: 'application/json', temperature: 0.2 } : { temperature: 0.2 } }),
      signal: ctrl.signal
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error?.message || `Error HTTP ${resp.status}`);
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    if (!text) throw new Error('La IA no devolvió respuesta (bloqueo o cuota agotada).');
    return text;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('La IA tardó demasiado. Prueba de nuevo.');
    throw e;
  } finally { clearTimeout(tm); }
}

async function analyzeMeal() {
  const desc = ui.mealDesc.trim();
  if (!desc && !ui.img) return toast('Describe la comida o haz una foto', 'warn');
  if (!state.settings.apiKey) { ui.view = 'settings'; render(); return toast('Primero pega tu clave de Gemini', 'warn'); }
  ui.aiBusy = true; render();
  try {
    const prompt = `Eres un nutricionista deportivo. Analiza esta comida a partir de la foto y/o la descripción del usuario y descomponla en alimentos.
Reglas:
- La descripción del usuario manda: si da cantidades (gramos, unidades, cucharadas…), úsalas para ese alimento y marca "from_description": true.
- Si un alimento no tiene cantidad en la descripción, estímala por la foto o por raciones habituales en España y marca "from_description": false.
- Para cada alimento da tres raciones en gramos: pequeña, mediana y grande. La MEDIANA debe ser tu estimación más probable de lo que hay en el plato. Si from_description es true, "grams" es la cantidad indicada.
- Incluye aceite o salsas solo si se ven o se mencionan. No inventes alimentos.
- Los valores por 100 g deben referirse al alimento tal como se come (cocinado si está cocinado).
Responde SOLO con JSON válido:
{"dish_name": "nombre breve", "confidence": "alta" | "media" | "baja", "explanation": "una frase breve",
 "items": [{"name": "nombre corto del alimento", "from_description": true|false, "grams": número, "small_g": número, "medium_g": número, "large_g": número,
            "per100": {"kcal": número, "protein": número, "carbs": número, "fat": número}}],
 "calories": total, "protein": total, "carbs": total, "fat": total}
Descripción del usuario: ${desc ? JSON.stringify(desc) : '(sin descripción, usa solo la foto)'}`;
    const parts = [{ text: prompt }];
    if (ui.img) parts.push({ inlineData: { mimeType: 'image/jpeg', data: ui.img.split(',')[1] } });
    const res = parseJSONLoose(await callGemini(parts));
    const items = (Array.isArray(res.items) ? res.items : []).map(it => {
      const per = it.per100 || {};
      const m = num(it.medium_g) || num(it.grams) || 100;
      const fromDesc = !!it.from_description && num(it.grams) > 0;
      return {
        name: String(it.name || 'Alimento').slice(0, 40), fromDesc,
        sizes: { s: num(it.small_g) || Math.round(m * 0.65), m, l: num(it.large_g) || Math.round(m * 1.4) },
        sel: fromDesc ? 'x' : 'm', grams: fromDesc ? num(it.grams) : m,
        per100: { kcal: num(per.kcal) || 0, prot: num(per.protein) || 0, carbs: num(per.carbs) || 0, fat: num(per.fat) || 0 }
      };
    }).filter(it => it.per100.kcal > 0 || it.per100.prot > 0);
    ui.aiResult = {
      desc: desc || res.dish_name || ui.mealType, items,
      kcal: num(res.calories) || 0, prot: num(res.protein) || 0, carbs: num(res.carbs) || 0, fat: num(res.fat) || 0,
      note: `${res.dish_name || 'Comida'}${res.confidence ? ` (confianza ${res.confidence})` : ''}: ${res.explanation || ''}`
    };
    recalcFromItems(ui.aiResult);
  } catch (e) {
    toast('IA: ' + e.message, 'error');
  } finally {
    ui.aiBusy = false; render();
  }
}

function mealRecord(m, id) {
  const rec = { id, type: m.type || ui.mealType, desc: m.desc || '', kcal: r2(m.kcal || 0), prot: r2(m.prot || 0), carbs: r2(m.carbs || 0), fat: r2(m.fat || 0) };
  if (m.items?.length) rec.items = m.items.map(it => ({ name: it.name, sizes: { ...it.sizes }, sel: it.sel, grams: r2(it.grams || 0), fromDesc: !!it.fromDesc, per100: { ...it.per100 } }));
  return rec;
}
function loadMealIntoPanel(m, extra = {}) {
  ui.aiResult = { desc: m.desc, kcal: m.kcal, prot: m.prot, carbs: m.carbs, fat: m.fat, items: m.items ? clone(m.items).map(it => ({ ...it, fromDesc: false })) : [], ...extra };
  ui.mealType = m.type || ui.mealType;
  render();
  setTimeout(() => $('#mealCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
}
function addMeal(date, m) {
  if (!state.meals[date]) state.meals[date] = [];
  state.meals[date].push(mealRecord(m, uid('f_')));
  persist();
}

/* =========================================================================
   PROGRESO
   ========================================================================= */
function lineChart(rawPts, { color = '#00d2df', unit = '', label = '', trend = null } = {}) {
  const pts = trend && trend.length >= 2 ? trend : rawPts;
  if (pts.length < 2) return `<div class="text-xs text-mute py-6 text-center">Necesito al menos 2 registros para dibujar ${esc(label || 'la gráfica')}.</div>`;
  const W = 340, H = 150, pl = 36, pr = 12, pt = 14, pb = 22;
  const xs = pts.map(p => parseISO(p.x).getTime());
  const ys = pts.map(p => p.y);
  const rawXs = trend ? rawPts.map(p => parseISO(p.x).getTime()) : [];
  const allY = trend ? [...ys, ...rawPts.map(p => p.y)] : ys;
  let x0 = Math.min(...xs, ...rawXs), x1 = Math.max(...xs, ...rawXs); if (x1 === x0) x1 = x0 + 86400000;
  let y0 = Math.min(...allY), y1 = Math.max(...allY);
  const py = (y1 - y0) * 0.15 || 1; y0 -= py; y1 += py;
  const X = t => pl + (t - x0) / (x1 - x0) * (W - pl - pr);
  const Y = v => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const area = `${line} L${X(xs[xs.length - 1]).toFixed(1)},${H - pb} L${X(xs[0]).toFixed(1)},${H - pb} Z`;
  const grid = [0, 0.5, 1].map(f => { const v = y0 + (y1 - y0) * f; const yy = Y(v).toFixed(1); return `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" stroke="#1c2a31" stroke-width="1"/><text x="${pl - 6}" y="${yy}" fill="#8a9ba5" font-size="10" text-anchor="end" dominant-baseline="middle">${fmtNum(Math.round(v * 10) / 10)}</text>`; }).join('');
  const gid = 'g' + Math.random().toString(36).slice(2, 7);
  const lastX = X(xs[xs.length - 1]), lastY = Y(ys[ys.length - 1]);
  return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="${esc(label)}">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${trend ? rawPts.map((p, i) => `<circle cx="${X(rawXs[i]).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.2" fill="${color}" opacity="0.35"/>`).join('') : pts.length <= 40 ? pts.map((p, i) => `<circle cx="${X(xs[i]).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" fill="#05080a" stroke="${color}" stroke-width="1.6"/>`).join('') : ''}
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" fill="${color}"/>
    <text x="${pl}" y="${H - 6}" fill="#8a9ba5" font-size="10">${fmtDateShort(pts[0].x)}</text>
    <text x="${W - pr}" y="${H - 6}" fill="#8a9ba5" font-size="10" text-anchor="end">${fmtDateShort(pts[pts.length - 1].x)}</text>
    <text x="${Math.min(lastX, W - pr - 2).toFixed(1)}" y="${Math.max(lastY - 9, 10).toFixed(1)}" fill="${color}" font-size="11" font-weight="700" text-anchor="end">${fmtNum(ys[ys.length - 1])}${unit}</text>
  </svg>`;
}

function strengthOptions() {
  const map = new Map();
  for (const s of sortedSessions()) for (const e of s.exercises) {
    if (!e.exKey) continue;
    const cur = map.get(e.exKey) || { name: e.name, count: 0 };
    cur.name = e.name; cur.count++;
    map.set(e.exKey, cur);
  }
  return [...map.entries()].filter(([, v]) => v.count > 0).sort((a, b) => b[1].count - a[1].count);
}

function weekStats() {
  const today = parseISO(todayISO());
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = addDays(todayISO(), -mondayOffset);
  const sessionsWeek = state.sessions.filter(s => s.date >= monday).length;
  let k = 0, p = 0, n = 0;
  for (let i = 1; i <= 7; i++) {
    const dt = addDays(todayISO(), -i);
    if (mealsOf(dt).length) { const t = totalsOf(dt); k += t.kcal; p += t.prot; n++; }
  }
  return { sessionsWeek, avgK: n ? Math.round(k / n) : null, avgP: n ? Math.round(p / n) : null, daysLogged: n };
}

function renderProgress() {
  const st = state.settings;
  const w = weekStats();
  const bm = [...state.bodyMetrics].sort((a, b) => (a.date < b.date ? -1 : 1));
  const wPts = bm.filter(m => m.weight !== null).map(m => ({ x: m.date, y: m.weight }));
  const cPts = bm.filter(m => m.waist !== null).map(m => ({ x: m.date, y: m.waist }));
  const wt = weightTrend();
  const delta = (pts, unit) => pts.length >= 2 ? (() => { const d = r2(pts[pts.length - 1].y - pts[0].y); return `<span class="${d <= 0 ? 'text-emerald-300' : 'text-rose-300'} font-bold">${d > 0 ? '+' : ''}${fmtNum(d)} ${unit}</span> desde ${fmtDateShort(pts[0].x)}`; })() : '';

  const opts = strengthOptions();
  if (!ui.progEx || !opts.some(([k]) => k === ui.progEx)) ui.progEx = opts[0]?.[0] || null;
  let strengthHtml = '<p class="text-sm text-mute">Guarda alguna sesión y aquí verás tu fuerza por ejercicio.</p>';
  if (ui.progEx) {
    const pts = [], rows = [];
    for (const s of sortedSessions()) for (const e of s.exercises) if (e.exKey === ui.progEx) {
      const best = Math.max(...e.sets.map(x => e1rm(x.w, x.r)));
      const reps = e.sets.reduce((a, x) => a + x.r, 0);
      pts.push({ x: s.date, y: best > 0 ? Math.round(best * 10) / 10 : reps });
      rows.push({ date: s.date, sets: e.sets });
    }
    const isBW = pts.length && rows.every(r => r.sets.every(x => !x.w));
    const pr = pts.length ? Math.max(...pts.map(p => p.y)) : 0;
    strengthHtml = `
      <select class="field" data-act-change="progEx">${opts.map(([k, v]) => `<option value="${esc(k)}" ${k === ui.progEx ? 'selected' : ''}>${esc(v.name)} (${v.count})</option>`).join('')}</select>
      <div class="flex justify-between text-[11px] text-mute mt-3"><span>${isBW ? 'Reps totales por sesión' : '1RM estimado (Epley) por sesión'}</span><span>Mejor: <strong class="text-white">${fmtNum(pr)}${isBW ? ' reps' : ' kg'}</strong></span></div>
      <div class="mt-1">${lineChart(pts, { color: '#00d2df', unit: isBW ? '' : ' kg', label: 'fuerza' })}</div>
      <div class="space-y-1 mt-2">${rows.slice(-5).reverse().map(r => `<div class="text-[11px] flex justify-between gap-3 bg-ink rounded-lg px-2.5 py-1.5"><span class="text-mute shrink-0">${fmtDate(r.date)}</span><span class="font-mono text-right">${r.sets.map(x => `${fmtNum(x.w)}×${x.r}`).join(' · ')}</span></div>`).join('')}</div>`;
  }

  const backupAge = st.lastBackup ? daysBetween(st.lastBackup, todayISO()) : null;
  const needBackup = state.sessions.length > 0 && (backupAge === null || backupAge > 7);
  const hist = sortedSessions().slice(-20).reverse();

  return `
  ${needBackup ? `<div class="banner-warn mb-3"><span>${backupAge === null ? 'Aún no has hecho copia de seguridad.' : `Última copia hace ${backupAge} días.`} Si borras datos del navegador, lo pierdes todo.</span>${state.settings.driveConnected ? '<button class="btn-banner btn-banner-warn shrink-0" data-act="driveBackup" type="button">☁️ Drive</button>' : '<button class="btn-banner btn-banner-warn shrink-0" data-act="share" type="button">📤 Copia</button>'}</div>` : ''}

  <section class="grid grid-cols-3 gap-2">
    <div class="stat"><div class="stat-v">${w.sessionsWeek}</div><div class="stat-l">sesiones esta semana</div></div>
    <div class="stat"><div class="stat-v">${w.avgK ?? '—'}</div><div class="stat-l">kcal media 7 días${w.avgK ? ` · obj. ${st.targetKcal}` : ''}</div></div>
    <div class="stat"><div class="stat-v ${w.avgP !== null && w.avgP < st.targetProt * 0.9 ? 'text-amber-300' : ''}">${w.avgP ?? '—'}</div><div class="stat-l">g prot media${w.avgP ? ` · obj. ${st.targetProt}` : ''}</div></div>
  </section>

  ${renderWeeklyCard()}

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">📏 Peso y cintura (en ayunas)</h3>
    <div class="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
      <label class="lbl">Fecha<input class="field mt-1 px-2" type="date" id="bmDate" value="${todayISO()}" max="${todayISO()}" /></label>
      <label class="lbl">Peso (kg)<input class="field mt-1" id="bmWeight" inputmode="decimal" placeholder="${wPts.length ? fmtNum(wPts[wPts.length - 1].y) : '85,0'}" /></label>
      <label class="lbl">Cintura (cm)<input class="field mt-1" id="bmWaist" inputmode="decimal" placeholder="${cPts.length ? fmtNum(cPts[cPts.length - 1].y) : '96'}" /></label>
    </div>
    <button class="btn-primary w-full" data-act="saveMetric" type="button">Registrar medición</button>
    <div>
      <div class="flex justify-between text-[11px] text-mute"><span>Peso <span class="opacity-70">· línea = media de 7 días, puntos = pesajes</span></span><span>${delta(wPts, 'kg')}</span></div>
      ${lineChart(wPts, { color: '#00d2df', unit: ' kg', label: 'el peso', trend: wt.trend.length >= 2 ? wt.trend : null })}
      ${wt.ready ? `<div class="coach ${wt.tone === 'warn' ? 'coach-stall' : 'coach-hold'} mt-2"><div class="font-bold text-xs">📉 Tendencia: ${wt.kgWeek > 0 ? '+' : ''}${fmtNum(r2(wt.kgWeek))} kg/semana</div><p class="text-xs mt-1 opacity-90 leading-relaxed">${esc(wt.msg)}</p></div>`
        : wPts.length ? '<p class="text-[11px] text-mute mt-1">Con pesajes durante al menos 8 días te diré la tendencia semanal.</p>' : ''}
    </div>
    <div>
      <div class="flex justify-between text-[11px] text-mute"><span>Cintura</span><span>${delta(cPts, 'cm')}</span></div>
      ${lineChart(cPts, { color: '#fbbf24', unit: ' cm', label: 'la cintura' })}
    </div>
    ${bm.length ? `<details class="text-xs" ${openAttr('metrics')}><summary class="text-mute cursor-pointer flex items-center justify-between"><span>Ver registros (${bm.length})</span><span class="tri"></span></summary>
      <div class="space-y-1 mt-2">${bm.slice().reverse().map(m => `<div class="flex items-center justify-between bg-ink rounded-lg px-2.5 py-1.5">
        <span class="text-mute">${fmtDate(m.date)}</span><span>${m.weight !== null ? fmtNum(m.weight) + ' kg' : '—'}</span><span class="text-amber-300">${m.waist !== null ? fmtNum(m.waist) + ' cm' : '—'}</span>
        <button class="iconbtn iconbtn-sm" data-act="delMetric" data-id="${esc(m.id)}" type="button" aria-label="Borrar">✕</button></div>`).join('')}</div></details>` : ''}
  </section>

  <section class="card p-4 mt-3">
    <h3 class="section-title mb-3">🏋️ Fuerza por ejercicio</h3>
    ${strengthHtml}
  </section>

  ${renderRecords()}

  <section class="card p-4 mt-3">
    <h3 class="section-title">📚 Historial de sesiones</h3>
    <div class="space-y-2 mt-3">
      ${hist.length ? hist.map(s => `<details class="bg-ink rounded-xl border border-line">
        <summary class="px-3 py-2.5 flex justify-between items-center cursor-pointer text-sm"><span class="font-semibold truncate">${esc(s.dayTitle || s.dayId)}</span><span class="flex items-center gap-2 text-[11px] text-mute shrink-0 ml-2">${fmtDate(s.date)}<span class="tri"></span></span></summary>
        <div class="px-3 pb-3 space-y-1 text-[11px]">
          ${s.exercises.map(e => `<div><strong>${esc(e.name)}:</strong> <span class="font-mono text-mute">${e.sets.map(x => `${fmtNum(x.w)}×${x.r}`).join(', ')}</span></div>`).join('')}
          ${s.habits?.length ? `<div class="text-emerald-300 mt-1">✓ ${s.habits.map(esc).join(' · ')}</div>` : ''}
          <button class="text-rose-300 underline mt-2" data-act="delSession" data-id="${esc(s.id)}" type="button">Borrar esta sesión</button>
        </div>
      </details>`).join('') : '<p class="text-sm text-mute">Sin sesiones todavía.</p>'}
    </div>
  </section>`;
}

/* =========================================================================
   AJUSTES
   ========================================================================= */
function renderSettings() {
  const st = state.settings;
  const sumK = Math.round(st.targetProt * 4 + st.targetCarbs * 4 + st.targetFat * 9);
  const backupAge = st.lastBackup ? daysBetween(st.lastBackup, todayISO()) : null;
  return `
  <details class="card p-4 group" id="aiBox" ${ui.aiOpen ? 'open' : ''}>
    <summary class="flex items-center justify-between cursor-pointer select-none">
      <h3 class="section-title">🤖 IA de nutrición (Gemini)</h3>
      <span class="flex items-center gap-2 text-[11px] ${st.apiKey ? 'text-emerald-300' : 'text-amber-300'}">${st.apiKey ? 'Configurada ✓' : 'Sin configurar'}<span class="tri"></span></span>
    </summary>
    <div class="space-y-3 mt-3">
    <p class="text-xs text-mute leading-relaxed">La clave se guarda <strong class="text-white">solo en este móvil</strong> y no va en el código ni en las copias de seguridad. Créala en <a class="text-brand underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</p>
    <label class="lbl">Clave API
      <div class="flex gap-2 mt-1">
        <input class="field flex-1 font-mono" id="apiKey" type="${ui.showKey ? 'text' : 'password'}" autocomplete="off" spellcheck="false" value="${esc(st.apiKey)}" placeholder="AIza…" />
        <button class="iconbtn" data-act="toggleKey" type="button" aria-label="Mostrar u ocultar">${ui.showKey ? '🙈' : '👁'}</button>
      </div>
    </label>
    <label class="lbl">Modelo<input class="field mt-1 font-mono" id="apiModel" value="${esc(st.model)}" placeholder="${DEFAULT_MODEL}" /></label>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="testKey" type="button">Probar conexión</button>
      <button class="btn-primary" data-act="saveKey" type="button">Guardar</button>
    </div>
    </div>
  </details>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">🎯 Objetivos diarios</h3>
    <div class="grid grid-cols-4 gap-2">
      <label class="lbl">kcal<input class="field mt-1 text-center" id="tK" inputmode="numeric" value="${st.targetKcal}" /></label>
      <label class="lbl">Prot g<input class="field mt-1 text-center" id="tP" inputmode="numeric" value="${st.targetProt}" /></label>
      <label class="lbl">Carb g<input class="field mt-1 text-center" id="tC" inputmode="numeric" value="${st.targetCarbs}" /></label>
      <label class="lbl">Grasa g<input class="field mt-1 text-center" id="tF" inputmode="numeric" value="${st.targetFat}" /></label>
    </div>
    <p class="text-[11px] ${Math.abs(sumK - st.targetKcal) > st.targetKcal * 0.05 ? 'text-amber-300' : 'text-mute'}">Tus macros suman ${sumK} kcal (objetivo ${st.targetKcal}).</p>
    <label class="habit"><input type="checkbox" id="tEat" ${st.eatBackCardio ? 'checked' : ''} /><span class="text-xs">Sumar las calorías del cardio a lo que puedo comer <span class="text-mute">(desactivado = déficit más fiable)</span></span></label>
    <button class="btn-primary w-full" data-act="saveGoals" type="button">Guardar objetivos</button>
  </section>

  <details class="card p-4 mt-3" id="blocksBox" ${ui.blocksOpen ? 'open' : ''}>
    <summary class="flex items-center justify-between cursor-pointer select-none">
      <h3 class="section-title">🗓️ Bloques de entrenamiento</h3>
      <span class="flex items-center gap-2 text-[11px] text-mute">${state.plan.programs.length} bloques<span class="tri"></span></span>
    </summary>
    <div class="space-y-3 mt-3">
    ${state.plan.programs.map(p => `<div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <div class="text-sm font-extrabold ${p.id === prog().id ? 'text-brand' : ''}">${progLabel(p)}${p.id === prog().id ? ' <span class="text-[10px] font-semibold">· activo</span>' : ''}</div>
        <button class="iconbtn iconbtn-sm" data-act="editProgId" data-prog="${esc(p.id)}" type="button" aria-label="Editar bloque">✎</button>
      </div>
      ${p.type === 'cardio' ? '<p class="text-[11px] text-mute bg-ink rounded-xl border border-line px-3 py-2">Bicicleta y caminata con estimación de calorías.</p>' : ''}
      ${p.days.map(d => `<div class="flex items-center justify-between bg-ink rounded-xl border border-line px-3 py-2">
        <div class="min-w-0"><div class="text-sm font-bold">${esc(d.label)} <span class="text-mute font-normal text-xs">· ${d.exercises.length} ejercicios${d.rotation ? '' : ' · fuera de rotación'}</span></div>
        <div class="text-[11px] text-mute truncate">${esc(d.title)}</div></div>
        <button class="iconbtn" data-act="editDayId" data-day="${esc(d.id)}" type="button" aria-label="Editar">✎</button>
      </div>`).join('')}
    </div>`).join('')}
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="addProg" type="button">＋ Añadir bloque</button>
      <button class="btn-ghost" data-act="resetPlan" type="button">Restaurar bloques</button>
    </div>
    <p class="text-[11px] text-mute">Los días se añaden desde Entreno con «＋ Día» (en el bloque activo) y los ejercicios con el botón ✎ de cada uno.</p>
    </div>
  </details>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">✅ Hábitos del remate</h3>
    <textarea class="field" id="habitsTxt" rows="3" placeholder="Uno por línea">${esc(st.habits.join('\n'))}</textarea>
    <button class="btn-primary w-full" data-act="saveHabits" type="button">Guardar hábitos</button>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">💾 Copias de seguridad</h3>
    <p class="text-xs text-mute">${backupAge === null ? 'Nunca has hecho una copia.' : backupAge === 0 ? 'Última copia: hoy ✓' : `Última copia: hace ${backupAge} día${backupAge === 1 ? '' : 's'}.`} Tus datos viven solo en este móvil.</p>
    <div class="rounded-xl border ${st.driveConnected ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-line bg-ink'} p-3 space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm font-bold">☁️ Google Drive</span>
        <span class="text-[11px] ${st.driveConnected ? 'text-emerald-300' : 'text-mute'} truncate">${st.driveConnected ? `Conectado${st.driveEmail ? ' · ' + esc(st.driveEmail) : ''}` : 'Sin conectar'}</span>
      </div>
      ${st.driveConnected ? `
        <p class="text-[11px] text-mute">Carpeta «${esc(DRIVE_FOLDER)}» en tu Drive. ${st.lastDriveBackup ? `Última copia allí: ${esc(fmtDate(st.lastDriveBackup))}.` : ''} Se conservan las ${DRIVE_KEEP} más recientes.</p>
        <button class="btn-primary w-full" data-act="driveBackup" type="button" ${ui.driveBusy ? 'disabled' : ''}>${ui.driveBusy ? '<span class="spinner"></span> Conectando con Drive…' : '☁️ Guardar copia en Drive'}</button>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn-ghost" data-act="driveRestore" type="button" ${ui.driveBusy ? 'disabled' : ''}>Restaurar de Drive</button>
          <button class="btn-ghost" data-act="driveDisconnect" type="button">Desconectar</button>
        </div>
        <label class="habit"><input type="checkbox" id="autoDrive" ${st.autoDrive !== false ? 'checked' : ''} /><span class="text-xs">Copia automática semanal al abrir la app</span></label>`
      : `<p class="text-[11px] text-mute">Guarda las copias directamente en una carpeta de tu Drive, con copia automática cada semana.</p>
        <button class="btn-primary w-full" data-act="driveConnect" type="button" ${ui.driveBusy ? 'disabled' : ''}>${ui.driveBusy ? '<span class="spinner"></span> Conectando…' : 'Conectar Google Drive'}</button>`}
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost col-span-2" data-act="share" type="button">📤 Compartir copia (WhatsApp, correo…)</button>
      <button class="btn-ghost" data-act="export" type="button">⬇️ Descargar</button>
      <button class="btn-ghost" data-act="import" type="button">Importar</button>
    </div>
    <p class="text-[11px] text-mute">«Compartir» abre el menú del móvil para enviártela. Importar admite archivos .json y .txt de copias de FITNESTEBAN.</p>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">🔒 PIN de seguridad</h3>
    <p class="text-xs text-mute">${st.pinHash ? 'PIN activo ✓. Se pide para «Borrar todo» e «Importar» (que sustituye tus datos).' : 'Sin PIN. Si lo activas, se pedirá para «Borrar todo» e «Importar».'}</p>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="pinSet" type="button">${st.pinHash ? 'Cambiar PIN' : 'Crear PIN'}</button>
      ${st.pinHash ? '<button class="btn-ghost" data-act="pinRemove" type="button">Quitar PIN</button>' : ''}
    </div>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">📱 Aplicación</h3>
    ${deferredInstall ? `<button class="btn-primary w-full" data-act="install" type="button">Instalar en la pantalla de inicio</button>` : `<p class="text-xs text-mute">${isStandalone() ? 'Instalada como app ✓' : 'Para instalar: menú ⋮ del navegador → «Instalar aplicación» o «Añadir a pantalla de inicio».'}</p>`}
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="checkUpdate" type="button">Buscar actualización</button>
      <button class="btn-danger" data-act="wipe" type="button">Borrar todo</button>
    </div>
    <p class="text-[11px] text-mute">Versión ${APP_VERSION} · ${state.sessions.length} sesiones · ${Object.keys(state.meals).length} días de dieta</p>
  </section>`;
}

/* ---------- PIN ---------- */
async function hashPin(pin) {
  const data = new TextEncoder().encode('fitnesteban:' + pin);
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const b of data) h = ((h << 5) + h + b) >>> 0; return 'djb2-' + h.toString(16);
}
const pinField = (name, label) => `<label class="lbl">${label}<input class="field mt-1 text-center text-2xl tracking-[0.5em] font-black" name="${name}" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" /></label>`;
const pinVal = (root, name) => mval(root, name).trim();

/* Pide el PIN (o la palabra BORRAR si no hay PIN) y ejecuta onOk si es correcto */
function guardModal({ title, text, danger, word, onOk }) {
  const hasPin = !!state.settings.pinHash;
  let fails = 0;
  openModal(`
    <h3 class="modal-title">${title}</h3>
    <p class="text-sm text-mute">${text}</p>
    ${hasPin ? pinField('pin', 'Introduce tu PIN') : `<label class="lbl">Escribe <strong class="text-white">${word}</strong> para confirmar<input class="field mt-1" name="word" autocomplete="off" autocapitalize="characters" /></label>`}
    <div class="grid grid-cols-3 gap-2 mt-2">
      <button class="btn-ghost" data-close type="button">Cancelar</button>
      <button class="${danger ? 'btn-danger' : 'btn-primary'} col-span-2" data-mact="ok" type="button">${danger || 'Continuar'}</button>
    </div>
  `, {
    autofocus: true,
    ok: async root => {
      if (hasPin) {
        const pin = pinVal(root, 'pin');
        if (!pin) return toast('Introduce el PIN', 'warn');
        if (await hashPin(pin) !== state.settings.pinHash) {
          fails++;
          root.querySelector('[name="pin"]').value = '';
          if (fails >= 5) { closeModal(); return toast('Demasiados intentos. Vuelve a intentarlo más tarde.', 'error'); }
          return toast(`PIN incorrecto (${fails}/5)`, 'error');
        }
      } else if (mval(root, 'word').trim().toUpperCase() !== word) return toast(`Escribe ${word} exactamente`, 'warn');
      closeModal();
      onOk();
    }
  });
}

function pinSetModal() {
  const hasPin = !!state.settings.pinHash;
  openModal(`
    <h3 class="modal-title">${hasPin ? 'Cambiar PIN' : 'Crear PIN'}</h3>
    <p class="text-xs text-mute">De 4 a 8 cifras. Protege contra borrados accidentales: si lo olvidas, tus datos siguen intactos, pero no podrás borrar ni importar desde la app.</p>
    ${hasPin ? pinField('old', 'PIN actual') : ''}
    ${pinField('p1', 'Nuevo PIN')}
    ${pinField('p2', 'Repite el nuevo PIN')}
    <button class="btn-primary w-full mt-2" data-mact="save" type="button">Guardar PIN</button>
  `, {
    autofocus: true,
    save: async root => {
      if (hasPin && await hashPin(pinVal(root, 'old')) !== state.settings.pinHash) return toast('El PIN actual no es correcto', 'error');
      const p1 = pinVal(root, 'p1'), p2 = pinVal(root, 'p2');
      if (!/^\d{4,8}$/.test(p1)) return toast('El PIN debe tener de 4 a 8 cifras', 'warn');
      if (p1 !== p2) return toast('Los dos PIN no coinciden', 'warn');
      state.settings.pinHash = await hashPin(p1);
      persist(); closeModal(); render(); toast('PIN guardado ✓');
    }
  });
}

function backupText() {
  const data = clone(state);
  data.settings.apiKey = '';
  delete data.settings.pinHash;
  for (const k of ['driveConnected', 'driveEmail', 'driveFolderId', 'lastDriveBackup']) delete data.settings[k];
  data.drafts = {};
  data.exportedAt = new Date().toISOString();
  return JSON.stringify(data, null, 1);
}
function markBackup(msg) { state.settings.lastBackup = todayISO(); persist(); render(); toast(msg); }
function exportBackup() {
  const blob = new Blob([backupText()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fitnesteban_backup_${todayISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  markBackup('Copia descargada ✓');
}
/* Compartir la copia (Drive, WhatsApp, correo…) con el menú del móvil.
   Chrome en Android rechaza algunos tipos de archivo (.json) aunque canShare diga que sí:
   por eso se prueba primero .txt (siempre admitido) y, si falla, .json; solo al final se descarga. */
async function shareBackup() {
  const text = backupText();
  const name = `fitnesteban_backup_${todayISO()}`;
  if (!navigator.share) { exportBackup(); return toast('Este navegador no tiene «Compartir»: copia descargada. Ábrela desde Chrome o desde la app instalada.', 'warn'); }
  const candidates = [new File([text], name + '.txt', { type: 'text/plain' }), new File([text], name + '.json', { type: 'application/json' })];
  let lastErr = null;
  for (const file of candidates) {
    if (navigator.canShare && !navigator.canShare({ files: [file] })) { lastErr = new Error(`tipo ${file.type} no admitido`); continue; }
    try {
      await navigator.share({ files: [file], title: 'Copia FITNESTEBAN' });
      return markBackup('Copia compartida ✓');
    } catch (e) {
      if (e.name === 'AbortError') return toast('Copia no compartida', 'warn');
      lastErr = e;
    }
  }
  exportBackup();
  toast(`No se pudo abrir «Compartir» (${lastErr?.name || ''}: ${lastErr?.message || 'desconocido'}). La copia se ha descargado.`, 'warn');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => importText(reader.result);
  reader.readAsText(file);
}
function importText(text) {
  {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('Archivo no válido');
      const incoming = parsed.version === 4 ? normalize(parsed) : migrateV3(parsed);
      const msg = `Copia con ${incoming.sessions.length} sesiones, ${Object.keys(incoming.meals).length} días de dieta y ${incoming.bodyMetrics.length} mediciones.\n\nVa a SUSTITUIR los datos actuales (${state.sessions.length} sesiones). ¿Continuar?`;
      if (!confirm(msg)) return;
      incoming.settings.apiKey = state.settings.apiKey;
      incoming.settings.pinHash = state.settings.pinHash || '';
      for (const k of ['driveConnected', 'driveEmail', 'driveFolderId', 'autoDrive', 'lastDriveBackup', 'lastSeenVersion']) incoming.settings[k] = state.settings[k];
      delete incoming.exportedAt;
      state = incoming;
      ui.dayId = nextDayId();
      persist(); render();
      toast('Datos importados ✓');
    } catch (e) { toast('No se pudo importar: ' + e.message, 'error'); }
  }
}

/* =========================================================================
   GOOGLE DRIVE: copias en la carpeta «FITNESTEBAN – copias»
   Permiso drive.file: la app solo ve los archivos que ella misma crea.
   ========================================================================= */
const GOOGLE_CLIENT_ID = '534557412512-8med3prg1mchie6i4nsb7mmqtje97o6m.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FOLDER = 'FITNESTEBAN – copias';
const DRIVE_KEEP = 30; // copias que se conservan en Drive (las más antiguas se borran)
const TOKEN_KEY = 'fitnesteban_gtoken'; // fuera del estado: nunca va en las copias

let gisPromise = null;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) gisPromise = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => res(); s.onerror = () => { gisPromise = null; rej(new Error('No se pudo cargar el inicio de sesión de Google (¿sin conexión?)')); };
    document.head.appendChild(s);
  });
  return gisPromise;
}
function storedToken() {
  try { const t = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null'); return t && t.exp > Date.now() + 60000 ? t.token : null; } catch { return null; }
}
function saveToken(token, expiresIn) { try { localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, exp: Date.now() + (Number(expiresIn) || 3600) * 1000 })); } catch { /* nada */ } }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch { /* nada */ } }

/* Pide un permiso a Google. Solo con interactive=true puede abrir la ventana de Google (necesita un toque del usuario). */
async function driveToken(interactive) {
  const t = storedToken();
  if (t) return t;
  if (!interactive) return null;
  if (!navigator.onLine) throw new Error('Sin conexión a internet');
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: DRIVE_SCOPE,
      callback: r => {
        if (r.error) return reject(new Error(r.error_description || r.error));
        saveToken(r.access_token, r.expires_in);
        resolve(r.access_token);
      },
      error_callback: e => reject(new Error(e?.type === 'popup_closed' ? 'Ventana de Google cerrada' : e?.type === 'popup_failed_to_open' ? 'El móvil bloqueó la ventana de Google' : (e?.message || 'Error de Google')))
    });
    client.requestAccessToken({ prompt: state.settings.driveConnected ? '' : 'consent' });
  });
}

async function driveFetch(url, opts = {}, interactive = false, retry = true) {
  const token = await driveToken(interactive);
  if (!token) { const e = new Error('Hace falta volver a autorizar Google Drive'); e.needAuth = true; throw e; }
  const r = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
  if (r.status === 401 && retry) { clearToken(); return driveFetch(url, opts, interactive, false); }
  if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error?.message || `Drive respondió ${r.status}`); }
  return r;
}

async function driveFolder(interactive) {
  const s = state.settings;
  const q = encodeURIComponent(`name='${DRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const found = await (await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=10`, {}, interactive)).json();
  if (found.files?.length) { s.driveFolderId = found.files[0].id; return s.driveFolderId; }
  const created = await (await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' })
  }, interactive)).json();
  s.driveFolderId = created.id;
  return s.driveFolderId;
}

async function driveList(interactive) {
  const folder = await driveFolder(interactive);
  const q = encodeURIComponent(`'${folder}' in parents and trashed=false`);
  const r = await (await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)&pageSize=100`, {}, interactive)).json();
  return r.files || [];
}

async function driveUpload(interactive) {
  const folder = await driveFolder(interactive);
  const now = new Date();
  const name = `fitnesteban_backup_${todayISO()}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
  const boundary = 'fb' + Math.random().toString(36).slice(2);
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [folder], mimeType: 'application/json' })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${backupText()}\r\n--${boundary}--`;
  await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body
  }, interactive);
  // limpieza: conserva las DRIVE_KEEP más recientes
  try {
    const files = await driveList(false);
    for (const f of files.slice(DRIVE_KEEP)) await driveFetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, { method: 'DELETE' }, false);
  } catch { /* no es grave */ }
  state.settings.lastDriveBackup = todayISO();
  state.settings.lastBackup = todayISO();
  persist();
}

async function driveConnect() {
  ui.driveBusy = true; render();
  try {
    await driveToken(true);
    state.settings.driveConnected = true;
    try {
      const about = await (await driveFetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)', {}, false)).json();
      state.settings.driveEmail = about.user?.emailAddress || '';
    } catch { /* opcional */ }
    await driveUpload(false);
    persist();
    toast('Drive conectado y primera copia guardada ✓');
  } catch (e) {
    toast('Drive: ' + e.message, 'error');
  } finally { ui.driveBusy = false; render(); }
}
async function driveBackupNow() {
  ui.driveBusy = true; render();
  try { await driveUpload(true); toast('Copia guardada en Drive ✓'); $('#topBanner').innerHTML = ''; }
  catch (e) { toast('Drive: ' + e.message, 'error'); }
  finally { ui.driveBusy = false; render(); }
}
function driveDisconnect() {
  if (!confirm('¿Desconectar Google Drive? Tus copias se quedan en Drive; solo se deja de guardar desde la app.')) return;
  const t = storedToken();
  try { if (t && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(t, () => {}); } catch { /* nada */ }
  clearToken();
  Object.assign(state.settings, { driveConnected: false, driveEmail: '', driveFolderId: '' });
  persist(); render(); toast('Drive desconectado');
}
async function driveRestoreList() {
  ui.driveBusy = true; render();
  let files;
  try { files = await driveList(true); }
  catch (e) { toast('Drive: ' + e.message, 'error'); return; }
  finally { ui.driveBusy = false; render(); }
  if (!files.length) return toast('No hay copias en tu carpeta de Drive', 'warn');
  const label = f => { const d = new Date(f.createdTime); return `${fmtDate(toISO(d))} · ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  openModal(`
    <h3 class="modal-title">Restaurar desde Drive</h3>
    <p class="text-xs text-mute">Elige una copia. Sustituirá todos los datos actuales de la app.</p>
    <div class="space-y-1.5 max-h-[50dvh] overflow-y-auto">
      ${files.slice(0, 30).map((f, i) => `<button class="w-full text-left bg-ink border border-line rounded-xl px-3 py-2.5 flex justify-between items-center" data-mact="pick" data-i="${i}" type="button">
        <span class="text-sm font-semibold">${esc(label(f))}</span><span class="text-[11px] text-mute">${f.size ? Math.round(f.size / 1024) + ' KB' : ''}</span></button>`).join('')}
    </div>
    <button class="btn-ghost w-full" data-close type="button">Cancelar</button>
  `, {
    pick: (root, b) => {
      const f = files[+b.dataset.i];
      const go = async () => {
        try {
          const text = await (await driveFetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {}, true)).text();
          importText(text);
        } catch (e) { toast('Drive: ' + e.message, 'error'); }
      };
      closeModal();
      if (state.settings.pinHash) guardModal({ title: 'Restaurar copia', text: `Se sustituirán tus datos por la copia del ${label(f)}.`, word: 'IMPORTAR', onOk: go });
      else go();
    }
  });
}

/* Al abrir la app: copia semanal automática */
async function maybeAutoDriveBackup() {
  const s = state.settings;
  if (!s.driveConnected || s.autoDrive === false || !navigator.onLine) return;
  const age = s.lastDriveBackup ? daysBetween(s.lastDriveBackup, todayISO()) : 99;
  if (age < 7) return;
  if (storedToken()) {
    try { await driveUpload(false); toast('Copia semanal guardada en Drive ✓'); render(); return; } catch { /* sigue: pide permiso */ }
  }
  $('#topBanner').innerHTML = `<div class="banner-info mt-3"><span>☁️ Toca para guardar la copia semanal en Drive${s.lastDriveBackup ? ` (última hace ${age} días)` : ''}.</span><button class="btn-banner shrink-0" id="doDriveBackup" type="button">Guardar</button></div>`;
  $('#doDriveBackup').onclick = () => driveBackupNow();
  loadGis().catch(() => null); // precarga para que la ventana de Google abra al instante
}

/* =========================================================================
   TEMPORIZADOR DE DESCANSO
   ========================================================================= */
const timer = { endAt: 0, total: 0, int: null, wake: null, ctx: null };
function unlockAudio() {
  try { if (!timer.ctx) timer.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (timer.ctx.state === 'suspended') timer.ctx.resume(); } catch { /* sin audio */ }
}
function beep() {
  const c = timer.ctx; if (!c) return;
  [0, 0.22, 0.44].forEach(t => {
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.18);
    o.connect(g).connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.2);
  });
}
async function wakeOn() { try { if ('wakeLock' in navigator && !timer.wake) timer.wake = await navigator.wakeLock.request('screen'); timer.wake?.addEventListener?.('release', () => { timer.wake = null; }); } catch { /* sin wake lock */ } }
function wakeOff() { try { timer.wake?.release(); } catch { /* nada */ } timer.wake = null; }
function startTimer(sec) {
  unlockAudio();
  timer.total = sec; timer.endAt = Date.now() + sec * 1000;
  clearInterval(timer.int); timer.int = setInterval(tickTimer, 250);
  $('#timerPill').classList.remove('timer-ready'); $('#timerPill').classList.add('timer-run');
  tickTimer(); wakeOn();
}
function addTimer(sec) { if (!timer.endAt) return startTimer(sec); timer.endAt += sec * 1000; timer.total += sec; tickTimer(); }
function stopTimer() {
  clearInterval(timer.int); timer.endAt = 0;
  $('#timerDisplay').textContent = 'Descanso'; $('#timerBar').style.width = '0%';
  $('#timerPill').classList.remove('timer-run', 'timer-ready'); wakeOff();
}
function tickTimer() {
  const leftMs = timer.endAt - Date.now();
  if (leftMs <= 0) {
    clearInterval(timer.int); timer.endAt = 0;
    $('#timerDisplay').textContent = '¡A darle!'; $('#timerBar').style.width = '0%';
    $('#timerPill').classList.remove('timer-run'); $('#timerPill').classList.add('timer-ready');
    try { navigator.vibrate?.([250, 120, 250, 120, 400]); } catch { /* nada */ }
    beep(); wakeOff();
    setTimeout(() => { if (!timer.endAt) { $('#timerDisplay').textContent = 'Descanso'; $('#timerPill').classList.remove('timer-ready'); } }, 5000);
    return;
  }
  const left = Math.ceil(leftMs / 1000);
  $('#timerDisplay').textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
  $('#timerBar').style.width = `${Math.max(0, Math.min(100, leftMs / (timer.total * 1000) * 100))}%`;
}
function openTimerSheet() {
  unlockAudio();
  openModal(`
    <h3 class="modal-title">Descanso</h3>
    <p class="text-xs text-mute -mt-2">Al marcar ✓ en una serie arranca solo con el descanso de ese ejercicio.</p>
    <div class="grid grid-cols-3 gap-2 mt-4">
      ${[45, 60, 90, 120, 150, 180].map(s => `<button class="btn-ghost text-base" data-mact="go" data-s="${s}" type="button">${s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)}` : `${s}s`}</button>`).join('')}
    </div>
    <div class="grid grid-cols-2 gap-2 mt-3">
      <button class="btn-ghost" data-mact="plus" type="button">+15 s</button>
      <button class="btn-danger" data-mact="stop" type="button">Parar</button>
    </div>`, {
    go: (root, b) => { startTimer(parseInt(b.dataset.s, 10)); closeModal(); },
    plus: () => { addTimer(15); closeModal(); },
    stop: () => { stopTimer(); closeModal(); }
  });
}
$('#timerPill').addEventListener('click', openTimerSheet);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (timer.endAt) { tickTimer(); wakeOn(); } if (ui.dietDate > todayISO()) ui.dietDate = todayISO(); } });

/* =========================================================================
   GUÍA Y NOVEDADES
   ========================================================================= */
const CHANGELOG = [
  ['4.7.0', ['☁️ Copias en Google Drive: conéctalo en Ajustes → Copias. Guarda en la carpeta «FITNESTEBAN – copias», copia automática semanal y restaurar desde Drive.']],
  ['4.6.2', ['🧠 El resumen semanal ahora se pliega y recuerda si lo dejaste abierto o cerrado.']],
  ['4.6.1', ['📤 «Compartir copia» corregido en Android: ahora abre el menú de compartir.']],
  ['4.6.0', ['📤 Compartir copia en un toque (Drive, WhatsApp…), en Ajustes y en el aviso de Progreso.', '🧠 Resumen semanal con IA en Progreso: qué va bien, qué mejorar y 3 acciones.', '📉 Peso como tendencia (media de 7 días) con aviso si bajas demasiado rápido o te estancas.', '🏆 Récords personales por ejercicio.', '🔋 Semana de descarga sugerida solo si llevas 6+ semanas seguidas fuertes y hay estancamientos.']],
  ['4.5.0', ['Botón «?» arriba: guía de la app por secciones.', 'Tras cada actualización verás esta ventana de novedades (una sola vez).']],
  ['4.4.1', ['«Comidas habituales» muestra solo las del tipo elegido (Desayuno, Comida…), sin rellenar con otras.']],
  ['4.4.0', ['Editar comidas con ✎: cambia raciones por alimento, totales, descripción o tipo.', '«Comidas habituales»: tus platos más repetidos + buscador en todo el historial.']],
  ['4.3.0', ['Raciones P / M / G / Otra por alimento tras estimar con IA.', 'La descripción manda sobre la foto para afinar cantidades.', 'Bloques de entrenamiento plegables en Ajustes y triángulos más visibles.']],
  ['4.2.2', ['Registro de series plegado en cada ejercicio, con resumen de progreso.']],
  ['4.2.1', ['PIN de seguridad para «Borrar todo» e «Importar», con copia automática antes de borrar.', 'Apartado de IA plegado en Ajustes.']],
  ['4.2.0', ['Botón «▶ Técnica» en cada ejercicio (búsqueda en YouTube o tu vídeo fijado).']],
  ['4.1.0', ['Bloque 🔥 CARDIO: bicicleta y caminata con calorías estimadas, reflejadas en Dieta.']]
];
const cmpVer = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };

const GUIDE = [
  ['🏋️ Entreno: bloques y días', [
    'Arriba eliges el <b>bloque</b> (PPT, FULL BODY, FREE, 🔥 CARDIO) y debajo el <b>día</b>. El punto ● marca el día que te toca según tu rotación; ✓ el que ya hiciste hoy.',
    'Cada bloque lleva su propia rotación: al guardar PUSH, el siguiente que te propone es PULL, y así sucesivamente.',
    '«＋ Bloque» y «＋ Día» crean nuevos. El ✎ del bloque o del día permite renombrar, reordenar (◀ ▶) o eliminar. El historial nunca se borra al eliminar.'
  ]],
  ['🧭 Cómo decide el coach el peso', [
    '<b>Doble progresión</b>: cada ejercicio tiene un rango de reps (p. ej. 8–10). Mantienes el peso y sumas reps; cuando llegas al máximo en <b>todas</b> las series, te dice que subas el incremento (p. ej. +2 kg).',
    'Si no llegas al mínimo <b>dos sesiones seguidas</b> con el mismo peso → baja un 10 %. Tres sesiones sin sumar reps → aviso de estancamiento.',
    'Si hace 14 días o más que no haces un ejercicio → vuelta con −10 %.',
    '🔋 <b>Semana de descarga</b>: solo se sugiere si llevas 6+ semanas seguidas con 3 o más sesiones y hay ejercicios estancados (o 8+ semanas). Durante esa semana: −10 % de peso y mitad de series; esas sesiones no cuentan para la progresión.',
    '«Sesión de calibración» = aún no tiene datos de ese ejercicio (o de esa variante, o de ese bloque). Busca un peso exigente con 1–2 reps en recámara.'
  ]],
  ['📝 Registrar una sesión', [
    'Abre «Registrar series» en cada ejercicio. El peso sugerido ya viene puesto; apunta las reps y pulsa ✓: arranca el descanso de ese ejercicio (vibra y pita al acabar).',
    'Todo se guarda solo mientras escribes: puedes cerrar la app a mitad de sesión.',
    '⇄ cambia de variante, ✎ edita series, rango, descanso, incremento y vídeo. «▶ Técnica» abre YouTube.',
    'Al final, «Guardar sesión»: verás resumen, volumen y récords personales (1RM estimado).'
  ]],
  ['🔥 Cardio', [
    'Elige bicicleta o caminata, minutos e intensidad. «Calcular con IA» estima calorías <b>netas</b> (lo que gastas por encima del reposo) usando tu último peso.',
    'La app compara con un cálculo estándar (MET) y te avisa si la IA se desvía mucho. Puedes corregir el número antes de registrar.',
    'El finisher de bici de los hábitos <b>no suma calorías</b>: si lo haces, regístralo aquí.'
  ]],
  ['🥗 Dieta y raciones', [
    'Foto (cámara o galería) y/o descripción. Lo que escribas <b>manda</b>: «200 g de pollo» fija esa cantidad.',
    'Tras «Estimar macros con IA», ajusta cada alimento con <b>P / M / G</b> (pequeña, mediana, grande) u «Otra» con los gramos exactos. ✕ quita un alimento que la IA vio por error.',
    'Consumidas · Cardio · Neto: el cardio se muestra pero <b>no amplía</b> lo que te queda por comer, salvo que lo actives en Ajustes.',
    '✎ en una comida la edita; ⭐ «Comidas habituales» repite tus platos más frecuentes de ese tipo, y el buscador encuentra cualquiera del historial.'
  ]],
  ['📈 Progreso', [
    'Peso y cintura en ayunas, a la misma hora. La línea del peso es la <b>media de 7 días</b>: el peso diario oscila 1–2 kg por agua y sal. Con 8+ días de pesajes verás la tendencia semanal y si va bien para recomposición (bajar 0,25–1 % por semana o mantener peso bajando cintura).',
    '🧠 <b>Resumen semanal</b>: cada lunes (o cuando quieras) analiza 7 días de fuerza, dieta, cardio y peso, y te da 3 acciones para la semana siguiente.',
    '🏆 <b>Récords personales</b>: mejor peso y mejor 1RM estimado de cada ejercicio, con fecha.',
    '«Fuerza por ejercicio» dibuja tu 1RM estimado (o reps totales en ejercicios sin peso).',
    'En el historial puedes borrar una sesión mal guardada: el coach dejará de tenerla en cuenta.'
  ]],
  ['🔒 Datos, copias y PIN', [
    'Tus datos viven <b>solo en este móvil</b>. Conecta <b>☁️ Google Drive</b> (Ajustes → Copias): cada semana, al abrir la app, se guarda una copia en la carpeta «FITNESTEBAN – copias» (si Google pide confirmar, verás un aviso arriba para hacerlo con un toque). Desde ahí también puedes restaurar. La app te avisa si pasan más de 7 días.',
    'La copia no incluye la clave de Gemini ni el PIN. Al importar se conservan los actuales.',
    'Con PIN activo, «Borrar todo» e «Importar» lo piden. Antes de borrar se descarga una copia automáticamente.',
    'Ábrela siempre desde el icono instalado, no desde Chrome.'
  ]],
  ['🔄 Actualizar la app', [
    'Cuando subes una versión nueva a GitHub aparece «Hay una versión nueva» → Actualizar. Comprueba el número en Ajustes → Aplicación.',
    'Tras actualizar verás una vez las novedades. Puedes volver a verlas desde esta guía.'
  ]]
];

function renderNews(fromVer) {
  const list = CHANGELOG.filter(([v]) => !fromVer || cmpVer(v, fromVer) > 0).slice(0, 4);
  return list.map(([v, items]) => `<div class="mt-3 first:mt-0">
      <div class="text-xs font-extrabold text-brand">Versión ${v}</div>
      <ul class="mt-1 space-y-1 text-sm text-slate-300 list-disc pl-5">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');
}
function openNews(fromVer) {
  openModal(`
    <div class="flex items-center gap-2"><span class="text-2xl">🎉</span><h3 class="modal-title">Novedades</h3><span class="text-xs text-mute ml-auto">v${APP_VERSION}</span></div>
    <div>${renderNews(fromVer)}</div>
    <button class="btn-primary w-full mt-4" data-close type="button">Entendido</button>
  `);
}
function openGuide() {
  openModal(`
    <div class="flex items-center gap-2"><img src="icons/logo-128.png" alt="" class="w-8 h-8 rounded-full" /><h3 class="modal-title">Guía de FITNESTEBAN</h3></div>
    <p class="text-xs text-mute -mt-1">Toca cada apartado para desplegarlo.</p>
    <div class="space-y-2">
      ${GUIDE.map(([title, items]) => `<details class="guide-item">
        <summary class="flex items-center justify-between cursor-pointer select-none text-sm font-bold">${title}<span class="tri"></span></summary>
        <ul class="mt-2 space-y-1.5 text-[13px] text-slate-300 leading-relaxed list-disc pl-5">${items.map(i => `<li>${i}</li>`).join('')}</ul>
      </details>`).join('')}
    </div>
    <div class="grid grid-cols-2 gap-2 mt-3">
      <button class="btn-ghost" data-mact="news" type="button">🎉 Novedades</button>
      <button class="btn-primary" data-close type="button">Cerrar</button>
    </div>
    <p class="text-[11px] text-mute text-center">Versión ${APP_VERSION}</p>
  `, { news: () => openNews(null) });
}
$('#helpBtn').addEventListener('click', openGuide);

function maybeShowNews() {
  const seen = state.settings.lastSeenVersion;
  if (seen === APP_VERSION) return;
  const markSeen = () => { state.settings.lastSeenVersion = APP_VERSION; persist(); };
  const hasData = state.sessions.length || Object.keys(state.meals).length;
  const from = seen || (hasData ? '4.4.1' : null); // sin registro previo: si ya usabas la app, vienes de la 4.4.1
  if (!(from && cmpVer(APP_VERSION, from) > 0)) return markSeen();
  // se marca como vista solo cuando de verdad se muestra (por si la app se recarga justo al arrancar)
  setTimeout(() => { if ($('#modalRoot').classList.contains('open')) return; markSeen(); openNews(from); }, 600);
}

/* =========================================================================
   RENDER Y EVENTOS
   ========================================================================= */
function render() {
  const app = $('#app');
  if (ui.view === 'train') app.innerHTML = renderTrain();
  else if (ui.view === 'diet') app.innerHTML = renderDiet();
  else if (ui.view === 'progress') app.innerHTML = renderProgress();
  else app.innerHTML = renderSettings();
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('navbtn-on', b.dataset.view === ui.view));
  const sub = { train: 'Entreno · coach', diet: 'Nutrición', progress: 'Tu progreso', settings: 'Ajustes' };
  $('#headerSub').textContent = sub[ui.view];
}

function go(view) {
  ui.view = view;
  if (view === 'settings' && navigator.onLine) loadGis().catch(() => null);
  render();
  window.scrollTo({ top: 0 });
}
document.querySelectorAll('.navbtn').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

const actions = {
  pickDay: b => { ui.dayId = b.dataset.day; render(); window.scrollTo({ top: 0 }); },
  pickProg: b => { state.plan.active = b.dataset.prog; ui.dayId = nextDayId(); persist(); render(); window.scrollTo({ top: 0 }); },
  addProg: () => editProgModal(null),
  editProg: () => editProgModal(prog().id),
  editProgId: b => editProgModal(b.dataset.prog),
  cdType: b => { keepCardioInputs(); ui.cardio.type = b.dataset.type; ui.cardio.est = null; render(); },
  cdInt: b => { keepCardioInputs(); ui.cardio.intensity = b.dataset.int; ui.cardio.est = null; render(); },
  cdEstimate: () => estimateCardio(),
  cdCancel: () => { ui.cardio.est = null; render(); },
  cdSave: () => {
    const c = ui.cardio;
    const k = Math.round(num($('#cdKcal').value) ?? -1);
    if (!(k >= 0 && k <= 5000)) return toast('Revisa las calorías', 'warn');
    state.cardio.push({ id: uid('k_'), date: c.date, type: c.type, minutes: parseInt(c.minutes, 10), intensity: c.intensity, kcal: k, ai: !!c.est?.ai });
    persist();
    c.est = null; c.minutes = '';
    render(); toast(`Cardio registrado: ${k} kcal ✓`);
  },
  cdDel: b => { if (!confirm('¿Borrar este registro de cardio?')) return; state.cardio = state.cardio.filter(x => x.id !== b.dataset.id); persist(); render(); },
  addDay: () => editDayModal(null),
  editDay: () => editDayModal(currentDay().id),
  editDayId: b => editDayModal(b.dataset.day),
  addEx: () => editExModal(null),
  editEx: b => editExModal(b.dataset.ex),
  variant: b => {
    const f = findEx(b.dataset.ex); if (!f) return;
    state.selectedVariants[f.ex.id] = ((state.selectedVariants[f.ex.id] || 0) + 1) % f.ex.variants.length;
    persist(); render();
    document.getElementById(`ex-${f.ex.id}`)?.scrollIntoView({ block: 'nearest' });
  },
  setCount: b => {
    const f = findEx(b.dataset.ex); if (!f) return;
    const d = draftOf(currentDay().id);
    d.counts[b.dataset.key] = clamp(setCount(f.ex, b.dataset.key, d) + parseInt(b.dataset.delta, 10), 1, 10);
    persist(); render();
  },
  toggleSets: b => {
    const d = draftOf(currentDay().id);
    d.open[b.dataset.key] = !d.open[b.dataset.key];
    persist(); render();
  },
  doneSet: b => markSetDone(b.dataset.ex, b.dataset.key, parseInt(b.dataset.i, 10)),
  discardDraft: () => { if (confirm('¿Descartar lo apuntado en esta sesión?')) { delete state.drafts[currentDay().id]; persist(); render(); } },
  saveSession: () => saveSession(),

  mealType: b => { ui.mealType = b.dataset.type; render(); },
  photo: () => $('#mealPhotoInput').click(),
  gallery: () => $('#mealGalleryInput').click(),
  clearImg: () => { ui.img = null; render(); },
  analyze: () => analyzeMeal(),
  manualMeal: () => { ui.aiResult = { desc: ui.mealDesc.trim() || ui.mealType, kcal: 0, prot: 0, carbs: 0, fat: 0, note: '' }; render(); },
  portion: b => {
    const it = ui.aiResult?.items?.[+b.dataset.i]; if (!it) return;
    it.sel = b.dataset.size;
    if (it.sel !== 'x') it.grams = it.sizes[it.sel];
    recalcFromItems(ui.aiResult); render();
    if (it.sel === 'x') setTimeout(() => document.querySelector(`[data-portion-g="${b.dataset.i}"]`)?.select(), 0);
  },
  portionEdit: b => { const it = ui.aiResult?.items?.[+b.dataset.i]; if (!it) return; it.fromDesc = false; it.sel = 'x'; render(); },
  portionDel: b => { const a = ui.aiResult; if (!a?.items) return; a.items.splice(+b.dataset.i, 1); recalcFromItems(a); if (!a.items.length) { a.kcal = a.prot = a.carbs = a.fat = 0; } render(); },
  fixKcal: () => { const a = ui.aiResult; a.kcal = Math.round(a.prot * 4 + a.carbs * 4 + a.fat * 9); render(); },
  cancelMeal: () => { ui.aiResult = null; ui.editing = null; render(); },
  confirmMeal: () => {
    const a = ui.aiResult; if (!a) return;
    if (!a.kcal && !a.prot && !a.carbs && !a.fat) return toast('Pon al menos algún valor', 'warn');
    if (ui.editing) {
      const list = state.meals[ui.editing.date] || [];
      const idx = list.findIndex(m => m.id === ui.editing.id);
      if (idx < 0) { ui.editing = null; return toast('No encuentro esa comida', 'error'); }
      list[idx] = mealRecord({ ...a, type: ui.mealType }, list[idx].id);
      persist();
      ui.editing = null; ui.aiResult = null;
      render(); return toast('Comida actualizada ✓');
    }
    addMeal(ui.dietDate, { ...a, type: ui.mealType });
    ui.aiResult = null; ui.img = null; ui.mealDesc = '';
    render(); toast('Comida registrada ✓');
  },
  repeatMeal: b => {
    const e = (ui._picks || [])[parseInt(b.dataset.i, 10)]; if (!e) return;
    ui.editing = null; ui.img = null;
    const keepType = ui.mealType;
    loadMealIntoPanel(e.last, { repeated: true, noteIcon: '⭐', note: `Repetida (la registraste ${e.count} ${e.count === 1 ? 'vez' : 'veces'}, última el ${fmtDateShort(e.lastDate)}). Ajusta cantidades si hace falta y pulsa Registrar.` });
    ui.mealType = keepType; render();
  },
  editMeal: b => {
    const m = mealsOf(ui.dietDate).find(x => x.id === b.dataset.id); if (!m) return;
    ui.editing = { date: ui.dietDate, id: m.id }; ui.img = null;
    loadMealIntoPanel(m, { noteIcon: '✏️', note: m.items?.length ? 'Cambia la ración de cada alimento o los totales.' : '' });
  },
  delMeal: b => {
    if (!confirm('¿Borrar esta comida?')) return;
    if (ui.editing?.id === b.dataset.id) { ui.editing = null; ui.aiResult = null; }
    state.meals[ui.dietDate] = mealsOf(ui.dietDate).filter(m => m.id !== b.dataset.id);
    if (!state.meals[ui.dietDate].length) delete state.meals[ui.dietDate];
    persist(); render();
  },
  dietPrev: () => { ui.editing = null; ui.aiResult = null; ui.dietDate = addDays(ui.dietDate, -1); render(); },
  dietNext: () => { if (ui.dietDate < todayISO()) { ui.editing = null; ui.aiResult = null; ui.dietDate = addDays(ui.dietDate, 1); render(); } },
  goSettings: () => go('settings'),

  saveMetric: () => {
    const date = $('#bmDate').value || todayISO();
    const weight = num($('#bmWeight').value), waist = num($('#bmWaist').value);
    if (weight === null && waist === null) return toast('Introduce peso o cintura', 'warn');
    if (weight !== null && (weight < 30 || weight > 300)) return toast('Ese peso no parece correcto', 'warn');
    if (waist !== null && (waist < 40 || waist > 200)) return toast('Esa cintura no parece correcta', 'warn');
    const ex = state.bodyMetrics.find(m => m.date === date);
    if (ex) { if (weight !== null) ex.weight = weight; if (waist !== null) ex.waist = waist; }
    else state.bodyMetrics.push({ id: uid('m_'), date, weight, waist });
    persist(); render(); toast('Medición guardada ✓');
  },
  delMetric: b => { if (!confirm('¿Borrar esta medición?')) return; state.bodyMetrics = state.bodyMetrics.filter(m => m.id !== b.dataset.id); persist(); render(); },
  delSession: b => { if (!confirm('¿Borrar esta sesión del historial? El coach dejará de tenerla en cuenta.')) return; state.sessions = state.sessions.filter(s => s.id !== b.dataset.id); persist(); render(); },

  toggleKey: () => { state.settings.apiKey = $('#apiKey').value.trim(); ui.showKey = !ui.showKey; render(); },
  saveKey: () => { state.settings.apiKey = $('#apiKey').value.trim(); state.settings.model = $('#apiModel').value.trim() || DEFAULT_MODEL; persist(); toast('Clave guardada en este móvil ✓'); },
  testKey: async b => {
    state.settings.apiKey = $('#apiKey').value.trim(); state.settings.model = $('#apiModel').value.trim() || DEFAULT_MODEL; persist();
    b.disabled = true; b.textContent = 'Probando…';
    try { const r = parseJSONLoose(await callGemini([{ text: 'Responde exactamente este JSON: {"ok": true}' }], { timeout: 20000 })); toast(r.ok ? 'Conexión correcta ✓' : 'Responde, pero raro', r.ok ? 'ok' : 'warn'); }
    catch (e) { toast('Falla: ' + e.message, 'error'); }
    finally { b.disabled = false; b.textContent = 'Probar conexión'; }
  },
  saveGoals: () => {
    const v = id => parseInt($(id).value, 10);
    const g = { targetKcal: v('#tK'), targetProt: v('#tP'), targetCarbs: v('#tC'), targetFat: v('#tF') };
    if (Object.values(g).some(x => !(x > 0))) return toast('Revisa los objetivos', 'warn');
    g.eatBackCardio = $('#tEat').checked;
    Object.assign(state.settings, g); persist(); render(); toast('Objetivos guardados ✓');
  },
  saveHabits: () => { state.settings.habits = $('#habitsTxt').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8); persist(); render(); toast('Hábitos guardados ✓'); },
  resetPlan: () => {
    if (!confirm('¿Restaurar los bloques originales (PPT y FULL BODY)? Perderás los bloques, días y ejercicios que hayas creado o editado (el historial se conserva).')) return;
    state.plan = clone(DEFAULT_PLAN); state.selectedVariants = {}; state.drafts = {}; ui.dayId = nextDayId();
    persist(); render(); toast('Plan restaurado');
  },
  export: () => exportBackup(),
  share: () => shareBackup(),
  driveConnect: () => driveConnect(),
  driveBackup: () => { if (!state.settings.driveConnected) return driveConnect(); driveBackupNow(); },
  driveRestore: () => driveRestoreList(),
  driveDisconnect: () => driveDisconnect(),
  report: () => generateReport(),
  deloadStart: () => { state.deload = { start: todayISO(), end: addDays(todayISO(), 6) }; persist(); render(); toast('Semana de descarga activada 🔋'); },
  deloadSnooze: () => { state.deloadSnooze = addDays(todayISO(), 7); persist(); render(); toast('Te lo vuelvo a sugerir en una semana'); },
  deloadEnd: () => { if (!confirm('¿Terminar la semana de descarga ya?')) return; state.deload.end = addDays(todayISO(), -1); if (state.deload.end < state.deload.start) state.deload.start = state.deload.end; persist(); render(); },
  import: () => {
    if (!state.settings.pinHash) return $('#importInput').click();
    guardModal({ title: 'Importar copia', text: 'Importar sustituye todos tus datos actuales por los de la copia.', word: 'IMPORTAR', onOk: () => $('#importInput').click() });
  },
  install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => null); deferredInstall = null; render(); },
  checkUpdate: async () => {
    if (!swReg) return toast('El modo app solo funciona desde una web https', 'warn');
    try { await swReg.update(); if (swReg.waiting) showUpdate(swReg.waiting); else toast('Ya tienes la última versión'); } catch { toast('No se pudo comprobar', 'error'); }
  },
  wipe: () => guardModal({
    title: 'Borrar todos los datos',
    text: `Se borrarán ${state.sessions.length} sesiones, ${Object.keys(state.meals).length} días de dieta, el cardio, las mediciones y tu plan. Antes se descargará automáticamente una copia de seguridad.`,
    danger: 'Borrar todo', word: 'BORRAR',
    onOk: () => {
      exportBackup();
      const key = state.settings.apiKey, pin = state.settings.pinHash;
      state = defaultState(); state.settings.apiKey = key; state.settings.pinHash = pin; ui.dayId = nextDayId();
      persist(); render(); toast('Datos borrados. Copia descargada por si acaso.');
    }
  }),
  pinSet: () => pinSetModal(),
  pinRemove: () => guardModal({
    title: 'Quitar PIN', text: 'Borrar todo e Importar volverán a pedir solo una palabra de confirmación.', word: 'QUITAR',
    onOk: () => { state.settings.pinHash = ''; persist(); render(); toast('PIN quitado'); }
  }),
};

const app = $('#app');
app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || !app.contains(b)) return;
  const fn = actions[b.dataset.act];
  if (fn) { e.preventDefault(); fn(b); }
});
app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.in) setDraftCell(t.dataset.key, parseInt(t.dataset.i, 10), t.dataset.in, t.value);
  else if (t.id === 'mealDesc') ui.mealDesc = t.value;
  else if (t.id === 'mealSearch') { ui.mealSearch = t.value; const box = $('#mealPicks'); if (box) box.innerHTML = renderPickList(); }
  else if (t.dataset.ai && ui.aiResult) ui.aiResult[t.dataset.ai] = t.dataset.ai === 'desc' ? t.value : (num(t.value) ?? 0);
  else if (t.dataset.portionG !== undefined && ui.aiResult?.items) {
    const it = ui.aiResult.items[+t.dataset.portionG];
    if (it) { it.grams = Math.max(0, num(t.value) ?? 0); recalcFromItems(ui.aiResult); syncResultFields(); }
  }
});
app.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.habit !== undefined) {
    const h = state.settings.habits[parseInt(t.dataset.habit, 10)];
    draftOf(currentDay().id).habits[h] = t.checked; persist();
  } else if (t.dataset.actChange === 'progEx') { ui.progEx = t.value; render(); }
  else if (t.id === 'autoDrive') { state.settings.autoDrive = t.checked; persist(); }
  else if (t.id === 'cdDate') { keepCardioInputs(); ui.cardio.est = null; render(); }
});
app.addEventListener('toggle', e => { if (e.target.id === 'aiBox') ui.aiOpen = e.target.open; if (e.target.id === 'blocksBox') ui.blocksOpen = e.target.open; const k = e.target.dataset?.openKey; if (k) openKeys[k] = e.target.open; }, true);
app.addEventListener('focusin', e => { if (e.target.classList?.contains('field-set')) setTimeout(() => e.target.select?.(), 0); });

async function onMealImage(e) {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try { ui.img = await compressImage(f); render(); } catch (err) { toast(err.message, 'error'); }
}
$('#mealPhotoInput').addEventListener('change', onMealImage);
$('#mealGalleryInput').addEventListener('change', onMealImage);
$('#importInput').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBackup(f); });

/* =========================================================================
   PWA: service worker, instalación, actualizaciones
   ========================================================================= */
let deferredInstall = null;
let swReg = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (ui.view === 'settings') render(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; toast('App instalada ✓'); });

function showUpdate(worker) {
  $('#topBanner').innerHTML = `<div class="banner-info mt-3"><span>Hay una versión nueva de la app.</span><button class="btn-banner shrink-0" id="doUpdate" type="button">Actualizar</button></div>`;
  $('#doUpdate').onclick = () => worker.postMessage('SKIP_WAITING');
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    swReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw); });
    });
  }).catch(err => console.warn('SW', err));
  let refreshing = false;
  const hadController = !!navigator.serviceWorker.controller; // en la primera instalación no hace falta recargar
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing || !hadController) return; refreshing = true; location.reload(); });
  navigator.storage?.persist?.().catch(() => null);
} else if (location.protocol === 'file:') {
  $('#topBanner').innerHTML = `<div class="banner-warn mt-3"><span>Estás abriendo el archivo directamente: sin modo app ni funcionamiento sin conexión. Publícala en una web https (ver LEEME).</span></div>`;
}

/* ---------- Arranque ---------- */
ui.dayId = nextDayId();
render();
maybeShowNews();
setTimeout(() => maybeAutoDriveBackup(), 1500);
