document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const nombreInput = document.getElementById('nombre');
    const dorsalInput = document.getElementById('dorsal');
    const nacionalidadSelect = document.getElementById('nacionalidad');
    const paisLigaSelect = document.getElementById('paisLiga');
    const divisionSelect = document.getElementById('division');
    const clubSelect = document.getElementById('club');
    const posicionBtns = document.querySelectorAll('.posicion-btn');
    const iniciarBtn = document.getElementById('iniciar');
    const errorMsg = document.getElementById('mensaje-error');

    let posicionSeleccionada = null;

    // Cargar nacionalidades
    DATOS.nacionalidades.forEach(nac => {
        const option = document.createElement('option');
        option.value = nac;
        option.textContent = nac;
        nacionalidadSelect.appendChild(option);
    });

    // Cargar países de liga (solo los que tienen ligas definidas)
    Object.keys(DATOS.ligas).forEach(pais => {
        const option = document.createElement('option');
        option.value = pais;
        option.textContent = pais;
        paisLigaSelect.appendChild(option);
    });
    // Habilitar el select de país de liga
    paisLigaSelect.disabled = false;

    // Evento: al elegir país de liga, cargar divisiones
    paisLigaSelect.addEventListener('change', () => {
        const pais = paisLigaSelect.value;
        divisionSelect.innerHTML = '<option value="">Selecciona...</option>';
        clubSelect.innerHTML = '<option value="">Selecciona...</option>';
        if (pais && DATOS.ligas[pais]) {
            Object.keys(DATOS.ligas[pais].divisiones).forEach(div => {
                const option = document.createElement('option');
                option.value = div;
                option.textContent = div;
                divisionSelect.appendChild(option);
            });
            divisionSelect.disabled = false;
        } else {
            divisionSelect.disabled = true;
            clubSelect.disabled = true;
        }
    });

    // Evento: al elegir división, cargar clubes
    divisionSelect.addEventListener('change', () => {
        const pais = paisLigaSelect.value;
        const division = divisionSelect.value;
        clubSelect.innerHTML = '<option value="">Selecciona...</option>';
        if (pais && division && DATOS.ligas[pais].divisiones[division]) {
            DATOS.ligas[pais].divisiones[division].clubes.forEach(club => {
                const option = document.createElement('option');
                option.value = club;
                option.textContent = club;
                clubSelect.appendChild(option);
            });
            clubSelect.disabled = false;
        } else {
            clubSelect.disabled = true;
        }
    });

    // Evento: selección de posición
    posicionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            posicionBtns.forEach(b => b.classList.remove('seleccionada'));
            btn.classList.add('seleccionada');
            posicionSeleccionada = btn.dataset.posicion;
        });
    });

    // Evento: iniciar carrera
    iniciarBtn.addEventListener('click', () => {
        // Validaciones
        const nombre = nombreInput.value.trim();
        const dorsal = parseInt(dorsalInput.value);
        const nacionalidad = nacionalidadSelect.value;
        const paisLiga = paisLigaSelect.value;
        const division = divisionSelect.value;
        const club = clubSelect.value;

        if (!nombre) {
            mostrarError('Por favor ingresa tu nombre.');
            return;
        }
        if (!dorsal || dorsal < 1 || dorsal > 99) {
            mostrarError('El número de camiseta debe estar entre 1 y 99.');
            return;
        }
        if (!nacionalidad) {
            mostrarError('Selecciona tu nacionalidad.');
            return;
        }
        if (!paisLiga || !division || !club) {
            mostrarError('Completa la información de la liga (país, división y club).');
            return;
        }
        if (!posicionSeleccionada) {
            mostrarError('Selecciona una posición.');
            return;
        }

        // Crear objeto jugador
        const jugador = {
            nombre,
            dorsal,
            nacionalidad,
            paisLiga,
            division,
            club,
            posicion: posicionSeleccionada,
            // Puedes agregar estadísticas iniciales según posición más adelante
        };

        // Guardar en localStorage (para usarlo en el juego)
        localStorage.setItem('jugador', JSON.stringify(jugador));
        
        // Por ahora mostramos éxito (luego redirigir o cargar juego)
        mostrarError(''); // Limpiar errores
        alert(`✅ Jugador creado:\n${jugador.nombre} (#${jugador.dorsal})\n${jugador.nacionalidad}\n${jugador.club} (${jugador.division})\nPosición: ${jugador.posicion}`);
        console.log('Jugador guardado:', jugador);
    });

    function mostrarError(mensaje) {
        errorMsg.textContent = mensaje;
    }
});