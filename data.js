/**
 * data.js
 * -----------------------------------------
 * Datos "crudos" del juego: selecciones, ligas, divisiones y clubes.
 * Acá NO va lógica, solo estructuras de datos.
 * -----------------------------------------
 * Nueva propiedad en clubes:
 * categoria = "grande" | "mediano" | "chico" | "diminuto"
 * Se clasifica comparando contra otros equipos DE SU MISMO PAÍS.
 */

const PAISES = [
  { id: "argentina", nombre: "Argentina", confederacion: "CONMEBOL", bandera: "Selecciones/Argentina.png" },
  { id: "brasil", nombre: "Brasil", confederacion: "CONMEBOL", bandera: "Selecciones/Brasil.png" },
  { id: "uruguay", nombre: "Uruguay", confederacion: "CONMEBOL", bandera: "Selecciones/Uruguay.png" },
  { id: "colombia", nombre: "Colombia", confederacion: "CONMEBOL", bandera: "Selecciones/Colombia.png" },
  { id: "chile", nombre: "Chile", confederacion: "CONMEBOL", bandera: "Selecciones/Chile.png" },
  { id: "ecuador", nombre: "Ecuador", confederacion: "CONMEBOL", bandera: "Selecciones/Ecuador.png" },
  { id: "paraguay", nombre: "Paraguay", confederacion: "CONMEBOL", bandera: "Selecciones/Paraguay.png" },
  { id: "peru", nombre: "Perú", confederacion: "CONMEBOL", bandera: "Selecciones/Peru.png" },
  { id: "bolivia", nombre: "Bolivia", confederacion: "CONMEBOL", bandera: "Selecciones/Bolivia.png" },
  { id: "venezuela", nombre: "Venezuela", confederacion: "CONMEBOL", bandera: "Selecciones/Venezuela.png" },
  { id: "mexico", nombre: "México", confederacion: "CONCACAF", bandera: "Selecciones/Mexico.png" },
  { id: "estados-unidos", nombre: "Estados Unidos", confederacion: "CONCACAF", bandera: "Selecciones/EstadosUnidos.png" },
  { id: "canada", nombre: "Canadá", confederacion: "CONCACAF", bandera: "Selecciones/Canada.png" },
  { id: "costa-rica", nombre: "Costa Rica", confederacion: "CONCACAF", bandera: "Selecciones/CostaRica.png" },
  { id: "panama", nombre: "Panamá", confederacion: "CONCACAF", bandera: "Selecciones/Panama.png" },
  { id: "jamaica", nombre: "Jamaica", confederacion: "CONCACAF", bandera: "Selecciones/Jamaica.png" },
  { id: "honduras", nombre: "Honduras", confederacion: "CONCACAF", bandera: "Selecciones/Honduras.png" },
  { id: "trinidad-y-tobago", nombre: "Trinidad y Tobago", confederacion: "CONCACAF", bandera: "Selecciones/Trinidad.png" },
  { id: "japon", nombre: "Japón", confederacion: "AFC", bandera: "Selecciones/Japon.png" },
  { id: "corea-del-sur", nombre: "Corea del Sur", confederacion: "AFC", bandera: "Selecciones/Corea.png" },
  { id: "iran", nombre: "Irán", confederacion: "AFC", bandera: "Selecciones/Iran.png" },
  { id: "australia", nombre: "Australia", confederacion: "AFC", bandera: "Selecciones/Australia.png" },
  { id: "arabia-saudita", nombre: "Arabia Saudita", confederacion: "AFC", bandera: "Selecciones/Arabia.png" },
  { id: "catar", nombre: "Catar", confederacion: "AFC", bandera: "Selecciones/Catar.png" },
  { id: "uzbekistan", nombre: "Uzbekistán", confederacion: "AFC", bandera: "Selecciones/Uzbekistan.png" },
  { id: "irak", nombre: "Irak", confederacion: "AFC", bandera: "Selecciones/Irak.png" },
  { id: "jordania", nombre: "Jordania", confederacion: "AFC", bandera: "Selecciones/Jordania.png" },
  { id: "indonesia", nombre: "Indonesia", confederacion: "AFC", bandera: "Selecciones/Indonesia.png" },
  { id: "marruecos", nombre: "Marruecos", confederacion: "CAF", bandera: "Selecciones/Marruecos.png" },
  { id: "senegal", nombre: "Senegal", confederacion: "CAF", bandera: "Selecciones/Senegal.png" },
  { id: "egipto", nombre: "Egipto", confederacion: "CAF", bandera: "Selecciones/Egipto.png" },
  { id: "tunez", nombre: "Túnez", confederacion: "CAF", bandera: "Selecciones/Tunez.png" },
  { id: "nigeria", nombre: "Nigeria", confederacion: "CAF", bandera: "Selecciones/Nigeria.png" },
  { id: "ghana", nombre: "Ghana", confederacion: "CAF", bandera: "Selecciones/Ghana.png" },
  { id: "argelia", nombre: "Argelia", confederacion: "CAF", bandera: "Selecciones/Argelia.png" },
  { id: "camerun", nombre: "Camerún", confederacion: "CAF", bandera: "Selecciones/Camerun.png" },
  { id: "sudafrica", nombre: "Sudáfrica", confederacion: "CAF", bandera: "Selecciones/Sudafrica.png" },
  { id: "costa-de-marfil", nombre: "Costa de Marfil", confederacion: "CAF", bandera: "Selecciones/CostaMarfil.png" },
  { id: "nueva-zelanda", nombre: "Nueva Zelanda", confederacion: "OFC", bandera: "Selecciones/NuevaZelanda.png" },
  { id: "alemania", nombre: "Alemania", confederacion: "UEFA", bandera: "Selecciones/Alemania.png" },
  { id: "espana", nombre: "España", confederacion: "UEFA", bandera: "Selecciones/España.png" },
  { id: "francia", nombre: "Francia", confederacion: "UEFA", bandera: "Selecciones/Francia.png" },
  { id: "inglaterra", nombre: "Inglaterra", confederacion: "UEFA", bandera: "Selecciones/Inglaterra.png" },
  { id: "italia", nombre: "Italia", confederacion: "UEFA", bandera: "Selecciones/Italia.png" },
  { id: "portugal", nombre: "Portugal", confederacion: "UEFA", bandera: "Selecciones/Portugal.png" },
  { id: "paises-bajos", nombre: "Países Bajos", confederacion: "UEFA", bandera: "Selecciones/PaisesBajos.png" },
  { id: "belgica", nombre: "Bélgica", confederacion: "UEFA", bandera: "Selecciones/Belgica.png" },
  { id: "croacia", nombre: "Croacia", confederacion: "UEFA", bandera: "Selecciones/Croacia.png" },
  { id: "suiza", nombre: "Suiza", confederacion: "UEFA", bandera: "Selecciones/Suiza.png" },
  { id: "serbia", nombre: "Serbia", confederacion: "UEFA", bandera: "Selecciones/Serbia.png" },
  { id: "dinamarca", nombre: "Dinamarca", confederacion: "UEFA", bandera: "Selecciones/Dinamarca.png" },
  { id: "polonia", nombre: "Polonia", confederacion: "UEFA", bandera: "Selecciones/Polonia.png" },
  { id: "austria", nombre: "Austria", confederacion: "UEFA", bandera: "Selecciones/Austria.png" },
  { id: "suecia", nombre: "Suecia", confederacion: "UEFA", bandera: "Selecciones/Suecia.png" },
  { id: "turquia", nombre: "Turquía", confederacion: "UEFA", bandera: "Selecciones/Turquia.png" },
  { id: "noruega", nombre: "Noruega", confederacion: "UEFA", bandera: "Selecciones/Noruega.png" },
  { id: "escocia", nombre: "Escocia", confederacion: "UEFA", bandera: "Selecciones/Escocia.png" },
  { id: "grecia", nombre: "Grecia", confederacion: "UEFA", bandera: "Selecciones/Grecia.png" },
  { id: "rumania", nombre: "Rumania", confederacion: "UEFA", bandera: "Selecciones/Rumania.png" },
  { id: "bosnia-y-herzegovina", nombre: "Bosnia y Herzegovina", confederacion: "UEFA", bandera: "Selecciones/Bosnia.png" },
  { id: "hungria", nombre: "Hungría", confederacion: "UEFA", bandera: "Selecciones/Hungria.png" },
  { id: "islandia", nombre: "Islandia", confederacion: "UEFA", bandera: "Selecciones/Islandia.png" },
  { id: "gales", nombre: "Gales", confederacion: "UEFA", bandera: "Selecciones/Gales.png" },
];

const LIGAS_POR_PAIS = {
  "argentina": [
    { id: "liga-profesional-argentina", nombre: "Liga Profesional" },
  ],
  "brasil": [
    { id: "brasileirao-brasil", nombre: "Brasileirão" },
  ],
  "alemania": [
    { id: "bundesliga-alemania", nombre: "Bundesliga" },
  ],
  "espana": [
    { id: "laliga-espana", nombre: "LaLiga" },
  ],
  "italia": [
    { id: "serie-a-italia", nombre: "Serie A" },
  ],
  "francia": [
    { id: "ligue-1-francia", nombre: "Ligue 1" },
  ],
  "inglaterra": [
    { id: "premier-league-inglaterra", nombre: "Premier League" },
  ]
};

const DIVISIONES_POR_LIGA = {
  "liga-profesional-argentina": [
    { id: "primera-division-argentina", nombre: "Primera División" },
    { id: "primera-nacional-argentina", nombre: "Primera Nacional" },
  ],
  "brasileirao-brasil": [
    { id: "serie-a-brasil", nombre: "Série A" },
  ],
  "bundesliga-alemania": [
    { id: "bundesliga-alemania", nombre: "Bundesliga" },
  ],
  "laliga-espana": [
    { id: "primera-division-espana", nombre: "Primera División" },
  ],
  "serie-a-italia": [
    { id: "serie-a-italia", nombre: "Serie A" },
  ],
  "ligue-1-francia": [
    { id: "ligue-1-francia", nombre: "Ligue 1" },
  ],
  "premier-league-inglaterra": [
    { id: "premier-league-inglaterra", nombre: "Premier League" },
  ]
};

const CLUBES_POR_DIVISION = {
  "primera-division-argentina": [
    { id: "aldosivi", nombre: "Aldosivi", escudo: "CONMEBOL/Argentina/Aldosivi.png", categoria: "chico" },
    { id: "argentinos-juniors", nombre: "Argentinos Juniors", escudo: "CONMEBOL/Argentina/Argentinosjrs.png", categoria: "mediano" },
    { id: "atletico-tucuman", nombre: "Atlético Tucumán", escudo: "CONMEBOL/Argentina/AtleticoTucuman.png", categoria: "chico" },
    { id: "banfield", nombre: "Banfield", escudo: "CONMEBOL/Argentina/Banfield.png", categoria: "mediano" },
    { id: "barracas-central", nombre: "Barracas Central", escudo: "CONMEBOL/Argentina/Barracas.png", categoria: "diminuto" },
    { id: "belgrano", nombre: "Belgrano", escudo: "CONMEBOL/Argentina/Belgrano.png", categoria: "mediano" },
    { id: "boca-juniors", nombre: "Boca Juniors", escudo: "CONMEBOL/Argentina/Boca.png", categoria: "grande" },
    { id: "central-cordoba", nombre: "Central Córdoba", escudo: "CONMEBOL/Argentina/CentralCordoba.png", categoria: "chico" },
    { id: "defensa-y-justicia", nombre: "Defensa y Justicia", escudo: "CONMEBOL/Argentina/DefensayJusticia.png", categoria: "mediano" },
    { id: "deportivo-riestra", nombre: "Deportivo Riestra", escudo: "CONMEBOL/Argentina/Riestra.png", categoria: "diminuto" },
    { id: "estudiantes-lp", nombre: "Estudiantes (LP)", escudo: "CONMEBOL/Argentina/EstudiantesPlata.png", categoria: "mediano" },
    { id: "estudiantes-rc", nombre: "Estudiantes (RC)", escudo: "CONMEBOL/Argentina/EstudiantesRioCuarto.png", categoria: "diminuto" },
    { id: "gimnasia-lp", nombre: "Gimnasia y Esgrima (LP)", escudo: "CONMEBOL/Argentina/GimnasiayEsgrima.png", categoria: "mediano" },
    { id: "gimnasia-m", nombre: "Gimnasia y Esgrima (M)", escudo: "CONMEBOL/Argentina/GimnasiaMendoza.png", categoria: "diminuto" },
    { id: "huracan", nombre: "Huracán", escudo: "CONMEBOL/Argentina/Huracan.png", categoria: "mediano" },
    { id: "independiente", nombre: "Independiente", escudo: "CONMEBOL/Argentina/Independiente.png", categoria: "grande" },
    { id: "independiente-rivadavia", nombre: "Independiente Rivadavia", escudo: "CONMEBOL/Argentina/IndependienteRivadavia.png", categoria: "diminuto" },
    { id: "instituto", nombre: "Instituto", escudo: "CONMEBOL/Argentina/InstitutoCordoba.png", categoria: "mediano" },
    { id: "lanus", nombre: "Lanús", escudo: "CONMEBOL/Argentina/Lanus.png", categoria: "mediano" },
    { id: "newells", nombre: "Newell's Old Boys", escudo: "CONMEBOL/Argentina/Newells.png", categoria: "mediano" },
    { id: "platense", nombre: "Platense", escudo: "CONMEBOL/Argentina/Platense.png", categoria: "chico" },
    { id: "racing-club", nombre: "Racing Club", escudo: "CONMEBOL/Argentina/Racing.png", categoria: "grande" },
    { id: "river-plate", nombre: "River Plate", escudo: "CONMEBOL/Argentina/River.png", categoria: "grande" },
    { id: "rosario-central", nombre: "Rosario Central", escudo: "CONMEBOL/Argentina/RosarioCentral.png", categoria: "mediano" },
    { id: "san-lorenzo", nombre: "San Lorenzo", escudo: "CONMEBOL/Argentina/SanLorenzo.png", categoria: "grande" },
    { id: "sarmiento", nombre: "Sarmiento", escudo: "CONMEBOL/Argentina/SarmientoJunin.png", categoria: "chico" },
    { id: "talleres", nombre: "Talleres", escudo: "CONMEBOL/Argentina/Talleres.png", categoria: "mediano" },
    { id: "tigre", nombre: "Tigre", escudo: "CONMEBOL/Argentina/Tigre.png", categoria: "chico" },
    { id: "union", nombre: "Unión", escudo: "CONMEBOL/Argentina/UnionSantaFe.png", categoria: "mediano" },
    { id: "velez-sarsfield", nombre: "Vélez Sarsfield", escudo: "CONMEBOL/Argentina/Velez.png", categoria: "mediano" }
  ],
  "serie-a-brasil": [
    { id: "athletico-paranaense", nombre: "Athletico Paranaense", escudo: "CONMEBOL/Brasil/Paranaense.png", categoria: "mediano" },
    { id: "atletico-mineiro", nombre: "Atlético Mineiro", escudo: "CONMEBOL/Brasil/Mineiro.png", categoria: "grande" },
    { id: "bahia", nombre: "Bahia", escudo: "CONMEBOL/Brasil/Bahia.png", categoria: "mediano" },
    { id: "botafogo", nombre: "Botafogo", escudo: "CONMEBOL/Brasil/Botafogo.png", categoria: "grande" },
    { id: "bragantino", nombre: "Bragantino", escudo: "CONMEBOL/Brasil/Bragantino.png", categoria: "mediano" },
    { id: "chapecoense", nombre: "Chapecoense", escudo: "CONMEBOL/Brasil/Chapecoense.png", categoria: "chico" },
    { id: "corinthians", nombre: "Corinthians", escudo: "CONMEBOL/Brasil/Corinthians.png", categoria: "grande" },
    { id: "coritiba", nombre: "Coritiba", escudo: "CONMEBOL/Brasil/Coritiba.png", categoria: "chico" },
    { id: "cruzeiro", nombre: "Cruzeiro", escudo: "CONMEBOL/Brasil/Cruzeiro.png", categoria: "grande" },
    { id: "flamengo", nombre: "Flamengo", escudo: "CONMEBOL/Brasil/Flamengo.png", categoria: "grande" },
    { id: "fluminense", nombre: "Fluminense", escudo: "CONMEBOL/Brasil/Fluminense.png", categoria: "grande" },
    { id: "gremio", nombre: "Grêmio", escudo: "CONMEBOL/Brasil/Gremio.png", categoria: "grande" },
    { id: "internacional", nombre: "Internacional", escudo: "CONMEBOL/Brasil/Internacional.png", categoria: "grande" },
    { id: "mirassol", nombre: "Mirassol", escudo: "CONMEBOL/Brasil/Mirassol.png", categoria: "diminuto" },
    { id: "palmeiras", nombre: "Palmeiras", escudo: "CONMEBOL/Brasil/Palmeiras.png", categoria: "grande" },
    { id: "remo", nombre: "Remo", escudo: "CONMEBOL/Brasil/Remo.png", categoria: "diminuto" },
    { id: "santos", nombre: "Santos", escudo: "CONMEBOL/Brasil/Santos.png", categoria: "grande" },
    { id: "sao-paulo", nombre: "São Paulo", escudo: "CONMEBOL/Brasil/SaoPaulo.png", categoria: "grande" },
    { id: "vasco-da-gama", nombre: "Vasco da Gama", escudo: "CONMEBOL/Brasil/Vasco.png", categoria: "grande" },
    { id: "vitoria", nombre: "Vitória", escudo: "CONMEBOL/Brasil/Vitoria.png", categoria: "chico" }
  ],
  "bundesliga-alemania": [
    { id: "augsburg", nombre: "Augsburg", escudo: "UEFA/Alemania/Augsburg.png", categoria: "chico" },
    { id: "bayern-munich", nombre: "Bayern Múnich", escudo: "UEFA/Alemania/Bayern.png", categoria: "grande" },
    { id: "bayer-leverkusen", nombre: "Bayer Leverkusen", escudo: "UEFA/Alemania/Leverkusen.png", categoria: "grande" },
    { id: "borussia-dortmund", nombre: "Borussia Dortmund", escudo: "UEFA/Alemania/Borussia.png", categoria: "grande" },
    { id: "borussia-monchengladbach", nombre: "Borussia Mönchengladbach", escudo: "UEFA/Alemania/BorussiaMonchen.png", categoria: "mediano" },
    { id: "colonia", nombre: "Colonia", escudo: "UEFA/Alemania/Cologne.png", categoria: "mediano" },
    { id: "eintracht-francfort", nombre: "Eintracht Fráncfort", escudo: "UEFA/Alemania/Frankfurt.png", categoria: "mediano" },
    { id: "elversberg", nombre: "Elversberg", escudo: "UEFA/Alemania/Elversberg.png", categoria: "diminuto" },
    { id: "friburgo", nombre: "Freidburg", escudo: "UEFA/Alemania/Freidburg.png", categoria: "mediano" },
    { id: "hamburgo", nombre: "Hamburgo", escudo: "UEFA/Alemania/Hamburger.png", categoria: "mediano" },
    { id: "hoffenheim", nombre: "Hoffenheim", escudo: "UEFA/Alemania/Hoffenheim.png", categoria: "mediano" },
    { id: "mainz-05", nombre: "Mainz 05", escudo: "UEFA/Alemania/Mainz.png", categoria: "chico" },
    { id: "paderborn", nombre: "Paderborn", escudo: "UEFA/Alemania/Paderborn.png", categoria: "diminuto" },
    { id: "rb-leipzig", nombre: "RB Leipzig", escudo: "UEFA/Alemania/Leipzig.png", categoria: "grande" },
    { id: "schalke-04", nombre: "Schalke 04", escudo: "UEFA/Alemania/Schalke.png", categoria: "mediano" },
    { id: "stuttgart", nombre: "Stuttgart", escudo: "UEFA/Alemania/Stuttgart.png", categoria: "mediano" },
    { id: "union-berlin", nombre: "Union Berlín", escudo: "UEFA/Alemania/Berlin.png", categoria: "chico" },
    { id: "werder-bremen", nombre: "Werder Bremen", escudo: "UEFA/Alemania/Werder.png", categoria: "mediano" }
  ],
  "primera-division-espana": [
    { id: "alaves", nombre: "Alavés", escudo: "UEFA/España/Alaves.png", categoria: "chico" },
    { id: "athletic-bilbao", nombre: "Athletic Bilbao", escudo: "UEFA/España/Bilbao.png", categoria: "mediano" },
    { id: "atletico-madrid", nombre: "Atlético Madrid", escudo: "UEFA/España/AtleticoMadrid.png", categoria: "grande" },
    { id: "barcelona", nombre: "Barcelona", escudo: "UEFA/España/Barcelona.png", categoria: "grande" },
    { id: "celta-vigo", nombre: "Celta Vigo", escudo: "UEFA/España/Celta.png", categoria: "chico" },
    { id: "deportivo-la-coruna", nombre: "Deportivo La Coruña", escudo: "UEFA/España/Coruña.png", categoria: "diminuto" },
    { id: "elche", nombre: "Elche", escudo: "UEFA/España/Elche.png", categoria: "chico" },
    { id: "espanyol", nombre: "Espanyol", escudo: "UEFA/España/Espanyol.png", categoria: "chico" },
    { id: "getafe", nombre: "Getafe", escudo: "UEFA/España/Getafe.png", categoria: "chico" },
    { id: "levante", nombre: "Levante", escudo: "UEFA/España/Levante.png", categoria: "chico" },
    { id: "malaga", nombre: "Málaga", escudo: "UEFA/España/Malaga.png", categoria: "chico" },
    { id: "osasuna", nombre: "Osasuna", escudo: "UEFA/España/Osasuna.png", categoria: "chico" },
    { id: "racing-santander", nombre: "Racing Santander", escudo: "UEFA/España/Santander.png", categoria: "diminuto" },
    { id: "rayo-vallecano", nombre: "Rayo Vallecano", escudo: "UEFA/España/Rayovallecano.png", categoria: "chico" },
    { id: "real-betis", nombre: "Real Betis", escudo: "UEFA/España/Betis.png", categoria: "mediano" },
    { id: "real-madrid", nombre: "Real Madrid", escudo: "UEFA/España/RealMadrid.png", categoria: "grande" },
    { id: "real-sociedad", nombre: "Real Sociedad", escudo: "UEFA/España/Realsociedad.png", categoria: "mediano" },
    { id: "sevilla", nombre: "Sevilla", escudo: "UEFA/España/Sevilla.png", categoria: "mediano" },
    { id: "valencia", nombre: "Valencia", escudo: "UEFA/España/Valencia.png", categoria: "mediano" },
    { id: "villarreal", nombre: "Villarreal", escudo: "UEFA/España/Villareal", categoria: "mediano" }
  ],
  "serie-a-italia": [
    { id: "atalanta", nombre: "Atalanta", escudo: "UEFA/Italia/Atalanta.png", categoria: "mediano" },
    { id: "bologna", nombre: "Bologna", escudo: "UEFA/Italia/Bologna.png", categoria: "mediano" },
    { id: "cagliari", nombre: "Cagliari", escudo: "UEFA/Italia/Cagliari.png", categoria: "mediano" },
    { id: "como", nombre: "Como", escudo: "UEFA/Italia/Como.png", categoria: "chico" },
    { id: "fiorentina", nombre: "Fiorentina", escudo: "UEFA/Italia/Fiorentina.png", categoria: "mediano" },
    { id: "frosinone", nombre: "Frosinone", escudo: "UEFA/Italia/Frosinone.png", categoria: "chico" },
    { id: "genoa", nombre: "Genoa", escudo: "UEFA/Italia/Genoa.png", categoria: "mediano" },
    { id: "inter", nombre: "Inter", escudo: "UEFA/Italia/Inter.png", categoria: "grande" },
    { id: "juventus", nombre: "Juventus", escudo: "UEFA/Italia/Juventus.png", categoria: "grande" },
    { id: "lazio", nombre: "Lazio", escudo: "UEFA/Italia/Lazio.png", categoria: "grande" },
    { id: "lecce", nombre: "Lecce", escudo: "UEFA/Italia/Lecce.png", categoria: "chico" },
    { id: "milan", nombre: "Milan", escudo: "UEFA/Italia/Milan.png", categoria: "grande" },
    { id: "monza", nombre: "Monza", escudo: "UEFA/Italia/Monza.png", categoria: "chico" },
    { id: "napoli", nombre: "Napoli", escudo: "UEFA/Italia/Napoli.png", categoria: "grande" },
    { id: "parma", nombre: "Parma", escudo: "UEFA/Italia/Parma.png", categoria: "chico" },
    { id: "roma", nombre: "Roma", escudo: "UEFA/Italia/Roma.png", categoria: "grande" },
    { id: "sassuolo", nombre: "Sassuolo", escudo: "UEFA/Italia/Sassuolo.png", categoria: "chico" },
    { id: "torino", nombre: "Torino", escudo: "UEFA/Italia/Torino.png", categoria: "mediano" },
    { id: "udinese", nombre: "Udinese", escudo: "UEFA/Italia/Udinese.png", categoria: "mediano" },
    { id: "venezia", nombre: "Venezia", escudo: "UEFA/Italia/Venezia.png", categoria: "chico" }
  ],
  "ligue-1-francia": [
    { id: "angers", nombre: "Angers", escudo: "UEFA/Francia/Angers.png", categoria: "chico" },
    { id: "auxerre", nombre: "Auxerre", escudo: "UEFA/Francia/Auxerre.png", categoria: "chico" },
    { id: "brest", nombre: "Brest", escudo: "UEFA/Francia/Brest.png", categoria: "mediano" },
    { id: "estrasburgo", nombre: "Estrasburgo", escudo: "UEFA/Francia/Estrasburgo.png", categoria: "mediano" },
    { id: "le-havre", nombre: "Le Havre", escudo: "UEFA/Francia/Havre.png", categoria: "chico" },
    { id: "le-mans", nombre: "Le Mans", escudo: "UEFA/Francia/Mans.png", categoria: "diminuto" },
    { id: "lens", nombre: "Lens", escudo: "UEFA/Francia/Lens.png", categoria: "mediano" },
    { id: "lille", nombre: "Lille", escudo: "UEFA/Francia/Lille.png", categoria: "mediano" },
    { id: "lorient", nombre: "Lorient", escudo: "UEFA/Francia/Lorient.png", categoria: "chico" },
    { id: "lyon", nombre: "Lyon", escudo: "UEFA/Francia/Lyon.png", categoria: "grande" },
    { id: "marsella", nombre: "Marsella", escudo: "UEFA/Francia/Olimpiquemarsella.png", categoria: "grande" },
    { id: "monaco", nombre: "Mónaco", escudo: "UEFA/Francia/Monaco.png", categoria: "grande" },
    { id: "niza", nombre: "Niza", escudo: "UEFA/Francia/Nice.png", categoria: "mediano" },
    { id: "paris-fc", nombre: "París FC", escudo: "UEFA/Francia/Paris.png", categoria: "diminuto" },
    { id: "psg", nombre: "PSG", escudo: "UEFA/Francia/PSG.png", categoria: "grande" },
    { id: "rennes", nombre: "Rennes", escudo: "UEFA/Francia/Rennes.png", categoria: "mediano" },
    { id: "toulouse", nombre: "Toulouse", escudo: "UEFA/Francia/Toulouse.png", categoria: "chico" },
    { id: "troyes", nombre: "Troyes", escudo: "UEFA/Francia/Troyes.png", categoria: "chico" }
  ],
  "premier-league-inglaterra": [
    { id: "arsenal", nombre: "Arsenal", escudo: "UEFA/Inglaterra/Arsenal.png", categoria: "grande" },
    { id: "aston-villa", nombre: "Aston Villa", escudo: "UEFA/Inglaterra/Aston.png", categoria: "mediano" },
    { id: "bournemouth", nombre: "Bournemouth", escudo: "UEFA/Inglaterra/Bournemouth.png", categoria: "chico" },
    { id: "brentford", nombre: "Brentford", escudo: "UEFA/Inglaterra/Brentford.png", categoria: "chico" },
    { id: "brighton", nombre: "Brighton", escudo: "UEFA/Inglaterra/Brighton.png", categoria: "mediano" },
    { id: "chelsea", nombre: "Chelsea", escudo: "UEFA/Inglaterra/Chelsea.png", categoria: "grande" },
    { id: "coventry-city", nombre: "Coventry City", escudo: "UEFA/Inglaterra/Coventry.png", categoria: "chico" },
    { id: "crystal-palace", nombre: "Crystal Palace", escudo: "UEFA/Inglaterra/CrystalPalace.png", categoria: "mediano" },
    { id: "everton", nombre: "Everton", escudo: "UEFA/Inglaterra/Everton.png", categoria: "mediano" },
    { id: "fulham", nombre: "Fulham", escudo: "UEFA/Inglaterra/Fulham.png", categoria: "mediano" },
    { id: "hull-city", nombre: "Hull City", escudo: "UEFA/Inglaterra/HullCity.png", categoria: "chico" },
    { id: "ipswich-town", nombre: "Ipswich Town", escudo: "UEFA/Inglaterra/Ipswich.png", categoria: "chico" },
    { id: "leeds-united", nombre: "Leeds United", escudo: "UEFA/Inglaterra/Leeds.png", categoria: "mediano" },
    { id: "liverpool", nombre: "Liverpool", escudo: "UEFA/Inglaterra/Liverpool.png", categoria: "grande" },
    { id: "manchester-city", nombre: "Manchester City", escudo: "UEFA/Inglaterra/Mancity.png", categoria: "grande" },
    { id: "manchester-united", nombre: "Manchester United", escudo: "UEFA/Inglaterra/Manunited.png", categoria: "grande" },
    { id: "newcastle", nombre: "Newcastle", escudo: "UEFA/Inglaterra/Newcastle.png", categoria: "mediano" },
    { id: "nottingham-forest", nombre: "Nottingham Forest", escudo: "UEFA/Inglaterra/Nottingham.png", categoria: "chico" },
    { id: "sunderland", nombre: "Sunderland", escudo: "UEFA/Inglaterra/Sunderland.png", categoria: "chico" },
    { id: "tottenham", nombre: "Tottenham", escudo: "UEFA/Inglaterra/Tottenham.png", categoria: "grande" }
  ],
};

/**
 * ESCUDOS Y BANDERAS
 * -----------------------------------------
 * Agregado: "categoria" para calcular puntos futuros
 */