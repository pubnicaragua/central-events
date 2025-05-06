"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { email, password } = formData

    if (!email || !password) {
      setError("Por favor, completa todos los campos.")
      return
    }

    if (!validateEmail(email)) {
      setError("El correo no es válido.")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de login:", error.message)
        setError("Correo o contraseña incorrectos.")
        setLoading(false)
        return
      }

      console.log("Usuario autenticado:", data)

      // Esperar un momento antes de redirigir para asegurar que el contexto se actualice
      setTimeout(() => {
        navigate("/")
      }, 500)
    } catch (err) {
      console.error("Error inesperado:", err)
      setError("Ocurrió un error al iniciar sesión. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white">Iniciar Sesión</h2>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Contraseña
            </label>
            <Link to="/auth/forgot-password" className="text-sm text-gray-200 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? "bg-gray-900" : "bg-gray-800 hover:bg-gray-950"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>

      <p className="text-center text-sm text-white">
        ¿No tienes una cuenta?{" "}
        <Link to="/auth/register" className="text-gray-200 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
