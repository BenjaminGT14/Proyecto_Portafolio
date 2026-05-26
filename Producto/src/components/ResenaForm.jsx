import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Estrellas } from './Estrellas'

export function ResenaForm({ onSubmit, submitting }) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (puntuacion < 1) {
      setError('Elige una puntuación entre 1 y 5 estrellas.')
      return
    }
    if (titulo.trim().length < 4) {
      setError('El título es muy corto.')
      return
    }
    if (contenido.trim().length < 20) {
      setError('Cuéntanos un poco más (mínimo 20 caracteres).')
      return
    }

    const res = await onSubmit?.({
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      puntuacion,
    })

    if (res?.error) {
      setError(res.error.message ?? 'No pudimos publicar la reseña')
      return
    }

    setPuntuacion(0)
    setTitulo('')
    setContenido('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-outline-variant bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label>Tu puntuación</Label>
        <Estrellas value={puntuacion} onChange={setPuntuacion} size="lg" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={120}
          placeholder="Un resumen breve"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contenido">Tu experiencia</Label>
        <textarea
          id="contenido"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          maxLength={1000}
          rows={4}
          required
          className="flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm placeholder:text-outline focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
          placeholder="¿Qué te gustó? ¿Qué tip darías a otros?"
        />
        <p className="text-right text-xs text-outline">{contenido.length} / 1000</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={submitting}>
          {submitting ? 'Publicando…' : 'Publicar reseña'}
        </Button>
      </div>
    </form>
  )
}
