#!/usr/bin/env node
/**
 * Refresca los datos de cada lugar desde Wikipedia en español.
 *
 *   - Toma los slugs definidos en LUGARES_CURADOS abajo (id, categoría, dirección, comuna,
 *     gratuidad, horario y wikipedia_slug — todo lo que NO está en Wikipedia).
 *   - Para cada uno hace GET a https://es.wikipedia.org/api/rest_v1/page/summary/<slug>.
 *   - Mergea: descripcion (campo "extract"), latitud, longitud (campo "coordinates"),
 *     imagen_url (originalimage @1280px desde Wikimedia Commons).
 *   - Escribe el array resultante en src/data/lugares-wiki.json.
 *
 * Uso:  npm run fetch:wikipedia
 *
 * Si Wikipedia falla para algún slug, ese lugar conserva su descripcion/imagen actuales
 * (logueado en stderr para revisión manual).
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '..', 'src', 'data', 'lugares-wiki.json')

const LUGARES_CURADOS = [
  {
    id_lugar: 'lugar-1',
    id_categoria: 'cat-parque',
    nombre: 'Parque Metropolitano de Santiago',
    direccion: 'Pío Nono 450',
    comuna: 'Recoleta',
    es_gratuito: true,
    horario: 'Lun a Dom 08:30 - 20:00',
    wikipedia_slug: 'Parque_Metropolitano_de_Santiago',
  },
  {
    id_lugar: 'lugar-2',
    id_categoria: 'cat-museo',
    nombre: 'Museo Nacional de Bellas Artes',
    direccion: 'José Miguel de la Barra 650',
    comuna: 'Santiago',
    es_gratuito: true,
    horario: 'Mar a Dom 10:00 - 18:50',
    wikipedia_slug: 'Museo_Nacional_de_Bellas_Artes_de_Chile',
  },
  {
    id_lugar: 'lugar-3',
    id_categoria: 'cat-teatro',
    nombre: 'Teatro Municipal de Santiago',
    direccion: 'Agustinas 794',
    comuna: 'Santiago',
    es_gratuito: false,
    horario: 'Según programación',
    wikipedia_slug: 'Teatro_Municipal_de_Santiago',
  },
  {
    id_lugar: 'lugar-4',
    id_categoria: 'cat-parque',
    nombre: 'Cerro Santa Lucía',
    direccion: "Av. Libertador Bernardo O'Higgins",
    comuna: 'Santiago',
    es_gratuito: true,
    horario: 'Lun a Dom 09:00 - 19:00',
    wikipedia_slug: 'Cerro_Santa_Luc%C3%ADa',
  },
  {
    id_lugar: 'lugar-5',
    id_categoria: 'cat-historico',
    nombre: 'Palacio de La Moneda',
    direccion: 'Moneda S/N',
    comuna: 'Santiago',
    es_gratuito: true,
    horario: 'Acceso público a Plaza de la Constitución',
    wikipedia_slug: 'Palacio_de_La_Moneda',
  },
  {
    id_lugar: 'lugar-6',
    id_categoria: 'cat-museo',
    nombre: 'Museo de la Memoria y los Derechos Humanos',
    direccion: 'Matucana 501',
    comuna: 'Santiago',
    es_gratuito: true,
    horario: 'Mar a Dom 10:00 - 18:00',
    wikipedia_slug: 'Museo_de_la_Memoria_y_los_Derechos_Humanos',
  },
  {
    id_lugar: 'lugar-7',
    id_categoria: 'cat-iglesia',
    nombre: 'Catedral Metropolitana de Santiago',
    direccion: 'Plaza de Armas S/N',
    comuna: 'Santiago',
    es_gratuito: true,
    horario: 'Lun a Dom 09:00 - 19:00',
    wikipedia_slug: 'Catedral_Metropolitana_de_Santiago',
  },
  {
    id_lugar: 'lugar-8',
    id_categoria: 'cat-parque',
    nombre: 'Parque Bicentenario',
    direccion: 'Av. Bicentenario 3800',
    comuna: 'Vitacura',
    es_gratuito: true,
    horario: 'Lun a Dom 07:00 - 22:00',
    wikipedia_slug: 'Parque_Bicentenario_(Vitacura)',
  },
]

// Reescribe la URL del originalimage a una versión de 1280px (suficiente para hero
// y suficientemente liviana). Wikimedia respeta el patrón thumb/<...>/Npx-filename.
function imagenAResolucion(originalUrl, ancho = 1280) {
  if (!originalUrl) return null
  // Patrón típico: .../commons/thumb/.../<algo>px-<archivo>
  return originalUrl.replace(/\/(\d+)px-/, `/${ancho}px-`)
}

async function fetchLugar(curado) {
  const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${curado.wikipedia_slug}`
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Entreteca-Portfolio/1.0' },
  })
  if (!r.ok) throw new Error(`${curado.nombre}: HTTP ${r.status}`)
  const data = await r.json()

  return {
    ...curado,
    descripcion: data.extract ?? null,
    latitud: data.coordinates?.lat ?? null,
    longitud: data.coordinates?.lon ?? null,
    imagen_url: imagenAResolucion(data.originalimage?.source ?? data.thumbnail?.source),
  }
}

async function main() {
  console.log(`Fetching ${LUGARES_CURADOS.length} lugares desde Wikipedia...`)
  const resultados = await Promise.allSettled(LUGARES_CURADOS.map(fetchLugar))

  const ok = []
  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i]
    if (r.status === 'fulfilled') {
      ok.push(r.value)
      console.log(`  ✓ ${r.value.nombre}`)
    } else {
      console.error(`  ✗ ${LUGARES_CURADOS[i].nombre}: ${r.reason?.message ?? r.reason}`)
    }
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(ok, null, 2) + '\n', 'utf8')
  console.log(`\nEscritos ${ok.length}/${LUGARES_CURADOS.length} lugares en ${OUT_PATH}`)
  console.log('Si vas a usarlo, importa así: `import lugaresWiki from "@/data/lugares-wiki.json"`')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
