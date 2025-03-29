"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../api/supabase"

export default function LogoutButton({ className = "", asMenuItem = true }) {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            // Redirect to login page after successful logout
            navigate("/auth/login")
        } catch (error) {
            console.error("Error during logout:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (asMenuItem) {
        return (
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center ${className}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                </svg>
                {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
            </button>
        )
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center ${className}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
            </svg>
            {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
        </button>
    )
}

