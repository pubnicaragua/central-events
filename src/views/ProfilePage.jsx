"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import LogoutButton from "../components/LogoutButton"
import supabase from "../api/supabase"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ProfilePage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.name || "",
        email: user?.email || "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                data: { name: formData.name },
            })

            if (error) throw error

            // Show success message
            alert("Perfil actualizado correctamente")
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Error al actualizar el perfil")
        } finally {
            setIsLoading(false)
        }
    }

    const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U"

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-green-100">
                <div className="text-center p-6 bg-green-50">
                    <div className="flex justify-center mb-4">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url || "/placeholder.svg"}
                                alt="Profile"
                                className="h-24 w-24 rounded-full border-4 border-green-100 object-cover"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-3xl border-4 border-green-100">
                                {userInitials}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
                    <p className="text-sm text-gray-600">Administra tu información personal</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                                Nombre
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                            />
                            <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </span>
                            ) : (
                                "Guardar cambios"
                            )}
                        </button>
                    </form>
                </div>

                <div className="px-6 py-4 bg-green-50 flex justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </button>
                    <LogoutButton asMenuItem={false} />
                </div>
            </div>
        </div>
    )
}

