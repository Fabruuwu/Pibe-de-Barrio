/**
 * posiciones/delantero.js
 * -----------------------------------------
 * Define qué burbujas de estadísticas le corresponden al Delantero.
 * hud.js lee este objeto para saber qué etiquetas y valores mostrar.
 * Cada posición (enganche.js, central.js, arquero.js) va a tener
 * su propio archivo con esta misma forma, así se puede sumar nuevas
 * mecánicas por posición sin tocar a las demás.
 * -----------------------------------------
 */

const CONFIG_DELANTERO = {
  posicion: "delantero",

  // Las 2 burbujas grandes de arriba que varían por posición.
  // "Partidos" y "Titulos" son globales y las agrega hud.js siempre.
  statsSuperiores: [
    { clave: "goles", etiqueta: "Goles" },
    { clave: "asistencias", etiqueta: "Asistencias" },
  ],

  // Las 3 burbujas de atributos propias de la posición.
  // "Liderazgo" y "Resistencia" son globales y las agrega hud.js siempre.
  atributos: [
    { clave: "pegada", etiqueta: "Pegada" },
    { clave: "velocidad", etiqueta: "Velocidad" },
    { clave: "gambeta", etiqueta: "Gambeta" },
  ],
};

// Registro global de configuraciones por posición.
// Cada archivo de posición (enganche.js, central.js, arquero.js) se suma
// acá con su propia línea, así hud.js siempre busca en el mismo lugar
// sin importar cuántas posiciones estén cargadas.
window.CONFIGS_POSICIONES = window.CONFIGS_POSICIONES || {};
window.CONFIGS_POSICIONES["delantero"] = CONFIG_DELANTERO;