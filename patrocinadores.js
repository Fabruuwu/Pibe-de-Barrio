/**
 * patrocinadores.js
 * -----------------------------------------
 * Sistema de contratos de patrocinio personal (marcas reales).
 *
 * - Cada año, después de las galas de Balón/Bota de Oro, puede aparecer
 *   UNA oferta de patrocinio (probabilidad según tu rendimiento). Se
 *   presenta como una pantalla con forma de contrato: marca + logo +
 *   pago + cláusula de objetivo (goles/asistencias/atajadas/etc.) +
 *   cláusula de rivalidad (si aplica) + botón "Firmar" abajo a la
 *   derecha (mismo estilo que fichar por un club).
 * - Los contratos ya NO son de por vida: tienen una duración en años.
 *   Al vencer, desde la pantalla de "Contratos" (📄 en el HUD) se puede
 *   intentar renovar (con % de éxito según tu rendimiento reciente).
 * - Cada temporada se chequea si cumpliste el objetivo de la cláusula
 *   del contrato activo; si no, la marca cancela el contrato al
 *   arrancar el año siguiente (aviso emergente).
 * - Rivalidades entre marcas (Nike-Adidas, Samsung-Apple, etc.): no se
 *   pueden tener contratos con dos marcas rivales al mismo tiempo. Si
 *   firmás una mientras tenés la otra activa, el contrato viejo se
 *   rompe DE POR VIDA (esa marca no te vuelve a ofrecer nada), perdés
 *   25 de cariño y pagás una multa según el tier de la marca rota.
 * -----------------------------------------
 */

// El campo "logo" es la ruta a la imagen del patrocinador (mismo patrón
// que "escudo" en los clubes de data.js): por ahora queda vacío/placeholder
// y cuando tengamos los assets, se completa con la ruta, ej:
// "Patrocinadores/nike.png". Si la imagen no existe o no carga, el <img>
// se oculta solo (onerror) y no rompe nada.
const PATROCINADORES = [
  { nombre: "Nike", tier: "elite", pagoMin: 90000, pagoMax: 160000, logo: "" },
  { nombre: "Adidas", tier: "elite", pagoMin: 90000, pagoMax: 160000, logo: "" },
  { nombre: "Rolex", tier: "elite", pagoMin: 85000, pagoMax: 150000, logo: "" },
  { nombre: "Emirates", tier: "elite", pagoMin: 80000, pagoMax: 150000, logo: "" },
  { nombre: "Visa", tier: "elite", pagoMin: 82000, pagoMax: 150000, logo: "" },
  { nombre: "Mastercard", tier: "elite", pagoMin: 80000, pagoMax: 148000, logo: "" },
  { nombre: "Qatar Airways", tier: "elite", pagoMin: 78000, pagoMax: 145000, logo: "" },
  { nombre: "Coca-Cola", tier: "elite", pagoMin: 85000, pagoMax: 155000, logo: "" },
  { nombre: "Samsung", tier: "elite", pagoMin: 84000, pagoMax: 158000, logo: "" },
  { nombre: "Apple", tier: "elite", pagoMin: 88000, pagoMax: 160000, logo: "" },
  { nombre: "Santander", tier: "alta", pagoMin: 35000, pagoMax: 70000, logo: "" },
  { nombre: "Pepsi", tier: "alta", pagoMin: 30000, pagoMax: 65000, logo: "" },
  { nombre: "Puma", tier: "alta", pagoMin: 32000, pagoMax: 68000, logo: "" },
  { nombre: "Gatorade", tier: "alta", pagoMin: 30000, pagoMax: 62000, logo: "" },
  { nombre: "Under Armour", tier: "alta", pagoMin: 33000, pagoMax: 66000, logo: "" },
  { nombre: "New Balance", tier: "alta", pagoMin: 30000, pagoMax: 60000, logo: "" },
  { nombre: "Heineken", tier: "alta", pagoMin: 34000, pagoMax: 69000, logo: "" },
  { nombre: "Red Bull", tier: "alta", pagoMin: 36000, pagoMax: 70000, logo: "" },
  { nombre: "Movistar", tier: "media", pagoMin: 12000, pagoMax: 28000, logo: "" },
  { nombre: "Claro", tier: "media", pagoMin: 10000, pagoMax: 25000, logo: "" },
  { nombre: "Personal", tier: "media", pagoMin: 10000, pagoMax: 24000, logo: "" },
  { nombre: "PlayStation", tier: "media", pagoMin: 11000, pagoMax: 26000, logo: "" },
  { nombre: "Xbox", tier: "media", pagoMin: 11000, pagoMax: 26000, logo: "" },
  { nombre: "Banco Galicia", tier: "media", pagoMin: 12000, pagoMax: 27000, logo: "" },
  { nombre: "YPF", tier: "media", pagoMin: 13000, pagoMax: 29000, logo: "" },
  { nombre: "Mercado Libre", tier: "media", pagoMin: 14000, pagoMax: 30000, logo: "" },
  { nombre: "Quilmes", tier: "baja", pagoMin: 3000, pagoMax: 9000, logo: "" },
  { nombre: "Havanna", tier: "baja", pagoMin: 2500, pagoMax: 8000, logo: "" },
  { nombre: "Farmacity", tier: "baja", pagoMin: 2000, pagoMax: 7000, logo: "" },
  { nombre: "Gillette", tier: "baja", pagoMin: 1500, pagoMax: 6000, logo: "" },
  { nombre: "Rappi", tier: "baja", pagoMin: 2000, pagoMax: 7500, logo: "" },
  { nombre: "PedidosYa", tier: "baja", pagoMin: 1800, pagoMax: 7000, logo: "" },
  { nombre: "Arcor", tier: "baja", pagoMin: 1600, pagoMax: 6500, logo: "" },
  { nombre: "Freddo", tier: "baja", pagoMin: 1500, pagoMax: 6000, logo: "" },
];

const PATROCINADORES_POR_NOMBRE = Object.fromEntries(PATROCINADORES.map((p) => [p.nombre, p]));

// Rivalidades reales de marca. No hace falta declarar el par en los dos
// sentidos: sonRivales() ya chequea ambos lados.
const RIVALIDADES_PATROCINIO = [
  ["Nike", "Adidas"],
  ["Nike", "Puma"],
  ["Adidas", "Puma"],
  ["Under Armour", "Nike"],
  ["Samsung", "Apple"],
  ["Coca-Cola", "Pepsi"],
  ["Visa", "Mastercard"],
  ["PlayStation", "Xbox"],
  ["Movistar", "Claro"],
  ["Movistar", "Personal"],
  ["Claro", "Personal"],
  ["Rappi", "PedidosYa"],
  ["Emirates", "Qatar Airways"],
];

function sonRivales(marcaA, marcaB) {
  return RIVALIDADES_PATROCINIO.some(
    ([a, b]) => (a === marcaA && b === marcaB) || (a === marcaB && b === marcaA)
  );
}

function rivalesDe(marca) {
  return RIVALIDADES_PATROCINIO.filter(([a, b]) => a === marca || b === marca).map(([a, b]) => (a === marca ? b : a));
}

// Multa (en dólares) por romper un contrato de forma anticipada por firmar
// con una marca rival. Sube según el tier de la marca que se rompe.
const MULTAS_POR_TIER = {
  baja: [100000, 900000],
  media: [1000000, 2000000],
  alta: [2500000, 4000000],
  elite: [6000000, 10000000],
};

// Duración (en años) que ofrece cada tier al firmar/renovar.
const DURACION_POR_TIER = {
  baja: [1, 2],
  media: [2, 3],
  alta: [3, 4],
  elite: [4, 5],
};

function azarEntero(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function azarPatrocinio(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

function etiquetaTier(tier) {
  return { elite: "Marca Elite", alta: "Marca Top", media: "Marca Media", baja: "Marca Local" }[tier] || "Marca";
}

// ============================================
// PROBABILIDAD DE QUE APAREZCA UNA OFERTA ESTE AÑO
// ============================================
function probabilidadOfertaEsteAño(jugador) {
  const temporada = jugador.año - 1;
  const ganoBalon = (jugador.balonesDeOro || []).some((b) => b.temporada === temporada);
  const ganoBota = (jugador.botasDeOro || []).some((b) => b.temporada === temporada);
  const media = jugador.media || 0;

  if (ganoBalon) return 0.95;
  if (ganoBota) return 0.75;
  if (media >= 88) return 0.6;
  if (media >= 78) return 0.42;
  if (media >= 68) return 0.28;
  if (media >= 55) return 0.15;
  return 0.06;
}

// ============================================
// QUÉ TIER TE OFRECEN, SEGÚN TU MEDIA
// A menor media, más pesa "baja"; a mayor media, más pesan "alta"/"elite".
// No son tiers fijos por rango: es una distribución de probabilidad que se
// va corriendo hacia arriba a medida que la media sube.
// ============================================
function distribuirPesosPorMedia(media) {
  const m = Math.max(0, Math.min(99, media || 0));
  const pesos = {
    elite: Math.max(0, m - 55) * 1.9,
    alta: Math.max(4, m - 30) * 1.3,
    media: 100 - Math.abs(m - 55) * 1.1,
    baja: Math.max(4, 68 - m) * 1.6,
  };
  Object.keys(pesos).forEach((k) => {
    if (!(pesos[k] > 0)) pesos[k] = 4;
  });
  return pesos;
}

function elegirTierPorMedia(media) {
  const pesos = distribuirPesosPorMedia(media);
  const total = pesos.elite + pesos.alta + pesos.media + pesos.baja;
  let azar = Math.random() * total;
  for (const tier of ["elite", "alta", "media", "baja"]) {
    if (azar < pesos[tier]) return tier;
    azar -= pesos[tier];
  }
  return "media";
}

// ============================================
// CLÁUSULA DE OBJETIVO (según posición del jugador)
// ============================================
const RANGOS_CLAUSULA = {
  goles: [8, 20],
  asistencias: [4, 12],
  atajadas: [60, 140],
  vallasInvictas: [6, 14],
  recuperaciones: [70, 160],
};
const ETIQUETAS_CLAUSULA = {
  goles: (n) => `Marcar al menos ${n} goles en la temporada`,
  asistencias: (n) => `Dar al menos ${n} asistencias en la temporada`,
  atajadas: (n) => `Realizar al menos ${n} atajadas en la temporada`,
  vallasInvictas: (n) => `Mantener al menos ${n} vallas invictas en la temporada`,
  recuperaciones: (n) => `Sumar al menos ${n} recuperaciones en la temporada`,
};
const MULTIPLICADOR_CLAUSULA_TIER = { baja: 0.55, media: 0.8, alta: 1, elite: 1.3 };

function tiposDeClausulaSegunPosicion(posicion) {
  if (posicion === "arquero") return ["atajadas", "vallasInvictas"];
  if (posicion === "central") return ["vallasInvictas", "recuperaciones"];
  if (posicion === "enganche") return ["asistencias", "goles"];
  return ["goles", "asistencias"]; // delantero y cualquier otro caso
}

function generarClausula(jugador, tier) {
  const tipos = tiposDeClausulaSegunPosicion(jugador.posicion);
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const [min, max] = RANGOS_CLAUSULA[tipo];
  const mult = MULTIPLICADOR_CLAUSULA_TIER[tier] || 1;
  const objetivo = Math.max(1, Math.round(azarEntero(min, max) * mult));
  return { tipo, objetivo, etiqueta: ETIQUETAS_CLAUSULA[tipo](objetivo) };
}

function clausulaSeCumplio(clausula, snapshotTemporada) {
  if (!snapshotTemporada) return true; // si no jugó nada esa temporada, se le da el beneficio de la duda
  const valor = snapshotTemporada[clausula.tipo] || 0;
  return valor >= clausula.objetivo;
}

// ============================================
// ARMAR LA OFERTA
// ============================================
function elegirMarcaOferta(jugador) {
  const bloqueadas = jugador.patrociniosBloqueados || [];
  const activas = (jugador.patrocinios || []).filter((p) => p.estado !== "cancelado" && p.estado !== "vencido-perdido").map((p) => p.marca);
  const media = jugador.media || 0;

  for (let intento = 0; intento < 6; intento++) {
    const tier = elegirTierPorMedia(media);
    const pool = PATROCINADORES.filter((p) => p.tier === tier && !bloqueadas.includes(p.nombre) && !activas.includes(p.nombre));
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  // Fallback: cualquier marca disponible, de cualquier tier.
  const cualquiera = PATROCINADORES.filter((p) => !bloqueadas.includes(p.nombre) && !activas.includes(p.nombre));
  return cualquiera.length ? cualquiera[Math.floor(Math.random() * cualquiera.length)] : null;
}

function generarOfertaPatrocinio(jugador) {
  const marca = elegirMarcaOferta(jugador);
  if (!marca) return null;

  const pagoMensual = azarPatrocinio(marca.pagoMin, marca.pagoMax);
  const [durMin, durMax] = DURACION_POR_TIER[marca.tier] || [2, 3];
  const duracionAnios = azarEntero(durMin, durMax);
  const clausula = generarClausula(jugador, marca.tier);

  const contratoRivalActivo = (jugador.patrocinios || []).find(
    (p) => p.estado === "activo" && sonRivales(p.marca, marca.nombre)
  );

  return { marca, pagoMensual, duracionAnios, clausula, contratoRivalActivo };
}

// ============================================
// PANTALLA DE OFERTA (con forma de contrato)
// ============================================
function mostrarOfertaPatrocinioSiCorresponde(callback) {
  const jugador = Estado.obtener();
  const temporada = jugador.año - 1;
  if (temporada < 1) return false;
  if (!Array.isArray(jugador.patrocinios)) jugador.patrocinios = [];
  if (!Array.isArray(jugador.patrociniosBloqueados)) jugador.patrociniosBloqueados = [];
  if (!Array.isArray(jugador.patrociniosEvaluados)) jugador.patrociniosEvaluados = [];
  if (jugador.patrociniosEvaluados.includes(temporada)) return false;
  jugador.patrociniosEvaluados.push(temporada);

  if (Math.random() >= probabilidadOfertaEsteAño(jugador)) { Estado.guardar(); return false; }

  const oferta = generarOfertaPatrocinio(jugador);
  if (!oferta) { Estado.guardar(); return false; }
  Estado.guardar();

  const contenedor = document.getElementById("competition-container");
  if (!contenedor) return false;
  contenedor.hidden = false;

  const { marca, pagoMensual, duracionAnios, clausula, contratoRivalActivo } = oferta;
  const rivales = rivalesDe(marca.nombre);

  contenedor.innerHTML = `
    <div class="contrato-patrocinio">
      <span class="contrato-patrocinio__sello">📜 CONTRATO DE PATROCINIO</span>
      <div class="contrato-patrocinio__cabecera">
        ${marca.logo ? `<img class="contrato-patrocinio__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : `<div class="contrato-patrocinio__logo contrato-patrocinio__logo--vacio">${marca.nombre.charAt(0)}</div>`}
        <div>
          <h2 class="contrato-patrocinio__marca">${marca.nombre}</h2>
          <span class="contrato-patrocinio__tier contrato-patrocinio__tier--${marca.tier}">${etiquetaTier(marca.tier)}</span>
        </div>
      </div>
      <p class="contrato-patrocinio__intro">
        Representantes de <strong>${marca.nombre}</strong> se pusieron en contacto con vos: quieren
        sumarte como imagen de la marca. Este es el contrato que te ofrecen:
      </p>
      <div class="contrato-patrocinio__cuerpo">
        <div class="contrato-patrocinio__clausula">
          <span class="contrato-patrocinio__clausula-titulo">💰 Pago</span>
          <span>${typeof formatearDinero === "function" ? formatearDinero(pagoMensual / 1000000) : `$${pagoMensual}`}/mes durante ${duracionAnios} año${duracionAnios > 1 ? "s" : ""}</span>
        </div>
        <div class="contrato-patrocinio__clausula">
          <span class="contrato-patrocinio__clausula-titulo">🎯 Cláusula de rendimiento</span>
          <span>${clausula.etiqueta}. Si no se cumple, ${marca.nombre} puede cancelar el contrato al año siguiente.</span>
        </div>
        ${rivales.length ? `
        <div class="contrato-patrocinio__clausula contrato-patrocinio__clausula--rival">
          <span class="contrato-patrocinio__clausula-titulo">🚫 Cláusula de exclusividad</span>
          <span>Prohibido tener patrocinios activos con ${rivales.join(" o ")} mientras dure este contrato.</span>
        </div>` : ""}
        ${contratoRivalActivo ? `
        <div class="contrato-patrocinio__clausula contrato-patrocinio__clausula--peligro">
          <span class="contrato-patrocinio__clausula-titulo">⚠️ Conflicto directo</span>
          <span>
            Tenés un contrato activo con <strong>${contratoRivalActivo.marca}</strong>, rival directo de ${marca.nombre}.
            Firmar acá romperá ese contrato de por vida (no volverá a ofrecerte nada), perderás 25 de cariño
            y deberás pagar una multa de
            ${(() => { const [min, max] = MULTAS_POR_TIER[contratoRivalActivo.tier] || [0, 0]; return typeof formatearDinero === "function" ? `${formatearDinero(min / 1000000)} - ${formatearDinero(max / 1000000)}` : `$${min} - $${max}`; })()}.
          </span>
        </div>` : ""}
      </div>
      <div class="contrato-patrocinio__acciones">
        <button type="button" class="modal__boton modal__boton--secundario" id="patrocinio-rechazar">Rechazar</button>
        <button type="button" class="oferta-card__firmar" id="patrocinio-firmar">
          <span class="oferta-card__firmar-linea">Firmar</span>
          <span class="oferta-card__firmar-nota">Presioná para aceptar</span>
        </button>
      </div>
    </div>`;

  contenedor.querySelector("#patrocinio-firmar").addEventListener("click", () => {
    firmarContratoPatrocinio(jugador, oferta);
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    callback();
  });
  contenedor.querySelector("#patrocinio-rechazar").addEventListener("click", () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    callback();
  });

  return true;
}

function firmarContratoPatrocinio(jugador, oferta) {
  const { marca, pagoMensual, duracionAnios, clausula, contratoRivalActivo } = oferta;

  if (contratoRivalActivo) {
    if (!jugador.patrociniosBloqueados.includes(contratoRivalActivo.marca)) {
      jugador.patrociniosBloqueados.push(contratoRivalActivo.marca);
    }
    jugador.cariño = Math.max(0, (jugador.cariño || 0) - 25);
    const [min, max] = MULTAS_POR_TIER[contratoRivalActivo.tier] || [0, 0];
    const multa = azarEntero(min, max);
    jugador.dinero = Math.max(0, (jugador.dinero || 0) - multa);
    // El contrato roto por rivalidad se saca directamente de la lista.
    const indiceRoto = jugador.patrocinios.indexOf(contratoRivalActivo);
    if (indiceRoto !== -1) jugador.patrocinios.splice(indiceRoto, 1);
  }

  jugador.patrocinios.push({
    marca: marca.nombre,
    tier: marca.tier,
    pagoMensual,
    añoFirmado: jugador.año,
    duracionAnios,
    añoVencimiento: jugador.año + duracionAnios,
    clausula,
    estado: "activo",
  });
  Estado.guardar();
}

// ============================================
// VENCIMIENTOS (silencioso, se resuelve a mano desde "Contratos")
// ============================================
function actualizarVencimientosPatrocinios(jugador) {
  (jugador.patrocinios || []).forEach((contrato) => {
    if (contrato.estado === "activo" && jugador.año >= contrato.añoVencimiento) {
      contrato.estado = "vencido";
    }
  });
}

// ============================================
// CHEQUEO DE CLÁUSULAS AL EMPEZAR LA TEMPORADA
// Si no cumpliste el objetivo de la temporada recién terminada, la marca
// cancela el contrato (aviso emergente, uno por uno si hay varios).
// ============================================
function procesarClausulasPatrocinioSiCorresponde(callback) {
  const jugador = Estado.obtener();
  if (!Array.isArray(jugador.patrocinios)) jugador.patrocinios = [];
  actualizarVencimientosPatrocinios(jugador);

  const temporadaTerminada = jugador.año - 1;
  const snapshot = (jugador.historialTemporadas || []).find((t) => t.año === temporadaTerminada);

  const aCancelar = jugador.patrocinios.filter(
    (c) => c.estado === "activo" && snapshot && !clausulaSeCumplio(c.clausula, snapshot)
  );

  Estado.guardar();
  if (!aCancelar.length) return false;

  mostrarAvisosCancelacion(aCancelar, jugador, callback);
  return true;
}

function mostrarAvisosCancelacion(pendientes, jugador, callback) {
  if (!pendientes.length) { callback(); return; }
  const contrato = pendientes.shift();
  const razon = `no se cumplió la cláusula: ${contrato.clausula.etiqueta.toLowerCase()}`;
  if (!Array.isArray(jugador.patrociniosCancelacionesHistorial)) jugador.patrociniosCancelacionesHistorial = [];
  jugador.patrociniosCancelacionesHistorial.push(contrato.marca);
  // El contrato cancelado se saca directamente de la lista de patrocinios.
  const indice = jugador.patrocinios.indexOf(contrato);
  if (indice !== -1) jugador.patrocinios.splice(indice, 1);
  Estado.guardar();

  const marca = PATROCINADORES_POR_NOMBRE[contrato.marca] || { nombre: contrato.marca, logo: "" };
  mostrarAvisoPatrocinio({
    tipo: "cancelado",
    titulo: "Contrato cancelado",
    marca,
    mensaje: `Hemos decidido cancelar el contrato por ${razon}.`,
    onCerrar: () => mostrarAvisosCancelacion(pendientes, jugador, callback),
  });
}

// Popup genérico (cancelación / renovación) con logo de la marca.
function mostrarAvisoPatrocinio({ tipo, titulo, marca, mensaje, onCerrar }) {
  const overlay = document.createElement("div");
  overlay.className = "modal modal--aviso-patrocinio";
  overlay.innerHTML = `
    <div class="modal__tarjeta aviso-patrocinio aviso-patrocinio--${tipo}">
      ${marca && marca.logo ? `<img class="aviso-patrocinio__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : ""}
      <h2 class="aviso-patrocinio__titulo">${titulo}</h2>
      <p class="aviso-patrocinio__marca">${marca ? marca.nombre : ""}</p>
      <p class="aviso-patrocinio__mensaje">${mensaje}</p>
      <button type="button" class="modal__boton modal__boton--secundario" id="aviso-patrocinio-cerrar">Continuar</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#aviso-patrocinio-cerrar").addEventListener("click", () => {
    overlay.remove();
    if (typeof onCerrar === "function") onCerrar();
  });
}

// ============================================
// RENOVACIÓN (desde la pantalla de "Contratos")
// ============================================
function calcularChanceRenovacion(jugador, contrato) {
  const media = jugador.media || 0;
  const historial = jugador.historialNotas || [];
  const nota = historial.length ? historial[historial.length - 1] : 5;
  const cancelaciones = (jugador.patrociniosCancelacionesHistorial || []).length;

  let chance = 30;
  chance += (media - 60) * 1.1;
  chance += (nota - 6) * 9;
  chance += (jugador.cariño || 0) * 0.1;
  chance -= cancelaciones * 8;
  return Math.max(5, Math.min(95, Math.round(chance)));
}

function intentarRenovarContrato(indice, onResultado) {
  const jugador = Estado.obtener();
  const contrato = jugador.patrocinios[indice];
  if (!contrato) return;

  const chance = calcularChanceRenovacion(jugador, contrato);
  const exito = Math.random() * 100 < chance;
  const marca = PATROCINADORES_POR_NOMBRE[contrato.marca] || { nombre: contrato.marca, logo: "" };

  if (exito) {
    const [durMin, durMax] = DURACION_POR_TIER[contrato.tier] || [2, 3];
    contrato.duracionAnios = azarEntero(durMin, durMax);
    contrato.añoFirmado = jugador.año;
    contrato.añoVencimiento = jugador.año + contrato.duracionAnios;
    contrato.clausula = generarClausula(jugador, contrato.tier);
    contrato.pagoMensual = azarPatrocinio(marca.pagoMin || contrato.pagoMensual, marca.pagoMax || contrato.pagoMensual);
    contrato.estado = "activo";
  } else {
    jugador.patrocinios.splice(indice, 1);
  }
  Estado.guardar();

  mostrarAvisoPatrocinio({
    tipo: exito ? "renovado" : "no-renovado",
    titulo: exito ? "Renovaste" : "No renovaste",
    marca,
    mensaje: exito
      ? `${marca.nombre} decidió seguir apostando por vos por ${contrato.duracionAnios} año${contrato.duracionAnios > 1 ? "s" : ""} más.`
      : `${marca.nombre} decidió no continuar el vínculo. El contrato se perdió.`,
    onCerrar: () => { if (typeof onResultado === "function") onResultado(); },
  });
}

// ============================================
// TOTAL de patrocinios (se suma al sueldo en el resumen anual)
// ============================================
function obtenerIngresoAnualPatrocinios(jugador) {
  return (jugador.patrocinios || [])
    .filter((p) => p.estado === "activo")
    .reduce((acc, p) => acc + (p.pagoMensual || 0) * 12, 0);
}

// ============================================
// MODAL "Dinero": desglose de salario + cada patrocinio activo
// ============================================
function abrirModalDinero() {
  const jugador = Estado.obtener();
  const modal = document.getElementById("modal-dinero");
  const lista = document.getElementById("dinero-lista");
  const totalEl = document.getElementById("dinero-total");
  if (!modal || !lista) return;

  const salarioMensual = (jugador.contrato && jugador.contrato.salario) || 0;
  const filas = [
    { nombre: "Salario del club", pagoMensual: salarioMensual },
    ...(jugador.patrocinios || []).filter((p) => p.estado === "activo").map((p) => ({ nombre: `Contrato con ${p.marca}`, pagoMensual: p.pagoMensual })),
  ];

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

// ============================================
// MODAL "Contratos": todos los patrocinios, 1x1, con detalle al tocarlos
// ============================================
function etiquetaEstadoContrato(estado) {
  return {
    activo: { texto: "Activo", clase: "activo" },
    vencido: { texto: "Vencido", clase: "vencido" },
    cancelado: { texto: "Cancelado", clase: "cancelado" },
    "vencido-perdido": { texto: "No renovado", clase: "cancelado" },
  }[estado] || { texto: estado, clase: "" };
}

function abrirModalContratos() {
  const jugador = Estado.obtener();
  const modal = document.getElementById("modal-contratos");
  const lista = document.getElementById("contratos-lista");
  const vacio = document.getElementById("contratos-vacio");
  if (!modal || !lista) return;

  actualizarVencimientosPatrocinios(jugador);
  Estado.guardar();

  const contratos = jugador.patrocinios || [];
  lista.innerHTML = "";
  if (vacio) vacio.hidden = contratos.length > 0;

  contratos.forEach((contrato, indice) => {
    const marca = PATROCINADORES_POR_NOMBRE[contrato.marca] || { nombre: contrato.marca, logo: "" };
    const estado = etiquetaEstadoContrato(contrato.estado);
    const restantes = Math.max(0, contrato.añoVencimiento - jugador.año);

    const tarjeta = document.createElement("div");
    tarjeta.className = `contrato-item contrato-item--${estado.clase}`;
    tarjeta.innerHTML = `
      <button type="button" class="contrato-item__cabecera">
        ${marca.logo ? `<img class="contrato-item__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : `<div class="contrato-item__logo contrato-item__logo--vacio">${marca.nombre.charAt(0)}</div>`}
        <span class="contrato-item__nombre">${marca.nombre}</span>
        <span class="contrato-item__estado contrato-item__estado--${estado.clase}">${estado.texto}</span>
      </button>
      <div class="contrato-item__detalle" hidden>
        <p>💰 ${typeof formatearDinero === "function" ? formatearDinero(contrato.pagoMensual / 1000000) : `$${contrato.pagoMensual}`}/mes</p>
        <p>🎯 ${contrato.clausula ? contrato.clausula.etiqueta : "Sin cláusula registrada"}</p>
        <p>📅 ${contrato.estado === "activo" ? `Quedan ${restantes} año${restantes === 1 ? "" : "s"} de contrato (vence en ${contrato.añoVencimiento})` : `Firmado en ${contrato.añoFirmado}, duraba ${contrato.duracionAnios} año${contrato.duracionAnios > 1 ? "s" : ""}`}</p>
        ${contrato.razonCancelacion ? `<p class="contrato-item__razon">⚠️ Motivo: ${contrato.razonCancelacion}</p>` : ""}
        ${contrato.estado === "vencido" ? `
          <button type="button" class="contrato-item__renovar" data-indice="${indice}">Renovar</button>
          <p class="contrato-item__chance">Chances de éxito: ${calcularChanceRenovacion(jugador, contrato)}% (según tu rendimiento y media reciente)</p>
        ` : ""}
      </div>
    `;

    const cabecera = tarjeta.querySelector(".contrato-item__cabecera");
    const detalle = tarjeta.querySelector(".contrato-item__detalle");
    cabecera.addEventListener("click", () => { detalle.hidden = !detalle.hidden; });

    const botonRenovar = tarjeta.querySelector(".contrato-item__renovar");
    if (botonRenovar) {
      botonRenovar.addEventListener("click", (evento) => {
        evento.stopPropagation();
        intentarRenovarContrato(indice, () => abrirModalContratos());
      });
    }

    lista.appendChild(tarjeta);
  });

  modal.hidden = false;
  actualizarBadgeContratos(jugador);
}

function actualizarBadgeContratos(jugador) {
  const badge = document.getElementById("badge-contratos");
  if (!badge) return;
  actualizarVencimientosPatrocinios(jugador);
  const pendientes = (jugador.patrocinios || []).filter((p) => p.estado === "vencido").length;
  if (pendientes > 0) {
    badge.textContent = pendientes > 9 ? "9+" : String(pendientes);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modalDinero = document.getElementById("modal-dinero");
  if (modalDinero) {
    const cerrar = document.getElementById("dinero-cerrar");
    if (cerrar) cerrar.addEventListener("click", () => (modalDinero.hidden = true));
    modalDinero.addEventListener("click", (evento) => { if (evento.target === modalDinero) modalDinero.hidden = true; });
  }

  const modalContratos = document.getElementById("modal-contratos");
  if (modalContratos) {
    const cerrar = document.getElementById("contratos-cerrar");
    if (cerrar) cerrar.addEventListener("click", () => (modalContratos.hidden = true));
    modalContratos.addEventListener("click", (evento) => { if (evento.target === modalContratos) modalContratos.hidden = true; });
  }

  const botonContratos = document.getElementById("hud-boton-contratos");
  if (botonContratos) botonContratos.addEventListener("click", abrirModalContratos);
});