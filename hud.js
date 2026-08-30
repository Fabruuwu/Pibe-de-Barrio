document.addEventListener("DOMContentLoaded", () => {
  const jugador = Estado.cargar();
  if (jugador) pintarHUD(jugador);
  document.dispatchEvent(new CustomEvent("hud:listo", { detail: jugador }));
});

const NOMBRES_PAISES = {};
const PAISES_POR_ID = {};
if (typeof PAISES !== "undefined") {
  PAISES.forEach((p) => {
    NOMBRES_PAISES[p.id] = p.nombre;
    PAISES_POR_ID[p.id] = p;
  });
}
const NOMBRES_CLUBES = {};
if (typeof CLUBES_POR_DIVISION !== "undefined") {
  Object.values(CLUBES_POR_DIVISION).flat().forEach((c) => (NOMBRES_CLUBES[c.id] = c));
}
const NOMBRES_LIGAS = {};
if (typeof LIGAS_POR_PAIS !== "undefined") {
  Object.values(LIGAS_POR_PAIS).flat().forEach((l) => (NOMBRES_LIGAS[l.id] = l.nombre));
}

const ETAPAS_CARIÑO = [
  { hasta: 19, nombre: "Uno más" },
  { hasta: 39, nombre: "Nose" },
  { hasta: 59, nombre: "Nose" },
  { hasta: 79, nombre: "Nose" },
  { hasta: 99, nombre: "Nose" },
  { hasta: 100, nombre: "Leyenda" },
];

const ESTADOS_SELECCION = {
  "sin-chances": "Sin chances",
  "ojo-puesto": "Ojo puesto",
  "en-carpeta": "En carpeta",
  titular: "Titular",
};

function pintarHUD(jugador) {
  const config = obtenerConfigPosicion(jugador.posicion);
  pintarCabecera(jugador);
  pintarEquipoYLiga(jugador);
  pintarBurbujasSuperiores(jugador, config);
  pintarAtributos(jugador, config);
  pintarBurbujasGlobales(jugador);
  pintarCariño(jugador);
  pintarSeleccion(jugador);
}

function obtenerConfigPosicion(posicion) {
  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[posicion];
  if (!config) {
    console.warn(`No hay configuración cargada para la posición "${posicion}". Asegurate de cargar "posiciones/${posicion}.js"`);
    return { statsSuperiores: [], atributos: [] };
  }
  return config;
}

function pintarCabecera(jugador) {
  document.getElementById("hud-nombre").textContent = jugador.nombre;
  document.getElementById("hud-dorsal").textContent = `#${jugador.dorsal}`;
  document.getElementById("hud-media").textContent = jugador.media;

  const bandera = document.getElementById("hud-bandera");
  const pais = PAISES_POR_ID[jugador.pais];
  bandera.alt = pais ? pais.nombre : "";
  if (pais && pais.bandera) {
    bandera.src = pais.bandera;
    bandera.hidden = false;
    bandera.onerror = () => (bandera.hidden = true);
  } else {
    bandera.hidden = true;
  }
}

function pintarEquipoYLiga(jugador) {
  const club = NOMBRES_CLUBES[jugador.club];
  document.getElementById("hud-club").textContent = club ? club.nombre : "—";
  document.getElementById("hud-año").textContent = jugador.año;
  document.getElementById("hud-edad").textContent = `${jugador.edad} años`;
  document.getElementById("hud-liga").textContent = NOMBRES_LIGAS[jugador.liga] || "—";
  document.getElementById("hud-forma").textContent = "Normal";

  const escudo = document.getElementById("hud-escudo-club");
  if (club && club.escudo) {
    escudo.src = club.escudo;
    escudo.hidden = false;
    escudo.onerror = () => (escudo.hidden = true);
  } else {
    escudo.hidden = true;
  }
}

function pintarBurbujasSuperiores(jugador, config) {
  const contenedor = document.getElementById("hud-stats-superiores");
  contenedor.innerHTML = "";

  const items = [
    ...(config.statsSuperiores || []).map((s) => ({ valor: jugador.stats[s.clave] ?? 0, etiqueta: s.etiqueta })),
    { valor: jugador.stats.partidos ?? 0, etiqueta: "Partidos" },
    { valor: jugador.stats.titulos ?? 0, etiqueta: "Títulos" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--stat")));
}

function pintarAtributos(jugador, config) {
  const contenedor = document.getElementById("hud-atributos");
  contenedor.innerHTML = "";

  const items = [
    ...(config.atributos || []).map((a) => ({ valor: jugador.stats[a.clave] ?? 0, etiqueta: a.etiqueta })),
    { valor: jugador.stats.liderazgo ?? 0, etiqueta: "Liderazgo" },
    { valor: jugador.stats.resistencia ?? 0, etiqueta: "Resistencia" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--atributo")));
}

function pintarBurbujasGlobales(jugador) {
  const contenedor = document.getElementById("hud-globales");
  contenedor.innerHTML = "";

  const items = [
    { valor: formatearDinero(jugador.valor), etiqueta: "Valor" },
    { valor: formatearDinero(jugador.dinero), etiqueta: "Dinero" },
    { valor: "—", etiqueta: "Rival" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--global")));
}

function crearBurbuja(valor, etiqueta, claseExtra) {
  const burbuja = document.createElement("div");
  burbuja.className = `burbuja ${claseExtra}`;
  burbuja.innerHTML = `
    <span class="burbuja__valor">${valor}</span>
    <span class="burbuja__etiqueta">${etiqueta}</span>
  `;
  return burbuja;
}

function formatearDinero(millones) {
  if (millones === undefined || millones === null) return "$0M";
  return `$${millones.toFixed(1)}M`;
}

function pintarCariño(jugador) {
  const cariño = Math.max(0, Math.min(100, jugador.cariño ?? 0));
  const barra = document.getElementById("hud-cariño-barra");
  const etiqueta = document.getElementById("hud-cariño-etiqueta");
  const numero = document.getElementById("hud-cariño-numero");

  barra.style.width = `${cariño}%`;
  numero.textContent = cariño;

  const etapa = ETAPAS_CARIÑO.find((e) => cariño <= e.hasta) || ETAPAS_CARIÑO[ETAPAS_CARIÑO.length - 1];
  etiqueta.textContent = etapa.nombre;
}

function pintarSeleccion(jugador) {
  const bandera = document.getElementById("hud-bandera-seleccion");
  const pais = PAISES_POR_ID[jugador.pais];
  bandera.alt = pais ? pais.nombre : "";
  if (pais && pais.bandera) {
    bandera.src = pais.bandera;
    bandera.hidden = false;
    bandera.onerror = () => (bandera.hidden = true);
  } else {
    bandera.hidden = true;
  }

  document.getElementById("hud-estado-seleccion").textContent = ESTADOS_SELECCION[jugador.seleccion] || "Sin chances";
}

function capitalizar(texto) {
  return texto.split("-").map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1)).join("");
}

// Al cargar el HUD, si el jugador no tiene historial de cartas, mostramos el modal
// (Por ahora solo se muestra la primera vez, pero cuando tengamos ciclo de años, llamaremos a esta función cada año)
function abrirModalCartas() {
  const cartas = generarCartas();
  const contenedor = document.getElementById("contenedor-cartas");
  contenedor.innerHTML = "";

  cartas.forEach((carta, index) => {
    const cartaDiv = document.createElement("div");
    cartaDiv.className = `carta carta--${carta.rareza}`;
    cartaDiv.innerHTML = `
      <div class="carta__etiqueta">${RAREZAS[carta.rareza].nombre}</div>
      <h3 class="carta__nombre">${carta.nombre}</h3>
      <p class="carta__desc">${carta.desc}</p>
      <div class="carta__stats">${carta.stats.map(s => `${s} +${carta.puntos}`).join(" · ")}</div>
    `;

    cartaDiv.addEventListener("click", () => {
      const resultado = aplicarCarta(Estado.obtener(), carta);
      // Actualizamos el HUD con los nuevos stats
      pintarHUD(Estado.obtener());
      // Cerramos modal
      document.getElementById("modal-cartas").hidden = true;
      mostrarEvento();  // <-- Ahora sí existe
    });

    contenedor.appendChild(cartaDiv);
  });

  document.getElementById("modal-cartas").hidden = false;
}

// ========== FUNCIÓN FALTANTE: mostrarEvento ==========
function mostrarEvento() {
  const contenedor = document.getElementById("evento-container");
  if (!contenedor) return;

  const evento = generarEvento();
  contenedor.innerHTML = `
    <h3 class="evento-titulo">${evento.titulo}</h3>
    <p class="evento-descripcion">${evento.descripcion}</p>
    <div class="evento-opciones"></div>
  `;

  const opcionesDiv = contenedor.querySelector(".evento-opciones");

  evento.opciones.forEach((opcion, index) => {
    const boton = document.createElement("button");
    boton.className = "evento-opcion";
    boton.textContent = opcion.texto;
    boton.addEventListener("click", () => {
      const mensaje = aplicarEvento(Estado.obtener(), evento, index);
      pintarHUD(Estado.obtener());
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      mostrarResumenAnual(); // <-- Ahora pasa al resumen
    });
    opcionesDiv.appendChild(boton);
  });

  contenedor.hidden = false;
}
// ======================================================

function mostrarResumenAnual() {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("resumen-container");
  if (!contenedor) return;

  const año = jugador.año;
  const temporada = jugador.temporada;

  // Si no hay stats anuales (primera vez), las generamos
  if (jugador.statsAnuales.partidos === 0) {
    jugador.statsAnuales.partidos = Math.floor(Math.random() * 20) + 10; // 10-30
    jugador.statsAnuales.goles = Math.floor(Math.random() * 5); // 0-5
    jugador.statsAnuales.asistencias = Math.floor(Math.random() * 6); // 0-6
    jugador.statsAnuales.nota = (Math.random() * 2 + 5.5).toFixed(1); // 5.5-7.5
    const valor = jugador.valor || 1;
    jugador.statsAnuales.dinero = Math.floor(valor * 0.02 * 1000) + "K";
  }

  const tituloResumen = "¿Y EL GOL?";
  const textoResumen = `Temporada seca de ${jugador.nombre} en ${obtenerNombreClub(jugador.club)}: apenas ${jugador.statsAnuales.goles} goles. Las críticas crecen.`;

  const posicion = "2°";
  const decisiones = (jugador.historialEventos && jugador.historialEventos.length > 0)
    ? jugador.historialEventos.slice(-3).join("\n")
    : "Sin decisiones relevantes este año.";

  const club = NOMBRES_CLUBES[jugador.club];
  const escudoSrc = club && club.escudo ? club.escudo : "";

  contenedor.innerHTML = `
    <div class="resumen-header">
      <span class="resumen-titulo">Resumen Anual</span>
      <span class="resumen-año">Año ${año} - Temporada ${temporada}</span>
    </div>
    <div>
      <h4 class="resumen-texto-titulo">${tituloResumen}</h4>
      <p class="resumen-texto">${textoResumen}</p>
    </div>
    <div class="resumen-club">
      <img src="${escudoSrc}" alt="Escudo" onerror="this.hidden=true">
      <div>
        <div class="resumen-club-nombre">${club ? club.nombre : "Club"}</div>
        <div class="resumen-club-pos">${posicion} en la Liga</div>
      </div>
    </div>
    <div class="resumen-stats">
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.partidos}</span><span class="resumen-stat-label">Partidos</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.goles}</span><span class="resumen-stat-label">Goles</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.asistencias}</span><span class="resumen-stat-label">Asistencias</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.nota}</span><span class="resumen-stat-label">Nota</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.dinero}</span><span class="resumen-stat-label">Dinero</span></div>
    </div>
    <div class="resumen-decisiones">
      <strong>Decisiones del año:</strong><br>
      ${decisiones.replace(/\n/g, '<br>')}
    </div>
    <button class="resumen-boton" id="boton-siguiente-ano">Siguiente año ➡</button>
  `;

  contenedor.hidden = false;

  document.getElementById("boton-siguiente-ano").addEventListener("click", () => {
    Estado.avanzarTemporada();

    if (Estado.obtener().retirado) {
      alert(`¡Carrera terminada! Te retiraste a los ${Estado.obtener().edad} años por edad.`);
      // Aquí podrías redirigir al resumen final (fase 3)
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      return;
    }

    contenedor.innerHTML = "";
    contenedor.hidden = true;

    pintarHUD(Estado.obtener());
    abrirModalCartas();
  });
}

// Función auxiliar para obtener nombre del club
function obtenerNombreClub(idClub) {
  const club = NOMBRES_CLUBES[idClub];
  return club ? club.nombre : "Club";
}