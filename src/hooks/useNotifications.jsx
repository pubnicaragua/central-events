"use client"

import { useContext } from "react"
import { NotificationContext } from "../context/NotificationContext"

export function useNotifications() {
    const context = useContext(NotificationContext)

    if (context === undefined) {
        throw new Error("useNotifications debe ser usado dentro de NotificationProvider")
    }

    return context
}

