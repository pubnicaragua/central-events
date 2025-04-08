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
import useAuth from "../hooks/useAuth"

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const { logout, hasPermission } = useAuth()
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
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-emerald-800 text-white shadow-md lg:hidden"
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
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-emerald-900/95 z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
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
              <Link
                to={`/manage/event/${eventId}/getting-started`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  location.pathname === `/manage/event/${eventId}/getting-started`
                    ? "bg-emerald-950 text-white"
                    : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                }`}
              >
                Empezando
              </Link>

              <div className="mt-6">
                <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  Administrar
                </h4>
                <div className="grid gap-1">
                  {hasPermission("eventDashboard") && (
                    <Link
                      to={`/manage/event/${eventId}/dashboard`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/dashboard`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Panel
                    </Link>
                  )}

                  {hasPermission("eventSettings") && (
                    <Link
                      to={`/manage/event/${eventId}/settings`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/settings`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Ajustes
                    </Link>
                  )}

                  {hasPermission("eventTickets") && (
                    <Link
                      to={`/manage/event/${eventId}/tickets`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/tickets`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Ticket className="h-4 w-4" />
                      Entradas
                    </Link>
                  )}

                  {hasPermission("eventAttendees") && (
                    <Link
                      to={`/manage/event/${eventId}/attendees`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/attendees`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Asistentes
                    </Link>
                  )}

                  {hasPermission("eventAmenities") && (
                    <Link
                      to={`/manage/event/${eventId}/amenities`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/amenities`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Amenidades
                    </Link>
                  )}

                  {hasPermission("eventCheckIn") && (
                    <Link
                      to={`/manage/event/${eventId}/check-in`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/check-in`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Check-in
                    </Link>
                  )}

                  {hasPermission("eventOrders") && (
                    <Link
                      to={`/manage/event/${eventId}/orders`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/orders`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Pedidos
                    </Link>
                  )}

                  {hasPermission("eventRaffles") && (
                    <Link
                      to={`/manage/event/${eventId}/raffles`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/raffles`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Rifas
                    </Link>
                  )}

                  {hasPermission("eventQuestions") && (
                    <Link
                      to={`/manage/event/${eventId}/questions`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/questions`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Preguntas
                    </Link>
                  )}

                  {hasPermission("eventPromoCodes") && (
                    <Link
                      to={`/manage/event/${eventId}/promo-codes`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/promo-codes`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                      Códigos promocionales
                    </Link>
                  )}

                  {hasPermission("eventMessages") && (
                    <Link
                      to={`/manage/event/${eventId}/messages`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/messages`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Mensajes
                    </Link>
                  )}

                  {hasPermission("eventCapacity") && (
                    <Link
                      to={`/manage/event/${eventId}/capacity`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/capacity`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Users2 className="h-4 w-4" />
                      Capacidad
                    </Link>
                  )}

                  {hasPermission("eventRegistrationLists") && (
                    <Link
                      to={`/manage/event/${eventId}/registration-lists`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/registration-lists`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <ClipboardList className="h-4 w-4" />
                      Listas de registro
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  Herramientas
                </h4>
                <div className="grid gap-1">
                  {hasPermission("eventPageDesigner") && (
                    <Link
                      to={`/manage/event/${eventId}/page-designer`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        location.pathname === `/manage/event/${eventId}/page-designer`
                          ? "bg-emerald-950 text-white"
                          : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                      }`}
                    >
                      <Palette className="h-4 w-4" />
                      Diseñador de página de inicio
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </div>

          <div className="border-t border-emerald-800 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-white"
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
