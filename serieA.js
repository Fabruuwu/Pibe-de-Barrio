/**
 * serieA.js
 * -----------------------------------------
 * Motor de Serie A + Coppa Italia + SuperCoppa Italia.
 * Mismo patrón que premierLeague.js / espana.js. Vive aparte y solo se
 * activa cuando jugador.liga === CONFIG_LIGA_SERIEA.liga.
 * -----------------------------------------
 */

const CONFIG_LIGA_SERIEA = {
  liga: "serie-a-italia",
  division: "serie-a-italia",
  nombreLiga: "Serie A",
  nombreCoppa: "Coppa Italia",
  nombreSuperCoppa: "SuperCoppa Italia",
  trofeoLiga: "Trofeos/LigaItalia.png",
  trofeoCoppa: "Trofeos/CopaItalia.png",
  trofeoSuperCoppa: "Trofeos/SuperCopaItalia.png",
  claveLiga: "ligaSerieA",
  claveCoppa: "coppaItalia",
  claveSuperCoppa: "supercoppaItalia",
};

// ============================================
// PROBABILIDADES
// ============================================
const PROB_CATEGORIA_SERIEA = { grande: 60, mediano: 30, chico: 7, diminuto: 3 };

const BONUS_MEDIA_SERIEA = [
  { min: 0, max: 55, bonus: 5 },
  { min: 56, max: 65, bonus: 10 },
  { min: 66, max: 75, bonus: 18 },
  { min: 76, max: 85, bonus: 26 },
  { min: 86, max: 95, bonus: 33 },
  { min: 96, max: 109, bonus: 40 },
];
function bonusPorMediaSerieA(media) {
  const rango = BONUS_MEDIA_SERIEA.find((r) => media >= r.min && media <= r.max);
  return rango ? rango.bonus : 0;
}

// Coppa Italia / SuperCoppa: 65/25/8/2, sin bonus por media.
const PROB_CATEGORIA_COPA_ITALIANA = { grande: 65, mediano: 25, chico: 8, diminuto: 2 };

function obtenerRivalSerieA(jugador, idDivision) {
  const clubes = (CLUBES_POR_DIVISION[idDivision] || []).filter((c) => c.id !== jugador.club);
  return clubes[Math.floor(Math.random() * clubes.length)];
}

// ============================================
// SIMULACIÓN DE LIGA
// ============================================
function simularLigaSerieA(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_SERIEA.division] || [];
  if (clubes.length === 0) return { esCampeon: false, posicion: 99, subcampeon: false };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    let prob = (PROB_CATEGORIA_SERIEA[club.categoria] || 10) / mismaCategoria;
    if (club.id === jugador.club) prob += bonusPorMediaSerieA(jugador.media);
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
// "FINAL DIRECTA" de la Coppa Italia
// ============================================
const RONDAS_ELIMINACION_TEMPRANA_ITALIA = ["Tercera Ronda", "Octavos de Final", "Cuartos de Final", "Semifinal"];

function simularFinalDirectaSerieA(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_SERIEA.division] || [];
  if (clubes.length === 0) return { eliminadoTemprano: true, ronda: "Fase previa" };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    const prob = (PROB_CATEGORIA_COPA_ITALIANA[club.categoria] || 5) / mismaCategoria;
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
    const ronda = RONDAS_ELIMINACION_TEMPRANA_ITALIA[Math.floor(Math.random() * RONDAS_ELIMINACION_TEMPRANA_ITALIA.length)];
    return { eliminadoTemprano: true, ronda };
  }
  const rival = obtenerRivalSerieA(jugador, CONFIG_LIGA_SERIEA.division);
  return { enFinal: true, rival };
}

// ============================================
// MINIJUEGOS (reutiliza los 3 arquetipos de espana.js)
// ============================================
const MINIJUEGOS_SERIEA = {
  delantero: {
    liga: { tipo: "barra", titulo: "Definición Azzurra", descripcion: "Soltá cuando la barra entre en la zona dorada.", statClave: "pegada", tema: "liga", orientacion: "vertical" },
    coppa: { tipo: "reaccion", titulo: "Contragolpe de Coppa", descripcion: "El arquero no te va a dar dos chances.", statClave: "velocidad", tema: "copa", rondas: 3 },
    supercoppa: { tipo: "barra", titulo: "Remate de Gala Italiana", descripcion: "Bajo las luces de la Supercoppa, definí con clase.", statClave: "gambeta", tema: "superCopa", orientacion: "horizontal", velocidad: 6 },
  },
  enganche: {
    liga: { tipo: "patron", titulo: "Pase al Catenaccio", descripcion: "Memorizá el circuito y encontrá el hueco.", statClave: "pase", tema: "liga", longitud: 5 },
    coppa: { tipo: "reaccion", titulo: "Asistencia de Coppa", descripcion: "Encontrá la línea de pase antes de que se cierre.", statClave: "cerebro", tema: "copa", rondas: 3 },
    supercoppa: { tipo: "barra", titulo: "Gambeta de Gala", descripcion: "Encará al último hombre en la gran final.", statClave: "gambeta", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
  },
  central: {
    liga: { tipo: "barra", titulo: "Muro Italiano", descripcion: "Cronometrá el salto para cortar el centro.", statClave: "marca", tema: "liga", orientacion: "horizontal" },
    coppa: { tipo: "reaccion", titulo: "Despeje de Coppa", descripcion: "Cada pelota en el área es una emergencia.", statClave: "juegoAereo", tema: "copa", rondas: 3 },
    supercoppa: { tipo: "patron", titulo: "Recuperación de Gala", descripcion: "Leé la secuencia rival y cortala.", statClave: "quite", tema: "superCopa", longitud: 5 },
  },
  arquero: {
    liga: { tipo: "barra", titulo: "Palomita Azzurra", descripcion: "Estirate justo a tiempo para sacarla.", statClave: "reflejos", tema: "liga", orientacion: "vertical" },
    coppa: { tipo: "reaccion", titulo: "Mano de Coppa", descripcion: "El delantero define rápido, vos más.", statClave: "ataje", tema: "copa", rondas: 3 },
    supercoppa: { tipo: "patron", titulo: "Vuelo de Gala", descripcion: "Anticipá el centro bombeado antes de que caiga.", statClave: "juegoAereo", tema: "superCopa", longitud: 5 },
  },
};

function obtenerMinijuegoSerieA(competencia, jugador, rival) {
  const porPosicion = MINIJUEGOS_SERIEA[jugador.posicion] || MINIJUEGOS_SERIEA.delantero;
  const cfg = porPosicion[competencia];
  return (callback) => {
    if (cfg.tipo === "barra") minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg);
    else if (cfg.tipo === "reaccion") minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg);
    else minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg);
  };
}

function crearCabeceraSerieA(jugador, rival, nombreCompetencia, fase) {
  window.CONTEXTO_PARTIDO = { torneo: nombreCompetencia, fase };
  return crearCabeceraMinijuego(jugador, rival);
}

// ============================================
// PANTALLAS DE RESULTADO
// ============================================

function mostrarResultadoLigaSerieA(resultado, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = obtenerRivalSerieA(jugador, CONFIG_LIGA_SERIEA.division);
  const cabecera = crearCabeceraSerieA(jugador, rival, CONFIG_LIGA_SERIEA.nombreLiga, resultado.esCampeon ? "Definición del título" : "Fin de temporada");

  if (!resultado.esCampeon) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de ${CONFIG_LIGA_SERIEA.nombreLiga}.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  if (!resultado.minijuego) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA SERIE A!</h2><img src="${CONFIG_LIGA_SERIEA.trofeoLiga}" alt="Serie A"><p>Scudetto asegurado. El vestuario es una fiesta.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Se define la Serie A en la última fecha! Un buen partido y el Scudetto es tuyo.</p><button class="boton-jugar-minijuego" id="btn-jugar-liga-seriea">¡Jugar la Definición!</button></div>`;
  document.getElementById("btn-jugar-liga-seriea").addEventListener("click", () => {
    obtenerMinijuegoSerieA("liga", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA SERIE A!</h2><img src="${CONFIG_LIGA_SERIEA.trofeoLiga}" alt="Serie A"><p>El título se queda en casa.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de la Serie A 🥈</h2><p>Estuviste ahí nomás, pero el título se escapó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ ...resultado, esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarResultadoCoppaItalia(sim, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");

  if (sim.eliminadoTemprano) {
    contenedor.hidden = false;
    contenedor.innerHTML = `<div class="competition-card subcampeon"><h2>Eliminado en ${sim.ronda} de la Coppa Italia</h2><p>El sueño se cortó antes de la gran final. Habrá revancha el año que viene.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback({ esCampeon: false, subcampeon: false, ronda: sim.ronda });
    });
    return;
  }

  const cabecera = crearCabeceraSerieA(jugador, sim.rival, CONFIG_LIGA_SERIEA.nombreCoppa, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Final de la Coppa Italia! Ganá esta instancia para levantar el título.</p><button class="boton-jugar-minijuego" id="btn-jugar-coppa-italia">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-coppa-italia").addEventListener("click", () => {
    obtenerMinijuegoSerieA("coppa", jugador, sim.rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA COPPA ITALIA!</h2><img src="${CONFIG_LIGA_SERIEA.trofeoCoppa}" alt="Coppa Italia"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón de la Coppa Italia 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarSuperCoppaItalia(copa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const cabecera = crearCabeceraSerieA(jugador, rival, CONFIG_LIGA_SERIEA.nombreSuperCoppa, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡SuperCoppa Italia! Ganá esta final para arrancar el año levantando un título.</p><button class="boton-jugar-minijuego" id="btn-jugar-supercoppa-italia">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-supercoppa-italia").addEventListener("click", () => {
    obtenerMinijuegoSerieA("supercoppa", jugador, rival)((exito) => {
      if (exito) {
        if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
        let hist = jugador.campeonesHistorial.find((h) => h.año === jugador.año);
        if (!hist) { hist = { año: jugador.año }; jugador.campeonesHistorial.push(hist); }
        hist[CONFIG_LIGA_SERIEA.claveSuperCoppa] = jugador.club;
        jugador.stats.titulos++;
        Estado.guardar();
      }
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡SUPERCOPPA ITALIA!</h2><img src="${CONFIG_LIGA_SERIEA.trofeoSuperCoppa}" alt="SuperCoppa Italia"><p>Arrancás el año con un título bajo el brazo. No da boleto a nada más, pero suma a la vitrina.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón de la SuperCoppa Italia 🥈</h2><p>Cerca, pero no alcanzó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback();
      };
    });
  });
}

// ============================================
// AGENDAR / PROCESAR SUPERCOPPA (se juega al arrancar la temporada siguiente)
// ============================================
function agendarSuperCoppaItalia(jugador, añoActual, campeonLigaId, campeonCoppaId) {
  if (!Array.isArray(jugador.copasPendientesSerieA)) jugador.copasPendientesSerieA = [];
  const soyLiga = campeonLigaId === jugador.club;
  const soyCoppa = campeonCoppaId === jugador.club;
  if (!soyLiga && !soyCoppa) return;

  let rivalId;
  if (soyLiga && soyCoppa) rivalId = obtenerRivalSerieA(jugador, CONFIG_LIGA_SERIEA.division)?.id;
  else if (soyLiga) rivalId = campeonCoppaId;
  else rivalId = campeonLigaId;
  if (!rivalId || rivalId === jugador.club) rivalId = obtenerRivalSerieA(jugador, CONFIG_LIGA_SERIEA.division)?.id;
  if (!rivalId) return;

  jugador.copasPendientesSerieA.push({ año: añoActual + 1, tipo: "supercoppa-italia", rivalId });
}

function procesarSuperCoppaItaliaPendiente(jugador, año, callback) {
  const pendiente = (jugador.copasPendientesSerieA || []).find((c) => c.año === año);
  if (!pendiente) { callback(); return; }
  mostrarSuperCoppaItalia(pendiente, () => {
    jugador.copasPendientesSerieA = (jugador.copasPendientesSerieA || []).filter((c) => c !== pendiente);
    Estado.guardar();
    callback();
  });
}

// ============================================
// CLASIFICACIÓN A COMPETENCIAS UEFA
// Serie A: 1º-4º Champions, 5º Europa League, 6º Conference League.
// Coppa Italia campeón: Europa League (salvo que ya clasifique a algo mejor).
// ============================================
function agendarClasificacionSerieA(jugador, añoActual, resLiga) {
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  let tipo = null;
  if (resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4)) tipo = "champions";
  else if (posicion === 5) tipo = "europa-league";
  else if (posicion === 6) tipo = "conference-league";
  if (tipo) agendarPlazaUEFA(jugador, añoProximo, tipo, "serie-a");
}

// ============================================
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaSerieA(jugador, año, callbackFinal) {
  if (!Array.isArray(jugador.copasPendientesSerieA)) jugador.copasPendientesSerieA = [];
  if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];

  procesarSuperCoppaItaliaPendiente(jugador, año, () => {
    const resultadoLiga = simularLigaSerieA(jugador);

    mostrarResultadoLigaSerieA(resultadoLiga, (resLiga) => {
      jugador.resultadoLigaSerieA = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      let hist = jugador.campeonesHistorial.find((h) => h.año === año);
      if (!hist) { hist = { año }; jugador.campeonesHistorial.push(hist); }
      hist[CONFIG_LIGA_SERIEA.claveLiga] = resLiga.esCampeon ? jugador.club : null;

      const simCoppa = simularFinalDirectaSerieA(jugador);
      mostrarResultadoCoppaItalia(simCoppa, (resCoppa) => {
        hist[CONFIG_LIGA_SERIEA.claveCoppa] = resCoppa.esCampeon ? jugador.club : null;
        jugador.resultadoCoppaItalia = resCoppa;
        if (resCoppa.esCampeon) {
          jugador.stats.titulos++;
          agendarPlazaUEFA(jugador, año + 1, "europa-league", "coppa-italia");
        }

        agendarClasificacionSerieA(jugador, año, resLiga);
        agendarSuperCoppaItalia(jugador, año, resLiga.esCampeon ? jugador.club : null, resCoppa.esCampeon ? jugador.club : null);
        if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);

        const terminarTemporada = () => { Estado.guardar(); callbackFinal(); };
        if (typeof procesarCopasPendientes === "function") procesarCopasPendientes(terminarTemporada);
        else terminarTemporada();
      });
    });
  });
}
