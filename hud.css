/**
 * hud.js
 * -----------------------------------------
 * Pinta la pantalla de juego (HUD) a partir de Estado.obtener().
 * No decide nada de gameplay: solo toma números y los muestra.
 * -----------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  // Si venimos del menú (formulario enviado), inicializamos acá.
  // Si esta página se abre suelta para probar el HUD, Estado.cargar()
  // arma un jugador de prueba solo.
  const jugador = Estado.cargar();
  if (jugador) pintarHUD(jugador);

  // Botón rojo de retiro: lo maneja retiro.js, pero le avisamos
  // acá que puede engancharse (evita depender del orden de <script>).
  document.dispatchEvent(new CustomEvent("hud:listo", { detail: jugador }));
});

// Diccionario de nombres para los datos "crudos" (id -> texto legible).
// Por ahora alcanza con lo que ya usa el menú.
const NOMBRES_PAISES = {};
if (typeof PAISES !== "undefined") {
  PAISES.forEach((p) => (NOMBRES_PAISES[p.id] = p.nombre));
}
const NOMBRES_CLUBES = {};
if (typeof CLUBES_POR_DIVISION !== "undefined") {
  Object.values(CLUBES_POR_DIVISION)
    .flat()
    .forEach((c) => (NOMBRES_CLUBES[c.id] = c));
}
const NOMBRES_LIGAS = {};
if (typeof LIGAS_POR_PAIS !== "undefined") {
  Object.values(LIGAS_POR_PAIS)
    .flat()
    .forEach((l) => (NOMBRES_LIGAS[l.id] = l.nombre));
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
    console.warn(`No hay configuración cargada para la posición "${posicion}".`);
    return { statsSuperiores: [], atributos: [] };
  }
  return config;
}

// ---------------------------------------
// CABECERA (nombre, dorsal, media, equipo, año, edad, liga, forma)
// ---------------------------------------

function pintarCabecera(jugador) {
  document.getElementById("hud-nombre").textContent = jugador.nombre;
  document.getElementById("hud-dorsal").textContent = `#${jugador.dorsal}`;
  document.getElementById("hud-media").textContent = jugador.media;

  const bandera = document.getElementById("hud-bandera");
  bandera.alt = NOMBRES_PAISES[jugador.pais] || "";
  // Misma convención de rutas que ya usa el menú para banderas/escudos.
  bandera.src = `Imagenes/Banderas/${capitalizar(jugador.pais)}.png`;
  bandera.onerror = () => (bandera.hidden = true);
}

function pintarEquipoYLiga(jugador) {
  const club = NOMBRES_CLUBES[jugador.club];
  document.getElementById("hud-club").textContent = club ? club.nombre : "—";
  document.getElementById("hud-año").textContent = jugador.año;
  document.getElementById("hud-edad").textContent = `${jugador.edad} años`;
  document.getElementById("hud-liga").textContent = NOMBRES_LIGAS[jugador.liga] || "—";
  document.getElementById("hud-forma").textContent = "Normal"; // placeholder hasta tener mecánica de forma

  const escudo = document.getElementById("hud-escudo-club");
  if (club && club.escudo) {
    escudo.src = club.escudo;
    escudo.hidden = false;
    escudo.onerror = () => (escudo.hidden = true);
  } else {
    escudo.hidden = true;
  }
}

// ---------------------------------------
// BURBUJAS DE ESTADÍSTICAS
// ---------------------------------------

function pintarBurbujasSuperiores(jugador, config) {
  const contenedor = document.getElementById("hud-stats-superiores");
  contenedor.innerHTML = "";

  const items = [
    ...config.statsSuperiores.map((s) => ({
      valor: jugador.stats[s.clave] ?? 0,
      etiqueta: s.etiqueta,
    })),
    { valor: jugador.stats.partidos ?? 0, etiqueta: "Partidos" },
    { valor: jugador.stats.titulos ?? 0, etiqueta: "Títulos" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--stat")));
}

function pintarAtributos(jugador, config) {
  const contenedor = document.getElementById("hud-atributos");
  contenedor.innerHTML = "";

  const items = [
    ...config.atributos.map((a) => ({
      valor: jugador.stats[a.clave] ?? 0,
      etiqueta: a.etiqueta,
    })),
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

// ---------------------------------------
// BARRA DE CARIÑO
// ---------------------------------------

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

// ---------------------------------------
// SELECCIÓN NACIONAL
// ---------------------------------------

function pintarSeleccion(jugador) {
  const bandera = document.getElementById("hud-bandera-seleccion");
  bandera.src = `Imagenes/Banderas/${capitalizar(jugador.pais)}.png`;
  bandera.onerror = () => (bandera.hidden = true);

  document.getElementById("hud-estado-seleccion").textContent =
    ESTADOS_SELECCION[jugador.seleccion] || "Sin chances";
}

// ---------------------------------------
// UTILIDAD
// ---------------------------------------

function capitalizar(texto) {
  return texto
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join("");
}