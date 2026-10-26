'use strict';
/* =========================================================================
   FITNESTEBAN · PWA
   Datos: localStorage (solo en este móvil). Sin fotos guardadas.
   ========================================================================= */

const APP_VERSION = '4.27.4';
const STORE_KEY = 'fitnesteban_v4';
const OLD_KEY = 'fitnesteban_v3';
const DEFAULT_MODEL = 'gemini-3-flash-preview';
const MEAL_TYPES = ['Desayuno', 'Comida', 'Puente', 'Cena', 'Otro'];
const DEFAULT_HABITS = [
  'Finisher bici estática: 15 min continuo / HIIT',
  'Puente proteico (19:30): batido / yogur / pavo',
  'Pacto 0,0: cero alcohol hoy entre semana'
];

/* Hábitos: días en orden de getDay() (0 = domingo); se muestran de lunes a domingo */
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0], DAY_LETTER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
function daysLabel(days) {
  const set = new Set(days);
  if (set.size === 7) return 'Todos los días';
  if (set.size === 5 && [1, 2, 3, 4, 5].every(d => set.has(d))) return 'L–V';
  if (set.size === 2 && set.has(6) && set.has(0)) return 'Fines de semana';
  return WEEK_ORDER.filter(d => set.has(d)).map(d => DAY_LETTER[d]).join(' · ') || 'Ningún día';
}
const dailyHabitsFor = date => (state.settings.habitList || []).filter(h => h.where === 'daily' && h.days.includes(parseISO(date).getDay()));
const habitDone = (date, name) => (state.habitLog[date] || []).includes(name);

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

/* 4.27: alternativas para los ejercicios de serie (se añaden una sola vez al final de sus variantes) */
const EX_ALTS = {"d1_goblet": [["Prensa de piernas", "Pies a media altura, sin bloquear rodillas."], ["Sentadilla frontal con barra", "Codos altos, torso erguido."]], "d1_bench": [["Press en suelo con mancuernas", "Codos a 45º, pausa abajo."], ["Press de pecho en máquina", "Recorrido completo."]], "d1_incline": [["Press inclinado con barra", "Banco a 30º."]], "d1_shoulder": [["Press Arnold", "Gira las muñecas al subir."], ["Press de hombro con kettlebell", "A una mano, core firme."]], "d1_lat": [["Elevaciones laterales en polea", "Tensión constante."], ["Elevaciones laterales con banda", "Controla la bajada."]], "d1_triceps": [["Press francés con mancuernas + rueda", "Anota repeticiones de tríceps."], ["Extensión de tríceps en polea + rueda", "Anota repeticiones de tríceps."]], "d2_rdl": [["Peso muerto rumano con mancuernas", "Mancuernas pegadas a las piernas."], ["Buenos días con barra", "Cadera atrás, rodillas suaves."]], "d2_swings": [["Swing a una mano", "Cambia de mano a mitad de serie."], ["Thruster con kettlebell", "Sentadilla + press en un solo gesto."]], "d2_pullup": [["Dominadas asistidas con banda", "Banda bajo las rodillas. 0 kg = peso corporal."], ["Dominadas negativas", "Baja en 4–5 s. 0 kg = peso corporal."]], "d2_row": [["Remo en polea baja", "Espalda neutra, codos atrás."], ["Remo con barra", "Torso a ~45º."]], "d2_rear": [["Pájaros con mancuernas", "Torso inclinado, codos suaves."], ["Apertura con banda", "Brazos rectos a la altura del pecho."]], "d2_biceps": [["Curl con mancuernas alterno", "Supina al subir."], ["Curl en polea", "Tensión constante."]], "d3_ss1_push": [["Press de banca con barra", "Alterna con A2."], ["Press en suelo con mancuernas", "Alterna con A2."]], "d3_ss1_pull": [["Remo invertido en TRX", "Cuerpo recto. 0 kg = peso corporal."], ["Dominadas con agarre neutro", "0 kg = peso corporal."]], "d3_ss2_push": [["Flexiones diamante", "Codos pegados. 0 kg = peso corporal."], ["Fondos en banco", "Hombros abajo. 0 kg = peso corporal."]], "d3_ss2_pull": [["Remo en polea baja", "Aprieta escápulas."], ["Remo con barra", "Aprieta escápulas."]], "d3_arms": [["Curl martillo + press francés", "Superserie sin descanso."], ["Curl en polea + extensión en polea", "Superserie sin descanso."]], "d3_spartan": [["Sentadilla goblet + swings + plancha", "A tope de intensidad."], ["Zancadas con mancuernas + remo + rueda", "A tope de intensidad."]], "fa_squat": [["Sentadilla frontal", "Codos altos."], ["Prensa de piernas", "Sin bloquear rodillas."]], "fa_bench": [["Press de banca con mancuernas", "Bajada en 2 s."], ["Press de pecho en máquina", "Recorrido completo."]], "fa_row": [["Remo con mancuerna a una mano", "Codo hacia la cadera."], ["Remo en polea baja", "Espalda neutra."]], "fa_legcurl": [["Curl femoral sentado", "Bajada lenta."], ["Peso muerto rumano con mancuernas", "Cadera atrás, espalda neutra."]], "fa_ohp": [["Press militar sentado con mancuernas", "Rango completo."], ["Press Arnold", "Gira las muñecas al subir."]], "fa_lat": [["Elevaciones laterales en polea", "Tensión constante."], ["Elevaciones laterales con banda", "Controla la bajada."]], "fa_curl": [["Curl con mancuernas alterno", "Supina al subir."], ["Curl en polea", "Tensión constante."]], "fa_hammer": [["Curl martillo en polea con cuerda", "Codos fijos."], ["Curl Zottman", "Sube supino, baja prono."]], "fb_deadlift": [["Peso muerto con barra hexagonal", "Empuja el suelo."], ["Peso muerto rumano", "Cadera atrás, espalda neutra."]], "fb_pullup": [["Dominadas asistidas con banda", "Banda bajo las rodillas. 0 kg = peso corporal."], ["Dominadas negativas", "Baja en 4–5 s. 0 kg = peso corporal."]], "fb_incline": [["Press inclinado con barra", "Banco a 30º."], ["Press inclinado en máquina", "Recorrido completo."]], "fb_squat": [["Sentadilla búlgara", "Reps por pierna."], ["Prensa de piernas", "Sin bloquear rodillas."]], "fb_hipthrust": [["Puente de glúteo con barra", "Pausa arriba."], ["Hip thrust a una pierna", "Reps por pierna."]], "fb_face": [["Pájaros con mancuernas", "Torso inclinado."], ["Apertura con banda", "Brazos rectos."]], "fb_triceps": [["Press francés con mancuernas", "Codos fijos."], ["Fondos en banco con lastre", "Hombros abajo."]], "fb_calf": [["Elevación de gemelos sentado", "Pausa arriba."], ["Elevación de gemelos a una pierna", "Apoyado en un escalón."]]};

const DEFAULT_PLAN = {
  active: 'ppt',
  programs: [
    { id: 'retos', name: 'RETOS', icon: '🏆', type: 'retos', days: [] },
    { id: 'ppt', name: 'PPT', days: PPT_DAYS },
    { id: 'fullbody', name: 'FULL BODY', days: FULLBODY_DAYS },
    { id: 'cardio', name: 'CARDIO', icon: '🔥', type: 'cardio', days: [] },
    { id: 'free', name: 'FREE', days: FREE_DAYS }
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
  return { targetKcal: 1620, targetProt: 180, targetCarbs: 90, targetFat: 60, apiKey: '', model: DEFAULT_MODEL, habits: [], habitList: [], lastBackup: null, eatBackCardio: false, minProtMeal: 25, pinHash: '', lastSeenVersion: '', driveConnected: false, driveEmail: '', driveFolderId: '', autoDrive: true, lastDriveBackup: null, swipeNav: true, swipeMode: '', profile: null };
}
function defaultState() {
  return { version: 4, plan: normalizePlan(clone(DEFAULT_PLAN)), selectedVariants: {}, memory: {}, sessions: [], bodyMetrics: [], meals: {}, cardio: [], reports: [], deload: null, deloadSnooze: '', settings: defaultSettings(), drafts: {}, chat: null, chats: [], retos: {}, accessNames: {}, accessCodes: {}, habitLog: {} };
}
const safeUrl = u => { const t = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(t) ? t : ''; };
const videoUrl = v => v.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(v.name + ' técnica correcta')}`;

const BW_DEFAULT = new Set(['d2_pullup', 'd3_ss1_pull', 'd3_ss2_push', 'fb_pullup']);
function normalizeExercise(e) {
  const out = {
    id: e.id || uid('c_'), block: e.block || 'Ejercicio',
    sets: clamp(parseInt(e.sets, 10) || 3, 1, 10),
    minReps: clamp(parseInt(e.minReps, 10) || 8, 1, 100),
    maxReps: clamp(parseInt(e.maxReps, 10) || 12, 1, 100),
    increment: num(e.increment) ?? 2,
    rest: clamp(parseInt(e.rest, 10) || 90, 10, 600),
    bw: typeof e.bw === 'boolean' ? e.bw : BW_DEFAULT.has(e.id),
    variants: Array.isArray(e.variants) && e.variants.length ? e.variants.map(v => ({ name: String(v.name || 'Ejercicio'), note: String(v.note || ''), video: safeUrl(v.video) })) : [{ name: 'Ejercicio', note: '', video: '' }]
  };
  if (out.maxReps < out.minReps) out.maxReps = out.minReps;
  out.alts27 = true;
  if (!e.alts27 && EX_ALTS[out.id]) for (const [name, note] of EX_ALTS[out.id]) if (!out.variants.some(v => v.name.toLowerCase() === name.toLowerCase())) out.variants.push({ name, note, video: '' });
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
  if (!programs.some(p => p.type === 'retos')) programs.push(clone(DEFAULT_PLAN.programs.find(p => p.type === 'retos')));
  programs = programs.map(p => ({
    id: p.id || uid('p_'), name: String(p.name || 'BLOQUE').slice(0, 16), icon: p.icon || '',
    type: p.type === 'cardio' || p.type === 'retos' ? p.type : 'strength',
    days: p.type === 'cardio' || p.type === 'retos' ? [] : (p.days || []).map(normalizeDay)
  }));
  for (const p of programs) if (p.type === 'strength' && !p.days.length) p.days.push(normalizeDay({ label: 'DÍA 1', title: 'Día 1' }));
  const active = programs.some(p => p.id === plan?.active) ? plan.active : (programs.find(p => p.type === 'strength') || programs[0]).id;
  return { active, programs };
}
function normalize(s) {
  const d = defaultState();
  const out = { ...d, ...s };
  out.settings = { ...d.settings, ...(s.settings || {}) };
  if (!Array.isArray(out.settings.habits)) out.settings.habits = [...DEFAULT_HABITS];
  // 4.25: hábitos con sitio (Entreno o Diario) y días; settings.habits sigue siendo la lista de los de Entreno
  if (!Array.isArray(s.settings?.habitList)) out.settings.habitList = out.settings.habits.map(name => ({ name, where: 'train', days: [...ALL_DAYS] }));
  out.settings.habitList = out.settings.habitList.filter(h => h && h.name).map(h => ({ name: String(h.name).slice(0, 60), where: h.where === 'daily' ? 'daily' : 'train', days: Array.isArray(h.days) && h.days.length ? h.days.filter(d => d >= 0 && d <= 6) : [...ALL_DAYS] }));
  out.settings.habits = out.settings.habitList.filter(h => h.where === 'train').map(h => h.name);
  if (!out.habitLog || typeof out.habitLog !== 'object' || Array.isArray(out.habitLog)) out.habitLog = {};
  out.plan = normalizePlan(out.plan);
  for (const k of ['selectedVariants', 'memory', 'meals', 'drafts']) if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {};
  for (const k of ['sessions', 'bodyMetrics', 'cardio', 'reports']) if (!Array.isArray(out[k])) out[k] = [];
  // 4.15: orden de bloques RETOS · PPT · FULL BODY · CARDIO · FREE (una sola vez; luego manda tu orden)
  if (!out.settings.blockOrder415) {
    const rank = p => p.type === 'retos' ? 0 : p.id === 'ppt' ? 1 : p.id === 'fullbody' ? 2 : p.type === 'cardio' ? 3 : p.id === 'free' ? 4 : 5;
    out.plan.programs = out.plan.programs.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map(x => x.p);
    out.settings.blockOrder415 = true;
  }
  if (!out.accessNames || typeof out.accessNames !== 'object' || Array.isArray(out.accessNames)) out.accessNames = {};
  if (!out.accessCodes || typeof out.accessCodes !== 'object' || Array.isArray(out.accessCodes)) out.accessCodes = {};
  if (!out.retos || typeof out.retos !== 'object' || Array.isArray(out.retos)) out.retos = {};
  for (const k of Object.keys(out.retos)) { const r = out.retos[k]; if (!r || !Array.isArray(r.history)) { delete out.retos[k]; continue; } if (!Array.isArray(r.tests)) r.tests = []; }
  if (!out.chat || typeof out.chat !== 'object' || !Array.isArray(out.chat.msgs)) out.chat = null;
  if (!Array.isArray(out.chats)) out.chats = [];
  if (out.chat && !out.chats.length) out.chats = [{ id: 'c_old', at: out.chat.at || Date.now(), msgs: out.chat.msgs }];
  out.chat = null;
  out.chats = out.chats.filter(c => c && Array.isArray(c.msgs) && c.msgs.length);
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

let bootRaw = null; // datos tal como estaban al arrancar (para la copia previa a una actualización)
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY); bootRaw = raw;
    if (raw) return normalize(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) { const m = migrateV3(JSON.parse(old)); m._migrated = true; return m; }
  } catch (e) { console.error(e); }
  return defaultState();
}

let state = loadState();
let saveTimer = null;
/* Frescura de los datos: dataAt cambia solo cuando cambian tus datos (no al tocar ajustes ni al abrir la app) */
function hashStr(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return h; }
function dataSig() {
  const retos = {}; for (const [k, r] of Object.entries(state.retos || {})) retos[k] = { level: r.level, best: r.best, history: r.history, tests: r.tests };
  return hashStr(JSON.stringify([state.plan, state.sessions, state.meals, state.cardio, state.bodyMetrics, retos, state.reports, state.selectedVariants, state.habitLog]));
}
function latestContentDate(st) {
  let d = '';
  for (const x of st.sessions || []) if (x.date > d) d = x.date;
  for (const k of Object.keys(st.meals || {})) if ((st.meals[k] || []).length && k > d) d = k;
  for (const x of st.cardio || []) if (x.date > d) d = x.date;
  for (const x of st.bodyMetrics || []) if (x.date > d) d = x.date;
  for (const r of Object.values(st.retos || {})) for (const h of r.history || []) if (h.date > d) d = h.date;
  return d;
}
function dataAtOf(st) { if (st.dataAt) return st.dataAt; const d = latestContentDate(st); return d ? parseISO(d).getTime() + 12 * 3600000 : 0; }
function persist() {
  clearTimeout(saveTimer);
  try {
    const sig = dataSig();
    if (state._sig === undefined) { state._sig = sig; if (!state.dataAt) state.dataAt = dataAtOf(state); }
    else if (sig !== state._sig) { state._sig = sig; state.dataAt = Date.now(); }
  } catch { /* no es grave */ }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch (e) { toast('No se pudo guardar en el móvil: ' + e.message, 'error'); return false; }
}
function persistSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350); }
if (state._migrated) { delete state._migrated; persist(); }

/* Copia local automática antes de cada actualización (se puede restaurar en Ajustes → Copias) */
const PREV_KEY = 'fitnesteban_prev';
function savePrevCopy(raw, ver) { if (!raw) return; try { localStorage.setItem(PREV_KEY, JSON.stringify({ ver, at: new Date().toISOString(), data: raw })); } catch { /* sin espacio: no es grave */ } }
function prevCopy() { try { const p = JSON.parse(localStorage.getItem(PREV_KEY) || 'null'); return p && p.data ? p : null; } catch { return null; } }
/* 4.25.2: la 4.25.1 dejaba vacía la lista de hábitos al venir de una versión anterior. Se recuperan (una sola vez)
   de la copia que la app guarda antes de cada actualización. */
if (!state.settings.habitsFix252) {
  state.settings.habitsFix252 = true;
  if (!state.settings.habitList.length) {
    try {
      const old = JSON.parse(prevCopy()?.data || 'null')?.settings || {};
      const back = Array.isArray(old.habitList) && old.habitList.length ? old.habitList : Array.isArray(old.habits) ? old.habits.map(name => ({ name, where: 'train', days: [...ALL_DAYS] })) : [];
      if (back.length) { state.settings.habitList = normalize({ settings: { habitList: back } }).settings.habitList; state.settings.habits = state.settings.habitList.filter(h => h.where === 'train').map(h => h.name); }
    } catch { /* sin copia previa: nada que recuperar */ }
  }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* nada */ }
}
{ const seen = state.settings.lastSeenVersion; if (bootRaw && seen && seen !== APP_VERSION && prevCopy()?.ver !== seen) savePrevCopy(bootRaw, seen); }

/* ---------- Estado de interfaz ---------- */
const ui = {
  view: 'diet',
  remoteVer: null,
  remoteVerAt: 0,
  retoId: null,
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
  keyUnlocked: false,
  keyDraft: null,
  modelDraft: null,
  blocksOpen: false,
  editing: null,
  reportBusy: false,
  driveBusy: false,
  mealSearch: '',
  calMonth: '',
  calSel: '',
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
  const ms = kind === 'pr' ? 5000 : 2600;
  setTimeout(() => el.classList.add('toast-out'), ms);
  setTimeout(() => el.remove(), ms + 400);
}
let modalHandlers = {};
function openModal(html, handlers = {}) {
  modalHandlers = handlers;
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-back" ${handlers.noClose ? '' : 'data-close'}></div><div class="modal-sheet ${handlers.sheetClass || ''}" role="dialog" aria-modal="true">${html}</div>`;
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

/* ---------- Peso corporal ---------- */
function bodyweightAt(date) {
  const ws = state.bodyMetrics.filter(m => m.weight !== null).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!ws.length) return null;
  let v = ws[0].weight;
  for (const m of ws) if (m.date <= date) v = m.weight;
  return v;
}
const isBwEx = exId => !!(exId && findEx(exId)?.ex.bw);
/* «PC», «PC + 5» o «24» según el ejercicio */
const wLabel = (w, bw) => (bw ? (w > 0 ? `PC+${fmtNum(w)}` : 'PC') : fmtNum(w || 0));
/* 1RM estimado: en ejercicios de peso corporal suma tu peso registrado al lastre */
function oneRM(e, x, date) {
  if (isBwEx(e.exId)) { const b = bodyweightAt(date); return b ? e1rm(b + (x.w || 0), x.r) : 0; }
  return e1rm(x.w, x.r);
}

function coach(e, exKey) {
  const { minReps: min, maxReps: max, increment: inc, sets: n } = e;
  const fill = v => Array.from({ length: n }, () => v);
  const K = v => (e.bw ? (v > 0 ? `PC + ${fmtKg(v)}` : 'peso corporal') : fmtKg(v));
  const hist = exHistory(exKey);
  const lastTop = hist.length ? topOf(hist[hist.length - 1].sets) : null;
  if (!lastTop) {
    return { tone: 'new', title: 'Sesión de calibración', text: e.bw ? `Haz ${min}–${max} reps con tu peso dejando 1–2 en recámara; si te sobran, añade lastre. A partir de la próxima te digo qué hacer.` : `Busca un peso con el que hagas ${min}–${max} reps dejando 1–2 en recámara. A partir de la próxima te digo qué peso poner.`, weight: null, targets: fill(`${min}-${max}`), last: '' };
  }
  const last = hist[hist.length - 1];
  const { t: topW, valid, work } = lastTop;
  const bw = topW === 0;
  const lastStr = valid.map(s => `${wLabel(s.w, e.bw)}×${s.r}`).join(' · ');
  const gap = daysBetween(last.date, todayISO());
  const deloadW = e.bw ? Math.max(0, r2(topW - (inc || 1))) : Math.max(inc || 1, roundStep(topW * 0.9, inc || 0.5));

  if (gap >= 14 && !bw) {
    return { tone: 'break', title: `Vuelta tras ${gap} días`, text: `Hace ${gap} días que no lo haces. Empieza con ${K(deloadW)} (−10 %) y recupera sensaciones antes de apretar.`, weight: deloadW, targets: fill(min), last: lastStr };
  }
  const allTop = work.length >= Math.min(n, valid.length) && work.every(s => s.r >= max);
  if (allTop) {
    if (bw) return { tone: 'up', title: 'Tope de reps alcanzado', text: `${max}+ reps en todas las series con tu peso. Añade ${fmtKg(inc)} de lastre o pasa a una variante más dura.`, weight: inc, targets: fill(min), last: lastStr };
    const w = r2(topW + inc);
    return { tone: 'up', title: `Sube a ${K(w)}`, text: `Hiciste ${max} reps en todas las series con ${K(topW)}. Toca subir: ${K(w)} y objetivo ${min} reps.`, weight: w, targets: fill(min), last: lastStr };
  }
  const below = work.some(s => s.r < min);
  if (below && !bw && hist.length > 1) {
    const p = topOf(hist[hist.length - 2].sets);
    if (p && p.t === topW && p.work.some(s => s.r < min)) {
      return { tone: 'down', title: `Baja a ${K(deloadW)}`, text: `Dos sesiones seguidas sin llegar a ${min} reps con ${K(topW)}. Descarga un 10 %, reps limpias y vuelve a subir.`, weight: deloadW, targets: fill(max), last: lastStr };
    }
  }
  if (hist.length >= 3) {
    const l3 = hist.slice(-3).map(h => topOf(h.sets));
    if (l3.every(x => x && x.t === topW)) {
      const reps = l3.map(x => x.work.reduce((a, s) => a + s.r, 0));
      if (reps[2] <= reps[0]) {
        return bw
          ? { tone: 'stall', title: 'Estancado: 3 sesiones igual', text: 'Tres sesiones sin sumar reps. Cambia de variante o ponlo antes en la sesión, cuando estés fresco.', weight: 0, targets: fill(min), last: lastStr }
          : { tone: 'stall', title: 'Estancado: 3 sesiones igual', text: `Tres sesiones con ${K(topW)} sin sumar reps. Baja a ${K(deloadW)} y reconstruye, o cambia de variante.`, weight: deloadW, targets: fill(max), last: lastStr };
      }
    }
  }
  const targets = Array.from({ length: n }, (_, i) => (work[i] ? Math.min(max, work[i].r + 1) : min));
  const wTxt = K(topW);
  if (below) {
    return { tone: 'hold', title: `Repite ${wTxt}`, text: `Alguna serie quedó por debajo de ${min} reps. Mismo peso y busca ${min} en todas; si vuelve a pasar, bajamos.`, weight: topW, targets, last: lastStr };
  }
  return { tone: 'hold', title: `Mantén ${wTxt}`, text: `Objetivo hoy: +1 rep por serie (${targets.join(' / ')}). Cuando llegues a ${max} en todas, ${e.bw ? `añadimos ${fmtKg(inc)} de lastre` : `subimos ${fmtKg(inc)}`}.`, weight: topW, targets, last: lastStr };
}

const TONE = {
  new: { icon: '🧭', cls: 'coach-new' }, up: { icon: '⬆️', cls: 'coach-up' }, hold: { icon: '🎯', cls: 'coach-hold' },
  down: { icon: '⬇️', cls: 'coach-down' }, stall: { icon: '⚠️', cls: 'coach-stall' }, break: { icon: '🔁', cls: 'coach-break' }
};

function bestE1rm(exKey, sessions = state.sessions) {
  let best = 0;
  for (const s of sessions) for (const e of s.exercises) if (e.exKey === exKey) for (const x of e.sets) best = Math.max(best, oneRM(e, x, s.date));
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
function nextDayId(pr = prog()) {
  if (!pr.days.length) return null;
  const rot = pr.days.filter(d => d.rotation && d.exercises.length);
  if (!rot.length) return pr.days[0].id;
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
    <div class="chips-row flex-1 relative" id="progRow">${progRow}</div>
    <button class="iconbtn iconbtn-sm shrink-0" data-act="editProg" type="button" aria-label="Editar bloque">✎</button>
  </div>`;
}

function renderTrain() {
  if (prog().type === 'cardio') return renderProgHeader() + renderCardio();
  if (prog().type === 'retos') return renderProgHeader() + renderRetos();
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
        ${day.exercises.length ? (() => { const est = estimateMinutes(day, d), avg = realAverage(day.id); return `<p class="text-[11px] text-mute mt-1">⏱ ~${est} min estimados${avg ? ` · tu media real: <strong class="text-white">${avg} min</strong>` : ''}</p>`; })() : ''}
      </div>
      <button class="iconbtn" data-act="editDay" type="button" aria-label="Editar día">✎</button>
    </div>
  </section>

  <div class="space-y-3 mt-3">
    ${exercises || `<div class="card p-6 text-center text-sm text-mute">Este día no tiene ejercicios todavía.</div>`}
  </div>

  <button class="btn-dashed w-full mt-3" data-act="addEx" type="button">＋ Añadir ejercicio a este día</button>

  ${state.settings.habits.length ? `<section class="card p-4 mt-4 space-y-2.5">
    <h3 class="section-title">🔥 Remate y hábitos</h3>
    ${habits}
  </section>` : ''}

  <div class="flex gap-2 mt-4" id="saveRow">
    ${draftHasData(day.id) ? '<button class="btn-abandon" data-act="abandon" type="button">Abandonar</button>' : ''}
    <button class="btn-save flex-1" data-act="saveSession" type="button">Guardar sesión</button>
  </div>
  `;
}

function skippedToday(d) { return d.skip && d.skip.date === todayISO() ? d.skip.ids : []; }
function renderExerciseCard(e, idx, day, d) {
  const { key, variant } = variantOf(e);
  if (skippedToday(d).includes(e.id)) return `<article class="card px-4 py-3 opacity-70 flex items-center justify-between gap-3" id="ex-${esc(e.id)}">
    <div class="min-w-0"><div class="text-[11px] font-bold uppercase tracking-wider text-mute">⏭ Hoy no</div><div class="font-semibold text-sm truncate line-through decoration-slate-500">${esc(variant.name)}</div></div>
    <button class="btn-mini text-brand shrink-0" data-act="skipEx" data-ex="${esc(e.id)}" type="button">Deshacer</button></article>`;
  const c = coachFor(e, key);
  const n = setCount(e, key, d);
  const tone = TONE[c.tone];
  const doneArr = d.done[key] || [];
  const isOpen = !!d.open?.[key];
  const doneCount = Array.from({ length: n }, (_, i) => !!doneArr[i]).filter(Boolean).length;
  const logged = Array.from({ length: n }, (_, i) => d.sets[key]?.[i]?.r).filter(r => r !== undefined && r !== '').length;
  const plan = c.weight !== null && c.weight !== undefined ? `${n} × ${c.weight ? (e.bw ? `PC + ${fmtKg(c.weight)}` : fmtKg(c.weight)) : 'peso corporal'}` : `${n} series`;
  let rows = '';
  for (let i = 0; i < n; i++) {
    let w = cellValue(d, key, i, 'w', c);
    if (e.bw && (w === '0' || w === 0)) w = '';
    const r = cellValue(d, key, i, 'r', c);
    const target = c.targets[i] ?? c.targets[c.targets.length - 1] ?? `${e.minReps}`;
    const done = !!doneArr[i];
    rows += `
      <div class="setrow ${done ? 'is-done' : ''}" id="set-${esc(e.id)}-${i}">
        <span class="w-7 text-xs font-bold text-mute">S${i + 1}</span>
        <div class="relative flex-1">
          <input class="field field-set" inputmode="decimal" autocomplete="off" data-in="w" data-key="${esc(key)}" data-i="${i}" value="${esc(w)}" placeholder="${e.bw ? 'PC' : 'kg'}" aria-label="${e.bw ? 'Lastre' : 'Peso'} serie ${i + 1}" />
          <span class="unit">${e.bw ? '+kg' : 'kg'}</span>
        </div>
        <span class="text-mute text-xs">×</span>
        <div class="relative flex-1">
          <input class="field field-set text-brand" inputmode="numeric" autocomplete="off" data-in="r" data-key="${esc(key)}" data-i="${i}" value="${esc(r)}" placeholder="${esc(target)}" aria-label="Repeticiones serie ${i + 1}" />
          <span class="unit">reps</span>
        </div>
        <button class="checkbtn" data-act="doneSet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button" aria-label="Serie hecha">✓</button>
      </div>`;
    if (i > 0 && !done) {
      const pw = num(cellValue(d, key, i - 1, 'w', c)), pr = num(cellValue(d, key, i - 1, 'r', c));
      const same = String(num(w) ?? '') === String(pw ?? '') && String(num(r) ?? '') === String(pr ?? '');
      if (pr > 0 && !same) rows += `<button class="copy-set" data-act="copySet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button">↺ igual que S${i} (${wLabel(pw || 0, e.bw)} × ${pr})</button>`;
    }
  }
  return `
  <article class="card p-4" id="ex-${esc(e.id)}">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[11px] font-bold uppercase tracking-wider text-brand">${esc(e.block)}</div>
        <h3 class="font-extrabold text-[17px] leading-snug mt-0.5">${esc(variant.name)}</h3>
        <div class="text-[11px] text-mute mt-1">${e.sets} × ${e.minReps}–${e.maxReps} reps · descanso ${e.rest}s · +${fmtNum(e.increment)} kg${e.bw ? ' de lastre · peso corporal' : ''}</div>
      </div>
      <div class="flex gap-1.5 shrink-0">
        <button class="iconbtn" data-act="skipEx" data-ex="${esc(e.id)}" type="button" aria-label="Hoy no hago este ejercicio">⏭</button>
        <button class="iconbtn" data-act="variant" data-ex="${esc(e.id)}" type="button" aria-label="Cambiar por una alternativa">⇄</button>
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

/* ⇄ Cambiar por una alternativa: lista de variantes + proponer con IA + añadir a mano */
function variantPicker(exId) {
  const f = findEx(exId); if (!f) return;
  const e = f.ex, cur = variantOf(e).v;
  const html = () => `<h3 class="modal-title">⇄ Alternativas</h3>
    <p class="text-xs text-mute -mt-1">${esc(e.block)} · el progreso y el peso sugerido se guardan por separado para cada alternativa.</p>
    <div class="space-y-1.5">${e.variants.map((v, i) => `<button class="w-full text-left rounded-xl border px-3 py-2.5 ${i === cur ? 'border-brand bg-brand/10' : 'border-line bg-ink'}" data-mact="pick" data-i="${i}" type="button">
      <div class="flex items-center justify-between gap-2"><span class="font-semibold text-[14px]">${esc(v.name)}</span>${i === cur ? '<span class="text-brand text-xs font-bold shrink-0">✓ Hoy</span>' : ''}</div>
      ${v.note ? `<div class="text-[11px] text-mute mt-0.5">${esc(v.note)}</div>` : ''}</button>`).join('')}</div>
    ${e.variants.length < 8 ? `<button class="btn-ghost w-full" data-mact="ai" type="button">✨ Proponer 2 alternativas con IA</button>
    <div class="flex gap-2"><input class="field flex-1 min-w-0" name="alt" maxlength="60" placeholder="O escribe una alternativa" /><button class="btn-ghost px-4" data-mact="add" type="button">Añadir</button></div>` : ''}`;
  const redraw = root => { root.querySelector('.modal-sheet').innerHTML = html(); };
  const add = (name, note = '') => { name = String(name || '').trim().slice(0, 60); if (!name || e.variants.some(v => v.name.toLowerCase() === name.toLowerCase()) || e.variants.length >= 8) return false; e.variants.push({ name, note: String(note || '').slice(0, 80), video: '' }); return true; };
  openModal(html(), {
    pick: (root, b) => { state.selectedVariants[e.id] = +b.dataset.i; persist(); closeModal(); render(); document.getElementById(`ex-${e.id}`)?.scrollIntoView({ block: 'nearest' }); },
    add: root => { const v = mval(root, 'alt'); if (!add(v)) return toast('Escribe una alternativa nueva', 'warn'); persist(); redraw(root); toast('Alternativa añadida'); },
    ai: async (root, b) => {
      if (!state.settings.apiKey) return toast('Necesitas tu clave de Gemini (Ajustes)', 'warn');
      b.disabled = true; b.innerHTML = '<span class="spinner"></span> Buscando alternativas…';
      try {
        const prompt = `Eres entrenador personal. Para el ejercicio «${variantOf(e).variant.name}» (bloque: ${e.block}; ${e.sets} series de ${e.minReps}-${e.maxReps} reps${e.bw ? '; se registra como peso corporal + lastre' : '; se registra con kilos'}) propone 2 alternativas que trabajen los mismos músculos con un patrón parecido${e.bw ? ', también con peso corporal' : ', con carga externa (mancuernas, barra, kettlebell, polea o máquina)'}. No repitas: ${e.variants.map(v => v.name).join(', ')}. Responde SOLO JSON: {"alternativas":[{"nombre":"…","nota":"consejo técnico de máximo 8 palabras"}]}`;
        const r = parseJSONLoose(await callGemini([{ text: prompt }], { timeout: 30000 }));
        const n = (r.alternativas || []).filter(x => add(x.nombre, x.nota)).length;
        persist(); if ($('#modalRoot').classList.contains('open')) redraw(root);
        toast(n ? `${n} alternativa${n === 1 ? '' : 's'} añadida${n === 1 ? '' : 's'}` : 'No ha propuesto nada nuevo', n ? 'ok' : 'warn');
      } catch (err) { toast('IA: ' + err.message, 'error'); b.disabled = false; b.textContent = '✨ Proponer 2 alternativas con IA'; }
    }
  });
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
  if (field === 'r' && value !== '') touchSession(d, key.replace(/_v\d+$/, ''));
  persistSoon();
}

/* ---------- Duración: estimada (plan) y real (cronometrada sola) ---------- */
const PAUSE_MS = 20 * 60000; // pausas de más de 20 min no cuentan
/* Marca actividad en la sesión en curso: arranca el reloj con la primera serie y suma solo el tiempo activo */
function touchSession(d, exId) {
  if (exId) d.lastEx = exId;
  const now = Date.now();
  if (!d.startedAt) { d.startedAt = now; d.lastAt = now; d.activeMs = 0; return; }
  const gap = now - (d.lastAt || now);
  if (gap > 0 && gap <= PAUSE_MS) d.activeMs = (d.activeMs || 0) + gap;
  d.lastAt = now;
}
function sessionMinutes(d) {
  if (!d?.startedAt) return null;
  const tail = Math.min(Date.now() - (d.lastAt || Date.now()), 3 * 60000); // tras la última serie, como mucho 3 min
  return Math.max(1, Math.round(((d.activeMs || 0) + Math.max(0, tail)) / 60000));
}
function estimateMinutes(day, d) {
  if (!day.exercises.length) return 0;
  let sec = 5 * 60; // calentamiento
  const sk = d ? skippedToday(d) : [];
  for (const e of day.exercises) {
    if (sk.includes(e.id)) continue;
    const { key } = variantOf(e);
    const n = d ? setCount(e, key, d) : (deloadActive() ? Math.max(1, Math.ceil(e.sets / 2)) : e.sets);
    const reps = (e.minReps + e.maxReps) / 2;
    sec += n * (reps * 3 + 15) + Math.max(0, n - 1) * e.rest + 60; // trabajo + descansos + cambio de ejercicio
  }
  return Math.round(sec / 60 / 5) * 5;
}
function realAverage(dayId) {
  const list = sortedSessions().filter(s => s.dayId === dayId && s.durationMin).slice(-5);
  return list.length >= 2 ? Math.round(list.reduce((a, s) => a + s.durationMin, 0) / list.length) : null;
}

/* Récord en el momento: al marcar ✓ una serie que supera tu mejor 1RM estimado de esa variante (una vez por mejora) */
function checkSetPR(ex, key, cell, d, day) {
  const today = todayISO(), st = { w: num(cell.w) ?? 0, r: Math.round(num(cell.r) || 0) };
  const val = oneRM({ exId: ex.id, exKey: key }, st, today);
  const prev = bestE1rm(key, state.sessions.filter(s => !(s.date === today && s.dayId === day.id)));
  if (!(prev > 0 && val > prev + 0.05)) return;
  d.prBest = d.prBest || {};
  if (val <= (d.prBest[key] || 0) + 0.05) return; // ya avisado con esta marca o una mejor
  d.prBest[key] = val;
  const name = (ex.variants[parseInt(key.split('_v').pop(), 10)] || ex.variants[0]).name;
  toast(`🏆 ¡Récord personal! ${name}: ${fmtNum(Math.round(val * 10) / 10)} kg de 1RM estimado (antes ${fmtNum(Math.round(prev * 10) / 10)})`, 'pr');
  try { navigator.vibrate?.([90, 60, 90, 60, 180]); } catch { /* nada */ }
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
    touchSession(d, exId);
    if (num(cell.r) > 0) { startTimer(f.ex.rest); checkSetPR(f.ex, key, cell, d, day); }
    else toast('Apunta las repeticiones de la serie', 'warn');
  }
  persist();
  render();
}

function saveSession() {
  const day = currentDay();
  const d = draftOf(day.id);
  const today = todayISO();
  const exs = [], skipIds = skippedToday(d);
  for (const e of day.exercises) {
    if (skipIds.includes(e.id)) continue;
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
    const now = Math.max(...x.sets.map(st => oneRM(x, st, today)));
    if (prev > 0 && now > prev + 0.05) prs.push(`${x.name}: ${fmtNum(Math.round(now * 10) / 10)} kg de 1RM estimado`);
    for (const s of x.sets) { volume += s.w * s.r; nSets++; }
    state.memory[x.exKey] = { date: today, sets: x.sets };
  }
  const habits = state.settings.habits.filter(h => d.habits[h]);
  const session = { id: uid('s_'), date: today, dayId: day.id, dayTitle: day.title, habits, exercises: exs };
  const skippedNames = day.exercises.filter(e => skipIds.includes(e.id)).map(e => variantOf(e).variant.name);
  if (skippedNames.length) session.skipped = skippedNames;
  if (deloadActive()) session.deload = true;
  const mins = sessionMinutes(d);
  if (mins) session.durationMin = mins;
  state.sessions = others;
  state.sessions.push(session);
  delete state.drafts[day.id];
  if (!persist()) return;
  setTimeout(silentDriveBackup, 1500);
  render();

  const rot = prog().days.filter(x => x.rotation && x.exercises.length);
  const ri = rot.findIndex(x => x.id === day.id);
  const nxt = ri >= 0 && rot.length > 1 ? rot[(ri + 1) % rot.length] : null;
  openModal(`
    <div class="text-center">
      <div class="text-4xl">💪</div>
      <h3 class="text-xl font-extrabold mt-2">Sesión guardada</h3>
      <p class="text-sm text-mute mt-1">${esc(day.title)}</p>
    </div>
    ${(() => { const g = gymKcalInfo(session); return g ? `<p class="text-center text-xs mt-2"><span class="${MAC.kcal.text} font-bold">🏋️ ~${g.kcal} kcal netas</span> <span class="text-mute">estimadas · cuentan en Dieta</span></p>` : (mins && !bodyweightAt(today) ? '<p class="text-center text-[11px] text-mute mt-2">Registra tu peso en Progreso para estimar las kcal del gym.</p>' : ''); })()}
    <div class="grid grid-cols-${mins ? 4 : 3} gap-2 mt-4 text-center">
      ${mins ? `<div class="stat"><div class="stat-v">${mins}</div><div class="stat-l">min</div></div>` : ''}
      <div class="stat"><div class="stat-v">${exs.length}</div><div class="stat-l">ejercicios</div></div>
      <div class="stat"><div class="stat-v">${nSets}</div><div class="stat-l">series</div></div>
      <div class="stat"><div class="stat-v">${Math.round(volume).toLocaleString('es-ES')}</div><div class="stat-l">kg volumen</div></div>
    </div>
    ${prs.length ? `<div class="coach coach-up mt-4"><div class="font-bold text-sm">🏆 Récords personales</div>${prs.map(p => `<p class="text-xs mt-1">${esc(p)}</p>`).join('')}</div>` : ''}
    ${habits.length ? `<p class="text-xs text-mute mt-3">Hábitos cumplidos: ${habits.length}/${state.settings.habits.length}</p>` : ''}
    ${nxt ? `<p class="text-xs text-mute mt-1">Próxima sesión: <strong class="text-white">${esc(nxt.label)}</strong></p>` : ''}
    <div class="grid grid-cols-2 gap-2 mt-5">
      <button class="btn-ghost" data-mact="card" type="button">📸 Tarjeta</button>
      <button class="btn-primary" data-close type="button">Hecho</button>
    </div>
  `, { card: () => openShareCard(session.id) });
}

/* ---------- Tarjeta para compartir (imagen 1080 × 1350) ---------- */
const MOTTOS = ['Hoy has sumado. Mañana, más.', 'La constancia gana a la motivación.', 'Un día más cerca de tu mejor versión.', 'Trabajo hecho. Recupera y vuelve.', 'El progreso se construye serie a serie.', 'Disciplina hoy, resultados mañana.'];
function sessionStats(s) {
  let nSets = 0, vol = 0;
  for (const e of s.exercises) for (const x of e.sets) { nSets++; vol += (x.w || 0) * x.r; }
  const others = state.sessions.filter(o => o.id !== s.id && o.date <= s.date);
  const prs = [];
  for (const e of s.exercises) {
    const prev = bestE1rm(e.exKey, others), now = Math.max(...e.sets.map(x => oneRM(e, x, s.date)));
    if (prev > 0 && now > prev + 0.05) prs.push(`${e.name}: ${fmtNum(Math.round(now * 10) / 10)} kg (1RM est.)`);
  }
  return { nSets, vol: Math.round(vol), prs, kcal: gymKcalOf(s) };
}
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
async function buildShareCard(s) {
  const W = 1080, H = 1350, F = 'system-ui, Roboto, "Segoe UI", sans-serif';
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.08, 20, W * 0.85, H * 0.08, W * 0.9);
  glow.addColorStop(0, 'rgba(0,210,223,0.22)'); glow.addColorStop(1, 'rgba(0,210,223,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // logo + marca
  try {
    const logo = await loadImg('icons/logo-512.png');
    ctx.save(); ctx.beginPath(); ctx.arc(140, 150, 70, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, 70, 80, 140, 140); ctx.restore();
  } catch { /* sin logo */ }
  try {
    const img = await loadImg('icons/marca.svg');
    const mh = Math.round(600 * img.naturalHeight / img.naturalWidth);
    ctx.drawImage(img, 240, 154 - mh / 2, 600, mh);
  } catch { ctx.fillStyle = '#fff'; ctx.font = `italic 900 60px ${F}`; ctx.fillText('FITNESTEBAN', 240, 175); }
  const st = sessionStats(s);
  const day = allDays().find(d => d.id === s.dayId);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#00d2df'; ctx.font = `800 34px ${F}`; ctx.fillText('SESIÓN COMPLETADA', 70, 340);
  ctx.fillStyle = '#ffffff'; ctx.font = `italic 900 150px ${F}`; ctx.fillText((day?.label || 'ENTRENO').slice(0, 10), 64, 490);
  ctx.fillStyle = '#8a9ba5'; ctx.font = `500 36px ${F}`;
  const sub = `${(s.dayTitle || '').replace(/^Día \d+ · /, '')}`.slice(0, 44);
  ctx.fillText(sub, 70, 550);
  const d = parseISO(s.date); ctx.fillText(d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), 70, 600);
  // casillas
  const tiles = [
    [s.durationMin ? `${s.durationMin}` : '—', 'minutos'],
    [`${st.nSets}`, 'series'],
    [st.vol >= 1000 ? `${fmtNum(Math.round(st.vol / 100) / 10)} t` : `${st.vol} kg`, 'volumen'],
    [st.kcal ? `~${st.kcal}` : `${s.exercises.length}`, st.kcal ? 'kcal netas' : (s.exercises.length === 1 ? 'ejercicio' : 'ejercicios')]
  ];
  tiles.forEach(([v, l], i) => {
    const x = 70 + (i % 2) * 480, y = 660 + Math.floor(i / 2) * 230;
    roundRect(ctx, x, y, 460, 205, 36); ctx.fillStyle = '#0c1317'; ctx.fill(); ctx.strokeStyle = '#1c2a31'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = i === 3 && st.kcal ? '#fbbf24' : '#ffffff'; ctx.font = `900 88px ${F}`; ctx.fillText(v, x + 40, y + 120);
    ctx.fillStyle = '#8a9ba5'; ctx.font = `600 32px ${F}`; ctx.fillText(l, x + 40, y + 170);
  });
  let y = 1180;
  if (st.prs.length) {
    ctx.fillStyle = '#34d399'; ctx.font = `800 34px ${F}`;
    const names = st.prs.map(x => x.split(':')[0]);
    let line = `🏆 ${names.length === 1 ? 'Récord en' : names.length + ' récords:'} ${names.join(' · ')}`;
    while (ctx.measureText(line).width > W - 140 && line.length > 10) line = line.slice(0, -2).trimEnd() + '…';
    ctx.fillText(line.replace(/……+$/, '…'), 70, y); y += 60;
  }
  ctx.fillStyle = '#00d2df'; ctx.font = `italic 700 40px ${F}`;
  ctx.fillText(MOTTOS[(s.id.length + st.nSets) % MOTTOS.length], 70, Math.max(y, 1220));
  ctx.fillStyle = '#4b5b63'; ctx.font = `700 28px ${F}`; ctx.textAlign = 'right'; ctx.fillText('#FITNESTEBAN', W - 70, H - 50); ctx.textAlign = 'left';
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function openShareCard(sessionId) {
  const s = state.sessions.find(x => x.id === sessionId); if (!s) return;
  openModal('<div class="text-center text-sm text-mute py-10"><span class="spinner"></span> Creando tarjeta…</div>');
  let blob;
  try { blob = await buildShareCard(s); } catch (e) { closeModal(); return toast('No se pudo crear la tarjeta', 'error'); }
  const url = URL.createObjectURL(blob);
  const name = `fitnesteban_${s.date}.png`;
  openModal(`
    <h3 class="modal-title">📸 Tu tarjeta</h3>
    <img src="${url}" alt="Tarjeta de la sesión" class="w-full rounded-2xl border border-line" />
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-mact="dl" type="button">⬇️ Guardar</button>
      <button class="btn-primary" data-mact="share" type="button">📤 Compartir</button>
    </div>
    <button class="btn-ghost w-full" data-close type="button">Cerrar</button>
  `, {
    dl: () => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast('Imagen guardada ✓'); },
    share: async () => {
      const file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        try { await navigator.share({ files: [file] }); } catch (e) { if (e.name !== 'AbortError') toast('No se pudo compartir: ' + e.message, 'warn'); }
      } else { modalHandlers.dl?.(); toast('Este navegador no permite compartir: imagen guardada', 'warn'); }
    }
  });
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
    ${!isNew && p.type === 'cardio' ? '<p class="text-[11px] text-mute">Bloque de cardio: registra bicicleta y caminata. Se puede renombrar, no eliminar.</p>' : !isNew && p.type === 'retos' ? '<p class="text-[11px] text-mute">Bloque de retos: dominadas, flexiones, fondos, sentadillas, burpees, plancha y rueda abdominal por niveles. Se puede renombrar, no eliminar.</p>' : isNew ? '<p class="text-[11px] text-mute">Se crea con un día vacío. Añade días con «＋ Día» y ejercicios con «＋ Añadir ejercicio».</p>' : `<p class="text-[11px] text-mute">${p.days.length} días: ${esc(p.days.map(d => d.label).join(' · '))}</p>`}
    <div class="flex gap-2 mt-4">
      ${!isNew ? `<button class="btn-ghost" data-mact="left" type="button" aria-label="Mover a la izquierda">◀</button><button class="btn-ghost" data-mact="right" type="button" aria-label="Mover a la derecha">▶</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew && p.type === 'strength' && state.plan.programs.length > 1 ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Eliminar este bloque</button><p class="text-[11px] text-mute mt-2">Eliminar un bloque no borra el historial de sesiones ya guardadas.</p>` : ''}
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
    <label class="habit"><input type="checkbox" name="bw" ${e.bw ? 'checked' : ''} /><span class="text-xs">Con peso corporal <span class="text-mute">(dominadas, fondos… el campo de peso pasa a ser el lastre; vacío = solo tu peso)</span></span></label>
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
        id: isNew ? uid('c_') : e.id, alts27: true, block: mval(root, 'block').trim() || 'Ejercicio', variants,
        sets: mval(root, 'sets'), minReps, maxReps, increment: num(mval(root, 'increment')) ?? 2, rest: mval(root, 'rest'), bw: root.querySelector('[name="bw"]').checked
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
    const r = map.get(e.exKey) || { bw: isBwEx(e.exId), name: e.name, bestW: -1, bestWReps: 0, bestWDate: '', best1: 0, best1Date: '', bestReps: 0, bestRepsDate: '', lastPR: '' };
    r.name = e.name;
    for (const x of e.sets) {
      if (!(x.r > 0)) continue;
      if (x.w > r.bestW || (x.w === r.bestW && x.r > r.bestWReps)) { r.bestW = x.w; r.bestWReps = x.r; r.bestWDate = s.date; r.lastPR = s.date; }
      const one = oneRM(e, x, s.date);
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
        <div class="text-[11px] text-mute mt-0.5">${r.bw
          ? `Máx. <strong class="text-white">${wLabel(r.bestW, true)} × ${r.bestWReps}</strong> (${fmtDateShort(r.bestWDate)})${r.best1 > 0 ? ` · 1RM est. <strong class="text-brand">${fmtKg(Math.round(r.best1 * 10) / 10)}</strong> (${fmtDateShort(r.best1Date)})` : ''}`
          : r.bestW > 0
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
    const now = Math.max(...sess.flatMap(s => s.exercises.filter(e => e.exKey === k).flatMap(e => e.sets.map(x => oneRM(e, x, s.date) || x.r))));
    const prev = Math.max(0, ...before.flatMap(s => s.exercises.filter(e => e.exKey === k).flatMap(e => e.sets.map(x => oneRM(e, x, s.date) || x.r))));
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
  let kc = 0, pr = 0, nd = 0, protOk = 0, mealsTot = 0, mealsOk = 0;
  const lowTypes = {};
  for (let i = 0; i < 7; i++) {
    const dt = addDays(to, -i);
    if (!mealsOf(dt).length) continue;
    const t = totalsOf(dt); kc += t.kcal; pr += t.prot; nd++;
    if (t.prot >= state.settings.targetProt * 0.9) protOk++;
    const ps = protSpread(dt); mealsTot += ps.total; mealsOk += ps.ok;
    for (const l of ps.low) lowTypes[l] = (lowTypes[l] || 0) + 1;
  }
  const cardio = state.cardio.filter(c => inRange(c.date));
  const wt = weightTrend();
  const habits = sess.reduce((a, s) => a + (s.habits?.length || 0), 0);
  return {
    periodo: `${from} a ${to}`, objetivo: (GOALS[profileOf()?.goal] || GOALS.recomp)[0].toLowerCase(),
    sesiones_fuerza: sess.length, dias_entrenados: [...new Set(sess.map(s => s.dayTitle))],
    ejercicios_que_suben: up, ejercicios_igual_o_bajan: flat, ejercicios_estancados_segun_coach: [...new Set(stalled)],
    dias_dieta_registrados: nd, kcal_media: nd ? Math.round(kc / nd) : null, objetivo_kcal: state.settings.targetKcal,
    proteina_media_g: nd ? Math.round(pr / nd) : null, objetivo_proteina_g: state.settings.targetProt, dias_proteina_cumplida: protOk,
    comidas_con_proteina_suficiente: mealsTot ? `${mealsOk} de ${mealsTot} (mínimo ${minProt()} g por comida)` : null, comidas_con_proteina_baja_por_tipo: lowTypes,
    cardio_sesiones: cardio.length, cardio_minutos: cardio.reduce((a, c) => a + c.minutes, 0), cardio_kcal: cardio.reduce((a, c) => a + c.kcal, 0), gym_kcal_estimadas: sess.reduce((a, x) => a + gymKcalOf(x), 0),
    peso_tendencia_kg: wt.ready ? wt.last.y : null, cambio_peso_kg_semana: wt.ready ? r2(wt.kgWeek) : null, cambio_cintura_cm_3_semanas: wt.ready ? wt.waistChange3 : null,
    habitos_cumplidos_en_sesiones: habits, semana_de_descarga: deloadActive(),
    habitos_diarios: (state.settings.habitList || []).filter(h => h.where === 'daily').map(h => {
      const due = Array.from({ length: 7 }, (_, i) => addDays(to, -i)).filter(d => h.days.includes(parseISO(d).getDay()));
      return { habito: h.name, cumplidos: due.filter(d => habitDone(d, h.name)).length, dias_que_tocaba: due.length };
    }),
    duracion_media_sesion_min: (() => { const l = sess.filter(x => x.durationMin); return l.length ? Math.round(l.reduce((a, x) => a + x.durationMin, 0) / l.length) : null; })()
  };
}
async function generateReport() {
  const data = weekData();
  const rep = { id: uid('r_'), date: todayISO(), data, ai: null };
  if (state.settings.apiKey && navigator.onLine) {
    ui.reportBusy = true; render();
    try {
      const prompt = `Eres entrenador personal y nutricionista deportivo. Analiza la última semana de ${profileText()}.
Datos (JSON, null = sin datos): ${JSON.stringify(data)}
Objetivos diarios configurados: ${state.settings.targetKcal} kcal y ${state.settings.targetProt} g de proteína; peso actual: ${latestWeight() || 'desconocido'} kg.
Reglas: básate SOLO en estos datos; si faltan datos importantes, dilo en "mejorar". Si los objetivos diarios claramente no encajan con su perfil y objetivo, dilo en "mejorar" con cifras orientativas. Sé directo, concreto y breve, en español de España. Nada de frases motivacionales vacías.
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
/* Apartado plegable de Ajustes: título + estado a la derecha; se recuerda abierto/cerrado mientras la app está abierta */
const foldCard = (key, title, status, statusCls, body) => `<details class="card p-4 mt-3" ${openAttr('set_' + key)}>
    <summary class="flex items-center justify-between gap-3 cursor-pointer select-none">
      <h3 class="section-title shrink-0">${title}</h3>
      <span class="flex items-center gap-2 text-[11px] min-w-0 ${statusCls || 'text-mute'}"><span class="truncate">${status}</span><span class="tri"></span></span>
    </summary>
    <div class="space-y-3 mt-3">${body}</div>
  </details>`;
const openAttr = (key, def = false) => `data-open-key="${key}" ${(openKeys[key] ?? def) ? 'open' : ''}`;

function renderReport(r, open) {
  const d = r.data;
  const chips = [
    `🏋️ ${d.sesiones_fuerza} sesiones`, d.kcal_media !== null ? `<span class="${MAC.kcal.text}">${d.kcal_media} kcal/día</span>` : null, d.proteina_media_g !== null ? `<span class="${MAC.prot.text}">P ${d.proteina_media_g} g</span>` : null,
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

/* Gasto NETO de una sesión de pesas (por encima del reposo).
   MET 3,5 (pesas suaves) a 6 (sesión densa y pesada) según:
   · densidad: series por minuto (0,25 → 0,5)
   · carga: kg movidos por minuto respecto a tu peso
   kcal netas = (MET − 1) × peso × horas. Se puede corregir a mano. */
function gymKcalInfo(s) {
  if (s.kcalManual !== undefined && s.kcalManual !== null) return { kcal: Math.round(s.kcalManual), manual: true };
  const mins = s.durationMin; const bw = bodyweightAt(s.date);
  if (!mins || !bw || !s.exercises?.length) return null;
  let nSets = 0, vol = 0;
  for (const e of s.exercises) { const extra = isBwEx(e.exId) ? bw : 0; for (const x of e.sets) { nSets++; vol += ((x.w || 0) + extra) * x.r; } }
  const dens = clamp((nSets / mins - 0.25) / 0.25, 0, 1);
  const load = clamp((vol / mins) / (bw * 4), 0, 1);
  const met = 3.5 + 1.5 * dens + 1.0 * load;
  return { kcal: Math.max(0, Math.round((met - 1) * bw * mins / 60)), met, mins, bw, nSets, vol };
}
const gymKcalOf = s => gymKcalInfo(s)?.kcal || 0;
function gymOf(date) { return state.sessions.filter(s => s.date === date).reduce((a, s) => a + gymKcalOf(s), 0) + retosKcalOf(date); }
function exerciseBurnOf(date) { return burnedOf(date) + gymOf(date); }

/* =========================================================================
   RETOS: niveles según tus repeticiones máximas seguidas
   ========================================================================= */
const RETOS = {
  pullup:  { name: 'Dominadas',         icon: '🧗', unit: 'reps', step: 1,  min: 1,  max: 50,  rest: 90, met: 8,   secRep: 3 },
  pushup:  { name: 'Flexiones',         icon: '💪', unit: 'reps', step: 3,  min: 3,  max: 150, rest: 60, met: 8,   secRep: 2 },
  dips:    { name: 'Fondos',            icon: '🤸', unit: 'reps', step: 2,  min: 2,  max: 100, rest: 75, met: 8,   secRep: 2.5 },
  squat:   { name: 'Sentadillas',       icon: '🦵', unit: 'reps', step: 5,  min: 5,  max: 200, rest: 60, met: 5.5, secRep: 2.5 },
  burpee:  { name: 'Burpees',           icon: '⚡', unit: 'reps', step: 2,  min: 2,  max: 100, rest: 75, met: 8,   secRep: 4 },
  plank:   { name: 'Plancha abdominal', icon: '🧱', unit: 's',    step: 10, min: 10, max: 180, rest: 45, met: 3.8, secRep: 1 },
  abwheel: { name: 'Rueda abdominal',   icon: '🛞', unit: 'reps', step: 1,  min: 1,  max: 30,  rest: 90, met: 5,   secRep: 5, sets: [1, 0.7, 0.6],
             tag: 'Fase 1 · de rodillas', note: 'Bajada lenta (3 s), pelvis metida y sin arquear la espalda. Cuenta solo las repeticiones con recorrido completo.' },
  abwheel2:{ name: 'Rueda abdominal de pie', icon: '🛞', unit: 'reps', step: 1, min: 1, max: 15, rest: 120, met: 6, secRep: 6, sets: [1, 0.7, 0.6],
             tag: 'Fase 2 · de pie', needs: 'abwheel', note: 'De pie, abdomen apretado y sin arquear la espalda. Si no llegas al recorrido completo, rueda hasta una pared o un tope y ve alejándolo.' }
};
const RETO_IDS = Object.keys(RETOS);
/* Si aún no llegas al nivel mínimo, una variante más fácil para ir ganando fuerza */
const RETO_EASY = {
  pullup: 'Dominadas negativas: sube con un salto o un banco y baja muy despacio (3–5 s). Cuando hagas 1 completa, sigue con el reto.',
  pushup: 'Flexiones con las rodillas apoyadas o con las manos en un banco/pared. Haz las series de nivel 3 así hasta que te salgan 3 completas.',
  dips: 'Fondos en banco (manos detrás, en el borde) o fondos negativos: bajar despacio y subir con ayuda de las piernas.',
  squat: 'Sentadilla a un banco o silla: siéntate despacio y levántate sin impulso.',
  burpee: 'Burpees sin salto ni flexión: bajar, piernas atrás, volver y ponerse de pie.',
  plank: 'Plancha con las rodillas apoyadas, manteniendo el cuerpo recto de rodillas a cabeza.',
  abwheel: 'Rueda de rodillas rodando solo hasta una pared o un tope cercano; ve alejándolo según ganes control.',
  abwheel2: 'Rueda de pie rodando hasta una pared o tope; ve alejándolo poco a poco.'
};
const RETO_FEEL = [['hard', '😣', 'Me ha costado'], ['ok', '🙂', 'Bien'], ['easy', '😎', 'Voy sobrado']];
const retoU = (r, n) => r.unit === 's' ? `${n} s` : `${n}`;
function retoOf(id) { return state.retos[id] || null; }
function snapLevel(r, v) { return clamp(Math.round(v / r.step) * r.step, r.min, r.max); }
/* Series de un nivel: el nivel es la 1.ª serie; en niveles altos 100 · 54 · 50 · 50 · 46 %. En el nivel mínimo, 3 series iguales. */
function retoSets(id, level) {
  const r = RETOS[id];
  if (r.sets) return r.sets.map(f => Math.max(r.step, Math.round(level * f / r.step) * r.step));
  if (level <= r.min) return [level, level, level];
  return [1, 0.54, 0.5, 0.5, 0.46].map(f => Math.max(r.step, Math.round(level * f / r.step) * r.step));
}
/* Fase 2 bloqueada hasta completar el nivel máximo de la fase 1 */
function retoLocked(id) { const need = RETOS[id].needs; if (!need) return false; const r = RETOS[need]; return !(retoOf(need)?.history || []).some(h => h.level >= r.max && h.completed); }
function retoLastDate(id) { const h = retoOf(id)?.history || []; return h.length ? h[h.length - 1].date : null; }
function retoDueTest(id) { const st = retoOf(id); if (!st) return false; const lastT = st.tests.length ? st.tests[st.tests.length - 1].date : ''; return st.history.filter(h => h.date > lastT).length >= 6; }
function retoRestInfo(id) {
  const last = retoLastDate(id), T = todayISO();
  if (!last) return null;
  if (last === T) return { done: true, text: '✓ Hecho hoy' };
  if (last === addDays(T, -1)) return { warn: true, text: 'Hecho ayer · hoy toca descanso' };
  return null;
}
function retoKcal(id, sets, date) {
  const r = RETOS[id], kg = bodyweightAt(date) || latestWeight();
  if (!kg) return 0;
  const work = sets.reduce((a, n) => a + n, 0) * r.secRep, rest = Math.max(0, sets.length - 1) * r.rest;
  return Math.round(((r.met - 1) * kg * work + 0.3 * kg * rest) / 3600);
}
function retosKcalOf(date) { let k = 0; for (const id of RETO_IDS) for (const h of retoOf(id)?.history || []) if (h.date === date) k += h.kcal || 0; return k; }
function retoDraft(id) {
  const st = retoOf(id), T = todayISO();
  if (!st.draft || st.draft.date !== T || st.draft.level !== st.level) {
    const sets = retoSets(id, st.level);
    st.draft = { date: T, level: st.level, target: sets, got: sets.map(() => ''), done: sets.map(() => false) };
  }
  return st.draft;
}

/* Bloque de fuerza que sigues: el de tu última sesión (o PPT) */
function mainStrengthProg() {
  const ss = sortedSessions();
  for (let i = ss.length - 1; i >= 0; i--) { const pr = programOfDay(ss[i].dayId); if (pr && pr.type === 'strength' && pr.id !== 'free') return pr; }
  return state.plan.programs.find(p => p.id === 'ppt') || state.plan.programs.find(p => p.type === 'strength');
}
function todayCardHTML() {
  const pr = mainStrengthProg(); if (!pr) return '';
  const T = todayISO();
  const doneSess = sortedSessions().filter(x => x.date === T && programOfDay(x.dayId)?.id === pr.id).pop();
  if (doneSess) {
    const dd = pr.days.find(d => d.id === doneSess.dayId);
    return `<div class="today-card today-done"><span class="text-2xl">✅</span><span class="flex-1 min-w-0"><span class="block text-[11px] text-mute">HOY</span><span class="block font-extrabold">Ya entrenaste ${esc(dd?.label || 'hoy')} · ${esc(pr.name)}</span></span></div>`;
  }
  const day = pr.days.find(d => d.id === nextDayId(pr)); if (!day || !day.exercises.length) return '';
  const mins = estimateMinutes(day, state.drafts[day.id] || { sets: {}, counts: {}, done: {} });
  return `<button class="today-card" data-act="goToday" data-prog="${esc(pr.id)}" data-day="${esc(day.id)}" type="button">
      <span class="text-2xl">🏋️</span>
      <span class="flex-1 min-w-0 text-left"><span class="block text-[11px] text-mute">HOY TE TOCA</span><span class="block font-extrabold truncate">${esc(day.label)} · ${esc(pr.name)}</span><span class="block text-[11px] text-mute truncate">${day.exercises.length} ejercicios${mins ? ` · ⏱ ~${mins} min` : ''}</span></span>
      <span class="text-brand font-black text-lg shrink-0">›</span></button>`;
}
function renderRetos() {
  if (ui.retoId && RETOS[ui.retoId]) return renderRetoDetail(ui.retoId);
  const cards = RETO_IDS.map(id => {
    const r = RETOS[id], st = retoOf(id);
    if (retoLocked(id)) return `<button class="reto-card opacity-60" data-act="retoOpen" data-reto="${id}" type="button">
        <span class="reto-ic">🔒</span>
        <span class="min-w-0 flex-1 text-left"><span class="block font-extrabold">${r.name}</span><span class="block text-[11px] text-mute">${esc(r.tag)} · se desbloquea al completar el nivel ${RETOS[r.needs].max} de rodillas</span></span></button>`;
    if (!st) return `<button class="reto-card" data-act="retoOpen" data-reto="${id}" type="button">
        <span class="reto-ic">${r.icon}</span>
        <span class="min-w-0 flex-1 text-left"><span class="block font-extrabold">${r.name}</span><span class="block text-[11px] text-mute">${r.tag ? esc(r.tag) + ' · ' : ''}Sin empezar · niveles ${retoU(r, r.min)}–${retoU(r, r.max)}</span></span>
        <span class="tri -rotate-90 shrink-0"></span></button>`;
    const pct = Math.round((st.level - r.min) / (r.max - r.min) * 100), rest = retoRestInfo(id), ready = !rest;
    return `<button class="reto-card ${ready ? 'reto-ready' : ''}" data-act="retoOpen" data-reto="${id}" type="button">
        <span class="reto-ic">${r.icon}</span>
        <span class="min-w-0 flex-1 text-left">
          <span class="flex items-baseline justify-between gap-2"><span class="font-extrabold truncate">${r.name}</span><span class="text-xs font-black text-brand shrink-0">Nivel ${st.level}</span></span>
          <span class="block text-[11px] text-slate-300 mt-0.5 truncate">Próxima: ${retoSets(id, st.level).join(' + ')}${r.unit === 's' ? ' s' : ''}</span>
          <span class="reto-bar mt-1.5"><span style="width:${Math.max(3, pct)}%"></span></span>
          <span class="flex justify-between text-[10px] mt-1"><span class="${rest?.warn ? 'text-amber-300' : rest?.done ? 'text-emerald-300' : 'text-brand font-bold'}">${rest ? esc(rest.text) : retoDueTest(id) ? '🎯 Listo · toca test de máximo' : '● Listo para hoy'}</span><span class="text-mute">${retoU(r, r.max)}</span></span>
        </span></button>`;
  }).join('');
  return `${todayCardHTML()}<section class="card p-4 mt-3">
    <h2 class="font-extrabold text-lg">🏆 Retos</h2>
    <p class="text-[11px] text-mute mt-1">Cada reto empieza según tus repeticiones máximas seguidas. Al terminar cada sesión dime cómo te has sentido y ajusto la siguiente.</p>
    <div class="space-y-2 mt-3">${cards}</div>
  </section>`;
}
function renderRetoDetail(id) {
  const r = RETOS[id], st = retoOf(id);
  const back = `<button class="text-xs text-brand flex items-center gap-1 mb-2" data-act="retoBack" type="button">‹ Todos los retos</button>`;
  const note = r.note ? `<p class="text-[11px] text-cyan-100 bg-brand/10 border border-brand/30 rounded-lg px-2.5 py-1.5 mt-3">💡 ${esc(r.note)}</p>` : '';
  if (retoLocked(id)) return `${back}<section class="card p-4 mt-1 space-y-2">
      <div class="flex items-center gap-3"><span class="reto-ic text-3xl">🔒</span><div><h2 class="font-extrabold text-lg">${r.name}</h2><p class="text-[11px] text-mute">${esc(r.tag)}</p></div></div>
      <p class="text-sm text-mute">Se desbloquea cuando completes el nivel ${RETOS[r.needs].max} de ${esc(RETOS[r.needs].name.toLowerCase())} de rodillas. Ahí empieza lo difícil de verdad.</p>${note}</section>`;
  if (!st) return `${back}<section class="card p-4 mt-1 space-y-3">
      <div class="flex items-center gap-3"><span class="reto-ic text-3xl">${r.icon}</span><div><h2 class="font-extrabold text-lg">${r.name}</h2><p class="text-[11px] text-mute">${r.tag ? esc(r.tag) + ' · ' : ''}Niveles de ${retoU(r, r.min)} a ${retoU(r, r.max)}</p></div></div>${note}
      <label class="lbl">${r.unit === 's' ? '¿Cuántos segundos aguantas seguidos?' : '¿Cuántas haces seguidas, sin parar?'}
        <input class="field mt-1 text-center text-2xl font-black" id="retoMax" inputmode="numeric" placeholder="${r.unit === 's' ? 'Ej: 45' : 'Ej: 8'}" /></label>
      <p class="text-[11px] text-mute">Haz la prueba ahora, con buena técnica y sin parar. Empiezas un poco por debajo (≈70 %) para tener margen de subir; tu máximo queda como marca a batir. Si no llegas a ${retoU(r, r.min)}, pon lo que hagas (aunque sea 0) y te doy una variante más fácil.</p>
      <button class="btn-primary w-full" data-act="retoStart" data-reto="${id}" type="button">Empezar reto</button>
    </section>`;
  const d = retoDraft(id), rest = retoRestInfo(id), pct = Math.round((st.level - r.min) / (r.max - r.min) * 100);
  const rows = d.target.map((t, i) => `<div class="setrow ${d.done[i] ? 'is-done' : ''}" id="reto-set-${i}">
      <span class="w-7 text-xs font-bold text-mute">S${i + 1}</span>
      <span class="text-[11px] text-mute w-16 shrink-0">obj. <strong class="text-white text-sm">${retoU(r, t)}</strong></span>
      <div class="relative flex-1">
        <input class="field field-set text-brand" data-reto="${id}" data-reto-got="${i}" inputmode="numeric" autocomplete="off" value="${esc(d.got[i] !== '' ? d.got[i] : '')}" placeholder="${t}" aria-label="Hechas en la serie ${i + 1}" />
        <span class="unit">${r.unit === 's' ? 's' : 'reps'}</span>
      </div>
      ${r.unit === 's' ? `<button class="checkbtn" data-act="retoHold" data-reto="${id}" data-i="${i}" type="button" aria-label="Cronometrar">▶</button>` : ''}
      <button class="checkbtn" data-act="retoDone" data-reto="${id}" data-i="${i}" type="button" aria-label="Serie hecha">✓</button>
    </div>`).join('');
  const hist = st.history.slice(-8).reverse().map(h => `<div class="flex items-center justify-between bg-ink rounded-lg px-2.5 py-1.5 text-xs">
      <span class="text-mute">${esc(fmtDate(h.date))}</span><span>Nivel ${h.level}</span><span>${h.got.join('+')}</span><span>${(RETO_FEEL.find(f => f[0] === h.feel) || ['', ''])[1]}</span></div>`).join('');
  return `${back}<section class="card p-4 mt-1">
    <div class="flex items-center gap-3"><span class="reto-ic text-3xl">${r.icon}</span>
      <div class="flex-1 min-w-0"><h2 class="font-extrabold text-lg leading-tight">${r.name}</h2>
      <p class="text-[11px] text-mute">${r.tag ? esc(r.tag) + ' · ' : ''}Mejor marca: <strong class="text-white">${retoU(r, st.best)}</strong> · ${st.history.length} sesiones</p></div>
      <div class="text-right"><div class="text-[10px] text-mute">NIVEL</div><div class="text-2xl font-black text-brand leading-none">${st.level}</div></div></div>
    <span class="reto-bar mt-3"><span style="width:${Math.max(3, pct)}%"></span></span>
    <div class="flex justify-between text-[10px] text-mute mt-1"><span>${retoU(r, r.min)}</span><span>Meta: ${retoU(r, r.max)}</span></div>
    ${note}
    ${rest?.warn ? `<p class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 mt-3">⏸ ${esc(rest.text)}</p>` : ''}
    ${rest?.done ? `<p class="text-[11px] text-emerald-300 mt-3">✓ Ya lo hiciste hoy. Vuelve en 48 h.</p>` : `
    <div class="mt-3 space-y-1.5">${rows}</div>
    <p class="text-[11px] text-mute mt-2">${r.unit === 's' ? '▶ cronometra la serie; ✓ la marca y arranca el descanso.' : 'Si haces menos, corrige el número antes de marcar ✓.'} Descanso: ${r.rest} s.</p>
    <button class="btn-save w-full mt-3" data-act="retoFinish" data-reto="${id}" type="button">Terminar sesión</button>`}
  </section>
  <section class="card p-4 mt-3">
    <div class="flex items-center justify-between"><h3 class="section-title">Historial</h3>
      <button class="text-xs ${retoDueTest(id) ? 'text-amber-300 font-bold' : 'text-brand'} underline" data-act="retoTest" data-reto="${id}" type="button">${retoDueTest(id) ? '🎯 Toca test de máximo' : 'Test de máximo'}</button></div>
    <div class="space-y-1 mt-2">${hist || '<p class="text-xs text-mute">Aún no hay sesiones.</p>'}</div>
    <button class="text-[11px] text-mute underline mt-3" data-act="retoReset" data-reto="${id}" type="button">Reiniciar este reto</button>
  </section>`;
}
function retoStartFrom(id, max) {
  const r = RETOS[id];
  const best = clamp(Math.round(max), 0, r.max * 2);
  const level = clamp(Math.floor(best * 0.7 / r.step) * r.step, r.min, r.max);
  state.retos[id] = { level, best, startedAt: todayISO(), history: [], tests: [{ date: todayISO(), max: best }], hardStreak: 0, draft: null };
}
function retoFinish(id) {
  const r = RETOS[id], st = retoOf(id), d = retoDraft(id);
  const got = d.target.map((t, i) => { const v = parseInt(d.got[i], 10); return Number.isFinite(v) ? v : (d.done[i] ? t : 0); });
  if (!got.some(v => v > 0)) return toast('Apunta al menos una serie', 'warn');
  const completed = got.every((v, i) => v >= d.target[i]);
  openModal(`
    <div class="text-center"><h3 class="modal-title">¿Cómo te has sentido?</h3>
    <p class="text-xs text-mute mt-1">${r.icon} ${r.name} · nivel ${st.level}${completed ? '' : ' · <span class="text-amber-300">no completaste todas las series</span>'}</p></div>
    <div class="grid grid-cols-3 gap-2 mt-3">${RETO_FEEL.map(([k, e, l]) => `<button class="feel-btn" data-mact="feel" data-feel="${k}" type="button"><span class="text-4xl">${e}</span><span>${l}</span></button>`).join('')}</div>`, {
    feel: (root, b) => {
      let feel = b.dataset.feel;
      const eff = completed ? feel : 'hard';
      const before = st.level;
      if (eff === 'hard') { st.hardStreak = (st.hardStreak || 0) + 1; if (st.hardStreak >= 2) { st.level = snapLevel(r, st.level - r.step); st.hardStreak = 0; } }
      else { st.hardStreak = 0; st.level = snapLevel(r, st.level + (eff === 'easy' ? 2 : 1) * r.step); }
      st.best = Math.max(st.best, got[0]);
      const T = todayISO();
      st.history.push({ date: T, level: before, target: d.target, got, feel, completed, kcal: retoKcal(id, got, T) });
      st.draft = null; persist(); setTimeout(silentDriveBackup, 1500);
      const msg = st.level > before ? `Subes a nivel ${st.level}` : st.level < before ? `Bajamos a nivel ${st.level} para consolidar` : `Repites nivel ${st.level}`;
      openModal(`<div class="text-center"><div class="text-4xl">${st.level >= r.max && before < r.max ? '🏆' : RETO_FEEL.find(f => f[0] === feel)[1]}</div>
        <h3 class="modal-title mt-1">${completed && before >= r.max && Object.values(RETOS).some(x => x.needs === id) ? '¡Fase superada! Se desbloquea la siguiente' : st.level >= r.max && before < r.max ? '¡Nivel máximo alcanzado!' : esc(msg)}</h3>
        <p class="text-sm text-mute mt-1">${!completed && feel !== 'hard' ? 'Como no completaste todas las series, cuenta como «me ha costado». ' : ''}Próxima sesión (en 48 h): <strong class="text-white">${retoSets(id, st.level).join(' + ')}${r.unit === 's' ? ' s' : ''}</strong></p>
        <p class="text-[11px] text-mute mt-1">~${retoKcal(id, got, T)} kcal netas, sumadas al gym de hoy en Dieta.</p></div>
        <button class="btn-primary w-full mt-3" data-close type="button">Hecho</button>`);
      render();
    }
  });
}
function retoTestModal(id) {
  const r = RETOS[id], st = retoOf(id);
  openModal(`<h3 class="modal-title">🎯 Test de máximo · ${r.name}</h3>
    <p class="text-xs text-mute">Calienta bien y haz ${r.unit === 's' ? 'una plancha hasta no poder más' : 'todas las que puedas seguidas'}. Mejor en un día de descanso del reto.</p>
    <label class="lbl">${r.unit === 's' ? 'Segundos aguantados' : 'Repeticiones seguidas'}<input class="field mt-1 text-center text-2xl font-black" name="max" inputmode="numeric" /></label>
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar test</button>`, {
    autofocus: true,
    save: root => {
      const v = parseInt(mval(root, 'max'), 10);
      if (!(v > 0)) return toast('Pon un número', 'warn');
      st.tests.push({ date: todayISO(), max: v });
      const prevBest = st.best; st.best = Math.max(st.best, v);
      const fromTest = clamp(Math.floor(v * 0.7 / r.step) * r.step, r.min, r.max);
      const up = fromTest > st.level; if (up) { st.level = fromTest; st.draft = null; }
      persist(); closeModal(); render();
      toast(`${v > prevBest ? '🔥 Nueva mejor marca. ' : ''}${up ? `Subes a nivel ${st.level}` : `Sigues en nivel ${st.level}`}`);
    }
  });
}

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
  return list.map((e, i) => `<button class="chip chip-sm text-left" data-act="repeatMeal" data-i="${i}" type="button">${esc((e.last.desc || e.last.type).slice(0, 34))} <span class="text-mute">· <span class="${MAC.kcal.text}">${Math.round(e.last.kcal)}</span>${e.count > 1 ? ` · ×${e.count}` : ''}</span></button>`).join('');
}
/* ---------- Colores fijos de cada macro (mismos en toda la app) ---------- */
const MAC = {
  kcal: { hex: '#fbbf24', text: 'text-amber-300', name: 'Calorías' },
  prot: { hex: '#00d2df', text: 'text-brand', name: 'Proteína', short: 'P' },
  carbs: { hex: '#34d399', text: 'text-emerald-300', name: 'Carbohidratos', short: 'C' },
  fat: { hex: '#fb7185', text: 'text-rose-300', name: 'Grasas', short: 'G' }
};
const SEP = '<span class="text-mute"> · </span>';
/* «350 kcal · P 30 · C 40 · G 10» con cada parte en su color */
function macroLine(m) {
  return `<span class="${MAC.kcal.text}">${Math.round(m.kcal || 0)} kcal</span>${SEP}<span class="${MAC.prot.text}">P ${Math.round(m.prot || 0)}</span>${SEP}<span class="${MAC.carbs.text}">C ${Math.round(m.carbs || 0)}</span>${SEP}<span class="${MAC.fat.text}">G ${Math.round(m.fat || 0)}</span>`;
}

/* Anillos concéntricos: kcal fuera; proteína, carbohidratos y grasas dentro.
   Pasado el 100 %, el exceso da una segunda vuelta más intensa sobre el anillo ya lleno. */
function ringsSVG(vals, animate) {
  const size = 176, c = size / 2, sw = 8.5, step = 11;
  const rings = vals.map((v, i) => {
    const r = c - sw / 2 - 1 - i * step, C = 2 * Math.PI * r;
    const pct = v.target > 0 ? v.val / v.target : 0;
    const main = Math.min(1, pct), extra = Math.min(1, Math.max(0, pct - 1));
    const arc = (frac, extraStyle = '') => `<circle cx="${c}" cy="${c}" r="${r.toFixed(1)}" fill="none" stroke="${v.hex}" stroke-width="${sw}" stroke-linecap="round"
        class="${animate ? 'ring-anim' : ''}" style="stroke-dasharray:${C.toFixed(1)} ${C.toFixed(1)};stroke-dashoffset:${(C * (1 - frac)).toFixed(1)};--full:${C.toFixed(1)};${extraStyle}" transform="rotate(-90 ${c} ${c})"/>`;
    return `<circle cx="${c}" cy="${c}" r="${r.toFixed(1)}" fill="none" stroke="${v.hex}" stroke-opacity="0.16" stroke-width="${sw}"/>
      ${main > 0.004 ? arc(main, extra > 0 ? 'opacity:.38' : '') : ''}
      ${extra > 0.004 ? `<circle cx="${c}" cy="${c}" r="${r.toFixed(1)}" fill="none" stroke="#05080a" stroke-width="${sw + 3}" stroke-linecap="round" style="stroke-dasharray:${(C * extra).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>${arc(extra)}` : ''}`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" class="w-full h-auto swipe-ok" role="img" aria-label="Anillos de calorías, proteína, carbohidratos y grasas">${rings}</svg>`;
}
function ringsCard(t, st, budget, eatBack) {
  const vals = [
    { k: 'kcal', val: t.kcal, target: budget, hex: MAC.kcal.hex },
    { k: 'prot', val: t.prot, target: st.targetProt, hex: MAC.prot.hex },
    { k: 'carbs', val: t.carbs, target: st.targetCarbs, hex: MAC.carbs.hex },
    { k: 'fat', val: t.fat, target: st.targetFat, hex: MAC.fat.hex }
  ];
  const anim = !!ui._animRings; ui._animRings = false;
  const over = (val, target) => val > target ? `<span class="ml-1.5 text-[10px] font-bold rounded px-1.5 py-px bg-white/10 text-white">+${Math.round(val - target)}</span>` : '';
  const row = k => { const v = vals.find(x => x.k === k), m = MAC[k];
    return `<div>
      <div class="flex items-center gap-1.5 text-[11px] font-semibold ${m.text}"><span class="w-2 h-2 rounded-full" style="background:${m.hex}"></span>${m.name}</div>
      <div class="mt-0.5 leading-tight"><span class="text-lg font-black ${m.text}">${Math.round(v.val)}</span><span class="text-xs text-mute font-semibold"> / ${v.target} g</span>${over(v.val, v.target)}</div>
    </div>`; };
  return `<div class="flex items-center gap-4">
    <div class="relative shrink-0 w-[48%] max-w-[190px]">
      ${ringsSVG(vals, anim)}
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div class="text-[21px] font-black leading-none ${MAC.kcal.text}">${Math.round(t.kcal)}</div>
        <div class="text-[10px] text-mute font-semibold mt-1">/ ${budget} kcal${eatBack ? '*' : ''}</div>
        ${t.kcal > budget ? `<div class="text-[10px] font-bold mt-0.5 text-white">+${Math.round(t.kcal - budget)}</div>` : ''}
      </div>
    </div>
    <div class="flex-1 min-w-0 space-y-2.5">${row('prot')}${row('carbs')}${row('fat')}</div>
  </div>
  ${eatBack ? '<p class="text-[10px] text-mute mt-2">* Incluye las calorías del ejercicio de hoy (cardio y gym).</p>' : ''}`;
}

function bar(label, val, target, color) {
  const pct = target ? Math.min(100, Math.round(val / target * 100)) : 0;
  const over = target && val > target * 1.05;
  return `<div>
    <div class="flex justify-between text-[11px] mb-1"><span class="font-semibold ${color.text}">${label}</span><span class="${over ? 'text-rose-300 font-bold' : 'text-mute'}">${Math.round(val)} / ${target}</span></div>
    <div class="h-2 rounded-full bg-ink overflow-hidden"><div class="h-2 rounded-full ${color.bg}" style="width:${pct}%"></div></div>
  </div>`;
}

/* ---------- Calendario mensual (Dieta + entreno + cardio) ---------- */
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function dietStatus(date) {
  if (!mealsOf(date).length) return null;
  const st = state.settings, t = totalsOf(date);
  const budget = st.targetKcal + (st.eatBackCardio ? exerciseBurnOf(date) : 0);
  const protOk = t.prot >= st.targetProt * 0.9;
  if (t.kcal > budget * 1.2) return { c: 'red', label: 'Bastante pasado de calorías' };
  if (t.kcal > budget * 1.1 || !protOk) return { c: 'amber', label: t.kcal > budget * 1.1 ? 'Algo pasado de calorías' : 'Proteína corta' };
  return { c: 'green', label: 'Dentro del objetivo' };
}
const DOT = { green: 'bg-emerald-400', amber: 'bg-amber-400', red: 'bg-rose-500' };
function dayActivity(date) {
  return { sessions: sortedSessions().filter(s => s.date === date && s.exercises.length), cardio: state.cardio.filter(c => c.date === date) };
}
function renderCalMonth(part = 'all') {
  const m0 = ui.calMonth;
  const first = parseISO(m0);
  const y = first.getFullYear(), mo = first.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const today = todayISO();
  let logged = 0, green = 0, sess = 0, cmin = 0;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<div class="h-[44px]"></div>');
  for (let d = 1; d <= days; d++) {
    const iso = toISO(new Date(y, mo, d));
    const future = iso > today;
    const ds = dietStatus(iso), act = dayActivity(iso);
    if (ds) { logged++; if (ds.c === 'green') green++; }
    sess += act.sessions.length; cmin += act.cardio.reduce((a, c) => a + c.minutes, 0);
    const sel = iso === ui.calSel;
    cells.push(`<button class="cal-day ${sel ? 'cal-sel' : ''} ${iso === today ? 'cal-today' : ''} ${future ? 'opacity-25 pointer-events-none' : ''}" data-mact="calDay" data-d="${iso}" type="button">
      <span class="text-xs font-bold">${d}</span>
      <span class="flex items-center gap-0.5 h-3 text-[9px] leading-none">
        ${ds ? `<span class="w-1.5 h-1.5 rounded-full ${DOT[ds.c]}"></span>` : ''}${act.sessions.length ? '🏋️' : ''}${act.cardio.length ? '🔥' : ''}
      </span>
    </button>`);
  }
  while (cells.length < 42) cells.push('<div class="h-[44px]"></div>');
  const prevOk = true, nextOk = toISO(new Date(y, mo + 1, 1)) <= today;
  const head = `
    <div class="flex items-center justify-between">
      <button class="iconbtn" data-mact="calPrev" type="button" aria-label="Mes anterior" ${prevOk ? '' : 'disabled'}>‹</button>
      <div class="text-center"><div class="font-extrabold capitalize">${MONTHS[mo]} ${y}</div>
        <div class="text-[11px] text-mute whitespace-nowrap">🍽️ ${logged} · <span class="text-emerald-300">● ${green}</span> · 🏋️ ${sess} · 🔥 ${cmin}′</div></div>
      <button class="iconbtn ${nextOk ? '' : 'opacity-30 pointer-events-none'}" data-mact="calNext" type="button" aria-label="Mes siguiente">›</button>
    </div>
    <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-mute font-bold mt-3">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(x => `<div>${x}</div>`).join('')}</div>`;
  const grid = `<div class="grid grid-cols-7 gap-1">${cells.join('')}</div>`;
  if (part === 'head') return head;
  if (part === 'grid') return grid;
  return head + grid + `
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-mute mt-2">
      <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>dieta bien</span>
      <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>regular</span>
      <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>pasado</span>
      <span>🏋️ pesas</span><span>🔥 cardio</span>
    </div>
`;
}
/* Ventana del calendario: cabecera (mes) y botones fijos; en medio, días y detalle con scroll */
function renderCalendar() {
  return `<div class="cal-head" id="calHead">${renderCalMonth('head')}</div>
    <div class="cal-body">
      <div id="calMonth">${renderCalMonth('grid')}</div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-mute mt-2">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>dieta bien</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>regular</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>pasado</span>
        <span>🏋️ pesas</span><span>🔥 cardio</span>
      </div>
      <div id="calDetail">${renderCalDetail(ui.calSel)}</div>
    </div>
    <div class="cal-foot grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-mact="calToday" type="button">Hoy</button>
      <button class="btn-ghost" data-close type="button">Cerrar</button>
    </div>`;
}
function renderCalDetail(date) {
  if (!date) return '';
  const ds = dietStatus(date), t = totalsOf(date), act = dayActivity(date), st = state.settings;
  const nMeals = mealsOf(date).length;
  return `<div class="bg-ink rounded-xl border border-line p-3 mt-3 space-y-2.5">
    <div class="font-extrabold text-sm capitalize">${esc(fmtDate(date))}</div>
    <div>
      <div class="text-[11px] font-bold uppercase tracking-wider text-brand">🍽️ Dieta</div>
      ${nMeals ? `<div class="text-xs mt-0.5 flex items-center gap-1.5">${ds ? `<span class="w-2 h-2 rounded-full ${DOT[ds.c]}"></span>` : ''}<span><span class="${MAC.kcal.text}">${Math.round(t.kcal)}</span> / ${st.targetKcal} kcal${SEP}<span class="${MAC.prot.text}">P ${Math.round(t.prot)}</span> / ${st.targetProt} g${SEP}${nMeals} ${nMeals === 1 ? 'comida' : 'comidas'}</span></div>
        <div class="text-[11px] mt-0.5"><span class="${MAC.carbs.text}">C ${Math.round(t.carbs)}</span>${SEP}<span class="${MAC.fat.text}">G ${Math.round(t.fat)}</span></div>
        <div class="text-[11px] text-mute">${esc(ds?.label || '')}</div>`
        : '<div class="text-xs text-mute mt-0.5">Sin comidas registradas.</div>'}
    </div>
    <div>
      <div class="text-[11px] font-bold uppercase tracking-wider text-brand">🏋️ Entreno</div>
      ${act.sessions.length ? act.sessions.map(s => `<div class="mt-1">
          <div class="text-xs font-semibold">${esc(s.dayTitle || 'Sesión')}${s.durationMin ? ` · ⏱ ${s.durationMin} min` : ''}${gymKcalOf(s) ? ` · <span class="${MAC.kcal.text}">~${gymKcalOf(s)} kcal</span>` : ''}${s.deload ? ' · 🔋 descarga' : ''}</div>
          ${s.exercises.map(e => `<div class="text-[11px] text-mute leading-snug">· ${esc(e.name)}: <span class="font-mono">${e.sets.map(x => `${wLabel(x.w, isBwEx(e.exId))}×${x.r}`).join(' · ')}</span></div>`).join('')}
        </div>`).join('') : '<div class="text-xs text-mute mt-0.5">Sin entreno de fuerza.</div>'}
    </div>
    <div>
      <div class="text-[11px] font-bold uppercase tracking-wider text-brand">🔥 Cardio</div>
      ${act.cardio.length ? act.cardio.map(c => `<div class="text-xs mt-0.5">${CARDIO_TYPES[c.type]?.icon || '🔥'} ${esc(CARDIO_TYPES[c.type]?.label || 'Cardio')} · ${c.minutes} min · ${esc((INTENSITIES.find(i => i[0] === c.intensity) || ['', c.intensity])[1])} · <span class="text-amber-300">${c.kcal} kcal</span></div>`).join('') : '<div class="text-xs text-mute mt-0.5">Sin cardio.</div>'}
    </div>
    <button class="btn-primary w-full py-2.5" data-mact="calGo" type="button">🍽️ Ver comidas de este día</button>
  </div>`;
}
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function calSwapDetail() {
  const box = $('#calDetail'); if (!box) return;
  box.innerHTML = renderCalDetail(ui.calSel);
  if (!reduceMotion()) box.firstElementChild?.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'ease-out' });
}
function calMarkSelected() {
  document.querySelectorAll('#calMonth .cal-day').forEach(b => b.classList.toggle('cal-sel', b.dataset.d === ui.calSel));
}
let calAnimating = false;
function calSlideMonth(dir) {
  const box = $('#calMonth'), head = $('#calHead'); if (!box) return;
  document.querySelector('.cal-body')?.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  if (head) { head.innerHTML = renderCalMonth('head'); if (!reduceMotion()) head.querySelector('.capitalize')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); }
  if (reduceMotion()) { box.innerHTML = renderCalMonth('grid'); return; }
  calAnimating = true;
  const out = box.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 40}px)` }], { duration: 140, easing: 'ease-in', fill: 'forwards' });
  out.onfinish = () => {
    box.innerHTML = renderCalMonth('grid');
    out.cancel();
    const inn = box.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2,.7,.3,1)' });
    inn.onfinish = () => { calAnimating = false; };
  };
}
function openCalendar() {
  ui.calSel = ui.dietDate;
  ui.calMonth = ui.dietDate.slice(0, 8) + '01';
  const shift = n => {
    if (calAnimating) return;
    const d = parseISO(ui.calMonth);
    const next = toISO(new Date(d.getFullYear(), d.getMonth() + n, 1));
    if (next > todayISO()) return;
    ui.calMonth = next;
    calSlideMonth(n);
  };
  const handlers = {
    calPrev: () => shift(-1),
    calNext: () => shift(1),
    calDay: (root, b) => {
      if (b.dataset.d !== ui.calSel) { ui.calSel = b.dataset.d; calMarkSelected(); calSwapDetail(); }
      setTimeout(() => $('#calDetail')?.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' }), 30);
    },
    calToday: () => {
      const t = todayISO(), m = t.slice(0, 8) + '01';
      const dir = m > ui.calMonth ? 1 : m < ui.calMonth ? -1 : 0;
      ui.calSel = t;
      if (dir) { ui.calMonth = m; calSlideMonth(dir); } else calMarkSelected();
      calSwapDetail();
    },
    calGo: () => { ui.editing = null; ui.aiResult = null; ui.dietDate = ui.calSel; ui._animRings = true; closeModal(); render(); window.scrollTo({ top: 0 }); }
  };
  openModal(renderCalendar(), { ...handlers, sheetClass: 'sheet-fixed' });
}

function renderDiet() {
  const date = ui.dietDate;
  const isToday = date === todayISO();
  const st = state.settings;
  const t = totalsOf(date);
  const cardioK = burnedOf(date), gymK = gymOf(date);
  const burned = cardioK + gymK;
  const budget = st.targetKcal + (st.eatBackCardio ? burned : 0);
  const leftK = Math.round(budget - t.kcal);
  const leftP = Math.round(st.targetProt - t.prot);
  const cardioTxt = burned ? ` Con ejercicio has quemado ${burned} kcal (${[cardioK ? `cardio ${cardioK}` : '', gymK ? `gym ~${gymK}` : ''].filter(Boolean).join(' + ')}; balance neto ${Math.round(t.kcal - burned)} kcal)${st.eatBackCardio ? ', ya sumadas a tu margen' : ', que no se suman a tu margen: así el déficit es real'}.` : '';
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
      <div class="flex justify-between text-[11px] uppercase tracking-wider text-mute font-bold mb-1.5"><span>${tp}</span><span><span class="${MAC.kcal.text}">${Math.round(sub)} kcal</span>${PROT_TYPES.includes(tp) ? (() => { const pg = Math.round(items.reduce((a, m) => a + (m.prot || 0), 0)); return `<span class="text-mute"> · </span><span class="${MAC.prot.text}">P ${pg} g</span>${pg >= minProt() ? '<span class="text-emerald-300"> ✓</span>' : '<span class="ml-1 normal-case rounded px-1.5 py-px bg-white/10 text-white">baja</span>'}`; })() : ''}</span></div>
      ${items.map(m => `<div class="meal">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold truncate ${ui.editing?.id === m.id ? 'text-brand' : ''}">${ui.editing?.id === m.id ? '✏️ ' : ''}${esc(m.desc || tp)}</div>
          <div class="text-[11px] font-mono mt-0.5">${macroLine(m)}</div>
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
    <button class="text-center px-3 py-1 rounded-xl active:bg-panel" data-act="openCal" type="button" aria-label="Abrir calendario">
      <div class="font-extrabold flex items-center justify-center gap-1.5">${isToday ? 'Hoy' : esc(fmtDate(date))} <span class="text-sm">📅</span><span class="tri scale-75"></span></div>
      <div class="text-[11px] text-mute">${esc(fmtDateShort(date))}/${parseISO(date).getFullYear()}</div>
    </button>
    <button class="iconbtn ${isToday ? 'opacity-30 pointer-events-none' : ''}" data-act="dietNext" type="button" aria-label="Día siguiente">›</button>
  </div>

  <section class="card p-4 mt-3">
    ${ringsCard(t, st, budget, st.eatBackCardio && burned > 0)}
    <div class="grid grid-cols-4 gap-1.5 mt-4 text-center">
      <div class="kbox"><div class="kbox-l">Comidas</div><div class="kbox-v ${MAC.kcal.text}">${Math.round(t.kcal)}</div></div>
      <div class="kbox"><div class="kbox-l">🔥 Cardio</div><div class="kbox-v ${MAC.kcal.text}">${cardioK ? '−' + cardioK : '0'}</div></div>
      <div class="kbox"><div class="kbox-l">🏋️ Gym</div><div class="kbox-v ${MAC.kcal.text}">${gymK ? '−' + gymK : '0'}</div></div>
      <div class="kbox kbox-net"><div class="kbox-l">Neto</div><div class="kbox-v ${MAC.kcal.text}">${Math.round(t.kcal - burned)}</div></div>
    </div>
    ${gymK ? '<p class="text-[10px] text-mute mt-1.5">Gym: estimación de la app con la duración real, series, kilos y tu peso. Corrígela en Progreso → Historial.</p>' : ''}
    ${(() => { const ps = protSpread(date); return ps.total ? `<p class="text-[11px] mt-3 ${ps.ok === ps.total ? 'text-emerald-300' : 'text-amber-300'}">🥩 Proteína repartida: ${ps.ok}/${ps.total} comidas con ${minProt()} g o más${ps.low.length ? ` · baja en ${esc(ps.low.join(', ').toLowerCase())}` : ' ✓'}</p>` : ''; })()}
    <p class="text-xs text-mute mt-2 leading-relaxed">${esc(advice)}</p>
  </section>
  ${dailyHabitsHTML(date)}

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

/* ---------- Proteína por comida ---------- */
const PROT_TYPES = ['Desayuno', 'Comida', 'Puente', 'Cena']; // «Otro» (picoteos) no cuenta
const minProt = () => state.settings.minProtMeal || 25;
function protByType(date, excludeId = null) {
  const out = {};
  for (const m of mealsOf(date)) { if (m.id === excludeId || !PROT_TYPES.includes(m.type)) continue; out[m.type] = (out[m.type] || 0) + (m.prot || 0); }
  return out;
}
function protSpread(date) {
  const by = protByType(date);
  const types = Object.keys(by);
  return { total: types.length, ok: types.filter(t => by[t] >= minProt()).length, low: types.filter(t => by[t] < minProt()), by };
}
function protHintHTML() {
  const ai = ui.aiResult; if (!ai || !PROT_TYPES.includes(ui.mealType)) return '';
  const date = ui.editing?.date || ui.dietDate;
  const prev = protByType(date, ui.editing?.id)[ui.mealType] || 0;
  const tot = Math.round(prev + (ai.prot || 0));
  const ok = tot >= minProt();
  return `<span class="${ok ? 'text-emerald-300' : 'text-amber-300'}">🥩 ${esc(ui.mealType)}: ${tot} g de proteína${prev ? ` (con lo ya registrado)` : ''} ${ok ? '✓' : `· mínimo ${minProt()} g por comida`}</span>`;
}
function syncProtHint() { const el = $('#protHint'); if (el) el.innerHTML = protHintHTML(); }

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
  syncProtHint();
}
/* Añadir un ingrediente a la comida (texto → IA; sin IA, a mano) */
function addIngHTML() {
  return `<div class="flex gap-2 items-center">
      <input class="field flex-1 text-sm py-2.5" id="addIng" autocomplete="off" value="${esc(ui.addIng || '')}" placeholder="＋ Ingrediente (ej. 30 g de queso)" ${ui.addIngBusy ? 'disabled' : ''} />
      <button class="btn-ghost px-3 py-2.5 shrink-0" data-act="addIng" type="button" ${ui.addIngBusy ? 'disabled' : ''}>${ui.addIngBusy ? '<span class="spinner"></span>' : 'Añadir'}</button>
    </div>
    <button class="text-[11px] text-mute underline" data-act="addIngManual" type="button">o añadir un ingrediente a mano</button>`;
}
function ingFromAI(it) {
  const per = it.per100 || {};
  const m = num(it.medium_g) || num(it.grams) || 100;
  const fromDesc = !!it.from_description && num(it.grams) > 0;
  return { name: String(it.name || 'Alimento').slice(0, 40), fromDesc,
    sizes: { s: num(it.small_g) || Math.round(m * 0.65), m, l: num(it.large_g) || Math.round(m * 1.4) },
    sel: fromDesc ? 'x' : 'm', grams: fromDesc ? num(it.grams) : m,
    per100: { kcal: num(per.kcal) || 0, prot: num(per.protein) || 0, carbs: num(per.carbs) || 0, fat: num(per.fat) || 0 } };
}
function pushIng(item) {
  const a = ui.aiResult; if (!a) return;
  if (!a.items) a.items = [];
  // comida con macros a mano y sin alimentos: se conserva como «base» para no perder lo que había
  if (!a.items.length && (a.kcal || a.prot || a.carbs || a.fat)) a.items.push({ name: 'Base (lo que ya tenía)', fromDesc: true, sizes: { s: 100, m: 100, l: 100 }, sel: 'x', grams: 100, per100: { kcal: a.kcal, prot: a.prot, carbs: a.carbs, fat: a.fat } });
  a.items.push(item); recalcFromItems(a);
}
async function addIngredient() {
  const txt = (ui.addIng || '').trim();
  if (!txt) return toast('Escribe el ingrediente, por ejemplo «30 g de queso fresco»', 'warn');
  if (!state.settings.apiKey || !navigator.onLine) return addIngManual(txt);
  ui.addIngBusy = true; render();
  try {
    const prompt = `Eres nutricionista. Analiza SOLO este ingrediente que el usuario quiere añadir a su comida: ${JSON.stringify(txt)}.
Si da cantidad, úsala ("from_description": true). Si no, estima una ración habitual en España ("from_description": false).
Valores por 100 g del alimento tal como se come. Responde SOLO con JSON válido:
{"name": "nombre corto", "from_description": true|false, "grams": número, "small_g": número, "medium_g": número, "large_g": número, "per100": {"kcal": número, "protein": número, "carbs": número, "fat": número}}`;
    const r = parseJSONLoose(await callGemini([{ text: prompt }], { timeout: 30000 }));
    const it = ingFromAI(Array.isArray(r.items) ? r.items[0] : r);
    if (!(it.per100.kcal > 0 || it.per100.prot > 0)) throw new Error('no he podido estimar ese ingrediente');
    pushIng(it); ui.addIng = ''; toast(`Añadido: ${it.name}`);
  } catch (e) { toast('IA: ' + e.message + '. Puedes añadirlo a mano.', 'error'); }
  finally { ui.addIngBusy = false; render(); }
}
function addIngManual(pre = '') {
  openModal(`<h3 class="modal-title">Añadir ingrediente a mano</h3>
    <label class="lbl">Nombre<input class="field mt-1" name="n" maxlength="40" value="${esc(pre)}" placeholder="Ej: Queso fresco" /></label>
    <label class="lbl">Cantidad (g)<input class="field mt-1" name="g" inputmode="decimal" placeholder="Ej: 30" /></label>
    <p class="text-[11px] text-mute">Macros de esa cantidad (no por 100 g):</p>
    <div class="grid grid-cols-4 gap-2">
      <label class="lbl ${MAC.kcal.text}">kcal<input class="field mt-1 text-center" name="k" inputmode="decimal" /></label>
      <label class="lbl ${MAC.prot.text}">P<input class="field mt-1 text-center" name="p" inputmode="decimal" /></label>
      <label class="lbl ${MAC.carbs.text}">C<input class="field mt-1 text-center" name="c" inputmode="decimal" /></label>
      <label class="lbl ${MAC.fat.text}">G<input class="field mt-1 text-center" name="f" inputmode="decimal" /></label>
    </div>
    <button class="btn-primary w-full" data-mact="ok" type="button">Añadir</button>`, {
    autofocus: true,
    ok: root => {
      const n = mval(root, 'n').trim() || 'Ingrediente', g = num(mval(root, 'g')) || 0;
      const k = num(mval(root, 'k')) || 0, pp = num(mval(root, 'p')) || 0, c = num(mval(root, 'c')) || 0, f = num(mval(root, 'f')) || 0;
      if (!g) return toast('Pon la cantidad en gramos', 'warn');
      if (!(k || pp || c || f)) return toast('Pon al menos las kcal', 'warn');
      const per = x => Math.round(x / g * 100 * 10) / 10;
      pushIng({ name: n.slice(0, 40), fromDesc: true, sizes: { s: Math.round(g * 0.65), m: g, l: Math.round(g * 1.4) }, sel: 'x', grams: g, per100: { kcal: per(k), prot: per(pp), carbs: per(c), fat: per(f) } });
      ui.addIng = ''; closeModal(); render(); toast(`Añadido: ${n}`);
    }
  });
}
function renderPortions(ai) {
  const items = ai.items || [];
  if (!items.length) return `<div class="portions space-y-1.5">${addIngHTML()}</div>`;
  const pending = items.filter(it => !it.fromDesc).length;
  const row = (it, i) => {
    const kc = `<span class="${MAC.kcal.text}" data-item-kcal="${i}">${Math.round(itemMacros(it).kcal)} kcal</span>`;
    if (it.fromDesc) return `<div class="portion">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="font-semibold truncate">${esc(it.name)} <span class="text-mute font-normal">· ${Math.round(it.grams)} g, según tu descripción</span></span>
        <span class="flex items-center gap-2 shrink-0">${kc}<button class="underline text-brand" data-act="portionEdit" data-i="${i}" type="button">cambiar</button><button class="text-mute px-1" data-act="portionDel" data-i="${i}" type="button" aria-label="Quitar alimento">✕</button></span>
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
    return `<details class="portions" ${openAttr('portions')}><summary class="flex items-center justify-between cursor-pointer text-xs text-mute">
      <span>⚖️ Raciones según tu descripción (${items.length})</span><span class="tri"></span></summary>
      <div class="space-y-1.5 mt-2">${body}</div></details>
      <div class="space-y-1.5 mt-2">${addIngHTML()}</div>`;
  }
  return `<div class="portions">
    <div class="flex items-center justify-between text-xs text-mute mb-2"><span>⚖️ ¿Qué cantidad había? <span class="text-[10px]">(P pequeña · M mediana · G grande)</span></span></div>
    <div class="space-y-1.5">${body}</div>
    <div class="space-y-1.5 mt-2.5">${addIngHTML()}</div>
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
    <p class="text-[11px]" id="protHint">${protHintHTML()}</p>
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

/* Gemini con reintentos: si el modelo está saturado (alta demanda) reintenta y, si sigue, prueba modelos alternativos */
const GEMINI_FALLBACKS = ['gemini-flash-latest', 'gemini-2.5-flash'];
const geminiWait = ms => new Promise(r => setTimeout(r, ms));
function geminiErr(status, data) {
  const msg = data?.error?.message || '', st = data?.error?.status || '';
  const e = new Error(msg || `Error HTTP ${status}`); e.status = status;
  e.busy = status === 503 || status === 500 || status === 504 || /high demand|overloaded|unavailable/i.test(msg);
  e.quota = status === 429 || st === 'RESOURCE_EXHAUSTED';
  e.noModel = status === 404 || /not found|is not supported/i.test(msg);
  return e;
}
function geminiSpanish(e) {
  if (e.busy) return new Error('Gemini está saturado ahora mismo (mucha demanda en Google). Prueba en unos minutos o introduce los macros a mano.');
  if (e.quota) return new Error('Has llegado al límite gratuito de Gemini por ahora. Prueba más tarde o introduce los macros a mano.');
  if (e.status === 400 && /api key|API_KEY/i.test(e.message)) return new Error('La clave de Gemini no es válida (Ajustes → IA).');
  if (e.status === 403) return new Error('La clave de Gemini no tiene permiso o el proyecto tiene la facturación en un estado que lo impide.');
  return e;
}
async function geminiOnce(model, body, timeout) {
  const ctrl = new AbortController(), tm = setTimeout(() => ctrl.abort(), timeout);
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.settings.apiKey }, body, signal: ctrl.signal
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw geminiErr(resp.status, data);
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    if (!text) throw new Error('La IA no devolvió respuesta (bloqueo o cuota agotada).');
    return text;
  } catch (e) {
    if (e.name === 'AbortError') { const t = new Error('La IA tardó demasiado. Prueba de nuevo.'); t.busy = true; throw t; }
    throw e;
  } finally { clearTimeout(tm); }
}
async function callGemini(parts, { json = true, timeout = 45000, contents = null, system = null, temperature = 0.2 } = {}) {
  const s = state.settings;
  if (!s.apiKey) throw new Error('Falta la clave de Gemini (Ajustes).');
  if (!navigator.onLine) throw new Error('Sin conexión a internet.');
  const body = JSON.stringify({ contents: contents || [{ parts }], ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), generationConfig: json ? { responseMimeType: 'application/json', temperature } : { temperature } });
  const main = s.model || DEFAULT_MODEL;
  const models = [main, ...GEMINI_FALLBACKS.filter(m => m !== main)];
  let last = null;
  for (let mi = 0; mi < models.length; mi++) {
    const tries = mi === 0 ? 2 : 1;
    for (let attempt = 0; attempt < tries; attempt++) {
      try {
        const text = await geminiOnce(models[mi], body, timeout);
        if (mi > 0) toast(`Gemini principal saturado: respondió ${models[mi]}`, 'warn');
        return text;
      } catch (e) {
        last = e;
        if (e.noModel) break;                       // ese modelo no existe/no vale: siguiente
        if (e.quota && !e.busy) break;              // cuota de ese modelo agotada: probar otro modelo
        if (!e.busy) throw geminiSpanish(e);        // error de verdad (clave, petición…): no insistir
        if (attempt < tries - 1) await geminiWait(1500);
      }
    }
  }
  throw geminiSpanish(last || new Error('Error desconocido de la IA'));
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
      const best = Math.max(...e.sets.map(x => oneRM(e, x, s.date)));
      const reps = e.sets.reduce((a, x) => a + x.r, 0);
      pts.push({ x: s.date, y: best > 0 ? Math.round(best * 10) / 10 : reps, kg: best > 0 });
      rows.push({ date: s.date, sets: e.sets, bw: isBwEx(e.exId) });
    }
    const isBW = pts.length && pts.some(p => !p.kg);
    const pr = pts.length ? Math.max(...pts.map(p => p.y)) : 0;
    strengthHtml = `
      <select class="field" data-act-change="progEx">${opts.map(([k, v]) => `<option value="${esc(k)}" ${k === ui.progEx ? 'selected' : ''}>${esc(v.name)} (${v.count})</option>`).join('')}</select>
      <div class="flex justify-between text-[11px] text-mute mt-3"><span>${isBW ? 'Reps totales por sesión' : '1RM estimado (Epley) por sesión'}</span><span>Mejor: <strong class="text-white">${fmtNum(pr)}${isBW ? ' reps' : ' kg'}</strong></span></div>
      <div class="mt-1">${lineChart(pts, { color: '#00d2df', unit: isBW ? '' : ' kg', label: 'fuerza' })}</div>
      <div class="space-y-1 mt-2">${rows.slice(-5).reverse().map(r => `<div class="text-[11px] flex justify-between gap-3 bg-ink rounded-lg px-2.5 py-1.5"><span class="text-mute shrink-0">${fmtDate(r.date)}</span><span class="font-mono text-right">${r.sets.map(x => `${wLabel(x.w, r.bw)}×${x.r}`).join(' · ')}</span></div>`).join('')}</div>`;
  }

  const backupAge = st.lastBackup ? daysBetween(st.lastBackup, todayISO()) : null;
  const needBackup = state.sessions.length > 0 && (backupAge === null || backupAge > 7);
  const hist = sortedSessions().slice(-20).reverse();

  return `
  ${needBackup ? `<div class="banner-warn mb-3"><span>${backupAge === null ? 'Aún no has hecho copia de seguridad.' : `Última copia hace ${backupAge} días.`} Si borras datos del navegador, lo pierdes todo.</span>${state.settings.driveConnected ? '<button class="btn-banner btn-banner-warn shrink-0" data-act="driveBackup" type="button">☁️ Drive</button>' : '<button class="btn-banner btn-banner-warn shrink-0" data-act="share" type="button">📤 Copia</button>'}</div>` : ''}

  <section class="grid grid-cols-3 gap-2">
    <div class="stat"><div class="stat-v">${w.sessionsWeek}</div><div class="stat-l">sesiones esta semana</div></div>
    <div class="stat"><div class="stat-v ${MAC.kcal.text}">${w.avgK ?? '—'}</div><div class="stat-l">kcal media 7 días${w.avgK ? ` · obj. ${st.targetKcal}` : ''}</div></div>
    <div class="stat"><div class="stat-v ${MAC.prot.text}">${w.avgP ?? '—'}</div><div class="stat-l">g prot media${w.avgP ? ` · obj. ${st.targetProt}` : ''}${w.avgP !== null && w.avgP < st.targetProt * 0.9 ? '<br><span class="text-amber-300 font-bold">por debajo</span>' : ''}</div></div>
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
        <summary class="px-3 py-2.5 flex justify-between items-center cursor-pointer text-sm"><span class="font-semibold truncate">${esc(s.dayTitle || s.dayId)}${s.durationMin ? ` <span class="text-mute font-normal text-xs">· ${s.durationMin} min</span>` : ''}</span><span class="flex items-center gap-2 text-[11px] text-mute shrink-0 ml-2">${fmtDate(s.date)}<span class="tri"></span></span></summary>
        <div class="px-3 pb-3 space-y-1 text-[11px]">
          ${s.exercises.map(e => `<div><strong>${esc(e.name)}:</strong> <span class="font-mono text-mute">${e.sets.map(x => `${wLabel(x.w, isBwEx(e.exId))}×${x.r}`).join(', ')}</span></div>`).join('')}
          ${s.habits?.length ? `<div class="text-emerald-300 mt-1">✓ ${s.habits.map(esc).join(' · ')}</div>` : ''}
          ${s.skipped?.length ? `<div class="text-mute mt-1">⏭ Hoy no: ${s.skipped.map(esc).join(' · ')}</div>` : ''}
          ${(() => { const g = gymKcalInfo(s); return `<div class="mt-1.5 flex flex-wrap items-center gap-x-2">${g ? `<span class="${MAC.kcal.text}">🏋️ ~${g.kcal} kcal netas</span><span class="text-mute">${g.manual ? '(corregidas a mano)' : `(MET ${fmtNum(Math.round(g.met * 10) / 10)} · ${g.mins} min · ${fmtNum(g.bw)} kg)`}</span>` : '<span class="text-mute">Sin estimación de kcal (falta duración o peso)</span>'}<button class="underline text-brand" data-act="sessKcal" data-id="${esc(s.id)}" type="button">ajustar</button></div>`; })()}
          <div class="flex gap-4 mt-2"><button class="underline text-brand" data-act="shareSession" data-id="${esc(s.id)}" type="button">📸 Tarjeta</button>
          <button class="text-rose-300 underline" data-act="delSession" data-id="${esc(s.id)}" type="button">Borrar esta sesión</button></div>
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
    ${st.apiKey && !ui.keyUnlocked ? `
    <div class="lbl">Clave API</div>
    <div class="flex items-center gap-2 -mt-1">
      <div class="field flex-1 font-mono text-mute select-none">🔒 ${esc(maskKey(st.apiKey))}</div>
    </div>
    <div class="text-[11px] text-mute -mt-1">Modelo: <span class="font-mono">${esc(st.model || DEFAULT_MODEL)}</span></div>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="testKey" type="button">Probar conexión</button>
      <button class="btn-ghost" data-act="unlockKey" type="button">🔓 Cambiar clave</button>
    </div>
    <p class="text-[11px] text-mute">Bloqueada para que no se modifique sin querer. Para cambiarla te pedirá ${st.pinHash ? 'tu PIN' : 'una confirmación'}.</p>` : `
    <label class="lbl">${st.apiKey ? 'Nueva clave API' : 'Clave API'}
      <div class="flex gap-2 mt-1">
        <input class="field flex-1 font-mono" id="apiKey" type="${ui.showKey ? 'text' : 'password'}" autocomplete="off" spellcheck="false" value="${esc(ui.keyDraft ?? '')}" placeholder="AQ.… o AIza…" />
        <button class="iconbtn" data-act="toggleKey" type="button" aria-label="Mostrar u ocultar">${ui.showKey ? '🙈' : '👁'}</button>
      </div>
    </label>
    <label class="lbl">Modelo<input class="field mt-1 font-mono" id="apiModel" value="${esc(ui.modelDraft ?? st.model)}" placeholder="${DEFAULT_MODEL}" /></label>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-act="testKey" type="button">Probar</button>
      <button class="btn-primary" data-act="saveKey" type="button">Guardar y bloquear</button>
    </div>
    ${st.apiKey ? '<button class="btn-ghost w-full" data-act="cancelKey" type="button">Cancelar (mantener la clave actual)</button>' : ''}`}
    </div>
  </details>

  ${profileSectionHTML()}
  ${foldCard('goals', '🎯 Objetivos diarios', `${st.targetKcal} kcal · ${st.targetProt} g P`, '', `
    <div class="grid grid-cols-4 gap-2">
      <label class="lbl ${MAC.kcal.text}">kcal<input class="field mt-1 text-center" id="tK" inputmode="numeric" value="${st.targetKcal}" /></label>
      <label class="lbl ${MAC.prot.text}">Prot g<input class="field mt-1 text-center" id="tP" inputmode="numeric" value="${st.targetProt}" /></label>
      <label class="lbl ${MAC.carbs.text}">Carb g<input class="field mt-1 text-center" id="tC" inputmode="numeric" value="${st.targetCarbs}" /></label>
      <label class="lbl ${MAC.fat.text}">Grasa g<input class="field mt-1 text-center" id="tF" inputmode="numeric" value="${st.targetFat}" /></label>
    </div>
    <label class="lbl">Proteína mínima por comida (g)<input class="field mt-1" id="tPM" inputmode="numeric" value="${st.minProtMeal || 25}" /></label>
    <p class="text-[11px] ${Math.abs(sumK - st.targetKcal) > st.targetKcal * 0.05 ? 'text-amber-300' : 'text-mute'}">Tus macros suman ${sumK} kcal (objetivo ${st.targetKcal}).</p>
    <label class="habit"><input type="checkbox" id="tEat" ${st.eatBackCardio ? 'checked' : ''} /><span class="text-xs">Sumar las calorías del ejercicio (cardio y gym) a lo que puedo comer <span class="text-mute">(desactivado = déficit más fiable)</span></span></label>
    <button class="btn-primary w-full" data-act="saveGoals" type="button">Guardar objetivos</button>
`)}

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
      ${p.type === 'cardio' ? '<p class="text-[11px] text-mute bg-ink rounded-xl border border-line px-3 py-2">Bicicleta y caminata con estimación de calorías.</p>' : p.type === 'retos' ? '<p class="text-[11px] text-mute bg-ink rounded-xl border border-line px-3 py-2">Retos por niveles con ajuste según cómo te sientas.</p>' : ''}
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

  ${habitsSettingsHTML()}

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
        <label class="habit"><input type="checkbox" id="autoDrive" ${st.autoDrive !== false ? 'checked' : ''} /><span class="text-xs">Copia automática diaria (al abrir la app) y al guardar cada sesión o reto</span></label>`
      : `<p class="text-[11px] text-mute">Guarda las copias directamente en una carpeta de tu Drive, con copia automática diaria.</p>
        <button class="btn-primary w-full" data-act="driveConnect" type="button" ${ui.driveBusy ? 'disabled' : ''}>${ui.driveBusy ? '<span class="spinner"></span> Conectando…' : 'Conectar Google Drive'}</button>`}
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-ghost col-span-2" data-act="share" type="button">📤 Compartir copia (WhatsApp, correo…)</button>
      <button class="btn-ghost" data-act="export" type="button">⬇️ Descargar</button>
      <button class="btn-ghost" data-act="import" type="button">Importar</button>
      ${(() => { const pc = prevCopy(); return pc ? `<button class="btn-ghost col-span-2 text-xs" data-act="restorePrev" type="button">↩️ Volver a los datos de antes de actualizar (v${esc(pc.ver)} · ${esc(new Date(pc.at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))})</button>` : ''; })()}
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

  ${accessSectionHTML()}
  <section class="card p-4 mt-3 space-y-3">
    <h3 class="section-title">📱 Aplicación</h3>
    <div>
      <div class="text-xs font-bold">Deslizar el dedo a izquierda o derecha</div>
      <div class="seg mt-1.5" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        ${[['tabs', 'Cambia de pestaña'], ['dietDay', 'Día en Dieta · bloque en Entreno'], ['off', 'Desactivado']].map(([k, l]) => `<button class="seg-btn py-2 px-1 ${swipeMode() === k ? 'seg-on' : ''}" data-act="swipeMode" data-mode="${k}" type="button">${l}</button>`).join('')}
      </div>
    </div>
    ${deferredInstall ? `<button class="btn-primary w-full" data-act="install" type="button">Instalar en la pantalla de inicio</button>` : `<p class="text-xs text-mute">${isStandalone() ? 'Instalada como app ✓' : 'Para instalar: menú ⋮ del navegador → «Instalar aplicación» o «Añadir a pantalla de inicio».'}</p>`}
    ${versionStatusHTML()}
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
      onOk(pin);
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
      if (hasPin) await reencryptSecrets(pinVal(root, 'old'), p1);
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
const maskKey = k => (k.length > 10 ? `${k.slice(0, 4)}••••••••${k.slice(-4)}` : '••••••••');
function keepKeyDraft() { const k = $('#apiKey'), m = $('#apiModel'); if (k) ui.keyDraft = k.value; if (m) ui.modelDraft = m.value; }

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
const DRIVE_KEEP = 45; // copias que se conservan en Drive (las más antiguas se borran)
const TOKEN_KEY = 'fitnesteban_gtoken'; // fuera del estado: nunca va en las copias
const DEVICE_KEY = 'fitnesteban_device';  // identifica este móvil/PC (no va en las copias)
function deviceId() { try { let d = localStorage.getItem(DEVICE_KEY); if (!d) { d = uid('dev_'); localStorage.setItem(DEVICE_KEY, d); } return d; } catch { return 'dev_x'; } }
function deviceName() { const u = navigator.userAgent; return /iPhone|iPad/i.test(u) ? '📱 iPhone' : /Android/i.test(u) ? '📱 Android' : '💻 Ordenador'; }
const fmtWhen = ms => { if (!ms) return '¿?'; const d = new Date(+ms); return `${fmtDate(toISO(d))} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
/* Resumen de la copia más reciente de Drive (de sus etiquetas o, en copias antiguas, leyendo el archivo) */
async function driveNewest(files) {
  const f = files[0]; if (!f) return null;
  const ap = f.appProperties || {};
  if (ap.dataAt) return { f, dataAt: +ap.dataAt, deviceId: ap.deviceId || '', device: ap.device || '' };
  try {
    const st = JSON.parse(await (await driveFetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {}, false)).text());
    return { f, dataAt: dataAtOf(st), deviceId: '', device: '' };
  } catch { return null; }
}
/* ¿Hay en Drive datos más recientes de OTRO dispositivo? (margen de 1 min) */
async function driveHasNewer() {
  const nw = await driveNewest(await driveList(false));
  persist();
  if (!nw) return null;
  if (nw.deviceId && nw.deviceId === deviceId()) return null;
  return nw.dataAt > (state.dataAt || dataAtOf(state)) + 60000 ? nw : null;
}
function newerBanner(nw) {
  $('#topBanner').innerHTML = `<div class="banner-warn mt-3"><span>☁️ En Drive hay datos más recientes${nw.device ? ` (${esc(nw.device)})` : ''}, hasta ${esc(fmtWhen(nw.dataAt))}. Los de aquí llegan hasta ${esc(fmtWhen(state.dataAt))}. No subo copia para no pisarlos.</span><button class="btn-banner shrink-0" id="goRestore" type="button">Restaurar</button></div>`;
  $('#goRestore').onclick = () => { $('#topBanner').innerHTML = ''; driveRestoreList(); };
}

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
  const r = await (await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,appProperties)&pageSize=100`, {}, interactive)).json();
  return r.files || [];
}

async function driveUpload(interactive) {
  const folder = await driveFolder(interactive);
  const now = new Date();
  const name = `fitnesteban_backup_${todayISO()}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
  const boundary = 'fb' + Math.random().toString(36).slice(2);
  persist();
  const appProperties = { dataAt: String(state.dataAt || dataAtOf(state)), deviceId: deviceId(), device: deviceName(), ses: String(state.sessions.length), days: String(Object.keys(state.meals).filter(k => state.meals[k]?.length).length) };
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [folder], mimeType: 'application/json', appProperties })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${backupText()}\r\n--${boundary}--`;
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
async function driveBackupNow(force = false) {
  ui.driveBusy = true; render();
  try {
    if (!force) {
      const nw = await driveHasNewer().catch(() => null);
      if (nw) {
        ui.driveBusy = false; render();
        return openModal(`<h3 class="modal-title">⚠️ Drive tiene datos más recientes</h3>
          <p class="text-sm text-mute">La última copia${nw.device ? ` (${esc(nw.device)})` : ''} llega hasta <strong class="text-white">${esc(fmtWhen(nw.dataAt))}</strong>. Los datos de este dispositivo llegan hasta <strong class="text-white">${esc(fmtWhen(state.dataAt))}</strong>.</p>
          <p class="text-sm text-mute">Si subes ahora, la copia más reciente de Drive pasará a ser la de aquí, con datos más antiguos.</p>
          <button class="btn-primary w-full" data-mact="restore" type="button">Restaurar la de Drive aquí</button>
          <button class="btn-ghost w-full" data-mact="force" type="button">Subir la de aquí igualmente</button>
          <button class="btn-ghost w-full" data-close type="button">Cancelar</button>`, {
          restore: () => { closeModal(); driveRestoreList(); },
          force: () => { closeModal(); driveBackupNow(true); }
        });
      }
    }
    await driveUpload(true); toast('Copia guardada en Drive ✓'); $('#topBanner').innerHTML = '';
  }
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
  const best = files.reduce((m, f) => Math.max(m, +(f.appProperties?.dataAt || 0)), 0);
  const info = f => { const ap = f.appProperties || {}; if (!ap.dataAt) return '<span class="block text-[11px] text-mute">Copia antigua (sin detalles)</span>';
    const mine = ap.deviceId === deviceId();
    return `<span class="block text-[11px] ${+ap.dataAt === best ? 'text-emerald-300' : 'text-mute'}">${esc(ap.device || '')}${mine ? ' (este)' : ''} · ${esc(ap.ses || '?')} sesiones · ${esc(ap.days || '?')} días · datos hasta ${esc(fmtWhen(ap.dataAt))}${+ap.dataAt === best ? ' · la más completa' : ''}</span>`; };
  openModal(`
    <h3 class="modal-title">Restaurar desde Drive</h3>
    <p class="text-xs text-mute">Elige una copia. Sustituirá todos los datos actuales de la app. Fíjate en «datos hasta»: la más nueva no siempre es la más completa.</p>
    <div class="space-y-1.5 max-h-[50dvh] overflow-y-auto">
      ${files.slice(0, 30).map((f, i) => `<button class="w-full text-left bg-ink border ${f.appProperties?.dataAt && +f.appProperties.dataAt === best ? 'border-emerald-500/50' : 'border-line'} rounded-xl px-3 py-2.5 flex justify-between items-center gap-2" data-mact="pick" data-i="${i}" type="button">
        <span class="min-w-0"><span class="block text-sm font-semibold">Subida ${esc(label(f))}</span>${info(f)}</span><span class="text-[11px] text-mute shrink-0">${f.size ? Math.round(f.size / 1024) + ' KB' : ''}</span></button>`).join('')}
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

/* Tras guardar una sesión o un reto: copia en Drive sin preguntar (solo si Google ya dio permiso) */
async function silentDriveBackup() {
  const s = state.settings;
  if (!s.driveConnected || s.autoDrive === false || !navigator.onLine || !storedToken()) return;
  try { const nw = await driveHasNewer(); if (nw) return newerBanner(nw); await driveUpload(false); toast('☁️ Copia en Drive ✓'); } catch { /* se reintentará al abrir la app */ }
}
/* Al abrir la app: copia diaria automática */
async function maybeAutoDriveBackup() {
  const s = state.settings;
  if (!s.driveConnected || s.autoDrive === false || !navigator.onLine) return;
  const age = s.lastDriveBackup ? daysBetween(s.lastDriveBackup, todayISO()) : 99;
  if (age < 1) return;
  if (storedToken()) {
    try { const nw = await driveHasNewer(); if (nw) return newerBanner(nw); await driveUpload(false); toast('Copia diaria guardada en Drive ✓'); render(); return; } catch { /* sigue: pide permiso */ }
  }
  $('#topBanner').innerHTML = `<div class="banner-info mt-3"><span>☁️ Toca para guardar la copia diaria en Drive${s.lastDriveBackup ? ` (última hace ${age} ${age === 1 ? 'día' : 'días'})` : ''}.</span><button class="btn-banner shrink-0" id="doDriveBackup" type="button">Guardar</button></div>`;
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
    $('#timerDisplay').textContent = '¡Ya!'; $('#timerBar').style.width = '0%';
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
/* Entreno se abre en RETOS (con acceso directo a la sesión de hoy), salvo con un entreno en curso */
function trainToRetos() {
  if (activeWip()) return false;
  const r = state.plan.programs.find(p => p.type === 'retos'); if (!r) return false;
  state.plan.active = r.id; ui.retoId = null; ui.dayId = null; return true;
}
/* Dieta vuelve a «hoy» al regresar a la pestaña, tras 30 min fuera de la app o si ha cambiado el día,
   salvo que tengas una comida a medias (estimación o edición) en otro día */
function dietPending() { return !!(ui.aiResult || ui.editing); }
function dietBackToToday() { const T = todayISO(); if (ui.dietDate !== T && !dietPending()) { ui.dietDate = T; return true; } return false; }
let hiddenAt = 0, hiddenDay = todayISO();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); hiddenDay = todayISO(); if (ui.accessOpen) { ui.accessOpen = false; if (ui.view === 'settings') render(); } return; }
  if (timer.endAt) { tickTimer(); wakeOn(); }
  if (ui.dietDate > todayISO()) ui.dietDate = todayISO();
  if (hiddenAt && (Date.now() - hiddenAt > 30 * 60000 || hiddenDay !== todayISO()) && dietBackToToday() && ui.view === 'diet' && !$('#modalRoot').classList.contains('open')) { ui._animRings = true; render(); window.scrollTo({ top: 0 }); }
});

/* ---------- Hábitos: editor en Ajustes y tarjeta diaria en Dieta ---------- */
function saveHabitList() { state.settings.habits = state.settings.habitList.filter(h => h.where === 'train').map(h => h.name); persist(); render(); }
function habitsSettingsHTML() {
  const list = state.settings.habitList || [], nd = list.filter(h => h.where === 'daily').length;
  return foldCard('habits', '✅ Hábitos', list.length ? `${list.length - nd} entreno · ${nd} diario${nd === 1 ? "" : "s"}` : 'Ninguno', '', `
    <p class="text-[11px] text-mute">🏋️ <b class="text-slate-300">Entreno</b>: se marcan al guardar la sesión. 🍽️ <b class="text-slate-300">Diario</b>: salen en Dieta los días que elijas y se marcan cada día, entrenes o no.</p>
    <div class="space-y-1.5">${list.map((h, i) => `<div class="bg-ink rounded-lg px-3 py-2 space-y-2">
      <div class="flex items-center justify-between gap-2"><span class="text-[13px] font-semibold min-w-0 break-words">${esc(h.name)}</span><button class="iconbtn iconbtn-sm text-rose-300 shrink-0" data-act="habDel" data-i="${i}" type="button" aria-label="Borrar hábito">🗑</button></div>
      <div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button class="seg-btn py-1.5 ${h.where === 'train' ? 'seg-on' : ''}" data-act="habWhere" data-i="${i}" data-v="train" type="button">🏋️ Entreno</button><button class="seg-btn py-1.5 ${h.where === 'daily' ? 'seg-on' : ''}" data-act="habWhere" data-i="${i}" data-v="daily" type="button">🍽️ Diario (Dieta)</button></div>
      ${h.where === 'daily' ? `<button class="text-[12px] text-brand flex items-center gap-1" data-act="habDaysOpen" data-i="${i}" type="button">📅 ${daysLabel(h.days)} <span class="text-mute">${ui.habDaysOpen === i ? '▲' : '▼'}</span></button>
        ${ui.habDaysOpen === i ? `<div class="grid grid-cols-7 gap-1">${WEEK_ORDER.map(d => `<button class="seg-btn py-1.5 rounded-lg border ${h.days.includes(d) ? 'seg-on' : 'border-line'}" data-act="habDay" data-i="${i}" data-d="${d}" type="button">${DAY_LETTER[d]}</button>`).join('')}</div>` : ''}` : ''}
    </div>`).join('') || '<p class="text-xs text-mute">Aún no tienes hábitos.</p>'}</div>
    ${list.length < 12 ? `<div class="flex gap-2"><input class="field flex-1 min-w-0" id="habNew" maxlength="60" placeholder="Nuevo hábito (ej: 💊 Creatina 5 g)" /><button class="btn-primary px-4" data-act="habAdd" type="button">Añadir</button></div>` : '<p class="text-[11px] text-mute">Máximo 12 hábitos.</p>'}`);
}
function dailyHabitsHTML(date) {
  if (!(state.settings.habitList || []).length) return state.settings.habitsHintOff ? '' : `<div class="flex items-center gap-2 mt-3 rounded-xl border border-line bg-panel px-3 py-2 text-[12px] text-mute">
    <span class="flex-1">✅ ¿Suplementos, agua, cero alcohol…? <button class="text-brand underline" data-act="goHabits" type="button">Añade tus hábitos en Ajustes</button></span>
    <button class="iconbtn iconbtn-sm" data-act="habHintOff" type="button" aria-label="No volver a mostrar">✕</button></div>`;
  const list = dailyHabitsFor(date); if (!list.length) return '';
  const done = list.filter(h => habitDone(date, h.name)).length;
  return `<section class="card p-4 mt-3">
    <div class="flex items-center justify-between"><h3 class="section-title">✅ Hábitos ${date === todayISO() ? 'de hoy' : 'del día'}</h3><span class="text-[11px] font-bold ${done === list.length ? 'text-emerald-300' : 'text-mute'}">${done}/${list.length}${done === list.length ? ' ✓' : ''}</span></div>
    <div class="flex flex-wrap gap-2 mt-3">${list.map(h => { const on = habitDone(date, h.name); return `<button class="flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold text-left ${on ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200' : 'border-line bg-ink text-slate-300'}" data-act="dailyHabit" data-name="${esc(h.name)}" type="button" aria-pressed="${on}">
      <span class="w-5 h-5 shrink-0 rounded-md grid place-items-center text-[12px] font-black ${on ? 'bg-emerald-400 text-black' : 'border-2 border-slate-500'}">${on ? '✓' : ''}</span>${esc(h.name)}</button>`; }).join('')}</div>
  </section>`;
}

/* ---------- Primeros pasos (solo dispositivos nuevos, no administrador) ---------- */
const ACTIVITY = { low: ['Sentada', 1.35], mid: ['Algo activa', 1.5], high: ['Muy activa', 1.65] };
function needsOnboarding(me) {
  const st = state.settings;
  return !me?.admin && !st.onboarded && !st.profile && !state.sessions.length && !Object.keys(state.meals).length && !state.bodyMetrics.length;
}
function calcTargets(d) {
  const w = +d.weight, h = +d.height, a = +d.age;
  const bmr = 10 * w + 6.25 * h - 5 * a + (d.sex === 'h' ? 5 : d.sex === 'm' ? -161 : -78);
  const adj = { fat: 0.8, recomp: 0.9, muscle: 1.1, maint: 1 }[d.goal] ?? 0.9;
  const kcal = Math.round(bmr * (ACTIVITY[d.activity] || ACTIVITY.mid)[1] * adj / 10) * 10;
  const prot = Math.round(w * ({ fat: 2, recomp: 2, muscle: 1.8, maint: 1.6 }[d.goal] ?? 1.8));
  const fat = Math.round(w * 0.8);
  const carbs = Math.max(50, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { kcal, prot, carbs, fat };
}
function onboarding() {
  const d = { step: 0, ok: false, name: '', sex: '', age: '', height: '', weight: '', activity: 'mid', goal: 'recomp', key: '', keyOk: false, testing: false };
  const valid = () => d.sex && +d.age >= 14 && +d.age <= 100 && +d.height >= 120 && +d.height <= 230 && +d.weight >= 35 && +d.weight <= 250;
  const dots = () => `<div class="flex gap-1.5 justify-center">${[0, 1, 2].map(i => `<span style="height:7px;border-radius:9px;width:${i === d.step ? 22 : 7}px;background:${i === d.step ? '#22d3ee' : '#334155'}"></span>`).join('')}</div><div class="text-[11px] text-mute text-center -mt-1">Paso ${d.step + 1} de 3</div>`;
  const seg = (f, opts, cols) => `<div class="seg" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${Object.entries(opts).map(([k, v]) => `<button class="seg-btn py-2 ${d[f] === k ? 'seg-on' : ''}" data-mact="pick" data-f="${f}" data-v="${k}" type="button">${Array.isArray(v) ? v[0] : v}</button>`).join('')}</div>`;
  const s0 = () => `${dots()}<h3 class="modal-title">👋 Te damos la bienvenida</h3>
    <p class="text-sm text-mute">FITNESTEBAN es un proyecto personal de Esteban que comparte con amigos. Antes de empezar:</p>
    <div class="card p-3 space-y-2 text-[13px] leading-snug">
      <p>📱 <b>Tus datos son tuyos.</b> Se guardan en este móvil y, si quieres, en <b>tu</b> Google Drive. Nadie más los ve.</p>
      <p>🤖 <b>La IA funciona con tu propia clave de Gemini.</b> Es gratuita dentro de los límites de Google.</p>
      <p>🩺 <b>No sustituye a un profesional.</b> Las cifras son orientativas: si tienes lesiones, embarazo o algún problema de salud, consulta antes.</p>
      <p>🛠️ <b>Es un proyecto vivo.</b> Irá mejorando, pero puede tener fallos o cambiar.</p>
      <p>📶 <b>Para mantener la app</b>, envía a Esteban solo el día de último uso y la versión instalada. Nada de tu dieta ni de tus entrenos.</p>
    </div>
    <label class="flex items-start gap-2 text-[13px]"><input type="checkbox" name="ok" ${d.ok ? 'checked' : ''} style="margin-top:3px;accent-color:#22d3ee;width:18px;height:18px" /> Lo he leído y estoy de acuerdo.</label>
    <button class="btn-primary w-full" data-mact="next" type="button">Empezar</button>`;
  const s1 = () => {
    const t = valid() ? calcTargets(d) : null;
    return `${dots()}<h3 class="modal-title">🎯 Tu perfil y tus objetivos</h3>
    <p class="text-xs text-mute">Con esto calculamos tus objetivos de partida. Los puedes cambiar cuando quieras en Ajustes.</p>
    <label class="lbl">Nombre<input class="field mt-1" name="name" maxlength="24" value="${esc(d.name)}" /></label>
    <div><div class="lbl mb-1">Sexo</div>${seg('sex', SEXES, 3)}</div>
    <div class="grid grid-cols-3 gap-2">
      <label class="lbl">Edad<input class="field mt-1" name="age" inputmode="numeric" maxlength="3" value="${esc(d.age)}" /></label>
      <label class="lbl">Altura (cm)<input class="field mt-1" name="height" inputmode="numeric" maxlength="3" placeholder="170" value="${esc(d.height)}" /></label>
      <label class="lbl">Peso (kg)<input class="field mt-1" name="weight" inputmode="decimal" maxlength="5" value="${esc(d.weight)}" /></label>
    </div>
    <div><div class="lbl mb-1">Actividad diaria (sin contar el entreno)</div>${seg('activity', ACTIVITY, 3)}</div>
    <div><div class="lbl mb-1">Objetivo</div>${seg('goal', GOALS, 2)}</div>
    <div class="card p-3" id="obTargets">${t ? `<div class="text-[11px] text-mute mb-1">Tus objetivos de partida</div>
      <div class="grid grid-cols-4 gap-1 text-center">
        <div><div class="text-lg font-black text-brand">${t.kcal}</div><div class="text-[10px] text-mute">kcal</div></div>
        <div><div class="text-lg font-black">${t.prot} g</div><div class="text-[10px] text-mute">proteína</div></div>
        <div><div class="text-lg font-black">${t.carbs} g</div><div class="text-[10px] text-mute">hidratos</div></div>
        <div><div class="text-lg font-black">${t.fat} g</div><div class="text-[10px] text-mute">grasa</div></div></div>`
      : '<div class="text-[12px] text-mute text-center">Rellena sexo, edad, altura y peso para calcular tus objetivos.</div>'}</div>
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="back" type="button">Atrás</button><button class="btn-primary" data-mact="next" type="button">Siguiente</button></div>`;
  };
  const s2 = () => `${dots()}<h3 class="modal-title">🤖 Activa el Coach IA</h3>
    <p class="text-xs text-mute">Necesitas una clave gratuita de Google. Son 2 minutos y solo se hace una vez.</p>
    <ol class="card p-3 space-y-2.5 text-[13px] leading-snug">
      <li><b class="text-brand">1.</b> Toca el botón de abajo: se abre Google AI Studio.</li>
      <li><b class="text-brand">2.</b> Entra con tu cuenta de Google y acepta las condiciones.</li>
      <li><b class="text-brand">3.</b> Pulsa <b>«Create API key»</b> (Crear clave de API).</li>
      <li><b class="text-brand">4.</b> Pulsa <b>Copiar</b> y vuelve aquí.</li>
    </ol>
    <a class="btn-ghost w-full block text-center" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">🔑 Abrir Google AI Studio ↗</a>
    <label class="lbl">Pega aquí tu clave<div class="flex gap-2 mt-1"><input class="field flex-1 min-w-0 font-mono" name="key" autocomplete="off" spellcheck="false" placeholder="AIza… o AQ.…" value="${esc(d.key)}" /><button class="btn-ghost px-3" data-mact="paste" type="button">📋 Pegar</button></div></label>
    <div class="text-[13px] ${d.keyOk ? 'text-emerald-300' : 'text-mute'}" id="obKeyMsg">${d.keyOk ? '✓ Clave correcta: el Coach ya te puede responder.' : d.testing ? '<span class="spinner"></span> Comprobando la clave…' : ''}</div>
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="finish" data-skip="1" type="button">Saltar por ahora</button><button class="btn-primary" data-mact="finish" type="button">Terminar</button></div>
    <p class="text-[11px] text-mute text-center">La clave se queda solo en este móvil. Sin ella la app funciona igual, pero sin IA. También puedes ponerla luego en Ajustes.</p>`;
  const html = () => [s0, s1, s2][d.step]();
  const keep = root => {
    const g = n => root.querySelector(`[name="${n}"]`);
    if (g('ok')) d.ok = g('ok').checked;
    if (g('name')) { d.name = g('name').value.trim(); d.age = g('age').value.replace(/\D/g, ''); d.height = g('height').value.replace(/\D/g, ''); d.weight = g('weight').value.replace(',', '.').replace(/[^\d.]/g, ''); }
    if (g('key')) d.key = g('key').value.trim();
  };
  const draw = root => { root.querySelector('.modal-sheet').innerHTML = html(); root.querySelector('.modal-sheet').scrollTop = 0; bindLive(root); };
  const bindLive = root => {
    if (d.step === 1) root.querySelectorAll('[name=age],[name=height],[name=weight]').forEach(i => i.oninput = () => { keep(root); const box = root.querySelector('#obTargets'), tmp = document.createElement('div'); tmp.innerHTML = s1(); box.innerHTML = tmp.querySelector('#obTargets').innerHTML; });
    if (d.step === 2) { const k = root.querySelector('[name=key]'); if (k) k.oninput = () => { d.keyOk = false; const m = root.querySelector('#obKeyMsg'); if (m) m.textContent = ''; }; }
  };
  const test = async root => {
    keep(root); if (!d.key) { toast('Pega primero la clave', 'warn'); return false; }
    d.testing = true; draw(root);
    const saved = state.settings.apiKey; state.settings.apiKey = d.key;
    try { const r = parseJSONLoose(await callGemini([{ text: 'Responde exactamente este JSON: {"ok": true}' }], { timeout: 20000 })); d.keyOk = !!r.ok; }
    catch (e) { d.keyOk = false; toast('La clave no funciona: ' + e.message, 'error'); }
    finally { state.settings.apiKey = saved; d.testing = false; }
    if ($('#modalRoot').classList.contains('open')) draw(root);
    return d.keyOk;
  };
  openModal(html(), {
    noClose: true,
    pick: (root, b) => { keep(root); d[b.dataset.f] = b.dataset.v; draw(root); },
    back: root => { keep(root); d.step--; draw(root); },
    next: root => {
      keep(root);
      if (d.step === 0 && !d.ok) return toast('Marca la casilla para continuar', 'warn');
      if (d.step === 1) {
        if (!d.name) return toast('Escribe tu nombre', 'warn');
        if (!valid()) return toast('Revisa sexo, edad, altura (cm) y peso (kg)', 'warn');
      }
      d.step++; draw(root);
    },
    paste: async root => {
      try { const t = (await navigator.clipboard.readText()).trim(); if (!t) return toast('El portapapeles está vacío', 'warn'); root.querySelector('[name=key]').value = t; d.keyOk = false; await test(root); }
      catch { toast('No puedo leer el portapapeles: mantén pulsado el campo y elige «Pegar»', 'warn'); }
    },
    finish: async (root, b) => {
      keep(root);
      if (!b.dataset.skip && !d.keyOk && !(await test(root))) return;
      const t = calcTargets(d), st = state.settings;
      st.profile = { name: d.name.slice(0, 24), sex: d.sex, age: d.age, height: d.height, goal: d.goal, activity: d.activity };
      Object.assign(st, { targetKcal: t.kcal, targetProt: t.prot, targetCarbs: t.carbs, targetFat: t.fat, onboarded: todayISO(), usageOk: true });
      if (!b.dataset.skip && d.keyOk) st.apiKey = d.key;
      state.bodyMetrics.push({ id: uid('m_'), date: todayISO(), weight: r2(+d.weight), waist: null });
      persist(); closeModal(); ui._animRings = true; render();
      toast(`¡Listo, ${d.name}! Tus objetivos ya están puestos 💪`);
    }
  });
  bindLive($('#modalRoot'));
}

/* ---------- Mi perfil: lo usan el Coach IA y el resumen semanal ---------- */
const GOALS = { recomp: ['Recomposición', 'RECOMPOSICIÓN corporal (perder grasa manteniendo o ganando músculo)'], fat: ['Perder grasa', 'PERDER GRASA conservando el músculo'], muscle: ['Ganar músculo', 'GANAR MÚSCULO con el mínimo de grasa'], maint: ['Mantener', 'MANTENER peso y forma física, y salud'] };
const SEXES = { h: 'Hombre', m: 'Mujer', x: 'Prefiero no decirlo' };
function profileOf() { return state.settings.profile || null; }
function profileText() {
  const p = profileOf() || {};
  const who = [p.sex === 'h' ? 'hombre' : p.sex === 'm' ? 'mujer' : 'persona', p.age ? `de ${p.age} años` : 'adulta'].join(' ') + (p.height ? `, ${p.height} cm de altura` : '');
  return `${p.name || 'el usuario'} (${who}), objetivo: ${(GOALS[p.goal] || GOALS.recomp)[1]}`;
}
function profileModal(after) {
  const p = profileOf() || { name: '', sex: '', age: '', goal: 'recomp' };
  const seg = (name, opts, cur) => `<div class="seg" style="grid-template-columns:repeat(${name === 'goal' ? 2 : Object.keys(opts).length},minmax(0,1fr))">${Object.entries(opts).map(([k, v]) => `<button class="seg-btn py-2 ${cur === k ? 'seg-on' : ''}" data-mact="pick" data-f="${name}" data-v="${k}" type="button">${Array.isArray(v) ? v[0] : v}</button>`).join('')}</div>`;
  const draft = { ...p };
  const html = () => `<h3 class="modal-title">👤 Mi perfil</h3>
    <p class="text-xs text-mute">El Coach IA y el resumen semanal lo usan para darte consejos a tu medida. Solo se guarda en este móvil y en tus copias.</p>
    <label class="lbl">Nombre<input class="field mt-1" name="name" maxlength="24" value="${esc(draft.name || '')}" /></label>
    <div><div class="lbl mb-1">Sexo</div>${seg('sex', SEXES, draft.sex)}</div>
    <div class="grid grid-cols-2 gap-2">
      <label class="lbl">Edad (opcional)<input class="field mt-1" name="age" inputmode="numeric" maxlength="3" value="${esc(draft.age || '')}" /></label>
      <label class="lbl">Altura en cm (opcional)<input class="field mt-1" name="height" inputmode="numeric" maxlength="3" placeholder="Ej: 175" value="${esc(draft.height || '')}" /></label>
    </div>
    <div><div class="lbl mb-1">Objetivo</div>${seg('goal', GOALS, draft.goal)}</div>
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar</button>`;
  const keep = root => { draft.name = mval(root, 'name').trim(); draft.age = mval(root, 'age').replace(/\D/g, ''); draft.height = mval(root, 'height').replace(/\D/g, ''); };
  const handlers = {
    autofocus: !p.name,
    pick: (root, b) => { keep(root); draft[b.dataset.f] = b.dataset.v; root.querySelector('.modal-sheet').innerHTML = html(); },
    save: root => {
      keep(root);
      if (!draft.name) return toast('Pon tu nombre', 'warn');
      if (!draft.sex) return toast('Elige una opción de sexo', 'warn');
      if (draft.height && (+draft.height < 100 || +draft.height > 230)) return toast('La altura va en centímetros (ej. 175)', 'warn');
      state.settings.profile = { name: draft.name.slice(0, 24), sex: draft.sex, age: draft.age ? String(Math.min(110, +draft.age)) : '', height: draft.height || '', goal: draft.goal || 'recomp' };
      persist(); closeModal(); render(); toast('Perfil guardado ✓');
      if (after) after();
    }
  };
  openModal(html(), handlers);
}
function profileSectionHTML() {
  const p = profileOf();
  return `<section class="card p-4 mt-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0"><h3 class="section-title">👤 Mi perfil</h3>
        <p class="text-xs ${p ? 'text-slate-300' : 'text-amber-300'} mt-1 truncate">${p ? `${esc(p.name)} · ${esc(SEXES[p.sex] || '')}${p.age ? ` · ${esc(p.age)} años` : ''}${p.height ? ` · ${esc(p.height)} cm` : ''} · ${esc((GOALS[p.goal] || GOALS.recomp)[0])}` : 'Sin rellenar: el Coach IA no sabe a quién aconseja'}</p></div>
      <button class="btn-ghost px-3 py-2 shrink-0" data-act="editProfile" type="button">${p ? 'Editar' : 'Rellenar'}</button>
    </div></section>`;
}

/* =========================================================================
   COACH IA (chat con tus datos)
   ========================================================================= */
const CHAT_CHIPS = ['¿Cómo voy esta semana?', '¿Qué ceno hoy para cuadrar macros?', '¿Por qué me estanco y qué cambio?', '¿Qué entreno hoy?'];
function chatContext() {
  const T = todayISO(), st = state.settings;
  const setTxt = (exId, x) => (isBwEx(exId) ? (x.w ? `PC+${x.w}` : 'PC') : `${x.w}kg`) + `x${x.r}`;
  const t = totalsOf(T), burn = exerciseBurnOf(T), budget = st.targetKcal + (st.eatBackCardio ? burn : 0);
  const days7 = Array.from({ length: 7 }, (_, i) => addDays(T, -i)).filter(d => mealsOf(d).length).map(d => { const x = totalsOf(d); return { fecha: d, kcal: Math.round(x.kcal), P: Math.round(x.prot), C: Math.round(x.carbs), G: Math.round(x.fat) }; });
  const plan = prog().days.map(day => ({
    dia: day.label, titulo: day.title,
    ejercicios: day.exercises.map(e => { const { key, variant } = variantOf(e); const c = coachFor(e, key); return { nombre: variant.name, series: e.sets, reps: `${e.minReps}-${e.maxReps}`, peso_corporal: !!e.bw, coach_app: `${c.title}. ${c.text}` }; })
  }));
  const last = sortedSessions().slice(-8).reverse().map(s => ({ fecha: s.date, dia: s.dayTitle, min: s.durationMin || null, descarga: !!s.deload, ejercicios_saltados: s.skipped || [],
    ejercicios: s.exercises.map(e => `${e.name}: ${e.sets.map(x => setTxt(e.exId, x)).join(', ')}`) }));
  const w = activeWip();
  return {
    hoy: T, dia_semana: parseISO(T).toLocaleDateString('es-ES', { weekday: 'long' }), hora: new Date().toTimeString().slice(0, 5),
    objetivos: { kcal: st.targetKcal, proteina_g: st.targetProt, carbos_g: st.targetCarbs, grasa_g: st.targetFat, proteina_min_por_comida_g: minProt(), sumar_ejercicio_al_margen: !!st.eatBackCardio },
    dieta_hoy: { comidas: mealsOf(T).map(m => ({ tipo: m.type, que: m.desc, kcal: Math.round(m.kcal), P: Math.round(m.prot), C: Math.round(m.carbs), G: Math.round(m.fat) })),
      total: { kcal: Math.round(t.kcal), P: Math.round(t.prot), C: Math.round(t.carbs), G: Math.round(t.fat) },
      quedan: { kcal: Math.round(budget - t.kcal), P: Math.round(st.targetProt - t.prot), C: Math.round(st.targetCarbs - t.carbs), G: Math.round(st.targetFat - t.fat) },
      quemado_ejercicio_kcal: Math.round(burn) },
    dieta_ultimos_7_dias: days7,
    resumen_semana: weekData(),
    programa_activo: prog().name, plan_y_recomendacion_del_coach: plan,
    ultimas_sesiones: last,
    entreno_en_curso: w ? { dia: allDays().find(d => d.id === w.dayId)?.label, minutos: sessionMinutes(w.d) } : null,
    cardio_14_dias: state.cardio.filter(c => c.date >= addDays(T, -13)).map(c => ({ fecha: c.date, tipo: CARDIO_TYPES[c.type]?.label || c.type, min: c.minutes, intensidad: c.intensity, kcal: c.kcal })),
    medidas_corporales: [...state.bodyMetrics].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8).map(m => ({ fecha: m.date, peso: m.weight, cintura: m.waist })),
    semana_de_descarga: deloadActive(),
    retos: RETO_IDS.filter(id => state.retos[id]).map(id => { const r = RETOS[id], st = state.retos[id]; return { reto: r.name, unidad: r.unit, nivel: st.level, meta: r.max, mejor_marca: st.best, proxima_sesion: retoSets(id, st.level), ultimas: st.history.slice(-3).map(h => ({ fecha: h.date, hecho: h.got, sensacion: h.feel })) }; })
  };
}
function chatSystem() {
  return `Eres el coach de FITNESTEBAN, la app de entreno y dieta de ${profileText()}. Dirígete a ${(profileOf()?.name) || 'la persona'} por su nombre si viene a cuento y adapta todos los consejos a su sexo, edad y objetivo.
Responde en español de España, directo y breve (máx. ~120 palabras salvo que pida más detalle). Puedes usar **negritas** y listas cortas con "- ".
Reglas:
- Básate en SUS DATOS de abajo. Cita números concretos (kg, reps, g, kcal, fechas). Si faltan datos para responder, dilo y pide el dato concreto.
- El campo "coach_app" es lo que la app le recomienda en cada ejercicio (doble progresión). No lo contradigas sin explicar por qué.
- "quedan" = lo que le falta hoy para sus objetivos (negativo = se ha pasado). Para comidas, propone platos normales de España con cantidades en gramos y sus macros aproximados.
- Nada de frases motivacionales vacías. Si menciona dolor, lesión o algo médico, recomienda consultar a un profesional y no diagnostiques.
- Comprueba si sus objetivos diarios ("objetivos": kcal y proteína) encajan con su sexo, edad, altura, peso actual y objetivo. Si claramente NO encajan (p. ej. demasiado altos o bajos para esa persona), avísale una sola vez en la conversación, en una o dos frases, con cifras orientativas y diciendo que los cambia en Ajustes → Objetivos diarios. Si faltan edad o altura, puedes sugerir que las añada en Ajustes → Mi perfil.
- Cuando propongas una o varias comidas CONCRETAS (alimentos con cantidades), añade al final de tu respuesta un bloque oculto EXACTAMENTE con este formato (no lo menciones en el texto):
\`\`\`comida
{"opciones":[{"titulo":"nombre corto","tipo":"Desayuno|Comida|Puente|Cena|Otro","items":[{"nombre":"alimento","gramos":número,"por100":{"kcal":n,"p":n,"c":n,"g":n}}]}]}
\`\`\`
  Una opción por cada alternativa que propongas. Valores por 100 g del alimento tal como se come. Si no propones comida concreta, no añadas el bloque.
DATOS (JSON, null = sin dato):
${JSON.stringify(chatContext())}`;
}
/* Comidas propuestas por el coach: bloque ```comida {json}``` al final de la respuesta → botones «Apuntar en Dieta» */
function chatMeals(reply) {
  let meals = [];
  const text = String(reply).replace(/```comida\s*([\s\S]*?)```/gi, (_, js) => {
    try {
      const d = parseJSONLoose(js);
      for (const o of (Array.isArray(d.opciones) ? d.opciones : [])) {
        const items = (Array.isArray(o.items) ? o.items : []).map(it => {
          const pr = it.por100 || {};
          return { name: String(it.nombre || 'Alimento').slice(0, 40), grams: Math.max(1, Math.round(num(it.gramos) || 100)),
            per100: { kcal: num(pr.kcal) || 0, prot: num(pr.p) || 0, carbs: num(pr.c) || 0, fat: num(pr.g) || 0 } };
        }).filter(it => it.per100.kcal > 0 || it.per100.prot > 0);
        if (items.length) meals.push({ title: String(o.titulo || 'Propuesta del coach').slice(0, 60), type: MEAL_TYPES.includes(o.tipo) ? o.tipo : '', items });
      }
    } catch { /* bloque ilegible: se ignora */ }
    return '';
  }).trim();
  return { text, meals: meals.slice(0, 4) };
}
const mealKcal = m => Math.round(m.items.reduce((a, it) => a + it.per100.kcal * it.grams / 100, 0));
function mealFromChat(m) {
  const items = m.items.map(it => ({ name: it.name, fromDesc: false, sizes: { s: Math.round(it.grams * 0.65), m: it.grams, l: Math.round(it.grams * 1.4) }, sel: 'm', grams: it.grams, per100: { ...it.per100 } }));
  ui.dietDate = todayISO(); ui.editing = null; ui.img = null;
  ui.mealType = m.type || guessMealType(); ui.mealDesc = m.title;
  ui.aiResult = { desc: m.title, items, kcal: 0, prot: 0, carbs: 0, fat: 0, note: '⚡ Propuesta del Coach IA: ajusta las raciones a lo que de verdad vayas a comer y pulsa Registrar.' };
  recalcFromItems(ui.aiResult);
  closeModal();
  if (ui.view !== 'diet') { ui.view = 'diet'; ui._animRings = true; }
  render();
  setTimeout(() => $('#mealCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}
function mdLite(t) {
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let out = '', inList = false;
  for (const l of lines) {
    const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
    if (m) { if (!inList) { out += '<ul class="chat-ul">'; inList = true; } out += `<li>${m[1]}</li>`; continue; }
    if (inList) { out += '</ul>'; inList = false; }
    out += l.trim() ? `<p>${l}</p>` : '';
  }
  return out + (inList ? '</ul>' : '');
}
function chatBodyHTML() {
  const c = ui.chat;
  if (!state.settings.apiKey) return `<div class="text-center text-sm text-mute mt-8">Necesitas tu clave de Gemini.<br><button class="btn-ghost mt-3" data-mact="toKey" type="button">Ir a Ajustes → IA</button></div>`;
  if (!c.msgs.length) return `
    <div class="text-center mt-2"><div class="text-4xl">💬</div>
      <p class="text-sm text-mute mt-2 leading-relaxed">Pregúntame lo que quieras sobre tu entreno o tu dieta. Leo tu plan, tus últimas sesiones, lo que llevas comido y tu peso.</p></div>
    <div class="flex flex-col gap-2 mt-4">${CHAT_CHIPS.map((q, i) => `<button class="chat-chip" data-mact="chip" data-i="${i}" type="button">${esc(q)}</button>`).join('')}</div>
    ${chatHistoryHTML()}`;
  return c.msgs.map((m, i) => m.role === 'user'
    ? `<div class="chat-me">${esc(m.text)}</div>`
    : `<div class="chat-ai${m.error ? ' chat-err' : ''}">${mdLite(m.text)}${m.error && i === c.msgs.length - 1 ? '<button class="text-xs text-brand underline mt-1" data-mact="retry" type="button">Reintentar</button>' : ''}${(m.meals || []).map((ml, j) => `<button class="chat-meal" data-mact="toDiet" data-m="${i}" data-o="${j}" type="button"><span>🍽️ Apuntar en Dieta</span><span class="text-[11px] opacity-80 truncate">${m.meals.length > 1 ? esc(ml.title) + ' · ' : ''}${esc(ml.type || 'comida que toca')} · ~${mealKcal(ml)} kcal</span></button>`).join('')}</div>`).join('')
    + (c.busy ? '<div class="chat-ai chat-typing"><span></span><span></span><span></span></div>' : '');
}
/* Historial: conversaciones de los últimos 7 días (máx. 20). Solo la conversación abierta se envía a Gemini. */
const CHAT_DAYS = 7, CHAT_MAX = 20;
function pruneChats() { const lim = Date.now() - CHAT_DAYS * 86400000; state.chats = (state.chats || []).filter(c => c.at >= lim).sort((a, b) => b.at - a.at).slice(0, CHAT_MAX); }
function saveChatConv(c) {
  if (!c.id) c.id = uid('c_');
  const msgs = c.msgs.filter(m => !m.error).slice(-30);
  state.chats = (state.chats || []).filter(x => x.id !== c.id);
  state.chats.unshift({ id: c.id, at: Date.now(), msgs });
  pruneChats(); persist();
}
function chatTitle(cv) { const u = cv.msgs.find(m => m.role === 'user'); return u ? u.text : 'Conversación'; }
function chatHistoryHTML() {
  pruneChats();
  const list = state.chats || [];
  if (!list.length) return '';
  const shown = ui.histAll ? list : list.slice(0, 5);
  return `<div class="mt-5 border-t border-line pt-3">
    <button class="w-full flex items-center justify-between text-xs text-mute" data-mact="histToggle" type="button"><span>🕘 Conversaciones anteriores (${list.length})</span><span class="tri ${ui.histOpen ? 'rotate-180' : ''}"></span></button>
    ${ui.histOpen ? `<div class="space-y-1 mt-2">${shown.map(cv => `<div class="flex items-center gap-1">
        <button class="flex-1 min-w-0 text-left bg-ink border border-line rounded-lg px-2.5 py-2" data-mact="openConv" data-id="${esc(cv.id)}" type="button">
          <span class="block text-[10px] text-mute">${esc(fmtChatDate(cv.at))}${cv.msgs.some(m => m.meals?.length) ? ' · 🍽️' : ''}</span>
          <span class="block text-xs truncate">${esc(chatTitle(cv))}</span></button>
        <button class="text-mute px-2 py-2" data-mact="delConv" data-id="${esc(cv.id)}" type="button" aria-label="Borrar conversación">✕</button></div>`).join('')}
      ${!ui.histAll && list.length > 5 ? `<button class="w-full text-[11px] text-brand underline mt-1" data-mact="histMore" type="button">Ver ${list.length - 5} más</button>` : ''}
      <p class="text-[10px] text-mute mt-1">Se guardan 7 días (máx. ${CHAT_MAX}).</p></div>` : ''}
  </div>`;
}
function fmtChatDate(ts) {
  const d = new Date(ts), iso = toISO(d), T = todayISO();
  return iso === T ? `hoy ${d.toTimeString().slice(0, 5)}` : iso === addDays(T, -1) ? 'ayer' : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
function refreshChat() {
  const b = $('#chatBody'); if (!b) return;
  b.innerHTML = chatBodyHTML();
  b.scrollTop = b.scrollHeight;
  const send = $('#chatSend'); if (send) send.disabled = !!ui.chat.busy;
  const nb = $('#chatNew'); if (nb) nb.classList.toggle('invisible', !ui.chat.msgs.length);
}
async function chatSend(text) {
  const c = ui.chat; text = String(text || '').trim();
  if (!text || c.busy) return;
  c.msgs = c.msgs.filter(m => !m.error);
  c.msgs.push({ role: 'user', text }); c.busy = true; refreshChat();
  try {
    const contents = c.msgs.slice(-12).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const reply = await callGemini(null, { json: false, contents, system: chatSystem(), temperature: 0.4, timeout: 60000 });
    const { text: clean, meals } = chatMeals(reply);
    c.msgs.push({ role: 'model', text: clean, ...(meals.length ? { meals } : {}) });
    saveChatConv(c);
  } catch (e) {
    c.msgs.push({ role: 'model', text: 'No he podido responder: ' + e.message, error: true });
  } finally { c.busy = false; refreshChat(); }
}
function openChat() {
  if (!profileOf()) return profileModal(openChat);
  ui.chat = { msgs: [], busy: false }; ui.histOpen = false; ui.histAll = false;
  openModal(`
    <div class="cal-head flex items-center gap-2 pb-3">
      <span class="text-xl">💬</span><div class="min-w-0"><h3 class="modal-title leading-tight">Coach IA</h3><p class="text-[11px] text-mute">Responde con tus datos · Gemini</p></div>
      <button id="chatNew" class="ml-auto text-xs text-brand border border-line rounded-full px-3 py-1 invisible" data-mact="new" type="button">Nueva</button>
      <button class="w-8 h-8 rounded-full border border-line text-mute" data-close type="button" aria-label="Cerrar">✕</button>
    </div>
    <div id="chatBody" class="cal-body space-y-2.5"></div>
    <div class="cal-foot"><form id="chatForm" class="flex gap-2 items-end">
      <textarea id="chatInput" rows="1" class="field flex-1 resize-none max-h-28 py-2.5" placeholder="Pregunta al coach…" enterkeyhint="send"></textarea>
      <button id="chatSend" class="btn-primary px-4 py-2.5 shrink-0" type="submit" aria-label="Enviar">➤</button>
    </form></div>`, {
    sheetClass: 'sheet-fixed',
    chip: (r, b) => chatSend(CHAT_CHIPS[+b.dataset.i]),
    toDiet: (r, b) => { const ml = ui.chat.msgs[+b.dataset.m]?.meals?.[+b.dataset.o]; if (ml) mealFromChat(ml); },
    histToggle: () => { ui.histOpen = !ui.histOpen; refreshChat(); },
    histMore: () => { ui.histAll = true; refreshChat(); },
    openConv: (r, b) => { const cv = state.chats.find(x => x.id === b.dataset.id); if (!cv) return; ui.chat = { id: cv.id, msgs: cv.msgs.map(m => ({ ...m })), busy: false }; refreshChat(); },
    delConv: (r, b) => { state.chats = state.chats.filter(x => x.id !== b.dataset.id); persist(); refreshChat(); },
    new: () => { ui.chat = { msgs: [], busy: false }; refreshChat(); },
    retry: () => { const lastQ = [...ui.chat.msgs].reverse().find(m => m.role === 'user'); if (lastQ) { ui.chat.msgs = ui.chat.msgs.filter(m => !m.error); ui.chat.msgs.pop(); chatSend(lastQ.text); } },
    toKey: () => { closeModal(); ui.aiOpen = true; go('settings'); }
  });
  refreshChat();
  const inp = $('#chatInput');
  const grow = () => { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 112) + 'px'; };
  inp.addEventListener('input', grow);
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = inp.value; inp.value = ''; grow(); chatSend(v); });
}
$('#chatBtn')?.addEventListener('click', openChat);

/* =========================================================================
   GUÍA Y NOVEDADES
   ========================================================================= */
/* Tercer campo opcional: 'admin' = solo lo ve el administrador; 'quiet' = arreglo sin aviso.
   El resto de usuarios no reciben aviso por esas versiones; en el historial les sale «Mejoras en la aplicación». */
const CHANGELOG = [
  ['4.27.4', ['📲 Aviso para instalar la app (solo si no está instalada): botón directo en Android, instrucciones en iPhone y aviso si se abre dentro de WhatsApp. También en la pantalla de acceso.'], 'quiet'],
  ['4.27.3', ['📶 Los nombres pasan solos a tu hoja de uso (columna «nombre»): al abrir Acceso y cada vez que creas, renombras, renuevas o quitas un acceso. Requiere actualizar el script una vez (Reconfigurar → nueva versión).'], 'admin'],
  ['4.27.2', ['📋 Acceso: botón «Copiar huellas y nombres» para pegar en tu hoja de uso y ver quién es cada huella. La app pide a los buscadores que no la muestren (noindex).'], 'admin'],
  ['4.27.1', ['🏆 Récord en el momento: al marcar ✓ una serie que supera tu mejor marca, la app te avisa al instante (con vibración). El resumen al guardar y la tarjeta para compartir siguen mostrando tus récords.']],
  ['4.27.0', ['⏭ «Hoy no»: en cada ejercicio puedes saltártelo solo por hoy. No cuenta en tu progreso, no suma al tiempo estimado y queda anotado en el historial.', '⇄ Alternativas en todos los ejercicios: los de serie traen al menos 2 nuevas, y en cualquiera (también en los tuyos) puedes pedir 2 a la IA o añadirlas a mano.']],
  ['4.26.4', ['📶 Registro de uso: al actualizar, el móvil vuelve a avisar en el momento con su versión nueva (antes la hoja mantenía la versión vieja hasta el día siguiente).'], 'quiet'],
  ['4.26.3', ['📶 Registro de uso: la clave del script ya no cambia al cerrar y reabrir la ventana de configuración, y hay un botón «Reconfigurar» por si algo falla.'], 'admin'],
  ['4.26.2', ['📶 La app envía a Esteban solo el día de último uso y la versión instalada, para saber quién tiene que actualizar. Nada de tu dieta ni de tus entrenos.']],
  ['4.26.1', ['📶 Registro de uso: solo envían su día de último uso y versión los móviles que lo han aceptado en las condiciones de los primeros pasos (usuarios nuevos) y el tuyo. Sin avisos para el resto.'], 'admin'],
  ['4.26.0', ['📶 Registro de uso en Ajustes → Acceso: ves cuándo usó cada persona la app por última vez y con qué versión. Se configura una vez con una hoja de Google y un Apps Script.'], 'admin'],
  ['4.25.2', ['📂 Ajustes más recogido: «Objetivos diarios» y «Hábitos» van plegados, como la IA. Se abren con un toque y a la derecha ves el resumen.', '🩹 Si al actualizar a la 4.25.1 tu lista de hábitos se quedó vacía, vuelve a aparecer.']],
  ['4.25.1', ['🧹 Quien instala la app desde cero empieza con la lista de hábitos en blanco (con un aviso en Dieta para añadirlos).'], 'quiet'],
  ['4.25.0', ['✅ Hábitos de Entreno o Diarios: en Ajustes eliges dónde va cada uno. Los diarios (suplementos, agua, cero alcohol…) salen en Dieta y se marcan cada día, entrenes o no, solo los días de la semana que elijas. El Coach y el resumen semanal ven cuántos días los cumples.']],
  ['4.24.1', ['📣 Novedades por perfil: los cambios de administración (Acceso, primeros pasos…) solo te los anuncia a ti. El resto solo recibe aviso cuando una versión les afecta; en su historial, lo demás sale como «Mejoras en la aplicación».'], 'admin'],
  ['4.24.0', ['🔑 Acceso: los códigos nuevos quedan guardados (cifrados con tu PIN) para verlos o copiarlos cuando quieras. Nuevo botón 🔄 para dar un código nuevo a quien lo pierda, y envío directo por WhatsApp. Al cambiar el PIN se vuelven a cifrar los códigos y la llave de GitHub.'], 'admin'],
  ['4.23.1', ['🔑 Los códigos de acceso recién creados funcionan a la primera, sin esperar a que GitHub publique la lista.'], 'quiet'],
  ['4.23.0', ['👋 Primeros pasos para quien instala la app: condiciones, perfil con objetivos calculados a su medida y guía para activar la clave de Gemini.'], 'admin'],
  ['4.22.1', ['📏 Altura en «Mi perfil». El Coach IA y el resumen semanal te avisan si tus objetivos de kcal o proteína no encajan con tu perfil.']],
  ['4.22.0', ['👤 Nuevo «Mi perfil» en Ajustes (nombre, sexo, edad y objetivo): el Coach IA y el resumen semanal te aconsejan a tu medida.', '📖 La guía «?» muestra tus propios bloques y días.']],
  ['4.21.2', ['🕘 El Coach IA guarda tus conversaciones de los últimos 7 días (hasta 20). Ábrelas desde «Conversaciones anteriores» y retómalas donde las dejaste.']],
  ['4.21.1', ['➕ «Añadir ingrediente» en cualquier comida cargada (estimada con foto o texto, propuesta por el Coach o al editarla): escribe «30 g de queso fresco» y la IA calcula sus macros, o añádelo a mano.']],
  ['4.21.0', ['🍽️ Cuando el Coach IA te propone una comida, aparece «Apuntar en Dieta»: abre la comida que toca con los alimentos ya cargados para que ajustes raciones y la registres.']],
  ['4.20.5', ['🤖 Si Gemini está saturado, la app reintenta sola y, si hace falta, usa otro modelo de Gemini. Los errores de la IA salen en español.']],
  ['4.20.4', ['🔒 La sección Acceso de Ajustes va plegada y se abre con tu PIN (o con tu código personal si el dispositivo no tiene PIN). Se cierra sola al salir de Ajustes o de la app.'], 'admin'],
  ['4.20.2', ['🔑 Acceso privado: cada persona entra con su propio código. La lista pública solo contiene huellas; el administrador crea y quita códigos desde Ajustes → Acceso (con GitHub conectado y su PIN).'], 'admin'],
  ['4.19.1', ['🌱 Retos para cualquier nivel: si en la prueba inicial no llegas al mínimo, empiezas en el nivel más bajo con una variante más fácil. La rueda abdominal empieza ahora en 1.']],
  ['4.19.0', ['🛞 Nuevo reto: rueda abdominal en dos fases. De rodillas (1–30, 3 series con bajada lenta) y, al completarla, de pie (1–15).']],
  ['4.18.2', ['⚡ El botón del Coach IA es ahora un rayo cian metalizado, como TEBAN.']],
  ['4.18.1', ['☁️ Copias más seguras con varios dispositivos: cada copia indica de qué dispositivo es y hasta cuándo llegan sus datos, y la copia automática ya no sube datos más antiguos que los que hay en Drive (te ofrece restaurar).']],
  ['4.18.0', ['🏆 Entreno se abre en RETOS, con una tarjeta «Hoy te toca…» para ir a tu sesión en un toque (salvo con un entreno en curso). Los retos que ya han descansado 48 h salen resaltados.']],
  ['4.17.0', ['☁️ Copia en Drive diaria y, además, al guardar cada sesión o reto (se conservan las 45 últimas).', '🔎 En Ajustes → Aplicación ves la versión instalada y la publicada en GitHub, para saber si hay que actualizar.', '🛟 Red de seguridad: si algo falla, aviso con botón de copia en vez de pantalla en blanco, y copia local automática antes de cada actualización (Ajustes → Copias → «Volver a los datos de antes de actualizar»).']],
  ['4.16.4', ['📅 Dieta vuelve siempre a «Hoy» al regresar desde otra pestaña, y también al volver a la app tras 30 min o al cambiar de día (salvo que tengas una comida a medias).']],
  ['4.16.3', ['🎯 Los anillos de Dieta se animan siempre que aparece un día: al cambiar con las flechas, al deslizar o desde el calendario.']],
  ['4.16.2', ['✨ La fila de bloques de Entreno acompaña al dedo al deslizar y deja el bloque activo a la izquierda, sin saltos.']],
  ['4.16.1', ['✨ En Entreno, al deslizar, el resalte cian pasa de un bloque a otro con el dedo y la pantalla se funde suavemente con la del bloque nuevo, sin desplazarse.']],
  ['4.16.0', ['👆 El modo de deslizar «Día en Dieta · bloque en Entreno»: en Entreno, deslizar cambia de bloque (RETOS, PPT, FULL BODY…). Se desactiva solo mientras tienes un entreno en curso.']],
  ['4.15.1', ['🏆 En RETOS, «Paralelas» pasa a llamarse «Fondos».']],
  ['4.15.0', ['🏆 Nuevo bloque RETOS en Entreno: dominadas, flexiones, fondos, sentadillas, burpees, plancha y rueda abdominal por niveles. Al acabar cada sesión eliges cómo te has sentido y el coach ajusta la siguiente.']],
  ['4.14.0', ['👆 Nuevo en Ajustes → Aplicación: el gesto de deslizar puede cambiar de pestaña, cambiar de día en Dieta (como las flechas ‹ ›) o estar desactivado.']],
  ['4.13.8', ['✨ Logo nuevo FS en la cabecera, la tarjeta de compartir y el icono de la app, y la marca FITNESTEBAN con su mismo estilo: plata, cian con brillo y la S partida por un hueco limpio.']],
  ['4.13.6', ['✨ La cabecera y la tarjeta de compartir estrenan el logo de la S partida.']],
  ['4.13.4', ['📱 Icono nuevo de la app: la S partida en blanco y cian, dentro de un círculo oscuro con luz.']],
  ['4.13.2', ['✨ Marca renovada: la S de FITNESTEBAN se parte en diagonal en dos mitades, blanca y cian.']],
  ['4.13.1', ['⚡ El Coach está arriba, junto al «?» y el cronómetro: tres botones iguales. La barra inferior vuelve a sus 4 pestañas.', '⏱ Al terminar el descanso, el cronómetro dice «¡Ya!».']],
  ['4.13.0', ['⚡ Coach IA: nuevo botón con el rayo arriba, junto al «?». Pregúntale sobre tu entreno o tu dieta y responde con tus datos (plan, sesiones, comidas de hoy, peso…), sin salir de la app.', '⏱ El temporizador de descanso, en reposo, es solo el icono; al arrancar muestra la cuenta atrás.']],
  ['4.12.2', ['🔒 La clave de Gemini queda bloqueada: para cambiarla pide tu PIN (o una confirmación) y «Probar conexión» ya no guarda nada.']],
  ['4.12.1', ['⏱ La franja del entreno en curso está siempre arriba (también en Entreno) y te lleva directa a la serie que toca.', '🗑️ «Abandonar» se mueve junto a «Guardar sesión», con confirmación.']],
  ['4.12.0', ['🤸 Ejercicios con peso corporal: el peso pasa a ser lastre (vacío = PC).', '⏱ Franja fija de «entreno en curso» en todas las pestañas.', '📸 Tarjeta para compartir al terminar la sesión.', '🏋️ kcal del gym estimadas: Dieta muestra Comidas · Cardio · Gym · Neto.']],
  ['4.11.3', ['✨ Nueva marca en la cabecera: FITNE en blanco, la S partida en diagonal y TEBAN en cian, igual en cualquier móvil.']],
  ['4.11.1', ['↺ «Igual que S1»: copia el peso y las reps de la serie anterior con un toque.']],
  ['4.11.0', ['🎯 Anillos en Dieta: calorías fuera; proteína, carbohidratos y grasas dentro. Si te pasas, el exceso da una segunda vuelta.', '🎨 Cada macro con su color en toda la app: kcal ámbar, P cian, C verde, G rosa.', '🏠 La app se abre en la dieta de hoy (o en Entreno si tienes un entreno a medias). Toca el logo para volver aquí.']],
  ['4.10.2', ['📅 En el calendario, el mes y los botones «Hoy» y «Cerrar» quedan siempre a la vista; solo se desplaza el contenido del medio.']],
  ['4.10.1', ['📅 Calendario más fluido: el mes se desliza al cambiarlo y el detalle del día aparece suavemente, sin que la ventana salte.']],
  ['4.10.0', ['⏱ Duración de los entrenos: estimada antes de empezar (según series, reps y descansos) y real, medida sola desde la primera serie ✓ hasta guardar (las pausas de más de 20 min no cuentan).']],
  ['4.9.0', ['📅 Calendario en Dieta: toca la fecha. Cada día muestra cómo fue la dieta (punto de color) y si entrenaste (🏋️) o hiciste cardio (🔥); al tocar un día ves el detalle.']],
  ['4.8.2', ['👆 Al deslizar, la pantalla siguiente entra acompañando al dedo; arreglado el parpadeo de la barra inferior.']],
  ['4.8.1', ['👆 Cambia de pestaña deslizando el dedo a izquierda o derecha (se puede desactivar en Ajustes → Aplicación).']],
  ['4.8.0', ['🥩 Proteína por comida: cada desayuno, comida, puente y cena te indica si llega al mínimo (25 g por defecto, ajustable en Ajustes → Objetivos). El resumen semanal lo tiene en cuenta.']],
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
    'Arriba eliges el <b>bloque</b> ({{BLOQUES}}) y debajo el <b>día</b>. El punto ● marca el día que te toca según tu rotación; ✓ el que ya hiciste hoy.',
    'Cada bloque lleva su propia rotación: {{ROTACION}}',
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
    '🤸 <b>Peso corporal</b>: activa «Con peso corporal» en el ✎ del ejercicio (dominadas, fondos…). El campo de peso pasa a ser el <b>lastre</b>: vacío = solo tu peso (PC). El 1RM y los récords suman tu último peso registrado.',
    '⏱ Con un entreno en curso, una franja ámbar fija bajo la cabecera muestra el tiempo y la serie que toca, en cualquier pestaña. Tócala y te lleva directa a esa serie.',
    '🗑️ «Abandonar» (junto a «Guardar sesión») borra lo apuntado en el entreno de hoy, siempre con confirmación.',
    '📸 Al guardar la sesión, «Tarjeta» crea una imagen para compartir en redes (también desde Progreso → Historial).',
    '↺ <b>Igual que la serie anterior</b>: bajo cada serie (desde la S2) puedes copiar el peso y las reps de la anterior con un toque; después pulsa ✓.',
    '⇄ cambia de variante, ✎ edita series, rango, descanso, incremento y vídeo. «▶ Técnica» abre YouTube.',
    '⏱ Bajo el título del día ves la <b>duración estimada</b>. La <b>real</b> se mide sola desde tu primera serie ✓ hasta «Guardar sesión»; si paras más de 20 min, esa pausa no cuenta. Tras 2 sesiones verás tu media real.',
    'Al final, «Guardar sesión»: verás resumen, volumen y récords personales (1RM estimado).'
  ]],
  ['🏆 Retos', [
    'En Entreno → bloque <b>🏆 RETOS</b>: dominadas, flexiones, fondos, sentadillas, burpees, plancha y rueda abdominal. Al empezar dices cuántas haces seguidas y la app te coloca en un nivel (≈70 % de tu máximo).',
    'El nivel es la 1.ª serie; el resto se calcula sola (en niveles altos: 100 · 54 · 50 · 50 · 46 %). Marca cada serie con ✓ (arranca el descanso); en la plancha, ▶ cronometra la serie.',
    'Al terminar, elige 😣 Me ha costado (repites; si pasa dos veces, bajas un nivel), 🙂 Bien (+1 nivel) o 😎 Voy sobrado (+2). Si no completas las series, cuenta como «me ha costado».',
    '🛞 <b>Rueda abdominal</b>: 3 series (100 · 70 · 60 %) con bajada lenta. Fase 1 de rodillas hasta 30; al completar el nivel 30 se desbloquea la fase 2, de pie (1–15).',
    'Deja 48 h entre sesiones del mismo reto. Cada 6 sesiones te propone un test de máximo. Las kcal se suman al gym del día en Dieta.'
  ]],
  ['🔥 Cardio', [
    'Elige bicicleta o caminata, minutos e intensidad. «Calcular con IA» estima calorías <b>netas</b> (lo que gastas por encima del reposo) usando tu último peso.',
    'La app compara con un cálculo estándar (MET) y te avisa si la IA se desvía mucho. Puedes corregir el número antes de registrar.',
    'El finisher de bici de los hábitos <b>no suma calorías</b>: si lo haces, regístralo aquí.'
  ]],
  ['🥗 Dieta y raciones', [
    'Foto (cámara o galería) y/o descripción. Lo que escribas <b>manda</b>: «200 g de pollo» fija esa cantidad.',
    'Tras «Estimar macros con IA», ajusta cada alimento con <b>P / M / G</b> (pequeña, mediana, grande) u «Otra» con los gramos exactos. ✕ quita un alimento que la IA vio por error.',
    '🥩 <b>Proteína por comida</b>: en recomposición importa repartirla. Cada toma principal (desayuno, comida, puente, cena) debería llegar al mínimo (25 g por defecto). «Otro» (picoteos) no cuenta. Al registrar verás si la toma llega, sumando lo ya registrado en ese tipo.',
    'Consumidas · Cardio · Neto: el cardio se muestra pero <b>no amplía</b> lo que te queda por comer, salvo que lo actives en Ajustes.',
    '🏋️ <b>Gym</b>: la app estima las kcal netas de cada sesión con la duración real, las series, los kilos y tu peso (MET 3,5 a 6). Salen en Dieta junto al cardio (Comidas · Cardio · Gym · Neto) y puedes corregirlas en Progreso → Historial → ajustar.',
    '🎯 La app se abre en la <b>dieta de hoy</b>: anillo exterior = kcal (ámbar); dentro, proteína (cian), carbohidratos (verde) y grasas (rosa). Si te pasas, el exceso da una segunda vuelta y sale una etiqueta «+…». Con un entreno a medias (últimas 3 h) se abre en Entreno. El <b>logo</b> siempre te trae aquí.',
    '👆 Si en Ajustes → Aplicación eliges «Día en Dieta · bloque en Entreno», deslizar el dedo en Dieta pasa al día siguiente o anterior (como las flechas ‹ ›) y en Entreno, al bloque siguiente o anterior de tu fila de bloques. Con un entreno en curso, en Entreno no hace nada para no sacarte de la serie. Las pestañas se cambian con la barra de abajo.',
    '📅 Toca la <b>fecha</b> de Dieta para abrir el calendario del mes: punto verde/ámbar/rojo según la dieta, 🏋️ si hubo pesas y 🔥 si hubo cardio. Al tocar un día ves el detalle y puedes ir a sus comidas.',
    '✎ en una comida la edita; ⭐ «Comidas habituales» repite tus platos más frecuentes de ese tipo, y el buscador encuentra cualquiera del historial.'
  ]],
  ['⚡ Coach IA', [
    'El botón ⚡ de arriba (junto al «?») abre un chat con Gemini que <b>lee tus datos</b>: plan y recomendación del coach en cada ejercicio, últimas 8 sesiones, comidas de hoy y lo que te queda, dieta de la semana, cardio y medidas.',
    'Cada vez que lo abres empieza de cero (respuestas con tus datos de ese momento). «Ver la última conversación» recupera la anterior.',
    'Usa tu misma clave y el mismo límite gratuito que la estimación de comidas. Nunca se envían la clave ni el PIN.'
  ]],
  ['📈 Progreso', [
    'Peso y cintura en ayunas, a la misma hora. La línea del peso es la <b>media de 7 días</b>: el peso diario oscila 1–2 kg por agua y sal. Con 8+ días de pesajes verás la tendencia semanal y si va bien para recomposición (bajar 0,25–1 % por semana o mantener peso bajando cintura).',
    '🧠 <b>Resumen semanal</b>: cada lunes (o cuando quieras) analiza 7 días de fuerza, dieta, cardio y peso, y te da 3 acciones para la semana siguiente.',
    '🏆 <b>Récords personales</b>: mejor peso y mejor 1RM estimado de cada ejercicio, con fecha.',
    '«Fuerza por ejercicio» dibuja tu 1RM estimado (o reps totales en ejercicios sin peso).',
    'En el historial puedes borrar una sesión mal guardada: el coach dejará de tenerla en cuenta.'
  ]],
  ['🔒 Datos, copias y PIN', [
    'Tus datos viven <b>solo en este móvil</b>. Conecta <b>☁️ Google Drive</b> (Ajustes → Copias): cada día, al abrir la app, y al guardar cada sesión o reto, se guarda una copia en la carpeta «FITNESTEBAN – copias» (si Google pide confirmar, verás un aviso arriba para hacerlo con un toque). Desde ahí también puedes restaurar. La app te avisa si pasan más de 7 días.',
    'La copia no incluye la clave de Gemini ni el PIN. Al importar se conservan los actuales.',
    'Con PIN activo, «Borrar todo» e «Importar» lo piden. Antes de borrar se descarga una copia automáticamente.',
    'Ábrela siempre desde el icono instalado, no desde Chrome.'
  ]],
  ['🔄 Actualizar la app', [
    'Cuando subes una versión nueva a GitHub aparece «Hay una versión nueva» → Actualizar. Comprueba el número en Ajustes → Aplicación.',
    'Tras actualizar verás una vez las novedades. Puedes volver a verlas desde esta guía.'
  ]]
];

const isAdminUser = () => !!access.me?.admin;
const newsForMe = ([, , tag]) => isAdminUser() || !tag;
function renderNews(fromVer) {
  let list = CHANGELOG.filter(([v]) => !fromVer || cmpVer(v, fromVer) > 0);
  if (fromVer && !isAdminUser()) list = list.filter(newsForMe);
  // historial para usuarios: las versiones internas seguidas se agrupan en una sola línea
  const rows = [];
  for (const e of list) {
    if (newsForMe(e)) rows.push({ v: e[0], items: e[1] });
    else if (rows.length && rows[rows.length - 1].internal) rows[rows.length - 1].v2 = e[0];
    else rows.push({ v: e[0], items: ['🔧 Mejoras en la aplicación.'], internal: true });
  }
  return rows.slice(0, 4).map(r => `<div class="mt-3 first:mt-0">
      <div class="text-xs font-extrabold ${r.internal ? 'text-mute' : 'text-brand'}">Versión ${r.v2 ? r.v2 + '–' + r.v : r.v}</div>
      <ul class="mt-1 space-y-1 text-sm ${r.internal ? 'text-mute' : 'text-slate-300'} list-disc pl-5">${r.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');
}
function openNews(fromVer) {
  openModal(`
    <div class="flex items-center gap-2"><span class="text-2xl">🎉</span><h3 class="modal-title">Novedades</h3><span class="text-xs text-mute ml-auto">v${APP_VERSION}</span></div>
    <div>${renderNews(fromVer)}</div>
    <button class="btn-primary w-full mt-4" data-close type="button">Entendido</button>
  `);
}
/* La guía usa los bloques y días de ESTE móvil */
function guideData() {
  const ps = state.plan.programs;
  const blocks = ps.map(p => `${p.icon ? p.icon + ' ' : ''}${esc(p.name)}`).join(', ') || 'tus bloques';
  const rp = ps.find(p => p.type === 'strength' && p.days.filter(d => d.rotation).length >= 2);
  const rd = rp ? rp.days.filter(d => d.rotation) : [];
  const rot = rp ? `en ${esc(rp.name)}, al guardar ${esc(rd[0].label)} el siguiente que te propone es ${esc(rd[1].label)}${rd[2] ? `, luego ${esc(rd[2].label)}` : ''}, y así sucesivamente.` : 'al guardar un día, el siguiente que te propone es el que le sigue dentro del bloque, y así sucesivamente.';
  return GUIDE.map(([t, items]) => [t, items.map(x => x.replace('{{BLOQUES}}', blocks).replace('{{ROTACION}}', rot))]);
}
function openGuide() {
  openModal(`
    <div class="flex items-center gap-2"><img src="icons/logo-128.png" alt="" class="w-8 h-8 rounded-full" /><h3 class="modal-title">Guía de FITNESTEBAN</h3></div>
    <p class="text-xs text-mute -mt-1">Toca cada apartado para desplegarlo.</p>
    <div class="space-y-2">
      ${guideData().map(([title, items]) => `<details class="guide-item">
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

const USAGE_NOTICE_VER = '4.26.2';
function maybeShowNews() {
  const seen = state.settings.lastSeenVersion;
  if (seen === APP_VERSION) return;
  const markSeen = () => { state.settings.lastSeenVersion = APP_VERSION; persist(); };
  const hasData = state.sessions.length || Object.keys(state.meals).length;
  const from = seen || (hasData ? '4.4.1' : null); // sin registro previo: si ya usabas la app, vienes de la 4.4.1
  if (!(from && cmpVer(APP_VERSION, from) > 0)) return markSeen();
  // sin novedades para este usuario (solo cambios de administración o arreglos internos): se marca como vista sin avisar
  if (!CHANGELOG.some(e => cmpVer(e[0], from) > 0 && cmpVer(e[0], APP_VERSION) <= 0 && newsForMe(e))) return markSeen();
  // se marca como vista solo cuando de verdad se muestra (por si la app se recarga justo al arrancar)
  setTimeout(() => {
    if ($('#modalRoot').classList.contains('open')) return;
    if (cmpVer(USAGE_NOTICE_VER, from) > 0) state.settings.usageOk = true; // ha visto la línea del registro de uso
    markSeen(); openNews(from); setTimeout(usagePing, 1500);
  }, 600);
}

/* =========================================================================
   RENDER Y EVENTOS
   ========================================================================= */
function render() {
  try { renderInner(); }
  catch (e) {
    console.error(e);
    $('#app').innerHTML = `<section class="card p-4 mt-1 space-y-3 border-rose-500/40">
      <h2 class="font-extrabold text-lg">⚠️ Algo ha fallado al mostrar esta pantalla</h2>
      <p class="text-sm text-mute">Tus datos están guardados en el móvil. Haz una copia por si acaso y vuelve a Dieta o recarga.</p>
      <p class="text-[11px] text-mute font-mono bg-ink rounded-lg p-2 break-words">${esc(String(e && e.message || e)).slice(0, 200)}</p>
      <div class="grid grid-cols-2 gap-2">
        ${state.settings.driveConnected ? '<button class="btn-primary col-span-2" data-act="driveBackup" type="button">☁️ Copia en Drive ahora</button>' : ''}
        <button class="btn-ghost" data-act="export" type="button">⬇️ Descargar copia</button>
        <button class="btn-ghost" data-act="safeHome" type="button">Ir a Dieta (hoy)</button>
        <button class="btn-ghost col-span-2" data-act="reloadApp" type="button">Recargar la app</button>
      </div>
    </section>`;
  }
}
function renderInner() {
  const app = $('#app');
  if (ui.view === 'train') app.innerHTML = installBannerHTML() + renderTrain();
  else if (ui.view === 'diet') app.innerHTML = installBannerHTML() + renderDiet();
  else if (ui.view === 'progress') app.innerHTML = installBannerHTML() + renderProgress();
  else app.innerHTML = renderSettings();
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('navbtn-on', b.dataset.view === ui.view));
  const sub = { train: 'Entreno · coach', diet: 'Nutrición', progress: 'Tu progreso', settings: 'Ajustes' };
  $('#headerSub').textContent = sub[ui.view];
  watchWipInline();
  if (ui.view === 'train') fixProgRow();
}
/* Mantiene a la vista el bloque activo en la fila de bloques (la fila se repinta en cada render) */
/* El bloque activo se coloca a la izquierda de la fila (si se puede), dejando ver los siguientes */
function progScrollFor(row, chip) {
  const first = row.querySelector('[data-prog]');
  return clamp(chip.offsetLeft - (first ? first.offsetLeft : 0), 0, Math.max(0, row.scrollWidth - row.clientWidth));
}
function fixProgRow() {
  const row = $('#progRow'), on = row?.querySelector('.prog-on');
  if (!row || !on) { ui._progScroll = null; return; }
  row.scrollLeft = typeof ui._progScroll === 'number' ? ui._progScroll : progScrollFor(row, on);
  ui._progScroll = null;
}
function animScroll(row, to, ms) {
  const from = row.scrollLeft, t0 = performance.now();
  if (Math.abs(to - from) < 1) { row.scrollLeft = to; return; }
  const step = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); row.scrollLeft = from + (to - from) * e; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- Franja fija «Sesión en curso» bajo la cabecera ---------- */
function activeWip() {
  let best = null;
  for (const [dayId, d] of Object.entries(state.drafts || {})) {
    if (d?.lastAt && Date.now() - d.lastAt < 3 * 3600000 && draftHasData(dayId) && programOfDay(dayId)) {
      if (!best || d.lastAt > best.d.lastAt) best = { dayId, d };
    }
  }
  return best;
}
/* Serie en curso: la primera sin ✓ del último ejercicio tocado (o de los siguientes) */
function wipTarget(w) {
  const day = allDays().find(x => x.id === w.dayId); if (!day || !day.exercises.length) return null;
  const exs = day.exercises, d = w.d;
  const start = Math.max(0, exs.findIndex(e => e.id === d.lastEx));
  for (let k = 0; k < exs.length; k++) {
    const e = exs[(start + k) % exs.length];
    const { key, variant } = variantOf(e);
    const n = setCount(e, key, d), done = d.done?.[key] || [];
    for (let i = 0; i < n; i++) if (!done[i]) return { exId: e.id, key, i, name: variant.name };
  }
  return { save: true };
}
function watchWipInline() { updateWipBar(); }
function updateWipBar() {
  const bar = $('#wipBar'); if (!bar) return;
  const w = activeWip();
  if (!w) { if (!bar.classList.contains('hidden')) { bar.classList.add('hidden'); bar.innerHTML = ''; } return; }
  const day = allDays().find(x => x.id === w.dayId);
  const mins = sessionMinutes(w.d), t = wipTarget(w);
  const where = !t ? '' : t.save ? 'Todo hecho · guardar' : `${t.name} · S${t.i + 1}`;
  bar.innerHTML = `<button class="wip-bar" data-wip="${esc(w.dayId)}" type="button">
      <span class="flex items-center gap-2 min-w-0"><span class="wip-dot"></span><span class="truncate"><strong>${esc(day?.label || 'Entreno')}</strong>${mins ? ` · ⏱ ${mins} min` : ''}${where ? ` · <span class="text-amber-100">${esc(where)}</span>` : ''}</span></span>
      <span class="tri shrink-0"></span></button>`;
  bar.classList.remove('hidden');
}
function goToWip() {
  const w = activeWip(); if (!w) return;
  const pr = programOfDay(w.dayId); if (pr) state.plan.active = pr.id;
  ui.dayId = w.dayId;
  const t = wipTarget(w);
  if (t && !t.save) { w.d.open = w.d.open || {}; w.d.open[t.key] = true; }
  if (ui.view !== 'train') go('train'); else render();
  setTimeout(() => {
    const el = t && !t.save ? document.getElementById(`set-${t.exId}-${t.i}`) : document.getElementById('saveRow');
    if (!el) return;
    const top = (document.querySelector('header')?.getBoundingClientRect().height || 100);
    const y = el.getBoundingClientRect().top + window.scrollY - top - (window.innerHeight - top) / 3;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1600);
  }, 60);
}
$('#wipBar')?.addEventListener('click', e => { if (e.target.closest('[data-wip]')) goToWip(); });
setInterval(updateWipBar, 30000);

function go(view) {
  if (view === 'diet' && ui.view !== 'diet') { ui._animRings = true; dietBackToToday(); }
  if (view === 'train' && ui.view !== 'train') trainToRetos();
  ui.view = view;
  if (view === 'settings' && navigator.onLine) loadGis().catch(() => null);
  if (view === 'settings') checkRemoteVersion();
  if (view !== 'settings') ui.accessOpen = false;
  render();
  window.scrollTo({ top: 0 });
}
document.querySelectorAll('.navbtn[data-view]').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

/* ---------- Deslizar entre pestañas ----------
   La pantalla siguiente entra desde el lado siguiendo el dedo.
   Solo con un gesto claramente horizontal y largo; nunca desde los bordes (gesto «atrás» de Android),
   ni sobre filas deslizables, campos, gráficas o ventanas abiertas. No da la vuelta. */
const VIEWS = ['train', 'diet', 'progress', 'settings'];
const VIEW_HTML = { train: () => renderTrain(), diet: () => renderDiet(), progress: () => renderProgress(), settings: () => renderSettings() };
const swipe = { on: false, axis: null, x0: 0, y0: 0, dx: 0, dir: 0, peek: null, busy: false };
const appEl = document.getElementById('app');
const NO_SWIPE = '.chips-row, input, textarea, select, svg:not(.swipe-ok), .seg, .modal-sheet, [data-noswipe]';
const W = () => window.innerWidth;
function setX(el, x, ms = 0) {
  el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.2,.7,.3,1)` : '';
  el.style.transform = x ? `translate3d(${x}px,0,0)` : '';
}
function makePeek(view) {
  const prevView = ui.view;
  ui.view = view;
  let html = '';
  const prevDate = ui.dietDate, prevProg = state.plan.active, prevReto = ui.retoId, prevDay = ui.dayId;
  if (view === 'diet') { ui._animRings = true; dietBackToToday(); }
  if (view === 'train') trainToRetos();
  try { html = VIEW_HTML[view](); } finally { ui.view = prevView; ui._animRings = false; ui.dietDate = prevDate; state.plan.active = prevProg; ui.retoId = prevReto; ui.dayId = prevDay; }
  const el = document.createElement('div');
  el.className = 'swipe-peek';
  el.style.top = appEl.getBoundingClientRect().top + 'px';
  el.innerHTML = `<div class="max-w-xl mx-auto px-4 pt-4">${html}</div>`;
  document.body.appendChild(el);
  return el;
}
function dropPeek() { swipe.peek?.remove(); swipe.peek = null; }
/* Modo del gesto: 'tabs' (pestañas), 'dietDay' (solo días en Dieta) u 'off' */
function swipeMode() { const m = state.settings.swipeMode; return m || (state.settings.swipeNav === false ? 'off' : 'tabs'); }
function swipeTarget(dir) {
  if (swipeMode() === 'dietDay') {
    if (ui.view === 'train') {
      if (activeWip()) return null;
      const ps = state.plan.programs, np = ps[ps.findIndex(p => p.id === prog().id) + dir];
      return np ? { prog: np.id } : null;
    }
    const d = addDays(ui.dietDate, dir);
    return d <= todayISO() ? { date: d } : null;
  }
  const v = VIEWS[VIEWS.indexOf(ui.view) + dir];
  return v ? { view: v } : null;
}
/* Entreno: el resalte cian viaja de un bloque a otro con el dedo y el contenido se funde (sin desplazar la pantalla) */
const pf = { ind: null, row: null, cur: null, tgt: null, content: [], s0: 0, s1: 0 };
const EASE = 'cubic-bezier(.2,.7,.3,1)';
function progFadeSetup(target) {
  progFadeClear();
  const row = $('#progRow'); if (!row) return;
  pf.row = row; pf.cur = row.querySelector('.prog-on');
  pf.tgt = target ? [...row.querySelectorAll('[data-prog]')].find(b => b.dataset.prog === target.prog) : null;
  pf.content = [...appEl.children].slice(1);
  if (!pf.cur) return;
  const ind = document.createElement('div'); ind.className = 'prog-ind';
  ind.style.height = pf.cur.offsetHeight + 'px'; ind.style.top = pf.cur.offsetTop + 'px';
  row.appendChild(ind); pf.ind = ind;
  pf.cur.classList.add('prog-ghost');
  progInd(0);
  pf.s0 = row.scrollLeft; pf.s1 = pf.tgt ? progScrollFor(row, pf.tgt) : pf.s0;
}
function progInd(p, ms = 0, nudge = 0) {
  if (!pf.ind) return;
  const a = pf.cur, b = pf.tgt || pf.cur;
  const x = a.offsetLeft + (b.offsetLeft - a.offsetLeft) * p + nudge, w = a.offsetWidth + (b.offsetWidth - a.offsetWidth) * p;
  pf.ind.style.transition = ms ? `transform ${ms}ms ${EASE}, width ${ms}ms ${EASE}` : '';
  pf.ind.style.width = w + 'px'; pf.ind.style.transform = `translateX(${x}px)`;
  a.classList.toggle('prog-lit', p <= 0.5);
  if (pf.tgt) pf.tgt.classList.toggle('prog-lit', p > 0.5);
}
function progContent(op, ms = 0) { for (const c of pf.content) { c.style.transition = ms ? `opacity ${ms}ms ease` : ''; c.style.opacity = op; } }
function progFadeMove(dx, target) {
  const p = target ? Math.min(1, Math.abs(dx) / (W() * 0.45)) : 0;
  progInd(p, 0, target ? 0 : -Math.sign(dx) * Math.min(10, Math.abs(dx) * 0.05));
  if (pf.row) pf.row.scrollLeft = pf.s0 + (pf.s1 - pf.s0) * p;   // la fila acompaña al dedo, sin saltos
  progContent(1 - 0.75 * p);
}
function progFadeClear() {
  pf.ind?.remove(); pf.cur?.classList.remove('prog-ghost', 'prog-lit'); pf.tgt?.classList.remove('prog-lit');
  for (const c of pf.content) { c.style.transition = ''; c.style.opacity = ''; }
  Object.assign(pf, { ind: null, row: null, cur: null, tgt: null, content: [] });
}
function progFadeEnd(target, ok) {
  if (!ok) { progInd(0, 200); progContent(1, 200); if (pf.row) animScroll(pf.row, pf.s0, 200); setTimeout(progFadeClear, 220); return; }
  swipe.busy = true;
  progInd(1, 200); progContent(0, 160);
  if (pf.row) animScroll(pf.row, pf.s1, 170);
  const keep = pf.s1;
  setTimeout(() => {
    state.plan.active = target.prog; ui.dayId = nextDayId(); ui.retoId = null; persist();
    pf.content = []; pf.ind = null; pf.cur = null; pf.tgt = null;
    ui._progScroll = keep; render(); window.scrollTo({ top: 0 });
    const fresh = [...appEl.children].slice(1);
    for (const c of fresh) { c.style.transition = ''; c.style.opacity = '0'; }
    requestAnimationFrame(() => requestAnimationFrame(() => { for (const c of fresh) { c.style.transition = 'opacity 260ms ease'; c.style.opacity = '1'; } }));
    setTimeout(() => { for (const c of fresh) { c.style.transition = ''; c.style.opacity = ''; } swipe.busy = false; }, 300);
  }, 170);
}
function makeProgPeek(id) {
  const pa = state.plan.active, pd = ui.dayId, pr = ui.retoId;
  state.plan.active = id; ui.dayId = nextDayId(); ui.retoId = null;
  let html = '';
  try { html = renderTrain(); } finally { state.plan.active = pa; ui.dayId = pd; ui.retoId = pr; }
  const el = document.createElement('div');
  el.className = 'swipe-peek';
  el.style.top = appEl.getBoundingClientRect().top + 'px';
  el.innerHTML = `<div class="max-w-xl mx-auto px-4 pt-4">${html}</div>`;
  document.body.appendChild(el);
  return el;
}
function makeDayPeek(date) {
  const prev = ui.dietDate, pe = ui.editing, pa = ui.aiResult;
  ui.dietDate = date; ui.editing = null; ui.aiResult = null; ui._animRings = true;
  let html = '';
  try { html = renderDiet(); } finally { ui._animRings = false; ui.dietDate = prev; ui.editing = pe; ui.aiResult = pa; }
  const el = document.createElement('div');
  el.className = 'swipe-peek';
  el.style.top = appEl.getBoundingClientRect().top + 'px';
  el.innerHTML = `<div class="max-w-xl mx-auto px-4 pt-4">${html}</div>`;
  document.body.appendChild(el);
  return el;
}
document.addEventListener('touchstart', e => {
  swipe.on = false; swipe.axis = null;
  const mode = swipeMode();
  if (swipe.busy || mode === 'off' || (mode === 'dietDay' && !(ui.view === 'diet' || (ui.view === 'train' && !activeWip()))) || e.touches.length !== 1 || $('#modalRoot').classList.contains('open')) return;
  const t = e.touches[0], edge = 28;
  if (t.clientX < edge || t.clientX > W() - edge) return;
  if (!appEl.contains(e.target) || e.target.closest(NO_SWIPE)) return;
  Object.assign(swipe, { on: true, x0: t.clientX, y0: t.clientY, dx: 0, dir: 0 });
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!swipe.on) return;
  const t = e.touches[0];
  const dx = t.clientX - swipe.x0, dy = t.clientY - swipe.y0;
  if (!swipe.axis) {
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    swipe.axis = Math.abs(dx) > Math.abs(dy) * 1.6 ? 'x' : 'y';
    if (swipe.axis === 'y') { swipe.on = false; return; }
  }
  const dir = dx < 0 ? 1 : -1; // 1 = siguiente (entra por la derecha), -1 = anterior
  const target = swipeTarget(dir);
  if (ui.view === 'train' && swipeMode() === 'dietDay') {
    if (dir !== swipe.dir) { swipe.dir = dir; progFadeSetup(target); }
    swipe.dx = dx; progFadeMove(dx, target); return;
  }
  if (dir !== swipe.dir) { dropPeek(); swipe.dir = dir; if (target) swipe.peek = target.view ? makePeek(target.view) : target.prog ? makeProgPeek(target.prog) : makeDayPeek(target.date); }
  swipe.dx = dx;
  if (!target) { setX(appEl, dx * 0.12); return; } // primera o última: solo un pequeño rebote
  setX(appEl, dx);
  setX(swipe.peek, dir * W() + dx);
}, { passive: true });
function swipeEnd() {
  if (!swipe.on) return;
  swipe.on = false;
  if (swipe.axis !== 'x') return;
  const target = swipeTarget(swipe.dir);
  const ok = target && Math.abs(swipe.dx) >= W() * 0.25;
  if (ui.view === 'train' && swipeMode() === 'dietDay') return progFadeEnd(target, ok);
  if (!ok) {
    setX(appEl, 0, 200);
    if (swipe.peek) { const pk = swipe.peek; swipe.peek = null; setX(pk, swipe.dir * W(), 200); setTimeout(() => pk.remove(), 220); }
    setTimeout(() => setX(appEl, 0), 220);
    return;
  }
  swipe.busy = true;
  setX(appEl, -swipe.dir * W(), 220);
  setX(swipe.peek, 0, 220);
  setTimeout(() => {
    setX(appEl, 0);
    if (target.view) go(target.view);           // pinta la pantalla real (idéntica a la que ha entrado)
    else if (target.prog) { state.plan.active = target.prog; ui.dayId = nextDayId(); ui.retoId = null; persist(); render(); window.scrollTo({ top: 0 }); }
    else { ui.editing = null; ui.aiResult = null; ui.dietDate = target.date; ui._animRings = true; render(); window.scrollTo({ top: 0 }); }
    dropPeek();
    swipe.busy = false;
  }, 230);
}
document.addEventListener('touchend', swipeEnd, { passive: true });
document.addEventListener('touchcancel', swipeEnd, { passive: true });

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
  variant: b => variantPicker(b.dataset.ex),
  skipEx: b => {
    const f = findEx(b.dataset.ex); if (!f) return;
    const d = draftOf(currentDay().id), ids = skippedToday(d);
    d.skip = { date: todayISO(), ids: ids.includes(f.ex.id) ? ids.filter(x => x !== f.ex.id) : [...ids, f.ex.id] };
    persist(); render();
  },
  setCount: b => {
    const f = findEx(b.dataset.ex); if (!f) return;
    const d = draftOf(currentDay().id);
    d.counts[b.dataset.key] = clamp(setCount(f.ex, b.dataset.key, d) + parseInt(b.dataset.delta, 10), 1, 10);
    persist(); render();
  },
  copySet: b => {
    const f = findEx(b.dataset.ex); if (!f) return;
    const key = b.dataset.key, i = parseInt(b.dataset.i, 10);
    const d = draftOf(currentDay().id), c = coachFor(f.ex, key);
    const w = cellValue(d, key, i - 1, 'w', c), r = cellValue(d, key, i - 1, 'r', c);
    if (!d.sets[key]) d.sets[key] = [];
    d.sets[key][i] = { ...(d.sets[key][i] || {}), w: String(w), r: String(r) };
    touchSession(d, f.ex.id);
    persist(); render();
  },
  shareSession: b => openShareCard(b.dataset.id),
  sessKcal: b => {
    const s = state.sessions.find(x => x.id === b.dataset.id); if (!s) return;
    const g = gymKcalInfo(s), est = (() => { const k = s.kcalManual; delete s.kcalManual; const v = gymKcalInfo(s)?.kcal ?? null; if (k !== undefined) s.kcalManual = k; return v; })();
    openModal(`
      <h3 class="modal-title">kcal de la sesión</h3>
      <p class="text-xs text-mute">${esc(s.dayTitle || '')} · ${esc(fmtDate(s.date))}. Estimación de la app: <strong class="${MAC.kcal.text}">${est !== null ? '~' + est + ' kcal netas' : 'sin datos'}</strong>. Si usas reloj, resta ~1 kcal por kg y hora (lo que gastarías en reposo).</p>
      <label class="lbl">kcal netas<input class="field mt-1 text-center text-xl font-black" name="k" inputmode="numeric" value="${g ? g.kcal : ''}" /></label>
      <div class="grid grid-cols-2 gap-2">
        <button class="btn-ghost" data-mact="auto" type="button">Usar estimación</button>
        <button class="btn-primary" data-mact="save" type="button">Guardar</button>
      </div>`, {
      auto: () => { delete s.kcalManual; persist(); closeModal(); render(); toast('Estimación automática ✓'); },
      save: root => { const v = num(mval(root, 'k')); if (v === null || v < 0 || v > 3000) return toast('Revisa las kcal', 'warn'); s.kcalManual = Math.round(v); persist(); closeModal(); render(); toast('kcal guardadas ✓'); }
    });
  },
  toggleSets: b => {
    const d = draftOf(currentDay().id);
    d.open[b.dataset.key] = !d.open[b.dataset.key];
    persist(); render();
  },
  doneSet: b => markSetDone(b.dataset.ex, b.dataset.key, parseInt(b.dataset.i, 10)),
  abandon: () => {
    const day = currentDay(), d = state.drafts[day.id]; if (!d) return;
    const n = Object.values(d.sets || {}).reduce((a, arr) => a + (arr || []).filter(c => c && c.r !== undefined && c.r !== '').length, 0);
    openModal(`
      <div class="text-center"><div class="text-3xl">⚠️</div><h3 class="modal-title mt-1">¿Abandonar el entreno?</h3></div>
      <p class="text-sm text-mute text-center">Se borrarán las <strong class="text-white">${n} ${n === 1 ? 'serie apuntada' : 'series apuntadas'}</strong> de ${esc(day.label)}. No se puede deshacer.</p>
      <button class="btn-primary w-full mt-2" data-close type="button">Seguir entrenando</button>
      <button class="btn-danger w-full" data-mact="yes" type="button">Abandonar y borrar</button>`, {
      yes: () => { delete state.drafts[day.id]; persist(); closeModal(); render(); toast('Entreno abandonado'); }
    });
  },
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
  addIng: () => addIngredient(),
  addIngManual: () => addIngManual((ui.addIng || '').trim()),
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
  openCal: () => openCalendar(),
  goToday: b => { state.plan.active = b.dataset.prog; ui.dayId = b.dataset.day; ui.retoId = null; persist(); render(); window.scrollTo({ top: 0 }); },
  retoOpen: b => { ui.retoId = b.dataset.reto; render(); window.scrollTo({ top: 0 }); },
  retoBack: () => { ui.retoId = null; render(); window.scrollTo({ top: 0 }); },
  retoStart: b => {
    const id = b.dataset.reto, r = RETOS[id], v = parseInt($('#retoMax')?.value, 10);
    if (!(v >= 0) || $('#retoMax')?.value === '') return toast('Pon cuántas haces seguidas (0 si ninguna)', 'warn');
    retoStartFrom(id, v); persist(); render();
    if (v < r.min) openModal(`<div class="text-center"><div class="text-3xl">🌱</div><h3 class="modal-title mt-1">Empiezas en el nivel ${r.min}</h3></div>
      <p class="text-sm text-mute">Es el nivel más bajo de este reto y aún no llegas a él. Mientras tanto, haz las series con esta variante más fácil:</p>
      <p class="text-sm text-cyan-100 bg-brand/10 border border-brand/30 rounded-lg px-3 py-2">💡 ${esc(RETO_EASY[id] || '')}</p>
      <p class="text-[11px] text-mute">Cuando te salgan las ${retoU(r, r.min)} completas, márcalas como siempre y el reto seguirá subiendo.</p>
      <button class="btn-primary w-full" data-close type="button">Entendido</button>`);
    else toast(`Empiezas en nivel ${state.retos[id].level}`);
  },
  retoDone: b => { const id = b.dataset.reto, i = +b.dataset.i, d = retoDraft(id); d.done[i] = !d.done[i]; if (d.done[i] && d.got[i] === '') d.got[i] = String(d.target[i]); persist(); render(); if (d.done[i] && d.done.some(x => !x)) startTimer(RETOS[id].rest); },
  retoHold: b => { const id = b.dataset.reto, d = retoDraft(id), i = +b.dataset.i; const sec = parseInt(d.got[i], 10) || d.target[i]; startTimer(sec); toast(`Aguanta ${sec} s`); },
  retoFinish: b => retoFinish(b.dataset.reto),
  retoTest: b => retoTestModal(b.dataset.reto),
  retoReset: b => { const id = b.dataset.reto; openModal(`<h3 class="modal-title">¿Reiniciar ${esc(RETOS[id].name)}?</h3><p class="text-sm text-mute">Se borran su nivel y su historial. Volverás a empezar con un test.</p><button class="btn-danger w-full" data-mact="yes" type="button">Reiniciar</button><button class="btn-ghost w-full" data-close type="button">Cancelar</button>`, { yes: () => { delete state.retos[id]; persist(); closeModal(); render(); } }); },
  swipeMode: b => { state.settings.swipeMode = b.dataset.mode; persist(); render(); },
  dietPrev: () => { ui.editing = null; ui.aiResult = null; ui.dietDate = addDays(ui.dietDate, -1); ui._animRings = true; render(); },
  dietNext: () => { if (ui.dietDate < todayISO()) { ui.editing = null; ui.aiResult = null; ui.dietDate = addDays(ui.dietDate, 1); ui._animRings = true; render(); } },
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

  toggleKey: () => { keepKeyDraft(); ui.showKey = !ui.showKey; render(); },
  unlockKey: () => guardModal({
    title: 'Cambiar la clave de Gemini', text: 'La clave actual seguirá funcionando hasta que guardes una nueva.', word: 'CAMBIAR',
    onOk: () => { ui.keyUnlocked = true; ui.keyDraft = ''; ui.modelDraft = null; ui.aiOpen = true; render(); setTimeout(() => $('#apiKey')?.focus(), 50); }
  }),
  cancelKey: () => { ui.keyUnlocked = false; ui.keyDraft = null; ui.modelDraft = null; ui.showKey = false; render(); },
  saveKey: () => {
    keepKeyDraft();
    const k = (ui.keyDraft || '').trim();
    if (!k) return toast('Pega la clave antes de guardar', 'warn');
    if (!/^(AQ\.|AIza)/.test(k) && !confirm('Esta clave no empieza por «AQ.» ni por «AIza». ¿Guardarla igualmente?')) return;
    state.settings.apiKey = k; state.settings.model = (ui.modelDraft || '').trim() || state.settings.model || DEFAULT_MODEL;
    ui.keyUnlocked = false; ui.keyDraft = null; ui.modelDraft = null; ui.showKey = false;
    persist(); render(); toast('Clave guardada y bloqueada 🔒');
  },
  testKey: async b => {
    const editing = !!$('#apiKey');
    if (editing) keepKeyDraft();
    const saved = { key: state.settings.apiKey, model: state.settings.model };
    if (editing) {
      if (!(ui.keyDraft || '').trim()) return toast('Pega una clave para probarla', 'warn');
      state.settings.apiKey = ui.keyDraft.trim(); state.settings.model = (ui.modelDraft || '').trim() || saved.model || DEFAULT_MODEL;
    }
    b.disabled = true; b.textContent = 'Probando…';
    try { const r = parseJSONLoose(await callGemini([{ text: 'Responde exactamente este JSON: {"ok": true}' }], { timeout: 20000 })); toast(r.ok ? (editing ? 'Funciona ✓ Ahora pulsa «Guardar y bloquear»' : 'Conexión correcta ✓') : 'Responde, pero raro', r.ok ? 'ok' : 'warn'); }
    catch (e) { toast('Falla: ' + e.message, 'error'); }
    finally { state.settings.apiKey = saved.key; state.settings.model = saved.model; b.disabled = false; b.textContent = editing ? 'Probar' : 'Probar conexión'; }
  },
  saveGoals: () => {
    const v = id => parseInt($(id).value, 10);
    const g = { targetKcal: v('#tK'), targetProt: v('#tP'), targetCarbs: v('#tC'), targetFat: v('#tF') };
    if (Object.values(g).some(x => !(x > 0))) return toast('Revisa los objetivos', 'warn');
    g.eatBackCardio = $('#tEat').checked;
    const pm = parseInt($('#tPM').value, 10); if (pm > 0 && pm <= 100) g.minProtMeal = pm;
    Object.assign(state.settings, g); persist(); render(); toast('Objetivos guardados ✓');
  },
  goHabits: () => { openKeys.set_habits = true; go('settings'); setTimeout(() => { const n = $('#habNew'); if (n) { n.scrollIntoView({ block: 'center' }); n.focus(); } }, 80); },
  habHintOff: () => { state.settings.habitsHintOff = true; persist(); render(); },
  habAdd: () => {
    const v = ($('#habNew')?.value || '').trim().replace(/\s+/g, ' ');
    if (!v) return toast('Escribe el hábito', 'warn');
    const L = state.settings.habitList;
    if (L.some(h => h.name.toLowerCase() === v.toLowerCase())) return toast('Ese hábito ya existe', 'warn');
    if (L.length >= 12) return toast('Máximo 12 hábitos', 'warn');
    L.push({ name: v.slice(0, 60), where: 'daily', days: [...ALL_DAYS] }); saveHabitList(); toast('Hábito añadido: elige si es de Entreno o Diario');
  },
  habDel: b => { const h = state.settings.habitList[+b.dataset.i]; if (!h || !confirm(`¿Borrar el hábito «${h.name}»? Lo ya registrado se conserva.`)) return; state.settings.habitList.splice(+b.dataset.i, 1); ui.habDaysOpen = null; saveHabitList(); },
  habWhere: b => { const h = state.settings.habitList[+b.dataset.i]; if (!h) return; h.where = b.dataset.v; if (h.where !== 'daily' && ui.habDaysOpen === +b.dataset.i) ui.habDaysOpen = null; saveHabitList(); },
  habDaysOpen: b => { const i = +b.dataset.i; ui.habDaysOpen = ui.habDaysOpen === i ? null : i; render(); },
  habDay: b => {
    const h = state.settings.habitList[+b.dataset.i], d = +b.dataset.d; if (!h) return;
    if (h.days.includes(d)) { if (h.days.length === 1) return toast('Deja al menos un día', 'warn'); h.days = h.days.filter(x => x !== d); } else h.days = [...h.days, d].sort();
    saveHabitList();
  },
  dailyHabit: b => {
    const date = ui.dietDate || todayISO(), n = b.dataset.name, cur = state.habitLog[date] || [];
    const next = cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n];
    if (next.length) state.habitLog[date] = next; else delete state.habitLog[date];
    persist(); render();
  },
  resetPlan: () => {
    if (!confirm('¿Restaurar los bloques originales (PPT y FULL BODY)? Perderás los bloques, días y ejercicios que hayas creado o editado (el historial se conserva).')) return;
    state.plan = normalizePlan(clone(DEFAULT_PLAN)); state.selectedVariants = {}; state.drafts = {}; ui.dayId = nextDayId();
    persist(); render(); toast('Plan restaurado');
  },
  export: () => exportBackup(),
  editProfile: () => profileModal(),
  newAccess: () => newAccessModal(),
  openAccess: () => {
    if (state.settings.pinHash) return askPinOnly('🔑 Acceso', 'Escribe tu PIN para abrir esta sección.', pin => { ui.accessOpen = true; ui.accessPin = pin; ui.accessReveal = {}; ui.usage = null; ui.usageErr = ''; render(); loadUsage(); });
    let fails = 0;
    openModal(`<h3 class="modal-title">🔑 Acceso</h3><p class="text-sm text-mute">Este dispositivo no tiene PIN: escribe tu código personal de acceso (o crea un PIN en Ajustes → Seguridad para usarlo aquí).</p>
      <input class="field mt-1 text-center text-2xl font-black tracking-[.2em] uppercase" name="code" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX" />
      <button class="btn-primary w-full mt-2" data-mact="ok" type="button">Abrir</button>`, {
      autofocus: true,
      ok: async root => {
        const h = await codeHash(mval(root, 'code'));
        if (h !== access.me?.hash) { fails++; root.querySelector('[name=code]').value = ''; if (fails >= 5) { closeModal(); return toast('Demasiados intentos', 'error'); } return toast(`Código incorrecto (${fails}/5)`, 'error'); }
        ui.accessOpen = true; closeModal(); render();
      }
    });
  },
  closeAccess: () => { ui.accessOpen = false; render(); },
  usageSetup: () => usageSetupModal(),
  copyHashes: () => {
    const rows = (access.list || []).map(x => `${x.hash}\t${(x.hash === access.me?.hash ? (state.accessNames[x.hash] || 'Yo (admin)') : (state.accessNames[x.hash] || 'Sin nombre')).replace(/\s+/g, ' ')}`);
    const txt = ['huella\tnombre', ...rows].join('\n');
    navigator.clipboard.writeText(txt).then(() => toast(`Copiadas ${rows.length} huellas: pégalas en A1 de una hoja «nombres»`)).catch(() => toast('No se pudo copiar', 'error'));
  },
  usageRefresh: () => { ui.usage = null; ui.usageErr = ''; loadUsage(); render(); },
  showCode: async b => {
    const h = b.dataset.hash;
    if (ui.accessReveal?.[h]) { delete ui.accessReveal[h]; return render(); }
    const c = await accessCodeOf(h); if (!c) return;
    (ui.accessReveal ||= {})[h] = c; render();
  },
  copyCode: async b => { const c = await accessCodeOf(b.dataset.hash); if (c) navigator.clipboard.writeText(fmtCode(c)).then(() => toast('Código copiado')).catch(() => toast('Cópialo a mano: ' + fmtCode(c), 'warn')); },
  regenAccess: b => regenAccess(b.dataset.hash),
  delAccess: b => delAccess(b.dataset.hash),
  ghConnect: () => ghConnectModal(),
  ghDisconnect: () => { if (!confirm('¿Desconectar GitHub? Se borra la llave guardada en este móvil.')) return; try { localStorage.removeItem(GH_KEY); } catch { /* nada */ } render(); toast('GitHub desconectado'); },
  nameAccess: b => {
    const h = b.dataset.hash, x = (access.list || []).find(y => y.hash === h); if (!x) return;
    openModal(`<h3 class="modal-title">¿Quién es? <span class="text-mute font-mono text-sm">…${esc(h.slice(-4))}</span></h3><p class="text-xs text-mute">Solo se guarda en tu app y en tus copias.</p>
      <label class="lbl">Nombre<input class="field mt-1" name="who" maxlength="24" value="${esc(state.accessNames[h] || '')}" /></label>
      <button class="btn-primary w-full" data-mact="save" type="button">Guardar</button>`, {
      autofocus: true, save: root => { const v = mval(root, 'who').trim(); if (v) state.accessNames[h] = v; else delete state.accessNames[h]; persist(); closeModal(); render(); syncUsageNames(); }
    });
  },
  reloadApp: () => location.reload(),
  safeHome: () => { ui.view = 'diet'; ui.retoId = null; ui.editing = null; ui.aiResult = null; ui.dietDate = todayISO(); render(); },
  restorePrev: () => {
    const pc = prevCopy(); if (!pc) return;
    guardModal({ title: 'Volver a los datos de antes de actualizar', text: `Se sustituirán tus datos actuales por la copia guardada al actualizar desde la v${esc(pc.ver)}. Lo apuntado después se perderá.`, word: 'RESTAURAR', onOk: () => {
      try {
        const keep = { apiKey: state.settings.apiKey, pinHash: state.settings.pinHash, lastSeenVersion: APP_VERSION };
        exportBackup();
        state = normalize(JSON.parse(pc.data)); Object.assign(state.settings, keep);
        persist(); render(); toast('Datos restaurados. Por si acaso, se descargó una copia de los de ahora.');
      } catch (e) { toast('No se pudo restaurar: ' + e.message, 'error'); }
    } });
  },
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
  install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => null); deferredInstall = null; render(); refreshLockInstall(); },
  installHelp: () => installHelpModal(),
  installHide: () => { lsSet(INSTALL_HIDE, Date.now() + 7 * 86400000); render(); },
  copyAppLink: () => navigator.clipboard.writeText('https://egarluq292.github.io/fitnesteban/').then(() => toast('Enlace copiado: pégalo en Chrome o Safari')).catch(() => toast('Enlace: egarluq292.github.io/fitnesteban', 'warn')),
  checkUpdate: async () => {
    checkRemoteVersion(true);
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
document.addEventListener('click', e => {
  const b = e.target.closest('#lockScreen [data-act]'); if (!b) return;
  const fn = actions[b.dataset.act]; if (fn) { e.preventDefault(); fn(b); }
});
app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.in) setDraftCell(t.dataset.key, parseInt(t.dataset.i, 10), t.dataset.in, t.value);
  else if (t.dataset.retoGot !== undefined) { const d = retoDraft(t.dataset.reto); d.got[+t.dataset.retoGot] = t.value.replace(/[^0-9]/g, ''); persistSoon(); }
  else if (t.id === 'mealDesc') ui.mealDesc = t.value;
  else if (t.id === 'addIng') ui.addIng = t.value;
  else if (t.id === 'mealSearch') { ui.mealSearch = t.value; const box = $('#mealPicks'); if (box) box.innerHTML = renderPickList(); }
  else if (t.dataset.ai && ui.aiResult) { ui.aiResult[t.dataset.ai] = t.dataset.ai === 'desc' ? t.value : (num(t.value) ?? 0); if (t.dataset.ai === 'prot') syncProtHint(); }
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
  else if (t.id === 'swipeNav') { state.settings.swipeNav = t.checked; persist(); }
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

/* Versión publicada en GitHub (lee sw.js sin caché) */
async function checkRemoteVersion(force = false) {
  if (!force && Date.now() - ui.remoteVerAt < 5 * 60000) return;
  ui.remoteVerAt = Date.now();
  try {
    const r = await fetch('sw.js?v=' + Date.now(), { cache: 'no-store' });
    const m = (await r.text()).match(/fitnesteban-(\d+\.\d+\.\d+)/);
    ui.remoteVer = m ? m[1] : 'error';
  } catch { ui.remoteVer = navigator.onLine ? 'error' : 'offline'; }
  if (ui.view === 'settings') render();
}
function versionStatusHTML() {
  const v = ui.remoteVer;
  if (!v) return '<p class="text-[11px] text-mute">Comprobando la versión publicada…</p>';
  if (v === 'offline' || v === 'error') return `<p class="text-[11px] text-mute">Instalada: <strong class="text-white">${APP_VERSION}</strong> · ${v === 'offline' ? 'sin conexión para comprobar la publicada' : 'no se pudo leer la versión publicada'}</p>`;
  const c = cmpVer(v, APP_VERSION);
  if (c > 0) return `<div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-2">Instalada: <strong>${APP_VERSION}</strong> · Publicada: <strong>${esc(v)}</strong>. Hay una versión nueva: pulsa «Buscar actualización» (o cierra y abre la app).</div>`;
  if (c < 0) return `<p class="text-[11px] text-amber-300">Instalada: <strong>${APP_VERSION}</strong> · Publicada: <strong>${esc(v)}</strong>. GitHub aún no ha publicado esta versión (mira el ✓ en Actions).</p>`;
  return `<p class="text-[11px] text-emerald-300">Instalada: <strong>${APP_VERSION}</strong> · Publicada: <strong>${esc(v)}</strong> ✓ Estás al día</p>`;
}

/* =========================================================================
   PWA: service worker, instalación, actualizaciones
   ========================================================================= */
let deferredInstall = null;
/* ---------- Aviso «Instalar la app» (solo si no está instalada) ---------- */
const INSTALL_HIDE = 'fitnesteban_install_hide';
const UA = navigator.userAgent || '';
const isIOS = () => /iphone|ipad|ipod/i.test(UA) || (/macintosh/i.test(UA) && navigator.maxTouchPoints > 1);
const isInAppBrowser = () => /WhatsApp|FBAN|FBAV|FB_IAB|Instagram|Line\/|; wv\)/i.test(UA);
function installMode() {
  if (isStandalone()) return '';
  if (isInAppBrowser()) return 'inapp';
  if (isIOS()) return 'ios';
  if (deferredInstall) return 'prompt';
  return /android/i.test(UA) ? 'menu' : '';
}
function installBannerHTML(force = false) {
  const m = installMode();
  if (!m || (!force && (lsGet(INSTALL_HIDE) || 0) > Date.now())) return '';
  const txt = { prompt: 'Instálala: se abre más rápido, a pantalla completa y sin conexión.', ios: 'Instálala en tu iPhone: se abre a pantalla completa, como una app.', menu: 'Instálala: menú ⋮ de Chrome → «Instalar aplicación».', inapp: 'Estás dentro de WhatsApp: abre el enlace en Chrome (o Safari) para poder instalarla.' }[m];
  const btn = m === 'prompt' ? '<button class="btn-banner shrink-0" data-act="install" type="button">Instalar</button>'
    : m === 'ios' ? '<button class="btn-banner shrink-0" data-act="installHelp" type="button">Cómo</button>'
    : m === 'inapp' ? '<button class="btn-banner shrink-0" data-act="copyAppLink" type="button">Copiar enlace</button>' : '';
  return `<div class="banner-info mb-3" id="installBanner"><span>📲 ${txt}</span>${btn}${force ? '' : '<button class="iconbtn iconbtn-sm shrink-0" data-act="installHide" type="button" aria-label="Ocultar una semana">✕</button>'}</div>`;
}
function installHelpModal() {
  const share = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-4px"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  openModal(`<h3 class="modal-title">📲 Instalar en iPhone</h3>
    <ol class="card p-3 space-y-2.5 text-[14px] leading-snug">
      <li><b class="text-brand">1.</b> Abre la app en <b>Safari</b> (no dentro de WhatsApp ni de otra app).</li>
      <li><b class="text-brand">2.</b> Pulsa <b>Compartir</b> <span class="text-brand">${share}</span> en la barra de abajo.</li>
      <li><b class="text-brand">3.</b> Baja y elige <b>«Añadir a pantalla de inicio»</b>.</li>
      <li><b class="text-brand">4.</b> Pulsa <b>Añadir</b>. Ya tienes el icono de FITNESTEBAN.</li>
    </ol>
    <p class="text-[11px] text-mute">Al abrirla desde el icono te pedirá el código una vez más: es normal, el iPhone la trata como una app nueva.</p>
    <button class="btn-primary w-full" data-close type="button">Entendido</button>`);
}
let swReg = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; render(); refreshLockInstall(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; render(); refreshLockInstall(); });
/* En la pantalla de «Acceso privado» (sus botones van con el mismo sistema data-act) */
function refreshLockInstall() { const slot = $('#lockInstall'); if (slot) slot.innerHTML = installBannerHTML(true); }
window.addEventListener('appinstalled', () => { deferredInstall = null; toast('App instalada ✓'); });

function showUpdate(worker) {
  $('#topBanner').innerHTML = `<div class="banner-info mt-3"><span>Hay una versión nueva de la app.</span><button class="btn-banner shrink-0" id="doUpdate" type="button">Actualizar</button></div>`;
  $('#doUpdate').onclick = () => { persist(); savePrevCopy(localStorage.getItem(STORE_KEY), APP_VERSION); worker.postMessage('SKIP_WAITING'); };
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

/* Aviso si algo falla fuera de la pantalla (botones, IA, Drive…): nunca se queda en blanco */
let lastErrAt = 0;
function showErrorBanner(msg) {
  if (Date.now() - lastErrAt < 20000) return; lastErrAt = Date.now();
  let b = $('#errBanner');
  if (!b) { b = document.createElement('div'); b.id = 'errBanner'; b.className = 'max-w-xl mx-auto px-4'; $('#topBanner').after(b); }
  b.innerHTML = `<div class="banner-warn mt-3 flex-wrap"><span class="flex-1 min-w-0">⚠️ Algo ha fallado (${esc(String(msg).slice(0, 80))}). Tus datos están guardados.</span>
    <span class="flex gap-1.5 shrink-0"><button class="btn-banner" id="errCopy" type="button">${state.settings.driveConnected ? '☁️ Copia' : '⬇️ Copia'}</button><button class="btn-banner" id="errClose" type="button">✕</button></span></div>`;
  $('#errCopy').onclick = () => { state.settings.driveConnected ? driveBackupNow() : exportBackup(); };
  $('#errClose').onclick = () => b.remove();
}
window.addEventListener('error', e => { if (!e.filename || e.filename.includes(location.host)) showErrorBanner(e.message || 'error'); });
window.addEventListener('unhandledrejection', e => { const m = e.reason?.message || String(e.reason || ''); if (/abort|network|fetch/i.test(m)) return; showErrorBanner(m || 'error'); });

/* =========================================================================
   ACCESO PRIVADO: un código distinto por persona (lista en acceso.txt del repositorio)
   El código se guarda solo en este dispositivo; si su línea desaparece de acceso.txt, deja de funcionar.
   ========================================================================= */
const ACCESS_KEY = 'fitnesteban_access', ACL_KEY = 'fitnesteban_acl';
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
async function codeHash(c) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fitnesteban|' + normCode(c)));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
function parseAcl(text) {
  return String(text).split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => {
    const p = l.split(/\s+/), admin = p.slice(1).some(t => t.toLowerCase() === 'admin');
    return { hash: p[0].toLowerCase(), admin };
  }).filter(x => /^[0-9a-f]{32}$/.test(x.hash));
}
const access = { list: null, me: null, ok: false, usageUrl: '' };
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* nada */ } }
async function accessCheck(list) {
  const saved = lsGet(ACCESS_KEY);
  if (!saved?.code || !list) return null;
  const h = await codeHash(saved.code);
  return list.find(x => x.hash === h) || null;
}
function lockScreen(mode, msg = '') {
  let el = $('#lockScreen');
  if (!el) { el = document.createElement('div'); el.id = 'lockScreen'; el.className = 'lock-screen'; document.body.appendChild(el); }
  document.body.classList.add('overflow-hidden');
  const logo = `<img src="icons/logo-128.png" alt="" class="w-20 h-20 rounded-full mx-auto" /><div class="mt-3 flex justify-center">${($('#homeBtn svg')?.outerHTML || '').replace('width="124.9"', 'width="200"').replace('height="14.4"', 'height="23"')}</div>`;
  if (mode === 'wait') { el.innerHTML = `<div class="lock-box text-center">${logo}<p class="text-sm text-mute mt-6"><span class="spinner"></span> Comprobando acceso…</p></div>`; return; }
  el.innerHTML = `<div class="lock-box">
    <div class="text-center">${logo}<h1 class="font-extrabold text-lg mt-5">Acceso privado</h1>
    <p class="text-sm text-mute mt-1">${msg || 'Esta app es personal. Escribe el código que te ha dado Esteban.'}</p></div>
    <input class="field mt-5 text-center text-2xl font-black tracking-[.2em] uppercase" id="lockCode" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX" />
    <button class="btn-primary w-full mt-3" id="lockGo" type="button">Entrar</button>
    <p class="text-[11px] text-mute text-center mt-4">Cada código es personal. Si lo compartes, dejará de funcionar para ti también.</p>
    <div id="lockInstall" class="mt-5">${installBannerHTML(true)}</div></div>`;
  const go = async () => {
    const v = $('#lockCode').value; if (normCode(v).length < 8) return toast('El código tiene 8 caracteres', 'warn');
    $('#lockGo').disabled = true;
    try {
      const h = await codeHash(v);
      let list = access.list || await fetchAcl(), me = (list || []).find(x => x.hash === h);
      // Código recién creado: GitHub Pages tarda unos minutos en publicarlo → mirar la lista al día directamente en GitHub
      if (!me) { const live = await fetchAclLive(); if (live) { list = live; me = live.find(x => x.hash === h); } }
      if (!me) { toast(list ? 'Código no válido' : 'Sin conexión para comprobar el código', 'error'); $('#lockGo').disabled = false; return; }
      lsSet(ACCESS_KEY, { code: normCode(v), at: Date.now() });
      unlock(me); toast('Acceso concedido 👋');
    } catch { $('#lockGo').disabled = false; }
  };
  $('#lockGo').onclick = go;
  $('#lockCode').onkeydown = e => { if (e.key === 'Enter') go(); };
  setTimeout(() => $('#lockCode')?.focus(), 100);
}
function unlock(me) {
  access.me = me; access.ok = true;
  if (me.admin && !state.settings.profile) { state.settings.profile = { name: 'Esteban', sex: 'h', age: '', goal: 'recomp' }; persist(); }
  $('#lockScreen')?.remove(); document.body.classList.remove('overflow-hidden');
  if (ui.view === 'settings') render();
  if (needsOnboarding(me)) setTimeout(onboarding, 300);
  else if (!newsChecked) { newsChecked = true; maybeShowNews(); }
}
let newsChecked = false;
/* acceso.txt: huellas + (opcional) una línea «#uso https://script.google.com/…» con la dirección del registro de uso */
const USAGE_RE = /^#\s*uso\s+(https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)\s*$/m;
function aclLoad(text) {
  const list = parseAcl(text), m = String(text).match(USAGE_RE);
  access.list = list; access.usageUrl = m ? m[1] : '';
  lsSet(ACL_KEY, { list, usageUrl: access.usageUrl, at: Date.now() });
  return list;
}
async function fetchAcl() {
  try {
    const r = await fetch('acceso.txt?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return aclLoad(await r.text());
  } catch { return null; }
}
/* Lista al día leída de la API de GitHub (sin la caché de Pages). Sin token: 60 consultas/hora por conexión, solo se usa si el código no aparece. */
async function fetchAclLive() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}?t=${Date.now()}`, { headers: { Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return aclLoad(await r.text());
  } catch { return null; }
}
async function accessBoot() {
  const cached = lsGet(ACL_KEY);
  if (cached?.list) { access.list = cached.list; access.usageUrl = cached.usageUrl || ''; }
  const meCached = await accessCheck(access.list);
  if (meCached) unlock(meCached); else lockScreen(access.list ? 'code' : 'wait');
  const fresh = await fetchAcl();
  if (!fresh) { if (!access.ok && !access.list) lockScreen('code', 'No hay conexión para comprobar el acceso. Conéctate y vuelve a abrir la app.'); return; }
  let me = await accessCheck(fresh);
  if (!me && lsGet(ACCESS_KEY)?.code) { const live = await fetchAclLive(); if (live) me = await accessCheck(live); }
  if (me) { if (!access.ok) unlock(me); else access.me = me; usagePing(); }
  else lockScreen('code', lsGet(ACCESS_KEY)?.code ? 'Tu código ya no es válido. Pide uno nuevo a Esteban.' : '');
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && access.ok) fetchAcl().then(async l => { usagePing(); if (l && !(await accessCheck(l))) { const live = await fetchAclLive(); if (!live || await accessCheck(live)) return; access.ok = false; lockScreen('code', 'Tu código ya no es válido. Pide uno nuevo a Esteban.'); } }); });

/* Gestión (solo administrador): crear el código de una persona y la línea para acceso.txt */
function newCode() { const a = crypto.getRandomValues(new Uint8Array(8)); const s = [...a].map(x => CODE_ABC[x % CODE_ABC.length]).join(''); return s.slice(0, 4) + '-' + s.slice(4); }
/* Gestión de accesos (solo administrador). En acceso.txt solo hay huellas; los nombres viven en tu app.
   Crear y quitar códigos edita acceso.txt en GitHub con un token cifrado con tu PIN. */
const GH_REPO = 'Egarluq292/fitnesteban', GH_FILE = 'acceso.txt', GH_KEY = 'fitnesteban_gh';
const b64e = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64d = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
const utf8b64 = t => btoa(unescape(encodeURIComponent(t)));
const b64utf8 = b => decodeURIComponent(escape(atob(String(b).replace(/\s/g, ''))));
async function pinKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode('fitnesteban-gh:' + pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function ghSaveToken(token, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await pinKey(pin, salt), new TextEncoder().encode(token));
  lsSet(GH_KEY, { salt: b64e(salt), iv: b64e(iv), ct: b64e(ct) });
}
async function ghToken(pin) {
  const g = lsGet(GH_KEY); if (!g) throw new Error('GitHub no está conectado');
  try { return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(g.iv) }, await pinKey(pin, b64d(g.salt)), b64d(g.ct))); }
  catch { throw new Error('No se pudo abrir la llave de GitHub (¿cambiaste el PIN?). Vuelve a conectar GitHub.'); }
}
async function ghApi(token, method = 'GET', body = null) {
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`, {
    method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store'
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status === 401 ? 'El token no es válido o ha caducado' : r.status === 403 || r.status === 404 ? 'El token no tiene permiso sobre el repositorio (Contents: lectura y escritura)' : (d.message || 'GitHub respondió ' + r.status));
  return d;
}
/* Edita acceso.txt: fn(lineas) → nuevas líneas */
async function ghEditAcl(pin, fn, message) {
  const token = await ghToken(pin);
  const cur = await ghApi(token);
  const text = b64utf8(cur.content || '');
  const next = fn(text.replace(/\r/g, '').split('\n')).join('\n').replace(/\n*$/, '\n');
  await ghApi(token, 'PUT', { message, content: utf8b64(next), sha: cur.sha });
  aclLoad(next);
}
function accessWho(x) { return state.accessNames?.[x.hash] || ''; }
/* Códigos guardados en la lista del administrador, cifrados con su PIN (nunca en GitHub) */
const fmtCode = c => { const n = normCode(c); return n.slice(0, 4) + '-' + n.slice(4); };
async function codeEnc(code, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await pinKey(pin, salt), new TextEncoder().encode(normCode(code)));
  return { s: b64e(salt), iv: b64e(iv), ct: b64e(ct) };
}
async function codeDec(e, pin) { return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(e.iv) }, await pinKey(pin, b64d(e.s)), b64d(e.ct))); }
async function saveAccessCode(hash, code, pin) { if (pin) { state.accessCodes[hash] = await codeEnc(code, pin); persist(); } }
async function accessCodeOf(hash) {
  if (hash === access.me?.hash && lsGet(ACCESS_KEY)?.code) return normCode(lsGet(ACCESS_KEY).code);
  const e = state.accessCodes?.[hash]; if (!e) { toast('Ese código no está guardado', 'warn'); return null; }
  if (!ui.accessPin) { toast('Abre la sección con tu PIN para ver los códigos', 'warn'); return null; }
  try { return await codeDec(e, ui.accessPin); } catch { toast('No se puede leer: se guardó con otro PIN', 'error'); return null; }
}
async function reencryptSecrets(oldPin, newPin) {
  for (const [h, e] of Object.entries(state.accessCodes || {})) { try { state.accessCodes[h] = await codeEnc(await codeDec(e, oldPin), newPin); } catch { /* guardado con otro PIN: se queda como estaba */ } }
  try { if (lsGet(GH_KEY)) await ghSaveToken(await ghToken(oldPin), newPin); } catch { /* nada */ }
  try { const u = lsGet(USE_KEY); if (u) lsSet(USE_KEY, await secretEnc(await secretDec(u, oldPin), newPin)); } catch { /* nada */ }
}
/* ---------- Registro de uso: día de último uso y versión (una vez al día por móvil) ----------
   Va a una hoja de Google del administrador mediante un Apps Script. Solo se envía la huella del código y la versión. */
const USE_KEY = 'fitnesteban_usekey', PING_KEY = 'fitnesteban_ping';
async function secretEnc(text, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await pinKey(pin, salt), new TextEncoder().encode(text));
  return { s: b64e(salt), iv: b64e(iv), ct: b64e(ct) };
}
const secretDec = (e, pin) => codeDec(e, pin);
async function usagePing() {
  try {
    const url = access.usageUrl, code = lsGet(ACCESS_KEY)?.code;
    // una vez al día… y otra vez si cambia la versión (si no, la hoja se queda con la versión vieja hasta mañana)
    const mark = todayISO() + '|' + APP_VERSION;
    if (!url || !code || !access.ok || !navigator.onLine || lsGet(PING_KEY) === mark) return;
    // solo móviles que han visto la frase de las condiciones (instalados desde la 4.26) y el administrador
    if (!access.me?.admin && !state.settings.usageOk) return;
    const h = await codeHash(code);
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ h, v: APP_VERSION }) });
    lsSet(PING_KEY, mark);
  } catch { /* sin conexión: mañana se vuelve a intentar */ }
}
async function loadUsage() {
  const enc = lsGet(USE_KEY);
  if (!access.usageUrl || !enc || !ui.accessPin || ui.usageLoading) return;
  ui.usageLoading = true;
  try {
    const key = await secretDec(enc, ui.accessPin);
    const r = await fetch(`${access.usageUrl}?key=${encodeURIComponent(key)}&t=${Date.now()}`, { cache: 'no-store' });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error === 'clave' ? 'La clave del registro no coincide con la del script' : 'El registro no respondió bien');
    ui.usage = {}; for (const x of d.rows || []) ui.usage[String(x.h).toLowerCase()] = x;
    ui.usageErr = ''; ui.usageOld = !(d.ver >= 2);
    if (!ui.usageOld) syncUsageNames();
  } catch (e) { ui.usageErr = e.message || 'No se pudo leer el registro de uso'; ui.usage = null; }
  ui.usageLoading = false; ui.usageAt = Date.now();
  if (ui.accessOpen && ui.view === 'settings') render();
}
function usageLine(hash) {
  if (!access.usageUrl || !lsGet(USE_KEY)) return '';
  if (!ui.usage) return ui.usageLoading ? '<div class="text-[11px] text-mute"><span class="spinner"></span> Consultando uso…</div>' : '';
  const u = ui.usage[hash];
  if (!u) return '<div class="text-[11px] text-mute">⚪ Aún no la ha abierto (o sin conexión desde que tiene el código)</div>';
  const ago = daysBetween(u.last, todayISO()), old = u.v && cmpVer(APP_VERSION, String(u.v)) > 0;
  const when = ago <= 0 ? 'Hoy' : ago === 1 ? 'Ayer' : `Hace ${ago} días`;
  return `<div class="text-[11px] ${ago <= 2 ? 'text-emerald-300' : ago <= 7 ? 'text-amber-300' : 'text-rose-300'}">${ago <= 2 ? '🟢' : ago <= 7 ? '🟡' : '🔴'} ${when} · v${esc(u.v || '?')}${old ? ' <span class="text-amber-300">(desactualizada)</span>' : ''} <span class="text-mute">· ${+u.days || 1} día${+u.days === 1 ? '' : 's'} de uso</span></div>`;
}
function usageScript(key) {
  return `// FITNESTEBAN · registro de uso (día de último uso, versión y nombre puesto por el administrador) · v2
const READ_KEY = '${key}';
const ACL_URL = 'https://egarluq292.github.io/fitnesteban/acceso.txt';
const COLS = ['huella', 'ultimo_uso', 'version', 'primer_uso', 'dias_de_uso', 'nombre'];
function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('uso');
  if (!sh) { sh = ss.insertSheet('uso'); sh.getRange('A:E').setNumberFormat('@'); sh.appendRow(COLS); }
  if (String(sh.getRange(1, 6).getValue()) !== 'nombre') sh.getRange(1, 6).setValue('nombre');
  return sh;
}
function fecha_(x) { return x instanceof Date ? Utilities.formatDate(x, 'Europe/Madrid', 'yyyy-MM-dd') : String(x); }
function huellas_() {
  const c = CacheService.getScriptCache(); let t = c.get('acl');
  if (!t) { t = UrlFetchApp.fetch(ACL_URL + '?t=' + Date.now(), { muteHttpExceptions: true }).getContentText(); c.put('acl', t, 600); }
  return t.split('\\n').map(l => l.trim().split(/\\s+/)[0].toLowerCase()).filter(h => /^[0-9a-f]{32}$/.test(h));
}
function nombres_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('nombres') || '{}'); } catch (e) { return {}; } }
function salida_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    // el administrador manda la lista huella → nombre (con la clave de lectura): se guarda y se escribe en la columna F
    if (b.k === READ_KEY && b.names && typeof b.names === 'object') {
      const n = {}; for (const h in b.names) if (/^[0-9a-f]{32}$/.test(h)) n[h] = String(b.names[h]).slice(0, 40);
      PropertiesService.getScriptProperties().setProperty('nombres', JSON.stringify(n));
      const lock = LockService.getScriptLock(); lock.waitLock(10000);
      try {
        const sh = hoja_(), filas = sh.getLastRow() - 1;
        if (filas > 0) { const hs = sh.getRange(2, 1, filas, 1).getValues(); sh.getRange(2, 6, filas, 1).setValues(hs.map(r => [n[String(r[0])] || ''])); }
      } finally { lock.releaseLock(); }
      return salida_({ ok: true });
    }
    const h = String(b.h || '').toLowerCase(), v = String(b.v || '').slice(0, 12);
    if (!/^[0-9a-f]{32}$/.test(h) || huellas_().indexOf(h) < 0) return salida_({ ok: false });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const sh = hoja_(), hoy = fecha_(new Date()), datos = sh.getDataRange().getValues(), nom = nombres_()[h] || '';
      let fila = -1; for (let i = 1; i < datos.length; i++) if (String(datos[i][0]) === h) { fila = i + 1; break; }
      if (fila < 0) sh.appendRow([h, hoy, v, hoy, '1', nom]);
      else { const antes = fecha_(datos[fila - 1][1]); sh.getRange(fila, 2, 1, 2).setValues([[hoy, v]]); if (antes !== hoy) sh.getRange(fila, 5).setValue(String((+datos[fila - 1][4] || 0) + 1)); sh.getRange(fila, 6).setValue(nom); }
    } finally { lock.releaseLock(); }
    return salida_({ ok: true });
  } catch (err) { return salida_({ ok: false }); }
}
function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== READ_KEY) return salida_({ ok: false, error: 'clave' });
  const datos = hoja_().getDataRange().getValues().slice(1);
  return salida_({ ok: true, ver: 2, rows: datos.map(r => ({ h: String(r[0]), last: fecha_(r[1]), v: String(r[2]), first: fecha_(r[3]), days: +r[4] || 1 })) });
}`;
}
/* Manda al script la lista huella → nombre (solo con la sección Acceso abierta con PIN) */
let namesSyncTimer = null;
function syncUsageNames() {
  clearTimeout(namesSyncTimer);
  namesSyncTimer = setTimeout(async () => {
    try {
      const enc = lsGet(USE_KEY);
      if (!access.usageUrl || !enc || !ui.accessPin || !navigator.onLine) return;
      const k = await secretDec(enc, ui.accessPin), names = {};
      for (const x of access.list || []) names[x.hash] = state.accessNames[x.hash] || (x.hash === access.me?.hash ? 'Yo (admin)' : 'Sin nombre');
      await fetch(access.usageUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ k, names }) });
    } catch { /* se reintenta la próxima vez que abras Acceso */ }
  }, 600);
}
function usageSetupModal() {
  // la misma clave hasta que se active: así da igual cerrar y reabrir esta ventana
  let key = lsGet('fitnesteban_usekey_pending');
  if (!/^[0-9a-f]{36}$/.test(key || '')) { key = [...crypto.getRandomValues(new Uint8Array(18))].map(b => b.toString(16).padStart(2, '0')).join(''); lsSet('fitnesteban_usekey_pending', key); }
  const code = usageScript(key);
  openModal(`<h3 class="modal-title">📶 Ver quién usa la app</h3>
    <p class="text-xs text-mute">Se hace una sola vez (unos 5 minutos). Todo queda en <b class="text-slate-300">tu</b> Google: una hoja de cálculo y un pequeño script. Es más cómodo en el ordenador: envíate el código con 📤 y deja esta ventana abierta para pegar la URL al final.</p>
    <ol class="card p-3 space-y-2 text-[13px] leading-snug">
      <li><b class="text-brand">1.</b> Abre <a class="text-brand underline" href="https://sheets.new" target="_blank" rel="noopener">sheets.new</a> y ponle de nombre «FITNESTEBAN uso».</li>
      <li><b class="text-brand">2.</b> Menú <b>Extensiones → Apps Script</b>. Borra lo que haya y pega el código (botón de abajo). Guarda 💾.</li>
      <li><b class="text-brand">3.</b> <b>Implementar → Nueva implementación</b> → tipo <b>Aplicación web</b>. «Ejecutar como»: <b>Yo</b>. «Quién tiene acceso»: <b>Cualquier usuario</b>. Pulsa Implementar y autoriza con tu cuenta (si avisa de «app no verificada»: Configuración avanzada → Ir al proyecto).</li>
      <li><b class="text-brand">4.</b> Copia la <b>URL de la aplicación web</b> (acaba en /exec) y pégala aquí.</li>
      <li class="text-amber-300"><b>Si ya lo habías implementado antes:</b> pega el código nuevo, guarda y en <b>Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar</b>. Si no, Google sigue usando el código viejo. La URL no cambia.</li>
    </ol>
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="copy" type="button">📋 Copiar código</button><button class="btn-ghost" data-mact="share" type="button">📤 Enviármelo</button></div>
    <label class="lbl">URL de la aplicación web<input class="field mt-1 font-mono text-xs" name="url" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" /></label>
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar y activar</button>
    <p class="text-[11px] text-mute">El código lleva una clave de lectura única: solo tu app (con tu PIN) puede consultar la hoja. Los móviles de los demás solo pueden apuntar su visita.</p>`, {
    copy: () => navigator.clipboard.writeText(code).then(() => toast('Código copiado: pégalo en Apps Script')).catch(() => toast('No se pudo copiar', 'error')),
    share: () => { if (navigator.share) navigator.share({ title: 'FITNESTEBAN · script de uso', text: code }).catch(() => {}); else navigator.clipboard.writeText(code).then(() => toast('Copiado (este navegador no permite compartir)')); },
    save: root => {
      const url = mval(root, 'url').trim();
      if (!USAGE_RE.test('#uso ' + url)) return toast('Pega la URL que acaba en /exec', 'warn');
      askPin({ title: '📶 Activar el registro de uso', text: 'Tu PIN guarda la clave de lectura cifrada y añade la dirección a la lista de acceso.', onPin: async pin => {
        await ghEditAcl(pin, lines => [...lines.filter(l => l.trim() && !/^#\s*uso\b/i.test(l.trim())), '#uso ' + url], 'Acceso: registro de uso');
        lsSet(USE_KEY, await secretEnc(key, pin)); lsSet(PING_KEY, ''); try { localStorage.removeItem('fitnesteban_usekey_pending'); } catch { /* nada */ }
        ui.accessPin = pin; closeModal(); render(); toast('Registro de uso activado ✓');
        usagePing(); setTimeout(loadUsage, 2500);
      } });
    }
  });
}

function codeShareModal(title, who, code, warn = '') {
  const msg = `Hola${who ? ' ' + who : ''}, tu código de FITNESTEBAN es ${fmtCode(code)}\nhttps://egarluq292.github.io/fitnesteban/`;
  openModal(`<h3 class="modal-title">${title}</h3>${warn}
    <div class="text-center py-1"><div class="text-[11px] text-mute mb-1">${warn ? 'Nuevo código' : 'Código'}</div><div class="font-mono text-3xl font-black tracking-[.2em] text-brand">${fmtCode(code)}</div></div>
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="copy" type="button">📋 Copiar</button><a class="btn-ghost block text-center" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">💬 WhatsApp</a></div>
    <button class="btn-primary w-full" data-close type="button">Hecho</button>
    <p class="text-[11px] text-mute text-center">Ya funciona. Queda guardado (cifrado con tu PIN) en tu lista de Acceso.</p>`, {
    copy: () => navigator.clipboard.writeText(fmtCode(code)).then(() => toast('Código copiado')).catch(() => toast('Cópialo a mano', 'warn'))
  });
}
function regenAccess(hash) {
  const self = hash === access.me?.hash, who = self ? 'ti' : (state.accessNames[hash] || 'Sin nombre …' + hash.slice(-4));
  askPin({ title: `🔄 Nuevo código para ${esc(who)}`, text: self ? 'Tu código actual dejará de valer. En este móvil se cambia solo; en tus otros dispositivos tendrás que escribir el nuevo.' : `El código actual dejará de funcionar: ${esc(who)} tendrá que escribir el nuevo la próxima vez que la app se lo pida.`, onPin: async pin => {
    const code = newCode(), nh = await codeHash(code);
    await ghEditAcl(pin, lines => lines.map(l => l.trim().toLowerCase().startsWith(hash) ? [nh, ...l.trim().split(/\s+/).slice(1)].join(' ') : l), 'Acceso: código renovado');
    if (state.accessNames[hash]) { state.accessNames[nh] = state.accessNames[hash]; delete state.accessNames[hash]; }
    delete state.accessCodes[hash]; await saveAccessCode(nh, code, pin);
    if (self) { lsSet(ACCESS_KEY, { code: normCode(code), at: Date.now() }); access.me = { ...access.me, hash: nh }; }
    if (ui.accessReveal) delete ui.accessReveal[hash];
    ui.accessPin = pin; persist(); render(); syncUsageNames();
    codeShareModal(`🔄 Nuevo código para ${esc(self ? 'ti' : who)}`, self ? '' : who, code, `<div class="card p-3 text-[13px] leading-snug"><b class="text-amber-300">El código anterior ya no funciona.</b> ${self ? 'Escribe este en tus otros dispositivos.' : `Mándale este a ${esc(who)}.`}</div>`);
  } });
}
function askPinOnly(title, text, onOk) {
  let fails = 0;
  openModal(`<h3 class="modal-title">${title}</h3><p class="text-sm text-mute">${text}</p>${pinField('pin', 'Tu PIN')}<button class="btn-primary w-full mt-2" data-mact="ok" type="button">Abrir</button>`, {
    autofocus: true,
    ok: async root => {
      const pin = pinVal(root, 'pin'); if (!pin) return toast('Introduce el PIN', 'warn');
      if (await hashPin(pin) !== state.settings.pinHash) { fails++; root.querySelector('[name="pin"]').value = ''; if (fails >= 5) { closeModal(); return toast('Demasiados intentos', 'error'); } return toast(`PIN incorrecto (${fails}/5)`, 'error'); }
      closeModal(); onOk(pin);
    }
  });
}
function askPin({ title, text, onPin }) {
  if (!state.settings.pinHash) return toast('Primero crea un PIN en Ajustes → Seguridad', 'warn');
  let fails = 0;
  openModal(`<h3 class="modal-title">${title}</h3><p class="text-sm text-mute">${text}</p>${pinField('pin', 'Tu PIN')}
    <button class="btn-primary w-full mt-2" data-mact="ok" type="button">Continuar</button>`, {
    autofocus: true,
    ok: async root => {
      const pin = pinVal(root, 'pin'); if (!pin) return toast('Introduce el PIN', 'warn');
      if (await hashPin(pin) !== state.settings.pinHash) { fails++; root.querySelector('[name="pin"]').value = ''; if (fails >= 5) { closeModal(); return toast('Demasiados intentos', 'error'); } return toast(`PIN incorrecto (${fails}/5)`, 'error'); }
      const btn = root.querySelector('[data-mact=ok]'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Un momento…';
      try { await onPin(pin, root); } catch (e) { toast(e.message, 'error'); btn.disabled = false; btn.textContent = 'Continuar'; }
    }
  });
}
function accessSectionHTML() {
  if (!access.me?.admin) return '';
  if (!ui.accessOpen) { ui.accessPin = null; ui.accessReveal = {}; }
  if (!ui.accessOpen) return `<section class="card p-0 mt-3"><button class="w-full flex items-center justify-between px-4 py-3.5" data-act="openAccess" type="button">
      <h3 class="section-title">🔑 Acceso</h3><span class="flex items-center gap-2 text-[11px] text-mute">🔒 Protegido<span class="tri"></span></span></button></section>`;
  const list = access.list || [], gh = !!lsGet(GH_KEY);
  return `<section class="card p-4 mt-3 space-y-3">
    <button class="w-full flex items-center justify-between" data-act="closeAccess" type="button"><h3 class="section-title">🔑 Acceso</h3><span class="flex items-center gap-2 text-[11px] text-emerald-300">🔓 Abierto<span class="tri rotate-180"></span></span></button>
    <p class="text-[11px] text-mute">${list.length} ${list.length === 1 ? 'persona' : 'personas'} con acceso. Los nombres y códigos solo los ves tú: van cifrados con tu PIN en este móvil y en tus copias. En GitHub solo hay huellas.</p>
    <div class="space-y-1.5">${list.map(x => {
      const me = x.hash === access.me.hash, has = me ? !!lsGet(ACCESS_KEY)?.code : !!state.accessCodes?.[x.hash], shown = ui.accessReveal?.[x.hash];
      const codeLine = has
        ? `<span class="font-mono text-[15px] font-black tracking-[.15em] ${shown ? 'text-brand' : 'text-mute'}">${shown ? fmtCode(shown) : '••••-••••'}</span>
           <span class="flex gap-1.5"><button class="iconbtn iconbtn-sm" data-act="showCode" data-hash="${esc(x.hash)}" type="button" aria-label="Ver código">${shown ? '🙈' : '👁'}</button><button class="iconbtn iconbtn-sm" data-act="copyCode" data-hash="${esc(x.hash)}" type="button" aria-label="Copiar código">📋</button></span>`
        : `<span class="text-amber-300 text-[11px]">Código no guardado (creado antes de la 4.24). Si lo necesita, dale uno nuevo con 🔄.</span>`;
      return `<div class="bg-ink rounded-lg px-3 py-2 text-xs space-y-1.5">
      <div class="flex items-center justify-between gap-2"><span class="min-w-0 truncate font-semibold text-[13px]">${accessWho(x) ? esc(accessWho(x)) : `<span class="text-amber-300">Sin nombre</span> <span class="text-mute font-mono">…${esc(x.hash.slice(-4))}</span>`}${me ? ' <span class="text-brand font-normal">(tú · admin)</span>' : x.admin ? ' <span class="text-mute font-normal">(admin)</span>' : ''}</span>
      <span class="flex items-center gap-1.5 shrink-0"><button class="iconbtn iconbtn-sm" data-act="nameAccess" data-hash="${esc(x.hash)}" type="button" aria-label="Poner nombre">✎</button>${gh ? `<button class="iconbtn iconbtn-sm" data-act="regenAccess" data-hash="${esc(x.hash)}" type="button" aria-label="Nuevo código">🔄</button>` : ''}${me || !gh ? '' : `<button class="iconbtn iconbtn-sm text-rose-300" data-act="delAccess" data-hash="${esc(x.hash)}" type="button" aria-label="Quitar acceso">🗑</button>`}</span></div>
      <div class="flex items-center justify-between gap-2 min-h-[28px]">${codeLine}</div>${usageLine(x.hash)}</div>`;
    }).join('')}</div>
    ${gh ? '<p class="text-[11px] text-mute">✎ nombre · 🔄 nuevo código (el anterior deja de funcionar) · 🗑 quitar acceso</p>' : ''}
    ${list.length ? '<button class="btn-ghost w-full" data-act="copyHashes" type="button">📋 Copiar huellas y nombres (para tu hoja)</button>' : ''}
    ${access.usageUrl && lsGet(USE_KEY)
      ? `<div class="flex items-center justify-between gap-2 text-[11px] text-mute"><span>📶 Uso: ${ui.usageErr ? `<span class="text-rose-300">${esc(ui.usageErr)}</span>` : ui.usageLoading ? 'consultando…' : ui.usage ? (ui.usageOld ? '<span class="text-amber-300">actualiza el script (Reconfigurar) para que los nombres pasen solos a la hoja</span>' : 'actualizado ahora · nombres sincronizados con la hoja') : '—'}</span><span class="flex gap-3 shrink-0"><button class="underline" data-act="usageSetup" type="button">Reconfigurar</button><button class="underline" data-act="usageRefresh" type="button">Actualizar</button></span></div>`
      : gh ? `<button class="btn-ghost w-full" data-act="usageSetup" type="button">📶 Ver quién usa la app (configurar)</button>` : ''}
    ${gh ? `<button class="btn-primary w-full" data-act="newAccess" type="button">＋ Crear código para alguien</button>
      <p class="text-[11px] text-mute flex justify-between">GitHub conectado ✓ (token cifrado con tu PIN)<button class="underline" data-act="ghDisconnect" type="button">Desconectar</button></p>`
    : `<p class="text-[11px] text-mute">Conecta GitHub para crear y quitar códigos con un botón, sin editar archivos.</p>
      <button class="btn-primary w-full" data-act="ghConnect" type="button">Conectar GitHub</button>`}
  </section>`;
}
function ghConnectModal() {
  if (!state.settings.pinHash) return toast('Primero crea un PIN en Ajustes → Seguridad: protegerá la llave de GitHub', 'warn');
  openModal(`<h3 class="modal-title">Conectar GitHub</h3>
    <ol class="text-xs text-mute list-decimal pl-4 space-y-1">
      <li>Abre <a class="text-brand underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → nuevo token (fine-grained)</a>.</li>
      <li>Nombre: FITNESTEBAN · Caducidad: 1 año.</li>
      <li>Repository access: <strong class="text-white">Only select repositories → fitnesteban</strong>.</li>
      <li>Permissions → Repository → <strong class="text-white">Contents: Read and write</strong>. Nada más.</li>
      <li>Generate token, cópialo y pégalo aquí.</li>
    </ol>
    <label class="lbl">Token<input class="field mt-1 font-mono text-xs" name="tok" autocomplete="off" spellcheck="false" placeholder="github_pat_…" /></label>
    ${pinField('pin', 'Tu PIN (cifra la llave)')}
    <button class="btn-primary w-full" data-mact="ok" type="button">Comprobar y guardar</button>`, {
    ok: async root => {
      const tok = mval(root, 'tok').trim(), pin = pinVal(root, 'pin');
      if (!tok) return toast('Pega el token', 'warn');
      if (!pin || await hashPin(pin) !== state.settings.pinHash) return toast('PIN incorrecto', 'error');
      const btn = root.querySelector('[data-mact=ok]'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Comprobando…';
      try { await ghApi(tok); await ghSaveToken(tok, pin); closeModal(); render(); toast('GitHub conectado ✓'); }
      catch (e) { toast(e.message, 'error'); btn.disabled = false; btn.textContent = 'Comprobar y guardar'; }
    }
  });
}
function newAccessModal() {
  openModal(`<h3 class="modal-title">Nuevo código de acceso</h3>
    <label class="lbl">¿Para quién es? (solo lo verás tú)<input class="field mt-1" name="who" maxlength="24" placeholder="Ej: Ana" /></label>
    <button class="btn-primary w-full" data-mact="next" type="button">Continuar</button>`, {
    autofocus: true,
    next: root => {
      const who = mval(root, 'who').trim().replace(/\s+/g, ' '); if (!who) return toast('Pon un nombre', 'warn');
      askPin({ title: `Crear código para ${esc(who)}`, text: 'Tu PIN abre la llave de GitHub para añadir el código a la lista.', onPin: async pin => {
        const code = newCode(), hash = await codeHash(code);
        await ghEditAcl(pin, lines => [...lines.filter(l => l.trim()), hash], 'Acceso: nuevo código');
        state.accessNames[hash] = who; await saveAccessCode(hash, code, pin); ui.accessPin = pin; persist(); render(); syncUsageNames();
        codeShareModal(`Código para ${esc(who)}`, who, code);
      } });
    }
  });
}
function delAccess(hash) {
  const who = state.accessNames[hash] || 'Sin nombre …' + hash.slice(-4);
  askPin({ title: `Quitar el acceso de ${esc(who)}`, text: 'Su código dejará de funcionar la próxima vez que abra la app con conexión (en 1–2 minutos, cuando GitHub publique el cambio). Sus datos se quedan en su móvil.', onPin: async pin => {
    await ghEditAcl(pin, lines => lines.filter(l => !l.trim().toLowerCase().startsWith(hash)), 'Acceso: código retirado');
    delete state.accessNames[hash]; delete state.accessCodes[hash]; ui.accessPin = pin; persist(); closeModal(); render(); toast('Acceso retirado ✓'); syncUsageNames();
  } });
}

/* ---------- Arranque ----------
   Se abre en Dieta (anillos del día). Excepción: si hay un entreno a medias de las últimas 3 horas, se abre en Entreno. */
function workoutInProgress() {
  const now = Date.now();
  for (const [dayId, d] of Object.entries(state.drafts || {})) {
    if (d?.lastAt && now - d.lastAt < 3 * 3600000 && draftHasData(dayId)) {
      const pr = programOfDay(dayId);
      if (pr) return { prog: pr.id, day: dayId };
    }
  }
  return null;
}
function goHome() {
  closeModal();
  ui.editing = null; ui.aiResult = null;
  ui.dietDate = todayISO();
  if (ui.view === 'diet') { ui._animRings = true; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else go('diet');
}
$('#homeBtn').addEventListener('click', goHome);
ui.dayId = nextDayId();
{
  const wip = workoutInProgress();
  if (wip) { state.plan.active = wip.prog; ui.dayId = wip.day; ui.view = 'train'; }
  else ui._animRings = true;
}
render();
accessBoot(); // las novedades se comprueban al entrar (unlock), cuando ya se sabe si es el administrador
setTimeout(() => maybeAutoDriveBackup(), 1500);
