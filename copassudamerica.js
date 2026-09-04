// copassudamerica.js
// Depende de: NOMBRES_CLUBES, CLUBES_POR_DIVISION, crearCabeceraMinijuego

function obtenerRivalInternacional(jugador) {
  const divisiones = ["primera-division-argentina", "serie-a-brasil"];
  let rivales = [];
  divisiones.forEach(div => {
    const clubes = CLUBES_POR_DIVISION[div] || [];
    clubes.forEach(c => { if (c.id !== jugador.club) rivales.push(c); });
  });
  return rivales[Math.floor(Math.random() * rivales.length)];
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

// ---------- Minijuego BarraQTE ----------
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Final de la Copa!</h3>
      <p>Presioná los botones correctos. Rojo (+5%), Rosa (-10%), Bordo (perdés). Necesitás 100%.</p>
      <button class="boton-iniciar-qte" id="btn-listo-barraqte">Comenzar</button>
    </div>
  `;

  document.getElementById("btn-listo-barraqte").addEventListener("click", () => {
    contenedor.innerHTML = `
      ${cabecera}
      <div class="competition-card">
        <h3>¡Final de la Copa!</h3>
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
    let tiempo = 20;
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

  const emojis = ["⚽","🏆","🔥","💪","🎯","⚡","🥅","🛡️","👟"];
  const cartas = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  const gambeta = jugador.stats.gambeta || 0;
  let tiempoVer = 0.5;
  if (gambeta <= 65) tiempoVer = 0.6;
  else if (gambeta <= 75) tiempoVer = 0.7;
  else if (gambeta <= 85) tiempoVer = 0.8;
  else if (gambeta <= 95) tiempoVer = 1.0;
  else tiempoVer = 1.5;

  let vidas = 2;
  if (jugador.media >= 85) vidas++;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>La Jugada Preparada</h3>
      <p>Memorizá las parejas de emojis. ¡Tenés ${vidas} vidas!</p>
      <div class="memoria-parejas" id="memoria-parejas" style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px; max-width:500px; margin:20px auto;"></div>
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
        if (paresEncontrados === 9) {
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
    </div>
  `;

  const grid = document.getElementById("libertadores-grid");
  const info = document.getElementById("secuencia-info");
  const btnComenzar = document.getElementById("btn-comenzar-libertadores");
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

    const intervaloMostrar = setInterval(() => {
      if (paso >= secuencia.length) {
        clearInterval(intervaloMostrar);
        info.textContent = "¡Repetí la secuencia!";
        bloques.forEach(b => b.classList.add("activo"));
        esperandoUsuario = true;
        return;
      }
      const idx = secuencia[paso];
      bloques[idx].classList.add("iluminado");
      setTimeout(() => bloques[idx].classList.remove("iluminado"), 400);
      paso++;
    }, 500);

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
    minijuegoPosicion((exito, fase) => callback(exito, fase), jugador, rival);
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
    minijuegoPosicion(callback, jugador, rival);
    return;
  }

  const tipo = Math.random() < 0.5 ? "memoria" : "tirolibre";
  (tipo === "memoria" ? minijuegoMemoriaParejas : minijuegoTiroLibre)((exito) => callback(exito), jugador, rival);
}

// ---------- Mostrar Sudamericana ----------
function mostrarSudamericana(copa, callback) {
  const jugador = Estado.obtener();
  if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];

  jugarSudamericana((resultado, motivo) => {
    if (resultado) {
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Sudamericana", resultado: "campeon" });
      jugador.stats.titulos++;
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
        mostrarCartelInternacional(false, "Fase Previa", "");
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
  const minijuegosPorPosicion = {
    enganche: typeof jugarRecopaEnganche === "function" ? jugarRecopaEnganche : null,
    central: typeof jugarRecopaCentral === "function" ? jugarRecopaCentral : null,
    arquero: typeof jugarRecopaArquero === "function" ? jugarRecopaArquero : null,
  };
  const minijuegoPosicion = minijuegosPorPosicion[jugador.posicion];
  if (minijuegoPosicion) {
    minijuegoPosicion(callback, jugador, rival);
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
  const tipo = Math.random() < 0.75 ? "copa_completa" : "final";
  jugarLibertadores((resultado, fase) => {
    if (resultado) {
      if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: "campeon" });
      jugador.stats.titulos++;
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
      let resumen = "";
      if (fase === "Final") resumen = "subcampeon";
      else resumen = `eliminado_${fase}`;
      jugador.resultadosInternacionales.push({ año: copa.año, copa: "Libertadores", resultado: resumen });
      mostrarCartelInternacional(false, fase, "");
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
  if (ganador) {
    contenedor.innerHTML = `
      <div class="competition-card campeon">
        <h2>¡CAMPEÓN!</h2>
        <img src="${imagen}" alt="Copa">
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
  } else {
    if (fase === "Final") {
      contenedor.innerHTML = `
        <div class="competition-card subcampeon">
          <h2>Subcampeón 🥈</h2>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    } else {
      contenedor.innerHTML = `
        <div class="competition-card">
          <h3>Eliminado en ${fase}</h3>
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
