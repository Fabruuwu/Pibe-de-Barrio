/**
 * traspasos.js
 * -----------------------------------------
 * Mercado de pases: contrato del jugador, ofertas de otros clubes
 * al vencer el contrato, y el botón de "enviar al representante"
 * (maletín, 2 usos por carrera).
 *
 * Las ofertas pueden venir de CUALQUIER club cargado en data.js,
 * de cualquier liga/país. Ojo: la simulación de competencias (Liga,
 * Copa Argentina, Libertadores, etc.) todavía está armada asumiendo
 * que jugás en Argentina, así que si fichás por un club de otra
 * liga esas competencias van a romperse hasta que se arme su
 * simulación correspondiente. Es una decisión consciente: se prioriza
 * terminar el sistema de traspasos primero.
 * -----------------------------------------
 */

const TRASPASOS = {
  SALARIO_BASE: 5000,
  DURACION_BASE: 2,
  MALETIN_USOS_MAX: 2,
  EDAD_MIN_VOLVER_A_CASA: 32,
  EDAD_MAX_VOLVER_A_CASA: 44,
};

// Probabilidad (en %) de que la oferta venga de un club de cada tamaño,
// según la media del jugador.
const PROB_CATEGORIA_POR_MEDIA = [
  { max: 55, diminuto: 55, chico: 40, mediano: 4, grande: 1 },
  { max: 65, chico: 45, diminuto: 35, mediano: 8, grande: 2 },
  { max: 75, chico: 40, mediano: 40, diminuto: 15, grande: 5 },
  { max: 85, mediano: 55, grande: 25, chico: 15, diminuto: 5 },
  { max: 95, grande: 50, mediano: 40, chico: 6, diminuto: 4 },
  { max: 109, grande: 80, mediano: 15, chico: 3, diminuto: 2 },
];

// Rango de salario mensual (US$) según la media del jugador.
const RANGO_SALARIO_POR_MEDIA = [
  { max: 55, min: 5000, tope: 10000 },
  { max: 65, min: 15000, tope: 55000 },
  { max: 75, min: 70000, tope: 160000 },
  { max: 85, min: 180000, tope: 800000 },
  { max: 95, min: 900000, tope: 1200000 },
  { max: 99, min: 1300000, tope: 1900000 },
  { max: 109, min: 2000000, tope: 4000000 },
];

function numeroAleatorioTraspaso(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obtenerRangoPorMedia(tabla, media) {
  return tabla.find((t) => media <= t.max) || tabla[tabla.length - 1];
}

function elegirCategoriaAleatoria(media) {
  const tabla = obtenerRangoPorMedia(PROB_CATEGORIA_POR_MEDIA, media);
  const opciones = [
    ["diminuto", tabla.diminuto || 0],
    ["chico", tabla.chico || 0],
    ["mediano", tabla.mediano || 0],
    ["grande", tabla.grande || 0],
  ];
  const total = opciones.reduce((acc, [, prob]) => acc + prob, 0);
  let random = Math.random() * total;
  for (const [nombre, prob] of opciones) {
    random -= prob;
    if (random <= 0) return nombre;
  }
  return opciones[opciones.length - 1][0];
}

function generarSalarioPorMedia(media) {
  const rango = obtenerRangoPorMedia(RANGO_SALARIO_POR_MEDIA, media);
  const salario = rango.min + Math.random() * (rango.tope - rango.min);
  return Math.round(salario / 100) * 100;
}

// ---------------------------------------
// Clubes elegibles (ver nota de arriba: solo Argentina por ahora)
// ---------------------------------------
function obtenerTodosLosClubesElegibles() {
  return Object.values(CLUBES_POR_DIVISION).flat();
}

function obtenerClubesPorCategoria(categoria, excluidos) {
  return obtenerTodosLosClubesElegibles().filter(
    (club) => club.categoria === categoria && !excluidos.includes(club.id)
  );
}

function elegirClubOfertante(jugador, excluidos) {
  const categoria = elegirCategoriaAleatoria(jugador.media || 0);
  let candidatos = obtenerClubesPorCategoria(categoria, excluidos);
  if (candidatos.length === 0) {
    candidatos = obtenerTodosLosClubesElegibles().filter((club) => !excluidos.includes(club.id));
  }
  if (candidatos.length === 0) return null;
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}

// ---------------------------------------
// Ubicación del club (país / liga) - genérico, ya preparado
// para cuando haya más ligas jugables.
// ---------------------------------------
const MAPA_CLUB_A_DIVISION = {};
if (typeof CLUBES_POR_DIVISION !== "undefined") {
  Object.entries(CLUBES_POR_DIVISION).forEach(([idDivision, clubes]) => {
    clubes.forEach((club) => { MAPA_CLUB_A_DIVISION[club.id] = idDivision; });
  });
}
const MAPA_DIVISION_A_LIGA = {};
if (typeof DIVISIONES_POR_LIGA !== "undefined") {
  Object.entries(DIVISIONES_POR_LIGA).forEach(([idLiga, divisiones]) => {
    divisiones.forEach((division) => { MAPA_DIVISION_A_LIGA[division.id] = idLiga; });
  });
}
const MAPA_LIGA_A_PAIS = {};
if (typeof LIGAS_POR_PAIS !== "undefined") {
  Object.entries(LIGAS_POR_PAIS).forEach(([idPais, ligas]) => {
    ligas.forEach((liga) => { MAPA_LIGA_A_PAIS[liga.id] = idPais; });
  });
}

function obtenerLigaDeClub(idClub) {
  const idDivision = MAPA_CLUB_A_DIVISION[idClub];
  return idDivision ? MAPA_DIVISION_A_LIGA[idDivision] : null;
}
function obtenerPaisDeClub(idClub) {
  const idLiga = obtenerLigaDeClub(idClub);
  return idLiga ? MAPA_LIGA_A_PAIS[idLiga] : null;
}

// ---------------------------------------
// Armado de cada oferta
// ---------------------------------------
function etiquetaOferta(club, jugador) {
  const clubOrigen = jugador.historialClubes && jugador.historialClubes[0] ? jugador.historialClubes[0].club : null;
  if (club.id === jugador.club) return { texto: "Renovación", clase: "renovacion" };
  if (club.id === clubOrigen) return { texto: "Volvé a casa", clase: "volver-casa" };
  if (club.categoria === "grande") return { texto: "Bombazo", clase: "bombazo" };
  if (club.categoria === "diminuto") return { texto: "Noticion", clase: "noticion" };
  return { texto: "Traspaso", clase: "traspaso" };
}

function textoProyeccionCariño(club, jugador) {
  if (club.id !== jugador.club) {
    return "Arrancás de cero, sos Uno más (5 de cariño).";
  }
  const cariño = Math.max(0, Math.min(100, jugador.cariño || 0));
  const indiceEtapa = ETAPAS_CARIÑO.findIndex((e) => cariño <= e.hasta);
  const etapaActual = indiceEtapa === -1 ? ETAPAS_CARIÑO.length - 1 : indiceEtapa;
  if (etapaActual >= ETAPAS_CARIÑO.length - 1) {
    return `Ya sos ${ETAPAS_CARIÑO[etapaActual].nombre} en este club, no hay nada más que ganar.`;
  }
  const siguiente = ETAPAS_CARIÑO[etapaActual + 1];
  const faltan = Math.max(1, siguiente.hasta - cariño);
  return `Te faltan ${faltan} para ser ${siguiente.nombre}.`;
}

function crearOferta(club, jugador) {
  const idPais = obtenerPaisDeClub(club.id);
  const idLiga = obtenerLigaDeClub(club.id);
  return {
    clubId: club.id,
    club,
    pais: idPais,
    ligaNombre: (typeof NOMBRES_LIGAS !== "undefined" && NOMBRES_LIGAS[idLiga]) || "",
    salario: generarSalarioPorMedia(jugador.media || 0),
    duracionAnios: numeroAleatorioTraspaso(1, 4),
    etiqueta: etiquetaOferta(club, jugador),
    proyeccionCariño: textoProyeccionCariño(club, jugador),
  };
}

function generarOfertasTraspaso(jugador, cantidad, forzarRenovacion) {
  const ofertas = [];
  const excluidos = [];

  if (forzarRenovacion) {
    const clubActual = NOMBRES_CLUBES[jugador.club];
    if (clubActual) {
      ofertas.push(crearOferta(clubActual, jugador));
      excluidos.push(clubActual.id);
    }
  }

  const clubOrigenId = jugador.historialClubes && jugador.historialClubes[0] ? jugador.historialClubes[0].club : null;
  const puedeVolverACasa =
    !jugador.volverACasaUsado &&
    clubOrigenId &&
    clubOrigenId !== jugador.club &&
    !excluidos.includes(clubOrigenId) &&
    jugador.edad >= TRASPASOS.EDAD_MIN_VOLVER_A_CASA &&
    jugador.edad <= TRASPASOS.EDAD_MAX_VOLVER_A_CASA;

  if (puedeVolverACasa && ofertas.length < cantidad) {
    const clubOrigen = NOMBRES_CLUBES[clubOrigenId];
    if (clubOrigen) {
      ofertas.push(crearOferta(clubOrigen, jugador));
      excluidos.push(clubOrigen.id);
      jugador.volverACasaUsado = true; // no vuelve a aparecer en el resto de la carrera
    }
  }

  while (ofertas.length < cantidad) {
    const club = elegirClubOfertante(jugador, excluidos);
    if (!club) break;
    excluidos.push(club.id);
    ofertas.push(crearOferta(club, jugador));
  }

  return ofertas;
}

// ---------------------------------------
// Firmar una oferta
// ---------------------------------------
function firmarOferta(oferta) {
  const jugador = Estado.obtener();
  const esNuevoClub = oferta.clubId !== jugador.club;

  const historial = Array.isArray(jugador.historialClubes) ? [...jugador.historialClubes] : [];
  if (esNuevoClub) {
    const ultimo = historial[historial.length - 1];
    if (ultimo && ultimo.hasta === null) {
      ultimo.hasta = jugador.año;
      ultimo.cariñoFinal = jugador.cariño || 0;
    }
    historial.push({ club: oferta.clubId, desde: jugador.año, hasta: null, cariñoFinal: 0, partidos: 0, titulos: [] });
  }

  Estado.actualizar({
    club: oferta.clubId,
    contrato: { salario: oferta.salario, duracionAnios: oferta.duracionAnios, añoInicio: jugador.año },
    cariño: esNuevoClub ? 5 : jugador.cariño,
    historialClubes: historial,
  });
}

// ---------------------------------------
// UI: overlay genérico + tarjetas de oferta
// ---------------------------------------
function crearOverlayTraspaso(html, claseExtra) {
  const overlay = document.createElement("div");
  overlay.className = claseExtra ? `modal ${claseExtra}` : "modal";
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  return overlay;
}

function crearTarjetaOferta(oferta, alFirmar) {
  const div = document.createElement("div");
  div.className = "oferta-card";
  const paisDatos = (typeof PAISES_POR_ID !== "undefined" && PAISES_POR_ID[oferta.pais]) || {};
  const escudo = oferta.club.escudo || "";
  div.innerHTML = `
    <span class="oferta-card__badge oferta-card__badge--${oferta.etiqueta.clase}">${oferta.etiqueta.texto}</span>
    ${escudo ? `<img class="oferta-card__escudo-fondo" src="${escudo}" alt="" onerror="this.remove()">` : ""}
    <div class="oferta-card__cabecera">
      ${escudo ? `<img class="oferta-card__escudo" src="${escudo}" alt="" onerror="this.hidden=true">` : ""}
      <span class="oferta-card__nombre">${oferta.club.nombre}</span>
    </div>
    <div class="oferta-card__pais">
      ${paisDatos.bandera ? `<img class="oferta-card__bandera" src="${paisDatos.bandera}" alt="" onerror="this.hidden=true">` : ""}
      <span class="oferta-card__liga">${oferta.ligaNombre || ""}</span>
    </div>
    <div class="oferta-card__salario">
      <span class="oferta-card__salario-numero">${typeof formatearDinero === "function" ? formatearDinero(oferta.salario / 1000000) : `$${oferta.salario}`}</span>
      <span class="oferta-card__salario-detalle">/mes</span>
      <span class="oferta-card__salario-detalle">· ${oferta.duracionAnios} año${oferta.duracionAnios > 1 ? "s" : ""}</span>
    </div>
    <p class="oferta-card__carino">${oferta.proyeccionCariño}</p>
    <button type="button" class="oferta-card__firmar">
      <span class="oferta-card__firmar-linea">Firmar</span>
      <span class="oferta-card__firmar-nota">Presioná para fichar</span>
    </button>
  `;
  div.querySelector(".oferta-card__firmar").addEventListener("click", alFirmar);
  return div;
}

function renderizarOfertas({ titulo, subtitulo, ofertas, permitirRechazar, onElegir }) {
  const overlay = crearOverlayTraspaso(
    `
    <div class="modal__tarjeta modal__tarjeta--ofertas">
      <h2 class="ofertas__titulo">${titulo}</h2>
      <p class="ofertas__subtitulo">${subtitulo}</p>
      <div class="ofertas__lista" id="ofertas-lista"></div>
      ${permitirRechazar ? '<button type="button" class="modal__boton modal__boton--peligro ofertas__rechazar" id="ofertas-rechazar">Rechazar Ofertas</button>' : ""}
    </div>
  `,
    "modal--ofertas"
  );

  const lista = overlay.querySelector("#ofertas-lista");
  ofertas.forEach((oferta) => {
    lista.appendChild(
      crearTarjetaOferta(oferta, () => {
        overlay.remove();
        onElegir(oferta);
      })
    );
  });

  if (permitirRechazar) {
    overlay.querySelector("#ofertas-rechazar").addEventListener("click", () => {
      overlay.remove();
      onElegir(null);
    });
  }
}

// ---------------------------------------
// Flujo 1: mercado obligatorio al vencer el contrato.
// Se llama al arrancar cada temporada, ANTES que cualquier otra cosa
// (Balón de Oro, Bota de Oro, copas de selección, cartas, etc.).
// Devuelve true si mostró la pantalla (y ella misma llama a "callback"
// cuando el jugador firma); devuelve false/undefined si el contrato
// todavía está vigente, para que el llamador siga de largo.
// ---------------------------------------
function mostrarOfertasTraspaso(callback) {
  const jugador = Estado.obtener();
  if (!jugador.contrato) {
    Estado.actualizar({ contrato: { salario: TRASPASOS.SALARIO_BASE, duracionAnios: TRASPASOS.DURACION_BASE, añoInicio: jugador.año } });
  }
  const contrato = Estado.obtener().contrato;
  const vencido = jugador.año >= contrato.añoInicio + contrato.duracionAnios;
  if (!vencido) return false;

  const cantidad = numeroAleatorioTraspaso(4, 6);
  const ofertas = generarOfertasTraspaso(jugador, cantidad, true);
  Estado.guardar();

  renderizarOfertas({
    titulo: `¡Has recibido ${ofertas.length} ofertas!`,
    subtitulo: "Analizá con cuidado y tomá la decisión, el bolígrafo está en tus manos.",
    ofertas,
    permitirRechazar: false,
    onElegir: (oferta) => {
      firmarOferta(oferta);
      callback();
    },
  });

  return true;
}

// ---------------------------------------
// Flujo 2: botón del maletín (2 usos por carrera, a demanda del jugador).
// ---------------------------------------
function mostrarConfirmacionMaletin() {
  const overlay = crearOverlayTraspaso(`
    <div class="modal__tarjeta modal__tarjeta--maletin">
      <span class="maletin__icono">💼</span>
      <p class="maletin__texto">¿Querés enviar a tu representante a buscar ofertas?</p>
      <div class="modal__botones">
        <button type="button" class="modal__boton modal__boton--secundario" id="maletin-no">No</button>
        <button type="button" class="modal__boton modal__boton--promesa" id="maletin-si">Sí, enviar</button>
      </div>
    </div>
  `);
  overlay.querySelector("#maletin-no").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#maletin-si").addEventListener("click", () => {
    overlay.remove();
    const jugador = Estado.obtener();
    Estado.actualizar({ maletinUsos: (jugador.maletinUsos || 0) + 1 });
    const ofertas = generarOfertasTraspaso(Estado.obtener(), 2, false);
    Estado.guardar();
    renderizarOfertas({
      titulo: `¡Tu representante encontró ${ofertas.length} ofertas!`,
      subtitulo: "Analizá con cuidado y tomá la decisión, el bolígrafo está en tus manos.",
      ofertas,
      permitirRechazar: true,
      onElegir: (oferta) => {
        if (oferta) firmarOferta(oferta);
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("hud-boton-maletin");
  if (!boton) return;
  boton.addEventListener("click", () => {
    const jugador = Estado.obtener();
    if (!jugador) return;
    if ((jugador.maletinUsos || 0) >= TRASPASOS.MALETIN_USOS_MAX) {
      alert("Ya usaste las 2 veces que tenías disponibles para enviar a tu representante en esta carrera.");
      return;
    }
    mostrarConfirmacionMaletin();
  });
});