import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarCategorias, listarLugares } from '@/model/entretecaRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { avatarUrl } from '@/core/utils'

const CATEGORIA_ICONO = {
  'Parques y naturaleza': { icon: 'park', bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-container' },
  Museos: { icon: 'museum', bg: 'bg-secondary-fixed', color: 'text-secondary' },
  Teatros: { icon: 'theater_comedy', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed' },
  'Sitios históricos': { icon: 'account_balance', bg: 'bg-surface-container-high', color: 'text-on-surface' },
  'Actividades comunitarias': { icon: 'volunteer_activism', bg: 'bg-error-container', color: 'text-error' },
  'Iglesias y patrimonio': { icon: 'church', bg: 'bg-secondary-fixed-dim', color: 'text-on-secondary-container' },
}

const CATEGORIA_DEFAULT = {
  icon: 'place',
  bg: 'bg-surface-container-high',
  color: 'text-on-surface',
}

const REVIEWS_DEMO = [
  {
    nombre: 'Andrea Valdés',
    avatar: avatarUrl('Andrea Valdés'),
    cuando: 'Hace 2 días',
    estrellas: 5,
    texto: '"El Museo de Bellas Artes es increíble los domingos, ¡la entrada gratuita es un gran beneficio! Muy recomendado para ir en familia."',
    up: 24,
    down: 2,
  },
  {
    nombre: 'Ricardo Soto',
    avatar: avatarUrl('Ricardo Soto'),
    cuando: 'Hace 5 días',
    estrellas: 4,
    texto: '"Fui al Cerro Santa Lucía el sábado pasado. Un poco lleno pero ideal para desconectarse de la ciudad. Traigan protector solar."',
    up: 18,
    down: 0,
  },
  {
    nombre: 'Elena Rojas',
    avatar: avatarUrl('Elena Rojas'),
    cuando: 'Ayer',
    estrellas: 5,
    texto: '"El festival de jazz estuvo impecable. Muy buena organización y seguridad. Usé Entreteca para encontrar el mapa del evento."',
    up: 42,
    down: 1,
  },
]

function mapLugarToPunto(lugar) {
  return {
    id: lugar.id_lugar,
    nombre: lugar.nombre,
    latitud: lugar.latitud,
    longitud: lugar.longitud,
    comuna: lugar.comuna,
    tipo: 'lugar',
  }
}

export function useHomeViewModel() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [categoriaSel, setCategoriaSel] = useState('')
  const [costoSel, setCostoSel] = useState('')

  const cargarCategorias = useCallback(() => listarCategorias(), [])
  const cargarLugares = useCallback(() => listarLugares(), [])
  const { data: categorias } = useAsyncData(cargarCategorias)
  const { data: lugares } = useAsyncData(cargarLugares)

  const puntos = useMemo(
    () => (lugares ?? []).map(mapLugarToPunto),
    [lugares],
  )

  function handleBuscar(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categoriaSel) params.set('idCategoria', categoriaSel)
    if (costoSel) params.set('costo', costoSel)
    const qs = params.toString()
    navigate(`/lugares${qs ? `?${qs}` : ''}`)
  }

  return {
    q,
    setQ,
    categoriaSel,
    setCategoriaSel,
    costoSel,
    setCostoSel,
    categorias: categorias ?? [],
    lugares: lugares ?? [],
    puntos,
    reviewsDemo: REVIEWS_DEMO,
    getCategoriaConfig: (nombre) => CATEGORIA_ICONO[nombre] ?? CATEGORIA_DEFAULT,
    handleBuscar,
    goToLugares: () => navigate('/lugares'),
  }
}
