"use client"

import { Navigate, Outlet, useLocation } from "react-router-dom"
import useAuth from "../hooks/useAuth"

// Componente para proteger rutas basado en autenticación y roles
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, userRole, loading } = useAuth()
  const location = useLocation()

  // Mientras verifica la autenticación, muestra un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Si hay roles permitidos especificados y el usuario no tiene uno de esos roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirige a una página de acceso denegado o a la página principal
    return <Navigate to="/access-denied" replace />
  }

  // Si el usuario está autenticado y tiene el rol adecuado, muestra el contenido
  return <Outlet />
}

