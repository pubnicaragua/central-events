"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DotsVerticalIcon, EyeIcon, CogIcon, DuplicateIcon, ArchiveIcon } from "../components/Icons"
import PropTypes from "prop-types";

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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center mr-4">
                <span className="text-2xl font-bold">{startDate.day}</span>
                <span className="text-sm font-medium">{startDate.month}</span>
                <span className="text-xs">{startDate.time}</span>
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-medium text-blue-600 uppercase mb-1">
                            {event.status === "Próximo" ? "PRÓXIMO" : event.status === "Terminado" ? "TERMINADO" : "ARCHIVADO"}
                        </div>
                        <h3 className="text-lg font-medium text-blue-600">{event.name}</h3>
                        <p className="text-sm text-gray-600">{event.organizers?.name || "Organizador desconocido"}</p>
                    </div>

                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setShowMenu(!showMenu)}>
                            <DotsVerticalIcon className="w-5 h-5 text-gray-500" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        onClick={() => {
                                            navigate(`/event/${event.id}`)
                                            setShowMenu(false)
                                        }}
                                    >
                                        <EyeIcon className="w-5 h-5 mr-3 text-gray-500" />
                                        Ver página del evento
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        onClick={() => {
                                            navigate(`/manage/event/${event.id}/getting-started`)
                                            setShowMenu(false)
                                        }}
                                    >
                                        <CogIcon className="w-5 h-5 mr-3 text-gray-500" />
                                        Administrar evento
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        onClick={() => {
                                            onDuplicate()
                                            setShowMenu(false)
                                        }}
                                    >
                                        <DuplicateIcon className="w-5 h-5 mr-3 text-gray-500" />
                                        Duplicar evento
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        onClick={() => {
                                            onArchive()
                                            setShowMenu(false)
                                        }}
                                    >
                                        <ArchiveIcon className="w-5 h-5 mr-3 text-gray-500" />
                                        Archivar evento
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="mr-4">{event.tickets_sold || 0} entradas vendidas</span>
                    <span>${event.revenue || "0.00"} ventas brutas</span>
                </div>
            </div>
        </div>
    )
}

export default EventCard


EventCard.propTypes = {
    event: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onArchive: PropTypes.func.isRequired,
};
