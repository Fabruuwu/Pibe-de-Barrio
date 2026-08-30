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
      alert(`¡Mejoraste ${carta.stats.join(" y ")}! Nueva media: ${resultado.media}, Nuevo valor: $${resultado.valor}M`);
    });

    contenedor.appendChild(cartaDiv);
  });

  document.getElementById("modal-cartas").hidden = false;
}

