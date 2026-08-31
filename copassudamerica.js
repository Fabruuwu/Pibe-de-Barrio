// copassudamerica.js
// Depende de: NOMBRES_CLUBES, CLUBES_POR_DIVISION, crearCabeceraMinijuego

// Clasificación a Libertadores (solo para ligas de Argentina o Brasil)
function clasificaLibertadores(jugador) {
  const liga = jugador.liga;
  const club = jugador.club;
  const posicion = jugador.resultadoLiga ? jugador.resultadoLiga.posicion : null;
  const esCampeonLiga = jugador.resultadoLiga?.esCampeon || false;
  const esSubcampeonLiga = jugador.resultadoLiga?.subcampeon || false;
  const esCampeonCopa = jugador.resultadoCopa?.esCampeon || false;

  // Condiciones para clasificar
  const esLigaArgentina = liga === "liga-profesional-argentina";
  const esLigaBrasil = liga === "brasileirao-brasil";

  if (!esLigaArgentina && !esLigaBrasil) return false;

  if (esCampeonCopa) return true;
  if (esCampeonLiga) return true;
  if (esSubcampeonLiga) return true;
  if (posicion === 2 || posicion === 3) return true; // top 2,3 (posiciones 2 y 3)
  return false;
}

// Simular Libertadores: elige entre copa completa (75%) o final directa (25%)
function simularLibertadores(jugador) {
  const tipo = Math.random() < 0.75 ? "copa_completa" : "final";
  return { tipo };
}

// Generar un rival aleatorio de la división del jugador (de su misma liga o Brasil)
function obtenerRivalInternacional(jugador) {
  // Lista de todas las divisiones (Argentina y Brasil por ahora)
  const divisiones = ["primera-division-argentina", "serie-a-brasil"];
  const todosClubes = [];
  divisiones.forEach(div => {
    const clubes = CLUBES_POR_DIVISION[div] || [];
    todosClubes.push(...clubes);
  });
  // Filtrar el club del jugador
  const rivales = todosClubes.filter(c => c.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)];
}

// Minijuego Copa Completa (Secuencias progresivas con 20 bloques)
function minijuegoCopaCompleta(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const totalBloques = 20;
  
  // Generar los 20 botones en pantalla
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Copa Libertadores - Fase de Grupos!</h3>
      <p>Memorizá las secuencias de bloques que se iluminan y repetilas.</p>
      <div class="libertadores-grid" id="libertadores-grid"></div>
      <div class="secuencia-info" id="secuencia-info"></div>
      <button class="boton-iniciar-qte" id="btn-iniciar-secuencia">Comenzar</button>
    </div>
  `;
  
  const grid = document.getElementById("libertadores-grid");
  const info = document.getElementById("secuencia-info");
  const btnIniciar = document.getElementById("btn-iniciar-secuencia");
  
  // Crear los 20 bloques (grid de 5x4)
  grid.style.gridTemplateColumns = "repeat(5, 1fr)";
  grid.style.maxWidth = "500px";
  for (let i = 0; i < totalBloques; i++) {
    const div = document.createElement("div");
    div.className = "memoria-punto";
    div.dataset.index = i;
    grid.appendChild(div);
  }
  
  const bloques = grid.querySelectorAll(".memoria-punto");
  
  // Definir los patrones por partido (1,2,3 grupos; 4,5,6,7 eliminatoria)
  const partidos = [
    { nombre: "Fase de Grupos - Partido 1", longitud: 1 },
    { nombre: "Fase de Grupos - Partido 2", longitud: 2 },
    { nombre: "Fase de Grupos - Partido 3", longitud: 3 },
    { nombre: "Octavos de Final", longitud: 4 },
    { nombre: "Cuartos de Final", longitud: 5 },
    { nombre: "Semifinal", longitud: 6 },
    { nombre: "Final", longitud: 7 }
  ];
  
  let partidoActual = 0;
  let erroresGrupos = 0;
  let ganadosGrupos = 0;
  let faseActual = "grupos";
  
  // Función para generar una secuencia aleatoria de índices (sin repetir)
  function generarSecuencia(longitud) {
    const indices = [];
    const disponibles = Array.from({ length: totalBloques }, (_, i) => i);
    for (let i = 0; i < longitud; i++) {
      const idx = Math.floor(Math.random() * disponibles.length);
      indices.push(disponibles.splice(idx, 1)[0]);
    }
    return indices;
  }
  
  // Mostrar la secuencia actual y esperar que el usuario la repita
  function jugarPartido(longitud, callbackPartido) {
    const secuencia = generarSecuencia(longitud);
    let paso = 0;
    
    info.textContent = "Memorizá la secuencia...";
    btnIniciar.disabled = true;
    
    // Iluminar secuencia
    const intervalo = setInterval(() => {
      if (paso >= secuencia.length) {
        clearInterval(intervalo);
        info.textContent = "¡Repetí la secuencia!";
        // Activar clics
        bloques.forEach(bloque => {
          bloque.addEventListener("click", function handler() {
            const index = parseInt(this.dataset.index);
            // Si el bloque clickeado es el correcto en el orden
            const orden = secuencia.findIndex((val, idx) => val === index);
            // Lógica simplificada: vamos a ver si el usuario hace clic en el orden correcto
            // Simulamos que si hace clic en el orden correcto, se va marcando
            if (!this.classList.contains("usado")) {
              // Esta lógica necesita una variable de progreso
            }
          });
        });
        
        // Implementación simplificada: simplemente contamos los clics correctos
        // Vamos a usar un contador de aciertos
        let aciertos = 0;
        bloques.forEach(bloque => {
          bloque.addEventListener("click", function() {
            if (this.classList.contains("activo") && !this.classList.contains("usado")) {
              this.classList.add("usado");
              // Verificar si es el correcto (muy simplificado)
              // Para que funcione, debemos comparar con el orden de la secuencia
            }
          });
        });
        
        // Mejor: guardamos la secuencia y esperamos los clics en orden
        // Usaremos un array de clics del usuario
        let clicsUsuario = [];
        bloques.forEach(bloque => {
          bloque.addEventListener("click", function() {
            if (!this.classList.contains("usado")) {
              this.classList.add("usado");
              clicsUsuario.push(parseInt(this.dataset.index));
              if (clicsUsuario.length === secuencia.length) {
                const exito = secuencia.every((val, idx) => val === clicsUsuario[idx]);
                callbackPartido(exito);
              }
            }
          });
        });
      } else {
        // Iluminar el siguiente bloque de la secuencia
        bloques[secuencia[paso]].classList.add("iluminado");
        setTimeout(() => {
          bloques[secuencia[paso]].classList.remove("iluminado");
        }, 400);
        paso++;
      }
    }, 500);
  }
  
  // Arrancar el minijuego
  btnIniciar.addEventListener("click", () => {
    // Empezar con el primer partido
    iniciarSiguientePartido();
  });
  
  function iniciarSiguientePartido() {
    if (partidoActual >= partidos.length) {
      // Terminó toda la copa, ganó
      contenedor.innerHTML = "";
      callback(true);
      return;
    }
    
    const partido = partidos[partidoActual];
    // Mostrar cartel "Pasaste de ronda!" o "Listo?" antes de cada secuencia
    if (partidoActual > 0 && faseActual === "grupos") {
      info.textContent = "¡Pasaste de ronda!";
      setTimeout(() => {
        info.textContent = "Listo?";
        // Esperar al botón
        btnIniciar.disabled = false;
        btnIniciar.textContent = "Comenzar";
        btnIniciar.onclick = () => {
          btnIniciar.disabled = true;
          jugarPartido(partido.longitud, (exito) => {
            if (exito) {
              if (partidoActual < 2) { // primeros 3 partidos
                ganadosGrupos++;
                if (ganadosGrupos >= 2) {
                  // Clasifica a octavos
                  partidoActual = 2; // saltar al partido 3? No, vamos por partes
                  // Mejor: si ya ganó 2 de los primeros 3, pasa a fase eliminatoria (octavos)
                  faseActual = "eliminatoria";
                  partidoActual = 3; // octavos
                } else {
                  partidoActual++;
                }
              } else {
                // Fase eliminatoria: si gana, avanza
                partidoActual++;
              }
            } else {
              // Perdió
              if (partidoActual < 3) {
                erroresGrupos++;
                if (erroresGrupos >= 2) {
                  // Eliminado en fase de grupos
                  contenedor.innerHTML = "";
                  callback({ resultado: "eliminado", fase: "Fase de Grupos" });
                  return;
                } else {
                  partidoActual++;
                }
              } else {
                // Eliminado en fase eliminatoria
                const faseEliminacion = partidos[partidoActual].nombre;
                contenedor.innerHTML = "";
                callback({ resultado: "eliminado", fase: faseEliminacion });
                return;
              }
            }
            // Continuar con el siguiente partido
            iniciarSiguientePartido();
          });
        };
      }, 3000);
    } else {
      // Mostrar "Listo?" y botón Comenzar
      info.textContent = "Listo?";
      btnIniciar.disabled = false;
      btnIniciar.textContent = "Comenzar";
      btnIniciar.onclick = () => {
        btnIniciar.disabled = true;
        jugarPartido(partido.longitud, (exito) => {
          // Similar a arriba, pero sin la lógica de grupos (eliminatoria directa)
          if (exito) {
            partidoActual++;
          } else {
            const faseEliminacion = partidos[partidoActual].nombre;
            contenedor.innerHTML = "";
            callback({ resultado: "eliminado", fase: faseEliminacion });
            return;
          }
          iniciarSiguientePartido();
        });
      };
    }
  }
}

// Minijuego Final (BarraQTE)
function minijuegoBarraQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const tiempoMaximo = 20000; // 20 segundos
  const tiempoInicio = Date.now();
  let puntosBarra = 0;
  let intervaloAparicion;
  let intervaloGeneral;
  let terminado = false;

  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Final de la Copa Libertadores!</h3>
      <p>Presioná los botones correctos para llenar la barra. ¡Cuidado con los rojos y bordó!</p>
      <div class="barra-qte" id="barra-qte">
        <div class="barra-progreso" id="barra-progreso"></div>
      </div>
      <div class="zona-botones" id="zona-botones" style="position:relative; height:200px; background:#1a1a24; border-radius:8px;"></div>
      <div id="tiempo-restante">20s</div>
    </div>
  `;

  const zona = document.getElementById("zona-botones");
  const barra = document.getElementById("barra-progreso");
  const tiempoRestante = document.getElementById("tiempo-restante");

  // Actualizar barra
  function actualizarBarra() {
    barra.style.width = `${(puntosBarra / 20) * 100}%`;
    barra.style.background = puntosBarra >= 20 ? "#00ff00" : "#ff4444";
  }

  // Crear botones aleatorios (Rojo, Rosa, Bordo)
  function crearBoton() {
    const tipo = Math.random() < 0.7 ? "rojo" : (Math.random() < 0.5 ? "rosa" : "bordo");
    const btn = document.createElement("button");
    btn.className = `qte-boton ${tipo}`;
    btn.textContent = tipo === "rojo" ? "ROJO" : tipo === "rosa" ? "ROSA" : "BORDO";
    // Estilos
    btn.style.position = "absolute";
    btn.style.width = "60px";
    btn.style.height = "60px";
    btn.style.fontSize = "12px";
    btn.style.padding = "0";
    btn.style.background = tipo === "rojo" ? "#ff4444" : tipo === "rosa" ? "#ff69b4" : "#800000";
    btn.style.color = "#fff";
    // Posición aleatoria dentro de la zona (dejando 70px de margen)
    btn.style.left = `${Math.random() * (zona.clientWidth - 70)}px`;
    btn.style.top = `${Math.random() * (zona.clientHeight - 70)}px`;
    // Duración 0.6s
    setTimeout(() => {
      if (btn.parentNode) btn.remove();
    }, 600);
    
    btn.addEventListener("click", () => {
      if (terminado) return;
      if (tipo === "rojo") {
        puntosBarra += 5;
        if (puntosBarra >= 20) {
          terminado = true;
          clearInterval(intervaloAparicion);
          clearInterval(intervaloGeneral);
          contenedor.innerHTML = "";
          callback(true);
        }
      } else if (tipo === "rosa") {
        puntosBarra -= 10;
        if (puntosBarra < 0) {
          // Menos de 0 = derrota
          terminado = true;
          clearInterval(intervaloAparicion);
          clearInterval(intervaloGeneral);
          contenedor.innerHTML = "";
          callback(false);
        }
      } else if (tipo === "bordo") {
        terminado = true;
        clearInterval(intervaloAparicion);
        clearInterval(intervaloGeneral);
        contenedor.innerHTML = "";
        callback(false);
      }
      actualizarBarra();
    });

    zona.appendChild(btn);
  }

  // Iniciar aparición de botones (intervalo aleatorio, cada vez más corto)
  function iniciarBotones() {
    let delay = 1000; // empieza lento
    function loop() {
      if (terminado) return;
      crearBoton();
      delay = Math.max(200, delay * 0.9); // se acelera, mínimo 200ms
      intervaloAparicion = setTimeout(loop, delay);
    }
    loop();
  }

  // Temporizador de 20 segundos
  intervaloGeneral = setInterval(() => {
    const tiempoRestanteMs = tiempoMaximo - (Date.now() - tiempoInicio);
    const segundos = Math.max(0, Math.floor(tiempoRestanteMs / 1000));
    tiempoRestante.textContent = `${segundos}s`;
    if (tiempoRestanteMs <= 0) {
      terminado = true;
      clearInterval(intervaloAparicion);
      clearInterval(intervaloGeneral);
      contenedor.innerHTML = "";
      callback(false);
    }
  }, 100);

  actualizarBarra();
  iniciarBotones();
}

// Función principal para mostrar la Libertadores (según tipo)
function mostrarLibertadores(jugador, callback) {
  const sim = simularLibertadores(jugador);
  const rival = obtenerRivalInternacional(jugador);
  
  if (sim.tipo === "copa_completa") {
    minijuegoCopaCompleta((resultado) => {
      // resultado puede ser true, o {resultado:"eliminado", fase:"..."}
      if (resultado === true) {
        callback({ campeon: true, rival: rival });
      } else {
        callback({ campeon: false, fase: resultado.fase || "Eliminado" });
      }
    }, jugador, rival);
  } else {
    // Final directa: primero un rng si se juega la final o se pierde directo
    const juegaFinal = Math.random() < 0.5;
    if (!juegaFinal) {
      callback({ campeon: false, fase: "Final" }); // perdió la final sin jugar
    } else {
      minijuegoBarraQTE((exito) => {
        if (exito) {
          callback({ campeon: true, rival: rival });
        } else {
          callback({ campeon: false, fase: "Final" });
        }
      }, jugador, rival);
    }
  }
}

// Simular Sudamericana (para rival de Recopa)
function simularSudamericana(jugador) {
  // Como no la implementamos todavía, simplemente elegimos un campeón aleatorio de Sudamérica
  // Podría ser cualquier club que no sea el del jugador
  const rival = obtenerRivalInternacional(jugador);
  return { campeon: rival };
}

// Simular Recopa Sudamericana (campeón Libertadores vs campeón Sudamericana)
function simularRecopa(jugador, campeonLibertadores) {
  // Si el jugador ganó Libertadores, juega la Recopa
  // El rival es el campeón de la Sudamericana (aleatorio)
  const rival = simularSudamericana(jugador).campeon;
  return { rival: rival, jugar: true };
}

// Mostrar Recopa (usando un minijuego, por ejemplo BarraQTE o Memoria)
function mostrarRecopa(jugador, callback) {
  const rival = obtenerRivalInternacional(jugador);
  // Usamos la memoria o la barra, reutilizamos funciones
  // Decidimos usar BarraQTE para la Recopa
  minijuegoBarraQTE((exito) => {
    callback({ campeon: exito, rival: rival });
  }, jugador, rival);
}

// Función principal para integrar en el ciclo anual
function procesarInternacional(jugador) {
  // Primero vemos si clasificó a Libertadores
  if (!clasificaLibertadores(jugador)) {
    return null;
  }
  
  // Simulamos la Libertadores
  mostrarLibertadores(jugador, (resultadoLibertadores) => {
    // Guardar resultado
    if (!jugador.resultadoInternacional) jugador.resultadoInternacional = {};
    jugador.resultadoInternacional.libertadores = resultadoLibertadores;
    
    // Sumar título si ganó
    if (resultadoLibertadores.campeon) {
      jugador.stats.titulos = (jugador.stats.titulos || 0) + 1;
    }
    
    // Si ganó Libertadores, clasifica a Recopa
    if (resultadoLibertadores.campeon) {
      // Simular Recopa contra campeón Sudamericana
      const recopa = simularRecopa(jugador, resultadoLibertadores.rival);
      // Mostrar Recopa (minijuego)
      mostrarRecopa(jugador, (resultadoRecopa) => {
        jugador.resultadoInternacional.recopa = resultadoRecopa;
        if (resultadoRecopa.campeon) {
          jugador.stats.titulos++;
        }
        Estado.guardar();
        // Continuar con el resumen (llamar a una función global)
      });
    } else {
      Estado.guardar();
      // Continuar
    }
  });
}