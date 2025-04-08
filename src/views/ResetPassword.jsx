"use client"

import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

const ResetPassword = () => {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [hashPresent, setHashPresent] = useState(false)
    const navigate = useNavigate()

    // Verificar si hay un hash en la URL (token de recuperación)
    useEffect(() => {
        const hash = window.location.hash
        setHashPresent(hash && hash.length > 0)

        // Escuchar eventos de cambio de contraseña de Supabase
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                setHashPresent(true)
            }
        })

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe()
            }
        }
    }, [])

    const validatePassword = (password) => {
        if (password.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres"
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        // Validar la fortaleza de la contraseña
        const passwordError = validatePassword(password)
        if (passwordError) {
            toast.error(passwordError)
            return
        }

        try {
            setLoading(true)

            // Actualizar la contraseña usando Supabase
            const { error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) {
                throw error
            }

            toast.success("Tu contraseña ha sido actualizada correctamente")

            // Redirigir al usuario al login después de un breve retraso
            setTimeout(() => navigate("/auth/login"), 2000)
        } catch (error) {
            console.error("Error al restablecer la contraseña:", error)
            toast.error(error.message || "Ocurrió un error al restablecer la contraseña")
        } finally {
            setLoading(false)
        }
    }

    // Si no hay un hash en la URL, mostrar un mensaje de error
    if (!hashPresent) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className=" w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Enlace inválido</h1>
                        <p className="mt-2 text-gray-600">
                            El enlace de recuperación de contraseña es inválido o ha expirado. Por favor, solicita un nuevo enlace de
                            recuperación.
                        </p>
                        <button
                            onClick={() => navigate("/auth/forgot-password")}
                            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Solicitar nuevo enlace
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
                    <p className="mt-2 text-gray-600">Ingresa tu nueva contraseña para restablecer tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Nueva contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword

