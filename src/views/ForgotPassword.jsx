"use client"

import { useState } from "react"
import supabase from "../api/supabase"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email) {
            toast.error("Por favor ingresa tu correo electrónico")
            return
        }

        try {
            setLoading(true)

            // Utilizamos la función de Supabase para enviar el correo de recuperación
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                throw error
            }

            toast.success("Se ha enviado un correo de recuperación a tu dirección de email")
            // Redirigimos al usuario a una página de confirmación o login
            setTimeout(() => navigate("/auth/login"), 2000)
        } catch (error) {
            console.error("Error al enviar el correo de recuperación:", error)
            toast.error(error.message || "Ocurrió un error al enviar el correo de recuperación")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
                <p className="mt-2 text-gray-600">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="tu@email.com"
                        disabled={loading}
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </button>
                </div>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/auth/login")}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ForgotPassword

