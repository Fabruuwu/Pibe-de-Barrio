/**
 * Argentina.js
 * -----------------------------------------
 * TODO lo relacionado con competiciones de Argentina: simulación de Liga,
 * Copa Argentina, SuperCopa, Trofeo de Campeones, SuperCopa Internacional,
 * sus minijuegos, los helpers de rival (elegirRivalAleatorio,
 * asegurarRivalDiferente), el agendamiento de copas de fin de temporada
 * (agendarProximasCopas) y el orquestador de la temporada (por ahora
 * también usado por el Brasileirão, que comparte el mismo flujo de
 * minijuegos de Liga + Copa).
 *
 * procesarCopasPendientes (el despachador genérico de la cola de copas
 * pendientes: Libertadores, Sudamericana, Recopa, Mundial de Clubes,
 * Champions, SuperCopa UEFA) vive en copasinternacionalesclubes.js, ya
 * que España también lo usa y la mayoría de sus casos son competiciones
 * internacionales de clubes.
 * -----------------------------------------
 */

// ------------------------------------------------------------------
// SIMULACIÓN DE COPAS ARGENTINAS
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
// MOSTRAR COPA PENDIENTE (SuperCopa / Trofeo / SuperCopa Internacional)
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
// ORQUESTADOR DE LA TEMPORADA (esto es lo único que llama hud.js)
// ============================================
function procesarTemporadaArgentina(jugador, año, callbackFinal) {
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
    // OJO: antes acá decía "liga: jugador.club" SIEMPRE, sin importar si
    // habías salido campeón o no. Eso hacía que CUALQUIER temporada jugada
    // contara como título de Liga Argentina a la hora de sumar puntos en
    // menufinal.js. Se corrige para que solo cuente si resLiga.esCampeon.
    const nuevaEntrada = { año, liga: resLiga.esCampeon ? jugador.club : null, copa: null, superCopa: null, trofeo: null, superCopaInt: null };
    especialesDelAño.forEach((c) => {
      if (c.resultado !== "campeon") return;
      if (c.tipo === "supercopa") nuevaEntrada.superCopa = jugador.club;
      if (c.tipo === "trofeo") nuevaEntrada.trofeo = jugador.club;
      if (c.tipo === "supercopaInt") nuevaEntrada.superCopaInt = jugador.club;
    });
    jugador.campeonesHistorial.push(nuevaEntrada);

    const terminarTemporada = () => {
      Estado.guardar();
      callbackFinal();
    };

    if (resultadoCopa.enFinal) {
      mostrarResultadoCopa(resultadoCopa, (resCopa) => {
        const hist = jugador.campeonesHistorial.find(h => h.año === año);
        hist.copa = resCopa.esCampeon ? jugador.club : null;
        if (resCopa.esCampeon) jugador.stats.titulos++;
        jugador.resultadoCopa = resCopa;

        agendarProximasCopas(jugador, año, resLiga, resCopa);
        procesarCopasPendientes(terminarTemporada);
      });
    } else {
      const hist = jugador.campeonesHistorial.find(h => h.año === año);
      hist.copa = null;
      jugador.resultadoCopa = { esCampeon: false, ronda: resultadoCopa.ronda || "Eliminado" };
      agendarProximasCopas(jugador, año, resLiga, { esCampeon: false });
      ejecutarInternacionales(() => {
        procesarCopasPendientes(terminarTemporada);
      });
    }
  });
}
// ============================================
// SECCIÓN: helpers de rival y agenda de copas (antes en copas.js)
// ============================================
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

// ============================================
// SECCIÓN: copassudamerica.js