/**
 * estado.js
 * -----------------------------------------
 * Dueño único de los datos de la carrera actual.
 * Nadie pinta nada acá: solo se lee y se escribe el estado.
 * - Si hay una carrera guardada en localStorage, la carga.
 * - Si no hay nada (o estamos probando el HUD suelto), arma un
 *   jugador de PRUEBA para poder ver la interfaz funcionando.
 * -----------------------------------------
 */

const CLAVE_STORAGE = "carreraActual";

const Estado = (() => {
  let jugador = null;

  function cargar() {
    // 1) Si menu.js ya dejó un jugador recién creado, arrancamos de ahí.
    if (window.jugadorActual) {
      jugador = expandirJugador(window.jugadorActual);
      guardar();
      return jugador;
    }

    // 2) Si hay una carrera guardada de antes, la recuperamos.
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) {
      try {
        jugador = JSON.parse(guardado);
        return jugador;
      } catch (error) {
        console.warn("No se pudo leer la carrera guardada, se descarta.", error);
      }
    }

    // 3) Nada de lo anterior: jugador de PRUEBA para ir viendo el HUD.
    jugador = jugadorDePrueba();
    guardar();
    return jugador;
  }

  // Completa un jugador recién armado por menu.js (que solo trae los
  // datos del formulario) con todas las estadísticas que necesita el HUD.
  function expandirJugador(base) {
    return {
      ...base,
      media: 62,
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
        // Stats propias por posición (delantero por ahora).
        goles: 0,
        asistencias: 0,
        pegada: 45,
        velocidad: 50,
        gambeta: 48,
        // Stats globales.
        liderazgo: 20,
        resistencia: 55,
        partidos: 0,
        titulos: 0,
      },
    };
  }

  function jugadorDePrueba() {
    return {
      nombre: "Fabricio Álvarez",
      dorsal: 9,
      pais: "argentina",
      ligaPais: "argentina",
      liga: "liga-profesional-argentina",
      division: "primera-division-argentina",
      club: "boca-juniors",
      posicion: "delantero",
      edad: 21,
      año: 2026,
      cariño: 34,
      seleccion: "en-carpeta",
      valor: 8.4, // en millones
      dinero: 1.2, // en millones
      media: 74,
      historialClubes: [
        {
          club: "boca-juniors",
          desde: 2024,
          hasta: null,
          cariñoFinal: 34,
          partidos: 58,
          titulos: [],
        },
      ],
      stats: {
        goles: 41,
        asistencias: 17,
        pegada: 78,
        velocidad: 71,
        gambeta: 69,
        liderazgo: 38,
        resistencia: 64,
        partidos: 58,
        titulos: 1,
      },
    };
  }

  function obtener() {
    return jugador;
  }

  function actualizar(cambios) {
    jugador = { ...jugador, ...cambios };
    guardar();
    return jugador;
  }

  function actualizarStats(cambiosStats) {
    jugador = { ...jugador, stats: { ...jugador.stats, ...cambiosStats } };
    guardar();
    return jugador;
  }

  function guardar() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(jugador));
  }

  function borrar() {
    localStorage.removeItem(CLAVE_STORAGE);
    jugador = null;
  }

  return { cargar, obtener, actualizar, actualizarStats, guardar, borrar };
})();