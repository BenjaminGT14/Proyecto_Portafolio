import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'

export function useRegistroViewModel() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp({ email, password, nombre })
    setLoading(false)

    if (error) {
      setError(error.message ?? 'No pudimos crear la cuenta')
      return
    }

    if (data?.session) {
      navigate('/', { replace: true })
    } else {
      setDone(true)
    }
  }

  return {
    nombre,
    setNombre,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    loading,
    error,
    done,
    handleSubmit,
  }
}
