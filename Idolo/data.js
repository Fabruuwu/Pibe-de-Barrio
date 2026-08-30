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
    { id: "boca", nombre: "Boca Juniors", escudo: "🔵🟡" },
    { id: "river", nombre: "River Plate", escudo: "⚪🔴" },
    { id: "racing", nombre: "Racing Club", escudo: "🩵⚪" },
    { id: "independiente", nombre: "Independiente", escudo: "🔴" },
    { id: "sacachispas", nombre: "Sacachispas", escudo: "⚫🟡" },
  ],
  "primera-nacional": [
    { id: "chacarita", nombre: "Chacarita Juniors", escudo: "⚫🟢" },
    { id: "almirante-brown", nombre: "Almirante Brown", escudo: "🟤⚪" },
  ],
  "serie-a": [
    { id: "flamengo", nombre: "Flamengo", escudo: "🔴⚫" },
    { id: "palmeiras", nombre: "Palmeiras", escudo: "🟢⚪" },
  ],
  "serie-b": [
    { id: "vila-nova", nombre: "Vila Nova", escudo: "🔴⚫" },
  ],
  primera: [
    { id: "real-madrid", nombre: "Real Madrid", escudo: "⚪" },
    { id: "barcelona", nombre: "Barcelona", escudo: "🔵🔴" },
  ],
  segunda: [
    { id: "eibar", nombre: "Eibar", escudo: "🔵🟣" },
  ],
};