// copassudamerica.js
// Depende de: NOMBRES_CLUBES, CLUBES_POR_DIVISION, crearCabeceraMinijuego

// ---------- Helpers ----------
function obtenerRivalInternacional(jugador) {
  const divisiones = ["primera-division-argentina", "serie-a-brasil"];
  let rivales = [];
  divisiones.forEach(div => {
    const clubes = CLUBES_POR_DIVISION[div] || [];
    clubes.forEach(c => { if (c.id !== jugador.club) rivales.push(c); });
  });
  return rivales[Math.floor(Math.random() * rivales.length)];
}

// Verificar si clasifica a Libertadores
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

// ---------- Minijuego de BarraQTE (para finales) ----------
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Final de la Copa!</h3>
      <p>Presioná los botones correctos para llenar la barra. Rojo (+5), Rosa (-10), Bordo (perdés).</p>
      <div class="barra-qte">
        <div class="barra-progreso" id="barra-progreso"></div>
        <span id="puntos-texto">0/20</span>
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

  // Spawn de botones
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
      barra.style.width = `${(puntos / 20) * 100}%`;
      puntosTexto.textContent = `${puntos}/20`;
      if (puntos >= 20) {
        clearInterval(timerInterval);
        clearInterval(spawnInterval);
        terminado = true;
        contenedor.innerHTML = "";
        callback(true);
      }
    }
  });
}

// ================== COPA LIBERTADORES - CAMINO PROGRESIVO ==================
function minijuegoCopaCompleta(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Copa Libertadores!</h3>
      <p>Memorizá las secuencias de bloques iluminados. ¡Cuidado que aumentan!</p>
      <div class="libertadores-grid" id="libertadores-grid"></div>
      <div class="secuencia-info" id="secuencia-info"></div>
      <button class="boton-iniciar-qte" id="btn-comenzar-libertadores">Comenzar</button>
    </div>
  `;
  
  const grid = document.getElementById("libertadores-grid");
  const info = document.getElementById("secuencia-info");
  const btnComenzar = document.getElementById("btn-comenzar-libertadores");
  
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
  
  function generarSecuencia(longitud) {
    const indices = [];
    const disponibles = Array.from({ length: 20 }, (_, i) => i);
    for (let i = 0; i < longitud; i++) {
      const idx = Math.floor(Math.random() * disponibles.length);
      indices.push(disponibles.splice(idx, 1)[0]);
    }
    return indices;
  }
  
  function jugarPartido(etapa, callbackPartido) {
    const secuencia = generarSecuencia(etapa.longitud);
    let paso = 0;
    let esperandoUsuario = false;
    let aciertosUsuario = [];
    let fallo = false;
    
    bloques.forEach(b => {
      b.classList.remove("iluminado", "usado", "activo");
    });
    
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
      setTimeout(() => {
        bloques[idx].classList.remove("iluminado");
      }, 400);
      paso++;
    }, 500);
    
    const handlerClick = (e) => {
      if (!esperandoUsuario) return;
      const bloque = e.target;
      const index = parseInt(bloque.dataset.index);
      if (bloque.classList.contains("usado")) return;
      bloque.classList.add("usado");
      
      // Verificación correcta: comparar con el índice esperado antes de agregar
      const indiceEsperado = secuencia[aciertosUsuario.length];
      if (index !== indiceEsperado) {
        fallo = true;
      }
      aciertosUsuario.push(index);
      
      if (aciertosUsuario.length === secuencia.length) {
        bloques.forEach(b => b.removeEventListener("click", handlerClick));
        if (!fallo) {
          callbackPartido(true);
        } else {
          callbackPartido(false);
        }
      }
    };
    
    bloques.forEach(b => b.addEventListener("click", handlerClick));
  }
  
  function siguientePartido() {
    if (indiceEtapa >= etapas.length) {
      callback({ resultado: "campeon" });
      return;
    }
    
    const etapa = etapas[indiceEtapa];
    
    if (indiceEtapa === 0) {
      info.textContent = "Listo?";
      btnComenzar.disabled = false;
      btnComenzar.textContent = "Comenzar";
      btnComenzar.onclick = () => {
        btnComenzar.disabled = true;
        jugarPartido(etapa, (exito) => {
          if (exito) {
            ganadosGrupos++;
            if (etapa.fase === "grupos") {
              if (ganadosGrupos >= 2 || indiceEtapa === 2) {
                indiceEtapa = 3;
                siguientePartido();
              } else {
                indiceEtapa++;
                siguientePartido();
              }
            } else {
              indiceEtapa++;
              siguientePartido();
            }
          } else {
            if (etapa.fase === "grupos") {
              erroresGrupos++;
              if (erroresGrupos >= 2) {
                callback({ resultado: "eliminado", fase: "Fase de Grupos" });
                return;
              } else {
                if (indiceEtapa === 2) {
                  callback({ resultado: "eliminado", fase: "Fase de Grupos" });
                  return;
                }
                indiceEtapa++;
                siguientePartido();
              }
            } else {
              callback({ resultado: "eliminado", fase: etapa.nombre });
              return;
            }
          }
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
            if (exito) {
              if (etapa.fase === "grupos") {
                ganadosGrupos++;
                if (ganadosGrupos >= 2 || indiceEtapa === 2) {
                  indiceEtapa = 3;
                  siguientePartido();
                } else {
                  indiceEtapa++;
                  siguientePartido();
                }
              } else {
                indiceEtapa++;
                siguientePartido();
              }
            } else {
              if (etapa.fase === "grupos") {
                erroresGrupos++;
                if (erroresGrupos >= 2) {
                  callback({ resultado: "eliminado", fase: "Fase de Grupos" });
                  return;
                } else {
                  if (indiceEtapa === 2) {
                    callback({ resultado: "eliminado", fase: "Fase de Grupos" });
                    return;
                  }
                  indiceEtapa++;
                  siguientePartido();
                }
              } else {
                callback({ resultado: "eliminado", fase: etapa.nombre });
                return;
              }
            }
          });
        };
      }, 3000);
    }
  }
  
  siguientePartido();
}

// ---------- Jugar Libertadores según tipo ----------
function jugarLibertadores(callback, jugador, tipo) {
  const rival = obtenerRivalInternacional(jugador);
  if (tipo === "copa_completa") {
    minijuegoCopaCompleta((resultado) => {
      if (resultado.resultado === "campeon") {
        callback(true, undefined); // ganó
      } else {
        callback(false, resultado.fase); // eliminado con fase
      }
    }, jugador, rival);
  } else {
    // Final directa
    if (Math.random() < 0.5) {
      minijuegoBarraQTE((exito) => {
        if (exito) callback(true, undefined);
        else callback(false, "Final"); // perdió en la final
      }, jugador, rival);
    } else {
      callback(false, "Final"); // no jugó final y perdió
    }
  }
}

// ---------- Función principal que se llama desde hud.js ----------
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
      jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;
      const rivalRecopa = obtenerRivalInternacional(jugador);
      jugador.copasPendientes.push({ año: año + 1, tipo: "recopa", rivalId: rivalRecopa.id });
    } else {
      if (fase) {
        resumen = `eliminado_${fase}`;
      } else {
        resumen = "subcampeon";
      }
    }
    jugador.resultadosInternacionales.push({
      año: año,
      copa: "Libertadores",
      resultado: resumen
    });
    Estado.guardar();
    callback();
  }, jugador, tipo);
}

// ---------- Mostrar Recopa (copa pendiente) ----------
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