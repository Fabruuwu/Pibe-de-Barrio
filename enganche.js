const CONFIG_ENGANCHE = {
  posicion: "enganche",
  statsSuperiores: [
    { clave: "asistencias", etiqueta: "Asistencias" },
    { clave: "goles", etiqueta: "Goles" },
  ],
  atributos: [
    { clave: "pase", etiqueta: "Pase" },
    { clave: "cerebro", etiqueta: "Cerebro" },
    { clave: "gambeta", etiqueta: "Gambeta" },
  ],
};

window.CONFIGS_POSICIONES = window.CONFIGS_POSICIONES || {};
window.CONFIGS_POSICIONES.enganche = CONFIG_ENGANCHE;
