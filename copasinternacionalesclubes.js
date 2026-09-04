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

  function jugarEtapa() {
    const etapa = etapas[indice];
    const rival = obtenerRivalMundial(jugador);
    window.CONTEXTO_PARTIDO = { torneo: "Mundial de Clubes", fase: etapa };
    const terminar = (exito) => {
      const enGrupos = indice < 3;
      if (enGrupos) {
        if (exito) ganadosGrupos++;
        else perdidosGrupos++;
        if (perdidosGrupos >= 2) return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
        if (indice === 2 && ganadosGrupos < 2) return mostrarResultadoMundial(false, "Fase de grupos", copa.año, callback);
      } else if (!exito) return mostrarResultadoMundial(false, etapa, copa.año, callback);
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
      if (nivel > 0 && (x <= 0 || x >= 86)) direccion *= -1;
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
  contenedor.innerHTML = ganador
    ? `<div class="competition-card campeon"><h2>¡CAMPEÓN DEL MUNDIAL DE CLUBES ${anio}!</h2><img src="Trofeos/MundialClubes.png" alt="Trofeo del Mundial de Clubes"><p>Conquistaste el mundo. Esta campaña queda para siempre en la historia.</p><button class="boton-continuar">Continuar</button></div>`
    : `<div class="competition-card subcampeon"><h2>El sueño mundial terminó en ${etapa}</h2><p>Te tocó una élite feroz, pero llegaste hasta ${etapa}. Habrá revancha.</p><button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; callback(); };
}