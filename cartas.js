/**
 * cartas.js
 * -----------------------------------------
 * Sistema de cartas de mejora para inicio de temporada.
 * Genera 3 cartas con rarezas, stats mejoradas, nombres y descripciones.
 * Al elegir una, aplica los puntos al jugador.
 * -----------------------------------------
 */

// Definición de rarezas con probabilidades
const RAREZAS = {
  comun: { nombre: "Común", prob: 45, borde: "#2d5a41", fondo: "#1a2e24" },
  rara: { nombre: "Rara", prob: 30, borde: "#9aa196", fondo: "#2a2f2a" },
  dorada: { nombre: "Dorada", prob: 20, borde: "#f5c542", fondo: "#3a2f12" },
  leyenda: { nombre: "Leyenda", prob: 5, borde: "#a855f7", fondo: "#2a1a3a" }
};

// Pool de mejoras para 1 estadística (Comunes y Raras)
const MEJORAS_1_STAT = [
  // Pegada
  { stat: "pegada", nombre: "Tiro libre al ángulo", desc: "Te quedaste practicando tiros libres después de hora. La barrera de entrenamiento no fue rival para tu derecha." },
  { stat: "pegada", nombre: "Remate de volea", desc: "Ensayaste engancharla de aire tras los centros de tu compañero. Tus remates ahora van con puro veneno." },
  { stat: "pegada", nombre: "Definición bajo presión", desc: "Entrenamiento de penales con la hinchada (imaginaria) gritándote en contra. Aprendiste a asegurar el tiro." },
  // Velocidad
  { stat: "velocidad", nombre: "Pasadas en la arena", desc: "El profe te mandó a correr médanos. Sufriste, pero ahora tus piernas responden el doble de rápido en el arranque." },
  { stat: "velocidad", nombre: "Pique corto explosivo", desc: "Práctica de reacción con silbato. Ahora arrancás los primeros cinco metros como un Fórmula 1." },
  { stat: "velocidad", nombre: "Carrera de relevos", desc: "Competencia de velocidad pura contra los extremos del equipo. Nadie te saca ventaja en el sprint final." },
  // Gambeta
  { stat: "gambeta", nombre: "Locura en el rondo", desc: "Te metiste en el medio del clásico 'loco' y sacaste a pasear a dos defensores con una pisada hermosa." },
  { stat: "gambeta", nombre: "Dribbling en baldosa", desc: "Entrenamiento en espacios hiper reducidos. Aprendiste a esconder la pelota donde no entra ni un alfiler." },
  { stat: "gambeta", nombre: "El caño desmoralizador", desc: "Le metiste un caño de lujo al central en la práctica. Te ganaste una patada, pero tu confianza está por las nubes." },
  // Liderazgo
  { stat: "liderazgo", nombre: "Charla de vestuario", desc: "Hubo un momento tenso antes de salir a la cancha y tomaste la palabra. El grupo te escucha con atención." },
  { stat: "liderazgo", nombre: "Orden táctico", desc: "El DT te pidió que acomodes a los más chicos durante la práctica. Tu voz de mando pesa cada vez más en la cancha." },
  { stat: "liderazgo", nombre: "Defensa del compañero", desc: "Fuiste a separar en un amistoso picante y marcaste territorio frente al rival. La cinta de capitán no te quedaría mal." },
  // Resistencia
  { stat: "resistencia", nombre: "Doble turno infernal", desc: "Sobreviviste a la pretemporada más dura que recuerdes. Tus pulmones ahora son de acero inoxidable." },
  { stat: "resistencia", nombre: "Fondo físico de 90'", desc: "Mientras otros piden el cambio ahogados, vos seguís corriendo. Completaste el circuito aeróbico sin despeinarte." },
  { stat: "resistencia", nombre: "Nutrición de élite", desc: "Cambiaste la dieta y mejoraste el descanso. Tu cuerpo se recupera rapidísimo y sos inalcanzable en el segundo tiempo." }
];

// Pool de mejoras para 2 estadísticas (Doradas y Leyenda)
const MEJORAS_2_STATS = [
  { stats: ["pegada", "velocidad"], nombre: "Contragolpe letal", desc: "Pique de área a área en diez segundos para definir cruzado ante la salida del arquero. Inalcanzable e infalible." },
  { stats: ["pegada", "gambeta"], nombre: "Mago del borde del área", desc: "Amague sutil para limpiar la marca y remate milimétrico al segundo palo. Una verdadera obra de arte en movimiento." },
  { stats: ["pegada", "liderazgo"], nombre: "Ejecutor de jerarquía", desc: "Pediste la pelota en el momento más caliente de la práctica para patear el penal decisivo. Pura personalidad y clase." },
  { stats: ["pegada", "resistencia"], nombre: "Bombazo agónico", desc: "Minuto 89, las piernas pesan una tonelada, pero tu técnica sigue intacta para sacar un misil de afuera del área." },
  { stats: ["velocidad", "gambeta"], nombre: "Slalom maradoniano", desc: "Arrancaste en tres cuartos de cancha y dejaste a tres conos en el camino a pura velocidad y control pegado al pie. Imparable." },
  { stats: ["velocidad", "liderazgo"], nombre: "El primero en presionar", desc: "Das el ejemplo contagiando al equipo con tus piques furiosos para recuperar la pelota bien arriba." },
  { stats: ["velocidad", "resistencia"], nombre: "Tren sin frenos", desc: "Ida y vuelta constante por la banda durante toda la jornada. Tu motor no se apaga nunca, sos una pesadilla física." },
  { stats: ["gambeta", "liderazgo"], nombre: "La pausa necesaria", desc: "Pisaste la pelota cuando el equipo estaba muy acelerado, marcando los tiempos del partido como un veterano de mil batallas." },
  { stats: ["gambeta", "resistencia"], nombre: "Baile agobiante", desc: "Sometiste al lateral rival a un uno contra uno constante todo el partido hasta dejarlo sin aire y sin respuestas." },
  { stats: ["liderazgo", "resistencia"], nombre: "El alma del equipo", desc: "Corriste por todos tus compañeros y alentaste hasta el pitazo final del entrenamiento. Sos el pulmón y el corazón del plantel." }
];

// Generar 3 cartas aleatorias según probabilidades
function generarCartas() {
  const cartas = [];
  for (let i = 0; i < 3; i++) {
    cartas.push(generarCarta());
  }
  return cartas;
}

// Genera una carta individual
function generarCarta() {
  const rareza = elegirRareza();
  let stats = [];
  let puntos = 0;
  let nombre = "";
  let desc = "";

  if (rareza === "comun" || rareza === "rara") {
    const mejora = elegirAleatorio(MEJORAS_1_STAT);
    stats = [mejora.stat];
    nombre = mejora.nombre;
    desc = mejora.desc;
    puntos = rareza === "comun" ? numeroAleatorio(1, 3) : numeroAleatorio(3, 4);
  } else if (rareza === "dorada") {
    // 80% una stat, 20% dos stats
    if (Math.random() < 0.8) {
      const mejora = elegirAleatorio(MEJORAS_1_STAT);
      stats = [mejora.stat];
      nombre = mejora.nombre;
      desc = mejora.desc;
    } else {
      const mejora = elegirAleatorio(MEJORAS_2_STATS);
      stats = mejora.stats;
      nombre = mejora.nombre;
      desc = mejora.desc;
    }
    puntos = numeroAleatorio(5, 7);
  } else { // leyenda
    const mejora = elegirAleatorio(MEJORAS_2_STATS);
    stats = mejora.stats;
    nombre = mejora.nombre;
    desc = mejora.desc;
    puntos = numeroAleatorio(7, 8);
  }

  return {
    rareza: rareza,
    stats: stats,
    puntos: puntos,
    nombre: nombre,
    desc: desc,
  };
}

// Aplica la carta elegida al jugador
function aplicarCarta(jugador, carta) {
  const statsActuales = { ...jugador.stats };
  carta.stats.forEach(stat => {
    statsActuales[stat] = (statsActuales[stat] || 0) + carta.puntos;
  });

  // Recalcular media y valor después de la mejora
  const nuevaMedia = Math.round(
    (statsActuales.pegada + statsActuales.velocidad + statsActuales.gambeta +
     statsActuales.liderazgo + statsActuales.resistencia) / 5
  );
  const nuevoValor = calcularValorActualizado(nuevaMedia, jugador.edad);

  // Actualizar estado
  Estado.actualizarStats(statsActuales);
  Estado.actualizar({ media: nuevaMedia, valor: nuevoValor });

  return { media: nuevaMedia, valor: nuevoValor };
}

// Función auxiliar para recalcular valor (copia de la fórmula)
function calcularValorActualizado(media, edad) {
  let mult = 1;
  if (edad >= 15 && edad <= 21) mult = 2;
  else if (edad >= 22 && edad <= 28) mult = 1.5;
  else if (edad >= 29 && edad <= 33) mult = 1;
  else mult = 0.5;

  const valorBruto = Math.pow((media - 40), 4) * 10 * mult;
  return Math.round(valorBruto / 1000000);
}

// Utilidades
function elegirRareza() {
  const random = Math.random() * 100;
  if (random < 45) return "comun";
  if (random < 75) return "rara";
  if (random < 95) return "dorada";
  return "leyenda";
}

function elegirAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}