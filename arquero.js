const CONFIG_ARQUERO = {
  posicion: "arquero",
  statsSuperiores: [
    { clave: "vallasInvictas", etiqueta: "Vallas invictas" },
    { clave: "atajadas", etiqueta: "Atajadas" },
  ],
  atributos: [
    { clave: "reflejos", etiqueta: "Reflejos" },
    { clave: "ataje", etiqueta: "Ataje" },
    { clave: "juegoAereo", etiqueta: "Juego aéreo" },
  ],
};

window.CONFIGS_POSICIONES = window.CONFIGS_POSICIONES || {};
window.CONFIGS_POSICIONES.arquero = CONFIG_ARQUERO;
