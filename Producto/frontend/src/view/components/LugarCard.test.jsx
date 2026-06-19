import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LugarCard } from './LugarCard'

// CONCEPTO 2: probar el RENDERIZADO de un componente (PU-04 del informe).
// "Renderizado de la tarjeta de lugar con props válidas → muestra nombre,
//  categoría e imagen correctamente."
//
// LugarCard contiene <BotonFavorito>, que usa login/Supabase a través de
// useFavoritoViewModel. Lo "mockeamos" (reemplazamos por una versión falsa)
// para poder probar la tarjeta sin necesitar sesión ni base de datos.
vi.mock('@/viewmodel/public/useFavoritoViewModel', () => ({
  useFavoritoViewModel: () => ({ activo: false, submitting: false, toggle: vi.fn() }),
}))

// <LugarCard> usa <Link>, que necesita un Router en el árbol de componentes.
function renderLugar(lugar) {
  return render(
    <MemoryRouter>
      <LugarCard lugar={lugar} />
    </MemoryRouter>,
  )
}

const lugar = {
  id_lugar: 'lug-1',
  nombre: "Parque O'Higgins",
  descripcion: 'Gran parque urbano en el centro de Santiago.',
  direccion: 'Av. Beauchef 937',
  comuna: 'Santiago',
  es_gratuito: true,
  imagen_url: 'https://example.com/parque.jpg',
  categoria: { nombre: 'Parques' },
}

describe('LugarCard (PU-04)', () => {
  it('muestra el nombre del lugar', () => {
    renderLugar(lugar)
    expect(
      screen.getByRole('heading', { name: /parque o'higgins/i }),
    ).toBeInTheDocument()
  })

  it('muestra la categoría', () => {
    renderLugar(lugar)
    expect(screen.getByText('Parques')).toBeInTheDocument()
  })

  it('muestra la imagen con el nombre como texto alternativo', () => {
    renderLugar(lugar)
    const img = screen.getByRole('img', { name: /parque o'higgins/i })
    expect(img).toHaveAttribute('src', 'https://example.com/parque.jpg')
  })
})
