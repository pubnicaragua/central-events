"use client"

import { useState, useEffect } from "react"
import { X, Menu, CalendarPlus, UserPlus, Lock, UserRound, Puzzle } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useMobile } from "../hooks/useMobile"
import useAuth from "../hooks/useAuth"
import LogoutButton from "./LogoutButton"

export const AdminMobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const isMobile = useMobile()
    const location = useLocation()
    const { logout, hasPermission } = useAuth()

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
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile menu overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={toggleMenu}
            />

            {/* Mobile menu panel */}
            <div
                className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-emerald-900/95 z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex h-[60px] items-center justify-between border-b border-emerald-800 px-6">
                        <Link to="/admin/events" className="flex items-center gap-2 font-semibold text-white">
                            <img src="/logo.png" alt="Logo" className="h-22 w-28" />

                        </Link>
                        {/* Close button inside sidebar */}
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-full hover:bg-emerald-800 text-white transition-colors"
                            aria-label="Cerrar menú"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2">
                        <nav className="grid items-start px-4 text-sm font-medium">
                            <div className="mt-6">
                                <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                                    Administrar
                                </h4>
                                <div className="grid gap-1 mt-2">
                                    {hasPermission("adminEvents") && (
                                        <Link
                                            to="/admin/events"
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/events"
                                                ? "bg-emerald-950 text-white font-medium"
                                                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                                }`}
                                        >
                                            <CalendarPlus className="h-4 w-4" />
                                            Eventos
                                        </Link>
                                    )}

                                    {hasPermission("adminUsers") && (
                                        <Link
                                            to="/admin/users"
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/users"
                                                ? "bg-emerald-950 text-white font-medium"
                                                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                                }`}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Usuarios
                                        </Link>
                                    )}

                                    {hasPermission("adminRoles") && (
                                        <Link
                                            to="/admin/roles"
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/roles"
                                                ? "bg-emerald-950 text-white font-medium"
                                                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                                }`}
                                        >
                                            <Lock className="h-4 w-4" />
                                            Roles
                                        </Link>
                                    )}

                                    {hasPermission("adminProfile") && (
                                        <Link
                                            to="/admin/profile"
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/profile"
                                                ? "bg-emerald-950 text-white font-medium"
                                                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                                }`}
                                        >
                                            <UserRound className="h-4 w-4" />
                                            Perfil de usuario
                                        </Link>
                                    )}

                                    {hasPermission("adminModules") && (
                                        <Link
                                            to={"/admin/modules"}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/profile"
                                                ? "bg-emerald-950 text-white font-medium"
                                                : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                                }`}
                                        >
                                            <Puzzle className="h-4 w-4" />
                                            Permisos de modulos
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </nav>
                    </div>

                    <div className="mt-6 pt-4 border-t border-emerald-800">
                        <div className="grid gap-1">
                            <div
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors duration-200`}
                            >
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
