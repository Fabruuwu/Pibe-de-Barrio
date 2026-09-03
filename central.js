const CONFIG_CENTRAL = {
  posicion: "central",
  statsSuperiores: [
    { clave: "vallasInvictas", etiqueta: "Vallas invictas" },
    { clave: "recuperaciones", etiqueta: "Recuperaciones" },
  ],
  atributos: [
    { clave: "marca", etiqueta: "Marca" },
    { clave: "quite", etiqueta: "Quite" },
    { clave: "juegoAereo", etiqueta: "Juego aéreo" },
  ],
};

window.CONFIGS_POSICIONES = window.CONFIGS_POSICIONES || {};
window.CONFIGS_POSICIONES.central = CONFIG_CENTRAL;
