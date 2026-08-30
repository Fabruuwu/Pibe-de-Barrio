/**
 * menu.js
 * -----------------------------------------
 * Lógica del menú principal.
 * - Rellena los selects en cadena (país -> liga -> división -> club)
 * - Maneja la selección de posición (tarjetas tipo radio)
 * - Valida el formulario y arma el objeto "jugador" al iniciar carrera
 * -----------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const selectPais = document.getElementById("select-pais");
  const selectLiga = document.getElementById("select-liga");
  const selectDivision = document.getElementById("select-division");
  const selectClub = document.getElementById("select-club");
  const grupoPosiciones = document.getElementById("grupo-posiciones");
  const inputPosicion = document.getElementById("input-posicion");
  const form = document.getElementById("form-menu");
  const mensajeError = document.getElementById("mensaje-error");

  const botonAzar = document.getElementById("boton-azar");

  inicializarPaises();
  inicializarPosiciones();
  botonAzar.addEventListener("click", elegirAlAzar);

  // ---------------------------------------
  // PAÍS -> LIGA -> DIVISIÓN -> CLUB
  // ---------------------------------------

  function inicializarPaises() {
    PAISES.forEach((pais) => {
      const opcion = document.createElement("option");
      opcion.value = pais.id;
      opcion.textContent = `${pais.bandera} ${pais.nombre}`;
      selectPais.appendChild(opcion);
    });
  }

  selectPais.addEventListener("change", () => {
    const idPais = selectPais.value;
    const ligas = LIGAS_POR_PAIS[idPais] || [];
    rellenarSelect(selectLiga, ligas, "Elegí una liga");
    resetearSelect(selectDivision, "Primero elegí una liga");
    resetearSelect(selectClub, "Primero elegí una división");
  });

  selectLiga.addEventListener("change", () => {
    const idLiga = selectLiga.value;
    const divisiones = DIVISIONES_POR_LIGA[idLiga] || [];
    rellenarSelect(selectDivision, divisiones, "Elegí una división");
    resetearSelect(selectClub, "Primero elegí una división");
  });

  selectDivision.addEventListener("change", () => {
    const idDivision = selectDivision.value;
    const clubes = CLUBES_POR_DIVISION[idDivision] || [];
    const opciones = clubes.map((club) => ({
      id: club.id,
      nombre: `${club.escudo} ${club.nombre}`,
    }));
    rellenarSelect(selectClub, opciones, "Elegí un club");
  });

  function rellenarSelect(select, items, placeholder) {
    select.innerHTML = "";
    const opcionPlaceholder = document.createElement("option");
    opcionPlaceholder.value = "";
    opcionPlaceholder.disabled = true;
    opcionPlaceholder.selected = true;
    opcionPlaceholder.textContent = placeholder;
    select.appendChild(opcionPlaceholder);

    items.forEach((item) => {
      const opcion = document.createElement("option");
      opcion.value = item.id;
      opcion.textContent = item.nombre;
      select.appendChild(opcion);
    });

    select.disabled = items.length === 0;
  }

  function resetearSelect(select, placeholder) {
    rellenarSelect(select, [], placeholder);
  }

  // ---------------------------------------
  // POSICIÓN (tarjetas)
  // ---------------------------------------

  function inicializarPosiciones() {
    const tarjetas = grupoPosiciones.querySelectorAll(".pos-card");

    tarjetas.forEach((tarjeta) => {
      tarjeta.addEventListener("click", () => {
        seleccionarPosicion(tarjeta);
      });
    });
  }

  function seleccionarPosicion(tarjeta) {
    const tarjetas = grupoPosiciones.querySelectorAll(".pos-card");
    tarjetas.forEach((t) => t.setAttribute("aria-checked", "false"));
    tarjeta.setAttribute("aria-checked", "true");
    inputPosicion.value = tarjeta.dataset.posicion;
    ocultarError();
  }

  // ---------------------------------------
  // "AL AZAR"
  // ---------------------------------------

  function elegirAlAzar() {
    const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

    const pais = azar(PAISES);
    selectPais.value = pais.id;
    selectPais.dispatchEvent(new Event("change"));

    const ligas = LIGAS_POR_PAIS[pais.id] || [];
    if (ligas.length === 0) return;
    const liga = azar(ligas);
    selectLiga.value = liga.id;
    selectLiga.dispatchEvent(new Event("change"));

    const divisiones = DIVISIONES_POR_LIGA[liga.id] || [];
    if (divisiones.length === 0) return;
    const division = azar(divisiones);
    selectDivision.value = division.id;
    selectDivision.dispatchEvent(new Event("change"));

    const clubes = CLUBES_POR_DIVISION[division.id] || [];
    if (clubes.length === 0) return;
    const club = azar(clubes);
    selectClub.value = club.id;

    const tarjetas = Array.from(grupoPosiciones.querySelectorAll(".pos-card"));
    const tarjetaElegida = azar(tarjetas);
    seleccionarPosicion(tarjetaElegida);

    const dorsalInput = document.getElementById("input-dorsal");
    if (!dorsalInput.value) {
      dorsalInput.value = tarjetaElegida.dataset.dorsalSugerido;
    }
  }

  // ---------------------------------------
  // VALIDACIÓN + ENVÍO
  // ---------------------------------------

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const datos = {
      nombre: document.getElementById("input-nombre").value.trim(),
      dorsal: document.getElementById("input-dorsal").value,
      pais: selectPais.value,
      liga: selectLiga.value,
      division: selectDivision.value,
      club: selectClub.value,
      posicion: inputPosicion.value,
    };

    const error = validarDatos(datos);
    if (error) {
      mostrarError(error);
      return;
    }

    const jugador = construirJugador(datos);
    iniciarCarrera(jugador);
  });

  function validarDatos(datos) {
    if (!datos.nombre) return "Ingresá un nombre para tu jugador.";
    if (!datos.dorsal || datos.dorsal < 1 || datos.dorsal > 99) {
      return "El dorsal tiene que ser un número entre 1 y 99.";
    }
    if (!datos.pais) return "Elegí una nacionalidad.";
    if (!datos.liga) return "Elegí una liga.";
    if (!datos.division) return "Elegí una división.";
    if (!datos.club) return "Elegí un club para arrancar.";
    if (!datos.posicion) return "Elegí una posición para jugar.";
    return null;
  }

  function mostrarError(texto) {
    mensajeError.textContent = texto;
    mensajeError.hidden = false;
  }

  function ocultarError() {
    mensajeError.hidden = true;
  }

  function construirJugador(datos) {
    return {
      nombre: datos.nombre,
      dorsal: Number(datos.dorsal),
      pais: datos.pais,
      liga: datos.liga,
      division: datos.division,
      club: datos.club,
      posicion: datos.posicion,
      edad: 17,
      año: new Date().getFullYear(),
      cariño: 0,
      seleccion: "sin-chances",
      valor: 0,
    };
  }

  function iniciarCarrera(jugador) {
    // Por ahora, mientras no exista la pantalla de juego (HUD),
    // guardamos al jugador y avisamos por consola.
    // Más adelante esto va a ocultar el menú y mostrar el HUD.
    console.log("Carrera iniciada con:", jugador);
    window.jugadorActual = jugador;
    alert(`¡Carrera iniciada!\n\n${jugador.nombre} #${jugador.dorsal}\nPosición: ${jugador.posicion}`);
  }
});