"use client"

import { useContext, useMemo } from "react"
import { AuthContext } from "../context/AuthContext"

export default function useAuth() {
    const { user, userRole, loading } = useContext(AuthContext)

    // Determinar si el usuario está autenticado
    const isAuthenticated = !!user

    // Definir los permisos de módulos por rol
    const modulePermissions = useMemo(() => {
        // Permisos por defecto (ningún acceso)
        const defaultPermissions = {
            // Admin sidebar
            adminEvents: false,
            adminUsers: false,
            adminRoles: false,
            adminProfile: false,

            // Event sidebar
            eventStarted: false,
            eventDashboard: false,
            eventSettings: false,
            eventTickets: false,
            eventAttendees: false,
            eventAmenities: false,
            eventCheckIn: false,
            eventOrders: false,
            eventRaffles: false,
            eventQuestions: false,
            eventPromoCodes: false,
            eventMessages: false,
            eventCapacity: false,
            eventRegistrationLists: false,
            eventPageDesigner: false,
            eventEmployees: false
        }

        // Si no hay rol o está cargando, devolver permisos por defecto
        if (!userRole || loading) return defaultPermissions

        // Configurar permisos según el rol
        switch (userRole) {
            case 1: // Administrador
                // Acceso completo a todo
                return Object.keys(defaultPermissions).reduce((acc, key) => {
                    acc[key] = true
                    return acc
                }, {})

            case 2: // Organizador
                return {
                    ...defaultPermissions,
                    // Admin sidebar
                    adminEvents: true,
                    adminProfile: true,

                    // Event sidebar
                    eventDashboard: true,
                    eventAttendees: true,
                    eventRaffles: true,
                    eventTickets: true,
                    eventSettings: true
                }

            case 3: // Asistente
                // No tiene acceso a módulos administrativos
                return defaultPermissions

            case 4: // Empleado
                return {
                    ...defaultPermissions,

                    eventCheckIn: true,
                    adminProfile: true,
                    adminEvents: true,
                    eventDashboard: true
                }

            default:
                return defaultPermissions
        }
    }, [userRole, loading])

    return {
        user,
        userRole,
        loading,
        isAuthenticated,
        modulePermissions,

        // Helper para verificar si tiene permiso para un módulo específico
        hasPermission: (module) => modulePermissions[module] || false,

        // Helper para verificar si es admin
        isAdmin: userRole === 1,
    }
}

