"use client"

import { Link, useLocation } from "react-router-dom"
import { CalendarPlus, UserPlus, Lock, UserRound, Bell } from "lucide-react"
import LogoutButton from "./LogoutButton"
import useAuth  from "../hooks/useAuth"

function Sidebar() {
    const location = useLocation()
    const { hasPermission } = useAuth()

    return (
        <div className="hidden border-r bg-emerald-900 shadow-lg lg:block">
            <div className="flex h-full max-h-screen flex-col">
                <div className="flex h-[60px] items-center border-b border-emerald-800 px-6">
                    <Link to="/admin/events" className="flex items-center gap-2 font-semibold text-white">
                        
                        <span className="text-lg">Inicio</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2 scrollbar-thin scrollbar-thumb-emerald-700">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <div className="mt-6">
                            <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">Administrar</h4>
                            <div className="grid gap-1 mt-2">
                                {hasPermission("adminEvents") && (
                                    <Link
                                        to={"/admin/events"}
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
                                        to={"/admin/users"}
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
                                        to={"/admin/roles"}
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
                                        to={"/admin/profile"}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/profile"
                                            ? "bg-emerald-950 text-white font-medium"
                                            : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                            }`}
                                    >
                                        <UserRound className="h-4 w-4" />
                                        Perfil de usuario
                                    </Link>
                                )}

                                {hasPermission("adminNotifications") && (
                                    <Link
                                        to={"/admin/notifications"}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${location.pathname === "/admin/notifications"
                                            ? "bg-emerald-950 text-white font-medium"
                                            : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                                            }`}
                                    >
                                        <Bell className="h-4 w-4" />
                                        Notificaciones
                                    </Link>
                                )}
                            </div>
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
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default Sidebar

