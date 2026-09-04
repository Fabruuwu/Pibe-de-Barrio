/**
 * JovenPromesa.js
 * -----------------------------------------
 * Mecánica "Jugador Estrella / Joven Promesa".
 * Al crear una carrera nueva hay 10% de probabilidad de que el
 * jugador nazca como Joven Promesa: un genio de uno cada mil que
 * rompe los límites normales de estadísticas y media.
 *
 * Este archivo centraliza TODOS los números de la mecánica, así que
 * si en el futuro querés cambiar el CAP, el multiplicador de cartas
 * o el rango de stats de nacimiento, solo hay que tocar acá.
 * -----------------------------------------
 */

const JOVEN_PROMESA = {
  PROBABILIDAD: 0.10, // 10% de las carreras nuevas

  CAP_NORMAL: 99,      // tope de media y de stats para un jugador normal
  CAP_PROMESA: 109,    // tope de media y de stats para un Joven Promesa

  STAT_BASE_MIN: 62,   // piso de las stats de nacimiento (Joven Promesa)
  STAT_BASE_MAX: 75,   // techo de las stats de nacimiento (Joven Promesa)

  MULTIPLICADOR_CARTAS: 1.5, // puntos extra al elegir una carta de mejora

  TITULO: "🌟 Joven Promesa",
  TEXTO:
    "Una joven promesa ha nacido, un genio de uno cada mil. Los ojeadores " +
    "del club no tardaron en darse cuenta: en cada entrenamiento parecés " +
    "jugar un partido adelantado al resto. Tu límite de estadísticas y de " +
    "media sube de 99 a 109, tus stats de nacimiento arrancan mucho más " +
    "altas que las de un jugador normal, y cada vez que elijas una carta " +
    "de mejora vas a ganar x1.5 de puntos. El camino a la leyenda empieza " +
    "antes de tiempo.",
};

/**
 * Tira el "dado" al crear un jugador nuevo.
 * 10% Joven Promesa, 90% jugador normal.
 */
function determinarEsPromesa() {
  return Math.random() < JOVEN_PROMESA.PROBABILIDAD;
}

/**
 * Devuelve el tope de stats/media que le corresponde a este jugador.
 * Usar siempre esta función en vez de escribir "99" a mano en el código,
 * así toda la lógica de límites vive en un solo lugar.
 */
function obtenerCapStat(jugador) {
  return jugador && jugador.esPromesa ? JOVEN_PROMESA.CAP_PROMESA : JOVEN_PROMESA.CAP_NORMAL;
}

/**
 * Muestra el cartel dorado de bienvenida cuando el jugador es Joven Promesa.
 * Se llama una sola vez, justo al arrancar la carrera, antes de las cartas
 * iniciales. Si por algún motivo el modal no está en el HTML, no rompe
 * nada: simplemente sigue de largo al callback.
 */
function mostrarCartelPromesa(callback) {
  const modal = document.getElementById("modal-promesa");
  if (!modal) {
    callback();
    return;
  }

  const titulo = document.getElementById("promesa-titulo");
  const texto = document.getElementById("promesa-texto");
  if (titulo) titulo.textContent = JOVEN_PROMESA.TITULO;
  if (texto) texto.textContent = JOVEN_PROMESA.TEXTO;

  modal.hidden = false;

  const boton = document.getElementById("promesa-continuar");
  const cerrar = () => {
    modal.hidden = true;
    boton.removeEventListener("click", cerrar);
    callback();
  };
  boton.addEventListener("click", cerrar);
}
