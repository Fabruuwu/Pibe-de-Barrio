const RAREZAS = {
  comun: { nombre: "Común", prob: 50, borde: "#33334a", fondo: "#1a1f2e" },
  rara: { nombre: "Rara", prob: 35, borde: "#9aa196", fondo: "#2a2f2a" },
  dorada: { nombre: "Dorada", prob: 13, borde: "#f5c542", fondo: "#3a2f12" },
  leyenda: { nombre: "Leyenda", prob: 2, borde: "#a855f7", fondo: "#2a1a3a" }
};

const MEJORAS_1_STAT = [
  { stat: "pegada", nombre: "Tiro libre al ángulo", desc: "Te quedaste practicando tiros libres después de hora. La barrera de entrenamiento no fue rival para tu derecha." },
  { stat: "pegada", nombre: "Remate de volea", desc: "Ensayaste engancharla de aire tras los centros de tu compañero. Tus remates ahora van con puro veneno." },
  { stat: "pegada", nombre: "Definición bajo presión", desc: "Entrenamiento de penales con la hinchada (imaginaria) gritándote en contra. Aprendiste a asegurar el tiro." },
  { stat: "velocidad", nombre: "Pasadas en la arena", desc: "El profe te mandó a correr médanos. Sufriste, pero ahora tus piernas responden el doble de rápido en el arranque." },
  { stat: "velocidad", nombre: "Pique corto explosivo", desc: "Práctica de reacción con silbato. Ahora arrancás los primeros cinco metros como un Fórmula 1." },
  { stat: "velocidad", nombre: "Carrera de relevos", desc: "Competencia de velocidad pura contra los extremos del equipo. Nadie te saca ventaja en el sprint final." },
  { stat: "gambeta", nombre: "Locura en el rondo", desc: "Te metiste en el medio del clásico 'loco' y sacaste a pasear a dos defensores con una pisada hermosa." },
  { stat: "gambeta", nombre: "Dribbling en baldosa", desc: "Entrenamiento en espacios hiper reducidos. Aprendiste a esconder la pelota donde no entra ni un alfiler." },
  { stat: "gambeta", nombre: "El caño desmoralizador", desc: "Le metiste un caño de lujo al central en la práctica. Te ganaste una patada, pero tu confianza está por las nubes." },
  { stat: "liderazgo", nombre: "Charla de vestuario", desc: "Hubo un momento tenso antes de salir a la cancha y tomaste la palabra. El grupo te escucha con atención." },
  { stat: "liderazgo", nombre: "Orden táctico", desc: "El DT te pidió que acomodes a los más chicos durante la práctica. Tu voz de mando pesa cada vez más en la cancha." },
  { stat: "liderazgo", nombre: "Defensa del compañero", desc: "Fuiste a separar en un amistoso picante y marcaste territorio frente al rival. La cinta de capitán no te quedaría mal." },
  { stat: "resistencia", nombre: "Doble turno infernal", desc: "Sobreviviste a la pretemporada más dura que recuerdes. Tus pulmones ahora son de acero inoxidable." },
  { stat: "resistencia", nombre: "Fondo físico de 90'", desc: "Mientras otros piden el cambio ahogados, vos seguís corriendo. Completaste el circuito aeróbico sin despeinarte." },
  { stat: "resistencia", nombre: "Nutrición de élite", desc: "Cambiaste la dieta y mejoraste el descanso. Tu cuerpo se recupera rapidísimo y sos inalcanzable en el segundo tiempo." }
];

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

function generarCartas() {
  const cartas = [];
  for (let i = 0; i < 3; i++) {
    cartas.push(generarCarta());
  }
  return cartas;
}

function generarCarta() {
  const rareza = elegirRareza();
  const mejorasIndividuales = obtenerMejorasIndividuales();
  const mejorasDobles = obtenerMejorasDobles(mejorasIndividuales);
  let stats = [];
  let puntos = 0;
  let nombre = "";
  let desc = "";

  if (rareza === "comun" || rareza === "rara") {
    const mejora = elegirAleatorio(mejorasIndividuales);
    stats = [mejora.stat];
    nombre = mejora.nombre;
    desc = mejora.desc;
    puntos = rareza === "comun" ? numeroAleatorio(2, 3) : numeroAleatorio(3, 5);
  } else if (rareza === "dorada") {
    if (Math.random() < 0.85) {
      const mejora = elegirAleatorio(mejorasIndividuales);
      stats = [mejora.stat];
      nombre = mejora.nombre;
      desc = mejora.desc;
      puntos = numeroAleatorio(5, 7);
    } else {
      const mejora = elegirAleatorio(mejorasDobles);
      stats = mejora.stats;
      nombre = mejora.nombre;
      desc = mejora.desc;
      puntos = numeroAleatorio(6, 8);
    }
  } else {
    const mejora = elegirAleatorio(mejorasDobles);
    stats = mejora.stats;
    nombre = mejora.nombre;
    desc = mejora.desc;
    puntos = numeroAleatorio(9, 12);
  }

  return { rareza: rareza, stats: stats, puntos: puntos, nombre: nombre, desc: desc };
}

function aplicarCarta(jugador, carta) {
  const cap = obtenerCapStat(jugador);
  const multiplicador = jugador.esPromesa ? JOVEN_PROMESA.MULTIPLICADOR_CARTAS : 1;

  const statsActuales = { ...jugador.stats };
  carta.stats.forEach(stat => {
    const ganancia = Math.round(carta.puntos * multiplicador);
    statsActuales[stat] = Math.min(cap, (statsActuales[stat] || 0) + ganancia);
  });

  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[jugador.posicion];
  let nuevaMedia;
  if (config && config.atributos) {
    const keys = config.atributos.map(a => a.clave);
    const sum = keys.reduce((acc, key) => acc + (statsActuales[key] || 0), 0);
    nuevaMedia = Math.round(sum / keys.length);
  } else {
    nuevaMedia = Math.round((statsActuales.pegada + statsActuales.velocidad + statsActuales.gambeta) / 3);
  }
  const nuevoValor = calcularValorActualizado(nuevaMedia, jugador.edad);

  Estado.actualizarStats(statsActuales);
  Estado.actualizar({
    media: nuevaMedia,
    valor: nuevoValor,
    mediaMaxima: Math.max(jugador.mediaMaxima || 0, nuevaMedia),
    valorMaximo: Math.max(jugador.valorMaximo || 0, nuevoValor),
  });

  return { media: nuevaMedia, valor: nuevoValor };
}

function calcularValorActualizado(media, edad) {
  let mult = 1;
  if (edad >= 15 && edad <= 21) mult = 2;
  else if (edad >= 22 && edad <= 28) mult = 1.5;
  else if (edad >= 29 && edad <= 33) mult = 1;
  else mult = 0.5;

  const valorBruto = Math.pow((media - 40), 4) * 10 * mult;
  return Math.round(valorBruto / 1000000);
}

function elegirRareza() {
  const random = Math.random() * 100;
  if (random < 60) return "comun";   // antes 50%
  if (random < 92) return "rara";    // antes 35% -> ahora 32%
  if (random < 99) return "dorada";  // antes 13% -> ahora 7%
  return "leyenda";                  // antes 2% -> ahora 1%
}

function elegirAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obtenerMejorasIndividuales() {
  const jugador = typeof Estado !== "undefined" ? Estado.obtener() : null;
  const config = jugador && window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[jugador.posicion];
  const claves = new Set([...(config?.atributos || []).map(a => a.clave), "liderazgo", "resistencia"]);
  const propias = MEJORAS_1_STAT.filter(mejora => claves.has(mejora.stat));
  const existentes = new Set(propias.map(mejora => mejora.stat));

  const nombres = {
    pase: ["Pase filtrado", "Te quedaste después de práctica afinando pases entre líneas."],
    cerebro: ["Lectura de juego", "Analizaste movimientos y encontrás espacios antes que nadie."],
    marca: ["Marca pegajosa", "Trabajaste duelos defensivos hasta que no pasó nadie."],
    quite: ["Barrida limpia", "Afinaste el momento justo para recuperar sin hacer falta."],
    juegoAereo: ["Dueño del aire", "Ganaste cada pelota aérea en una práctica de centros."],
    reflejos: ["Reflejos felinos", "Una sesión de remates cortos dejó tus manos más rápidas."],
    ataje: ["Manos seguras", "Repetiste atajadas difíciles hasta controlar cada rebote."],
  };

  claves.forEach(clave => {
    if (!existentes.has(clave) && nombres[clave]) {
      propias.push({ stat: clave, nombre: nombres[clave][0], desc: nombres[clave][1] });
    }
  });

  return propias.length ? propias : MEJORAS_1_STAT;
}

function obtenerMejorasDobles(mejorasIndividuales) {
  const claves = [...new Set(mejorasIndividuales.map(mejora => mejora.stat))];
  const combinaciones = [];
  for (let i = 0; i < claves.length; i++) {
    for (let j = i + 1; j < claves.length; j++) {
      combinaciones.push({
        stats: [claves[i], claves[j]],
        nombre: "Entrenamiento de élite",
        desc: "Una práctica exigente elevó dos aspectos claves de tu juego.",
      });
    }
  }
  return combinaciones.length ? combinaciones : MEJORAS_2_STATS;
}