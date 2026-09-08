/**
 * espana.js
 * -----------------------------------------
 * Motor de LaLiga + Copa del Rey + SuperCopa de España.
 *
 * PENSADO COMO PLANTILLA: cuando quieras sumar otra liga europea
 * (Bundesliga, Serie A, Ligue 1, Premier League), la forma más rápida
 * es clonar este archivo con otro nombre y:
 *   1. Cambiar el objeto CONFIG_LIGA_ESPANA de acá abajo por el de la
 *      liga nueva (ids de data.js, nombres, rutas de trofeos y las
 *      claves que se guardan en campeonesHistorial).
 *   2. Cambiar los nombres/descr/temas de MINIJUEGOS_ESPANA si querés
 *      que cada liga tenga su propia identidad, o dejarlos igual.
 *   3. Sumar el branch correspondiente en hud.js (procesarEventos).
 *
 * No se toca NADA de la lógica Argentina: este archivo vive aparte y
 * solo se activa cuando jugador.liga === CONFIG_LIGA_ESPANA.liga.
 * -----------------------------------------
 */

const CONFIG_LIGA_ESPANA = {
  liga: "laliga-espana",
  division: "primera-division-espana",
  nombreLiga: "LaLiga",
  nombreCopa: "Copa del Rey",
  nombreSuperCopa: "SuperCopa de España",
  trofeoLiga: "Trofeos/LaLiga.png",
  trofeoCopa: "Trofeos/CopaEspaña.png",
  trofeoSuperCopa: "Trofeos/SuperCopaEspaña.png",
  // Claves con las que se guarda cada título en jugador.campeonesHistorial
  // (así menufinal.js puede sumar puntos sin pisar los campos de Argentina).
  claveLiga: "ligaEspana",
  claveCopa: "copaDelRey",
  claveSuperCopa: "superCopaEspana",
};

// ============================================
// PROBABILIDADES (independientes de las de Argentina para no pisarlas)
// ============================================
const PROB_CATEGORIA_EUROPA = { grande: 40, mediano: 30, chico: 20, diminuto: 10 };
const BONUS_MEDIA_EUROPA = [
  { min: 0, max: 55, bonus: 0 },
  { min: 56, max: 65, bonus: 2 },
  { min: 66, max: 75, bonus: 6 },
  { min: 76, max: 85, bonus: 10 },
  { min: 86, max: 95, bonus: 14 },
  { min: 96, max: 109, bonus: 19 },
];

function bonusPorMediaEuropa(media) {
  const rango = BONUS_MEDIA_EUROPA.find((r) => media >= r.min && media <= r.max);
  return rango ? rango.bonus : 0;
}

function obtenerRivalEuropa(jugador, idDivision) {
  const clubes = CLUBES_POR_DIVISION[idDivision] || [];
  const rivales = clubes.filter((c) => c.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)];
}

function asegurarRivalDistintoEuropa(jugador, rivalId, idDivision) {
  if (!rivalId || rivalId === jugador.club) {
    const rival = obtenerRivalEuropa(jugador, idDivision);
    return rival ? rival.id : null;
  }
  return rivalId;
}

// ============================================
// SIMULACIÓN DE LIGA (sorteo ponderado por categoría de club + bonus de media)
// ============================================
function simularLigaEuropa(jugador, config) {
  const clubes = CLUBES_POR_DIVISION[config.division] || [];
  if (clubes.length === 0) return { esCampeon: false, posicion: 99, subcampeon: false };

  let totalProb = 0;
  const porClub = clubes.map((club) => {
    const clubesMismaCategoria = clubes.filter((c) => c.categoria === club.categoria).length || 1;
    let prob = (PROB_CATEGORIA_EUROPA[club.categoria] || 10) / clubesMismaCategoria;
    if (club.id === jugador.club) prob += bonusPorMediaEuropa(jugador.media);
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
// SIMULACIÓN DE COPA (llega a la final con prob. según categoría/media, rival aleatorio)
// ============================================
function simularCopaEuropa(jugador, config) {
  const categorias = ["grande", "mediano", "chico", "diminuto"];
  const clubJugador = (CLUBES_POR_DIVISION[config.division] || []).find((c) => c.id === jugador.club);
  const categoriaJugador = clubJugador ? clubJugador.categoria : null;
  const media = jugador.media;

  let probCategorias = {};
  let totalProb = 0;
  categorias.forEach((cat) => {
    let prob = PROB_CATEGORIA_EUROPA[cat];
    if (cat === categoriaJugador) prob += bonusPorMediaEuropa(media);
    probCategorias[cat] = prob;
    totalProb += prob;
  });

  let random = Math.random() * totalProb;
  let categoriaElegida = "grande";
  for (const cat of categorias) {
    random -= probCategorias[cat];
    if (random <= 0) { categoriaElegida = cat; break; }
  }

  const clubesCategoria = (CLUBES_POR_DIVISION[config.division] || []).filter((c) => c.categoria === categoriaElegida);
  if (clubesCategoria.length === 0) return { eliminado: true, ronda: "Cuartos" };

  let totalPeso = 0;
  const pesos = clubesCategoria.map((club) => {
    let peso = 1;
    if (club.id === jugador.club) peso += bonusPorMediaEuropa(media);
    totalPeso += peso;
    return { club, peso };
  });

  random = Math.random() * totalPeso;
  let ganador = null;
  for (const item of pesos) {
    random -= item.peso;
    if (random <= 0) { ganador = item.club; break; }
  }
  if (!ganador) ganador = pesos[pesos.length - 1].club;

  if (ganador.id === jugador.club) {
    return { enFinal: true, rival: obtenerRivalEuropa(jugador, config.division) };
  }
  return { eliminado: true, ronda: "Cuartos" };
}

// ============================================
// 12 MINIJUEGOS ORIGINALES (4 posiciones x 3 competencias)
// Construidos sobre 3 mecánicas base (barra / reacción / patrón), cada
// una con su propio título, texto, stat asociada y tema visual, así que
// se sienten distintas entre sí aunque compartan motor.
// ============================================

function crearCabeceraEuropa(jugador, rival, nombreCompetencia, fase) {
  window.CONTEXTO_PARTIDO = { torneo: nombreCompetencia, fase };
  return crearCabeceraMinijuego(jugador, rival);
}

// ---- Arquetipo 1: barra de potencia (vertical u horizontal) ----
function minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const stat = jugador.stats[cfg.statClave] || 0;

  let greenSize;
  if (stat <= 60) greenSize = 3;
  else if (stat <= 75) greenSize = 5;
  else if (stat <= 85) greenSize = 7;
  else if (stat <= 95) greenSize = 10;
  else greenSize = 13;

  const horizontal = cfg.orientacion === "horizontal";
  const velocidad = cfg.velocidad || 4.5;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card minijuego-europa minijuego-europa--${cfg.tema}">
      <h3>${cfg.titulo}</h3>
      <p>${cfg.descripcion}</p>
      <div class="power-bar-track ${horizontal ? "horizontal" : ""}">
        <div class="power-zone" style="left: ${50 - greenSize}%; width: ${greenSize * 2}%"></div>
        <div class="power-indicator" id="europa-indicador"></div>
      </div>
      <button class="boton-iniciar-qte" id="europa-btn-accion">${horizontal ? "¡EJECUTAR!" : "MANTENER"}</button>
    </div>
  `;

  const indicador = document.getElementById("europa-indicador");
  const boton = document.getElementById("europa-btn-accion");
  let poder = 0, direccion = 1;
  const interval = setInterval(() => {
    poder += direccion * velocidad;
    if (poder > 100) { poder = 100; direccion = -1; }
    if (poder < 0) { poder = 0; direccion = 1; }
    indicador.style.left = `${poder}%`;
  }, 40);

  boton.addEventListener("click", () => {
    clearInterval(interval);
    const exito = Math.abs(poder - 50) < greenSize;
    contenedor.innerHTML = "";
    callback(exito);
  });
}

// ---- Arquetipo 2: reacción / QTE (varias rondas) ----
function minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const stat = jugador.stats[cfg.statClave] || 50;
  const rondas = cfg.rondas || 3;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card minijuego-europa minijuego-europa--${cfg.tema}">
      <h3>${cfg.titulo}</h3>
      <p>${cfg.descripcion}</p>
      <button class="boton-iniciar-qte" id="europa-btn-iniciar">Iniciar</button>
      <div class="qte-area" id="europa-qte-area" style="display:none; position:relative; min-height:150px;"></div>
    </div>
  `;

  const botonIniciar = document.getElementById("europa-btn-iniciar");
  const area = document.getElementById("europa-qte-area");
  let exitos = 0;

  botonIniciar.addEventListener("click", () => {
    botonIniciar.style.display = "none";
    area.style.display = "block";
    siguienteRonda();
  });

  function siguienteRonda() {
    area.innerHTML = "";
    if (exitos >= rondas) {
      contenedor.innerHTML = "";
      callback(true);
      return;
    }

    const aviso = document.createElement("div");
    aviso.className = "qte-aviso";
    aviso.textContent = `${exitos + 1} / ${rondas}`;
    aviso.style.position = "absolute";
    aviso.style.top = "10px";
    aviso.style.left = "10px";
    area.appendChild(aviso);

    const delay = Math.floor(Math.random() * 600) + 300;
    setTimeout(() => {
      aviso.remove();
      const boton = document.createElement("button");
      boton.className = `qte-boton qte-boton--${cfg.tema}`;
      boton.textContent = "¡AHORA!";
      boton.style.position = "absolute";
      boton.style.width = "60px";
      boton.style.height = "60px";
      boton.style.fontSize = "16px";
      boton.style.padding = "0";
      const maxX = area.clientWidth - 70;
      const maxY = area.clientHeight - 70;
      boton.style.left = `${Math.random() * maxX}px`;
      boton.style.top = `${Math.random() * maxY}px`;
      area.appendChild(boton);

      const tiempoReaccion = Math.round(350 + Math.min(400, stat * 4));
      const timeout = setTimeout(() => {
        contenedor.innerHTML = "";
        callback(false);
      }, tiempoReaccion);

      boton.addEventListener("click", () => {
        clearTimeout(timeout);
        exitos++;
        siguienteRonda();
      });
    }, delay);
  }
}

// ---- Arquetipo 3: patrón / memoria ----
function minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const stat = jugador.stats[cfg.statClave] || 50;
  const longitud = cfg.longitud || 5;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card minijuego-europa minijuego-europa--${cfg.tema}">
      <h3>${cfg.titulo}</h3>
      <p>${cfg.descripcion}</p>
      <div class="memoria-grid europa-grid"></div>
    </div>
  `;

  const grid = contenedor.querySelector(".memoria-grid");
  grid.style.gridTemplateColumns = "repeat(5, 1fr)";
  grid.style.maxWidth = "400px";

  const puntos = [];
  for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    div.className = `memoria-punto memoria-punto--${cfg.tema}`;
    div.dataset.index = i;
    grid.appendChild(div);
    puntos.push(div);
  }

  const secuencia = [];
  const disponibles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < longitud; i++) {
    const idx = Math.floor(Math.random() * disponibles.length);
    secuencia.push(disponibles.splice(idx, 1)[0]);
  }

  let paso = 0;
  const intervalo = Math.min(600, 260 + stat * 3);
  const timer = setInterval(() => {
    if (paso >= secuencia.length) {
      clearInterval(timer);
      puntos.forEach((p) => p.classList.add("activo"));
      const ordenUsuario = [];
      puntos.forEach((p) => {
        p.addEventListener("click", function handler() {
          if (this.classList.contains("activo") && !this.classList.contains("usado")) {
            this.classList.add("usado");
            ordenUsuario.push(parseInt(this.dataset.index, 10));
            if (ordenUsuario.length === secuencia.length) {
              const exito = secuencia.every((v, i) => v === ordenUsuario[i]);
              contenedor.innerHTML = "";
              callback(exito);
            }
          }
        });
      });
    } else {
      const idx = secuencia[paso];
      puntos[idx].classList.add("iluminado");
      setTimeout(() => puntos[idx].classList.remove("iluminado"), 350);
      paso++;
    }
  }, intervalo);
}

// ---- Los 12 minijuegos: 4 posiciones x {liga, copa, superCopa} ----
const MINIJUEGOS_ESPANA = {
  delantero: {
    liga: { tipo: "barra", titulo: "Definición al Ángulo", descripcion: "Soltá cuando la barra entre en la zona dorada de LaLiga.", statClave: "pegada", tema: "liga", orientacion: "vertical" },
    copa: { tipo: "reaccion", titulo: "Contragolpe Copero", descripcion: "El arquero no te va a dar dos chances: reaccioná rápido.", statClave: "velocidad", tema: "copa", rondas: 3 },
    superCopa: { tipo: "barra", titulo: "Remate de Gala", descripcion: "Bajo las luces de la Supercopa, definí con clase.", statClave: "gambeta", tema: "superCopa", orientacion: "horizontal", velocidad: 6 },
  },
  enganche: {
    liga: { tipo: "patron", titulo: "Pase al Hueco", descripcion: "Memorizá el circuito de pases y encontrá el hueco.", statClave: "pase", tema: "liga", longitud: 5 },
    copa: { tipo: "reaccion", titulo: "Asistencia de Infarto", descripcion: "Encontrá la línea de pase antes de que se cierre el espacio.", statClave: "cerebro", tema: "copa", rondas: 3 },
    superCopa: { tipo: "barra", titulo: "Gambeta de Gala", descripcion: "Encará al último hombre en la gran final.", statClave: "gambeta", tema: "superCopa", orientacion: "vertical", velocidad: 5 },
  },
  central: {
    liga: { tipo: "barra", titulo: "Muro de Contención", descripcion: "Cronometrá el salto para cortar el centro al área.", statClave: "marca", tema: "liga", orientacion: "horizontal" },
    copa: { tipo: "reaccion", titulo: "Despeje Salvador", descripcion: "Cada pelota que entra al área es una emergencia.", statClave: "juegoAereo", tema: "copa", rondas: 3 },
    superCopa: { tipo: "patron", titulo: "Recuperación de Gala", descripcion: "Leé la secuencia de pases rivales y cortala.", statClave: "quite", tema: "superCopa", longitud: 5 },
  },
  arquero: {
    liga: { tipo: "barra", titulo: "Palomita Salvadora", descripcion: "Estirate en el momento justo para sacarla de la línea.", statClave: "reflejos", tema: "liga", orientacion: "vertical" },
    copa: { tipo: "reaccion", titulo: "Mano de Gato", descripcion: "El delantero rival define rápido, vos más.", statClave: "ataje", tema: "copa", rondas: 3 },
    superCopa: { tipo: "patron", titulo: "Vuelo de Gala", descripcion: "Anticipá el centro bombeado antes de que caiga.", statClave: "juegoAereo", tema: "superCopa", longitud: 5 },
  },
};

function obtenerMinijuegoEspana(competencia, jugador, rival) {
  const porPosicion = MINIJUEGOS_ESPANA[jugador.posicion] || MINIJUEGOS_ESPANA.delantero;
  const cfg = porPosicion[competencia];
  return (callback) => {
    if (cfg.tipo === "barra") minijuegoBarraEuropaGenerico(callback, jugador, rival, cfg);
    else if (cfg.tipo === "reaccion") minijuegoReaccionEuropaGenerico(callback, jugador, rival, cfg);
    else minijuegoPatronEuropaGenerico(callback, jugador, rival, cfg);
  };
}

// ============================================
// PANTALLAS DE RESULTADO
// ============================================

function mostrarResultadoLigaEspana(resultado, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = obtenerRivalEuropa(jugador, CONFIG_LIGA_ESPANA.division);
  const cabecera = crearCabeceraEuropa(jugador, rival, CONFIG_LIGA_ESPANA.nombreLiga, resultado.esCampeon ? "Definición del título" : "Fin de temporada");

  if (!resultado.esCampeon) {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card">
        <p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de ${CONFIG_LIGA_ESPANA.nombreLiga}.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  if (!resultado.minijuego) {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card campeon">
        <h2>¡CAMPEÓN DE ${CONFIG_LIGA_ESPANA.nombreLiga.toUpperCase()}!</h2>
        <img src="${CONFIG_LIGA_ESPANA.trofeoLiga}" alt="${CONFIG_LIGA_ESPANA.nombreLiga}">
        <p>¡Título indiscutido! El vestuario es una fiesta.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = ""; contenedor.hidden = true;
      callback(resultado);
    });
    return;
  }

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <p>¡Se define ${CONFIG_LIGA_ESPANA.nombreLiga} en la última fecha! Un buen partido y el título es tuyo.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-liga-espana">¡Jugar la Definición!</button>
    </div>
  `;
  document.getElementById("btn-jugar-liga-espana").addEventListener("click", () => {
    obtenerMinijuegoEspana("liga", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE ${CONFIG_LIGA_ESPANA.nombreLiga.toUpperCase()}!</h2><img src="${CONFIG_LIGA_ESPANA.trofeoLiga}" alt="${CONFIG_LIGA_ESPANA.nombreLiga}"><p>El título se queda en casa.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de ${CONFIG_LIGA_ESPANA.nombreLiga} 🥈</h2><p>Estuviste ahí nomás, pero el título se escapó.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ ...resultado, esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarResultadoCopaDelRey(resultadoCopa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = resultadoCopa.rival;
  const cabecera = crearCabeceraEuropa(jugador, rival, CONFIG_LIGA_ESPANA.nombreCopa, "Final");

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <p>¡Final de la ${CONFIG_LIGA_ESPANA.nombreCopa}! Ganá esta instancia para levantar el título.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-copa-espana">¡Jugar la Final!</button>
    </div>
  `;

  document.getElementById("btn-jugar-copa-espana").addEventListener("click", () => {
    obtenerMinijuegoEspana("copa", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN ${CONFIG_LIGA_ESPANA.nombreCopa.toUpperCase()}!</h2><img src="${CONFIG_LIGA_ESPANA.trofeoCopa}" alt="${CONFIG_LIGA_ESPANA.nombreCopa}"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de ${CONFIG_LIGA_ESPANA.nombreCopa} 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => {
        contenedor.innerHTML = ""; contenedor.hidden = true;
        callback({ esCampeon: exito, subcampeon: !exito });
      };
    });
  });
}

function mostrarSuperCopaEspana(copa, callback) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const cabecera = crearCabeceraEuropa(jugador, rival, CONFIG_LIGA_ESPANA.nombreSuperCopa, "Final");
  contenedor.hidden = false;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <p>¡${CONFIG_LIGA_ESPANA.nombreSuperCopa}! Ganá esta final para arrancar el año levantando un título.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-supercopa-espana">¡Jugar la Final!</button>
    </div>
  `;

  document.getElementById("btn-jugar-supercopa-espana").addEventListener("click", () => {
    obtenerMinijuegoEspana("superCopa", jugador, rival)((exito) => {
      if (exito) {
        if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
        let hist = jugador.campeonesHistorial.find((h) => h.año === jugador.año);
        if (!hist) { hist = { año: jugador.año }; jugador.campeonesHistorial.push(hist); }
        hist[CONFIG_LIGA_ESPANA.claveSuperCopa] = jugador.club;
        jugador.stats.titulos++;
        Estado.guardar();
      }
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡${CONFIG_LIGA_ESPANA.nombreSuperCopa.toUpperCase()}!</h2><img src="${CONFIG_LIGA_ESPANA.trofeoSuperCopa}" alt="${CONFIG_LIGA_ESPANA.nombreSuperCopa}"><p>Arrancás el año con un título bajo el brazo.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de ${CONFIG_LIGA_ESPANA.nombreSuperCopa} 🥈</h2><p>Cerca, pero no alcanzó.</p><button class="boton-continuar">Continuar</button></div>`;
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
function agendarSuperCopaEspana(jugador, añoActual, campeonLigaId, campeonCopaId) {
  if (!Array.isArray(jugador.copasPendientesEspana)) jugador.copasPendientesEspana = [];
  const soyLiga = campeonLigaId === jugador.club;
  const soyCopa = campeonCopaId === jugador.club;
  if (!soyLiga && !soyCopa) return;

  let rivalId;
  if (soyLiga && soyCopa) rivalId = obtenerRivalEuropa(jugador, CONFIG_LIGA_ESPANA.division)?.id;
  else if (soyLiga) rivalId = campeonCopaId;
  else rivalId = campeonLigaId;

  rivalId = asegurarRivalDistintoEuropa(jugador, rivalId, CONFIG_LIGA_ESPANA.division);
  if (!rivalId) return;

  jugador.copasPendientesEspana.push({ año: añoActual + 1, tipo: "supercopa-espana", rivalId });
}

function procesarSuperCopaPendienteEspana(jugador, año, callback) {
  const pendiente = (jugador.copasPendientesEspana || []).find((c) => c.año === año);
  if (!pendiente) { callback(); return; }

  mostrarSuperCopaEspana(pendiente, () => {
    jugador.copasPendientesEspana = (jugador.copasPendientesEspana || []).filter((c) => c !== pendiente);
    Estado.guardar();
    callback();
  });
}

// ============================================
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaEspana(jugador, año, callbackFinal) {
  if (!Array.isArray(jugador.copasPendientesEspana)) jugador.copasPendientesEspana = [];
  if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];

  procesarSuperCopaPendienteEspana(jugador, año, () => {
    const resultadoLiga = simularLigaEuropa(jugador, CONFIG_LIGA_ESPANA);

    mostrarResultadoLigaEspana(resultadoLiga, (resLiga) => {
      jugador.resultadoLigaEspana = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      let hist = jugador.campeonesHistorial.find((h) => h.año === año);
      if (!hist) { hist = { año }; jugador.campeonesHistorial.push(hist); }
      hist[CONFIG_LIGA_ESPANA.claveLiga] = resLiga.esCampeon ? jugador.club : null;

      const simCopa = simularCopaEuropa(jugador, CONFIG_LIGA_ESPANA);

      const continuarConCopa = (resCopa) => {
        hist[CONFIG_LIGA_ESPANA.claveCopa] = resCopa.esCampeon ? jugador.club : null;
        jugador.resultadoCopaDelRey = resCopa;
        if (resCopa.esCampeon) jugador.stats.titulos++;

        agendarSuperCopaEspana(
          jugador,
          año,
          resLiga.esCampeon ? jugador.club : null,
          resCopa.esCampeon ? jugador.club : null
        );

        // Igual que en el flujo argentino: agenda la clasificación al Mundial
        // de Clubes (si corresponde este año) y procesa la cola de copas
        // pendientes (incluye "mundial-clubes") para que se pueda JUGAR,
        // no solo clasificar.
        if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);
        if (typeof agendarChampionsLeague === "function") agendarChampionsLeague(jugador, año, resLiga);

        const terminarTemporada = () => {
          Estado.guardar();
          callbackFinal();
        };

        if (typeof procesarCopasPendientes === "function") {
          procesarCopasPendientes(terminarTemporada);
        } else {
          terminarTemporada();
        }
      };

      if (simCopa.enFinal) mostrarResultadoCopaDelRey(simCopa, continuarConCopa);
      else continuarConCopa({ esCampeon: false, ronda: simCopa.ronda || "Eliminado" });
    });
  });
}