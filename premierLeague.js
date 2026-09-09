/**
 * premierLeague.js
 * -----------------------------------------
 * Motor de Premier League + Carabao Cup + FA Cup + Community Shield.
 * Clonado del patrón de espana.js (mismo header lo indica como plantilla).
 * No toca nada de Argentina/España/Brasil: vive aparte y solo se activa
 * cuando jugador.liga === CONFIG_LIGA_PREMIER.liga.
 *
 * Reutiliza:
 * - crearCabeceraMinijuego (minijuegos.js)
 * - minijuegoBarraEuropaGenerico / minijuegoReaccionEuropaGenerico /
 *   minijuegoPatronEuropaGenerico (espana.js) para no reinventar los
 *   minijuegos: solo cambia el "cfg" (título, stat, tema).
 * - agendarPlazaUEFA (copasinternacionalesclubes.js) para las plazas de
 *   Champions/Europa/Conference: ya resuelve solo que una plaza mayor
 *   reemplace a una menor en la misma edición.
 * -----------------------------------------
 */

const CONFIG_LIGA_PREMIER = {
  liga: "premier-league-inglaterra",
  division: "premier-league-inglaterra",
  nombreLiga: "Premier League",
  nombreCarabao: "Carabao Cup",
  nombreFACup: "FA Cup",
  nombreCommunityShield: "Community Shield",
  trofeoLiga: "Trofeos/PremierLeague.png",
  trofeoCarabao: "Trofeos/CarabaoCup.png",
  trofeoFACup: "Trofeos/FACup.png",
  trofeoCommunityShield: "Trofeos/CommunityShield.png",
  claveLiga: "ligaPremier",
  claveCarabao: "carabaoCup",
  claveFACup: "faCup",
  claveCommunityShield: "communityShield",
};

// ============================================
// PROBABILIDADES
// ============================================
// Liga: grandes 60%, medianos 30%, chicos 7%, diminutos 3%.
const PROB_CATEGORIA_PREMIER = { grande: 60, mediano: 30, chico: 7, diminuto: 3 };

// Bonus por media del jugador sobre la prob. de SU club (+5% a +40% máx).
const BONUS_MEDIA_PREMIER = [
  { min: 0, max: 55, bonus: 5 },
  { min: 56, max: 65, bonus: 10 },
  { min: 66, max: 75, bonus: 18 },
  { min: 76, max: 85, bonus: 26 },
  { min: 86, max: 95, bonus: 33 },
  { min: 96, max: 109, bonus: 40 },
];
function bonusPorMediaPremier(media) {
  const rango = BONUS_MEDIA_PREMIER.find((r) => media >= r.min && media <= r.max);
  return rango ? rango.bonus : 0;
}

// Copas domésticas (Carabao / FA Cup / Community Shield): 65/25/8/2, sin bonus por media.
const PROB_CATEGORIA_COPA_INGLESA = { grande: 65, mediano: 25, chico: 8, diminuto: 2 };

function obtenerRivalPremier(jugador, idDivision) {
  const clubes = (CLUBES_POR_DIVISION[idDivision] || []).filter((c) => c.id !== jugador.club);
  return clubes[Math.floor(Math.random() * clubes.length)];
}

// ============================================
// SIMULACIÓN DE LIGA (sorteo ponderado por categoría + bonus de media)
// ============================================
function simularLigaPremier(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_PREMIER.division] || [];
  if (clubes.length === 0) return { esCampeon: false, posicion: 99, subcampeon: false };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    let prob = (PROB_CATEGORIA_PREMIER[club.categoria] || 10) / mismaCategoria;
    if (club.id === jugador.club) prob += bonusPorMediaPremier(jugador.media);
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
// "FINAL DIRECTA": el juego decide si tu club llega a la final o queda
// eliminado antes, con lotería ponderada por categoría (sin bonus de media).
// Si llega a la final, el rival se elige con la misma tabla de pesos.
// ============================================
const RONDAS_ELIMINACION_TEMPRANA = ["Tercera Ronda", "Cuarta Ronda", "Octavos de Final", "Cuartos de Final", "Semifinal"];

function simularFinalDirectaPremier(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_LIGA_PREMIER.division] || [];
  if (clubes.length === 0) return { eliminadoTemprano: true, ronda: "Fase previa" };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const mismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    const prob = (PROB_CATEGORIA_COPA_INGLESA[club.categoria] || 5) / mismaCategoria;
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
    const ronda = RONDAS_ELIMINACION_TEMPRANA[Math.floor(Math.random() * RONDAS_ELIMINACION_TEMPRANA.length)];
    return { eliminadoTemprano: true, ronda };
  }

  // Tu club llegó a la final: se sortea el rival con la misma tabla de pesos.
  const rival = obtenerRivalPremier(jugador, CONFIG_LIGA_PREMIER.division);
  return { enFinal: true, rival };
}

// ============================================
// MINIJUEGOS (reutiliza los 3 arquetipos ya definidos en espana.js)
// ============================================
const MINIJUEGOS_PREMIER = {
  delantero: {
    liga: { tipo: "barra", titulo: "Definición Premier", descripcion: "Soltá cuando la barra entre en la zona dorada.", statClave: "pegada", tema: "liga", orientacion: "vertical" },
    carabao: { tipo: "reaccion", titulo: "Contragolpe de Carabao", descripcion: "Noche de copa: reaccioná antes que el arquero.", statClave: "velocidad", tema: "copa", rondas: 3 },
    facup: { tipo: "barra", titulo: "Magia de FA Cup", descripcion: "El romance de la copa vieja: definí con clase.", statClave: "gambeta", tema: "superCopa", orientacion: "horizontal", velocidad: 6 },
    community: { tipo: "barra", titulo: "Apertura de temporada", descripcion: "El primer título del año está en juego.", statClave: "pegada", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
  },
  enganche: {
    liga: { tipo: "patron", titulo: "Pase entre líneas", descripcion: "Memorizá el circuito y encontrá el hueco.", statClave: "pase", tema: "liga", longitud: 5 },
    carabao: { tipo: "reaccion", titulo: "Asistencia de Wembley", descripcion: "Encontrá la línea de pase antes de que se cierre.", statClave: "cerebro", tema: "copa", rondas: 3 },
    facup: { tipo: "barra", titulo: "Gambeta de Copa", descripcion: "Encará al último hombre en la final.", statClave: "gambeta", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
    community: { tipo: "patron", titulo: "Control del mediocampo", descripcion: "Manejá los tiempos del partido inaugural.", statClave: "cerebro", tema: "superCopa", longitud: 5 },
  },
  central: {
    liga: { tipo: "barra", titulo: "Muro inglés", descripcion: "Cronometrá el salto para cortar el centro.", statClave: "marca", tema: "liga", orientacion: "horizontal" },
    carabao: { tipo: "reaccion", titulo: "Despeje de Carabao", descripcion: "Cada pelota en el área es una emergencia.", statClave: "juegoAereo", tema: "copa", rondas: 3 },
    facup: { tipo: "patron", titulo: "Recuperación de Copa", descripcion: "Leé la secuencia rival y cortala.", statClave: "quite", tema: "superCopa", longitud: 5 },
    community: { tipo: "barra", titulo: "Presencia inaugural", descripcion: "Marcá el ritmo defensivo del año.", statClave: "marca", tema: "superCopa", orientacion: "horizontal" },
  },
  arquero: {
    liga: { tipo: "barra", titulo: "Palomita Premier", descripcion: "Estirate justo a tiempo para sacarla.", statClave: "reflejos", tema: "liga", orientacion: "vertical" },
    carabao: { tipo: "reaccion", titulo: "Mano de Wembley", descripcion: "El delantero define rápido, vos más.", statClave: "ataje", tema: "copa", rondas: 3 },
    facup: { tipo: "patron", titulo: "Vuelo de Copa", descripcion: "Anticipá el centro antes de que caiga.", statClave: "juegoAereo", tema: "superCopa", longitud: 5 },
    community: { tipo: "barra", titulo: "Arco bajo cero", descripcion: "Arrancá el año con la valla en cero.", statClave: "reflejos", tema: "superCopa", orientacion: "vertical" },
  },
};

function obtenerMinijuegoPremier(competencia, jugador, rival) {
  const porPosicion = MINIJUEGOS_PREMIER[jugador.posicion] || MINIJUEGOS_PREMIER.delantero;
  const cfg = porPosicion[competencia];
  return (callback) => {
    if (cfg.tipo === "barra") minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg);
    else if (cfg.tipo === "reaccion") minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg);
    else minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg);
  };
}

function crearCabeceraPremier(jugador, rival, nombreCompetencia, fase) {
  window.CONTEXTO_PARTIDO = { torneo: nombreCompetencia, fase };
  return crearCabeceraMinijuego(jugador, rival);
}

// ============================================
// PANTALLAS DE RESULTADO
// ============================================

function mostrarResultadoLigaPremier(resultado, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = obtenerRivalPremier(jugador, CONFIG_LIGA_PREMIER.division);
  const cabecera = crearCabeceraPremier(jugador, rival, CONFIG_LIGA_PREMIER.nombreLiga, resultado.esCampeon ? "Definición del título" : "Fin de temporada");

  if (!resultado.esCampeon) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de ${CONFIG_LIGA_PREMIER.nombreLiga}.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  if (!resultado.minijuego) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA PREMIER LEAGUE!</h2><img src="${CONFIG_LIGA_PREMIER.trofeoLiga}" alt="Premier League"><p>Título indiscutido. El vestuario es una fiesta.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Se define la Premier en la última fecha! Un buen partido y el título es tuyo.</p><button class="boton-jugar-minijuego" id="btn-jugar-liga-premier">¡Jugar la Definición!</button></div>`;
  document.getElementById("btn-jugar-liga-premier").addEventListener("click", () => {
    obtenerMinijuegoPremier("liga", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA PREMIER LEAGUE!</h2><img src="${CONFIG_LIGA_PREMIER.trofeoLiga}" alt="Premier League"><p>El título se queda en casa.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de la Premier League 🥈</h2><p>Estuviste ahí nomás, pero el título se escapó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ ...resultado, esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

// Genérico para Carabao Cup y FA Cup: "final directa" (o eliminación temprana).
function mostrarResultadoCopaInglesa(sim, config, competencia, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");

  if (sim.eliminadoTemprano) {
    contenedor.hidden = false;
    contenedor.innerHTML = `<div class="competition-card subcampeon"><h2>Eliminado en ${sim.ronda} de la ${config.nombre}</h2><p>El sueño se cortó antes de la gran final. Habrá revancha el año que viene.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback({ esCampeon: false, subcampeon: false, ronda: sim.ronda });
    });
    return;
  }

  const cabecera = crearCabeceraPremier(jugador, sim.rival, config.nombre, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Final de la ${config.nombre}! Ganá esta instancia para levantar el título.</p><button class="boton-jugar-minijuego" id="btn-jugar-copa-inglesa">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-copa-inglesa").addEventListener("click", () => {
    obtenerMinijuegoPremier(competencia, jugador, sim.rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE LA ${config.nombre.toUpperCase()}!</h2><img src="${config.trofeo}" alt="${config.nombre}"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón de la ${config.nombre} 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarCommunityShield(copa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const cabecera = crearCabeceraPremier(jugador, rival, CONFIG_LIGA_PREMIER.nombreCommunityShield, "Final");
  contenedor.hidden = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Community Shield! Arrancá el año levantando un título ante el otro campeón de Inglaterra.</p><button class="boton-jugar-minijuego" id="btn-jugar-community-shield">¡Jugar la Final!</button></div>`;

  document.getElementById("btn-jugar-community-shield").addEventListener("click", () => {
    obtenerMinijuegoPremier("community", jugador, rival)((exito) => {
      if (exito) {
        if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
        let hist = jugador.campeonesHistorial.find((h) => h.año === jugador.año);
        if (!hist) { hist = { año: jugador.año }; jugador.campeonesHistorial.push(hist); }
        hist[CONFIG_LIGA_PREMIER.claveCommunityShield] = jugador.club;
        jugador.stats.titulos++;
        Estado.guardar();
      }
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡COMMUNITY SHIELD!</h2><img src="${CONFIG_LIGA_PREMIER.trofeoCommunityShield}" alt="Community Shield"><p>Arrancás el año con un título bajo el brazo. No da boleto a nada más, pero suma a la vitrina.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Fuiste subcampeón del Community Shield 🥈</h2><p>Cerca, pero no alcanzó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback();
      };
    });
  });
}

// ============================================
// AGENDAR / PROCESAR COMMUNITY SHIELD (se juega al arrancar el año siguiente)
// ============================================
function agendarCommunityShield(jugador, añoActual, campeonLigaId, campeonFACupId) {
  if (!Array.isArray(jugador.copasPendientesPremier)) jugador.copasPendientesPremier = [];
  const soyLiga = campeonLigaId === jugador.club;
  const soyFACup = campeonFACupId === jugador.club;
  if (!soyLiga && !soyFACup) return;

  let rivalId;
  if (soyLiga && soyFACup) rivalId = obtenerRivalPremier(jugador, CONFIG_LIGA_PREMIER.division)?.id;
  else if (soyLiga) rivalId = campeonFACupId;
  else rivalId = campeonLigaId;
  if (!rivalId || rivalId === jugador.club) rivalId = obtenerRivalPremier(jugador, CONFIG_LIGA_PREMIER.division)?.id;
  if (!rivalId) return;

  jugador.copasPendientesPremier.push({ año: añoActual + 1, tipo: "community-shield", rivalId });
}

function procesarCommunityShieldPendiente(jugador, año, callback) {
  const pendiente = (jugador.copasPendientesPremier || []).find((c) => c.año === año);
  if (!pendiente) { callback(); return; }
  mostrarCommunityShield(pendiente, () => {
    jugador.copasPendientesPremier = (jugador.copasPendientesPremier || []).filter((c) => c !== pendiente);
    Estado.guardar();
    callback();
  });
}

// ============================================
// CLASIFICACIÓN A COMPETENCIAS UEFA
// Premier: 1º-4º Champions, 5º Europa League.
// Carabao Cup campeón: Conference League (salvo que ya clasifique a algo mejor).
// FA Cup campeón: Europa League (salvo que ya clasifique a algo mejor).
// agendarPlazaUEFA ya resuelve solo la prioridad (Champions > Europa > Conference).
// ============================================
function agendarClasificacionPremier(jugador, añoActual, resLiga) {
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  let tipo = null;
  if (resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4)) tipo = "champions";
  else if (posicion === 5) tipo = "europa-league";
  if (tipo) agendarPlazaUEFA(jugador, añoProximo, tipo, "premier-league");
}

// ============================================
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaPremier(jugador, año, callbackFinal) {
  if (!Array.isArray(jugador.copasPendientesPremier)) jugador.copasPendientesPremier = [];
  if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];

  procesarCommunityShieldPendiente(jugador, año, () => {
    const resultadoLiga = simularLigaPremier(jugador);

    mostrarResultadoLigaPremier(resultadoLiga, (resLiga) => {
      jugador.resultadoLigaPremier = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      let hist = jugador.campeonesHistorial.find((h) => h.año === año);
      if (!hist) { hist = { año }; jugador.campeonesHistorial.push(hist); }
      hist[CONFIG_LIGA_PREMIER.claveLiga] = resLiga.esCampeon ? jugador.club : null;

      const simCarabao = simularFinalDirectaPremier(jugador);
      mostrarResultadoCopaInglesa(simCarabao, { nombre: CONFIG_LIGA_PREMIER.nombreCarabao, trofeo: CONFIG_LIGA_PREMIER.trofeoCarabao }, "carabao", (resCarabao) => {
        hist[CONFIG_LIGA_PREMIER.claveCarabao] = resCarabao.esCampeon ? jugador.club : null;
        jugador.resultadoCarabaoCup = resCarabao;
        if (resCarabao.esCampeon) {
          jugador.stats.titulos++;
          agendarPlazaUEFA(jugador, año + 1, "conference-league", "carabao-cup");
        }

        const simFACup = simularFinalDirectaPremier(jugador);
        mostrarResultadoCopaInglesa(simFACup, { nombre: CONFIG_LIGA_PREMIER.nombreFACup, trofeo: CONFIG_LIGA_PREMIER.trofeoFACup }, "facup", (resFACup) => {
          hist[CONFIG_LIGA_PREMIER.claveFACup] = resFACup.esCampeon ? jugador.club : null;
          jugador.resultadoFACup = resFACup;
          if (resFACup.esCampeon) {
            jugador.stats.titulos++;
            agendarPlazaUEFA(jugador, año + 1, "europa-league", "fa-cup");
          }

          agendarClasificacionPremier(jugador, año, resLiga);
          agendarCommunityShield(jugador, año, resLiga.esCampeon ? jugador.club : null, resFACup.esCampeon ? jugador.club : null);
          if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);

          const terminarTemporada = () => { Estado.guardar(); callbackFinal(); };
          if (typeof procesarCopasPendientes === "function") procesarCopasPendientes(terminarTemporada);
          else terminarTemporada();
        });
      });
    });
  });
}
