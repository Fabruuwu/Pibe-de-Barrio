/**
 * copasselecciones.js
 * -----------------------------------------
 * Sistema de competiciones de Selecciones: Copa América, Finalissima
 * y la Copa Mundial. Todas comparten la misma base:
 * 1) Convocatoria (RNG por media) -> ¿te llaman para esta competencia?
 * 2) Si te llaman, se juega la competencia puntual con su propia lógica.
 *
 * Depende de: data.js, estado.js, clasificacionClubes.js (para el estilo
 * de multiplicador por tamaño), crearCabeceraMinijuego (hud/minijuegos).
 * -----------------------------------------
 */

// ============================================
// CLASIFICACIÓN DE SELECCIONES POR TAMAÑO
// -----------------------------------------
// Mismo criterio que los clubes: grande x1, mediana x2, chica x3, diminuta x4.
// Completá/ajustá esta tabla con más países a medida que haga falta;
// cualquier país no listado cae en "chica" por defecto.
// ============================================
const CLASIFICACION_SELECCIONES = {
  // Grande
  argentina: "grande",
  brasil: "grande",
  alemania: "grande",
  espana: "grande",
  francia: "grande",
  inglaterra: "grande",
  italia: "grande",
  portugal: "grande",
  "paises-bajos": "grande",
  belgica: "grande",

  // Mediana
  uruguay: "mediana",
  colombia: "mediana",
  mexico: "mediana",
  "estados-unidos": "mediana",
  canada: "mediana",
  croacia: "mediana",
  suiza: "mediana",
  dinamarca: "mediana",
  polonia: "mediana",
  austria: "mediana",
  suecia: "mediana",
  turquia: "mediana",
  serbia: "mediana",
  marruecos: "mediana",
  senegal: "mediana",
  japon: "mediana",
  "corea-del-sur": "mediana",
  iran: "mediana",

  // Chica
  chile: "chica",
  ecuador: "chica",
  paraguay: "chica",
  peru: "chica",
  venezuela: "chica",
  "costa-rica": "chica",
  panama: "chica",
  jamaica: "chica",
  honduras: "chica",
  "trinidad-y-tobago": "chica",
  egipto: "chica",
  tunez: "chica",
  nigeria: "chica",
  ghana: "chica",
  argelia: "chica",
  camerun: "chica",
  sudafrica: "chica",
  "costa-de-marfil": "chica",
  noruega: "chica",
  escocia: "chica",
  grecia: "chica",
  rumania: "chica",
  gales: "chica",
  hungria: "chica",
  islandia: "chica",
  "bosnia-y-herzegovina": "chica",
  australia: "chica",
  "arabia-saudita": "chica",

  // Diminuta
  bolivia: "diminuta",
  catar: "diminuta",
  uzbekistan: "diminuta",
  irak: "diminuta",
  jordania: "diminuta",
  indonesia: "diminuta",
  "nueva-zelanda": "diminuta",

  // Cualquier país nuevo que se agregue a data.js y no esté acá
  // cae en "diminuta" por el fallback de obtenerTamanoSeleccion().
};

function obtenerTamanoSeleccion(idPais) {
  return CLASIFICACION_SELECCIONES[idPais] || "diminuta";
}

function obtenerMultiplicadorSeleccion(idPais) {
  const tamano = obtenerTamanoSeleccion(idPais);
  return MULTIPLICADOR_POR_TAMANO[tamano] || 3;
}

// ============================================
// CONVOCATORIA (genérica para cualquier competencia de selecciones)
// ============================================

function probabilidadConvocatoriaPorMedia(media) {
  if (media <= 60) return 0;
  if (media <= 79) return 25;
  if (media <= 90) return 50;
  if (media <= 95) return 75;
  return 100; // 96-109
}

/**
 * Sortea si el jugador es convocado para una competencia puntual.
 * Guarda el resultado en jugador.convocatoriasSelecciones para no
 * volver a sortear la misma competencia/año si se llama 2 veces.
 */
function sortearConvocatoria(jugador, competencia, año) {
  if (!Array.isArray(jugador.convocatoriasSelecciones)) jugador.convocatoriasSelecciones = [];
  let registro = jugador.convocatoriasSelecciones.find(c => c.competencia === competencia && c.año === año);
  if (registro) return registro.convocado;

  const probabilidad = probabilidadConvocatoriaPorMedia(jugador.media || 0);
  const convocado = Math.random() * 100 < probabilidad;
  jugador.convocatoriasSelecciones.push({ competencia, año, convocado, probabilidad, resuelto: false });
  Estado.guardar();
  return convocado;
}

function obtenerMensajeNoConvocado(competencia, año) {
  return `No fuiste convocado por tu selección para jugar ${competencia} ${año}`;
}

// ============================================
// COPA AMÉRICA
// -----------------------------------------
// Se juega en 2027 y luego cada 4 años (2031, 2035, ...).
// Estructura simplificada: solo se define si tu selección llega a la
// final (RNG por tamaño + bonus por media) y ahí se juega el minijuego.
// ============================================

function esAnioCopaAmerica(año) {
  return año >= 2027 && (año - 2027) % 4 === 0;
}

function bonusMediaCopaAmerica(media) {
  if (media <= 65) return 5;
  if (media <= 80) return 10;
  if (media <= 95) return 15;
  return 20; // 96-109
}

function probabilidadLlegarFinalCopaAmerica(idPais, media) {
  const base = { grande: 60, mediana: 40, chica: 20, diminuta: 10 }[obtenerTamanoSeleccion(idPais)];
  return Math.min(99, base + bonusMediaCopaAmerica(media || 0));
}

/**
 * Llamar una vez por año (por ejemplo al procesar el resumen anual).
 * Si corresponde Copa América ese año, resuelve convocatoria + si llega
 * a la final, y deja todo listo en jugador.copaAmericaPendiente para
 * que se muestre el minijuego (mostrarCopaAmerica) al arrancar el año
 * que viene, y deja el mensaje correspondiente para el resumen del año.
 */
function prepararCopaAmerica(jugador, año) {
  if (!esAnioCopaAmerica(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some(r => r.competencia === "Copa América" && r.año === año)) return;

  const convocado = sortearConvocatoria(jugador, "Copa América", año);
  if (!convocado) {
    jugador.resultadosSelecciones.push({
      competencia: "Copa América", año, resultado: "no-convocado",
      mensajeResumen: obtenerMensajeNoConvocado("Copa América", año)
    });
    Estado.guardar();
    return;
  }

  const probabilidad = probabilidadLlegarFinalCopaAmerica(jugador.pais, jugador.media);
  const llegaFinal = Math.random() * 100 < probabilidad;

  if (!llegaFinal) {
    const instancias = ["Fase de grupos", "Cuartos de final", "Semifinal"];
    const instancia = instancias[Math.floor(Math.random() * instancias.length)];
    jugador.resultadosSelecciones.push({
      competencia: "Copa América", año, resultado: `eliminado_${instancia}`,
      mensajeResumen: `Has quedado eliminado de la Copa América en ${instancia}`
    });
    Estado.guardar();
    return;
  }

  // Llega a la final: se juega al arranque del año siguiente.
  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({ competencia: "Copa América", año, jugado: false });
  Estado.guardar();
}

/** Devuelve el mensaje de resumen (si existe) para esa competencia/año. */
function obtenerMensajeSeleccionResumen(jugador, competencia, año) {
  const registro = (jugador.resultadosSelecciones || []).find(r => r.competencia === competencia && r.año === año);
  return registro ? registro.mensajeResumen : null;
}

/**
 * Llamar al arrancar cada temporada (junto a mostrarGalaBalonDeOro,
 * mostrarGalaBotaDeOro, etc). Si hay una final de Copa América pendiente
 * de jugarse, la muestra y devuelve true.
 */
function mostrarCopaAmerica(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    c => c.competencia === "Copa América" && !c.jugado
  );
  if (!pendiente) return false;

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card">
      <span class="badge-copa">COPA AMÉRICA ${pendiente.año}</span>
      <h2>🏆 Copa América (Final Directa)</h2>
      <p>Fricción, pierna fuerte y mucho potrero. Un solo partido donde gana el que tiene más garra.</p>
      <button class="boton-jugar-minijuego" id="iniciar-final-copa-america">Jugar la final</button>
    </div>`;

  contenedor.querySelector("#iniciar-final-copa-america").onclick = () => {
    const juegos = {
      delantero: minijuegoAPuraPotencia,
      enganche: minijuegoPaseATresDedos,
      central: minijuegoMarcaAsfixiante,
      arquero: minijuegoGuerraPsicologica
    };
    const jugarMinijuego = juegos[jugador.posicion] || minijuegoAPuraPotencia;
    jugarMinijuego((gano) => resolverCopaAmerica(pendiente, gano, alTerminar));
  };
  return true;
}

function resolverCopaAmerica(pendiente, gano, alTerminar) {
  const jugador = Estado.obtener();
  pendiente.jugado = true;
  pendiente.gano = gano;

  const registro = {
    competencia: "Copa América",
    año: pendiente.año,
    resultado: gano ? "campeon" : "subcampeon",
    pais: jugador.pais,
    mensajeResumen: gano
      ? `¡Campeón de la Copa América ${pendiente.año}!`
      : "Subcampeón de la Copa América"
  };
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push(registro);
  Estado.guardar();

  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = gano
    ? `<div class="competition-card campeon">
         <h2>¡CAMPEÓN DE LA COPA AMÉRICA ${pendiente.año}!</h2>
         <img src="Trofeos/CopaAmerica.png" alt="Copa América">
         <p>Le diste una alegría enorme a todo tu país. El continente entero habla de vos.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`
    : `<div class="competition-card subcampeon">
         <h2>Subcampeón de la Copa América ${pendiente.año}</h2>
         <p>Llegaste a la final y peleaste hasta el final, pero no alcanzó. El continente reconoce igual tu nivel.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// MINIJUEGOS DE LA FINAL DE COPA AMÉRICA
// ============================================

function tarjetaCopaAmerica(titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <h3>${titulo}</h3>
      <p>${descripcion}</p>
      ${cuerpo}
    </div>`;
  return contenedor;
}

// Delantero: "A Pura Potencia" — llenar barra de fuerza a clics, luego
// reaccionar al botón de Tiro que aparece medio segundo.
function minijuegoAPuraPotencia(callback) {
  const contenedor = tarjetaCopaAmerica(
    "A Pura Potencia",
    "El central te está agarrando de la camiseta. Hacé clic bien rápido para llenar la barra de Fuerza y sacártelo de encima.",
    `<div class="barra-qte"><div class="barra-progreso" id="potencia-barra"></div></div>
     <button class="boton-jugar-minijuego" id="potencia-clic">¡Forcejeá!</button>
     <div id="potencia-tiro-zona" hidden></div>`
  );
  const barra = contenedor.querySelector("#potencia-barra");
  const boton = contenedor.querySelector("#potencia-clic");
  let fuerza = 0;
  const necesaria = 100;

  boton.onclick = () => {
    fuerza = Math.min(necesaria, fuerza + numeroAleatorioSel(6, 10));
    barra.style.width = `${fuerza}%`;
    if (fuerza >= necesaria) {
      boton.remove();
      lanzarFaseTiro();
    }
  };

  function lanzarFaseTiro() {
    const zona = contenedor.querySelector("#potencia-tiro-zona");
    zona.hidden = false;
    zona.innerHTML = `<p>¡Preparate para el tiro!</p>`;
    const demora = 600 + Math.random() * 1200;
    setTimeout(() => {
      const boton = document.createElement("button");
      boton.className = "boton-jugar-minijuego";
      boton.textContent = "¡TIRO!";
      zona.appendChild(boton);
      let resuelto = false;
      const vencido = setTimeout(() => { if (!resuelto) { resuelto = true; callback(false); } }, 500);
      boton.onclick = () => {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(vencido);
        callback(true);
      };
    }, demora);
  }
}

// Enganche: "Pase a Tres Dedos" — pasar por nodos en orden sin tocar
// las zonas de los defensores (reutiliza la mecánica de arrastre).
function minijuegoPaseATresDedos(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Pase a Tres Dedos",
    "Dibujá con el mouse una trayectoria curva que esquive a los defensores y llegue limpia hasta tu compañero.",
    `<button class="boton-jugar-minijuego" id="pase-empezar">Empezar</button>
     <div class="mundial-nodos" id="pase-zona" hidden></div>`
  );
  contenedor.querySelector("#pase-empezar").onclick = () => {
    const zona = contenedor.querySelector("#pase-zona");
    zona.hidden = false;
    zona.style.touchAction = "none";

    // Origen (vos) y destino (compañero) fijos; 3 defensores en el medio.
    const inicio = document.createElement("span");
    inicio.className = "mundial-nodo completado";
    inicio.style.left = "6%"; inicio.style.top = "50%";
    inicio.textContent = "●";
    const destino = document.createElement("button");
    destino.className = "mundial-nodo";
    destino.style.left = "90%"; destino.style.top = "50%";
    destino.textContent = "★";
    zona.append(inicio, destino);

    for (let i = 0; i < 3; i++) {
      const defensor = document.createElement("span");
      defensor.className = "mundial-zona-roja";
      defensor.style.left = `${25 + i * 22}%`;
      defensor.style.top = `${20 + Math.random() * 55}%`;
      zona.appendChild(defensor);
    }

    let dibujando = false, activo = true;
    zona.onpointerdown = (e) => { dibujando = true; try { zona.setPointerCapture(e.pointerId); } catch (_) {} };
    zona.onpointerup = () => { dibujando = false; };
    zona.onpointercancel = () => { dibujando = false; };
    zona.onpointermove = (e) => {
      if (!dibujando || !activo) return;
      const objetivo = document.elementFromPoint(e.clientX, e.clientY);
      if (objetivo?.classList.contains("mundial-zona-roja")) { activo = false; return callback(false); }
      if (objetivo === destino) { activo = false; return callback(true); }
    };
    // Si tarda demasiado, se considera fallado (el defensor te alcanza).
    setTimeout(() => { if (activo) { activo = false; callback(false); } }, 6000);
  };
}

// Central: "Marca Asfixiante" — mantener el cursor centrado 4 segundos
// mientras el rival empuja el indicador hacia un lado al azar.
function minijuegoMarcaAsfixiante(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Marca Asfixiante",
    "El delantero rival te empuja de un lado a otro. Movete en la dirección contraria para mantener el cursor en la franja verde central durante 4 segundos.",
    `<button class="boton-jugar-minijuego" id="marca-empezar">Empezar</button>
     <div class="mundial-tracking" id="marca-zona" hidden>
       <div class="barra-qte"><div class="barra-progreso" id="marca-barra-tiempo"></div></div>
       <div style="position:relative;height:60px;background:#1a1f2e;border-radius:8px;margin-top:10px;">
         <div style="position:absolute;left:40%;width:20%;height:100%;background:rgba(80,200,120,.35);"></div>
         <span id="marca-cursor" style="position:absolute;top:50%;left:50%;width:14px;height:14px;background:#f5c542;border-radius:50%;transform:translate(-50%,-50%);"></span>
       </div>
     </div>`
  );
  contenedor.querySelector("#marca-empezar").onclick = () => {
    const zona = contenedor.querySelector("#marca-zona");
    zona.hidden = false;
    const cursor = contenedor.querySelector("#marca-cursor");
    const barraTiempo = contenedor.querySelector("#marca-barra-tiempo");
    let posicion = 50; // 0-100, centro = 50, verde entre 40-60
    let empuje = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.5);
    let mouseX = 0;
    let activo = true;
    const inicio = Date.now();
    const DURACION = 4000;

    zona.onpointermove = (e) => {
      const rect = zona.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100 - 50; // -50 a 50 relativo al centro
    };

    const tick = () => {
      if (!activo) return;
      if (Math.random() < 0.02) empuje = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 1.2);
      // El empuje te aleja del centro; el mouse (contrario) te devuelve.
      posicion += empuje - mouseX * 0.08;
      posicion = Math.max(0, Math.min(100, posicion));
      cursor.style.left = `${posicion}%`;

      const dentro = posicion >= 40 && posicion <= 60;
      const transcurrido = Date.now() - inicio;
      barraTiempo.style.width = `${Math.min(100, (transcurrido / DURACION) * 100)}%`;

      if (!dentro) { activo = false; return callback(false); }
      if (transcurrido >= DURACION) { activo = false; return callback(true); }
      requestAnimationFrame(tick);
    };
    tick();
  };
}

// Arquero: "Guerra Psicológica" — leer el amague: una flecha titila en
// verde 0.3s antes del disparo; hay que esperarla y no anticiparse antes de tiempo.
function minijuegoGuerraPsicologica(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Guerra Psicológica",
    "Tanda de penales definitoria. Una de las flechas va a titilar en verde por 0.3 segundos justo antes del disparo. Esperá la luz y elegí ese lado.",
    `<button class="boton-jugar-minijuego" id="penal-empezar">Empezar</button>
     <div id="penal-zona" hidden style="display:flex;gap:24px;justify-content:center;margin-top:16px;">
       <button class="mundial-nodo" id="penal-izq" style="position:static;width:70px;height:70px;font-size:28px;">⬅</button>
       <button class="mundial-nodo" id="penal-der" style="position:static;width:70px;height:70px;font-size:28px;">➡</button>
     </div>`
  );
  contenedor.querySelector("#penal-empezar").onclick = () => {
    const zona = contenedor.querySelector("#penal-zona");
    zona.hidden = false;
    const izq = contenedor.querySelector("#penal-izq");
    const der = contenedor.querySelector("#penal-der");
    let ladoCorrecto = null;
    let activo = true;
    let elegido = false;

    const resolver = (lado) => {
      if (!activo || elegido) return;
      elegido = true;
      activo = false;
      callback(lado === ladoCorrecto);
    };
    izq.onclick = () => resolver("izq");
    der.onclick = () => resolver("der");

    // Demora aleatoria antes del amague, y luego 0.3s de "luz verde".
    setTimeout(() => {
      if (!activo) return;
      ladoCorrecto = Math.random() < 0.5 ? "izq" : "der";
      const boton = ladoCorrecto === "izq" ? izq : der;
      boton.classList.add("completado");
      setTimeout(() => boton.classList.remove("completado"), 300);
      // Si no eligió durante la ventana ni un poco después, se le escapa el penal.
      setTimeout(() => { if (!elegido) resolver(null); }, 900);
    }, 800 + Math.random() * 1200);
  };
}

function numeroAleatorioSel(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// FINALISSIMA
// -----------------------------------------
// Enfrenta al campeón de la Copa América contra el campeón de la
// Eurocopa. Se juega el mismo año del Mundial de Selecciones, antes
// del Mundial. Solo es relevante si tu selección ganó la copa
// continental que le corresponde a su confederación.
// (La Eurocopa todavía no está implementada como competencia jugable;
// el gancho para CONMEBOL/CONCACAF -> UEFA ya funciona hoy mismo, y el
// de UEFA -> CONMEBOL/CONCACAF queda listo para cuando se sume.)
// ============================================

function esAnioMundialSelecciones(año) {
  // Ediciones: 2030, 2034, 2038... Ajustá el año base si hace falta.
  return año >= 2030 && (año - 2030) % 4 === 0;
}

function esConfederacionAmericana(confederacion) {
  return confederacion === "CONMEBOL" || confederacion === "CONCACAF";
}

function elegirTamanoPorPeso(pesos) {
  const total = Object.values(pesos).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const tamano of Object.keys(pesos)) {
    if (r < pesos[tamano]) return tamano;
    r -= pesos[tamano];
  }
  return Object.keys(pesos)[0];
}

function elegirRivalFinalissima(candidatos) {
  const PESOS_TAMANO_RIVAL = { grande: 60, mediana: 25, chica: 10, diminuta: 5 };
  const tamanoElegido = elegirTamanoPorPeso(PESOS_TAMANO_RIVAL);
  const delTamano = candidatos.filter(p => obtenerTamanoSeleccion(p.id) === tamanoElegido);
  const pool = delTamano.length ? delTamano : candidatos;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

/**
 * Llamar una vez por año (junto a prepararCopaAmerica). Si es año de
 * Mundial de Selecciones y tu selección ganó la copa continental que
 * le toca (Copa América para CONMEBOL/CONCACAF, Eurocopa para UEFA),
 * agenda la Finalissima para jugarse al arranque de ese mismo año.
 */
function prepararFinalissima(jugador, año) {
  if (!esAnioMundialSelecciones(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some(r => r.competencia === "Finalissima" && r.año === año)) return;

  const pais = (typeof PAISES !== "undefined") ? PAISES.find(p => p.id === jugador.pais) : null;
  const confederacion = pais?.confederacion;
  if (!confederacion) return;

  const esAmericano = esConfederacionAmericana(confederacion);
  const esEuropeo = confederacion === "UEFA";
  if (!esAmericano && !esEuropeo) return; // solo relevante si tu confederación juega alguna de las dos copas

  let clasifico = false;
  if (esAmericano) {
    const añoCopaAmerica = año - 3; // edición inmediatamente anterior al Mundial
    clasifico = jugador.resultadosSelecciones.some(
      r => r.competencia === "Copa América" && r.año === añoCopaAmerica && r.resultado === "campeon"
    );
  } else {
    const añoEurocopa = año - 2; // esquema típico: Eurocopa 2 años antes del Mundial
    clasifico = jugador.resultadosSelecciones.some(
      r => r.competencia === "Eurocopa" && r.año === añoEurocopa && r.resultado === "campeon"
    );
  }
  if (!clasifico) return;

  const confederacionesRival = esAmericano ? ["UEFA"] : ["CONMEBOL", "CONCACAF"];
  const candidatos = (typeof PAISES !== "undefined")
    ? PAISES.filter(p => confederacionesRival.includes(p.confederacion) && p.id !== jugador.pais)
    : [];
  const rival = elegirRivalFinalissima(candidatos);

  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({
    competencia: "Finalissima",
    año,
    jugado: false,
    rivalPais: rival?.id || null,
    rivalNombre: rival?.nombre || "el campeón rival",
  });
  Estado.guardar();
}

/**
 * Llamar al arrancar la temporada (junto a mostrarCopaAmerica, antes
 * del Mundial). Si hay una Finalissima pendiente, la muestra y
 * devuelve true.
 */
function mostrarFinalissima(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    c => c.competencia === "Finalissima" && !c.jugado
  );
  if (!pendiente) return false;

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card">
      <span class="badge-copa">FINALISSIMA ${pendiente.año}</span>
      <h2>🌍 Finalissima (Final Directa)</h2>
      <p>Duelo intercontinental contra ${pendiente.rivalNombre}, campeón de la otra confederación. Precisión quirúrgica y técnica depurada.</p>
      <button class="boton-jugar-minijuego" id="iniciar-finalissima">Jugar la final</button>
    </div>`;

  contenedor.querySelector("#iniciar-finalissima").onclick = () => {
    const juegos = {
      delantero: minijuegoVoleaDeOro,
      enganche: minijuegoHuecoTactico,
      central: minijuegoLecturaEuropea,
      arquero: minijuegoBalistica
    };
    const jugarMinijuego = juegos[jugador.posicion] || minijuegoVoleaDeOro;
    jugarMinijuego((gano) => resolverFinalissima(pendiente, gano, alTerminar));
  };
  return true;
}

function resolverFinalissima(pendiente, gano, alTerminar) {
  const jugador = Estado.obtener();
  pendiente.jugado = true;
  pendiente.gano = gano;

  const registro = {
    competencia: "Finalissima",
    año: pendiente.año,
    resultado: gano ? "campeon" : "subcampeon",
    pais: jugador.pais,
    mensajeResumen: gano
      ? `¡Campeón de la Finalissima ${pendiente.año}!`
      : `Subcampeón de la Finalissima ${pendiente.año}`
  };
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push(registro);
  Estado.guardar();

  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = gano
    ? `<div class="competition-card campeon">
         <h2>¡CAMPEÓN DE LA FINALISSIMA ${pendiente.año}!!</h2>
         <img src="Trofeos/Finalissima.png" alt="Finalissima">
         <p>Le ganaste al campeón de la otra confederación en un partidazo intercontinental. Tu selección se corona ante todo el planeta.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`
    : `<div class="competition-card subcampeon">
         <h2>Subcampeón de la Finalissima ${pendiente.año}</h2>
         <p>Peleaste de igual a igual con la otra confederación, pero no alcanzó. Aun así, llegar a esta final ya es un logro enorme.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// MINIJUEGOS DE LA FINALISSIMA
// ============================================

// Delantero: "Volea de Oro" — una sombra en el piso se hace cada vez
// más nítida; hay que patear justo cuando choca con el círculo central.
function minijuegoVoleaDeOro(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Volea de Oro",
    "La pelota viene de un centro. Mirá la sombra en el piso y apretá PATEAR justo cuando choque con el círculo central.",
    `<button class="boton-jugar-minijuego" id="volea-empezar">Empezar</button>
     <div id="volea-zona" hidden style="position:relative;height:160px;margin-top:14px;">
       <span style="position:absolute;left:50%;top:50%;width:60px;height:60px;border:3px solid #f5c542;border-radius:50%;transform:translate(-50%,-50%);"></span>
       <span id="volea-sombra" style="position:absolute;left:50%;top:50%;width:140px;height:140px;border-radius:50%;background:rgba(0,0,0,.35);transform:translate(-50%,-50%);opacity:.15;"></span>
       <button class="boton-jugar-minijuego" id="volea-patear" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);">¡PATEAR!</button>
     </div>`
  );
  contenedor.querySelector("#volea-empezar").onclick = () => {
    const zona = contenedor.querySelector("#volea-zona");
    zona.hidden = false;
    const sombra = contenedor.querySelector("#volea-sombra");
    const inicio = Date.now();
    const DURACION = 1400 + Math.random() * 900; // momento ideal (sombra 100% nítida)
    let resuelto = false;

    const animar = () => {
      if (resuelto) return;
      const t = Math.min(1, (Date.now() - inicio) / DURACION);
      const escala = 1.8 - t * 1.3; // arranca grande y difusa, termina del tamaño del círculo
      sombra.style.opacity = String(0.15 + t * 0.7);
      sombra.style.width = `${140 * escala}px`;
      sombra.style.height = `${140 * escala}px`;
      if (t >= 1) { resuelto = true; return callback(false); } // se pasó del momento, no llegó a patear
      requestAnimationFrame(animar);
    };
    animar();

    contenedor.querySelector("#volea-patear").onclick = () => {
      if (resuelto) return;
      const t = Math.min(1, (Date.now() - inicio) / DURACION);
      resuelto = true;
      callback(t >= 0.85 && t <= 1.02); // ventana de timing cerca del impacto
    };
  };
}

// Enganche: "El Hueco Táctico" — una flecha gira sin parar; hay que
// hacer clic justo cuando apunta a uno de los huecos angostos.
function minijuegoHuecoTactico(callback) {
  const contenedor = tarjetaCopaAmerica(
    "El Hueco Táctico",
    "La flecha gira sin parar alrededor tuyo. Hacé clic justo cuando apunte a uno de los huecos angostos entre los defensores.",
    `<button class="boton-jugar-minijuego" id="hueco-empezar">Empezar</button>
     <div id="hueco-zona" hidden style="position:relative;width:220px;height:220px;margin:14px auto;border-radius:50%;border:2px dashed rgba(255,255,255,.2);">
       <div id="hueco-ventana-1" style="position:absolute;width:26px;height:26px;background:rgba(80,200,120,.4);border-radius:50%;top:50%;left:-13px;transform:translateY(-50%);"></div>
       <div id="hueco-ventana-2" style="position:absolute;width:26px;height:26px;background:rgba(80,200,120,.4);border-radius:50%;top:50%;right:-13px;transform:translateY(-50%);"></div>
       <div id="hueco-flecha" style="position:absolute;left:50%;top:50%;width:100px;height:4px;background:#f5c542;transform-origin:0 50%;"></div>
     </div>
     <button class="boton-jugar-minijuego" id="hueco-clic" hidden>¡Pase!</button>`
  );
  contenedor.querySelector("#hueco-empezar").onclick = () => {
    const zona = contenedor.querySelector("#hueco-zona");
    const flecha = contenedor.querySelector("#hueco-flecha");
    const boton = contenedor.querySelector("#hueco-clic");
    zona.hidden = false;
    boton.hidden = false;
    let angulo = 0;
    let activo = true;
    const velocidad = 6; // grados por frame, "súper rápido"

    const girar = () => {
      if (!activo) return;
      angulo = (angulo + velocidad) % 360;
      flecha.style.transform = `rotate(${angulo}deg)`;
      requestAnimationFrame(girar);
    };
    girar();

    boton.onclick = () => {
      if (!activo) return;
      activo = false;
      // Los huecos están en 0° (derecha) y 180° (izquierda). Tolerancia angular.
      const normalizado = angulo % 180;
      const distancia = Math.min(normalizado, 180 - normalizado);
      callback(distancia <= 12);
    };
  };
}

// Central: "Lectura Europea" — 4 líneas de pase punteadas; un
// indicador (ojos) mira hacia una un segundo antes de soltar la pelota.
function minijuegoLecturaEuropea(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Lectura Europea",
    "El mediocampista rival tiene 4 opciones de pase. Sus ojos van a mirar hacia una un segundo antes de soltarla: hacé clic en esa línea para anticiparte.",
    `<button class="boton-jugar-minijuego" id="lectura-empezar">Empezar</button>
     <div id="lectura-zona" hidden style="position:relative;height:200px;margin-top:14px;">
       <span id="lectura-ojos" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px;">👀</span>
     </div>`
  );
  contenedor.querySelector("#lectura-empezar").onclick = () => {
    const zona = contenedor.querySelector("#lectura-zona");
    zona.hidden = false;
    const posiciones = [
      { x: 10, y: 10 }, { x: 90, y: 10 }, { x: 10, y: 90 }, { x: 90, y: 90 }
    ];
    const lineas = posiciones.map((p, i) => {
      const linea = document.createElement("button");
      linea.className = "mundial-nodo";
      linea.textContent = "→";
      linea.style.left = `${p.x}%`;
      linea.style.top = `${p.y}%`;
      linea.dataset.i = i;
      zona.appendChild(linea);
      return linea;
    });
    let activo = true;
    const objetivo = Math.floor(Math.random() * 4);
    lineas.forEach((linea, i) => {
      linea.onclick = () => {
        if (!activo) return;
        activo = false;
        callback(i === objetivo);
      };
    });
    // Demora antes de la mirada, luego 1 segundo de "aviso" antes del pase.
    setTimeout(() => {
      if (!activo) return;
      const ojos = contenedor.querySelector("#lectura-ojos");
      ojos.style.left = `${posiciones[objetivo].x}%`;
      ojos.style.top = `${posiciones[objetivo].y}%`;
      setTimeout(() => { if (activo) { activo = false; callback(false); } }, 1000);
    }, 800 + Math.random() * 1000);
  };
}

// Arquero: "Balística" — se dibuja media parábola y desaparece; hay
// que hacer clic en el punto exacto donde va a caer la pelota.
function minijuegoBalistica(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Balística",
    "Tiro libre del europeo por encima de la barrera. Se dibuja la trayectoria inicial y desaparece a mitad de camino: hacé clic donde calculás que va a caer.",
    `<button class="boton-jugar-minijuego" id="balistica-empezar">Empezar</button>
     <div id="balistica-zona" hidden style="position:relative;height:180px;margin-top:14px;border-bottom:2px solid rgba(255,255,255,.25);"></div>`
  );
  contenedor.querySelector("#balistica-empezar").onclick = () => {
    const zona = contenedor.querySelector("#balistica-zona");
    zona.hidden = false;

    // Parábola: y = a*(x-h)^2 + k, con caída en algún punto entre 55%-90% del ancho.
    const xCaida = 40 + Math.random() * 45; // % del ancho
    const alturaMax = 60 + Math.random() * 60;
    const a = -alturaMax / Math.pow(xCaida, 2);

    // Dibujo simplificado: puntos visibles solo hasta la mitad del recorrido.
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.position = "absolute";
    svg.style.left = "0"; svg.style.top = "0";
    zona.appendChild(svg);

    function alturaEnX(x) {
      // Parábola normalizada: arranca en (0,100) el "piso", sube y cae en (xCaida,100).
      const progreso = x / xCaida;
      return 100 - Math.sin(Math.min(1, Math.max(0, progreso)) * Math.PI) * alturaMax * (100 / 180);
    }

    let path = "";
    const visibleHasta = xCaida * 0.5;
    for (let x = 0; x <= visibleHasta; x += 2) {
      const y = alturaEnX(x);
      path += (x === 0 ? "M" : "L") + x + "," + y + " ";
    }
    const trazo = document.createElementNS(svgNS, "path");
    trazo.setAttribute("d", path);
    trazo.setAttribute("stroke", "#f5c542");
    trazo.setAttribute("stroke-width", "1.2");
    trazo.setAttribute("fill", "none");
    svg.appendChild(trazo);

    let activo = true;
    zona.onclick = (e) => {
      if (!activo) return;
      activo = false;
      const rect = zona.getBoundingClientRect();
      const xClic = ((e.clientX - rect.left) / rect.width) * 100;
      callback(Math.abs(xClic - xCaida) <= 6);
    };
    setTimeout(() => { if (activo) { activo = false; callback(false); } }, 6000);
  };
}

/**
 * mundial.js
 * -----------------------------------------
 * La Copa Mundial de Selecciones. Se juega en 2030 y luego cada 4 años
 * (reutiliza esAnioMundialSelecciones de copasselecciones.js).
 *
 * Sigue EXACTAMENTE el mismo patrón que ya usa el resto del juego:
 * 1) prepararMundial(jugador, año) se llama al cerrar la temporada
 *    (junto a prepararCopaAmerica/prepararFinalissima en hud.js).
 *    Sortea la convocatoria (sortearConvocatoria, ya genérica) y, si
 *    te llaman, agenda el torneo completo en jugador.copasSeleccionPendientes.
 * 2) mostrarMundial(alTerminar) se llama al arrancar la temporada
 *    siguiente (en la misma cadena que mostrarCopaAmerica/mostrarFinalissima).
 *    A diferencia de esas dos (un solo partido), el Mundial es un
 *    torneo progresivo completo: 3 partidos de grupos + Octavos +
 *    Cuartos + Semifinal + Final, con el mismo criterio de clasificación
 *    que ya se usa en copasinternacionalesclubes.js (ganar 2 de 3 en
 *    grupos, 2 derrotas eliminan directo, en la llave pierde una vez y
 *    quedás afuera).
 *
 * Depende de: data.js (PAISES), estado.js (Estado), clasificacionClubes.js
 * (MULTIPLICADOR_POR_TAMANO), copasselecciones.js (obtenerTamanoSeleccion,
 * elegirTamanoPorPeso, sortearConvocatoria, obtenerMensajeNoConvocado,
 * esAnioMundialSelecciones).
 * -----------------------------------------
 */

const ETAPAS_MUNDIAL = [
  "Fase de Grupos · Partido 1",
  "Fase de Grupos · Partido 2",
  "Fase de Grupos · Partido 3",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final",
];
const ETIQUETAS_FIXTURE_MUNDIAL = ["G1", "G2", "G3", "8vos", "4tos", "Semi", "Final"];

// ============================================
// 1) CONVOCATORIA + SORTEO DEL RIVAL
// ============================================

const PESOS_CONTINENTE_MUNDIAL = { UEFA: 40, CONMEBOL: 25, CONCACAF: 10, AFC: 10, CAF: 10, OFC: 5 };
const PESOS_TAMANO_RIVAL_MUNDIAL = { grande: 55, mediana: 30, chica: 10, diminuta: 5 };

/**
 * Elige el rival del próximo partido: primero el continente (por peso),
 * después el tamaño de selección (por peso), y recién ahí un país al
 * azar que cumpla ambos requisitos. Si no hay ningún país que cumpla
 * exactamente esa combinación, relaja primero el tamaño y, como último
 * recurso, cualquier país de otro continente.
 */
function elegirRivalMundial(jugador) {
  if (typeof PAISES === "undefined") return null;

  const continente = elegirTamanoPorPeso(PESOS_CONTINENTE_MUNDIAL);
  const tamano = elegirTamanoPorPeso(PESOS_TAMANO_RIVAL_MUNDIAL);

  const exacto = PAISES.filter(
    (p) => p.confederacion === continente && obtenerTamanoSeleccion(p.id) === tamano && p.id !== jugador.pais
  );
  if (exacto.length) return exacto[Math.floor(Math.random() * exacto.length)];

  const porContinente = PAISES.filter((p) => p.confederacion === continente && p.id !== jugador.pais);
  if (porContinente.length) return porContinente[Math.floor(Math.random() * porContinente.length)];

  const cualquiera = PAISES.filter((p) => p.id !== jugador.pais);
  return cualquiera[Math.floor(Math.random() * cualquiera.length)] || null;
}

/**
 * Llamar una vez por año (junto a prepararCopaAmerica/prepararFinalissima
 * en mostrarResumenAnual). Si es año de Mundial, sortea si te convocan
 * y, en caso afirmativo, agenda el torneo completo para jugarse al
 * arrancar la temporada siguiente.
 */
function prepararMundial(jugador, año) {
  if (!esAnioMundialSelecciones(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some((r) => r.competencia === "Mundial" && r.año === año)) return;

  const convocado = sortearConvocatoria(jugador, "Mundial", año);
  if (!convocado) {
    jugador.resultadosSelecciones.push({
      competencia: "Mundial",
      año,
      resultado: "no-convocado",
      mensajeResumen: obtenerMensajeNoConvocado("Mundial", año),
    });
    Estado.guardar();
    return;
  }

  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({
    competencia: "Mundial",
    año,
    jugado: false,
    etapaActual: 0,
    partidosGrupo: 0,
    ganadosGrupo: 0,
    perdidosGrupo: 0,
  });
  Estado.guardar();
}

// ============================================
// 2) MOTOR DEL TORNEO
// ============================================

/**
 * Llamar al arrancar la temporada (en la misma cadena que
 * mostrarCopaAmerica/mostrarFinalissima). Si hay un Mundial pendiente,
 * muestra la pantalla de inicio y devuelve true.
 */
function mostrarMundial(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    (c) => c.competencia === "Mundial" && !c.jugado
  );
  if (!pendiente) return false;

  mostrarPortadaMundial(jugador, pendiente, alTerminar);
  return true;
}

function mostrarPortadaMundial(jugador, pendiente, alTerminar) {
  const pais = (typeof PAISES !== "undefined") ? PAISES.find((p) => p.id === jugador.pais) : null;
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card mundial-final-card mundial-portada">
      <span class="badge-copa">WORLD CUP ${pendiente.año}</span>
      <img class="mundial-portada__bandera" src="${pais?.bandera || ""}" alt="" onerror="this.hidden=true">
      <h2>¡Empieza la Copa Mundial!</h2>
      <p>Todo un país detrás tuyo. Siete partidos te separan de la gloria eterna: fase de grupos, octavos, cuartos, semifinal y la final.</p>
      <button class="boton-jugar-minijuego" id="mundial-arrancar">Salir a la cancha</button>
    </div>`;
  contenedor.querySelector("#mundial-arrancar").onclick = () => jugarEtapaMundial(jugador, pendiente, alTerminar);
}

function crearFixtureMundial(pendiente) {
  return `<div class="mundial-fixture">${ETIQUETAS_FIXTURE_MUNDIAL.map((etiqueta, i) => {
    let clase = "mundial-fixture__punto";
    if (i < pendiente.etapaActual) clase += " mundial-fixture__punto--jugado";
    else if (i === pendiente.etapaActual) clase += " mundial-fixture__punto--actual";
    return `<span class="${clase}">${etiqueta}</span>`;
  }).join("")}</div>`;
}

function crearCabeceraMundial(jugador, rival) {
  const miPais = (typeof PAISES !== "undefined") ? PAISES.find((p) => p.id === jugador.pais) : null;
  const contexto = window.CONTEXTO_PARTIDO || {};
  const detalleTorneo = contexto.torneo
    ? `<span class="minijuego-contexto">${contexto.torneo}${contexto.fase ? ` · ${contexto.fase}` : ""}</span>`
    : "";
  return `
    <div class="minijuego-marcador">
      <div class="equipo">
        <img src="${miPais?.bandera || ""}" alt="" onerror="this.hidden=true">
        <span>${miPais ? miPais.nombre : "Tu selección"}</span>
      </div>
      <span class="en-vivo">🔴 EN VIVO</span>
      <div class="equipo">
        <img src="${rival?.bandera || ""}" alt="" onerror="this.hidden=true">
        <span>${rival ? rival.nombre : "Rival"}</span>
      </div>
      ${detalleTorneo}
    </div>
  `;
}

function jugarEtapaMundial(jugador, pendiente, alTerminar) {
  const etapa = ETAPAS_MUNDIAL[pendiente.etapaActual];
  const rival = elegirRivalMundial(jugador);
  const nivel = pendiente.etapaActual <= 2 ? 0 : pendiente.etapaActual <= 4 ? 1 : 2;
  window.CONTEXTO_PARTIDO = { torneo: "Copa Mundial", fase: etapa };

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  const tamanoRival = rival ? obtenerTamanoSeleccion(rival.id) : "?";
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <span class="badge-copa">WORLD CUP ${pendiente.año}</span>
      ${crearFixtureMundial(pendiente)}
      ${crearCabeceraMundial(jugador, rival)}
      <h3>${etapa}</h3>
      <p class="mundial-rival-tag">Rival: ${rival ? rival.nombre : "?"} · Selección ${tamanoRival}</p>
      <button class="boton-jugar-minijuego" id="mundial-jugar-etapa">Jugar</button>
    </div>`;

  contenedor.querySelector("#mundial-jugar-etapa").onclick = () => {
    const juegos = {
      delantero: minijuegoLatidoFinal,
      enganche: minijuegoVisionPanoramica,
      central: minijuegoUltimoHombre,
      arquero: minijuegoManosDeHielo,
    };
    const jugar = juegos[jugador.posicion] || minijuegoLatidoFinal;
    jugar(nivel, (exito) => resolverPartidoMundial(jugador, pendiente, etapa, exito, alTerminar));
  };
}

function resolverPartidoMundial(jugador, pendiente, etapaJugada, exito, alTerminar) {
  const enGrupos = pendiente.etapaActual < 3;

  if (enGrupos) {
    pendiente.partidosGrupo = (pendiente.partidosGrupo || 0) + 1;
    if (exito) pendiente.ganadosGrupo = (pendiente.ganadosGrupo || 0) + 1;
    else pendiente.perdidosGrupo = (pendiente.perdidosGrupo || 0) + 1;
    Estado.guardar();

    if (pendiente.perdidosGrupo >= 2) {
      return finalizarMundial(jugador, pendiente, false, "Fase de Grupos", alTerminar);
    }
    if (pendiente.partidosGrupo >= 3) {
      if (pendiente.ganadosGrupo < 2) {
        return finalizarMundial(jugador, pendiente, false, "Fase de Grupos", alTerminar);
      }
      pendiente.etapaActual = 3; // clasificó: salta directo a Octavos
      Estado.guardar();
      return jugarEtapaMundial(jugador, pendiente, alTerminar);
    }
    pendiente.etapaActual += 1;
    Estado.guardar();
    return jugarEtapaMundial(jugador, pendiente, alTerminar);
  }

  // Mata-mata: una derrota y quedás afuera.
  if (!exito) {
    return finalizarMundial(jugador, pendiente, false, etapaJugada, alTerminar);
  }
  if (etapaJugada === "Final") {
    return finalizarMundial(jugador, pendiente, true, "Final", alTerminar);
  }
  pendiente.etapaActual += 1;
  Estado.guardar();
  jugarEtapaMundial(jugador, pendiente, alTerminar);
}

function finalizarMundial(jugador, pendiente, campeon, etapaFinal, alTerminar) {
  pendiente.jugado = true;
  pendiente.campeon = campeon;

  let resultado;
  let mensajeResumen;
  if (campeon) {
    resultado = "campeon";
    mensajeResumen = `¡Campeón de la World Cup ${pendiente.año}!`;
    jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;
  } else if (etapaFinal === "Final") {
    resultado = "subcampeon";
    mensajeResumen = `Subcampeón de la World Cup ${pendiente.año}`;
  } else {
    resultado = `eliminado_${etapaFinal}`;
    mensajeResumen = `Eliminado de la World Cup ${pendiente.año} en ${etapaFinal}`;
  }

  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push({
    competencia: "Mundial",
    año: pendiente.año,
    resultado,
    pais: jugador.pais,
    mensajeResumen,
  });
  Estado.guardar();

  mostrarCartelResultadoMundial(campeon, etapaFinal, pendiente.año, alTerminar);
}

function mostrarCartelResultadoMundial(campeon, etapaFinal, año, alTerminar) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;

  if (campeon) {
    contenedor.innerHTML = `
      <div class="competition-card campeon mundial-final-card">
        <span class="badge-copa">WORLD CUP ${año}</span>
        <h2>¡CAMPEÓN DE LA WORLD CUP ${año}!!</h2>
        <img src="Trofeos/Mundial.png" alt="Copa del Mundo" onerror="this.hidden=true">
        <p>Tocar el cielo con los dedos es incomparable, trajiste alegría a tu país.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  } else if (etapaFinal === "Final") {
    contenedor.innerHTML = `
      <div class="competition-card subcampeon">
        <h2>Has quedado como Subcampeón de la World Cup ${año}</h2>
        <p>Tan cerca que a la vez se siente tan lejos, duele el doble.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  } else {
    contenedor.innerHTML = `
      <div class="competition-card subcampeon">
        <h2>Eliminado de la World Cup ${año}</h2>
        <p>El sueño mundialista se corta en ${etapaFinal}. Todavía hay revancha dentro de cuatro años.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  }

  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// 3) MINIJUEGOS (uno por posición, 3 niveles de dificultad: 0 grupos,
//    1 octavos/cuartos, 2 semis/final)
// ============================================

function tarjetaMundialMinijuego(titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <span class="badge-copa">WORLD CUP</span>
      <h3>${titulo}</h3>
      <p>${descripcion}</p>
      ${cuerpo}
    </div>`;
  return contenedor;
}

// ---------- DELANTERO: "El Latido Final" ----------
// Una barra cae al ritmo de un latido; hay que reaccionar justo cuando
// cruza la línea. En la final hacen falta 5 aciertos seguidos.
function minijuegoLatidoFinal(nivel, callbackFinal) {
  const necesarios = [1, 3, 5][nivel];
  const contenedor = tarjetaMundialMinijuego(
    "El Latido Final",
    `Presioná ESPACIO (o tocá el botón) justo cuando la barra cruce la línea. Necesitás ${necesarios} acierto${necesarios > 1 ? "s" : ""} seguido${necesarios > 1 ? "s" : ""}.`,
    `<div class="latido-pista"><div class="latido-linea"></div><div class="latido-barra" id="latido-barra"></div></div>
     <button class="boton-jugar-minijuego" id="latido-boton">¡AHORA!</button>
     <p class="minijuego-progreso" id="latido-progreso">Aciertos: 0/${necesarios}</p>`
  );
  const barra = contenedor.querySelector("#latido-barra");
  const boton = contenedor.querySelector("#latido-boton");
  const progresoTxt = contenedor.querySelector("#latido-progreso");

  let aciertos = 0;
  let activo = true;
  let cayendo = false;
  let inicio = 0;
  let duracion = 0;
  let timeoutFallo = null;

  function limpiarYCerrar(exito) {
    activo = false;
    cayendo = false;
    clearTimeout(timeoutFallo);
    document.removeEventListener("keydown", listenerTeclado);
    callbackFinal(exito);
  }

  function nuevaCaida() {
    cayendo = true;
    duracion = nivel === 0 ? 1600 : nivel === 1 ? 950 + Math.random() * 200 : 600 + Math.random() * 220;
    inicio = Date.now();
    barra.style.transition = "none";
    barra.style.top = "0%";
    void barra.offsetWidth; // fuerza el reflow para reiniciar la transición
    barra.style.transition = `top ${duracion}ms linear`;
    requestAnimationFrame(() => {
      barra.style.top = "100%";
    });
    clearTimeout(timeoutFallo);
    timeoutFallo = setTimeout(() => {
      if (activo && cayendo) limpiarYCerrar(false);
    }, duracion + 120);
  }

  function intentar() {
    if (!activo || !cayendo) return;
    cayendo = false;
    clearTimeout(timeoutFallo);
    const transcurrido = Date.now() - inicio;
    const progreso = transcurrido / duracion; // la línea está al 85% del recorrido
    const ventana = nivel === 0 ? 0.16 : nivel === 1 ? 0.11 : 0.08;
    const acierto = Math.abs(progreso - 0.85) <= ventana;

    if (acierto) {
      aciertos++;
      progresoTxt.textContent = `Aciertos: ${aciertos}/${necesarios}`;
      if (aciertos >= necesarios) return limpiarYCerrar(true);
      setTimeout(nuevaCaida, 380);
    } else {
      limpiarYCerrar(false);
    }
  }

  const listenerTeclado = (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      intentar();
    }
  };
  document.addEventListener("keydown", listenerTeclado);
  boton.onclick = intentar;

  nuevaCaida();
}

// ---------- ENGANCHE: "Visión Panorámica" ----------
// Memorizás dónde están tus compañeros (verde) y clickeás esos
// casilleros de memoria. Tocar un rival (rojo) es contragolpe.
function minijuegoVisionPanoramica(nivel, callbackFinal) {
  const tam = [3, 4, 5][nivel];
  const totalCeldas = tam * tam;
  const compañeros = [3, 4, 6][nivel];
  const rivalesCant = [1, 2, 3][nivel];
  const tiempoVer = [1500, 1100, 750][nivel];

  const contenedor = tarjetaMundialMinijuego(
    "Visión Panorámica",
    "Memorizá dónde están tus compañeros (verde). Van a desaparecer: hacé clic en esos casilleros exactos para encadenar los pases. Si tocás una zona roja (rival), es contragolpe.",
    `<div class="vision-grid" id="vision-grid" style="grid-template-columns:repeat(${tam},1fr)"></div>`
  );
  const grid = contenedor.querySelector("#vision-grid");
  const celdas = [];
  for (let i = 0; i < totalCeldas; i++) {
    const celda = document.createElement("button");
    celda.className = "vision-celda";
    celda.type = "button";
    grid.appendChild(celda);
    celdas.push(celda);
  }

  function elegirVarios(cantidad, disponibles) {
    const copia = [...disponibles];
    const elegidos = [];
    for (let k = 0; k < cantidad && copia.length; k++) {
      elegidos.push(copia.splice(Math.floor(Math.random() * copia.length), 1)[0]);
    }
    return elegidos;
  }

  const indices = Array.from({ length: totalCeldas }, (_, i) => i);
  const verdes = elegirVarios(compañeros, indices);
  const restantes = indices.filter((i) => !verdes.includes(i));
  const rojos = elegirVarios(rivalesCant, restantes);

  verdes.forEach((i) => celdas[i].classList.add("vision-celda--verde"));
  rojos.forEach((i) => celdas[i].classList.add("vision-celda--roja-preview"));

  setTimeout(() => {
    celdas.forEach((c) => c.classList.remove("vision-celda--verde", "vision-celda--roja-preview"));
    let restantesVerdes = new Set(verdes);
    let activo = true;

    celdas.forEach((celda, i) => {
      celda.onclick = () => {
        if (!activo) return;
        if (rojos.includes(i)) {
          activo = false;
          celda.classList.add("vision-celda--fallo");
          return callbackFinal(false);
        }
        if (restantesVerdes.has(i)) {
          restantesVerdes.delete(i);
          celda.classList.add("vision-celda--acierto");
          celda.disabled = true;
          if (restantesVerdes.size === 0) {
            activo = false;
            callbackFinal(true);
          }
        } else {
          celda.disabled = true;
        }
      };
    });
  }, tiempoVer);
}

// ---------- CENTRAL: "El Último Hombre" ----------
// El delantero corre hacia la línea de robo. Hay que clickear justo
// cuando la toca. En rondas altas hace amagues que rompen el ritmo.
function minijuegoUltimoHombre(nivel, callbackFinal) {
  const contenedor = tarjetaMundialMinijuego(
    "El Último Hombre",
    "El delantero rival corre hacia vos. Hacé clic justo cuando su pelota toque la línea de robo.",
    `<div class="ultimo-hombre-pista">
       <div class="ultimo-hombre-jugador" id="uh-jugador">⚽</div>
       <div class="ultimo-hombre-linea"></div>
     </div>
     <button class="boton-jugar-minijuego" id="uh-boton">¡QUITE!</button>`
  );
  const jugadorEl = contenedor.querySelector("#uh-jugador");
  const boton = contenedor.querySelector("#uh-boton");

  let pos = 0;
  let velocidad = nivel === 0 ? 0.85 : nivel === 1 ? 1.15 : 1.35;
  let activo = true;
  let resuelto = false;
  const conAmague = nivel >= 1;

  function terminar(exito) {
    if (resuelto) return;
    resuelto = true;
    activo = false;
    callbackFinal(exito);
  }

  function tick() {
    if (!activo) return;
    if (conAmague && Math.random() < (nivel === 1 ? 0.02 : 0.045)) {
      velocidad = Math.random() < 0.5 ? velocidad * 0.15 : velocidad * 2.4;
      setTimeout(() => {
        velocidad = nivel === 1 ? 1.15 : 1.4;
      }, 260);
    }
    pos += velocidad;
    jugadorEl.style.left = `${Math.min(100, pos)}%`;
    if (pos >= 100) {
      terminar(false); // lo dejaste llegar sin marcar
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  boton.onclick = () => {
    if (!activo || resuelto) return;
    const ventana = nivel === 0 ? 7 : nivel === 1 ? 5 : 3.5;
    terminar(Math.abs(pos - 100) <= ventana);
  };
}

// ---------- ARQUERO: "Manos de Hielo" ----------
// Aparecen blancos en el arco: hay que clickearlos antes de que
// desaparezcan. Los marcados con una X roja son amagues (no tocar).
function minijuegoManosDeHielo(nivel, callbackFinal) {
  const necesarios = [3, 4, 5][nivel];
  const simultaneos = [1, 2, 3][nivel];
  const vida = nivel === 0 ? 1300 : nivel === 1 ? 950 : 750;
  const probFalso = nivel === 0 ? 0 : nivel === 1 ? 0.2 : 0.35;

  const contenedor = tarjetaMundialMinijuego(
    "Manos de Hielo",
    "Atajá los remates (círculos) antes de que desaparezcan. Los que tienen una X roja son amagues: si los tocás, te tirás mal y dejás el arco libre.",
    `<div class="hielo-arco" id="hielo-arco"><span class="hielo-contador" id="hielo-contador">0/${necesarios}</span></div>`
  );
  const zona = contenedor.querySelector("#hielo-arco");
  const contadorTxt = contenedor.querySelector("#hielo-contador");

  let atajadas = 0;
  let activas = 0;
  let activo = true;

  function terminar(exito) {
    if (!activo) return;
    activo = false;
    callbackFinal(exito);
  }

  function lanzar() {
    if (!activo || atajadas >= necesarios) return;
    if (activas >= simultaneos) {
      setTimeout(lanzar, 150);
      return;
    }
    activas++;
    const esFalso = Math.random() < probFalso;
    const blanco = document.createElement("button");
    blanco.type = "button";
    blanco.className = `hielo-blanco${esFalso ? " hielo-blanco--falso" : ""}`;
    blanco.textContent = esFalso ? "✕" : "";
    blanco.style.left = `${8 + Math.random() * 78}%`;
    blanco.style.top = `${10 + Math.random() * 70}%`;
    zona.appendChild(blanco);

    const vencido = setTimeout(() => {
      blanco.remove();
      activas--;
      if (!activo) return;
      if (!esFalso) {
        terminar(false); // dejaste pasar un remate real
        return;
      }
      setTimeout(lanzar, 100);
    }, vida);

    blanco.onclick = () => {
      if (!activo) return;
      clearTimeout(vencido);
      blanco.remove();
      activas--;
      if (esFalso) {
        terminar(false); // te tiraste mal con el amague
        return;
      }
      atajadas++;
      contadorTxt.textContent = `${atajadas}/${necesarios}`;
      if (atajadas >= necesarios) {
        terminar(true);
        return;
      }
      setTimeout(lanzar, 120);
    };

    setTimeout(lanzar, nivel === 0 ? 500 : 250);
  }
  lanzar();
}