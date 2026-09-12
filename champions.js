/**
 * champions.js
 * -----------------------------------------
 * Todo lo de competencias UEFA de clubes: Champions League, Europa
 * League, Conference League y SuperCopa UEFA. Separado de
 * copasinternacionalesclubes.js (que se queda con Libertadores,
 * Sudamericana, Recopa y Mundial de Clubes) para que cada archivo
 * tenga un alcance claro.
 *
 * Depende de: data.js, estado.js, clasificacionClubes.js,
 * crearCabeceraMinijuego (minijuegos.js), agendarMundialClubes y
 * procesarCopasPendientes (copasinternacionalesclubes.js).
 * -----------------------------------------
 */

// ------------------------------------------------------------------
// RIVALES: pool de las 5 ligas europeas ya cargadas en data.js
// ------------------------------------------------------------------
const DIVISIONES_EUROPEAS = [
  "bundesliga-alemania",
  "primera-division-espana",
  "serie-a-italia",
  "ligue-1-francia",
  "premier-league-inglaterra",
];

function obtenerClubesEuropeos(jugador) {
  let todos = [];
  DIVISIONES_EUROPEAS.forEach((div) => {
    todos = todos.concat(CLUBES_POR_DIVISION[div] || []);
  });
  return todos.filter((c) => c.id !== jugador.club);
}

// RNG de rival: 65% grande / 25% mediano / 7% chico / 3% diminuto
function obtenerRivalChampions(jugador) {
  const clubes = obtenerClubesEuropeos(jugador);
  if (!clubes.length) return null;
  const r = Math.random() * 100;
  let categoria;
  if (r < 65) categoria = "grande";
  else if (r < 90) categoria = "mediano";
  else if (r < 97) categoria = "chico";
  else categoria = "diminuto";

  let pool = clubes.filter((c) => c.categoria === categoria);
  if (!pool.length) pool = clubes;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ------------------------------------------------------------------
// CLASIFICACIÓN: top 4 (o campeón) de LaLiga
// ------------------------------------------------------------------
function agendarChampionsLeague(jugador, añoActual, resLiga) {
  agendarCompeticionesUEFA(jugador, añoActual, resLiga);
}

// LaLiga: 1.º-4.º Champions, 5.º Europa League y 6.º Conference League.
// Una plaza superior reemplaza siempre a una inferior en la misma edición.
function agendarCompeticionesUEFA(jugador, añoActual, resLiga) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  let tipo = null;
  if (resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4)) tipo = "champions";
  else if (posicion === 5) tipo = "europa-league";
  else if (posicion === 6) tipo = "conference-league";
  if (tipo) {
    agendarPlazaUEFA(jugador, añoProximo, tipo, "laliga");
  }
}

function agendarPlazaUEFA(jugador, año, tipo, clasificacion) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  const prioridad = { "conference-league": 1, "europa-league": 2, champions: 3 };
  const nuevaPrioridad = prioridad[tipo] || 0;
  if (jugador.copasPendientes.some(copa => copa.año === año && (prioridad[copa.tipo] || 0) > nuevaPrioridad)) return;
  jugador.copasPendientes = jugador.copasPendientes.filter(copa => {
    if (copa.año !== año || prioridad[copa.tipo] === undefined) return true;
    return prioridad[copa.tipo] > nuevaPrioridad;
  });
  if (!jugador.copasPendientes.some(copa => copa.año === año && copa.tipo === tipo)) {
    jugador.copasPendientes.push({ año, tipo, rivalId: null, clasificacion, clubId: jugador.club });
  }
}

function asegurarPlazaMundialClubesProximo(jugador, añoActual, clasificacion) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  const añoProximo = añoActual + 1;
  if (!jugador.copasPendientes.some(copa => copa.año === añoProximo && copa.tipo === "mundial-clubes")) {
    jugador.copasPendientes.push({ año: añoProximo, tipo: "mundial-clubes", rivalId: null, clasificacion, clubId: jugador.club });
  }
}

// ------------------------------------------------------------------
// ETAPAS DE LA COPA (dificultad 0 → 1)
// ------------------------------------------------------------------
const ETAPAS_CHAMPIONS = [
  { nombre: "Fase de Grupos · Jornada 1", fase: "grupos", dificultad: 0.00 },
  { nombre: "Fase de Grupos · Jornada 2", fase: "grupos", dificultad: 0.08 },
  { nombre: "Fase de Grupos · Jornada 3", fase: "grupos", dificultad: 0.16 },
  { nombre: "Octavos de Final", fase: "eliminatoria", dificultad: 0.38 },
  { nombre: "Cuartos de Final", fase: "eliminatoria", dificultad: 0.58 },
  { nombre: "Semifinal", fase: "eliminatoria", dificultad: 0.80 },
  { nombre: "Gran Final", fase: "eliminatoria", dificultad: 1.00 },
];

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

// ------------------------------------------------------------------
// 1. DELANTERO — "El Toque de Primera" (física de rebote / flecha giratoria)
// ------------------------------------------------------------------
function jugarChampionsDelantero(jugador, rival, etapa, callback) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const d = etapa.dificultad;

  const anchoObjetivo = lerp(72, 20, d);      // grados de la zona verde (arco)
  const anchoCentral = lerp(26, 50, d);       // grados de la zona roja (el central)
  const velocidad = lerp(70, 230, d);         // grados por segundo
  const conEfecto = etapa.nombre === "Gran Final"; // desvío en la final
  const hayGuia = etapa.fase === "grupos";

  const objetivoInicio = 40 + Math.random() * 200;
  // El central se solapa con un borde del arco (como pide la consigna), pero
  // SIEMPRE dejando al menos la mitad del arco libre: antes, en dificultades
  // altas (semis/final) el central llegaba a tapar el arco entero y era
  // matemáticamente imposible acertar, sin importar dónde frenaras la flecha.
  const solapeCentral = Math.min(anchoCentral * 0.45, anchoObjetivo * 0.5);
  const centralInicio = objetivoInicio + anchoObjetivo - solapeCentral;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card ucl-card">
      <span class="badge-copa">UEFA CHAMPIONS LEAGUE</span>
      <h3>${etapa.nombre}</h3>
      <p>Rotá la flecha y rematá de primera esquivando al central. ¡Apuntá al arco!</p>
      <div class="ucl-dial-wrap">
        <div class="ucl-dial" id="ucl-dial"
          style="--obj-ini:${objetivoInicio}deg; --obj-ancho:${anchoObjetivo}deg; --cent-ini:${centralInicio}deg; --cent-ancho:${anchoCentral}deg;">
          ${hayGuia ? '<div class="ucl-dial-guia"></div>' : ""}
          <div class="ucl-dial-flecha" id="ucl-flecha"></div>
          <div class="ucl-dial-centro">⚽</div>
        </div>
      </div>
      <button class="boton-iniciar-qte" id="btn-rematar">¡REMATAR!</button>
    </div>
  `;

  const flecha = document.getElementById("ucl-flecha");
  const btn = document.getElementById("btn-rematar");
  let inicio = null;
  let raf = null;
  let terminado = false;

  function frame(t) {
    if (terminado) return;
    if (inicio === null) inicio = t;
    const angulo = ((t - inicio) / 1000) * velocidad % 360;
    flecha.style.transform = `rotate(${angulo}deg)`;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  btn.addEventListener("click", () => {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(raf);
    const transformActual = flecha.style.transform.match(/-?\d+(\.\d+)?/);
    let angulo = transformActual ? parseFloat(transformActual[0]) % 360 : 0;
    if (angulo < 0) angulo += 360;
    if (conEfecto) angulo = (angulo + (Math.random() * 30 - 15) + 360) % 360;

    const dentro = (base, ancho, valor) => {
      const fin = base + ancho;
      const v2 = valor + 360;
      return (valor >= base && valor <= fin) || (v2 >= base && v2 <= fin);
    };
    const enCentral = dentro(centralInicio, anchoCentral, angulo);
    const enArco = dentro(objetivoInicio, anchoObjetivo, angulo);
    const exito = enArco && !enCentral;

    flecha.classList.add(exito ? "ucl-exito" : "ucl-fallo");
    btn.disabled = true;
    setTimeout(() => callback(exito), 700);
  });
}

// ------------------------------------------------------------------
// 2. ENGANCHE — "Ajedrez Táctico" (trazado de rutas en cuadrícula)
// ------------------------------------------------------------------
function jugarChampionsEnganche(jugador, rival, etapa, callback) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const d = etapa.dificultad;

  const columnas = 5;
  // Antes: hasta 6 filas con solo 3s totales en la dificultad más alta (un
  // promedio de 500ms por click, con el defensor saltando cada 320ms) lo
  // hacía prácticamente imposible de reaccionar. Se recorta el máximo de
  // filas y se deja más tiempo total y más lento al defensor en el peor caso.
  const filas = Math.round(lerp(3, 5, d));
  const velocidadDefensor = lerp(1000, 480, d); // ms entre movimientos
  const tiempoTotal = Math.round(lerp(11000, 5500, d)); // ms

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card ucl-card">
      <span class="badge-copa">UEFA CHAMPIONS LEAGUE</span>
      <h3>${etapa.nombre}</h3>
      <p>Trazá el pase filtrado: hacé clic en un casillero libre por fila, esquivando al defensor rojo.</p>
      <div class="secuencia-info" id="ucl-info">Tiempo: <span id="ucl-tiempo">${(tiempoTotal / 1000).toFixed(1)}</span>s</div>
      <div class="ucl-tactico" id="ucl-tactico" style="grid-template-columns:repeat(${columnas},1fr);"></div>
    </div>
  `;

  const grid = document.getElementById("ucl-tactico");
  const info = document.getElementById("ucl-info");
  const spanTiempo = document.getElementById("ucl-tiempo");

  const celdas = [];
  for (let f = 0; f < filas; f++) {
    celdas[f] = [];
    for (let c = 0; c < columnas; c++) {
      const div = document.createElement("div");
      div.className = "ucl-celda";
      div.dataset.fila = f;
      div.dataset.col = c;
      grid.appendChild(div);
      celdas[f].push(div);
    }
  }

  let filaActual = filas - 1; // se empieza cerca del jugador, hacia el 9 (fila 0)
  const defensores = [];
  for (let f = 0; f < filas; f++) defensores.push(Math.floor(Math.random() * columnas));

  let terminado = false;

  function pintarFila() {
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        const celda = celdas[f][c];
        celda.classList.toggle("ucl-defensor", c === defensores[f]);
        celda.classList.toggle("ucl-activa", f === filaActual);
        celda.classList.toggle("ucl-apagada", f !== filaActual);
      }
    }
  }
  pintarFila();

  const intervaloDefensor = setInterval(() => {
    if (terminado) return;
    defensores[filaActual] = Math.floor(Math.random() * columnas);
    pintarFila();
  }, velocidadDefensor);

  let restante = tiempoTotal;
  const intervaloTiempo = setInterval(() => {
    if (terminado) return;
    restante -= 100;
    spanTiempo.textContent = Math.max(0, restante / 1000).toFixed(1);
    if (restante <= 0) finalizar(false);
  }, 100);

  function finalizar(exito) {
    if (terminado) return;
    terminado = true;
    clearInterval(intervaloDefensor);
    clearInterval(intervaloTiempo);
    info.textContent = exito ? "¡Pase filtrado perfecto!" : "¡Te lo cortaron!";
    setTimeout(() => callback(exito), 500);
  }

  grid.addEventListener("click", (e) => {
    const celda = e.target.closest(".ucl-celda");
    if (!celda || terminado) return;
    const f = parseInt(celda.dataset.fila, 10);
    const c = parseInt(celda.dataset.col, 10);
    if (f !== filaActual) return;
    if (c === defensores[f]) {
      celda.classList.add("ucl-fallo");
      finalizar(false);
      return;
    }
    celda.classList.add("ucl-exito");
    filaActual--;
    if (filaActual < 0) finalizar(true);
    else pintarFila();
  });
}

// ------------------------------------------------------------------
// 3. CENTRAL — "Desarme Quirúrgico" (anillos giratorios)
// ------------------------------------------------------------------
function jugarChampionsCentral(jugador, rival, etapa, callback) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const d = etapa.dificultad;

  const tolerancia = lerp(32, 7, d); // grados de margen para el "click"
  const velocidadBase = lerp(45, 150, d);
  const cambiosDeDireccion = etapa.nombre === "Gran Final";

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card ucl-card">
      <span class="badge-copa">UEFA CHAMPIONS LEAGUE</span>
      <h3>${etapa.nombre}</h3>
      <p>Hacé clic cuando los tres huecos se alineen arriba, en la marca. ¡Sin cometer penal!</p>
      <div class="ucl-anillos-wrap">
        <div class="ucl-marca-fija"></div>
        <div class="ucl-anillo ucl-anillo-1" id="anillo-0"><div class="ucl-hueco"></div></div>
        <div class="ucl-anillo ucl-anillo-2" id="anillo-1"><div class="ucl-hueco"></div></div>
        <div class="ucl-anillo ucl-anillo-3" id="anillo-2"><div class="ucl-hueco"></div></div>
      </div>
      <button class="boton-iniciar-qte" id="btn-robar">¡ROBAR LA PELOTA!</button>
    </div>
  `;

  const anillosDom = [document.getElementById("anillo-0"), document.getElementById("anillo-1"), document.getElementById("anillo-2")];
  const btn = document.getElementById("btn-robar");
  const anillos = [
    { vel: velocidadBase * 1.0, signo: 1 },
    { vel: velocidadBase * 1.4, signo: -1 },
    { vel: velocidadBase * 0.7, signo: 1 },
  ];

  let inicio = null;
  let raf = null;
  let terminado = false;
  let ultimoCambio = 0;

  function normalizar(ang) {
    let a = ang % 360;
    if (a < 0) a += 360;
    return a;
  }

  function frame(t) {
    if (terminado) return;
    if (inicio === null) inicio = t;
    const transcurrido = t - inicio;

    if (cambiosDeDireccion && transcurrido - ultimoCambio > 1400) {
      ultimoCambio = transcurrido;
      anillos[Math.floor(Math.random() * anillos.length)].signo *= -1;
    }

    anillos.forEach((a, i) => {
      const angulo = normalizar(a.signo * a.vel * (transcurrido / 1000));
      a.anguloActual = angulo;
      anillosDom[i].style.transform = `rotate(${angulo}deg)`;
    });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  btn.addEventListener("click", () => {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(raf);
    const distancias = anillos.map((a) => {
      const ang = a.anguloActual || 0;
      return Math.min(ang, 360 - ang);
    });
    const exito = distancias.every((dist) => dist <= tolerancia);
    document.querySelector(".ucl-anillos-wrap").classList.add(exito ? "ucl-exito" : "ucl-fallo");
    btn.disabled = true;
    setTimeout(() => callback(exito), 700);
  });
}

// ------------------------------------------------------------------
// 4. ARQUERO — "Punto Ciego" (rastreo predictivo)
// ------------------------------------------------------------------
function jugarChampionsArquero(jugador, rival, etapa, callback) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const d = etapa.dificultad;

  const anchoPared = lerp(26, 62, d);   // % de la pista que tapa la pared
  const duracionTotal = lerp(2400, 1300, d); // ms del recorrido
  const comba = lerp(4, 32, d); // desvío vertical extra mientras está oculta

  const paredInicio = 50 - anchoPared / 2;
  const paredFin = 50 + anchoPared / 2;
  const alturaInicial = 20 + Math.random() * 60;
  const alturaFinal = Math.max(6, Math.min(94, alturaInicial + (Math.random() * 2 - 1) * comba));

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card ucl-card">
      <span class="badge-copa">UEFA CHAMPIONS LEAGUE</span>
      <h3>${etapa.nombre}</h3>
      <p>El delantero rival patea un misil. Calculá por dónde sale y hacé clic en la franja para atajarlo.</p>
      <div class="ucl-pista">
        <div class="ucl-pared" style="left:${paredInicio}%; width:${anchoPared}%;">👥👥👥</div>
        <div class="ucl-pelota" id="ucl-pelota" style="top:${alturaInicial}%;">⚽</div>
      </div>
      <div class="ucl-franja" id="ucl-franja">
        <div class="ucl-franja-marca" id="ucl-marca" style="display:none;"></div>
      </div>
      <div class="secuencia-info" id="ucl-info-arq">Calculá y hacé clic en la franja...</div>
    </div>
  `;

  const pelota = document.getElementById("ucl-pelota");
  const franja = document.getElementById("ucl-franja");
  const marca = document.getElementById("ucl-marca");
  const info = document.getElementById("ucl-info-arq");

  let clickeado = false;
  let alturaClick = null;
  let terminado = false;

  franja.addEventListener("click", (e) => {
    if (terminado || clickeado) return;
    clickeado = true;
    const rect = franja.getBoundingClientRect();
    alturaClick = ((e.clientY - rect.top) / rect.height) * 100;
    marca.style.display = "block";
    marca.style.top = `${alturaClick}%`;
    info.textContent = "¡Atajada lanzada! Esperando el remate...";
  });

  const inicio = performance.now();
  let raf = null;
  function frame(t) {
    if (terminado) return;
    const progreso = Math.min(1, (t - inicio) / duracionTotal);
    const x = progreso * 100;
    pelota.style.left = `${x}%`;

    let altura;
    if (x < paredInicio) {
      altura = alturaInicial;
      pelota.style.opacity = "1";
    } else if (x > paredFin) {
      altura = alturaFinal;
      pelota.style.opacity = "1";
    } else {
      const tOculto = (x - paredInicio) / (paredFin - paredInicio);
      altura = alturaInicial + (alturaFinal - alturaInicial) * tOculto;
      pelota.style.opacity = "0"; // detrás de la pared
    }
    pelota.style.top = `${altura}%`;

    if (progreso >= 1) {
      terminado = true;
      pelota.style.opacity = "1";
      const tolerancia = lerp(16, 6, d);
      const exito = clickeado && Math.abs(alturaClick - alturaFinal) <= tolerancia;
      info.textContent = exito ? "¡ATAJADA SALVADORA!" : "La pelota se clavó en el ángulo...";
      franja.classList.add(exito ? "ucl-exito" : "ucl-fallo");
      setTimeout(() => callback(exito), 700);
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

// ------------------------------------------------------------------
// ORQUESTADOR: recorre las 7 etapas de la copa
// ------------------------------------------------------------------
function jugarPartidoChampions(jugador, rival, etapa, callback) {
  const juegos = {
    delantero: jugarChampionsDelantero,
    enganche: jugarChampionsEnganche,
    central: jugarChampionsCentral,
    arquero: jugarChampionsArquero,
  };
  const juego = juegos[jugador.posicion] || jugarChampionsDelantero;
  juego(jugador, rival, etapa, callback);
}

function minijuegoChampionsCompleta(callback, jugador) {
  let indice = 0;
  let ganadosGrupos = 0;
  let jugadosGrupos = 0;

  function siguienteEtapa() {
    if (indice >= ETAPAS_CHAMPIONS.length) {
      callback({ resultado: "campeon" });
      return;
    }
    const etapa = ETAPAS_CHAMPIONS[indice];
    const rival = obtenerRivalChampions(jugador);
    window.CONTEXTO_PARTIDO = { torneo: "UEFA Champions League", fase: etapa.nombre };

    jugarPartidoChampions(jugador, rival, etapa, (exito) => {
      if (etapa.fase === "grupos") {
        jugadosGrupos++;
        if (exito) ganadosGrupos++;
        if (jugadosGrupos === 3 && ganadosGrupos < 2) {
          callback({ resultado: "eliminado", fase: "Fase de Grupos" });
          return;
        }
        indice++;
        siguienteEtapa();
      } else {
        if (!exito) {
          callback({ resultado: "eliminado", fase: etapa.nombre });
          return;
        }
        indice++;
        siguienteEtapa();
      }
    });
  }
  siguienteEtapa();
}

// ------------------------------------------------------------------
// FINALES UEFA: Europa League, Conference League y Supercopa UEFA.
// Cada una tiene un único desafío por posición, sin fase de grupos.
// ------------------------------------------------------------------
function tarjetaFinalUEFA(jugador, rival, titulo, descripcion, cuerpo) {
  return tarjetaMundial(jugador, rival, titulo, descripcion, `<button class="boton-jugar-minijuego">Empezar</button>${cuerpo}`);
}

function minijuegoFinalUEFA(tipo, callback, jugador, rival) {
  const posicion = jugador.posicion || "delantero";
  const terminarConTiempo = (contenedor, ms, resolver) => {
    let activo = true;
    const terminar = exito => { if (!activo) return; activo = false; resolver(exito); };
    setTimeout(() => terminar(false), ms);
    return terminar;
  };

  if (tipo === "europa") {
    if (posicion === "delantero") {
      const c = tarjetaFinalUEFA(jugador, rival, "Equilibrio y Fuego", "Apretá ESPACIO para aguantar al defensor. Cuando aparezca el blanco, clickealo sin perder el equilibrio.", `<div class="barra-qte"><div class="barra-progreso"></div></div><div class="mundial-arco" hidden></div>`);
      c.querySelector("button").onclick = () => {
        const barra = c.querySelector(".barra-progreso"), arco = c.querySelector(".mundial-arco"); let equilibrio = 25, activo = true;
        const tecla = e => { if (e.code === "Space") { e.preventDefault(); equilibrio = Math.min(100, equilibrio + 12); barra.style.width = `${equilibrio}%`; } };
        window.addEventListener("keydown", tecla);
        const cerrar = exito => { if (!activo) return; activo = false; window.removeEventListener("keydown", tecla); callback(exito); };
        const desgaste = setInterval(() => { equilibrio = Math.max(0, equilibrio - 3); barra.style.width = `${equilibrio}%`; if (!equilibrio) { clearInterval(desgaste); cerrar(false); } }, 120);
        setTimeout(() => { if (!activo) return; arco.hidden = false; const blanco = document.createElement("button"); blanco.className = "mundial-nodo"; blanco.textContent = "🎯"; blanco.style.left = `${20 + Math.random() * 60}%`; blanco.style.top = `${25 + Math.random() * 45}%`; blanco.onclick = () => { clearInterval(desgaste); cerrar(equilibrio >= 45); }; arco.appendChild(blanco); setTimeout(() => { clearInterval(desgaste); cerrar(false); }, 1100); }, 2200);
      }; return;
    }
    if (posicion === "enganche") {
      const lado = Math.random() < .5 ? "izquierda" : "derecha";
      const c = tarjetaFinalUEFA(jugador, rival, "Radar Mental", "El radar va a titilar dos veces. Detectá la corrida y hacé clic en la zona ciega correcta.", `<div class="radar-uefa">📡</div><div class="opciones-uefa" hidden><button data-lado="izquierda">← Pase a la izquierda</button><button data-lado="derecha">Pase a la derecha →</button></div>`);
      c.querySelector("button").onclick = () => { const radar = c.querySelector(".radar-uefa"), opciones = c.querySelector(".opciones-uefa"); let destellos = 0; const i = setInterval(() => { radar.textContent = lado === "izquierda" ? "📡 ◀" : "▶ 📡"; setTimeout(() => radar.textContent = "📡", 180); if (++destellos === 2) { clearInterval(i); setTimeout(() => { opciones.hidden = false; }, 400); } }, 550); opciones.onclick = e => { if (e.target.dataset.lado) callback(e.target.dataset.lado === lado); }; }; return;
    }
    if (posicion === "central") {
      const c = tarjetaFinalUEFA(jugador, rival, "Barrida de Obstáculos", "Usá ← y → para esquivar obstáculos. Terminá en el carril de la pelota.", `<div class="carriles-uefa">⚽<span>🦵</span><span>💧</span></div><p>Posición: <b>2</b></p>`);
      c.querySelector("button").onclick = () => { let pos = 2, activo = true; const txt = c.querySelector("b"); const tecla = e => { if (e.key === "ArrowLeft") pos = Math.max(1, pos - 1); if (e.key === "ArrowRight") pos = Math.min(3, pos + 1); txt.textContent = pos; }; window.addEventListener("keydown", tecla); setTimeout(() => { if (!activo) return; activo = false; window.removeEventListener("keydown", tecla); callback(pos === 2); }, 3000); }; return;
    }
    const c = tarjetaFinalUEFA(jugador, rival, "Rebote a Quemarropa", "Tras el flash, clickeá el rebote rojo en 0.4 segundos.", `<div class="mundial-arco" hidden></div>`);
    c.querySelector("button").onclick = () => { const arco = c.querySelector(".mundial-arco"); setTimeout(() => { arco.hidden = false; const punto = document.createElement("button"); punto.className = "mundial-nodo"; punto.textContent = "🔴"; punto.style.left = `${10 + Math.random() * 80}%`; punto.style.top = `${15 + Math.random() * 65}%`; let activo = true; punto.onclick = () => { if (activo) { activo = false; callback(true); } }; arco.appendChild(punto); setTimeout(() => { if (activo) { activo = false; callback(false); } }, 400); }, 500); }; return;
  }

  if (tipo === "conference") {
    if (posicion === "delantero") {
      const c = tarjetaFinalUEFA(jugador, rival, "Chilena Rota", "El círculo se mueve de forma irregular: hacé clic cuando llegue al centro dorado.", `<div class="timing-uefa"><div class="anillo-uefa">⚽</div></div>`);
      c.querySelector("button").onclick = () => { const anillo = c.querySelector(".anillo-uefa"); let tam = 100, activo = true; const tick = () => { if (!activo) return; tam -= 3 + Math.random() * 8; anillo.style.transform = `scale(${Math.max(.1, tam / 100)})`; if (tam <= 12) { activo = false; callback(false); return; } setTimeout(tick, 90 + Math.random() * 180); }; anillo.onclick = () => { if (activo) { activo = false; callback(tam <= 32 && tam >= 15); } }; tick(); }; return;
    }
    if (posicion === "enganche") {
      const teclaCorrecta = ["w", "a", "s", "d"][Math.floor(Math.random() * 4)];
      const c = tarjetaFinalUEFA(jugador, rival, "La Ruleta de Zidane", "Esperá que la ruleta pare: la salida verde indica la tecla correcta.", `<div class="ruleta-uefa">🌀</div><p class="salida-uefa" hidden></p>`);
      c.querySelector("button").onclick = () => { const ruleta = c.querySelector(".ruleta-uefa"), salida = c.querySelector(".salida-uefa"); ruleta.style.animation = "spin 1.5s linear"; setTimeout(() => { let activo = true; salida.hidden = false; salida.textContent = `SALIDA VERDE: ${teclaCorrecta.toUpperCase()}`; const tecla = e => { if (activo && ["w", "a", "s", "d"].includes(e.key.toLowerCase())) { activo = false; window.removeEventListener("keydown", tecla); callback(e.key.toLowerCase() === teclaCorrecta); } }; window.addEventListener("keydown", tecla); setTimeout(() => { if (activo) { activo = false; window.removeEventListener("keydown", tecla); callback(false); } }, 2500); }, 1500); }; return;
    }
    if (posicion === "central") {
      const c = tarjetaFinalUEFA(jugador, rival, "La Sombra", "Mantené tu mouse cerca del cursor rival durante 3 segundos.", `<div class="mundial-arco"><span class="mundial-delantero">✦</span><span class="sombra-uefa">●</span></div><p>Marca: <b>0.0</b>/3.0 s</p>`);
      c.querySelector("button").onclick = () => { const zona = c.querySelector(".mundial-arco"), rivalCursor = zona.querySelector(".mundial-delantero"), txt = c.querySelector("b"); let x = 50, y = 50, mx = -999, my = -999, carga = 0, activo = true; zona.onpointermove = e => { const r = zona.getBoundingClientRect(); mx = (e.clientX-r.left)/r.width*100; my = (e.clientY-r.top)/r.height*100; }; const mover = setInterval(() => { x = Math.max(5, Math.min(90, x + (Math.random()-.5)*22)); y = Math.max(8, Math.min(85, y + (Math.random()-.5)*20)); rivalCursor.style.left=`${x}%`; rivalCursor.style.top=`${y}%`; }, 260); const medir = setInterval(() => { const cerca = Math.hypot(mx-x,my-y) < 13; carga = Math.max(0, carga + (cerca ? .1 : -.12)); txt.textContent=carga.toFixed(1); if(carga>=3){activo=false;clearInterval(mover);clearInterval(medir);callback(true);}},100); setTimeout(()=>{if(activo){activo=false;clearInterval(mover);clearInterval(medir);callback(false);}},8000); }; return;
    }
    const viento = Math.random() < .5 ? -1 : 1;
    const c = tarjetaFinalUEFA(jugador, rival, "Viento Traicionero", `La pelota va al centro, pero el viento la empuja hacia la ${viento < 0 ? "izquierda" : "derecha"}. Elegí la atajada final.`, `<div class="opciones-uefa"><button data-zona="-1">←</button><button data-zona="0">Centro</button><button data-zona="1">→</button></div>`);
    c.querySelector("button").onclick = () => { const o=c.querySelector(".opciones-uefa"); o.onclick=e=>{if(e.target.dataset.zona!==undefined) callback(Number(e.target.dataset.zona)===viento);}; }; return;
  }

  // Supercopa UEFA
  if (posicion === "delantero") {
    const c = tarjetaFinalUEFA(jugador, rival, "Gatillo de Tensión", "Mantené clic. Soltá solamente cuando la mira se vuelva dorada.", `<div class="mira-super">✣</div>`);
    c.querySelector("button").onclick = () => { const mira=c.querySelector(".mira-super"); let dorada=false, activo=true; const mover=setInterval(()=>{mira.style.transform=`translate(${Math.random()*120-60}px,${Math.random()*80-40}px)`;},90); setTimeout(()=>{dorada=true;mira.style.color="#ffd34d";},1800); mira.onpointerdown=()=>{}; c.onpointerup=()=>{if(activo){activo=false;clearInterval(mover);callback(dorada);}}; setTimeout(()=>{if(activo){activo=false;clearInterval(mover);callback(false);}},2800); }; return;
  }
  if (posicion === "enganche") {
    const orden=[1,2,3].sort(()=>Math.random()-.5);
    const c = tarjetaFinalUEFA(jugador, rival, "Geometría de Billar", `Armá la carambola: clickeá los nodos en orden ${orden.join(" → ")}.`, `<div class="opciones-uefa"><button data-n="1">↗ Nodo 1</button><button data-n="2">↘ Nodo 2</button><button data-n="3">↖ Nodo 3</button></div>`);
    c.querySelector("button").onclick=()=>{let paso=0,activo=true;const o=c.querySelector(".opciones-uefa");o.onclick=e=>{if(!activo||!e.target.dataset.n)return;if(Number(e.target.dataset.n)!==orden[paso]){activo=false;return callback(false);}if(++paso===3){activo=false;callback(true);}};setTimeout(()=>{if(activo){activo=false;callback(false);}},3000);};return;
  }
  if (posicion === "central") {
    const c = tarjetaFinalUEFA(jugador, rival, "Contrapeso Físico", "El mouse funciona al revés: compensá los empujones y mantené el indicador centrado.", `<div class="barra-qte"><div class="barra-progreso"></div></div><p><b>0.0</b>/4.0 s de equilibrio</p>`);
    c.querySelector("button").onclick=()=>{let balance=50,carga=0,activo=true,anterior=null;const barra=c.querySelector(".barra-progreso"),txt=c.querySelector("b");c.onpointermove=e=>{if(anterior!==null)balance-= (e.clientX-anterior)*.28;anterior=e.clientX;};const i=setInterval(()=>{balance+=Math.random()*12-6;balance=Math.max(0,Math.min(100,balance));barra.style.width=`${balance}%`;carga=Math.max(0,carga+(Math.abs(balance-50)<15?.1:-.14));txt.textContent=carga.toFixed(1);if(carga>=4){activo=false;clearInterval(i);callback(true);}},100);setTimeout(()=>{if(activo){activo=false;clearInterval(i);callback(false);}},9000);};return;
  }
  const desvio=Math.random()<.5?-1:1;
  const c = tarjetaFinalUEFA(jugador, rival, "Lectura de Efecto", `La rotación hará doblar la pelota a la ${desvio<0?"izquierda":"derecha"}. Elegí dónde volar con los guantes.`, `<div class="opciones-uefa"><button data-z="-1">🧤 ←</button><button data-z="1">🧤 →</button></div>`);
  c.querySelector("button").onclick=()=>{const o=c.querySelector(".opciones-uefa");o.onclick=e=>{if(e.target.dataset.z!==undefined)callback(Number(e.target.dataset.z)===desvio);};};
}

function obtenerRivalUEFA(jugador, pesos) {
  const clubes = obtenerClubesEuropeos(jugador);
  const r = Math.random() * 100; let acumulado = 0; let categoria = "mediano";
  for (const [clave, peso] of Object.entries(pesos)) { acumulado += peso; if (r < acumulado) { categoria = clave; break; } }
  const pool = clubes.filter(club => club.categoria === categoria);
  return pool[Math.floor(Math.random() * pool.length)] || clubes[Math.floor(Math.random() * clubes.length)] || null;
}

function mostrarFinalUEFA(copa, callback, config) {
  const jugador = Estado.obtener(); const rival = obtenerRivalUEFA(jugador, config.pesos);
  window.CONTEXTO_PARTIDO = { torneo: config.nombre, fase: "Final" };
  mostrarInstructivoInternacional(jugador, rival, config.nombre, config.titulo, config.descripcion, ["Final directa a partido único.", "Ganala para levantar el trofeo.", "El desafío depende de tu posición."], () => {
    minijuegoFinalUEFA(config.tipo, exito => {
      if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales=[];
      jugador.resultadosInternacionales.push({ año:copa.año, copa:config.nombre, resultado:exito?"campeon":"subcampeon" , club: jugador.club });
      if(exito){jugador.stats.titulos++; config.recompensa?.(jugador,copa.año);}
      Estado.guardar(); mostrarCartelInternacional(exito, exito?undefined:"Final", config.imagen);
      document.getElementById("competition-container").querySelector(".boton-continuar").onclick=()=>{const c=document.getElementById("competition-container");c.innerHTML="";c.hidden=true;callback();};
    }, jugador, rival);
  });
}

function mostrarEuropaLeague(copa, callback) { mostrarFinalUEFA(copa, callback, { tipo:"europa", nombre:"Europa League", titulo:"UEFA Europa League", descripcion:"Un torneo físico, de canchas difíciles y finales que se juegan al límite.", imagen:"Trofeos/EuropaLeague.png", pesos:{grande:40,mediano:40,chico:15,diminuto:5}, recompensa:(j,a)=>{agendarPlazaUEFA(j,a+1,"champions","campeon-europa");if(!j.copasPendientes.some(c=>c.año===a+1&&c.tipo==="supercopa-uefa"))j.copasPendientes.push({año:a+1,tipo:"supercopa-uefa",rivalId:null,clubId:j.club});} }); }
function mostrarConferenceLeague(copa, callback) { mostrarFinalUEFA(copa, callback, { tipo:"conference", nombre:"Conference League", titulo:"UEFA Conference League", descripcion:"El torneo del factor sorpresa: estadios raros y situaciones atípicas.", imagen:"Trofeos/ConferenceLeague.png", pesos:{mediano:45,chico:40,grande:10,diminuto:5}, recompensa:(j,a)=>agendarPlazaUEFA(j,a+1,"europa-league","campeon-conference") }); }

function jugarSuperCopaUEFA(callback, jugador, rival) { minijuegoFinalUEFA("supercopa", callback, jugador, rival); }

function mostrarSuperCopaUEFA(copa, callback) {
  const jugador = Estado.obtener();
  const rival = obtenerRivalUEFA(jugador, { grande: 65, mediano: 20, chico: 10, diminuto: 5 });
  mostrarInstructivoInternacional(
    jugador, rival, "SuperCopa UEFA",
    "Duelo de campeones",
    "El campeón de Champions o Europa League se mide por la Supercopa UEFA.",
    ["Es un solo partido, no hay revancha.", "El desafío depende de tu posición.", "Ganalo y asegurás tu lugar en el próximo Mundial de Clubes."],
    () => {
      jugarSuperCopaUEFA((exito) => {
        if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
        jugador.resultadosInternacionales.push({ año: copa.año, copa: "SuperCopa UEFA", resultado: exito ? "campeon" : "subcampeon" , club: jugador.club });
        if (exito) {
          jugador.stats.titulos++;
          asegurarPlazaMundialClubesProximo(jugador, copa.año, "campeon-supercopa-uefa");
        }
        Estado.guardar();
        mostrarCartelInternacional(exito, exito ? undefined : "Final", "Trofeos/SuperCopaUEFA.png");
        const contenedor = document.getElementById("competition-container");
        contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
          contenedor.innerHTML = "";
          contenedor.hidden = true;
          callback();
        });
      }, jugador, rival);
    }
  );
}

// ------------------------------------------------------------------
// JUGAR / MOSTRAR CHAMPIONS
// ------------------------------------------------------------------
function jugarChampions(callback, jugador) {
  const textos = {
    delantero: ["El Toque de Primera", "Rotá la flecha 360° y buscá el ángulo exacto para el remate de primera.", ["Apuntá dentro del arco.", "Esquivá al central.", "En la final, calculá el efecto de la pelota."]],
    enganche: ["Ajedrez Táctico", "Trazá el camino del pase filtrado casillero a casillero.", ["Un clic por fila, en orden.", "No pises la casilla del defensor.", "El camino se hace más largo y veloz en cada ronda."]],
    central: ["Desarme Quirúrgico", "Sincronizá el clic cuando los tres huecos se alineen arriba.", ["Mirá los tres anillos girar.", "Hacé clic en el instante justo.", "En la final cambian de dirección de golpe."]],
    arquero: ["Punto Ciego", "Calculá la trayectoria del remate cuando la pared te tape la pelota.", ["Seguí la pelota antes de que se oculte.", "Hacé clic en la franja donde creés que sale.", "La pelota agarra comba mientras está oculta."]],
  };
  const [titulo, descripcion, reglas] = textos[jugador.posicion] || textos.delantero;
  const rivalPrimero = obtenerRivalChampions(jugador);
  mostrarInstructivoInternacional(jugador, rivalPrimero, "UEFA Champions League", titulo, descripcion, reglas, () => {
    minijuegoChampionsCompleta((resultado) => {
      if (resultado.resultado === "campeon") callback(true, undefined);
      else callback(false, resultado.fase);
    }, jugador);
  });
}

function mostrarChampions(copa, callback) {
  const jugador = Estado.obtener();
  window.CONTEXTO_PARTIDO = { torneo: "UEFA Champions League", fase: "Edición " + copa.año };
  if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];

  jugarChampions((resultado, fase) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Champions", resultado: "campeon" , club: jugador.club });
      jugador.stats.titulos++;
      asegurarPlazaCampeonContinental(jugador, "champions", copa.año);
      asegurarPlazaMundialClubesProximo(jugador, copa.año, "campeon-champions");

      // Clasifica a Mundial de Clubes y a la SuperCopa UEFA del año próximo.
      if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, copa.año);
      const añoProximo = copa.año + 1;
      if (!jugador.copasPendientes.some((c) => c.año === añoProximo && c.tipo === "supercopa-uefa")) {
        jugador.copasPendientes.push({ año: añoProximo, tipo: "supercopa-uefa", rivalId: null, clubId: jugador.club });
      }

      Estado.guardar();
      mostrarCartelInternacional(true, undefined, "Trofeos/UEFAChampions.png");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        callback();
      });
    } else {
      const faseNormalizada = fase || "Fase de Grupos";
      let resumen = faseNormalizada === "Gran Final" ? "subcampeon" : `eliminado_${faseNormalizada}`;
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Champions", resultado: resumen , club: jugador.club });
      Estado.guardar();
      mostrarCartelInternacional(false, faseNormalizada === "Gran Final" ? "Final" : faseNormalizada, "");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        callback();
      });
    }
  }, jugador);
}