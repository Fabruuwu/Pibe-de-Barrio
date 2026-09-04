document.addEventListener("DOMContentLoaded", () => {
  const jugador = Estado.cargar();
  if (jugador) pintarHUD(jugador);
  document.dispatchEvent(new CustomEvent("hud:listo", { detail: jugador }));
});

const NOMBRES_PAISES = {};
const PAISES_POR_ID = {};
if (typeof PAISES !== "undefined") {
  PAISES.forEach((p) => {
    NOMBRES_PAISES[p.id] = p.nombre;
    PAISES_POR_ID[p.id] = p;
  });
}
const NOMBRES_CLUBES = {};
if (typeof CLUBES_POR_DIVISION !== "undefined") {
  Object.values(CLUBES_POR_DIVISION).flat().forEach((c) => (NOMBRES_CLUBES[c.id] = c));
}
const NOMBRES_LIGAS = {};
if (typeof LIGAS_POR_PAIS !== "undefined") {
  Object.values(LIGAS_POR_PAIS).flat().forEach((l) => (NOMBRES_LIGAS[l.id] = l.nombre));
}

const ETAPAS_CARIÑO = [
  { hasta: 20, nombre: "Uno más" },
  { hasta: 40, nombre: "Cumplidor" },
  { hasta: 60, nombre: "Querido" },
  { hasta: 80, nombre: "Referente" },
  { hasta: 99, nombre: "Ídolo" },
  { hasta: 100, nombre: "Leyenda" },
];

const ESTADOS_SELECCION = {
  "sin-chances": "Sin chances",
  "ojo-puesto": "Ojo puesto",
  "en-carpeta": "En carpeta",
  titular: "Titular",
};

let eventosPendientes = 0;

// ============================================
// PINTADO DEL HUD
// ============================================

function pintarHUD(jugador) {
  const config = obtenerConfigPosicion(jugador.posicion);
  pintarCabecera(jugador);
  pintarEquipoYLiga(jugador);
  pintarBurbujasSuperiores(jugador, config);
  pintarAtributos(jugador, config);
  pintarBurbujasGlobales(jugador);
  pintarCariño(jugador);
  pintarSeleccion(jugador);
}

function obtenerConfigPosicion(posicion) {
  const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[posicion];
  if (!config) {
    console.warn(`No hay configuración cargada para la posición "${posicion}". Asegurate de cargar "posiciones/${posicion}.js"`);
    return { statsSuperiores: [], atributos: [] };
  }
  return config;
}

function pintarCabecera(jugador) {
  document.getElementById("hud-nombre").textContent = jugador.nombre;
  document.getElementById("hud-dorsal").textContent = `#${jugador.dorsal}`;
  document.getElementById("hud-media").textContent = jugador.media;

  const bandera = document.getElementById("hud-bandera");
  const pais = PAISES_POR_ID[jugador.pais];
  bandera.alt = pais ? pais.nombre : "";
  if (pais && pais.bandera) {
    bandera.src = pais.bandera;
    bandera.hidden = false;
    bandera.onerror = () => (bandera.hidden = true);
  } else {
    bandera.hidden = true;
  }
}

function pintarEquipoYLiga(jugador) {
  const club = NOMBRES_CLUBES[jugador.club];
  document.getElementById("hud-club").textContent = club ? club.nombre : "—";
  document.getElementById("hud-año").textContent = jugador.año;
  document.getElementById("hud-edad").textContent = `${jugador.edad} años`;
  document.getElementById("hud-liga").textContent = NOMBRES_LIGAS[jugador.liga] || "—";
  document.getElementById("hud-forma").textContent = "Normal";

  const escudo = document.getElementById("hud-escudo-club");
  if (club && club.escudo) {
    escudo.src = club.escudo;
    escudo.hidden = false;
    escudo.onerror = () => (escudo.hidden = true);
  } else {
    escudo.hidden = true;
  }
}

function pintarBurbujasSuperiores(jugador, config) {
  const contenedor = document.getElementById("hud-stats-superiores");
  contenedor.innerHTML = "";

  const items = [
    ...(config.statsSuperiores || []).map((s) => ({ valor: jugador.stats[s.clave] ?? 0, etiqueta: s.etiqueta })),
    { valor: jugador.stats.partidos ?? 0, etiqueta: "Partidos" },
    { valor: jugador.stats.titulos ?? 0, etiqueta: "Títulos" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--stat")));
}

function pintarAtributos(jugador, config) {
  const contenedor = document.getElementById("hud-atributos");
  contenedor.innerHTML = "";

  const items = [
    ...(config.atributos || []).map((a) => ({ valor: jugador.stats[a.clave] ?? 0, etiqueta: a.etiqueta })),
    { valor: jugador.stats.liderazgo ?? 0, etiqueta: "Liderazgo" },
    { valor: jugador.stats.resistencia ?? 0, etiqueta: "Resistencia" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--atributo")));
}

function pintarBurbujasGlobales(jugador) {
  const contenedor = document.getElementById("hud-globales");
  contenedor.innerHTML = "";

  const items = [
    { valor: formatearDinero(jugador.valor), etiqueta: "Valor" },
    { valor: formatearDinero(jugador.dinero), etiqueta: "Dinero" },
    { valor: "—", etiqueta: "Rival" },
  ];

  items.forEach((item) => contenedor.appendChild(crearBurbuja(item.valor, item.etiqueta, "burbuja--global")));
}

function crearBurbuja(valor, etiqueta, claseExtra) {
  const burbuja = document.createElement("div");
  burbuja.className = `burbuja ${claseExtra}`;
  burbuja.innerHTML = `
    <span class="burbuja__valor">${valor}</span>
    <span class="burbuja__etiqueta">${etiqueta}</span>
  `;
  return burbuja;
}

function formatearDinero(millones) {
  if (millones === undefined || millones === null || isNaN(millones)) return "$0";
  if (millones >= 1) return `$${millones.toFixed(1)}M`;
  return `$${Math.round(millones * 1000)}K`;
}

function pintarCariño(jugador) {
  const cariño = Math.max(0, Math.min(100, jugador.cariño ?? 0));
  const barra = document.getElementById("hud-cariño-barra");
  const etiqueta = document.getElementById("hud-cariño-etiqueta");
  const numero = document.getElementById("hud-cariño-numero");

  barra.style.width = `${cariño}%`;
  numero.textContent = cariño;

  const etapa = ETAPAS_CARIÑO.find((e) => cariño <= e.hasta) || ETAPAS_CARIÑO[ETAPAS_CARIÑO.length - 1];
  etiqueta.textContent = etapa.nombre;
}

function pintarSeleccion(jugador) {
  const bandera = document.getElementById("hud-bandera-seleccion");
  const pais = PAISES_POR_ID[jugador.pais];
  bandera.alt = pais ? pais.nombre : "";
  if (pais && pais.bandera) {
    bandera.src = pais.bandera;
    bandera.hidden = false;
    bandera.onerror = () => (bandera.hidden = true);
  } else {
    bandera.hidden = true;
  }

  document.getElementById("hud-estado-seleccion").textContent = ESTADOS_SELECCION[jugador.seleccion] || "Sin chances";
}

function capitalizar(texto) {
  return texto.split("-").map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1)).join("");
}

// ============================================
// CARTAS Y EVENTOS
// ============================================

function abrirModalCartas() {
  const cartas = generarCartas();
  const contenedor = document.getElementById("contenedor-cartas");
  contenedor.innerHTML = "";

  cartas.forEach((carta, index) => {
    const cartaDiv = document.createElement("div");
    cartaDiv.className = `carta carta--${carta.rareza}`;
    cartaDiv.innerHTML = `
      <div class="carta__etiqueta">${RAREZAS[carta.rareza].nombre}</div>
      <h3 class="carta__nombre">${carta.nombre}</h3>
      <p class="carta__desc">${carta.desc}</p>
      <div class="carta__stats">${carta.stats.map(s => `${s} +${carta.puntos}`).join(" · ")}</div>
    `;

    cartaDiv.addEventListener("click", () => {
      const resultado = aplicarCarta(Estado.obtener(), carta);
      pintarHUD(Estado.obtener());
      document.getElementById("modal-cartas").hidden = true;

      const rand = Math.random();
      if (rand < 0.25) eventosPendientes = 0;
      else if (rand < 0.85) eventosPendientes = 1;
      else if (rand < 0.95) eventosPendientes = 2;
      else eventosPendientes = 3;

      procesarEventos();
    });

    contenedor.appendChild(cartaDiv);
  });

  document.getElementById("modal-cartas").hidden = false;
}

// En procesarEventos: después de la liga/copa, procesar copas pendientes antes del resumen
function procesarEventos() {
  if (eventosPendientes > 0) {
    eventosPendientes--;
    mostrarEvento();
  } else {
    const jugador = Estado.obtener();
    const año = jugador.año;

    const resultadoLiga = simularLiga(jugador);
    
    let resultadoCopa = null;
    const simCopa = simularCopaArgentina(jugador);
    if (simCopa.enFinal) {
      resultadoCopa = { enFinal: true, rival: simCopa.rival, resultado: null };
    } else {
      resultadoCopa = { enFinal: false, ronda: simCopa.ronda || "Eliminado" };
    }

    mostrarResultadoLiga(resultadoLiga, (resLiga) => {
      jugador.resultadoLiga = resLiga;
      if (resLiga.esCampeon) jugador.stats.titulos++;

      if (!jugador.campeonesHistorial) jugador.campeonesHistorial = [];
      const especialesDelAño = (jugador.resultadoCopasEspeciales || []).filter(c => c.año === año);
      const nuevaEntrada = { año, liga: jugador.club, copa: null, superCopa: null, trofeo: null, superCopaInt: null };
      especialesDelAño.forEach((c) => {
        if (c.resultado !== "campeon") return;
        if (c.tipo === "supercopa") nuevaEntrada.superCopa = jugador.club;
        if (c.tipo === "trofeo") nuevaEntrada.trofeo = jugador.club;
        if (c.tipo === "supercopaInt") nuevaEntrada.superCopaInt = jugador.club;
      });
      jugador.campeonesHistorial.push(nuevaEntrada);

      if (resultadoCopa.enFinal) {
        mostrarResultadoCopa(resultadoCopa, (resCopa) => {
          const hist = jugador.campeonesHistorial.find(h => h.año === año);
          hist.copa = resCopa.esCampeon ? jugador.club : null;
          if (resCopa.esCampeon) jugador.stats.titulos++;
          jugador.resultadoCopa = resCopa;

          agendarProximasCopas(jugador, año, resLiga, resCopa);
          procesarCopasPendientes(() => {
            Estado.guardar();
            mostrarResumenAnual();
          });
        });
      } else {
        const hist = jugador.campeonesHistorial.find(h => h.año === año);
        hist.copa = null;
        jugador.resultadoCopa = { esCampeon: false, ronda: resultadoCopa.ronda || "Eliminado" };
        agendarProximasCopas(jugador, año, resLiga, { esCampeon: false });
        ejecutarInternacionales(() => {
          procesarCopasPendientes(() => {
            Estado.guardar();
            mostrarResumenAnual();
          });
        });
      }
    });
  }
}

function mostrarEvento() {
  const contenedor = document.getElementById("evento-container");
  if (!contenedor) return;

  const evento = generarEvento();
  contenedor.innerHTML = `
    <h3 class="evento-titulo">${evento.titulo}</h3>
    <p class="evento-descripcion">${evento.descripcion}</p>
    <div class="evento-opciones"></div>
  `;

  const opcionesDiv = contenedor.querySelector(".evento-opciones");

  evento.opciones.forEach((opcion, index) => {
    const boton = document.createElement("button");
    boton.className = "evento-opcion";
    boton.textContent = opcion.texto;
    boton.addEventListener("click", () => {
      const mensaje = aplicarEvento(Estado.obtener(), evento, index);
      pintarHUD(Estado.obtener());

      contenedor.innerHTML = "";
      contenedor.hidden = true;

      procesarEventos();
    });
    opcionesDiv.appendChild(boton);
  });

  contenedor.hidden = false;
}

// ============================================
// RANGOS Y TÍTULOS
// ============================================

function obtenerRangosGolesAsist(media) {
  let golesMin, golesMax, asisMin, asisMax;
  if (media >= 40 && media <= 55) { golesMin=0; golesMax=2; asisMin=0; asisMax=1; }
  else if (media >= 56 && media <= 65) { golesMin=0; golesMax=9; asisMin=0; asisMax=6; }
  else if (media >= 66 && media <= 75) { golesMin=2; golesMax=17; asisMin=1; asisMax=15; }
  else if (media >= 76 && media <= 80) { golesMin=3; golesMax=19; asisMin=2; asisMax=17; }
  else if (media >= 81 && media <= 85) { golesMin=5; golesMax=30; asisMin=3; asisMax=24; }
  else if (media >= 86 && media <= 90) { golesMin=8; golesMax=39; asisMin=5; asisMax=30; }
  else if (media >= 91 && media <= 95) { golesMin=12; golesMax=60; asisMin=9; asisMax=39; }
  else if (media >= 95 && media <= 99) { golesMin=18; golesMax=85; asisMin=15; asisMax=60; }
  else { golesMin=0; golesMax=0; asisMin=0; asisMax=0; }

  return { golesMin, golesMax, asisMin, asisMax };
}

function obtenerBonusResistencia(resistencia) {
  if (resistencia <= 30) return { partidos: -10, goles: -3, asistencias: -2 };
  if (resistencia <= 40) return { partidos: -5, goles: -1, asistencias: -1 };
  if (resistencia <= 55) return { partidos: 0, goles: 0, asistencias: 0 };
  if (resistencia <= 65) return { partidos: 5, goles: 2, asistencias: 1 };
  if (resistencia <= 75) return { partidos: 10, goles: 4, asistencias: 2 };
  if (resistencia <= 85) return { partidos: 15, goles: 6, asistencias: 3 };
  if (resistencia <= 95) return { partidos: 20, goles: 8, asistencias: 4 };
  return { partidos: 30, goles: 12, asistencias: 8 };
}

function obtenerTituloPorGoles(goles, nombre, club) {
  if (goles < 5) {
    const opciones = [
      { titulo: "PÓLVORA MOJADA", texto: `Temporada para el olvido de ${nombre} en ${club}. Apenas ${goles} gritos y la hinchada pierde la paciencia.` },
      { titulo: "FANTASMA EN LA CANCHA", texto: `Un año intrascendente. Solo ${goles} goles y más dudas que certezas sobre su futuro profesional.` },
      { titulo: "¿PESA LA CAMISETA?", texto: `El pibe no termina de arrancar. Temporada flojísima con ${goles} goles y murmullos en la tribuna.` },
      { titulo: "CON LA BRÚJULA ROTA", texto: `Poca participación y nula efectividad. ${nombre} cierra el año con ${goles} goles y rumores de salida.` },
      { titulo: "AÑO PARA EL OLVIDO", texto: `Entre malas decisiones y bajones de nivel, apenas mojó ${goles} veces. Toca replantearse todo.` },
      { titulo: "MUCHO RUIDO, POCAS NUECES", texto: `Las expectativas estaban altas, pero los ${goles} goles en todo el año dejaron sabor a nada.` },
      { titulo: "EN EL OJO DE LA TORMENTA", texto: `Rendimiento bajísimo. Los ${goles} goles marcados no justifican su titularidad.` },
      { titulo: "FALTO DE CONFIANZA", texto: `Se lo notó errático frente al arco. Apenas ${goles} tantos y una moral que necesita recuperarse urgente.` }
    ];
    return opciones[Math.floor(Math.random() * opciones.length)];
  }
  if (goles < 13) {
    const opciones = [
      { titulo: "NI FU NI FA", texto: `Temporada de transición. Marcó ${goles} goles, cumplió, pero los hinchas saben que puede dar mucho más.` },
      { titulo: "APROBADO RASPANDO", texto: `Un año de altibajos en ${club}. Sus ${goles} goles ayudaron, aunque faltó esa chispa de crack.` },
      { titulo: "SILENCIOSO PERO EFECTIVO", texto: `Sin grandes tapas de diarios, ${nombre} aportó ${goles} goles útiles para el equipo.` },
      { titulo: "DE MENOR A MAYOR", texto: `Le costó el arranque, pero terminó salvando la ropa con ${goles} gritos en la temporada.` },
      { titulo: "UN OBRERO DEL GOL", texto: `Temporada trabajada y sacrificada. Los ${goles} goles demuestran que siempre intenta y va para adelante.` },
      { titulo: "MANTENIENDO EL NIVEL", texto: `Ni desastre ni figura excluyente. Cierra su año con ${goles} goles y un aprobado general.` },
      { titulo: "A MITAD DE CAMINO", texto: `Alternó buenas y malas. ${goles} goles que sirven para quedarse, pero no para ser el ídolo del club.` },
      { titulo: "EL CUMPLIDOR", texto: `Siempre que se lo necesitó, estuvo. Año sólido con ${goles} anotaciones en su cuenta personal.` }
    ];
    return opciones[Math.floor(Math.random() * opciones.length)];
  }
  if (goles < 26) {
    const opciones = [
      { titulo: "EL DUEÑO DE LOS APLAUSOS", texto: `Gran año. Con ${goles} goles, ${nombre} ya se ganó el cariño incondicional de la tribuna.` },
      { titulo: "LA CARTA GANADORA", texto: `Cuando las papas quemaban, él apareció. Temporada fantástica coronada con ${goles} goles.` },
      { titulo: "NACIDO PARA ESTO", texto: `El pibe no para de crecer. Sus ${goles} goles reafirman que tiene futuro de Selección.` },
      { titulo: "A PURO FUEGO", texto: `Intratable dentro del área. Cierra una temporada tremenda mandando la pelota a la red ${goles} veces.` },
      { titulo: "EL REFERENTE DEL ATAQUE", texto: `Temporada de consagración absoluta. Sus ${goles} gritos sagrados lo ponen entre los mejores de la liga.` },
      { titulo: "UNA PESADILLA PARA LA DEFENSA", texto: `Nadie lo pudo frenar este año. Su velocidad y sus ${goles} goles meten miedo en todo el país.` },
      { titulo: "VALE CADA CENTAVO", texto: `Su valor de mercado se dispara tras una campaña brillante de ${goles} goles vistiendo estos colores.` },
      { titulo: "ÍDOLO EN CONSTRUCCIÓN", texto: `La hinchada ya corea su nombre en cada partido. Gran temporada anotando ${goles} tantos decisivos.` }
    ];
    return opciones[Math.floor(Math.random() * opciones.length)];
  }
  const opciones = [
    { titulo: "DE OTRO PLANETA", texto: `Una bestialidad. ${nombre} rompe todos los esquemas con ${goles} goles en un solo año. ¡Histórico!` },
    { titulo: "EL REY DE " + club, texto: `Simplemente imparable. Sus ${goles} goles quedarán grabados para siempre en la memoria del hincha.` },
    { titulo: "MÁQUINA DE HACER GOLES", texto: `Las estadísticas no mienten. Temporada de leyenda absoluta inflando la red ${goles} veces.` },
    { titulo: "TOCADO POR LA VARITA", texto: `Todo lo que toca es gol. Cierra un año soñado con ${goles} gritos que valen campeonatos.` },
    { titulo: "FÚTBOL CHAMPAGNE", texto: `Exhibición total a lo largo de todo el calendario. Sus ${goles} goles fueron verdaderas obras de arte.` },
    { titulo: "LEYENDA VIVIENTE", texto: `Los números hablan por sí solos. ${goles} goles en una temporada que se estudiará en los libros de historia del fútbol.` }
  ];
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function obtenerTituloGeneral(nombre, club) {
  const opciones = [
    { titulo: "EL DUEÑO DEL VESTUARIO", texto: `Con o sin la cinta, ${nombre} fue el motor anímico de ${club} durante toda la temporada.` },
    { titulo: "VOZ DE MANDO", texto: `Demostró que no solo sabe jugar, sino también guiar a sus compañeros en los momentos más calientes del año.` },
    { titulo: "EL ALMA DE " + club, texto: `Corrió, metió y contagió al resto. Una temporada donde dejó la vida en cada pelota disputada.` },
    { titulo: "FALTA DE PESO", texto: `Se esperaba que asuma el liderazgo del equipo, pero terminó siendo uno más del montón este año.` },
    { titulo: "PECHO FRÍO", texto: `Dura crítica del periodismo: en los partidos clave de la temporada, se borró por completo.` },
    { titulo: "UN TRACTOR EN LA CANCHA", texto: `Su resistencia física fue clave. Jugó casi todos los partidos del año y nunca bajó el ritmo.` },
    { titulo: "LA PAUSA NECESARIA", texto: `Manejó los hilos de ${club} con una inteligencia táctica brutal, haciendo jugar a todos a su ritmo.` },
    { titulo: "EL CORRECAMINOS", texto: `Desequilibrante y veloz. Volvió locos a los rivales por la banda a lo largo de todo el calendario.` },
    { titulo: "PULMONES DE ACERO", texto: `Cuando los demás se quedaban sin aire, él seguía pidiendo la pelota. Año de puro sacrificio y entrega.` },
    { titulo: "FUERA DE FORMA", texto: `Se lo notó pesado y lento en tramos claves. Físicamente quedó en deuda con el cuerpo técnico.` },
    { titulo: "ROMANCE EN LAS TRIBUNAS", texto: `La gente lo ama incondicionalmente. Una temporada donde la conexión con el hincha fue total.` },
    { titulo: "EL MIMO DE LA GENTE", texto: `Se fue ovacionado en casi todos los partidos de local. Ya es uno de los grandes mimados de ${club}.` },
    { titulo: "MIRADAS DE REOJO", texto: `La hinchada no le perdona algunas actitudes. Un año tenso entre ${nombre} y la tribuna.` },
    { titulo: "CRÉDITO AGOTADO", texto: `Silbidos y murmullos marcaron su año. Tendrá que remarla muchísimo la próxima temporada para revertirlo.` },
    { titulo: "DE MAYOR A MENOR", texto: `Empezó el año siendo aplaudido, pero su nivel cayó en picada y la gente se lo hizo saber rápido.` },
    { titulo: "MÁS RUIDO QUE FÚTBOL", texto: `Su temporada estuvo más marcada por las polémicas fuera del césped que por su nivel adentro de la cancha.` },
    { titulo: "EN EL OJO DEL HURACÁN", texto: `La prensa no le dio respiro. Un año ultra mediático y desgastante desde lo psicológico.` },
    { titulo: "PERFIL BAJO, RENDIMIENTO ALTO", texto: `Lejos de los micrófonos y las redes sociales, se dedicó solo a jugar y cerró un año excelente.` },
    { titulo: "CABEZA EN OTRO LADO", texto: `Entre publicidades, redes y salidas, su mente pareció estar muy lejos de ${club} esta temporada.` },
    { titulo: "PROFESIONAL AL 100%", texto: `Un ejemplo de conducta de enero a diciembre. Cero polémicas y máxima concentración en su carrera.` },
    { titulo: "EL PIBE DE ORO", texto: `Su valor de mercado se disparó. Cerró un año soñado y media liga está preguntando condiciones por él.` },
    { titulo: "A PASO FIRME", texto: `Sigue creciendo a pasos agigantados. Cierra un año donde demostró que todavía no conoce su propio techo.` },
    { titulo: "LA REVELACIÓN", texto: `Nadie daba dos pesos por él a principio de año, pero terminó cerrando bocas en todos los estadios del país.` },
    { titulo: "ESTANCADO", texto: `Ni subió ni bajó su nivel. Una temporada totalmente chata que no le suma mucho a su currículum.` },
    { titulo: "EN CAÍDA LIBRE", texto: `Su cotización se desplomó y su rendimiento también. Año para hacer autocrítica dura y barajar de nuevo.` }
  ];
  return opciones[Math.floor(Math.random() * opciones.length)];
}

// ============================================
// RESUMEN ANUAL
// ============================================

function mostrarResumenAnual() {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("resumen-container");
  if (!contenedor) return;

  const año = jugador.año;
  const temporada = jugador.temporada;

  if (jugador.statsAnuales.partidos === 0) {
    const produccion = generarStatsAnualesPorPosicion(jugador);

    const bonus = obtenerBonusResistencia(jugador.stats.resistencia || 0);
    jugador.statsAnuales.partidos = Math.max(0, produccion.partidos + bonus.partidos);
    jugador.statsAnuales.goles = Math.max(0, produccion.goles + bonus.goles);
    jugador.statsAnuales.asistencias = Math.max(0, produccion.asistencias + bonus.asistencias);
    if (jugador.posicion === "enganche" && jugador.statsAnuales.asistencias <= jugador.statsAnuales.goles) {
      jugador.statsAnuales.asistencias = jugador.statsAnuales.goles + numeroAleatorio(2, 7);
    }
    jugador.statsAnuales.vallasInvictas = produccion.vallasInvictas;
    jugador.statsAnuales.recuperaciones = produccion.recuperaciones;
    jugador.statsAnuales.atajadas = produccion.atajadas;

    jugador.statsAnuales.nota = calcularNotaTemporada(jugador.statsAnuales);
    jugador.statsAnuales.dinero = (jugador.valor || 0) * 0.02;
  }

  if (jugador.statsAnuales.bonusCopas === undefined) {
    const nacionales = (jugador.resultadoCopa?.esCampeon ? 1 : 0) + (jugador.resultadoCopasEspeciales || [])
      .filter(copa => copa.año === año && copa.resultado === "campeon").length;
    const internacionalesGanadas = (jugador.resultadosInternacionales || [])
      .filter(copa => copa.año === año && ["Libertadores", "Sudamericana", "Recopa", "Mundial de Clubes"].includes(copa.copa) && copa.resultado === "campeon").length;
    const notaBase = Number(jugador.statsAnuales.nota || 0);
    const bonusCopas = nacionales * .2 + internacionalesGanadas * .4;
    jugador.statsAnuales.notaBase = notaBase;
    jugador.statsAnuales.bonusCopas = bonusCopas;
    jugador.statsAnuales.nota = Math.min(10, notaBase + bonusCopas).toFixed(1);
    Estado.guardar();
  }

  if (typeof prepararInvitacionBalonDeOro === "function") prepararInvitacionBalonDeOro(jugador, año);
  // Segunda pasada: la clasificación se revisa tras jugar todas las copas del año.
  if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);

  let resumen;
  if (Math.random() < 0.6) {
    resumen = obtenerTituloPorGoles(jugador.statsAnuales.goles, jugador.nombre, obtenerNombreClub(jugador.club));
  } else {
    resumen = obtenerTituloGeneral(jugador.nombre, obtenerNombreClub(jugador.club));
  }

  const tituloResumen = resumen.titulo;
  const textoResumen = resumen.texto;

  // Resultado de la Liga
  const resultadoLiga = jugador.resultadoLiga || null;
  let textoLiga = "";
  if (resultadoLiga && resultadoLiga.esCampeon && !resultadoLiga.subcampeon) {
    textoLiga = "🏆 ¡Campeón de la Liga Argentina!";
  } else if (resultadoLiga && resultadoLiga.subcampeon) {
    textoLiga = "🥈 Subcampeón de la Liga Argentina.";
  } else if (resultadoLiga) {
    textoLiga = `Posición ${resultadoLiga.posicion}° en la Liga Argentina.`;
  }

  // Resultado de la Copa Argentina
  const resultadoCopa = jugador.resultadoCopa || null;
  let textoCopa = "";
  if (resultadoCopa && resultadoCopa.esCampeon) {
    textoCopa = "🏆 ¡Campeón de la Copa Argentina!";
  } else if (resultadoCopa && resultadoCopa.subcampeon) {
    textoCopa = "🥈 Subcampeón de la Copa Argentina.";
  } else if (resultadoCopa && resultadoCopa.ronda) {
    textoCopa = `Eliminado en ${resultadoCopa.ronda} de la Copa Argentina.`;
  }

  // Resultados de las copas especiales (Supercopa, Trofeo, Supercopa Internacional)
  let textosCopasEspeciales = "";
  const copasEspeciales = (jugador.resultadoCopasEspeciales || []).filter(c => c.año === año);
  copasEspeciales.forEach(copa => {
    let nombre = "";
    if (copa.tipo === "supercopa") nombre = "Supercopa Argentina";
    else if (copa.tipo === "trofeo") nombre = "Trofeo de Campeones";
    else if (copa.tipo === "supercopaInt") nombre = "Supercopa Internacional";

    if (copa.resultado === "campeon") textosCopasEspeciales += `🏆 ¡Campeón de ${nombre}!\n`;
    else textosCopasEspeciales += `🥈 Subcampeón de ${nombre}.\n`;
  });

  // Resultados internacionales (Libertadores, Sudamericana, Recopa)
  let textosInternacionales = "";
  const internacionales = (jugador.resultadosInternacionales || []).filter(c => c.año === año);
  internacionales.forEach(copa => {
    if (copa.copa === "Libertadores") {
      if (copa.resultado === "campeon") textosInternacionales += "🏆 ¡Campeón de la Copa Libertadores!\n";
      else if (copa.resultado === "subcampeon") textosInternacionales += "🥈 Subcampeón de la Copa Libertadores.\n";
      else textosInternacionales += "❌ Eliminado de la Copa Libertadores.\n";
    } else if (copa.copa === "Recopa") {
      if (copa.resultado === "campeon") textosInternacionales += "🏆 ¡Campeón de la Recopa Sudamericana!\n";
      else textosInternacionales += "🥈 Subcampeón de la Recopa Sudamericana.\n";
    } else if (copa.copa === "Sudamericana") {
      if (copa.resultado === "campeon") textosInternacionales += "🏆 ¡Campeón de la Copa Sudamericana!\n";
      else if (copa.resultado === "subcampeon") textosInternacionales += "🥈 Subcampeón de la Copa Sudamericana.\n";
      else textosInternacionales += "❌ Eliminado de la Copa Sudamericana.\n";
    } else if (copa.copa === "Mundial de Clubes") {
      if (copa.resultado === "campeon") textosInternacionales += "🌍 ¡Campeón del Mundial de Clubes!\n";
      else textosInternacionales += `❌ Eliminado del Mundial de Clubes en ${copa.resultado.replace("eliminado_", "")}.\n`;
    }
  });

  const clasificacionMundial = (jugador.clasificacionesMundialClubes || []).find(c => c.año === año);
  let textoMundialClubes = "";
  if (clasificacionMundial) {
    if (clasificacionMundial.entradaTitulo && clasificacionMundial.clasificoPorPuntos) {
      textoMundialClubes = `🌍 Has clasificado por puntos al Mundial de Clubes, ¡pero ya tenías una entrada por haber ganado la ${clasificacionMundial.tituloClasificatorio || "Copa Libertadores"}! (${clasificacionMundial.puntos} puntos)`;
    } else if (clasificacionMundial.entradaTitulo) {
      textoMundialClubes = `🌍 Quedaste fuera del Mundial de Clubes por tabla de puntos, pero ya tenías entrada asegurada por ganar la ${clasificacionMundial.tituloClasificatorio || "Copa Libertadores"}! (${clasificacionMundial.puntos} puntos)`;
    } else if (clasificacionMundial.clasifico) {
      textoMundialClubes = `🌍 ¡Has clasificado al Mundial de Clubes por tabla de puntos! (${clasificacionMundial.puntos} puntos)`;
    } else {
      textoMundialClubes = `🌍 Has quedado fuera del Mundial de Clubes por tabla de puntos (${clasificacionMundial.puntos} puntos).`;
    }
  }
  const invitacionBalon = (jugador.premiosPendientes || []).find(p => p.temporada === año);
  const balonGanado = (jugador.balonesDeOro || []).find(p => p.galaAño === año);
  let textoBalonDeOro = "";
  if (invitacionBalon) textoBalonDeOro = invitacionBalon.invitado
    ? "🏅 ¡Felicidades! Fuiste invitado a la gala del Balón de Oro."
    : "🏅 Tuviste una gran temporada, sin embargo no fuiste invitado a la gala del Balón de Oro.";
  if (balonGanado) textoBalonDeOro += `${textoBalonDeOro ? "<br>" : ""}🏆 ¡Felicidades! Ganaste el Balón de Oro ${balonGanado.temporada}.`;

  let textoClasificacionLibertadores = "";
  let textoClasificacionSudamericana = "";
  const resLiga = jugador.resultadoLiga || {};
  const resCopa = jugador.resultadoCopa || {};
  const liga = jugador.liga;
  if (liga === "liga-profesional-argentina" || liga === "brasileirao-brasil") {
    const clasificaLiberta = resLiga.esCampeon || resLiga.subcampeon || (resLiga.posicion >= 2 && resLiga.posicion <= 3) || resCopa.esCampeon;
    if (clasificaLiberta) {
      textoClasificacionLibertadores = "📢 ¡Clasificaste a la Copa Libertadores del próximo año!";
    } else if (liga === "liga-profesional-argentina" && resLiga.posicion >= 4 && resLiga.posicion <= 9) {
      textoClasificacionSudamericana = "📢 ¡Jugarás la Copa Sudamericana el próximo año!";
    }
  }

  const posicion = "2°";
  const decisiones = (jugador.historialEventos && jugador.historialEventos.length > 0)
    ? jugador.historialEventos.slice(-3).join("\n")
    : "Sin decisiones relevantes este año.";

  const club = NOMBRES_CLUBES[jugador.club];
  const escudoSrc = club && club.escudo ? club.escudo : "";
  const statsRol = jugador.posicion === "arquero"
    ? [{ valor: jugador.statsAnuales.vallasInvictas, etiqueta: "Vallas invictas" }, { valor: jugador.statsAnuales.atajadas, etiqueta: "Atajadas" }]
    : jugador.posicion === "central"
      ? [{ valor: jugador.statsAnuales.vallasInvictas, etiqueta: "Vallas invictas" }, { valor: jugador.statsAnuales.recuperaciones, etiqueta: "Recuperaciones" }]
      : jugador.posicion === "enganche"
        ? [{ valor: jugador.statsAnuales.asistencias, etiqueta: "Asistencias" }, { valor: jugador.statsAnuales.goles, etiqueta: "Goles" }]
        : [{ valor: jugador.statsAnuales.goles, etiqueta: "Goles" }, { valor: jugador.statsAnuales.asistencias, etiqueta: "Asistencias" }];

  contenedor.innerHTML = `
    <div class="resumen-header">
      <span class="resumen-titulo">Resumen Anual</span>
      <span class="resumen-año">Año ${año} - Temporada ${temporada}</span>
    </div>
    <div>
      <h4 class="resumen-texto-titulo">${tituloResumen}</h4>
      <p class="resumen-texto">${textoResumen}</p>
    </div>
    <div class="resumen-club">
      <img src="${escudoSrc}" alt="Escudo" onerror="this.hidden=true">
      <div>
        <div class="resumen-club-nombre">${club ? club.nombre : "Club"}</div>
        <div class="resumen-club-pos">${posicion} en la Liga</div>
      </div>
    </div>
    <div class="resumen-stats">
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.partidos}</span><span class="resumen-stat-label">Partidos</span></div>
       <div class="resumen-stat"><span class="resumen-stat-valor">${statsRol[0].valor}</span><span class="resumen-stat-label">${statsRol[0].etiqueta}</span></div>
       <div class="resumen-stat"><span class="resumen-stat-valor">${statsRol[1].valor}</span><span class="resumen-stat-label">${statsRol[1].etiqueta}</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${jugador.statsAnuales.nota}</span><span class="resumen-stat-label">Nota</span></div>
      <div class="resumen-stat"><span class="resumen-stat-valor">${formatearDinero(jugador.statsAnuales.dinero)}</span><span class="resumen-stat-label">Dinero</span></div>
    </div>
    <div class="resumen-decisiones">
      <strong>Decisiones del año:</strong><br>
      ${decisiones.replace(/\n/g, '<br>')}
      <br><br>
      <strong>Liga:</strong><br>${textoLiga || "Sin datos de liga."}
      <br><br>
      <strong>Copa Argentina:</strong><br>${textoCopa || "No participó o sin datos."}
      ${textosCopasEspeciales ? `<br><br><strong>Otras copas:</strong><br>${textosCopasEspeciales.replace(/\n/g, '<br>')}` : ''}
      ${textosInternacionales ? `<br><br><strong>Copas Internacionales:</strong><br>${textosInternacionales.replace(/\n/g, '<br>')}` : ''}
      ${textoMundialClubes ? `<br><br><strong>${textoMundialClubes}</strong>` : ''}
      ${textoBalonDeOro ? `<br><br><strong>${textoBalonDeOro}</strong>` : ''}
      ${textoClasificacionLibertadores ? `<br><br><strong>${textoClasificacionLibertadores}</strong>` : ''}
      ${textoClasificacionSudamericana ? `<br><br><strong>${textoClasificacionSudamericana}</strong>` : ''}
    </div>
    <button class="resumen-boton" id="boton-siguiente-ano">Siguiente año ➡</button>
  `;

  contenedor.hidden = false;

  document.getElementById("boton-siguiente-ano").addEventListener("click", () => {
    Estado.avanzarTemporada();
    if (Estado.obtener().retirado) {
      alert(`¡Carrera terminada! Te retiraste a los ${Estado.obtener().edad} años por edad.`);
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      return;
    }
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    pintarHUD(Estado.obtener());
    // La gala pendiente se resuelve antes de iniciar la nueva temporada.
    if (typeof mostrarGalaBalonDeOro === "function" && mostrarGalaBalonDeOro(abrirModalCartas)) return;
    abrirModalCartas();
  });
}

function calcularNotaTemporada(statsAnuales) {
  const partidos = statsAnuales.partidos || 0;
  if (partidos === 0) return "0.0";

  const golesPorPartido = statsAnuales.goles / partidos;
  const asisPorPartido = statsAnuales.asistencias / partidos;

  // Base 6.0 (temporada normal) + bonus por producción ofensiva por partido.
  let nota = 6.0 + golesPorPartido * 3 + asisPorPartido * 2;

  // Un poco de variación para que no sea siempre exacto, sin desviar demasiado.
  nota += (Math.random() * 0.4 - 0.2);

  nota = Math.max(3.0, Math.min(10.0, nota));
  return nota.toFixed(1);
}

function obtenerNombreClub(idClub) {
  const club = NOMBRES_CLUBES[idClub];
  return club ? club.nombre : "Club";
}

function generarStatsAnualesPorPosicion(jugador) {
  const media = jugador.media || 50;
  const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const partidos = Math.min(55, aleatorio(24, 38) + Math.floor((jugador.stats.resistencia || 50) / 12));
  const produccion = { partidos, goles: 0, asistencias: 0, vallasInvictas: 0, recuperaciones: 0, atajadas: 0 };
  if (jugador.posicion === "delantero") {
    const minimo = media >= 96 ? 42 : media >= 91 ? 30 : media >= 86 ? 19 : media >= 76 ? 10 : 3;
    const maximo = media >= 96 ? 78 : media >= 91 ? 60 : media >= 86 ? 43 : media >= 76 ? 29 : 16;
    produccion.goles = aleatorio(minimo, maximo);
    produccion.asistencias = aleatorio(Math.max(2, Math.floor(minimo / 3)), Math.max(6, Math.floor(maximo * .58)));
  } else if (jugador.posicion === "enganche") {
    const nivel = Math.max(0, media - 55);
    produccion.asistencias = aleatorio(8 + Math.floor(nivel * .62), 16 + Math.floor(nivel * .94));
    produccion.goles = aleatorio(Math.max(2, Math.floor(produccion.asistencias * .18)), Math.max(4, Math.floor(produccion.asistencias * .48)));
  } else if (jugador.posicion === "central") {
    produccion.goles = aleatorio(1, media >= 90 ? 14 : media >= 80 ? 9 : 6);
    produccion.asistencias = aleatorio(1, media >= 90 ? 11 : media >= 80 ? 7 : 4);
    produccion.recuperaciones = aleatorio(44 + Math.floor(media * .48), 82 + Math.floor(media * .9));
    produccion.vallasInvictas = aleatorio(7 + Math.floor(media / 10), 12 + Math.floor(media / 5));
  } else if (jugador.posicion === "arquero") {
    produccion.atajadas = aleatorio(46 + Math.floor(media * .6), 90 + Math.floor(media * 1.05));
    produccion.vallasInvictas = aleatorio(7 + Math.floor(media / 10), 12 + Math.floor(media / 5));
  }
  return produccion;
}
