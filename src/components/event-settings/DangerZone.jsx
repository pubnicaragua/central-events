"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteEvent } from "../../utils/eventsActions"

function DangerZone({ event, eventId }) {
    const [confirmName, setConfirmName] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const navigate = useNavigate()

    const handleDeleteEvent = async () => {
        if (confirmName !== event.name) {
            toast.error("El nombre del evento no coincide")
            return
        }

        try {
            setIsDeleting(true)
            await deleteEvent(eventId)
            toast.success("Evento eliminado correctamente")
            navigate("/admin/events")
        } catch (error) {
            console.error("Error al eliminar el evento:", error)
            toast.error("Error al eliminar el evento")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="text-xl font-bold text-red-700 mb-4">Zona de peligro</h3>

            <div className="bg-white p-4 rounded-md border border-red-300 mb-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-1" size={20} />
                    <div>
                        <h4 className="font-semibold text-red-700">Eliminar evento</h4>
                        <p className="text-gray-700 text-sm mt-1">
                            Esta acción no se puede deshacer. Toma en cuenta que si eliminas el evento se borrarán todos sus datos
                            relacionados, incluyendo asistentes, tickets, órdenes, amenidades y cualquier otra información asociada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="confirmName" className="block text-sm font-medium text-gray-700 mb-1">
                        Para confirmar, escribe el nombre del evento: <span className="font-bold">{event.name}</span>
                    </label>
                    <input
                        type="text"
                        id="confirmName"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Nombre del evento"
                    />
                </div>

                <button
                    onClick={handleDeleteEvent}
                    disabled={confirmName !== event.name || isDeleting}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white ${confirmName === event.name && !isDeleting ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"
                        }`}
                >
                    <Trash2 size={18} />
                    {isDeleting ? "Eliminando..." : "Eliminar evento permanentemente"}
                </button>
            </div>
        </div>
    )
}

export default DangerZone
