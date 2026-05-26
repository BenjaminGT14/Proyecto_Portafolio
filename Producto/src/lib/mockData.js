export const categoriasMock = [
  { id_categoria: 'cat-parque', nombre: 'Parques y naturaleza', icono: 'trees' },
  { id_categoria: 'cat-museo', nombre: 'Museos', icono: 'landmark' },
  { id_categoria: 'cat-teatro', nombre: 'Teatros', icono: 'drama' },
  { id_categoria: 'cat-historico', nombre: 'Sitios históricos', icono: 'building-2' },
  { id_categoria: 'cat-comunitario', nombre: 'Actividades comunitarias', icono: 'users' },
  { id_categoria: 'cat-iglesia', nombre: 'Iglesias y patrimonio', icono: 'church' },
]

export const comunasSantiago = [
  'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Reina',
  'Vitacura', 'Maipú', 'La Florida', 'Puente Alto', 'San Miguel',
  'Recoleta', 'Independencia', 'Estación Central', 'Cerrillos', 'Macul',
  'Peñalolén', 'Lo Barnechea', 'Quilicura', 'Huechuraba', 'Renca',
]

// Lugares enriquecidos con datos de Wikipedia en español + imágenes de Wikimedia Commons.
// Fuente: https://es.wikipedia.org/api/rest_v1/page/summary/<slug>
// Para regenerar: `npm run fetch:wikipedia` (ver scripts/fetch-wikipedia-lugares.mjs).
// Campos curados localmente: id_categoria, direccion, comuna, es_gratuito, horario.
// Campos desde Wikipedia: descripcion (extract), latitud, longitud, imagen_url (originalimage @1280px).
export const lugaresMock = [
  {
    id_lugar: 'lugar-1',
    id_categoria: 'cat-parque',
    nombre: 'Parque Metropolitano de Santiago',
    descripcion:
      'Parque urbano formado por los cerros San Cristóbal, Chacarillas, Los Gemelos, Pirámide, Polanco y El Carbón. Con más de 750 hectáreas entre Huechuraba, Providencia, Recoleta y Vitacura, es el parque urbano más extenso de Sudamérica y el cuarto más grande del mundo.',
    direccion: 'Pío Nono 450',
    comuna: 'Recoleta',
    latitud: -33.42369167,
    longitud: -70.63261111,
    es_gratuito: true,
    horario: 'Lun a Dom 08:30 - 20:00',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/J25_317_Cerro_San_Crist%C3%B3bal.jpg/1280px-J25_317_Cerro_San_Crist%C3%B3bal.jpg',
    wikipedia_slug: 'Parque_Metropolitano_de_Santiago',
  },
  {
    id_lugar: 'lugar-2',
    id_categoria: 'cat-museo',
    nombre: 'Museo Nacional de Bellas Artes',
    descripcion:
      'Uno de los principales centros de difusión de las artes visuales en Chile. Fundado el 18 de septiembre de 1880 como Museo Nacional de Pinturas, es el primer museo de arte de Latinoamérica.',
    direccion: 'José Miguel de la Barra 650',
    comuna: 'Santiago',
    latitud: -33.435322,
    longitud: -70.643569,
    es_gratuito: true,
    horario: 'Mar a Dom 10:00 - 18:50',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Museo_Nacional_de_Bellas_Artes%2C_Santiago_20230311.jpg/1280px-Museo_Nacional_de_Bellas_Artes%2C_Santiago_20230311.jpg',
    wikipedia_slug: 'Museo_Nacional_de_Bellas_Artes_de_Chile',
  },
  {
    id_lugar: 'lugar-3',
    id_categoria: 'cat-teatro',
    nombre: 'Teatro Municipal de Santiago',
    descripcion:
      'Ubicado en el centro de Santiago, su construcción comenzó en 1853 y fue inaugurado el 17 de septiembre de 1857 con la ópera Ernani de Giuseppe Verdi. Principal teatro de ópera de Chile.',
    direccion: 'Agustinas 794',
    comuna: 'Santiago',
    latitud: -33.44083333,
    longitud: -70.6475,
    es_gratuito: false,
    horario: 'Según programación',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Teatro_Municipal%2C_Santiago_20230521_01.jpg/1280px-Teatro_Municipal%2C_Santiago_20230521_01.jpg',
    wikipedia_slug: 'Teatro_Municipal_de_Santiago',
  },
  {
    id_lugar: 'lugar-4',
    id_categoria: 'cat-parque',
    nombre: 'Cerro Santa Lucía',
    descripcion:
      'Antiguamente llamado cerro Huelén en picunche, es un parque urbano ubicado en el corazón de Santiago. Cuenta con fortificaciones del siglo XIX, jardines y miradores con vista a la ciudad.',
    direccion: 'Av. Libertador Bernardo O\'Higgins',
    comuna: 'Santiago',
    latitud: -33.44027778,
    longitud: -70.64416667,
    es_gratuito: true,
    horario: 'Lun a Dom 09:00 - 19:00',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Vista_lateral_Cerro_Santa_Lucia.jpg/1280px-Vista_lateral_Cerro_Santa_Lucia.jpg',
    wikipedia_slug: 'Cerro_Santa_Luc%C3%ADa',
  },
  {
    id_lugar: 'lugar-5',
    id_categoria: 'cat-historico',
    nombre: 'Palacio de La Moneda',
    descripcion:
      'Sede del Gobierno de Chile y residencia oficial del presidente de la República. Visitas guiadas, cambio de guardia y Centro Cultural La Moneda en su subterráneo.',
    direccion: 'Moneda S/N',
    comuna: 'Santiago',
    latitud: -33.443018,
    longitud: -70.65387,
    es_gratuito: true,
    horario: 'Acceso público a Plaza de la Constitución',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Palacio_de_La_Moneda_-_miguelreflex.jpg/1280px-Palacio_de_La_Moneda_-_miguelreflex.jpg',
    wikipedia_slug: 'Palacio_de_La_Moneda',
  },
  {
    id_lugar: 'lugar-6',
    id_categoria: 'cat-museo',
    nombre: 'Museo de la Memoria y los Derechos Humanos',
    descripcion:
      'Museo público dedicado a conmemorar a las víctimas de violaciones a los Derechos Humanos durante la dictadura militar de Augusto Pinochet (1973-1990). Ubicado frente a la estación de Metro Quinta Normal.',
    direccion: 'Matucana 501',
    comuna: 'Santiago',
    latitud: -33.43983889,
    longitud: -70.679375,
    es_gratuito: true,
    horario: 'Mar a Dom 10:00 - 18:00',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Museo_de_la_Memoria_y_los_Derechos_Humanos.jpg/1280px-Museo_de_la_Memoria_y_los_Derechos_Humanos.jpg',
    wikipedia_slug: 'Museo_de_la_Memoria_y_los_Derechos_Humanos',
  },
  {
    id_lugar: 'lugar-7',
    id_categoria: 'cat-iglesia',
    nombre: 'Catedral Metropolitana de Santiago',
    descripcion:
      'Sede de la arquidiócesis de Santiago de Chile y principal templo de la Iglesia católica en el país. Ubicada en la Plaza de Armas, en pleno centro histórico.',
    direccion: 'Plaza de Armas S/N',
    comuna: 'Santiago',
    latitud: -33.43765833,
    longitud: -70.65180556,
    es_gratuito: true,
    horario: 'Lun a Dom 09:00 - 19:00',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Catedral_de_Santiago.tif/lossy-page1-1280px-Catedral_de_Santiago.tif.jpg',
    wikipedia_slug: 'Catedral_Metropolitana_de_Santiago',
  },
  {
    id_lugar: 'lugar-8',
    id_categoria: 'cat-parque',
    nombre: 'Parque Bicentenario',
    descripcion:
      'Parque público de 30 hectáreas situado en Vitacura, contenido por la Avenida Bicentenario y el río Mapocho. Conocido por sus lagunas con flamencos y áreas verdes.',
    direccion: 'Av. Bicentenario 3800',
    comuna: 'Vitacura',
    latitud: -33.39988611,
    longitud: -70.60213611,
    es_gratuito: true,
    horario: 'Lun a Dom 07:00 - 22:00',
    imagen_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Parque_Bicentenario%2C_Vitacura%2C_Santiago_20200314_02.jpg/1280px-Parque_Bicentenario%2C_Vitacura%2C_Santiago_20200314_02.jpg',
    wikipedia_slug: 'Parque_Bicentenario_(Vitacura)',
  },
]

export const eventosMock = [
  {
    id_evento: 'evento-1',
    id_lugar: 'lugar-3',
    nombre: 'Ópera Carmen — Temporada 2026',
    descripcion: 'La famosa ópera de Bizet en el Teatro Municipal. 4 funciones en marzo.',
    fecha_inicio: '2026-06-12T20:00:00-03:00',
    fecha_fin: '2026-06-12T23:00:00-03:00',
    es_gratuito: false,
    precio: 35000,
    imagen_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
    lugar: { nombre: 'Teatro Municipal de Santiago', comuna: 'Santiago' },
  },
  {
    id_evento: 'evento-2',
    id_lugar: 'lugar-1',
    nombre: 'Yoga al aire libre en el San Cristóbal',
    descripcion: 'Clase gratuita de yoga al amanecer en la cumbre del cerro.',
    fecha_inicio: '2026-06-08T07:30:00-03:00',
    fecha_fin: '2026-06-08T08:30:00-03:00',
    es_gratuito: true,
    precio: 0,
    imagen_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
    lugar: { nombre: 'Parque Metropolitano de Santiago', comuna: 'Recoleta' },
  },
  {
    id_evento: 'evento-3',
    id_lugar: 'lugar-2',
    nombre: 'Exposición: Arte Contemporáneo Chileno',
    descripcion: 'Muestra colectiva de 12 artistas chilenos contemporáneos.',
    fecha_inicio: '2026-06-01T10:00:00-03:00',
    fecha_fin: '2026-08-30T18:00:00-03:00',
    es_gratuito: true,
    precio: 0,
    imagen_url: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800',
    lugar: { nombre: 'Museo Nacional de Bellas Artes', comuna: 'Santiago' },
  },
  {
    id_evento: 'evento-4',
    id_lugar: 'lugar-6',
    nombre: 'Conversatorio: Memoria y Democracia',
    descripcion: 'Mesa redonda con historiadores y activistas.',
    fecha_inicio: '2026-06-15T18:30:00-03:00',
    fecha_fin: '2026-06-15T20:30:00-03:00',
    es_gratuito: true,
    precio: 0,
    imagen_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    lugar: { nombre: 'Museo de la Memoria y los Derechos Humanos', comuna: 'Santiago' },
  },
  {
    id_evento: 'evento-5',
    id_lugar: 'lugar-8',
    nombre: 'Feria de Emprendedores Bicentenario',
    descripcion: 'Más de 80 emprendedores locales con productos artesanales y gastronomía.',
    fecha_inicio: '2026-06-21T11:00:00-03:00',
    fecha_fin: '2026-06-21T19:00:00-03:00',
    es_gratuito: true,
    precio: 0,
    imagen_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    lugar: { nombre: 'Parque Bicentenario', comuna: 'Vitacura' },
  },
]

// === Reseñas y votos (mock) =====================================
// Se mutan in-memory: publicar / votar afecta este array mientras
// la app está abierta. Al recargar se restablecen los valores iniciales.

// Avatares determinísticos vía DiceBear (iniciales). Estables y sin 404.
const dicebear = (nombre) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nombre)}&backgroundColor=c04f23&textColor=ffffff&radius=50`

export const usuariosMock = [
  { id_usuario: 'u-andrea', nombre: 'Andrea Valdés', avatar_url: dicebear('Andrea Valdés') },
  { id_usuario: 'u-ricardo', nombre: 'Ricardo Soto', avatar_url: dicebear('Ricardo Soto') },
  { id_usuario: 'u-elena', nombre: 'Elena Rojas', avatar_url: dicebear('Elena Rojas') },
  { id_usuario: 'u-matias', nombre: 'Matías Pizarro', avatar_url: dicebear('Matías Pizarro') },
  { id_usuario: 'u-camila', nombre: 'Camila Bravo', avatar_url: dicebear('Camila Bravo') },
  { id_usuario: 'u-demo', nombre: 'Tú (modo demo)', avatar_url: dicebear('Demo') },
]

export const resenasMock = [
  {
    id_resena: 'r-1',
    id_usuario: 'u-andrea',
    id_lugar: 'lugar-2',
    id_evento: null,
    titulo: 'Imperdible los domingos',
    contenido: 'El Museo de Bellas Artes es increíble los domingos, la entrada gratuita es un gran beneficio. Muy recomendado para ir en familia.',
    puntuacion: 5,
    estado: 'visible',
    created_at: '2026-05-24T14:20:00-03:00',
  },
  {
    id_resena: 'r-2',
    id_usuario: 'u-ricardo',
    id_lugar: 'lugar-4',
    id_evento: null,
    titulo: 'Buen panorama gratis',
    contenido: 'Fui al Cerro Santa Lucía el sábado pasado. Un poco lleno pero ideal para desconectarse de la ciudad. Traigan protector solar.',
    puntuacion: 4,
    estado: 'visible',
    created_at: '2026-05-21T11:00:00-03:00',
  },
  {
    id_resena: 'r-3',
    id_usuario: 'u-elena',
    id_lugar: null,
    id_evento: 'evento-1',
    titulo: 'Producción de primer nivel',
    contenido: 'La ópera estuvo impecable. Muy buena acústica del Municipal y la dirección de orquesta superlativa.',
    puntuacion: 5,
    estado: 'visible',
    created_at: '2026-05-25T22:00:00-03:00',
  },
  {
    id_resena: 'r-4',
    id_usuario: 'u-matias',
    id_lugar: 'lugar-1',
    id_evento: null,
    titulo: 'Mejor temprano',
    contenido: 'El cerro San Cristóbal vale toda la pena, pero suban temprano para evitar las filas del funicular y el calor.',
    puntuacion: 4,
    estado: 'visible',
    created_at: '2026-05-22T09:00:00-03:00',
  },
  {
    id_resena: 'r-5',
    id_usuario: 'u-camila',
    id_lugar: null,
    id_evento: 'evento-2',
    titulo: 'Una experiencia única',
    contenido: 'Yoga al amanecer con vista a Santiago. Pocas cosas pueden compararse con esto. Llegar 15 min antes para alcanzar buen lugar.',
    puntuacion: 5,
    estado: 'visible',
    created_at: '2026-05-23T07:45:00-03:00',
  },
  {
    id_resena: 'r-6',
    id_usuario: 'u-andrea',
    id_lugar: 'lugar-5',
    id_evento: null,
    titulo: 'Visita guiada recomendable',
    contenido: 'El cambio de guardia es protocolar y vistoso. El Centro Cultural bajo La Moneda tiene siempre exposiciones interesantes.',
    puntuacion: 4,
    estado: 'visible',
    created_at: '2026-05-20T17:30:00-03:00',
  },
]

export const votosMock = [
  { id_voto: 'v-1', id_usuario: 'u-elena', id_resena: 'r-1', es_positivo: true },
  { id_voto: 'v-2', id_usuario: 'u-matias', id_resena: 'r-1', es_positivo: true },
  { id_voto: 'v-3', id_usuario: 'u-camila', id_resena: 'r-1', es_positivo: true },
  { id_voto: 'v-4', id_usuario: 'u-andrea', id_resena: 'r-3', es_positivo: true },
  { id_voto: 'v-5', id_usuario: 'u-matias', id_resena: 'r-3', es_positivo: true },
  { id_voto: 'v-6', id_usuario: 'u-andrea', id_resena: 'r-2', es_positivo: true },
  { id_voto: 'v-7', id_usuario: 'u-ricardo', id_resena: 'r-5', es_positivo: true },
  { id_voto: 'v-8', id_usuario: 'u-elena', id_resena: 'r-5', es_positivo: true },
  { id_voto: 'v-9', id_usuario: 'u-camila', id_resena: 'r-4', es_positivo: false },
]
