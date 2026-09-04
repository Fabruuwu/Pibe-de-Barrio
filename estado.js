const CLAVE_STORAGE = "carreraActual";

const Estado = (() => {
  let jugador = null;

  function cargar() {
    if (window.jugadorActual) {
      jugador = normalizarJugador(expandirJugador(window.jugadorActual));
      guardar();
      return jugador;
    }

    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) {
      try {
        jugador = normalizarJugador(JSON.parse(guardado));
        guardar();
        return jugador;
      } catch (error) {
        console.warn("No se pudo leer la carrera guardada, se descarta.", error);
      }
    }

    jugador = jugadorDePrueba();
    guardar();
    return jugador;
  }

  // ------- NUEVAS MECÁNICAS -------

  function generarEdad() {
    const prob = Math.random() * 100;
    if (prob < 5) return 15;
    if (prob < 30) return 16;
    if (prob < 70) return 17;
    if (prob < 95) return 18;
    return 19;
  }

  function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generarStatsBase(posicion) {
    const base = {
      pegada: numeroAleatorio(55, 68),
      velocidad: numeroAleatorio(51, 62),
      gambeta: numeroAleatorio(53, 65),
      liderazgo: numeroAleatorio(40, 55),
      resistencia: numeroAleatorio(55, 62),
    };

    const atributosPorPosicion = {
      enganche: ["pase", "cerebro"],
      central: ["marca", "quite", "juegoAereo"],
      arquero: ["reflejos", "ataje", "juegoAereo"],
    };

    (atributosPorPosicion[posicion] || []).forEach((atributo) => {
      base[atributo] = numeroAleatorio(53, 67);
    });

    return base;
  }

  // Nueva función de media: solo promedio de stats exclusivas de la posición
  function calcularMedia(stats, posicion) {
    const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[posicion];
    if (config && config.atributos && config.atributos.length > 0) {
      const keys = config.atributos.map(a => a.clave);
      const sum = keys.reduce((acc, key) => acc + (stats[key] || 0), 0);
      return Math.round(sum / keys.length);
    }
    // Fallback: promedio de pegada, velocidad, gambeta
    return Math.round((stats.pegada + stats.velocidad + stats.gambeta) / 3);
  }

  function calcularValor(media, edad) {
    let mult = 1;
    if (edad >= 15 && edad <= 21) mult = 2;
    else if (edad >= 22 && edad <= 28) mult = 1.5;
    else if (edad >= 29 && edad <= 33) mult = 1;
    else mult = 0.5;

    const valorBruto = Math.pow((media - 40), 4) * 10 * mult;
    return Math.round(valorBruto / 1000000);
  }

  // ------- FIN NUEVAS MECÁNICAS -------

  function expandirJugador(base) {
    const edad = generarEdad();
    const statsBase = generarStatsBase(base.posicion);
    const media = calcularMedia(statsBase, base.posicion);
    const valor = calcularValor(media, edad);

    return {
      ...base,
      edad: edad,
      media: media,
      valor: valor,
      dinero: 0,
      retirado: false,
      temporada: 1,
      statsAnuales: {
        partidos: 0,
        goles: 0,
        asistencias: 0,
        vallasInvictas: 0,
        recuperaciones: 0,
        atajadas: 0,
        nota: 0,
        dinero: 0
      },
      historialClubes: [
        { club: base.club, desde: base.año, hasta: null, cariñoFinal: 0, partidos: 0, titulos: [] }
      ],
      historialEventos: [],
      resultadosInternacionales: [],
      campeonesHistorial: [], // Guarda { año, liga, copa, trofeo, superCopaInt }
      copasPendientes: [],    // Guarda { año, tipo, rivalId } para jugar en el futuro
      resultadoCopasEspeciales: [], // Guarda { año, tipo, resultado } para las copas especiales
      stats: {
        ...statsBase,
        goles: 0,
        asistencias: 0,
        partidos: 0,
        titulos: 0,
        vallasInvictas: 0,
        recuperaciones: 0,
        atajadas: 0
      }
    };
  }

  function normalizarJugador(base) {
    const jugadorNormalizado = { ...base, stats: { ...(base.stats || {}) } };
    if (!Array.isArray(jugadorNormalizado.resultadosInternacionales)) jugadorNormalizado.resultadosInternacionales = [];
    const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[jugadorNormalizado.posicion];
    (config?.atributos || []).forEach(({ clave }) => {
      if (jugadorNormalizado.stats[clave] === undefined) jugadorNormalizado.stats[clave] = numeroAleatorio(53, 67);
    });
    ["liderazgo", "resistencia", "goles", "asistencias", "partidos", "titulos", "vallasInvictas", "recuperaciones", "atajadas"].forEach((clave) => {
      if (jugadorNormalizado.stats[clave] === undefined) jugadorNormalizado.stats[clave] = 0;
    });
    jugadorNormalizado.media = calcularMedia(jugadorNormalizado.stats, jugadorNormalizado.posicion);
    jugadorNormalizado.valor = calcularValor(jugadorNormalizado.media, jugadorNormalizado.edad);
    return jugadorNormalizado;
  }

  function jugadorDePrueba() {
    return expandirJugador({
      nombre: "Fabricio Álvarez",
      dorsal: 9,
      pais: "argentina",
      ligaPais: "argentina",
      liga: "liga-profesional-argentina",
      division: "primera-division-argentina",
      club: "boca-juniors",
      posicion: "delantero",
      año: new Date().getFullYear(),
      cariño: 34,
      seleccion: "en-carpeta"
    });
  }

  function avanzarTemporada() {
    jugador.stats.partidos += jugador.statsAnuales.partidos;
    jugador.stats.goles += jugador.statsAnuales.goles;
    jugador.stats.asistencias += jugador.statsAnuales.asistencias;
    jugador.stats.vallasInvictas = (jugador.stats.vallasInvictas || 0) + (jugador.statsAnuales.vallasInvictas || 0);
    jugador.stats.recuperaciones = (jugador.stats.recuperaciones || 0) + (jugador.statsAnuales.recuperaciones || 0);
    jugador.stats.atajadas = (jugador.stats.atajadas || 0) + (jugador.statsAnuales.atajadas || 0);
    jugador.dinero = (jugador.dinero || 0) + (jugador.statsAnuales.dinero || 0);

    jugador.edad += 1;
    jugador.año += 1;
    jugador.temporada += 1;

    // Aplicar decrementos por edad (NUEVO ESQUEMA)
    const edad = jugador.edad;
    let resPen = 0;
    let statPen = 0;
    if (edad >= 30 && edad <= 34) resPen = 1;
    else if (edad >= 34 && edad <= 42) resPen = 2;
    else if (edad >= 43 && edad <= 45) resPen = 3;

    if (edad >= 32 && edad <= 37) statPen = 1;
    else if (edad >= 38 && edad <= 42) statPen = 2;
    else if (edad >= 43 && edad <= 45) statPen = 3;

    // Aplicar a resistencia
    jugador.stats.resistencia = Math.max(0, (jugador.stats.resistencia || 0) - resPen);

    // Aplicar a stats exclusivas según posición (limitando a 99)
    const config = window.CONFIGS_POSICIONES && window.CONFIGS_POSICIONES[jugador.posicion];
    if (config && config.atributos) {
      config.atributos.forEach(a => {
        jugador.stats[a.clave] = Math.max(0, Math.min(99, (jugador.stats[a.clave] || 0) - statPen));
      });
    }

    jugador.media = calcularMedia(jugador.stats, jugador.posicion);

    jugador.cariño = Math.min(100, (jugador.cariño || 0) + 1);

    jugador.statsAnuales = {
      partidos: 0,
      goles: 0,
      asistencias: 0,
      vallasInvictas: 0,
      recuperaciones: 0,
      atajadas: 0,
      nota: 0,
      dinero: 0
    };
    jugador.historialEventos = [];
    // Limpiamos el resultado de copas especiales al avanzar (se guardan por año)
    // No lo limpiamos aquí porque queremos mostrarlo en el resumen del año en que se jugó
    // En su lugar, lo gestionamos en mostrarResumenAnual (lo consumimos)

    if (verificarRetiroAutomatico()) jugador.retirado = true;

    guardar();
    return jugador;
  }

  function verificarRetiroAutomatico() {
    const edad = jugador.edad;
    let prob = 0;
    if (edad === 35 || edad === 36 || edad === 37) prob = 0.10;
    else if (edad === 38 || edad === 39) prob = 0.25;
    else if (edad === 40 || edad === 41) prob = 0.50;
    else if (edad === 42 || edad === 43 || edad === 44) prob = 0.75;
    else if (edad >= 45) prob = 1.0;

    return Math.random() < prob;
  }

  function obtener() { return jugador; }
  function actualizar(cambios) { jugador = { ...jugador, ...cambios }; guardar(); return jugador; }
  function actualizarStats(cambiosStats) { jugador = { ...jugador, stats: { ...jugador.stats, ...cambiosStats } }; guardar(); return jugador; }
  function guardar() { localStorage.setItem(CLAVE_STORAGE, JSON.stringify(jugador)); }
  function borrar() { localStorage.removeItem(CLAVE_STORAGE); jugador = null; }

  return { cargar, obtener, actualizar, actualizarStats, guardar, borrar, avanzarTemporada };
})();
