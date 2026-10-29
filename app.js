'use strict';
/* =========================================================================
   FITNESTEBAN · PWA
   Datos: localStorage (solo en este móvil). Sin fotos guardadas.
   ========================================================================= */

const APP_VERSION = '4.42.1';
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

/* Biblioteca de ejercicios sueltos (preparados por Esteban): se añaden a cualquier día, también a FREE.
   [grupo, nombre, nota, series, reps mín, reps máx, incremento, descanso, peso corporal, alternativas] */
const EX_LIB = [["Pecho","Press de banca con barra","Escápulas retraídas, pies firmes.",4,6,10,2.5,120,false,[["Press de banca con mancuernas","Bajada en 2 s."],["Press de pecho en máquina","Recorrido completo."]]],["Pecho","Press de banca con mancuernas","Bajada controlada en 2 s.",4,8,12,2,90,false,[["Press en suelo con mancuernas","Codos a 45º."],["Press de banca con barra","Escápulas retraídas."]]],["Pecho","Press inclinado con mancuernas","Banco a 30º.",3,8,12,2,90,false,[["Press inclinado con barra","Banco a 30º."],["Press inclinado en máquina","Recorrido completo."]]],["Pecho","Aperturas con mancuernas","Codos algo flexionados, abre hasta notar estiramiento.",3,10,15,1,60,false,[["Aperturas en polea","Tensión constante."],["Contractora (pec deck)","Pausa al cerrar."]]],["Pecho","Cruce de poleas","Junta las manos delante del pecho.",3,12,15,1,60,false,[["Aperturas con mancuernas","Codos algo flexionados."],["Contractora (pec deck)","Pausa al cerrar."]]],["Pecho","Fondos en paralelas","Torso inclinado hacia delante. 0 kg = peso corporal.",3,6,12,2,90,true,[["Fondos asistidos con banda","0 kg = peso corporal."],["Flexiones declinadas","Pies elevados."]]],["Pecho","Flexiones","Cuerpo en bloque, pecho al suelo. 0 kg = peso corporal.",3,10,20,2,60,true,[["Flexiones declinadas","Pies elevados."],["Flexiones con palmada","Explosivas."]]],["Pecho","Press inclinado con barra","Banco a 30º, barra a la parte alta del pecho.",4,6,10,2.5,120,false,[["Press inclinado con mancuernas","Banco a 30º."],["Press inclinado en máquina","Recorrido completo."]]],["Pecho","Press declinado con barra","Barra a la parte baja del pecho, pies sujetos.",3,8,10,2.5,90,false,[["Fondos en paralelas","Torso inclinado."],["Press declinado con mancuernas","Bajada controlada."]]],["Pecho","Press de pecho en máquina","Asiento a la altura del pecho, recorrido completo.",3,8,12,2.5,90,false,[["Press de banca con mancuernas","Bajada en 2 s."],["Flexiones","Cuerpo en bloque."]]],["Pecho","Contractora (pec deck)","Pausa de 1 s al cerrar.",3,12,15,2.5,60,false,[["Aperturas con mancuernas","Codos algo flexionados."],["Cruce de poleas","Junta las manos delante."]]],["Pecho","Aperturas en banco inclinado","Banco a 30º, abre hasta notar estiramiento.",3,10,15,1,60,false,[["Cruce de poleas de abajo arriba","Sube las manos a la barbilla."],["Aperturas con mancuernas","Codos algo flexionados."]]],["Pecho","Cruce de poleas de abajo arriba","Poleas abajo, sube las manos a la altura de la barbilla.",3,12,15,1,60,false,[["Aperturas en banco inclinado","Banco a 30º."],["Cruce de poleas","Junta las manos delante."]]],["Pecho","Flexiones inclinadas","Manos en un banco o mesa. Más fácil que en el suelo. 0 kg = peso corporal.",3,10,20,2,60,true,[["Flexiones de rodillas","Cuerpo recto de rodillas a cabeza."],["Flexiones","Pecho al suelo."]]],["Pecho","Flexiones declinadas","Pies en un banco, cuerpo en bloque. 0 kg = peso corporal.",3,8,15,2,60,true,[["Flexiones","Pecho al suelo."],["Press inclinado con mancuernas","Banco a 30º."]]],["Espalda","Dominadas pronas","Pecho a la barra. 0 kg = peso corporal.",4,5,10,2,120,true,[["Dominadas asistidas con banda","Banda bajo las rodillas."],["Dominadas negativas","Baja en 4–5 s."]]],["Espalda","Dominadas supinas","Agarre cerrado. 0 kg = peso corporal.",3,6,10,2,120,true,[["Dominadas con agarre neutro","0 kg = peso corporal."],["Dominadas asistidas con banda","Banda bajo las rodillas."]]],["Espalda","Jalón al pecho en polea","Pecho arriba, codos hacia abajo.",4,8,12,2.5,90,false,[["Jalón con agarre neutro","Codos pegados."],["Jalón supino","Agarre estrecho."]]],["Espalda","Remo con barra","Torso a unos 45º, barra al ombligo.",4,8,10,2.5,90,false,[["Remo Pendlay","Desde el suelo en cada rep."],["Remo en máquina","Pecho apoyado."]]],["Espalda","Remo con mancuerna a una mano","Codo hacia la cadera.",3,8,12,2,90,false,[["Remo con kettlebell a una mano","Codo hacia la cadera."],["Remo en banco inclinado","Pecho apoyado en el banco."]]],["Espalda","Remo en polea baja","Espalda neutra, codos atrás.",3,10,12,2.5,90,false,[["Remo en máquina","Pecho apoyado."],["Remo con mancuerna a una mano","Codo a la cadera."]]],["Espalda","Remo invertido en TRX","Cuerpo recto, pecho a las asas. 0 kg = peso corporal.",3,8,15,2,60,true,[["Remo invertido en barra","Cuerpo recto."],["Dominadas australianas","Barra a la altura de la cadera."]]],["Espalda","Pullover en polea","Brazos casi rectos, lleva la barra a los muslos.",3,12,15,2.5,60,false,[["Pullover con mancuerna","Tumbado en banco."],["Jalón con brazos rectos","Codos fijos."]]],["Espalda","Face pull","Codos altos, abre al final.",3,12,20,1,60,false,[["Pájaros con mancuernas","Torso inclinado."],["Apertura con banda","Brazos rectos."]]],["Espalda","Jalón con agarre estrecho","Triángulo al pecho, codos pegados.",3,8,12,2.5,90,false,[["Jalón al pecho en polea","Codos hacia abajo."],["Remo en polea baja","Codos atrás."]]],["Espalda","Jalón con agarre supino","Palmas hacia ti, barra a la clavícula.",3,8,12,2.5,90,false,[["Dominadas supinas","Agarre cerrado."],["Jalón al pecho en polea","Pecho arriba."]]],["Espalda","Remo en máquina con pecho apoyado","Pecho pegado al respaldo, aprieta las escápulas.",3,10,12,2.5,90,false,[["Remo en polea baja","Espalda neutra."],["Remo con mancuernas en banco inclinado","Pecho apoyado."]]],["Espalda","Remo con mancuernas en banco inclinado","Pecho apoyado en el banco a 30º, codos atrás.",3,10,12,2,90,false,[["Remo en máquina con pecho apoyado","Aprieta escápulas."],["Remo con mancuerna a una mano","Codo a la cadera."]]],["Espalda","Remo en T","Pecho alto, tira hacia el abdomen.",3,8,12,2.5,90,false,[["Remo con barra","Torso a 45º."],["Remo en máquina con pecho apoyado","Aprieta escápulas."]]],["Espalda","Dominadas asistidas","Con máquina o banda. Pon en kg la ayuda que te da la máquina, o 0 si usas banda.",3,6,12,2,90,false,[["Jalón al pecho en polea","Codos hacia abajo."],["Dominadas negativas","Baja en 4–5 s."]]],["Espalda","Hiperextensiones","Sube hasta la línea del cuerpo, sin pasarte. 0 kg = peso corporal.",3,12,15,2.5,60,true,[["Buenos días con barra","Rodillas suaves."],["Superman","Brazos y piernas a la vez."]]],["Hombro","Press militar de pie con barra","Glúteos y abdomen apretados.",4,6,10,2.5,120,false,[["Press militar sentado con mancuernas","Rango completo."],["Press de hombro en máquina","Recorrido completo."]]],["Hombro","Press de hombro sentado con mancuernas","Rango completo.",3,8,12,2,90,false,[["Press Arnold","Gira las muñecas al subir."],["Press de hombro en máquina","Recorrido completo."]]],["Hombro","Press Arnold","Gira las muñecas al subir.",3,8,12,2,90,false,[["Press de hombro sentado con mancuernas","Rango completo."],["Press militar de pie con barra","Core firme."]]],["Hombro","Elevaciones laterales con mancuernas","Sin impulso, codos algo flexionados.",3,12,20,1,60,false,[["Elevaciones laterales en polea","Tensión constante."],["Elevaciones laterales con banda","Controla la bajada."]]],["Hombro","Pájaros con mancuernas","Torso inclinado, codos suaves.",3,12,15,1,60,false,[["Face pull","Codos altos."],["Pájaros en máquina","Brazos casi rectos."]]],["Hombro","Elevaciones frontales","Sube hasta la altura de los ojos.",3,10,15,1,60,false,[["Elevaciones frontales con disco","Agarre por los lados."],["Elevaciones frontales en polea","Tensión constante."]]],["Hombro","Encogimientos con mancuernas","Sube los hombros hacia las orejas, pausa arriba.",3,10,15,2,60,false,[["Encogimientos con barra","Sin girar los hombros."],["Encogimientos en máquina","Pausa arriba."]]],["Hombro","Press de hombro en máquina","Espalda apoyada, sin bloquear los codos.",3,8,12,2.5,90,false,[["Press de hombro sentado con mancuernas","Rango completo."],["Press Arnold","Gira las muñecas."]]],["Hombro","Elevaciones laterales en polea","Polea baja, tensión constante. Reps por brazo.",3,12,15,1,60,false,[["Elevaciones laterales con mancuernas","Sin impulso."],["Elevaciones laterales en máquina","Pausa arriba."]]],["Hombro","Elevaciones laterales en máquina","Codos guían el movimiento, pausa arriba.",3,12,15,2.5,60,false,[["Elevaciones laterales con mancuernas","Sin impulso."],["Elevaciones laterales en polea","Tensión constante."]]],["Hombro","Pájaros en máquina","Contractora al revés, brazos casi rectos.",3,12,15,2.5,60,false,[["Pájaros con mancuernas","Torso inclinado."],["Face pull","Codos altos."]]],["Hombro","Remo al mentón en polea","Agarre ancho, codos por encima de las manos, sube hasta el pecho.",3,10,12,2.5,60,false,[["Elevaciones laterales con mancuernas","Sin impulso."],["Remo al mentón con mancuernas","Sube hasta el pecho."]]],["Hombro","Press landmine","Barra anclada en una esquina, empuja hacia arriba y adelante. Reps por brazo.",3,8,12,2.5,90,false,[["Press de hombro sentado con mancuernas","Rango completo."],["Press de hombro en máquina","Recorrido completo."]]],["Hombro","Encogimientos con barra","Sube los hombros hacia las orejas, pausa arriba.",3,10,15,2.5,60,false,[["Encogimientos con mancuernas","Pausa arriba."],["Paseo del granjero","Hombros abajo."]]],["Bíceps","Curl con barra","Codos pegados, sin balanceo.",3,8,12,2,60,false,[["Curl con barra Z","Agarre más cómodo para muñecas."],["Curl en polea","Tensión constante."]]],["Bíceps","Curl con mancuernas alterno","Supina al subir.",3,10,12,1,60,false,[["Curl en banco inclinado","Brazos por detrás del cuerpo."],["Curl concentrado","Codo apoyado en el muslo."]]],["Bíceps","Curl martillo","Agarre neutro.",3,10,12,1,60,false,[["Curl martillo en polea con cuerda","Codos fijos."],["Curl Zottman","Sube supino, baja prono."]]],["Bíceps","Curl en banco inclinado","Brazos por detrás del cuerpo.",3,10,12,1,60,false,[["Curl con mancuernas alterno","Supina al subir."],["Curl concentrado","Codo apoyado."]]],["Bíceps","Curl concentrado","Codo apoyado en el muslo.",3,10,12,1,60,false,[["Curl en banco inclinado","Brazos atrás."],["Curl en polea a una mano","Tensión constante."]]],["Bíceps","Curl en polea","Codos pegados, tensión constante.",3,10,15,2.5,60,false,[["Curl con barra","Sin balanceo."],["Curl con banda","Codos fijos."]]],["Bíceps","Curl predicador","Brazos apoyados en el banco Scott, baja del todo.",3,8,12,2,60,false,[["Curl concentrado","Codo apoyado."],["Curl en polea","Tensión constante."]]],["Bíceps","Curl con barra Z","Codos pegados, agarre cómodo para las muñecas.",3,8,12,2,60,false,[["Curl con barra","Sin balanceo."],["Curl con mancuernas alterno","Supina al subir."]]],["Bíceps","Curl spider","Pecho apoyado en banco inclinado, brazos colgando.",3,10,12,1,60,false,[["Curl predicador","Brazos apoyados."],["Curl concentrado","Codo apoyado."]]],["Bíceps","Curl martillo en polea con cuerda","Agarre neutro, codos fijos.",3,10,15,2.5,60,false,[["Curl martillo","Agarre neutro."],["Curl en polea","Tensión constante."]]],["Tríceps","Extensión de tríceps en polea","Codos fijos pegados al cuerpo.",3,10,15,2.5,60,false,[["Extensión de tríceps en polea con cuerda","Abre la cuerda abajo."],["Patada de tríceps","Brazo paralelo al suelo."]]],["Tríceps","Press francés con barra Z","Baja a la frente con los codos fijos.",3,8,12,2,60,false,[["Press francés con mancuernas","Codos fijos."],["Extensión sobre la cabeza con mancuerna","Codos hacia el techo."]]],["Tríceps","Extensión sobre la cabeza con mancuerna","Codos hacia el techo.",3,10,12,1,60,false,[["Extensión sobre la cabeza en polea","Tensión constante."],["Press francés con mancuernas","Codos fijos."]]],["Tríceps","Patada de tríceps","Brazo paralelo al suelo, extiende del todo.",3,12,15,1,60,false,[["Patada de tríceps en polea","Tensión constante."],["Extensión de tríceps en polea","Codos fijos."]]],["Tríceps","Press cerrado con barra","Manos a la anchura de los hombros.",3,6,10,2.5,90,false,[["Press cerrado con mancuernas","Mancuernas juntas."],["Fondos en banco","Hombros abajo."]]],["Tríceps","Fondos en banco","Hombros abajo. 0 kg = peso corporal.",3,10,20,2,60,true,[["Flexiones diamante","Codos pegados."],["Fondos en paralelas","Torso erguido."]]],["Tríceps","Extensión en polea con cuerda","Abre la cuerda abajo, codos fijos.",3,10,15,2.5,60,false,[["Extensión de tríceps en polea","Codos pegados."],["Patada de tríceps","Brazo paralelo al suelo."]]],["Tríceps","Extensión sobre la cabeza en polea","De espaldas a la polea, codos hacia delante.",3,10,15,2.5,60,false,[["Extensión sobre la cabeza con mancuerna","Codos al techo."],["Press francés con barra Z","Codos fijos."]]],["Tríceps","Extensión a una mano en polea","Codo pegado al costado. Reps por brazo.",3,10,15,1,60,false,[["Patada de tríceps","Extiende del todo."],["Extensión en polea con cuerda","Abre abajo."]]],["Tríceps","Press francés con mancuernas","Tumbado, baja las mancuernas junto a las orejas.",3,10,12,1,60,false,[["Press francés con barra Z","Codos fijos."],["Extensión sobre la cabeza con mancuerna","Codos al techo."]]],["Tríceps","Fondos en máquina","Torso erguido, codos atrás.",3,10,12,2.5,60,false,[["Fondos en banco","Hombros abajo."],["Press cerrado con barra","Manos a la anchura de hombros."]]],["Pierna","Sentadilla trasera con barra","Profundidad paralela o más, core apretado.",4,5,8,2.5,150,false,[["Sentadilla frontal con barra","Codos altos."],["Sentadilla goblet","Mancuerna al pecho."]]],["Pierna","Sentadilla goblet","Pega la mancuerna al esternón.",3,10,15,2,90,false,[["Sentadilla con kettlebell en rack","Kettlebell en el antebrazo."],["Sentadilla búlgara","Reps por pierna."]]],["Pierna","Prensa de piernas","Pies a media altura, sin bloquear rodillas.",4,10,15,5,120,false,[["Sentadilla hack","Espalda apoyada."],["Sentadilla en máquina Smith","Pies algo adelantados."]]],["Pierna","Sentadilla búlgara","Pie trasero en el banco. Reps por pierna.",3,8,12,2,90,false,[["Zancadas con mancuernas","Paso largo."],["Step-up con mancuernas","Sube con el talón."]]],["Pierna","Zancadas con mancuernas","Rodilla trasera rozando el suelo.",3,10,12,2,90,false,[["Zancadas inversas","Paso atrás controlado."],["Zancadas caminando","Paso largo y continuo."]]],["Pierna","Extensión de cuádriceps","Pausa de 1 s arriba.",3,12,15,2.5,60,false,[["Extensión de cuádriceps a una pierna","Pausa arriba."],["Sentadilla goblet","Mancuerna al pecho."]]],["Pierna","Step-up con mancuernas","Sube empujando con el talón.",3,10,12,2,90,false,[["Sentadilla búlgara","Reps por pierna."],["Zancadas con mancuernas","Paso largo."]]],["Pierna","Sentadilla frontal","Barra sobre los hombros delante, codos altos.",4,6,10,2.5,120,false,[["Sentadilla goblet","Mancuerna al pecho."],["Sentadilla trasera con barra","Core apretado."]]],["Pierna","Hack squat","Espalda apoyada, baja hasta la paralela.",3,8,12,5,120,false,[["Prensa de piernas","Sin bloquear rodillas."],["Sentadilla en multipower","Pies algo adelantados."]]],["Pierna","Sentadilla en multipower","Pies algo adelantados, baja controlado.",3,8,12,2.5,120,false,[["Sentadilla trasera con barra","Core apretado."],["Hack squat","Espalda apoyada."]]],["Pierna","Prensa a una pierna","Pie en el centro de la plataforma. Reps por pierna.",3,10,12,2.5,90,false,[["Prensa de piernas","Sin bloquear rodillas."],["Sentadilla búlgara","Reps por pierna."]]],["Pierna","Zancadas caminando","Paso largo y continuo, rodilla trasera rozando el suelo. Reps por pierna.",3,10,12,2,90,false,[["Zancadas con mancuernas","Paso largo."],["Zancadas inversas","Paso atrás."]]],["Pierna","Zancadas inversas","Paso atrás controlado, menos carga en la rodilla. Reps por pierna.",3,10,12,2,90,false,[["Zancadas con mancuernas","Paso largo."],["Step-up con mancuernas","Sube con el talón."]]],["Pierna","Sentadilla sumo con mancuerna","Pies abiertos y puntas fuera, mancuerna colgando.",3,10,15,2,90,false,[["Sentadilla goblet","Mancuerna al pecho."],["Peso muerto sumo","Rodillas hacia fuera."]]],["Pierna","Sentadilla a una pierna en cajón","Siéntate en un cajón con una pierna y levántate. Reps por pierna. 0 kg = peso corporal.",3,6,10,2,90,true,[["Sentadilla búlgara","Reps por pierna."],["Step-up con mancuernas","Sube con el talón."]]],["Femoral y glúteo","Peso muerto con barra","Espalda neutra, empuja el suelo.",3,5,8,5,180,false,[["Peso muerto con barra hexagonal","Empuja el suelo."],["Peso muerto rumano","Cadera atrás."]]],["Femoral y glúteo","Peso muerto rumano","Cadera atrás, espalda neutra, rodillas suaves.",3,8,12,2.5,120,false,[["Peso muerto rumano con mancuernas","Mancuernas pegadas a las piernas."],["Buenos días con barra","Rodillas suaves."]]],["Femoral y glúteo","Curl femoral tumbado","Bajada lenta en 3 s.",3,10,12,2.5,60,false,[["Curl femoral sentado","Bajada lenta."],["Curl nórdico asistido","Baja lo más lento posible."]]],["Femoral y glúteo","Curl femoral sentado","Bajada lenta en 3 s.",3,10,12,2.5,60,false,[["Curl femoral tumbado","Bajada lenta."],["Peso muerto rumano con mancuernas","Cadera atrás."]]],["Femoral y glúteo","Hip thrust con barra","Pausa de 1 s arriba, barbilla al pecho.",4,8,12,5,90,false,[["Puente de glúteo con barra","Pausa arriba."],["Hip thrust a una pierna","Reps por pierna."]]],["Femoral y glúteo","Patada de glúteo en polea","Pierna estirada hacia atrás, sin arquear la espalda.",3,12,15,1,60,false,[["Patada de glúteo en máquina","Pausa arriba."],["Puente de glúteo a una pierna","Reps por pierna."]]],["Femoral y glúteo","Abducción de cadera en máquina","Pausa al abrir.",3,12,20,2.5,60,false,[["Abducción con banda (paso lateral)","Rodillas algo flexionadas."],["Abducción en polea","De pie, pierna estirada."]]],["Femoral y glúteo","Buenos días con barra","Cadera atrás, rodillas suaves.",3,8,12,2.5,90,false,[["Peso muerto rumano","Cadera atrás."],["Hiperextensiones","Sin pasar de la línea del cuerpo."]]],["Femoral y glúteo","Peso muerto sumo","Pies abiertos, rodillas hacia fuera, espalda neutra.",3,5,8,5,150,false,[["Peso muerto con barra","Empuja el suelo."],["Sentadilla sumo con mancuerna","Puntas fuera."]]],["Femoral y glúteo","Peso muerto rumano con mancuernas","Mancuernas pegadas a las piernas, cadera atrás.",3,8,12,2,90,false,[["Peso muerto rumano","Cadera atrás."],["Peso muerto a una pierna","Reps por pierna."]]],["Femoral y glúteo","Peso muerto a una pierna","Cadera nivelada, pierna libre estirada atrás. Reps por pierna.",3,8,12,2,90,false,[["Peso muerto rumano con mancuernas","Cadera atrás."],["Puente de glúteo a una pierna","Pausa arriba."]]],["Femoral y glúteo","Puente de glúteo","Tumbado, sube la cadera y aprieta 1 s arriba.",3,12,15,2.5,60,false,[["Hip thrust con barra","Barbilla al pecho."],["Puente de glúteo a una pierna","Reps por pierna."]]],["Femoral y glúteo","Hip thrust en máquina","Pausa de 1 s arriba.",3,10,12,5,90,false,[["Hip thrust con barra","Pausa arriba."],["Puente de glúteo","Aprieta arriba."]]],["Femoral y glúteo","Hip thrust a una pierna","Espalda en el banco, pausa arriba. Reps por pierna. 0 kg = peso corporal.",3,8,12,2,60,true,[["Puente de glúteo a una pierna","En el suelo."],["Hip thrust con barra","Pausa arriba."]]],["Femoral y glúteo","Aducción en máquina","Cierra controlado, pausa al juntar.",3,12,15,2.5,60,false,[["Aducción en polea","De pie, pierna estirada."],["Sentadilla sumo con mancuerna","Puntas fuera."]]],["Femoral y glúteo","Abducción con banda","Banda en las rodillas, sentado o de lado, abre y aguanta 1 s.",3,15,20,1,45,true,[["Abducción de cadera en máquina","Pausa al abrir."],["Paso lateral con banda","Rodillas flexionadas."]]],["Gemelos","Elevación de gemelos de pie","Pausa abajo y arriba.",4,10,15,2.5,60,false,[["Elevación de gemelos sentado","Pausa arriba."],["Elevación de gemelos a una pierna","Apoyado en un escalón."]]],["Gemelos","Elevación de gemelos sentado","Pausa arriba.",4,12,15,2.5,60,false,[["Elevación de gemelos de pie","Pausa abajo y arriba."],["Elevación de gemelos en prensa","Recorrido completo."]]],["Gemelos","Gemelo en prensa","Solo las puntas en la plataforma, recorrido completo.",4,12,15,5,60,false,[["Elevación de gemelos de pie","Pausa abajo y arriba."],["Elevación de gemelos sentado","Pausa arriba."]]],["Gemelos","Elevación de gemelos a una pierna","De pie en un escalón, apoyado con una mano. Reps por pierna.",3,10,15,2,60,true,[["Elevación de gemelos de pie","Pausa abajo y arriba."],["Gemelo en prensa","Recorrido completo."]]],["Core","Rueda abdominal","Pelvis metida, sin hundir la zona lumbar. 0 kg = peso corporal.",3,8,15,1,60,true,[["Rueda abdominal de rodillas","Bajada lenta."],["Plancha con toque de hombros","Sin girar la cadera."]]],["Core","Elevación de piernas colgado","Sin balanceo, sube las rodillas al pecho. 0 kg = peso corporal.",3,8,15,1,60,true,[["Elevación de rodillas en paralelas","Espalda apoyada."],["Elevación de piernas tumbado","Zona lumbar pegada al suelo."]]],["Core","Crunch en polea","Enrolla la columna, cadera quieta.",3,12,15,2.5,60,false,[["Crunch en máquina","Pausa abajo."],["Crunch con peso en el suelo","Sube solo los hombros."]]],["Core","Pallof press","Resiste el giro, brazos al frente. Reps por lado.",3,10,12,1,60,false,[["Pallof press con banda","Resiste el giro."],["Plancha lateral con peso","Cadera alta."]]],["Core","Leñador en polea","Gira desde el tronco, brazos estirados. Reps por lado.",3,10,12,1,60,false,[["Leñador con mancuerna","Gira desde el tronco."],["Russian twist con disco","Pies en el suelo."]]],["Core","Plancha","Codos bajo los hombros, cuerpo en bloque, glúteos apretados. ⏱ Por tiempo.",3,30,60,2.5,60,true,[["Plancha con toque de hombros","Sin girar la cadera."],["Plancha de rodillas","Más suave."]],null,"t"],["Core","Plancha lateral","Codo bajo el hombro, cadera alta. Segundos por lado. ⏱ Por tiempo.",3,20,45,2.5,60,true,[["Plancha lateral de rodillas","Más suave."],["Pallof press","Resiste el giro."]],null,"t"],["Core","Dead bug","Zona lumbar pegada al suelo, brazo y pierna contrarios. Reps por lado.",3,8,12,1,45,true,[["Bird dog","Espalda quieta."],["Elevación de piernas tumbado","Lumbar pegada."]]],["Core","Bird dog","A cuatro patas, brazo y pierna contrarios sin mover la espalda. Reps por lado.",3,8,12,1,45,true,[["Dead bug","Lumbar pegada."],["Plancha","Cuerpo en bloque."]]],["Core","Crunch abdominal","Sube solo los hombros, sin tirar del cuello.",3,15,20,1,45,true,[["Crunch en polea","Enrolla la columna."],["Elevación de piernas tumbado","Lumbar pegada."]]],["Core","Elevación de piernas tumbado","Zona lumbar pegada al suelo, baja lento.",3,10,15,1,45,true,[["Elevación de piernas colgado","Sin balanceo."],["Crunch abdominal","Sube los hombros."]]],["Core","Russian twist","Sentado, pies en el suelo o elevados, gira el tronco. Reps por lado.",3,12,20,1,45,false,[["Leñador en polea","Gira desde el tronco."],["Pallof press","Resiste el giro."]]],["Core","Paseo del granjero","Una mancuerna o kettlebell pesada en cada mano, camina erguido. ⏱ Por tiempo.",3,30,45,2,90,false,[["Paseo con una mano","Sin inclinarte."],["Encogimientos con mancuernas","Pausa arriba."]],null,"t"],["Kettlebell","Kettlebell swing","Bisagra de cadera, potencia con glúteos.",4,15,20,2,60,false,[["Swing a una mano","Cambia de mano a mitad."],["Peso muerto con kettlebell","Cadera atrás."]]],["Kettlebell","Clean & press con kettlebell","Carga limpia al pecho y press estricto. Reps por brazo.",3,8,12,2,90,false,[["Press de hombro con kettlebell","Sin impulso."],["Push press con kettlebell","Pequeño impulso de piernas."]]],["Kettlebell","Snatch con kettlebell","De la cadera a arriba en un solo gesto. Reps por brazo.",3,8,12,2,90,false,[["Swing a una mano","Cambia de mano a mitad."],["Clean & press con kettlebell","Reps por brazo."]]],["Kettlebell","Turkish get-up","Lento y controlado, la vista en la kettlebell. Reps por lado.",3,3,5,2,90,false,[["Media turkish get-up","Hasta sentado."],["Press en suelo con kettlebell","Una mano."]]],["Kettlebell","Gorilla row","Apoyo firme, tira de los codos sin rotar el tronco.",3,10,12,2,90,false,[["Remo a una mano con kettlebell","Codo a la cadera."],["Remo renegado","En plancha."]]],["Kettlebell","Goblet squat con kettlebell","Codos por dentro de las rodillas.",4,10,15,2,90,false,[["Sentadilla con kettlebell en rack","Kettlebell en el antebrazo."],["Zancadas con kettlebell en rack","Rodilla trasera rozando el suelo."]]],["Kettlebell","Swing a una mano","Bisagra de cadera, cambia de mano a mitad.",3,10,15,2,60,false,[["Kettlebell swing","Potencia con glúteos."],["Snatch con kettlebell","Reps por brazo."]]],["Kettlebell","Sentadilla en rack con kettlebell","Kettlebell apoyada en el antebrazo, codo pegado.",3,8,12,2,90,false,[["Goblet squat con kettlebell","Codos dentro."],["Sentadilla goblet","Mancuerna al pecho."]]],["Kettlebell","Peso muerto con kettlebell","Kettlebell entre los pies, cadera atrás.",3,10,15,2,90,false,[["Kettlebell swing","Bisagra de cadera."],["Peso muerto rumano con mancuernas","Cadera atrás."]]],["Kettlebell","Press de hombro con kettlebell","Desde el rack, sin impulso. Reps por brazo.",3,6,10,2,90,false,[["Clean & press con kettlebell","Reps por brazo."],["Press de hombro sentado con mancuernas","Rango completo."]]],["Kettlebell","Halo con kettlebell","Rodea la cabeza con la kettlebell, core firme. Reps por lado.",3,8,10,2,45,false,[["Turkish get-up","Lento."],["Pallof press","Resiste el giro."]]],["Peso corporal","Flexiones diamante","Codos pegados al cuerpo. 0 kg = peso corporal.",3,8,15,2,60,true,[["Flexiones cerradas","Manos a la anchura de los hombros."],["Fondos en banco","Hombros abajo."]]],["Peso corporal","Burpees","Ritmo constante, pecho al suelo.",3,10,15,1,60,true,[["Burpees sin salto","Más suave para las rodillas."],["Sentadilla con salto","Aterriza suave."]]],["Peso corporal","Sentadilla con salto","Aterriza suave, rodillas hacia fuera.",3,10,15,1,60,true,[["Sentadilla al aire","Ritmo constante."],["Zancadas con salto","Alterna piernas."]]],["Peso corporal","Escaladores","Rodillas al pecho, cadera baja. Reps por pierna.",3,15,30,1,45,true,[["Escaladores cruzados","Rodilla al codo contrario."],["Plancha con toque de hombros","Sin girar la cadera."]]],["Peso corporal","Flexiones pike","Cadera alta en V, baja la cabeza hacia el suelo. 0 kg = peso corporal.",3,6,12,2,60,true,[["Press de hombro con mancuernas","Rango completo."],["Flexiones declinadas","Pies elevados."]]],["Peso corporal","Zancadas con salto","Alterna piernas en el aire, aterriza suave. Reps por pierna.",3,8,12,1,60,true,[["Zancadas inversas","Paso atrás."],["Sentadilla con salto","Aterriza suave."]]],["Peso corporal","Sentadilla búlgara sin peso","Pie trasero en una silla o banco. Reps por pierna.",3,10,15,2,60,true,[["Sentadilla búlgara","Con mancuernas."],["Zancadas inversas","Paso atrás."]]],["Peso corporal","Superman","Tumbado boca abajo, sube brazos y piernas y aguanta 2 s.",3,10,15,1,45,true,[["Hiperextensiones","Sin pasarte."],["Bird dog","Espalda quieta."]]],["Peso corporal","Jumping jacks","Ritmo constante, brazos arriba.",3,20,40,1,30,true,[["Burpees","Ritmo constante."],["Escaladores","Cadera baja."]]],["Bandas elásticas","Press de pecho con banda","Banda por la espalda o anclada detrás, empuja al frente.",3,12,20,1,60,false,[["Flexiones","Pecho al suelo."],["Press de banca con mancuernas","Bajada en 2 s."]]],["Bandas elásticas","Remo con banda","Banda anclada delante, codos atrás y aprieta escápulas.",3,12,20,1,60,false,[["Remo en polea baja","Codos atrás."],["Remo invertido en TRX","Cuerpo recto."]]],["Bandas elásticas","Jalón con banda","Banda anclada arriba, tira de los codos hacia abajo.",3,12,20,1,60,false,[["Jalón al pecho en polea","Codos hacia abajo."],["Dominadas asistidas","Con banda."]]],["Bandas elásticas","Face pull con banda","Banda a la altura de la cara, codos altos y abre al final.",3,15,20,1,45,false,[["Face pull","Codos altos."],["Pájaros con mancuernas","Torso inclinado."]]],["Bandas elásticas","Elevaciones laterales con banda","Pisa la banda, sube hasta la altura de los hombros.",3,12,20,1,45,false,[["Elevaciones laterales con mancuernas","Sin impulso."],["Elevaciones laterales en polea","Tensión constante."]]],["Bandas elásticas","Curl con banda","Pisa la banda, codos pegados.",3,12,20,1,45,false,[["Curl con mancuernas alterno","Supina al subir."],["Curl en polea","Tensión constante."]]],["Bandas elásticas","Sentadilla con banda","Banda bajo los pies y sobre los hombros, baja a la paralela.",3,12,20,1,60,false,[["Sentadilla goblet","Mancuerna al pecho."],["Sentadilla al aire","Ritmo constante."]]]];
const EX_LIB_GROUPS = ['Pecho', 'Espalda', 'Hombro', 'Bíceps', 'Tríceps', 'Pierna', 'Femoral y glúteo', 'Gemelos', 'Core', 'Kettlebell', 'Peso corporal', 'Bandas elásticas'];
const EX_LIB_ICON = { 'Pecho': '💪', 'Espalda': '🦅', 'Hombro': '🎯', 'Bíceps': '💪', 'Tríceps': '💪', 'Pierna': '🦵', 'Femoral y glúteo': '🍑', 'Gemelos': '🦵', 'Core': '🧱', 'Kettlebell': '🔔', 'Peso corporal': '🤸', 'Bandas elásticas': '🎗️' };
const normTxt = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function exLibraryModal() {
  const day = currentDay(); if (!day) return;
  const st = { q: '', g: '' };
  const has = n => day.exercises.some(e => e.variants.some(v => v.name.toLowerCase() === n.toLowerCase()));
  const list = () => { const q = normTxt(st.q), L = exLibAll().filter(x => (!st.g || x[0] === st.g) && (!q || normTxt(x[1] + ' ' + x[0] + ' ' + x[9].map(a => a[0]).join(' ')).includes(q))); return q ? [...L.filter(x => normTxt(x[1]).includes(q)), ...L.filter(x => !normTxt(x[1]).includes(q))] : L; };
  const rows = () => { const L = list(); return L.length ? L.map(x => { const i = exLibAll().indexOf(x), added = has(x[1]); return `<div class="flex items-center justify-between gap-2 bg-ink rounded-xl border border-line px-3 py-2">
      <div class="min-w-0"><div class="font-semibold text-[14px] truncate">${esc(x[1])}${x[10] && !access.me?.admin ? ' <span class="text-[10px] font-bold text-brand">NUEVO</span>' : ''}</div><div class="text-[11px] text-mute truncate">${EX_LIB_ICON[x[0]] || ''} ${esc(x[0])} · ${x[3]}×${x[4]}–${x[5]}${x[11] === 't' ? ' s ⏱' : ''}${x[8] ? ' · peso corporal' : ''} · +${x[9].length} alternativas</div></div>
      <button class="${added ? 'btn-mini text-emerald-300' : 'btn-mini text-brand'} shrink-0" data-mact="add" data-i="${i}" type="button">${added ? '✓ Añadido' : '＋ Añadir'}</button></div>`; }).join('') : '<p class="text-xs text-mute text-center py-4">No está entre los preparados. Créalo con «✏️ Crear uno nuevo».</p>'; };
  const html = () => `<h3 class="modal-title">＋ Añadir ejercicio</h3>
    <button class="btn-ghost w-full" data-mact="create" type="button">✏️ Crear uno nuevo</button>
    <p class="text-xs text-mute">O elige uno preparado (con 2 alternativas ⇄). Se añaden a <b class="text-slate-300">${esc(day.label === prog().name ? day.label : day.label + ' · ' + prog().name)}</b>. Puedes añadir varios.</p>
    <input class="field" name="q" placeholder="Buscar: press, remo, glúteo, kettlebell…" value="${esc(st.q)}" autocomplete="off" />
    <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" data-noswipe>${['', ...EX_LIB_GROUPS].map(g => `<button class="chip ${st.g === g ? 'chip-on' : ''} shrink-0" data-mact="grp" data-g="${esc(g)}" type="button">${g ? (EX_LIB_ICON[g] || '') + ' ' + esc(g) : 'Todos'}</button>`).join('')}</div>
    <div class="space-y-1.5" id="exLibRows">${rows()}</div>`;
  openModal(html(), {
    grp: (root, b) => { st.g = b.dataset.g; root.querySelector('.modal-sheet').innerHTML = html(); bindQ(root); },
    create: () => { closeModal(); editExModal(null); },
    add: (root, b) => {
      const x = exLibAll()[+b.dataset.i]; if (!x) return;
      if (has(x[1])) return toast('Ya está en este día', 'warn');
      day.exercises.push(normalizeExercise({ id: uid('c_'), alts27: true, block: `${EX_LIB_ICON[x[0]] || '⚡'} ${x[0]}`, sets: x[3], minReps: x[4], maxReps: x[5], increment: x[6], rest: x[7], bw: !!x[8], timed: x[11] === 't', variants: [{ name: x[1], note: x[2] }, ...x[9].map(([name, note]) => ({ name, note }))] }));
      persist(); render(); root.querySelector('#exLibRows').innerHTML = rows(); toast(`Añadido: ${x[1]}`);
    }
  });
  const bindQ = root => { const q = root.querySelector('[name=q]'); if (q) q.oninput = () => { st.q = q.value; root.querySelector('#exLibRows').innerHTML = rows(); }; };
  bindQ($('#modalRoot'));
  fetchRemoteEx().then(() => { const r = $('#exLibRows'); if (r) r.innerHTML = rows(); });
}

/* Biblioteca: bloques recomendados (preparados por Esteban) que cada usuario puede añadir a los suyos */
const KB_DAYS = [{
  id: 'kb_day', label: 'KB', rotation: false,
  title: 'Kettlebell · potencia y quema-grasa',
  subtitle: 'Kettlebell ajustable (hasta 18 kg) y fija (24 kg)',
  exercises: [
    mkEx('kb_swing', '💥 Potencia y cadena posterior', 4, 15, 20, 2, 60, [['Kettlebell swing explosivo', 'Bisagra de cadera pura: la potencia sale de los glúteos.'], ['Swing a una mano', 'Cambia de mano a mitad de serie.'], ['Peso muerto con kettlebell', 'Cadera atrás, espalda neutra.']]),
    mkEx('kb_goblet', '🦵 Cuádriceps y core', 4, 10, 15, 2, 90, [['Goblet squat profundo', 'Codos por dentro de las rodillas, espalda recta.'], ['Sentadilla con kettlebell en rack', 'Kettlebell apoyada en el antebrazo.'], ['Sentadilla búlgara con kettlebell', 'Reps por pierna.']]),
    mkEx('kb_clean', '💪 Hombro y estabilidad unilateral', 3, 8, 12, 2, 90, [['Clean & press unilateral', 'Carga limpia al pecho y press estricto arriba. Reps por brazo.'], ['Press de hombro con kettlebell', 'Sin impulso de piernas.'], ['Push press con kettlebell', 'Pequeño impulso de piernas.']]),
    mkEx('kb_lunge', '🎯 Pierna unilateral y glúteo', 3, 10, 12, 2, 90, [['Zancadas con kettlebell en rack', 'Rodilla trasera rozando el suelo.'], ['Zancadas inversas con kettlebell', 'Paso atrás controlado.'], ['Step-up con kettlebell', 'Sube empujando con el talón.']]),
    mkEx('kb_row', '🦅 Espalda y grosor', 3, 10, 12, 2, 90, [['Gorilla row (remo alterno)', 'Apoyo firme, tira de los codos sin rotar el tronco.'], ['Remo a una mano con kettlebell', 'Codo hacia la cadera.'], ['Remo renegado', 'En plancha, sin girar la cadera.']])
  ]
}];
const LIB_BLOCKS = [
  { lib: 'kb', name: 'KETTLEBELL', icon: '🔔', desc: 'Potencia y quema-grasa con kettlebell: swing, goblet, clean & press, zancadas y remo. Ideal en casa.', days: () => KB_DAYS },
  { lib: 'ppt', name: 'PPT', icon: '', desc: 'Push / Pull / Torso en 3 días, con «peaje» de pierna al inicio de cada sesión.', days: () => PPT_DAYS },
  { lib: 'fullbody', name: 'FULL BODY', icon: '', desc: 'Cuerpo completo en 2 días alternos (A y B): básicos pesados y accesorios.', days: () => FULLBODY_DAYS }
];
/* Bloques que Esteban publica desde su app (bloques.json del repositorio). Se leen al abrir la biblioteca. */
const LIB_FILE = 'bloques.json', LIB_CACHE = 'fitnesteban_lib';
let remoteLib = (() => { try { return JSON.parse(localStorage.getItem(LIB_CACHE) || '[]'); } catch { return []; } })();
async function fetchRemoteLib() {
  try {
    const r = await fetch(LIB_FILE + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const list = await r.json();
    if (Array.isArray(list)) { remoteLib = list.filter(x => x && x.lib && x.name && Array.isArray(x.days)); try { localStorage.setItem(LIB_CACHE, JSON.stringify(remoteLib)); } catch { /* nada */ } }
  } catch { /* sin conexión o aún no hay bloques publicados: se usa lo guardado */ }
  return remoteLib;
}
// Un bloque compartido por Esteban sustituye al preparado de fábrica con el mismo nombre (base = id del de fábrica).
const libKey = n => String(n || '').trim().toLowerCase();
const libAll = () => [
  ...remoteLib.map(x => ({ ...x, pub: true, base: LIB_BLOCKS.find(b => libKey(b.name) === libKey(x.name))?.lib, days: () => x.days })),
  ...LIB_BLOCKS.filter(b => !remoteLib.some(x => libKey(x.name) === libKey(b.name)))
];
const libHave = L => state.plan.programs.some(p => p.lib === L.lib || p.pubId === L.lib || (L.base && p.lib === L.base));
const libIsNew = L => L.pub && !access.me?.admin && (!L.at || L.at >= addDays(todayISO(), -30));
/* Publicar (solo administrador, con GitHub conectado): copia limpia del bloque, sin ids */
function blockForLib(p) {
  return p.days.map(d => ({ label: d.label, rotation: d.rotation, title: d.title, subtitle: d.subtitle,
    exercises: d.exercises.map(e => ({ id: e.id, block: e.block, sets: e.sets, minReps: e.minReps, maxReps: e.maxReps, increment: e.increment, rest: e.rest, bw: e.bw, ...(e.timed ? { timed: true } : {}), alts27: true, variants: e.variants.map(v => ({ name: v.name, note: v.note || '' })) })) }));
}
async function ghEditJson(pin, file, fn, message) {
  const token = await ghToken(pin);
  const cur = await ghApi(token, 'GET', null, file);
  let list = []; try { list = JSON.parse(b64utf8(cur.content || '') || '[]'); } catch { list = []; }
  const next = fn(Array.isArray(list) ? list : []);
  await ghApi(token, 'PUT', { message, content: utf8b64(JSON.stringify(next, null, 1) + '\n'), ...(cur.sha ? { sha: cur.sha } : {}) }, file);
  return next;
}
async function ghEditLib(pin, fn, message) {
  const next = await ghEditJson(pin, LIB_FILE, fn, message);
  remoteLib = next; try { localStorage.setItem(LIB_CACHE, JSON.stringify(next)); } catch { /* nada */ }
}
/* Ejercicios sueltos publicados por Esteban (ejercicios.json). Mismo formato que EX_LIB + id de publicación al final */
const EXLIB_FILE = 'ejercicios.json', EXLIB_CACHE = 'fitnesteban_exlib';
let remoteEx = (() => { try { return JSON.parse(localStorage.getItem(EXLIB_CACHE) || '[]'); } catch { return []; } })();
async function fetchRemoteEx() {
  try {
    const r = await fetch(EXLIB_FILE + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const list = await r.json();
    if (Array.isArray(list)) { remoteEx = list.filter(x => Array.isArray(x) && x[1] && x[10]); try { localStorage.setItem(EXLIB_CACHE, JSON.stringify(remoteEx)); } catch { /* nada */ } }
  } catch { /* sin conexión o aún no hay ejercicios publicados */ }
  return remoteEx;
}
const exLibAll = () => [...remoteEx, ...EX_LIB.filter(x => !remoteEx.some(r => r[1].toLowerCase() === x[1].toLowerCase()))];
function publishExModal(exId) {
  const f = findEx(exId); if (!f) return;
  const e = f.ex, pubId = e.pubId || ('ex_' + uid('').slice(0, 10)), existing = remoteEx.find(x => x[10] === pubId);
  let g = existing?.[0] || (/kettlebell/i.test(e.variants[0].name) ? 'Kettlebell' : e.bw ? 'Peso corporal' : 'Pecho');
  const html = () => `<h3 class="modal-title">📤 Compartir «${esc(e.variants[0].name)}»</h3>
    <p class="text-xs text-mute">Aparecerá en «＋ Añadir ejercicio» de todos, con sus series (${e.sets}×${e.minReps}–${e.maxReps}${e.timed ? ' s' : ''}), descanso, nota y alternativas (${e.variants.length - 1}). Si lo cambias después, vuelve a publicarlo.</p>
    <div><div class="lbl mb-1">Grupo</div><div class="flex flex-wrap gap-1.5">${EX_LIB_GROUPS.map(x => `<button class="chip ${g === x ? 'chip-on' : ''}" data-mact="grp" data-g="${esc(x)}" type="button">${EX_LIB_ICON[x] || ''} ${esc(x)}</button>`).join('')}</div></div>
    <button class="btn-primary w-full" data-mact="go" type="button">${existing ? 'Actualizar' : 'Compartir'}</button>
    ${existing ? '<button class="btn-danger w-full" data-mact="remove" type="button">Dejar de compartir</button>' : ''}`;
  openModal(html(), {
    grp: (root, b) => { g = b.dataset.g; root.querySelector('.modal-sheet').innerHTML = html(); },
    go: () => askPin({ title: '📤 Compartir ejercicio', text: 'Tu PIN abre la llave de GitHub para compartirlo.', onPin: async pin => {
      const v0 = e.variants[0], item = [g, v0.name, v0.note || '', e.sets, e.minReps, e.maxReps, e.increment, e.rest, !!e.bw, e.variants.slice(1, 4).map(v => [v.name, v.note || '']), pubId, e.timed ? 't' : ''];
      remoteEx = await ghEditJson(pin, EXLIB_FILE, list => [item, ...list.filter(x => x[10] !== pubId)], `Biblioteca de ejercicios: ${existing ? 'actualiza' : 'publica'} ${v0.name}`);
      try { localStorage.setItem(EXLIB_CACHE, JSON.stringify(remoteEx)); } catch { /* nada */ }
      e.pubId = pubId; persist(); closeModal(); render(); toast(`«${v0.name}» compartido con todos ✓`);
    } }),
    remove: () => askPin({ title: 'Dejar de compartir', text: 'Dejará de aparecer para los demás. Quien ya lo añadió lo conserva.', onPin: async pin => {
      remoteEx = await ghEditJson(pin, EXLIB_FILE, list => list.filter(x => x[10] !== pubId), `Biblioteca de ejercicios: retira ${e.variants[0].name}`);
      try { localStorage.setItem(EXLIB_CACHE, JSON.stringify(remoteEx)); } catch { /* nada */ }
      delete e.pubId; persist(); closeModal(); render(); toast('Ya no se comparte');
    } })
  });
}
function publishBlockModal(progId) {
  const p = state.plan.programs.find(x => x.id === progId); if (!p) return;
  const pubId = p.pubId || ('pub_' + uid('').slice(0, 10));
  const existing = remoteLib.find(x => x.lib === pubId);
  openModal(`<h3 class="modal-title">📤 Compartir «${esc(p.name)}» con todos</h3>
    <p class="text-xs text-mute">Aparecerá en «＋ Añadir bloque» de todos los usuarios. Se comparte una copia: si después cambias tu bloque, vuelve aquí para actualizarla.</p>
    <label class="lbl">Descripción (una o dos frases)<textarea class="field mt-1" name="desc" rows="3" maxlength="200" placeholder="Ej: Circuito de 30 min con mancuernas para días con poco tiempo.">${esc(existing?.desc || '')}</textarea></label>
    <button class="btn-primary w-full" data-mact="go" type="button">${existing ? 'Actualizar' : 'Compartir'}</button>
    ${existing ? '<button class="btn-danger w-full" data-mact="remove" type="button">Dejar de compartir</button>' : ''}`, {
    go: root => {
      const desc = mval(root, 'desc').trim(); if (!desc) return toast('Escribe una descripción', 'warn');
      askPin({ title: '📤 Compartir bloque', text: 'Tu PIN abre la llave de GitHub para compartirlo.', onPin: async pin => {
        const item = { lib: pubId, name: p.name, icon: p.icon || '', desc, author: 'Esteban', at: todayISO(), days: blockForLib(p) };
        await ghEditLib(pin, list => [item, ...list.filter(x => x.lib !== pubId)], `Biblioteca: ${existing ? 'actualiza' : 'publica'} ${p.name}`);
        p.pubId = pubId; p.lib = pubId; persist(); closeModal(); render(); toast(`«${p.name}» compartido con todos ✓`);
      } });
    },
    remove: () => askPin({ title: 'Dejar de compartir', text: `«${esc(p.name)}» dejará de aparecer para los demás. Quien ya lo añadió lo conserva.`, onPin: async pin => {
      await ghEditLib(pin, list => list.filter(x => x.lib !== pubId), `Biblioteca: retira ${p.name}`);
      delete p.pubId; persist(); closeModal(); render(); toast('Ya no se comparte');
    } })
  });
}
function addLibBlock(lib) {
  const L = libAll().find(x => x.lib === lib); if (!L) return;
  const days = clone(L.days()).map(d => {
    const nd = normalizeDay(d); nd.id = uid('d_');
    nd.exercises = nd.exercises.map(e => ({ ...e, id: uid('c_'), alts27: true }));
    return nd;
  });
  const np = { id: uid('p_'), name: L.name, icon: L.icon, lib: L.lib, type: 'strength', days };
  state.plan.programs.push(np); state.plan.active = np.id; ui.dayId = days[0].id;
  persist(); closeModal(); ui.view = 'train'; render(); window.scrollTo({ top: 0 });
  toast(`Bloque ${L.name} añadido ✓`);
}
function libraryModal() {
  const html = () => `<h3 class="modal-title">＋ Añadir bloque</h3>
    <button class="btn-ghost w-full" data-mact="empty" type="button">✏️ Crear un bloque vacío</button>
    <div class="text-[11px] font-bold uppercase tracking-wider text-mute pt-1">O elige uno preparado por Esteban</div>
    <div class="space-y-2">${libAll().sort((a, b) => libHave(a) - libHave(b)).map(L => {
      const days = L.days(), nEx = days.reduce((a, d) => a + d.exercises.length, 0), have = libHave(L), open = ui.libOpen === L.lib;
      return `<div class="card p-3 space-y-2">
        <div class="flex items-start justify-between gap-2"><div class="min-w-0"><div class="font-extrabold">${L.icon ? L.icon + ' ' : ''}${esc(L.name)}${libIsNew(L) && !have ? ' <span class="text-[10px] font-bold text-brand align-middle">NUEVO</span>' : ''}</div><div class="text-[11px] text-mute">${days.length} ${days.length === 1 ? 'día' : 'días'} · ${nEx} ejercicios${L.pub && access.me?.admin ? ' · <span class="text-brand">compartido por ti</span>' : ''}</div></div>
          <button class="btn-mini text-brand shrink-0" data-mact="see" data-lib="${L.lib}" type="button">${open ? 'Ocultar' : 'Ver'}</button></div>
        <p class="text-[12px] text-slate-300 leading-snug">${esc(L.desc)}</p>
        ${open ? days.map(d => `<div class="text-[12px]"><div class="text-brand font-bold">${esc(d.label)} · ${esc(d.title)}</div><ul class="text-mute list-disc pl-5">${d.exercises.map(e => `<li>${esc(e.variants[0].name)} <span class="opacity-70">${e.sets}×${e.minReps}–${e.maxReps}</span></li>`).join('')}</ul></div>`).join('') : ''}
        ${have ? '<div class="w-full text-center text-[13px] font-bold text-emerald-300 py-2 rounded-xl" style="background:rgba(16,185,129,.08)">✓ Ya lo tienes</div>' : `<button class="btn-primary w-full" data-mact="add" data-lib="${L.lib}" type="button">＋ Añadir</button>`}</div>`;
    }).join('')}</div>
    <p class="text-[11px] text-mute">Al añadir uno se copia a tus bloques y lo puedes cambiar como quieras.</p>`;
  fetchRemoteLib().then(() => { const sh = $('#modalRoot .modal-sheet'); if (sh && sh.querySelector('[data-mact=empty]')) sh.innerHTML = html(); });
  openModal(html(), {
    see: (root, b) => { ui.libOpen = ui.libOpen === b.dataset.lib ? null : b.dataset.lib; root.querySelector('.modal-sheet').innerHTML = html(); },
    add: (root, b) => addLibBlock(b.dataset.lib),
    empty: () => { closeModal(); editProgModal(null); }
  });
}

/* 4.31: quien instala la app desde cero empieza sin bloques de fuerza y los elige en «📚 Bloques recomendados».
   Quien ya tiene sus bloques guardados los conserva tal cual. */
const DEFAULT_PLAN = {
  active: 'retos',
  programs: [
    { id: 'retos', name: 'RETOS', icon: '🏆', type: 'retos', days: [] },
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
  return { version: 4, plan: normalizePlan(clone(DEFAULT_PLAN)), selectedVariants: {}, memory: {}, sessions: [], bodyMetrics: [], meals: {}, cardio: [], reports: [], deload: null, deloadSnooze: '', settings: defaultSettings(), drafts: {}, chat: null, chats: [], retos: {}, accessNames: {}, accessCodes: {}, habitLog: {}, habitCount: {} };
}
const safeUrl = u => { const t = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(t) ? t : ''; };
const videoUrl = v => v.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(v.name + ' técnica correcta')}`;

const BW_DEFAULT = new Set(['d2_pullup', 'd3_ss1_pull', 'd3_ss2_push', 'fb_pullup']);
function normalizeExercise(e) {
  const out = {
    id: e.id || uid('c_'), block: e.block || 'Ejercicio',
    sets: clamp(parseInt(e.sets, 10) || 3, 1, 10),
    minReps: clamp(parseInt(e.minReps, 10) || 8, 1, e.timed ? 600 : 100),
    maxReps: clamp(parseInt(e.maxReps, 10) || 12, 1, e.timed ? 600 : 100),
    increment: num(e.increment) ?? 2,
    rest: clamp(parseInt(e.rest, 10) || 90, 10, 600),
    bw: typeof e.bw === 'boolean' ? e.bw : BW_DEFAULT.has(e.id),
    variants: Array.isArray(e.variants) && e.variants.length ? e.variants.map(v => ({ name: String(v.name || 'Ejercicio'), note: String(v.note || ''), video: safeUrl(v.video) })) : [{ name: 'Ejercicio', note: '', video: '' }]
  };
  if (out.maxReps < out.minReps) out.maxReps = out.minReps;
  out.alts27 = true;
  if (e.timed) out.timed = true;
  if (e.pubId) out.pubId = String(e.pubId);
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
    programs = [{ id: 'ppt', name: 'PPT', days: plan.days }, { id: 'fullbody', name: 'FULL BODY', days: clone(FULLBODY_DAYS) }, ...clone(DEFAULT_PLAN.programs.filter(p => p.id !== 'free'))];
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
    id: p.id || uid('p_'), name: String(p.name || 'BLOQUE').slice(0, 16), icon: p.icon || '', lib: p.lib || (p.id === 'ppt' ? 'ppt' : p.id === 'fullbody' ? 'fullbody' : ''), ...(p.pubId ? { pubId: p.pubId } : {}),
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
  out.settings.habitList = out.settings.habitList.filter(h => h && h.name).map(h => ({ name: String(h.name).slice(0, 60), where: h.where === 'daily' ? 'daily' : 'train', days: Array.isArray(h.days) && h.days.length ? h.days.filter(d => d >= 0 && d <= 6) : [...ALL_DAYS], target: clamp(parseInt(h.target, 10) || 1, 1, 20), unit: String(h.unit || '').slice(0, 12) }));
  out.settings.habits = out.settings.habitList.filter(h => h.where === 'train').map(h => h.name);
  if (!out.habitLog || typeof out.habitLog !== 'object' || Array.isArray(out.habitLog)) out.habitLog = {};
  if (!out.habitCount || typeof out.habitCount !== 'object' || Array.isArray(out.habitCount)) out.habitCount = {};
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
  return hashStr(JSON.stringify([state.plan, state.sessions, state.meals, state.cardio, state.bodyMetrics, retos, state.reports, state.selectedVariants, state.habitLog, state.habitCount]));
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
/* 4.31: quien nunca usó ni editó los bloques de serie (PPT / FULL BODY) los pierde y elige en la biblioteca.
   Se conservan si hay alguna sesión o borrador en ellos o si se modificó cualquier cosa (días, ejercicios, series, reps…). */
function untouchedDefault(p) {
  const base = p.id === 'ppt' ? PPT_DAYS : p.id === 'fullbody' ? FULLBODY_DAYS : null;
  if (!base || p.type !== 'strength') return false;
  const ids = new Set(p.days.map(d => d.id));
  if (state.sessions.some(x => ids.has(x.dayId)) || p.days.some(d => state.drafts[d.id])) return false;
  const sig = days => JSON.stringify(days.map(d => [d.id, d.label, d.title, d.exercises.map(e => [e.id, e.block, e.sets, e.minReps, e.maxReps, e.increment, e.rest, e.variants[0]?.name])]));
  return sig(p.days) === sig(base.map(normalizeDay));
}
if (!state.settings.planClean431) {
  state.settings.planClean431 = true;
  const before = state.plan.programs.length;
  state.plan.programs = state.plan.programs.filter(p => !untouchedDefault(p));
  if (state.plan.programs.length !== before) {
    if (!state.plan.programs.some(p => p.id === state.plan.active)) state.plan.active = 'retos';
    for (const k of Object.keys(state.selectedVariants)) if (!allDays().some(d => d.exercises.some(e => e.id === k))) delete state.selectedVariants[k];
  }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* nada */ }
}
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
['input', 'change'].forEach(ev => $('#modalRoot').addEventListener(ev, e => { if (e.target.name === 'birth') { const sp = e.target.closest('label')?.querySelector('#pfAge,#obAge'); if (sp) sp.textContent = birthHint(e.target.value); } }));
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
/* ⏱ Ejercicios por tiempo: las «reps» son segundos */
const isTimedEx = x => !!(x && (x.timed || (x.exId && findEx(x.exId)?.ex.timed)));
const setStr = (x, bw, timed) => timed ? `${x.w > 0 || !bw ? wLabel(x.w, bw) + '·' : ''}${x.r}s` : `${wLabel(x.w, bw)}×${x.r}`;
const secTxt = sec => sec >= 60 ? `${Math.floor(sec / 60)}:${pad(sec % 60)}` : `${sec} s`;
/* «PC», «PC + 5» o «24» según el ejercicio */
const wLabel = (w, bw) => (bw ? (w > 0 ? `PC+${fmtNum(w)}` : 'PC') : fmtNum(w || 0));
/* 1RM estimado: en ejercicios de peso corporal suma tu peso registrado al lastre */
function oneRM(e, x, date) {
  if (isTimedEx(e)) return 0;
  if (isBwEx(e.exId)) { const b = bodyweightAt(date); return b ? e1rm(b + (x.w || 0), x.r) : 0; }
  return e1rm(x.w, x.r);
}

const timedTxt = x => String(x || '').replace(/\+1 rep por serie/g, '+5 s por serie').replace(/\breps limpias\b/g, 'series limpias').replace(/Tope de reps/g, 'Tope de tiempo').replace(/sin sumar reps/g, 'sin sumar segundos').replace(/(\d+)(–\d+)? reps?\b/g, '$1$2 s').replace(/\breps\b/g, 's').replace(/llegues a (\d+) en/g, 'llegues a $1 s en');
function coach(e, exKey) {
  const c = coachCore(e, exKey);
  if (!e.timed) return c;
  if (c.tone === 'new') return { ...c, text: e.bw ? `Aguanta ${e.minReps}–${e.maxReps} s con buena técnica. Pulsa ⏱ en cada serie y te cronometro. Desde la próxima te digo cuánto aguantar.` : `Busca un peso con el que aguantes ${e.minReps}–${e.maxReps} s. Pulsa ⏱ en cada serie y te cronometro. Desde la próxima te digo qué peso poner.` };
  return { ...c, title: timedTxt(c.title), text: timedTxt(c.text) };
}
function coachCore(e, exKey) {
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
  const lastStr = valid.map(s => setStr(s, e.bw, e.timed)).join(' · ');
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
  const targets = Array.from({ length: n }, (_, i) => (work[i] ? Math.min(max, work[i].r + (e.timed ? 5 : 1)) : min));
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

function bestSecs(exKey, sessions = state.sessions) {
  let best = 0;
  for (const s of sessions) for (const e of s.exercises) if (e.exKey === exKey) for (const x of e.sets) best = Math.max(best, x.r || 0);
  return best;
}
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
/* Comentarios al Coach por ejercicio */
const NOTE_TAGS = { pain: '😣 Molestia', hard: '🥵 Muy duro', easy: '😌 Fácil', time: '⏱ Poco tiempo' };
const noteTxt = n => [...(n.tags || []).map(t => NOTE_TAGS[t]).filter(Boolean), n.text ? `«${n.text}»` : ''].filter(Boolean).join(' · ');
/* Comentario de la última sesión en la que apareció el ejercicio (si lo hubo) */
function lastExNote(exId) {
  const ss = sortedSessions();
  for (let i = ss.length - 1; i >= 0; i--) {
    const s = ss[i], n = (s.notes || []).find(x => x.exId === exId);
    if (n) return { ...n, date: s.date };
    if (s.exercises.some(x => x.exId === exId)) return null; // la última vez lo hizo sin comentar
  }
  return null;
}
function coachFor(e, key) {
  let c = coach(e, key);
  const n = lastExNote(e.id);
  if (c.tone === 'up' && n && (n.tags || []).some(t => t === 'pain' || t === 'hard')) {
    const w = Math.max(0, r2((c.weight || 0) - e.increment));
    const wTxt = e.bw ? (w ? `PC + ${fmtKg(w)}` : 'tu peso') : fmtKg(w);
    c = { ...c, tone: 'hold', title: `Mantén ${wTxt}`, text: `Llegaste a las reps, pero la última vez anotaste ${(n.tags || []).filter(t => t === 'pain' || t === 'hard').map(t => NOTE_TAGS[t]).join(' y ')}. Hoy no subimos: repite ${wTxt} y comprueba sensaciones.`, weight: w };
  }
  c = deloadActive() ? deloadCoach(c, e, key) : c;
  return e.timed ? { ...c, title: timedTxt(c.title), text: timedTxt(c.text) } : c;
}
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
  const progRow = state.plan.programs.map(p => `<button class="prog ${p.id === prog().id ? 'prog-on' : ''}" data-act="pickProg" data-prog="${esc(p.id)}" type="button">${progLabel(p)}</button>`).join('');
  return `<div class="flex items-center gap-2 -mx-4 px-4 mb-2.5">
    <div class="chips-row flex-1 relative" id="progRow">${progRow}</div>
    <button class="iconbtn iconbtn-sm shrink-0 text-brand font-black" data-act="addProg" type="button" aria-label="Añadir bloque" title="Añadir bloque">＋</button>
    <button class="iconbtn iconbtn-sm shrink-0" data-act="editProg" type="button" aria-label="Editar bloque">✎</button>
  </div>${libCtaHTML()}`;
}
/* Sin bloques de fuerza propios: invitación grande a la biblioteca */
function libCtaHTML() {
  const hasOwn = state.plan.programs.some(p => p.type === 'strength' && p.id !== 'free' && p.days.some(d => d.exercises.length));
  if (hasOwn) return '';
  return `<button class="w-full card p-4 mb-3 text-left flex items-center gap-3" style="border-color:rgba(34,211,238,.45);background:linear-gradient(135deg,rgba(34,211,238,.10),rgba(34,211,238,.02))" data-act="addProg" type="button">
    <span class="text-3xl">🏋️</span>
    <span class="flex-1 min-w-0"><span class="block font-extrabold">Elige tu primer bloque de entreno</span><span class="block text-[12px] text-mute mt-0.5">Preparados por Esteban: Kettlebell, PPT, Full Body… O crea el tuyo.</span></span>
    <span class="text-brand font-black text-lg">›</span></button>`;
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

  <button class="btn-dashed w-full mt-3" data-act="exLibrary" type="button">＋ Añadir ejercicio</button>

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

function noteBoxHTML(e, d) {
  const nt = d.notes?.[e.id] || { tags: [], text: '' }, has = nt.tags.length || nt.text, open = !!ui.noteOpen?.[e.id];
  if (!open) return `<button class="w-full flex items-center justify-between gap-2 mt-2 rounded-xl border ${has ? 'border-amber-300/40' : 'border-line'} bg-ink px-3 py-2 text-[13px]" data-act="noteOpen" data-ex="${esc(e.id)}" type="button">
    <span class="font-semibold ${has ? 'text-amber-200' : 'text-slate-300'} truncate">💬 ${has ? esc(noteTxt(nt)) : 'Comenta al Coach'}</span><span class="text-mute text-[11px] shrink-0">${has ? 'editar' : 'opcional'} ▼</span></button>`;
  return `<div class="mt-2 rounded-xl border border-brand/40 bg-ink p-3 space-y-2">
    <button class="w-full flex items-center justify-between text-[13px]" data-act="noteOpen" data-ex="${esc(e.id)}" type="button"><span class="font-semibold text-brand">💬 Comenta al Coach</span><span class="text-mute text-[11px]">▲</span></button>
    <div class="flex flex-wrap gap-1.5">${Object.entries(NOTE_TAGS).map(([k, l]) => `<button class="rounded-full border px-2.5 py-1 text-[12px] font-semibold ${nt.tags.includes(k) ? 'border-amber-300/70 bg-amber-300/10 text-amber-200' : 'border-line bg-panel text-slate-300'}" data-act="noteTag" data-ex="${esc(e.id)}" data-t="${k}" type="button">${l}</button>`).join('')}</div>
    <input class="field text-[13px]" data-note-ex="${esc(e.id)}" maxlength="140" value="${esc(nt.text)}" placeholder="Ej: el hombro izquierdo tira en la bajada" />
    <p class="text-[10px] text-mute">Lo verá el Coach IA y te lo recordaré la próxima vez. Con 😣 o 🥵 no te subo peso.</p></div>`;
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
        <span class="text-mute text-xs">${e.timed ? '·' : '×'}</span>
        <div class="relative flex-1">
          <input class="field field-set text-brand" inputmode="numeric" autocomplete="off" data-in="r" data-key="${esc(key)}" data-i="${i}" value="${esc(r)}" placeholder="${esc(e.timed ? String(target).split('-')[0] : target)}" aria-label="${e.timed ? 'Segundos' : 'Repeticiones'} serie ${i + 1}" />
          <span class="unit">${e.timed ? 's' : 'reps'}</span>
        </div>
        ${e.timed ? `<button class="checkbtn swbtn" data-act="swSet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button" aria-label="Cronómetro serie ${i + 1}">⏱</button>` : ''}
        <button class="checkbtn" data-act="doneSet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button" aria-label="Serie hecha">✓</button>
      </div>`;
    if (i > 0 && !done) {
      const pw = num(cellValue(d, key, i - 1, 'w', c)), pr = num(cellValue(d, key, i - 1, 'r', c));
      const same = String(num(w) ?? '') === String(pw ?? '') && String(num(r) ?? '') === String(pr ?? '');
      if (pr > 0 && !same) rows += `<button class="copy-set" data-act="copySet" data-ex="${esc(e.id)}" data-key="${esc(key)}" data-i="${i}" type="button">↺ igual que S${i} (${e.timed ? setStr({ w: pw || 0, r: pr }, e.bw, true) : `${wLabel(pw || 0, e.bw)} × ${pr}`})</button>`;
    }
  }
  return `
  <article class="card p-4" id="ex-${esc(e.id)}">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[11px] font-bold uppercase tracking-wider text-brand">${esc(e.block)}</div>
        <h3 class="font-extrabold text-[17px] leading-snug mt-0.5">${esc(variant.name)}</h3>
        <div class="text-[11px] text-mute mt-1">${e.sets} × ${e.minReps}–${e.maxReps} ${e.timed ? 's ⏱' : 'reps'} · descanso ${e.rest}s · +${fmtNum(e.increment)} kg${e.bw ? ' de lastre · peso corporal' : ''}</div>
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
    ${(() => { const ln = lastExNote(e.id); return ln ? `<div class="mt-2 rounded-lg px-3 py-2 text-[12px]" style="background:rgba(252,211,77,.08);border:1px solid rgba(252,211,77,.3)"><b class="text-amber-200">📝 La última vez (${esc(fmtDateShort(ln.date))}):</b> <span class="text-slate-300">${esc(noteTxt(ln))}</span></div>` : ''; })()}
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
    ${noteBoxHTML(e, d)}
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
  if (ex.timed) {
    const sec = Math.round(num(cell.r) || 0), prevS = bestSecs(key, state.sessions.filter(s => !(s.date === todayISO() && s.dayId === day.id)));
    if (!(prevS > 0 && sec > prevS)) return;
    d.prBest = d.prBest || {};
    if (sec <= (d.prBest[key] || 0)) return;
    d.prBest[key] = sec;
    const nm = (ex.variants[parseInt(key.split('_v').pop(), 10)] || ex.variants[0]).name;
    toast(`🏆 ¡Récord personal! ${nm}: ${secTxt(sec)} (antes ${secTxt(prevS)})`, 'pr');
    try { navigator.vibrate?.([90, 60, 90, 60, 180]); } catch { /* nada */ }
    return;
  }
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
    if (sets.length) exs.push({ exId: e.id, exKey: key, name: variant.name, sets, ...(e.timed ? { timed: true } : {}) });
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
    if (x.timed) { const pS = bestSecs(x.exKey, others), nS = Math.max(...x.sets.map(st => st.r)); if (pS > 0 && nS > pS) prs.push(`${x.name}: ${secTxt(nS)} (antes ${secTxt(pS)})`); }
    for (const s of x.sets) { if (!x.timed) volume += s.w * s.r; nSets++; }
    state.memory[x.exKey] = { date: today, sets: x.sets };
  }
  const habits = state.settings.habits.filter(h => d.habits[h]);
  const session = { id: uid('s_'), date: today, endedAt: Date.now(), dayId: day.id, dayTitle: day.title, habits, exercises: exs };
  const skippedNames = day.exercises.filter(e => skipIds.includes(e.id)).map(e => variantOf(e).variant.name);
  if (skippedNames.length) session.skipped = skippedNames;
  const notes = day.exercises.map(e => { const nt = d.notes?.[e.id]; return nt && (nt.tags.length || nt.text.trim()) ? { exId: e.id, name: variantOf(e).variant.name, tags: nt.tags, text: nt.text.trim() } : null; }).filter(Boolean);
  if (notes.length) session.notes = notes;
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
    ${!isNew && p.type === 'strength' && p.id !== 'free' && access.me?.admin && lsGet(GH_KEY) ? `<button class="btn-ghost w-full mt-3" data-mact="share" type="button">${p.pubId ? '📢 Compartido con todos · actualizar o retirar' : '📤 Compartir con todos'}</button>` : ''}
    ${!isNew && p.type === 'strength' && state.plan.programs.length > 1 ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Eliminar este bloque</button><p class="text-[11px] text-mute mt-2">Eliminar un bloque no borra el historial de sesiones ya guardadas.</p>` : ''}
  `, {
    share: () => { closeModal(); publishBlockModal(progId); },
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
      <label class="lbl">${e.timed ? 'Seg. mín' : 'Reps mín'}<input class="field mt-1" name="minReps" inputmode="numeric" value="${e.minReps}" /></label>
      <label class="lbl">${e.timed ? 'Seg. máx' : 'Reps máx'}<input class="field mt-1" name="maxReps" inputmode="numeric" value="${e.maxReps}" /></label>
      <label class="lbl">Subida (kg)<input class="field mt-1" name="increment" inputmode="decimal" value="${fmtNum(e.increment)}" /></label>
      <label class="lbl col-span-2">Descanso (seg)<input class="field mt-1" name="rest" inputmode="numeric" value="${e.rest}" /></label>
    </div>
    <label class="habit"><input type="checkbox" name="bw" ${e.bw ? 'checked' : ''} /><span class="text-xs">Con peso corporal <span class="text-mute">(dominadas, fondos… el campo de peso pasa a ser el lastre; vacío = solo tu peso)</span></span></label>
    <label class="habit"><input type="checkbox" name="timed" ${e.timed ? 'checked' : ''} /><span class="text-xs">⏱ Por tiempo <span class="text-mute">(plancha, paseo del granjero… mín y máx pasan a ser segundos y cada serie lleva cronómetro)</span></span></label>
    <p class="text-[11px] text-mute">El coach sube el peso cuando haces las reps máximas en todas las series, y baja un 10 % si fallas el mínimo dos sesiones seguidas.</p>
    <div class="flex gap-2 mt-4">
      ${!isNew ? `<button class="btn-ghost" data-mact="up" type="button" aria-label="Subir">▲</button><button class="btn-ghost" data-mact="down" type="button" aria-label="Bajar">▼</button>` : ''}
      <button class="btn-primary flex-1" data-mact="save" type="button">Guardar</button>
    </div>
    ${!isNew ? `<button class="btn-danger w-full mt-3" data-mact="del" type="button">Quitar del día</button>` : ''}
    ${!isNew && access.me?.admin && lsGet(GH_KEY) ? `<button class="btn-ghost w-full mt-2" data-mact="publish" type="button">${e.pubId ? '📢 Compartido con todos · actualizar o retirar' : '📤 Compartir con todos'}</button>` : ''}
  `, {
    publish: () => { closeModal(); publishExModal(exId); },
    autofocus: isNew,
    save: root => {
      const variants = mval(root, 'variants').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const [name, ...rest] = l.split('|').map(x => x.trim());
        const video = rest.find(x => /^https?:\/\//i.test(x)) || '';
        return { name, note: rest.filter(x => x !== video).join(' | '), video: safeUrl(video.replace(/^http:/i, 'https:')) };
      });
      if (!variants.length) return toast('Escribe al menos el nombre del ejercicio', 'warn');
      const minReps = parseInt(mval(root, 'minReps'), 10), maxReps = parseInt(mval(root, 'maxReps'), 10);
      if (!(minReps > 0) || !(maxReps >= minReps)) return toast('Revisa el rango (mín ≤ máx)', 'warn');
      const data = normalizeExercise({
        id: isNew ? uid('c_') : e.id, alts27: true, pubId: isNew ? undefined : e.pubId, block: mval(root, 'block').trim() || 'Ejercicio', variants,
        sets: mval(root, 'sets'), minReps, maxReps, increment: num(mval(root, 'increment')) ?? 2, rest: mval(root, 'rest'), bw: root.querySelector('[name="bw"]').checked, timed: root.querySelector('[name="timed"]').checked
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
    const r = map.get(e.exKey) || { bw: isBwEx(e.exId), timed: isTimedEx(e), bestSec: 0, bestSecW: 0, bestSecDate: '', name: e.name, bestW: -1, bestWReps: 0, bestWDate: '', best1: 0, best1Date: '', bestReps: 0, bestRepsDate: '', lastPR: '' };
    r.name = e.name;
    for (const x of e.sets) {
      if (!(x.r > 0)) continue;
      if (r.timed) { if (x.r > r.bestSec) { r.bestSec = x.r; r.bestSecW = x.w || 0; r.bestSecDate = s.date; r.lastPR = s.date; } r.bestW = Math.max(r.bestW, 0); continue; }
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
        <div class="text-[11px] text-mute mt-0.5">${r.timed
          ? `⏱ Máx. <strong class="text-white">${secTxt(r.bestSec)}</strong>${r.bestSecW > 0 ? ` con ${r.bw ? 'PC + ' : ''}${fmtKg(r.bestSecW)}` : ''} (${fmtDateShort(r.bestSecDate)})`
          : r.bw
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
    comentarios_del_usuario: sess.flatMap(s => (s.notes || []).map(n => `${s.date} ${n.name}: ${noteTxt(n)}`)),
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
/* Dibujo del cuerpo: react-native-body-highlighter (MIT License, Copyright (c) 2022 ELABBASSI Hicham). Trazados reutilizados con los colores de FITNESTEBAN. */
const BODY_PATHS = {"front":[["chest",["M272.9 422.8c-18.9-17.1-22-57-12.6-78.7 5.5-12.9 26.5-24.3 39.9-25.8q20.3-2.2 37.0.75c9.7 1.7 16.1 15.6 18.4 25.0 3.9 16.4 3.2 31.3 1.6 48.0q-1.3 14.3-2.0 16.8c-6.5 23.5-38.0 29.2-58.2 24.5-9.1-2.1-17.2-4.3-24.1-10.6z","M416.0 435c-15.1.11-34.4-6.7-41.3-21.4q-1.8-3.9-2.8-12.1c-2.8-24.4-5.9-53.6 8.4-74.7 4.2-6.2 10.4-7.9 18.3-8.5q11.6-.92 23.3-.35c10.5.53 18.0 2.7 26.6 7.8 12.8 7.6 19.7 14.5 22.6 29.7 4.9 25.5.24 64.1-28.2 74.9q-12.2 4.6-26.9 4.7z"]],["obliques",["M438.7 444.3c-2.0-4.0-.13-6.8 3.6-8.8 10.2-5.3 16.7-11 24.2-18.0a1.7 1.7 0 012.8 1.1c.33 4.7-.81 14.3-5.5 17.2-4.6 2.8-18.7 10.0-24.3 9.1q-.57-.09-.83-.6z","M457.3 466.7c-3.7-1.0-13.2-10.2-16.5-14.4a.52.5 0 01.2-.81q10.9-3.7 21.3-9c3.9-2.0 6.3-5.9 8.5-9.5q.38-.59.5.09c.82 3.3 1.5 6.1.38 9.5-2.5 7.4-7.6 18.7-13.6 24.0a.96.9 0 01-.89.2z","M428.4 487.2c-1.0-1.7-.82-4.5-.71-6.7q.78-15.0.48-30.2-.01-.59.5-.4 1.7.59 3.0 1.6 11.5 9.3 18.8 16.9c3.8 4.0-16.2 17.4-19.5 19.4a1.8 1.8 59.6 01-2.6-.68z","M470.7 456.2a.25.2 0 01.4.13q2.0 19.6-9.8 35.2-.37.4-.6-.08c-1.3-3.2-5.8-16.1-3.5-18.9q6.3-7.4 13.4-16.3z","M452.2 478.5c1.1.49 4.2 12.4 4.7 14.3q.14.5-.23.8-1.2 1.3-2.6 2.4-10.4 8.1-21.7 14.9-1.4.9-2.9 1.3a.81.8 0 01-1.0-.71q-.73-8.6.67-17.1.08-.47.4-.8c1.7-1.6 21.9-15.7 22.3-15.5a.58.0 31 00.3.2z","M428.2 519.1q.11-.36.4-.56 15.3-9.6 28.8-21.6a.43.4-22.6 01.7.29c.51 8.2 2.2 18.6-4.4 25.4q-11.8 11.8-25.0 22.0-.43.3-.49-.2c-.75-6.8-1.9-18.9.01-25.3z","M456.5 524.5a.04.0 0 01.0.02q1.5 13.6.41 27.4-.04.4-.28.8c-4.9 8.3-18.2 19.6-27.8 22.6q-.57.1-.58-.43-.05-10.3-.27-20.5-.1-4.8 2.6-7.0c8.5-7.1 18.5-14.6 25.9-22.8z","M418.8 657.1q-1.1-1.6-.43-3.6 3.2-9.3 4.0-18.2 1.9-22.8 3.5-45.6c.16-2.3.72-6.4 2.8-7.7q14.9-9.2 27.1-21.9.41-.42.7.08 1.2 2.1 1.5 4.2 3.2 27.7 3.1 56.8a1.3 1.2-24.5 01-.33.8q-12.7 13.9-25.5 27.7c-4.8 5.1-9.0 7.8-15.7 7.9q-.61.0-.95-.5z","M264.2 435.5c-4.8-3.1-5.7-12.1-5.3-17.3q.03-.53.5-.75 1.8-.84 3.4.85 10.0 10.4 22.5 16.9c3.6 1.8 5.5 3.6 4.7 7.8q-.42 2.3-2.8 1.8-12.4-2.4-23.0-9.3z","M287.3 452.4c-4.0 4.4-10.3 11.3-16.2 14.3a.84.8 51.1 01-.9-.1c-6.2-5.1-12.5-18.9-14.2-25.0q-.91-3.3.85-8.8.12-.39.3-.05c2.4 3.6 4.5 7.7 8.6 9.7q10.1 5.0 21.2 9.0a.61.6 0 01.2.98z","M297.3 487.8c-7.3-4.2-16.6-11.3-20.5-17.5q-.32-.5.0-.92 8.7-9.0 19.8-17.8 1.4-1.1 2.8-1.6a.44.4 0 01.5.43c-.28 10.0-.4 20.4.65 30.4q.34 3.2-.68 6.1a1.9 1.9 0 01-2.7 1.0z","M257.3 456.1l13.6 16.6a1.8 1.8 22.9 01.4.9c.59 5.4-2.0 12.7-3.8 17.5q-.3.8-.84.1-11.8-15.5-9.7-35.1.04-.45.3-.1z","M271.6 494.0a1.5 1.5-61.8 01-.49-1.6l4.2-13.5a.98.9 0 011.5-.5c3.2 2.3 21.8 14.0 22.2 16.7q1.1 8.3.66 16.7a.9.9 0 01-1.3.73q-14.2-8.0-26.8-18.5z","M299.3 544.6c-7.5-6.0-16.1-13.4-24.2-21.2-6.9-6.7-6-17.1-4.8-26.0a.44.4 0 01.7-.28q13.3 11.8 28.4 21.3.43.2.6.7c2.3 6.4.95 18.3-.07 25.2q-.09.5-.55.2z","M299.0 575.5c-7.9-3.6-27.5-15.8-28.0-26.2q-.57-11.9.46-24.3a.36.3 0 01.6-.15q.84 1.3 2.1 2.5 10.5 9.4 21.6 18.3c4.3 3.4 4.3 6.4 4.1 11.7q-.3 8.8-.42 17.6-.01.7-.66.4z","M308.1 657.5c-7.3-.13-12.4-4.1-17.1-9.3q-11.8-13.2-23.9-26.3-.33-.36-.33-.85.0-23.1 1.8-46.2.53-7.1 2.4-14.4a.71.7 0 011.2-.3q11.5 12.0 25.8 21.1 3.3 2.1 3.6 5.1 2.0 23.6 3.8 47.3c.58 7.6 2.3 13.3 4.4 20.8q.47 1.6-.96 2.7-.39.3-.88.3z"]],["abs",["M311.0 531.7a.23.2 0 01-.19-.21q-.39-10.4 1.9-20.7c1.2-5.6 7.6-9.9 13.1-12.9 9.0-5.0 18.9-11.1 28.5-14.9a1.2 1.2-42.6 01.9.03c3.2 1.5 4.7 3.8 4.8 7.6q.13 13.1-.15 26.3c-.08 3.8.78 8.3-.87 13.1q-.17.4-.59.7-2.6 1.6-4.2 1.8-21.0 2.2-43.2-.87z","M321 577.7c-5.1-.33-8.7-.44-10-6.2q-3.2-14.4-.59-27.8.11-.53.6-.63c7.5-1.4 13.6-2.4 22.4-4.5q11.5-2.7 23.9-1.8c3.6.26 3.3 3.4 3.4 6.2q.46 12.5-.33 26.9-.25 4.4-1.8 8.0-.21.4-.73.6-1.3.28-3.2.29-16.8.14-33.7-.96z","M347.7 429.2c7.4-3.6 10.5 6.2 10.9 11.5.48 5.0 3.4 30.6-2.7 32.9q-4.1 1.5-6.8 3.3-17.5 11.5-35.8 21.4a1.6 1.5-21.9 01-2.3-.98c-2.8-10.4-10.5-43.9 1.6-50.9 11.3-6.4 23.9-11.8 35.2-17.3z","M350.3 712.8c-29.1-9.9-37.9-100.6-39.4-126.6a.99.9 0 01.3-.8c3.5-3.2 27.6-1.4 34.6-.93 4.4.34 15.2 1.3 15.2 7.5-.05 40.7.64 82.0-1.9 122.7a1.2 1.2 0 01-1.8 1.0c-2.3-1.1-4.1-2.0-6.9-2.9z","M371.9 473.3c-5.4-2.5-2.9-24.2-2.7-29.5.25-6.8 2.4-18.6 12.6-13.8q16.2 7.6 32.3 15.7 6.1 3.1 7.1 10.0c.58 4.2 1.3 8.4 1.0 12.7q-.84 12.5-4.3 26.5-.54 2.1-1.1 3.4-.25.5-.81.3c-15.7-7.2-30.7-19.0-44.1-25.4z","M382.5 533.2c-4.1-.18-9.5-.3-13.1-2.6q-.17-.11-.24-.31c-1.8-5.5-.86-11.1-.96-15.6-.18-8.4-.78-17.3.06-25.7.29-2.8 1.8-4.4 4.1-5.7q.42-.26.9-.19 1.7.25 3.2 1.0 12.4 6.4 24.7 13.2c4.9 2.7 12.2 7.0 13.7 12.4q2.9 10.5 2.3 21.4a.77.7-1.8 01-.67.7q-16.8 2.1-34.1 1.4z","M373.7 578.6c-2.4 0-4.3.22-5-2.7-1.8-7.7-3.0-34.2-.19-38.8q.27-.43.7-.47 13.1-1.2 25.7 1.8c8.4 2.0 14.5 3.0 21.8 4.3a1.2 1.2.6 011.0 1.0q2.1 14.1-.73 28.0c-1.0 5.2-5.2 5.2-10.3 5.6q-14.2 1.0-33.1 1.0z","M416.3 584.7q1.1.41 1.0 1.6c-1.6 26.4-9.9 116.6-40.4 126.7-2.2.75-4.1 2.1-6.3 2.7q-1.1.33-1.3-.89-.86-9.2-1.0-17.7c-.83-35.6-.91-71.2-1.0-106.8q0-.5.3-.89c4.9-6.4 41.6-7.2 48.7-4.6z"]],["biceps",["M189.5 492.5c-2.4.62-7.3.57-7.5-3.0-.56-16.0-.42-35.4 5.1-50.2 3.1-8.5 13.8-30.2 23.2-32.7 10.0-2.6 12.6 16.5 12.6 22.8-.22 15.9-7.5 34.7-15.0 48.7-4.2 7.9-9.9 12.3-18.4 14.5z","M526.6 486.3c-9.9-8.6-17.7-33.2-20.6-47.7-1.4-7.0-1.3-29.6 8.5-32.1 10.3-2.6 23.8 25.3 26.6 32.9q2.6 7.0 3.6 16.1 1.6 14.6 1.6 32.2c.03 11.0-16.4 1.4-19.7-1.4z"]],["triceps",["M206.2 514.2c-5.4-.67-6.5-7.2-4.6-11.4 11.0-24.5 22.8-50.6 30.5-75.5 1.3-4.4 3.0-8.5 3.9-12.4q2.9-13.1 5.7-26.2.42-1.9 1.8-3.3a.52.5 0 01.8.1q1.0 1.6 1.9 4.5 4.6 14.6 5.1 24.9c.57 11.3-5.1 24.5-8.6 35.5q-7.6 23.7-20.2 45.3c-2.4 4.2-11.5 19.1-16.4 18.5z","M517.6 512.0c-20.0-22.1-28.9-51.7-38.0-79.0-3.2-9.8-3.5-19.1-1.3-29.3 1.2-5.8 2.4-13.0 5.6-18.5q.32-.57.7-.06 1.3 1.6 1.7 3.6c2.6 12.3 5.1 24.4 9.0 36.5 8.2 25.2 18.5 49.8 31.1 77.2q1.4 3.1 1.0 5.3c-.81 4.8-5.4 9.2-9.9 4.2z"]],["neck",["M362.6 290.5q-1.1-1.3-1.8-3.4-5.3-15.1-12.1-29.7c-2.3-5.0-1.0-9.0-7.9-10.9q-1.0-.28.0-.47c5.9-1.0 15.2.91 21.3 2q2.3.42 4.8-.09 10.0-2.1 20.4-2.1a.37.3 0 01.0.73c-6.3 1.4-5.4 5.6-7.5 10.2q-6.1 13.1-11 26.6-1.3 3.6-2.9 6.8a1.9 1.9 0 01-3.3.3z","M354.0 315.0q-3.4-3.6-5.9-8.2c-6.4-12.3-11.0-25.4-16.1-38.7-2.9-7.6-1.9-19.4-1.6-27.6q.03-.58.4-.21c9.0 7.3 11.3 17.4 15.6 27.6 5.4 12.6 15.4 33.3 9.1 46.9a1 .99 35.5 01-1.6.27z","M345.7 316c-4.1-1.9-12.7-6.7-15.0-11.3-4.2-8.6-2.6-16.0-2.2-25.2a1 1 0 011.9-.28c4.2 12.4 10.5 24.4 15.7 36.6q.23.5-.31.3z","M372.7 314.7c-5.7-9.6 1.7-31.1 6.1-40.6 5.9-12.6 8.2-24.6 18.3-33.9a.49.4 0 01.8.35c.28 8.6.84 19.3-1.9 27.7-5.2 15.5-11.3 33.4-21.4 46.6a1.1 1.1 0 01-1.9-.11z","M398.0 278.4a.5.4 35.5 01.8-.14c2.0 2.7 1.6 11.6 1.6 15.1-.04 12.4-8.2 17.4-17.9 22.5a.35.3 0 01-.48-.46c5.5-12.0 11.8-24.4 15.9-37.1z"]],["trapezius",["M285.0 307.0a.89.8 0 01-.11-1.6q19.4-9.6 35.6-24.8 1.6-1.5 3.3-.31.4.3.45.8 1.2 12.6-1.5 25.4c-.74 3.3-2.5 4.2-5.9 4.4q-16.0 1.2-31.8-3.9z","M414 311.1c-5.2-.12-7.8-.64-8.9-6.2q-2.3-12.0-1.1-23.9.06-.61.6-.89 1.6-.85 3.6.99 16.1 14.8 33.9 23.6 3.6 1.7-.27 2.8-13.8 3.9-27.8 3.5z"]],["deltoids",["M274.0 311.6q3.9 2.7 4.3 8.1.04.4-.38.7c-9.9 5.8-24.3 7.4-28.8 19.7-2.3 6.3-.97 17.3-1.4 23.6q-.55 7.5-5.7 14.0-10.3 13.1-13.8 16.6c-3.4 3.5-6.8 1.7-10.6-.47-15.4-8.8-24.9-25.4-22.5-43.2 2.0-14.9 12.7-25.7 24.0-35.0 16.9-13.8 35.5-17.9 54.9-4.3z","M450.3 320.7q-.95-.52-.7-1.5c1.5-6.6 5.8-9.1 12.1-11.9 24.9-11.0 43.7 3.3 60.1 20.7 20.7 21.9 11.8 56.4-14.8 68.1-4.4 1.9-6.7-1.0-9.8-4.5-5.8-6.7-13.4-14.1-15.9-22.8-3.9-13.4 4.3-27.5-9.6-37.6q-8.2-5.9-17.9-9.0-1.8-.59-3.3-1.4z"]],["adductors",["M280.2 647.4c11.6 10.7 22.1 21.0 31.0 34.3 15.8 23.7 27.5 49.7 34.0 77.5 1.3 5.7-6.1 20.3-12.6 20.2q-.52-.01-.72-.49-.67-1.5-1.2-3.1c-14.6-41.7-27.9-79.7-46.8-117.0-1.9-3.7-3.0-7.3-4.0-11.2a.27.2 0 01.4-.27z","M331.6 898.3q-.17.5-.23-.02c-2.2-25.0-8.4-50.0-14.2-74.5q-19.4-82.1-42.4-163.6-.58-2.0.33-.13c19.8 42.5 38.9 86.5 51.6 132.0 9.4 34.0 15.5 71.6 4.9 106.3z","M334.4 789.1c1.5-2.6 14.3-20.3 16.2-20.3a1.7 1.7-89.2 011.7 1.7q-1.1 34.8-7.4 68.9c-.38 2.0-1.4 4.2-2.1 6.2q-.24.6-.34-.04-3.6-25.4-8.4-50.7c-.34-1.7-.63-4 .44-5.8z","M395.4 779.4c-5.7 1.3-11.3-11.8-12.4-15.8q-.61-2.1-.02-4.6 10.1-42.6 35.0-78.8c9.4-13.7 18.8-22.3 29.8-32.5q.55-.5.4.2-1.1 5.7-3.7 10.8c-19.4 38.3-33.3 79.2-47.7 119.6a1.8 1.8-86.4 01-1.3 1.1z","M453.6 658.9q.67-1.4.23.0-26.7 93.7-48.6 189.7c-1.9 8.7-3.6 17.9-5.4 26.8q-2.1 11.0-2.7 22.4a.15.1 0 01-.3.0c-8.1-24.4-6.7-51.9-1.8-76.8 11.0-56.4 34.4-110.4 58.7-162.2z","M377.9 768.6c1.4.84 1.7 1.4 2.6 2.6q6.1 8.0 12.2 16.1c1.8 2.5 1.9 4.1 1.3 7.4q-4.5 25.2-8.4 50.5-.11.7-.4.0-1.8-4.2-2.5-8.0-5.5-32.2-6.9-65.0-.09-2 .81-3.4a.95.9 30.8 011.2-.32z"]],["quadriceps",["M292.4 935.6q-.95-.52-1.5-1.4-4.1-5.7-7-13.5-7.8-20.7-13.3-42.3c-9.0-35.5-19.3-71.3-25.0-107.5-5.3-33.8 4-74.1 20.7-103.3q.35-.62.5.07c14.4 55.5 39.0 107.9 41.4 165.3 1.1 26.3.66 52.9-3.6 79.0-.63 3.8-4.7 27.8-12.1 23.7z","M275.1 942.9q-2.4-2.1-3.5-5.2c-3.9-10.6-7.6-21.0-12.8-31.3-7.8-15.7-10.7-34.5-13.2-51.4-2.1-14.6-2.3-31.4-3.9-47.1-.22-2.1-1.0-12.7.46-13.7q1.3-.92 2.0.55c1.5 3.0 3.1 6.1 3.6 9.5q8.2 52.3 26.3 102.1c2.8 7.8 9.9 30.5 1.8 36.7a.71.7-42.5 01-.9-.03z","M322.6 945.7c-3.7 6.1-10.7-2.4-12.6-5.6-3.1-5.4-2.6-14.9-1.7-20.8 4.0-28.0 5.6-52.8 3.4-80.7q-.06-.79.2-.08 15.7 32.8 14.2 68.9c-.4 9.5-2.9 22.4-2.9 34.1q.01 3.0-.73 4.2z","M437.8 933.5c-8.9 14.1-15.1-26.7-15.4-29.2q-5.2-43.0-1.1-86.0c4.9-51.8 26.9-99.3 40.3-150.9q.18-.66.5-.06c17.2 31.6 25.3 68.2 20.5 104.3q-2.2 17.0-8.7 42.7-7.5 30.2-15.2 60.4-6.1 24.2-15.0 47.6-1.8 4.7-5.8 11.1z","M451.7 942.6c-9.9-10.0 4.9-42.9 8.9-55.4q12.5-39.5 19.2-80.4c.49-2.9 2.6-12.3 5.4-13.2a.83.8 0 011.0.64q.74 4 .45 7.9c-1.9 26.5-3.3 58.9-11.0 87.7q-2.5 9.5-7.4 18.8c-4.3 8.2-6.9 16.7-10.0 25.2q-1.6 4.5-4.5 8.6a1.3 1.3 0 01-2.0.17z","M406.6 946.8c-3.2-2.7-1.4-10.6-2.0-14.7q-2.2-17.1-2.5-22.1c-1.7-25.0 3.6-49.1 13.9-71.9q.23-.51.2.0c-1.2 19.1-1.2 38.1.83 57.3q1.6 15.4 3.3 30.8c.43 3.9-.31 9.7-2.0 13.3-1.6 3.2-7.5 10.7-11.7 7.2z"]],["knees",["M297.6 1008.3c-7.2 7.2-16.3 3.4-19.6-5.1q-6.1-16.1-9.5-30.6c-1.9-8.6-2.2-19.6 9.7-19.9q13.1-.24 26.0 2.1 1.7.32 3.2 1.0a1.1 1.1 4.2 01.6.72c3.1 10.2 2.5 23.3.05 33.6q-2.3 10.0-10.5 18.1z","M288.0 1059.5c-6.9-5.8 13.7-46.4 17.3-53.9q7.3-15.3 10.9-32.0c.74-3.4 2-6.3 4.1-8.6a1.3 1.3 54.7 012.2.39c3.9 9.0 1.6 13.8-1.6 24.6q-10.2 33.1-27.2 63.5-1.8 3.2-4.2 5.8a1.1 1.1-49 01-1.5.11z","M430.4 1008.3c-12.9-12.6-14.3-33.4-10.9-50.3.31-1.5 1.0-2.5 2.7-2.8q11.4-2.2 23.0-2.5c14.1-.42 17.3 5.6 14.5 18.6q-3.1 14.6-9.1 30.3c-3.4 9.0-11.6 15.2-20.3 6.7z","M438.9 1059.5q-2.2-1.8-3.8-4.6-20.1-35.9-31.0-75.6-2.1-7.6 1.9-14.1a1.1 1.1 0 011.9-.08c2.2 3.0 3.4 5.4 4.2 9.3 3.9 18.5 10.9 32.5 20.0 51.0 3.5 7.1 11.3 26.1 8.5 33.6a1.1 1.1 0 01-1.8.47z"]],["tibialis",["M263.5 973.5a.6.6 0 011.0-.14q1.3 2.2 1.8 5.0c7.8 49.9 18.0 99.5 25 149.6q4.6 33.1 4.3 67.5-.04 3.4-2.1 5.7-.4.4-.75-.03-1.8-2.5-3.0-5.5c-11.6-28.6-20.4-58.1-24.2-88.6q-4.9-39.9-5.7-69.5c-.13-5.2-.17-12.5.35-18.9q1.7-20.7 2.5-41.6c.04-1.1.52-2.4.86-3.5z","M463.3 973.6a.7.7 0 011.2-.1c.27.4.64 1.3.68 1.9q1.2 20.8 2.5 41.7.66 10.8.39 19.9-1.2 40.7-7.5 82.2c-3.9 25.8-12.1 51.5-21.9 75.7q-1.1 2.7-3.2 6.1-.29.4-.71.1c-2.6-2.0-2.3-6.7-2.2-10.3.26-31.0 2.7-55.5 8.7-91.4q9.2-55.0 18.9-110.0c.8-4.5.9-10.5 3.1-16.0z"]],["calves",["M252.0 1032.5c.24-3.7 2.1-22.1 4.6-24.1a1.0 1.0-17.9 011.6.85c-.45 7.8-1.2 16-1.4 23.4q-.57 18.9-.66 37.8-.02 3.6.34 6.8c2.0 18.7 5.5 37.3 9.3 55.8 3.8 18.8 9.1 37.6 13.1 56.6q2.4 11.6 2.0 17.9c-.32 5.7-3.0 20.4-8.5 23.9a.62.6 0 01-.84-.16q-1.2-1.6-.95-3.5c.92-7.2 1.4-14.1-.3-21.5q-8.2-34.7-13.6-59.0c-1.8-8.4-3.1-17.1-3.9-26.3q-3.6-44.2-.83-88.5z","M315.0 1025.1a.16.1 0 01.3.02c4.0 25.7 8.9 52.7 8.7 77.8q-.13 12.0-5.7 26.3c-7.2 18.3-8.9 38.5-15.9 56.9q-.18.4-.21-.03c-1.8-34.4-5.6-65.9-8.5-103.2q-.97-12.4 4.4-23.1 7.4-14.6 15.1-29.2c.81-1.5 1.3-3.6 1.8-5.3z","M455.5 1231.6c-7.1-5.8-9.2-24.3-8.2-31.8 1.4-10.3 4.6-23.1 7.9-36.3q9.5-37.4 15.1-75.7c2.8-19.5 1.5-40.1.75-59.8-.22-5.6-.98-12.5-1.2-18.7a.97.9 0 011.8-.4c.35.8.92 1.7 1.1 2.6q2.9 14.3 3.3 20.5 2.3 43.2-.49 84.7-1.2 17.4-5.4 35.7-6.3 27.5-12.8 54.9-2.0 8.4-.11 18.3c.36 1.9.1 3.9-.68 5.5a.79.7 0 01-1.2.2z","M412.7 1025.4a.14.1 0 01.2-.04c4.8 11.6 10.9 22.0 17.2 34.7 4.0 8.1 4.7 14.4 4.1 24.2-2.1 34.3-6.2 68.8-8.4 101.5q-.05.6-.31.0-1.4-3.6-2.2-6.7c-4.3-16.7-8.7-38.3-16.3-57.5q-1.4-3.5-2.2-10.1c-1.7-14.7-.2-31.2 2.0-45.8q3.0-20.0 5.9-40.3z"]],["forearm",["M127.2 683.0c-4.0-2.1 1.2-27.0 2.2-31.5 4.9-23.0 9.1-46.1 13.9-69.2q1.5-7.4 2.1-15.1c.93-12.0.81-22.1 6.2-31.5 7.1-12.3 13.5-29.1 26.1-36.7a1.9 1.9 62.7 012.8.91c1.9 4.4 1.9 8.2 2.0 14.1.44 19.7-1.3 41.0-8.7 59.6-11 27.6-22.2 55.2-32.6 82.9-4.0 10.7-7.5 20.6-12.8 26.3q-.59.6-1.3.24z","M201.5 527.4a.84.8 0 01.6.65c3.9 17.1-2.9 39.3-10.9 54.4-4.6 8.6-13.0 20.4-18.2 31.3q-13.2 27.9-24.5 56.6-2.5 6.3-6.6 11.0a1.4 1.4 0 01-2.5-.81q-.36-3.7.84-7.1 10.3-29.1 21.5-57.9c6.3-16.1 14.5-31.6 20.6-47.8 3.6-9.8 5.3-22.3 7.3-30.6 1.4-6.2 4.1-11.0 11.7-9.5z","M207.3 540.4a.6.5-63.1 011.0-.34l5.3 6.0q.4.4.33 1.0-.52 4.1-1.2 5.8-6.9 15.6-13.6 31.3c-5.4 12.5-16.3 28.4-23.5 44.8-8.3 19.0-16.0 39.3-26.7 57.1a.36.3 0 01-.62 0l-.19-.32q-.17-.28-.06-.59 10.0-29.9 23.0-58.6 2.9-6.4 5.4-11.2c4.6-8.5 10.8-16.1 14.6-23.0q13.2-24.1 16.2-52.1z","M600.0 683.0c-5-4.1-8.9-15.4-11.2-21.5-5.8-15.2-11.3-30.5-17.5-45.7q-9.1-22.3-18.0-44.8c-5.5-14.1-7.3-31.4-7.9-46.5-.29-6.4-.68-19.4 2.6-25.0a1.7 1.7 0 012.2-.63c6.7 3.5 11.2 9.9 14.8 16.5q6.2 11.3 12.6 22.6c1.9 3.4 2.9 7.6 3.4 12.0 1.1 10.6 1.5 21.2 3.6 31.6 3.9 19.2 7.3 38.6 11.4 57.9 1.5 7.0 9.3 39.0 5.1 43.5a.91.9 0 01-1.2.08z","M586.5 681.4q-4.3-4.4-6.7-10.6-11.3-28.9-24.5-57.0c-5.7-12.1-14.3-22.8-19.9-35.1-7.1-15.3-12.9-33.3-9.2-50.3a1.4 1.4-87.1 011.2-1.1c7.4-.88 9.2 2.8 11.0 9.2 3.3 12.4 4.7 25.9 9.7 36.7 15.5 33.6 27.6 64.9 39.3 98.4 1.1 3.2 2.0 5.4 1.6 9.0a1.3 1.3 26.3 01-2.3.79z","M579.5 686.4q-3.9-5.7-6.8-12.1-8.0-17.3-19.7-44.5-2.6-6.2-6.4-13.6c-5.1-10.0-13.1-22.3-17.3-31.8q-9.5-21.6-13.6-31.3-1.0-2.5-1.3-5.8-.04-.61.3-1.0l5.2-5.8a.69.6 0 011.2.4q2.7 27.0 15.4 50.7 1.7 3.1 8.2 12.8 7.0 10.3 12.1 21.8 8.7 19.4 20.1 50.1 2.2 5.9 3.1 9.9a.36.3 0 01-.65.2z"]],["hands",["M100.9 745.8c-9.0-6.6-15.7-13.1-13.3-24.5 2.6-12.2 15.0-20.6 25.3-26.2 7.7-4.2 18.2-1.6 26.1.97 7.1 2.3 11.1 6.1 11.1 13.8q-.04 18.5-4.7 36.3c-5.4 20.7-34.4 6.9-44.5-.4z","M53.8 746.3a.91.9 0 01-.74-.95c.14-2.4-.23-6.3 2.2-7.8 4.6-2.7 11.3-5.5 14.1-10.3q6.3-10.8 16.5-20.3 1.2-1.1.64.4c-1.4 3.7-2.8 7.2-3.8 11.5-2.7 11.9-14.6 30-28.9 27.3z","M87.2 745.0c1.4.46 8.1 2.6 8.6 4.5 1.2 5.1-4.4 8.5-7 12.2-7.7 11.1-15.1 23.3-24.2 33.2a1.2 1.2 0 01-2.1-.86c.11-3.9.38-7.1 2.4-10.6q10.2-17.7 19.3-36.1.32-.65 2.1-2.2.38-.35.8-.19z","M108.1 758.1a2.1 2.1 0 011.0 2.8q-10.4 22.5-19.9 45.8c-1.4 3.5-4.3 5.1-7.8 6.0a1.3 1.3-8.1 01-1.6-1.2c-.11-3.0.37-5.8 1.5-8.9q8.1-20.2 15.1-40.9c.41-1.2.6-3.3 1.6-4.8a1.2 1.2 0 01.9-.49q4.7-.21 9.0 1.7z","M134.0 799.9q-1.1-1.7-1.4-3.7-2.1-17.0-1.1-34.2.03-.6.6-.75l6.9-1.8q.68-.19.6.52-.51 10.9-.85 21.7c-.28 8.5.1 12.6-4.1 18.4a.36.3 0 01-.58-.01z","M108.1 814.6a1.4 1.4 0 01-1.6-1.4c-.02-2.8-.14-5.6.32-8.5q2.9-17.7 5.4-35.6.53-3.8 1.5-7.5a.66.6 0 01.7-.48l7.2 1.2a.97.9 0 01.7 1.1q-4.7 23.9-9.1 46.2-.9 4.6-5.3 5.0z","M591.3 755.9c-8.0-2.9-8.6-9.7-10.2-17.0q-3.2-14.4-3.1-29.3.0-4.0 1.4-6.5c4.3-7.5 18.1-9.9 25.6-10.3 8.7-.51 18.3 6.9 24.9 12.2q8.9 7.1 10.7 17.5c2.4 13.8-12.1 23.4-22.7 29.0-6.9 3.6-18.6 7.3-26.7 4.4z","M641.9 706.7q10.8 9.6 17.6 21.9c1.6 2.9 9.7 6.7 12.8 8.5 2.9 1.7 3.0 4.8 2.5 8.5q-.06.4-.48.4c-8.1 1.3-11.9-1.9-17.7-7.2-10.3-9.5-10.5-20.3-15.3-31.9q-.54-1.2.5-.36z","M638 760.0c-2.5-3.4-7.5-6.0-5.4-11.1q.18-.44.6-.63l7.4-3.3q1.2-.58 2.0.62 3.3 5.2 5.6 10.0 6.8 13.9 14.7 27.3c1.3 2.2 4.2 10.1 2.2 12.1a1.2 1.2 0 01-1.7-.08c-9.4-10.9-16.8-23.3-25.5-34.9z","M647.8 812.6c-4 .24-7.7-2.8-9.1-6.3q-9.2-23.2-19.7-45.3a2.0 2.0 0 01.9-2.7q4.5-2.2 9.6-1.7a1.0 1.0 83.8 01.8.73q7.5 23.0 16.5 45.5 1.8 4.4 1.5 9.2a.7.7 0 01-.65.6z","M596.1 761.1a.84.8 0 01.6.81c-.01 4.8.95 35.3-2.7 37.6q-.49.3-.82-.17-3.4-5.2-3.5-8.4-.45-15.6-1.1-31.2-.03-.72.6-.52l6.9 1.9z","M621.0 814.2c-4.3 1.9-5.9-3.7-6.5-6.5q-4.5-21.9-8.8-43.9a1.4 1.4 0 011.1-1.6l6.8-1.1a.92.9 0 011.0.76q2.7 16.3 5.0 32.9c.85 6.1 2.2 12.2 1.8 18.9q-.03.5-.51.7z"]],["ankles",["M291.8 1208.1c5.4-1.0 11.8 5.5 13.3 10.3q2.4 7.7 1.4 16.8-.09.8-.45.0c-4.3-9.0-8-16.9-15.3-23.8a1.9 1.9 0 01.9-3.4z","M275.8 1270.9c-4.4-3.8-7.4-7.1-4.9-13.3q4.7-11.9 5.4-21.3.62-8.2 6.2-12.8c9-7.3 20.8 15 23.1 22.1 2.5 7.9 4.8 16.3 4.4 24.5-.31 7.1-2.0 17.4-6.4 23.1q-.3.3-.53-.05c-5.6-10.7-18.6-14.4-27.3-22.1z","M430.9 1209.1c2.2-1.3 10.5-2.0 6.0 2.6q-9.9 10.3-14.8 23.8a.28.2 0 01-.55-.08c-.52-10.2-.48-20.4 9.3-26.3z","M445.0 1223.2c8.4 6.5 6.4 16.6 9.3 25.5q1.7 5.4 3.4 10.8c3.8 12.2-27.7 21.4-32.2 32.4q-1.0 2.5-2.1.05c-6.9-14.8-6.7-29.3-1.7-44.5q2.8-8.5 8.0-16.0c3.0-4.3 9.6-12.7 15.3-8.3z"]],["feet",["M264.5 1334.5c-3.9-.34-18.5-4.2-19.0-9.4a1.4 1.4 0 01.2-.94c9.6-13.0 20.9-25.4 28.6-39.7q.25-.47.7-.37 9.7 1.7 17.7 7.6a1.1 1.1 43 01.0 1.8c-1.3 1.1-1.6 2.6-1.0 4.3 2.9 8.5-.92 16.5-4.8 25.3-1.7 4.0-1.7 8.9-2.8 13.6a1.5 1.5 0 01-1.9 1.1q-8.3-2.6-17.7-3.4z","M291.8 1340.1c-2.2-2.6-2.0-5.9-.78-9.3q3.3-8.8 4.0-18.3.43-6.0 1.2-8.7 1.3-4.3 3.4-8.2a.66.6 53.7 011.2.19q1.9 9.2 6.2 17.3c2.5 4.8-.82 11.4-2.9 16.1a1.8 1.7-35.8 00-.16.9q.42 4.3-1.9 7.9-.22.3-.61.4l-8.7 2.0a1.0 1.0 0 01-1.0-.34z","M444.6 1337.6q-1.0-1.3-1.2-3.0c-.52-4.4-.73-8.3-2.7-12.6-3.5-7.3-7.0-16.3-4.4-23.1.77-1.9.92-3.7-.76-5.1a1.2 1.2 46.4 01.0-2.0q7.9-5.7 17.5-7.6.46-.1.6.32c7.2 13.1 17.2 24.8 26.4 36.5q1.1 1.4 2.5 3.8a1.1 1.1-51 01.0.95c-1.7 5.0-12.9 7.8-17.7 8.5q-9.8 1.3-19.5 3.8a.82.8-26.2 01-.82-.27z","M426.9 1338.5c-2.0-.34-2.9-5.4-3-7.1-.15-6.0-6.2-11.6-3.1-17.8q4.3-8.5 6.3-17.7a.78.7 0 011.4-.17c2.1 4.5 4.1 9.0 4.3 14.3q.35 10.4 3.9 20.2c1.1 3.2 1.5 5.8.39 8.7a2.3 2.3 19.3 01-2.8 1.3q-3.4-1.0-7.5-1.8z"]],["head",["M 418.9 167.6 c 3.9 -1.7 6.5 0.4 7.0 4.3 c 1.4 11.9 -4.9 26.6 -11.7 36.4 c -2.2 3.1 -3.8 0.1 -4.7 -1.7 a 0.3 0.3 0 0 0 -0.7 0.1 c 0.0 8.3 1.0 17.0 -3.3 24.5 c -0.1 0.2 -4.3 4.6 -10.7 9.5 c -23.5 18.1 -41.5 16.1 -61.4 -0.7 c -4.7 -3.6 -5.9 -5.0 -8.8 -7.6 c -5.6 -5.0 -5.2 -17.3 -4.4 -24.9 c 0.0 -0.5 -0.4 -0.8 -0.9 -0.6 a 0.6 0.6 0 0 0 -0.3 0.3 c -0.5 1.6 -2.2 4.0 -4.0 1.4 c -6.2 -8.7 -16.0 -28.5 -11.1 -38.9 c 1.6 -3.6 3.7 -3.9 6.1 -0.8 a 182.8 182.8 0 0 1 3.7 23.2 a 1.0 1.0 0 0 0 1.5 0.7 c 2.7 -1.7 2.6 -18.9 2.6 -24.2 c 0.0 -4.5 1.1 -8.9 3.8 -13.1 c 4.3 -6.7 4.8 -11.5 5.5 -19.8 c 0.4 -5.5 4.3 -8.1 9.7 -8.2 c 6.3 -0.1 12.6 -0.0 19 -0.9 c 4.0 -0.5 7.4 -1.4 11.5 -0.7 c 6.7 1.1 13.4 1.6 20.2 1.6 c 4.6 -0.0 7.5 0.2 8.7 0.7 c 5.9 2.3 5.5 9.7 6.1 15.2 c 0.4 4.3 2.0 8.4 4.9 12.3 c 6.5 8.8 2.1 25.6 5.6 36.3 a 1.1 1.1 0 0 0 2.2 -0.2 c 0.8 -8.3 2.1 -16.4 3.8 -24.2 z z z z"]],["hair",["M418.9 167.6q-2.5 11.7-3.8 24.2a1.1 1.1 0 01-2.2.23c-3.4-10.7.93-27.4-5.6-36.3q-4.3-5.8-4.9-12.3c-.55-5.4-.15-12.8-6.1-15.2q-1.8-.74-8.7-.72-10.1.03-20.2-1.6c-4.1-.68-7.5.2-11.5.75-6.3.86-12.6.81-19 .93-5.4.09-9.3 2.6-9.7 8.2-.71 8.3-1.2 13.0-5.5 19.8-2.6 4.1-3.7 8.5-3.8 13.1-.02 5.2.16 22.4-2.6 24.2a1.0 1.0 0 01-1.5-.77q-1.1-11.7-3.7-23.2-1.4-6.9-1.9-9.7c-2.4-15.9.13-40.1 13.5-51.1 9.3-7.7 28.5-11.6 40.3-11.5 4.2.0 8.7-.3 12.6.22 13.8 1.8 31.6 5.8 39.4 18.9 9.0 15.2 9.8 35.1 5.3 51.9z"]]],"back":[["neck",["M1022.7 290.6a.62.6 25.9 01-.36-1.0q1.7-1.8 4.1-3.1c8.1-4.3 19.4-8.3 23.3-17.4q8.4-19.5 8.2-40.8-.05-4.3.57-5.7c1.9-4.3 9.6-3.6 13.8-2.9 4.3.7 4.7 3.2 4.6 7.3q-.2 24.1-.88 48.2c-.12 4.2 1.6 15.8-4.8 16.3-14.5 1.0-32.6 1.8-48.6-.68z","M1095.7 291.4c-4.3-.25-4.9-3.9-4.9-7.7q-.46-29.4-1-58.9c-.13-7.3 11.7-6.2 15.9-4.8 4.2 1.3 3.0 6.8 2.8 10.7-.28 8.8 5.1 41.1 15.3 46.7q8.6 4.8 17.2 9.5 1.9 1.0 3.2 2.3a.8.7 63.6 01-.45 1.3c-16.1 2.1-33.7 1.5-48.3.71z"]],["trapezius",["M1071.0 308.9c5.6 4.9 6.9 17.8 7.4 24.8q1.5 22.3.9 44.6-1.2 46.7-5.6 94a.57.5 3.7 01-.59.5q-.68-.03-.94-1.0-4.2-15.9-9.7-25.1c-10.2-17.3-18.8-31.8-25.5-49.4-10.1-26.3-15.6-54.2-26.4-80.5q-3.0-7.4-7.6-14.0-.3-.43.2-.6 12.4-4.2 25.4-4.8c5.5-.25 12.1.86 18.3 1.4 9.7.8 16.7 3.6 24.2 10.2z","M1163.9 302.1a.43.4 0 01.2.65q-7.0 10.7-11.4 23.3c-10.5 30.6-17.8 62.9-31.3 91.0-5.1 10.6-15.1 25.2-20.1 36.2q-4.0 9.0-6.5 18.8a.77.7 0 01-1.5-.12q-4.2-45.1-5.5-90.9c-.56-20.2-.74-39.9 2.7-60.4 1.0-6.1 2.7-9.9 7.8-13.8 9.8-7.4 18.0-7.7 30.1-9.1 12.0-1.3 23.9.4 35.5 4.3z"]],["deltoids",["M980.6 319.5c.19.1.55.1.65.3a.8.8 0 01-.16 1.1c-6.7 4.7-15.2 9.7-20.0 15.5-6.4 7.7-8.7 16.9-9.4 27.0-.39 5.9-1.6 9.5-5.5 13.4-10.0 10.0-19.0 16.4-31.1 20.4q-.75.2-.75-.55.1-18.4-.09-36.3-.14-9.4 1.0-14.2c4.0-16.0 22.8-33.8 39.6-35.6 9.9-1.0 17.3 2.4 25.8 8.7z","M1227.3 316.4c14.6 9.4 25.4 21.0 25.4 39.5q-.02 20.5-.01 41.3a.37.3 0 01-.51.3c-5.0-2.0-10.4-3.9-14.9-6.9-7.8-5.2-21.1-14.9-21.7-24.9-.69-10.7-2.8-20.8-9.7-29.2-4.6-5.6-12.9-10.5-19.6-15.2q-1.2-.87.0-1.7c4.6-3.1 9.9-6.7 15.2-7.9q13.5-3.0 25.8 4.8z"]],["upper-back",["M987.0 381.4c-8.4-5.0-14.1-13.2-18.8-22.9q-5.3-10.9-6.4-14.0c-1.4-4.0 35.1-19.2 39.6-20.9q2.7-1.0 4.3-.72c4.3.96 6.6 9.9 7.4 13.7q5.4 23.8 14.6 55.7.78 2.7-.88 4.3c-5.3 5.5-34.6-12.0-39.8-15.1z","M1017.4 583.3q-9.1-9.5-16.9-22.0-2.2-3.6-2.9-7.2c-3.2-18.8-5.7-38.0-10.5-56.5-3.5-13.7-4.7-25.1-6.6-41.4-.85-7.3-5.6-13.3-8.2-18.7q-4.9-10.4-6.4-22.8-.33-2.7 1.8-1.1c7.2 5.2 16.3 6.1 26.9 7.5 8.8 1.1 23.4-3.1 28.9-10.7 3.3-4.5 4.7-6.5 8.8-8.7a.67.6-26.4 01.9.3q10.0 21.8 19.9 43.7c2.5 5.6 12.1 15.8 10.7 21.8-3.6 16.0-9.8 31.9-16.2 47.1-9.7 23.2-18.6 46.7-27.2 70.3q-.24.6-.88.3-1.0-.52-2.2-1.7z","M1017.7 404.7c-23.8 13.2-54.3 7.1-60.4-22.7-1.2-5.8-2.5-15.8.64-20.5 3.6-5.4 7.1 4.1 8.1 6.1 7.7 15.1 31.6 29.1 48.2 31.1q1.8.21 5.2 2.0.4.2.26.6-.86 2.6-2.0 3.3z","M1141.4 397.6a2.1 2.1-3.6 01-1.8-1.6q-.71-2.9.18-5.9 8.7-29.1 11.7-43.2c1.7-8.1 3.0-16.7 6.9-22.0 1.9-2.6 4.2-2.2 7.1-1.1q20.5 7.9 39.0 18.7a1.3 1.3 25.9 01.5 1.6c-6.0 15.4-12.9 30.8-28.4 39.4-9.4 5.2-25.8 15.1-35.4 14.2z","M1149.6 404.8q-2.0-1.1-2.4-3.5-.09-.53.4-.75c4.6-2.0 9.7-2.5 14.6-3.8 11.0-3.1 22.0-10.8 30.3-18.5q6.3-5.8 7.5-8.9c1.0-2.4 3.7-9.5 7-9.4q.52.0.87.3 2.7 3.0 2.8 7.2c.33 13.7-2.2 26.9-13.2 35.9-13.8 11.3-33.1 9.9-47.9 1.5z","M1161.1 419.9c6.1 1.5 11.6.9 17.7.06 8.3-1.2 14.8-2.7 21.3-7.2a.54.5 74.1 01.8.47q-.64 11.8-5.7 22.8c-2.4 5.2-6.6 10.8-8.0 16.6q-1.0 4.2-1.4 8.9-1.6 18.7-6.3 37.4c-4.7 18.9-7.1 38.6-10.8 57.8q-.24 1.2-2.2 4.3c-4.5 7.1-12.2 19.4-19.3 23.8a.44.4-25.6 01-.64-.22c-8.2-22.5-16.6-45.1-25.9-67.2-6.6-15.8-13.2-32.1-17.2-48.4q-1.5-6.4 2.9-12.0 5.2-6.5 8.5-14.1 9.2-21 19.0-41.6a.47.4 0 01.6-.21q6.1 3.3 9.5 9.6c2.4 4.6 12.2 7.7 17.1 9.0z"]],["triceps",["M931.0 442.2c-2.0 2.5-6.5 9.7-10.1 9.1q-.52-.08-.8-.52-1.3-2.0-1.8-4.4c-2.2-10.8-3.2-22.8 1.3-33.3 5.4-12.3 18.2-23.6 29.6-31.2a.47.4 68.7 01.7.32l6.4 38.5q.09.5-.26.9c-.47.5-1.1 1.5-1.7 1.9q-9.1 6.5-18.0 13.3-2.9 2.2-5.2 5.2z","M958.1 427.1a.41.4 0 01.5.27q4.4 16.1-2.2 31.4-3.3 7.7-5.9 19.9c-1.5 7.2-8.9 12.2-11.8 18.8-2.4 5.5-2.4 12.5-3.5 16.6-2.1 8.0-8.5 14.1-13.9 20.1a.93.9 0 01-1.5-.25q-.57-1.3-.75-2.8c-1.9-16.9 2.5-33.5 5.7-49.9 2.1-11.2-1.5-24.1 9.6-34.5q9.5-8.8 19.5-17.2c1.3-1.0 2.7-1.7 4.1-2.3z","M903.5 519.6a1.8 1.8-5.4 01-1.1-.92q-3.5-6.9-3.6-15.1c-.37-21.2 3.8-42.5 9.5-63.4q.33-1.2.92-.1 4.6 8.7 8.6 18.6c2.8 7.2 4.1 12.9 1.8 20.5q-6.0 19.9-14.0 39.2-.65 1.5-2.0 1.1z","M1213.9 424.5q-2.0-1.5-3.0-3.0-.31-.46-.22-1 3.3-19.2 6.4-38.4.09-.56.5-.25 14.9 9.8 24.8 22.7c9.8 12.7 9.7 30.3 5.4 45.1a2.6 2.6 0 01-3.7 1.5c-3.2-1.7-6.2-6.7-8.6-9.6-5.2-6.4-14.7-12-21.5-17.0z","M1246.2 534.5q-.95-.3-1.7-1.2c-4.6-5.4-9.1-9.8-11.4-15.5-2.9-7.1-1.3-15.5-5.6-22.0-4.0-6.2-8.7-9.9-10.8-17.5-1.6-5.6-2.8-11.4-4.9-17.0-4.5-11.6-6.4-20.8-3.3-33.5a.59.5-74 01.7-.42q1.6.56 3.2 1.7 11.2 9.0 21.5 19.1c5.3 5.2 6.9 10.1 7.2 18.1.9 22.5 10.6 44.9 6.5 67.4a1.0 1 13.9 01-1.3.7z","M1258.4 439.9q2.0 5.3 3.1 10.6c3.5 17.3 7.1 34.7 6.8 52.6q-.11 8.3-3.9 15.6a1.6 1.6 33.4 01-2.4.5c-1.4-1.1-1.9-3.5-2.4-4.9q-9.2-23.4-13.1-38.1c-2.6-9.8 6.8-27.6 11.5-36.3q.28-.5.4.04z"]],["lower-back",["M986.7 627.1c-3.1-13.1-7.3-49.7 7.2-58.0 2.4-1.3 4.8-.82 6.7 1.2 6.1 6.8 16.2 18.5 18.7 28.1a1.3 1.3 52.6 01-.11.9c-2.5 4.5-9.9 8.0-15.8 11.3q-5.4 3.0-11.3 10.5c-1.2 1.5-2.6 4.3-4.5 6.0a.59.5-28.2 01-.97-.29z","M1023.1 607.9a2.0 2.0-74.3 01-.94-1.6c-.17-10.9 5.0-24.5 8.7-34.9q15.6-42.8 36-83.5a1.1 1.1-62.5 011.5-.48c1.2.66 3.2 12.9 3.4 15.0q6.9 59.2 2.8 116.8-.62 8.6-3.1 19.3-.13.5-.59.2l-47.9-30.9z","M1090.7 581.7q.62-5.1 0-10.2.22-29.7 3.0-59.5 1.1-11.5 3.9-22.8.31-1.2.44-1.4 1.0-1.4 1.8.17 23.3 46.9 40.1 96.1c1.8 5.2 5.8 16.6 4.3 22.9a1.6 1.6 0 01-.71 1.0l-47.6 30.7q-1.1.72-1.3-.6-4.5-28-4.1-56.3z","M1151.1 603.3q-5.3-3.3-2.1-9.0 8.0-14.2 17.8-24.6c3.4-3.6 9.0.89 10.9 3.9q2.9 4.6 3.8 10.1 3.5 21.7-1.2 43.0a.96.9 0 01-1.7.28c-6.9-11.8-16.0-16.5-27.4-23.7z"]],["forearm",["M878.4 534.3a.15.1 0 01.1-.13c.47.1 6.6 15.7 7.0 17.2q6.6 24.7 5.5 50.2c-.4 8.9-3.4 17.3-6.6 25.5-7.9 20.3-17.4 41.8-29.5 60.0a1.0 1.0-54.2 01-1.4.25c-.34-.26.3-1.4.47-1.8q5.5-20.8 8.9-42.0 8.6-54.1 15.5-109.3z","M893 518.9a.39.3 24.6 01.6-.25q5.9 7.8 13.1 15.2c8.0 8.4 1.4 28.7-5.8 37.1a1.0 1.0 0 01-1.6-.05c-6.0-7.9-5.4-18.7-4.9-28.4.36-8.1-.76-15.7-1.3-23.6z","M869.0 547.1c2.1.36 1.6 6.2 1.5 7.8q-2.5 38.8-9.1 77.1c-3.0 17.7-8.4 41.3-22.0 54.0a.38.3 0 01-.62-.41c14.5-40.4 19-84.2 26.8-126.3q.9-4.8 1.4-10.8.18-1.8 1.9-1.5z","M864.2 682.5q15.0-28.1 25.1-58.5c8.1-24.6 13.6-42.4 20.7-60.3q3.3-8.3 12.0-9.6c1.3-.2 3.6-.75 4.8.21q1.1.93.6 2.3-5.8 15.4-12.0 29.8c-5.7 13.3-14.9 28.6-20.3 40.1-6.1 13-28.0 59.1-31.6 56.6a.21.2 0 01.0-.36q.15-.07.3-.13.1-.04.1-.15z","M1272.9 519.4c.27-.33.3-.75.7-1.0a.32.3 0 01.5.2c-.7 7.2-1.7 14.3-1.6 21.5.13 8.9 2.1 24-5.3 31.1q-.37.3-.73 0c-7.6-7.5-14.2-28.2-6.5-36.9q6.6-7.4 13.0-15.0z","M1312.8 688.0c-4.7-6.0-7.2-10.8-11.7-19.5q-12.3-23.7-21.0-47.5c-4.8-13.3-5.2-26.1-3.8-40.1q1.1-11.5 2.6-19.5 2.7-13.9 9.5-26.7a.17.1 0 01.3.06q7.2 63.1 17.2 120.4 2.4 14.0 7.0 30.5c.22.7.74 1.3.36 2.4a.34.3 0 01-.59.1z","M1296.5 558.5c-.22-2.9-1.4-10.2 2-12.0a.62.6-18.4 01.8.44q6.2 35.6 12.2 71.0c3.8 23 8.7 46.2 16.7 68.1a.29.2 0 01-.47.3c-11.6-10.6-18.0-31.1-20.8-45.9q-7.2-38.5-10.4-81.9z","M1303.5 683.6c-2.8-.66-10.1-13.2-12.1-17.0-8.8-17.2-16.9-34.8-25.8-51.8-5.3-10.2-10.9-20.4-15.3-30.9q-5.8-13.8-11.0-27.8a1.6 1.6 79.5 011.5-2.2c13.0-.16 15.5 7.1 19.6 18.8q9.0 25.3 17.4 50.8 9.6 29.3 23.8 56.8.87 1.6 2.1 3.1.24.2-.12.2z"]],["gluteal",["M1045.0 626.1q1.4.61 4.1 4.4.2.39-.19.5c-14.4 4.1-26.1 7.4-38.1 15.7q-15.3 10.7-30.5 21.6a.55.5 74.9 01-.86-.5c1.1-13.1 10.3-35.2 20.4-45.0 9.1-8.8 34.9-1.1 45.1 3.2z","M1007.9 762.8c-16.9-16.6-29.3-37.6-31.4-61-2.0-22.8 15.6-34.9 32.1-45.7 8.2-5.3 46.5-27.3 54.3-17.6 5.9 7.2 13.3 15.8 15.4 25.2q3.0 13.6 2.4 27.6-.94 22.5-6.2 44.4c-2.4 9.9-2.9 17.1-2.5 26.7.47 14.8-18.5 17.1-29.1 14.0-6.3-1.8-13.7-4.8-21.3-6.2q-7.3-1.3-13.6-7.5z","M1117.9 631.0q-.13-.03-.27-.06-.12-.02-.06-.13 2.5-4.2 7.0-5.9 12.7-4.8 26.1-5.8c12.9-.91 17.1 3.0 23.2 13.0 5.7 9.2 13.3 24.7 13.4 36.0q.01.7-.61.3-16.6-11.7-33.2-23.5c-10.0-7.1-23.7-10.5-35.7-14.0z","M1124.1 776.6c-9.2 2.7-26.7 1.2-28.8-10.8-1.0-6.0.27-14.8-1.3-23.2q-.54-2.9-2.1-9.3c-3.2-12.8-4.0-23.3-5.0-35.2-1.0-12.0-.57-22 1.6-33.1q1.1-5.6 4.1-10.4 8.7-13.5 11.8-16.5c4.9-4.7 15.8.18 21.1 2.1q19.7 7.1 40.1 21.4c9.5 6.7 19.2 14.3 22.9 25.1 4.8 14.3-.65 33.8-7.4 46.8q-7.7 14.9-21.3 28.9-6.7 6.9-15.2 8.3c-7.0 1.2-13.6 4.0-20.5 6.1z"]],["adductors",["M1070.0 785.1c2.9 1.3 1.8 10.4 1.4 13.0q-3.9 33.2-14.6 64.6a.39.3 0 01-.76-.17c.9-7.0 2.3-14.2 2.1-20.9q-.68-30.1-18.7-54.5-.29-.39.1-.49c7.4-1.5 23.5-4.6 30.3-1.5z","M1127.2 787.6c-15.9 21.4-22.3 48.5-16.0 74.8a.47.4-63.2 01-.88.2q-1.9-4.6-3.6-10.2-8.2-27.7-11.6-56.5c-.65-5.7-1.1-11.7 6.8-11.9q13-.19 25.6 2.8a.31.2 41.2 01.1.5q-.12.0-.27.0-.1.0-.17.1z"]],["hamstring",["M963.2 741.5a.71.7 31.7 011.1-.28q1.5 1.6 2.4 3.9c4.6 11.4 8.9 22.6 11.0 34.7 3.3 19.1 4.8 38.2 3.1 57.7q-1.6 19.0-2.9 38.1c-.51 7.5-.88 15.7.07 23.1q1.0 8.5 1.3 17.5a.52.5 0 01-.98.2q-1.0-2.0-1.8-4.6-5.1-16.9-7.2-34.4-5.0-41.4-6.8-83.1-1.0-24.7-.07-49.5.06-1.5.64-3.5z","M1030.2 791.5q.17-.36.3-.03c5.2 8.1 9.9 16.1 12.4 25.6 3.1 11.7 5.8 24.3 4.3 36.2q-.5 3.8-3.5 14.0c-10.7 35.8-12.8 74.2-18.5 111.1q-.82 5.4-2.5 10.5-.23.6-.59.0c-4.7-8.0-5.1-25.0-5.3-34.8-.7-43.6 1.9-87.8 6.3-131.2 1.4-13.7 1.9-21.1 7.0-31.5z","M998.8 761.9q14.0 14.1 20.1 33.6c.98 3.1-.78 9.6-.93 12.9q-1.3 27.6-2.3 55.2c-.55 15.3-1.5 30.2-5.1 45.2q-8.6 36.1-22.7 68.7-3.6 8.4-10.1 17.1-.45.6-.41-.14c.11-1.9.82-4.1.99-5.7q2.4-22.7 6.0-45.2c2.8-17.6 4.1-35.9 4.3-52.3.33-36.4-.75-73.3 1.4-109.6.33-5.3 1.0-16.1 4.7-20.2q.33-.36.8-.45 1.9-.37 3.1.88z","M1052.5 855.6a.04.0 0 01.0.01q1.0 9.9 2.1 19.8.33 3.0-2.3 14.1c-3.8 15.8-8.1 31.1-8.9 47.4-.99 21.6-3.1 45.6-9.9 66.3q-1.4 4.5-.87-.2 3.3-25.3 3.7-51.9c.05-3.7-.4-10.3.2-15.5 2.1-19.2 7.3-38.2 11.7-57.0 1.7-7.6 2.9-15.2 4.1-23.0z","M1183.2 947.5c2.5 14.8 4.3 31.1 6.2 46.1q.35 2.7-1.1.39c-14.6-23.6-23.3-52.1-30.5-79.3q-5.0-19.1-5.9-39.0-1.3-30.3-2.4-60.7c-.22-6.0-2.5-15.6-.55-21.5q5.8-17.3 18.9-31.0c10.7-11.2 10.1 46.5 10.1 48.9-.13 41.0-.45 74.1 1.9 110.0.57 8.7 1.8 17.5 3.3 26.1z","M1136.4 791.5q.27-.42.4.03c3.1 6.4 4.8 12.2 5.6 19.8 5.0 45.8 8.0 94.6 7.5 140.7-.13 11.8-.46 26.2-5.1 37.0a.44.4 0 01-.83-.06q-2.5-9.1-3.6-18.4-3.5-27.6-7.3-55.2c-2.4-18-5.4-35.6-11.0-52.2q-4.3-12.8-2.0-26.7c1.7-10.7 3.5-21.6 8.4-31.1q3.5-6.9 7.9-13.8z","M1115.0 856.7c2.0 18.7 7.1 37.4 11.4 55.7 2.2 9.4 3.9 19.5 3.9 30.1q.02 31.7 4.0 63.1.16 1.2-.29.0-2.7-7.1-4.1-14.6c-4.4-22.2-5.7-40.5-6.8-61.2-.24-4.2-1.1-9.6-2.2-13.9q-3.9-16.2-7.7-32.5c-2.0-9.0.08-18.6 1.6-27.6q.07-.38.3-.09.1.19.0.4-.19.2-.15.5z","M1202.6 741.0a.44.4 0 01.7.03c.52.8.9 1.8.95 2.9q.73 15.9.37 31.9-1.1 52.9-7.8 105.4-1.8 14.7-5.9 29.0-1 3.5-1.9 4.9-1.5 2.4-1.3-.37c.58-9.4 1.8-19.1 1.7-28.1-.32-24.5-4.9-49.1-3.9-72.7.69-16.5 2.5-33.5 7.5-49.3q2.9-9.4 6.6-18.6.7-1.8 3.1-5.1z"]],["calves",["M982.6 1149.3c-3.0-2.2-3.9-6.2-5.2-11.0-7.1-27.1-7.8-53.1-6.6-82.7q1.0-25.2 9.2-47.4c4.7-12.8 15.3-24.7 23.7-36q.82-1.0.74.2c-1.3 22.8-2.7 45.6-3.1 68.4-.52 30.5-1.5 61.1-.42 91.6.24 6.8-2.7 16.2-10.0 18.3q-4.3 1.2-8.2-1.5z","M983.9 1163.5c7.1-5.5 16.1-.63 17 8.2q4.3 45.0 5.2 90.2c.16 8.2-.8 15.7-2.1 23.6q-.45 2.5-1.4 3.6-.95 1.1-1.2-.33c-5.0-26.7-8.2-53.4-11.8-80.3q-1.6-12.5-3.2-18.7-2.0-8.1-5.5-18.2c-1.0-3 .8-6.2 3.2-8.1z","M1013.6 1150.3c-4.8-2.6-4.6-16.1-4.3-20.7 2.3-36.4 3.4-73.9 1.0-110.4-1.0-15.5.02-31.4.62-47.0q.03-.66.2-.03c2.2 6.4 4.5 12.8 7.3 19.1 5.1 11.1 11.5 22.9 14.8 33.9q2.3 7.7 3.9 16.4 5.3 28.4 5.6 56.0c.2 18.3-7.9 40-22.6 51.7q-3.4 2.7-6.7.92z","M1014.1 1164.3c7-1.8 14.1 2.2 14.1 9.9q.06 29.0-5.6 57.4c-3.8 19.2-6.2 38.2-8.4 57.4a.37.3 0 01-.74-.01q-3.1-43.4-3.5-86.6-.15-14.1.76-28.3c.18-2.8.02-8.9 3.5-9.8z","M1172.9 1149.3c-6.0-4.5-6.9-11.4-6.8-19.4.9-52.6-.49-105.3-3.5-157.9q-.04-.72.4-.16 7.9 10.0 15.4 20.4c9.1 12.6 13.6 28.9 15.7 44.2 4.9 34.7 3.7 72.9-5.9 106.5-1.9 6.8-9.1 10.9-15.3 6.3z","M1144.4 1147.3q-17.1-17.3-20.0-40.8-.89-7.2-.13-19.9 1.1-20.0 4.6-41.3c2.3-14.1 5.8-25.2 12.4-38.6q8.1-16.5 14.3-34.1a.14.1-37.7 01.2.03q1.0 15.7 1.2 31.4c.18 11.6-1.3 24.9-1.5 36.4-.72 34.7 1.2 62.0 2.0 93.1.17 6.3-1.1 26.1-13.2 13.8z","M1173.7 1161.7c6.8-2 14.3 3.2 11.9 10.9-2.2 7.3-4.7 14.4-5.9 21.9-5.0 31.5-8.0 63.1-14.1 94.6a.72.7-61.9 01-1.2.37c-.14-.14-.35-.39-.4-.59q-3.5-13.5-3.1-28.2 1.0-44.6 5.0-87.0c.58-6.1 1.9-10.2 7.8-11.9z","M1154.3 1165a1.5 1.5-84.6 01.9 1.1c.79 4.4 1.4 8.7 1.5 13.4.9 29.1-.47 62.6-2.0 90.2q-.78 13.7-1.3 19.5a.23.2 0 01-.45 0c-2.7-21.2-5.4-41.9-9.6-63.0-3.4-17.0-4.2-34.9-4.6-52.3-.19-8.3 8.9-11.6 15.6-9z"]],["ankles",["M998.2 1320.5c-4.6.24-8.1-1.0-8.7-6.2-1.6-13.8-.75-28.8-2.1-42.4q-.39-3.7.24-7.0a.69.6 0 011.2-.28c2.3 3.1 4.2 5.7 5.1 9.6 1.5 6.5 1.9 22.5 9.9 24.0q13.3 2.5 15.9-10.4c.92-4.5 1-12.3 5.0-17.2q.42-.51.4.15c.11 14.3.4 30.8-3.0 44.5-.79 3.1-3.3 4.2-6.5 4.4q-8.7.45-17.4.88z","M1149.5 1319.5c-6.9-.63-6.8-18.0-7.1-23.7q-.73-12.5-.59-25.0.01-.71.4-.15 2.7 3.4 3.2 7.1c1.6 11.2 3.2 25.3 19.7 19.9 4.8-1.5 7.0-18.5 7.8-23.2.79-4.2 2.7-7 5.2-10.1a.56.5 0 01.9.22c1.1 4.6.0 12.3-.37 17.2-.92 10.7-.32 21.4-1.5 32.3q-.7 6.2-7.0 6.1-12.1-.11-20.9-.91z"]],["feet",["M962.8 1327.3q-.62-.51-.05-1.0l1.9-1.9q.39-.39.9-.41 25.6-.82 51.2 1 1.3.1 4.4 1.4.46.2.6.64 1.8 3.5 2.8 7.2c2.3 8.3-6.6 7.2-12.2 6.6q-15.3-1.5-30.5-4.5c-8.2-1.6-13.3-3.9-19.3-8.9z","M1154.3 1341.3c-12.4 1.3-13.2-3.8-8.6-13.3 1.8-3.7 12.7-3.6 16.3-3.7q19.4-.63 38.9-.44c2.4.02 3.3 1 4.6 2.7q.32.4-.09.7c-5.4 4.6-10.5 7.1-17.9 8.7q-16.4 3.4-33.1 5.2z"]],["hands",["M789.4 726.8c3.9-6.7 9.8-14.6 16.5-20.1a.31.3 0 01.4.35c-4.3 11.0-5.3 21.9-14.0 30.7-5.8 5.9-10.7 9.8-19.0 8.5q-.55-.08-.59-.63c-.24-3.0-.26-7.2 3.1-8.8 4.8-2.2 10.7-5.2 13.5-10.0z","M807.2 745.3c17.6 3.4 2.7 13.5-.73 18.9q-10.0 15.8-21.8 30.3-1.5 1.9-2.5-.58a2.4 2.3-55.4 01-.16-.96q.2-5.2 2.7-9.7c6.9-12.0 13.1-24.5 19.7-36.7q.91-1.7 2.8-1.3z","M819.3 744.8c-7.7-6.0-14.5-12.4-11.8-23.3 3.0-12.8 14.6-20.7 25.1-26.3 9.5-5.1 37.6-.75 37.6 13.6q-.01 16.2-3.6 31.9c-2.3 10.2-4.4 16.4-16.8 16.3-10.7-.13-21.9-5.7-30.3-12.2z","M827.9 758.2a2.0 2.0 26.6 01.9 2.7q-10.4 22.0-19.6 45.0-2.2 5.6-8.2 6.7a1.4 1.4 84.3 01-1.7-1.4q-.1-4.2 1.5-8.3 7.3-18.3 13.8-36.9c.74-2.1 1.5-6.0 2.9-8.9q.26-.5.8-.57 5.0-.64 9.5 1.6z","M841.6 762.3a.76.7-79.1 01.6.8q-4.5 23.1-9.2 45.8c-.73 3.4-2.0 5.7-5.8 5.4q-.52-.04-.61-.56-.74-4.5-.32-7.2 2.8-18.5 5.5-37.1.38-2.6 1.6-8.2.13-.54.6-.44l7.5 1.4z","M854.7 799.5a.78.7 0 01-1.3-.02q-.91-1.7-1.1-4.2-1.6-16.5-1.2-33.2a.84.8 0 01.6-.78l7.0-1.9q.59-.16.5.45-.58 14.7-1.1 29.5c-.14 4.0-1.5 6.8-3.4 10.2z","M1336.3 751.9c-8.7 4.4-29.3 10.2-33.6-3.6q-5.6-18.6-5.8-38.2c-.06-7.5 4.0-11.7 11.0-14.0 8.8-2.9 19.0-5.3 27.5-.35 8.7 5.0 18.3 11.2 22.4 21.0 3.0 7.3 3.3 13.6-1.7 20.0-5.2 6.4-12.4 11.4-19.8 15.2z","M1374.3 737.5c-8.0-8.1-9.6-19.6-13.8-30.7a.22.2 0 01.3-.24q10.3 8.9 17.1 20.7c2.5 4.4 9.0 7.5 13.5 9.7 3.1 1.5 2.9 5.9 2.7 8.7q-.05.5-.57.5c-8.8 1.1-13.4-2.9-19.3-8.8z","M1383.7 795.4c-.59-.21-.96-.17-1.3-.68-8.8-10.3-15.8-21.5-23.4-32.4-2.8-4.0-8.8-7.6-7.4-13.1q.15-.6.7-.84l7.8-3.4q.66-.29 1.1.25 2.3 2.7 4.1 6.4 7.3 15.2 16.8 31.4c2.3 3.9 3.0 7.5 2.3 11.8a.58.5 0 01-.78.4z","M1365.7 812.6c-2.7-.28-6.4-2.6-7.4-5.3q-8.7-21.7-19.8-45.7c-2.1-4.5 6.5-5.1 9.1-5.2 1.8-.03 1.9.71 2.3 2.1q5.7 18.3 15.3 42.1c.74 1.8 4.8 12.4.49 11.9z","M1308.1 759.1l7.4 2.1q.23.0.24.3.75 16.2-.86 32.4-.3 3-1.2 5.4a.79.7 0 01-1.4.12q-3.9-6.5-3.8-13.9.1-13.0-.83-26.1-.05-.57.5-.41z","M1340.0 814.3c-2.7.8-4.9-1.1-5.5-3.7q-5.0-23.4-9.8-47.4a.77.7-10.7 01.6-.9l7.5-1.3q.59-.11.7.47c2.0 8.5 3.2 19.8 4.2 25.7q2.0 12.9 3.1 21.1.34 2.5-.33 5.4a.86.8 88.4 01-.59.6z"]],["head",["M1028.1 166.4c1.0 5.0 1.3 9.6 6.4 11.5 13.0 4.9 16.7 15.5 23.5 27.4 1.3 2.4 3.8 3.6 7.4 3.5a910.0 910.0 0 0136.9-.25c6.2.09 9.2-7.5 11.4-12.3 4.3-9.2 10.3-15.8 20.2-18.9.333-.1.6-.287.8-.56 1.9-2.5 3.0-5.4 3.3-8.5l2.3-1.5a.977.9 0 01.9-.08c11.9 5.4-3.3 35.3-8.2 42.4-.761 1.1-2.4 1.0-3.0-.15l-1.2-2.3c-.133-.253-.32-.297-.56-.13-.34.2-.48.6-.42 1.1.86 7.6.75 16.8-2.9 23.3-.173.3.8.041-3.7 4.7-3.3 3.4-74.1 3.7-75.4-1.3a1.4 1.4 0 00-.55-.82c-4.1-2.9-6.0-7.9-6.1-12.3-.03-1.6.18-14.2-.53-14.6-.207-.1-.33-.037-.37.1-.3 1.5-1.1 2.5-2.6 3.1a.951.9 0 01-1.0-.32c-7.2-9.5-12.3-22.1-12.9-33.5-.34-6.0 1.7-9.2 6.4-9.5zm29.9 61.7c.173 14.1 18.9 14.7 19.1-1.3.03-4.0-.38-6.5-4.6-7.3-4.2-.75-11.8-1.4-13.8 2.9-.413.9-.603 2.8-.57 5.7zm31.7-3.3c.36 19.6 18.5 14.8 18.8 5.9.13-3.9 1.3-9.4-2.8-10.7-4.2-1.3-16.1-2.5-15.9 4.8z"]],["hair",["M1138.3 168.3q-.49 4.6-3.3 8.5-.31.4-.81.5c-9.9 3.1-15.9 9.6-20.2 18.9-2.2 4.7-5.2 12.3-11.4 12.3q-18.4-.25-36.9.25-5.3.14-7.4-3.5c-6.7-11.9-10.4-22.5-23.5-27.4-5.0-1.9-5.3-6.4-6.4-11.5q-6.6-26.1 4.4-48.8c8.1-16.7 34.6-21.4 51.5-21.0 4.8.11 9.6-.11 14.4.85 18.7 3.8 33.1 8.5 39.3 28.6q6.3 20.8.47 42.3z"]]]};
/* =========================================================================
   MAPA MUSCULAR: fatiga actual y reparto de series (7 y 30 días), con todas las sesiones guardadas
   ========================================================================= */
const MUSCLE_NAMES = { chest: 'Pecho', deltoids: 'Hombros', biceps: 'Bíceps', triceps: 'Tríceps', forearm: 'Antebrazos', abs: 'Abdomen', obliques: 'Oblicuos', trapezius: 'Trapecio', 'upper-back': 'Espalda', 'lower-back': 'Lumbares', gluteal: 'Glúteos', quadriceps: 'Cuádriceps', hamstring: 'Isquios', adductors: 'Aductores', calves: 'Gemelos', tibialis: 'Tibiales' };
const MUSCLE_NEUTRAL = new Set(['head', 'hair', 'neck', 'hands', 'feet', 'ankles', 'knees']);
/* Reglas por nombre del ejercicio (sirven para los de serie, las alternativas y los creados por cada usuario).
   [expresión, principales, secundarios]; los ejercicios con «+» se reparten por partes. */
const MUSCLE_RULES = [
  [/encogimiento|shrug/, ['trapezius'], ['forearm']],
  [/gemelo|pantorrilla/, ['calves'], []],
  [/remo al ment[oó]n|upright/, ['deltoids', 'trapezius'], ['biceps']],
  [/landmine|pike/, ['deltoids'], ['triceps', 'chest']],
  [/^remo|gorilla row/, ['upper-back'], ['biceps', 'forearm', 'deltoids']],
  [/dead bug/, ['abs'], ['obliques']],
  [/bird dog|superman/, ['lower-back'], ['gluteal', 'abs']],
  [/halo/, ['deltoids'], ['abs', 'obliques']],
  [/jumping jack|comba|skipping/, ['calves'], ['quadriceps', 'deltoids']],
  [/peso muerto a una pierna/, ['hamstring', 'gluteal'], ['lower-back']],
  [/paseo/, ['forearm', 'trapezius'], ['abs']],
  [/abducci[oó]n|paso lateral/, ['gluteal'], []],
  [/aducci[oó]n/, ['adductors'], []],
  [/pallof|leñador|russian twist|plancha lateral|antirrotaci/, ['obliques', 'abs'], []],
  [/elevaci[oó]n de (piernas|rodillas)|escaladores|mountain/, ['abs'], ['obliques']],
  [/get-up/, ['deltoids', 'abs'], ['obliques', 'gluteal']],
  [/hiperextensi/, ['lower-back'], ['gluteal', 'hamstring']],
  [/curl femoral|n[oó]rdico/, ['hamstring'], []],
  [/peso muerto rumano|buenos d[ií]as/, ['hamstring'], ['gluteal', 'lower-back']],
  [/peso muerto/, ['gluteal', 'hamstring', 'lower-back'], ['upper-back', 'forearm', 'quadriceps']],
  [/hip thrust|puente de gl[uú]teo|gl[uú]teo/, ['gluteal'], ['hamstring']],
  [/b[uú]lgara|zancada|step-up|lunge/, ['quadriceps', 'gluteal'], ['adductors', 'hamstring']],
  [/sentadilla|prensa|goblet|squat/, ['quadriceps'], ['gluteal', 'adductors']],
  [/swing|thruster/, ['gluteal', 'hamstring'], ['lower-back', 'deltoids']],
  [/gemelo|pantorrilla/, ['calves'], []],
  [/rueda|plancha|crunch|abdominal|core/, ['abs'], ['obliques']],
  [/granjero|farmer/, ['forearm', 'trapezius'], ['abs']],
  [/burpee/, ['quadriceps', 'chest'], ['deltoids', 'triceps', 'abs']],
  [/extensi[oó]n de (cu[aá]driceps|piernas)|leg extension/, ['quadriceps'], []],
  [/diamante|press cerrado|fondos en banco|extensi[oó]n|press franc[eé]s|tr[ií]ceps|patada/, ['triceps'], ['chest']],
  [/fondos|paralelas|dips/, ['chest', 'triceps'], ['deltoids']],
  [/face pull|p[aá]jaros|apertura con banda|apertura trx|hombro posterior|deltoides posterior/, ['deltoids'], ['upper-back', 'trapezius']],
  [/clean|push press|snatch/, ['deltoids'], ['gluteal', 'hamstring', 'triceps', 'trapezius']],
  [/press militar|press de hombro|press arnold|press.*kettlebell|hombro/, ['deltoids'], ['triceps']],
  [/elevaci(o|ó)n(es)? laterales?|laterales/, ['deltoids'], []],
  [/jal[oó]n|pullover/, ['upper-back'], ['biceps', 'forearm']],
  [/press|flexiones|aperturas|pecho|banca|cruce de poleas|contractora|pec deck/, ['chest'], ['deltoids', 'triceps']],
  [/dominadas|jal[oó]n|remo|row|pull/, ['upper-back'], ['biceps', 'forearm', 'deltoids']],
  [/curl|b[ií]ceps|martillo|zottman/, ['biceps'], ['forearm']],
  [/elevaci(o|ó)n(es)? frontal|elevaciones/, ['deltoids'], []],
];
const RETO_MUSCLES = { pullup: 'Dominadas', pushup: 'Flexiones', dips: 'Fondos', squat: 'Sentadillas', burpee: 'Burpees', plank: 'Plancha', abwheel: 'Rueda abdominal', abwheel2: 'Rueda abdominal' };
const musclesCache = new Map();
function musclesOf(name) {
  const key = String(name || '').toLowerCase();
  if (musclesCache.has(key)) return musclesCache.get(key);
  const out = {};
  const add = (list, w) => { for (const m of list) out[m] = Math.max(out[m] || 0, w); };
  for (const part of key.split('+')) {
    const r = MUSCLE_RULES.find(([re]) => re.test(part.trim()));
    if (r) { add(r[1], 1); add(r[2], 0.5); }
  }
  musclesCache.set(key, out);
  return out;
}
/* Lista de «trabajos»: { t (ms), sets, muscles } de sesiones guardadas y RETOS */
function muscleWork(sinceDays) {
  const from = addDays(todayISO(), -sinceDays), out = [];
  for (const s of state.sessions) {
    if (s.date < from) continue;
    const t = s.endedAt || Math.min(Date.now(), parseISO(s.date).getTime() + 19 * 3600000); // sin hora guardada: las 19 h, o «ahora» si es de hoy y aún no son las 19
    for (const x of s.exercises) { const m = musclesOf(x.name); if (Object.keys(m).length) out.push({ t, sets: x.sets.length, m }); }
  }
  for (const [id, r] of Object.entries(state.retos || {})) for (const h of r.history || []) {
    if (h.date < from || !RETO_MUSCLES[id]) continue;
    out.push({ t: h.at || Math.min(Date.now(), parseISO(h.date).getTime() + 19 * 3600000), sets: (h.got || []).filter(v => v > 0).length || 3, m: musclesOf(RETO_MUSCLES[id]) });
  }
  // el test de máximo también cansa: cuenta como 1 serie
  for (const [id, r] of Object.entries(state.retos || {})) for (const tt of r.tests || []) {
    if (tt.date < from || !RETO_MUSCLES[id]) continue;
    out.push({ t: tt.at || Math.min(Date.now(), parseISO(tt.date).getTime() + 19 * 3600000), sets: 1, m: musclesOf(RETO_MUSCLES[id]) });
  }
  return out;
}
const FULL_LOAD = 8, RECOVERY_H = 72;
function fatigueAt(work, ms) {
  const f = {};
  for (const w of work) { const h = (ms - w.t) / 3600000; if (h < 0 || h >= RECOVERY_H) continue; const k = 1 - h / RECOVERY_H; for (const [m, wt] of Object.entries(w.m)) f[m] = (f[m] || 0) + w.sets * wt * k; }
  return f;
}
function muscleFatigue() {
  const work = muscleWork(4), now = Date.now(), f = fatigueAt(work, now), res = {};
  for (const [m, v] of Object.entries(f)) {
    const frac = Math.min(1, v / FULL_LOAD);
    let h = 0; while (h < RECOVERY_H && Math.min(1, (fatigueAt(work, now + h * 3600000)[m] || 0) / FULL_LOAD) > 0.15) h += 1;
    res[m] = { frac, recovered: Math.round((1 - frac) * 100), readyIn: h };
  }
  return res;
}
function muscleVolume(days) {
  const v = {};
  for (const w of muscleWork(days - 1)) for (const [m, wt] of Object.entries(w.m)) v[m] = (v[m] || 0) + w.sets * wt;
  return v;
}
const MM_SCALE = ['#2c3b44', '#164e63', '#0e7490', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'];
const mmColor = v => v <= 0.03 ? MM_SCALE[0] : MM_SCALE[Math.min(6, 1 + Math.floor(v * 6))];
function bodySVG(vals, width) {
  const view = (side, vb) => `<svg viewBox="${vb}" width="${width}" class="swipe-ok" aria-hidden="true">${BODY_PATHS[side].map(([slug, paths]) => {
    const c = MUSCLE_NEUTRAL.has(slug) ? (slug === 'hair' ? '#141b20' : '#1c262c') : mmColor(vals[slug] || 0);
    return paths.map(d => `<path d="${d}" fill="${c}" stroke="#070b0d" stroke-width="2"/>`).join('');
  }).join('')}</svg>`;
  return `<div class="flex justify-center" style="gap:4px">${view('front', '60 90 604 1280')}${view('back', '784 90 604 1280')}</div>`;
}
function muscleMapHTML() {
  const tab = ui.mmTab || 'now';
  let vals = {}, rows = '', foot = '';
  if (tab === 'now') {
    const f = muscleFatigue();
    for (const [m, x] of Object.entries(f)) vals[m] = x.frac;
    const list = Object.entries(f).filter(([, x]) => x.frac > 0.03).sort((a, b) => b[1].frac - a[1].frac);
    rows = list.map(([m, x]) => `<div class="flex items-center justify-between bg-ink rounded-lg px-3 py-1.5 text-[13px]"><span class="font-semibold">${MUSCLE_NAMES[m] || m}</span><span class="text-mute text-[12px]">recuperado <b class="text-white">${x.recovered} %</b>${x.readyIn ? ` · listo en ${x.readyIn} h` : ''}</span></div>`).join('')
      || '<p class="text-xs text-mute text-center py-2">Todo recuperado: ningún músculo con carga de los últimos 3 días.</p>';
    foot = 'Fatiga estimada con tus series de los últimos 3 días (músculo principal 100 %, secundarios 50 %).';
  } else {
    const days = tab === 'd7' ? 7 : 30, v = muscleVolume(days), max = Math.max(0, ...Object.values(v));
    for (const [m, x] of Object.entries(v)) vals[m] = max ? x / max : 0;
    const all = Object.keys(MUSCLE_NAMES).map(m => [m, v[m] || 0]).sort((a, b) => b[1] - a[1]);
    rows = all.filter(([, x]) => x > 0).map(([m, x]) => `<div class="flex items-center justify-between bg-ink rounded-lg px-3 py-1.5 text-[13px]"><span class="font-semibold">${MUSCLE_NAMES[m]}</span><span class="text-mute text-[12px]"><b class="text-white">${fmtNum(Math.round(x * 2) / 2)}</b> series</span></div>`).join('');
    const forgotten = all.filter(([, x]) => x === 0).map(([m]) => MUSCLE_NAMES[m]);
    if (!rows) rows = `<p class="text-xs text-mute text-center py-2">Sin entrenos registrados en los últimos ${days} días.</p>`;
    else if (forgotten.length) rows += `<div class="rounded-lg px-3 py-2 text-[12px] text-amber-200" style="background:rgba(252,211,77,.08);border:1px solid rgba(252,211,77,.3)">⚠️ Sin trabajar en ${days} días: ${forgotten.join(', ')}</div>`;
    foot = `Series acumuladas en ${days} días (principal 100 %, secundarios 50 %). El color compara cada músculo con el que más has trabajado.`;
  }
  const grad = `linear-gradient(90deg,${MM_SCALE.join(',')})`;
  const unknown = [...new Set(state.sessions.filter(s => s.date >= addDays(todayISO(), -29)).flatMap(s => s.exercises.filter(x => !Object.keys(musclesOf(x.name)).length).map(x => x.name)))];
  return `<section class="card p-4 mb-3" id="muscleMap" data-noswipe>
    <div class="flex items-center justify-between"><h3 class="section-title">🔥 Mapa muscular</h3></div>
    <div class="seg mt-3" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[['now', 'Ahora'], ['d7', '7 días'], ['d30', '30 días']].map(([k, l]) => `<button class="seg-btn py-1.5 ${tab === k ? 'seg-on' : ''}" data-act="mmTab" data-v="${k}" type="button">${l}</button>`).join('')}</div>
    <div id="mmBody">
    <div class="mt-3">${bodySVG(vals, 150)}</div>
    <div class="flex items-center gap-2 mt-3 text-[10px] text-mute"><span>${tab === 'now' ? 'Descansado' : 'Poco'}</span><span class="flex-1 h-2 rounded-full" style="background:${grad}"></span><span>${tab === 'now' ? 'Muy cargado' : 'Mucho'}</span></div>
    <div class="mt-3 space-y-1">${rows}</div>
    <p class="text-[11px] text-mute mt-2">${foot}</p>
    ${unknown.length ? `<p class="text-[11px] text-mute mt-1">Sin mapa (no reconozco el ejercicio): ${unknown.map(esc).join(', ')}.</p>` : ''}
    </div>
  </section>`;
}
/* Mini silueta para «Hoy te toca» */
function todayMuscleHint(day) {
  const prim = new Set(); for (const e of day.exercises) for (const [m, w] of Object.entries(musclesOf(variantOf(e).variant.name))) if (w === 1) prim.add(m);
  if (!prim.size) return null;
  const f = muscleFatigue(), loaded = [...prim].filter(m => (f[m]?.frac || 0) >= 0.5);
  const vals = {}; for (const [m, x] of Object.entries(f)) vals[m] = x.frac;
  const names = ms => ms.map(m => MUSCLE_NAMES[m]).slice(0, 3).join(', ').toLowerCase();
  const txt = loaded.length ? `<span class="text-amber-200">${names(loaded)} aún cargado${loaded.length > 1 ? 's' : ''}</span>` : `<span class="text-emerald-300">${names([...prim])}: recuperado${prim.size > 1 ? 's' : ''} ✓</span>`;
  return { svg: bodySVG(vals, 26), txt };
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
  const mh = todayMuscleHint(day);
  return `<button class="today-card" data-act="goToday" data-prog="${esc(pr.id)}" data-day="${esc(day.id)}" type="button">
      ${mh ? `<span class="shrink-0 pointer-events-none" style="width:58px">${mh.svg}</span>` : '<span class="text-2xl">🏋️</span>'}
      <span class="flex-1 min-w-0 text-left"><span class="block text-[11px] text-mute">HOY TE TOCA</span><span class="block font-extrabold truncate">${esc(day.label)} · ${esc(pr.name)}</span><span class="block text-[11px] text-mute truncate">${day.exercises.length} ejercicios${mins ? ` · ⏱ ~${mins} min` : ''}</span>${mh ? `<span class="block text-[11px] truncate">${mh.txt}</span>` : ''}</span>
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
  state.retos[id] = { level, best, startedAt: todayISO(), history: [], tests: [{ date: todayISO(), at: Date.now(), max: best }], hardStreak: 0, draft: null };
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
      st.history.push({ date: T, at: Date.now(), level: before, target: d.target, got, feel, completed, kcal: retoKcal(id, got, T) });
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
      st.tests.push({ date: todayISO(), at: Date.now(), max: v });
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
/* ★ Comidas favoritas: se guardan por descripción y salen las primeras en «Favoritas y habituales» */
const isFavMeal = key => !!key && (state.settings.favMeals || []).includes(key);
function toggleFavMeal(key) {
  if (!key) return;
  const l = state.settings.favMeals || [], on = !l.includes(key);
  state.settings.favMeals = on ? [...l, key] : l.filter(k => k !== key);
  persist(); render(); toast(on ? '★ Guardada en favoritas' : 'Quitada de favoritas');
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
  const favs = ofType.filter(e => isFavMeal(e.key)), rest = ofType.filter(e => !isFavMeal(e.key));
  return { mode: 'top', list: [...favs, ...rest.slice(0, 10)], nFav: favs.length };
}
function renderPickList() {
  const { mode, list } = mealPicks();
  ui._picks = list;
  if (!list.length) return `<p class="text-xs text-mute">${mode === 'search' ? 'Nada encontrado en tu historial.' : `Aún no has registrado ninguna comida como «${esc(ui.mealType)}». Usa el buscador para encontrar otras.`}</p>`;
  return list.map((e, i) => isFavMeal(e.key) ? `<span class="chip chip-sm !p-0 overflow-hidden" style="border-color:rgba(252,211,77,.45)"><button class="pl-2.5 pr-1.5 py-1.5 text-amber-300 text-sm leading-none" data-act="favMeal" data-key="${esc(e.key)}" type="button" aria-label="Quitar de favoritas">★</button><button class="pr-3 py-1.5 text-left" data-act="repeatMeal" data-i="${i}" type="button">${esc((e.last.desc || e.last.type).slice(0, 34))} <span class="text-mute">· <span class="${MAC.kcal.text}">${Math.round(e.last.kcal)}</span>${e.count > 1 ? ` · ×${e.count}` : ''}</span></button></span>` : `<button class="chip chip-sm text-left" data-act="repeatMeal" data-i="${i}" type="button">${esc((e.last.desc || e.last.type).slice(0, 34))} <span class="text-mute">· <span class="${MAC.kcal.text}">${Math.round(e.last.kcal)}</span>${e.count > 1 ? ` · ×${e.count}` : ''}</span></button>`).join('');
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
/* ===== Interfaz 2 (en pruebas): iconos de línea y anillos separados. Se activa con la clase «ui2» en <body> ===== */
const isUI2 = () => document.body.classList.contains('ui2');
const IC = {
  plus: '<path d="M12 5v14M5 12h14"/>', star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  plate: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.5"/>', check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16 9.5"/>',
  coffee: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5v2.5M12 3.5v2.5"/>',
  utensils: '<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>', apple: '<path d="M12 7c-1.5-2-5-2.5-6.5 0-1.8 3 0 9 3 12 1.2 1.1 2.3 1 3.5.3 1.2.7 2.3.8 3.5-.3 3-3 4.8-9 3-12-1.5-2.5-5-2-6.5 0z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', dots: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6.3 0-3.7-3-6-4.3-9.2-.9 2.4-2.2 3.7-3.7 4.6-.5-1.3-.6-2.6-.2-4.1C7.7 7.8 5.5 11 5.5 14.7 5.5 18.4 8 21 12 21z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>', save: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 17v2.5h15V17"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v2"/>', phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  chart: '<path d="M4 19h16"/><path d="M5 15l4-4 3 3 6-7"/><path d="M15 7h3v3"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a2.5 2.5 0 0 0 3 4M16 6h3a2.5 2.5 0 0 1-3 4M12 13v4M8.5 20h7"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'
};
const icon = (k, cls = 'w-4 h-4') => `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;
const MEAL_IC = { Desayuno: 'coffee', Comida: 'utensils', Puente: 'apple', Cena: 'moon', Otro: 'dots' };
const TITLE_IC = { '➕': 'plus', '⭐': 'star', '🍽️': 'utensils', '✅': 'check', '🏋️': 'dumbbell', '🔥': 'flame', '📚': 'book', '🏆': 'trophy', '🎯': 'target', '👤': 'user', '💾': 'save', '📏': 'ruler', '📱': 'phone', '🔑': 'key', '🔒': 'lock', '🗓️': 'calendar', '🤖': 'sparkles', '🧠': 'chart', '📈': 'chart', '⚖️': 'ruler' };
function ui2Titles(root) {
  if (!isUI2()) return;
  root.querySelectorAll('.section-title').forEach(h => {
    const t = h.textContent.trim(), k = Object.keys(TITLE_IC).find(e => t.startsWith(e));
    if (k) h.innerHTML = `<span class="ti">${icon(TITLE_IC[k], 'w-[15px] h-[15px]')}</span>${esc(t.slice(k.length).trim())}`;
  });
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
/* Sesiones de retos (no son sesiones de gym: se muestran aparte en historial y calendario) */
function retoEntries(date) {
  const out = [];
  for (const id of RETO_IDS) for (const h of retoOf(id)?.history || []) if (!date || h.date === date) out.push({ id, r: RETOS[id], h });
  return out.sort((a, b) => (a.h.date === b.h.date ? (a.h.at || 0) - (b.h.at || 0) : a.h.date < b.h.date ? -1 : 1));
}
const retoLine = ({ r, h }) => `${h.got.filter(v => v > 0).join('+')}${r.unit === 's' ? ' s' : ''}`;
function dayActivity(date) {
  return { sessions: sortedSessions().filter(s => s.date === date && s.exercises.length), cardio: state.cardio.filter(c => c.date === date), retos: retoEntries(date) };
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
        ${ds ? `<span class="w-1.5 h-1.5 rounded-full ${DOT[ds.c]}"></span>` : ''}${act.sessions.length ? '🏋️' : ''}${act.retos.length ? '🏆' : ''}${act.cardio.length ? '🔥' : ''}
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
      <span>🏋️ pesas</span><span>🏆 retos</span><span>🔥 cardio</span>
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
        <span>🏋️ pesas</span><span>🏆 retos</span><span>🔥 cardio</span>
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
          ${s.exercises.map(e => `<div class="text-[11px] text-mute leading-snug">· ${esc(e.name)}: <span class="font-mono">${e.sets.map(x => setStr(x, isBwEx(e.exId), isTimedEx(e))).join(' · ')}</span></div>`).join('')}
        </div>`).join('') : ''}
      ${act.retos.map(x => `<div class="mt-1"><div class="text-xs font-semibold">🏆 Reto ${esc(x.r.name)} · nivel ${x.h.level}${x.h.kcal ? ` · <span class="${MAC.kcal.text}">~${x.h.kcal} kcal</span>` : ''}</div><div class="text-[11px] text-mute font-mono">${retoLine(x)} ${(RETO_FEEL.find(f => f[0] === x.h.feel) || ['', ''])[1]}</div></div>`).join('')}
      ${!act.sessions.length && !act.retos.length ? '<div class="text-xs text-mute mt-0.5">Sin entreno de fuerza.</div>' : ''}
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

  const typeChips = MEAL_TYPES.map(tp => `<button class="chip chip-sm meal-chip ${ui.mealType === tp ? 'chip-on' : ''}" data-act="mealType" data-type="${tp}" type="button">${tp}</button>`).join('');
  const hasHistory = Object.keys(state.meals).length > 0;
  const grouped = MEAL_TYPES.map(tp => {
    const items = mealsOf(date).filter(m => (m.type || 'Otro') === tp);
    if (!items.length) return '';
    const sub = items.reduce((a, m) => a + m.kcal, 0);
    return `<div class="mt-3 first:mt-0">
      <div class="flex justify-between text-[11px] uppercase tracking-wider text-mute font-bold mb-1.5"><span class="${isUI2() ? 'meal-h' : ''}">${isUI2() ? `<span class="meal-ic">${icon(MEAL_IC[tp] || 'dots', 'w-[15px] h-[15px]')}</span>` : ''}${tp}</span><span><span class="${MAC.kcal.text}">${Math.round(sub)} kcal</span>${PROT_TYPES.includes(tp) ? (() => { const pg = Math.round(items.reduce((a, m) => a + (m.prot || 0), 0)); return `<span class="text-mute"> · </span><span class="${MAC.prot.text}">P ${pg} g</span>${pg >= minProt() ? '<span class="text-emerald-300"> ✓</span>' : '<span class="ml-1 normal-case rounded px-1.5 py-px bg-white/10 text-white">baja</span>'}`; })() : ''}</span></div>
      ${items.map(m => `<div class="meal">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold truncate ${ui.editing?.id === m.id ? 'text-brand' : ''}">${ui.editing?.id === m.id ? '✏️ ' : ''}${esc(m.desc || tp)}</div>
          <div class="text-[11px] font-mono mt-0.5">${macroLine(m)}</div>
        </div>
        ${normName(m.desc) ? `<button class="iconbtn iconbtn-sm" style="${isFavMeal(normName(m.desc)) ? 'color:#fcd34d;border-color:rgba(252,211,77,.5)' : ''}" data-act="favMeal" data-key="${esc(normName(m.desc))}" type="button" aria-label="${isFavMeal(normName(m.desc)) ? 'Quitar de favoritas' : 'Guardar en favoritas'}">${isFavMeal(normName(m.desc)) ? '★' : '☆'}</button>` : ''}
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
    <div class="flex gap-1" data-noswipe>${typeChips}</div>
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
    <h3 class="section-title">⭐ Favoritas y habituales</h3>
    <p class="text-[11px] text-mute mt-1">En «${esc(ui.mealType)}»: primero tus favoritas ★ y luego las que más repites (hasta 10). Márcalas con ☆ en el registro. Al tocar una podrás ajustar cantidades antes de añadirla.</p>
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
    let isT = false;
    for (const s of sortedSessions()) for (const e of s.exercises) if (e.exKey === ui.progEx) {
      if (isTimedEx(e)) { isT = true; pts.push({ x: s.date, y: Math.max(...e.sets.map(x => x.r)), kg: false }); rows.push({ date: s.date, sets: e.sets, bw: isBwEx(e.exId), t: true }); continue; }
      const best = Math.max(...e.sets.map(x => oneRM(e, x, s.date)));
      const reps = e.sets.reduce((a, x) => a + x.r, 0);
      pts.push({ x: s.date, y: best > 0 ? Math.round(best * 10) / 10 : reps, kg: best > 0 });
      rows.push({ date: s.date, sets: e.sets, bw: isBwEx(e.exId) });
    }
    const isBW = pts.length && pts.some(p => !p.kg);
    const pr = pts.length ? Math.max(...pts.map(p => p.y)) : 0;
    strengthHtml = `
      <select class="field" data-act-change="progEx">${opts.map(([k, v]) => `<option value="${esc(k)}" ${k === ui.progEx ? 'selected' : ''}>${esc(v.name)} (${v.count})</option>`).join('')}</select>
      <div class="flex justify-between text-[11px] text-mute mt-3"><span>${isT ? '⏱ Mejor serie por sesión' : isBW ? 'Reps totales por sesión' : '1RM estimado (Epley) por sesión'}</span><span>Mejor: <strong class="text-white">${isT ? secTxt(pr) : fmtNum(pr) + (isBW ? ' reps' : ' kg')}</strong></span></div>
      <div class="mt-1">${lineChart(pts, { color: '#00d2df', unit: isT ? ' s' : isBW ? '' : ' kg', label: 'fuerza' })}</div>
      <div class="space-y-1 mt-2">${rows.slice(-5).reverse().map(r => `<div class="text-[11px] flex justify-between gap-3 bg-ink rounded-lg px-2.5 py-1.5"><span class="text-mute shrink-0">${fmtDate(r.date)}</span><span class="font-mono text-right">${r.sets.map(x => setStr(x, r.bw, r.t)).join(' · ')}</span></div>`).join('')}</div>`;
  }

  const backupAge = st.lastBackup ? daysBetween(st.lastBackup, todayISO()) : null;
  const needBackup = state.sessions.length > 0 && (backupAge === null || backupAge > 7);
  const hist = [...sortedSessions().map(x => ({ ...x, _t: x.endedAt || 0 })), ...retoEntries().map(x => ({ reto: x, date: x.h.date, _t: x.h.at || 0 }))].sort((a, b) => (a.date === b.date ? a._t - b._t : a.date < b.date ? -1 : 1)).slice(-20).reverse();

  return `
  ${muscleMapHTML()}
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

  <details class="card p-4 mt-3" ${openAttr('history')}>
    <summary class="flex items-center justify-between cursor-pointer select-none"><h3 class="section-title">📚 Historial de sesiones</h3><span class="flex items-center gap-2 text-[11px] text-mute">${hist.length ? `${hist.length === 20 ? 'últimas 20' : hist.length + (hist.length === 1 ? ' sesión' : ' sesiones')} · ${esc(fmtDateShort(hist[0].date))}` : 'sin sesiones'}<span class="tri"></span></span></summary>
    <div class="space-y-2 mt-3">
      ${hist.length ? hist.map(s => s.reto ? `<div class="bg-ink rounded-xl border border-line px-3 py-2.5 text-sm">
        <div class="flex justify-between items-center"><span class="font-semibold truncate">🏆 Reto ${esc(s.reto.r.name)} <span class="text-mute font-normal text-xs">· nivel ${s.reto.h.level}</span></span><span class="text-[11px] text-mute shrink-0 ml-2">${fmtDate(s.date)}</span></div>
        <div class="text-[11px] text-mute mt-0.5"><span class="font-mono">${retoLine(s.reto)}</span> ${(RETO_FEEL.find(f => f[0] === s.reto.h.feel) || ['', ''])[1]}${s.reto.h.kcal ? ` · <span class="${MAC.kcal.text}">~${s.reto.h.kcal} kcal</span>` : ''}</div>
      </div>` : `<details class="bg-ink rounded-xl border border-line">
        <summary class="px-3 py-2.5 flex justify-between items-center cursor-pointer text-sm"><span class="font-semibold truncate">${esc(s.dayTitle || s.dayId)}${s.durationMin ? ` <span class="text-mute font-normal text-xs">· ${s.durationMin} min</span>` : ''}</span><span class="flex items-center gap-2 text-[11px] text-mute shrink-0 ml-2">${fmtDate(s.date)}<span class="tri"></span></span></summary>
        <div class="px-3 pb-3 space-y-1 text-[11px]">
          ${s.exercises.map(e => `<div><strong>${esc(e.name)}:</strong> <span class="font-mono text-mute">${e.sets.map(x => setStr(x, isBwEx(e.exId), isTimedEx(e))).join(', ')}</span></div>`).join('')}
          ${s.habits?.length ? `<div class="text-emerald-300 mt-1">✓ ${s.habits.map(esc).join(' · ')}</div>` : ''}
          ${s.skipped?.length ? `<div class="text-mute mt-1">⏭ Hoy no: ${s.skipped.map(esc).join(' · ')}</div>` : ''}
          ${s.notes?.length ? s.notes.map(n => `<div class="text-amber-200/90 mt-1">💬 ${esc(n.name)}: ${esc(noteTxt(n))}</div>`).join('') : ''}
          ${(() => { const g = gymKcalInfo(s); return `<div class="mt-1.5 flex flex-wrap items-center gap-x-2">${g ? `<span class="${MAC.kcal.text}">🏋️ ~${g.kcal} kcal netas</span><span class="text-mute">${g.manual ? '(corregidas a mano)' : `(MET ${fmtNum(Math.round(g.met * 10) / 10)} · ${g.mins} min · ${fmtNum(g.bw)} kg)`}</span>` : '<span class="text-mute">Sin estimación de kcal (falta duración o peso)</span>'}<button class="underline text-brand" data-act="sessKcal" data-id="${esc(s.id)}" type="button">ajustar</button></div>`; })()}
          <div class="flex gap-4 mt-2"><button class="underline text-brand" data-act="shareSession" data-id="${esc(s.id)}" type="button">📸 Tarjeta</button>
          <button class="text-rose-300 underline" data-act="delSession" data-id="${esc(s.id)}" type="button">Borrar esta sesión</button></div>
        </div>
      </details>`).join('') : '<p class="text-sm text-mute">Sin sesiones todavía.</p>'}
    </div>
  </details>`;
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
      <button class="btn-ghost" data-act="resetPlan" type="button">Vaciar bloques</button>
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
    ${deferredInstall ? `<button class="btn-primary w-full" data-act="install" type="button">Instalar en la pantalla de inicio</button>` : `<p class="text-xs text-mute">${isStandalone() ? 'Instalada como app ✓' : 'Para instalar: menú ⋮ del navegador → «Instalar aplicación» o «Añadir a pantalla de inicio».'}</p>`}
    ${versionStatusHTML()}
    ${access.usageUrl ? `<div class="flex items-center justify-between gap-2 text-[11px] text-mute"><span class="min-w-0">🔑 Este dispositivo: <span class="${/✓/.test(deviceDiag) ? 'text-emerald-300' : 'text-amber-300'}">${esc(deviceDiag || 'sin comprobar')}</span><br><span class="opacity-70">${esc(deviceLabel())} · script …${esc(access.usageUrl.replace(/\/exec.*$/, '').slice(-6))}</span></span><button class="underline text-brand shrink-0" data-act="devCheck" type="button">Comprobar</button></div>` : ''}
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
function deviceLabel() {
  const u = navigator.userAgent;
  const os = /iPad/i.test(u) ? 'iPad' : /iPhone/i.test(u) ? 'iPhone' : /Android/i.test(u) ? 'Android' : /Windows/i.test(u) ? 'Windows' : /Mac OS X|Macintosh/i.test(u) ? 'Mac' : /CrOS/i.test(u) ? 'Chromebook' : /Linux/i.test(u) ? 'Linux' : 'Otro';
  const br = /EdgA?\//.test(u) ? 'Edge' : /SamsungBrowser/i.test(u) ? 'Samsung Internet' : /OPR\//.test(u) ? 'Opera' : /Firefox|FxiOS/i.test(u) ? 'Firefox' : /CriOS|Chrome\//.test(u) ? 'Chrome' : /Safari/i.test(u) ? 'Safari' : 'Navegador';
  return `${os} · ${br}${isStandalone() ? ' · app' : ''}`;
}
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
  document.body.classList.add('timer-on'); // «?» y ✉️ se apartan y la cuenta atrás ocupa su sitio
  tickTimer(); wakeOn();
}
function addTimer(sec) { if (!timer.endAt) return startTimer(sec); timer.endAt += sec * 1000; timer.total += sec; tickTimer(); }
function stopTimer() {
  clearInterval(timer.int); timer.endAt = 0;
  $('#timerDisplay').textContent = 'Descanso'; $('#timerBar').style.width = '0%';
  $('#timerPill').classList.remove('timer-run', 'timer-ready', 'timer-low'); document.body.classList.remove('timer-on'); wakeOff();
}
function tickTimer() {
  const leftMs = timer.endAt - Date.now();
  if (leftMs <= 0) {
    clearInterval(timer.int); timer.endAt = 0;
    $('#timerDisplay').textContent = '¡Ya!'; $('#timerBar').style.width = '0%';
    $('#timerPill').classList.remove('timer-run', 'timer-low'); $('#timerPill').classList.add('timer-ready');
    try { navigator.vibrate?.([250, 120, 250, 120, 400]); } catch { /* nada */ }
    beep(); wakeOff();
    setTimeout(() => { if (!timer.endAt) { $('#timerDisplay').textContent = 'Descanso'; $('#timerPill').classList.remove('timer-ready'); document.body.classList.remove('timer-on'); } }, 5000);
    return;
  }
  const left = Math.ceil(leftMs / 1000);
  $('#timerDisplay').textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
  const pct = Math.max(0, Math.min(100, leftMs / (timer.total * 1000) * 100));
  $('#timerBar').style.width = `${pct}%`;
  $('#timerPill').style.setProperty('--p', `${pct}%`);
  $('#timerPill').classList.toggle('timer-low', left <= 5);
}
/* ⏱ Cronómetro de una serie por tiempo: cuenta atrás 3-2-1, cuenta hacia arriba, avisa al llegar al objetivo y guarda los segundos */
function tone(freq = 880, dur = 0.15) {
  const c = timer.ctx; if (!c) return;
  try { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur + 0.02); } catch { /* sin audio */ }
}
function stopwatchSheet(exId, key, i) {
  const f = findEx(exId); if (!f) return;
  const e = f.ex, c = coachFor(e, key), d = draftOf(currentDay().id);
  const tg = c.targets[i] ?? c.targets[c.targets.length - 1];
  const target = typeof tg === 'number' ? tg : (parseInt(String(tg), 10) || e.minReps);
  const name = variantOf(e).variant.name;
  const sw = { phase: 'ready', t0: 0, int: null, hitT: false, hitM: false };
  const el = id => document.getElementById(id);
  const draw = () => {
    if (!el('swTime')) { clearInterval(sw.int); wakeOff(); return; }
    if (sw.phase === 'count') {
      const left = 3 - Math.floor((Date.now() - sw.t0) / 1000);
      if (left <= 0) { sw.phase = 'run'; sw.t0 = Date.now(); tone(1320, 0.3); try { navigator.vibrate?.(120); } catch { /* nada */ } paint(); return; }
      if (el('swTime').textContent !== String(left)) { el('swTime').textContent = String(left); tone(660, 0.12); }
      return;
    }
    if (sw.phase !== 'run') return;
    const sec = Math.floor((Date.now() - sw.t0) / 1000);
    el('swTime').textContent = secClock(sec);
    el('swBar').style.width = `${Math.min(100, sec / e.maxReps * 100)}%`;
    if (!sw.hitT && sec >= target) { sw.hitT = true; beep(); try { navigator.vibrate?.([200, 100, 200]); } catch { /* nada */ } el('swMsg').innerHTML = '<span class="text-emerald-300 font-bold">🎯 ¡Objetivo! Aguanta si puedes</span>'; }
    if (!sw.hitM && sec >= e.maxReps) { sw.hitM = true; beep(); try { navigator.vibrate?.([300, 120, 300]); } catch { /* nada */ } el('swMsg').innerHTML = '<span class="text-emerald-300 font-bold">🏁 Máximo alcanzado: para cuando quieras</span>'; }
  };
  const secClock = sec => `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
  const html = () => `<div class="text-center">
      <div class="text-[11px] font-bold uppercase tracking-wider text-brand">⏱ Serie ${i + 1} de ${setCount(e, key, d)}</div>
      <h3 class="font-extrabold text-lg mt-1">${esc(name)}</h3>
      <div class="text-xs text-mute mt-1">Objetivo <b class="text-white">${target} s</b> · máx ${e.maxReps} s</div>
      <div id="swTime" class="font-black tabular-nums mt-4 ${sw.phase === 'count' ? 'text-brand' : ''}" style="font-size:72px;line-height:1">${sw.phase === 'count' ? '3' : '00:00'}</div>
      <div class="h-2 rounded-full bg-ink border border-line mt-4 overflow-hidden"><div id="swBar" class="h-full" style="width:0%;background:linear-gradient(90deg,#22d3ee,#34d399)"></div></div>
      <div id="swMsg" class="text-xs text-mute mt-3 min-h-[18px]">${sw.phase === 'ready' ? 'Ponte en posición y pulsa Empezar: tienes 3 s.' : sw.phase === 'count' ? 'Prepárate…' : ''}</div>
    </div>
    ${sw.phase === 'ready'
      ? '<button class="btn-primary w-full text-lg py-4" data-mact="go" type="button">▶ Empezar</button><button class="btn-ghost w-full" data-mact="cancel" type="button">Cancelar</button>'
      : '<button class="btn-primary w-full text-lg py-4" data-mact="stop" type="button">■ Parar y guardar</button><button class="btn-ghost w-full" data-mact="cancel" type="button">Cancelar sin guardar</button>'}`;
  const paint = () => { const sh = $('#modalRoot .modal-sheet'); if (sh) sh.innerHTML = html(); draw(); };
  openModal(html(), {
    noClose: true,
    go: () => { unlockAudio(); stopTimer(); sw.phase = 'count'; sw.t0 = Date.now(); paint(); tone(660, 0.12); wakeOn(); clearInterval(sw.int); sw.int = setInterval(draw, 100); },
    cancel: () => { clearInterval(sw.int); wakeOff(); closeModal(); },
    stop: () => {
      if (sw.phase === 'count') { clearInterval(sw.int); wakeOff(); return closeModal(); }
      const sec = Math.floor((Date.now() - sw.t0) / 1000);
      clearInterval(sw.int); wakeOff(); closeModal();
      if (sec < 1) return;
      setDraftCell(key, i, 'r', String(sec));
      if (!(d.done[key] || [])[i]) markSetDone(exId, key, i);
      else { persist(); render(); }
    }
  });
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
/* Al renombrar, el historial (marcas diarias, sesiones y borradores) pasa al nombre nuevo */
function renameHabit(old, nu) {
  for (const k of Object.keys(state.habitLog || {})) state.habitLog[k] = state.habitLog[k].map(n => n === old ? nu : n);
  for (const c of Object.values(state.habitCount || {})) if (old in c) { c[nu] = c[old]; delete c[old]; }
  for (const s of state.sessions) if (Array.isArray(s.habits)) s.habits = s.habits.map(n => n === old ? nu : n);
  for (const d of Object.values(state.drafts || {})) if (d?.habits && old in d.habits) { d.habits[nu] = d.habits[old]; delete d.habits[old]; }
}
function saveHabitList() { state.settings.habits = state.settings.habitList.filter(h => h.where === 'train').map(h => h.name); persist(); render(); }
function habitsSettingsHTML() {
  const list = state.settings.habitList || [], nd = list.filter(h => h.where === 'daily').length;
  return foldCard('habits', '✅ Hábitos', list.length ? `${list.length - nd} entreno · ${nd} diario${nd === 1 ? "" : "s"}` : 'Ninguno', '', `
    <p class="text-[11px] text-mute">🏋️ <b class="text-slate-300">Entreno</b>: se marcan al guardar la sesión. 🍽️ <b class="text-slate-300">Diario</b>: salen en Dieta los días que elijas y se marcan cada día, entrenes o no.</p>
    <div class="space-y-1.5">${list.map((h, i) => `<div class="bg-ink rounded-lg px-3 py-2 space-y-2">
      <div class="flex items-center justify-between gap-2"><span class="text-[13px] font-semibold min-w-0 break-words">${esc(h.name)}</span><span class="flex gap-1 shrink-0">
        <button class="iconbtn iconbtn-sm ${i === 0 ? 'opacity-30 pointer-events-none' : ''}" data-act="habMove" data-i="${i}" data-d="-1" type="button" aria-label="Subir">▲</button>
        <button class="iconbtn iconbtn-sm ${i === list.length - 1 ? 'opacity-30 pointer-events-none' : ''}" data-act="habMove" data-i="${i}" data-d="1" type="button" aria-label="Bajar">▼</button>
        <button class="iconbtn iconbtn-sm" data-act="habEdit" data-i="${i}" type="button" aria-label="Editar hábito">✎</button>
        <button class="iconbtn iconbtn-sm text-rose-300" data-act="habDel" data-i="${i}" type="button" aria-label="Borrar hábito">🗑</button></span></div>
      <div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button class="seg-btn py-1.5 ${h.where === 'train' ? 'seg-on' : ''}" data-act="habWhere" data-i="${i}" data-v="train" type="button">🏋️ Entreno</button><button class="seg-btn py-1.5 ${h.where === 'daily' ? 'seg-on' : ''}" data-act="habWhere" data-i="${i}" data-v="daily" type="button">🍽️ Diario (Dieta)</button></div>
      ${h.where === 'daily' ? `<button class="text-[12px] text-brand flex items-center gap-1" data-act="habDaysOpen" data-i="${i}" type="button">📅 ${daysLabel(h.days)} <span class="text-mute">${ui.habDaysOpen === i ? '▲' : '▼'}</span></button>
        ${ui.habDaysOpen === i ? `<div class="grid grid-cols-7 gap-1">${WEEK_ORDER.map(d => `<button class="seg-btn py-1.5 rounded-lg border ${h.days.includes(d) ? 'seg-on' : 'border-line'}" data-act="habDay" data-i="${i}" data-d="${d}" type="button">${DAY_LETTER[d]}</button>`).join('')}</div>` : ''}
        <div class="lbl">Se cumple con</div>
        <div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button class="seg-btn py-1.5 ${(h.target || 1) === 1 ? 'seg-on' : ''}" data-act="habTarget" data-i="${i}" data-v="1" type="button">1 toque</button><button class="seg-btn py-1.5 ${(h.target || 1) > 1 ? 'seg-on' : ''}" data-act="habTarget" data-i="${i}" data-v="multi" type="button">Varios toques</button></div>
        ${(h.target || 1) > 1 ? `<div class="grid grid-cols-2 gap-2"><label class="lbl">¿Cuántos?<input class="field mt-1" inputmode="numeric" maxlength="2" data-hab-t="${i}" value="${h.target}" /></label><label class="lbl">¿De qué? (opcional)<input class="field mt-1" maxlength="12" data-hab-u="${i}" value="${esc(h.unit || '')}" placeholder="vasos" /></label></div>
        <p class="text-[11px] text-mute">Cada toque en Dieta rellena 1/${h.target} del anillo. Ej.: 8 vasos de 250 ml = 2 L.</p>` : ''}` : ''}
    </div>`).join('') || '<p class="text-xs text-mute">Aún no tienes hábitos.</p>'}</div>
    ${list.length < 12 ? `<div class="flex gap-2"><input class="field flex-1 min-w-0" id="habNew" maxlength="60" placeholder="Nuevo hábito (ej: 💊 Creatina 5 g)" /><button class="btn-primary px-4" data-act="habAdd" type="button">Añadir</button></div>` : '<p class="text-[11px] text-mute">Máximo 12 hábitos.</p>'}`);
}
function dailyHabitsHTML(date) {
  if (!(state.settings.habitList || []).length) return state.settings.habitsHintOff ? '' : `<div class="flex items-center gap-2 mt-3 rounded-xl border border-line bg-panel px-3 py-2 text-[12px] text-mute">
    <span class="flex-1">✅ ¿Suplementos, agua, cero alcohol…? <button class="text-brand underline" data-act="goHabits" type="button">Añade tus hábitos en Ajustes</button></span>
    <button class="iconbtn iconbtn-sm" data-act="habHintOff" type="button" aria-label="No volver a mostrar">✕</button></div>`;
  const list = dailyHabitsFor(date); if (!list.length) return '';
  const done = list.filter(h => habitDone(date, h.name)).length, multi = list.some(h => (h.target || 1) > 1);
  return `<section class="card px-3 py-3 mt-3" data-noswipe>
    <div class="flex items-center justify-between px-1"><h3 class="section-title">✅ Hábitos ${date === todayISO() ? 'de hoy' : 'del día'}</h3><span class="text-[11px] font-bold ${done === list.length ? 'text-emerald-300' : 'text-mute'}">${done}/${list.length}${done === list.length ? ' ✓' : ''}</span></div>
    <div class="grid gap-1 mt-2.5" style="grid-template-columns:repeat(5,minmax(0,1fr))">${list.map(h => habitRingHTML(h, date)).join('')}</div>
    ${multi ? '<p class="text-[10px] text-mute text-center mt-2">Toca para sumar · mantén pulsado para restar</p>' : ''}
  </section>`;
}
/* Icono del hábito: su emoji inicial o, si no lleva, la inicial del nombre */
function habitIcon(name) {
  const m = String(name).match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*(.*)$/u);
  return m ? { icon: m[1], label: m[2] || name, emoji: true } : { icon: (String(name).trim()[0] || '?').toUpperCase(), label: name, emoji: false };
}
const habitCountOf = (date, name) => state.habitCount[date]?.[name] || 0;
function habitRingHTML(h, date) {
  const t = h.target || 1, full = t > 1 ? habitCountOf(date, h.name) : 0, n = t > 1 ? Math.min(t, full) : (habitDone(date, h.name) ? 1 : 0), done = habitDone(date, h.name);
  const { icon, label, emoji } = habitIcon(h.name), R = 20, C = 2 * Math.PI * R, gap = t > 1 ? 3 : 0, seg = C / t - gap;
  const col = done ? '#34d399' : '#22d3ee';
  const arcs = Array.from({ length: t }, (_, i) => `<circle cx="24" cy="24" r="${R}" fill="none" stroke="${i < n ? col : '#334155'}" stroke-width="4" stroke-dasharray="${seg.toFixed(2)} ${(C - seg).toFixed(2)}" stroke-dashoffset="${(-i * C / t).toFixed(2)}"/>`).join('');
  const sub = t > 1 ? `${full}/${t}${h.unit ? ' ' + esc(h.unit) : ''}` : (done ? '✓' : '');
  return `<button class="flex flex-col items-center gap-1 select-none" style="min-width:0;-webkit-touch-callout:none" data-act="dailyHabit" data-name="${esc(h.name)}" type="button" aria-pressed="${done}" aria-label="${esc(h.name)}${t > 1 ? ` ${full} de ${t}` : ''}">
    <span class="relative grid place-items-center rounded-full pointer-events-none" style="width:56px;height:56px;background:${done ? 'rgba(52,211,153,.14)' : 'transparent'}">
      <svg viewBox="0 0 48 48" class="absolute inset-0 -rotate-90 swipe-ok" style="width:56px;height:56px">${arcs}</svg>
      <span class="relative ${emoji ? 'text-lg' : `text-[17px] font-black ${done ? 'text-emerald-300' : 'text-slate-300'}`}" style="${emoji && !n ? 'filter:grayscale(1);opacity:.6' : ''}">${esc(icon)}</span></span>
    <span class="text-[10px] leading-tight text-center w-full truncate pointer-events-none ${done ? 'text-emerald-200' : 'text-mute'}">${esc(label)}</span>
    <span class="text-[10px] font-bold -mt-0.5 pointer-events-none ${done ? 'text-emerald-300' : 'text-brand'}" style="min-height:12px">${sub}</span></button>`;
}
function habitStep(name, delta) {
  const date = ui.dietDate || todayISO(), h = (state.settings.habitList || []).find(x => x.name === name); if (!h) return;
  const t = h.target || 1, cur = state.habitLog[date] || [];
  let doneNow;
  if (t > 1) {
    const c = (state.habitCount[date] ||= {}), n = clamp((c[name] || 0) + delta, 0, 99); // sigue contando por encima del objetivo
    if (n) c[name] = n; else delete c[name];
    if (!Object.keys(c).length) delete state.habitCount[date];
    doneNow = n >= t;
  } else doneNow = delta > 0 ? !cur.includes(name) : false;
  const next = doneNow ? [...new Set([...cur, name])] : cur.filter(x => x !== name);
  if (next.length) state.habitLog[date] = next; else delete state.habitLog[date];
  persist(); render();
}
let habPress = null; // pulsación larga en hábitos (los listeners van junto a los de #app)

/* ---------- Primeros pasos (solo dispositivos nuevos, no administrador) ---------- */
const ACTIVITY = { low: ['Sentada', 1.35], mid: ['Algo activa', 1.5], high: ['Muy activa', 1.65] };
function needsOnboarding(me) {
  const st = state.settings;
  return !me?.admin && !st.onboarded && !st.profile && !state.sessions.length && !Object.keys(state.meals).length && !state.bodyMetrics.length;
}
/* 🎂 Edad a partir de la fecha de nacimiento (se recalcula sola cada día) */
function ageFrom(birth, at = todayISO()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth || '')) return null;
  let a = +at.slice(0, 4) - +birth.slice(0, 4);
  if (at.slice(5) < birth.slice(5)) a--;
  return a >= 0 && a < 120 ? a : null;
}
const profileAge = p => (p?.birth ? ageFrom(p.birth) : (+p?.age || null));
const BIRTH_MIN = '1920-01-01', birthMax = () => addDays(todayISO(), -14 * 365 - 3);
const birthHint = b => { const a = ageFrom(b); return a !== null ? `→ ${a} años` : ''; };
function calcTargets(d) {
  const w = +d.weight, h = +d.height, a = ageFrom(d.birth) ?? +d.age;
  const bmr = 10 * w + 6.25 * h - 5 * a + (d.sex === 'h' ? 5 : d.sex === 'm' ? -161 : -78);
  const adj = { fat: 0.8, recomp: 0.9, muscle: 1.1, maint: 1 }[d.goal] ?? 0.9;
  const kcal = Math.round(bmr * (ACTIVITY[d.activity] || ACTIVITY.mid)[1] * adj / 10) * 10;
  const prot = Math.round(w * ({ fat: 2, recomp: 2, muscle: 1.8, maint: 1.6 }[d.goal] ?? 1.8));
  const fat = Math.round(w * 0.8);
  const carbs = Math.max(50, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { kcal, prot, carbs, fat };
}
/* ✉️ Correo de contacto: con aviso claro, va a la hoja de uso de Esteban (columna «correo») */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTACT_MAIL = 'fitnestebanapp@gmail.com';
const EMAIL_NOTICE = `FITNESTEBAN guardará tu correo para enviarte la guía de la app y, si tú le escribes, resolverte dudas. Nadie más verá tu correo. La app sigue siendo privada. Puedes cambiar el correo en los Ajustes. Si quieres que lo borre, escribe a ${CONTACT_MAIL}.`;
async function googleEmail() {
  if (!navigator.onLine) throw new Error('Sin conexión a internet');
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: 'openid email',
      callback: async r => {
        if (r.error) return reject(new Error(r.error_description || r.error));
        try {
          const u = await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${r.access_token}` } })).json();
          if (!u.email) throw new Error('Google no ha dado el correo');
          resolve(String(u.email).toLowerCase());
        } catch (e) { reject(e); }
      },
      error_callback: e => reject(new Error(e?.type === 'popup_closed' ? 'Ventana de Google cerrada' : e?.type === 'popup_failed_to_open' ? 'El móvil bloqueó la ventana de Google' : (e?.message || 'Error de Google')))
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}
const gBtn = (act = 'google') => `<button class="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 font-bold text-[15px]" style="background:#fff;color:#1f1f1f" data-mact="${act}" type="button"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Continuar con Google</button>`;
const emailFormHTML = (val = '') => `${gBtn()}
    <div class="flex items-center gap-2 text-[11px] text-mute"><span class="flex-1 h-px bg-line"></span>o escríbelo<span class="flex-1 h-px bg-line"></span></div>
    <input class="field" name="email" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@gmail.com" value="${esc(val)}" />
    <p class="text-[11px] text-mute leading-snug">✉️ ${EMAIL_NOTICE}</p>`;
/* 📅 Fecha de alta: nuevos = día de los primeros pasos; antiguos = día de su primer dato guardado (aproximada) */
function installDate() {
  const st = state.settings;
  if (st.installedAt) return st.installedAt;
  const ds = [st.onboarded, ...state.sessions.map(x => x.date), ...Object.keys(state.meals || {}), ...state.bodyMetrics.map(x => x.date), ...(state.cardio || []).map(x => x.date),
    ...Object.values(state.retos || {}).flatMap(r => [r.startedAt, ...(r.history || []).map(h => h.date), ...(r.tests || []).map(t => t.date)])].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || '')).sort();
  st.installedAt = ds[0] || todayISO(); persist();
  return st.installedAt;
}
async function emailSync() {
  try {
    const st = state.settings, url = access.usageUrl, code = lsGet(ACCESS_KEY)?.code, m = st.email || '';
    if (!url || !code || !access.ok || !navigator.onLine || !m || st.emailSent === m) return; // solo se envía un correo nuevo o cambiado; quitarlo de la app no lo borra de la hoja (lo dice el aviso)
    const h = await codeHash(code);
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ h, v: APP_VERSION, m, i: installDate() }) });
    st.emailSent = m; persist();
  } catch { /* se reintenta al volver a abrir la app */ }
}
function setEmail(m) { state.settings.email = m || ''; persist(); emailSync(); }
/* Usuarios que ya tenían la app: se les pide una vez, con «Ahora no» */
function emailAskModal() {
  state.settings.emailAsked = todayISO(); persist();
  const html = (val = '') => `<div class="text-center"><div class="text-4xl">✉️</div><h3 class="modal-title mt-1">¿Nos dejas tu correo?</h3>
      <p class="text-sm text-mute mt-1">Así Esteban te puede mandar la guía de la app y ayudarte si tienes dudas.</p></div>
    ${emailFormHTML(val)}
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar correo</button>
    <button class="btn-ghost w-full" data-close type="button">Ahora no</button>`;
  const save = m => { setEmail(m); closeModal(); render(); toast('Correo guardado ✓ Gracias'); };
  openModal(html(), {
    google: async root => { try { save(await googleEmail()); } catch (e) { toast(e.message, 'warn'); } },
    save: root => { const m = mval(root, 'email').trim().toLowerCase(); if (!EMAIL_RE.test(m)) return toast('Revisa el correo', 'warn'); save(m); }
  });
}
function maybeAskEmail(tries = 0) {
  const st = state.settings;
  if (access.me?.admin || st.email || st.emailAsked || !access.usageUrl) return;
  if ($('#modalRoot').classList.contains('open')) { if (tries < 20) setTimeout(() => maybeAskEmail(tries + 1), 3000); return; }
  emailAskModal();
}

function onboarding() {
  const d = { step: 0, ok: false, email: '', birth: '', name: '', sex: '', age: '', height: '', weight: '', activity: 'mid', goal: 'recomp', key: '', keyOk: false, testing: false };
  const valid = () => d.sex && ageFrom(d.birth) >= 14 && ageFrom(d.birth) <= 100 && +d.height >= 120 && +d.height <= 230 && +d.weight >= 35 && +d.weight <= 250;
  const dots = () => `<div class="flex gap-1.5 justify-center">${[0, 1, 2, 3].map(i => `<span style="height:7px;border-radius:9px;width:${i === d.step ? 22 : 7}px;background:${i === d.step ? '#22d3ee' : '#334155'}"></span>`).join('')}</div><div class="text-[11px] text-mute text-center -mt-1">Paso ${d.step + 1} de 4</div>`;
  const seg = (f, opts, cols) => `<div class="seg" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${Object.entries(opts).map(([k, v]) => `<button class="seg-btn py-2 ${d[f] === k ? 'seg-on' : ''}" data-mact="pick" data-f="${f}" data-v="${k}" type="button">${Array.isArray(v) ? v[0] : v}</button>`).join('')}</div>`;
  const s0 = () => `${dots()}<h3 class="modal-title">👋 Te damos la bienvenida</h3>
    <p class="text-sm text-mute">FITNESTEBAN es un proyecto personal de Esteban que comparte con amigos. Antes de empezar:</p>
    <div class="card p-3 space-y-2 text-[13px] leading-snug">
      <p>📱 <b>Tus datos son tuyos.</b> Se guardan en este móvil y, si quieres, en <b>tu</b> Google Drive. Nadie más los ve.</p>
      <p>🤖 <b>La IA funciona con tu propia clave de Gemini.</b> Es gratuita dentro de los límites de Google.</p>
      <p>🩺 <b>No sustituye a un profesional.</b> Las cifras son orientativas: si tienes lesiones, embarazo o algún problema de salud, consulta antes.</p>
      <p>🛠️ <b>Es un proyecto vivo.</b> Irá mejorando, pero puede tener fallos o cambiar.</p>
      <p>📶 <b>Para mantener la app</b>, envía a Esteban solo el día de último uso, la versión instalada y un identificador del dispositivo (sin datos personales). Nada de tu dieta ni de tus entrenos.</p>
      <p>🔑 <b>Tu código es solo tuyo:</b> funciona como mucho en 2 dispositivos.</p>
      <p>✉️ <b>Tu correo</b> lo guarda Esteban para enviarte la guía de la app y, si tú le escribes, resolverte dudas. Para escribirle, toca ✉️ arriba.</p>
      <p class="text-mute">Todo, con detalle, en la <a class="text-brand underline" href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</p>
    </div>
    <label class="flex items-start gap-2 text-[13px]"><input type="checkbox" name="ok" ${d.ok ? 'checked' : ''} style="margin-top:3px;accent-color:#22d3ee;width:18px;height:18px" /> Lo he leído y estoy de acuerdo.</label>
    <button class="btn-primary w-full" data-mact="next" type="button">Empezar</button>`;
  const sMail = () => `${dots()}<h3 class="modal-title">✉️ Tu correo</h3>
    <p class="text-xs text-mute">Lo necesitamos para mandarte la guía de la app y poder ayudarte.</p>
    ${emailFormHTML(d.email)}
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="back" type="button">Atrás</button><button class="btn-primary" data-mact="next" type="button">Siguiente</button></div>`;
  const s1 = () => {
    const t = valid() ? calcTargets(d) : null;
    return `${dots()}<h3 class="modal-title">🎯 Tu perfil y tus objetivos</h3>
    <p class="text-xs text-mute">Con esto calculamos tus objetivos de partida. Los puedes cambiar cuando quieras en Ajustes.</p>
    <label class="lbl">Nombre<input class="field mt-1" name="name" maxlength="24" value="${esc(d.name)}" /></label>
    <div><div class="lbl mb-1">Sexo</div>${seg('sex', SEXES, 3)}</div>
    <label class="lbl">Fecha de nacimiento <span class="text-brand font-bold" id="obAge">${birthHint(d.birth)}</span><input class="field mt-1" name="birth" type="date" min="${BIRTH_MIN}" max="${birthMax()}" value="${esc(d.birth)}" /></label>
    <div class="grid grid-cols-2 gap-2">
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
      : '<div class="text-[12px] text-mute text-center">Rellena sexo, fecha de nacimiento, altura y peso para calcular tus objetivos.</div>'}</div>
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
  const html = () => [s0, sMail, s1, s2][d.step]();
  const keep = root => {
    const g = n => root.querySelector(`[name="${n}"]`);
    if (g('ok')) d.ok = g('ok').checked;
    if (g('email')) d.email = g('email').value.trim().toLowerCase();
    if (g('name')) { d.name = g('name').value.trim(); d.birth = g('birth').value; d.height = g('height').value.replace(/\D/g, ''); d.weight = g('weight').value.replace(',', '.').replace(/[^\d.]/g, ''); }
    if (g('key')) d.key = g('key').value.trim();
  };
  const draw = root => { root.querySelector('.modal-sheet').innerHTML = html(); root.querySelector('.modal-sheet').scrollTop = 0; bindLive(root); };
  const bindLive = root => {
    if (d.step === 2) root.querySelectorAll('[name=birth],[name=height],[name=weight]').forEach(i => i.oninput = i.onchange = () => { keep(root); const box = root.querySelector('#obTargets'), tmp = document.createElement('div'); tmp.innerHTML = s1(); box.innerHTML = tmp.querySelector('#obTargets').innerHTML; const ag = root.querySelector('#obAge'); if (ag) ag.textContent = birthHint(d.birth); });
    if (d.step === 3) { const k = root.querySelector('[name=key]'); if (k) k.oninput = () => { d.keyOk = false; const m = root.querySelector('#obKeyMsg'); if (m) m.textContent = ''; }; }
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
    google: async root => { keep(root); try { d.email = await googleEmail(); d.step++; draw(root); toast(`✓ ${d.email}`); } catch (e) { toast(e.message, 'warn'); } },
    back: root => { keep(root); d.step--; draw(root); },
    next: root => {
      keep(root);
      if (d.step === 0 && !d.ok) return toast('Marca la casilla para continuar', 'warn');
      if (d.step === 1 && !EMAIL_RE.test(d.email)) return toast('Escribe tu correo o usa «Continuar con Google»', 'warn');
      if (d.step === 2) {
        if (!d.name) return toast('Escribe tu nombre', 'warn');
        if (!valid()) return toast('Revisa sexo, fecha de nacimiento, altura (cm) y peso (kg)', 'warn');
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
      st.profile = { name: d.name.slice(0, 24), sex: d.sex, birth: d.birth, height: d.height, goal: d.goal, activity: d.activity };
      Object.assign(st, { targetKcal: t.kcal, targetProt: t.prot, targetCarbs: t.carbs, targetFat: t.fat, onboarded: todayISO(), installedAt: todayISO(), usageOk: true, email: d.email, emailAsked: todayISO() });
      if (!b.dataset.skip && d.keyOk) st.apiKey = d.key;
      state.bodyMetrics.push({ id: uid('m_'), date: todayISO(), weight: r2(+d.weight), waist: null });
      persist(); emailSync(); closeModal(); ui._animRings = true; render();
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
  const who = [p.sex === 'h' ? 'hombre' : p.sex === 'm' ? 'mujer' : 'persona', profileAge(p) ? `de ${profileAge(p)} años` : 'adulta'].join(' ') + (p.height ? `, ${p.height} cm de altura` : '');
  return `${p.name || 'el usuario'} (${who}), objetivo: ${(GOALS[p.goal] || GOALS.recomp)[1]}`;
}
function profileModal(after) {
  const p = profileOf() || { name: '', sex: '', age: '', goal: 'recomp' };
  const seg = (name, opts, cur) => `<div class="seg" style="grid-template-columns:repeat(${name === 'goal' ? 2 : Object.keys(opts).length},minmax(0,1fr))">${Object.entries(opts).map(([k, v]) => `<button class="seg-btn py-2 ${cur === k ? 'seg-on' : ''}" data-mact="pick" data-f="${name}" data-v="${k}" type="button">${Array.isArray(v) ? v[0] : v}</button>`).join('')}</div>`;
  const draft = { ...p, email: state.settings.email || '' };
  const html = () => `<h3 class="modal-title">👤 Mi perfil</h3>
    <p class="text-xs text-mute">El Coach IA y el resumen semanal lo usan para darte consejos a tu medida. Solo se guarda en este móvil y en tus copias.</p>
    <label class="lbl">Nombre<input class="field mt-1" name="name" maxlength="24" value="${esc(draft.name || '')}" /></label>
    <div><div class="lbl mb-1">Sexo</div>${seg('sex', SEXES, draft.sex)}</div>
    <div class="grid grid-cols-2 gap-2">
      <label class="lbl col-span-2">Fecha de nacimiento (opcional) <span class="text-brand font-bold" id="pfAge">${birthHint(draft.birth)}</span><input class="field mt-1" name="birth" type="date" min="${BIRTH_MIN}" max="${birthMax()}" value="${esc(draft.birth || '')}" />${!draft.birth && p.age ? `<span class="block text-[11px] text-amber-300 font-normal mt-1">Ahora pone ${esc(p.age)} años. Pon tu fecha y se actualizará sola en cada cumpleaños.</span>` : ''}</label>
      <label class="lbl">Altura en cm (opcional)<input class="field mt-1" name="height" inputmode="numeric" maxlength="3" placeholder="Ej: 175" value="${esc(draft.height || '')}" /></label>
    </div>
    <div><div class="lbl mb-1">Objetivo</div>${seg('goal', GOALS, draft.goal)}</div>
    <div class="card p-3 space-y-2"><div class="lbl">✉️ Correo de contacto${access.me?.admin ? '' : ' (opcional)'}</div>
      <div class="flex gap-2"><input class="field flex-1 min-w-0" name="email" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@gmail.com" value="${esc(draft.email)}" /></div>
      ${draft.email ? '' : gBtn()}
      <p class="text-[10px] text-mute leading-snug">${EMAIL_NOTICE}</p></div>
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar</button>`;
  const keep = root => { draft.name = mval(root, 'name').trim(); draft.birth = mval(root, 'birth'); draft.height = mval(root, 'height').replace(/\D/g, ''); draft.email = mval(root, 'email').trim().toLowerCase(); };
  const handlers = {
    autofocus: !p.name,
    pick: (root, b) => { keep(root); draft[b.dataset.f] = b.dataset.v; root.querySelector('.modal-sheet').innerHTML = html(); },
    google: async root => { keep(root); try { draft.email = await googleEmail(); root.querySelector('.modal-sheet').innerHTML = html(); } catch (e) { toast(e.message, 'warn'); } },
    save: root => {
      keep(root);
      if (draft.email && !EMAIL_RE.test(draft.email)) return toast('Revisa el correo', 'warn');
      if (!draft.name) return toast('Pon tu nombre', 'warn');
      if (!draft.sex) return toast('Elige una opción de sexo', 'warn');
      if (draft.height && (+draft.height < 100 || +draft.height > 230)) return toast('La altura va en centímetros (ej. 175)', 'warn');
      if (draft.birth && !(ageFrom(draft.birth) >= 10)) return toast('Revisa la fecha de nacimiento', 'warn');
      state.settings.profile = { ...(p.activity ? { activity: p.activity } : {}), name: draft.name.slice(0, 24), sex: draft.sex, ...(draft.birth ? { birth: draft.birth } : p.age ? { age: p.age } : {}), height: draft.height || '', goal: draft.goal || 'recomp' };
      if ((state.settings.email || '') !== draft.email) setEmail(draft.email);
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
        <p class="text-xs ${p ? 'text-slate-300' : 'text-amber-300'} mt-1 truncate">${p ? `${esc(p.name)} · ${esc(SEXES[p.sex] || '')}${profileAge(p) ? ` · ${profileAge(p)} años` : ''}${p.height ? ` · ${esc(p.height)} cm` : ''} · ${esc((GOALS[p.goal] || GOALS.recomp)[0])}${state.settings.email ? ` · ✉️ ${esc(state.settings.email)}` : ''}` : 'Sin rellenar: el Coach IA no sabe a quién aconseja'}</p></div>
      <button class="btn-ghost px-3 py-2 shrink-0" data-act="editProfile" type="button">${p ? 'Editar' : 'Rellenar'}</button>
    </div></section>`;
}

/* =========================================================================
   COACH IA (chat con tus datos)
   ========================================================================= */
const CHAT_CHIPS = ['¿Cómo voy esta semana?', '¿Qué ceno hoy para cuadrar macros?', '¿Por qué me estanco y qué cambio?', '¿Qué entreno hoy?'];
function chatContext() {
  const T = todayISO(), st = state.settings;
  const setTxt = (exId, x, tm) => (isBwEx(exId) ? (x.w ? `PC+${x.w}` : 'PC') : `${x.w}kg`) + (tm ? ` ${x.r}s` : `x${x.r}`);
  const t = totalsOf(T), burn = exerciseBurnOf(T), budget = st.targetKcal + (st.eatBackCardio ? burn : 0);
  const days7 = Array.from({ length: 7 }, (_, i) => addDays(T, -i)).filter(d => mealsOf(d).length).map(d => { const x = totalsOf(d); return { fecha: d, kcal: Math.round(x.kcal), P: Math.round(x.prot), C: Math.round(x.carbs), G: Math.round(x.fat) }; });
  const plan = prog().days.map(day => ({
    dia: day.label, titulo: day.title,
    ejercicios: day.exercises.map(e => { const { key, variant } = variantOf(e); const c = coachFor(e, key); return { nombre: variant.name, series: e.sets, reps: `${e.minReps}-${e.maxReps}${e.timed ? ' segundos (por tiempo)' : ''}`, peso_corporal: !!e.bw, coach_app: `${c.title}. ${c.text}` }; })
  }));
  const last = sortedSessions().slice(-8).reverse().map(s => ({ fecha: s.date, dia: s.dayTitle, min: s.durationMin || null, descarga: !!s.deload, ejercicios_saltados: s.skipped || [], comentarios: (s.notes || []).map(n => `${n.name}: ${noteTxt(n)}`),
    ejercicios: s.exercises.map(e => `${e.name}: ${e.sets.map(x => setTxt(e.exId, x, isTimedEx(e))).join(', ')}`) }));
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
    musculos: (() => { const f = muscleFatigue(), v = muscleVolume(30); return { fatiga_ahora_pct: Object.fromEntries(Object.entries(f).filter(([, x]) => x.frac > 0.1).map(([m, x]) => [MUSCLE_NAMES[m], Math.round(x.frac * 100)])), series_30_dias: Object.fromEntries(Object.keys(MUSCLE_NAMES).map(m => [MUSCLE_NAMES[m], Math.round((v[m] || 0) * 2) / 2])) }; })(),
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
- Ten en cuenta sus comentarios por ejercicio ("comentarios" en ultimas_sesiones: molestias, muy duro, fácil, poco tiempo, notas). Si se repiten molestias o "muy duro" en un ejercicio, propón una alternativa (puede cambiarla con ⇄ en la app) o ajustar carga/volumen; si algo le resulta fácil varias veces, anímale a progresar.
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
    : `<div class="chat-ai${m.error ? ' chat-err' : ''}">${mdLite(m.text)}${m.error && i === c.msgs.length - 1 ? '<button class="text-xs text-brand underline mt-1" data-mact="retry" type="button">Reintentar</button>' : ''}${(m.meals || []).map((ml, j) => `<div class="flex gap-2 items-stretch"><button class="chat-meal flex-1 min-w-0" data-mact="toDiet" data-m="${i}" data-o="${j}" type="button"><span>🍽️ Apuntar en Dieta</span><span class="text-[11px] opacity-80 truncate max-w-full">${m.meals.length > 1 ? esc(ml.title) + ' · ' : ''}${esc(ml.type || 'comida que toca')} · ~${mealKcal(ml)} kcal</span></button><button class="chat-meal !w-auto shrink-0 items-center justify-center" data-mact="recipe" data-m="${i}" data-o="${j}" type="button"><span>👨‍🍳 Receta</span><span class="text-[11px] opacity-80">${ml.recipe ? 'guardada' : 'paso a paso'}</span></button></div>`).join('')}</div>`).join('')
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
function openChat(keep) {
  if (!profileOf()) return profileModal(openChat);
  if (!(keep === true && ui.chat)) { ui.chat = { msgs: [], busy: false }; ui.histOpen = false; ui.histAll = false; }
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
    recipe: (r, b) => recipeSheet(+b.dataset.m, +b.dataset.o),
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
$('#chatBtn')?.addEventListener('click', () => openChat());

/* 👨‍🍳 Receta paso a paso de un plato propuesto por el Coach. Los ingredientes y gramos son SIEMPRE los del plato
   (lo que se apunta en Dieta); Gemini solo añade condimentos sin calorías relevantes, utensilios y pasos. */
async function fetchRecipe(ml, wish = '', chatMsgs = []) {
  const ing = ml.items.map(it => `${it.name}: ${it.grams} g`).join('; ');
  const said = chatMsgs.filter(m => m.role === 'user').slice(-6).map(m => m.text.slice(0, 200)).join(' | ');
  const prompt = `Eres cocinero y nutricionista en España. Escribe la receta para 1 persona de «${ml.title}» usando EXACTAMENTE estos ingredientes y cantidades (ya pesados, no cambies ni añadas gramos): ${ing}.
Reglas:
- No añadas ningún ingrediente con calorías (ni aceite, ni mantequilla, ni salsas, ni azúcar, ni pan) que no esté en la lista. Si el plato necesita grasa para cocinar y no hay aceite en la lista, usa sartén antiadherente, horno, airfryer, plancha o un toque de spray.
- Sí puedes usar sal, pimienta, especias, hierbas, ajo, limón, vinagre, mostaza y agua (cantidades orientativas: "1 pizca", "1 diente"…).
- Pasos cortos, claros y en orden (máximo 8), en español de España, tuteando. Indica temperaturas y tiempos concretos.
${said ? `- Lo que el usuario ha dicho en la conversación (respeta sus preferencias de cocinado, utensilios y gustos): ${said}\n` : ''}${wish ? `- PETICIÓN PARA ESTA RECETA (manda sobre todo lo demás, salvo las cantidades): ${wish.slice(0, 200)}\n` : ''}
Devuelve SOLO este JSON: {"titulo":"…","tiempo_min":n,"dificultad":"Fácil|Media","utensilios":["…"],"condimentos":["…"],"pasos":[{"texto":"…","min":n o null}],"consejo":"una frase"}`;
  const r = parseJSONLoose(await callGemini([{ text: prompt }], { timeout: 45000, temperature: 0.4 }));
  const steps = (Array.isArray(r.pasos) ? r.pasos : []).map(p => ({ t: String(p?.texto ?? p ?? '').slice(0, 400), min: Math.round(num(p?.min) || 0) || null })).filter(p => p.t).slice(0, 10);
  if (!steps.length) throw new Error('La IA no devolvió los pasos. Prueba otra vez.');
  const list = v => (Array.isArray(v) ? v : []).map(x => String(x).slice(0, 60)).filter(Boolean).slice(0, 10);
  return { title: String(r.titulo || ml.title).slice(0, 70), mins: Math.round(num(r.tiempo_min) || 0) || null, level: String(r.dificultad || '').slice(0, 12), tools: list(r.utensilios), extras: list(r.condimentos), steps, tip: String(r.consejo || '').slice(0, 240), at: Date.now() };
}
function recipeSheet(mi, oi) {
  const ml = ui.chat?.msgs[mi]?.meals?.[oi]; if (!ml) return;
  const st = { busy: !ml.recipe, err: '', wish: '' };
  const tot = k => Math.round(ml.items.reduce((a, it) => a + it.per100[k] * it.grams / 100, 0));
  const body = () => {
    const rc = ml.recipe;
    const head = `<div class="flex flex-wrap gap-1.5 text-[11px] font-bold">
        <span class="rounded-full px-2.5 py-1 ${MAC.kcal.text}" style="background:rgba(250,204,21,.1)">${tot('kcal')} kcal</span>
        <span class="rounded-full px-2.5 py-1 ${MAC.prot.text}" style="background:rgba(34,211,238,.1)">P ${tot('prot')} g</span>
        <span class="rounded-full px-2.5 py-1 ${MAC.carbs.text}" style="background:rgba(52,211,153,.1)">C ${tot('carbs')} g</span>
        <span class="rounded-full px-2.5 py-1 ${MAC.fat.text}" style="background:rgba(251,113,133,.1)">G ${tot('fat')} g</span>
        ${rc?.mins ? `<span class="rounded-full px-2.5 py-1 text-slate-300 bg-panel border border-line">⏱ ${rc.mins} min</span>` : ''}${rc?.level ? `<span class="rounded-full px-2.5 py-1 text-slate-300 bg-panel border border-line">${esc(rc.level)}</span>` : ''}
      </div>`;
    const ingr = `<div class="card p-3"><div class="text-[11px] font-bold uppercase tracking-wider text-brand mb-1.5">🥘 Ingredientes · 1 ración</div>
        ${ml.items.map(it => `<div class="flex justify-between gap-3 py-1 text-sm border-b border-line/60 last:border-0"><span>${esc(it.name)}</span><span class="font-mono text-slate-300 shrink-0">${it.grams} g</span></div>`).join('')}
        ${rc?.extras?.length ? `<div class="text-[12px] text-mute mt-2">🧂 Al gusto: ${rc.extras.map(esc).join(' · ')}</div>` : ''}
        <p class="text-[10px] text-mute mt-1.5">Son las cantidades del plato del Coach: si las cambias, cambian los macros.</p></div>`;
    if (st.busy) return head + ingr + '<div class="card p-4 text-center text-sm text-mute"><div class="chat-typing inline-flex"><span></span><span></span><span></span></div><div class="mt-2">Preparando la receta…</div></div>';
    if (!rc) return head + ingr + `<div class="card p-4 text-center text-sm text-rose-300">${esc(st.err || 'No se pudo preparar la receta.')}<br><button class="btn-ghost mt-3" data-mact="again" type="button">Reintentar</button></div>`;
    return head + ingr + `
      ${rc.tools.length ? `<div class="text-[12px] text-mute">🍳 Necesitas: ${rc.tools.map(esc).join(' · ')}</div>` : ''}
      <div class="card p-3"><div class="text-[11px] font-bold uppercase tracking-wider text-brand mb-2">👨‍🍳 Paso a paso</div>
        <ol class="space-y-2.5">${rc.steps.map((p, k) => `<li class="flex gap-3"><span class="w-7 h-7 shrink-0 rounded-full grid place-items-center text-[13px] font-black text-ink" style="background:linear-gradient(135deg,#22d3ee,#34d399)">${k + 1}</span><span class="text-sm leading-relaxed pt-0.5">${esc(p.t)}${p.min ? ` <span class="text-[11px] text-brand font-bold whitespace-nowrap">⏱ ${p.min} min</span>` : ''}</span></li>`).join('')}</ol></div>
      ${rc.tip ? `<div class="rounded-xl px-3 py-2 text-[12px] text-amber-200" style="background:rgba(252,211,77,.08);border:1px solid rgba(252,211,77,.3)">💡 ${esc(rc.tip)}</div>` : ''}
      ${rc.wish ? `<p class="text-[11px] text-mute text-center">Rehecha con: «${esc(rc.wish)}»</p>` : ''}
      <div class="card p-3 space-y-2"><div class="text-[11px] font-bold uppercase tracking-wider text-brand">🔄 ¿Cambiar algo?</div>
        <div class="flex gap-2"><input class="field flex-1 min-w-0 !py-2 text-sm" id="recipeWish" placeholder="Ej.: a la plancha, sin horno, en airfryer…" autocomplete="off" />
        <button class="btn-primary shrink-0 !px-3 !py-2 text-sm" data-mact="redo" type="button">Rehacer</button></div>
        <p class="text-[10px] text-mute">Cambia la forma de cocinarlo; los ingredientes y gramos se mantienen.</p></div>`;
  };
  const paint = () => { const b = $('#recipeBody'); if (b) b.innerHTML = body(); };
  const load = async () => {
    st.busy = true; st.err = ''; paint();
    try { ml.recipe = await fetchRecipe(ml, st.wish, ui.chat.msgs); if (st.wish) ml.recipe.wish = st.wish; saveChatConv(ui.chat); }
    catch (e) { st.err = 'No he podido preparar la receta: ' + e.message; }
    st.busy = false; paint();
  };
  openModal(`
    <div class="cal-head flex items-center gap-2 pb-3">
      <button class="w-8 h-8 rounded-full border border-line text-mute shrink-0" data-mact="back" type="button" aria-label="Volver al chat">‹</button>
      <div class="min-w-0 flex-1"><div class="text-[11px] font-bold uppercase tracking-wider text-brand">👨‍🍳 Receta${ml.type ? ' · ' + esc(ml.type) : ''}</div><h3 class="modal-title leading-tight truncate">${esc(ml.recipe?.title || ml.title)}</h3></div>
    </div>
    <div id="recipeBody" class="cal-body space-y-3">${body()}</div>
    <div class="cal-foot grid grid-cols-2 gap-2">
      <button class="btn-ghost" data-mact="back" type="button">‹ Chat</button>
      <button class="btn-primary" data-mact="toDiet" type="button">🍽️ Apuntar en Dieta</button>
    </div>`, {
    sheetClass: 'sheet-fixed',
    back: () => openChat(true),
    toDiet: () => mealFromChat(ml),
    again: () => load(),
    redo: () => { st.wish = ($('#recipeWish')?.value || '').trim(); load(); }
  });
  if (!ml.recipe) load();
}

/* =========================================================================
   GUÍA Y NOVEDADES
   ========================================================================= */
/* Tercer campo opcional: 'admin' = solo lo ve el administrador; 'quiet' = arreglo sin aviso.
   El resto de usuarios no reciben aviso por esas versiones; en el historial les sale «Mejoras en la aplicación». */
const CHANGELOG = [
  ['4.42.1', ['⚡ Scroll más fluido con el aspecto nuevo.'], 'quiet'],
  ['4.42.0', ['🎨 Nuevo aspecto: tarjetas con un brillo suave, iconos de línea en cada sección, un icono para cada tipo de comida en Dieta y la pestaña activa iluminada abajo. Todo sigue en su sitio.']],
  ['4.41.9', ['🔒 Nueva página de política de privacidad, enlazada desde la guía «?» y los primeros pasos.'], 'quiet'],
  ['4.41.8', ['📊 Acceso: botón «Abrir hoja de uso». Pega una vez el enlace de la hoja (se guarda solo en ese dispositivo).'], 'admin'],
  ['4.41.7', ['🔧 Script v8: la comprobación del dispositivo usaba un parámetro que Google reserva («c») y fallaba siempre. Hay que pegar el script nuevo (Reconfigurar) y publicar una «Nueva versión».'], 'admin'],
  ['4.41.6', ['🔧 Script v7: si falla, la app muestra el error en «Este dispositivo», y tiene una función «probar» para autorizar permisos. Reconfigurar reutiliza la clave actual, así el código siempre cuadra.'], 'admin'],
  ['4.41.5', ['🔧 Ajustes → Aplicación: «Este dispositivo» muestra si está registrado en el límite de dispositivos o qué responde el script, con un botón «Comprobar».'], 'quiet'],
  ['4.41.4', ['🔑 El registro del dispositivo espera más al script de Google y, si no contesta, lo vuelve a intentar al volver a la app. En Acceso, tu fila pone «sin límite (administrador)». «Enviármelo» manda el script como archivo, sin cortes.'], 'admin'],
  ['4.41.3', ['🔑 Pantalla de acceso: «Cada código es personal. Válido solo en 2 dispositivos.» Invitación por WhatsApp: «Es personal. Válido solo en 2 dispositivos.»'], 'quiet'],
  ['4.41.1', ['🔑 Acceso: cada dispositivo sale por separado (Android · Chrome, Windows · Chrome…) con su último uso y un botón «Quitar» que libera solo ese; el quitado ya no puede volver a entrar con ese código. Requiere el script v6 (Reconfigurar → nueva versión).'], 'admin'],
  ['4.41.0', ['🔑 Tu código es solo tuyo: funciona como mucho en 2 dispositivos (por ejemplo, tu móvil y tu tablet). Para ello la app envía a Esteban un identificador del dispositivo, sin datos personales. Si cambias de móvil y no puedes entrar, escribe a fitnestebanapp@gmail.com.']],
  ['4.40.1', ['📅 Hoja de uso: nueva columna «alta» con la fecha en que cada persona empezó a usar la app (la de sus primeros pasos o, si ya la usaba antes, la de su primer dato guardado). Requiere actualizar el script una vez (Reconfigurar → nueva versión).'], 'admin'],
  ['4.40.0', ['🎂 Mi perfil: ahora pones tu fecha de nacimiento en lugar de la edad, y la app y el Coach calculan tu edad solos (en tu cumpleaños sube sola). Si ya tenías la edad puesta, se mantiene hasta que añadas la fecha en Ajustes → Mi perfil.']],
  ['4.39.3', ['⏱ Descanso: con la cuenta atrás en marcha, «?» y ✉️ se apartan y el temporizador se hace grande y se va vaciando; en los últimos 5 segundos se pone ámbar y late.'], 'quiet'],
  ['4.39.2', ['🔧 Cabecera: con la cuenta atrás en marcha, los botones ya no tapan el logotipo.'], 'quiet'],
  ['4.39.1', ['✉️ Nuevo botón con un sobre arriba (junto a «?»): abre tu correo para escribir a fitnestebanapp@gmail.com si tienes dudas, encuentras un fallo o tienes ideas.']],
  ['4.39.0', ['✉️ Correo de contacto: FITNESTEBAN guardará tu correo para enviarte la guía de la app y, si tú le escribes, resolverte dudas. Puedes ponerlo con «Continuar con Google» o escribirlo, y cambiarlo en Ajustes → Mi perfil.']],
  ['4.38.0', ['★ Comidas favoritas: en el registro de Dieta toca ☆ en cualquier comida para guardarla. Sale la primera en «Favoritas y habituales» (según el tipo: Desayuno, Comida…) y la repites en un toque. Toca la ★ para quitarla.']],
  ['4.37.4', ['⭕ Hábitos de varios toques (agua…): al llegar al objetivo siguen contando (10/8 vasos).'], 'quiet'],
  ['4.37.3', ['🍽️ Dieta: Desayuno, Comida, Puente, Cena y Otro caben en una sola fila.'], 'quiet'],
  ['4.37.2', ['📚 Progreso: el historial de sesiones va plegado, como los récords; a la derecha ves cuántas hay y la fecha de la última.'], 'quiet'],
  ['4.37.1', ['🕘 Novedades: al final del historial, «Ver novedades anteriores» va mostrando todas las versiones hasta el principio.'], 'admin'],
  ['4.37.0', ['👨‍🍳 Recetas del Coach: cuando el Coach IA te propone un plato, pulsa «Receta» y verás cómo prepararlo paso a paso, con los mismos ingredientes y gramos que se apuntan en Dieta. Se guarda en la conversación y con «¿Cambiar algo?» la rehaces (a la plancha, en airfryer…).']],
  ['4.36.0', ['🏆 Tus retos ya salen en Progreso → Historial, junto a tus sesiones, y en el calendario de Dieta (con su 🏆 en cada día).']],
  ['4.35.0', ['👆 Desliza el dedo sobre el mapa muscular de Progreso para pasar de Ahora a 7 días y 30 días.', '👆 El gesto de deslizar queda fijo: en Dieta cambia de día y en Entreno, de bloque. Ya no hay que elegirlo en Ajustes.']],
  ['4.34.1', ['🧍 Mapa muscular: lo que entrenas (gimnasio o retos) se refleja al momento en «Ahora». Antes no aparecía hasta las 7 de la tarde. Los retos cuentan todas las series que haces y el test de máximo también suma.']],
  ['4.34.0', ['＋ Añadir ejercicio: ahora hay 141 ejercicios preparados, con máquinas, poleas, core y un grupo nuevo de 🎗️ bandas elásticas para entrenar en casa.', '⏱ Ejercicios por tiempo (plancha, plancha lateral, paseo del granjero): cada serie lleva su cronómetro. Pulsa ⏱, cuenta atrás de 3 s, te avisa al llegar al objetivo y guarda los segundos solo. En tus propios ejercicios puedes activarlo desde ✎ → «Por tiempo».']],
  ['4.33.1', ['＋ Añadir bloque: cada bloque sale una sola vez y, si ya lo tienes, pone «✓ Ya lo tienes» en vez de ofrecer otra copia.'], 'quiet'],
  ['4.33.0', ['📤 Compartir con todos: en el ✎ de cualquier bloque o ejercicio tuyo verás «Compartir con todos». Les aparecerá al pulsar ＋ (con la etiqueta NUEVO). Puedes actualizarlo o dejar de compartirlo desde el mismo sitio.'], 'admin'],
  ['4.32.0', ['＋ Añadir ejercicio: además de crear el tuyo, eliges entre más de 60 ejercicios preparados (por grupos y con buscador), ya configurados con series, reps, descanso, técnica y 2 alternativas.']],
  ['4.31.0', ['＋ Añadir bloque: el botón ＋ junto a ✎ en Entreno te deja crear un bloque vacío o elegir uno preparado por Esteban. Estreno: 🔔 KETTLEBELL, para entrenar en casa. Irán llegando más.', '🧹 Si nunca usaste ni cambiaste PPT o FULL BODY, se han quitado para dejarte la app limpia: si los quieres, están en ＋. Los bloques que usas o editaste siguen igual.']],
  ['4.30.0', ['🔥 Mapa muscular en Progreso: «Ahora» te muestra qué músculos siguen cargados y cuándo estarán listos; «7 días» y «30 días», cuánto has trabajado cada uno y cuáles tienes olvidados. Usa todas tus sesiones y retos ya guardados. En «Hoy te toca» verás si lo que toca está recuperado.']],
  ['4.29.0', ['💬 «Comenta al Coach» en cada ejercicio: marca 😣 molestia, 🥵 muy duro, 😌 fácil o ⏱ poco tiempo y escribe lo que notes. Se guarda con la sesión, te lo recuerdo la próxima vez, el Coach IA y el resumen semanal lo tienen en cuenta, y con 😣 o 🥵 no te subo peso.']],
  ['4.28.0', ['⭕ Hábitos diarios en Dieta más compactos: un anillo por hábito. Y ahora pueden ser «de varios toques» (por ejemplo 8 vasos de agua): cada toque rellena un tramo del anillo; mantén pulsado para restar. Se configura en Ajustes → Hábitos.']],
  ['4.27.5', ['✎ Hábitos: ahora puedes cambiarles el nombre (sin perder lo ya marcado) y ordenarlos con ▲▼ en Ajustes.']],
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
    'El ＋ junto al ✎ de arriba añade un bloque (vacío o uno preparado por Esteban) y «＋ Día» crea días. «＋ Añadir ejercicio» deja crear uno o elegir entre los preparados. El ✎ del bloque o del día permite renombrar, reordenar (◀ ▶) o eliminar. El historial nunca se borra al eliminar.'
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
    '👆 Deslizar el dedo: en Dieta pasa al día siguiente o anterior (como las flechas ‹ ›); en Entreno, al bloque siguiente o anterior (con un entreno en curso no hace nada, para no sacarte de la serie); en Progreso, sobre el mapa muscular, cambia entre Ahora, 7 días y 30 días. Las pestañas se cambian con la barra de abajo.',
    '📅 Toca la <b>fecha</b> de Dieta para abrir el calendario del mes: punto verde/ámbar/rojo según la dieta, 🏋️ si hubo pesas y 🔥 si hubo cardio. Al tocar un día ves el detalle y puedes ir a sus comidas.',
    '✎ en una comida la edita y ☆ la guarda en favoritas; ⭐ «Favoritas y habituales» te enseña primero tus favoritas y luego tus platos más frecuentes de ese tipo, y el buscador encuentra cualquiera del historial.'
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
    'Tras actualizar verás una vez las novedades. Puedes volver a verlas desde esta guía.',
    '✉️ El sobre de arriba abre tu correo para escribir a fitnestebanapp@gmail.com: dudas, fallos o ideas.',
    '🔒 Qué datos usa la app y dónde se guardan: <a class="text-brand underline" href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.'
  ]]
];

const isAdminUser = () => !!access.me?.admin;
const newsForMe = ([, , tag]) => isAdminUser() || !tag;
function newsRows(fromVer) {
  let list = CHANGELOG.filter(([v]) => !fromVer || cmpVer(v, fromVer) > 0);
  if (fromVer && !isAdminUser()) list = list.filter(newsForMe);
  // historial para usuarios: las versiones internas seguidas se agrupan en una sola línea
  const rows = [];
  for (const e of list) {
    if (newsForMe(e)) rows.push({ v: e[0], items: e[1] });
    else if (rows.length && rows[rows.length - 1].internal) rows[rows.length - 1].v2 = e[0];
    else rows.push({ v: e[0], items: ['🔧 Mejoras en la aplicación.'], internal: true });
  }
  return rows;
}
const newsRowHTML = r => `<div class="mt-3 first:mt-0">
      <div class="text-xs font-extrabold ${r.internal ? 'text-mute' : 'text-brand'}">Versión ${r.v2 ? r.v2 + '–' + r.v : r.v}</div>
      <ul class="mt-1 space-y-1 text-sm ${r.internal ? 'text-mute' : 'text-slate-300'} list-disc pl-5">${r.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`;
/* Novedades: primero las nuevas (o las 4 últimas) y «Ver novedades anteriores» va ampliando de 8 en 8 hasta el principio */
function openNews(fromVer) {
  const fresh = newsRows(fromVer), all = newsRows(null);
  let shown = fromVer ? fresh.length : Math.min(4, all.length);
  const list = () => fromVer && shown <= fresh.length ? fresh.slice(0, shown) : all.slice(0, shown);
  const total = () => (fromVer && shown <= fresh.length ? Math.max(fresh.length, all.length) : all.length);
  const html = () => `
    <div class="flex items-center gap-2"><span class="text-2xl">🎉</span><h3 class="modal-title">Novedades</h3><span class="text-xs text-mute ml-auto">v${APP_VERSION}</span></div>
    <div>${list().map(newsRowHTML).join('')}</div>
    ${shown < total() ? `<button class="w-full text-center text-sm text-brand font-bold py-2.5 rounded-xl border border-line bg-ink" data-mact="more" type="button">🕘 Ver novedades anteriores <span class="text-mute font-normal">(${total() - shown})</span></button>` : `<p class="text-[11px] text-mute text-center">Has llegado al principio del historial.</p>`}
    <button class="btn-primary w-full mt-1" data-close type="button">Entendido</button>`;
  openModal(html(), {
    more: root => {
      if (fromVer && shown <= fresh.length) { const seenV = new Set(fresh.map(r => r.v)); shown = all.findIndex(r => !seenV.has(r.v)); if (shown < 0) shown = all.length; }
      shown = Math.min(all.length, shown + 8);
      const sh = root.querySelector('.modal-sheet'), y = sh.scrollTop; sh.innerHTML = html(); sh.scrollTop = y;
    }
  });
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
  ui2Titles(app);
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
function swipeMode() { return 'dietDay'; } // fijo: días en Dieta y bloques en Entreno (el mapa muscular de Progreso tiene su propio gesto)
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

/* Mapa muscular: deslizar el dedo cambia entre Ahora · 7 días · 30 días */
const MM_TABS = ['now', 'd7', 'd30'];
const mms = { on: false, axis: null, x0: 0, y0: 0, dx: 0, busy: false };
document.addEventListener('touchstart', e => {
  mms.on = false; mms.axis = null;
  if (mms.busy || ui.view !== 'progress' || e.touches.length !== 1 || !e.target.closest('#muscleMap') || e.target.closest('button')) return;
  const t = e.touches[0]; Object.assign(mms, { on: true, x0: t.clientX, y0: t.clientY, dx: 0 });
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!mms.on) return;
  const t = e.touches[0], dx = t.clientX - mms.x0, dy = t.clientY - mms.y0;
  if (!mms.axis) { if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; mms.axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y'; if (mms.axis === 'y') { mms.on = false; return; } }
  const i = MM_TABS.indexOf(ui.mmTab || 'now'), has = MM_TABS[i + (dx < 0 ? 1 : -1)];
  mms.dx = dx; const b = $('#mmBody'); if (b) { b.style.transition = ''; b.style.transform = `translate3d(${has ? dx : dx * 0.15}px,0,0)`; b.style.opacity = has ? String(1 - Math.min(0.6, Math.abs(dx) / W())) : ''; }
}, { passive: true });
function mmSwipeEnd() {
  if (!mms.on) return; mms.on = false;
  if (mms.axis !== 'x') return;
  const b = $('#mmBody'); if (!b) return;
  const dir = mms.dx < 0 ? 1 : -1, i = MM_TABS.indexOf(ui.mmTab || 'now'), next = MM_TABS[i + dir];
  if (!next || Math.abs(mms.dx) < 50) { b.style.transition = 'transform 200ms ease, opacity 200ms ease'; b.style.transform = ''; b.style.opacity = ''; return; }
  mms.busy = true;
  b.style.transition = 'transform 160ms ease, opacity 160ms ease'; b.style.transform = `translate3d(${-dir * W()}px,0,0)`; b.style.opacity = '0';
  setTimeout(() => {
    ui.mmTab = next;
    const sec = $('#muscleMap'); if (sec) sec.outerHTML = muscleMapHTML();
    const nb = $('#mmBody');
    if (nb) { nb.style.transform = `translate3d(${dir * W() * 0.4}px,0,0)`; nb.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => { nb.style.transition = 'transform 220ms cubic-bezier(.2,.7,.3,1), opacity 220ms ease'; nb.style.transform = ''; nb.style.opacity = ''; })); }
    setTimeout(() => { mms.busy = false; }, 240);
  }, 160);
}
document.addEventListener('touchend', mmSwipeEnd, { passive: true });
document.addEventListener('touchcancel', mmSwipeEnd, { passive: true });

const actions = {
  pickDay: b => { ui.dayId = b.dataset.day; render(); window.scrollTo({ top: 0 }); },
  pickProg: b => { state.plan.active = b.dataset.prog; ui.dayId = nextDayId(); persist(); render(); window.scrollTo({ top: 0 }); },
  addProg: () => libraryModal(),
  library: () => libraryModal(),
  publishProg: b => publishBlockModal(b.dataset.prog),
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
  exLibrary: () => exLibraryModal(),
  editEx: b => editExModal(b.dataset.ex),
  variant: b => variantPicker(b.dataset.ex),
  mmTab: b => { ui.mmTab = b.dataset.v; render(); },
  noteOpen: b => { (ui.noteOpen ||= {})[b.dataset.ex] = !ui.noteOpen[b.dataset.ex]; render(); },
  noteTag: b => {
    const d = draftOf(currentDay().id), id = b.dataset.ex, nt = ((d.notes ||= {})[id] ||= { tags: [], text: '' });
    nt.tags = nt.tags.includes(b.dataset.t) ? nt.tags.filter(x => x !== b.dataset.t) : [...nt.tags, b.dataset.t];
    persist(); render();
  },
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
  swSet: b => stopwatchSheet(b.dataset.ex, b.dataset.key, parseInt(b.dataset.i, 10)),
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
  favMeal: b => toggleFavMeal(b.dataset.key),
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
  habTarget: b => {
    const h = state.settings.habitList[+b.dataset.i]; if (!h) return;
    h.target = b.dataset.v === 'multi' ? Math.max(2, h.target > 1 ? h.target : 8) : 1;
    if (h.target > 1 && !h.unit && /agua|vaso/i.test(h.name)) h.unit = 'vasos';
    saveHabitList();
  },
  habMove: b => {
    const L = state.settings.habitList, i = +b.dataset.i, j = i + +b.dataset.d;
    if (j < 0 || j >= L.length) return;
    [L[i], L[j]] = [L[j], L[i]];
    if (ui.habDaysOpen === i) ui.habDaysOpen = j; else if (ui.habDaysOpen === j) ui.habDaysOpen = i;
    saveHabitList();
  },
  habEdit: b => {
    const L = state.settings.habitList, h = L[+b.dataset.i]; if (!h) return;
    openModal(`<h3 class="modal-title">✎ Editar hábito</h3>
      <label class="lbl">Nombre<input class="field mt-1" name="hn" maxlength="60" value="${esc(h.name)}" /></label>
      <p class="text-[11px] text-mute">Lo que ya tenías marcado con el nombre anterior se mantiene con el nuevo.</p>
      <button class="btn-primary w-full" data-mact="save" type="button">Guardar</button>`, {
      autofocus: true,
      save: root => {
        const v = mval(root, 'hn').trim().replace(/\s+/g, ' ').slice(0, 60), old = h.name;
        if (!v) return toast('Escribe el nombre', 'warn');
        if (v !== old && L.some(x => x !== h && x.name.toLowerCase() === v.toLowerCase())) return toast('Ya tienes un hábito con ese nombre', 'warn');
        if (v !== old) renameHabit(old, v);
        h.name = v; closeModal(); saveHabitList(); toast('Hábito actualizado');
      }
    });
  },
  habWhere: b => { const h = state.settings.habitList[+b.dataset.i]; if (!h) return; h.where = b.dataset.v; if (h.where !== 'daily' && ui.habDaysOpen === +b.dataset.i) ui.habDaysOpen = null; saveHabitList(); },
  habDaysOpen: b => { const i = +b.dataset.i; ui.habDaysOpen = ui.habDaysOpen === i ? null : i; render(); },
  habDay: b => {
    const h = state.settings.habitList[+b.dataset.i], d = +b.dataset.d; if (!h) return;
    if (h.days.includes(d)) { if (h.days.length === 1) return toast('Deja al menos un día', 'warn'); h.days = h.days.filter(x => x !== d); } else h.days = [...h.days, d].sort();
    saveHabitList();
  },
  dailyHabit: b => {
    if (habPress?.fired) { habPress = null; return; } // fue una pulsación larga: ya restó
    habPress = null; habitStep(b.dataset.name, 1);
  },
  resetPlan: () => {
    if (!confirm('¿Empezar de cero con los bloques? Se quitan tus bloques, días y ejercicios (quedan RETOS, CARDIO y FREE). El historial se conserva. Después puedes elegir bloques en «📚 Bloques recomendados».')) return;
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
  sheetEdit: () => { ui.sheetEdit = true; render(); },
  sheetSave: () => {
    const v = ($('#sheetUrl')?.value || '').trim();
    if (v && !/^https:\/\/docs\.google\.com\/spreadsheets\//.test(v)) return toast('Pega el enlace de la hoja (empieza por https://docs.google.com/spreadsheets/)', 'warn');
    if (v) lsSet(SHEET_KEY, v.split('#')[0]); else { try { localStorage.removeItem(SHEET_KEY); } catch { /* nada */ } }
    ui.sheetEdit = false; render(); toast(v ? 'Enlace guardado ✓' : 'Enlace quitado');
  },
  devCheck: async () => { deviceDiag = 'comprobando…'; render(); deviceChecked = false; await deviceGuard(); render(); },
  relDev: async b => {
    const h = b.dataset.hash, enc = lsGet(USE_KEY);
    if (!enc || !ui.accessPin || !access.usageUrl) return toast('Abre Acceso con tu PIN', 'warn');
    if (!confirm('¿Quitar este dispositivo? Dejará de poder entrar con su código y su plaza queda libre para otro dispositivo.')) return;
    try { const k = await secretDec(enc, ui.accessPin); await fetch(access.usageUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ k, release: h, dev: b.dataset.dev }) }); toast('Dispositivo quitado ✓'); setTimeout(() => { ui.usage = null; loadUsage(); render(); }, 1200); }
    catch (e) { toast('No se pudo liberar: ' + e.message, 'error'); }
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
/* Mantener pulsado un hábito = restar uno (o desmarcar) */
app.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-act=dailyHabit]'); if (!b) return;
  habPress = { name: b.dataset.name, fired: false, t: setTimeout(() => { habPress.fired = true; try { navigator.vibrate?.(30); } catch { /* nada */ } habitStep(habPress.name, -1); }, 550) };
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => app.addEventListener(ev, () => { if (habPress) clearTimeout(habPress.t); }));
app.addEventListener('contextmenu', e => { if (e.target.closest('[data-act=dailyHabit]')) e.preventDefault(); });
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
  if (t.dataset.noteEx) { const d = draftOf(currentDay().id); ((d.notes ||= {})[t.dataset.noteEx] ||= { tags: [], text: '' }).text = t.value.slice(0, 140); persistSoon(); }
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
  if (t.dataset.habT !== undefined || t.dataset.habU !== undefined) {
    const h = state.settings.habitList[+(t.dataset.habT ?? t.dataset.habU)]; if (!h) return;
    if (t.dataset.habT !== undefined) h.target = clamp(parseInt(t.value, 10) || 2, 2, 20); else h.unit = t.value.trim().slice(0, 12);
    return saveHabitList();
  }
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
/* 📱 Cada código vale como mucho en 2 dispositivos (el administrador, sin límite). Lo decide el script de la hoja de uso.
   Si el script no responde o aún no está actualizado, se deja entrar: nadie se queda fuera por un fallo ajeno. */
const DEVICE_LIMIT = 2;
const blockedMsg = () => `Este código ya se usa en ${DEVICE_LIMIT} dispositivos. Si has cambiado de móvil, escribe a <a class="text-brand underline" href="mailto:${CONTACT_MAIL}?subject=${encodeURIComponent('FITNESTEBAN · cambio de móvil')}">${CONTACT_MAIL}</a> y te lo libero.`;
let deviceSure = false; // ¿el script ha contestado de verdad? (si no, se vuelve a preguntar al volver a la app)
let deviceDiag = ''; // qué contestó el script la última vez (se ve en Ajustes → Aplicación)
async function deviceAllowed(code, me) {
  const url = access.usageUrl; deviceSure = false;
  if (!url) { deviceDiag = 'sin dirección del script en acceso.txt'; return true; }
  if (!navigator.onLine) { deviceDiag = 'sin conexión'; return true; }
  try {
    const h = await codeHash(code), ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000); // el script de Google puede tardar en «despertar»
    const r = await fetch(`${url}?op=check&h=${h}&d=${encodeURIComponent(deviceId())}&l=${encodeURIComponent(deviceLabel())}&t=${Date.now()}`, { cache: 'no-store', signal: ctl.signal });
    clearTimeout(t);
    const txt = await r.text(); let d = {};
    try { d = JSON.parse(txt); } catch { deviceDiag = `respuesta no válida (HTTP ${r.status}): ${txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90)}`; return true; }
    deviceSure = typeof d.allowed === 'boolean';
    deviceDiag = d.allowed === true ? `registrado ✓ (${d.n} dispositivo${d.n === 1 ? '' : 's'})` : d.allowed === false ? 'bloqueado (límite de dispositivos)' : (d.error && d.error !== 'clave' ? `error del script: ${String(d.error).slice(0, 140)}` : `el script contestó ${txt.slice(0, 60)}${d.error === 'clave' ? ' → script antiguo' : !d.ok ? ' → no reconoce el código' : ''}`);
    return d.allowed !== false || !!me?.admin;
  } catch (e) { deviceDiag = e.name === 'AbortError' ? 'el script no contestó en 20 s' : `no se pudo conectar (${e.message})`; return true; }
}
let deviceChecked = false;
async function deviceGuard() {
  if (deviceChecked || !access.ok) return; deviceChecked = true;
  const code = lsGet(ACCESS_KEY)?.code; if (!code) return;
  if (await deviceAllowed(code, access.me)) { if (!deviceSure) deviceChecked = false; return; }
  access.ok = false; try { localStorage.removeItem(ACCESS_KEY); } catch { /* nada */ }
  closeModal(); lockScreen('code', blockedMsg());
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
    <p class="text-[11px] text-mute text-center mt-4">Cada código es personal. Válido solo en 2 dispositivos.</p>
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
      if (!(await deviceAllowed(v, me))) { lockScreen('code', blockedMsg()); return; }
      deviceChecked = deviceSure;
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
  else if (!newsChecked) { newsChecked = true; maybeShowNews(); setTimeout(maybeAskEmail, 2500); }
  setTimeout(emailSync, 4000);
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
  if (me) { if (!access.ok) unlock(me); else access.me = me; usagePing(); deviceGuard(); }
  else lockScreen('code', lsGet(ACCESS_KEY)?.code ? `Tu código ya no es válido. Pide uno nuevo a <a class="text-brand underline" href="mailto:${CONTACT_MAIL}?subject=${encodeURIComponent('FITNESTEBAN · código de acceso')}">${CONTACT_MAIL}</a>` : '');
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && access.ok) fetchAcl().then(async l => { usagePing(); deviceGuard(); if (l && !(await accessCheck(l))) { const live = await fetchAclLive(); if (!live || await accessCheck(live)) return; access.ok = false; lockScreen('code', `Tu código ya no es válido. Pide uno nuevo a <a class="text-brand underline" href="mailto:${CONTACT_MAIL}?subject=${encodeURIComponent('FITNESTEBAN · código de acceso')}">${CONTACT_MAIL}</a>`); } }); });

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
async function ghApi(token, method = 'GET', body = null, file = GH_FILE) {
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${file}`, {
    method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store'
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 404 && method === 'GET' && file !== GH_FILE) return { content: '', sha: undefined }; // archivo aún no creado
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
const USE_KEY = 'fitnesteban_usekey', PING_KEY = 'fitnesteban_ping', SHEET_KEY = 'fitnesteban_sheet'; // enlace a la hoja: solo en este dispositivo, nunca en GitHub
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
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ h, v: APP_VERSION, i: installDate() }) });
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
    ui.usageErr = ''; ui.usageOld = !(d.ver >= 2); ui.usageNoMail = !(d.ver >= 8);
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
  return `<div class="text-[11px] ${ago <= 2 ? 'text-emerald-300' : ago <= 7 ? 'text-amber-300' : 'text-rose-300'}">${ago <= 2 ? '🟢' : ago <= 7 ? '🟡' : '🔴'} ${when} · v${esc(u.v || '?')}${old ? ' <span class="text-amber-300">(desactualizada)</span>' : ''} <span class="text-mute">· ${+u.days || 1} día${+u.days === 1 ? '' : 's'} de uso</span></div>${u.n !== undefined ? `<div class="text-[11px] ${u.b ? 'text-amber-300' : 'text-mute'}">🔑 ${(access.list || []).some(x => x.hash === hash && x.admin) ? `${u.n} dispositivo${u.n === 1 ? '' : 's'} · sin límite (administrador)` : `${u.n} de ${DEVICE_LIMIT} dispositivos`}${u.b ? ` · ⛔ ${u.b} intento${u.b === 1 ? '' : 's'} bloqueado${u.b === 1 ? '' : 's'}` : ''}</div>${(u.ds || []).map(dv => { const ago = dv.last ? daysBetween(dv.last, todayISO()) : null; return `<div class="flex items-center justify-between gap-2 text-[11px] pl-3"><span class="truncate text-slate-300">${/Android|iPhone/.test(dv.n || '') ? '📱' : /iPad/.test(dv.n || '') ? '📲' : '💻'} ${esc(dv.n || 'Dispositivo')} <span class="text-mute">· ${ago === null ? 'sin fecha' : ago <= 0 ? 'hoy' : ago === 1 ? 'ayer' : `hace ${ago} días`}</span></span><button class="underline text-rose-300 shrink-0" data-act="relDev" data-hash="${esc(hash)}" data-dev="${esc(dv.id)}" type="button">Quitar</button></div>`; }).join('')}` : ''}${u.m || u.i ? `<div class="text-[11px] text-slate-300 truncate">${u.i ? `📅 Alta ${esc(fmtDateShort(u.i))}/${esc(u.i.slice(2, 4))}` : ''}${u.m && u.i ? ' · ' : ''}${u.m ? `✉️ ${esc(u.m)}` : ''}</div>` : ''}`;
}
function usageScript(key) {
  return `// FITNESTEBAN · registro de uso (último uso, versión, nombre, correo, fecha de alta y dispositivos por código, máx. 2) · v8
const READ_KEY = '${key}';
const ACL_URL = 'https://egarluq292.github.io/fitnesteban/acceso.txt';
const COLS = ['huella', 'ultimo_uso', 'version', 'primer_uso', 'dias_de_uso', 'nombre', 'correo', 'alta', 'dispositivos', 'bloqueos'];
const LIMITE = 2;
function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('uso');
  if (!sh) { sh = ss.insertSheet('uso'); sh.getRange('A:E').setNumberFormat('@'); sh.appendRow(COLS); }
  if (String(sh.getRange(1, 6).getValue()) !== 'nombre') sh.getRange(1, 6).setValue('nombre');
  if (String(sh.getRange(1, 7).getValue()) !== 'correo') sh.getRange(1, 7).setValue('correo');
  if (String(sh.getRange(1, 8).getValue()) !== 'alta') { sh.getRange(1, 8).setValue('alta'); sh.getRange('H:H').setNumberFormat('@'); }
  if (String(sh.getRange(1, 9).getValue()) !== 'dispositivos') sh.getRange(1, 9).setValue('dispositivos');
  if (String(sh.getRange(1, 10).getValue()) !== 'bloqueos') sh.getRange(1, 10).setValue('bloqueos');
  return sh;
}
function fecha_(x) { return x instanceof Date ? Utilities.formatDate(x, 'Europe/Madrid', 'yyyy-MM-dd') : String(x); }
function acl_() {
  const c = CacheService.getScriptCache(); let t = c.get('acl');
  if (!t) { t = UrlFetchApp.fetch(ACL_URL + '?t=' + Date.now(), { muteHttpExceptions: true }).getContentText(); c.put('acl', t, 600); }
  return t.split('\\n').map(l => l.trim()).filter(l => l && l[0] !== '#').map(l => l.split(/\\s+/)).filter(p => /^[0-9a-f]{32}$/.test(p[0].toLowerCase()));
}
function huellas_() { return acl_().map(p => p[0].toLowerCase()); }
function admins_() { return acl_().filter(p => p.slice(1).some(x => x.toLowerCase() === 'admin')).map(p => p[0].toLowerCase()); }
// dispositivos de cada código: { huella: { d: [{ id, n: 'Android · Chrome', last: 'aaaa-mm-dd' }], b: bloqueos } }
function disp_() {
  let x = {}; try { x = JSON.parse(PropertiesService.getScriptProperties().getProperty('disp') || '{}'); } catch (e) { x = {}; }
  for (const h in x) x[h].d = (x[h].d || []).map(v => typeof v === 'string' ? { id: v, n: '', last: '' } : v);
  return x;
}
function guardaDisp_(x) { PropertiesService.getScriptProperties().setProperty('disp', JSON.stringify(x)); }
function escribeDisp_(h, x) {
  const sh = hoja_(), datos = sh.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) if (String(datos[i][0]) === h) { sh.getRange(i + 1, 9, 1, 2).setValues([[String((x.d || []).length), String(x.b || 0)]]); return; }
}
function nombres_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('nombres') || '{}'); } catch (e) { return {}; } }
function salida_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    // el administrador manda la lista huella → nombre (con la clave de lectura): se guarda y se escribe en la columna F
    // el administrador libera los dispositivos de un código (cambio de móvil)
    if (b.k === READ_KEY && typeof b.release === 'string' && /^[0-9a-f]{32}$/.test(b.release)) {
      const lock = LockService.getScriptLock(); lock.waitLock(10000);
      try {
        const x = disp_(), y = x[b.release] || { d: [], b: 0 };
        // quitar un dispositivo: deja su plaza libre y ya no puede volver a entrar con ese código (lista «q»)
        if (b.dev) { y.d = y.d.filter(v => v.id !== String(b.dev)); y.q = [...(y.q || []).filter(v => v !== String(b.dev)), String(b.dev)].slice(-20); }
        else { y.d = []; y.b = 0; y.q = []; }
        x[b.release] = y; guardaDisp_(x); escribeDisp_(b.release, y);
      } finally { lock.releaseLock(); }
      return salida_({ ok: true });
    }
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
      // correo: solo si lo manda el propio usuario; un correo nuevo sustituye al anterior (vacío no borra)
      const m = typeof b.m === 'string' ? b.m.trim().toLowerCase().slice(0, 100) : null, mOk = m !== null && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(m);
      // alta: la fecha más antigua que haya mandado cualquiera de sus móviles
      const i = /^\\d{4}-\\d{2}-\\d{2}$/.test(String(b.i || '')) && String(b.i) <= hoy ? String(b.i) : '';
      if (fila < 0) sh.appendRow([h, hoy, v, hoy, '1', nom, mOk ? m : '', i]);
      else { const antes = fecha_(datos[fila - 1][1]); sh.getRange(fila, 2, 1, 2).setValues([[hoy, v]]); if (antes !== hoy) sh.getRange(fila, 5).setValue(String((+datos[fila - 1][4] || 0) + 1)); sh.getRange(fila, 6).setValue(nom); if (mOk) sh.getRange(fila, 7).setValue(m); const ia = fecha_(datos[fila - 1][7] || ''); if (i && (!ia || i < ia)) sh.getRange(fila, 8).setValue(i); }
    } finally { lock.releaseLock(); }
    return salida_({ ok: true });
  } catch (err) { return salida_({ ok: false }); }
}
// ▶ Para comprobar permisos: elige «probar» arriba y pulsa Ejecutar. Debe decir cuántos códigos y filas hay.
function probar() {
  const n = huellas_().length, f = hoja_().getLastRow() - 1;
  Logger.log('OK · códigos en acceso.txt: ' + n + ' · filas en la hoja: ' + f);
}
function doGet(e) {
  try { return doGet_(e); } catch (err) { return salida_({ ok: false, error: 'script: ' + String((err && err.message) || err).slice(0, 200) }); }
}
function doGet_(e) {
  const q = (e && e.parameter) || {};
  // ¿puede este dispositivo usar este código? (máx. LIMITE dispositivos; el administrador, sin límite)
  if (q.op === 'check') { // ojo: «c» y «sid» son parámetros reservados de Google, no se pueden usar
    const h = String(q.h || '').toLowerCase(), d = String(q.d || '').slice(0, 40), n = String(q.l || '').slice(0, 40), hoy = fecha_(new Date());
    if (!/^[0-9a-f]{32}$/.test(h) || !d || huellas_().indexOf(h) < 0) return salida_({ ok: false });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const all = disp_(), x = all[h] || { d: [], b: 0 }, adm = admins_().indexOf(h) >= 0;
      let ok = true;
      const ya = x.d.find(v => v.id === d);
      if ((x.q || []).indexOf(d) >= 0 && !adm) { ok = false; x.b = (x.b || 0) + 1; }
      else if (ya) { ya.last = hoy; if (n) ya.n = n; }
      else if (adm || x.d.length < LIMITE) x.d.push({ id: d, n, last: hoy });
      else { ok = false; x.b = (x.b || 0) + 1; }
      all[h] = x; guardaDisp_(all); escribeDisp_(h, x);
      return salida_({ ok: true, allowed: ok, n: x.d.length });
    } finally { lock.releaseLock(); }
  }
  if (q.key !== READ_KEY) return salida_({ ok: false, error: 'clave' });
  const datos = hoja_().getDataRange().getValues().slice(1);
  const dd = disp_();
  return salida_({ ok: true, ver: 8, rows: datos.map(r => ({ h: String(r[0]), last: fecha_(r[1]), v: String(r[2]), first: fecha_(r[3]), days: +r[4] || 1, m: String(r[6] || ''), i: r[7] ? fecha_(r[7]) : '', n: ((dd[String(r[0])] || {}).d || []).length, b: (dd[String(r[0])] || {}).b || 0, ds: ((dd[String(r[0])] || {}).d || []) })) });
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
async function usageSetupModal() {
  // la misma clave hasta que se active: así da igual cerrar y reabrir esta ventana
  let key = lsGet('fitnesteban_usekey_pending');
  // si ya hay una clave activa (y Acceso está abierto con el PIN), se reutiliza: así el código nuevo siempre cuadra con la app
  if (!/^[0-9a-f]{36}$/.test(key || '') && lsGet(USE_KEY) && ui.accessPin) { try { const k = await secretDec(lsGet(USE_KEY), ui.accessPin); if (/^[0-9a-f]{36}$/.test(k)) { key = k; lsSet('fitnesteban_usekey_pending', key); } } catch { /* nada */ } }
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
    <div class="grid grid-cols-2 gap-2"><button class="btn-ghost" data-mact="copy" type="button">📋 Copiar código</button><button class="btn-ghost" data-mact="share" type="button">📤 Enviármelo (archivo)</button></div>
    <label class="lbl">URL de la aplicación web<input class="field mt-1 font-mono text-xs" name="url" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" /></label>
    <button class="btn-primary w-full" data-mact="save" type="button">Guardar y activar</button>
    <p class="text-[11px] text-mute">El código lleva una clave de lectura única: solo tu app (con tu PIN) puede consultar la hoja. Los móviles de los demás solo pueden apuntar su visita.</p>`, {
    copy: () => navigator.clipboard.writeText(code).then(() => toast('Código copiado: pégalo en Apps Script')).catch(() => toast('No se pudo copiar', 'error')),
    // como archivo: compartido como texto, algunas apps lo cortan a los 4.096 caracteres
    share: async () => {
      const file = new File([code], 'fitnesteban-script.txt', { type: 'text/plain' });
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'FITNESTEBAN · script de uso' }); } catch { /* cancelado */ } return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); toast('Descargado: fitnesteban-script.txt');
    },
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
  const msg = `Hola${who ? ' ' + who : ''}, tu código de FITNESTEBAN es ${fmtCode(code)}\nEs personal. Válido solo en 2 dispositivos.\nhttps://egarluq292.github.io/fitnesteban/`;
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
      ? `<div class="flex items-center justify-between gap-2 text-[11px] text-mute"><span>📶 Uso: ${ui.usageErr ? `<span class="text-rose-300">${esc(ui.usageErr)}</span>` : ui.usageLoading ? 'consultando…' : ui.usage ? (ui.usageOld ? '<span class="text-amber-300">actualiza el script (Reconfigurar) para que los nombres pasen solos a la hoja</span>' : ui.usageNoMail ? '<span class="text-amber-300">actualiza el script (Reconfigurar → nueva versión): correos, fecha de alta y límite de 2 dispositivos</span>' : 'actualizado ahora · nombres, correos, altas y dispositivos') : '—'}</span><span class="flex gap-3 shrink-0"><button class="underline" data-act="usageSetup" type="button">Reconfigurar</button><button class="underline" data-act="usageRefresh" type="button">Actualizar</button></span></div>`
      : gh ? `<button class="btn-ghost w-full" data-act="usageSetup" type="button">📶 Ver quién usa la app (configurar)</button>` : ''}
    ${access.usageUrl && lsGet(USE_KEY) ? (lsGet(SHEET_KEY) && !ui.sheetEdit
      ? `<div class="flex items-center gap-2"><a class="btn-ghost flex-1 text-center block" href="${esc(lsGet(SHEET_KEY))}" target="_blank" rel="noopener">📊 Abrir hoja de uso</a><button class="text-[11px] text-mute underline shrink-0" data-act="sheetEdit" type="button">Cambiar</button></div>`
      : `<div class="flex gap-2"><input class="field flex-1 min-w-0 text-xs" id="sheetUrl" placeholder="Pega el enlace de tu hoja de uso" autocomplete="off" value="${esc(lsGet(SHEET_KEY) || '')}" /><button class="btn-ghost px-3 shrink-0" data-act="sheetSave" type="button">Guardar</button></div><p class="text-[10px] text-mute -mt-1">Ábrela en el navegador y copia la dirección (docs.google.com/spreadsheets/…). Solo se guarda en este dispositivo.</p>`) : ''}
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
