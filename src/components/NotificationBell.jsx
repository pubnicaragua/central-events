"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../hooks/useNotifications"
import { useAuth } from "../context/AuthContext" // Add this import

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()
  const { userRole } = useAuth() // Get user role
  const modalRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar el modal al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    setIsOpen(false)

    // Redirigir según el rol del usuario
    if (userRole === 1) {
      // Admin
      navigate("/admin/manage/requests")
    } else {
      // User
      navigate("/user/dashboard") // O la ruta que corresponda para usuarios
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="relative">
      {/* Botón de la campana */}
      <button
        className="p-2 rounded-full bg-white shadow-md hover:bg-gray-200 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <Bell height={30} width={30} color="#747c78" />

        {/* Indicador de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modal de notificaciones */}
      {isOpen && (
        <div ref={modalRef} className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${
                      notification.is_read ? "bg-white" : "bg-blue-50"
                    } hover:bg-gray-100`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <p
                          className={`text-sm ${notification.is_read ? "text-gray-700" : "font-medium text-gray-900"}`}
                        >
                          {notification.message}
                        </p>
                        {!notification.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

