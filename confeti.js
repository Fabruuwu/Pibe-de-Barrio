/**
 * confeti.js
 * -----------------------------------------
 * Animación de confeti liviana, sin librerías externas.
 * Se dispara con lanzarConfeti() en momentos de gran celebración
 * (por ahora: campeón del Mundial de Clubes).
 * -----------------------------------------
 */

function lanzarConfeti(duracionMs = 3200, cantidad = 140) {
  const contenedor = document.createElement("div");
  contenedor.className = "confeti-contenedor";
  document.body.appendChild(contenedor);

  const colores = ["#f5c542", "#ffffff", "#4c9a2a", "#3b82f6", "#a855f7", "#ff4d4d"];

  for (let i = 0; i < cantidad; i++) {
    const pieza = document.createElement("span");
    pieza.className = "confeti-pieza";
    if (Math.random() < 0.3) pieza.classList.add("confeti-pieza--redonda");
    pieza.style.left = `${Math.random() * 100}%`;
    pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
    pieza.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    pieza.style.animationDelay = `${Math.random() * 0.6}s`;
    pieza.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    pieza.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    contenedor.appendChild(pieza);
  }

  setTimeout(() => contenedor.remove(), duracionMs + 1200);
}
