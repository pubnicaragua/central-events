"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import LogoutButton from "../components/LogoutButton"
import supabase from "../api/supabase"

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
        <div className="container mx-auto py-10">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="text-center p-6 bg-gray-50">
                    <div className="flex justify-center mb-4">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url || "/placeholder.svg"}
                                alt="Profile"
                                className="h-24 w-24 rounded-full border-4 border-indigo-100 object-cover"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-3xl border-4 border-indigo-100">
                                {userInitials}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
                    <p className="text-sm text-gray-500">Administra tu información personal</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                            />
                            <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            {isLoading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Volver
                    </button>
                    <LogoutButton asMenuItem={false} />
                </div>
            </div>
        </div>
    )
}

