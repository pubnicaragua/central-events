"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreVertical, Settings, Copy, Archive, Ticket, DollarSign } from "lucide-react"
import PropTypes from "prop-types"

function EventCard({ event, onDuplicate, onArchive }) {
    const [showMenu, setShowMenu] = useState(false)
    const navigate = useNavigate()

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return {
            day: date.getDate(),
            month: date.toLocaleString("es", { month: "short" }).toUpperCase(),
            time: date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        }
    }

    const startDate = event.start_date ? formatDate(event.start_date) : { day: "--", month: "---", time: "--:--" }

    const getStatusColor = (status) => {
        switch (status) {
            case "Próximo":
                return "bg-emerald-100 text-emerald-800"
            case "Terminado":
                return "bg-gray-100 text-gray-800"
            case "Archivado":
                return "bg-amber-100 text-amber-800"
            default:
                return "bg-emerald-100 text-emerald-800"
        }
    }

    return (
        <div className="bg-white border border-emerald-100 rounded-xl p-5 flex shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-emerald-50 rounded-xl flex flex-col items-center justify-center mr-5 border border-emerald-100 shadow-sm">
                <span className="text-2xl font-bold text-emerald-900">{startDate.day}</span>
                <span className="text-sm font-medium text-emerald-700">{startDate.month}</span>
                <span className="text-xs text-emerald-600">{startDate.time}</span>
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <div
                            className={`text-xs font-medium uppercase mb-1 px-2 py-1 rounded-full inline-block ${getStatusColor(event.status)}`}
                        >
                            {event.status === "Próximo" ? "PRÓXIMO" : event.status === "Terminado" ? "TERMINADO" : "ARCHIVADO"}
                        </div>
                        <h3 className="text-lg font-medium text-emerald-800">{event.name}</h3>
                        <p className="text-sm text-emerald-600">{event.organizers?.name || "Organizador desconocido"}</p>
                    </div>

                    <div className="relative">
                        <button
                            className="p-2 rounded-full hover:bg-emerald-100 text-emerald-700"
                            onClick={() => setShowMenu(!showMenu)}
                            aria-label="Opciones del evento"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-emerald-100 z-10 overflow-hidden">
                                <div className="py-1">
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center"
                                        onClick={() => {
                                            navigate(`/manage/event/${event.id}/getting-started`)
                                            setShowMenu(false)
                                        }}
                                    >
                                        <Settings className="w-5 h-5 mr-3 text-emerald-600" />
                                        Administrar evento
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center"
                                        onClick={() => {
                                            onDuplicate()
                                            setShowMenu(false)
                                        }}
                                    >
                                        <Copy className="w-5 h-5 mr-3 text-emerald-600" />
                                        Duplicar evento
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center"
                                        onClick={() => {
                                            onArchive()
                                            setShowMenu(false)
                                        }}
                                    >
                                        <Archive className="w-5 h-5 mr-3 text-emerald-600" />
                                        Archivar evento
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-emerald-700 space-x-4">
                    <span className="flex items-center">
                        <Ticket className="w-4 h-4 mr-1.5 text-emerald-600" />
                        {event.tickets_sold || 0} entradas vendidas
                    </span>
                    <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1.5 text-emerald-600" />${event.revenue || "0.00"} ventas brutas
                    </span>
                </div>
            </div>
        </div>
    )
}

export default EventCard

EventCard.propTypes = {
    event: PropTypes.object.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onArchive: PropTypes.func.isRequired,
}

