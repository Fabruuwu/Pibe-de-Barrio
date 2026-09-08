/**
 * minijuegos.js
 * -----------------------------------------
 * Minijuegos de partidos y competencias, organizados por posición.
 * Este archivo es la fusión de los antiguos:
 *   - eventosdelantero.js (simulación de liga + cabecera + minijuegos genéricos)
 *   - eventosenganche.js  (minijuegos del Enganche)
 *   - eventoscentral.js   (minijuegos del Def. Central)
 *   - eventosarquero.js   (minijuegos del Arquero)
 * No se modificó ninguna función: incluye el mismo código, mismos nombres.
 * -----------------------------------------
 */


// ============================================
// SECCIÓN: eventosdelantero.js (liga, cabecera común, minijuegos genéricos)
// ============================================
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
  
  const contexto = window.CONTEXTO_PARTIDO || {};
  const detalleTorneo = contexto.torneo ? `<span class="minijuego-contexto">${contexto.torneo}${contexto.fase ? ` · ${contexto.fase}` : ""}</span>` : "";
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
      ${detalleTorneo}
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

function mostrarResolucionMinijuego(contenedor, cabecera, exito, texto, callback) {
  contenedor.innerHTML = `
    ${cabecera}
    <div class="competition-card ${exito ? "campeon" : "subcampeon"} resultado-minijuego">
      <span class="resultado-minijuego__icono">${exito ? "⚽" : "💥"}</span>
      <h3>${exito ? "¡Jugada perfecta!" : "Se escapó por poco"}</h3>
      <p>${texto}</p>
      <button class="boton-continuar">Continuar</button>
    </div>
  `;
  contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
    contenedor.innerHTML = "";
    callback(exito);
  });
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
      const pegada = jugador.stats.pegada || 50;
      const exito = elegido === correcta || Math.random() < Math.max(0.08, (pegada - 42) / 160);
      const texto = exito
        ? "La clavaste con personalidad. La hinchada explota detrás del arco."
        : "El arquero te adivinó la intención. Todavía queda mucho partido por jugar.";
      mostrarResolucionMinijuego(contenedor, cabecera, exito, texto, callback);
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
      <p>Memorizá la secuencia de pases y reproducila en orden (sin repetir el mismo botón).</p>
      <div class="memoria-grid"></div>
    </div>
  `;
  const grid = contenedor.querySelector(".memoria-grid");
  grid.style.gridTemplateColumns = "repeat(5, 1fr)"; // 5 columnas, 2 filas = 10 botones
  grid.style.maxWidth = "400px";

  const puntos = [];
  for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    div.className = "memoria-punto";
    div.dataset.index = i;
    grid.appendChild(div);
    puntos.push(div);
  }
  
  // Tablero corto: más secuencia y menos tiempo de lectura.
  const secuencia = [];
  const disponibles = [0,1,2,3,4,5,6,7,8,9];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * disponibles.length);
    secuencia.push(disponibles.splice(idx, 1)[0]);
  }
  
  let paso = 0;
  const intervaloMemoria = Math.min(600, 260 + (jugador.stats.gambeta || 50) * 3);
  // Los tableros chicos exigen una lectura más rápida.
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
              const texto = exito
                ? "Leíste la jugada completa y dejaste a todos mirando."
                : "La presión te hizo perder el último pase de la secuencia.";
              mostrarResolucionMinijuego(contenedor, cabecera, exito, texto, callback);
            }
          }
        });
      });
    } else {
      const idx = secuencia[paso];
      puntos[idx].classList.add("iluminado");
      setTimeout(() => {
        puntos[idx].classList.remove("iluminado");
      }, 350); // también más rápido
      paso++;
    }
  }, intervaloMemoria);
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
      <p>Tenés <strong>0.5 segundos</strong> para reaccionar. ¡3 defensores te esperan!</p>
      <button class="boton-iniciar-qte">Iniciar</button>
      <div class="qte-area" style="display:none; position:relative; min-height:150px;"></div>
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
    aviso.style.position = "absolute";
    aviso.style.top = "10px";
    aviso.style.left = "10px";
    area.appendChild(aviso);

    // Espera aleatoria antes de mostrar el botón (300-900ms)
    const delay = Math.floor(Math.random() * 600) + 300;
    setTimeout(() => {
      aviso.remove();
      const boton = document.createElement("button");
      boton.className = "qte-boton";
      boton.textContent = "¡AHORA!";
      boton.style.position = "absolute";
      boton.style.width = "60px";
      boton.style.height = "60px";
      boton.style.fontSize = "16px";
      boton.style.padding = "0";
      // Posición aleatoria dentro del área (max 80% - 60px)
      const maxX = area.clientWidth - 70;
      const maxY = area.clientHeight - 70;
      boton.style.left = `${Math.random() * maxX}px`;
      boton.style.top = `${Math.random() * maxY}px`;
      area.appendChild(boton);

      // La velocidad del jugador amplía levemente el margen de reacción.
      const tiempoReaccion = Math.round(350 + Math.min(400, (jugador.stats.velocidad || 50) * 4));
      const timeout = setTimeout(() => {
        mostrarResolucionMinijuego(contenedor, cabecera, false, "El defensor llegó antes y la jugada se cortó.", callback);
      }, tiempoReaccion);

      boton.addEventListener("click", () => {
        clearTimeout(timeout);
        exitos++;
        if (exitos >= total) {
          mostrarResolucionMinijuego(contenedor, cabecera, true, "Dejaste a los tres defensores en el camino. Una locura.", callback);
        } else {
          lanzarSiguiente();
        }
      });
    }, delay);
  }
}

// ---------- RESULTADO EN PANTALLA (con cabecera) ----------
function mostrarResultadoLiga(resultado, callback) {
  window.CONTEXTO_PARTIDO = { torneo: "Liga Profesional", fase: resultado.esCampeon ? "Definición del título" : "Fin de temporada" };
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
      contenedor.querySelector(".boton-continuar").addEventListener("click", () => {
        contenedor.innerHTML = "";
        contenedor.hidden = true;
        callback(resultado);
      });
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
  }
}

// ============================================
// SECCIÓN: eventosenganche.js
// ============================================

function resultadoEnganche(contenedor, cabecera, exito, titulo, texto, callback) {
  contenedor.innerHTML = `${cabecera}<div class="competition-card resultado-minijuego ${exito ? "campeon" : "subcampeon"}">
    <span class="resultado-minijuego__icono">${exito ? "🧠" : "💢"}</span><h3>${titulo}</h3><p>${texto}</p>
    <button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => callback(exito);
}

function minijuegoLecturaDeJuego(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container");
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const etapas = [
    ["Fase de grupos · Partido 1", 1, false], ["Fase de grupos · Partido 2", 2, false],
    ["Fase de grupos · Partido 3", 3, false], ["Octavos de final", 4, true],
    ["Cuartos de final", 5, true], ["Semifinal", 6, true], ["Final", 7, true]
  ];
  // Cerebro y liderazgo dan más tiempo de lectura, no menos.
  const pausa = Math.min(850, 280 + ((jugador.stats.cerebro || 50) + (jugador.stats.liderazgo || 50)) * 3);
  let etapa = 0, ganadosGrupos = 0, errores = 0;
  contenedor.innerHTML = `${cabecera}<div class="competition-card minijuego-tactico"><span class="badge-copa">LIBERTADORES</span>
    <h3 id="titulo-lectura">Lectura de juego</h3><p id="instruccion-lectura">Encontrá los pases que rompen líneas.</p>
    <div class="libertadores-grid tablero-tactico" id="tablero-tactico"></div><div id="estado-lectura" class="estado-minijuego"></div>
    <button class="boton-jugar-minijuego" id="iniciar-lectura">Analizar la jugada</button></div>`;
  const tablero = contenedor.querySelector("#tablero-tactico");
  for (let i = 0; i < 20; i++) tablero.insertAdjacentHTML("beforeend", `<button class="memoria-punto" data-i="${i}" aria-label="Zona ${i + 1}"></button>`);
  const bloques = [...tablero.children], titulo = contenedor.querySelector("#titulo-lectura"), estado = contenedor.querySelector("#estado-lectura"), iniciar = contenedor.querySelector("#iniciar-lectura");

  function jugarEtapa() {
    const [nombre, longitud, eliminatoria] = etapas[etapa];
    titulo.textContent = `Libertadores · ${nombre}`;
    const disponibles = Array.from({ length: 20 }, (_, i) => i);
    const secuencia = Array.from({ length: longitud }, () => disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0]);
    let paso = 0, entrada = [];
    bloques.forEach(b => { b.className = "memoria-punto"; b.disabled = true; });
    estado.textContent = `Patrón de ${longitud} pase${longitud > 1 ? "s" : ""}`;
    const timer = setInterval(() => {
      bloques.forEach(b => b.classList.remove("iluminado"));
      if (paso === secuencia.length) {
        clearInterval(timer); bloques.forEach(b => b.disabled = false); estado.textContent = "Repetí la secuencia"; return;
      }
      bloques[secuencia[paso++]].classList.add("iluminado");
    }, pausa);
    bloques.forEach(b => b.onclick = () => {
      if (b.disabled) return;
      b.disabled = true; b.classList.add("usado"); entrada.push(Number(b.dataset.i));
      if (entrada.length !== secuencia.length) return;
      const exito = entrada.every((valor, indice) => valor === secuencia[indice]);
      bloques.forEach(x => x.disabled = true);
      if (exito) { if (!eliminatoria) ganadosGrupos++; etapa++; }
      else if (!eliminatoria) { errores++; etapa++; }
      if (!exito && eliminatoria) return resultadoEnganche(contenedor, cabecera, false, "Pase interceptado", "El rival cortó la contra y te dejó fuera de la copa.", () => callback(false, nombre));
      if (etapa === 3 && (ganadosGrupos < 2 || errores > 2)) return resultadoEnganche(contenedor, cabecera, false, "No alcanzó", "La fase de grupos fue demasiado exigente esta vez.", () => callback(false, "Fase de Grupos"));
      if (etapa === etapas.length) return resultadoEnganche(contenedor, cabecera, true, "¡La copa es tuya!", "Leíste cada partido como un estratega.", () => callback(true));
      iniciar.hidden = false; iniciar.textContent = "Siguiente partido"; estado.textContent = exito ? "Lectura perfecta." : "Un error, todavía seguís con vida.";
    });
  }
  iniciar.onclick = () => { iniciar.hidden = true; jugarEtapa(); };
}

function minijuegoPaseFiltrado(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container"), cabecera = crearCabeceraMinijuego(jugador, rival);
  const teclas = ["W", "A", "S", "D"], secuencia = Array.from({ length: 5 }, () => teclas[Math.floor(Math.random() * teclas.length)]);
  let paso = 0;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><span class="badge-copa">SUDAMERICANA · 80'</span><h3>Pase filtrado</h3><p>Rompé líneas siguiendo la secuencia.</p><div class="qte-secuencia" id="qte-pase"></div><div class="teclas-qte" id="teclas-pase"></div></div>`;
  const visor = contenedor.querySelector("#qte-pase"); visor.textContent = secuencia.map((x, i) => i === 0 ? x : "·").join(" ");
  teclas.forEach(tecla => { const boton = document.createElement("button"); boton.textContent = tecla; boton.className = "tecla-qte"; boton.onclick = () => {
    if (tecla !== secuencia[paso]) return resultadoEnganche(contenedor, cabecera, false, "Te cerraron el camino", "El mediocampo rival anticipó tu pase.", callback);
    paso++; visor.textContent = secuencia.map((x, i) => i < paso ? "✓" : i === paso ? x : "·").join(" ");
    if (paso === secuencia.length) resultadoEnganche(contenedor, cabecera, true, "Pase entre líneas", "Dejaste al 9 mano a mano con el arquero.", callback);
  }; contenedor.querySelector("#teclas-pase").appendChild(boton); });
}

function minijuegoBombazo(callback, jugador, rival, titulo = "El bombazo") {
  const contenedor = document.getElementById("competition-container"), cabecera = crearCabeceraMinijuego(jugador, rival);
  const ancho = Math.min(36, 14 + Math.floor((jugador.stats.pegada || 50) / 5)); let posicion = 0, direccion = 1, activo = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><h3>${titulo}</h3><p>Mantené la calma y soltá en la zona violeta.</p><div class="medidor-potencia"><span class="zona-perfecta" style="left:${50 - ancho / 2}%;width:${ancho}%"></span><span class="cursor-potencia" id="cursor-potencia"></span></div><button class="boton-jugar-minijuego" id="disparar-potencia">Iniciar medición</button></div>`;
  const cursor = contenedor.querySelector("#cursor-potencia"), boton = contenedor.querySelector("#disparar-potencia"); let loop;
  boton.onclick = () => { if (!activo) { activo = true; boton.textContent = "¡Patear!"; loop = setInterval(() => { posicion += direccion * 2.4; if (posicion >= 100 || posicion <= 0) direccion *= -1; cursor.style.left = `${posicion}%`; }, 24); } else { clearInterval(loop); const exito = Math.abs(posicion - 50) <= ancho / 2; resultadoEnganche(contenedor, cabecera, exito, exito ? "¡Al ángulo!" : "Se fue por muy poco", exito ? "El remate entró limpio en el rincón." : "La pelota no encontró la zona de definición.", callback); } };
}

function jugarSudamericanaEnganche(callback, jugador, rival) { minijuegoPaseFiltrado(ok => ok ? minijuegoBombazo(callback, jugador, rival) : callback(false), jugador, rival); }
function jugarRecopaEnganche(callback, jugador, rival) { minijuegoLecturaCorta(ok => ok ? minijuegoBombazo(callback, jugador, rival, "El tiro libre decisivo") : callback(false), jugador, rival); }
function minijuegoLecturaCorta(callback, jugador, rival) {
  const contenedor = document.getElementById("competition-container"), cabecera = crearCabeceraMinijuego(jugador, rival);
  const disponibles = Array.from({ length: 9 }, (_, i) => i);
  const secuencia = Array.from({ length: 6 }, () => disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0]); let entrada = [];
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><h3>La pausa</h3><p>Memorizá seis toques para dormir el partido.</p><div class="grid-corto" id="grid-pausa"></div><button class="boton-jugar-minijuego" id="ver-pausa">Ver secuencia</button></div>`;
  const grid = contenedor.querySelector("#grid-pausa"); for(let i=0;i<9;i++) grid.insertAdjacentHTML("beforeend", `<button class="memoria-punto" data-i="${i}"></button>`);
  const botones = [...grid.children], ver = contenedor.querySelector("#ver-pausa");
  ver.onclick = () => {
    ver.hidden = true;
    let p = 0;
    const intervalo = setInterval(() => {
      botones.forEach(x => x.classList.remove("iluminado"));
      if (p === 6) { clearInterval(intervalo); botones.forEach(x => x.disabled = false); return; }
      botones[secuencia[p++]].classList.add("iluminado");
    }, 300);
  };
  botones.forEach(b => {
    b.disabled = true;
    b.onclick = () => {
      entrada.push(+b.dataset.i);
      b.disabled = true;
      if (entrada.length === 6) {
        const ok = entrada.every((x, i) => x === secuencia[i]);
        resultadoEnganche(contenedor, cabecera, ok, ok ? "La pelota es tuya" : "El caos ganó", ok ? "Manejaste los tiempos como un crack." : "Perdiste la posesión en el momento clave.", callback);
      }
    };
  });
}

// ============================================
// SECCIÓN: eventoscentral.js
// ============================================

function resultadoCentral(contenedor, cabecera, exito, titulo, texto, callback) {
  contenedor.innerHTML = `${cabecera}<div class="competition-card resultado-minijuego ${exito ? "campeon" : "subcampeon"}"><span class="resultado-minijuego__icono">${exito ? "🛡️" : "💥"}</span><h3>${titulo}</h3><p>${texto}</p><button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => callback(exito);
}

function minijuegoDueloAereo(callback, jugador, rival, dificultad = 1, titulo = "Duelo aéreo constante") {
  const contenedor = document.getElementById("competition-container"), cabecera = crearCabeceraMinijuego(jugador, rival);
  const margen = Math.min(42, 14 + ((jugador.stats.resistencia || 50) + (jugador.stats.liderazgo || 50)) / 6); let ganados = 0, ronda = 0, activo = false;
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><span class="badge-copa">LIBERTADORES</span><h3>${titulo}</h3><p>Frená el círculo cuando llegue a la zona de impacto. Ganá 2 de 3.</p><div class="duelo-aereo"><span class="circulo-objetivo" style="width:${margen}%;height:${margen}%"></span><span class="circulo-timing" id="circulo-timing"></span></div><div class="estado-minijuego" id="estado-aereo">Duelos ganados: 0/2</div><button class="boton-jugar-minijuego" id="saltar-aereo">Saltar</button></div>`;
  const circulo = contenedor.querySelector("#circulo-timing"), boton = contenedor.querySelector("#saltar-aereo"), estado = contenedor.querySelector("#estado-aereo"); let tamano = 100, loop;
  function iniciar() { activo = true; boton.textContent = "¡Cabezazo!"; tamano = 100; const velocidad = 1.15 + dificultad * .75; loop = setInterval(() => { tamano -= velocidad; circulo.style.width = `${Math.max(0, tamano)}%`; circulo.style.height = `${Math.max(0, tamano)}%`; if (tamano <= 0) resolver(false); }, 18); }
  function resolver(acierto) { clearInterval(loop); activo = false; ronda++; if(acierto) ganados++; estado.textContent = `Duelos ganados: ${ganados}/2 · Intento ${ronda}/3`; if(ganados >= 2) return resultadoCentral(contenedor,cabecera,true,"Ganaste arriba","No pudieron con tu presencia en el área.",callback); if(ronda === 3) return resultadoCentral(contenedor,cabecera,false,"Centro venenoso","El rival ganó el último duelo.",callback); boton.textContent="Siguiente centro"; }
  boton.onclick = () => { if (!activo) iniciar(); else { const acierto = Math.abs(tamano - margen) <= margen / 2; resolver(acierto); } };
}

function minijuegoCierreProvidencial(callback, jugador, rival) {
  const contenedor=document.getElementById("competition-container"), cabecera=crearCabeceraMinijuego(jugador,rival); let resuelto=false;
  contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Cierre providencial</h3><p>El delantero quedó mano a mano. Esperá la señal y tocá ¡AHORA!.</p><button class="alerta-cierre" id="alerta-cierre" disabled>ESPERÁ…</button></div>`;
  const boton=contenedor.querySelector("#alerta-cierre"); setTimeout(()=>{boton.disabled=false;boton.textContent="¡AHORA!";boton.classList.add("activo");const limite=setTimeout(()=>{if(!resuelto){resuelto=true;resultadoCentral(contenedor,cabecera,false,"Llegaste tarde","El delantero definió antes de tu barrida.",callback);}}, Math.max(350,850-(jugador.stats.velocidad||50)*5));boton.onclick=()=>{if(resuelto)return;resuelto=true;clearTimeout(limite);resultadoCentral(contenedor,cabecera,true,"Barrida limpia","Le sacaste la pelota justo a tiempo.",callback);};},500+Math.random()*800);
}

function minijuegoDespejeLinea(callback, jugador, rival) {
  const contenedor=document.getElementById("competition-container"), cabecera=crearCabeceraMinijuego(jugador,rival), ancho=Math.min(34,12+(jugador.stats.quite||50)/4);let p=0,d=1,corriendo=false,loop;
  contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Despeje en la línea</h3><p>Frená el cursor en la zona segura para reventarla lejos.</p><div class="medidor-potencia"><span class="zona-perfecta" style="left:${50-ancho/2}%;width:${ancho}%"></span><span class="cursor-potencia" id="cursor-linea"></span></div><button class="boton-jugar-minijuego" id="accion-linea">Prepararse</button></div>`;
  const cursor=contenedor.querySelector("#cursor-linea"),btn=contenedor.querySelector("#accion-linea");btn.onclick=()=>{if(!corriendo){corriendo=true;btn.textContent="¡Despejar!";loop=setInterval(()=>{p+=d*3;if(p>=100||p<=0)d*=-1;cursor.style.left=`${p}%`;},20);}else{clearInterval(loop);const ok=Math.abs(p-50)<=ancho/2;resultadoCentral(contenedor,cabecera,ok,ok?"¡La sacaste!":"Gol sobre la línea",ok?"El estadio quedó mudo con tu despeje.":"La pelota cruzó antes de que llegaras.",callback);}};
}

function minijuegoOffside(callback,jugador,rival){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival),objetivo=Math.floor(Math.random()*4);contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Trampa del offside</h3><p>Memorizá quién pica al vacío y ordená la línea.</p><div class="offside-rivales" id="offside-rivales"></div><button class="boton-jugar-minijuego" id="ver-offside">Ver movimiento</button></div>`;const zona=contenedor.querySelector("#offside-rivales"),ver=contenedor.querySelector("#ver-offside");for(let i=0;i<4;i++)zona.insertAdjacentHTML("beforeend",`<button class="rival-offside" data-i="${i}">Rival ${i+1}</button>`);const botones=[...zona.children];botones.forEach(b=>b.disabled=true);ver.onclick=()=>{ver.hidden=true;botones[objetivo].classList.add("pica");setTimeout(()=>{botones[objetivo].classList.remove("pica");botones.forEach(b=>b.disabled=false);},650);};botones.forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===objetivo;resultadoCentral(contenedor,cabecera,ok,ok?"Fuera de juego":"Línea rota",ok?"Tu orden dejó al rival adelantado.":"El delantero recibió habilitado.",callback);});}

function minijuegoCuerpoACuerpo(callback,jugador,rival){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival);let golpes=0,activo=false;contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Cuerpo a cuerpo</h3><p>Presioná 10 veces antes de que termine el forcejeo.</p><div class="contador-fuerza" id="contador-fuerza">0 / 10</div><button class="boton-fuerza" id="boton-fuerza">AGUANTAR</button></div>`;const boton=contenedor.querySelector("#boton-fuerza"),contador=contenedor.querySelector("#contador-fuerza");boton.onclick=()=>{if(!activo){activo=true;boton.textContent="¡METÉ!";setTimeout(()=>{if(golpes<10)resultadoCentral(contenedor,cabecera,false,"Te ganó la posición","El tanque rival alcanzó a conectar el centro.",callback);},2100);return;}golpes++;contador.textContent=`${golpes} / 10`;if(golpes>=10)resultadoCentral(contenedor,cabecera,true,"Choque ganado","Aguantaste la marca y rechazaste lejos.",callback);};}

function jugarLibertadoresCentral(callback,jugador,rival){let ronda=1;const fases=["Fase de Grupos · Partido 1","Fase de Grupos · Partido 2","Fase de Grupos · Partido 3","Octavos de final","Cuartos de final","Semifinal","Final"];const jugarRonda=()=>{const rivalActual=ronda===1?rival:obtenerRivalInternacional(jugador);window.CONTEXTO_PARTIDO={torneo:"Copa Libertadores",fase:fases[ronda-1]};minijuegoDueloAereo(seguir,jugador,rivalActual,ronda);};const seguir=ok=>{if(!ok)return callback(false,fases[ronda-1]);if(ronda++===7)return callback(true);jugarRonda();};jugarRonda();}
function jugarSudamericanaCentral(callback,jugador,rival){minijuegoCierreProvidencial(ok=>ok?minijuegoDespejeLinea(callback,jugador,rival):callback(false),jugador,rival);}
function jugarRecopaCentral(callback,jugador,rival){minijuegoOffside(ok=>ok?minijuegoCuerpoACuerpo(callback,jugador,rival):callback(false),jugador,rival);}

// ============================================
// SECCIÓN: eventosarquero.js
// ============================================

function resultadoArquero(contenedor,cabecera,exito,titulo,texto,callback){contenedor.innerHTML=`${cabecera}<div class="competition-card resultado-minijuego ${exito?"campeon":"subcampeon"}"><span class="resultado-minijuego__icono">${exito?"🧤":"🥅"}</span><h3>${titulo}</h3><p>${texto}</p><button class="boton-continuar">Continuar</button></div>`;contenedor.querySelector(".boton-continuar").onclick=()=>callback(exito);}

function minijuegoBarraArquero(callback,jugador,rival,dificultad=1,titulo="Bajo los tres palos"){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival),ancho=Math.max(8,36-dificultad*4+(jugador.stats.reflejos||50)/4+(jugador.stats.velocidad||50)/8);let p=0,d=1,activo=false,loop;contenedor.innerHTML=`${cabecera}<div class="competition-card"><span class="badge-copa">LIBERTADORES</span><h3>${titulo}</h3><p>Frená el reflejo dentro de la zona de salvada.</p><div class="medidor-potencia medidor-arquero"><span class="zona-perfecta" style="left:${50-ancho/2}%;width:${ancho}%"></span><span class="cursor-potencia" id="cursor-arquero"></span></div><button class="boton-jugar-minijuego" id="atajar-barra">Preparar atajada</button></div>`;const cursor=contenedor.querySelector("#cursor-arquero"),btn=contenedor.querySelector("#atajar-barra");btn.onclick=()=>{if(!activo){activo=true;btn.textContent="¡ATAJAR!";const vel=1.5+dificultad*1.25;loop=setInterval(()=>{p+=d*vel;if(p>=100||p<=0)d*=-1;cursor.style.left=`${p}%`;},18);}else{clearInterval(loop);const ok=Math.abs(p-50)<=ancho/2;resultadoArquero(contenedor,cabecera,ok,ok?"¡Atajada imposible!":"No llegó",ok?"Volaste al ángulo y salvaste al equipo.":"La pelota encontró la red.",callback);}};}

function minijuegoCazarMariposas(callback,jugador,rival){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival),margen=Math.min(40,15+(jugador.stats.juegoAereo||50)/4);let t=100,activo=false,loop;contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Cazar mariposas</h3><p>Salí a cortar el córner en el punto exacto.</p><div class="duelo-aereo"><span class="circulo-objetivo" style="width:${margen}%;height:${margen}%"></span><span class="circulo-timing" id="circulo-arquero"></span></div><button class="boton-jugar-minijuego" id="salir-corner">Salir del arco</button></div>`;const circ=contenedor.querySelector("#circulo-arquero"),btn=contenedor.querySelector("#salir-corner");btn.onclick=()=>{if(!activo){activo=true;btn.textContent="¡SALIR!";loop=setInterval(()=>{t-=1.9;circ.style.width=`${t}%`;circ.style.height=`${t}%`;if(t<=0){clearInterval(loop);resultadoArquero(contenedor,cabecera,false,"Centro pasado","No llegaste a descolgar la pelota.",callback);}},18);}else{clearInterval(loop);const ok=Math.abs(t-margen)<=margen/2;resultadoArquero(contenedor,cabecera,ok,ok?"¡Se quedó con todo!":"Calculó mal",ok?"Dominaste el área y apagaste el peligro.":"El centro quedó servido para el rival.",callback);}};}

function minijuegoManoAMano(callback,jugador,rival){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival),dirs=["⬅", "⬆", "➡"],disponibles=[0,1,2],secuencia=Array.from({length:3},()=>disponibles.splice(Math.floor(Math.random()*disponibles.length),1)[0]);let entrada=[];contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>El mano a mano</h3><p>Leé el perfil del delantero y achicá en el orden correcto.</p><div class="qte-secuencia" id="visor-mano">● ● ●</div><div class="teclas-qte" id="teclas-mano"></div><button class="boton-jugar-minijuego" id="mostrar-mano">Leer la jugada</button></div>`;const visor=contenedor.querySelector("#visor-mano"),zona=contenedor.querySelector("#teclas-mano"),ver=contenedor.querySelector("#mostrar-mano");dirs.forEach((dir,i)=>zona.insertAdjacentHTML("beforeend",`<button class="tecla-qte" disabled data-i="${i}">${dir}</button>`));const botones=[...zona.children];ver.onclick=()=>{ver.hidden=true;let p=0;const loop=setInterval(()=>{visor.textContent=secuencia.slice(0,p+1).map(x=>dirs[x]).join(" ");if(++p===3){clearInterval(loop);setTimeout(()=>{visor.textContent="Elegí el achique";botones.forEach(b=>b.disabled=false);},450);}},420);};botones.forEach(b=>b.onclick=()=>{entrada.push(+b.dataset.i);b.disabled=true;if(entrada.length===3){const ok=entrada.every((x,i)=>x===secuencia[i]);resultadoArquero(contenedor,cabecera,ok,ok?"¡Gigante!":"Te cruzó el remate",ok?"Achicaste perfecto y tapaste con el cuerpo.":"El delantero encontró el hueco.",callback);}});}

function minijuegoDobleAtajada(callback,jugador,rival){const contenedor=document.getElementById("competition-container"),cabecera=crearCabeceraMinijuego(jugador,rival);contenedor.innerHTML=`${cabecera}<div class="competition-card"><h3>Doble atajada</h3><p>Primero frená el remate. Después, reaccioná al rebote.</p><button class="boton-jugar-minijuego" id="primera-atajada">Atajar primer tiro</button><div class="zona-rebote" id="zona-rebote"></div></div>`;const primer=contenedor.querySelector("#primera-atajada"),zona=contenedor.querySelector("#zona-rebote");primer.onclick=()=>{primer.hidden=true;setTimeout(()=>{const btn=document.createElement("button");btn.className="alerta-cierre activo";btn.textContent="¡REBOTE!";btn.style.left=`${15+Math.random()*60}%`;zona.append(btn);const limite=setTimeout(()=>resultadoArquero(contenedor,cabecera,false,"Rebote fatal","La segunda pelota terminó en gol.",callback),Math.max(450,1100-(jugador.stats.reflejos||50)*6));btn.onclick=()=>{clearTimeout(limite);resultadoArquero(contenedor,cabecera,true,"Doble atajada","Volviste del piso para salvar un gol imposible.",callback);};},500);};}

function jugarLibertadoresArquero(callback,jugador,rival){let ronda=1;const fases=["Fase de Grupos · Partido 1","Fase de Grupos · Partido 2","Fase de Grupos · Partido 3","Octavos de final","Cuartos de final","Semifinal","Final"];const jugarRonda=()=>{const rivalActual=ronda===1?rival:obtenerRivalInternacional(jugador);window.CONTEXTO_PARTIDO={torneo:"Copa Libertadores",fase:fases[ronda-1]};minijuegoBarraArquero(seguir,jugador,rivalActual,ronda);};const seguir=ok=>{if(!ok)return callback(false,fases[ronda-1]);if(ronda++===7)return callback(true);jugarRonda();};jugarRonda();}
function jugarSudamericanaArquero(callback,jugador,rival){minijuegoCazarMariposas(ok=>ok?minijuegoManoAMano(callback,jugador,rival):callback(false),jugador,rival);}
function jugarRecopaArquero(callback,jugador,rival){minijuegoDobleAtajada(ok=>ok?minijuegoBarraArquero(callback,jugador,rival,7,"El penal del campeonato"):callback(false),jugador,rival);}
