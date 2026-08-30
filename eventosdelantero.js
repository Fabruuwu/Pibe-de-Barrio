/**
 * eventosdelantero.js
 * -----------------------------------------
 * Simulación de competencias y minijuegos.
 * Aquí se define cómo se decide la liga argentina y los minijuegos.
 */

// ---------- CONSTANTES ----------
const LIGA_ARGENTINA = "liga-profesional-argentina";
const DIVISION_ARGENTINA = "primera-division-argentina";

// Probabilidades base por categoría de club (en %)
const PROB_CATEGORIA = {
  grande: 40,
  mediano: 30,
  chico: 20,
  diminuto: 10
};

// Bonus de probabilidad según media del jugador
const BONUS_MEDIA = [
  { min: 0, max: 55, bonus: 0 },
  { min: 56, max: 65, bonus: 1 },
  { min: 66, max: 75, bonus: 3 },
  { min: 76, max: 85, bonus: 5 },
  { min: 86, max: 95, bonus: 7 },
  { min: 96, max: 99, bonus: 10 }
];

// ---------- SIMULACIÓN DE LIGA ----------
function simularLiga(jugador) {
  // Obtener todos los clubes de la división argentina
  const clubes = CLUBES_POR_DIVISION[DIVISION_ARGENTINA];
  const clubJugador = jugador.club;
  
  // Calcular probabilidad base de cada club
  let totalProb = 0;
  const probClubes = clubes.map(club => {
    let prob = PROB_CATEGORIA[club.categoria] / clubes.filter(c => c.categoria === club.categoria).length;
    if (club.id === clubJugador) {
      // Sumar bonus del jugador
      const media = jugador.media;
      const bonus = BONUS_MEDIA.find(rango => media >= rango.min && media <= rango.max)?.bonus || 0;
      prob += bonus;
    }
    totalProb += prob;
    return { club: club, prob: prob };
  });
  
  // Elegir campeón según probabilidades (normalizado)
  let random = Math.random() * totalProb;
  let campeon = null;
  for (let item of probClubes) {
    random -= item.prob;
    if (random <= 0) {
      campeon = item.club;
      break;
    }
  }
  if (!campeon) campeon = probClubes[probClubes.length - 1].club;
  
  // Verificar si el campeón es el equipo del jugador
  const esCampeon = campeon.id === clubJugador;
  
  if (!esCampeon) {
    // Si no es campeón, asignar una posición random (2 a 18)
    const posicion = Math.floor(Math.random() * 17) + 2; // 2-18
    return { esCampeon: false, posicion: posicion, subcampeon: false };
  }
  
  // Si es campeón, decidir si es directo o minijuego
  const resultado = { esCampeon: true, posicion: 1, subcampeon: false };
  if (Math.random() < 0.6) {
    // 60% campeón directo
    return resultado;
  } else {
    // 40% minijuego
    return { esCampeon: true, posicion: 1, subcampeon: false, minijuego: true };
  }
}

// ---------- MINIJUEGOS ----------
function mostrarMinijuego(callback) {
  // Elegir un minijuego al azar (0,1,2)
  const tipo = Math.floor(Math.random() * 3);
  if (tipo === 0) minijuegoPenal(callback);
  else if (tipo === 1) minijuegoMemoria(callback);
  else minijuegoQTE(callback);
}

// Minijuego 1: Penal
function minijuegoPenal(callback) {
  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = `
    <div class="competition-card">
      <h3>¡Penal decisivo!</h3>
      <p>Elegí un palo para patear y salir campeón.</p>
      <div class="minijuego-botones">
        <button class="opcion-penal" data-lado="izquierda">Izquierda</button>
        <button class="opcion-penal" data-lado="centro">Centro</button>
        <button class="opcion-penal" data-lado="derecha">Derecha</button>
      </div>
    </div>
  `;
  const correcta = ["izquierda", "centro", "derecha"][Math.floor(Math.random() * 3)];
  const botones = contenedor.querySelectorAll(".opcion-penal");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const elegido = btn.dataset.lado;
      const exito = elegido === correcta;
      contenedor.innerHTML = "";
      callback(exito);
    });
  });
}

// Minijuego 2: Memoria
function minijuegoMemoria(callback) {
  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = `
    <div class="competition-card">
      <h3>¡La jugada preparada!</h3>
      <p>Memorizá la secuencia y reproducila.</p>
      <div class="memoria-grid"></div>
    </div>
  `;
  const grid = contenedor.querySelector(".memoria-grid");
  const puntos = [];
  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    div.className = "memoria-punto";
    div.dataset.index = i;
    grid.appendChild(div);
    puntos.push(div);
  }
  
  // Generar secuencia aleatoria de 4 puntos (índices 0-4)
  const secuencia = [];
  for (let i = 0; i < 4; i++) {
    secuencia.push(Math.floor(Math.random() * 5));
  }
  
  // Resaltar secuencia
  let paso = 0;
  const intervalo = setInterval(() => {
    if (paso >= secuencia.length) {
      clearInterval(intervalo);
      // Habilitar clics
      puntos.forEach(p => p.classList.add("activo"));
      let ordenUsuario = [];
      puntos.forEach(p => {
        p.addEventListener("click", function() {
          if (this.classList.contains("activo") && !this.classList.contains("usado")) {
            this.classList.add("usado");
            ordenUsuario.push(parseInt(this.dataset.index));
            if (ordenUsuario.length === secuencia.length) {
              // Verificar
              const exito = secuencia.every((val, idx) => val === ordenUsuario[idx]);
              contenedor.innerHTML = "";
              callback(exito);
            }
          }
        });
      });
    } else {
      const idx = secuencia[paso];
      puntos[idx].classList.add("iluminado");
      setTimeout(() => {
        puntos[idx].classList.remove("iluminado");
      }, 400);
      paso++;
    }
  }, 500);
}

// Minijuego 3: QTE (3 botones rápidos)
function minijuegoQTE(callback) {
  const contenedor = document.getElementById("competition-container");
  contenedor.innerHTML = `
    <div class="competition-card">
      <h3>¡Slalom final!</h3>
      <p>Hacé clic en el botón cuando aparezca, ¡rápido!</p>
      <div class="qte-area"></div>
    </div>
  `;
  const area = contenedor.querySelector(".qte-area");
  let exitos = 0;
  const total = 3;
  
  function lanzarSiguiente() {
    area.innerHTML = "";
    if (exitos >= total) {
      contenedor.innerHTML = "";
      callback(true);
      return;
    }
    const boton = document.createElement("button");
    boton.className = "qte-boton";
    boton.textContent = "¡AHORA!";
    area.appendChild(boton);
    
    const timeout = setTimeout(() => {
      boton.remove();
      callback(false);
    }, 1000);
    
    boton.addEventListener("click", () => {
      clearTimeout(timeout);
      exitos++;
      lanzarSiguiente();
    });
  }
  lanzarSiguiente();
}

// ---------- RESULTADO EN PANTALLA ----------
function mostrarResultadoLiga(resultado, callback) {
  const contenedor = document.getElementById("competition-container");
  if (!resultado.esCampeon) {
    // No campeón: mostrar posición
    contenedor.innerHTML = `
      <div class="competition-card">
        <p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> de la liga.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
    const btn = contenedor.querySelector(".boton-continuar");
    btn.addEventListener("click", () => {
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      callback(resultado);
    });
  } else if (resultado.subcampeon) {
    // Subcampeón
    contenedor.innerHTML = `
      <div class="competition-card subcampeon">
        <p>Subcampeón 🥈</p>
        <p>El sueño se escurrió entre los dedos en el último suspiro.</p>
        <button class="boton-continuar">Continuar</button>
      </div>
    `;
    const btn = contenedor.querySelector(".boton-continuar");
    btn.addEventListener("click", () => {
      contenedor.innerHTML = "";
      contenedor.hidden = true;
      callback(resultado);
    });
  } else {
    // Campeón: cartel dorado (sin minijuego)
    if (!resultado.minijuego) {
      // Campeón directo
      contenedor.innerHTML = `
        <div class="competition-card campeon">
          <h2>¡CAMPEÓN!</h2>
          <img src="Imagenes/Trofeos/LigaArgentina.png" alt="Copa">
          <p>¡DALE CAMPEÓN! La locura es total en las tribunas.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    } else {
      // Si es minijuego, lo mostramos y luego damos el resultado
      contenedor.innerHTML = `
        <div class="competition-card">
          <p>¡Tu equipo llegó a la final! Para ser campeón, jugá este minijuego:</p>
          <button class="boton-jugar-minijuego">¡Jugar!</button>
        </div>
      `;
      const btnJugar = contenedor.querySelector(".boton-jugar-minijuego");
      btnJugar.addEventListener("click", () => {
        mostrarMinijuego((exito) => {
          if (exito) {
            // Campeón tras minijuego
            contenedor.innerHTML = `
              <div class="competition-card campeon">
                <h2>¡CAMPEÓN!</h2>
                <img src="Imagenes/Trofeos/LigaArgentina.png" alt="Copa">
                <p>¡DALE CAMPEÓN! La locura es total en las tribunas.</p>
                <button class="boton-continuar">Continuar</button>
              </div>
            `;
            contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
              contenedor.innerHTML = "";
              contenedor.hidden = true;
              callback({ esCampeon: true, subcampeon: false });
            });
          } else {
            // Perdió minijuego -> Subcampeón
            contenedor.innerHTML = `
              <div class="competition-card subcampeon">
                <p>Subcampeón 🥈</p>
                <p>El sueño se escurrió entre los dedos en el último suspiro.</p>
                <button class="boton-continuar">Continuar</button>
              </div>
            `;
            contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
              contenedor.innerHTML = "";
              contenedor.hidden = true;
              callback({ esCampeon: false, subcampeon: true, posicion: 2 });
            });
          }
        });
      });
    }
    if (contenedor.querySelector(".boton-continuar")) {
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        callback(resultado);
      });
    }
  }
}