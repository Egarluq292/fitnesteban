'use strict';
/* =========================================================================
   FITNESTEBAN · PWA
   Datos: localStorage (solo en este móvil). Sin fotos guardadas.
   ========================================================================= */

const APP_VERSION = '4.0.4';
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
    { id: 'free', name: 'FREE', days: FREE_DAYS }
  ]
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
  return { targetKcal: 1620, targetProt: 180, targetCarbs: 90, targetFat: 60, apiKey: '', model: DEFAULT_MODEL, habits: [...DEFAULT_HABITS], lastBackup: null };
}
function defaultState() {
  return { version: 4, plan: clone(DEFAULT_PLAN), selectedVariants: {}, memory: {}, sessions: [], bodyMetrics: [], meals: {}, settings: defaultSettings(), drafts: {} };
}
function normalizeExercise(e) {
  const out = {
    id: e.id || uid('c_'), block: e.block || 'Ejercicio',
    sets: clamp(parseInt(e.sets, 10) || 3, 1, 10),
    minReps: clamp(parseInt(e.minReps, 10) || 8, 1, 100),
    maxReps: clamp(parseInt(e.maxReps, 10) || 12, 1, 100),
    increment: num(e.increment) ?? 2,
    rest: clamp(parseInt(e.rest, 10) || 90, 10, 600),
    variants: Array.isArray(e.variants) && e.variants.length ? e.variants.map(v => ({ name: String(v.name || 'Ejercicio'), note: String(v.note || '') })) : [{ name: 'Ejercicio', note: '' }]
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
  programs = programs.map(p => ({ id: p.id || uid('p_'), name: String(p.name || 'BLOQUE').slice(0, 16), days: (p.days || []).map(normalizeDay) }));
  for (const p of programs) if (!p.days.length) p.days.push(normalizeDay({ label: 'DÍA 1', title: 'Día 1' }));
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
  for (const k of ['sessions', 'bodyMetrics']) if (!Array.isArray(out[k])) out[k] = [];
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
  showKey: false
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
  return state.drafts[dayId];
}
function draftHasData(dayId) {
  const d = state.drafts[dayId];
  if (!d) return false;
  return Object.values(d.sets || {}).some(arr => (arr || []).some(c => c && (c.r !== undefined && c.r !== '')));
}
function setCount(e, key, d) { return d.counts[key] ?? e.sets; }
function cellValue(d, key, i, field, c) {
  const v = d.sets[key]?.[i]?.[field];
  if (v !== undefined) return v;
  if (field === 'w' && c.weight !== null && c.weight !== undefined) return fmtNum(c.weight);
  return '';
}
function nextDayId() {
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

function renderTrain() {
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

  const progRow = state.plan.programs.map(p => `<button class="prog ${p.id === prog().id ? 'prog-on' : ''}" data-act="pickProg" data-prog="${esc(p.id)}" type="button">${esc(p.name)}</button>`).join('')
    + `<button class="prog prog-add" data-act="addProg" type="button" aria-label="Añadir bloque">＋ Bloque</button>`;

  return `
  <div class="flex items-center gap-2 -mx-4 px-4 mb-2.5">
    <div class="chips-row flex-1">${progRow}</div>
    <button class="iconbtn iconbtn-sm shrink-0" data-act="editProg" type="button" aria-label="Editar bloque">✎</button>
  </div>
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
  const c = coach(e, key);
  const n = setCount(e, key, d);
  const tone = TONE[c.tone];
  const doneArr = d.done[key] || [];
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
    ${variant.note ? `<p class="text-xs text-mute italic mt-2">${esc(variant.note)}</p>` : ''}
    <div class="coach ${tone.cls} mt-3">
      <div class="font-bold text-sm">${tone.icon} ${esc(c.title)}</div>
      <p class="text-xs mt-1 opacity-90 leading-relaxed">${esc(c.text)}</p>
      ${c.last ? `<p class="text-[11px] mt-1.5 opacity-70">Última vez: ${esc(c.last)}</p>` : ''}
    </div>
    <div class="mt-3 space-y-1.5">${rows}</div>
    <div class="flex items-center justify-between mt-3">
      <button class="btn-mini text-rose-300" data-act="setCount" data-key="${esc(key)}" data-ex="${esc(e.id)}" data-delta="-1" type="button">− Serie</button>
      <span class="text-[11px] text-mute">${n} ${n === 1 ? 'serie' : 'series'} hoy</span>
      <button class="btn-mini text-emerald-300" data-act="setCount" data-key="${esc(key)}" data-ex="${esc(e.id)}" data-delta="1" type="button">+ Serie</button>
    </div>
  </article>`;
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
    const c = coach(f.ex, key);
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
    const c = coach(e, key);
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
    ${isNew ? '<p class="text-[11px] text-mute">Se crea con un día vacío. Añade días con «＋ Día» y ejercicios con «＋ Añadir ejercicio».</p>' : `<p class="text-[11px] text-mute">${p.days.length} días: ${esc(p.days.map(d => d.label).join(' · '))}</p>`}
    <div class="flex gap-2 mt-4">
      ${!isNew ? `<button class="btn-ghost" data-mact="left" type="button" aria-label="Mover a la izquierda">◀</button><button class="btn-ghost" data-mact="right" type="button" aria-label="Mover a la derecha">▶</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew && state.plan.programs.length > 1 ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Eliminar este bloque</button><p class="text-[11px] text-mute mt-2">Eliminar un bloque no borra el historial de sesiones ya guardadas.</p>` : ''}
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
  const variantsTxt = e.variants.map(v => v.note ? `${v.name} | ${v.note}` : v.name).join('\n');
  openModal(`
    <h3 class="modal-title">${isNew ? 'Nuevo ejercicio' : 'Editar ejercicio'}</h3>
    <label class="lbl">Variantes (una por línea · <span class="text-mute">Nombre | nota</span>)
      <textarea class="field mt-1" name="variants" rows="3" placeholder="Curl femoral con mancuerna | Bajada lenta">${esc(variantsTxt)}</textarea>
    </label>
    <p class="text-[11px] text-mute -mt-1">El historial va ligado a la posición de cada variante: añade las nuevas al final.</p>
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
      const variants = mval(root, 'variants').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [name, ...rest] = l.split('|'); return { name: name.trim(), note: rest.join('|').trim() }; });
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
   DIETA
   ========================================================================= */
function mealsOf(date) { return state.meals[date] || []; }
function totalsOf(date) {
  return mealsOf(date).reduce((a, m) => ({ kcal: a.kcal + m.kcal, prot: a.prot + m.prot, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }), { kcal: 0, prot: 0, carbs: 0, fat: 0 });
}
function recentMeals() {
  const seen = new Set(); const out = [];
  const dates = Object.keys(state.meals).sort().reverse();
  for (const dt of dates) for (const m of [...state.meals[dt]].reverse()) {
    const k = normName(m.desc);
    if (!k || seen.has(k)) continue;
    seen.add(k); out.push(m);
    if (out.length >= 10) return out;
  }
  return out;
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
  const leftK = Math.round(st.targetKcal - t.kcal);
  const leftP = Math.round(st.targetProt - t.prot);
  let advice;
  if (!mealsOf(date).length) advice = isToday ? 'Aún no has registrado nada hoy.' : 'Sin registros este día.';
  else if (leftP > 0 && leftK > 0) advice = `Te quedan ${leftK} kcal y ${leftP} g de proteína. Prioriza la proteína: ${leftP > 40 ? 'pavo, claras, atún o un batido' : 'un yogur proteico basta'}.`;
  else if (leftP > 0) advice = `Calorías cubiertas pero faltan ${leftP} g de proteína: tira de fuentes magras (claras, atún, batido con agua).`;
  else if (leftK >= 0) advice = `Proteína cumplida ✓. Margen: ${leftK} kcal.`;
  else advice = `Te has pasado ${-leftK} kcal. Sin drama: mañana vuelve a tu objetivo, no compenses de más.`;

  const typeChips = MEAL_TYPES.map(tp => `<button class="chip chip-sm ${ui.mealType === tp ? 'chip-on' : ''}" data-act="mealType" data-type="${tp}" type="button">${tp}</button>`).join('');
  const recents = recentMeals();
  const grouped = MEAL_TYPES.map(tp => {
    const items = mealsOf(date).filter(m => (m.type || 'Otro') === tp);
    if (!items.length) return '';
    const sub = items.reduce((a, m) => a + m.kcal, 0);
    return `<div class="mt-3 first:mt-0">
      <div class="flex justify-between text-[11px] uppercase tracking-wider text-mute font-bold mb-1.5"><span>${tp}</span><span>${Math.round(sub)} kcal</span></div>
      ${items.map(m => `<div class="meal">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold truncate">${esc(m.desc || tp)}</div>
          <div class="text-[11px] text-mute font-mono mt-0.5">${Math.round(m.kcal)} kcal · P ${Math.round(m.prot)} · C ${Math.round(m.carbs)} · G ${Math.round(m.fat)}</div>
        </div>
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
        <div class="text-3xl font-black">${Math.round(t.kcal)}<span class="text-sm text-mute font-semibold"> / ${st.targetKcal}</span></div></div>
      <div class="text-right"><div class="text-[11px] text-mute font-bold uppercase tracking-wider">Proteína</div>
        <div class="text-3xl font-black text-brand">${Math.round(t.prot)}<span class="text-sm text-mute font-semibold"> / ${st.targetProt} g</span></div></div>
    </div>
    <div class="space-y-2.5 mt-4">
      ${bar('Proteína', t.prot, st.targetProt, { text: 'text-brand', bg: 'bg-brand' })}
      ${bar('Calorías', t.kcal, st.targetKcal, { text: 'text-amber-300', bg: 'bg-amber-400' })}
      ${bar('Carbohidratos', t.carbs, st.targetCarbs, { text: 'text-emerald-300', bg: 'bg-emerald-400' })}
      ${bar('Grasas', t.fat, st.targetFat, { text: 'text-rose-300', bg: 'bg-rose-400' })}
    </div>
    <p class="text-xs text-mute mt-3 leading-relaxed">${esc(advice)}</p>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">➕ Añadir comida</h3>
    <div class="flex flex-wrap gap-1.5">${typeChips}</div>
    <textarea class="field" id="mealDesc" rows="2" placeholder="Ej: 200 g de pechuga a la plancha y 150 g de arroz">${esc(ui.mealDesc)}</textarea>
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
    ${!state.settings.apiKey ? `<p class="text-[11px] text-amber-300">Para usar la IA, pega tu clave de Gemini en <button class="underline" data-act="goSettings" type="button">Ajustes</button>.</p>` : ''}
    ${ai ? renderMealResult(ai) : ''}
  </section>

  ${recents.length ? `<section class="card p-4 mt-3">
    <h3 class="section-title">⏱ Repetir comida reciente</h3>
    <p class="text-[11px] text-mute mt-1">Se añade como «${esc(ui.mealType)}» al día mostrado.</p>
    <div class="flex flex-wrap gap-1.5 mt-2.5">
      ${recents.map((m, i) => `<button class="chip chip-sm text-left" data-act="repeatMeal" data-i="${i}" type="button">${esc((m.desc || m.type).slice(0, 34))} <span class="text-mute">· ${Math.round(m.kcal)}</span></button>`).join('')}
    </div>
  </section>` : ''}

  <section class="card p-4 mt-3">
    <h3 class="section-title">🍽️ Registro ${isToday ? 'de hoy' : 'del día'}</h3>
    <div class="mt-3">${grouped || '<p class="text-sm text-mute">Nada registrado.</p>'}</div>
  </section>`;
}

function renderMealResult(ai) {
  const calc = Math.round(ai.prot * 4 + ai.carbs * 4 + ai.fat * 9);
  const mismatch = ai.kcal > 0 && Math.abs(calc - ai.kcal) / ai.kcal > 0.15;
  return `<div class="border-t border-line pt-3 space-y-3">
    ${ai.note ? `<div class="text-xs text-mute bg-ink rounded-xl p-2.5 border border-line">🤖 ${esc(ai.note)}</div>` : ''}
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
      <button class="btn-primary col-span-2" data-act="confirmMeal" type="button">✅ Registrar</button>
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
    const prompt = `Eres un nutricionista deportivo. Estima los macronutrientes de esta comida a partir de la foto y/o la descripción.
Si la descripción da cantidades, úsalas. Si no, estima raciones habituales en España según la foto. No inventes ingredientes que no se vean ni se mencionen.
Responde SOLO con JSON válido con estas claves:
{"dish_name": "nombre breve", "calories": número, "protein": número (g), "carbs": número (g), "fat": número (g), "confidence": "alta" | "media" | "baja", "explanation": "desglose breve por ingrediente, máximo 2 frases"}
Descripción del usuario: ${desc ? JSON.stringify(desc) : '(sin descripción, usa solo la foto)'}`;
    const parts = [{ text: prompt }];
    if (ui.img) parts.push({ inlineData: { mimeType: 'image/jpeg', data: ui.img.split(',')[1] } });
    const res = parseJSONLoose(await callGemini(parts));
    ui.aiResult = {
      desc: desc || res.dish_name || ui.mealType,
      kcal: num(res.calories) || 0, prot: num(res.protein) || 0, carbs: num(res.carbs) || 0, fat: num(res.fat) || 0,
      note: `${res.dish_name || 'Comida'}${res.confidence ? ` (confianza ${res.confidence})` : ''}: ${res.explanation || ''}`
    };
  } catch (e) {
    toast('IA: ' + e.message, 'error');
  } finally {
    ui.aiBusy = false; render();
  }
}

function addMeal(date, m) {
  if (!state.meals[date]) state.meals[date] = [];
  state.meals[date].push({ id: uid('f_'), type: m.type || ui.mealType, desc: m.desc || '', kcal: r2(m.kcal || 0), prot: r2(m.prot || 0), carbs: r2(m.carbs || 0), fat: r2(m.fat || 0) });
  persist();
}

/* =========================================================================
   PROGRESO
   ========================================================================= */
function lineChart(pts, { color = '#00d2df', unit = '', label = '' } = {}) {
  if (pts.length < 2) return `<div class="text-xs text-mute py-6 text-center">Necesito al menos 2 registros para dibujar ${esc(label || 'la gráfica')}.</div>`;
  const W = 340, H = 150, pl = 36, pr = 12, pt = 14, pb = 22;
  const xs = pts.map(p => parseISO(p.x).getTime());
  const ys = pts.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x1 === x0) x1 = x0 + 86400000;
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
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
    ${pts.length <= 40 ? pts.map((p, i) => `<circle cx="${X(xs[i]).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" fill="#05080a" stroke="${color}" stroke-width="1.6"/>`).join('') : ''}
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
  ${needBackup ? `<div class="banner-warn mb-3"><span>${backupAge === null ? 'Aún no has hecho copia de seguridad.' : `Última copia hace ${backupAge} días.`} Si borras datos del navegador, lo pierdes todo.</span><button class="btn-banner btn-banner-warn shrink-0" data-act="export" type="button">Exportar</button></div>` : ''}

  <section class="grid grid-cols-3 gap-2">
    <div class="stat"><div class="stat-v">${w.sessionsWeek}</div><div class="stat-l">sesiones esta semana</div></div>
    <div class="stat"><div class="stat-v">${w.avgK ?? '—'}</div><div class="stat-l">kcal media 7 días${w.avgK ? ` · obj. ${st.targetKcal}` : ''}</div></div>
    <div class="stat"><div class="stat-v ${w.avgP !== null && w.avgP < st.targetProt * 0.9 ? 'text-amber-300' : ''}">${w.avgP ?? '—'}</div><div class="stat-l">g prot media${w.avgP ? ` · obj. ${st.targetProt}` : ''}</div></div>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">📏 Peso y cintura (en ayunas)</h3>
    <div class="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
      <label class="lbl">Fecha<input class="field mt-1 px-2" type="date" id="bmDate" value="${todayISO()}" max="${todayISO()}" /></label>
      <label class="lbl">Peso (kg)<input class="field mt-1" id="bmWeight" inputmode="decimal" placeholder="${wPts.length ? fmtNum(wPts[wPts.length - 1].y) : '85,0'}" /></label>
      <label class="lbl">Cintura (cm)<input class="field mt-1" id="bmWaist" inputmode="decimal" placeholder="${cPts.length ? fmtNum(cPts[cPts.length - 1].y) : '96'}" /></label>
    </div>
    <button class="btn-primary w-full" data-act="saveMetric" type="button">Registrar medición</button>
    <div>
      <div class="flex justify-between text-[11px] text-mute"><span>Peso</span><span>${delta(wPts, 'kg')}</span></div>
      ${lineChart(wPts, { color: '#00d2df', unit: ' kg', label: 'el peso' })}
    </div>
    <div>
      <div class="flex justify-between text-[11px] text-mute"><span>Cintura</span><span>${delta(cPts, 'cm')}</span></div>
      ${lineChart(cPts, { color: '#fbbf24', unit: ' cm', label: 'la cintura' })}
    </div>
    ${bm.length ? `<details class="text-xs"><summary class="text-mute cursor-pointer">Ver registros (${bm.length})</summary>
      <div class="space-y-1 mt-2">${bm.slice().reverse().map(m => `<div class="flex items-center justify-between bg-ink rounded-lg px-2.5 py-1.5">
        <span class="text-mute">${fmtDate(m.date)}</span><span>${m.weight !== null ? fmtNum(m.weight) + ' kg' : '—'}</span><span class="text-amber-300">${m.waist !== null ? fmtNum(m.waist) + ' cm' : '—'}</span>
        <button class="iconbtn iconbtn-sm" data-act="delMetric" data-id="${esc(m.id)}" type="button" aria-label="Borrar">✕</button></div>`).join('')}</div></details>` : ''}
  </section>

  <section class="card p-4 mt-3">
    <h3 class="section-title mb-3">🏋️ Fuerza por ejercicio</h3>
    ${strengthHtml}
  </section>

  <section class="card p-4 mt-3">
    <h3 class="section-title">📚 Historial de sesiones</h3>
    <div class="space-y-2 mt-3">
      ${hist.length ? hist.map(s => `<details class="bg-ink rounded-xl border border-line">
        <summary class="px-3 py-2.5 flex justify-between items-center cursor-pointer text-sm"><span class="font-semibold truncate">${esc(s.dayTitle || s.dayId)}</span><span class="text-[11px] text-mute shrink-0 ml-2">${fmtDate(s.date)}</span></summary>
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
  <section class="card p-4 space-y-3">
    <h3 class="section-title">🤖 IA de nutrición (Gemini)</h3>
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
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">🎯 Objetivos diarios</h3>
    <div class="grid grid-cols-4 gap-2">
      <label class="lbl">kcal<input class="field mt-1 text-center" id="tK" inputmode="numeric" value="${st.targetKcal}" /></label>
      <label class="lbl">Prot g<input class="field mt-1 text-center" id="tP" inputmode="numeric" value="${st.targetProt}" /></label>
      <label class="lbl">Carb g<input class="field mt-1 text-center" id="tC" inputmode="numeric" value="${st.targetCarbs}" /></label>
      <label class="lbl">Grasa g<input class="field mt-1 text-center" id="tF" inputmode="numeric" value="${st.targetFat}" /></label>
    </div>
    <p class="text-[11px] ${Math.abs(sumK - st.targetKcal) > st.targetKcal * 0.05 ? 'text-amber-300' : 'text-mute'}">Tus macros suman ${sumK} kcal (objetivo ${st.targetKcal}).</p>
    <button class="btn-primary w-full" data-act="saveGoals" type="button">Guardar objetivos</button>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">🗓️ Bloques de entrenamiento</h3>
    ${state.plan.programs.map(p => `<div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <div class="text-sm font-extrabold ${p.id === prog().id ? 'text-brand' : ''}">${esc(p.name)}${p.id === prog().id ? ' <span class="text-[10px] font-semibold">· activo</span>' : ''}</div>
        <button class="iconbtn iconbtn-sm" data-act="editProgId" data-prog="${esc(p.id)}" type="button" aria-label="Editar bloque">✎</button>
      </div>
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
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">✅ Hábitos del remate</h3>
    <textarea class="field" id="habitsTxt" rows="3" placeholder="Uno por línea">${esc(st.habits.join('\n'))}</textarea>
    <button class="btn-primary w-full" data-act="saveHabits" type="button">Guardar hábitos</button>
  </section>

  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">💾 Copias de seguridad</h3>
    <p class="text-xs text-mute">${backupAge === null ? 'Nunca has exportado una copia.' : `Última copia: hace ${backupAge} día${backupAge === 1 ? '' : 's'}.`} Tus datos viven solo en este móvil: exporta cada semana y guarda el archivo en Drive o similar.</p>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-primary" data-act="export" type="button">Exportar</button>
      <button class="btn-ghost" data-act="import" type="button">Importar</button>
    </div>
    <p class="text-[11px] text-mute">Importar admite copias de esta versión y de la versión anterior (fitnesteban_backup.json).</p>
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

function exportBackup() {
  const data = clone(state);
  data.settings.apiKey = '';
  data.drafts = {};
  data.exportedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fitnesteban_backup_${todayISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  state.settings.lastBackup = todayISO();
  persist(); render();
  toast('Copia exportada ✓');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== 'object') throw new Error('Archivo no válido');
      const incoming = parsed.version === 4 ? normalize(parsed) : migrateV3(parsed);
      const msg = `Copia con ${incoming.sessions.length} sesiones, ${Object.keys(incoming.meals).length} días de dieta y ${incoming.bodyMetrics.length} mediciones.\n\nVa a SUSTITUIR los datos actuales (${state.sessions.length} sesiones). ¿Continuar?`;
      if (!confirm(msg)) return;
      incoming.settings.apiKey = state.settings.apiKey;
      delete incoming.exportedAt;
      state = incoming;
      ui.dayId = nextDayId();
      persist(); render();
      toast('Datos importados ✓');
    } catch (e) { toast('No se pudo importar: ' + e.message, 'error'); }
  };
  reader.readAsText(file);
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
   RENDER Y EVENTOS
   ========================================================================= */
function render() {
  const app = $('#app');
  if (ui.view === 'train') app.innerHTML = renderTrain();
  else if (ui.view === 'diet') app.innerHTML = renderDiet();
  else if (ui.view === 'progress') app.innerHTML = renderProgress();
  else app.innerHTML = renderSettings();
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('navbtn-on', b.dataset.view === ui.view));
  const sub = { train: 'Entreno · coach de progresión', diet: 'Nutrición', progress: 'Tu progreso', settings: 'Ajustes' };
  $('#headerSub').textContent = sub[ui.view];
}

function go(view) {
  ui.view = view;
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
  doneSet: b => markSetDone(b.dataset.ex, b.dataset.key, parseInt(b.dataset.i, 10)),
  discardDraft: () => { if (confirm('¿Descartar lo apuntado en esta sesión?')) { delete state.drafts[currentDay().id]; persist(); render(); } },
  saveSession: () => saveSession(),

  mealType: b => { ui.mealType = b.dataset.type; render(); },
  photo: () => $('#mealPhotoInput').click(),
  gallery: () => $('#mealGalleryInput').click(),
  clearImg: () => { ui.img = null; render(); },
  analyze: () => analyzeMeal(),
  manualMeal: () => { ui.aiResult = { desc: ui.mealDesc.trim() || ui.mealType, kcal: 0, prot: 0, carbs: 0, fat: 0, note: '' }; render(); },
  fixKcal: () => { const a = ui.aiResult; a.kcal = Math.round(a.prot * 4 + a.carbs * 4 + a.fat * 9); render(); },
  cancelMeal: () => { ui.aiResult = null; render(); },
  confirmMeal: () => {
    const a = ui.aiResult; if (!a) return;
    if (!a.kcal && !a.prot && !a.carbs && !a.fat) return toast('Pon al menos algún valor', 'warn');
    addMeal(ui.dietDate, { ...a, type: ui.mealType });
    ui.aiResult = null; ui.img = null; ui.mealDesc = '';
    render(); toast('Comida registrada ✓');
  },
  repeatMeal: b => {
    const m = recentMeals()[parseInt(b.dataset.i, 10)]; if (!m) return;
    addMeal(ui.dietDate, { ...m, type: ui.mealType });
    render(); toast(`Añadido: ${m.desc}`);
  },
  delMeal: b => {
    if (!confirm('¿Borrar esta comida?')) return;
    state.meals[ui.dietDate] = mealsOf(ui.dietDate).filter(m => m.id !== b.dataset.id);
    if (!state.meals[ui.dietDate].length) delete state.meals[ui.dietDate];
    persist(); render();
  },
  dietPrev: () => { ui.dietDate = addDays(ui.dietDate, -1); render(); },
  dietNext: () => { if (ui.dietDate < todayISO()) { ui.dietDate = addDays(ui.dietDate, 1); render(); } },
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
    Object.assign(state.settings, g); persist(); render(); toast('Objetivos guardados ✓');
  },
  saveHabits: () => { state.settings.habits = $('#habitsTxt').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8); persist(); render(); toast('Hábitos guardados ✓'); },
  resetPlan: () => {
    if (!confirm('¿Restaurar los bloques originales (PPT y FULL BODY)? Perderás los bloques, días y ejercicios que hayas creado o editado (el historial se conserva).')) return;
    state.plan = clone(DEFAULT_PLAN); state.selectedVariants = {}; state.drafts = {}; ui.dayId = nextDayId();
    persist(); render(); toast('Plan restaurado');
  },
  export: () => exportBackup(),
  import: () => $('#importInput').click(),
  install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => null); deferredInstall = null; render(); },
  checkUpdate: async () => {
    if (!swReg) return toast('El modo app solo funciona desde una web https', 'warn');
    try { await swReg.update(); if (swReg.waiting) showUpdate(swReg.waiting); else toast('Ya tienes la última versión'); } catch { toast('No se pudo comprobar', 'error'); }
  },
  wipe: () => {
    if (!confirm('¿Borrar TODOS los datos de la app en este móvil? Esto no se puede deshacer.')) return;
    if (prompt('Escribe BORRAR para confirmar') !== 'BORRAR') return;
    const key = state.settings.apiKey;
    state = defaultState(); state.settings.apiKey = key; ui.dayId = nextDayId();
    persist(); render(); toast('Datos borrados');
  }
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
  else if (t.dataset.ai && ui.aiResult) ui.aiResult[t.dataset.ai] = t.dataset.ai === 'desc' ? t.value : (num(t.value) ?? 0);
});
app.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.habit !== undefined) {
    const h = state.settings.habits[parseInt(t.dataset.habit, 10)];
    draftOf(currentDay().id).habits[h] = t.checked; persist();
  } else if (t.dataset.actChange === 'progEx') { ui.progEx = t.value; render(); }
});
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
  navigator.serviceWorker.register('sw.js').then(reg => {
    swReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw); });
    });
  }).catch(err => console.warn('SW', err));
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
  navigator.storage?.persist?.().catch(() => null);
} else if (location.protocol === 'file:') {
  $('#topBanner').innerHTML = `<div class="banner-warn mt-3"><span>Estás abriendo el archivo directamente: sin modo app ni funcionamiento sin conexión. Publícala en una web https (ver LEEME).</span></div>`;
}

/* ---------- Arranque ---------- */
ui.dayId = nextDayId();
render();
