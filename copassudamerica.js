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

// ---------- BarraQTE arreglada: barra va de 0 a 100, rojo +5 = 5% ----------
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

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
}

// ---------- Copa Libertadores - Camino Progresivo (arreglado) ----------
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

  function jugarPartido(etapa, callbackPartido) {
    const secuencia = generarSecuencia(etapa.longitud);
    let paso = 0;
    let esperandoUsuario = false;
    let aciertosUsuario = [];
    let fallo = false;

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
      if (!esperandoUsuario) return;
      const bloque = e.target;
      const index = parseInt(bloque.dataset.index);
      if (bloque.classList.contains("usado")) return;
      bloque.classList.add("usado");
      const indiceEsperado = secuencia[aciertosUsuario.length];
      if (index !== indiceEsperado) fallo = true;
      aciertosUsuario.push(index);

      if (aciertosUsuario.length === secuencia.length) {
        bloques.forEach(b => b.removeEventListener("click", handlerClick));
        callbackPartido(!fallo);
      }
    };
    bloques.forEach(b => b.addEventListener("click", handlerClick));
  }

  // Función corregida que evalúa fase de grupos al llegar a octavos
  function siguientePartido() {
    if (indiceEtapa >= etapas.length) {
      callback({ resultado: "campeon" });
      return;
    }

    if (indiceEtapa === 3) {
      if (ganadosGrupos < 2) {
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
            // En eliminatoria, si fallas, eliminado directo
            if (!exito && etapa.fase === "eliminatoria") {
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

// ---------- Mostrar cartel de resultado internacional ----------
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

// ---------- Función principal ----------
function ejecutarInternacionales(callback) {
  const jugador = Estado.obtener();
  const año = jugador.año;

  if (!clasificaLibertadores(jugador)) {
    callback();
    return;
  }

  const tipo = Math.random() < 0.75 ? "copa_completa" : "final";

  jugarLibertadores((resultado, fase) => {
    if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];
    let resumen = "";
    if (resultado) {
      resumen = "campeon";
      jugador.stats.titulos++;
      const rivalRecopa = obtenerRivalInternacional(jugador);
      jugador.copasPendientes.push({ año: año + 1, tipo: "recopa", rivalId: rivalRecopa.id });
      mostrarCartelInternacional(true, undefined, "Trofeos/CopaLibertadores.png");
    } else {
      if (!fase) {
        const fases = ["Fase de Grupos", "Octavos", "Cuartos", "Semifinal", "Final"];
        fase = fases[Math.floor(Math.random() * fases.length)];
      }
      if (fase === "Final") resumen = "subcampeon";
      else resumen = `eliminado_${fase}`;
      mostrarCartelInternacional(false, fase, "");
    }
    jugador.resultadosInternacionales.push({
      año: año,
      copa: "Libertadores",
      resultado: resumen
    });
    Estado.guardar();
    // Esperar a que el usuario presione "Continuar" en el cartel
    const contenedor = document.getElementById("competition-container");
    contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      callback();
    });
  });
}

// ---------- Mostrar Recopa (igual que antes) ----------
function mostrarRecopa(copa, callback) {
  const jugador = Estado.obtener();
  const rival = NOMBRES_CLUBES[copa.rivalId] || { nombre: "Rival" };
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>Recopa Sudamericana</h3>
      <p>Campeón de Libertadores vs Campeón de Sudamericana.</p>
      <button class="boton-jugar-minijuego" id="btn-jugar-recopa">¡Jugar!</button>
    </div>
  `;

  document.getElementById("btn-jugar-recopa").addEventListener("click", () => {
    minijuegoBarraQTE((exito) => {
      if (!jugador.resultadosInternacionales) jugador.resultadosInternacionales = [];
      jugador.resultadosInternacionales.push({
        año: copa.año,
        copa: "Recopa",
        resultado: exito ? "campeon" : "subcampeon"
      });
      if (exito) jugador.stats.titulos++;
      Estado.guardar();
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      callback(exito);
    }, jugador, rival);
  });
}