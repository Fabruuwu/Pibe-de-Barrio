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

  // ---- LaLiga (España) ---- (mismas categorías que en data.js)
  "alaves": "chico",
  "athletic-bilbao": "mediano",
  "atletico-madrid": "grande",
  "barcelona": "grande",
  "celta-vigo": "chico",
  "deportivo-la-coruna": "diminuto",
  "elche": "chico",
  "espanyol": "chico",
  "getafe": "chico",
  "levante": "chico",
  "malaga": "chico",
  "osasuna": "chico",
  "racing-santander": "diminuto",
  "rayo-vallecano": "chico",
  "real-betis": "mediano",
  "real-madrid": "grande",
  "real-sociedad": "mediano",
  "sevilla": "mediano",
  "valencia": "mediano",
  "villarreal": "mediano",

  // ---- Série A de Brasil ----
  "athletico-paranaense": "mediano", "atletico-mineiro": "grande", "bahia": "mediano",
  "botafogo": "grande", "bragantino": "mediano", "chapecoense": "chico", "corinthians": "grande",
  "coritiba": "chico", "cruzeiro": "grande", "flamengo": "grande", "fluminense": "grande",
  "gremio": "grande", "internacional": "grande", "mirassol": "diminuto", "palmeiras": "grande",
  "remo": "diminuto", "santos": "grande", "sao-paulo": "grande", "vasco-da-gama": "grande", "vitoria": "chico",

  // ---- Premier League (Inglaterra) ---- (mismas categorías que en data.js)
  "arsenal": "grande", "aston-villa": "mediano", "bournemouth": "chico",
  "brentford": "chico", "brighton": "mediano", "chelsea": "grande",
  "coventry-city": "chico", "crystal-palace": "mediano", "everton": "mediano",
  "fulham": "mediano", "hull-city": "chico", "ipswich-town": "chico",
  "leeds-united": "mediano", "liverpool": "grande", "manchester-city": "grande",
  "manchester-united": "grande", "newcastle": "mediano", "nottingham-forest": "chico",
  "sunderland": "chico", "tottenham": "grande",

  // ---- Serie A (Italia) ---- (mismas categorías que en data.js)
  "atalanta": "mediano", "bologna": "mediano", "cagliari": "mediano",
  "como": "chico", "fiorentina": "mediano", "frosinone": "chico",
  "genoa": "mediano", "inter": "grande", "juventus": "grande",
  "lazio": "grande", "lecce": "chico", "milan": "grande",
  "monza": "chico", "napoli": "grande", "parma": "chico",
  "roma": "grande", "sassuolo": "chico", "torino": "mediano",
  "udinese": "mediano", "venezia": "chico",
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
  Champions: 1000, // UEFA Champions League
  "Europa League": 700,
  "Conference League": 500,
  "SuperCopa UEFA": 600, // SuperCopa UEFA
  "Mundial de Clubes": 1500, // Mundial de Clubes
  balonDeOro: 2500, // Balón de Oro
  botaDeOro: 500, // Bota de Oro

  // ---- España ----
  ligaEspana: 85, // LaLiga
  copaDelRey: 100, // Copa del Rey
  superCopaEspana: 15, // SuperCopa de España
  ligaBrasil: 120,
  copaBrasil: 80,

  // ---- Premier League (Inglaterra) ----
  ligaPremier: 100,
  faCup: 70,
  carabaoCup: 70,
  communityShield: 30,

  // ---- Serie A (Italia) ----
  ligaSerieA: 100,
  coppaItalia: 80,
  supercoppaItalia: 20,

  // ---- Bundesliga (Alemania) ----
  ligaAlemania: 100,
  dfbPokal: 80,
  dflSuperCopaPokal: 20,

  // ---- Ligue 1 (Francia) ----
  ligaFrancia: 100,
  copaFrancia: 80,
  superCopaFrancia: 20,
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
  Champions: "Trofeos/UEFAChampions.png",
  "Europa League": "Trofeos/EuropaLeague.png",
  "Conference League": "Trofeos/ConferenceLeague.png",
  "SuperCopa UEFA": "Trofeos/SuperCopaUEFA.png",
  "Mundial de Clubes": "Trofeos/MundialClubes.png",
  ligaBrasil: "Trofeos/Brasileirao.png",
  copaBrasil: "Trofeos/CopaBrasil.png",
  balonDeOro: "Trofeos/BalonDeOro.png",
  botaDeOro: "Trofeos/BotaDeOro.png",
  "Copa América": "Trofeos/CopaAmerica.png",
  "Finalissima": "Trofeos/Finalissima.png",

  // ---- España ----
  ligaEspana: "Trofeos/LaLiga.png",
  copaDelRey: "Trofeos/CopaEspaña.png",
  superCopaEspana: "Trofeos/SuperCopaEspaña.png",

  // ---- Premier League (Inglaterra) ----
  ligaPremier: "Trofeos/PremierLeague.png",
  faCup: "Trofeos/FACup.png",
  carabaoCup: "Trofeos/CarabaoCup.png",
  communityShield: "Trofeos/CommunityShield.png",

  // ---- Serie A (Italia) ----
  ligaSerieA: "Trofeos/LigaItalia.png",
  coppaItalia: "Trofeos/CopaItalia.png",
  supercoppaItalia: "Trofeos/SuperCopaItalia.png",

  // ---- Bundesliga (Alemania) ----
  ligaAlemania: "Trofeos/LigaAlemania.png",
  dfbPokal: "Trofeos/DFBPokal.png",
  dflSuperCopaPokal: "Trofeos/DFLSuperCopaPokal.png",

  // ---- Ligue 1 (Francia) ----
  ligaFrancia: "Trofeos/LigaFrancia.png",
  copaFrancia: "Trofeos/CopaFrancia.png",
  superCopaFrancia: "Trofeos/SuperCopaFrancia.png",
};