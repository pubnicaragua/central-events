"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, CalendarPlus, UserPlus, Lock, UserRound, Puzzle, Video } from "lucide-react"
import LogoutButton from "./LogoutButton"
import useAuth from "../hooks/useAuth"

export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { hasPermission } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50" onClick={toggleMenu}>
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-emerald-900 z-40" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              <div className="flex h-[60px] items-center border-b border-emerald-800 px-6">
                <Link to="/admin/events" className="flex items-center gap-2 font-semibold text-white">
                  <span className="text-lg">Inicio</span>
                </Link>
              </div>

              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                  <div className="mt-6">
                    <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                      Administrar
                    </h4>
                    <div className="grid gap-1 mt-2">
                      {hasPermission("adminEvents") && (
                        <Link
                          to={"/admin/events"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/events"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Eventos
                        </Link>
                      )}

                      {hasPermission("adminUsers") && (
                        <Link
                          to={"/admin/users"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/users"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <UserPlus className="h-4 w-4" />
                          Usuarios
                        </Link>
                      )}

                      {hasPermission("adminRoles") && (
                        <Link
                          to={"/admin/roles"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/roles"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <Lock className="h-4 w-4" />
                          Roles
                        </Link>
                      )}

                      {hasPermission("adminProfile") && (
                        <Link
                          to={"/admin/profile"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/profile"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <UserRound className="h-4 w-4" />
                          Perfil de usuario
                        </Link>
                      )}

                      {hasPermission("adminModules") && (
                        <Link
                          to={"/admin/modules"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/modules"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <Puzzle className="h-4 w-4" />
                          Permisos de modulos
                        </Link>
                      )}

                      {hasPermission("adminTraining") && (
                        <Link
                          to={"/admin/training"}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                            location.pathname === "/admin/training"
                              ? "bg-emerald-950 text-white font-medium"
                              : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                          }`}
                          onClick={toggleMenu}
                        >
                          <Video className="h-4 w-4" />
                          Capacitaciones
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
        </div>
      )}
    </div>
  )
}
