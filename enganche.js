const CONFIG_ENGANCHE = {
  posicion: "enganche",
  statsSuperiores: [
    { clave: "goles", etiqueta: "Goles" },
    { clave: "asistencias", etiqueta: "Asistencias" },
  ],
  atributos: [
    { clave: "pase", etiqueta: "Pase" },
    { clave: "vision", etiqueta: "Visión" },
    { clave: "gambeta", etiqueta: "Gambeta" },
  ],
};

window.CONFIGS_POSICIONES = window.CONFIGS_POSICIONES || {};
window.CONFIGS_POSICIONES.enganche = CONFIG_ENGANCHE;
