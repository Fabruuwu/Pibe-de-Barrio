/**
 * patrocinadores.js
 * -----------------------------------------
 * Contratos de patrocinio personal (marcas ficticias, para no meterte
 * en temas de marcas registradas reales). Se ofrecen una vez por año,
 * después de que se resuelven las galas de Balón/Bota de Oro, con
 * probabilidad y "categoría" de marca según lo que ganaste esa
 * temporada. Son contratos de por vida: una vez firmados, generan
 * ingreso fijo todos los años (se suman al sueldo en el resumen y en
 * el detalle de "Dinero" del HUD).
 * -----------------------------------------
 */

// Nombres inventados a propósito (nada de marcas reales).
const PATROCINADORES = [
  { nombre: "Volt Energy", tier: "elite", pagoMin: 80000, pagoMax: 150000 },
  { nombre: "Andes Bank", tier: "elite", pagoMin: 70000, pagoMax: 140000 },
  { nombre: "Apex Sportswear", tier: "elite", pagoMin: 90000, pagoMax: 160000 },
  { nombre: "Rayo Motors", tier: "alta", pagoMin: 35000, pagoMax: 70000 },
  { nombre: "NorteCola", tier: "alta", pagoMin: 30000, pagoMax: 65000 },
  { nombre: "Titán Fit", tier: "alta", pagoMin: 32000, pagoMax: 68000 },
  { nombre: "Cumbre Seguros", tier: "media", pagoMin: 12000, pagoMax: 28000 },
  { nombre: "Pulso Telecom", tier: "media", pagoMin: 10000, pagoMax: 25000 },
  { nombre: "Estrella Airlines", tier: "media", pagoMin: 14000, pagoMax: 30000 },
  { nombre: "Vértigo Gaming", tier: "media", pagoMin: 11000, pagoMax: 26000 },
  { nombre: "Roble Muebles", tier: "baja", pagoMin: 3000, pagoMax: 9000 },
  { nombre: "Sabor Criollo", tier: "baja", pagoMin: 2500, pagoMax: 8000 },
  { nombre: "Kiosco 24hs", tier: "baja", pagoMin: 2000, pagoMax: 7000 },
  { nombre: "Barbería Vidal", tier: "baja", pagoMin: 1500, pagoMax: 6000 },
];

function azarPatrocinio(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

// Probabilidad de que aparezca UNA oferta este año + de qué categoría,
// según lo que ganaste en la temporada recién terminada.
function evaluarElegibilidadPatrocinio(jugador) {
  const temporada = jugador.año - 1;
  const ganoBalon = (jugador.balonesDeOro || []).some((b) => b.temporada === temporada);
  const ganoBota = (jugador.botasDeOro || []).some((b) => b.temporada === temporada);
  const historial = jugador.historialNotas || [];
  const ultimaNota = historial.length ? Number(historial[historial.length - 1]) : 0;

  if (ganoBalon) return { prob: 0.90, tiers: ["elite", "alta"] };
  if (ganoBota) return { prob: 0.70, tiers: ["alta", "media"] };
  if (ultimaNota >= 8) return { prob: 0.40, tiers: ["media", "alta"] };
  if (ultimaNota >= 6.5) return { prob: 0.20, tiers: ["media", "baja"] };
  return { prob: 0.08, tiers: ["baja"] };
}

function elegirMarcasAlAzar(tiers, excluidas, cantidad) {
  const pool = PATROCINADORES.filter((p) => tiers.includes(p.tier) && !excluidas.includes(p.nombre));
  const copia = [...pool];
  const elegidas = [];
  while (copia.length && elegidas.length < cantidad) {
    const i = Math.floor(Math.random() * copia.length);
    elegidas.push(copia.splice(i, 1)[0]);
  }
  return elegidas;
}

// Devuelve true si mostró la oferta (y ella misma llama a callback al
// terminar); false/undefined si no hay oferta este año.
function mostrarOfertaPatrocinioSiCorresponde(callback) {
  const jugador = Estado.obtener();
  const temporada = jugador.año - 1;
  if (temporada < 1) return false;
  if (!Array.isArray(jugador.patrocinios)) jugador.patrocinios = [];
  if (!Array.isArray(jugador.patrociniosEvaluados)) jugador.patrociniosEvaluados = [];
  if (jugador.patrociniosEvaluados.includes(temporada)) return false;
  jugador.patrociniosEvaluados.push(temporada);

  const { prob, tiers } = evaluarElegibilidadPatrocinio(jugador);
  if (Math.random() >= prob) { Estado.guardar(); return false; }

  const marcasYaFirmadas = jugador.patrocinios.map((p) => p.marca);
  const opciones = elegirMarcasAlAzar(tiers, marcasYaFirmadas, 3);
  if (opciones.length === 0) { Estado.guardar(); return false; }

  const contenedor = document.getElementById("competition-container");
  if (!contenedor) return false;
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card patrocinio-card">
      <span class="badge-copa">NUEVA MARCA</span>
      <h2>¡Te ofrecen un patrocinio!</h2>
      <p>Tu nivel llamó la atención de algunas marcas. Elegí con quién firmar (es un contrato de por vida) o rechazá todas.</p>
      <div class="patrocinio__opciones" id="patrocinio-opciones"></div>
      <button type="button" class="modal__boton modal__boton--secundario" id="patrocinio-rechazar">Rechazar todas</button>
    </div>`;

  const zona = contenedor.querySelector("#patrocinio-opciones");
  opciones.forEach((marca) => {
    const pagoMensual = azarPatrocinio(marca.pagoMin, marca.pagoMax);
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `patrocinio__opcion patrocinio__opcion--${marca.tier}`;
    boton.innerHTML = `
      <span class="patrocinio__marca">${marca.nombre}</span>
      <span class="patrocinio__tier">${etiquetaTier(marca.tier)}</span>
      <span class="patrocinio__pago">${typeof formatearDinero === "function" ? formatearDinero(pagoMensual / 1000000) : `$${pagoMensual}`}/mes</span>
    `;
    boton.addEventListener("click", () => {
      jugador.patrocinios.push({ marca: marca.nombre, tier: marca.tier, pagoMensual, añoFirmado: jugador.año });
      Estado.guardar();
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      callback();
    });
    zona.appendChild(boton);
  });

  contenedor.querySelector("#patrocinio-rechazar").addEventListener("click", () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    callback();
  });

  return true;
}

function etiquetaTier(tier) {
  return { elite: "Marca Elite", alta: "Marca Top", media: "Marca Media", baja: "Marca Local" }[tier] || "Marca";
}

// ============================================
// TOTAL de patrocinios (se suma al sueldo en el resumen anual)
// ============================================
function obtenerIngresoAnualPatrocinios(jugador) {
  return (jugador.patrocinios || []).reduce((acc, p) => acc + (p.pagoMensual || 0) * 12, 0);
}

// ============================================
// MODAL "Dinero": desglose de salario + cada patrocinio
// ============================================
function abrirModalDinero() {
  const jugador = Estado.obtener();
  const modal = document.getElementById("modal-dinero");
  const lista = document.getElementById("dinero-lista");
  const totalEl = document.getElementById("dinero-total");
  if (!modal || !lista) return;

  const salarioMensual = (jugador.contrato && jugador.contrato.salario) || 0;
  const filas = [{ nombre: "Salario del club", pagoMensual: salarioMensual }, ...(jugador.patrocinios || []).map((p) => ({ nombre: `Contrato con ${p.marca}`, pagoMensual: p.pagoMensual }))];

  const fmt = (millones) => (typeof formatearDinero === "function" ? formatearDinero(millones) : `$${(millones * 1000000).toLocaleString()}`);
  lista.innerHTML = filas.map((f) => `
    <div class="dinero__fila">
      <span class="dinero__nombre">${f.nombre}</span>
      <span class="dinero__monto">${fmt(f.pagoMensual / 1000000)}/mes <span class="dinero__anual">(= ${fmt((f.pagoMensual * 12) / 1000000)}/año)</span></span>
    </div>`).join("");

  const totalMensual = filas.reduce((acc, f) => acc + f.pagoMensual, 0);
  if (totalEl) totalEl.textContent = `Total: ${fmt(totalMensual / 1000000)}/mes (${fmt((totalMensual * 12) / 1000000)}/año)`;

  modal.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-dinero");
  if (modal) {
    const cerrar = document.getElementById("dinero-cerrar");
    if (cerrar) cerrar.addEventListener("click", () => (modal.hidden = true));
    modal.addEventListener("click", (evento) => { if (evento.target === modal) modal.hidden = true; });
  }
});
