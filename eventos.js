const EVENTOS = [
  // ---------- VESTUARIO Y CLUB ----------
  {
    id: "botin_roto", titulo: "El botín roto", descripcion: "Un compañero juvenil de las inferiores no tiene plata para comprarse botines nuevos y juega con unos pegados con cinta.",
    opciones: [
      { texto: "Regalarle unos tuyos", efecto: { cariño: +8, mensaje: "Le regalaste botines a un juvenil y te ganaste el respeto eterno de los más chicos." } },
      { texto: "No meterte", efecto: { cariño: -2, mensaje: "Decidiste no meterte en los problemas económicos de los juveniles." } }
    ]
  },
  {
    id: "cumple_dt", titulo: "El cumpleaños del DT", descripcion: "El técnico organiza un asado por su cumpleaños en su casa, pero justo ese día cae una tormenta terrible.",
    opciones: [
      { texto: "Ir igual", efecto: { cariño: +6, mensaje: "Fuiste al asado del DT bajo la lluvia; comieron ensalada, pero el grupo se unió más." } },
      { texto: "Quedarte en casa", efecto: { cariño: -3, mensaje: "Faltaste al cumpleaños del DT por la lluvia y el lunes hubo miradas de reojo." } }
    ]
  },
  {
    id: "penal_robado", titulo: "El penal robado", descripcion: "Un delantero que viene con una sequía terrible de goles agarra la pelota para patear un penal que te hicieron a vos.",
    opciones: [
      { texto: "Cederle la pelota", efecto: { cariño: +8, mensaje: "Le cediste un penal a un compañero en mala racha, demostrando que pensás en el equipo." } },
      { texto: "Patearlo vos", efecto: { cariño: -1, mensaje: "Le sacaste la pelota a tu compañero y pateaste el penal vos; los goles son amores." } }
    ]
  },
  {
    id: "utilero_historico", titulo: "El utilero histórico", descripcion: "El utilero que lleva 40 años en el club anuncia que se jubila a fin de mes.",
    opciones: [
      { texto: "Organizar colecta", efecto: { cariño: +6, mensaje: "Le organizaste una colecta de despedida al utilero histórico y te ganaste el corazón del club." } },
      { texto: "Firmarle una camiseta", efecto: { cariño: +3, mensaje: "Le firmaste una camiseta al utilero en su despedida, un lindo gesto de compromiso." } }
    ]
  },
  {
    id: "fiesta_post", titulo: "Fiesta post-partido", descripcion: "Tras una gran victoria, te invitan a una fiesta exclusiva que organizaron los referentes del plantel.",
    opciones: [
      { texto: "Ir un rato", efecto: { cariño: +5, mensaje: "Fuiste a la fiesta de los referentes y te integraste al círculo íntimo del plantel." } },
      { texto: "Ir a dormir", efecto: { cariño: +2, mensaje: "Rechazaste la fiesta post-partido para descansar; tu profesionalismo es absoluto." } }
    ]
  },
  {
    id: "pelea_entrenamiento", titulo: "Pelea en el entrenamiento", descripcion: "Dos de tus compañeros se agarran a las trompadas en plena práctica por una patada de más.",
    opciones: [
      { texto: "Meterte a separar", efecto: { cariño: +6, mensaje: "Separaste una pelea en el entrenamiento, asumiendo un rol pacificador en el grupo." } },
      { texto: "Mirar de lejos", efecto: { cariño: -2, mensaje: "Te quedaste al margen de la pelea en la práctica para no ligar un golpe de rebote." } }
    ]
  },
  {
    id: "consejo_tactico", titulo: "El consejo táctico", descripcion: "El entrenador te llama a su oficina para preguntarte si te sentís más cómodo jugando con otro esquema.",
    opciones: [
      { texto: "Dar tu opinión sincera", efecto: { cariño: +3, mensaje: "Le diste un consejo táctico al DT; la charla fue tensa pero productiva." } },
      { texto: "Decirle que él manda", efecto: { cariño: 0, mensaje: "Le dejaste claro al DT que vos solo acatás órdenes y no te metés en la táctica." } }
    ]
  },
  {
    id: "promesa_capitan", titulo: "La promesa del capitán", descripcion: "El capitán promete que si ganan el clásico, todos se tienen que teñir el pelo de platinado.",
    opciones: [
      { texto: "Aceptar el reto", efecto: { cariño: +5, mensaje: "Te teñiste de platinado por la promesa del clásico. Las fotos quedarán para la historia." } },
      { texto: "Negarte rotundamente", efecto: { cariño: -2, mensaje: "Fuiste el único que no se tiñó el pelo tras el clásico, cuidando tu imagen personal." } }
    ]
  },

  // ---------- HINCHADA Y PRENSA ----------
  {
    id: "nene_hospital", titulo: "El nene del hospital", descripcion: "Un niño que está internado graba un video diciendo que su sueño es conocerte en persona.",
    opciones: [
      { texto: "Ir a visitarlo", efecto: { cariño: +15, mensaje: "Visitaste al niño enfermo en el hospital y nunca olvidarás su cara de felicidad al verte." } },
      { texto: "Mandar un video", efecto: { cariño: -3, mensaje: "Le mandaste un sentido saludo en video al niño del hospital, que se hizo viral en redes." } }
    ]
  },
  {
    id: "tatuaje_feo", titulo: "El tatuaje feo", descripcion: "A la salida del entrenamiento, un hincha te muestra que se tatuó tu cara en la espalda, pero el dibujo salió espantoso.",
    opciones: [
      { texto: "Fingir que te encanta", efecto: { cariño: +3, mensaje: "Fingiste que te encantaba el dudoso tatuaje de un fanático y le alegraste el día." } },
      { texto: "Ofrecer pagarle un arreglo", efecto: { cariño: +6, mensaje: "Le pagaste un buen tatuador a un hincha para arreglarle un tatuaje desastroso con tu cara." } }
    ]
  },
  {
    id: "microfono_caliente", titulo: "Micrófono caliente", descripcion: "Tras un arbitraje muy polémico, un periodista te pone el micrófono en la cara apenas termina el partido.",
    opciones: [
      { texto: "Destruir al árbitro", efecto: { cariño: +8, mensaje: "Apuntaste contra el arbitraje en vivo y sufriste una suspensión, pero la hinchada te amó." } },
      { texto: "Mantener la calma", efecto: { cariño: +2, mensaje: "Fuiste políticamente correcto con la prensa y evitaste una sanción del tribunal." } }
    ]
  },
  {
    id: "semafaro", titulo: "El semáforo", descripcion: "Estás frenado con tu auto y un hincha del máximo rival te empieza a insultar desde la vereda.",
    opciones: [
      { texto: "Sonreír irónicamente", efecto: { cariño: +3, mensaje: "Le respondiste con ironía a un hincha rival en la calle; el video fue furor en TikTok." } },
      { texto: "Subir la ventana", efecto: { cariño: +2, mensaje: "Ignoraste los insultos de un rival en la calle, demostrando tener la cabeza fría." } }
    ]
  },
  {
    id: "firma_lluvia", titulo: "Firma bajo la lluvia", descripcion: "El micro del equipo está por arrancar, pero hay 20 hinchas empapados pidiendo fotos bajo una tormenta.",
    opciones: [
      { texto: "Quedarte firmando", efecto: { cariño: +8, mensaje: "Te quedaste firmando bajo la lluvia y el micro casi te deja, pero los fans no lo olvidarán." } },
      { texto: "Subir rápido", efecto: { cariño: -2, mensaje: "Subiste rápido al micro para no resfriarte, dejando a algunos hinchas con las ganas." } }
    ]
  },
  {
    id: "streamer", titulo: "El streamer", descripcion: "El streamer del momento te invita a jugar unas partidas en vivo a la noche antes de un partido importante.",
    opciones: [
      { texto: "Aceptar la invitación", efecto: { cariño: +5, mensaje: "Fuiste al stream de moda y mostraste tu faceta más divertida y descontracturada." } },
      { texto: "Rechazar con respeto", efecto: { cariño: +2, mensaje: "Rechazaste ir a un stream para enfocarte al 100% en el partido del fin de semana." } }
    ]
  },
  {
    id: "humo_mercado", titulo: "Humo en el mercado", descripcion: "Un programa de chimentos deportivos inventa que estás peleado con la dirigencia y te querés ir.",
    opciones: [
      { texto: "Desmentirlo enojado", efecto: { cariño: +3, mensaje: "Saliste a desmentir los rumores de la prensa con furia, dejando las cosas claras." } },
      { texto: "Dejar que hablen", efecto: { cariño: 0, mensaje: "Ignoraste los rumores de la prensa y dejaste que tu fútbol hable por vos." } }
    ]
  },
  {
    id: "mural_barrio", titulo: "El mural del barrio", descripcion: "Un grupo de hinchas pinta un mural inmenso con tu grito de gol a tres cuadras del estadio.",
    opciones: [
      { texto: "Ir a la inauguración", efecto: { cariño: +9, mensaje: "Caíste de sorpresa a la inauguración de tu mural y cantaste con la hinchada del barrio." } },
      { texto: "Agradecer por Instagram", efecto: { cariño: +3, mensaje: "Agradeciste el mural barrial a través de tus redes sociales con un lindo mensaje." } }
    ]
  },

  // ---------- VIDA PERSONAL Y POLÉMICAS ----------
  {
    id: "cruce_redes", titulo: "El cruce en redes", descripcion: "Un ex-jugador histórico del club te critica duramente en Twitter diciendo que 'te falta sangre'.",
    opciones: [
      { texto: "Ponerle 'Me Gusta'", efecto: { cariño: 0, mensaje: "Le diste 'Like' a las críticas de una leyenda del club, demostrando que no te afecta la presión." } },
      { texto: "Responderle con altura", efecto: { cariño: +5, mensaje: "Le respondiste con respeto a una leyenda del club, cerrando el debate rápidamente." } }
    ]
  },
  {
    id: "campaña_moda", titulo: "Campaña de moda", descripcion: "Una marca de ropa muy importante te ofrece mucho dinero para posar con ropa ridículamente extravagante.",
    opciones: [
      { texto: "Aceptar el contrato", efecto: { cariño: -1, mensaje: "Hiciste una campaña de ropa extravagante; fuiste un meme un mes, pero cobraste muy bien." } },
      { texto: "Cancelar la sesión", efecto: { cariño: +3, mensaje: "Rechazaste una campaña de moda bizarra para cuidar tu imagen de jugador serio." } }
    ]
  },
  {
    id: "negocio_familiar", titulo: "El negocio familiar", descripcion: "Tu primo abre una rotisería y te pide por favor que le subas una historia a Instagram promocionando sus empanadas.",
    opciones: [
      { texto: "Subir la publicidad", efecto: { cariño: +5, mensaje: "Le hiciste publicidad a la rotisería de tu primo y le llenaste el local de clientes." } },
      { texto: "Prestarle dinero privado", efecto: { cariño: +2, mensaje: "Preferiste no mezclar tus redes y ayudaste económicamente a tu primo en privado." } }
    ]
  },
  {
    id: "politica_club", titulo: "Política en el club", descripcion: "Hay elecciones en el club y un candidato a presidente te pide que te saques una foto con él.",
    opciones: [
      { texto: "Sacarte la foto", efecto: { cariño: +3, mensaje: "Te metiste en la política del club apoyando a un candidato; algunos te aplaudieron, otros te silbaron." } },
      { texto: "Mantenerte neutral", efecto: { cariño: 0, mensaje: "Te mantuviste totalmente neutral en las elecciones del club, enfocado solo en jugar." } }
    ]
  },
  {
    id: "auto_deportivo", titulo: "El auto deportivo", descripcion: "Firmaste un buen contrato y tenés ganas de comprarte un auto deportivo color verde flúor.",
    opciones: [
      { texto: "Comprarlo y lucirlo", efecto: { cariño: +2, mensaje: "Te compraste el auto verde flúor y llegaste al entrenamiento siendo el centro de atención." } },
      { texto: "Comprar uno normal", efecto: { cariño: 0, mensaje: "Decidiste comprar un auto discreto y mantener un perfil bajo fuera de las canchas." } }
    ]
  },
  {
    id: "reality_show", titulo: "El reality show", descripcion: "Una plataforma de streaming te ofrece seguirte con cámaras 24/7 durante una semana para un documental.",
    opciones: [
      { texto: "Aceptar las cámaras", efecto: { cariño: +6, mensaje: "Protagonizaste un mini-documental; la gente conoció tu verdadera personalidad fuera del césped." } },
      { texto: "Exigir privacidad", efecto: { cariño: 0, mensaje: "Rechazaste el documental de streaming para mantener la santidad y privacidad de tu hogar." } }
    ]
  },
  {
    id: "hobby_nocturno", titulo: "El hobby nocturno", descripcion: "Un periodista filtra tu cuenta secundaria donde jugás torneos online de rol y estrategia hasta las 3 AM.",
    opciones: [
      { texto: "Admitir que sos gamer", efecto: { cariño: +5, mensaje: "Admitiste tu fanatismo por los videojuegos nocturnos y te volviste un ícono de la comunidad gamer." } },
      { texto: "Decir que fue una vez", efecto: { cariño: 0, mensaje: "Le bajaste el tono al rumor de tus torneos nocturnos asegurando que fue algo de una sola noche." } }
    ]
  },
  {
    id: "dias_playa", titulo: "Días libres en la playa", descripcion: "Tenés dos días de descanso tras una seguidilla terrible de partidos. Te ofrecen un viaje relámpago a la playa.",
    opciones: [
      { texto: "Ir a la playa", efecto: { cariño: +3, mensaje: "Fuiste a la playa en tus días libres; la prensa sacó fotos, pero volviste con la cabeza fresca." } },
      { texto: "Quedarte durmiendo", efecto: { cariño: +2, mensaje: "Usaste tus días libres para no salir de la cama, recuperando el físico al máximo." } }
    ]
  },
  {
    id: "perro_perdido", titulo: "El perro perdido", descripcion: "Yendo al entrenamiento te cruzás un perrito callejero asustado cerca de la entrada de la sede.",
    opciones: [
      { texto: "Adoptarlo como mascota", efecto: { cariño: +8, mensaje: "Adoptaste al perro de la sede y se convirtió en la mascota oficial y amuleto de tu casa." } },
      { texto: "Llamar a un refugio", efecto: { cariño: +3, mensaje: "Te aseguraste de que el perrito perdido llegara a un refugio seguro antes de entrar a entrenar." } }
    ]
  },

  // ---------- NUEVOS EVENTOS ----------
  // Cancha y Vestuario
  {
    id: "pibe_debutante", titulo: "Pibe debutante", descripcion: "Un juvenil entra a jugar su primer partido temblando de los nervios.",
    opciones: [
      { texto: "Lo arengás", efecto: { cariño: +8, mensaje: "Apadrinaste al pibe debutante y te ganaste su respeto eterno." } },
      { texto: "Lo dejás solo", efecto: { cariño: -2, mensaje: "Dejaste que el juvenil se curta solo con la presión." } }
    ]
  },
  {
    id: "cabala_extrema", titulo: "Cábala extrema", descripcion: "El arquero te pide que uses las medias al revés para no mufar al equipo.",
    opciones: [
      { texto: "Aceptás", efecto: { cariño: +3, mensaje: "Respetaste la insólita cábala del vestuario por el bien del equipo." } },
      { texto: "Te negás", efecto: { cariño: -1, mensaje: "Rompiste la cábala sagrada; por suerte no perdieron." } }
    ]
  },
  {
    id: "sin_agua_caliente", titulo: "Sin agua caliente", descripcion: "Es pleno invierno y se rompe la caldera del vestuario.",
    opciones: [
      { texto: "Bañarte igual", efecto: { cariño: +5, mensaje: "Te bañaste con agua helada demostrando una rudeza total." } },
      { texto: "Irte así nomás", efecto: { cariño: -1, mensaje: "Huiste del vestuario sin bañarte para no congelarte." } }
    ]
  },
  // Vida Personal
  {
    id: "vecino_ruidoso", titulo: "Vecino ruidoso", descripcion: "Hay una fiesta al lado de tu casa la noche previa al clásico.",
    opciones: [
      { texto: "Llamar a la policía", efecto: { cariño: +2, mensaje: "Priorizaste tu descanso y dormiste excelente." } },
      { texto: "Ir a quejarte", efecto: { cariño: +5, mensaje: "Fuiste a pedir silencio y terminaste sacándote fotos a las 3 AM." } }
    ]
  },
  {
    id: "el_mangazo", titulo: "El mangazo", descripcion: "Un amigo de la infancia te pide 20 entradas gratis para toda su familia.",
    opciones: [
      { texto: "Las pagás", efecto: { cariño: +6, mensaje: "Bancaste a tu barrio pagando una fortuna en entradas." } },
      { texto: "Le das solo 2", efecto: { cariño: 0, mensaje: "Pusiste límites firmes a los pedidos de tu entorno." } }
    ]
  },
  {
    id: "auto_pinchado", titulo: "Auto pinchado", descripcion: "Se te pincha una rueda yendo a entrenar.",
    opciones: [
      { texto: "Cambiarla vos", efecto: { cariño: +3, mensaje: "Llegaste a horario pero con las manos llenas de grasa." } },
      { texto: "Pedir grúa", efecto: { cariño: -1, mensaje: "Llegaste tarde a la práctica pero con la ropa impecable." } }
    ]
  },
  // Prensa y Redes
  {
    id: "el_meme", titulo: "El meme", descripcion: "Hacés una cara rara en un partido y te volvés un meme viral.",
    opciones: [
      { texto: "Compartirlo", efecto: { cariño: +5, mensaje: "Te reíste de vos mismo en redes y la gente amó tu humildad." } },
      { texto: "Enojarte", efecto: { cariño: -2, mensaje: "Te quejaste del meme y solo lograste que lo usen el doble." } }
    ]
  },
  {
    id: "canje_bizarro", titulo: "Canje bizarro", descripcion: "Una carnicería te manda 50 kilos de asado a tu casa a cambio de publicidad.",
    opciones: [
      { texto: "Grabar el video", efecto: { cariño: +3, mensaje: "Te convertiste en el ídolo indiscutido de la carnicería local." } },
      { texto: "Donarlo todo", efecto: { cariño: +8, mensaje: "Donaste la comida a un comedor barrial en total silencio." } }
    ]
  },
  {
    id: "fake_news", titulo: "Fake News", descripcion: "Un periodista inventa que te peleaste a gritos con el DT.",
    opciones: [
      { texto: "Desmentir rápido", efecto: { cariño: +3, mensaje: "Saliste a apagar el incendio mediático de inmediato." } },
      { texto: "Ignorarlo", efecto: { cariño: 0, mensaje: "Dejaste que el chimento muera solo ignorando a la prensa." } }
    ]
  },
  // La Hinchada
  {
    id: "el_invasor", titulo: "El invasor", descripcion: "Un nene esquiva la seguridad y corre a abrazarte en medio del partido.",
    opciones: [
      { texto: "Abrazarlo", efecto: { cariño: +9, mensaje: "Le cumpliste el sueño al pibe antes de que lo saquen." } },
      { texto: "Alejarte", efecto: { cariño: -2, mensaje: "Dejaste que los de seguridad hagan su trabajo sin meterte." } }
    ]
  },
  {
    id: "tatuaje_epico", titulo: "Tatuaje épico", descripcion: "Un fanático te muestra que se tatuó tu firma gigante en el brazo.",
    opciones: [
      { texto: "Remarcarlo con fibrón", efecto: { cariño: +6, mensaje: "Inmortalizaste tu nombre en la piel de un fanático." } },
      { texto: "Solo agradecer", efecto: { cariño: +2, mensaje: "Fuiste cordial pero mantuviste tu distancia." } }
    ]
  },
  {
    id: "el_plateista", titulo: "El plateísta", descripcion: "Un hincha en la primera fila te grita barbaridades todo el primer tiempo.",
    opciones: [
      { texto: "Hacerle un gesto", efecto: { cariño: -1, mensaje: "Te cruzaste feo con la platea y el clima quedó tenso." } },
      { texto: "Mirarlo tras un gol", efecto: { cariño: +8, mensaje: "Le respondiste a las críticas haciendo lo que mejor sabés." } }
    ]
  }
];

// Genera un evento aleatorio
function generarEvento() {
  return EVENTOS[Math.floor(Math.random() * EVENTOS.length)];
}

// Aplica las consecuencias de la opción elegida
function aplicarEvento(jugador, evento, opcionIndex) {
  const opcion = evento.opciones[opcionIndex];
  const cariñoActual = jugador.cariño || 0;
  const nuevoCariño = Math.max(0, Math.min(100, cariñoActual + opcion.efecto.cariño));

  if (!jugador.historialEventos) jugador.historialEventos = [];
  jugador.historialEventos.push(opcion.efecto.mensaje);

  Estado.actualizar({
    cariño: nuevoCariño,
    historialEventos: jugador.historialEventos
  });

  return opcion.efecto.mensaje;
}