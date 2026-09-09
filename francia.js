/**
 * ligue1.js
 * -----------------------------------------
 * Motor de Ligue 1 + Copa de Francia + SuperCopa de Francia (Trophée des
 * Champions). Mismo patrón que serieA.js / bundesliga.js. Vive aparte y
 * solo se activa cuando jugador.liga === CONFIG_LIGA_FRANCIA.liga.
 *
 * Reutiliza:
 * - crearCabeceraMinijuego (minijuegos.js)
 * - minijuegoBarraEuropaGenerico / minijuegoReaccionEuropaGenerico /
 *   minijuegoPatronEuropaGenerico (espana.js) para no reinventar los
 *   minijuegos: solo cambia el "cfg" (título, stat, tema).
 * - agendarPlazaUEFA (copasinternacionalesclubes.js) para las plazas de
 *   Champions/Europa/Conference.
 * -----------------------------------------
 */

const CONFIG_LIGA_FRANCIA = {
  liga: "ligue-1-francia",
  division: "ligue-1-francia",
  nombreLiga: "Ligue 1",
  nombreCopa: "Copa de Francia",
  nombreSuperCopa: "SuperCopa de Francia",
  trofeoLiga: "Trofeos/LigaFrancia.png",
  trofeoCopa: "Trofeos/CopaFrancia.png",
  trofeoSuperCopa: "Trofeos/SuperCopaFrancia.png",
  claveLiga: "ligaFrancia",
  claveCopa: "copaFrancia",
  claveSuperCopa: "superCopaFrancia",
};

// ============================================
// PROBABILIDADES
// ============================================
// Liga: grandes 60%, medianos 30%, chicos 7%, diminutos 3%.
const PROB_CATEGORIA_FRANCIA = { grande: 60, mediano: 30, chico: 7, diminuto: 3 };

const BONUS_MEDIA_FRANCIA = [
  { min: 0, max: 55, bonus: 5 },
  { min: 56, max: 65, bonus: 10 },
  { min: 66, max: 75, bonus: 18 },
  { min: 76, max: 85, bonus: 26 },
  { min: 86, max: 95, bonus: 33 },
  { min: 96, max: 109, bonus: 40 },
];
function bonusPorMediaFrancia(media) {
  const rango = BONUS_MEDIA_FRANCIA.find((r) => media >= r.min && media <= r.max);
  return rango ? rango.bonus : 0;
}

// Copa de Francia / SuperCopa: 65/25/8/2, sin bonus por media.
const PROB_CATEGORIA_COPA_FRANCESA = { grande: 65, mediano: 25, chico: 8, diminuto: 2 };

function obtenerRivalFrancia(jugador, idDivision) {
  const clubes = (CLUBES_POR_DIVISION[idDivision] || []).filter((c) => c.id !== jugador.club);
  return clubes[Math.floor(Math.random() * clubes.length)];
}

// ============================================
// SIMULACIÓN DE LIGA (sorteo ponderado por categoría + bonus de media)
// ============================================
function simularLigaFrancia(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_FRANCIA.division] || [];
  if (clubes.length === 0) return { esCampeon: false, posicion: 99, subcampeon: false };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    let prob = (PROB_CATEGORIA_FRANCIA[club.categoria] || 10) / mismaCategoria;
    if (club.id === jugador.club) prob += bonusPorMediaFrancia(jugador.media);
    totalProb += prob;
    return { club, prob };
  });

  let random = Math.random() * totalProb;
  let campeon = null;
  for (const item of porClub) {
    random -= item.prob;
    if (random <= 0) { campeon = item.club; break; }
  }
  if (!campeon) campeon = porClub[porClub.length - 1].club;

  const esCampeon = campeon.id === jugador.club;
  if (!esCampeon) {
    const posicion = Math.floor(Math.random() * (clubes.length - 1)) + 2;
    return { esCampeon: false, posicion, subcampeon: false };
  }
  return Math.random() < 0.6
    ? { esCampeon: true, posicion: 1, subcampeon: false }
    : { esCampeon: true, posicion: 1, subcampeon: false, minijuego: true };
}

// ============================================
// "FINAL DIRECTA" de la Copa de Francia
// ============================================
const RONDAS_ELIMINACION_TEMPRANA_FRANCIA = ["Trigésima Segunda de Final", "Octavos de Final", "Cuartos de Final", "Semifinal"];

function simularFinalDirectaFrancia(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_FRANCIA.division] || [];
  if (clubes.length === 0) return { eliminadoTemprano: true, ronda: "Fase previa" };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    const prob = (PROB_CATEGORIA_COPA_FRANCESA[club.categoria] || 5) / mismaCategoria;
    totalProb += prob;
    return { club, prob };
  });

  let random = Math.random() * totalProb;
  let finalistaUno = null;
  for (const item of porClub) {
    random -= item.prob;
    if (random <= 0) { finalistaUno = item.club; break; }
  }
  if (!finalistaUno) finalistaUno = porClub[porClub.length - 1].club;

  if (finalistaUno.id !== jugador.club) {
    const ronda = RONDAS_ELIMINACION_TEMPRANA_FRANCIA[Math.floor(Math.random() * RONDAS_ELIMINACION_TEMPRANA_FRANCIA.length)];
    return { eliminadoTemprano: true, ronda };
  }
  const rival = obtenerRivalFrancia(jugador, CONFIG_LIGA_FRANCIA.division);
  return { enFinal: true, rival };
}

// ============================================
// MINIJUEGOS (reutiliza los 3 arquetipos de espana.js)
// ============================================
const MINIJUEGOS_FRANCIA = {
  delantero: {
    liga: { tipo: "barra", titulo: "Definición Francesa", descripcion: "Soltá cuando la barra entre en la zona dorada.", statClave: "pegada", tema: "liga", orientacion: "vertical" },
    copa: { tipo: "reaccion", titulo: "Contragolpe de Copa", descripcion: "El arquero no te va a dar dos chances.", statClave: "velocidad", tema: "copa", rondas: 3 },
    supercopa: { tipo: "barra", titulo: "Remate de Gala Francesa", descripcion: "Bajo las luces de la SuperCopa, definí con clase.", statClave: "gambeta", tema: "superCopa", orientacion: "horizontal", velocidad: 6 },
  },
  enganche: {
    liga: { tipo: "patron", titulo: "Pase entre líneas", descripcion: "Memorizá el circuito y encontrá el hueco.", statClave: "pase", tema: "liga", longitud: 5 },
    copa: { tipo: "reaccion", titulo: "Asistencia de Copa", descripcion: "Encontrá la línea de pase antes de que se cierre.", statClave: "cerebro", tema: "copa", rondas: 3 },
    supercopa: { tipo: "barra", titulo: "Gambeta de Gala", descripcion: "Encará al último hombre en la gran final.", statClave: "gambeta", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
  },
  central: {
    liga: { tipo: "barra", titulo: "Muro Francés", descripcion: "Cronometrá el salto para cortar el centro.", statClave: "marca", tema: "liga", orientacion: "horizontal" },
    copa: { tipo: "reaccion", titulo: "Despeje de Copa", descripcion: "Cada pelota en el área es una emergencia.", statClave: "juegoAereo", tema: "copa", rondas: 3 },
    supercopa: { tipo: "patron", titulo: "Recuperación de Gala", descripcion: "Leé la secuencia rival y cortala.", statClave: "quite", tema: "superCopa", longitud: 5 },
  },
  arquero: {
    liga: { tipo: "barra", titulo: "Palomita Francesa", descripcion: "Estirate justo a tiempo para sacarla.", statClave: "reflejos", tema: "liga", orientacion: "vertical" },
    copa: { tipo: "reaccion", titulo: "Mano de Copa", descripcion: "El delantero define rápido, vos más.", statClave: "ataje", tema: "copa", rondas: 3 },
    supercopa: { tipo: "patron", titulo: "Vuelo de Gala", descripcion: "Anticipá el centro bombeado antes de que caiga.", statClave: "juegoAereo", tema: "superCopa", longitud: 5 },
  },
};

function obtenerMinijuegoFrancia(competencia, jugador, rival) {
  const porPosicion = MINIJUEGOS_FRANCIA[jugador.posicion] || MINIJUEGOS_FRANCIA.delantero;
  const cfg = porPosicion[competencia];
  return (callback) => {
    if (cfg.tipo === "barra") minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg);
    else if (cfg.tipo === "reaccion") minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg);
    else minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg);
  };
}

function crearCabeceraFrancia(jugador, rival, nombreCompetencia, fase) {
  window.CONTEXTO_PARTIDO = { torneo: nombreCompetencia, fase };
  return crearCabeceraMinijuego(jugador, rival);
}

// ============================================
// PANTALLAS DE RESULTADO
// ============================================

function mostrarResultadoLigaFrancia(resultado, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = obtenerRivalFrancia(jugador, CONFIG_LIGA_FRANCIA.division);
  const cabecera = crearCabeceraFrancia(jugador, rival, CONFIG_LIGA_FRANCIA.nombreLiga, resultado.esCampeon ? "Definición del título" : "Fin de temporada");

  if (!resultado.esCampeon) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de ${CONFIG_LIGA_FRANCIA.nombreLiga}.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  if (!resultado.minijuego) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA LIGUE 1!</h2><img src="${CONFIG_LIGA_FRANCIA.trofeoLiga}" alt="Ligue 1"><p>Título asegurado. El vestuario es una fiesta.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Se define la Ligue 1 en la última fecha! Un buen partido y el título es tuyo.</p><button class="boton-jugar-minijuego" id="btn-jugar-liga-francia">¡Jugar la Definición!</button></div>`;
  document.getElementById("btn-jugar-liga-francia").addEventListener("click", () => {
    obtenerMinijuegoFrancia("liga", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA LIGUE 1!</h2><img src="${CONFIG_LIGA_FRANCIA.trofeoLiga}" alt="Ligue 1"><p>El título se queda en casa.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de la Ligue 1 🥈</h2><p>Estuviste ahí nomás, pero el título se escapó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ ...resultado, esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarResultadoCopaFrancia(sim, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");

  if (sim.eliminadoTemprano) {
    contenedor.hidden = false;
    contenedor.innerHTML = `<div class="competition-card subcampeon"><h2>Eliminado en ${sim.ronda} de la Copa de Francia</h2><p>El sueño se cortó antes de la gran final. Habrá revancha el año que viene.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback({ esCampeon: false, subcampeon: false, ronda: sim.ronda });
    });
    return;
  }

  const cabecera = crearCabeceraFrancia(jugador, sim.rival, CONFIG_LIGA_FRANCIA.nombreCopa, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Final de la Copa de Francia! Ganá esta instancia para levantar el título.</p><button class="boton-jugar-minijuego" id="btn-jugar-copa-francia">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-copa-francia").addEventListener("click", () => {
    obtenerMinijuegoFrancia("copa", jugador, sim.rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA COPA DE FRANCIA!</h2><img src="${CONFIG_LIGA_FRANCIA.trofeoCopa}" alt="Copa de Francia"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón de la Copa de Francia 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarSuperCopaFrancia(copa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const cabecera = crearCabeceraFrancia(jugador, rival, CONFIG_LIGA_FRANCIA.nombreSuperCopa, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡SuperCopa de Francia! El campeón de la Ligue 1 se mide con el campeón de la Copa de Francia para arrancar el año.</p><button class="boton-jugar-minijuego" id="btn-jugar-supercopa-francia">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-supercopa-francia").addEventListener("click", () => {
    obtenerMinijuegoFrancia("supercopa", jugador, rival)((exito) => {
      if (exito) {
        if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
        let hist = jugador.campeonesHistorial.find((h) => h.año === jugador.año);
        if (!hist) { hist = { año: jugador.año }; jugador.campeonesHistorial.push(hist); }
        hist[CONFIG_LIGA_FRANCIA.claveSuperCopa] = jugador.club;
        jugador.stats.titulos++;
        Estado.guardar();
      }
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡SUPERCOPA DE FRANCIA!</h2><img src="${CONFIG_LIGA_FRANCIA.trofeoSuperCopa}" alt="SuperCopa de Francia"><p>Arrancás el año con un título bajo el brazo. No da boleto a nada más, pero suma a la vitrina.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón de la SuperCopa de Francia 🥈</h2><p>Cerca, pero no alcanzó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback();
      };
    });
  });
}

// ============================================
// AGENDAR / PROCESAR SUPERCOPA (se juega al arrancar la temporada siguiente)
// ============================================
function agendarSuperCopaFrancia(jugador, añoActual, campeonLigaId, campeonCopaId) {
  if (!Array.isArray(jugador.copasPendientesFrancia)) jugador.copasPendientesFrancia = [];
  const soyLiga = campeonLigaId === jugador.club;
  const soyCopa = campeonCopaId === jugador.club;
  if (!soyLiga && !soyCopa) return;

  let rivalId;
  if (soyLiga && soyCopa) rivalId = obtenerRivalFrancia(jugador, CONFIG_LIGA_FRANCIA.division)?.id;
  else if (soyLiga) rivalId = campeonCopaId;
  else rivalId = campeonLigaId;
  if (!rivalId || rivalId === jugador.club) rivalId = obtenerRivalFrancia(jugador, CONFIG_LIGA_FRANCIA.division)?.id;
  if (!rivalId) return;

  jugador.copasPendientesFrancia.push({ año: añoActual + 1, tipo: "supercopa-francia", rivalId });
}

function procesarSuperCopaFranciaPendiente(jugador, año, callback) {
  const pendiente = (jugador.copasPendientesFrancia || []).find((c) => c.año === año);
  if (!pendiente) { callback(); return; }
  mostrarSuperCopaFrancia(pendiente, () => {
    jugador.copasPendientesFrancia = (jugador.copasPendientesFrancia || []).filter((c) => c !== pendiente);
    Estado.guardar();
    callback();
  });
}

// ============================================
// CLASIFICACIÓN A COMPETENCIAS UEFA
// Ligue 1: 1º-4º Champions, 5º Europa League, 6º Conference League.
// Copa de Francia campeón: Europa League (salvo que ya clasifique a algo mejor).
// La SuperCopa no otorga clasificación a ninguna competencia.
// ============================================
function agendarClasificacionFrancia(jugador, añoActual, resLiga) {
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  let tipo = null;
  if (resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4)) tipo = "champions";
  else if (posicion === 5) tipo = "europa-league";
  else if (posicion === 6) tipo = "conference-league";
  if (tipo) agendarPlazaUEFA(jugador, añoProximo, tipo, "ligue-1");
}

// ============================================
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaFrancia(jugador, año, callbackFinal) {
  if (!Array.isArray(jugador.copasPendientesFrancia)) jugador.copasPendientesFrancia = [];
  if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];

  procesarSuperCopaFranciaPendiente(jugador, año, () => {
    const resultadoLiga = simularLigaFrancia(jugador);

    mostrarResultadoLigaFrancia(resultadoLiga, (resLiga) => {
      jugador.resultadoLigaFrancia = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      let hist = jugador.campeonesHistorial.find((h) => h.año === año);
      if (!hist) { hist = { año }; jugador.campeonesHistorial.push(hist); }
      hist[CONFIG_LIGA_FRANCIA.claveLiga] = resLiga.esCampeon ? jugador.club : null;

      const simCopa = simularFinalDirectaFrancia(jugador);
      mostrarResultadoCopaFrancia(simCopa, (resCopa) => {
        hist[CONFIG_LIGA_FRANCIA.claveCopa] = resCopa.esCampeon ? jugador.club : null;
        jugador.resultadoCopaFrancia = resCopa;
        if (resCopa.esCampeon) {
          jugador.stats.titulos++;
          agendarPlazaUEFA(jugador, año + 1, "europa-league", "copa-francia");
        }

        agendarClasificacionFrancia(jugador, año, resLiga);
        agendarSuperCopaFrancia(jugador, año, resLiga.esCampeon ? jugador.club : null, resCopa.esCampeon ? jugador.club : null);
        if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);

        const terminarTemporada = () => { Estado.guardar(); callbackFinal(); };
        if (typeof procesarCopasPendientes === "function") procesarCopasPendientes(terminarTemporada);
        else terminarTemporada();
      });
    });
  });
}
