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
  { id: "argentina", nombre: "Argentina", bandera: "Imagenes/Selecciones/Argentina.png" },
  { id: "brasil", nombre: "Brasil", bandera: "Imagenes/Selecciones/Brasil.png" },
  { id: "españa", nombre: "España", bandera: "Imagenes/Selecciones/España.png" },
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
    { id: "atletico-tucuman", nombre: "Atlético Tucumán", escudo: "Imagenes/Argentina/LPF/AtleticoTucuman.png" },
    { id: "banfield", nombre: "Banfield", escudo: "Imagenes/Argentina/LPF/Banfield.png" },
    { id: "barracas-central", nombre: "Barracas Central", escudo: "Imagenes/Argentina/LPF/Barracas.png" },
    { id: "belgrano", nombre: "Belgrano", escudo: "Imagenes/Argentina/LPF/Belgrano.png" },
    { id: "boca-juniors", nombre: "Boca Juniors", escudo: "Imagenes/Argentina/LPF/Boca.png" },
    { id: "central-cordoba", nombre: "Central Córdoba", escudo: "Imagenes/Argentina/LPF/CentralCordoba.png" },
    { id: "defensa-y-justicia", nombre: "Defensa y Justicia", escudo: "Imagenes/Argentina/LPF/DefensayJusticia.png" },
    { id: "deportivo-riestra", nombre: "Deportivo Riestra", escudo: "Imagenes/Argentina/LPF/Riestra.png" },
    { id: "estudiantes-lp", nombre: "Estudiantes (LP)", escudo: "Imagenes/Argentina/LPF/EstudiantesPlata.png" },
    { id: "estudiantes-rc", nombre: "Estudiantes (RC)", escudo: "Imagenes/Argentina/LPF/EstudiantesRioCuarto.png" },
    { id: "gimnasia-lp", nombre: "Gimnasia y Esgrima (LP)", escudo: "Imagenes/Argentina/LPF/GimnasiayEsgrima.png" },
    { id: "gimnasia-m", nombre: "Gimnasia y Esgrima (M)", escudo: "Imagenes/Argentina/LPF/GimnasiaMendoza.png" },
    { id: "huracan", nombre: "Huracán", escudo: "Imagenes/Argentina/LPF/Huracan.png" },
    { id: "independiente", nombre: "Independiente", escudo: "Imagenes/Argentina/LPF/Independiente.png" },
    { id: "independiente-rivadavia", nombre: "Independiente Rivadavia", escudo: "Imagenes/Argentina/LPF/IndependienteRivadavia.png" },
    { id: "instituto", nombre: "Instituto", escudo: "Imagenes/Argentina/LPF/InstitutoCordoba.png" },
    { id: "lanus", nombre: "Lanús", escudo: "Imagenes/Argentina/LPF/Lanus.png" },
    { id: "newells", nombre: "Newell's Old Boys", escudo: "Imagenes/Argentina/LPF/Newells.png" },
    { id: "platense", nombre: "Platense", escudo: "Imagenes/Argentina/LPF/Platense.png" },
    { id: "racing-club", nombre: "Racing Club", escudo: "Imagenes/Argentina/LPF/Racing.png" },
    { id: "river-plate", nombre: "River Plate", escudo: "Imagenes/Argentina/LPF/River.png" },
    { id: "rosario-central", nombre: "Rosario Central", escudo: "Imagenes/Argentina/LPF/RosarioCentral.png" },
    { id: "san-lorenzo", nombre: "San Lorenzo", escudo: "Imagenes/Argentina/LPF/SanLorenzo.png" },
    { id: "sarmiento", nombre: "Sarmiento", escudo: "Imagenes/Argentina/LPF/SarmientoJunin.png" },
    { id: "talleres", nombre: "Talleres", escudo: "Imagenes/Argentina/LPF/Talleres.png" },
    { id: "tigre", nombre: "Tigre", escudo: "Imagenes/Argentina/LPF/Tigre.png" },
    { id: "union", nombre: "Unión", escudo: "Imagenes/Argentina/LPF/UnionSantaFe.png" },
    { id: "velez-sarsfield", nombre: "Vélez Sarsfield", escudo: "Imagenes/Argentina/LPF/Velez.png" },
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