/**
 * menufinal.js
 * -----------------------------------------
 * Fase 3 del juego: qué pasa cuando la carrera termina (ya sea porque
 * el jugador se retira desde el botón rojo, o porque el retiro
 * automático por edad lo saca del plantel).
 *
 * Flujo:
 * 1. finalizarCarrera() cierra la carrera actual (completa el último
 *    club en historialClubes) y calcula el resumen de puntos/títulos.
 * 2. Se muestra el cartel dorado con el escudo del club + el título
 *    que se ganó el jugador según cómo le fue.
 * 3. Al tocar "Ver mi Carrera" se abre la pantalla de resumen completa.
 * 4. "Hacer otra carrera" borra la carrera guardada y recarga la app,
 *    lo que te devuelve directo al menú principal.
 *
 * IMPORTANTE sobre los puntos: esta primera versión solo sabe leer los
 * títulos que YA existen en el juego (Liga, Copa Argentina, Trofeo de
 * Campeones, SuperCopa Argentina, SuperCopa Internacional, Libertadores,
 * Sudamericana, Recopa Sudamericana, Mundial de Clubes y Balón de Oro).
 * Los valores de cada título viven en clasificacionClubes.js
 * (PUNTOS_TITULOS), así que cuando sumes Selecciones u otras copas,
 * ese es el único lugar que hace falta ampliar.
 * -----------------------------------------
 */

// ============================================
// CÁLCULO DEL RESUMEN DE CARRERA
// ============================================

function calcularResumenCarrera(jugador) {
  const detalle = []; // [{ clave, etiqueta, club, veces, puntosBase, multiplicador, subtotal }]
  const titulosPorClub = {}; // clubId -> ["🏆 Liga Argentina 2027", ...]

  function agregarTituloVisual(clubId, etiqueta, año) {
    if (!titulosPorClub[clubId]) titulosPorClub[clubId] = [];
    titulosPorClub[clubId].push(año ? `${etiqueta} ${año}` : etiqueta);
  }

  function sumarPuntos(clubId, clave, etiqueta, año) {
    if (!clubId) return;
    const puntosBase = PUNTOS_TITULOS[clave] || 0;
    const multiplicador = obtenerMultiplicadorClub(clubId);

    let entrada = detalle.find((d) => d.clave === clave && d.club === clubId);
    if (!entrada) {
      entrada = { clave, etiqueta, club: clubId, veces: 0, puntosBase, multiplicador, subtotal: 0 };
      detalle.push(entrada);
    }
    entrada.veces += 1;
    entrada.subtotal += puntosBase * multiplicador;

    agregarTituloVisual(clubId, etiqueta, año);
  }

  // Liga / Copa Argentina / SuperCopa / Trofeo / SuperCopa Internacional
  (jugador.campeonesHistorial || []).forEach((reg) => {
    if (reg.liga) sumarPuntos(reg.liga, "liga", "🏆 Liga Argentina", reg.año);
    if (reg.copa) sumarPuntos(reg.copa, "copa", "🏆 Copa Argentina", reg.año);
    if (reg.superCopa) sumarPuntos(reg.superCopa, "superCopa", "🏆 SuperCopa Argentina", reg.año);
    if (reg.trofeo) sumarPuntos(reg.trofeo, "trofeo", "🏆 Trofeo de Campeones", reg.año);
    if (reg.superCopaInt) sumarPuntos(reg.superCopaInt, "superCopaInt", "🏆 Super Copa Internacional", reg.año);
  });

  // Copas internacionales de clubes
  const NOMBRES_INTERNACIONALES = {
    Libertadores: "🏆 Copa Libertadores",
    Sudamericana: "🏆 Copa Sudamericana",
    Recopa: "🏆 Recopa Sudamericana",
    "Mundial de Clubes": "🌍 Mundial de Clubes",
  };
  (jugador.resultadosInternacionales || []).forEach((reg) => {
    if (reg.resultado !== "campeon") return;
    if (PUNTOS_TITULOS[reg.copa] === undefined) return; // copa todavía no tarifada
    const clubId = reg.club || jugador.club;
    sumarPuntos(clubId, reg.copa, NOMBRES_INTERNACIONALES[reg.copa] || `🏆 ${reg.copa}`, reg.año);
  });

  // Balón de Oro
  (jugador.balonesDeOro || []).forEach((reg) => {
    const clubId = reg.club || jugador.club;
    const año = reg.galaAño || reg.temporada;
    sumarPuntos(clubId, "balonDeOro", "🥇 Balón de Oro", año);
  });

  // Bota de Oro
  (jugador.botasDeOro || []).forEach((reg) => {
    const clubId = reg.club || jugador.club;
    const año = reg.temporada || reg.galaAño;
    sumarPuntos(clubId, "botaDeOro", "👢 Bota de Oro", año);
  });

  const puntosTotal = detalle.reduce((acc, d) => acc + d.subtotal, 0);
  const titulosTotales = detalle.reduce((acc, d) => acc + d.veces, 0);

  const partidosTotales = (jugador.stats.partidos || 0) + (jugador.statsAnuales?.partidos || 0);
  const golesTotales = (jugador.stats.goles || 0) + (jugador.statsAnuales?.goles || 0);
  const asistenciasTotales = (jugador.stats.asistencias || 0) + (jugador.statsAnuales?.asistencias || 0);

  return {
    detalle,
    titulosPorClub,
    puntosTotal,
    totales: {
      años: jugador.temporada || 1,
      partidos: partidosTotales,
      goles: golesTotales,
      asistencias: asistenciasTotales,
      titulos: titulosTotales,
      mediaMax: jugador.mediaMaxima || jugador.media || 0,
    },
  };
}

/**
 * Título de la carrera. Esto es una primera escala a ojo, pensada
 * para reaccionar tanto a los puntos totales como al hecho de haber
 * jugado (o no) una carrera larga. Es fácil de ajustar más adelante:
 * son solo tramos de puntos.
 */
function calcularTituloCarrera(resumen) {
  const puntos = resumen.puntosTotal;
  const partidos = resumen.totales.partidos;
  const mediaMax = resumen.totales.mediaMax;

  if (partidos < 15) return "Una Carrera Trunca";
  if (puntos === 0) return mediaMax >= 80 ? "El Que Nunca Brilló" : "Sin Pena ni Gloria";
  if (puntos < 150) return "Jugador de Recambio";
  if (puntos < 400) return "Referente del Plantel";
  if (puntos < 900) return "Ídolo de Club";
  if (puntos < 2000) return "Héroe Continental";
  if (puntos < 4000) return "Leyenda del Fútbol";
  return "El Mejor de la Historia";
}

// ============================================
// FLUJO PRINCIPAL: FINALIZAR CARRERA
// ============================================

function finalizarCarrera() {
  let jugador = Estado.obtener();
  if (!jugador) return;

  if (!jugador.retirado) {
    Estado.actualizar({ retirado: true });
    jugador = Estado.obtener();
  }

  // Todavía no existen las transferencias, así que esto simplemente
  // cierra el único club de la carrera con los datos finales. El día
  // que haya pases, cada club que quede con "hasta: null" se va a
  // cerrar acá de la misma forma cuando el jugador se vaya.
  const historialCerrado = (jugador.historialClubes || []).map((entry) => {
    if (entry.hasta !== null && entry.hasta !== undefined) return entry;
    return {
      ...entry,
      hasta: jugador.año,
      cariñoFinal: jugador.cariño,
      partidos: (jugador.stats.partidos || 0) + (jugador.statsAnuales?.partidos || 0),
    };
  });
  Estado.actualizar({ historialClubes: historialCerrado });
  jugador = Estado.obtener();

  const resumen = calcularResumenCarrera(jugador);
  mostrarCartelFinal(jugador, resumen);
}
window.finalizarCarrera = finalizarCarrera;

// ============================================
// CARTEL DORADO DE FIN DE CARRERA
// ============================================

function mostrarCartelFinal(jugador, resumen) {
  document.getElementById("pantalla-juego").hidden = true;

  const modal = document.getElementById("modal-final");
  const escudo = document.getElementById("final-escudo");
  const club = NOMBRES_CLUBES[jugador.club];

  if (club && club.escudo) {
    escudo.src = club.escudo;
    escudo.hidden = false;
    escudo.onerror = () => (escudo.hidden = true);
  } else {
    escudo.hidden = true;
  }

  document.getElementById("final-titulo").textContent = calcularTituloCarrera(resumen);
  modal.hidden = false;

  const boton = document.getElementById("final-ver-carrera");
  const irAlResumen = () => {
    modal.hidden = true;
    boton.removeEventListener("click", irAlResumen);
    mostrarResumenFinal(jugador, resumen);
  };
  boton.addEventListener("click", irAlResumen);
}

// ============================================
// PANTALLA DE RESUMEN COMPLETO
// ============================================

function mostrarResumenFinal(jugador, resumen) {
  document.getElementById("pantalla-resumen-final").hidden = false;

  document.getElementById("resumen-final-nombre").textContent = jugador.nombre;
  document.getElementById("resumen-final-dorsal").textContent = `#${jugador.dorsal}`;
  document.getElementById("resumen-final-titulo").textContent = calcularTituloCarrera(resumen);

  const club = NOMBRES_CLUBES[jugador.club];
  const escudo = document.getElementById("resumen-escudo-club");
  if (club && club.escudo) {
    escudo.src = club.escudo;
    escudo.hidden = false;
    escudo.onerror = () => (escudo.hidden = true);
  } else {
    escudo.hidden = true;
  }

  renderClubesResumen(jugador, resumen);
  renderSeleccionResumen(jugador);
  renderTotalesResumen(jugador, resumen);
  renderPuntosResumen(resumen);
}

function renderClubesResumen(jugador, resumen) {
  const contenedor = document.getElementById("resumen-final-clubes");
  contenedor.innerHTML = "";

  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[jugador.posicion];
  const statsClaves = (config?.statsSuperiores || []).slice(0, 2);

  (jugador.historialClubes || []).forEach((entry) => {
    const club = NOMBRES_CLUBES[entry.club];
    const cariño = entry.cariñoFinal ?? jugador.cariño ?? 0;
    const etapa = ETAPAS_CARIÑO.find((e) => cariño <= e.hasta) || ETAPAS_CARIÑO[ETAPAS_CARIÑO.length - 1];
    const statsTxt = statsClaves
      .map((s) => `${jugador.stats[s.clave] ?? 0}${(s.etiqueta || "")[0] || ""}`)
      .join(" ");
    const titulos = resumen.titulosPorClub[entry.club] || [];

    const fila = document.createElement("div");
    fila.className = "resumen-final__club-fila";
    fila.innerHTML = `
      <img class="resumen-final__club-escudo" src="${club?.escudo || ""}" alt="" ${club?.escudo ? "" : "hidden"} onerror="this.hidden=true">
      <div class="resumen-final__club-info">
        <div class="resumen-final__club-nombre">${club ? club.nombre : entry.club} (${entry.desde}-${entry.hasta ?? "presente"})</div>
        <div class="resumen-final__club-cariño">${etapa.nombre}</div>
        ${titulos.length ? `<div class="resumen-final__club-titulos">${titulos.join(" · ")}</div>` : ""}
      </div>
      <div class="resumen-final__club-stats">${entry.partidos ?? jugador.stats.partidos ?? 0}PJ ${statsTxt}</div>
    `;
    contenedor.appendChild(fila);
  });

  if (!(jugador.historialClubes || []).length) {
    contenedor.innerHTML = `<p class="resumen-final__vacio">Sin clubes registrados.</p>`;
  }
}

function renderSeleccionResumen(jugador) {
  const contenedor = document.getElementById("resumen-final-seleccion");
  const pais = PAISES_POR_ID[jugador.pais];

  contenedor.innerHTML = `
    <div class="resumen-final__club-fila">
      <img class="resumen-final__club-escudo" src="${pais?.bandera || ""}" alt="" ${pais?.bandera ? "" : "hidden"} onerror="this.hidden=true">
      <div class="resumen-final__club-info">
        <div class="resumen-final__club-nombre">${pais ? pais.nombre : "—"}</div>
        <div class="resumen-final__club-cariño">${ESTADOS_SELECCION[jugador.seleccion] || "—"}</div>
        <div class="resumen-final__vacio-nota">Todavía no existen las convocatorias a la Selección: esta sección se completa cuando sumemos esa mecánica.</div>
      </div>
    </div>
  `;
}

function renderTotalesResumen(jugador, resumen) {
  const contenedor = document.getElementById("resumen-final-totales");
  contenedor.innerHTML = "";

  const t = resumen.totales;
  const items = [
    { valor: t.años, etiqueta: "Años de carrera" },
    { valor: t.partidos, etiqueta: "Partidos" },
    { valor: t.goles, etiqueta: "Goles" },
    { valor: t.asistencias, etiqueta: "Asistencias" },
    { valor: t.titulos, etiqueta: "Títulos" },
    { valor: t.mediaMax, etiqueta: "Media Max." },
  ];
  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--global")));

  const valorMaxCont = document.getElementById("resumen-final-valor-max");
  valorMaxCont.innerHTML = `
    <span class="resumen-final__valor-max-numero">${formatearDinero(jugador.valorMaximo || jugador.valor || 0)}</span>
    <span class="resumen-final__valor-max-etiqueta">Valor más alto</span>
  `;
}

function renderPuntosResumen(resumen) {
  document.getElementById("resumen-final-puntos-numero").textContent = `${resumen.puntosTotal} pts`;

  const contenedor = document.getElementById("resumen-final-puntos-detalle");
  if (!resumen.detalle.length) {
    contenedor.innerHTML = `<p class="resumen-final__vacio">No ganaste títulos que sumen puntos en esta carrera.</p>`;
    return;
  }

  contenedor.innerHTML = resumen.detalle
    .map((d) => {
      const tamano = obtenerTamanoClub(d.club);
      const nombreClub = obtenerNombreClub(d.club);
      const veces = d.veces > 1 ? ` x${d.veces}` : "";
      return `
        <div class="resumen-final__puntos-fila">
          <span>${d.etiqueta}${veces} · ${nombreClub} (${tamano}, x${d.multiplicador})</span>
          <span>${d.subtotal} pts</span>
        </div>
      `;
    })
    .join("");
}

// ============================================
// "HACER OTRA CARRERA"
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const botonOtraCarrera = document.getElementById("resumen-final-otra-carrera");
  if (!botonOtraCarrera) return;

  botonOtraCarrera.addEventListener("click", () => {
    Estado.borrar();
    window.jugadorActual = null;
    location.reload();
  });
});