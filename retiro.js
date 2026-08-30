/**
 * retiro.js
 * -----------------------------------------
 * Maneja el modal "¿Querés retirarte?" del HUD.
 * - "No, me la banco" cierra el modal y listo.
 * - "Sí, quiero retirarme" por ahora solo avisa; cuando exista la
 *   fase 3 (resumen de carrera) esto va a cerrar la carrera actual
 *   y mostrar la pantalla de resumen en lugar del alert().
 * -----------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const botonAbrir = document.getElementById("hud-boton-retiro");
  const modal = document.getElementById("modal-retiro");
  const botonCancelar = document.getElementById("retiro-cancelar");
  const botonConfirmar = document.getElementById("retiro-confirmar");

  if (!botonAbrir || !modal) return; // el HUD todavía no está en el DOM

  botonAbrir.addEventListener("click", abrirModal);
  botonCancelar.addEventListener("click", cerrarModal);

  // Cerrar clickeando afuera de la tarjeta del modal.
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarModal();
  });

  botonConfirmar.addEventListener("click", () => {
    cerrarModal();
    retirarJugador();
  });

  function abrirModal() {
    modal.hidden = false;
  }

  function cerrarModal() {
    modal.hidden = true;
  }

  function retirarJugador() {
    // TODO fase 3: armar el resumen de carrera (título, historial,
    // puntos) y mostrar la pantalla de resumen en vez de este alert.
    console.log("Carrera retirada:", Estado.obtener());
    alert("¡Carrera finalizada! (el resumen todavía no está armado, llega en la fase 3)");
  }
});