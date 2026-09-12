/**
 * tienda.js
 * -----------------------------------------
 * Tienda de mejoras compradas con jugador.dinero.
 * - Permanentes: se compran una vez, quedan para siempre.
 * - Temporales: activas por 1 temporada (se limpian solas al avanzar
 *   de año, en Estado.avanzarTemporada), se pueden recomprar.
 * - Fama: catálogo vacío a propósito, para una mecánica futura.
 *
 * Estructura en el jugador:
 *   jugador.tienda = {
 *     permanentes: ["terapeuta", "psicologo"],
 *     temporales: ["botines", "suplemento"],
 *   }
 *
 * Los efectos de las permanentes se leen directo en estado.js
 * (verificarRetiroAutomatico / penalización por edad) con
 * tieneMejoraPermanente(). Los efectos de las temporales se leen en
 * hud.js (mostrarResumenAnual) con obtenerMultiplicadorTienda().
 * -----------------------------------------
 */

const TIENDA_ITEMS = {
  permanentes: [
    {
      id: "terapeuta",
      nombre: "Terapeuta profesional",
      emoji: "🧠",
      precio: 13500000,
      descripcion: "Retrasa el declive de stats por edad: en vez de empezar a los 30, empieza a los 34.",
    },
    {
      id: "psicologo",
      nombre: "Psicólogo profesional",
      emoji: "🛋️",
      precio: 11800000,
      descripcion: "Las chances de retiro anticipado empiezan un año más tarde y son un 15% más bajas. El retiro forzado a los 45 no cambia.",
    },
    {
      id: "inversor",
      nombre: "Inversor Financiero",
      emoji: "📈",
      precio: 15500000,
      descripcion: "Aumenta un 20% de forma permanente el dinero que obtenés cada temporada (salario + patrocinios).",
    },
    {
      id: "camara",
      nombre: "Cámara Hiperbárica Personal",
      emoji: "🛌",
      precio: 16000000,
      descripcion: "Cualquier carta de mejora que suba Resistencia te da un 50% extra en esa ganancia.",
    },
    {
      id: "mentor",
      nombre: "Mentor de Leyenda",
      emoji: "🧙‍♂️",
      precio: 23200000,
      descripcion: "Todas las cartas de mejora dan un 50% extra de stats. Se suma al bonus de Joven Promesa si lo sos.",
    },
    {
      id: "scout",
      nombre: "Scout de Agente Personal",
      emoji: "🕵️‍♂️",
      precio: 10800000,
      descripcion: "En cada mercado de pases te garantiza al menos una oferta sorpresa de un club de categoría superior a la que tu media atraería normalmente.",
    },
  ],
  temporales: [
    { id: "botines", nombre: "Botines nuevos", emoji: "👟", precio: 1800000, statClave: "goles", bonus: 0.20, posiciones: ["delantero", "enganche"], descripcion: "+20% de goles esta temporada." },
    { id: "videosPases", nombre: "Videos de pases", emoji: "🎥", precio: 1800000, statClave: "asistencias", bonus: 0.20, posiciones: ["delantero", "enganche"], descripcion: "+20% de asistencias esta temporada." },
    { id: "guantes", nombre: "Guantes nuevos", emoji: "🧤", precio: 1500000, statClave: "atajadas", bonus: 0.20, posiciones: ["arquero"], descripcion: "+20% de atajadas esta temporada." },
    { id: "pivote", nombre: "Pivote de práctica", emoji: "🥅", precio: 1500000, statClave: "recuperaciones", bonus: 0.20, posiciones: ["central"], descripcion: "+20% de recuperaciones esta temporada." },
    { id: "defensaExtrema", nombre: "Sesión de defensa extrema", emoji: "🛡️", precio: 1800000, statClave: "vallasInvictas", bonus: 0.20, posiciones: ["central", "arquero"], descripcion: "+20% de vallas invictas esta temporada." },
    { id: "suplemento", nombre: "Suplemento energético", emoji: "⚡", precio: 2000000, statClave: "partidos", bonus: 0.30, posiciones: null, descripcion: "+30% de partidos jugados esta temporada." },
    { id: "pelotaParada", nombre: "Especialista en Pelota Parada", emoji: "🎯", precio: 1900000, posiciones: ["delantero", "enganche"], bonusFijo: { statClave: "goles", min: 4, max: 7 }, descripcion: "Entre 4 y 7 goles extra garantizados al final del resumen anual." },
  ],
  fama: [],
};

function tieneMejoraPermanente(jugador, id) {
  return !!(jugador.tienda && jugador.tienda.permanentes && jugador.tienda.permanentes.includes(id));
}

function tieneMejoraTemporal(jugador, id) {
  return !!(jugador.tienda && jugador.tienda.temporales && jugador.tienda.temporales.includes(id));
}

// Multiplicador acumulado a aplicar sobre una stat de producción anual
// (1 = sin cambio, 1.2 = +20%, etc.), según las mejoras temporales
// activas que afecten esa stat.
function obtenerMultiplicadorTienda(jugador, statClave) {
  if (!jugador.tienda || !Array.isArray(jugador.tienda.temporales)) return 1;
  let multiplicador = 1;
  TIENDA_ITEMS.temporales.forEach((item) => {
    if (item.statClave === statClave && jugador.tienda.temporales.includes(item.id)) {
      multiplicador += item.bonus;
    }
  });
  return multiplicador;
}

function azarTienda(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Bonus fijo (no porcentual) de una temporal, ej: Pelota Parada da entre
// 4 y 7 goles extra planos, no un %. Se tira una sola vez por temporada
// (se llama desde el bloque que ya se protege con statsAnuales.partidos===0).
function obtenerBonusFijoTienda(jugador, statClave) {
  if (!jugador.tienda || !Array.isArray(jugador.tienda.temporales)) return 0;
  let total = 0;
  TIENDA_ITEMS.temporales.forEach((item) => {
    if (item.bonusFijo && item.bonusFijo.statClave === statClave && jugador.tienda.temporales.includes(item.id)) {
      total += azarTienda(item.bonusFijo.min, item.bonusFijo.max);
    }
  });
  return total;
}

function itemAplicaAPosicion(item, posicion) {
  return !item.posiciones || item.posiciones.includes(posicion);
}

function comprarItemTienda(jugador, categoria, id) {
  const item = (TIENDA_ITEMS[categoria] || []).find((i) => i.id === id);
  if (!item) return { ok: false, motivo: "No existe ese ítem." };
  if (!Array.isArray(jugador.tienda?.permanentes)) { jugador.tienda = jugador.tienda || {}; jugador.tienda.permanentes = []; }
  if (!Array.isArray(jugador.tienda?.temporales)) { jugador.tienda = jugador.tienda || {}; jugador.tienda.temporales = []; }

  if (categoria === "permanentes" && jugador.tienda.permanentes.includes(id)) return { ok: false, motivo: "Ya tienes esta mejora." };
  if (categoria === "temporales" && jugador.tienda.temporales.includes(id)) return { ok: false, motivo: "Ya lo tienes." };
  if ((jugador.dinero || 0) < item.precio / 1000000) return { ok: false, motivo: "No te alcanza el dinero." };

  jugador.dinero = (jugador.dinero || 0) - item.precio / 1000000;
  if (categoria === "permanentes") jugador.tienda.permanentes.push(id);
  else if (categoria === "temporales") jugador.tienda.temporales.push(id);

  Estado.guardar();
  return { ok: true };
}

// ============================================
// UI
// ============================================
function renderizarItemTienda(jugador, categoria, item) {
  const yaComprado = categoria === "permanentes" ? tieneMejoraPermanente(jugador, item.id) : tieneMejoraTemporal(jugador, item.id);
  const div = document.createElement("div");
  div.className = `tienda__item ${yaComprado ? "tienda__item--comprado" : ""}`;
  div.innerHTML = `
    <span class="tienda__item-emoji">${item.emoji}</span>
    <div class="tienda__item-info">
      <span class="tienda__item-nombre">${item.nombre}</span>
      <span class="tienda__item-desc">${item.descripcion}</span>
      ${item.posiciones ? `<span class="tienda__item-exclusivo">Exclusivo: ${item.posiciones.join(", ")}</span>` : ""}
    </div>
    <button type="button" class="tienda__item-boton" ${yaComprado ? "disabled" : ""}>
      ${yaComprado ? (categoria === "permanentes" ? "Ya tienes esta mejora" : "Ya lo tienes") : `${typeof formatearDinero === "function" ? formatearDinero(item.precio / 1000000) : `$${item.precio}`}`}
    </button>
  `;
  if (!yaComprado) {
    div.querySelector(".tienda__item-boton").addEventListener("click", () => {
      const jugadorActual = Estado.obtener();
      const resultado = comprarItemTienda(jugadorActual, categoria, item.id);
      if (!resultado.ok) { alert(resultado.motivo); return; }
      pintarHUD(Estado.obtener());
      abrirModalTienda(categoria); // repinta la tienda para reflejar la compra
    });
  }
  return div;
}

function abrirModalTienda(categoriaInicial) {
  const jugador = Estado.obtener();
  const modal = document.getElementById("modal-tienda");
  if (!modal) return;

  const categoria = categoriaInicial || modal.dataset.categoriaActual || "permanentes";
  modal.dataset.categoriaActual = categoria;

  modal.querySelectorAll(".tienda__tab").forEach((tab) => {
    tab.classList.toggle("tienda__tab--activo", tab.dataset.categoria === categoria);
  });

  const dineroEl = document.getElementById("tienda-dinero-disponible");
  if (dineroEl) dineroEl.textContent = typeof formatearDinero === "function" ? formatearDinero(jugador.dinero || 0) : `$${jugador.dinero || 0}`;

  const lista = document.getElementById("tienda-lista");
  lista.innerHTML = "";

  const items = (TIENDA_ITEMS[categoria] || []).filter((item) => categoria !== "temporales" || itemAplicaAPosicion(item, jugador.posicion));

  if (categoria === "fama") {
    lista.innerHTML = `<p class="tienda__vacio">Todavía no hay nada acá. ¡Pronto!</p>`;
  } else if (items.length === 0) {
    lista.innerHTML = `<p class="tienda__vacio">No hay mejoras disponibles para tu posición en esta categoría.</p>`;
  } else {
    items.forEach((item) => lista.appendChild(renderizarItemTienda(jugador, categoria, item)));
  }

  modal.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("hud-boton-tienda");
  const modal = document.getElementById("modal-tienda");
  if (boton) boton.addEventListener("click", () => abrirModalTienda("permanentes"));
  if (modal) {
    const cerrar = document.getElementById("tienda-cerrar");
    if (cerrar) cerrar.addEventListener("click", () => (modal.hidden = true));
    modal.addEventListener("click", (evento) => { if (evento.target === modal) modal.hidden = true; });
    modal.querySelectorAll(".tienda__tab").forEach((tab) => {
      tab.addEventListener("click", () => abrirModalTienda(tab.dataset.categoria));
    });
  }
});

// ============================================
// ÍCONOS EN EL HUD (mejoras activas, arriba en el centro)
// ============================================
function pintarMejorasHud(jugador) {
  const contenedor = document.getElementById("hud-mejoras");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const permanentes = (jugador.tienda?.permanentes || []).map((id) => TIENDA_ITEMS.permanentes.find((i) => i.id === id)).filter(Boolean);
  const temporales = (jugador.tienda?.temporales || []).map((id) => TIENDA_ITEMS.temporales.find((i) => i.id === id)).filter(Boolean);

  if (permanentes.length) {
    const fila = document.createElement("div");
    fila.className = "hud-mejoras__fila";
    fila.innerHTML = `<span class="hud-mejoras__etiqueta">Mejoras Permanentes:</span> ${permanentes.map((i) => `<span class="hud-mejoras__icono" title="${i.nombre}">${i.emoji}</span>`).join("")}`;
    contenedor.appendChild(fila);
  }
  if (temporales.length) {
    const fila = document.createElement("div");
    fila.className = "hud-mejoras__fila";
    fila.innerHTML = `<span class="hud-mejoras__etiqueta">Mejora temporal:</span> ${temporales.map((i) => `<span class="hud-mejoras__icono" title="${i.nombre}">${i.emoji}</span>`).join("")}`;
    contenedor.appendChild(fila);
  }
}