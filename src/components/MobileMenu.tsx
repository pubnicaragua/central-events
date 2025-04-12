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
  Home,
  LogOut,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useMobile } from "../hooks/useMobile"
import useAuth from "../hooks/useAuth"

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const { logout, hasPermission, user } = useAuth()
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

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  // Get background color for avatar fallback
  const getAvatarBgColor = () => {
    const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"]
    if (!user?.id) return colors[0]
    return colors[user.id % colors.length]
  }

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
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleMenu}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden rounded-r-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>

          {/* User profile section */}
          <div className="px-6 py-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.name || "Usuario"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium ${getAvatarBgColor()}`}
                >
                  {getUserInitials()}
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{user?.name || "Usuario"}</h3>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 space-y-1">

              <div className="mt-6 space-y-1">
                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrar</h4>

                {hasPermission("eventDashboard") && (
                  <Link
                    to={`/manage/event/${eventId}/dashboard`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/dashboard`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Panel
                  </Link>
                )}

                {hasPermission("eventSettings") && (
                  <Link
                    to={`/manage/event/${eventId}/settings`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/settings`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Settings className="h-5 w-5" />
                    Ajustes
                  </Link>
                )}

                {hasPermission("eventTickets") && (
                  <Link
                    to={`/manage/event/${eventId}/tickets`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/tickets`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Ticket className="h-5 w-5" />
                    Entradas
                  </Link>
                )}

                {hasPermission("eventAttendees") && (
                  <Link
                    to={`/manage/event/${eventId}/attendees`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/attendees`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Users className="h-5 w-5" />
                    Asistentes
                  </Link>
                )}

                {hasPermission("eventAmenities") && (
                  <Link
                    to={`/manage/event/${eventId}/amenities`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/amenities`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Users className="h-5 w-5" />
                    Amenidades
                  </Link>
                )}

                {hasPermission("eventCheckIn") && (
                  <Link
                    to={`/manage/event/${eventId}/check-in`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/check-in`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Check-in
                  </Link>
                )}

                {hasPermission("eventOrders") && (
                  <Link
                    to={`/manage/event/${eventId}/orders`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/orders`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Pedidos
                  </Link>
                )}

                {hasPermission("eventRaffles") && (
                  <Link
                    to={`/manage/event/${eventId}/raffles`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/raffles`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    Rifas
                  </Link>
                )}

                {hasPermission("eventQuestions") && (
                  <Link
                    to={`/manage/event/${eventId}/questions`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/questions`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    Preguntas
                  </Link>
                )}

                {hasPermission("eventPromoCodes") && (
                  <Link
                    to={`/manage/event/${eventId}/promo-codes`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/promo-codes`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Tag className="h-5 w-5" />
                    Códigos promocionales
                  </Link>
                )}

                {hasPermission("eventMessages") && (
                  <Link
                    to={`/manage/event/${eventId}/messages`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/messages`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Mensajes
                  </Link>
                )}

                {hasPermission("eventCapacity") && (
                  <Link
                    to={`/manage/event/${eventId}/capacity`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/capacity`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Users2 className="h-5 w-5" />
                    Capacidad
                  </Link>
                )}

                {hasPermission("eventRegistrationLists") && (
                  <Link
                    to={`/manage/event/${eventId}/registration-lists`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/registration-lists`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <ClipboardList className="h-5 w-5" />
                    Listas de registro
                  </Link>
                )}
              </div>

              {hasPermission("eventPageDesigner") && (
                <div className="mt-6 space-y-1">
                  <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Herramientas</h4>


                  <Link
                    to={`/manage/event/${eventId}/page-designer`}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${location.pathname === `/manage/event/${eventId}/page-designer`
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <Palette className="h-5 w-5" />
                    Diseñador de página
                  </Link>

                </div>
              )}
            </nav>
          </div>

          <div className="border-t border-gray-100 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
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
