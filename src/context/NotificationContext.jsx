import { createContext, useState, useEffect } from "react"
import supabase from "../api/supabase"
import { useAuth } from "./AuthContext"
import PropTypes from "prop-types"
import { useCallback } from "react"

export const NotificationContext = createContext(undefined)

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const { userRole } = useAuth() // Get the user's role from AuthContext

    // Función para cargar notificaciones iniciales
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            if (userRole === null) {
                setNotifications([])
                setUnreadCount(0)
                return
            }

            let query = supabase.from("notifications").select("*")
            if (userRole === 1) query = query.eq("type", 2)
            else if (userRole === 2) query = query.eq("type", 1)

            const { data, error } = await query.order("created_at", { ascending: false })
            if (error) throw error

            setNotifications(data || [])
            const unread = data?.filter((n) => !n.is_read).length || 0
            setUnreadCount(unread)
        } catch (error) {
            console.error("Error al cargar notificaciones:", error)
        } finally {
            setLoading(false)
        }
    }, [userRole])

    // Configurar suscripción en tiempo real
    useEffect(() => {
        fetchNotifications()

        // Only set up subscription if we have a userRole
        if (userRole === null) return

        // Crear el canal y la suscripción
        const channel = supabase.channel("db-changes", {
            config: {
                broadcast: { self: true },
                presence: { key: "notifications" },
            },
        })

        // Determine which type of notifications to listen for
        const notificationType = userRole === 1 ? 2 : 1 // 2 for admin, 1 for user

        // Suscribirse a cambios en la tabla notifications con filtro por tipo
        channel
            .on(
                "postgres_changes",
                {
                    event: "*", // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
                    schema: "public",
                    table: "notifications",
                    filter: `type=eq.${notificationType}`, // Filter by notification type
                },
                async (payload) => {
                    console.log("Cambio recibido:", payload)

                    // Manejar diferentes tipos de eventos
                    switch (payload.eventType) {
                        case "INSERT":
                            setNotifications((prev) => [payload.new, ...prev])
                            if (!payload.new.is_read) {
                                setUnreadCount((prev) => prev + 1)
                            }
                            break

                        case "UPDATE":
                            setNotifications((prev) =>
                                prev.map((notification) => (notification.id === payload.new.id ? payload.new : notification)),
                            )
                            // Actualizar contador si cambió el estado de lectura
                            if (payload.old.is_read !== payload.new.is_read) {
                                setUnreadCount((prev) => (payload.new.is_read ? prev - 1 : prev + 1))
                            }
                            break

                        case "DELETE":
                            setNotifications((prev) => prev.filter((notification) => notification.id !== payload.old.id))
                            if (!payload.old.is_read) {
                                setUnreadCount((prev) => prev - 1)
                            }
                            break
                    }
                },
            )
            .subscribe((status) => {
                console.log("Status de la suscripción:", status)
                if (status === "SUBSCRIBED") {
                    console.log("Suscripción exitosa al canal de notificaciones")
                }
            })

        // Limpiar suscripción al desmontar
        return () => {
            channel.unsubscribe()
        }

    }, [userRole, fetchNotifications]) // Add userRole as a dependency

    // Función para marcar una notificación como leída
    const markAsRead = async (id) => {
        try {
            const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

            if (error) throw error

            // El estado se actualizará automáticamente a través de la suscripción en tiempo real
        } catch (error) {
            console.error("Error al marcar notificación como leída:", error)
        }
    }

    // Función para marcar todas las notificaciones como leídas
    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)

            if (unreadIds.length === 0) return

            const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)

            if (error) throw error

            // El estado se actualizará automáticamente a través de la suscripción en tiempo real
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error)
        }
    }

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
    }

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}



NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
