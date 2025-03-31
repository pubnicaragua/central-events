"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { XIcon } from "lucide-react"
import PropTypes from "prop-types"

function EditTicketModal({ ticket, isOpen, onClose, onSubmit }) {
    const [ticketData, setTicketData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        start_date: "",
        end_date: "",
        hide_before_sale_start: false,
        hide_after_sale_end: false,
        hide_when_sold_out: false,
        show_available_quantity: false,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (ticket) {
            setTicketData({
                name: ticket.name || "",
                description: ticket.description || "",
                price: ticket.price || "",
                quantity: ticket.quantity || "",
                start_date: ticket.start_date || "",
                end_date: ticket.end_date || "",
                hide_before_sale_start: ticket.hide_before_sale_start || false,
                hide_after_sale_end: ticket.hide_after_sale_end || false,
                hide_when_sold_out: ticket.hide_when_sold_out || false,
                show_available_quantity: ticket.show_available_quantity || false,
            })
        }
    }, [ticket])

    const handleQuantityTypeChange = (isUnlimited) => {
        if (isUnlimited) {
            setTicketData({ ...ticketData, quantity: 0 })
        } else {
            setTicketData({ ...ticketData, quantity: "" })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            // Validar datos según el tipo de ticket
            if (ticket.ticket_type !== "GRATIS" && (!ticketData.price || Number.parseFloat(ticketData.price) < 0)) {
                toast.error("Por favor, ingresa un precio válido")
                return
            }

            if (ticketData.quantity !== 0 && (!ticketData.quantity || Number.parseInt(ticketData.quantity) <= 0)) {
                toast.error("Por favor, ingresa una cantidad válida o selecciona ilimitado")
                return
            }

            const result = await onSubmit({
                ...ticketData,
                price: Number.parseFloat(ticketData.price) || 0,
                quantity: Number.parseInt(ticketData.quantity) || 0,
            })

            if (result) {
                toast.success("Ticket actualizado correctamente")
                onClose()
            }
        } catch (error) {
            console.error("Error updating ticket:", error)
            toast.error("Error al actualizar el ticket")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Editar Ticket</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={ticketData.name}
                                        onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                                        required
                                        placeholder="Entrada VIP"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={ticketData.description}
                                        onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                                        placeholder="Descripción del ticket"
                                        rows={3}
                                    />
                                </div>

                                {ticket.ticket_type !== "GRATIS" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {ticket.ticket_type === "DONACION" ? "Precio mínimo" : "Precio"}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full pl-8 pr-3 py-2 border rounded-md"
                                                value={ticketData.price}
                                                onChange={(e) => setTicketData({ ...ticketData, price: e.target.value })}
                                                required={ticket.ticket_type !== "GRATIS"}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad disponible</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-3 py-2 border rounded-md appearance-none"
                                            value={ticketData.quantity === 0 ? "unlimited" : "limited"}
                                            onChange={(e) => handleQuantityTypeChange(e.target.value === "unlimited")}
                                        >
                                            <option value="unlimited">Ilimitado</option>
                                            <option value="limited">Cantidad específica</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {ticketData.quantity !== 0 && (
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 border rounded-md mt-2"
                                            value={ticketData.quantity}
                                            onChange={(e) => setTicketData({ ...ticketData, quantity: e.target.value })}
                                            required={ticketData.quantity !== 0}
                                            placeholder="Cantidad"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio de la venta</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-3 py-2 border rounded-md"
                                            value={ticketData.start_date}
                                            onChange={(e) => setTicketData({ ...ticketData, start_date: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha de finalización de la venta
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-3 py-2 border rounded-md"
                                            value={ticketData.end_date}
                                            onChange={(e) => setTicketData({ ...ticketData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="hide-before-edit"
                                            type="checkbox"
                                            className="h-4 w-4 text-purple-600 rounded"
                                            checked={ticketData.hide_before_sale_start}
                                            onChange={(e) => setTicketData({ ...ticketData, hide_before_sale_start: e.target.checked })}
                                        />
                                        <label htmlFor="hide-before-edit" className="ml-2 text-sm text-gray-700">
                                            Ocultar boleto antes de la fecha de inicio de venta
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="hide-after-edit"
                                            type="checkbox"
                                            className="h-4 w-4 text-purple-600 rounded"
                                            checked={ticketData.hide_after_sale_end}
                                            onChange={(e) => setTicketData({ ...ticketData, hide_after_sale_end: e.target.checked })}
                                        />
                                        <label htmlFor="hide-after-edit" className="ml-2 text-sm text-gray-700">
                                            Ocultar boleto después de la fecha de finalización de la venta
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="hide-sold-out-edit"
                                            type="checkbox"
                                            className="h-4 w-4 text-purple-600 rounded"
                                            checked={ticketData.hide_when_sold_out}
                                            onChange={(e) => setTicketData({ ...ticketData, hide_when_sold_out: e.target.checked })}
                                        />
                                        <label htmlFor="hide-sold-out-edit" className="ml-2 text-sm text-gray-700">
                                            Ocultar entrada cuando esté agotada
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="show-quantity-edit"
                                            type="checkbox"
                                            className="h-4 w-4 text-purple-600 rounded"
                                            checked={ticketData.show_available_quantity}
                                            onChange={(e) => setTicketData({ ...ticketData, show_available_quantity: e.target.checked })}
                                        />
                                        <label htmlFor="show-quantity-edit" className="ml-2 text-sm text-gray-700">
                                            Mostrar cantidad de entradas disponibles
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditTicketModal

EditTicketModal.propTypes = {
    ticket: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};