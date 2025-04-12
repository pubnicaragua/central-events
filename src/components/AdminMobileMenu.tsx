"use client"

import { useState, useEffect } from "react"
import { X, CalendarPlus, UserPlus, Lock, UserRound, Puzzle, LogOut, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useMobile } from "../hooks/useMobile"
import useAuth from "../hooks/useAuth"

export const AdminMobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const isMobile = useMobile()
    const location = useLocation()
    const { logout, hasPermission, user } = useAuth()

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    if (!isMobile) return null

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Hamburger button */}
            <button
                onClick={toggleMenu}
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-emerald-800 text-white shadow-md lg:hidden"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Home size={24} />}
            </button>

            {/* Mobile menu overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={toggleMenu}
            />

            {/* Mobile menu panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[280px] max-w-[85%] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden rounded-r-3xl ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Close button */}
                    <button
                        onClick={toggleMenu}
                        className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700"
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>

                    {/* User profile section */}
                    <div className="px-6 py-8 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 overflow-hidden">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url || "/placeholder.svg"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white text-lg font-medium">
                                        {user?.name?.charAt(0) || "U"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">{user?.name || "Usuario"}</h3>
                                <p className="text-xs text-gray-500">{user?.email || "usuario@ejemplo.com"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation links */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="px-4">
                            {hasPermission("adminEvents") && (
                                <Link
                                    to="/admin/events"
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200 ${location.pathname === "/admin/events"
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <CalendarPlus className="h-5 w-5" />
                                    Eventos
                                </Link>
                            )}

                            {hasPermission("adminUsers") && (
                                <Link
                                    to="/admin/users"
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200 ${location.pathname === "/admin/users"
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Usuarios
                                </Link>
                            )}

                            {hasPermission("adminRoles") && (
                                <Link
                                    to="/admin/roles"
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200 ${location.pathname === "/admin/roles"
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <Lock className="h-5 w-5" />
                                    Roles
                                </Link>
                            )}

                            {hasPermission("adminProfile") && (
                                <Link
                                    to="/admin/profile"
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200 ${location.pathname === "/admin/profile"
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <UserRound className="h-5 w-5" />
                                    Perfil de usuario
                                </Link>
                            )}

                            {hasPermission("adminModules") && (
                                <Link
                                    to="/admin/modules"
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200 ${location.pathname === "/admin/modules"
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <Puzzle className="h-5 w-5" />
                                    Permisos de módulos
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Logout button */}
                    <div className="px-4 py-4 border-t border-gray-100">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 w-full text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
