/**
 * rival.js
 * -----------------------------------------
 * Mecánica "Rival": al arrancar la carrera se sortea un jugador rival
 * que te sigue toda la vida. Compite contra vos en las 2 stats
 * principales de tu posición (las mismas que ya define cada archivo
 * de posición en `statsSuperiores`, ej: delantero.js -> goles+asistencias).
 *
 * Se engancha en 2 puntos que ya existían:
 * - estado.js -> expandirJugador() / normalizarJugador() crean al rival.
 * - estado.js -> avanzarTemporada() hace progresar al rival cada año.
 * - hud.js -> mostrarResumenAnual() genera las stats de la temporada del
 *   rival y arma el mensaje "Tu rival X obtuvo...".
 *
 * Reutiliza a propósito funciones que ya existían para no inventar
 * rangos nuevos:
 * - generarStatsAnualesPorPosicion(jugador) (hud.js): le paso un objeto
 *   con la media del rival y le pido "generame una temporada con esta
 *   media", así el rival rinde exactamente en el mismo rango que rendiría
 *   el jugador real con esa media.
 * - elegirCategoriaAleatoria(media) (traspasos.js): mismo sorteo de
 *   tamaño de club que usa el mercado de pases.
 * -----------------------------------------
 */

const RIVAL_CONFIG = {
  MEDIA_MIN_NORMAL: 55,
  MEDIA_MAX_NORMAL: 65,
  // Rango de nacimiento de un Joven Promesa: tomamos el mismo rango de
  // stats base que usa JOVEN_PROMESA para el jugador (JovenPromesa.js).
  MEDIA_MIN_PROMESA: 62,
  MEDIA_MAX_PROMESA: 75,
  AÑOS_ENTRE_CHEQUEO_CLUB: 2,
  PROB_CAMBIO_CLUB: 0.40,
};

// +1: 45% · +2: 30% · +3: 15% · +4: 5% · +0: 5%
const RIVAL_PROB_SUBIDA_MEDIA = [
  { inc: 1, prob: 45 },
  { inc: 2, prob: 30 },
  { inc: 3, prob: 15 },
  { inc: 4, prob: 5 },
  { inc: 0, prob: 5 },
];

const RIVAL_ABREVIATURAS = { goles: "G", asistencias: "A", vallasInvictas: "V", recuperaciones: "R", atajadas: "AT" };

// Lista cerrada de posibles nombres del rival. Se elige uno al azar por
// carrera. Algunos son solo nombre de pila a propósito (Giovanni,
// Benjamín), tal cual se pidió.
const RIVAL_NOMBRES_COMPLETOS = [
  "Fabricio Rivero", "Agustín Herrera", "Luciano Hilbe", "Nicolás Ojeda",
  "Nicolás Díaz", "Máximo Dethier", "Ignacio Bahamonde", "Dylan Rivero",
  "Alex Rivero", "Giovanni", "Máximo Mendietta", "Benjamín",
  "Facundo Prats", "Diego Colucci", "Axel Colucci", "Nicolás Acevedo",
];

function azarRival(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarNombreRival(nombreAEvitar) {
  let nombre = "";
  for (let intento = 0; intento < 6; intento++) {
    nombre = RIVAL_NOMBRES_COMPLETOS[azarRival(0, RIVAL_NOMBRES_COMPLETOS.length - 1)];
    if (nombre !== nombreAEvitar) break;
  }
  return nombre;
}


// Las 2 stats "principales" de la posición ya están definidas en cada
// archivo de posición (delantero.js, enganche.js, central.js, arquero.js).
function obtenerClavesStatsRival(posicion) {
  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[posicion];
  if (config && Array.isArray(config.statsSuperiores) && config.statsSuperiores.length >= 2) {
    return config.statsSuperiores.slice(0, 2).map((s) => s.clave);
  }
  return ["goles", "asistencias"];
}

function obtenerEtiquetasStatsRival(posicion) {
  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[posicion];
  if (config && Array.isArray(config.statsSuperiores) && config.statsSuperiores.length >= 2) {
    return config.statsSuperiores.slice(0, 2).map((s) => s.etiqueta);
  }
  return ["Goles", "Asistencias"];
}

function obtenerAbreviaturaComboRival(posicion) {
  return obtenerClavesStatsRival(posicion).map((clave) => RIVAL_ABREVIATURAS[clave] || "?").join("+");
}

// Club al azar para el rival: liga al azar, tamaño según su media
// (reutilizando elegirCategoriaAleatoria de traspasos.js), club al azar
// dentro de esa combinación.
function elegirClubRivalAlAzar(media, excluirClubId) {
  const divisiones = Object.keys(CLUBES_POR_DIVISION || {}).filter((id) => (CLUBES_POR_DIVISION[id] || []).length > 0);
  if (divisiones.length === 0) return null;
  const division = divisiones[azarRival(0, divisiones.length - 1)];
  const clubes = (CLUBES_POR_DIVISION[division] || []).filter((c) => c.id !== excluirClubId);
  if (clubes.length === 0) return null;

  const categoria = typeof elegirCategoriaAleatoria === "function" ? elegirCategoriaAleatoria(media) : null;
  let candidatos = categoria ? clubes.filter((c) => c.categoria === categoria) : clubes;
  if (candidatos.length === 0) candidatos = clubes;
  return candidatos[azarRival(0, candidatos.length - 1)];
}

function obtenerCapMediaRival(rival) {
  if (typeof JOVEN_PROMESA === "undefined") return rival.esPromesa ? 109 : 99;
  return rival.esPromesa ? JOVEN_PROMESA.CAP_PROMESA : JOVEN_PROMESA.CAP_NORMAL;
}

// ============================================
// CREACIÓN (al arrancar la carrera)
// ============================================
function crearRival(jugador) {
  const esPromesa = !!jugador.esPromesa; // el rival es promesa si y solo si vos lo sos
  const media = esPromesa
    ? azarRival(RIVAL_CONFIG.MEDIA_MIN_PROMESA, RIVAL_CONFIG.MEDIA_MAX_PROMESA)
    : azarRival(RIVAL_CONFIG.MEDIA_MIN_NORMAL, RIVAL_CONFIG.MEDIA_MAX_NORMAL);

  const club = elegirClubRivalAlAzar(media, jugador.club);
  const clavesStats = obtenerClavesStatsRival(jugador.posicion);
  const statsVacias = {};
  clavesStats.forEach((clave) => { statsVacias[clave] = 0; });

  return {
    nombre: generarNombreRival(jugador.nombre),
    posicion: jugador.posicion,
    esPromesa,
    club: club ? club.id : jugador.club,
    edad: azarRival(15, 19),
    media,
    mediaMaxima: media,
    statsAnuales: { ...statsVacias },
    statsTotales: { ...statsVacias },
    añoUltimoChequeoClub: jugador.año,
  };
}

// ============================================
// PROGRESIÓN ANUAL (llamado desde Estado.avanzarTemporada)
// ============================================
function subirMediaRival(rival) {
  let random = Math.random() * 100;
  let incremento = 0;
  for (const opcion of RIVAL_PROB_SUBIDA_MEDIA) {
    random -= opcion.prob;
    if (random <= 0) { incremento = opcion.inc; break; }
  }
  const cap = obtenerCapMediaRival(rival);
  rival.media = Math.min(cap, rival.media + incremento);
  rival.mediaMaxima = Math.max(rival.mediaMaxima || rival.media, rival.media);
}

function evaluarCambioClubRival(rival, añoActual, clubJugador) {
  if ((añoActual - (rival.añoUltimoChequeoClub || añoActual)) < RIVAL_CONFIG.AÑOS_ENTRE_CHEQUEO_CLUB) return;
  rival.añoUltimoChequeoClub = añoActual;
  if (Math.random() < RIVAL_CONFIG.PROB_CAMBIO_CLUB) {
    const nuevoClub = elegirClubRivalAlAzar(rival.media, clubJugador);
    if (nuevoClub) rival.club = nuevoClub.id;
  }
}

// Se llama una vez por año, al cierre de temporada: acumula lo que
// rindió esta temporada a sus totales de carrera, sube de media y
// evalúa si cambia de club. Deja las stats anuales en 0 para que
// mostrarResumenAnual() genere las del año siguiente.
function avanzarRival(jugador) {
  const rival = jugador.rival;
  if (!rival) return;

  const clavesStats = obtenerClavesStatsRival(jugador.posicion);
  if (!rival.statsTotales) rival.statsTotales = {};
  clavesStats.forEach((clave) => {
    rival.statsTotales[clave] = (rival.statsTotales[clave] || 0) + (rival.statsAnuales?.[clave] || 0);
  });

  subirMediaRival(rival);
  evaluarCambioClubRival(rival, jugador.año, jugador.club);

  rival.statsAnuales = {};
  clavesStats.forEach((clave) => { rival.statsAnuales[clave] = 0; });
  rival.statsGeneradasAño = null;
}

// Genera (una sola vez por año) el rendimiento del rival en la
// temporada, reutilizando la misma fórmula que ya usa el jugador real
// (generarStatsAnualesPorPosicion, definida en hud.js) para que salga
// en el mismo rango que tendría el jugador con esa media.
function generarStatsTemporadaRivalSiHaceFalta(jugador) {
  const rival = jugador.rival;
  if (!rival) return;
  if (rival.statsGeneradasAño === jugador.año) return; // ya se generaron este año

  const clavesStats = obtenerClavesStatsRival(jugador.posicion);
  if (typeof generarStatsAnualesPorPosicion === "function") {
    const produccion = generarStatsAnualesPorPosicion({ media: rival.media, posicion: rival.posicion, stats: { resistencia: 50 } });
    const statsAnuales = {};
    clavesStats.forEach((clave) => { statsAnuales[clave] = produccion[clave] || 0; });
    rival.statsAnuales = statsAnuales;
  }
  rival.statsGeneradasAño = jugador.año;
}

// ============================================
// TEXTOS
// ============================================
function generarMensajeRival(jugador) {
  const rival = jugador.rival;
  if (!rival) return "";

  const claves = obtenerClavesStatsRival(jugador.posicion);
  const etiquetas = obtenerEtiquetasStatsRival(jugador.posicion).map((e) => e.toLowerCase());
  const rivalStat1 = rival.statsAnuales?.[claves[0]] || 0;
  const rivalStat2 = rival.statsAnuales?.[claves[1]] || 0;
  const jugadorStat1 = jugador.statsAnuales?.[claves[0]] || 0;
  const jugadorStat2 = jugador.statsAnuales?.[claves[1]] || 0;
  const sumaRival = rivalStat1 + rivalStat2;
  const sumaJugador = jugadorStat1 + jugadorStat2;
  const estrella = rival.esPromesa ? " 🌟" : "";

  const base = `Tu rival ${rival.nombre}${estrella} obtuvo ${rivalStat1} ${etiquetas[0]} y ${rivalStat2} ${etiquetas[1]} esta temporada`;

  if (sumaRival > sumaJugador) return `${base} y te ganó la pulseada, a bancarse las cargadas.`;
  if (sumaJugador > sumaRival) return `${base} y quedó debajo tuyo esta temporada, ¡LTA bobo!`;
  return `${base} y quedaron empatados esta temporada. Se define en la próxima.`;
}

// ============================================
// DATOS PARA EL HUD (burbuja + modal "Tu Rival")
// ============================================
function obtenerComparacionRival(jugador) {
  const rival = jugador.rival;
  const claves = obtenerClavesStatsRival(jugador.posicion);
  const totalJugador = claves.reduce((acc, clave) => acc + (jugador.stats?.[clave] || 0), 0);
  const totalRival = rival ? claves.reduce((acc, clave) => acc + (rival.statsTotales?.[clave] || 0), 0) : 0;
  return {
    claves,
    etiquetas: obtenerEtiquetasStatsRival(jugador.posicion),
    combo: obtenerAbreviaturaComboRival(jugador.posicion),
    totalJugador,
    totalRival,
  };
}

function pintarBurbujaRival(jugador, contenedor) {
  const rival = jugador.rival;
  const comparacion = obtenerComparacionRival(jugador);
  const burbuja = document.createElement("button");
  burbuja.type = "button";
  burbuja.className = "burbuja burbuja--global burbuja--rival";
  burbuja.innerHTML = `
    <span class="burbuja__valor">
      <span class="rival-marcador__jugador">${comparacion.totalJugador}</span>
      <span class="rival-marcador__separador">-</span>
      <span class="rival-marcador__rival">${comparacion.totalRival}</span>
    </span>
    <span class="burbuja__etiqueta">Rival${rival ? "" : " (—)"}</span>
  `;
  if (rival) burbuja.addEventListener("click", () => abrirModalRival());
  contenedor.appendChild(burbuja);
}

function abrirModalRival() {
  const jugador = Estado.obtener();
  const rival = jugador.rival;
  const modal = document.getElementById("modal-rival");
  if (!modal || !rival) return;

  const comparacion = obtenerComparacionRival(jugador);
  const clubJugador = (typeof NOMBRES_CLUBES !== "undefined" && NOMBRES_CLUBES[jugador.club]) || {};
  const clubRival = (typeof NOMBRES_CLUBES !== "undefined" && NOMBRES_CLUBES[rival.club]) || {};

  const nombreEl = document.getElementById("rival-nombre");
  const escudoEl = document.getElementById("rival-escudo");
  const mediaEl = document.getElementById("rival-media");
  const mediaJugadorEl = document.getElementById("rival-media-jugador");
  const comboEl = document.getElementById("rival-combo-etiqueta");
  const marcadorJugadorEl = document.getElementById("rival-marcador-jugador");
  const marcadorRivalEl = document.getElementById("rival-marcador-rival");
  const detalleEl = document.getElementById("rival-detalle");

  if (nombreEl) nombreEl.textContent = `${rival.nombre}${rival.esPromesa ? " 🌟" : ""}`;
  if (escudoEl) {
    if (clubRival.escudo) { escudoEl.src = clubRival.escudo; escudoEl.hidden = false; escudoEl.onerror = () => (escudoEl.hidden = true); }
    else escudoEl.hidden = true;
  }
  if (mediaEl) mediaEl.textContent = rival.media;
  if (mediaJugadorEl) mediaJugadorEl.textContent = jugador.media;
  if (comboEl) comboEl.textContent = comparacion.combo;
  if (marcadorJugadorEl) marcadorJugadorEl.textContent = comparacion.totalJugador;
  if (marcadorRivalEl) marcadorRivalEl.textContent = comparacion.totalRival;
  if (detalleEl) {
    detalleEl.innerHTML = comparacion.claves.map((clave, i) => `
      <div class="rival-detalle__fila">
        <span class="rival-detalle__etiqueta">${comparacion.etiquetas[i]}</span>
        <span class="rival-detalle__valores">
          <span class="rival-marcador__jugador">${jugador.stats?.[clave] || 0}</span>
          <span class="rival-marcador__separador">/</span>
          <span class="rival-marcador__rival">${rival.statsTotales?.[clave] || 0}</span>
        </span>
      </div>`).join("");
  }

  const nombreClubJugadorEl = document.getElementById("rival-club-jugador");
  const nombreClubRivalEl = document.getElementById("rival-club-rival");
  if (nombreClubJugadorEl) nombreClubJugadorEl.textContent = clubJugador.nombre || "—";
  if (nombreClubRivalEl) nombreClubRivalEl.textContent = clubRival.nombre || "—";

  modal.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-rival");
  if (!modal) return;
  const cerrar = () => { modal.hidden = true; };
  const botonCerrar = document.getElementById("rival-cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", cerrar);
  modal.addEventListener("click", (evento) => { if (evento.target === modal) cerrar(); });
});

// ============================================
// VEREDICTO FINAL DE LA RIVALIDAD (pantalla de resumen de carrera)
// ============================================
function pintarResumenFinalRival(jugador) {
  const contenedor = document.getElementById("resumen-final-rival");
  if (!contenedor) return;
  const rival = jugador.rival;
  if (!rival) { contenedor.hidden = true; return; }

  const comparacion = obtenerComparacionRival(jugador);
  const clubRival = (typeof NOMBRES_CLUBES !== "undefined" && NOMBRES_CLUBES[rival.club]) || {};

  let veredicto;
  if (comparacion.totalJugador > comparacion.totalRival) veredicto = "Le ganaste la pulseada de toda la vida. 🏆";
  else if (comparacion.totalRival > comparacion.totalJugador) veredicto = "Se quedó con la rivalidad esta vez. Habrá revancha en la próxima carrera.";
  else veredicto = "Terminaron empatados. Ninguno de los dos se la pudo llevar.";

  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="resumen-final__rival-titulo">TU RIVAL DE TODA LA VIDA</div>
    <div class="resumen-final__rival-nombre">${rival.nombre}${rival.esPromesa ? " 🌟" : ""} ${clubRival.nombre ? `(${clubRival.nombre})` : ""}</div>
    <div class="resumen-final__rival-marcador">
      <span class="rival-marcador__jugador">${comparacion.totalJugador}</span>
      <span class="rival-marcador__separador">-</span>
      <span class="rival-marcador__rival">${comparacion.totalRival}</span>
      <span class="resumen-final__rival-combo">(${comparacion.combo})</span>
    </div>
    <div class="resumen-final__rival-veredicto">${veredicto}</div>
  `;
}