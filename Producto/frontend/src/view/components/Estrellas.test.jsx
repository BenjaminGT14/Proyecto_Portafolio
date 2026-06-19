import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Estrellas } from './Estrellas'

// CONCEPTO 3: probar INTERACCIÓN del usuario (clicks) + renderizado.
// El componente Icon escribe el nombre del símbolo ("star") como texto,
// por eso contamos las estrellas buscando ese texto.

describe('Estrellas', () => {
  it('renderiza siempre 5 estrellas', () => {
    render(<Estrellas value={3} />)
    expect(screen.getAllByText('star')).toHaveLength(5)
  })

  it('llama onChange con el índice de la estrella pulsada', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Estrellas value={0} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '4 de 5 estrellas' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })
})
