"use client"

import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import { X } from "lucide-react"
import PropTypes from "prop-types"

function AddAttendeeModal({ isOpen, onClose, onSubmit, eventId, tickets }) {
    const [formData, setFormData] = useState({
        name: "",
        second_name: "",
        email: "",
        code: "",
        status: "ACTIVE",
        ticket_id: "",
        order_id: "",
    })
    const [orders, setOrders] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [useExistingOrder, setUseExistingOrder] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isOpen) {
            fetchOrders()
        }
    }, [isOpen, eventId, supabase])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select("id, name, email")
                .eq("event_id", eventId)
                .order("created_at", { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error("Error fetching orders:", error)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Limpiar error del campo
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es obligatorio"
        }

        if (!formData.email.trim()) {
            newErrors.email = "El email es obligatorio"
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "El email no es válido"
        }

        if (useExistingOrder && !formData.order_id) {
            newErrors.order_id = "Debes seleccionar una orden"
        }

        if (!useExistingOrder && !formData.ticket_id) {
            newErrors.ticket_id = "Debes seleccionar un ticket"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setIsSubmitting(true)
            const result = await onSubmit(formData)

            if (result.success) {
                onClose()
            }
        } catch (error) {
            console.error("Error submitting form:", error)
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
                            <h3 className="text-lg font-medium text-gray-900">Agregar asistente</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Complete los datos del asistente para registrarlo en el evento.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="second_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        id="second_name"
                                        name="second_name"
                                        value={formData.second_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                        Código de referencia
                                    </label>
                                    <input
                                        type="text"
                                        id="code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="ACTIVE">No confirmado</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="use-existing-order"
                                        type="checkbox"
                                        checked={useExistingOrder}
                                        onChange={() => setUseExistingOrder(!useExistingOrder)}
                                        className="h-4 w-4 text-purple-600 rounded"
                                    />
                                    <label htmlFor="use-existing-order" className="ml-2 text-sm text-gray-700">
                                        Usar orden existente
                                    </label>
                                </div>

                                {useExistingOrder ? (
                                    <div>
                                        <label htmlFor="order_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Orden <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="order_id"
                                            name="order_id"
                                            value={formData.order_id}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.order_id ? "border-red-500" : "border-gray-300"
                                                }`}
                                        >
                                            <option value="">Seleccionar orden</option>
                                            {orders.map((order) => (
                                                <option key={order.id} value={order.id}>
                                                    #{order.id} - {order.name} ({order.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.order_id && <p className="mt-1 text-sm text-red-500">{errors.order_id}</p>}
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="ticket_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Ticket <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="ticket_id"
                                            name="ticket_id"
                                            value={formData.ticket_id}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.ticket_id ? "border-red-500" : "border-gray-300"
                                                }`}
                                        >
                                            <option value="">Seleccionar ticket</option>
                                            {tickets.map((ticket) => (
                                                <option key={ticket.id} value={ticket.id}>
                                                    {ticket.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.ticket_id && <p className="mt-1 text-sm text-red-500">{errors.ticket_id}</p>}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

AddAttendeeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    eventId: PropTypes.string.isRequired,
    tickets: PropTypes.array.isRequired,
}

export default AddAttendeeModal

