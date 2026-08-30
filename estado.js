/**
 * estado.js
 * -----------------------------------------
 * Dueño único de los datos de la carrera actual.
 * Ahora genera edad, stats base, media y valor según las reglas.
 * -----------------------------------------
 */

const CLAVE_STORAGE = "carreraActual";

const Estado = (() => {
  let jugador = null;

  function cargar() {
    if (window.jugadorActual) {
      jugador = expandirJugador(window.jugadorActual);
      guardar();
      return jugador;
    }

    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) {
      try {
        jugador = JSON.parse(guardado);
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

  function generarStatsBase() {
    return {
      pegada: numeroAleatorio(55, 68),
      velocidad: numeroAleatorio(51, 62),
      gambeta: numeroAleatorio(53, 65),
      liderazgo: numeroAleatorio(40, 55),
      resistencia: numeroAleatorio(55, 62),
    };
  }

  function calcularMedia(stats) {
    return Math.round((stats.pegada + stats.velocidad + stats.gambeta + stats.liderazgo + stats.resistencia) / 5);
  }

  function calcularValor(stats, media, edad) {
    // Multiplicador según edad
    let mult = 1;
    if (edad >= 15 && edad <= 21) mult = 2;      // Joven Promesa
    else if (edad >= 22 && edad <= 28) mult = 1.5; // Prime
    else if (edad >= 29 && edad <= 33) mult = 1;   // Experimentado
    else mult = 0.5;                                // Declive

    // Valor base = (Pegada * Vel * Gambeta) * Media
    const valorBruto = (stats.pegada * stats.velocidad * stats.gambeta) * media * mult;
    
    // Lo devolvemos en millones para que el HUD lo muestre como $X.XM
    return Math.round(valorBruto / 1000000);
  }

  // ------- FIN NUEVAS MECÁNICAS -------

  function expandirJugador(base) {
    const edad = generarEdad();
    const statsBase = generarStatsBase();
    const media = calcularMedia(statsBase);
    const valor = calcularValor(statsBase, media, edad);

    return {
      ...base,
      edad: edad,
      media: media,
      valor: valor, // en millones
      dinero: 0,
      historialClubes: [
        {
          club: base.club,
          desde: base.año,
          hasta: null,
          cariñoFinal: 0,
          partidos: 0,
          titulos: [],
        },
      ],
      stats: {
        ...statsBase,
        goles: 0,
        asistencias: 0,
        partidos: 0,
        titulos: 0,
      },
    };
  }

  function jugadorDePrueba() {
    // Si no venís del menú, se genera uno aleatorio para probar el HUD
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
      seleccion: "en-carpeta",
    });
  }

  function obtener() { return jugador; }
  function actualizar(cambios) { jugador = { ...jugador, ...cambios }; guardar(); return jugador; }
  function actualizarStats(cambiosStats) { jugador = { ...jugador, stats: { ...jugador.stats, ...cambiosStats } }; guardar(); return jugador; }
  function guardar() { localStorage.setItem(CLAVE_STORAGE, JSON.stringify(jugador)); }
  function borrar() { localStorage.removeItem(CLAVE_STORAGE); jugador = null; }

  return { cargar, obtener, actualizar, actualizarStats, guardar, borrar };
})();