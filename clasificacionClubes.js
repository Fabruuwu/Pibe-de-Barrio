/**
 * clasificacionClubes.js
 * -----------------------------------------
 * Clasifica a los clubes en Grande / Mediano / Chico / Diminuto.
 * Esto define el multiplicador de puntos de carrera: ganar un título
 * con un club chico vale mucho más que ganarlo con un grande.
 *
 * Clasificación de referencia (podés reordenar clubes libremente,
 * fijate que el "id" coincida con el de data.js):
 *   Grande   -> multiplicador x1
 *   Mediano  -> multiplicador x2
 *   Chico    -> multiplicador x3
 *   Diminuto -> multiplicador x4
 *
 * Si un club no está en la lista, se lo trata como "chico" por defecto
 * (multiplicador x3) para no romper el cálculo de puntos.
 * -----------------------------------------
 */

const MULTIPLICADOR_POR_TAMANO = {
  grande: 1,
  mediano: 2,
  chico: 3,
  diminuto: 4,
};

const CLASIFICACION_CLUBES = {
  // ---- Liga Profesional Argentina ----
  "boca-juniors": "grande",
  "river-plate": "grande",
  "racing-club": "mediano",
  "independiente": "mediano",
  "san-lorenzo": "mediano",
  "velez-sarsfield": "mediano",
  "estudiantes-lp": "mediano",
  "talleres": "mediano",
  "rosario-central": "mediano",
  "newells": "mediano",
  "huracan": "chico",
  "banfield": "chico",
  "lanus": "chico",
  "argentinos-juniors": "chico",
  "gimnasia-lp": "chico",
  "tigre": "chico",
  "union": "chico",
  "belgrano": "chico",
  "instituto": "chico",
  "platense": "chico",
  "defensa-y-justicia": "chico",
  "atletico-tucuman": "chico",
  "central-cordoba": "chico",
  "barracas-central": "diminuto",
  "sarmiento": "diminuto",
  "aldosivi": "diminuto",
  "deportivo-riestra": "diminuto",
  "independiente-rivadavia": "diminuto",
  "gimnasia-m": "diminuto",
  "estudiantes-rc": "diminuto",

  // ---- Primera Nacional Argentina ----
  "chacarita-juniors": "diminuto",
  "almirante-brown": "diminuto",
};

/**
 * Devuelve el tamaño de un club ("grande" | "mediano" | "chico" | "diminuto").
 * Si no está clasificado, asume "chico" para no romper nada.
 */
function obtenerTamanoClub(idClub) {
  return CLASIFICACION_CLUBES[idClub] || "chico";
}

/**
 * Devuelve el multiplicador de puntos de carrera que le corresponde al club.
 */
function obtenerMultiplicadorClub(idClub) {
  const tamano = obtenerTamanoClub(idClub);
  return MULTIPLICADOR_POR_TAMANO[tamano] || 1;
}

/**
 * PUNTOS_TITULOS
 * -----------------------------------------
 * Cuánto vale cada título, antes de aplicar el multiplicador del club.
 * Las claves coinciden con los campos que ya usa el juego:
 * - liga, copa, superCopa, trofeo, superCopaInt -> vienen de
 *   jugador.campeonesHistorial (ver hud.js -> procesarEventos)
 * - Libertadores, Sudamericana, Recopa, Mundial de Clubes -> vienen de
 *   jugador.resultadosInternacionales (campo "copa")
 * - balonDeOro -> viene de jugador.balonesDeOro
 *
 * A futuro, cuando existan Selecciones y otras competiciones, esta
 * tabla es el único lugar que va a hacer falta ampliar.
 * -----------------------------------------
 */
const PUNTOS_TITULOS = {
  liga: 70, // Liga Argentina
  copa: 100, // Copa Argentina
  trofeo: 10, // Trofeo de Campeones
  superCopa: 10, // SuperCopa Argentina
  superCopaInt: 10, // Super Copa Internacional Argentina
  Libertadores: 700, // Copa Libertadores
  Sudamericana: 500, // Copa Sudamericana
  Recopa: 600, // Recopa Sudamericana
  "Mundial de Clubes": 1500, // Mundial de Clubes
  balonDeOro: 2500, // Balón de Oro
  botaDeOro: 500, // Bota de Oro
};

/**
 * IMAGENES_TITULOS
 * -----------------------------------------
 * Ícono de trofeo/premio para el resumen final (chip con imagen + años).
 * La clave tiene que coincidir con la misma clave que usa PUNTOS_TITULOS
 * (o, para selecciones, con el nombre de la competencia tal cual se
 * guarda en jugador.resultadosSelecciones[].competencia).
 * Ajustá las rutas si tus archivos se llaman distinto dentro de /Trofeos.
 * -----------------------------------------
 */
const IMAGENES_TITULOS = {
  liga: "Trofeos/LigaArgentina.png",
  copa: "Trofeos/CopaArgentina.png",
  trofeo: "Trofeos/TrofeoDeCampeones.png",
  superCopa: "Trofeos/SuperCopaArgentina.png",
  superCopaInt: "Trofeos/SuperCopaInternacional.png",
  Libertadores: "Trofeos/CopaLibertadores.png",
  Sudamericana: "Trofeos/CopaSudamericana.png",
  Recopa: "Trofeos/Recopa.png",
  "Mundial de Clubes": "Trofeos/MundialClubes.png",
  balonDeOro: "Trofeos/BalonDeOro.png",
  botaDeOro: "Trofeos/BotaDeOro.png",
  "Copa América": "Trofeos/CopaAmerica.png",
  "Finalissima": "Trofeos/Finalissima.png",
};