"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { EllipsisVertical, MessageSquareShare, Pencil, Trash, Eye } from "lucide-react"
import EditTicketModal from "./EditTicketModal"
import PropTypes from "prop-types"

function TicketList({ tickets, loading, onUpdate, onDelete, eventId }) {
    const [activeMenu, setActiveMenu] = useState(null)
    const [editingTicket, setEditingTicket] = useState(null)

    const handleEditClick = (ticket) => {
        setEditingTicket(ticket)
        setActiveMenu(null)
    }

    const handleDeleteClick = async (ticketId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este ticket?")) {
            const result = await onDelete(ticketId)
            if (result.success) {
                toast.success("Ticket eliminado correctamente")
            } else {
                toast.error("Error al eliminar el ticket")
            }
        }
        setActiveMenu(null)
    }

    const handleMenuToggle = (ticketId) => {
        setActiveMenu(activeMenu === ticketId ? null : ticketId)
    }

    const handleCloseEditModal = () => {
        setEditingTicket(null)
    }

    const handleUpdateTicket = async (ticketId, ticketData) => {
        const result = await onUpdate(ticketId, ticketData)
        if (result.success) {
            toast.success("Ticket actualizado correctamente")
            setEditingTicket(null)
            return true
        } else {
            toast.error("Error al actualizar el ticket")
            return false
        }
    }

    const formatticket_type = (ticket_type) => {
        switch (ticket_type) {
            case "PAGADO":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        PAGADO
                    </span>
                )
            case "GRATIS":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        GRATIS
                    </span>
                )
            case "DONACION":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        DONACIÓN
                    </span>
                )
            case "ESCALONADO":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        ESCALONADO
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ticket_type || "DESCONOCIDO"}
                    </span>
                )
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (tickets.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No hay tickets disponibles</p>
                    <p>Crea tu primer ticket haciendo clic en el botón {"Crear Ticket"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{ticket.name}</div>
                                {ticket.description && (
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatticket_type(ticket.ticket_type)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {ticket.ticket_type === "GRATIS" ? (
                                    <span className="text-sm text-gray-500">Gratis</span>
                                ) : ticket.ticket_type === "DONACION" ? (
                                    <span className="text-sm text-gray-900">Min: ${ticket.price?.toFixed(2) || "0.00"}</span>
                                ) : ticket.ticket_type === "ESCALONADO" ? (
                                    <span className="text-sm text-gray-900">Varios precios</span>
                                ) : (
                                    <span className="text-sm text-gray-900">${ticket.price?.toFixed(2) || "0.00"}</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {ticket.quantity === 0 ? (
                                    <span className="text-sm text-gray-500">Ilimitado</span>
                                ) : (
                                    <span className="text-sm text-gray-900">{ticket.quantity}</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="relative inline-block text-left">
                                    <button
                                        onClick={() => handleMenuToggle(ticket.id)}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <EllipsisVertical className="h-5 w-5" />
                                    </button>

                                    {activeMenu === ticket.id && (
                                        <div
                                            className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 ${tickets.indexOf(ticket) > tickets.length - 3
                                                    ? "origin-bottom-right bottom-full mb-2"
                                                    : "origin-top-right top-full"
                                                }`}
                                        >
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <Link
                                                    to={`/manage/event/${eventId}/messages`}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                    onClick={() => setActiveMenu(null)}
                                                >
                                                    <MessageSquareShare className="mr-3 h-5 w-5 text-gray-500" />
                                                    Mensaje a los asistentes
                                                </Link>

                                                <button
                                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                    onClick={() => handleEditClick(ticket)}
                                                >
                                                    <Pencil className="mr-3 h-5 w-5 text-gray-500" />
                                                    Editar ticket
                                                </button>

                                                {ticket.ticket_type === "ESCALONADO" && (
                                                    <Link
                                                        to={`/manage/event/${eventId}/tickets/levels/${ticket.id}`}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                        onClick={() => setActiveMenu(null)}
                                                    >
                                                        <Eye className="mr-3 h-5 w-5 text-gray-500" />
                                                        Ver niveles
                                                    </Link>
                                                )}

                                                <button
                                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    role="menuitem"
                                                    onClick={() => handleDeleteClick(ticket.id)}
                                                >
                                                    <Trash className="mr-3 h-5 w-5 text-red-500" />
                                                    Eliminar billete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingTicket && (
                <EditTicketModal
                    ticket={editingTicket}
                    isOpen={!!editingTicket}
                    onClose={handleCloseEditModal}
                    onSubmit={(ticketData) => handleUpdateTicket(editingTicket.id, ticketData)}
                />
            )}
        </div>
    )
}

TicketList.propTypes = {
    tickets: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    eventId: PropTypes.string.isRequired,
}

export default TicketList

