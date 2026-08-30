/**
 * data.js
 * -----------------------------------------
 * Datos "crudos" del juego: países, ligas, divisiones y clubes.
 * Acá NO va lógica, solo estructuras de datos.
 * Para agregar contenido nuevo (un país, una liga, un club) solo
 * hay que tocar este archivo.
 * -----------------------------------------
 * Estructura:
 * PAISES = [ { id, nombre, bandera } ]
 * LIGAS_POR_PAIS = { idPais: [ { id, nombre } ] }
 * DIVISIONES_POR_LIGA = { idLiga: [ { id, nombre } ] }
 * CLUBES_POR_DIVISION = { idDivision: [ { id, nombre, escudo } ] }
 *
 * El campo "escudo" es la ruta o URL a la imagen del club.
 * Escribila vos mismo, tal como la tenés armada en GitHub, ejemplo:
 *   escudo: "assets/escudos/Boca Juniors.png"
 *   escudo: "https://raw.githubusercontent.com/tu-usuario/tu-repo/main/escudos/boca.png"
 * Si un club todavía no tiene ruta cargada, dejá escudo: "" (vacío)
 * y simplemente no se muestra el preview para ese club.
 */

const PAISES = [
  { id: "argentina", nombre: "Argentina", bandera: "🇦🇷" },
  { id: "brasil", nombre: "Brasil", bandera: "🇧🇷" },
  { id: "españa", nombre: "España", bandera: "🇪🇸" },
];

const LIGAS_POR_PAIS = {
  argentina: [
    { id: "liga-profesional", nombre: "Liga Profesional" },
  ],
  brasil: [
    { id: "brasileirao", nombre: "Brasileirão" },
  ],
  "españa": [
    { id: "laliga", nombre: "LaLiga" },
  ],
};

const DIVISIONES_POR_LIGA = {
  "liga-profesional": [
    { id: "primera-division", nombre: "Primera División" },
    { id: "primera-nacional", nombre: "Primera Nacional" },
  ],
  brasileirao: [
    { id: "serie-a", nombre: "Série A" },
    { id: "serie-b", nombre: "Série B" },
  ],
  laliga: [
    { id: "primera", nombre: "Primera División" },
    { id: "segunda", nombre: "Segunda División" },
  ],
};

const CLUBES_POR_DIVISION = {
  "primera-division": [
    { id: "aldosivi", nombre: "Aldosivi", escudo: "Imagenes/Argentina/LPF/Aldosivi.png" },
    { id: "argentinos-juniors", nombre: "Argentinos Juniors", escudo: "Imagenes/Argentina/LPF/Argentinosjrs.png" },
    { id: "atletico-tucuman", nombre: "Atlético Tucumán", escudo: "" },
    { id: "banfield", nombre: "Banfield", escudo: "" },
    { id: "barracas-central", nombre: "Barracas Central", escudo: "" },
    { id: "belgrano", nombre: "Belgrano", escudo: "" },
    { id: "boca-juniors", nombre: "Boca Juniors", escudo: "" },
    { id: "central-cordoba", nombre: "Central Córdoba", escudo: "" },
    { id: "defensa-y-justicia", nombre: "Defensa y Justicia", escudo: "" },
    { id: "deportivo-riestra", nombre: "Deportivo Riestra", escudo: "" },
    { id: "estudiantes-lp", nombre: "Estudiantes (LP)", escudo: "" },
    { id: "estudiantes-rc", nombre: "Estudiantes (RC)", escudo: "" },
    { id: "gimnasia-lp", nombre: "Gimnasia y Esgrima (LP)", escudo: "" },
    { id: "gimnasia-m", nombre: "Gimnasia y Esgrima (M)", escudo: "" },
    { id: "huracan", nombre: "Huracán", escudo: "" },
    { id: "independiente", nombre: "Independiente", escudo: "" },
    { id: "independiente-rivadavia", nombre: "Independiente Rivadavia", escudo: "" },
    { id: "instituto", nombre: "Instituto", escudo: "" },
    { id: "lanus", nombre: "Lanús", escudo: "" },
    { id: "newells", nombre: "Newell's Old Boys", escudo: "" },
    { id: "platense", nombre: "Platense", escudo: "" },
    { id: "racing-club", nombre: "Racing Club", escudo: "" },
    { id: "river-plate", nombre: "River Plate", escudo: "" },
    { id: "rosario-central", nombre: "Rosario Central", escudo: "" },
    { id: "san-lorenzo", nombre: "San Lorenzo", escudo: "" },
    { id: "sarmiento", nombre: "Sarmiento", escudo: "" },
    { id: "talleres", nombre: "Talleres", escudo: "" },
    { id: "tigre", nombre: "Tigre", escudo: "" },
    { id: "union", nombre: "Unión", escudo: "" },
    { id: "velez-sarsfield", nombre: "Vélez Sarsfield", escudo: "" },
  ],
  "primera-nacional": [
    { id: "chacarita", nombre: "Chacarita Juniors", escudo: "" },
    { id: "almirante-brown", nombre: "Almirante Brown", escudo: "" },
  ],
  "serie-a": [
    { id: "flamengo", nombre: "Flamengo", escudo: "" },
    { id: "palmeiras", nombre: "Palmeiras", escudo: "" },
  ],
  "serie-b": [
    { id: "vila-nova", nombre: "Vila Nova", escudo: "" },
  ],
  primera: [
    { id: "real-madrid", nombre: "Real Madrid", escudo: "" },
    { id: "barcelona", nombre: "Barcelona", escudo: "" },
  ],
  segunda: [
    { id: "eibar", nombre: "Eibar", escudo: "" },
  ],
};

/**
 * ESCUDOS
 * -----------------------------------------
 * Ya no hace falta ninguna función acá: cada club tiene su propio
 * campo "escudo" más arriba, con la ruta o URL que vos le pongas.
 * El menú la usa directamente tal cual la escribiste.
 */