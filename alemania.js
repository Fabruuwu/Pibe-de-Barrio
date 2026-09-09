/**
 * bundesliga.js
 * -----------------------------------------
 * Motor de Bundesliga + DFB-Pokal + DFL-Supercup ("Super Pokal").
 * Mismo patrón que serieA.js / premierLeague.js. Vive aparte y solo se
 * activa cuando jugador.liga === CONFIG_LIGA_BUNDESLIGA.liga.
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

const CONFIG_LIGA_BUNDESLIGA = {
  liga: "bundesliga-alemania",
  division: "bundesliga-alemania",
  nombreLiga: "Bundesliga",
  nombrePokal: "DFB-Pokal",
  nombreSuperPokal: "Super Pokal",
  trofeoLiga: "Trofeos/LigaAlemania.png",
  trofeoPokal: "Trofeos/DFBPokal.png",
  trofeoSuperPokal: "Trofeos/DFLSuperCopaPokal.png",
  claveLiga: "ligaAlemania",
  clavePokal: "dfbPokal",
  claveSuperPokal: "dflSuperCopaPokal",
};

// ============================================
// PROBABILIDADES
// ============================================
// Liga: grandes 60%, medianos 30%, chicos 7%, diminutos 3%.
const PROB_CATEGORIA_BUNDESLIGA = { grande: 60, mediano: 30, chico: 7, diminuto: 3 };

const BONUS_MEDIA_BUNDESLIGA = [
  { min: 0, max: 55, bonus: 5 },
  { min: 56, max: 65, bonus: 10 },
  { min: 66, max: 75, bonus: 18 },
  { min: 76, max: 85, bonus: 26 },
  { min: 86, max: 95, bonus: 33 },
  { min: 96, max: 109, bonus: 40 },
];
function bonusPorMediaBundesliga(media) {
  const rango = BONUS_MEDIA_BUNDESLIGA.find((r) => media >= r.min && media <= r.max);
  return rango ? rango.bonus : 0;
}

// DFB-Pokal / Super Pokal: 65/25/8/2, sin bonus por media.
const PROB_CATEGORIA_POKAL = { grande: 65, mediano: 25, chico: 8, diminuto: 2 };

function obtenerRivalBundesliga(jugador, idDivision) {
  const clubes = (CLUBES_POR_DIVISION[idDivision] || []).filter((c) => c.id !== jugador.club);
  return clubes[Math.floor(Math.random() * clubes.length)];
}

// ============================================
// SIMULACIÓN DE LIGA (sorteo ponderado por categoría + bonus de media)
// ============================================
function simularLigaBundesliga(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_BUNDESLIGA.division] || [];
  if (clubes.length === 0) return { esCampeon: false, posicion: 99, subcampeon: false };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    let prob = (PROB_CATEGORIA_BUNDESLIGA[club.categoria] || 10) / mismaCategoria;
    if (club.id === jugador.club) prob += bonusPorMediaBundesliga(jugador.media);
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
// "FINAL DIRECTA" del DFB-Pokal
// ============================================
const RONDAS_ELIMINACION_TEMPRANA_POKAL = ["Segunda Ronda", "Octavos de Final", "Cuartos de Final", "Semifinal"];

function simularFinalDirectaBundesliga(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_BUNDESLIGA.division] || [];
  if (clubes.length === 0) return { eliminadoTemprano: true, ronda: "Fase previa" };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    const prob = (PROB_CATEGORIA_POKAL[club.categoria] || 5) / mismaCategoria;
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
    const ronda = RONDAS_ELIMINACION_TEMPRANA_POKAL[Math.floor(Math.random() * RONDAS_ELIMINACION_TEMPRANA_POKAL.length)];
    return { eliminadoTemprano: true, ronda };
  }
  const rival = obtenerRivalBundesliga(jugador, CONFIG_LIGA_BUNDESLIGA.division);
  return { enFinal: true, rival };
}

// ============================================
// MINIJUEGOS (reutiliza los 3 arquetipos de espana.js)
// ============================================
const MINIJUEGOS_BUNDESLIGA = {
  delantero: {
    liga: { tipo: "barra", titulo: "Definición Alemana", descripcion: "Soltá cuando la barra entre en la zona dorada.", statClave: "pegada", tema: "liga", orientacion: "vertical" },
    pokal: { tipo: "reaccion", titulo: "Contragolpe de Pokal", descripcion: "El arquero no te va a dar dos chances.", statClave: "velocidad", tema: "copa", rondas: 3 },
    superpokal: { tipo: "barra", titulo: "Remate de Gala Alemana", descripcion: "Bajo las luces del Super Pokal, definí con clase.", statClave: "gambeta", tema: "superCopa", orientacion: "horizontal", velocidad: 6 },
  },
  enganche: {
    liga: { tipo: "patron", titulo: "Pase entre líneas", descripcion: "Memorizá el circuito y encontrá el hueco.", statClave: "pase", tema: "liga", longitud: 5 },
    pokal: { tipo: "reaccion", titulo: "Asistencia de Pokal", descripcion: "Encontrá la línea de pase antes de que se cierre.", statClave: "cerebro", tema: "copa", rondas: 3 },
    superpokal: { tipo: "barra", titulo: "Gambeta de Gala", descripcion: "Encará al último hombre en la gran final.", statClave: "gambeta", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
  },
  central: {
    liga: { tipo: "barra", titulo: "Muro Alemán", descripcion: "Cronometrá el salto para cortar el centro.", statClave: "marca", tema: "liga", orientacion: "horizontal" },
    pokal: { tipo: "reaccion", titulo: "Despeje de Pokal", descripcion: "Cada pelota en el área es una emergencia.", statClave: "juegoAereo", tema: "copa", rondas: 3 },
    superpokal: { tipo: "patron", titulo: "Recuperación de Gala", descripcion: "Leé la secuencia rival y cortala.", statClave: "quite", tema: "superCopa", longitud: 5 },
  },
  arquero: {
    liga: { tipo: "barra", titulo: "Palomita Alemana", descripcion: "Estirate justo a tiempo para sacarla.", statClave: "reflejos", tema: "liga", orientacion: "vertical" },
    pokal: { tipo: "reaccion", titulo: "Mano de Pokal", descripcion: "El delantero define rápido, vos más.", statClave: "ataje", tema: "copa", rondas: 3 },
    superpokal: { tipo: "patron", titulo: "Vuelo de Gala", descripcion: "Anticipá el centro bombeado antes de que caiga.", statClave: "juegoAereo", tema: "superCopa", longitud: 5 },
  },
};

function obtenerMinijuegoBundesliga(competencia, jugador, rival) {
  const porPosicion = MINIJUEGOS_BUNDESLIGA[jugador.posicion] || MINIJUEGOS_BUNDESLIGA.delantero;
  const cfg = porPosicion[competencia];
  return (callback) => {
    if (cfg.tipo === "barra") minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg);
    else if (cfg.tipo === "reaccion") minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg);
    else minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg);
  };
}

function crearCabeceraBundesliga(jugador, rival, nombreCompetencia, fase) {
  window.CONTEXTO_PARTIDO = { torneo: nombreCompetencia, fase };
  return crearCabeceraMinijuego(jugador, rival);
}

// ============================================
// PANTALLAS DE RESULTADO
// ============================================

function mostrarResultadoLigaBundesliga(resultado, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = obtenerRivalBundesliga(jugador, CONFIG_LIGA_BUNDESLIGA.division);
  const cabecera = crearCabeceraBundesliga(jugador, rival, CONFIG_LIGA_BUNDESLIGA.nombreLiga, resultado.esCampeon ? "Definición del título" : "Fin de temporada");

  if (!resultado.esCampeon) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de ${CONFIG_LIGA_BUNDESLIGA.nombreLiga}.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  if (!resultado.minijuego) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA BUNDESLIGA!</h2><img src="${CONFIG_LIGA_BUNDESLIGA.trofeoLiga}" alt="Bundesliga"><p>Meisterschale asegurada. El vestuario es una fiesta.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Se define la Bundesliga en la última fecha! Un buen partido y el título es tuyo.</p><button class="boton-jugar-minijuego" id="btn-jugar-liga-bundesliga">¡Jugar la Definición!</button></div>`;
  document.getElementById("btn-jugar-liga-bundesliga").addEventListener("click", () => {
    obtenerMinijuegoBundesliga("liga", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA BUNDESLIGA!</h2><img src="${CONFIG_LIGA_BUNDESLIGA.trofeoLiga}" alt="Bundesliga"><p>El título se queda en casa.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de la Bundesliga 🥈</h2><p>Estuviste ahí nomás, pero el título se escapó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ ...resultado, esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarResultadoDFBPokal(sim, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");

  if (sim.eliminadoTemprano) {
    contenedor.hidden = false;
    contenedor.innerHTML = `<div class="competition-card subcampeon"><h2>Eliminado en ${sim.ronda} del ${CONFIG_LIGA_BUNDESLIGA.nombrePokal}</h2><p>El sueño se cortó antes de la gran final. Habrá revancha el año que viene.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback({ esCampeon: false, subcampeon: false, ronda: sim.ronda });
    });
    return;
  }

  const cabecera = crearCabeceraBundesliga(jugador, sim.rival, CONFIG_LIGA_BUNDESLIGA.nombrePokal, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Final del ${CONFIG_LIGA_BUNDESLIGA.nombrePokal}! Ganá esta instancia para levantar el título.</p><button class="boton-jugar-minijuego" id="btn-jugar-dfb-pokal">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-dfb-pokal").addEventListener("click", () => {
    obtenerMinijuegoBundesliga("pokal", jugador, sim.rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DEL DFB-POKAL!</h2><img src="${CONFIG_LIGA_BUNDESLIGA.trofeoPokal}" alt="DFB-Pokal"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón del DFB-Pokal 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarSuperPokal(copa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const cabecera = crearCabeceraBundesliga(jugador, rival, CONFIG_LIGA_BUNDESLIGA.nombreSuperPokal, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Super Pokal! El campeón de la Bundesliga se mide con el campeón del DFB-Pokal para arrancar el año.</p><button class="boton-jugar-minijuego" id="btn-jugar-super-pokal">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-super-pokal").addEventListener("click", () => {
    obtenerMinijuegoBundesliga("superpokal", jugador, rival)((exito) => {
      if (exito) {
        if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
        let hist = jugador.campeonesHistorial.find((h) => h.año === jugador.año);
        if (!hist) { hist = { año: jugador.año }; jugador.campeonesHistorial.push(hist); }
        hist[CONFIG_LIGA_BUNDESLIGA.claveSuperPokal] = jugador.club;
        jugador.stats.titulos++;
        Estado.guardar();
      }
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡SUPER POKAL!</h2><img src="${CONFIG_LIGA_BUNDESLIGA.trofeoSuperPokal}" alt="Super Pokal"><p>Arrancás el año con un título bajo el brazo. No da boleto a nada más, pero suma a la vitrina.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón del Super Pokal 🥈</h2><p>Cerca, pero no alcanzó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback();
      };
    });
  });
}

// ============================================
// AGENDAR / PROCESAR SUPER POKAL (se juega al arrancar la temporada siguiente)
// ============================================
function agendarSuperPokal(jugador, añoActual, campeonLigaId, campeonPokalId) {
  if (!Array.isArray(jugador.copasPendientesBundesliga)) jugador.copasPendientesBundesliga = [];
  const soyLiga = campeonLigaId === jugador.club;
  const soyPokal = campeonPokalId === jugador.club;
  if (!soyLiga && !soyPokal) return;

  let rivalId;
  if (soyLiga && soyPokal) rivalId = obtenerRivalBundesliga(jugador, CONFIG_LIGA_BUNDESLIGA.division)?.id;
  else if (soyLiga) rivalId = campeonPokalId;
  else rivalId = campeonLigaId;
  if (!rivalId || rivalId === jugador.club) rivalId = obtenerRivalBundesliga(jugador, CONFIG_LIGA_BUNDESLIGA.division)?.id;
  if (!rivalId) return;

  jugador.copasPendientesBundesliga.push({ año: añoActual + 1, tipo: "super-pokal", rivalId });
}

function procesarSuperPokalPendiente(jugador, año, callback) {
  const pendiente = (jugador.copasPendientesBundesliga || []).find((c) => c.año === año);
  if (!pendiente) { callback(); return; }
  mostrarSuperPokal(pendiente, () => {
    jugador.copasPendientesBundesliga = (jugador.copasPendientesBundesliga || []).filter((c) => c !== pendiente);
    Estado.guardar();
    callback();
  });
}

// ============================================
// CLASIFICACIÓN A COMPETENCIAS UEFA
// Bundesliga: 1º-4º Champions, 5º Europa League, 6º Conference League.
// DFB-Pokal campeón: Europa League (salvo que ya clasifique a algo mejor).
// El Super Pokal no otorga clasificación a ninguna competencia.
// ============================================
function agendarClasificacionBundesliga(jugador, añoActual, resLiga) {
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  let tipo = null;
  if (resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4)) tipo = "champions";
  else if (posicion === 5) tipo = "europa-league";
  else if (posicion === 6) tipo = "conference-league";
  if (tipo) agendarPlazaUEFA(jugador, añoProximo, tipo, "bundesliga");
}

// ============================================
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaBundesliga(jugador, año, callbackFinal) {
  if (!Array.isArray(jugador.copasPendientesBundesliga)) jugador.copasPendientesBundesliga = [];
  if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];

  procesarSuperPokalPendiente(jugador, año, () => {
    const resultadoLiga = simularLigaBundesliga(jugador);

    mostrarResultadoLigaBundesliga(resultadoLiga, (resLiga) => {
      jugador.resultadoLigaBundesliga = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      let hist = jugador.campeonesHistorial.find((h) => h.año === año);
      if (!hist) { hist = { año }; jugador.campeonesHistorial.push(hist); }
      hist[CONFIG_LIGA_BUNDESLIGA.claveLiga] = resLiga.esCampeon ? jugador.club : null;

      const simPokal = simularFinalDirectaBundesliga(jugador);
      mostrarResultadoDFBPokal(simPokal, (resPokal) => {
        hist[CONFIG_LIGA_BUNDESLIGA.clavePokal] = resPokal.esCampeon ? jugador.club : null;
        jugador.resultadoDFBPokal = resPokal;
        if (resPokal.esCampeon) {
          jugador.stats.titulos++;
          agendarPlazaUEFA(jugador, año + 1, "europa-league", "dfb-pokal");
        }

        agendarClasificacionBundesliga(jugador, año, resLiga);
        agendarSuperPokal(jugador, año, resLiga.esCampeon ? jugador.club : null, resPokal.esCampeon ? jugador.club : null);
        if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);

        const terminarTemporada = () => { Estado.guardar(); callbackFinal(); };
        if (typeof procesarCopasPendientes === "function") procesarCopasPendientes(terminarTemporada);
        else terminarTemporada();
      });
    });
  });
}
