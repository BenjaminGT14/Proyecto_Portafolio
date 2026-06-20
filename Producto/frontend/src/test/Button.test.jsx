import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/view/components/ui/Button'

// CONCEPTO 3: interacción del usuario en el componente más simple.
// Verificamos que el botón muestre su texto y que ejecute su callback al pulsar.

describe('Button', () => {
  it('renderiza su contenido', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('ejecuta onClick al pulsar', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Click</Button>)

    await user.click(screen.getByRole('button', { name: 'Click' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
