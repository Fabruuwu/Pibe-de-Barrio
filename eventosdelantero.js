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
  { min: 56, max: 65, bonus: 2 },
  { min: 66, max: 75, bonus: 6 },
  { min: 76, max: 85, bonus: 10 },
  { min: 86, max: 95, bonus: 14 },
  { min: 96, max: 99, bonus: 19 }
];

// ---------- SIMULACIÓN DE LIGA ----------
function simularLiga(jugador) {
  const clubes = CLUBES_POR_DIVISION[DIVISION_ARGENTINA];
  const clubJugador = jugador.club;
  
  let totalProb = 0;
  const probClubes = clubes.map(club => {
    let prob = PROB_CATEGORIA[club.categoria] / clubes.filter(c => c.categoria === club.categoria).length;
    if (club.id === clubJugador) {
      const media = jugador.media;
      const bonus = BONUS_MEDIA.find(rango => media >= rango.min && media <= rango.max)?.bonus || 0;
      prob += bonus;
    }
    totalProb += prob;
    return { club: club, prob: prob };
  });
  
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
  
  const esCampeon = campeon.id === clubJugador;
  
  if (!esCampeon) {
    const posicion = Math.floor(Math.random() * 17) + 2;
    return { esCampeon: false, posicion: posicion, subcampeon: false };
  }
  
  const resultado = { esCampeon: true, posicion: 1, subcampeon: false };
  if (Math.random() < 0.6) {
    return resultado;
  } else {
    return { esCampeon: true, posicion: 1, subcampeon: false, minijuego: true };
  }
}

// ---------- HELPER PARA OBTENER UN RIVAL ALEATORIO ----------
function obtenerClubRival(jugador) {
  const clubes = CLUBES_POR_DIVISION[DIVISION_ARGENTINA];
  // Filtrar todos excepto el club del jugador
  const rivales = clubes.filter(c => c.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)];
}

// ---------- CABECERA DE MINIJUEGOS ----------
function crearCabeceraMinijuego(jugador, rival) {
  const clubJugador = NOMBRES_CLUBES[jugador.club];
  const escudoJugador = clubJugador ? clubJugador.escudo : "";
  const escudoRival = rival ? rival.escudo : "";
  
  return `
    <div class="minijuego-marcador">
      <div class="equipo">
        <img src="${escudoJugador}" alt="Tu club" onerror="this.hidden=true">
        <span>${clubJugador ? clubJugador.nombre : "Tu club"}</span>
      </div>
      <span class="en-vivo">🔴 EN VIVO</span>
      <div class="equipo">
        <img src="${escudoRival}" alt="Rival" onerror="this.hidden=true">
        <span>${rival ? rival.nombre : "Rival"}</span>
      </div>
    </div>
  `;
}

// ---------- MINIJUEGOS ----------
function mostrarMinijuego(callback) {
  const jugador = Estado.obtener();
  const rival = obtenerClubRival(jugador);
  const tipo = Math.floor(Math.random() * 3);
  if (tipo === 0) minijuegoPenal(callback, jugador, rival);
  else if (tipo === 1) minijuegoMemoria(callback, jugador, rival);
  else minijuegoQTE(callback, jugador, rival);
}

// Minijuego 1: Penal
function minijuegoPenal(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card minijuego-penal">
      <div class="arco">
        <span class="travesaño"></span>
        <span class="poste poste-izq"></span>
        <span class="poste poste-der"></span>
        <span class="red"></span>
        <span class="pelota">⚽</span>
      </div>
      <p>¡Penal decisivo! Elegí un palo para patear y salir campeón.</p>
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
function minijuegoMemoria(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡La jugada preparada!</h3>
      <p>Memorizá la secuencia de pases y reproducila en orden.</p>
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
  
  const secuencia = [];
  for (let i = 0; i < 4; i++) {
    secuencia.push(Math.floor(Math.random() * 5));
  }
  
  let paso = 0;
  const intervalo = setInterval(() => {
    if (paso >= secuencia.length) {
      clearInterval(intervalo);
      puntos.forEach(p => p.classList.add("activo"));
      let ordenUsuario = [];
      puntos.forEach(p => {
        p.addEventListener("click", function() {
          if (this.classList.contains("activo") && !this.classList.contains("usado")) {
            this.classList.add("usado");
            ordenUsuario.push(parseInt(this.dataset.index));
            if (ordenUsuario.length === secuencia.length) {
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

// Minijuego 3: QTE (con instrucciones y retraso)
function minijuegoQTE(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card">
      <h3>¡Slalom final!</h3>
      <p>Cuando aparezca el botón rojo, hacé clic lo más rápido posible.</p>
      <p>Tenés <strong>0.8 segundos</strong> para reaccionar. ¡3 defensores te esperan!</p>
      <button class="boton-iniciar-qte">Iniciar</button>
      <div class="qte-area" style="display:none;"></div>
    </div>
  `;
  const botonIniciar = contenedor.querySelector(".boton-iniciar-qte");
  const area = contenedor.querySelector(".qte-area");
  let exitos = 0;
  const total = 3;

  botonIniciar.addEventListener("click", () => {
    botonIniciar.style.display = "none";
    area.style.display = "block";
    lanzarSiguiente();
  });

  function lanzarSiguiente() {
    area.innerHTML = "";
    if (exitos >= total) {
      contenedor.innerHTML = "";
      callback(true);
      return;
    }

    // Instrucción previa (se muestra brevemente)
    const aviso = document.createElement("div");
    aviso.className = "qte-aviso";
    aviso.textContent = `Defensor ${exitos + 1} de ${total}`;
    area.appendChild(aviso);

    setTimeout(() => {
      aviso.remove();
      const boton = document.createElement("button");
      boton.className = "qte-boton";
      boton.textContent = "¡AHORA!";
      area.appendChild(boton);

      // El botón tiene 0.8 segundos para ser clickeado
      const timeout = setTimeout(() => {
        boton.remove();
        callback(false);
      }, 800);

      boton.addEventListener("click", () => {
        clearTimeout(timeout);
        exitos++;
        lanzarSiguiente();
      });
    }, 600); // Pequeño retraso antes de que aparezca el botón
  }
}

// ---------- RESULTADO EN PANTALLA (con cabecera) ----------
function mostrarResultadoLiga(resultado, callback) {
  const contenedor = document.getElementById("competition-container");
  const jugador = Estado.obtener();
  const rival = obtenerClubRival(jugador);
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  
  if (!resultado.esCampeon) {
    contenedor.innerHTML = `
      ${cabecera}
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
    contenedor.innerHTML = `
      ${cabecera}
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
    if (!resultado.minijuego) {
      contenedor.innerHTML = `
        ${cabecera}
        <div class="competition-card campeon">
          <h2>¡CAMPEÓN!</h2>
          <img src="Trofeos/LigaArgentina.png" alt="Copa">
          <p>¡DALE CAMPEÓN! La locura es total en las tribunas.</p>
          <button class="boton-continuar">Continuar</button>
        </div>
      `;
    } else {
      contenedor.innerHTML = `
        ${cabecera}
        <div class="competition-card">
          <p>¡Tu equipo llegó a la final! Para ser campeón, jugá este minijuego:</p>
          <button class="boton-jugar-minijuego">¡Jugar!</button>
        </div>
      `;
      const btnJugar = contenedor.querySelector(".boton-jugar-minijuego");
      btnJugar.addEventListener("click", () => {
        mostrarMinijuego((exito) => {
          if (exito) {
            contenedor.innerHTML = `
              ${cabecera}
              <div class="competition-card campeon">
                <h2>¡CAMPEÓN!</h2>
                <img src="Trofeos/LigaArgentina.png" alt="Copa">
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
            contenedor.innerHTML = `
              ${cabecera}
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