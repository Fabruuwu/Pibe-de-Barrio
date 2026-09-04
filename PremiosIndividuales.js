// Gala anual del Balón de Oro. Se guarda cada resultado para no repetir sorteos al recargar.

const FIGURAS_BALON_DE_ORO = [
  "Kylian Mbappé", "Lionel Messi", "Cristiano Ronaldo", "Jude Bellingham", "Erling Haaland", "Vinícius Júnior", "Jamal Musiala", "Florian Wirtz", "Phil Foden", "Bukayo Saka", "Pedri", "Lamine Yamal", "Gavi", "Warren Zaïre-Emery", "Kobbie Mainoo", "Arda Güler", "Xavi Simons", "João Neves", "Mathys Tel", "Alejandro Garnacho", "Claudio Echeverri", "Franco Mastantuono", "Endrick", "Estêvão Willian", "Kendry Páez", "Valentín Carboni", "Valentín Barco", "Gianluca Prestianni", "Pau Cubarsí", "Leny Yoro", "William Saliba", "Alejandro Balde", "Rico Lewis"
];

function probabilidadInvitacionPorNota(nota) {
  if (nota >= 10) return 100;
  if (nota >= 9.7) return 90;
  if (nota >= 9.4) return 80;
  if (nota >= 9.2) return 70;
  if (nota >= 9.0) return 60;
  if (nota >= 8.8) return 30;
  return 0;
}

function continenteDeLiga(liga) {
  if (["liga-profesional-argentina", "brasileirao-brasil"].includes(liga)) return "Sudamérica";
  if (["bundesliga-alemania", "primera-division-espana", "serie-a-italia", "ligue-1-francia", "premier-league-inglaterra"].includes(liga)) return "Europa";
  if (liga?.includes("mex") || liga?.includes("mls")) return "Norteamérica";
  if (liga?.includes("africa")) return "África";
  if (liga?.includes("asia")) return "Asia";
  return "Oceanía";
}

function probabilidadContinenteBalon(liga) {
  return { "Europa": 100, "Sudamérica": 70, "Norteamérica": 30, "África": 5, "Asia": 0, "Oceanía": 0 }[continenteDeLiga(liga)] ?? 0;
}

function prepararInvitacionBalonDeOro(jugador, temporada) {
  if (!Array.isArray(jugador.premiosPendientes)) jugador.premiosPendientes = [];
  if (jugador.premiosPendientes.some(p => p.temporada === temporada)) return;
  const nota = Number(jugador.statsAnuales?.nota || 0);
  const probabilidad = probabilidadInvitacionPorNota(nota);
  // Las notas debajo de 8.8 no llegan a la instancia de invitación visible.
  if (probabilidad === 0) return;
  jugador.premiosPendientes.push({
    temporada,
    galaAño: temporada + 1,
    nota,
    estadisticas: { ...jugador.statsAnuales },
    invitado: Math.random() * 100 < probabilidad,
    probabilidadNota: probabilidad,
    resuelto: false
  });
  Estado.guardar();
}

function obtenerCincoNominados(nombreJugador) {
  const figuras = FIGURAS_BALON_DE_ORO.filter(nombre => nombre !== nombreJugador).sort(() => Math.random() - .5).slice(0, 4);
  return [...figuras, nombreJugador].sort(() => Math.random() - .5);
}

function probabilidadVictoriaBalon(media) {
  if (media <= 60) return 0;
  if (media <= 75) return 5;
  if (media <= 85) return 20;
  if (media <= 90) return 25;
  if (media <= 95) return 30;
  return 40;
}

function mostrarGalaBalonDeOro(alTerminar) {
  const jugador = Estado.obtener();
  const premio = (jugador.premiosPendientes || []).find(p => p.galaAño === jugador.año && p.invitado && !p.resuelto);
  if (!premio) return false;
  const contenedor = document.getElementById("competition-container");
  contenedor.hidden = false;
  contenedor.innerHTML = `
    <div class="competition-card gala-sobre">
      <span class="gala-sobre__sello">🏅</span>
      <h2>Nominación al Balón de Oro ${premio.temporada}</h2>
      <p>La gala te espera. Hacé clic en el sobre para conocer tu nominación.</p>
      <button class="gala-sobre__boton">✉ Abrir sobre</button>
    </div>`;
  contenedor.querySelector(".gala-sobre__boton").onclick = () => {
    const probabilidad = probabilidadContinenteBalon(jugador.liga);
    const candidato = Math.random() * 100 < probabilidad;
    premio.resuelto = true;
    premio.candidato = candidato;
    premio.continente = continenteDeLiga(jugador.liga);
    premio.probabilidadContinente = probabilidad;
    Estado.guardar();
    if (!candidato) {
      contenedor.innerHTML = `<div class="competition-card subcampeon"><h2>Lo sentimos</h2><p>No calificaste como candidato al Balón de Oro. La gala reconoce tu temporada, aunque esta vez la votación no llegó para tu continente.</p><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; alTerminar(); };
      return;
    }
    mostrarVotacionBalonDeOro(premio, alTerminar);
  };
  return true;
}

function mostrarVotacionBalonDeOro(premio, alTerminar) {
  const jugador = Estado.obtener();
  const contenedor = document.getElementById("competition-container");
  const nominados = obtenerCincoNominados(jugador.nombre);
  const probJugador = probabilidadVictoriaBalon(jugador.media || 0);
  const ganaJugador = Math.random() * 100 < probJugador;
  const otros = nominados.filter(n => n !== jugador.nombre).sort(() => Math.random() - .5);
  const orden = ganaJugador ? [jugador.nombre, ...otros] : [otros[0], jugador.nombre, ...otros.slice(1)];
  // Si no gana, su posición también es aleatoria entre 2° y 5°.
  if (!ganaJugador) {
    orden.splice(1, 1);
    orden.splice(1 + Math.floor(Math.random() * 4), 0, jugador.nombre);
  }
  const rangoPorPuesto = [[88, 140], [44, 87], [28, 43], [11, 27], [0, 10]];
  const resultados = orden.map((nombre, puesto) => ({ nombre, puesto: puesto + 1, votos: rangoAleatorio(rangoPorPuesto[puesto][0], rangoPorPuesto[puesto][1]) }));
  const porNombre = Object.fromEntries(resultados.map(r => [r.nombre, r]));
  contenedor.innerHTML = `
    <div class="competition-card gala-votacion">
      <span class="badge-copa">BALÓN DE ORO ${premio.temporada}</span>
      <h2>Los cinco finalistas</h2>
      <p>La votación mundial está por comenzar.</p>
      <div class="gala-votos">${nominados.map(nombre => `<div class="gala-candidato" data-nombre="${nombre}"><strong>${nombre}</strong><div class="gala-barra"><i></i></div><span>0 votos</span></div>`).join("")}</div>
      <button class="boton-jugar-minijuego" id="iniciar-votacion-balon">Iniciar votaciones</button>
    </div>`;
  contenedor.querySelector("#iniciar-votacion-balon").onclick = () => {
    const boton = contenedor.querySelector("#iniciar-votacion-balon"); boton.disabled = true;
    const inicio = Date.now(), duracion = 2400;
    const animar = () => {
      const avance = Math.min(1, (Date.now() - inicio) / duracion);
      contenedor.querySelectorAll(".gala-candidato").forEach(elemento => {
        const resultado = porNombre[elemento.dataset.nombre];
        const votos = avance === 1 ? resultado.votos : Math.floor(resultado.votos * avance + Math.random() * 8);
        elemento.querySelector("span").textContent = `${Math.min(resultado.votos, votos)} votos`;
        elemento.querySelector("i").style.height = `${Math.max(4, Math.min(100, votos / 140 * 100))}%`;
      });
      if (avance < 1) return requestAnimationFrame(animar);
      setTimeout(() => mostrarResultadoBalonDeOro(premio, resultados, alTerminar), 600);
    };
    animar();
  };
}

function mostrarResultadoBalonDeOro(premio, resultados, alTerminar) {
  const jugador = Estado.obtener();
  const resultadoJugador = resultados.find(r => r.nombre === jugador.nombre);
  const ganador = resultados.find(r => r.puesto === 1);
  const contenedor = document.getElementById("competition-container");
  const gano = ganador.nombre === jugador.nombre;
  if (gano) {
    if (!Array.isArray(jugador.balonesDeOro)) jugador.balonesDeOro = [];
    jugador.balonesDeOro.push({ temporada: premio.temporada, galaAño: jugador.año, votos: ganador.votos });
  }
  premio.resultado = { puesto: resultadoJugador.puesto, votos: resultadoJugador.votos, ganador: ganador.nombre };
  Estado.guardar();
  contenedor.innerHTML = gano
    ? `<div class="competition-card campeon gala-ganador"><h2>¡BALÓN DE ORO ${premio.temporada}!</h2><img src="Trofeos/BalonDeOro.png" alt="Balón de Oro"><p>Felicidades, fuiste elegido como el mejor jugador del mundo. Tus estadísticas lo avalan:</p><p><strong>${premio.estadisticas?.partidos || 0} PJ · ${premio.estadisticas?.goles || 0} goles · ${premio.estadisticas?.asistencias || 0} asistencias · Nota ${premio.nota}</strong></p><button class="boton-continuar">Continuar</button></div>`
    : `<div class="competition-card subcampeon"><h2>${ganador.nombre} ganó el Balón de Oro</h2><p>Terminaste ${resultadoJugador.puesto}° con ${resultadoJugador.votos} votos. Felicidades por llegar tan lejos: aun sin haber ganado demostraste de qué sos capaz.</p><button class="boton-continuar">Continuar</button></div>`;
  contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; alTerminar(); };
}
