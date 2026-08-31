// copasargentinas.js
// Depende de: NOMBRES_CLUBES (definido en hud.js) y crearCabeceraMinijuego (eventosdelantero.js)

// Helper para elegir rival aleatorio (usa la división del jugador)
function elegirRivalAleatorio(jugador) {
  const clubes = CLUBES_POR_DIVISION[jugador.division] || [];
  const rivales = clubes.filter(c => c.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)];
}

// Verifica que el rival no sea el mismo club
function asegurarRivalDiferente(jugador, rivalId) {
  if (rivalId === jugador.club) {
    const rival = elegirRivalAleatorio(jugador);
    return rival ? rival.id : null;
  }
  return rivalId;
}

// ------------------------------------------------------------------
// SIMULACIÓN DE COPAS (sin probabilidad automática, siempre minijuego en final)
// ------------------------------------------------------------------

// Copa Argentina: llega a final con probabilidad según media, rival aleatorio
function simularCopaArgentina(jugador) {
  const PROB_CATEGORIA = { grande: 40, mediano: 30, chico: 20, diminuto: 10 };
  const categorias = ["grande", "mediano", "chico", "diminuto"];

  // Bonus según media del jugador (reutilizamos el mismo esquema de la liga)
  const BONUS_MEDIA = [
    { min: 0, max: 55, bonus: 0 },
    { min: 56, max: 65, bonus: 2 },
    { min: 66, max: 75, bonus: 6 },
    { min: 76, max: 85, bonus: 10 },
    { min: 86, max: 95, bonus: 14 },
    { min: 96, max: 99, bonus: 19 }
  ];

  // Buscar la categoría del club del jugador
  const clubJugador = CLUBES_POR_DIVISION[jugador.division]?.find(c => c.id === jugador.club);
  const categoriaJugador = clubJugador ? clubJugador.categoria : null;
  const media = jugador.media;

  // 1. Calcular probabilidades por categoría (con bonus si la categoría del jugador es la suya)
  let probCategorias = {};
  let totalProb = 0;
  categorias.forEach(cat => {
    let prob = PROB_CATEGORIA[cat];
    if (cat === categoriaJugador) {
      const bonus = BONUS_MEDIA.find(rango => media >= rango.min && media <= rango.max)?.bonus || 0;
      prob += bonus;
    }
    probCategorias[cat] = prob;
    totalProb += prob;
  });

  // 2. Elegir categoría ganadora
  let random = Math.random() * totalProb;
  let categoriaElegida = "grande";
  for (let cat of categorias) {
    random -= probCategorias[cat];
    if (random <= 0) {
      categoriaElegida = cat;
      break;
    }
  }

  // 3. Dentro de la categoría elegida, elegir club ganador con bonus para el jugador
  const clubesCategoria = CLUBES_POR_DIVISION[jugador.division]?.filter(c => c.categoria === categoriaElegida) || [];
  if (clubesCategoria.length === 0) return { eliminado: true, ronda: "Cuartos" };

  let totalPesoClubes = 0;
  const pesos = clubesCategoria.map(club => {
    let peso = 1; // peso base
    if (club.id === jugador.club) {
      const bonus = BONUS_MEDIA.find(rango => media >= rango.min && media <= rango.max)?.bonus || 0;
      peso += bonus; // bonus directo al club del jugador
    }
    totalPesoClubes += peso;
    return { club, peso };
  });

  // Sortear club ganador
  random = Math.random() * totalPesoClubes;
  let clubGanador = null;
  for (let item of pesos) {
    random -= item.peso;
    if (random <= 0) {
      clubGanador = item.club;
      break;
    }
  }
  if (!clubGanador) clubGanador = pesos[pesos.length - 1].club;

  // 4. Si el club ganador es el del jugador -> final
  if (clubGanador.id === jugador.club) {
    const rival = elegirRivalAleatorio(jugador);
    return { enFinal: true, rival: rival };
  } else {
    return { eliminado: true, ronda: "Cuartos" };
  }
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
  rivalId = asegurarRivalDiferente(jugador, rivalId);
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
  rivalId = asegurarRivalDiferente(jugador, rivalId);
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
  rivalId = asegurarRivalDiferente(jugador, rivalId);
  return { rivalId, rival: NOMBRES_CLUBES[rivalId] || { nombre: "Rival" } };
}

// ------------------------------------------------------------------
// MINIJUEGOS NUEVOS
// ------------------------------------------------------------------

// 1. Tiro Libre al Ángulo (barra de potencia, afecta pegada)
function minijuegoTiroLibre(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  
  // Tamaño de la zona verde según pegada
  let greenSize;
  const pegada = jugador.stats.pegada || 0;
  if (pegada <= 60) greenSize = 3;
  else if (pegada <= 75) greenSize = 6;
  else if (pegada <= 85) greenSize = 10;
  else if (pegada <= 95) greenSize = 15;
  else greenSize = 20;

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

  // Velocidad 20% más rápida (2.4 en vez de 2)
  interval = setInterval(() => {
    poder += direccion * 2.4;
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
  
  // Velocidad 50% más rápida (factor 1.5)
  const speedFactor = 1.5; // antes 1.5 - ((vel+res)/200) → ahora fijo o puede variar según stats? El usuario dijo "aumentar la velocidad un 50% más rápido", así que multiplicamos la velocidad base por 1.5. Podemos usar la anterior * 1.5.
  // Para no complicar, usamos 2.0 fijo? Pero él dijo "50% más rápido", así que partimos de la base 1.5 y lo multiplicamos por 1.5 → 2.25. Mejor lo dejamos en 2.25.
  const velocidad = 2.25; // 50% más rápido que el original 1.5

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Anticipo Aéreo!</h3>
      <p>Hacé clic cuando el borde del círculo exterior pase por el círculo interior.</p>
      <div class="aerial-container">
        <div class="aerial-inner-circle"></div>
        <div class="aerial-outer-circle" id="aerial-outer"></div>
      </div>
    </div>
  `;

  const outer = document.getElementById("aerial-outer");
  let size = 100; // porcentaje del contenedor
  let interval;

  interval = setInterval(() => {
    size -= velocidad;
    if (size <= 0) { clearInterval(interval); contenedor.innerHTML = ""; callback(false); }
    outer.style.width = `${size}%`;
    outer.style.height = `${size}%`;

    // El círculo interior es el 25% del contenedor (permanece fijo). 
    // Consideramos acierto cuando el borde exterior (size) está entre 20% y 30% (zona del trazo)
    if (size < 30 && size > 20) {
      // Si el jugador no ha clickeado, se auto-gana? El bug era que se ganaba solo.
      // Ahora solo debe ganar si el jugador hace clic en ese momento.
      // No auto-ganar, esperar click.
    }
  }, 60);

  // El jugador debe hacer clic en el botón (círculo exterior) cuando esté en la zona
  outer.addEventListener("click", () => {
    if (size < 30 && size > 20) {
      clearInterval(interval); contenedor.innerHTML = ""; callback(true);
    } else {
      clearInterval(interval); contenedor.innerHTML = ""; callback(false);
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

    rivalId = asegurarRivalDiferente(jugador, rivalId);
    if (rivalId) {
      jugador.copasPendientes.push({ año: añoProximo, tipo: "supercopa", rivalId: rivalId });
    }
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

      rivalId = asegurarRivalDiferente(jugador, rivalId);
      if (rivalId) {
        jugador.copasPendientes.push({ año: añoProximo, tipo: "trofeo", rivalId: rivalId });
      }
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

      rivalId = asegurarRivalDiferente(jugador, rivalId);
      if (rivalId) {
        jugador.copasPendientes.push({ año: añoProximo, tipo: "supercopaInt", rivalId: rivalId });
      }
    }
  }
}

// ------------------------------------------------------------------
// MOSTRAR COPA PENDIENTE (cuando avanzas de año y hay copas agendadas)
// ------------------------------------------------------------------
function mostrarCopaPendiente(copa, callback) {
  const jugador = Estado.obtener();

  // Verificar que el rival no sea el mismo club
  if (copa.rivalId === jugador.club) {
    const rivalAlt = elegirRivalAleatorio(jugador);
    copa.rivalId = rivalAlt ? rivalAlt.id : null;
  }

  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival", escudo: "" };
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  let titulo, imagen;
  let tipoCopa = ""; // para guardar en historial
  if (copa.tipo === "supercopa") {
    titulo = "SuperCopa Argentina";
    imagen = "Trofeos/SuperCopaArgentina.png";
    tipoCopa = "superCopa";
  } else if (copa.tipo === "trofeo") {
    titulo = "Trofeo de Campeones";
    imagen = "Trofeos/TrofeoDeCampeonesArgentina.png";
    tipoCopa = "trofeo";
  } else {
    titulo = "SuperCopa Internacional Argentina";
    imagen = "Trofeos/SuperCopaInternacionalArgentina.png";
    tipoCopa = "superCopaInt";
  }

  let minijuego;
  if (copa.tipo === "supercopa") {
    minijuego = (cb) => minijuegoMemoria(cb, jugador, rival);
  } else if (copa.tipo === "trofeo") {
    minijuego = (cb) => minijuegoQTE(cb, jugador, rival);
  } else {
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
      // Guardar en historial de copas especiales
      if (!jugador.resultadoCopasEspeciales) jugador.resultadoCopasEspeciales = [];
      jugador.resultadoCopasEspeciales.push({
        año: copa.año,
        tipo: copa.tipo,
        resultado: exito ? "campeon" : "subcampeon"
      });

      // Actualizar campeonesHistorial y contador de títulos
      const hist = (jugador.campeonesHistorial || []).find(h => h.año === copa.año);
      if (hist) {
        if (tipoCopa === "trofeo") hist.trofeo = exito ? jugador.club : null;
        if (tipoCopa === "superCopa") hist.superCopa = exito ? jugador.club : null;
        if (tipoCopa === "superCopaInt") hist.superCopaInt = exito ? jugador.club : null;
      }
      if (exito) jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;

      Estado.guardar();

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