/**
 * menu.js
 * -----------------------------------------
 * Lógica del menú principal.
 * - Rellena los selects en cadena (país de la liga -> división -> club)
 * - Maneja la selección de posición (tarjetas tipo radio)
 * - Muestra el escudo del club elegido
 * - Valida el formulario y arma el objeto "jugador" al iniciar carrera
 * -----------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const selectPais = document.getElementById("select-pais");
  const selectLigaPais = document.getElementById("select-liga-pais");
  const selectDivision = document.getElementById("select-division");
  const selectClub = document.getElementById("select-club");
  const previewEscudoPais = document.getElementById("preview-escudo-pais");
  const previewEscudoLigaPais = document.getElementById("preview-escudo-liga-pais");
  const previewEscudoClub = document.getElementById("preview-escudo");
  const grupoPosiciones = document.getElementById("grupo-posiciones");
  const inputPosicion = document.getElementById("input-posicion");
  const form = document.getElementById("form-menu");
  const mensajeError = document.getElementById("mensaje-error");
  const botonAzar = document.getElementById("boton-azar");

  // Guarda el id de la liga real (interno) asociada al país de liga elegido.
  // El usuario solo ve el nombre del país; la liga se resuelve sola.
  let idLigaActual = null;

  inicializarPaises();
  inicializarPosiciones();
  botonAzar.addEventListener("click", elegirAlAzar);

  // ---------------------------------------
  // NACIONALIDAD (independiente de la liga)
  // ---------------------------------------

  function inicializarPaises() {
    // Nacionalidad: TODAS las selecciones, agrupadas por confederación.
    const porConfederacion = {};
    PAISES.forEach((pais) => {
      if (!porConfederacion[pais.confederacion]) porConfederacion[pais.confederacion] = [];
      porConfederacion[pais.confederacion].push(pais);
    });

    Object.keys(porConfederacion).forEach((confederacion) => {
      const grupo = document.createElement("optgroup");
      grupo.label = confederacion;
      porConfederacion[confederacion].forEach((pais) => {
        const opcion = document.createElement("option");
        opcion.value = pais.id;
        opcion.textContent = pais.nombre;
        opcion.dataset.bandera = pais.bandera || "";
        grupo.appendChild(opcion);
      });
      selectPais.appendChild(grupo);
    });

    // País de la liga: solo los países que tienen alguna liga cargada en LIGAS_POR_PAIS.
    PAISES.filter((pais) => LIGAS_POR_PAIS[pais.id]).forEach((pais) => {
      const opcion = document.createElement("option");
      opcion.value = pais.id;
      opcion.textContent = pais.nombre;
      opcion.dataset.bandera = pais.bandera || "";
      selectLigaPais.appendChild(opcion);
    });
  }

  selectPais.addEventListener("change", () => {
    const opcionElegida = selectPais.selectedOptions[0];
    mostrarEscudo(previewEscudoPais, opcionElegida ? opcionElegida.dataset.bandera : "");
  });

  // ---------------------------------------
  // PAÍS DE LA LIGA -> DIVISIÓN -> CLUB
  // ---------------------------------------

  selectLigaPais.addEventListener("change", () => {
    const idPais = selectLigaPais.value;
    const ligas = LIGAS_POR_PAIS[idPais] || [];

    // Por ahora cada país tiene una sola liga "principal".
    // El usuario no la ve, pero la necesitamos para buscar las divisiones.
    idLigaActual = ligas.length > 0 ? ligas[0].id : null;

    const divisiones = idLigaActual ? DIVISIONES_POR_LIGA[idLigaActual] || [] : [];
    rellenarSelect(selectDivision, divisiones, "Elegí una división");
    resetearSelect(selectClub, "Primero elegí una división");
    ocultarEscudo(previewEscudoClub);

    const opcionElegida = selectLigaPais.selectedOptions[0];
    mostrarEscudo(previewEscudoLigaPais, opcionElegida ? opcionElegida.dataset.bandera : "");
  });

  selectDivision.addEventListener("change", () => {
    const idDivision = selectDivision.value;
    const clubes = CLUBES_POR_DIVISION[idDivision] || [];
    rellenarSelectClubes(clubes);
    ocultarEscudo(previewEscudoClub);
  });

  selectClub.addEventListener("change", () => {
    const opcionElegida = selectClub.selectedOptions[0];
    const ruta = opcionElegida ? opcionElegida.dataset.escudo : "";
    mostrarEscudo(previewEscudoClub, ruta);
  });

  function mostrarEscudo(imgElemento, ruta) {
    if (!ruta) {
      ocultarEscudo(imgElemento);
      return;
    }
    imgElemento.src = ruta;
    imgElemento.alt = "";
    imgElemento.hidden = false;
    // Si la ruta está mal escrita o el archivo no existe todavía,
    // ocultamos el preview en vez de mostrar el ícono roto del navegador.
    imgElemento.onerror = () => {
      imgElemento.hidden = true;
    };
  }

  function ocultarEscudo(imgElemento) {
    imgElemento.hidden = true;
    imgElemento.removeAttribute("src");
  }

  function rellenarSelectClubes(clubes) {
    selectClub.innerHTML = "";
    const opcionPlaceholder = document.createElement("option");
    opcionPlaceholder.value = "";
    opcionPlaceholder.disabled = true;
    opcionPlaceholder.selected = true;
    opcionPlaceholder.textContent = clubes.length ? "Elegí un club" : "Elegí la división";
    selectClub.appendChild(opcionPlaceholder);

    clubes.forEach((club) => {
      const opcion = document.createElement("option");
      opcion.value = club.id;
      opcion.textContent = club.nombre;
      opcion.dataset.escudo = club.escudo || "";
      selectClub.appendChild(opcion);
    });

    selectClub.disabled = clubes.length === 0;
  }

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

    if (!selectPais.value) {
      const pais = azar(PAISES);
      selectPais.value = pais.id;
    }
    selectPais.dispatchEvent(new Event("change"));

    const paisesConLiga = PAISES.filter((pais) => LIGAS_POR_PAIS[pais.id]);
    const paisLiga = azar(paisesConLiga);
    selectLigaPais.value = paisLiga.id;
    selectLigaPais.dispatchEvent(new Event("change"));

    const divisiones = idLigaActual ? DIVISIONES_POR_LIGA[idLigaActual] || [] : [];
    if (divisiones.length === 0) return;
    const division = azar(divisiones);
    selectDivision.value = division.id;
    selectDivision.dispatchEvent(new Event("change"));

    const clubes = CLUBES_POR_DIVISION[division.id] || [];
    if (clubes.length === 0) return;
    const club = azar(clubes);
    selectClub.value = club.id;
    selectClub.dispatchEvent(new Event("change"));

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
      ligaPais: selectLigaPais.value,
      liga: idLigaActual,
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
    if (!datos.ligaPais) return "Elegí el país de la liga.";
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
      ligaPais: datos.ligaPais,
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
    console.log("Carrera iniciada con:", jugador);
    window.jugadorActual = jugador;

    // Reemplazamos el menú por la pantalla de juego (HUD).
    Estado.cargar(); // toma window.jugadorActual y lo expande + guarda
    document.getElementById("pantalla-menu").hidden = true;
    document.getElementById("pantalla-juego").hidden = false;
    pintarHUD(Estado.obtener());

    abrirModalCartas(); 
  }
});