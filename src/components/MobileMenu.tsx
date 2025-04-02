"use client"

import { useState, useEffect } from "react"
import {
  X,
  Menu,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  ShoppingCart,
  HelpCircle,
  Tag,
  MessageSquare,
  Users2,
  ClipboardList,
  Palette,
  LogOut,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useMobile } from "../hooks/useMobile"
import { useAuth } from "../context/AuthContext"

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const { logout } = useAuth()
  const eventId = location.pathname.split("/")[3] // Extraer el eventId de la URL

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
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white shadow-md lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-gray-700/95 z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-[60px] items-center border-b border-gray-600 px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-white">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span>Central Events</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                to={`/manage/event/${eventId}/getting-started`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  location.pathname === `/manage/event/${eventId}/getting-started`
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Empezando
              </Link>

              <div className="mt-6">
                <h4 className="px-2 py-2 text-xs font-semibold text-gray-400">Administrar</h4>
                <div className="grid gap-1">
                  <Link
                    to={`/manage/event/${eventId}/dashboard`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/dashboard`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Panel
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/settings`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/settings`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Ajustes
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/tickets`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/tickets`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Ticket className="h-4 w-4" />
                    Entradas
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/attendees`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/attendees`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Asistentes
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/amenities`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/amenities`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Amenidades
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/check-in`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/check-in`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Check-in
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/orders`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/orders`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Pedidos
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/raffles`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/raffles`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Rifas
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/questions`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/questions`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Preguntas
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/promo-codes`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/promo-codes`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    Códigos promocionales
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/messages`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/messages`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Mensajes
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/capacity`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/capacity`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Users2 className="h-4 w-4" />
                    Capacidad
                  </Link>
                  <Link
                    to={`/manage/event/${eventId}/registration-lists`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/registration-lists`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Listas de registro
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="px-2 py-2 text-xs font-semibold text-gray-400">Herramientas</h4>
                <div className="grid gap-1">
                  <Link
                    to={`/manage/event/${eventId}/page-designer`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      location.pathname === `/manage/event/${eventId}/page-designer`
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Palette className="h-4 w-4" />
                    Diseñador de página de inicio
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          <div className="border-t border-gray-600 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

