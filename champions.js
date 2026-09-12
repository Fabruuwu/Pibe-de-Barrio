/**
 * champions.js
 * -----------------------------------------
 * UEFA Champions League: sistema progresivo (toda la copa, como el Mundial
 * de Clubes). Un minijuego distinto por posición, con dificultad creciente
 * desde la Fase de Grupos hasta la Gran Final.
 *
 * Depende de: data.js (CLUBES_POR_DIVISION), estado.js (Estado),
 * minijuegos.js (crearCabeceraMinijuego), copas.js (mostrarInstructivoInternacional,
 * mostrarCartelInternacional, asegurarPlazaCampeonContinental, agendarMundialClubes).
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
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  if (!resLiga) return;
  const añoProximo = añoActual + 1;
  const posicion = Number(resLiga.posicion);
  const clasifica = resLiga.esCampeon || (Number.isFinite(posicion) && posicion >= 1 && posicion <= 4);
  if (clasifica && !jugador.copasPendientes.some((c) => c.año === añoProximo && c.tipo === "champions")) {
    jugador.copasPendientes.push({ año: añoProximo, tipo: "champions", rivalId: null, clubId: jugador.club });
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
// SUPERCOPA UEFA (versión inicial: un solo partido decisivo, en lo que
// se suma la Europa League y su campeón como rival "real")
// ------------------------------------------------------------------
function jugarSuperCopaUEFA(callback, jugador, rival) {
  const etapa = { nombre: "SuperCopa UEFA", fase: "eliminatoria", dificultad: 0.6 };
  window.CONTEXTO_PARTIDO = { torneo: "SuperCopa UEFA", fase: "Partido único" };
  jugarPartidoChampions(jugador, rival, etapa, callback);
}

function mostrarSuperCopaUEFA(copa, callback) {
  const jugador = Estado.obtener();
  const rival = obtenerRivalChampions(jugador);
  mostrarInstructivoInternacional(
    jugador, rival, "SuperCopa UEFA",
    "Duelo de campeones",
    "Ganaste la Champions y ahora te medís a cara de perro por la SuperCopa UEFA.",
    ["Es un solo partido, no hay revancha.", "Usá el mismo minijuego de tu posición.", "Ganalo y sumás otro título a la vitrina."],
    () => {
      jugarSuperCopaUEFA((exito) => {
        if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
        jugador.resultadosInternacionales.push({ año: copa.año, copa: "SuperCopa UEFA", resultado: exito ? "campeon" : "subcampeon" , club: jugador.club });
        if (exito) jugador.stats.titulos++;
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