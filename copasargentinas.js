// copas.js
// Depende de: NOMBRES_CLUBES (definido en hud.js) y crearCabeceraMinijuego (eventosdelantero.js)

// Helper para elegir rival aleatorio (usa la división del jugador)
function elegirRivalAleatorio(jugador) {
  const clubes = CLUBES_POR_DIVISION[jugador.division] || [];
  const rivales = clubes.filter(c => c.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)];
}

// ------------------------------------------------------------------
// SIMULACIÓN DE COPAS (sin probabilidad automática, siempre minijuego en final)
// ------------------------------------------------------------------

// Copa Argentina: llega a final con probabilidad según media, rival aleatorio
function simularCopaArgentina(jugador) {
  const prob = 0.5 + (jugador.media - 60) * 0.008; // Ajusta según media
  if (Math.random() > prob) {
    return { eliminado: true, ronda: "Cuartos" };
  }
  const rival = elegirRivalAleatorio(jugador);
  return { enFinal: true, rival: rival };
}

// SuperCopa Argentina: se juega entre campeón de Liga y campeón de Copa del año anterior
function simularSuperCopa(jugador, ligaCampeon, copaCampeon) {
  const soyLiga = ligaCampeon === jugador.club;
  const soyCopa = copaCampeon === jugador.club;
  if (!soyLiga && !soyCopa) return null;
  let rivalId;
  if (soyLiga && soyCopa) rivalId = elegirRivalAleatorio(jugador).id;
  else if (soyLiga) rivalId = copaCampeon;
  else rivalId = ligaCampeon;
  return { rivalId, rival: NOMBRES_CLUBES[rivalId] || { nombre: "Rival" } };
}

// Trofeo de Campeones: campeón de Liga del año anterior vs campeón de Liga del año anterior al anterior
function simularTrofeo(jugador, ligaAnterior, ligaAnterior2) {
  const soy1 = ligaAnterior === jugador.club;
  const soy2 = ligaAnterior2 === jugador.club;
  if (!soy1 && !soy2) return null;
  let rivalId;
  if (soy1 && soy2) rivalId = elegirRivalAleatorio(jugador).id;
  else if (soy1) rivalId = ligaAnterior2;
  else rivalId = ligaAnterior;
  return { rivalId, rival: NOMBRES_CLUBES[rivalId] || { nombre: "Rival" } };
}

// SuperCopa Internacional: campeón del Trofeo de Campeones vs campeón de Copa Argentina (mismo año)
function simularSuperCopaInt(jugador, trofeoCampeon, copaCampeon) {
  const soyTrofeo = trofeoCampeon === jugador.club;
  const soyCopa = copaCampeon === jugador.club;
  if (!soyTrofeo && !soyCopa) return null;
  let rivalId;
  if (soyTrofeo && soyCopa) rivalId = elegirRivalAleatorio(jugador).id;
  else if (soyTrofeo) rivalId = copaCampeon;
  else rivalId = trofeoCampeon;
  return { rivalId, rival: NOMBRES_CLUBES[rivalId] || { nombre: "Rival" } };
}

// ------------------------------------------------------------------
// MINIJUEGOS NUEVOS
// ------------------------------------------------------------------

// 1. Tiro Libre al Ángulo (barra de potencia, afecta pegada)
function minijuegoTiroLibre(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const greenSize = 10 + (jugador.stats.pegada || 0) * 0.15;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Tiro Libre al Ángulo!</h3>
      <p>Mantené presionado y soltá en la zona verde.</p>
      <div class="power-bar-track">
        <div class="power-zone" style="left: ${50 - greenSize}%; width: ${greenSize * 2}%"></div>
        <div class="power-indicator" id="power-indicator"></div>
      </div>
      <button class="boton-iniciar-qte" id="btn-press-hold">MANTENER</button>
    </div>
  `;

  const indicador = document.getElementById("power-indicator");
  const boton = document.getElementById("btn-press-hold");
  let poder = 0, direccion = 1, interval;

  interval = setInterval(() => {
    poder += direccion * 2;
    if (poder > 100) { poder = 100; direccion = -1; }
    if (poder < 0) { poder = 0; direccion = 1; }
    indicador.style.left = `${poder}%`;
  }, 50);

  // Mouse
  boton.addEventListener("mousedown", () => clearInterval(interval));
  boton.addEventListener("mouseup", () => {
    if (Math.abs(poder - 50) < greenSize) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    } else {
      clearInterval(interval); contenedor.innerHTML = ""; callback(false);
    }
  });

  // Táctil
  boton.addEventListener("touchstart", () => clearInterval(interval));
  boton.addEventListener("touchend", () => {
    if (Math.abs(poder - 50) < greenSize) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    } else {
      clearInterval(interval); contenedor.innerHTML = ""; callback(false);
    }
  });
}

// 2. Anticipo Aéreo (círculo que se achica, afecta velocidad/resistencia)
function minijuegoAereo(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const speedFactor = 1.5 - ((jugador.stats.velocidad + jugador.stats.resistencia) / 200);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Anticipo Aéreo!</h3>
      <p>Hacé clic cuando los círculos coincidan.</p>
      <div class="aerial-container">
        <div class="aerial-inner-circle"></div>
        <div class="aerial-outer-circle" id="aerial-outer"></div>
      </div>
    </div>
  `;

  const outer = document.getElementById("aerial-outer");
  let size = 100;
  let interval;

  interval = setInterval(() => {
    size -= speedFactor;
    if (size <= 10) { clearInterval(interval); contenedor.innerHTML = ""; callback(false); }
    outer.style.width = `${size}%`;
    outer.style.height = `${size}%`;
    if (size < 22 && size > 15) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    }
  }, 60);

  outer.addEventListener("click", () => {
    if (size < 25 && size > 12) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    }
  });
}

// 3. Penal del Campeonato (barra horizontal de reflejos)
function minijuegoPenalReflejos(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const greenSize = 8 + (jugador.stats.pegada || 0) * 0.1;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Penal del Campeonato!</h3>
      <p>Hacé clic cuando la barra esté en la zona verde.</p>
      <div class="power-bar-track horizontal">
        <div class="power-zone" style="left: ${50 - greenSize}%; width: ${greenSize * 2}%"></div>
        <div class="power-indicator" id="penal-indicator"></div>
      </div>
      <button class="boton-iniciar-qte" id="btn-penal-click">¡PATEAR!</button>
    </div>
  `;

  const indicador = document.getElementById("penal-indicator");
  const boton = document.getElementById("btn-penal-click");
  let poder = 0, direccion = 1, interval;

  interval = setInterval(() => {
    poder += direccion * 3;
    if (poder > 100) { poder = 100; direccion = -1; }
    if (poder < 0) { poder = 0; direccion = 1; }
    indicador.style.left = `${poder}%`;
  }, 30);

  boton.addEventListener("click", () => {
    if (Math.abs(poder - 50) < greenSize) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    } else {
      clearInterval(interval); contenedor.innerHTML = ""; callback(false);
    }
  });
}

// ------------------------------------------------------------------
// RESULTADO DE COPA ARGENTINA (muestra el minijuego según sorteo)
// ------------------------------------------------------------------
function mostrarResultadoCopa(resultadoCopa, callback) {
  const contenedor = document.getElementById("competition-container");
  const jugador = Estado.obtener();
  const rival = resultadoCopa.rival;
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  // Elegir minijuego aleatorio: Anticipo Aéreo o Penal Reflejos
  const tipo = Math.random() < 0.5 ? "aereo" : "penal";

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <p>¡Final de la Copa Argentina! Tenés que ganar esta instancia para levantar la copa.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-copa">¡Jugar la Final!</button>
    </div>
  `;

  document.getElementById("btn-jugar-copa").addEventListener("click", () => {
    if (tipo === "aereo") {
      minijuegoAereo((exito) => {
        if (exito) {
          contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN COPA ARGENTINA!</h2><img src="Trofeos/CopaArgentina.png" alt="Copa"><p>¡Golazo de cabeza en el minuto 94!</p><button class="boton-continuar">Continuar</button></div>`;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: true });
          });
        } else {
          contenedor.innerHTML = `${cabecera}<div class="competition-card subcampeon"><p>Subcampeón 🥈</p><p>Se escapó en el último minuto.</p><button class="boton-continuar">Continuar</button></div>`;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: false });
          });
        }
      }, jugador, rival);
    } else {
      minijuegoPenalReflejos((exito) => {
        if (exito) {
          contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN COPA ARGENTINA!</h2><img src="Trofeos/CopaArgentina.png" alt="Copa"><p>¡El arquero adivinó, pero tu pena fue perfecto!</p><button class="boton-continuar">Continuar</button></div>`;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: true });
          });
        } else {
          contenedor.innerHTML = `${cabecera}<div class="competition-card subcampeon"><p>Subcampeón 🥈</p><p>Fallaste el penal y la copa se fue.</p><button class="boton-continuar">Continuar</button></div>`;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: false });
          });
        }
      }, jugador, rival);
    }
  });
}

// ------------------------------------------------------------------
// AGENDAR PRÓXIMAS COPAS (se llama después de cada año)
// ------------------------------------------------------------------
function agendarProximasCopas(jugador, añoActual, resLiga, resCopa) {
  const historial = jugador.campeonesHistorial;
  const añoProximo = añoActual + 1;
  const soyCampeonLiga = resLiga.esCampeon;
  const soyCampeonCopa = resCopa.esCampeon;

  // SuperCopa Argentina
  if (soyCampeonLiga || soyCampeonCopa) {
    let rivalId;
    if (soyCampeonLiga && soyCampeonCopa) rivalId = elegirRivalAleatorio(jugador).id;
    else if (soyCampeonLiga) rivalId = historial.find(h => h.año === añoActual).copa || elegirRivalAleatorio(jugador).id;
    else rivalId = historial.find(h => h.año === añoActual).liga || elegirRivalAleatorio(jugador).id;

    jugador.copasPendientes.push({ año: añoProximo, tipo: "supercopa", rivalId: rivalId });
  }

  // Trofeo de Campeones (solo si hay dos ligas consecutivas en historial)
  const histAnterior = historial.find(h => h.año === añoActual - 1);
  const histAnterior2 = historial.find(h => h.año === añoActual - 2);
  if (histAnterior && histAnterior2) {
    if (histAnterior.liga === jugador.club || histAnterior2.liga === jugador.club) {
      let rivalId;
      if (histAnterior.liga === jugador.club && histAnterior2.liga === jugador.club) rivalId = elegirRivalAleatorio(jugador).id;
      else if (histAnterior.liga === jugador.club) rivalId = histAnterior2.liga;
      else rivalId = histAnterior.liga;

      jugador.copasPendientes.push({ año: añoProximo, tipo: "trofeo", rivalId: rivalId });
    }
  }

  // SuperCopa Internacional (Trofeo anterior vs Copa anterior)
  const histActual = historial.find(h => h.año === añoActual);
  const histTrofeo = historial.find(h => h.año === añoActual - 1); // Trofeo se jugó el año pasado
  if (histActual && histTrofeo) {
    if (histActual.copa === jugador.club || histTrofeo.trofeo === jugador.club) {
      let rivalId;
      if (histActual.copa === jugador.club && histTrofeo.trofeo === jugador.club) rivalId = elegirRivalAleatorio(jugador).id;
      else if (histActual.copa === jugador.club) rivalId = histTrofeo.trofeo;
      else rivalId = histActual.copa;

      jugador.copasPendientes.push({ año: añoProximo, tipo: "supercopaInt", rivalId: rivalId });
    }
  }
}

// ------------------------------------------------------------------
// MOSTRAR COPA PENDIENTE (cuando avanzas de año y hay copas agendadas)
// ------------------------------------------------------------------
function mostrarCopaPendiente(copa, callback) {
  const jugador = Estado.obtener();
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival", escudo: "" };
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  let titulo, imagen;
  if (copa.tipo === "supercopa") {
    titulo = "SuperCopa Argentina";
    imagen = "Trofeos/SuperCopaArgentina.png";
  } else if (copa.tipo === "trofeo") {
    titulo = "Trofeo de Campeones";
    imagen = "Trofeos/TrofeoDeCampeonesArgentina.png";
  } else {
    titulo = "SuperCopa Internacional Argentina";
    imagen = "Trofeos/SuperCopaInternacionalArgentina.png";
  }

  let minijuego;
  if (copa.tipo === "supercopa") {
    // Jugada preparada (memoria)
    minijuego = (cb) => minijuegoMemoria(cb, jugador, rival);
  } else if (copa.tipo === "trofeo") {
    // Slalom final (QTE)
    minijuego = (cb) => minijuegoQTE(cb, jugador, rival);
  } else {
    // Tiro libre al ángulo
    minijuego = (cb) => minijuegoTiroLibre(cb, jugador, rival);
  }

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>${titulo}</h3>
      <p>¡Partido especial! Jugate el todo por el todo para sumar otro título.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-pendiente">¡Jugar!</button>
    </div>
  `;

  document.getElementById("btn-jugar-pendiente").addEventListener("click", () => {
    contenedor.innerHTML = "";
    minijuego((exito) => {
      if (exito) {
        contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN ${titulo.toUpperCase()}!</h2><img src="${imagen}" alt="Trofeo"><button class="boton-continuar">Continuar</button></div>`;
        contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
          contenedor.innerHTML = ""; contenedor.hidden = true; callback();
        });
      } else {
        contenedor.innerHTML = `${cabecera}<div class="competition-card subcampeon"><p>Subcampeón 🥈</p><button class="boton-continuar">Continuar</button></div>`;
        contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
          contenedor.innerHTML = ""; contenedor.hidden = true; callback();
        });
      }
    });
  });
}