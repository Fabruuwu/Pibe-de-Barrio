/* Minijuegos internacionales del Enganche. */

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
  const pausa = Math.max(280, 800 - ((jugador.stats.cerebro || 50) + (jugador.stats.liderazgo || 50)) * 4);
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
  const secuencia = Array.from({ length: 5 }, () => disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0]); let entrada = [];
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><h3>La pausa</h3><p>Memorizá cinco toques para dormir el partido.</p><div class="grid-corto" id="grid-pausa"></div><button class="boton-jugar-minijuego" id="ver-pausa">Ver secuencia</button></div>`;
  const grid = contenedor.querySelector("#grid-pausa"); for(let i=0;i<9;i++) grid.insertAdjacentHTML("beforeend", `<button class="memoria-punto" data-i="${i}"></button>`);
  const botones = [...grid.children], ver = contenedor.querySelector("#ver-pausa");
  ver.onclick = () => {
    ver.hidden = true;
    let p = 0;
    const intervalo = setInterval(() => {
      botones.forEach(x => x.classList.remove("iluminado"));
      if (p === 5) { clearInterval(intervalo); botones.forEach(x => x.disabled = false); return; }
      botones[secuencia[p++]].classList.add("iluminado");
    }, 420);
  };
  botones.forEach(b => {
    b.disabled = true;
    b.onclick = () => {
      entrada.push(+b.dataset.i);
      b.disabled = true;
      if (entrada.length === 5) {
        const ok = entrada.every((x, i) => x === secuencia[i]);
        resultadoEnganche(contenedor, cabecera, ok, ok ? "La pelota es tuya" : "El caos ganó", ok ? "Manejaste los tiempos como un crack." : "Perdiste la posesión en el momento clave.", callback);
      }
    };
  });
}
