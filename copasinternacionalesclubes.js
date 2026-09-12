/**
 * copasinternacionalesclubes.js
 * -----------------------------------------
 * Todas las competencias internacionales DE CLUBES: Copa Libertadores,
 * Copa Sudamericana, Recopa Sudamericana, Mundial de Clubes, UEFA
 * Champions League y SuperCopa UEFA. Incluye también el despachador
 * genérico de la cola de copas pendientes (procesarCopasPendientes),
 * usado tanto por Argentina.js como por espana.js.
 *
 * Depende de: data.js (CLUBES_POR_DIVISION, NOMBRES_CLUBES),
 * estado.js (Estado), minijuegos.js (crearCabeceraMinijuego),
 * Argentina.js (mostrarCopaPendiente, para copas domésticas argentinas).
 * -----------------------------------------
 */

// ------------------------------------------------------------------
// MINIJUEGOS NUEVOS
// ------------------------------------------------------------------

// 1. Tiro Libre al Ángulo (barra de potencia, afecta pegada)
function minijuegoTiroLibre(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  const pegada = jugador.stats.pegada || 0;
  let greenSize;
  if (pegada <= 60) greenSize = 3;
  else if (pegada <= 75) greenSize = 5;
  else if (pegada <= 85) greenSize = 7;
  else if (pegada <= 95) greenSize = 10;
  else greenSize = 13;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Tiro Libre al Ángulo!</h3>
      <p>Mantené presionado y soltá cuando la barra esté en la zona verde.</p>
      <button class="boton-iniciar-qte" id="btn-listo-tirolibre">Comenzar</button>
    </div>
  `;

  document.getElementById("btn-listo-tirolibre").addEventListener("click", () => {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card">
        <h3>¡Tiro Libre al Ángulo!</h3>
        <p>Mantené presionado y soltá en la zona verde.</p>
        <div class="power-bar-track">
          <div class="power-zone" style="left: ${50 - greenSize}%; width: ${greenSize * 2}%"></div>
          <div class="power-indicator" id="power-indicator"></div>
        </div>
        <button class="boton-iniciar-qte" id="btn-press-hold">MANTENER</button>
      </div>
    `;

    const indicador = document.getElementById("power-indicator");
    const boton = document.getElementById("btn-press-hold");
    let poder = 0, direccion = 1, interval;

    interval = setInterval(() => {
      poder += direccion * 4.5;
      if (poder > 100) { poder = 100; direccion = -1; }
      if (poder < 0) { poder = 0; direccion = 1; }
      indicador.style.left = `${poder}%`;
    }, 50);

    boton.addEventListener("mousedown", () => clearInterval(interval));
    boton.addEventListener("mouseup", () => {
      if (Math.abs(poder - 50) < greenSize) {
        clearInterval(interval); contenedor.innerHTML = ""; callback(true);
      } else {
        clearInterval(interval); contenedor.innerHTML = ""; callback(false);
      }
    });

    boton.addEventListener("touchstart", () => clearInterval(interval));
    boton.addEventListener("touchend", () => {
      if (Math.abs(poder - 50) < greenSize) {
        clearInterval(interval); contenedor.innerHTML = ""; callback(true);
      } else {
        clearInterval(interval); contenedor.innerHTML = ""; callback(false);
      }
    });
  });
}

// ---------- MINIJUEGO AÉREO ARREGLADO ----------
function minijuegoAereo(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const habilidadAerea = jugador.stats.juegoAereo || jugador.stats.resistencia || 50;
  const tamanoObjetivo = Math.min(42, 16 + habilidadAerea / 3);
  const margenAereo = Math.min(24, 8 + habilidadAerea / 6);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Anticipo Aéreo!</h3>
      <p>Hacé clic cuando el borde del círculo exterior toque el círculo interior (¡margen amplio!).</p>
      <div class="aerial-container" id="aerial-container" style="width:220px; height:220px; position:relative; cursor:crosshair;">
        <div class="aerial-inner-circle" style="width:${tamanoObjetivo}%; height:${tamanoObjetivo}%;"></div>
        <div class="aerial-outer-circle" id="aerial-outer" style="position:absolute; top:0; left:0; border:4px dashed #ffd700;"></div>
      </div>
    </div>
  `;

  const contenedorAereo = document.getElementById("aerial-container");
  const outer = document.getElementById("aerial-outer");
  let size = 100;
  let velocidad = Math.max(.65, 1.65 - habilidadAerea / 120);
  let interval;

  interval = setInterval(() => {
    velocidad += 0.05;
    size -= velocidad;
    if (size <= 0) {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(false);
      return;
    }
    outer.style.width = `${size}%`;
    outer.style.height = `${size}%`;
    outer.style.top = `${(100 - size) / 2}%`;
    outer.style.left = `${(100 - size) / 2}%`;
  }, 60);

  contenedorAereo.addEventListener("mousedown", (e) => {
    if (size < tamanoObjetivo + margenAereo / 2 && size > tamanoObjetivo - margenAereo / 2) {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(true);
    } else {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(false);
    }
  });
}

// 3. Penal del Campeonato (barra horizontal de reflejos)
function minijuegoPenalReflejos(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  const pegada = jugador.stats.pegada || 0;
  let greenSize;
  if (pegada <= 60) greenSize = 3;
  else if (pegada <= 75) greenSize = 5;
  else if (pegada <= 85) greenSize = 7;
  else if (pegada <= 95) greenSize = 10;
  else greenSize = 13;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Penal del Campeonato!</h3>
      <p>Hacé clic cuando la barra esté en la zona verde.</p>
      <div class="power-bar-track horizontal">
        <div class="power-zone" style="left: ${50 - greenSize}%; width: ${greenSize * 2}%"></div>
        <div class="power-indicator" id="penal-indicator"></div>
      </div>
      <button class="boton-iniciar-qte" id="btn-penal-click">¡PATEAR!</button>
    </div>
  `;

  const indicador = document.getElementById("penal-indicator");
  const boton = document.getElementById("btn-penal-click");
  let poder = 0, direccion = 1, interval;

  interval = setInterval(() => {
    poder += direccion * 5;
    if (poder > 100) { poder = 100; direccion = -1; }
    if (poder < 0) { poder = 0; direccion = 1; }
    indicador.style.left = `${poder}%`;
  }, 30);

  boton.addEventListener("click", () => {
    if (Math.abs(poder - 50) < greenSize) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    } else {
      clearInterval(interval); contenedor.innerHTML = ""; callback(false);
    }
  });
}

// ---------- PROCESAR COPAS PENDIENTES (con delegación a internacionales) ----------
function procesarCopasPendientes(callback) {
  const jugador = Estado.obtener();
  const año = jugador.año;

  // Dos filtros de seguridad antes de jugar nada:
  //
  // 1) CUPO ATADO AL CLUB: si la copa se agendó con un clubId (se ganó/
  //    clasificó jugando para ese club) y ya no jugás ahí (te
  //    transferiste), el cupo se descarta. Es del club, no viaja con vos.
  //
  // 2) EXCLUSIÓN MUTUA: por un cruce de agendas (ej: entrás a la
  //    Libertadores como campeón defensor Y clasificás a la Sudamericana
  //    por posición de tabla el mismo año) podían quedar agendadas dos
  //    copas del mismo "nivel" para el mismo año. Te quedás con la de
  //    mayor jerarquía, la otra se descarta.
  const GRUPOS_EXCLUYENTES = [
    ["libertadores", "sudamericana"],
    ["champions", "europa-league", "conference-league"],
  ];

  let copas = (jugador.copasPendientes || []).filter(c => c.año === año && (!c.clubId || c.clubId === jugador.club));

  GRUPOS_EXCLUYENTES.forEach(orden => {
    const presentes = copas.filter(c => orden.includes(c.tipo));
    if (presentes.length > 1) {
      const mejor = orden.map(tipo => presentes.find(c => c.tipo === tipo)).find(Boolean);
      copas = copas.filter(c => !presentes.includes(c) || c === mejor);
    }
  });

  // Sacamos ya todas las entradas de este año (las que se van a jugar y
  // las que se descartaron arriba), así no quedan colgadas para siempre.
  jugador.copasPendientes = (jugador.copasPendientes || []).filter(c => c.año !== año);
  Estado.guardar();

  if (copas.length === 0) {
    callback();
    return;
  }

  let indice = 0;
  function siguiente() {
    if (indice >= copas.length) {
      Estado.guardar();
      callback();
      return;
    }
    const copa = copas[indice];
    indice++;

    if (copa.tipo === "libertadores" && typeof mostrarLibertadores === "function") {
      mostrarLibertadores(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "sudamericana" && typeof mostrarSudamericana === "function") {
      mostrarSudamericana(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "recopa" && typeof mostrarRecopa === "function") {
      mostrarRecopa(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "mundial-clubes" && typeof mostrarMundialClubes === "function") {
      mostrarMundialClubes(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "champions" && typeof mostrarChampions === "function") {
      mostrarChampions(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "europa-league" && typeof mostrarEuropaLeague === "function") {
      mostrarEuropaLeague(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "conference-league" && typeof mostrarConferenceLeague === "function") {
      mostrarConferenceLeague(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "supercopa-uefa" && typeof mostrarSuperCopaUEFA === "function") {
      mostrarSuperCopaUEFA(copa, () => {
        siguiente();
      });
    } else {
      mostrarCopaPendiente(copa, () => {
        siguiente();
      });
    }
  }
  siguiente();
}

// ============================================
// copassudamerica.js
// Depende de: NOMBRES_CLUBES, CLUBES_POR_DIVISION, crearCabeceraMinijuego

function obtenerRivalInternacional(jugador) {
  const argentinos = (CLUBES_POR_DIVISION["primera-division-argentina"] || []).filter(c => c.id !== jugador.club);
  const brasileros = (CLUBES_POR_DIVISION["serie-a-brasil"] || []).filter(c => c.id !== jugador.club);
  const jugadorEsBrasileño = jugador.division === "serie-a-brasil";

  // La Libertadores mezcla ambos países de forma visible: si jugás en Argentina,
  // la mitad de las llaves será ante un brasileño (y viceversa).
  const preferidos = jugadorEsBrasileño ? argentinos : brasileros;
  const alternativos = jugadorEsBrasileño ? brasileros : argentinos;
  const pool = preferidos.length && Math.random() < 0.5 ? preferidos : (alternativos.length ? alternativos : preferidos);
  // Mantiene a Brasil dentro de las llaves incluso si la carrera se inicia en Argentina.
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// ---------- Clasificación ----------
function clasificaLibertadores(jugador) {
  const resLiga = jugador.resultadoLiga;
  const resCopa = jugador.resultadoCopa;
  const pos = Number(resLiga?.posicion);
  const liga = jugador.liga;

  if (liga !== "liga-profesional-argentina" && liga !== "brasileirao-brasil") return false;
  if (resCopa?.esCampeon) return true;
  if (resLiga?.esCampeon) return true;
  if (resLiga?.subcampeon) return true;
  if (pos >= 1 && pos <= 3) return true;
  return false;
}

function clasificaSudamericana(jugador) {
  const resLiga = jugador.resultadoLiga;
  const pos = resLiga?.posicion;
  const liga = jugador.liga;

  if (liga !== "liga-profesional-argentina") return false;
  if (clasificaLibertadores(jugador)) return false;
  if (pos >= 4 && pos <= 9) return true;
  return false;
}

function asegurarPlazaCampeonContinental(jugador, tipo, anioCopa) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  const anioSiguiente = anioCopa + 1;
  if (!jugador.copasPendientes.some(copa => copa.año === anioSiguiente && copa.tipo === tipo)) {
    // clubId: el cupo de campeón defensor es DEL CLUB que ganó, no del
    // jugador. Si para el año siguiente ya no jugás ahí, se descarta en
    // procesarCopasPendientes.
    jugador.copasPendientes.push({ año: anioSiguiente, tipo, rivalId: null, clasificacion: "campeon-defensor", clubId: jugador.club });
  }
}

// ---------- Minijuego BarraQTE ----------
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>Copa Libertadores · Final</h3>
      <p>Presioná los botones correctos. Rojo (+5%), Rosa (-10%), Bordo (perdés). Necesitás 100%.</p>
      <button class="boton-iniciar-qte" id="btn-listo-barraqte">Comenzar</button>
    </div>
  `;

  document.getElementById("btn-listo-barraqte").addEventListener("click", () => {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card">
        <h3>Copa Libertadores · Final</h3>
        <p>Presioná los botones correctos. Rojo (+5%), Rosa (-10%), Bordo (perdés). Necesitás 100%.</p>
        <div class="barra-qte">
          <div class="barra-progreso" id="barra-progreso"></div>
          <span id="puntos-texto">0/100</span>
        </div>
        <div class="zona-botones" id="zona-botones" style="position:relative; height:200px; background:#1a1a24; border-radius:8px;"></div>
        <p>Tiempo: <span id="timer">20</span>s</p>
      </div>
    `;

    const zona = document.getElementById("zona-botones");
    const barra = document.getElementById("barra-progreso");
    const puntosTexto = document.getElementById("puntos-texto");
    const timer = document.getElementById("timer");
    let puntos = 0;
    // Velocidad y resistencia dan unos segundos extra para sostener la presión.
    let tiempo = Math.round(12 + ((jugador.stats.velocidad || 50) + (jugador.stats.resistencia || 50)) / 16);
    let terminado = false;

    const timerInterval = setInterval(() => {
      tiempo--;
      timer.textContent = tiempo;
      if (tiempo <= 0) {
        clearInterval(timerInterval);
        clearInterval(spawnInterval);
        terminado = true;
        contenedor.innerHTML = "";
        callback(false);
      }
    }, 1000);

    let spawnInterval;
    function spawnBoton() {
      const tipo = Math.random() < 0.7 ? "rojo" : (Math.random() < 0.5 ? "rosa" : "bordo");
      const btn = document.createElement("button");
      btn.className = `qte-boton-internacional ${tipo}`;
      btn.textContent = tipo === "rojo" ? "+5" : tipo === "rosa" ? "-10" : "X";
      btn.style.position = "absolute";
      btn.style.width = "50px";
      btn.style.height = "50px";
      btn.style.fontSize = "12px";
      btn.style.padding = "0";
      btn.style.background = tipo === "rojo" ? "#ff4444" : tipo === "rosa" ? "#ff69b4" : "#800000";
      btn.style.color = "#fff";
      btn.style.left = `${Math.random() * (zona.clientWidth - 60)}px`;
      btn.style.top = `${Math.random() * (zona.clientHeight - 60)}px`;
      zona.appendChild(btn);
      setTimeout(() => btn.remove(), 600);
    }

    spawnInterval = setInterval(spawnBoton, 800);
    setTimeout(() => {
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnBoton, 600);
    }, 5000);
    setTimeout(() => {
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnBoton, 400);
    }, 10000);

    zona.addEventListener("click", (e) => {
      if (terminado) return;
      const btn = e.target;
      if (btn.classList.contains("qte-boton-internacional")) {
        const tipo = btn.classList[1];
        if (tipo === "rojo") {
          puntos += 5;
          if (puntos >= 100) {
            clearInterval(timerInterval);
            clearInterval(spawnInterval);
            terminado = true;
            contenedor.innerHTML = "";
            callback(true);
            return;
          }
        } else if (tipo === "rosa") {
          puntos -= 10;
          if (puntos < 0) {
            clearInterval(timerInterval);
            clearInterval(spawnInterval);
            terminado = true;
            contenedor.innerHTML = "";
            callback(false);
            return;
          }
        } else if (tipo === "bordo") {
          clearInterval(timerInterval);
          clearInterval(spawnInterval);
          terminado = true;
          contenedor.innerHTML = "";
          callback(false);
          return;
        }
        barra.style.width = `${(puntos / 100) * 100}%`;
        puntosTexto.textContent = `${puntos}/100`;
      }
    });
  });
}

// ---------- Minijuego Memoria de Parejas (Sudamericana) ----------
function minijuegoMemoriaParejas(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  const emojis = ["⚽","🏆","🔥","💪","🎯","⚡","🥅","🛡️","👟","🌟"];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  const gambeta = jugador.stats.gambeta || 0;
  let tiempoVer = 1.0;
  if (gambeta <= 65) tiempoVer = 1.2;
  else if (gambeta <= 75) tiempoVer = 1.4;
  else if (gambeta <= 85) tiempoVer = 1.6;
  else if (gambeta <= 95) tiempoVer = 2.0;
  else tiempoVer = 2.5;

  let vidas = 5;
  if (jugador.media >= 85) vidas++;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>La Jugada Preparada</h3>
      <p>Memorizá las parejas de emojis. ¡Tenés ${vidas} vidas!</p>
      <div class="memoria-parejas" id="memoria-parejas" style="display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(5,1fr); gap:8px; max-width:420px; margin:20px auto;"></div>
      <div style="margin-top:10px;">Vidas: <span id="vidas">${'❤️'.repeat(vidas)}</span></div>
      <button class="boton-iniciar-qte" id="btn-iniciar-parejas">Comenzar</button>
    </div>
  `;

  const grid = document.getElementById("memoria-parejas");
  const vidasSpan = document.getElementById("vidas");
  const btnIniciar = document.getElementById("btn-iniciar-parejas");
  let reveladas = [];
  let paresEncontrados = 0;
  let bloqueado = false;
  let vidasRestantes = vidas;

  function renderizarCartas(mostrar) {
    grid.innerHTML = "";
    cartas.forEach((emoji, idx) => {
      const card = document.createElement("div");
      card.className = "carta-pareja";
      card.dataset.emoji = emoji;
      card.dataset.idx = idx;
      card.textContent = mostrar ? emoji : "?";
      card.style.background = mostrar ? "#2a2a3a" : "#1a1a24";
      card.style.border = "1px solid #333";
      card.style.borderRadius = "6px";
      card.style.padding = "10px";
      card.style.textAlign = "center";
      card.style.cursor = "pointer";
      card.style.fontSize = "24px";
      grid.appendChild(card);
    });
  }

  btnIniciar.addEventListener("click", () => {
    btnIniciar.style.display = "none";
    renderizarCartas(true);
    setTimeout(() => {
      renderizarCartas(false);
      grid.querySelectorAll('.carta-pareja').forEach(card => {
        card.addEventListener('click', manejarClick);
      });
    }, tiempoVer * 1000);
  });

  function manejarClick(e) {
    if (bloqueado) return;
    const card = e.target;
    if (card.classList.contains("revelada")) return;

    card.textContent = card.dataset.emoji;
    card.classList.add("revelada");
    card.style.background = "#3a3a4a";

    reveladas.push(card);

    if (reveladas.length === 2) {
      bloqueado = true;
      const [card1, card2] = reveladas;
      if (card1.dataset.emoji === card2.dataset.emoji) {
        paresEncontrados++;
        card1.classList.add("permanente");
        card2.classList.add("permanente");
        reveladas = [];
        bloqueado = false;
        if (paresEncontrados === 10) {
          contenedor.innerHTML = "";
          callback(true);
        }
      } else {
        vidasRestantes--;
        vidasSpan.textContent = '❤️'.repeat(vidasRestantes);
        if (vidasRestantes <= 0) {
          contenedor.innerHTML = "";
          callback(false);
          return;
        }
        setTimeout(() => {
          card1.textContent = "?";
          card2.textContent = "?";
          card1.classList.remove("revelada");
          card2.classList.remove("revelada");
          card1.style.background = "#1a1a24";
          card2.style.background = "#1a1a24";
          reveladas = [];
          bloqueado = false;
        }, 800);
      }
    }
  }
}

// ---------- Copa Libertadores - Camino Progresivo (CORREGIDO) ----------
function minijuegoCopaCompleta(callback, jugador, rivalInicial) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rivalInicial);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3 id="titulo-copa">Copa Libertadores - Fase de Grupos</h3>
      <p>Memorizá las secuencias de bloques iluminados. ¡Cuidado que aumentan!</p>
      <div class="libertadores-grid" id="libertadores-grid"></div>
      <div class="secuencia-info" id="secuencia-info"></div>
      <button class="boton-iniciar-qte" id="btn-comenzar-libertadores">Comenzar</button>
      <button class="boton-iniciar-qte" id="btn-repetir-secuencia" hidden>Repetir secuencia (2)</button>
    </div>
  `;

  const grid = document.getElementById("libertadores-grid");
  const info = document.getElementById("secuencia-info");
  const btnComenzar = document.getElementById("btn-comenzar-libertadores");
  const btnRepetir = document.getElementById("btn-repetir-secuencia");
  const tituloCopa = document.getElementById("titulo-copa");

  grid.style.gridTemplateColumns = "repeat(5, 1fr)";
  grid.style.maxWidth = "500px";
  grid.style.margin = "20px auto";
  const bloques = [];
  for (let i = 0; i < 20; i++) {
    const div = document.createElement("div");
    div.className = "memoria-punto";
    div.dataset.index = i;
    grid.appendChild(div);
    bloques.push(div);
  }

  const etapas = [
    { nombre: "Fase de Grupos - Partido 1", longitud: 1, fase: "grupos" },
    { nombre: "Fase de Grupos - Partido 2", longitud: 2, fase: "grupos" },
    { nombre: "Fase de Grupos - Partido 3", longitud: 3, fase: "grupos" },
    { nombre: "Octavos de Final", longitud: 4, fase: "eliminatoria" },
    { nombre: "Cuartos de Final", longitud: 5, fase: "eliminatoria" },
    { nombre: "Semifinal", longitud: 6, fase: "eliminatoria" },
    { nombre: "Final", longitud: 7, fase: "eliminatoria" }
  ];

  let indiceEtapa = 0;
  let erroresGrupos = 0;
  let ganadosGrupos = 0;
  let rivalActual = rivalInicial;
  let partidoTerminado = false;
  let bloqueadoGlobal = false; // para evitar clics en transición
  const edicionLibertadores = window.COPA_LIBERTADORES_ACTUAL || jugador.año;
  const MAX_REPETICIONES_SECUENCIA = 2; // antes 1: ahora tenés una chance extra por edición.
  if (!jugador.repeticionesLibertadores) jugador.repeticionesLibertadores = {};
  if (typeof jugador.repeticionesLibertadores[edicionLibertadores] !== "number") {
    jugador.repeticionesLibertadores[edicionLibertadores] = 0;
  }

  function generarSecuencia(longitud) {
    const indices = [];
    const disponibles = Array.from({ length: 20 }, (_, i) => i);
    for (let i = 0; i < longitud; i++) {
      const idx = Math.floor(Math.random() * disponibles.length);
      indices.push(disponibles.splice(idx, 1)[0]);
    }
    return indices;
  }

  function actualizarCabecera() {
    const nuevaCabecera = crearCabeceraMinijuego(jugador, rivalActual);
    const marcadorActual = contenedor.querySelector('.minijuego-marcador');
    if (marcadorActual) marcadorActual.outerHTML = nuevaCabecera;
  }

  function limpiarListeners() {
    bloques.forEach(b => {
      const old = b.onclick;
      if (old) b.onclick = null;
      // También eliminar eventos agregados con addEventListener
      b.replaceWith(b.cloneNode(true)); // esto elimina todos los listeners
    });
    // Recrear los bloques en el grid (ya que los clonamos, hay que re-obtener referencias)
    const nuevosBloques = grid.querySelectorAll('.memoria-punto');
    nuevosBloques.forEach((b, i) => {
      b.dataset.index = i;
    });
    bloques.length = 0;
    nuevosBloques.forEach(b => bloques.push(b));
  }

  function jugarPartido(etapa, callbackPartido) {
    const secuencia = generarSecuencia(etapa.longitud);
    let paso = 0;
    let esperandoUsuario = false;
    let aciertosUsuario = [];
    let fallo = false;
    let finalizado = false;

    // Primero, limpiar listeners de bloques anteriores
    limpiarListeners();

    bloques.forEach(b => b.classList.remove("iluminado", "usado", "activo"));
    info.textContent = "Memorizá la secuencia...";
    btnComenzar.disabled = true;

    function mostrarSecuencia() {
      paso = 0;
      esperandoUsuario = false;
      bloques.forEach(b => b.classList.remove("iluminado", "activo"));
      btnRepetir.hidden = true;
      const intervaloMostrar = setInterval(() => {
        if (paso >= secuencia.length) {
          clearInterval(intervaloMostrar);
          info.textContent = "¡Repetí la secuencia!";
          bloques.forEach(b => b.classList.add("activo"));
          esperandoUsuario = true;
          const repeticionesUsadas = jugador.repeticionesLibertadores[edicionLibertadores];
          if (repeticionesUsadas < MAX_REPETICIONES_SECUENCIA) {
            btnRepetir.textContent = `Repetir secuencia (${MAX_REPETICIONES_SECUENCIA - repeticionesUsadas})`;
            btnRepetir.hidden = false;
          } else {
            btnRepetir.hidden = true;
          }
          return;
        }
        const idx = secuencia[paso];
        bloques[idx].classList.add("iluminado");
        setTimeout(() => bloques[idx].classList.remove("iluminado"), 400);
        paso++;
      }, 500);
    }
    btnRepetir.onclick = () => {
      if (jugador.repeticionesLibertadores[edicionLibertadores] >= MAX_REPETICIONES_SECUENCIA || finalizado) return;
      jugador.repeticionesLibertadores[edicionLibertadores]++;
      Estado.guardar();
      const restantes = MAX_REPETICIONES_SECUENCIA - jugador.repeticionesLibertadores[edicionLibertadores];
      info.textContent = restantes > 0
        ? "Repitiendo la secuencia..."
        : "Última repetición de esta Copa Libertadores...";
      mostrarSecuencia();
    };
    mostrarSecuencia();

    const handlerClick = (e) => {
      if (!esperandoUsuario || finalizado || bloqueadoGlobal) return;
      const bloque = e.target;
      const index = parseInt(bloque.dataset.index);
      if (bloque.classList.contains("usado")) return;
      bloque.classList.add("usado");

      // Si ya se excedió la cantidad, es fallo inmediato
      if (aciertosUsuario.length >= secuencia.length) {
        finalizado = true;
        limpiarListeners();
        callbackPartido(false);
        return;
      }

      const indiceEsperado = secuencia[aciertosUsuario.length];
      if (index !== indiceEsperado) fallo = true;
      aciertosUsuario.push(index);

      if (aciertosUsuario.length === secuencia.length) {
        finalizado = true;
        limpiarListeners();
        callbackPartido(!fallo);
      }
    };

    // Volver a asignar listeners (después de limpiar, los bloques son nuevos)
    bloques.forEach(b => {
      b.addEventListener('click', handlerClick);
    });
  }

  function siguientePartido() {
    if (partidoTerminado) return;
    if (indiceEtapa >= etapas.length) {
      partidoTerminado = true;
      callback({ resultado: "campeon" });
      return;
    }

    if (indiceEtapa === 3) {
      if (ganadosGrupos < 2) {
        partidoTerminado = true;
        callback({ resultado: "eliminado", fase: "Fase de Grupos" });
        return;
      }
    }

    const etapa = etapas[indiceEtapa];
    tituloCopa.textContent = `Copa Libertadores - ${etapa.nombre}`;
    rivalActual = obtenerRivalInternacional(jugador);
    actualizarCabecera();

    if (indiceEtapa === 0) {
      info.textContent = "Listo?";
      btnComenzar.disabled = false;
      btnComenzar.textContent = "Comenzar";
      btnComenzar.onclick = () => {
        btnComenzar.disabled = true;
        jugarPartido(etapa, (exito) => {
          if (exito) ganadosGrupos++;
          else erroresGrupos++;
          indiceEtapa++;
          siguientePartido();
        });
      };
    } else {
      info.textContent = "Pasaste de ronda!";
      btnComenzar.disabled = true;
      setTimeout(() => {
        info.textContent = "Listo?";
        btnComenzar.disabled = false;
        btnComenzar.textContent = "Comenzar";
        btnComenzar.onclick = () => {
          btnComenzar.disabled = true;
          jugarPartido(etapa, (exito) => {
            if (exito && etapa.fase === "grupos") ganadosGrupos++;
            else if (!exito && etapa.fase === "grupos") erroresGrupos++;
            if (!exito && etapa.fase === "eliminatoria") {
              partidoTerminado = true;
              callback({ resultado: "eliminado", fase: etapa.nombre });
              return;
            }
            indiceEtapa++;
            siguientePartido();
          });
        };
      }, 3000);
    }
  }

  siguientePartido();
}

// ---------- Jugar Libertadores ----------
function jugarLibertadores(callback, jugador, tipo) {
  const rival = obtenerRivalInternacional(jugador);
  const minijuegosPorPosicion = {
    enganche: typeof jugarLibertadoresEnganche === "function" ? jugarLibertadoresEnganche : null,
    central: typeof jugarLibertadoresCentral === "function" ? jugarLibertadoresCentral : null,
    arquero: typeof jugarLibertadoresArquero === "function" ? jugarLibertadoresArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Lectura de juego", "Memorizá los pases que se iluminan. En grupos podés equivocarte; en eliminación directa un error te deja afuera.", ["Repetí el patrón en orden.", "Cerebro y Liderazgo ralentizan las luces.", "Superá los grupos y cada llave."]],
      central: ["Duelo aéreo constante", "Ganale a los delanteros rivales frenando el círculo en la zona dorada.", ["Tocá cuando el anillo coincida.", "Imponete en los duelos.", "Cada ronda va más rápido."]],
      arquero: ["Bajo los tres palos", "Frená el cursor dentro de la franja verde para salvar cada remate.", ["Iniciá la atajada.", "Reflejos y Velocidad agrandan la zona.", "La exigencia aumenta por ronda."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Copa Libertadores", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Copa Libertadores", fase: "Camino a la final" };
      minijuegoPosicion((exito, fase) => callback(exito, fase), jugador, rival);
    });
    return;
  }
  if (tipo === "copa_completa") {
    minijuegoCopaCompleta((resultado) => {
      if (resultado.resultado === "campeon") callback(true, undefined);
      else callback(false, resultado.fase);
    }, jugador, rival);
  } else {
    if (Math.random() < 0.5) {
      minijuegoBarraQTE((exito) => {
        if (exito) callback(true, undefined);
        else callback(false, "Final");
      }, jugador, rival);
    } else {
      callback(false, "Final");
    }
  }
}

// ---------- Jugar Sudamericana ----------
function jugarSudamericana(callback, jugador) {
  const rival = obtenerRivalInternacional(jugador);
  let prob = 15;
  const media = jugador.media;
  if (media <= 60) prob += 5;
  else if (media <= 75) prob += 8;
  else if (media <= 85) prob += 12;
  else if (media <= 95) prob += 15;
  else prob += 20;

  const juegaFinal = Math.random() * 100 < prob;

  if (!juegaFinal) {
    // No llegaste a la final: no se juega ningún minijuego.
    // Avisamos con "noFinal" para que quien nos llamó muestre el mensaje correcto.
    callback(false, "noFinal");
    return;
  }

  const minijuegosPorPosicion = {
    enganche: typeof jugarSudamericanaEnganche === "function" ? jugarSudamericanaEnganche : null,
    central: typeof jugarSudamericanaCentral === "function" ? jugarSudamericanaCentral : null,
    arquero: typeof jugarSudamericanaArquero === "function" ? jugarSudamericanaArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Final de Copa Sudamericana", "Tenés que completar el Pase filtrado y después acertar El bombazo.", ["SeguÍ la secuencia de teclas.", "Frená el medidor en la zona violeta.", "Los dos desafíos deben salir bien."]],
      central: ["Final de Copa Sudamericana", "Primero cerrá el mano a mano y después despejá sobre la línea.", ["Esperá la señal para reaccionar.", "Frená el cursor en la zona segura.", "Un error corta la final."]],
      arquero: ["Final de Copa Sudamericana", "Tenés que cortar el córner y resolver un mano a mano.", ["Sincronizá tu salida en el centro.", "Memorizá el orden de achique.", "Superá ambos desafíos."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Copa Sudamericana", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Copa Sudamericana", fase: "Final" };
      minijuegoPosicion(callback, jugador, rival);
    });
    return;
  }

  const tipo = Math.random() < 0.5 ? "memoria" : "tirolibre";
  (tipo === "memoria" ? minijuegoMemoriaParejas : minijuegoTiroLibre)((exito) => callback(exito), jugador, rival);
}

// ---------- Mostrar Sudamericana ----------
function mostrarSudamericana(copa, callback) {
  const jugador = Estado.obtener();
  window.CONTEXTO_PARTIDO = { torneo: "Copa Sudamericana", fase: "Edición " + copa.año };
  if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];

  jugarSudamericana((resultado, motivo) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Sudamericana", resultado: "campeon" , club: jugador.club });
      jugador.stats.titulos++;
      asegurarPlazaCampeonContinental(jugador, "sudamericana", copa.año);
      mostrarCartelInternacional(true, undefined, "Trofeos/CopaSudamericana.png");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        const rivalRecopa = obtenerRivalInternacional(jugador);
        jugarRecopa((exitoRecopa) => {
          if (exitoRecopa) {
            jugador.stats.titulos++;
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "campeon" , club: jugador.club });
          } else {
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "subcampeon" , club: jugador.club });
          }
          Estado.guardar();
          mostrarCartelInternacional(exitoRecopa, exitoRecopa ? undefined : "Final", "Trofeos/RecopaSudamericana.png");
          contenedor.hidden = false;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = "";
            contenedor.hidden = true;
            callback();
          });
        }, jugador, rivalRecopa);
      });
    } else {
      const resumen = motivo === "noFinal" ? "eliminado" : "subcampeon";
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Sudamericana", resultado: resumen , club: jugador.club });

      if (motivo === "noFinal") {
        // No interrumpimos el flujo: el resumen anual ya informa la eliminación.
        Estado.guardar();
        callback();
        return;
      } else {
        mostrarCartelInternacional(false, "Final", "");
      }

      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        Estado.guardar();
        callback();
      });
    }
  }, jugador);
}

// ---------- Jugar Recopa ----------
function jugarRecopa(callback, jugador, rival) {
  // Evita heredar el contexto de Libertadores cuando la Recopa se juega a continuación.
  window.CONTEXTO_PARTIDO = { torneo: "Recopa Sudamericana", fase: "Final" };
  const minijuegosPorPosicion = {
    enganche: typeof jugarRecopaEnganche === "function" ? jugarRecopaEnganche : null,
    central: typeof jugarRecopaCentral === "function" ? jugarRecopaCentral : null,
    arquero: typeof jugarRecopaArquero === "function" ? jugarRecopaArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Recopa Sudamericana", "Controlá el caos con La pausa y definí con el tiro libre.", ["Memorizá cinco toques.", "Soltá el remate en la zona ideal.", "Los dos momentos definen el título."]],
      central: ["Recopa Sudamericana", "Ordená el offside y sobreviví al cuerpo a cuerpo.", ["Recordá qué rival pica al vacío.", "Presioná rápido para ganar el forcejeo.", "No hay margen para fallar."]],
      arquero: ["Recopa Sudamericana", "Salvá el rebote y atajá el penal del campeonato.", ["Reaccioná al segundo tiro.", "Frená el cursor en la franja verde.", "Las dos atajadas son necesarias."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Recopa Sudamericana", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Recopa Sudamericana", fase: "Final" };
      minijuegoPosicion(callback, jugador, rival);
    });
    return;
  }
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>Recopa Sudamericana</h3>
      <p>Primero el Anticipo Aéreo, luego el Slalom.</p>
      <button class="boton-jugar-minijuego" id="btn-iniciar-recopa">¡Jugar!</button>
    </div>
  `;

  document.getElementById("btn-iniciar-recopa").addEventListener("click", () => {
    minijuegoAereo((exito1) => {
      if (!exito1) {
        contenedor.innerHTML = "";
        callback(false);
        return;
      }
      minijuegoQTE((exito2) => {
        contenedor.innerHTML = "";
        callback(exito2);
      }, jugador, rival);
    }, jugador, rival);
  });
}

// ---------- Mostrar Libertadores ----------
function mostrarLibertadores(copa, callback) {
  const jugador = Estado.obtener();
  window.CONTEXTO_PARTIDO = { torneo: "Copa Libertadores", fase: "Edición " + copa.año };
  window.COPA_LIBERTADORES_ACTUAL = copa.año;
  // Las carreras creadas antes de las copas internacionales no tienen esta lista.
  // Inicializarla antes de cualquier resultado (victoria o eliminación) evita cortar la partida.
  if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
  const tipo = Math.random() < 0.75 ? "copa_completa" : "final";
  jugarLibertadores((resultado, fase) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: "campeon" , club: jugador.club });
      jugador.stats.titulos++;
      asegurarPlazaCampeonContinental(jugador, "libertadores", copa.año);
      mostrarCartelInternacional(true, undefined, "Trofeos/CopaLibertadores.png");
      const rivalRecopa = obtenerRivalInternacional(jugador);
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        jugarRecopa((exitoRecopa) => {
          if (exitoRecopa) {
            jugador.stats.titulos++;
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "campeon" , club: jugador.club });
          } else {
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "subcampeon" , club: jugador.club });
          }
          Estado.guardar();
          mostrarCartelInternacional(exitoRecopa, exitoRecopa ? undefined : "Final", "Trofeos/RecopaSudamericana.png");
          contenedor.hidden = false;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = "";
            contenedor.hidden = true;
            callback();
          });
        }, jugador, rivalRecopa);
      });
    } else {
      const faseNormalizada = fase === "Eliminado" ? "Fase de Grupos" : (fase || "Fase de Grupos");
      let resumen = "";
      if (faseNormalizada === "Final") resumen = "subcampeon";
      else resumen = `eliminado_${faseNormalizada}`;
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: resumen , club: jugador.club });
      mostrarCartelInternacional(false, faseNormalizada, "");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        Estado.guardar();
        callback();
      });
    }
  }, jugador, tipo);
}

// ---------- Mostrar cartel ----------
function mostrarCartelInternacional(ganador, fase, imagen) {
  const contenedor = document.getElementById("competition-container");
  const torneo = window.CONTEXTO_PARTIDO?.torneo || "Competencia internacional";
  if (ganador) {
    contenedor.innerHTML = `
      <div class="competition-card campeon">
        <h2>¡CAMPEÓN DE ${torneo.toUpperCase()}!</h2>
        <img src="${imagen}" alt="Copa">
        <p>Una campaña para la historia. La vuelta olímpica es toda tuya.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
  } else {
    if (fase === "Final") {
      contenedor.innerHTML = `
        <div class="competition-card subcampeon">
          <h2>Subcampeón de ${torneo} 🥈</h2>
          <p>La final se escapó por detalles, pero llegaste hasta el último partido.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    } else {
      contenedor.innerHTML = `
        <div class="competition-card">
          <h3>${torneo}: ${fase}</h3>
          <p>La campaña terminó acá. Habrá revancha la próxima temporada.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    }
  }
}

// ---------- (opcional) eliminar ejecutarInternacionales ----------
function ejecutarInternacionales(callback) {
  callback(); // No hace nada, todo está en copasPendientes
}

function mostrarInstructivoInternacional(jugador, rival, torneo, titulo, descripcion, reglas, iniciar) {
  const contenedor = document.getElementById("competition-container");
  window.CONTEXTO_PARTIDO = { torneo, fase: "Partido decisivo" };
  contenedor.innerHTML = `${crearCabeceraMinijuego(jugador, rival)}
    <div class="competition-card instructivo-minijuego">
      <span class="badge-copa">CÓMO SE JUEGA</span>
      <h3>${titulo}</h3><p>${descripcion}</p>
      <ol>${reglas.map(regla => `<li>${regla}</li>`).join("")}</ol>
      <button class="boton-jugar-minijuego">Entendido, jugar</button>
    </div>`;
  contenedor.querySelector(".boton-jugar-minijuego").onclick = iniciar;
}
// ============================================
// SECCIÓN: copasinternacionalesclubes.js

// ============================================
// Mundial de Clubes. Depende de data.js, estado.js y crearCabeceraMinijuego.

function esAnioClasificacionMundial(anio) {
  // Ediciones: 2029, 2033, 2037... La plaza se decide el año anterior.
  return (anio + 1 - 2029) % 4 === 0;
}

function rangoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bonusMundialPorMedia(media) {
  if (media >= 96) return 15;
  if (media >= 86) return 10;
  if (media >= 71) return 7;
  return 5;
}

function probabilidadMundialPorClub(club, media) {
  const base = { grande: 20, mediano: 10, chico: 5, pequeno: 5, diminuto: 2 }[club?.categoria] || 2;
  return Math.min(99, base + bonusMundialPorMedia(media || 0));
}

function obtenerTituloClasificatorio(jugador, edicion) {
  // Importante: el cupo al Mundial de Clubes lo gana EL CLUB, no el jugador.
  // Si ganaste la Libertadores con Boca y te fuiste al Roma antes de la
  // edición siguiente, ese cupo se queda en Boca, no viaja con vos.
  return (jugador.resultadosInternacionales || []).find((copa) =>
    copa.año < edicion && copa.año >= edicion - 4 &&
    copa.club === jugador.club &&
    (copa.copa === "Libertadores" || copa.copa === "Recopa" || copa.copa === "Champions") && copa.resultado === "campeon"
  ) || null;
}

function agendarMundialClubes(jugador, anioActual) {
  if (!esAnioClasificacionMundial(anioActual)) return;
  const edicion = anioActual + 1;
  if (!Array.isArray(jugador.clasificacionesMundialClubes)) jugador.clasificacionesMundialClubes = [];
  const club = NOMBRES_CLUBES[jugador.club] || {};
  const titulo = obtenerTituloClasificatorio(jugador, edicion);
  const porTitulo = Boolean(titulo);
  const probabilidad = probabilidadMundialPorClub(club, jugador.media);
  let registro = jugador.clasificacionesMundialClubes.find(c => c.edicion === edicion);
  // La tabla se tira siempre y se conserva para poder informar ambos resultados.
  if (!registro || registro.clasificoPorPuntos === undefined) {
    const clasificoPorPuntos = Math.random() * 100 < probabilidad;
    if (!registro) {
    registro = {
      año: anioActual, edicion, clasificoPorPuntos,
      puntos: clasificoPorPuntos ? rangoAleatorio(1000, 2500) : rangoAleatorio(100, 900),
      probabilidad
    };
    jugador.clasificacionesMundialClubes.push(registro);
    } else {
      registro.clasificoPorPuntos = clasificoPorPuntos;
      registro.puntos = clasificoPorPuntos ? rangoAleatorio(1000, 2500) : rangoAleatorio(100, 900);
      registro.probabilidad = probabilidad;
    }
  }
  registro.entradaTitulo = porTitulo;
  registro.tituloClasificatorio = titulo?.copa || null;
  registro.clasifico = porTitulo || registro.clasificoPorPuntos;
  registro.tipo = porTitulo ? "titulo" : "tabla";
  if (registro.clasifico && !jugador.copasPendientes.some(c => c.año === edicion && c.tipo === "mundial-clubes")) {
    // clubId: el cupo (por título o por tabla) es del club con el que se
    // clasificó; si te transferís antes de la edición, se pierde.
    jugador.copasPendientes.push({ año: edicion, tipo: "mundial-clubes", rivalId: null, clubId: jugador.club });
  }
}

function obtenerRivalMundial(jugador) {
  const grandes = Object.values(CLUBES_POR_DIVISION)
    .flat()
    .filter(club => club.categoria === "grande" && club.id !== jugador.club);
  return grandes[Math.floor(Math.random() * grandes.length)] || obtenerRivalInternacional(jugador);
}

function mostrarMundialClubes(copa, callback) {
  const jugador = Estado.obtener();
  const etapas = ["Fase de grupos · Partido 1", "Fase de grupos · Partido 2", "Fase de grupos · Partido 3", "Octavos de final", "Cuartos de final", "Semifinal", "Final"];
  let indice = 0;
  let ganadosGrupos = 0;
  let perdidosGrupos = 0;
  let partidosDeGrupoJugados = 0;
  const TOTAL_PARTIDOS_GRUPO = 3;
  const VICTORIAS_PARA_CLASIFICAR = 2;
  const DERROTAS_PARA_ELIMINAR = 2;

  function jugarEtapa() {
    const etapa = etapas[indice];
    const rival = obtenerRivalMundial(jugador);
    window.CONTEXTO_PARTIDO = { torneo: "Mundial de Clubes", fase: etapa };
    const terminar = (exito) => {
      const enGrupos = indice < TOTAL_PARTIDOS_GRUPO;
      if (enGrupos) {
        partidosDeGrupoJugados++;
        if (exito) ganadosGrupos++;
        else perdidosGrupos++;

        // Eliminación: ya sufrió las 2 derrotas que lo dejan afuera.
        if (perdidosGrupos >= DERROTAS_PARA_ELIMINAR) {
          return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
        }
        // Se jugaron los 3 partidos: clasifica si sumó las 2 victorias necesarias.
        if (partidosDeGrupoJugados >= TOTAL_PARTIDOS_GRUPO) {
          if (ganadosGrupos < VICTORIAS_PARA_CLASIFICAR) {
            return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
          }
          indice = TOTAL_PARTIDOS_GRUPO;
          return jugarEtapa();
        }
        indice++;
        return jugarEtapa();
      }
      if (!exito) return mostrarResultadoMundial(false, etapa, copa.año, callback);
      indice++;
      if (indice === etapas.length) return mostrarResultadoMundial(true, "Final", copa.año, callback);
      jugarEtapa();
    };
    const juegos = {
      delantero: minijuegoHuecoImposible,
      enganche: minijuegoConstelacion,
      central: minijuegoMarcaPegajosa,
      arquero: minijuegoAsedioTotal
    };
    const dificultad = indice <= 4 ? 0 : indice === 5 ? 1 : 2;
    (juegos[jugador.posicion] || minijuegoHuecoImposible)(terminar, jugador, rival, dificultad);
  }
  jugarEtapa();
}

function tarjetaMundial(jugador, rival, titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `${crearCabeceraMinijuego(jugador, rival)}<div class="competition-card mundial-card"><h3>${titulo}</h3><p>${descripcion}</p>${cuerpo}</div>`;
  return contenedor;
}

function minijuegoHuecoImposible(callback, jugador, rival, nivel) {
  const final = nivel === 2;
  const contenedor = tarjetaMundial(jugador, rival, "El Hueco Imposible", "Hacé clic cuando el hueco verde cruce la mira central.", `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-arco" hidden><span class="mundial-mira"></span><span class="mundial-hueco"></span></div><p id="mundial-tiempo"></p>`);
  contenedor.querySelector("button").onclick = () => {
    const arco = contenedor.querySelector(".mundial-arco"); arco.hidden = false;
    const hueco = contenedor.querySelector(".mundial-hueco");
    const reloj = contenedor.querySelector("#mundial-tiempo");
    let x = 0, direccion = 1, velocidad = nivel === 0 ? 1.2 : 2.1, activo = true;
    hueco.style.width = final ? "8%" : "14%";
    const inicio = Date.now();
    const animar = () => {
      if (!activo) return;
      if (x <= 0 || x >= 86) direccion *= -1;
      if (nivel === 1 && Math.random() < .03) velocidad = 1 + Math.random() * 2.5;
      if (final && Math.random() < .05) hueco.style.width = `${6 + Math.random() * 8}%`;
      x += velocidad * direccion; x = Math.max(0, Math.min(90, x)); hueco.style.left = `${x}%`;
      if (final) {
        const quedan = Math.max(0, 3 - (Date.now() - inicio) / 1000); reloj.textContent = `Tiempo: ${quedan.toFixed(1)}s`;
        if (!quedan) return resolver(false);
      }
      requestAnimationFrame(animar);
    };
    const resolver = exito => { if (!activo) return; activo = false; callback(exito); };
    arco.onclick = () => {
      const centroHueco = x + parseFloat(hueco.style.width) / 2;
      resolver(Math.abs(centroHueco - 50) <= (final ? 5 : 8));
    };
    animar();
  };
}

function minijuegoConstelacion(callback, jugador, rival, nivel) {
  // La dificultad representa la experiencia acumulada: cada 25 partidos se
  // agrega una pelota, con un máximo que mantiene el tablero legible.
  const partidos = (jugador.stats?.partidos || 0) + (jugador.statsAnuales?.partidos || 0);
  const total = Math.min(12, 4 + Math.floor(partidos / 25));
  const limite = Math.max(6, Math.ceil(total * 1.4));
  const contenedor = tarjetaMundial(jugador, rival, "Constelación de Pases", `Hacé clic en las ${total} pelotas en orden (1 → ${total}). Tenés ${limite} segundos.`, `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-nodos" hidden></div><p id="mundial-tiempo"></p>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-nodos"); zona.hidden = false;
    const posiciones = [];
    let intentos = 0;
    while (posiciones.length < total && intentos++ < 300) {
      const candidata = { x: 10 + Math.random() * 80, y: 12 + Math.random() * 72, i: posiciones.length };
      const separada = posiciones.every(p => Math.hypot(p.x - candidata.x, p.y - candidata.y) >= 15);
      if (separada || posiciones.length === 0) posiciones.push(candidata);
    }
    // Respaldo para que un sorteo excepcional nunca deje el desafío sin
    // todas sus pelotas.
    while (posiciones.length < total) {
      const i = posiciones.length;
      posiciones.push({ x: 14 + (i % 4) * 24, y: 18 + Math.floor(i / 4) * 28, i });
    }
    let esperado = 0, activo = true, inicio = Date.now();
    const terminar = exito => { if (!activo) return; activo = false; callback(exito); };
    posiciones.forEach(p => {
      const n = document.createElement("button");
      n.type = "button";
      n.className = "mundial-nodo";
      n.innerHTML = `<span aria-hidden="true">⚽</span><small>${p.i + 1}</small>`;
      n.setAttribute("aria-label", `Pelota ${p.i + 1}`);
      n.style.left = `${p.x}%`;
      n.style.top = `${p.y}%`;
      n.onclick = () => {
        if (!activo) return;
        if (p.i !== esperado) return terminar(false);
        n.classList.add("completado");
        n.disabled = true;
        esperado++;
        if (esperado === total) terminar(true);
      };
      zona.appendChild(n);
    });
    const tick = () => { if (!activo) return; const restante = limite - (Date.now() - inicio) / 1000; contenedor.querySelector("#mundial-tiempo").textContent = `Tiempo: ${Math.max(0, restante).toFixed(1)}s`; if (restante <= 0) return terminar(false); requestAnimationFrame(tick); }; tick();
  };
}

function minijuegoMarcaPegajosa(callback, jugador, rival, nivel) {
  const objetivo = nivel === 2 ? 5 : 3;
  const contenedor = tarjetaMundial(jugador, rival, "Marca Pegajosa", `Mantené el cursor dentro del delantero hasta llenar el robo (${objetivo}s).`, `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-tracking" hidden><span class="mundial-delantero"></span><div class="barra-qte"><div class="barra-progreso"></div></div></div>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-tracking"), rivalNodo = zona.querySelector(".mundial-delantero"), barra = zona.querySelector(".barra-progreso"); zona.hidden = false;
    let carga = 0, dentro = false, activo = true, x = 40, y = 40;
    rivalNodo.style.width = rivalNodo.style.height = nivel === 2 ? "30px" : "52px";
    zona.style.touchAction = "none";
    zona.onpointermove = e => { const r = rivalNodo.getBoundingClientRect(); dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
    const intervalo = setInterval(() => { if (!activo) return; carga += dentro ? .1 : -(nivel ? .16 : .08); carga = Math.max(0, carga); barra.style.width = `${Math.min(100, carga / objetivo * 100)}%`; if (carga >= objetivo) { activo = false; clearInterval(intervalo); callback(true); } }, 100);
    const mover = () => { if (!activo) return; x = Math.max(0, Math.min(88, x + (Math.random() - .5) * (nivel === 0 ? 8 : 22))); y = Math.max(0, Math.min(75, y + (Math.random() - .5) * (nivel === 0 ? 8 : 22))); rivalNodo.style.left = `${x}%`; rivalNodo.style.top = `${y}%`; setTimeout(mover, nivel === 0 ? 450 : 250); }; mover();
    setTimeout(() => { if (activo) { activo = false; clearInterval(intervalo); callback(false); } }, (objetivo + 8) * 1000);
  };
}

function minijuegoAsedioTotal(callback, jugador, rival, nivel) {
  const necesarios = [3, 6, 9][nivel], simultaneos = [1, 4, 6][nivel];
  const contenedor = tarjetaMundial(jugador, rival, "Asedio Total", "Atajá las pelotas antes de que se complete el aro. Las amarillas son amagues.", `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-asedio" hidden><span id="mundial-contador">0/${necesarios}</span></div>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-asedio"); zona.hidden = false; let atajadas = 0, activas = 0, activo = true;
    const terminar = exito => { if (!activo) return; activo = false; callback(exito); };
    const lanzar = () => {
      if (!activo || atajadas >= necesarios) return terminar(true);
      if (activas >= simultaneos) return setTimeout(lanzar, 200);
      activas++; const amague = nivel === 2 && Math.random() < .28; const pelota = document.createElement("button"); pelota.className = `mundial-pelota ${amague ? "amague" : ""}`; pelota.textContent = "⚽"; pelota.style.left = `${5 + Math.random() * 80}%`; pelota.style.top = `${12 + Math.random() * 68}%`; zona.appendChild(pelota);
      const tiempo = nivel === 0 ? 1600 : nivel === 1 ? 1200 : 850;
      const fallo = setTimeout(() => { pelota.remove(); terminar(false); }, tiempo);
      pelota.onclick = () => { clearTimeout(fallo); pelota.remove(); activas--; if (amague) { zona.classList.add("congelado"); setTimeout(() => zona.classList.remove("congelado"), 500); } else { atajadas++; zona.querySelector("#mundial-contador").textContent = `${atajadas}/${necesarios}`; } setTimeout(lanzar, 100); };
      setTimeout(lanzar, nivel === 0 ? 700 : 350);
    }; lanzar();
  };
}

function mostrarResultadoMundial(ganador, etapa, anio, callback) {
  const jugador = Estado.obtener(), contenedor = document.getElementById("competition-container");
  if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
  jugador.resultadosInternacionales.push({ año: anio, copa: "Mundial de Clubes", resultado: ganador ? "campeon" : `eliminado_${etapa}`, club: jugador.club });
  if (ganador) jugador.stats.titulos++;
  Estado.guardar();
  if (ganador && typeof lanzarConfeti === "function") lanzarConfeti();
  contenedor.innerHTML = ganador
    ? `<div class="competition-card campeon"><h2>¡CAMPEÓN DEL MUNDIAL DE CLUBES ${anio}!</h2><img src="Trofeos/MundialClubes.png" alt="Trofeo del Mundial de Clubes"><p>Conquistaste el mundo. Esta campaña queda para siempre en la historia.</p><button class="boton-continuar">Continuar</button></div>`
    : `<div class="competition-card subcampeon"><h2>El sueño mundial terminó en ${etapa}</h2><p>Te tocó una élite feroz, pero llegaste hasta ${etapa}. Habrá revancha.</p><button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; callback(); };
}