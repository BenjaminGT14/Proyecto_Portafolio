import { useState } from 'react'
import { useAuth } from '@/core/auth/useAuth'

export function useRecuperarPasswordViewModel() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword({ email })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'No pudimos enviar el correo')
      return
    }
    setSent(true)
  }

  return {
    email,
    setEmail,
    loading,
    error,
    sent,
    handleSubmit,
  }
}
