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
// que "escudo" en los clubes de data.js). El campo "pais" se usa para
// mostrar la bandera correspondiente (ver PAISES_A_BANDERA más abajo). Si
// el logo o la bandera no existen todavía o no cargan, el <img> se oculta
// solo (onerror) y no rompe nada.
const PATROCINADORES = [
  // ---- Tier ELITE ----
  { nombre: "Nike", tier: "elite", pagoMin: 90000, pagoMax: 160000, logo: "Patrocinadores1/Nike.png", pais: "Estados Unidos" },
  { nombre: "Adidas", tier: "elite", pagoMin: 90000, pagoMax: 160000, logo: "Patrocinadores1/Adidas.png", pais: "Alemania" },
  { nombre: "Rolex", tier: "elite", pagoMin: 85000, pagoMax: 150000, logo: "Patrocinadores1/Rolex.png", pais: "Suiza" },
  { nombre: "Emirates", tier: "elite", pagoMin: 80000, pagoMax: 150000, logo: "Patrocinadores1/Emirates.png", pais: "Emiratos Árabes Unidos" },
  { nombre: "Visa", tier: "elite", pagoMin: 82000, pagoMax: 150000, logo: "Patrocinadores1/Visa.png", pais: "Estados Unidos" },
  { nombre: "Mastercard", tier: "elite", pagoMin: 80000, pagoMax: 148000, logo: "Patrocinadores1/Mastercard.png", pais: "Estados Unidos" },
  { nombre: "Qatar Airways", tier: "elite", pagoMin: 78000, pagoMax: 145000, logo: "Patrocinadores1/Qatar.png", pais: "Catar" },
  { nombre: "Coca-Cola", tier: "elite", pagoMin: 85000, pagoMax: 155000, logo: "Patrocinadores1/CocaCola.png", pais: "Estados Unidos" },
  { nombre: "Samsung", tier: "elite", pagoMin: 84000, pagoMax: 158000, logo: "Patrocinadores1/Samsung.png", pais: "Corea del Sur" },
  { nombre: "Apple", tier: "elite", pagoMin: 88000, pagoMax: 160000, logo: "Patrocinadores1/Apple.png", pais: "Estados Unidos" },
  { nombre: "BMW", tier: "elite", pagoMin: 86000, pagoMax: 155000, logo: "Patrocinadores1/BMW.png", pais: "Alemania" },
  { nombre: "Toyota", tier: "elite", pagoMin: 83000, pagoMax: 150000, logo: "Patrocinadores1/Toyota.png", pais: "Japón" },
  { nombre: "EA Sports", tier: "elite", pagoMin: 80000, pagoMax: 148000, logo: "Patrocinadores1/Easports.png", pais: "Estados Unidos" },
  { nombre: "Louis Vuitton", tier: "elite", pagoMin: 92000, pagoMax: 165000, logo: "Patrocinadores1/LouisVuitton.png", pais: "Francia" },
  { nombre: "Amazon", tier: "elite", pagoMin: 85000, pagoMax: 152000, logo: "Patrocinadores1/Amazon.png", pais: "Estados Unidos" },

  // ---- Tier ALTA ----
  { nombre: "Santander", tier: "alta", pagoMin: 35000, pagoMax: 70000, logo: "Patrocinadores1/Santander.png", pais: "España" },
  { nombre: "Pepsi", tier: "alta", pagoMin: 30000, pagoMax: 65000, logo: "Patrocinadores1/Pepsi.png", pais: "Estados Unidos" },
  { nombre: "Puma", tier: "alta", pagoMin: 32000, pagoMax: 68000, logo: "Patrocinadores1/Puma.png", pais: "Alemania" },
  { nombre: "Gatorade", tier: "alta", pagoMin: 30000, pagoMax: 62000, logo: "Patrocinadores1/Gatorade.png", pais: "Estados Unidos" },
  { nombre: "Under Armour", tier: "alta", pagoMin: 33000, pagoMax: 66000, logo: "Patrocinadores1/UnderArmour.png", pais: "Estados Unidos" },
  { nombre: "New Balance", tier: "alta", pagoMin: 30000, pagoMax: 60000, logo: "Patrocinadores1/NewBalance.png", pais: "Estados Unidos" },
  { nombre: "Heineken", tier: "alta", pagoMin: 34000, pagoMax: 69000, logo: "Patrocinadores1/Heineken.png", pais: "Países Bajos" },
  { nombre: "Red Bull", tier: "alta", pagoMin: 36000, pagoMax: 70000, logo: "Patrocinadores1/Redbull.png", pais: "Austria" },
  { nombre: "Nintendo", tier: "alta", pagoMin: 35000, pagoMax: 70000, logo: "Patrocinadores1/Nintendo.png", pais: "Japón" },
  { nombre: "Spotify", tier: "alta", pagoMin: 34000, pagoMax: 68000, logo: "Patrocinadores1/Spotify.png", pais: "Suecia" },
  { nombre: "Audi", tier: "alta", pagoMin: 36000, pagoMax: 72000, logo: "Patrocinadores1/Audi.png", pais: "Alemania" },
  { nombre: "Umbro", tier: "alta", pagoMin: 30000, pagoMax: 61000, logo: "Patrocinadores1/Umbro.png", pais: "Reino Unido" },
  { nombre: "Monster Energy", tier: "alta", pagoMin: 32000, pagoMax: 65000, logo: "Patrocinadores1/Monsterenergy.png", pais: "Estados Unidos" },
  { nombre: "TAG Heuer", tier: "alta", pagoMin: 37000, pagoMax: 71000, logo: "Patrocinadores1/Tagheuer.png", pais: "Suiza" },
  { nombre: "Oakley", tier: "alta", pagoMin: 31000, pagoMax: 63000, logo: "Patrocinadores1/Oakley.png", pais: "Estados Unidos" },
  { nombre: "Mizuno", tier: "alta", pagoMin: 30000, pagoMax: 60000, logo: "Patrocinadores1/Mizuno.png", pais: "Japón" },
  { nombre: "Hyundai", tier: "alta", pagoMin: 33000, pagoMax: 66000, logo: "Patrocinadores1/Hyundai.png", pais: "Corea del Sur" },

  // ---- Tier MEDIA ----
  { nombre: "Movistar", tier: "media", pagoMin: 12000, pagoMax: 28000, logo: "Patrocinadores1/Movistar.png", pais: "España" },
  { nombre: "Claro", tier: "media", pagoMin: 10000, pagoMax: 25000, logo: "Patrocinadores1/Claro.png", pais: "México" },
  { nombre: "Personal", tier: "media", pagoMin: 10000, pagoMax: 24000, logo: "Patrocinadores1/Personal.png", pais: "Argentina" },
  { nombre: "PlayStation", tier: "media", pagoMin: 11000, pagoMax: 26000, logo: "Patrocinadores1/Playstation.png", pais: "Japón" },
  { nombre: "Xbox", tier: "media", pagoMin: 11000, pagoMax: 26000, logo: "Patrocinadores1/Xbox.png", pais: "Estados Unidos" },
  { nombre: "Banco Galicia", tier: "media", pagoMin: 12000, pagoMax: 27000, logo: "Patrocinadores1/BancoGalicia.png", pais: "Argentina" },
  { nombre: "YPF", tier: "media", pagoMin: 13000, pagoMax: 29000, logo: "Patrocinadores1/YPF.png", pais: "Argentina" },
  { nombre: "Mercado Libre", tier: "media", pagoMin: 14000, pagoMax: 30000, logo: "Patrocinadores1/MercadoLibre.png", pais: "Argentina" },
  { nombre: "Kappa", tier: "media", pagoMin: 12000, pagoMax: 27000, logo: "Patrocinadores1/Kappa.png", pais: "Italia" },
  { nombre: "Lotto", tier: "media", pagoMin: 11000, pagoMax: 25000, logo: "Patrocinadores1/Lotto.png", pais: "Italia" },
  { nombre: "Ualá", tier: "media", pagoMin: 13000, pagoMax: 28000, logo: "Patrocinadores1/Uala.png", pais: "Argentina" },
  { nombre: "Nubank", tier: "media", pagoMin: 14000, pagoMax: 29000, logo: "Patrocinadores1/Nubank.png", pais: "Brasil" },
  { nombre: "Konami", tier: "media", pagoMin: 12000, pagoMax: 26000, logo: "Patrocinadores1/Konami.png", pais: "Japón" },
  { nombre: "TCL", tier: "media", pagoMin: 10000, pagoMax: 24000, logo: "Patrocinadores1/Tcl.png", pais: "China" },
  { nombre: "Cabify", tier: "media", pagoMin: 11000, pagoMax: 25000, logo: "Patrocinadores1/Cabify.png", pais: "España" },
  { nombre: "Logitech", tier: "media", pagoMin: 13000, pagoMax: 27000, logo: "Patrocinadores1/Logitech.png", pais: "Suiza" },

  // ---- Tier BAJA ----
  { nombre: "Quilmes", tier: "baja", pagoMin: 3000, pagoMax: 9000, logo: "Patrocinadores1/Quilmes.png", pais: "Argentina" },
  { nombre: "Havanna", tier: "baja", pagoMin: 2500, pagoMax: 8000, logo: "Patrocinadores1/Havanna.png", pais: "Argentina" },
  { nombre: "Farmacity", tier: "baja", pagoMin: 2000, pagoMax: 7000, logo: "Patrocinadores1/Farmacity.png", pais: "Argentina" },
  { nombre: "Gillette", tier: "baja", pagoMin: 1500, pagoMax: 6000, logo: "Patrocinadores1/Gillette.png", pais: "Estados Unidos" },
  { nombre: "Rappi", tier: "baja", pagoMin: 2000, pagoMax: 7500, logo: "Patrocinadores1/Rappi.png", pais: "Colombia" },
  { nombre: "PedidosYa", tier: "baja", pagoMin: 1800, pagoMax: 7000, logo: "Patrocinadores1/Pedidosya.png", pais: "Uruguay" },
  { nombre: "Arcor", tier: "baja", pagoMin: 1600, pagoMax: 6500, logo: "Patrocinadores1/Arcor.png", pais: "Argentina" },
  { nombre: "Freddo", tier: "baja", pagoMin: 1500, pagoMax: 6000, logo: "Patrocinadores1/Freddo.png", pais: "Argentina" },
  { nombre: "Mostaza", tier: "baja", pagoMin: 2200, pagoMax: 7500, logo: "Patrocinadores1/Mostaza.png", pais: "Argentina" },
  { nombre: "Coto", tier: "baja", pagoMin: 2000, pagoMax: 7000, logo: "Patrocinadores1/Coto.png", pais: "Argentina" },
  { nombre: "Manaos", tier: "baja", pagoMin: 1800, pagoMax: 6800, logo: "Patrocinadores1/Manaos.png", pais: "Argentina" },
  { nombre: "Grido", tier: "baja", pagoMin: 1700, pagoMax: 6500, logo: "Patrocinadores1/Grido.png", pais: "Argentina" },
  { nombre: "Flybondi", tier: "baja", pagoMin: 2500, pagoMax: 8000, logo: "Patrocinadores1/Flybondi.png", pais: "Argentina" },
  { nombre: "Marolio", tier: "baja", pagoMin: 1500, pagoMax: 5800, logo: "Patrocinadores1/Marolio.png", pais: "Argentina" },
  { nombre: "Guaymallén", tier: "baja", pagoMin: 1400, pagoMax: 5500, logo: "Patrocinadores1/Guaymallen.png", pais: "Argentina" },
  { nombre: "Naranja X", tier: "baja", pagoMin: 2400, pagoMax: 8200, logo: "Patrocinadores1/Naranjax.png", pais: "Argentina" },

  // ---- 35 nuevos (tandas ELITE/ALTA/MEDIA/BAJA) ----
  // Tier ELITE (7)
  { nombre: "Aramco", tier: "elite", pagoMin: 95000, pagoMax: 170000, logo: "Patrocinadores1/Aramco.png", pais: "Arabia Saudita" },
  { nombre: "Porsche", tier: "elite", pagoMin: 89000, pagoMax: 160000, logo: "Patrocinadores1/Porsche.png", pais: "Alemania" },
  { nombre: "Microsoft", tier: "elite", pagoMin: 88000, pagoMax: 158000, logo: "Patrocinadores1/Microsoft.png", pais: "Estados Unidos" },
  { nombre: "Mercedes-Benz", tier: "elite", pagoMin: 86000, pagoMax: 154000, logo: "Patrocinadores1/Mercedesbenz.png", pais: "Alemania" },
  { nombre: "Sony", tier: "elite", pagoMin: 85000, pagoMax: 155000, logo: "Patrocinadores1/Sony.png", pais: "Japón" },
  { nombre: "Hublot", tier: "elite", pagoMin: 84000, pagoMax: 150000, logo: "Patrocinadores1/Hublot.png", pais: "Suiza" },
  { nombre: "Binance", tier: "elite", pagoMin: 80000, pagoMax: 145000, logo: "Patrocinadores1/Binance.png", pais: "Emiratos Árabes Unidos" },

  // Tier ALTA (10)
  { nombre: "Turkish Airlines", tier: "alta", pagoMin: 38000, pagoMax: 75000, logo: "Patrocinadores1/Turkishairlines.png", pais: "Turquía" },
  { nombre: "Netflix", tier: "alta", pagoMin: 37000, pagoMax: 72000, logo: "Patrocinadores1/Netflix.png", pais: "Estados Unidos" },
  { nombre: "TikTok", tier: "alta", pagoMin: 36000, pagoMax: 70000, logo: "Patrocinadores1/Tiktok.png", pais: "China" },
  { nombre: "Jeep", tier: "alta", pagoMin: 35000, pagoMax: 68000, logo: "Patrocinadores1/Jeep.png", pais: "Estados Unidos" },
  { nombre: "Asics", tier: "alta", pagoMin: 34000, pagoMax: 67000, logo: "Patrocinadores1/Asics.png", pais: "Japón" },
  { nombre: "DHL", tier: "alta", pagoMin: 34000, pagoMax: 66000, logo: "Patrocinadores1/Dhl.png", pais: "Alemania" },
  { nombre: "Michelin", tier: "alta", pagoMin: 33000, pagoMax: 65000, logo: "Patrocinadores1/Michelin.png", pais: "Francia" },
  { nombre: "Castrol", tier: "alta", pagoMin: 32000, pagoMax: 64000, logo: "Patrocinadores1/Castrol.png", pais: "Reino Unido" },
  { nombre: "Lenovo", tier: "alta", pagoMin: 31000, pagoMax: 62000, logo: "Patrocinadores1/Lenovo.png", pais: "China" },
  { nombre: "Pirelli", tier: "alta", pagoMin: 30000, pagoMax: 61000, logo: "Patrocinadores1/Pirelli.png", pais: "Italia" },

  // Tier MEDIA (10)
  { nombre: "Betsson", tier: "media", pagoMin: 15000, pagoMax: 32000, logo: "Patrocinadores1/Betsson.png", pais: "Suecia" },
  { nombre: "Burger King", tier: "media", pagoMin: 14000, pagoMax: 27000, logo: "Patrocinadores1/Burgerking.png", pais: "Estados Unidos" },
  { nombre: "DirecTV", tier: "media", pagoMin: 14000, pagoMax: 29000, logo: "Patrocinadores1/Directtv.png", pais: "Estados Unidos" },
  { nombre: "Aerolíneas Argentinas", tier: "media", pagoMin: 13000, pagoMax: 28000, logo: "Patrocinadores1/Aerolineasargentinas.png", pais: "Argentina" },
  { nombre: "Brahma", tier: "media", pagoMin: 13000, pagoMax: 27000, logo: "Patrocinadores1/Brahma.png", pais: "Brasil" },
  { nombre: "Rexona", tier: "media", pagoMin: 12000, pagoMax: 26000, logo: "Patrocinadores1/Rexona.png", pais: "Reino Unido" },
  { nombre: "Puma Energy", tier: "media", pagoMin: 12000, pagoMax: 26000, logo: "Patrocinadores1/Pumaenergy.png", pais: "Singapur" },
  { nombre: "Banco Macro", tier: "media", pagoMin: 11000, pagoMax: 25000, logo: "Patrocinadores1/Bancomacro.png", pais: "Argentina" },
  { nombre: "Topper", tier: "media", pagoMin: 11000, pagoMax: 25000, logo: "Patrocinadores1/Topper.png", pais: "Brasil" },
  { nombre: "Philco", tier: "media", pagoMin: 10000, pagoMax: 23000, logo: "Patrocinadores1/Philco.png", pais: "Argentina" },

  // Tier BAJA (8)
  { nombre: "Cencosud", tier: "baja", pagoMin: 2500, pagoMax: 8000, logo: "Patrocinadores1/Cencosud.png", pais: "Chile" },
  { nombre: "Noblex", tier: "baja", pagoMin: 2200, pagoMax: 7500, logo: "Patrocinadores1/Noblex.png", pais: "Argentina" },
  { nombre: "Zanella", tier: "baja", pagoMin: 2000, pagoMax: 7200, logo: "Patrocinadores1/Zanella.png", pais: "Argentina" },
  { nombre: "Paladini", tier: "baja", pagoMin: 2000, pagoMax: 7000, logo: "Patrocinadores1/Paladini.png", pais: "Argentina" },
  { nombre: "Cachafaz", tier: "baja", pagoMin: 1800, pagoMax: 6500, logo: "Patrocinadores1/Cachafaz.png", pais: "Argentina" },
  { nombre: "Vía Bariloche", tier: "baja", pagoMin: 1800, pagoMax: 6800, logo: "Patrocinadores1/Viabariloche.png", pais: "Argentina" },
  { nombre: "Flecha Bus", tier: "baja", pagoMin: 1700, pagoMax: 6000, logo: "Patrocinadores1/Flechabus.png", pais: "Argentina" },
  { nombre: "Baggio", tier: "baja", pagoMin: 1500, pagoMax: 5500, logo: "Patrocinadores1/Baggio.png", pais: "Argentina" },
];

// Mapeo país -> bandera, reutilizando las banderas de selecciones que ya
// existen en /Selecciones. Los que tienen "// FALTA" al lado son países sin
// asset todavía (Emiratos Árabes Unidos, China, Reino Unido no tienen
// selección propia cargada); cuando se agregue la imagen, solo hay que
// sumarla al mapa.
const PAISES_A_BANDERA = {
  "Argentina": "Selecciones/Argentina.png",
  "Alemania": "Selecciones/Alemania.png",
  "Austria": "Selecciones/Austria.png",
  "Brasil": "Selecciones/Brasil.png",
  "China": "Selecciones/China.png", // FALTA el asset
  "Colombia": "Selecciones/Colombia.png",
  "Corea del Sur": "Selecciones/Corea.png",
  "Emiratos Árabes Unidos": "Selecciones/EmiratosArabesUnidos.png", // FALTA el asset
  "España": "Selecciones/España.png",
  "Estados Unidos": "Selecciones/EstadosUnidos.png",
  "Francia": "Selecciones/Francia.png",
  "Italia": "Selecciones/Italia.png",
  "Japón": "Selecciones/Japon.png",
  "México": "Selecciones/Mexico.png",
  "Países Bajos": "Selecciones/PaisesBajos.png",
  "Catar": "Selecciones/Catar.png",
  "Reino Unido": "Selecciones/Inglaterra.png", // no hay bandera propia de Reino Unido en los assets, se usa Inglaterra como más cercana
  "Suecia": "Selecciones/Suecia.png",
  "Suiza": "Selecciones/Suiza.png",
  "Uruguay": "Selecciones/Uruguay.png",
};

function banderaDePais(pais) {
  return PAISES_A_BANDERA[pais] || "";
}

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
// PERO todos los tiers tienen un piso mínimo de peso: así, aunque tengas
// media baja, de vez en cuando cae una sorpresa de una marca top (y
// viceversa, un crack también puede recibir ofertas de marcas chicas).
// ============================================
function distribuirPesosPorMedia(media) {
  const m = Math.max(0, Math.min(99, media || 0));
  const pesos = {
    elite: Math.max(9, (m - 50) * 1.5),
    alta: Math.max(14, (m - 20) * 1.05),
    media: Math.max(20, 42 - Math.abs(m - 55) * 0.35),
    baja: Math.max(10, (70 - m) * 1.1),
  };
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
function elegirMarcaOferta(jugador, excluidasExtra) {
  const bloqueadas = jugador.patrociniosBloqueados || [];
  const activas = (jugador.patrocinios || []).filter((p) => p.estado !== "cancelado" && p.estado !== "vencido-perdido").map((p) => p.marca);
  const excluidas = excluidasExtra || [];
  const media = jugador.media || 0;

  for (let intento = 0; intento < 6; intento++) {
    const tier = elegirTierPorMedia(media);
    const pool = PATROCINADORES.filter((p) => p.tier === tier && !bloqueadas.includes(p.nombre) && !activas.includes(p.nombre) && !excluidas.includes(p.nombre));
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  // Fallback: cualquier marca disponible, de cualquier tier.
  const cualquiera = PATROCINADORES.filter((p) => !bloqueadas.includes(p.nombre) && !activas.includes(p.nombre) && !excluidas.includes(p.nombre));
  return cualquiera.length ? cualquiera[Math.floor(Math.random() * cualquiera.length)] : null;
}

function generarOfertaPatrocinio(jugador, excluidasExtra) {
  const marca = elegirMarcaOferta(jugador, excluidasExtra);
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
// CORREO: generar ofertas como mensajes (no bloquea el flujo de la
// temporada). Podés recibir entre 1 y 4 ofertas de golpe, cada una un
// mensaje aparte en el buzón. El sistema queda armado en general para
// poder sumar más tipos de mensaje a futuro (no solo patrocinios).
// ============================================
function generarOfertasPatrocinioSiCorresponde() {
  const jugador = Estado.obtener();
  const temporada = jugador.año - 1;
  if (temporada < 1) return;
  if (!Array.isArray(jugador.patrocinios)) jugador.patrocinios = [];
  if (!Array.isArray(jugador.patrociniosBloqueados)) jugador.patrociniosBloqueados = [];
  if (!Array.isArray(jugador.patrociniosEvaluados)) jugador.patrociniosEvaluados = [];
  if (!Array.isArray(jugador.correo)) jugador.correo = [];
  if (jugador.patrociniosEvaluados.includes(temporada)) return;
  jugador.patrociniosEvaluados.push(temporada);

  if (Math.random() >= probabilidadOfertaEsteAño(jugador)) { Estado.guardar(); return; }

  const cantidadOfertas = azarEntero(1, 4);
  const marcasUsadas = [];
  for (let i = 0; i < cantidadOfertas; i++) {
    const oferta = generarOfertaPatrocinio(jugador, marcasUsadas);
    if (!oferta) break; // ya no queda ninguna marca disponible
    marcasUsadas.push(oferta.marca.nombre);
    jugador.correo.unshift({
      id: `patrocinio-${jugador.año}-${i}-${Date.now()}`,
      tipo: "patrocinio",
      leido: false,
      año: jugador.año,
      oferta,
    });
  }
  Estado.guardar();
  if (typeof actualizarBadgeCorreo === "function") actualizarBadgeCorreo(jugador);
}

// ============================================
// TARJETA DE CONTRATO (se usa dentro del detalle de un mensaje de correo)
// ============================================
function renderizarTarjetaContrato(oferta, alFirmar, alRechazar) {
  const { marca, pagoMensual, duracionAnios, clausula, contratoRivalActivo } = oferta;
  const rivales = rivalesDe(marca.nombre);

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="contrato-patrocinio">
      <span class="contrato-patrocinio__sello">📜 CONTRATO DE PATROCINIO</span>
      <div class="contrato-patrocinio__cabecera">
        ${marca.logo ? `<img class="contrato-patrocinio__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : `<div class="contrato-patrocinio__logo contrato-patrocinio__logo--vacio">${marca.nombre.charAt(0)}</div>`}
        <div>
          <h2 class="contrato-patrocinio__marca">
            ${marca.nombre}
            ${banderaDePais(marca.pais) ? `<img class="bandera-mini" src="${banderaDePais(marca.pais)}" alt="${marca.pais}" title="${marca.pais}" onerror="this.hidden=true">` : ""}
          </h2>
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

  div.querySelector("#patrocinio-firmar").addEventListener("click", alFirmar);
  div.querySelector("#patrocinio-rechazar").addEventListener("click", alRechazar);
  return div;
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

function intentarRenovarContrato(indice, onResultado, bonoEntrevista) {
  const jugador = Estado.obtener();
  const contrato = jugador.patrocinios[indice];
  if (!contrato) return;

  const chance = Math.max(5, Math.min(97, Math.round(calcularChanceRenovacion(jugador, contrato) + (bonoEntrevista || 0))));
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
// ENTREVISTA DE RENOVACIÓN
// Mini-diálogo de 3 preguntas antes de tirar el dado de renovación. Cada
// respuesta suma/resta puntos de chance según cómo encares la charla
// (seguro y prolijo vs. jugado y arriesgado). No es un simple botón: primero
// tenés que "vender" tu renovación.
// ============================================
const PREGUNTAS_ENTREVISTA = [
  {
    pregunta: "El representante de la marca abre la charla: \"¿Cómo definirías tu temporada?\"",
    opciones: [
      { texto: "Mostrale los números fríos, sin vueltas", bono: (jugador) => Math.round(Math.max(-5, Math.min(15, ((jugador.media || 0) - 70) * 0.6))), detalle: "Jugada segura si tu media viene alta; floja si venís justo." },
      { texto: "Hablale con confianza de tu compromiso con la marca", bono: () => 6, detalle: "Una respuesta prolija, suma parejo siempre." },
      { texto: "Tirale un chiste para relajar el ambiente", bono: () => azarEntero(-4, 10), detalle: "Puede caer bien... o no. Es un tiro de dados." },
    ],
  },
  {
    pregunta: "\"¿Qué le podés ofrecer a la marca en este nuevo contrato?\"",
    opciones: [
      { texto: "Más presencia en redes y entrevistas", bono: () => 5, detalle: "Les gusta la exposición extra." },
      { texto: "Pedile directamente un contrato más grande", bono: () => -5, detalle: "Sincero, pero los pone incómodos." },
      { texto: "No prometas nada, dejá que decidan solos", bono: () => 0, detalle: "Neutral, ni suma ni resta." },
    ],
  },
  {
    pregunta: "Para cerrar la charla, ¿cómo te despedís?",
    opciones: [
      { texto: "Agradeciendo la confianza de todos estos años", bono: () => 4, detalle: "Simple y efectivo." },
      { texto: "Mencionando que tenés otras marcas interesadas", bono: () => azarEntero(-8, 12), detalle: "Jugada de póker: puede asustarlos o urgirlos a cerrar." },
      { texto: "Pidiendo unos días más para pensarlo", bono: () => -3, detalle: "La indecisión no suma puntos." },
    ],
  },
];

function iniciarEntrevistaRenovacion(indice) {
  const jugador = Estado.obtener();
  const contrato = jugador.patrocinios[indice];
  if (!contrato) return;
  const marca = PATROCINADORES_POR_NOMBRE[contrato.marca] || { nombre: contrato.marca, logo: "" };
  const chanceBase = calcularChanceRenovacion(jugador, contrato);

  const overlay = document.createElement("div");
  overlay.className = "modal modal--entrevista";
  document.body.appendChild(overlay);

  let bono = 0;
  let paso = 0;

  function pintarPregunta() {
    const p = PREGUNTAS_ENTREVISTA[paso];
    overlay.innerHTML = `
      <div class="modal__tarjeta entrevista">
        ${marca.logo ? `<img class="entrevista__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : `<div class="entrevista__logo entrevista__logo--vacio">${marca.nombre.charAt(0)}</div>`}
        <span class="entrevista__eyebrow">Negociación de renovación · ${marca.nombre}</span>
        <div class="entrevista__progreso">
          ${PREGUNTAS_ENTREVISTA.map((_, i) => `<span class="entrevista__punto ${i < paso ? "entrevista__punto--hecho" : ""} ${i === paso ? "entrevista__punto--activo" : ""}"></span>`).join("")}
        </div>
        <p class="entrevista__pregunta">${p.pregunta}</p>
        <div class="entrevista__opciones">
          ${p.opciones.map((op, i) => `
            <button type="button" class="entrevista__opcion" data-i="${i}">
              <span class="entrevista__opcion-texto">${op.texto}</span>
            </button>`).join("")}
        </div>
      </div>`;

    overlay.querySelectorAll(".entrevista__opcion").forEach((boton) => {
      boton.addEventListener("click", () => {
        const opcion = p.opciones[Number(boton.dataset.i)];
        bono += opcion.bono(jugador);
        paso++;
        if (paso < PREGUNTAS_ENTREVISTA.length) pintarPregunta();
        else pintarResumen();
      });
    });
  }

  function pintarResumen() {
    const chanceFinal = Math.max(5, Math.min(97, Math.round(chanceBase + bono)));
    overlay.innerHTML = `
      <div class="modal__tarjeta entrevista">
        ${marca.logo ? `<img class="entrevista__logo" src="${marca.logo}" alt="${marca.nombre}" onerror="this.hidden=true">` : `<div class="entrevista__logo entrevista__logo--vacio">${marca.nombre.charAt(0)}</div>`}
        <span class="entrevista__eyebrow">Negociación de renovación · ${marca.nombre}</span>
        <p class="entrevista__pregunta">Charla terminada. Así quedó tu chance de renovación:</p>
        <div class="entrevista__resultado">${chanceFinal}%</div>
        <button type="button" class="modal__boton modal__boton--secundario" id="entrevista-confirmar">Confirmar renovación</button>
      </div>`;
    overlay.querySelector("#entrevista-confirmar").addEventListener("click", () => {
      overlay.remove();
      intentarRenovarContrato(indice, () => abrirModalContratos(), bono);
    });
  }

  pintarPregunta();
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
  const bonusInversorEl = document.getElementById("dinero-bonus-inversor");
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

  // Inversor Financiero (tienda.js): +20% permanente sobre TODO el ingreso
  // (salario + patrocinios), igual que se aplica al cobrar en el resumen
  // anual (hud.js). Acá solo se muestra el total ya bonificado + el
  // texto verde exclusivo de este ítem.
  const tieneInversor = typeof tieneMejoraPermanente === "function" && tieneMejoraPermanente(jugador, "inversor");
  const totalMensualBase = filas.reduce((acc, f) => acc + f.pagoMensual, 0);
  const totalMensual = tieneInversor ? totalMensualBase * 1.20 : totalMensualBase;

  if (bonusInversorEl) bonusInversorEl.hidden = !tieneInversor;
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
        ${banderaDePais(marca.pais) ? `<img class="bandera-mini" src="${banderaDePais(marca.pais)}" alt="${marca.pais}" title="${marca.pais}" onerror="this.hidden=true">` : ""}
        <span class="contrato-item__estado contrato-item__estado--${estado.clase}">${estado.texto}</span>
      </button>
      <div class="contrato-item__detalle" hidden>
        <p>💰 ${typeof formatearDinero === "function" ? formatearDinero(contrato.pagoMensual / 1000000) : `$${contrato.pagoMensual}`}/mes</p>
        <p>🎯 ${contrato.clausula ? contrato.clausula.etiqueta : "Sin cláusula registrada"}</p>
        <p>📅 ${contrato.estado === "activo" ? `Quedan ${restantes} año${restantes === 1 ? "" : "s"} de contrato (vence en ${contrato.añoVencimiento})` : `Firmado en ${contrato.añoFirmado}, duraba ${contrato.duracionAnios} año${contrato.duracionAnios > 1 ? "s" : ""}`}</p>
        ${contrato.razonCancelacion ? `<p class="contrato-item__razon">⚠️ Motivo: ${contrato.razonCancelacion}</p>` : ""}
        ${contrato.estado === "vencido" ? `
          <button type="button" class="contrato-item__renovar" data-indice="${indice}">Negociar renovación</button>
          <p class="contrato-item__chance">Chance base: ${calcularChanceRenovacion(jugador, contrato)}% antes de la charla (varía según cómo la encares)</p>
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
        iniciarEntrevistaRenovacion(indice);
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

// ============================================
// BUZÓN DE CORREO (mensajes: por ahora solo ofertas de patrocinio, armado
// para poder sumar otros tipos de mensaje a futuro sin tocar el resto).
// ============================================
const ETIQUETA_ASUNTO_CORREO = {
  patrocinio: (msg) => `Recibiste una oferta de patrocinio de ${msg.oferta.marca.nombre}`,
};

function actualizarBadgeCorreo(jugador) {
  const badge = document.getElementById("badge-correo");
  if (!badge) return;
  const noLeidos = (jugador.correo || []).filter((m) => !m.leido).length;
  if (noLeidos > 0) {
    badge.textContent = noLeidos > 9 ? "9+" : String(noLeidos);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function renderizarListaCorreo() {
  const jugador = Estado.obtener();
  const lista = document.getElementById("correo-lista");
  const vacio = document.getElementById("correo-vacio");
  if (!lista) return;
  lista.innerHTML = "";
  const mensajes = jugador.correo || [];

  if (vacio) vacio.hidden = mensajes.length > 0;

  mensajes.forEach((msg) => {
    const asunto = (ETIQUETA_ASUNTO_CORREO[msg.tipo] || (() => "Nuevo mensaje"))(msg);
    const div = document.createElement("div");
    div.className = `correo__item ${msg.leido ? "" : "correo__item--no-leido"}`;
    div.innerHTML = `
      ${msg.leido ? "" : `<span class="correo__punto"></span>`}
      <span class="correo__icono">${msg.tipo === "patrocinio" ? "📩" : "✉️"}</span>
      <div class="correo__info">
        <span class="correo__asunto">${asunto}</span>
        <span class="correo__fecha">Año ${msg.año}</span>
      </div>
      <span class="correo__flecha">›</span>
    `;
    div.addEventListener("click", () => abrirDetalleCorreo(msg.id));
    lista.appendChild(div);
  });

  actualizarBadgeCorreo(jugador);
}

function abrirDetalleCorreo(idMensaje) {
  const jugador = Estado.obtener();
  const msg = (jugador.correo || []).find((m) => m.id === idMensaje);
  if (!msg) return;
  msg.leido = true;
  Estado.guardar();
  actualizarBadgeCorreo(jugador);

  const lista = document.getElementById("correo-lista");
  const vacio = document.getElementById("correo-vacio");
  if (vacio) vacio.hidden = true;
  if (!lista) return;
  lista.innerHTML = "";

  const volver = document.createElement("button");
  volver.type = "button";
  volver.className = "modal__boton modal__boton--secundario correo__volver";
  volver.textContent = "← Volver al buzón";
  volver.addEventListener("click", renderizarListaCorreo);
  lista.appendChild(volver);

  if (msg.tipo === "patrocinio") {
    const cerrarMensaje = () => {
      jugador.correo = (jugador.correo || []).filter((m) => m.id !== idMensaje);
      Estado.guardar();
      renderizarListaCorreo();
    };
    const tarjeta = renderizarTarjetaContrato(
      msg.oferta,
      () => { firmarContratoPatrocinio(jugador, msg.oferta); cerrarMensaje(); },
      cerrarMensaje
    );
    lista.appendChild(tarjeta);
  }
}

function abrirModalCorreo() {
  const modal = document.getElementById("modal-correo");
  if (!modal) return;
  renderizarListaCorreo();
  modal.hidden = false;
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

  const modalCorreo = document.getElementById("modal-correo");
  if (modalCorreo) {
    const cerrar = document.getElementById("correo-cerrar");
    if (cerrar) cerrar.addEventListener("click", () => (modalCorreo.hidden = true));
    modalCorreo.addEventListener("click", (evento) => { if (evento.target === modalCorreo) modalCorreo.hidden = true; });
  }

  const botonCorreo = document.getElementById("hud-boton-correo");
  if (botonCorreo) botonCorreo.addEventListener("click", abrirModalCorreo);
});