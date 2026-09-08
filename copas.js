/**
 * copas.js
 * -----------------------------------------
 * Todas las competencias de copas del juego, fusionadas en un solo
 * archivo. Es la unión de los antiguos:
 *   - copasargentinas.js          (Copa Argentina, SuperCopa, Trofeo, SuperCopa Int.)
 *   - copassudamerica.js          (Libertadores, Sudamericana, Recopa)
 *   - copasinternacionalesclubes.js (Mundial de Clubes)
 *   - copasselecciones.js         (Copa América, Finalissima, Mundial de Selecciones)
 * No se modificó ninguna función: mismo código, mismos nombres.
 * -----------------------------------------
 */


// ============================================
// SECCIÓN: copasargentinas.js
// ============================================
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

  const BONUS_MEDIA = [
    { min: 0, max: 55, bonus: 0 },
    { min: 56, max: 65, bonus: 2 },
    { min: 66, max: 75, bonus: 6 },
    { min: 76, max: 85, bonus: 10 },
    { min: 86, max: 95, bonus: 14 },
    { min: 96, max: 99, bonus: 19 }
  ];

  const clubJugador = CLUBES_POR_DIVISION[jugador.division]?.find(c => c.id === jugador.club);
  const categoriaJugador = clubJugador ? clubJugador.categoria : null;
  const media = jugador.media;

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

  let random = Math.random() * totalProb;
  let categoriaElegida = "grande";
  for (let cat of categorias) {
    random -= probCategorias[cat];
    if (random <= 0) { categoriaElegida = cat; break; }
  }

  const clubesCategoria = CLUBES_POR_DIVISION[jugador.division]?.filter(c => c.categoria === categoriaElegida) || [];
  if (clubesCategoria.length === 0) return { eliminado: true, ronda: "Cuartos" };

  let totalPesoClubes = 0;
  const pesos = clubesCategoria.map(club => {
    let peso = 1;
    if (club.id === jugador.club) {
      const bonus = BONUS_MEDIA.find(rango => media >= rango.min && media <= rango.max)?.bonus || 0;
      peso += bonus;
    }
    totalPesoClubes += peso;
    return { club, peso };
  });

  random = Math.random() * totalPesoClubes;
  let clubGanador = null;
  for (let item of pesos) {
    random -= item.peso;
    if (random <= 0) { clubGanador = item.club; break; }
  }
  if (!clubGanador) clubGanador = pesos[pesos.length - 1].club;

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

  const pegada = jugador.stats.pegada || 0;
  let greenSize;
  if (pegada <= 60) greenSize = 3;
  else if (pegada <= 75) greenSize = 5;
  else if (pegada <= 85) greenSize = 7;
  else if (pegada <= 95) greenSize = 10;
  else greenSize = 13;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Tiro Libre al Ángulo!</h3>
      <p>Mantené presionado y soltá cuando la barra esté en la zona verde.</p>
      <button class="boton-iniciar-qte" id="btn-listo-tirolibre">Comenzar</button>
    </div>
  `;

  document.getElementById("btn-listo-tirolibre").addEventListener("click", () => {
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
      poder += direccion * 4.5;
      if (poder > 100) { poder = 100; direccion = -1; }
      if (poder < 0) { poder = 0; direccion = 1; }
      indicador.style.left = `${poder}%`;
    }, 50);

    boton.addEventListener("mousedown", () => clearInterval(interval));
    boton.addEventListener("mouseup", () => {
      if (Math.abs(poder - 50) < greenSize) {
        clearInterval(interval); contenedor.innerHTML = ""; callback(true);
      } else {
        clearInterval(interval); contenedor.innerHTML = ""; callback(false);
      }
    });

    boton.addEventListener("touchstart", () => clearInterval(interval));
    boton.addEventListener("touchend", () => {
      if (Math.abs(poder - 50) < greenSize) {
        clearInterval(interval); contenedor.innerHTML = ""; callback(true);
      } else {
        clearInterval(interval); contenedor.innerHTML = ""; callback(false);
      }
    });
  });
}

// ---------- MINIJUEGO AÉREO ARREGLADO ----------
function minijuegoAereo(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const habilidadAerea = jugador.stats.juegoAereo || jugador.stats.resistencia || 50;
  const tamanoObjetivo = Math.min(42, 16 + habilidadAerea / 3);
  const margenAereo = Math.min(24, 8 + habilidadAerea / 6);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Anticipo Aéreo!</h3>
      <p>Hacé clic cuando el borde del círculo exterior toque el círculo interior (¡margen amplio!).</p>
      <div class="aerial-container" id="aerial-container" style="width:220px; height:220px; position:relative; cursor:crosshair;">
        <div class="aerial-inner-circle" style="width:${tamanoObjetivo}%; height:${tamanoObjetivo}%;"></div>
        <div class="aerial-outer-circle" id="aerial-outer" style="position:absolute; top:0; left:0; border:4px dashed #ffd700;"></div>
      </div>
    </div>
  `;

  const contenedorAereo = document.getElementById("aerial-container");
  const outer = document.getElementById("aerial-outer");
  let size = 100;
  let velocidad = Math.max(.65, 1.65 - habilidadAerea / 120);
  let interval;

  interval = setInterval(() => {
    velocidad += 0.05;
    size -= velocidad;
    if (size <= 0) {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(false);
      return;
    }
    outer.style.width = `${size}%`;
    outer.style.height = `${size}%`;
    outer.style.top = `${(100 - size) / 2}%`;
    outer.style.left = `${(100 - size) / 2}%`;
  }, 60);

  contenedorAereo.addEventListener("mousedown", (e) => {
    if (size < tamanoObjetivo + margenAereo / 2 && size > tamanoObjetivo - margenAereo / 2) {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(true);
    } else {
      clearInterval(interval);
      contenedor.innerHTML = "";
      callback(false);
    }
  });
}

// 3. Penal del Campeonato (barra horizontal de reflejos)
function minijuegoPenalReflejos(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  const pegada = jugador.stats.pegada || 0;
  let greenSize;
  if (pegada <= 60) greenSize = 3;
  else if (pegada <= 75) greenSize = 5;
  else if (pegada <= 85) greenSize = 7;
  else if (pegada <= 95) greenSize = 10;
  else greenSize = 13;

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
    poder += direccion * 5;
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

// ---------- PROCESAR COPAS PENDIENTES (con delegación a internacionales) ----------
function procesarCopasPendientes(callback) {
  const jugador = Estado.obtener();
  const año = jugador.año;
  const copas = (jugador.copasPendientes || []).filter(c => c.año === año);

  if (copas.length === 0) {
    callback();
    return;
  }

  let indice = 0;
  function siguiente() {
    if (indice >= copas.length) {
      jugador.copasPendientes = (jugador.copasPendientes || []).filter(c => c.año !== año);
      Estado.guardar();
      callback();
      return;
    }
    const copa = copas[indice];
    indice++;

    if (copa.tipo === "libertadores" && typeof mostrarLibertadores === "function") {
      mostrarLibertadores(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "sudamericana" && typeof mostrarSudamericana === "function") {
      mostrarSudamericana(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "recopa" && typeof mostrarRecopa === "function") {
      mostrarRecopa(copa, () => {
        siguiente();
      });
    } else if (copa.tipo === "mundial-clubes" && typeof mostrarMundialClubes === "function") {
      mostrarMundialClubes(copa, () => {
        siguiente();
      });
    } else {
      mostrarCopaPendiente(copa, () => {
        siguiente();
      });
    }
  }
  siguiente();
}

// ------------------------------------------------------------------
// RESULTADO DE COPA ARGENTINA (muestra el minijuego según sorteo)
// ------------------------------------------------------------------
function mostrarResultadoCopa(resultadoCopa, callback) {
  window.CONTEXTO_PARTIDO = { torneo: "Copa Argentina", fase: resultadoCopa.enFinal ? "Final" : "Eliminación" };
  const contenedor = document.getElementById("competition-container");
  const jugador = Estado.obtener();
  const rival = resultadoCopa.rival;
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <p>¡Final de la Copa Argentina! Tenés que ganar esta instancia para levantar la copa.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-copa">¡Jugar la Final!</button>
    </div>
  `;

  document.getElementById("btn-jugar-copa").addEventListener("click", () => {
    obtenerMinijuegoCopaArgentina("copaArgentina", jugador, rival)((exito) => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN COPA ARGENTINA!</h2><img src="Trofeos/CopaArgentina.png" alt="Copa"><p>La copa se queda con vos.</p><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de Copa Argentina 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: exito, subcampeon: !exito }); };
    });
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

  // Trofeo de Campeones: campeón de esta Liga vs campeón de la Liga anterior.
  // Se juega al cierre del segundo año, no un año después ni en un bucle.
  const histActual = historial.find(h => h.año === añoActual);
  const histAnterior = historial.find(h => h.año === añoActual - 1);
  if (histActual && histAnterior) {
    if (histActual.liga === jugador.club || histAnterior.liga === jugador.club) {
      let rivalId;
      if (histActual.liga === jugador.club && histAnterior.liga === jugador.club) rivalId = elegirRivalAleatorio(jugador).id;
      else if (histActual.liga === jugador.club) rivalId = histAnterior.liga;
      else rivalId = histActual.liga;

      rivalId = asegurarRivalDiferente(jugador, rivalId);
      if (rivalId && !jugador.copasPendientes.some(c => c.año === añoActual && c.tipo === "trofeo")) {
        jugador.copasPendientes.push({ año: añoActual, tipo: "trofeo", rivalId: rivalId });
      }
    }
  }

  // La Supercopa Internacional se agenda al resolver el Trofeo del mismo año.

  // ---- NUEVOS: Libertadores y Sudamericana (solo si corresponde) ----
  const pos = resLiga.posicion;
  const liga = jugador.liga;

  if (liga === "liga-profesional-argentina" || liga === "brasileirao-brasil") {
    const clasificaLiberta = resLiga.esCampeon || resLiga.subcampeon || (pos === 2 || pos === 3) || resCopa.esCampeon;
    const clasificaSud = (liga === "liga-profesional-argentina") && (pos >= 4 && pos <= 9) && !clasificaLiberta;

    if (clasificaLiberta) {
      if (!jugador.copasPendientes.some(c => c.año === añoProximo && c.tipo === "libertadores")) {
        jugador.copasPendientes.push({ año: añoProximo, tipo: "libertadores", rivalId: null });
      }
    } else if (clasificaSud) {
      if (!jugador.copasPendientes.some(c => c.año === añoProximo && c.tipo === "sudamericana")) {
        jugador.copasPendientes.push({ año: añoProximo, tipo: "sudamericana", rivalId: null });
      }
    }
  }

  // Mundial de Clubes: la plaza se define el año anterior a cada edición.
  if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, añoActual);
}

// ------------------------------------------------------------------
// MOSTRAR COPA PENDIENTE (cuando avanzas de año y hay copas agendadas)
// ------------------------------------------------------------------
function mostrarCopaPendiente(copa, callback) {
  // ✅ Si es una copa internacional (Libertadores, Sudamericana, Recopa), delegamos
  if (copa.tipo === "libertadores" && typeof mostrarLibertadores === "function") {
    mostrarLibertadores(copa, callback);
    return;
  }
  if (copa.tipo === "sudamericana" && typeof mostrarSudamericana === "function") {
    mostrarSudamericana(copa, callback);
    return;
  }
  if (copa.tipo === "recopa" && typeof mostrarRecopa === "function") {
    mostrarRecopa(copa, callback);
    return;
  }

  // Si no es internacional, seguimos con el flujo normal de copas argentinas
  const jugador = Estado.obtener();

  if (copa.rivalId === jugador.club) {
    const rivalAlt = elegirRivalAleatorio(jugador);
    copa.rivalId = rivalAlt ? rivalAlt.id : null;
  }

  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival", escudo: "" };
  const contenedor = document.getElementById("competition-container");

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

  window.CONTEXTO_PARTIDO = { torneo: titulo, fase: "Final" };
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const minijuego = obtenerMinijuegoCopaArgentina(copa.tipo, jugador, rival);

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
      if (!jugador.resultadoCopasEspeciales) jugador.resultadoCopasEspeciales = [];
      jugador.resultadoCopasEspeciales.push({
        año: copa.año,
        tipo: copa.tipo,
        resultado: exito ? "campeon" : "subcampeon"
      });

      if (exito) {
        jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;
      }

      const hist = (jugador.campeonesHistorial || []).find(h => h.año === copa.año);
      if (hist) {
        if (copa.tipo === "supercopa") hist.superCopa = exito ? jugador.club : null;
        if (copa.tipo === "trofeo") hist.trofeo = exito ? jugador.club : null;
        if (copa.tipo === "supercopaInt") hist.superCopaInt = exito ? jugador.club : null;
      }

      Estado.guardar();

      const supercopaGanada = (jugador.resultadoCopasEspeciales || []).some(resultado =>
        resultado.año === copa.año && resultado.tipo === "supercopa" && resultado.resultado === "campeon"
      );
      const habilitaInternacional = copa.tipo === "trofeo" && (exito || supercopaGanada);
      const jugarInternacional = () => {
        if (!habilitaInternacional) { callback(); return; }
        // No hay campeones simulados de otros clubes: el rival es un club válido aleatorio.
        mostrarCopaPendiente({ año: copa.año, tipo: "supercopaInt", rivalId: elegirRivalAleatorio(jugador).id }, callback);
      };

      if (exito) {
        contenedor.innerHTML = `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN ${titulo.toUpperCase()}!</h2><img src="${imagen}" alt="Trofeo"><button class="boton-continuar">Continuar</button></div>`;
        contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
          contenedor.innerHTML = ""; contenedor.hidden = true; jugarInternacional();
        });
      } else {
        contenedor.innerHTML = `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de ${titulo} 🥈</h2><p>La final se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
        contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
          contenedor.innerHTML = ""; contenedor.hidden = true; jugarInternacional();
        });
      }
    });
  });
}

// Componentes modernos reutilizables para las copas argentinas.
function minijuegoBarraArgentina(callback, jugador, rival, titulo, descripcion, statClave = "pegada") {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const ancho = Math.min(38, 12 + (jugador.stats[statClave] || 50) / 3.7);
  let posicion = 0, direccion = 1, activo = false, loop;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><h3>${titulo}</h3><p>${descripcion}</p>
    <div class="medidor-potencia"><span class="zona-perfecta" style="left:${50 - ancho / 2}%;width:${ancho}%"></span><span class="cursor-potencia" id="cursor-argentino"></span></div>
    <button class="boton-jugar-minijuego" id="accion-barra-argentina">Prepararse</button></div>`;
  const cursor = contenedor.querySelector("#cursor-argentino");
  const boton = contenedor.querySelector("#accion-barra-argentina");
  boton.onclick = () => {
    if (!activo) {
      activo = true; boton.textContent = "¡AHORA!";
      loop = setInterval(() => { posicion += direccion * 3.25; if (posicion >= 100 || posicion <= 0) direccion *= -1; cursor.style.left = `${posicion}%`; }, 18);
    } else {
      clearInterval(loop); callback(Math.abs(posicion - 50) <= ancho / 2);
    }
  };
}

function minijuegoPatronArgentino(callback, jugador, rival, titulo, descripcion, longitud = 5) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const disponibles = Array.from({ length: 9 }, (_, i) => i);
  const secuencia = Array.from({ length: longitud }, () => disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0]);
  let entrada = [];
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><h3>${titulo}</h3><p>${descripcion}</p><div class="grid-corto" id="patron-argentino"></div><button class="boton-jugar-minijuego" id="ver-patron-argentino">Ver jugada</button></div>`;
  const botones = [];
  const grid = contenedor.querySelector("#patron-argentino");
  for (let i = 0; i < 9; i++) { const boton = document.createElement("button"); boton.className = "memoria-punto"; boton.disabled = true; boton.dataset.i = i; grid.appendChild(boton); botones.push(boton); }
  contenedor.querySelector("#ver-patron-argentino").onclick = (evento) => {
    evento.currentTarget.hidden = true; let paso = 0;
    const loop = setInterval(() => { botones.forEach(b => b.classList.remove("iluminado")); if (paso === secuencia.length) { clearInterval(loop); botones.forEach(b => b.disabled = false); return; } botones[secuencia[paso++]].classList.add("iluminado"); }, 430);
  };
  botones.forEach(boton => boton.onclick = () => { entrada.push(+boton.dataset.i); boton.disabled = true; if (entrada.length === secuencia.length) callback(entrada.every((valor, indice) => valor === secuencia[indice])); });
}

function obtenerMinijuegoCopaArgentina(copa, jugador, rival) {
  if (copa === "copaArgentina") {
    if (jugador.posicion === "central") return cb => minijuegoDueloAereo(cb, jugador, rival, 2, "Despeje agónico");
    const stat = jugador.posicion === "arquero" ? "reflejos" : jugador.posicion === "enganche" ? "gambeta" : "pegada";
    const titulo = jugador.posicion === "arquero" ? "El héroe inesperado" : jugador.posicion === "enganche" ? "El penal de calidad" : "El penal decisivo";
    return cb => minijuegoBarraArgentina(cb, jugador, rival, titulo, "Frená el cursor en la zona verde para definir la copa.", stat);
  }
  if (copa === "supercopa") {
    if (jugador.posicion === "enganche") return cb => minijuegoPatronArgentino(cb, jugador, rival, "La jugada preparada", "Replicá cinco toques para filtrar el pase.");
    if (jugador.posicion === "central") return cb => minijuegoCierreProvidencial(cb, jugador, rival);
    if (jugador.posicion === "arquero") return cb => minijuegoCierreProvidencial(cb, jugador, rival);
    return cb => minijuegoQTE(cb, jugador, rival);
  }
  if (copa === "trofeo") {
    if (jugador.posicion === "central") return cb => minijuegoOffside(cb, jugador, rival);
    if (jugador.posicion === "arquero") return cb => minijuegoPatronArgentino(cb, jugador, rival, "Acomodar la barrera", "Memorizá las posiciones para cerrar el ángulo.", 4);
    const titulo = jugador.posicion === "enganche" ? "Tiro libre al ángulo" : "Definición a colocar";
    return cb => minijuegoBarraArgentina(cb, jugador, rival, titulo, "Soltá dentro de la zona verde para colocarla junto al palo.", "pegada");
  }
  if (jugador.posicion === "delantero" || jugador.posicion === "central") return cb => minijuegoDueloAereo(cb, jugador, rival, 3, jugador.posicion === "central" ? "Anticipo de selección" : "Tijera espectacular");
  if (jugador.posicion === "enganche") return cb => minijuegoPatronArgentino(cb, jugador, rival, "Pared de lujo", "Replicá la triangulación a un toque.");
  return cb => minijuegoBarraArgentina(cb, jugador, rival, "Saque de contragolpe", "Medí la potencia para iniciar el ataque.", "ataje");
}

// ============================================
// SECCIÓN: copassudamerica.js
// ============================================
// copassudamerica.js
// Depende de: NOMBRES_CLUBES, CLUBES_POR_DIVISION, crearCabeceraMinijuego

function obtenerRivalInternacional(jugador) {
  const argentinos = (CLUBES_POR_DIVISION["primera-division-argentina"] || []).filter(c => c.id !== jugador.club);
  const brasileros = (CLUBES_POR_DIVISION["serie-a-brasil"] || []).filter(c => c.id !== jugador.club);
  const jugadorEsBrasileño = jugador.division === "serie-a-brasil";

  // La Libertadores mezcla ambos países de forma visible: si jugás en Argentina,
  // la mitad de las llaves será ante un brasileño (y viceversa).
  const preferidos = jugadorEsBrasileño ? argentinos : brasileros;
  const alternativos = jugadorEsBrasileño ? brasileros : argentinos;
  const pool = preferidos.length && Math.random() < 0.5 ? preferidos : (alternativos.length ? alternativos : preferidos);
  // Mantiene a Brasil dentro de las llaves incluso si la carrera se inicia en Argentina.
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// ---------- Clasificación ----------
function clasificaLibertadores(jugador) {
  const resLiga = jugador.resultadoLiga;
  const resCopa = jugador.resultadoCopa;
  const pos = resLiga?.posicion;
  const liga = jugador.liga;

  if (liga !== "liga-profesional-argentina" && liga !== "brasileirao-brasil") return false;
  if (resCopa?.esCampeon) return true;
  if (resLiga?.esCampeon) return true;
  if (resLiga?.subcampeon) return true;
  if (pos === 2 || pos === 3) return true;
  return false;
}

function clasificaSudamericana(jugador) {
  const resLiga = jugador.resultadoLiga;
  const pos = resLiga?.posicion;
  const liga = jugador.liga;

  if (liga !== "liga-profesional-argentina") return false;
  if (clasificaLibertadores(jugador)) return false;
  if (pos >= 4 && pos <= 9) return true;
  return false;
}

function asegurarPlazaCampeonContinental(jugador, tipo, anioCopa) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  const anioSiguiente = anioCopa + 1;
  if (!jugador.copasPendientes.some(copa => copa.año === anioSiguiente && copa.tipo === tipo)) {
    jugador.copasPendientes.push({ año: anioSiguiente, tipo, rivalId: null, clasificacion: "campeon-defensor" });
  }
}

// ---------- Minijuego BarraQTE ----------
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>Copa Libertadores · Final</h3>
      <p>Presioná los botones correctos. Rojo (+5%), Rosa (-10%), Bordo (perdés). Necesitás 100%.</p>
      <button class="boton-iniciar-qte" id="btn-listo-barraqte">Comenzar</button>
    </div>
  `;

  document.getElementById("btn-listo-barraqte").addEventListener("click", () => {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card">
        <h3>Copa Libertadores · Final</h3>
        <p>Presioná los botones correctos. Rojo (+5%), Rosa (-10%), Bordo (perdés). Necesitás 100%.</p>
        <div class="barra-qte">
          <div class="barra-progreso" id="barra-progreso"></div>
          <span id="puntos-texto">0/100</span>
        </div>
        <div class="zona-botones" id="zona-botones" style="position:relative; height:200px; background:#1a1a24; border-radius:8px;"></div>
        <p>Tiempo: <span id="timer">20</span>s</p>
      </div>
    `;

    const zona = document.getElementById("zona-botones");
    const barra = document.getElementById("barra-progreso");
    const puntosTexto = document.getElementById("puntos-texto");
    const timer = document.getElementById("timer");
    let puntos = 0;
    // Velocidad y resistencia dan unos segundos extra para sostener la presión.
    let tiempo = Math.round(12 + ((jugador.stats.velocidad || 50) + (jugador.stats.resistencia || 50)) / 16);
    let terminado = false;

    const timerInterval = setInterval(() => {
      tiempo--;
      timer.textContent = tiempo;
      if (tiempo <= 0) {
        clearInterval(timerInterval);
        clearInterval(spawnInterval);
        terminado = true;
        contenedor.innerHTML = "";
        callback(false);
      }
    }, 1000);

    let spawnInterval;
    function spawnBoton() {
      const tipo = Math.random() < 0.7 ? "rojo" : (Math.random() < 0.5 ? "rosa" : "bordo");
      const btn = document.createElement("button");
      btn.className = `qte-boton-internacional ${tipo}`;
      btn.textContent = tipo === "rojo" ? "+5" : tipo === "rosa" ? "-10" : "X";
      btn.style.position = "absolute";
      btn.style.width = "50px";
      btn.style.height = "50px";
      btn.style.fontSize = "12px";
      btn.style.padding = "0";
      btn.style.background = tipo === "rojo" ? "#ff4444" : tipo === "rosa" ? "#ff69b4" : "#800000";
      btn.style.color = "#fff";
      btn.style.left = `${Math.random() * (zona.clientWidth - 60)}px`;
      btn.style.top = `${Math.random() * (zona.clientHeight - 60)}px`;
      zona.appendChild(btn);
      setTimeout(() => btn.remove(), 600);
    }

    spawnInterval = setInterval(spawnBoton, 800);
    setTimeout(() => {
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnBoton, 600);
    }, 5000);
    setTimeout(() => {
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnBoton, 400);
    }, 10000);

    zona.addEventListener("click", (e) => {
      if (terminado) return;
      const btn = e.target;
      if (btn.classList.contains("qte-boton-internacional")) {
        const tipo = btn.classList[1];
        if (tipo === "rojo") {
          puntos += 5;
          if (puntos >= 100) {
            clearInterval(timerInterval);
            clearInterval(spawnInterval);
            terminado = true;
            contenedor.innerHTML = "";
            callback(true);
            return;
          }
        } else if (tipo === "rosa") {
          puntos -= 10;
          if (puntos < 0) {
            clearInterval(timerInterval);
            clearInterval(spawnInterval);
            terminado = true;
            contenedor.innerHTML = "";
            callback(false);
            return;
          }
        } else if (tipo === "bordo") {
          clearInterval(timerInterval);
          clearInterval(spawnInterval);
          terminado = true;
          contenedor.innerHTML = "";
          callback(false);
          return;
        }
        barra.style.width = `${(puntos / 100) * 100}%`;
        puntosTexto.textContent = `${puntos}/100`;
      }
    });
  });
}

// ---------- Minijuego Memoria de Parejas (Sudamericana) ----------
function minijuegoMemoriaParejas(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  const emojis = ["⚽","🏆","🔥","💪","🎯","⚡","🥅","🛡️","👟","🌟"];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  const gambeta = jugador.stats.gambeta || 0;
  let tiempoVer = 1.0;
  if (gambeta <= 65) tiempoVer = 1.2;
  else if (gambeta <= 75) tiempoVer = 1.4;
  else if (gambeta <= 85) tiempoVer = 1.6;
  else if (gambeta <= 95) tiempoVer = 2.0;
  else tiempoVer = 2.5;

  let vidas = 5;
  if (jugador.media >= 85) vidas++;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>La Jugada Preparada</h3>
      <p>Memorizá las parejas de emojis. ¡Tenés ${vidas} vidas!</p>
      <div class="memoria-parejas" id="memoria-parejas" style="display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(5,1fr); gap:8px; max-width:420px; margin:20px auto;"></div>
      <div style="margin-top:10px;">Vidas: <span id="vidas">${'❤️'.repeat(vidas)}</span></div>
      <button class="boton-iniciar-qte" id="btn-iniciar-parejas">Comenzar</button>
    </div>
  `;

  const grid = document.getElementById("memoria-parejas");
  const vidasSpan = document.getElementById("vidas");
  const btnIniciar = document.getElementById("btn-iniciar-parejas");
  let reveladas = [];
  let paresEncontrados = 0;
  let bloqueado = false;
  let vidasRestantes = vidas;

  function renderizarCartas(mostrar) {
    grid.innerHTML = "";
    cartas.forEach((emoji, idx) => {
      const card = document.createElement("div");
      card.className = "carta-pareja";
      card.dataset.emoji = emoji;
      card.dataset.idx = idx;
      card.textContent = mostrar ? emoji : "?";
      card.style.background = mostrar ? "#2a2a3a" : "#1a1a24";
      card.style.border = "1px solid #333";
      card.style.borderRadius = "6px";
      card.style.padding = "10px";
      card.style.textAlign = "center";
      card.style.cursor = "pointer";
      card.style.fontSize = "24px";
      grid.appendChild(card);
    });
  }

  btnIniciar.addEventListener("click", () => {
    btnIniciar.style.display = "none";
    renderizarCartas(true);
    setTimeout(() => {
      renderizarCartas(false);
      grid.querySelectorAll('.carta-pareja').forEach(card => {
        card.addEventListener('click', manejarClick);
      });
    }, tiempoVer * 1000);
  });

  function manejarClick(e) {
    if (bloqueado) return;
    const card = e.target;
    if (card.classList.contains("revelada")) return;

    card.textContent = card.dataset.emoji;
    card.classList.add("revelada");
    card.style.background = "#3a3a4a";

    reveladas.push(card);

    if (reveladas.length === 2) {
      bloqueado = true;
      const [card1, card2] = reveladas;
      if (card1.dataset.emoji === card2.dataset.emoji) {
        paresEncontrados++;
        card1.classList.add("permanente");
        card2.classList.add("permanente");
        reveladas = [];
        bloqueado = false;
        if (paresEncontrados === 10) {
          contenedor.innerHTML = "";
          callback(true);
        }
      } else {
        vidasRestantes--;
        vidasSpan.textContent = '❤️'.repeat(vidasRestantes);
        if (vidasRestantes <= 0) {
          contenedor.innerHTML = "";
          callback(false);
          return;
        }
        setTimeout(() => {
          card1.textContent = "?";
          card2.textContent = "?";
          card1.classList.remove("revelada");
          card2.classList.remove("revelada");
          card1.style.background = "#1a1a24";
          card2.style.background = "#1a1a24";
          reveladas = [];
          bloqueado = false;
        }, 800);
      }
    }
  }
}

// ---------- Copa Libertadores - Camino Progresivo (CORREGIDO) ----------
function minijuegoCopaCompleta(callback, jugador, rivalInicial) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rivalInicial);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3 id="titulo-copa">Copa Libertadores - Fase de Grupos</h3>
      <p>Memorizá las secuencias de bloques iluminados. ¡Cuidado que aumentan!</p>
      <div class="libertadores-grid" id="libertadores-grid"></div>
      <div class="secuencia-info" id="secuencia-info"></div>
      <button class="boton-iniciar-qte" id="btn-comenzar-libertadores">Comenzar</button>
      <button class="boton-iniciar-qte" id="btn-repetir-secuencia" hidden>Repetir secuencia (2)</button>
    </div>
  `;

  const grid = document.getElementById("libertadores-grid");
  const info = document.getElementById("secuencia-info");
  const btnComenzar = document.getElementById("btn-comenzar-libertadores");
  const btnRepetir = document.getElementById("btn-repetir-secuencia");
  const tituloCopa = document.getElementById("titulo-copa");

  grid.style.gridTemplateColumns = "repeat(5, 1fr)";
  grid.style.maxWidth = "500px";
  grid.style.margin = "20px auto";
  const bloques = [];
  for (let i = 0; i < 20; i++) {
    const div = document.createElement("div");
    div.className = "memoria-punto";
    div.dataset.index = i;
    grid.appendChild(div);
    bloques.push(div);
  }

  const etapas = [
    { nombre: "Fase de Grupos - Partido 1", longitud: 1, fase: "grupos" },
    { nombre: "Fase de Grupos - Partido 2", longitud: 2, fase: "grupos" },
    { nombre: "Fase de Grupos - Partido 3", longitud: 3, fase: "grupos" },
    { nombre: "Octavos de Final", longitud: 4, fase: "eliminatoria" },
    { nombre: "Cuartos de Final", longitud: 5, fase: "eliminatoria" },
    { nombre: "Semifinal", longitud: 6, fase: "eliminatoria" },
    { nombre: "Final", longitud: 7, fase: "eliminatoria" }
  ];

  let indiceEtapa = 0;
  let erroresGrupos = 0;
  let ganadosGrupos = 0;
  let rivalActual = rivalInicial;
  let partidoTerminado = false;
  let bloqueadoGlobal = false; // para evitar clics en transición
  const edicionLibertadores = window.COPA_LIBERTADORES_ACTUAL || jugador.año;
  const MAX_REPETICIONES_SECUENCIA = 2; // antes 1: ahora tenés una chance extra por edición.
  if (!jugador.repeticionesLibertadores) jugador.repeticionesLibertadores = {};
  if (typeof jugador.repeticionesLibertadores[edicionLibertadores] !== "number") {
    jugador.repeticionesLibertadores[edicionLibertadores] = 0;
  }

  function generarSecuencia(longitud) {
    const indices = [];
    const disponibles = Array.from({ length: 20 }, (_, i) => i);
    for (let i = 0; i < longitud; i++) {
      const idx = Math.floor(Math.random() * disponibles.length);
      indices.push(disponibles.splice(idx, 1)[0]);
    }
    return indices;
  }

  function actualizarCabecera() {
    const nuevaCabecera = crearCabeceraMinijuego(jugador, rivalActual);
    const marcadorActual = contenedor.querySelector('.minijuego-marcador');
    if (marcadorActual) marcadorActual.outerHTML = nuevaCabecera;
  }

  function limpiarListeners() {
    bloques.forEach(b => {
      const old = b.onclick;
      if (old) b.onclick = null;
      // También eliminar eventos agregados con addEventListener
      b.replaceWith(b.cloneNode(true)); // esto elimina todos los listeners
    });
    // Recrear los bloques en el grid (ya que los clonamos, hay que re-obtener referencias)
    const nuevosBloques = grid.querySelectorAll('.memoria-punto');
    nuevosBloques.forEach((b, i) => {
      b.dataset.index = i;
    });
    bloques.length = 0;
    nuevosBloques.forEach(b => bloques.push(b));
  }

  function jugarPartido(etapa, callbackPartido) {
    const secuencia = generarSecuencia(etapa.longitud);
    let paso = 0;
    let esperandoUsuario = false;
    let aciertosUsuario = [];
    let fallo = false;
    let finalizado = false;

    // Primero, limpiar listeners de bloques anteriores
    limpiarListeners();

    bloques.forEach(b => b.classList.remove("iluminado", "usado", "activo"));
    info.textContent = "Memorizá la secuencia...";
    btnComenzar.disabled = true;

    function mostrarSecuencia() {
      paso = 0;
      esperandoUsuario = false;
      bloques.forEach(b => b.classList.remove("iluminado", "activo"));
      btnRepetir.hidden = true;
      const intervaloMostrar = setInterval(() => {
        if (paso >= secuencia.length) {
          clearInterval(intervaloMostrar);
          info.textContent = "¡Repetí la secuencia!";
          bloques.forEach(b => b.classList.add("activo"));
          esperandoUsuario = true;
          const repeticionesUsadas = jugador.repeticionesLibertadores[edicionLibertadores];
          if (repeticionesUsadas < MAX_REPETICIONES_SECUENCIA) {
            btnRepetir.textContent = `Repetir secuencia (${MAX_REPETICIONES_SECUENCIA - repeticionesUsadas})`;
            btnRepetir.hidden = false;
          } else {
            btnRepetir.hidden = true;
          }
          return;
        }
        const idx = secuencia[paso];
        bloques[idx].classList.add("iluminado");
        setTimeout(() => bloques[idx].classList.remove("iluminado"), 400);
        paso++;
      }, 500);
    }
    btnRepetir.onclick = () => {
      if (jugador.repeticionesLibertadores[edicionLibertadores] >= MAX_REPETICIONES_SECUENCIA || finalizado) return;
      jugador.repeticionesLibertadores[edicionLibertadores]++;
      Estado.guardar();
      const restantes = MAX_REPETICIONES_SECUENCIA - jugador.repeticionesLibertadores[edicionLibertadores];
      info.textContent = restantes > 0
        ? "Repitiendo la secuencia..."
        : "Última repetición de esta Copa Libertadores...";
      mostrarSecuencia();
    };
    mostrarSecuencia();

    const handlerClick = (e) => {
      if (!esperandoUsuario || finalizado || bloqueadoGlobal) return;
      const bloque = e.target;
      const index = parseInt(bloque.dataset.index);
      if (bloque.classList.contains("usado")) return;
      bloque.classList.add("usado");

      // Si ya se excedió la cantidad, es fallo inmediato
      if (aciertosUsuario.length >= secuencia.length) {
        finalizado = true;
        limpiarListeners();
        callbackPartido(false);
        return;
      }

      const indiceEsperado = secuencia[aciertosUsuario.length];
      if (index !== indiceEsperado) fallo = true;
      aciertosUsuario.push(index);

      if (aciertosUsuario.length === secuencia.length) {
        finalizado = true;
        limpiarListeners();
        callbackPartido(!fallo);
      }
    };

    // Volver a asignar listeners (después de limpiar, los bloques son nuevos)
    bloques.forEach(b => {
      b.addEventListener('click', handlerClick);
    });
  }

  function siguientePartido() {
    if (partidoTerminado) return;
    if (indiceEtapa >= etapas.length) {
      partidoTerminado = true;
      callback({ resultado: "campeon" });
      return;
    }

    if (indiceEtapa === 3) {
      if (ganadosGrupos < 2) {
        partidoTerminado = true;
        callback({ resultado: "eliminado", fase: "Fase de Grupos" });
        return;
      }
    }

    const etapa = etapas[indiceEtapa];
    tituloCopa.textContent = `Copa Libertadores - ${etapa.nombre}`;
    rivalActual = obtenerRivalInternacional(jugador);
    actualizarCabecera();

    if (indiceEtapa === 0) {
      info.textContent = "Listo?";
      btnComenzar.disabled = false;
      btnComenzar.textContent = "Comenzar";
      btnComenzar.onclick = () => {
        btnComenzar.disabled = true;
        jugarPartido(etapa, (exito) => {
          if (exito) ganadosGrupos++;
          else erroresGrupos++;
          indiceEtapa++;
          siguientePartido();
        });
      };
    } else {
      info.textContent = "Pasaste de ronda!";
      btnComenzar.disabled = true;
      setTimeout(() => {
        info.textContent = "Listo?";
        btnComenzar.disabled = false;
        btnComenzar.textContent = "Comenzar";
        btnComenzar.onclick = () => {
          btnComenzar.disabled = true;
          jugarPartido(etapa, (exito) => {
            if (exito && etapa.fase === "grupos") ganadosGrupos++;
            else if (!exito && etapa.fase === "grupos") erroresGrupos++;
            if (!exito && etapa.fase === "eliminatoria") {
              partidoTerminado = true;
              callback({ resultado: "eliminado", fase: etapa.nombre });
              return;
            }
            indiceEtapa++;
            siguientePartido();
          });
        };
      }, 3000);
    }
  }

  siguientePartido();
}

// ---------- Jugar Libertadores ----------
function jugarLibertadores(callback, jugador, tipo) {
  const rival = obtenerRivalInternacional(jugador);
  const minijuegosPorPosicion = {
    enganche: typeof jugarLibertadoresEnganche === "function" ? jugarLibertadoresEnganche : null,
    central: typeof jugarLibertadoresCentral === "function" ? jugarLibertadoresCentral : null,
    arquero: typeof jugarLibertadoresArquero === "function" ? jugarLibertadoresArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Lectura de juego", "Memorizá los pases que se iluminan. En grupos podés equivocarte; en eliminación directa un error te deja afuera.", ["Repetí el patrón en orden.", "Cerebro y Liderazgo ralentizan las luces.", "Superá los grupos y cada llave."]],
      central: ["Duelo aéreo constante", "Ganale a los delanteros rivales frenando el círculo en la zona dorada.", ["Tocá cuando el anillo coincida.", "Imponete en los duelos.", "Cada ronda va más rápido."]],
      arquero: ["Bajo los tres palos", "Frená el cursor dentro de la franja verde para salvar cada remate.", ["Iniciá la atajada.", "Reflejos y Velocidad agrandan la zona.", "La exigencia aumenta por ronda."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Copa Libertadores", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Copa Libertadores", fase: "Camino a la final" };
      minijuegoPosicion((exito, fase) => callback(exito, fase), jugador, rival);
    });
    return;
  }
  if (tipo === "copa_completa") {
    minijuegoCopaCompleta((resultado) => {
      if (resultado.resultado === "campeon") callback(true, undefined);
      else callback(false, resultado.fase);
    }, jugador, rival);
  } else {
    if (Math.random() < 0.5) {
      minijuegoBarraQTE((exito) => {
        if (exito) callback(true, undefined);
        else callback(false, "Final");
      }, jugador, rival);
    } else {
      callback(false, "Final");
    }
  }
}

// ---------- Jugar Sudamericana ----------
function jugarSudamericana(callback, jugador) {
  const rival = obtenerRivalInternacional(jugador);
  let prob = 15;
  const media = jugador.media;
  if (media <= 60) prob += 5;
  else if (media <= 75) prob += 8;
  else if (media <= 85) prob += 12;
  else if (media <= 95) prob += 15;
  else prob += 20;

  const juegaFinal = Math.random() * 100 < prob;

  if (!juegaFinal) {
    // No llegaste a la final: no se juega ningún minijuego.
    // Avisamos con "noFinal" para que quien nos llamó muestre el mensaje correcto.
    callback(false, "noFinal");
    return;
  }

  const minijuegosPorPosicion = {
    enganche: typeof jugarSudamericanaEnganche === "function" ? jugarSudamericanaEnganche : null,
    central: typeof jugarSudamericanaCentral === "function" ? jugarSudamericanaCentral : null,
    arquero: typeof jugarSudamericanaArquero === "function" ? jugarSudamericanaArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Final de Copa Sudamericana", "Tenés que completar el Pase filtrado y después acertar El bombazo.", ["SeguÍ la secuencia de teclas.", "Frená el medidor en la zona violeta.", "Los dos desafíos deben salir bien."]],
      central: ["Final de Copa Sudamericana", "Primero cerrá el mano a mano y después despejá sobre la línea.", ["Esperá la señal para reaccionar.", "Frená el cursor en la zona segura.", "Un error corta la final."]],
      arquero: ["Final de Copa Sudamericana", "Tenés que cortar el córner y resolver un mano a mano.", ["Sincronizá tu salida en el centro.", "Memorizá el orden de achique.", "Superá ambos desafíos."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Copa Sudamericana", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Copa Sudamericana", fase: "Final" };
      minijuegoPosicion(callback, jugador, rival);
    });
    return;
  }

  const tipo = Math.random() < 0.5 ? "memoria" : "tirolibre";
  (tipo === "memoria" ? minijuegoMemoriaParejas : minijuegoTiroLibre)((exito) => callback(exito), jugador, rival);
}

// ---------- Mostrar Sudamericana ----------
function mostrarSudamericana(copa, callback) {
  const jugador = Estado.obtener();
  window.CONTEXTO_PARTIDO = { torneo: "Copa Sudamericana", fase: "Edición " + copa.año };
  if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];

  jugarSudamericana((resultado, motivo) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Sudamericana", resultado: "campeon" });
      jugador.stats.titulos++;
      asegurarPlazaCampeonContinental(jugador, "sudamericana", copa.año);
      mostrarCartelInternacional(true, undefined, "Trofeos/CopaSudamericana.png");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        const rivalRecopa = obtenerRivalInternacional(jugador);
        jugarRecopa((exitoRecopa) => {
          if (exitoRecopa) {
            jugador.stats.titulos++;
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "campeon" });
          } else {
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "subcampeon" });
          }
          Estado.guardar();
          mostrarCartelInternacional(exitoRecopa, exitoRecopa ? undefined : "Final", "Trofeos/RecopaSudamericana.png");
          contenedor.hidden = false;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = "";
            contenedor.hidden = true;
            callback();
          });
        }, jugador, rivalRecopa);
      });
    } else {
      const resumen = motivo === "noFinal" ? "eliminado" : "subcampeon";
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Sudamericana", resultado: resumen });

      if (motivo === "noFinal") {
        // No interrumpimos el flujo: el resumen anual ya informa la eliminación.
        Estado.guardar();
        callback();
        return;
      } else {
        mostrarCartelInternacional(false, "Final", "");
      }

      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        Estado.guardar();
        callback();
      });
    }
  }, jugador);
}

// ---------- Jugar Recopa ----------
function jugarRecopa(callback, jugador, rival) {
  // Evita heredar el contexto de Libertadores cuando la Recopa se juega a continuación.
  window.CONTEXTO_PARTIDO = { torneo: "Recopa Sudamericana", fase: "Final" };
  const minijuegosPorPosicion = {
    enganche: typeof jugarRecopaEnganche === "function" ? jugarRecopaEnganche : null,
    central: typeof jugarRecopaCentral === "function" ? jugarRecopaCentral : null,
    arquero: typeof jugarRecopaArquero === "function" ? jugarRecopaArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    const textos = {
      enganche: ["Recopa Sudamericana", "Controlá el caos con La pausa y definí con el tiro libre.", ["Memorizá cinco toques.", "Soltá el remate en la zona ideal.", "Los dos momentos definen el título."]],
      central: ["Recopa Sudamericana", "Ordená el offside y sobreviví al cuerpo a cuerpo.", ["Recordá qué rival pica al vacío.", "Presioná rápido para ganar el forcejeo.", "No hay margen para fallar."]],
      arquero: ["Recopa Sudamericana", "Salvá el rebote y atajá el penal del campeonato.", ["Reaccioná al segundo tiro.", "Frená el cursor en la franja verde.", "Las dos atajadas son necesarias."]],
    };
    const [titulo, descripcion, reglas] = textos[jugador.posicion];
    mostrarInstructivoInternacional(jugador, rival, "Recopa Sudamericana", titulo, descripcion, reglas, () => {
      window.CONTEXTO_PARTIDO = { torneo: "Recopa Sudamericana", fase: "Final" };
      minijuegoPosicion(callback, jugador, rival);
    });
    return;
  }
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>Recopa Sudamericana</h3>
      <p>Primero el Anticipo Aéreo, luego el Slalom.</p>
      <button class="boton-jugar-minijuego" id="btn-iniciar-recopa">¡Jugar!</button>
    </div>
  `;

  document.getElementById("btn-iniciar-recopa").addEventListener("click", () => {
    minijuegoAereo((exito1) => {
      if (!exito1) {
        contenedor.innerHTML = "";
        callback(false);
        return;
      }
      minijuegoQTE((exito2) => {
        contenedor.innerHTML = "";
        callback(exito2);
      }, jugador, rival);
    }, jugador, rival);
  });
}

// ---------- Mostrar Libertadores ----------
function mostrarLibertadores(copa, callback) {
  const jugador = Estado.obtener();
  window.CONTEXTO_PARTIDO = { torneo: "Copa Libertadores", fase: "Edición " + copa.año };
  window.COPA_LIBERTADORES_ACTUAL = copa.año;
  // Las carreras creadas antes de las copas internacionales no tienen esta lista.
  // Inicializarla antes de cualquier resultado (victoria o eliminación) evita cortar la partida.
  if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
  const tipo = Math.random() < 0.75 ? "copa_completa" : "final";
  jugarLibertadores((resultado, fase) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: "campeon" });
      jugador.stats.titulos++;
      asegurarPlazaCampeonContinental(jugador, "libertadores", copa.año);
      mostrarCartelInternacional(true, undefined, "Trofeos/CopaLibertadores.png");
      const rivalRecopa = obtenerRivalInternacional(jugador);
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        jugarRecopa((exitoRecopa) => {
          if (exitoRecopa) {
            jugador.stats.titulos++;
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "campeon" });
          } else {
            jugador.resultadosInternacionales.push({ año: copa.año, copa: "Recopa", resultado: "subcampeon" });
          }
          Estado.guardar();
          mostrarCartelInternacional(exitoRecopa, exitoRecopa ? undefined : "Final", "Trofeos/RecopaSudamericana.png");
          contenedor.hidden = false;
          contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
            contenedor.innerHTML = "";
            contenedor.hidden = true;
            callback();
          });
        }, jugador, rivalRecopa);
      });
    } else {
      const faseNormalizada = fase === "Eliminado" ? "Fase de Grupos" : (fase || "Fase de Grupos");
      let resumen = "";
      if (faseNormalizada === "Final") resumen = "subcampeon";
      else resumen = `eliminado_${faseNormalizada}`;
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: resumen });
      mostrarCartelInternacional(false, faseNormalizada, "");
      const contenedor = document.getElementById("competition-container");
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        Estado.guardar();
        callback();
      });
    }
  }, jugador, tipo);
}

// ---------- Mostrar cartel ----------
function mostrarCartelInternacional(ganador, fase, imagen) {
  const contenedor = document.getElementById("competition-container");
  const torneo = window.CONTEXTO_PARTIDO?.torneo || "Competencia internacional";
  if (ganador) {
    contenedor.innerHTML = `
      <div class="competition-card campeon">
        <h2>¡CAMPEÓN DE ${torneo.toUpperCase()}!</h2>
        <img src="${imagen}" alt="Copa">
        <p>Una campaña para la historia. La vuelta olímpica es toda tuya.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
  } else {
    if (fase === "Final") {
      contenedor.innerHTML = `
        <div class="competition-card subcampeon">
          <h2>Subcampeón de ${torneo} 🥈</h2>
          <p>La final se escapó por detalles, pero llegaste hasta el último partido.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    } else {
      contenedor.innerHTML = `
        <div class="competition-card">
          <h3>${torneo}: ${fase}</h3>
          <p>La campaña terminó acá. Habrá revancha la próxima temporada.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    }
  }
}

// ---------- (opcional) eliminar ejecutarInternacionales ----------
function ejecutarInternacionales(callback) {
  callback(); // No hace nada, todo está en copasPendientes
}

function mostrarInstructivoInternacional(jugador, rival, torneo, titulo, descripcion, reglas, iniciar) {
  const contenedor = document.getElementById("competition-container");
  window.CONTEXTO_PARTIDO = { torneo, fase: "Partido decisivo" };
  contenedor.innerHTML = `${crearCabeceraMinijuego(jugador, rival)}
    <div class="competition-card instructivo-minijuego">
      <span class="badge-copa">CÓMO SE JUEGA</span>
      <h3>${titulo}</h3><p>${descripcion}</p>
      <ol>${reglas.map(regla => `<li>${regla}</li>`).join("")}</ol>
      <button class="boton-jugar-minijuego">Entendido, jugar</button>
    </div>`;
  contenedor.querySelector(".boton-jugar-minijuego").onclick = iniciar;
}
// ============================================
// SECCIÓN: copasinternacionalesclubes.js
// ============================================
// Mundial de Clubes. Depende de data.js, estado.js y crearCabeceraMinijuego.

function esAnioClasificacionMundial(anio) {
  // Ediciones: 2029, 2033, 2037... La plaza se decide el año anterior.
  return (anio + 1 - 2029) % 4 === 0;
}

function rangoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bonusMundialPorMedia(media) {
  if (media >= 96) return 15;
  if (media >= 86) return 10;
  if (media >= 71) return 7;
  return 5;
}

function probabilidadMundialPorClub(club, media) {
  const base = { grande: 20, mediano: 10, chico: 5, pequeno: 5, diminuto: 2 }[club?.categoria] || 2;
  return Math.min(99, base + bonusMundialPorMedia(media || 0));
}

function obtenerTituloClasificatorio(jugador, edicion) {
  return (jugador.resultadosInternacionales || []).find((copa) =>
    copa.año < edicion && copa.año >= edicion - 4 &&
    (copa.copa === "Libertadores" || copa.copa === "Recopa") && copa.resultado === "campeon"
  ) || null;
}

function agendarMundialClubes(jugador, anioActual) {
  if (!esAnioClasificacionMundial(anioActual)) return;
  const edicion = anioActual + 1;
  if (!Array.isArray(jugador.clasificacionesMundialClubes)) jugador.clasificacionesMundialClubes = [];
  const club = NOMBRES_CLUBES[jugador.club] || {};
  const titulo = obtenerTituloClasificatorio(jugador, edicion);
  const porTitulo = Boolean(titulo);
  const probabilidad = probabilidadMundialPorClub(club, jugador.media);
  let registro = jugador.clasificacionesMundialClubes.find(c => c.edicion === edicion);
  // La tabla se tira siempre y se conserva para poder informar ambos resultados.
  if (!registro || registro.clasificoPorPuntos === undefined) {
    const clasificoPorPuntos = Math.random() * 100 < probabilidad;
    if (!registro) {
    registro = {
      año: anioActual, edicion, clasificoPorPuntos,
      puntos: clasificoPorPuntos ? rangoAleatorio(1000, 2500) : rangoAleatorio(100, 900),
      probabilidad
    };
    jugador.clasificacionesMundialClubes.push(registro);
    } else {
      registro.clasificoPorPuntos = clasificoPorPuntos;
      registro.puntos = clasificoPorPuntos ? rangoAleatorio(1000, 2500) : rangoAleatorio(100, 900);
      registro.probabilidad = probabilidad;
    }
  }
  registro.entradaTitulo = porTitulo;
  registro.tituloClasificatorio = titulo?.copa || null;
  registro.clasifico = porTitulo || registro.clasificoPorPuntos;
  registro.tipo = porTitulo ? "titulo" : "tabla";
  if (registro.clasifico && !jugador.copasPendientes.some(c => c.año === edicion && c.tipo === "mundial-clubes")) {
    jugador.copasPendientes.push({ año: edicion, tipo: "mundial-clubes", rivalId: null });
  }
}

function obtenerRivalMundial(jugador) {
  const grandes = Object.values(CLUBES_POR_DIVISION)
    .flat()
    .filter(club => club.categoria === "grande" && club.id !== jugador.club);
  return grandes[Math.floor(Math.random() * grandes.length)] || obtenerRivalInternacional(jugador);
}

function mostrarMundialClubes(copa, callback) {
  const jugador = Estado.obtener();
  const etapas = ["Fase de grupos · Partido 1", "Fase de grupos · Partido 2", "Fase de grupos · Partido 3", "Octavos de final", "Cuartos de final", "Semifinal", "Final"];
  let indice = 0;
  let ganadosGrupos = 0;
  let perdidosGrupos = 0;
  let partidosDeGrupoJugados = 0;
  const TOTAL_PARTIDOS_GRUPO = 3;
  const VICTORIAS_PARA_CLASIFICAR = 2;
  const DERROTAS_PARA_ELIMINAR = 2;

  function jugarEtapa() {
    const etapa = etapas[indice];
    const rival = obtenerRivalMundial(jugador);
    window.CONTEXTO_PARTIDO = { torneo: "Mundial de Clubes", fase: etapa };
    const terminar = (exito) => {
      const enGrupos = indice < TOTAL_PARTIDOS_GRUPO;
      if (enGrupos) {
        partidosDeGrupoJugados++;
        if (exito) ganadosGrupos++;
        else perdidosGrupos++;

        // Eliminación: ya sufrió las 2 derrotas que lo dejan afuera.
        if (perdidosGrupos >= DERROTAS_PARA_ELIMINAR) {
          return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
        }
        // Se jugaron los 3 partidos: clasifica si sumó las 2 victorias necesarias.
        if (partidosDeGrupoJugados >= TOTAL_PARTIDOS_GRUPO) {
          if (ganadosGrupos < VICTORIAS_PARA_CLASIFICAR) {
            return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
          }
          indice = TOTAL_PARTIDOS_GRUPO;
          return jugarEtapa();
        }
        indice++;
        return jugarEtapa();
      }
      if (!exito) return mostrarResultadoMundial(false, etapa, copa.año, callback);
      indice++;
      if (indice === etapas.length) return mostrarResultadoMundial(true, "Final", copa.año, callback);
      jugarEtapa();
    };
    const juegos = {
      delantero: minijuegoHuecoImposible,
      enganche: minijuegoConstelacion,
      central: minijuegoMarcaPegajosa,
      arquero: minijuegoAsedioTotal
    };
    const dificultad = indice <= 4 ? 0 : indice === 5 ? 1 : 2;
    (juegos[jugador.posicion] || minijuegoHuecoImposible)(terminar, jugador, rival, dificultad);
  }
  jugarEtapa();
}

function tarjetaMundial(jugador, rival, titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `${crearCabeceraMinijuego(jugador, rival)}<div class="competition-card mundial-card"><h3>${titulo}</h3><p>${descripcion}</p>${cuerpo}</div>`;
  return contenedor;
}

function minijuegoHuecoImposible(callback, jugador, rival, nivel) {
  const final = nivel === 2;
  const contenedor = tarjetaMundial(jugador, rival, "El Hueco Imposible", "Hacé clic cuando el hueco verde cruce la mira central.", `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-arco" hidden><span class="mundial-mira"></span><span class="mundial-hueco"></span></div><p id="mundial-tiempo"></p>`);
  contenedor.querySelector("button").onclick = () => {
    const arco = contenedor.querySelector(".mundial-arco"); arco.hidden = false;
    const hueco = contenedor.querySelector(".mundial-hueco");
    const reloj = contenedor.querySelector("#mundial-tiempo");
    let x = 0, direccion = 1, velocidad = nivel === 0 ? 1.2 : 2.1, activo = true;
    hueco.style.width = final ? "8%" : "14%";
    const inicio = Date.now();
    const animar = () => {
      if (!activo) return;
      if (x <= 0 || x >= 86) direccion *= -1;
      if (nivel === 1 && Math.random() < .03) velocidad = 1 + Math.random() * 2.5;
      if (final && Math.random() < .05) hueco.style.width = `${6 + Math.random() * 8}%`;
      x += velocidad * direccion; x = Math.max(0, Math.min(90, x)); hueco.style.left = `${x}%`;
      if (final) {
        const quedan = Math.max(0, 3 - (Date.now() - inicio) / 1000); reloj.textContent = `Tiempo: ${quedan.toFixed(1)}s`;
        if (!quedan) return resolver(false);
      }
      requestAnimationFrame(animar);
    };
    const resolver = exito => { if (!activo) return; activo = false; callback(exito); };
    arco.onclick = () => {
      const centroHueco = x + parseFloat(hueco.style.width) / 2;
      resolver(Math.abs(centroHueco - 50) <= (final ? 5 : 8));
    };
    animar();
  };
}

function minijuegoConstelacion(callback, jugador, rival, nivel) {
  const total = [4, 6, 8][nivel]; const limite = [5, 7, 9][nivel];
  const contenedor = tarjetaMundial(jugador, rival, "Constelación de Pases", `Uní los ${total} nodos en orden sin soltar. Tenés ${limite} segundos.`, `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-nodos" hidden></div><p id="mundial-tiempo"></p>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-nodos"); zona.hidden = false;
    const posiciones = Array.from({ length: total }, (_, i) => ({ x: 10 + Math.random() * 75, y: 10 + Math.random() * 70, i }));
    let esperado = 0, arrastrando = false, activo = true, inicio = Date.now();
    posiciones.forEach(p => { const n = document.createElement("button"); n.className = "mundial-nodo"; n.textContent = p.i + 1; n.style.left = `${p.x}%`; n.style.top = `${p.y}%`; n.dataset.i = p.i; zona.appendChild(n); });
    if (nivel === 2) for (let i = 0; i < 3; i++) { const z = document.createElement("span"); z.className = "mundial-zona-roja"; z.style.left = `${15 + Math.random() * 65}%`; z.style.top = `${15 + Math.random() * 65}%`; zona.appendChild(z); }
    const terminar = exito => { if (!activo) return; activo = false; callback(exito); };
    zona.style.touchAction = "none";
    zona.onpointerdown = e => {
      arrastrando = true;
      try { zona.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    };
    zona.onpointerup = e => {
      arrastrando = false;
      try { zona.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    zona.onpointercancel = () => { arrastrando = false; };
    zona.onpointermove = e => {
      if (!arrastrando || !activo) return;
      const objetivo = document.elementFromPoint(e.clientX, e.clientY);
      if (objetivo?.classList.contains("mundial-zona-roja")) return terminar(false);
      if (objetivo?.classList.contains("mundial-nodo")) {
        if (+objetivo.dataset.i !== esperado) return terminar(false);
        objetivo.classList.add("completado"); esperado++;
        if (esperado === total) terminar(true);
      }
    };
    const tick = () => { if (!activo) return; const restante = limite - (Date.now() - inicio) / 1000; contenedor.querySelector("#mundial-tiempo").textContent = `Tiempo: ${Math.max(0, restante).toFixed(1)}s`; if (restante <= 0) return terminar(false); requestAnimationFrame(tick); }; tick();
  };
}

function minijuegoMarcaPegajosa(callback, jugador, rival, nivel) {
  const objetivo = nivel === 2 ? 5 : 3;
  const contenedor = tarjetaMundial(jugador, rival, "Marca Pegajosa", `Mantené el cursor dentro del delantero hasta llenar el robo (${objetivo}s).`, `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-tracking" hidden><span class="mundial-delantero"></span><div class="barra-qte"><div class="barra-progreso"></div></div></div>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-tracking"), rivalNodo = zona.querySelector(".mundial-delantero"), barra = zona.querySelector(".barra-progreso"); zona.hidden = false;
    let carga = 0, dentro = false, activo = true, x = 40, y = 40;
    rivalNodo.style.width = rivalNodo.style.height = nivel === 2 ? "30px" : "52px";
    zona.style.touchAction = "none";
    zona.onpointermove = e => { const r = rivalNodo.getBoundingClientRect(); dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
    const intervalo = setInterval(() => { if (!activo) return; carga += dentro ? .1 : -(nivel ? .16 : .08); carga = Math.max(0, carga); barra.style.width = `${Math.min(100, carga / objetivo * 100)}%`; if (carga >= objetivo) { activo = false; clearInterval(intervalo); callback(true); } }, 100);
    const mover = () => { if (!activo) return; x = Math.max(0, Math.min(88, x + (Math.random() - .5) * (nivel === 0 ? 8 : 22))); y = Math.max(0, Math.min(75, y + (Math.random() - .5) * (nivel === 0 ? 8 : 22))); rivalNodo.style.left = `${x}%`; rivalNodo.style.top = `${y}%`; setTimeout(mover, nivel === 0 ? 450 : 250); }; mover();
    setTimeout(() => { if (activo) { activo = false; clearInterval(intervalo); callback(false); } }, (objetivo + 8) * 1000);
  };
}

function minijuegoAsedioTotal(callback, jugador, rival, nivel) {
  const necesarios = [3, 6, 9][nivel], simultaneos = [1, 4, 6][nivel];
  const contenedor = tarjetaMundial(jugador, rival, "Asedio Total", "Atajá las pelotas antes de que se complete el aro. Las amarillas son amagues.", `<button class="boton-jugar-minijuego">Empezar</button><div class="mundial-asedio" hidden><span id="mundial-contador">0/${necesarios}</span></div>`);
  contenedor.querySelector("button").onclick = () => {
    const zona = contenedor.querySelector(".mundial-asedio"); zona.hidden = false; let atajadas = 0, activas = 0, activo = true;
    const terminar = exito => { if (!activo) return; activo = false; callback(exito); };
    const lanzar = () => {
      if (!activo || atajadas >= necesarios) return terminar(true);
      if (activas >= simultaneos) return setTimeout(lanzar, 200);
      activas++; const amague = nivel === 2 && Math.random() < .28; const pelota = document.createElement("button"); pelota.className = `mundial-pelota ${amague ? "amague" : ""}`; pelota.textContent = "⚽"; pelota.style.left = `${5 + Math.random() * 80}%`; pelota.style.top = `${12 + Math.random() * 68}%`; zona.appendChild(pelota);
      const tiempo = nivel === 0 ? 1600 : nivel === 1 ? 1200 : 850;
      const fallo = setTimeout(() => { pelota.remove(); terminar(false); }, tiempo);
      pelota.onclick = () => { clearTimeout(fallo); pelota.remove(); activas--; if (amague) { zona.classList.add("congelado"); setTimeout(() => zona.classList.remove("congelado"), 500); } else { atajadas++; zona.querySelector("#mundial-contador").textContent = `${atajadas}/${necesarios}`; } setTimeout(lanzar, 100); };
      setTimeout(lanzar, nivel === 0 ? 700 : 350);
    }; lanzar();
  };
}

function mostrarResultadoMundial(ganador, etapa, anio, callback) {
  const jugador = Estado.obtener(), contenedor = document.getElementById("competition-container");
  if (!Array.isArray(jugador.resultadosInternacionales)) jugador.resultadosInternacionales = [];
  jugador.resultadosInternacionales.push({ año: anio, copa: "Mundial de Clubes", resultado: ganador ? "campeon" : `eliminado_${etapa}` });
  if (ganador) jugador.stats.titulos++;
  Estado.guardar();
  if (ganador && typeof lanzarConfeti === "function") lanzarConfeti();
  contenedor.innerHTML = ganador
    ? `<div class="competition-card campeon"><h2>¡CAMPEÓN DEL MUNDIAL DE CLUBES ${anio}!</h2><img src="Trofeos/MundialClubes.png" alt="Trofeo del Mundial de Clubes"><p>Conquistaste el mundo. Esta campaña queda para siempre en la historia.</p><button class="boton-continuar">Continuar</button></div>`
    : `<div class="competition-card subcampeon"><h2>El sueño mundial terminó en ${etapa}</h2><p>Te tocó una élite feroz, pero llegaste hasta ${etapa}. Habrá revancha.</p><button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; callback(); };
}
// ============================================
// SECCIÓN: copasselecciones.js
// ============================================
/**
 * copasselecciones.js
 * -----------------------------------------
 * Sistema de competiciones de Selecciones: Copa América, Finalissima
 * y la Copa Mundial. Todas comparten la misma base:
 * 1) Convocatoria (RNG por media) -> ¿te llaman para esta competencia?
 * 2) Si te llaman, se juega la competencia puntual con su propia lógica.
 *
 * Depende de: data.js, estado.js, clasificacionClubes.js (para el estilo
 * de multiplicador por tamaño), crearCabeceraMinijuego (hud/minijuegos).
 * -----------------------------------------
 */

// ============================================
// CLASIFICACIÓN DE SELECCIONES POR TAMAÑO
// -----------------------------------------
// Mismo criterio que los clubes: grande x1, mediana x2, chica x3, diminuta x4.
// Completá/ajustá esta tabla con más países a medida que haga falta;
// cualquier país no listado cae en "chica" por defecto.
// ============================================
const CLASIFICACION_SELECCIONES = {
  // Grande
  argentina: "grande",
  brasil: "grande",
  alemania: "grande",
  espana: "grande",
  francia: "grande",
  inglaterra: "grande",
  italia: "grande",
  portugal: "grande",
  "paises-bajos": "grande",
  belgica: "grande",

  // Mediana
  uruguay: "mediana",
  colombia: "mediana",
  mexico: "mediana",
  "estados-unidos": "mediana",
  canada: "mediana",
  croacia: "mediana",
  suiza: "mediana",
  dinamarca: "mediana",
  polonia: "mediana",
  austria: "mediana",
  suecia: "mediana",
  turquia: "mediana",
  serbia: "mediana",
  marruecos: "mediana",
  senegal: "mediana",
  japon: "mediana",
  "corea-del-sur": "mediana",
  iran: "mediana",

  // Chica
  chile: "chica",
  ecuador: "chica",
  paraguay: "chica",
  peru: "chica",
  venezuela: "chica",
  "costa-rica": "chica",
  panama: "chica",
  jamaica: "chica",
  honduras: "chica",
  "trinidad-y-tobago": "chica",
  egipto: "chica",
  tunez: "chica",
  nigeria: "chica",
  ghana: "chica",
  argelia: "chica",
  camerun: "chica",
  sudafrica: "chica",
  "costa-de-marfil": "chica",
  noruega: "chica",
  escocia: "chica",
  grecia: "chica",
  rumania: "chica",
  gales: "chica",
  hungria: "chica",
  islandia: "chica",
  "bosnia-y-herzegovina": "chica",
  australia: "chica",
  "arabia-saudita": "chica",

  // Diminuta
  bolivia: "diminuta",
  catar: "diminuta",
  uzbekistan: "diminuta",
  irak: "diminuta",
  jordania: "diminuta",
  indonesia: "diminuta",
  "nueva-zelanda": "diminuta",

  // Cualquier país nuevo que se agregue a data.js y no esté acá
  // cae en "diminuta" por el fallback de obtenerTamanoSeleccion().
};

function obtenerTamanoSeleccion(idPais) {
  return CLASIFICACION_SELECCIONES[idPais] || "diminuta";
}

function obtenerMultiplicadorSeleccion(idPais) {
  const tamano = obtenerTamanoSeleccion(idPais);
  return MULTIPLICADOR_POR_TAMANO[tamano] || 3;
}

// ============================================
// CONVOCATORIA (genérica para cualquier competencia de selecciones)
// ============================================

function probabilidadConvocatoriaPorMedia(media) {
  if (media <= 60) return 0;
  if (media <= 79) return 25;
  if (media <= 90) return 50;
  if (media <= 95) return 75;
  return 100; // 96-109
}

/**
 * Sortea si el jugador es convocado para una competencia puntual.
 * Guarda el resultado en jugador.convocatoriasSelecciones para no
 * volver a sortear la misma competencia/año si se llama 2 veces.
 */
function sortearConvocatoria(jugador, competencia, año) {
  if (!Array.isArray(jugador.convocatoriasSelecciones)) jugador.convocatoriasSelecciones = [];
  let registro = jugador.convocatoriasSelecciones.find(c => c.competencia === competencia && c.año === año);
  if (registro) return registro.convocado;

  const probabilidad = probabilidadConvocatoriaPorMedia(jugador.media || 0);
  const convocado = Math.random() * 100 < probabilidad;
  jugador.convocatoriasSelecciones.push({ competencia, año, convocado, probabilidad, resuelto: false });
  Estado.guardar();
  return convocado;
}

function obtenerMensajeNoConvocado(competencia, año) {
  return `No fuiste convocado por tu selección para jugar ${competencia} ${año}`;
}

// ============================================
// COPA AMÉRICA
// -----------------------------------------
// Se juega en 2027 y luego cada 4 años (2031, 2035, ...).
// Estructura simplificada: solo se define si tu selección llega a la
// final (RNG por tamaño + bonus por media) y ahí se juega el minijuego.
// ============================================

function esAnioCopaAmerica(año) {
  return año >= 2027 && (año - 2027) % 4 === 0;
}

function bonusMediaCopaAmerica(media) {
  if (media <= 65) return 5;
  if (media <= 80) return 10;
  if (media <= 95) return 15;
  return 20; // 96-109
}

function probabilidadLlegarFinalCopaAmerica(idPais, media) {
  const base = { grande: 60, mediana: 40, chica: 20, diminuta: 10 }[obtenerTamanoSeleccion(idPais)];
  return Math.min(99, base + bonusMediaCopaAmerica(media || 0));
}

/**
 * Llamar una vez por año (por ejemplo al procesar el resumen anual).
 * Si corresponde Copa América ese año, resuelve convocatoria + si llega
 * a la final, y deja todo listo en jugador.copaAmericaPendiente para
 * que se muestre el minijuego (mostrarCopaAmerica) al arrancar el año
 * que viene, y deja el mensaje correspondiente para el resumen del año.
 */
function prepararCopaAmerica(jugador, año) {
  if (!esAnioCopaAmerica(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some(r => r.competencia === "Copa América" && r.año === año)) return;

  const convocado = sortearConvocatoria(jugador, "Copa América", año);
  if (!convocado) {
    jugador.resultadosSelecciones.push({
      competencia: "Copa América", año, resultado: "no-convocado",
      mensajeResumen: obtenerMensajeNoConvocado("Copa América", año)
    });
    Estado.guardar();
    return;
  }

  const probabilidad = probabilidadLlegarFinalCopaAmerica(jugador.pais, jugador.media);
  const llegaFinal = Math.random() * 100 < probabilidad;

  if (!llegaFinal) {
    const instancias = ["Fase de grupos", "Cuartos de final", "Semifinal"];
    const instancia = instancias[Math.floor(Math.random() * instancias.length)];
    jugador.resultadosSelecciones.push({
      competencia: "Copa América", año, resultado: `eliminado_${instancia}`,
      mensajeResumen: `Has quedado eliminado de la Copa América en ${instancia}`
    });
    Estado.guardar();
    return;
  }

  // Llega a la final: se juega al arranque del año siguiente.
  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({ competencia: "Copa América", año, jugado: false });
  Estado.guardar();
}

/** Devuelve el mensaje de resumen (si existe) para esa competencia/año. */
function obtenerMensajeSeleccionResumen(jugador, competencia, año) {
  const registro = (jugador.resultadosSelecciones || []).find(r => r.competencia === competencia && r.año === año);
  return registro ? registro.mensajeResumen : null;
}

/**
 * Llamar al arrancar cada temporada (junto a mostrarGalaBalonDeOro,
 * mostrarGalaBotaDeOro, etc). Si hay una final de Copa América pendiente
 * de jugarse, la muestra y devuelve true.
 */
function mostrarCopaAmerica(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    c => c.competencia === "Copa América" && !c.jugado
  );
  if (!pendiente) return false;

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card">
      <span class="badge-copa">COPA AMÉRICA ${pendiente.año}</span>
      <h2>🏆 Copa América (Final Directa)</h2>
      <p>Fricción, pierna fuerte y mucho potrero. Un solo partido donde gana el que tiene más garra.</p>
      <button class="boton-jugar-minijuego" id="iniciar-final-copa-america">Jugar la final</button>
    </div>`;

  contenedor.querySelector("#iniciar-final-copa-america").onclick = () => {
    const juegos = {
      delantero: minijuegoAPuraPotencia,
      enganche: minijuegoPaseATresDedos,
      central: minijuegoMarcaAsfixiante,
      arquero: minijuegoGuerraPsicologica
    };
    const jugarMinijuego = juegos[jugador.posicion] || minijuegoAPuraPotencia;
    jugarMinijuego((gano) => resolverCopaAmerica(pendiente, gano, alTerminar));
  };
  return true;
}

function resolverCopaAmerica(pendiente, gano, alTerminar) {
  const jugador = Estado.obtener();
  pendiente.jugado = true;
  pendiente.gano = gano;

  const registro = {
    competencia: "Copa América",
    año: pendiente.año,
    resultado: gano ? "campeon" : "subcampeon",
    pais: jugador.pais,
    mensajeResumen: gano
      ? `¡Campeón de la Copa América ${pendiente.año}!`
      : "Subcampeón de la Copa América"
  };
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push(registro);
  Estado.guardar();

  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = gano
    ? `<div class="competition-card campeon">
         <h2>¡CAMPEÓN DE LA COPA AMÉRICA ${pendiente.año}!</h2>
         <img src="Trofeos/CopaAmerica.png" alt="Copa América">
         <p>Le diste una alegría enorme a todo tu país. El continente entero habla de vos.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`
    : `<div class="competition-card subcampeon">
         <h2>Subcampeón de la Copa América ${pendiente.año}</h2>
         <p>Llegaste a la final y peleaste hasta el final, pero no alcanzó. El continente reconoce igual tu nivel.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// MINIJUEGOS DE LA FINAL DE COPA AMÉRICA
// ============================================

function tarjetaCopaAmerica(titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <h3>${titulo}</h3>
      <p>${descripcion}</p>
      ${cuerpo}
    </div>`;
  return contenedor;
}

// Delantero: "A Pura Potencia" — llenar barra de fuerza a clics, luego
// reaccionar al botón de Tiro que aparece medio segundo.
function minijuegoAPuraPotencia(callback) {
  const contenedor = tarjetaCopaAmerica(
    "A Pura Potencia",
    "El central te está agarrando de la camiseta. Hacé clic bien rápido para llenar la barra de Fuerza y sacártelo de encima.",
    `<div class="barra-qte"><div class="barra-progreso" id="potencia-barra"></div></div>
     <button class="boton-jugar-minijuego" id="potencia-clic">¡Forcejeá!</button>
     <div id="potencia-tiro-zona" hidden></div>`
  );
  const barra = contenedor.querySelector("#potencia-barra");
  const boton = contenedor.querySelector("#potencia-clic");
  let fuerza = 0;
  const necesaria = 100;

  boton.onclick = () => {
    fuerza = Math.min(necesaria, fuerza + numeroAleatorioSel(6, 10));
    barra.style.width = `${fuerza}%`;
    if (fuerza >= necesaria) {
      boton.remove();
      lanzarFaseTiro();
    }
  };

  function lanzarFaseTiro() {
    const zona = contenedor.querySelector("#potencia-tiro-zona");
    zona.hidden = false;
    zona.innerHTML = `<p>¡Preparate para el tiro!</p>`;
    const demora = 600 + Math.random() * 1200;
    setTimeout(() => {
      const boton = document.createElement("button");
      boton.className = "boton-jugar-minijuego";
      boton.textContent = "¡TIRO!";
      zona.appendChild(boton);
      let resuelto = false;
      const vencido = setTimeout(() => { if (!resuelto) { resuelto = true; callback(false); } }, 500);
      boton.onclick = () => {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(vencido);
        callback(true);
      };
    }, demora);
  }
}

// Enganche: "Pase a Tres Dedos" — pasar por nodos en orden sin tocar
// las zonas de los defensores (reutiliza la mecánica de arrastre).
function minijuegoPaseATresDedos(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Pase a Tres Dedos",
    "Dibujá con el mouse una trayectoria curva que esquive a los defensores y llegue limpia hasta tu compañero.",
    `<button class="boton-jugar-minijuego" id="pase-empezar">Empezar</button>
     <div class="mundial-nodos" id="pase-zona" hidden></div>`
  );
  contenedor.querySelector("#pase-empezar").onclick = () => {
    const zona = contenedor.querySelector("#pase-zona");
    zona.hidden = false;
    zona.style.touchAction = "none";

    // Origen (vos) y destino (compañero) fijos; 3 defensores en el medio.
    const inicio = document.createElement("span");
    inicio.className = "mundial-nodo completado";
    inicio.style.left = "6%"; inicio.style.top = "50%";
    inicio.textContent = "●";
    const destino = document.createElement("button");
    destino.className = "mundial-nodo";
    destino.style.left = "90%"; destino.style.top = "50%";
    destino.textContent = "★";
    zona.append(inicio, destino);

    for (let i = 0; i < 3; i++) {
      const defensor = document.createElement("span");
      defensor.className = "mundial-zona-roja";
      defensor.style.left = `${25 + i * 22}%`;
      defensor.style.top = `${20 + Math.random() * 55}%`;
      zona.appendChild(defensor);
    }

    let dibujando = false, activo = true;
    zona.onpointerdown = (e) => { dibujando = true; try { zona.setPointerCapture(e.pointerId); } catch (_) {} };
    zona.onpointerup = () => { dibujando = false; };
    zona.onpointercancel = () => { dibujando = false; };
    zona.onpointermove = (e) => {
      if (!dibujando || !activo) return;
      const objetivo = document.elementFromPoint(e.clientX, e.clientY);
      if (objetivo?.classList.contains("mundial-zona-roja")) { activo = false; return callback(false); }
      if (objetivo === destino) { activo = false; return callback(true); }
    };
    // Si tarda demasiado, se considera fallado (el defensor te alcanza).
    setTimeout(() => { if (activo) { activo = false; callback(false); } }, 6000);
  };
}

// Central: "Marca Asfixiante" — mantener el cursor centrado 4 segundos
// mientras el rival empuja el indicador hacia un lado al azar.
function minijuegoMarcaAsfixiante(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Marca Asfixiante",
    "El delantero rival te empuja de un lado a otro. Movete en la dirección contraria para mantener el cursor en la franja verde central durante 4 segundos.",
    `<button class="boton-jugar-minijuego" id="marca-empezar">Empezar</button>
     <div class="mundial-tracking" id="marca-zona" hidden>
       <div class="barra-qte"><div class="barra-progreso" id="marca-barra-tiempo"></div></div>
       <div style="position:relative;height:60px;background:#1a1f2e;border-radius:8px;margin-top:10px;">
         <div style="position:absolute;left:40%;width:20%;height:100%;background:rgba(80,200,120,.35);"></div>
         <span id="marca-cursor" style="position:absolute;top:50%;left:50%;width:14px;height:14px;background:#f5c542;border-radius:50%;transform:translate(-50%,-50%);"></span>
       </div>
     </div>`
  );
  contenedor.querySelector("#marca-empezar").onclick = () => {
    const zona = contenedor.querySelector("#marca-zona");
    zona.hidden = false;
    const cursor = contenedor.querySelector("#marca-cursor");
    const barraTiempo = contenedor.querySelector("#marca-barra-tiempo");
    let posicion = 50; // 0-100, centro = 50, verde entre 40-60
    let empuje = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.5);
    let mouseX = 0;
    let activo = true;
    const inicio = Date.now();
    const DURACION = 4000;

    zona.onpointermove = (e) => {
      const rect = zona.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100 - 50; // -50 a 50 relativo al centro
    };

    const tick = () => {
      if (!activo) return;
      if (Math.random() < 0.02) empuje = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 1.2);
      // El empuje te aleja del centro; el mouse (contrario) te devuelve.
      posicion += empuje - mouseX * 0.08;
      posicion = Math.max(0, Math.min(100, posicion));
      cursor.style.left = `${posicion}%`;

      const dentro = posicion >= 40 && posicion <= 60;
      const transcurrido = Date.now() - inicio;
      barraTiempo.style.width = `${Math.min(100, (transcurrido / DURACION) * 100)}%`;

      if (!dentro) { activo = false; return callback(false); }
      if (transcurrido >= DURACION) { activo = false; return callback(true); }
      requestAnimationFrame(tick);
    };
    tick();
  };
}

// Arquero: "Guerra Psicológica" — leer el amague: una flecha titila en
// verde 0.3s antes del disparo; hay que esperarla y no anticiparse antes de tiempo.
function minijuegoGuerraPsicologica(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Guerra Psicológica",
    "Tanda de penales definitoria. Una de las flechas va a titilar en verde por 0.3 segundos justo antes del disparo. Esperá la luz y elegí ese lado.",
    `<button class="boton-jugar-minijuego" id="penal-empezar">Empezar</button>
     <div id="penal-zona" hidden style="display:flex;gap:24px;justify-content:center;margin-top:16px;">
       <button class="mundial-nodo" id="penal-izq" style="position:static;width:70px;height:70px;font-size:28px;">⬅</button>
       <button class="mundial-nodo" id="penal-der" style="position:static;width:70px;height:70px;font-size:28px;">➡</button>
     </div>`
  );
  contenedor.querySelector("#penal-empezar").onclick = () => {
    const zona = contenedor.querySelector("#penal-zona");
    zona.hidden = false;
    const izq = contenedor.querySelector("#penal-izq");
    const der = contenedor.querySelector("#penal-der");
    let ladoCorrecto = null;
    let activo = true;
    let elegido = false;

    const resolver = (lado) => {
      if (!activo || elegido) return;
      elegido = true;
      activo = false;
      callback(lado === ladoCorrecto);
    };
    izq.onclick = () => resolver("izq");
    der.onclick = () => resolver("der");

    // Demora aleatoria antes del amague, y luego 0.3s de "luz verde".
    setTimeout(() => {
      if (!activo) return;
      ladoCorrecto = Math.random() < 0.5 ? "izq" : "der";
      const boton = ladoCorrecto === "izq" ? izq : der;
      boton.classList.add("completado");
      setTimeout(() => boton.classList.remove("completado"), 300);
      // Si no eligió durante la ventana ni un poco después, se le escapa el penal.
      setTimeout(() => { if (!elegido) resolver(null); }, 900);
    }, 800 + Math.random() * 1200);
  };
}

function numeroAleatorioSel(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// FINALISSIMA
// -----------------------------------------
// Enfrenta al campeón de la Copa América contra el campeón de la
// Eurocopa. Se juega el mismo año del Mundial de Selecciones, antes
// del Mundial. Solo es relevante si tu selección ganó la copa
// continental que le corresponde a su confederación.
// (La Eurocopa todavía no está implementada como competencia jugable;
// el gancho para CONMEBOL/CONCACAF -> UEFA ya funciona hoy mismo, y el
// de UEFA -> CONMEBOL/CONCACAF queda listo para cuando se sume.)
// ============================================

function esAnioMundialSelecciones(año) {
  // Ediciones: 2030, 2034, 2038... Ajustá el año base si hace falta.
  return año >= 2030 && (año - 2030) % 4 === 0;
}

function esConfederacionAmericana(confederacion) {
  return confederacion === "CONMEBOL" || confederacion === "CONCACAF";
}

function elegirTamanoPorPeso(pesos) {
  const total = Object.values(pesos).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const tamano of Object.keys(pesos)) {
    if (r < pesos[tamano]) return tamano;
    r -= pesos[tamano];
  }
  return Object.keys(pesos)[0];
}

function elegirRivalFinalissima(candidatos) {
  const PESOS_TAMANO_RIVAL = { grande: 60, mediana: 25, chica: 10, diminuta: 5 };
  const tamanoElegido = elegirTamanoPorPeso(PESOS_TAMANO_RIVAL);
  const delTamano = candidatos.filter(p => obtenerTamanoSeleccion(p.id) === tamanoElegido);
  const pool = delTamano.length ? delTamano : candidatos;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

/**
 * Llamar una vez por año (junto a prepararCopaAmerica). Si es año de
 * Mundial de Selecciones y tu selección ganó la copa continental que
 * le toca (Copa América para CONMEBOL/CONCACAF, Eurocopa para UEFA),
 * agenda la Finalissima para jugarse al arranque de ese mismo año.
 */
function prepararFinalissima(jugador, año) {
  if (!esAnioMundialSelecciones(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some(r => r.competencia === "Finalissima" && r.año === año)) return;

  const pais = (typeof PAISES !== "undefined") ? PAISES.find(p => p.id === jugador.pais) : null;
  const confederacion = pais?.confederacion;
  if (!confederacion) return;

  const esAmericano = esConfederacionAmericana(confederacion);
  const esEuropeo = confederacion === "UEFA";
  if (!esAmericano && !esEuropeo) return; // solo relevante si tu confederación juega alguna de las dos copas

  let clasifico = false;
  if (esAmericano) {
    const añoCopaAmerica = año - 3; // edición inmediatamente anterior al Mundial
    clasifico = jugador.resultadosSelecciones.some(
      r => r.competencia === "Copa América" && r.año === añoCopaAmerica && r.resultado === "campeon"
    );
  } else {
    const añoEurocopa = año - 2; // esquema típico: Eurocopa 2 años antes del Mundial
    clasifico = jugador.resultadosSelecciones.some(
      r => r.competencia === "Eurocopa" && r.año === añoEurocopa && r.resultado === "campeon"
    );
  }
  if (!clasifico) return;

  const confederacionesRival = esAmericano ? ["UEFA"] : ["CONMEBOL", "CONCACAF"];
  const candidatos = (typeof PAISES !== "undefined")
    ? PAISES.filter(p => confederacionesRival.includes(p.confederacion) && p.id !== jugador.pais)
    : [];
  const rival = elegirRivalFinalissima(candidatos);

  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({
    competencia: "Finalissima",
    año,
    jugado: false,
    rivalPais: rival?.id || null,
    rivalNombre: rival?.nombre || "el campeón rival",
  });
  Estado.guardar();
}

/**
 * Llamar al arrancar la temporada (junto a mostrarCopaAmerica, antes
 * del Mundial). Si hay una Finalissima pendiente, la muestra y
 * devuelve true.
 */
function mostrarFinalissima(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    c => c.competencia === "Finalissima" && !c.jugado
  );
  if (!pendiente) return false;

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card">
      <span class="badge-copa">FINALISSIMA ${pendiente.año}</span>
      <h2>🌍 Finalissima (Final Directa)</h2>
      <p>Duelo intercontinental contra ${pendiente.rivalNombre}, campeón de la otra confederación. Precisión quirúrgica y técnica depurada.</p>
      <button class="boton-jugar-minijuego" id="iniciar-finalissima">Jugar la final</button>
    </div>`;

  contenedor.querySelector("#iniciar-finalissima").onclick = () => {
    const juegos = {
      delantero: minijuegoVoleaDeOro,
      enganche: minijuegoHuecoTactico,
      central: minijuegoLecturaEuropea,
      arquero: minijuegoBalistica
    };
    const jugarMinijuego = juegos[jugador.posicion] || minijuegoVoleaDeOro;
    jugarMinijuego((gano) => resolverFinalissima(pendiente, gano, alTerminar));
  };
  return true;
}

function resolverFinalissima(pendiente, gano, alTerminar) {
  const jugador = Estado.obtener();
  pendiente.jugado = true;
  pendiente.gano = gano;

  const registro = {
    competencia: "Finalissima",
    año: pendiente.año,
    resultado: gano ? "campeon" : "subcampeon",
    pais: jugador.pais,
    mensajeResumen: gano
      ? `¡Campeón de la Finalissima ${pendiente.año}!`
      : `Subcampeón de la Finalissima ${pendiente.año}`
  };
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push(registro);
  Estado.guardar();

  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = gano
    ? `<div class="competition-card campeon">
         <h2>¡CAMPEÓN DE LA FINALISSIMA ${pendiente.año}!!</h2>
         <img src="Trofeos/Finalissima.png" alt="Finalissima">
         <p>Le ganaste al campeón de la otra confederación en un partidazo intercontinental. Tu selección se corona ante todo el planeta.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`
    : `<div class="competition-card subcampeon">
         <h2>Subcampeón de la Finalissima ${pendiente.año}</h2>
         <p>Peleaste de igual a igual con la otra confederación, pero no alcanzó. Aun así, llegar a esta final ya es un logro enorme.</p>
         <button class="boton-continuar">Continuar</button>
       </div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// MINIJUEGOS DE LA FINALISSIMA
// ============================================

// Delantero: "Volea de Oro" — una sombra en el piso se hace cada vez
// más nítida; hay que patear justo cuando choca con el círculo central.
function minijuegoVoleaDeOro(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Volea de Oro",
    "La pelota viene de un centro. Mirá la sombra en el piso y apretá PATEAR justo cuando choque con el círculo central.",
    `<button class="boton-jugar-minijuego" id="volea-empezar">Empezar</button>
     <div id="volea-zona" hidden style="position:relative;height:160px;margin-top:14px;">
       <span style="position:absolute;left:50%;top:50%;width:60px;height:60px;border:3px solid #f5c542;border-radius:50%;transform:translate(-50%,-50%);"></span>
       <span id="volea-sombra" style="position:absolute;left:50%;top:50%;width:140px;height:140px;border-radius:50%;background:rgba(0,0,0,.35);transform:translate(-50%,-50%);opacity:.15;"></span>
       <button class="boton-jugar-minijuego" id="volea-patear" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);">¡PATEAR!</button>
     </div>`
  );
  contenedor.querySelector("#volea-empezar").onclick = () => {
    const zona = contenedor.querySelector("#volea-zona");
    zona.hidden = false;
    const sombra = contenedor.querySelector("#volea-sombra");
    const inicio = Date.now();
    const DURACION = 1400 + Math.random() * 900; // momento ideal (sombra 100% nítida)
    let resuelto = false;

    const animar = () => {
      if (resuelto) return;
      const t = Math.min(1, (Date.now() - inicio) / DURACION);
      const escala = 1.8 - t * 1.3; // arranca grande y difusa, termina del tamaño del círculo
      sombra.style.opacity = String(0.15 + t * 0.7);
      sombra.style.width = `${140 * escala}px`;
      sombra.style.height = `${140 * escala}px`;
      if (t >= 1) { resuelto = true; return callback(false); } // se pasó del momento, no llegó a patear
      requestAnimationFrame(animar);
    };
    animar();

    contenedor.querySelector("#volea-patear").onclick = () => {
      if (resuelto) return;
      const t = Math.min(1, (Date.now() - inicio) / DURACION);
      resuelto = true;
      callback(t >= 0.85 && t <= 1.02); // ventana de timing cerca del impacto
    };
  };
}

// Enganche: "El Hueco Táctico" — una flecha gira sin parar; hay que
// hacer clic justo cuando apunta a uno de los huecos angostos.
function minijuegoHuecoTactico(callback) {
  const contenedor = tarjetaCopaAmerica(
    "El Hueco Táctico",
    "La flecha gira sin parar alrededor tuyo. Hacé clic justo cuando apunte a uno de los huecos angostos entre los defensores.",
    `<button class="boton-jugar-minijuego" id="hueco-empezar">Empezar</button>
     <div id="hueco-zona" hidden style="position:relative;width:220px;height:220px;margin:14px auto;border-radius:50%;border:2px dashed rgba(255,255,255,.2);">
       <div id="hueco-ventana-1" style="position:absolute;width:26px;height:26px;background:rgba(80,200,120,.4);border-radius:50%;top:50%;left:-13px;transform:translateY(-50%);"></div>
       <div id="hueco-ventana-2" style="position:absolute;width:26px;height:26px;background:rgba(80,200,120,.4);border-radius:50%;top:50%;right:-13px;transform:translateY(-50%);"></div>
       <div id="hueco-flecha" style="position:absolute;left:50%;top:50%;width:100px;height:4px;background:#f5c542;transform-origin:0 50%;"></div>
     </div>
     <button class="boton-jugar-minijuego" id="hueco-clic" hidden>¡Pase!</button>`
  );
  contenedor.querySelector("#hueco-empezar").onclick = () => {
    const zona = contenedor.querySelector("#hueco-zona");
    const flecha = contenedor.querySelector("#hueco-flecha");
    const boton = contenedor.querySelector("#hueco-clic");
    zona.hidden = false;
    boton.hidden = false;
    let angulo = 0;
    let activo = true;
    const velocidad = 6; // grados por frame, "súper rápido"

    const girar = () => {
      if (!activo) return;
      angulo = (angulo + velocidad) % 360;
      flecha.style.transform = `rotate(${angulo}deg)`;
      requestAnimationFrame(girar);
    };
    girar();

    boton.onclick = () => {
      if (!activo) return;
      activo = false;
      // Los huecos están en 0° (derecha) y 180° (izquierda). Tolerancia angular.
      const normalizado = angulo % 180;
      const distancia = Math.min(normalizado, 180 - normalizado);
      callback(distancia <= 12);
    };
  };
}

// Central: "Lectura Europea" — 4 líneas de pase punteadas; un
// indicador (ojos) mira hacia una un segundo antes de soltar la pelota.
function minijuegoLecturaEuropea(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Lectura Europea",
    "El mediocampista rival tiene 4 opciones de pase. Sus ojos van a mirar hacia una un segundo antes de soltarla: hacé clic en esa línea para anticiparte.",
    `<button class="boton-jugar-minijuego" id="lectura-empezar">Empezar</button>
     <div id="lectura-zona" hidden style="position:relative;height:200px;margin-top:14px;">
       <span id="lectura-ojos" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px;">👀</span>
     </div>`
  );
  contenedor.querySelector("#lectura-empezar").onclick = () => {
    const zona = contenedor.querySelector("#lectura-zona");
    zona.hidden = false;
    const posiciones = [
      { x: 10, y: 10 }, { x: 90, y: 10 }, { x: 10, y: 90 }, { x: 90, y: 90 }
    ];
    const lineas = posiciones.map((p, i) => {
      const linea = document.createElement("button");
      linea.className = "mundial-nodo";
      linea.textContent = "→";
      linea.style.left = `${p.x}%`;
      linea.style.top = `${p.y}%`;
      linea.dataset.i = i;
      zona.appendChild(linea);
      return linea;
    });
    let activo = true;
    const objetivo = Math.floor(Math.random() * 4);
    lineas.forEach((linea, i) => {
      linea.onclick = () => {
        if (!activo) return;
        activo = false;
        callback(i === objetivo);
      };
    });
    // Demora antes de la mirada, luego 1 segundo de "aviso" antes del pase.
    setTimeout(() => {
      if (!activo) return;
      const ojos = contenedor.querySelector("#lectura-ojos");
      ojos.style.left = `${posiciones[objetivo].x}%`;
      ojos.style.top = `${posiciones[objetivo].y}%`;
      setTimeout(() => { if (activo) { activo = false; callback(false); } }, 1000);
    }, 800 + Math.random() * 1000);
  };
}

// Arquero: "Balística" — se dibuja media parábola y desaparece; hay
// que hacer clic en el punto exacto donde va a caer la pelota.
function minijuegoBalistica(callback) {
  const contenedor = tarjetaCopaAmerica(
    "Balística",
    "Tiro libre del europeo por encima de la barrera. Se dibuja la trayectoria inicial y desaparece a mitad de camino: hacé clic donde calculás que va a caer.",
    `<button class="boton-jugar-minijuego" id="balistica-empezar">Empezar</button>
     <div id="balistica-zona" hidden style="position:relative;height:180px;margin-top:14px;border-bottom:2px solid rgba(255,255,255,.25);"></div>`
  );
  contenedor.querySelector("#balistica-empezar").onclick = () => {
    const zona = contenedor.querySelector("#balistica-zona");
    zona.hidden = false;

    // Parábola: y = a*(x-h)^2 + k, con caída en algún punto entre 55%-90% del ancho.
    const xCaida = 40 + Math.random() * 45; // % del ancho
    const alturaMax = 60 + Math.random() * 60;
    const a = -alturaMax / Math.pow(xCaida, 2);

    // Dibujo simplificado: puntos visibles solo hasta la mitad del recorrido.
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.position = "absolute";
    svg.style.left = "0"; svg.style.top = "0";
    zona.appendChild(svg);

    function alturaEnX(x) {
      // Parábola normalizada: arranca en (0,100) el "piso", sube y cae en (xCaida,100).
      const progreso = x / xCaida;
      return 100 - Math.sin(Math.min(1, Math.max(0, progreso)) * Math.PI) * alturaMax * (100 / 180);
    }

    let path = "";
    const visibleHasta = xCaida * 0.5;
    for (let x = 0; x <= visibleHasta; x += 2) {
      const y = alturaEnX(x);
      path += (x === 0 ? "M" : "L") + x + "," + y + " ";
    }
    const trazo = document.createElementNS(svgNS, "path");
    trazo.setAttribute("d", path);
    trazo.setAttribute("stroke", "#f5c542");
    trazo.setAttribute("stroke-width", "1.2");
    trazo.setAttribute("fill", "none");
    svg.appendChild(trazo);

    let activo = true;
    zona.onclick = (e) => {
      if (!activo) return;
      activo = false;
      const rect = zona.getBoundingClientRect();
      const xClic = ((e.clientX - rect.left) / rect.width) * 100;
      callback(Math.abs(xClic - xCaida) <= 6);
    };
    setTimeout(() => { if (activo) { activo = false; callback(false); } }, 6000);
  };
}

/**
 * mundial.js
 * -----------------------------------------
 * La Copa Mundial de Selecciones. Se juega en 2030 y luego cada 4 años
 * (reutiliza esAnioMundialSelecciones de copasselecciones.js).
 *
 * Sigue EXACTAMENTE el mismo patrón que ya usa el resto del juego:
 * 1) prepararMundial(jugador, año) se llama al cerrar la temporada
 *    (junto a prepararCopaAmerica/prepararFinalissima en hud.js).
 *    Sortea la convocatoria (sortearConvocatoria, ya genérica) y, si
 *    te llaman, agenda el torneo completo en jugador.copasSeleccionPendientes.
 * 2) mostrarMundial(alTerminar) se llama al arrancar la temporada
 *    siguiente (en la misma cadena que mostrarCopaAmerica/mostrarFinalissima).
 *    A diferencia de esas dos (un solo partido), el Mundial es un
 *    torneo progresivo completo: 3 partidos de grupos + Octavos +
 *    Cuartos + Semifinal + Final, con el mismo criterio de clasificación
 *    que ya se usa en copasinternacionalesclubes.js (ganar 2 de 3 en
 *    grupos, 2 derrotas eliminan directo, en la llave pierde una vez y
 *    quedás afuera).
 *
 * Depende de: data.js (PAISES), estado.js (Estado), clasificacionClubes.js
 * (MULTIPLICADOR_POR_TAMANO), copasselecciones.js (obtenerTamanoSeleccion,
 * elegirTamanoPorPeso, sortearConvocatoria, obtenerMensajeNoConvocado,
 * esAnioMundialSelecciones).
 * -----------------------------------------
 */

const ETAPAS_MUNDIAL = [
  "Fase de Grupos · Partido 1",
  "Fase de Grupos · Partido 2",
  "Fase de Grupos · Partido 3",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final",
];
const ETIQUETAS_FIXTURE_MUNDIAL = ["G1", "G2", "G3", "8vos", "4tos", "Semi", "Final"];

// ============================================
// 1) CONVOCATORIA + SORTEO DEL RIVAL
// ============================================

const PESOS_CONTINENTE_MUNDIAL = { UEFA: 40, CONMEBOL: 25, CONCACAF: 10, AFC: 10, CAF: 10, OFC: 5 };
const PESOS_TAMANO_RIVAL_MUNDIAL = { grande: 55, mediana: 30, chica: 10, diminuta: 5 };

/**
 * Elige el rival del próximo partido: primero el continente (por peso),
 * después el tamaño de selección (por peso), y recién ahí un país al
 * azar que cumpla ambos requisitos. Si no hay ningún país que cumpla
 * exactamente esa combinación, relaja primero el tamaño y, como último
 * recurso, cualquier país de otro continente.
 */
function elegirRivalMundial(jugador) {
  if (typeof PAISES === "undefined") return null;

  const continente = elegirTamanoPorPeso(PESOS_CONTINENTE_MUNDIAL);
  const tamano = elegirTamanoPorPeso(PESOS_TAMANO_RIVAL_MUNDIAL);

  const exacto = PAISES.filter(
    (p) => p.confederacion === continente && obtenerTamanoSeleccion(p.id) === tamano && p.id !== jugador.pais
  );
  if (exacto.length) return exacto[Math.floor(Math.random() * exacto.length)];

  const porContinente = PAISES.filter((p) => p.confederacion === continente && p.id !== jugador.pais);
  if (porContinente.length) return porContinente[Math.floor(Math.random() * porContinente.length)];

  const cualquiera = PAISES.filter((p) => p.id !== jugador.pais);
  return cualquiera[Math.floor(Math.random() * cualquiera.length)] || null;
}

/**
 * Llamar una vez por año (junto a prepararCopaAmerica/prepararFinalissima
 * en mostrarResumenAnual). Si es año de Mundial, sortea si te convocan
 * y, en caso afirmativo, agenda el torneo completo para jugarse al
 * arrancar la temporada siguiente.
 */
function prepararMundial(jugador, año) {
  if (!esAnioMundialSelecciones(año)) return;
  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  if (jugador.resultadosSelecciones.some((r) => r.competencia === "Mundial" && r.año === año)) return;

  const convocado = sortearConvocatoria(jugador, "Mundial", año);
  if (!convocado) {
    jugador.resultadosSelecciones.push({
      competencia: "Mundial",
      año,
      resultado: "no-convocado",
      mensajeResumen: obtenerMensajeNoConvocado("Mundial", año),
    });
    Estado.guardar();
    return;
  }

  if (!Array.isArray(jugador.copasSeleccionPendientes)) jugador.copasSeleccionPendientes = [];
  jugador.copasSeleccionPendientes.push({
    competencia: "Mundial",
    año,
    jugado: false,
    etapaActual: 0,
    partidosGrupo: 0,
    ganadosGrupo: 0,
    perdidosGrupo: 0,
  });
  Estado.guardar();
}

// ============================================
// 2) MOTOR DEL TORNEO
// ============================================

/**
 * Llamar al arrancar la temporada (en la misma cadena que
 * mostrarCopaAmerica/mostrarFinalissima). Si hay un Mundial pendiente,
 * muestra la pantalla de inicio y devuelve true.
 */
function mostrarMundial(alTerminar) {
  const jugador = Estado.obtener();
  const pendiente = (jugador.copasSeleccionPendientes || []).find(
    (c) => c.competencia === "Mundial" && !c.jugado
  );
  if (!pendiente) return false;

  mostrarPortadaMundial(jugador, pendiente, alTerminar);
  return true;
}

function mostrarPortadaMundial(jugador, pendiente, alTerminar) {
  const pais = (typeof PAISES !== "undefined") ? PAISES.find((p) => p.id === jugador.pais) : null;
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card mundial-final-card mundial-portada">
      <span class="badge-copa">WORLD CUP ${pendiente.año}</span>
      <img class="mundial-portada__bandera" src="${pais?.bandera || ""}" alt="" onerror="this.hidden=true">
      <h2>¡Empieza la Copa Mundial!</h2>
      <p>Todo un país detrás tuyo. Siete partidos te separan de la gloria eterna: fase de grupos, octavos, cuartos, semifinal y la final.</p>
      <button class="boton-jugar-minijuego" id="mundial-arrancar">Salir a la cancha</button>
    </div>`;
  contenedor.querySelector("#mundial-arrancar").onclick = () => jugarEtapaMundial(jugador, pendiente, alTerminar);
}

function crearFixtureMundial(pendiente) {
  return `<div class="mundial-fixture">${ETIQUETAS_FIXTURE_MUNDIAL.map((etiqueta, i) => {
    let clase = "mundial-fixture__punto";
    if (i < pendiente.etapaActual) clase += " mundial-fixture__punto--jugado";
    else if (i === pendiente.etapaActual) clase += " mundial-fixture__punto--actual";
    return `<span class="${clase}">${etiqueta}</span>`;
  }).join("")}</div>`;
}

function crearCabeceraMundial(jugador, rival) {
  const miPais = (typeof PAISES !== "undefined") ? PAISES.find((p) => p.id === jugador.pais) : null;
  const contexto = window.CONTEXTO_PARTIDO || {};
  const detalleTorneo = contexto.torneo
    ? `<span class="minijuego-contexto">${contexto.torneo}${contexto.fase ? ` · ${contexto.fase}` : ""}</span>`
    : "";
  return `
    <div class="minijuego-marcador">
      <div class="equipo">
        <img src="${miPais?.bandera || ""}" alt="" onerror="this.hidden=true">
        <span>${miPais ? miPais.nombre : "Tu selección"}</span>
      </div>
      <span class="en-vivo">🔴 EN VIVO</span>
      <div class="equipo">
        <img src="${rival?.bandera || ""}" alt="" onerror="this.hidden=true">
        <span>${rival ? rival.nombre : "Rival"}</span>
      </div>
      ${detalleTorneo}
    </div>
  `;
}

function jugarEtapaMundial(jugador, pendiente, alTerminar) {
  const etapa = ETAPAS_MUNDIAL[pendiente.etapaActual];
  const rival = elegirRivalMundial(jugador);
  const nivel = pendiente.etapaActual <= 2 ? 0 : pendiente.etapaActual <= 4 ? 1 : 2;
  window.CONTEXTO_PARTIDO = { torneo: "Copa Mundial", fase: etapa };

  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  const tamanoRival = rival ? obtenerTamanoSeleccion(rival.id) : "?";
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <span class="badge-copa">WORLD CUP ${pendiente.año}</span>
      ${crearFixtureMundial(pendiente)}
      ${crearCabeceraMundial(jugador, rival)}
      <h3>${etapa}</h3>
      <p class="mundial-rival-tag">Rival: ${rival ? rival.nombre : "?"} · Selección ${tamanoRival}</p>
      <button class="boton-jugar-minijuego" id="mundial-jugar-etapa">Jugar</button>
    </div>`;

  contenedor.querySelector("#mundial-jugar-etapa").onclick = () => {
    const juegos = {
      delantero: minijuegoLatidoFinal,
      enganche: minijuegoVisionPanoramica,
      central: minijuegoUltimoHombre,
      arquero: minijuegoManosDeHielo,
    };
    const jugar = juegos[jugador.posicion] || minijuegoLatidoFinal;
    jugar(nivel, (exito) => resolverPartidoMundial(jugador, pendiente, etapa, exito, alTerminar));
  };
}

function resolverPartidoMundial(jugador, pendiente, etapaJugada, exito, alTerminar) {
  const enGrupos = pendiente.etapaActual < 3;

  if (enGrupos) {
    pendiente.partidosGrupo = (pendiente.partidosGrupo || 0) + 1;
    if (exito) pendiente.ganadosGrupo = (pendiente.ganadosGrupo || 0) + 1;
    else pendiente.perdidosGrupo = (pendiente.perdidosGrupo || 0) + 1;
    Estado.guardar();

    if (pendiente.perdidosGrupo >= 2) {
      return finalizarMundial(jugador, pendiente, false, "Fase de Grupos", alTerminar);
    }
    if (pendiente.partidosGrupo >= 3) {
      if (pendiente.ganadosGrupo < 2) {
        return finalizarMundial(jugador, pendiente, false, "Fase de Grupos", alTerminar);
      }
      pendiente.etapaActual = 3; // clasificó: salta directo a Octavos
      Estado.guardar();
      return jugarEtapaMundial(jugador, pendiente, alTerminar);
    }
    pendiente.etapaActual += 1;
    Estado.guardar();
    return jugarEtapaMundial(jugador, pendiente, alTerminar);
  }

  // Mata-mata: una derrota y quedás afuera.
  if (!exito) {
    return finalizarMundial(jugador, pendiente, false, etapaJugada, alTerminar);
  }
  if (etapaJugada === "Final") {
    return finalizarMundial(jugador, pendiente, true, "Final", alTerminar);
  }
  pendiente.etapaActual += 1;
  Estado.guardar();
  jugarEtapaMundial(jugador, pendiente, alTerminar);
}

function finalizarMundial(jugador, pendiente, campeon, etapaFinal, alTerminar) {
  pendiente.jugado = true;
  pendiente.campeon = campeon;

  let resultado;
  let mensajeResumen;
  if (campeon) {
    resultado = "campeon";
    mensajeResumen = `¡Campeón de la World Cup ${pendiente.año}!`;
    jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;
  } else if (etapaFinal === "Final") {
    resultado = "subcampeon";
    mensajeResumen = `Subcampeón de la World Cup ${pendiente.año}`;
  } else {
    resultado = `eliminado_${etapaFinal}`;
    mensajeResumen = `Eliminado de la World Cup ${pendiente.año} en ${etapaFinal}`;
  }

  if (!Array.isArray(jugador.resultadosSelecciones)) jugador.resultadosSelecciones = [];
  jugador.resultadosSelecciones.push({
    competencia: "Mundial",
    año: pendiente.año,
    resultado,
    pais: jugador.pais,
    mensajeResumen,
  });
  Estado.guardar();

  mostrarCartelResultadoMundial(campeon, etapaFinal, pendiente.año, alTerminar);
}

function mostrarCartelResultadoMundial(campeon, etapaFinal, año, alTerminar) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;

  if (campeon) {
    if (typeof lanzarConfeti === "function") lanzarConfeti();
    contenedor.innerHTML = `
      <div class="competition-card campeon mundial-final-card">
        <span class="badge-copa">WORLD CUP ${año}</span>
        <h2>¡CAMPEÓN DE LA WORLD CUP ${año}!!</h2>
        <img src="Trofeos/Mundial.png" alt="Copa del Mundo" onerror="this.hidden=true">
        <p>Tocar el cielo con los dedos es incomparable, trajiste alegría a tu país.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  } else if (etapaFinal === "Final") {
    contenedor.innerHTML = `
      <div class="competition-card subcampeon">
        <h2>Has quedado como Subcampeón de la World Cup ${año}</h2>
        <p>Tan cerca que a la vez se siente tan lejos, duele el doble.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  } else {
    contenedor.innerHTML = `
      <div class="competition-card subcampeon">
        <h2>Eliminado de la World Cup ${año}</h2>
        <p>El sueño mundialista se corta en ${etapaFinal}. Todavía hay revancha dentro de cuatro años.</p>
        <button class="boton-continuar">Continuar</button>
      </div>`;
  }

  contenedor.querySelector(".boton-continuar").onclick = () => {
    contenedor.innerHTML = "";
    contenedor.hidden = true;
    alTerminar();
  };
}

// ============================================
// 3) MINIJUEGOS (uno por posición, 3 niveles de dificultad: 0 grupos,
//    1 octavos/cuartos, 2 semis/final)
// ============================================

function tarjetaMundialMinijuego(titulo, descripcion, cuerpo) {
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card mundial-card">
      <span class="badge-copa">WORLD CUP</span>
      <h3>${titulo}</h3>
      <p>${descripcion}</p>
      ${cuerpo}
    </div>`;
  return contenedor;
}

// ---------- DELANTERO: "El Latido Final" ----------
// Una barra cae al ritmo de un latido; hay que reaccionar justo cuando
// cruza la línea. En la final hacen falta 5 aciertos seguidos.
function minijuegoLatidoFinal(nivel, callbackFinal) {
  const necesarios = [1, 3, 5][nivel];
  const contenedor = tarjetaMundialMinijuego(
    "El Latido Final",
    `Presioná ESPACIO (o tocá el botón) justo cuando la barra cruce la línea. Necesitás ${necesarios} acierto${necesarios > 1 ? "s" : ""} seguido${necesarios > 1 ? "s" : ""}.`,
    `<div class="latido-pista"><div class="latido-linea"></div><div class="latido-barra" id="latido-barra"></div></div>
     <button class="boton-jugar-minijuego" id="latido-boton">¡AHORA!</button>
     <p class="minijuego-progreso" id="latido-progreso">Aciertos: 0/${necesarios}</p>`
  );
  const barra = contenedor.querySelector("#latido-barra");
  const boton = contenedor.querySelector("#latido-boton");
  const progresoTxt = contenedor.querySelector("#latido-progreso");

  let aciertos = 0;
  let activo = true;
  let cayendo = false;
  let inicio = 0;
  let duracion = 0;
  let timeoutFallo = null;

  function limpiarYCerrar(exito) {
    activo = false;
    cayendo = false;
    clearTimeout(timeoutFallo);
    document.removeEventListener("keydown", listenerTeclado);
    callbackFinal(exito);
  }

  function nuevaCaida() {
    cayendo = true;
    duracion = nivel === 0 ? 1600 : nivel === 1 ? 950 + Math.random() * 200 : 600 + Math.random() * 220;
    inicio = Date.now();
    barra.style.transition = "none";
    barra.style.top = "0%";
    void barra.offsetWidth; // fuerza el reflow para reiniciar la transición
    barra.style.transition = `top ${duracion}ms linear`;
    requestAnimationFrame(() => {
      barra.style.top = "100%";
    });
    clearTimeout(timeoutFallo);
    timeoutFallo = setTimeout(() => {
      if (activo && cayendo) limpiarYCerrar(false);
    }, duracion + 120);
  }

  function intentar() {
    if (!activo || !cayendo) return;
    cayendo = false;
    clearTimeout(timeoutFallo);
    const transcurrido = Date.now() - inicio;
    const progreso = transcurrido / duracion; // la línea está al 85% del recorrido
    const ventana = nivel === 0 ? 0.16 : nivel === 1 ? 0.11 : 0.08;
    const acierto = Math.abs(progreso - 0.85) <= ventana;

    if (acierto) {
      aciertos++;
      progresoTxt.textContent = `Aciertos: ${aciertos}/${necesarios}`;
      if (aciertos >= necesarios) return limpiarYCerrar(true);
      setTimeout(nuevaCaida, 380);
    } else {
      limpiarYCerrar(false);
    }
  }

  const listenerTeclado = (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      intentar();
    }
  };
  document.addEventListener("keydown", listenerTeclado);
  boton.onclick = intentar;

  nuevaCaida();
}

// ---------- ENGANCHE: "Visión Panorámica" ----------
// Memorizás dónde están tus compañeros (verde) y clickeás esos
// casilleros de memoria. Tocar un rival (rojo) es contragolpe.
function minijuegoVisionPanoramica(nivel, callbackFinal) {
  const tam = [3, 4, 5][nivel];
  const totalCeldas = tam * tam;
  const compañeros = [3, 4, 6][nivel];
  const rivalesCant = [1, 2, 3][nivel];
  const tiempoVer = [1500, 1100, 750][nivel];

  const contenedor = tarjetaMundialMinijuego(
    "Visión Panorámica",
    "Memorizá dónde están tus compañeros (verde). Van a desaparecer: hacé clic en esos casilleros exactos para encadenar los pases. Si tocás una zona roja (rival), es contragolpe.",
    `<div class="vision-grid" id="vision-grid" style="grid-template-columns:repeat(${tam},1fr)"></div>`
  );
  const grid = contenedor.querySelector("#vision-grid");
  const celdas = [];
  for (let i = 0; i < totalCeldas; i++) {
    const celda = document.createElement("button");
    celda.className = "vision-celda";
    celda.type = "button";
    grid.appendChild(celda);
    celdas.push(celda);
  }

  function elegirVarios(cantidad, disponibles) {
    const copia = [...disponibles];
    const elegidos = [];
    for (let k = 0; k < cantidad && copia.length; k++) {
      elegidos.push(copia.splice(Math.floor(Math.random() * copia.length), 1)[0]);
    }
    return elegidos;
  }

  const indices = Array.from({ length: totalCeldas }, (_, i) => i);
  const verdes = elegirVarios(compañeros, indices);
  const restantes = indices.filter((i) => !verdes.includes(i));
  const rojos = elegirVarios(rivalesCant, restantes);

  verdes.forEach((i) => celdas[i].classList.add("vision-celda--verde"));
  rojos.forEach((i) => celdas[i].classList.add("vision-celda--roja-preview"));

  setTimeout(() => {
    celdas.forEach((c) => c.classList.remove("vision-celda--verde", "vision-celda--roja-preview"));
    let restantesVerdes = new Set(verdes);
    let activo = true;

    celdas.forEach((celda, i) => {
      celda.onclick = () => {
        if (!activo) return;
        if (rojos.includes(i)) {
          activo = false;
          celda.classList.add("vision-celda--fallo");
          return callbackFinal(false);
        }
        if (restantesVerdes.has(i)) {
          restantesVerdes.delete(i);
          celda.classList.add("vision-celda--acierto");
          celda.disabled = true;
          if (restantesVerdes.size === 0) {
            activo = false;
            callbackFinal(true);
          }
        } else {
          celda.disabled = true;
        }
      };
    });
  }, tiempoVer);
}

// ---------- CENTRAL: "El Último Hombre" ----------
// El delantero corre hacia la línea de robo. Hay que clickear justo
// cuando la toca. En rondas altas hace amagues que rompen el ritmo.
function minijuegoUltimoHombre(nivel, callbackFinal) {
  const contenedor = tarjetaMundialMinijuego(
    "El Último Hombre",
    "El delantero rival corre hacia vos. Hacé clic justo cuando su pelota toque la línea de robo.",
    `<div class="ultimo-hombre-pista">
       <div class="ultimo-hombre-jugador" id="uh-jugador">⚽</div>
       <div class="ultimo-hombre-linea"></div>
     </div>
     <button class="boton-jugar-minijuego" id="uh-boton">¡QUITE!</button>`
  );
  const jugadorEl = contenedor.querySelector("#uh-jugador");
  const boton = contenedor.querySelector("#uh-boton");

  let pos = 0;
  let velocidad = nivel === 0 ? 0.85 : nivel === 1 ? 1.15 : 1.35;
  let activo = true;
  let resuelto = false;
  const conAmague = nivel >= 1;

  function terminar(exito) {
    if (resuelto) return;
    resuelto = true;
    activo = false;
    callbackFinal(exito);
  }

  function tick() {
    if (!activo) return;
    if (conAmague && Math.random() < (nivel === 1 ? 0.02 : 0.045)) {
      velocidad = Math.random() < 0.5 ? velocidad * 0.15 : velocidad * 2.4;
      setTimeout(() => {
        velocidad = nivel === 1 ? 1.15 : 1.4;
      }, 260);
    }
    pos += velocidad;
    jugadorEl.style.left = `${Math.min(100, pos)}%`;
    if (pos >= 100) {
      terminar(false); // lo dejaste llegar sin marcar
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  boton.onclick = () => {
    if (!activo || resuelto) return;
    const ventana = nivel === 0 ? 7 : nivel === 1 ? 5 : 3.5;
    terminar(Math.abs(pos - 100) <= ventana);
  };
}

// ---------- ARQUERO: "Manos de Hielo" ----------
// Aparecen blancos en el arco: hay que clickearlos antes de que
// desaparezcan. Los marcados con una X roja son amagues (no tocar).
function minijuegoManosDeHielo(nivel, callbackFinal) {
  const necesarios = [3, 4, 5][nivel];
  const simultaneos = [1, 2, 3][nivel];
  const vida = nivel === 0 ? 1300 : nivel === 1 ? 950 : 750;
  const probFalso = nivel === 0 ? 0 : nivel === 1 ? 0.2 : 0.35;

  const contenedor = tarjetaMundialMinijuego(
    "Manos de Hielo",
    "Atajá los remates (círculos) antes de que desaparezcan. Los que tienen una X roja son amagues: si los tocás, te tirás mal y dejás el arco libre.",
    `<div class="hielo-arco" id="hielo-arco"><span class="hielo-contador" id="hielo-contador">0/${necesarios}</span></div>`
  );
  const zona = contenedor.querySelector("#hielo-arco");
  const contadorTxt = contenedor.querySelector("#hielo-contador");

  let atajadas = 0;
  let activas = 0;
  let activo = true;

  function terminar(exito) {
    if (!activo) return;
    activo = false;
    callbackFinal(exito);
  }

  function lanzar() {
    if (!activo || atajadas >= necesarios) return;
    if (activas >= simultaneos) {
      setTimeout(lanzar, 150);
      return;
    }
    activas++;
    const esFalso = Math.random() < probFalso;
    const blanco = document.createElement("button");
    blanco.type = "button";
    blanco.className = `hielo-blanco${esFalso ? " hielo-blanco--falso" : ""}`;
    blanco.textContent = esFalso ? "✕" : "";
    blanco.style.left = `${8 + Math.random() * 78}%`;
    blanco.style.top = `${10 + Math.random() * 70}%`;
    zona.appendChild(blanco);

    const vencido = setTimeout(() => {
      blanco.remove();
      activas--;
      if (!activo) return;
      if (!esFalso) {
        terminar(false); // dejaste pasar un remate real
        return;
      }
      setTimeout(lanzar, 100);
    }, vida);

    blanco.onclick = () => {
      if (!activo) return;
      clearTimeout(vencido);
      blanco.remove();
      activas--;
      if (esFalso) {
        terminar(false); // te tiraste mal con el amague
        return;
      }
      atajadas++;
      contadorTxt.textContent = `${atajadas}/${necesarios}`;
      if (atajadas >= necesarios) {
        terminar(true);
        return;
      }
      setTimeout(lanzar, 120);
    };

    setTimeout(lanzar, nivel === 0 ? 500 : 250);
  }
  lanzar();
}