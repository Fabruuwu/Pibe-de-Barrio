/** Competiciones de Brasil: Brasileirão y Copa do Brasil. */

const CONFIG_BRASIL = {
  liga: "brasileirao-brasil",
  division: "serie-a-brasil",
  nombreLiga: "Brasileirão",
  nombreCopa: "Copa do Brasil",
  trofeoLiga: "Trofeos/Brasileirao.png",
  trofeoCopa: "Trofeos/CopaBrasil.png",
};

function bonusMediaBrasil(media) {
  if (media <= 60) return 3;
  if (media <= 70) return 10;
  if (media <= 80) return 18;
  if (media <= 90) return 28;
  return 40;
}

function obtenerRivalBrasil(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_BRASIL.division] || [];
  const rivales = clubes.filter(club => club.id !== jugador.club);
  return rivales[Math.floor(Math.random() * rivales.length)] || null;
}

function mostrarMinijuegoBrasil(callback, jugador) {
  const rival = obtenerRivalBrasil(jugador);
  const tipo = Math.floor(Math.random() * 3);
  if (tipo === 0) minijuegoPenal(callback, jugador, rival);
  else if (tipo === 1) minijuegoMemoria(callback, jugador, rival);
  else minijuegoQTE(callback, jugador, rival);
}

function simularBrasileirao(jugador) {
  const clubes = CLUBES_POR_DIVISION[CONFIG_BRASIL.division] || [];
  const base = { grande: 60, mediano: 30, chico: 3, diminuto: 1 };
  const bonus = bonusMediaBrasil(jugador.media || 0);
  let total = 0;
  const pesos = clubes.map(club => {
    const cantidadCategoria = clubes.filter(c => c.categoria === club.categoria).length || 1;
    const peso = base[club.categoria] / cantidadCategoria + (club.id === jugador.club ? bonus : 0);
    total += peso;
    return { club, peso };
  });
  let sorteo = Math.random() * total;
  const campeon = pesos.find(item => (sorteo -= item.peso) <= 0)?.club || pesos.at(-1)?.club;
  if (campeon?.id === jugador.club) return { esCampeon: true, posicion: 1, subcampeon: false, minijuego: Math.random() >= .6 };
  const posicion = Math.floor(Math.random() * 19) + 2; // liga de 20 equipos
  return { esCampeon: false, posicion, subcampeon: posicion === 2 };
}

// Misma lógica RNG que Copa Argentina; al usar la división del jugador,
// tanto el rival como el sorteo quedan limitados a equipos brasileños.
function simularCopaBrasil(jugador) {
  return simularCopaArgentina(jugador);
}

function mostrarResultadoLigaBrasil(resultado, callback) {
  window.CONTEXTO_PARTIDO = { torneo: CONFIG_BRASIL.nombreLiga, fase: resultado.esCampeon ? "Definición del título" : "Fin de temporada" };
  const contenedor = document.getElementById("competition-container");
  const jugador = Estado.obtener();
  const rival = obtenerRivalBrasil(jugador);
  const cabecera = crearCabeceraMinijuego(jugador, rival);
  const continuar = valor => { contenedor.innerHTML = ""; contenedor.hidden = true; callback(valor); };
  if (!resultado.esCampeon) {
    contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>Tu equipo terminó en la posición <strong>${resultado.posicion}</strong> del Brasileirão.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").onclick = () => continuar(resultado);
    return;
  }
  const celebrar = exito => {
    contenedor.innerHTML = exito
      ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DEL BRASILEIRÃO!</h2><img src="${CONFIG_BRASIL.trofeoLiga}" alt="Brasileirão"><p>Brasil entero habla de tu temporada.</p><button class="boton-continuar">Continuar</button></div>`
      : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón del Brasileirão 🥈</h2><p>La definición se escapó por detalles.</p><button class="boton-continuar">Continuar</button></div>`;
    contenedor.querySelector(".boton-continuar").onclick = () => continuar(exito ? resultado : { esCampeon: false, posicion: 2, subcampeon: true });
  };
  if (!resultado.minijuego) { celebrar(true); return; }
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Llegaste a la definición del Brasileirão! Ganá el minijuego para levantar el título.</p><button class="boton-jugar-minijuego">¡Jugar!</button></div>`;
  contenedor.querySelector(".boton-jugar-minijuego").onclick = () => mostrarMinijuegoBrasil(celebrar, jugador);
}

function mostrarResultadoCopaBrasil(resultado, callback) {
  window.CONTEXTO_PARTIDO = { torneo: CONFIG_BRASIL.nombreCopa, fase: "Final" };
  const contenedor = document.getElementById("competition-container");
  const jugador = Estado.obtener();
  const cabecera = crearCabeceraMinijuego(jugador, resultado.rival);
  contenedor.innerHTML = `${cabecera}<div class="competition-card"><p>¡Final de la Copa do Brasil! Ganá esta instancia para levantar el trofeo.</p><button class="boton-jugar-minijuego">¡Jugar la final!</button></div>`;
  contenedor.querySelector(".boton-jugar-minijuego").onclick = () => {
    obtenerMinijuegoCopaArgentina("copaArgentina", jugador, resultado.rival)(exito => {
      contenedor.innerHTML = exito
        ? `${cabecera}<div class="competition-card campeon"><h2>¡CAMPEÓN DE COPA DO BRASIL!</h2><img src="${CONFIG_BRASIL.trofeoCopa}" alt="Copa do Brasil"><button class="boton-continuar">Continuar</button></div>`
        : `${cabecera}<div class="competition-card subcampeon"><h2>Subcampeón de Copa do Brasil 🥈</h2><button class="boton-continuar">Continuar</button></div>`;
      contenedor.querySelector(".boton-continuar").onclick = () => { contenedor.innerHTML = ""; contenedor.hidden = true; callback({ esCampeon: exito, subcampeon: !exito }); };
    });
  };
}

function agendarCompeticionesBrasil(jugador, añoActual, resLiga, resCopa) {
  if (!Array.isArray(jugador.copasPendientes)) jugador.copasPendientes = [];
  const añoProximo = añoActual + 1;
  const pos = Number(resLiga.posicion);
  const libertadores = resLiga.esCampeon || resLiga.subcampeon || (pos >= 1 && pos <= 5) || resCopa.esCampeon;
  const sudamericana = !libertadores && pos >= 6 && pos <= 11;
  if (libertadores && !jugador.copasPendientes.some(c => c.año === añoProximo && c.tipo === "libertadores")) {
    jugador.copasPendientes.push({ año: añoProximo, tipo: "libertadores", rivalId: null, clasificacion: "brasileirao" });
  } else if (sudamericana && !jugador.copasPendientes.some(c => c.año === añoProximo && c.tipo === "sudamericana")) {
    jugador.copasPendientes.push({ año: añoProximo, tipo: "sudamericana", rivalId: null, clasificacion: "brasileirao" });
  }
}

function procesarTemporadaBrasil(jugador, año, callbackFinal) {
  const resultadoLiga = simularBrasileirao(jugador);
  const simCopa = simularCopaBrasil(jugador);
  mostrarResultadoLigaBrasil(resultadoLiga, resLiga => {
    jugador.resultadoLiga = resLiga;
    if (resLiga.esCampeon) jugador.stats.titulos++;
    if (!Array.isArray(jugador.campeonesHistorial)) jugador.campeonesHistorial = [];
    jugador.campeonesHistorial.push({ año, ligaBrasil: resLiga.esCampeon ? jugador.club : null, copaBrasil: null });
    const terminar = () => { Estado.guardar(); callbackFinal(); };
    const terminarCopa = resCopa => {
      const historial = jugador.campeonesHistorial.find(h => h.año === año);
      historial.copaBrasil = resCopa.esCampeon ? jugador.club : null;
      jugador.resultadoCopa = resCopa;
      if (resCopa.esCampeon) jugador.stats.titulos++;
      agendarCompeticionesBrasil(jugador, año, resLiga, resCopa);
      if (typeof agendarMundialClubes === "function") agendarMundialClubes(jugador, año);
      procesarCopasPendientes(terminar);
    };
    if (simCopa.enFinal) mostrarResultadoCopaBrasil(simCopa, terminarCopa);
    else terminarCopa({ esCampeon: false, ronda: simCopa.ronda || "Cuartos" });
  });
}
