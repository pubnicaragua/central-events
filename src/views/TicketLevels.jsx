"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { toast } from "react-hot-toast"
import { ArrowLeft, PlusCircle  } from "lucide-react"
import PropTypes from "prop-types"

function TicketLevelsPage() {
    const { eventId, ticketId } = useParams()
    const [ticket, setTicket] = useState(null)
    const [levels, setLevels] = useState([])
    const [loading, setLoading] = useState(true)
    const [newLevel, setNewLevel] = useState({
        level_name: "",
        price: "",
        quantity: "",
        begin_date: "",
        end_date: "",
        tag: "",
    })

    useEffect(() => {
        fetchTicketAndLevels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, ticketId])

    const fetchTicketAndLevels = async () => {
        try {
            setLoading(true)

            // Obtener información del ticket
            const { data: ticketData, error: ticketError } = await supabase
                .from("tickets")
                .select("*")
                .eq("id", ticketId)
                .single()

            if (ticketError) throw ticketError
            setTicket(ticketData)

            // Obtener niveles del ticket
            const { data: levelsData, error: levelsError } = await supabase
                .from("ticket_levels")
                .select("*")
                .eq("ticket_id", ticketId)
                .order("price", { ascending: true })

            if (levelsError) throw levelsError
            setLevels(levelsData || [])
        } catch (error) {
            console.error("Error fetching ticket levels:", error)
            toast.error("Error al cargar los niveles del ticket")
        } finally {
            setLoading(false)
        }
    }

    const handleAddLevel = async (e) => {
        e.preventDefault()

        try {
            const { data, error } = await supabase
                .from("ticket_levels")
                .insert({
                    ...newLevel,
                    ticket_id: ticketId,
                    price: Number.parseFloat(newLevel.price) || 0,
                    quantity: newLevel.quantity === "" ? null : Number.parseInt(newLevel.quantity),
                })
                .select()

            if (error) throw error

            setLevels([...levels, data[0]])
            setNewLevel({
                level_name: "",
                price: "",
                quantity: "",
                begin_date: "",
                end_date: "",
                tag: "",
            })
            toast.success("Nivel añadido correctamente")
        } catch (error) {
            console.error("Error adding level:", error)
            toast.error("Error al añadir el nivel")
        }
    }

    const handleUpdateLevel = async (id, updatedData) => {
        try {
            const { data, error } = await supabase.from("ticket_levels").update(updatedData).eq("id", id).select()

            if (error) throw error

            setLevels(levels.map((level) => (level.id === id ? data[0] : level)))
            toast.success("Nivel actualizado correctamente")
            return true
        } catch (error) {
            console.error("Error updating level:", error)
            toast.error("Error al actualizar el nivel")
            return false
        }
    }

    const handleDeleteLevel = async (id) => {
        try {
            const { error } = await supabase.from("ticket_levels").delete().eq("id", id)

            if (error) throw error

            setLevels(levels.filter((level) => level.id !== id))
            toast.success("Nivel eliminado correctamente")
        } catch (error) {
            console.error("Error deleting level:", error)
            toast.error("Error al eliminar el nivel")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>No se encontró el ticket solicitado.</p>
                    <Link to={`/manage/event/${eventId}/tickets`} className="text-red-700 underline">
                        Volver a la lista de tickets
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center gap-2 mb-6">
                <Link to={`/manage/event/${eventId}/tickets`} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft width={20} height={20} />
                </Link>
                <h1 className="text-2xl font-bold">Niveles de precio: {ticket.name}</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Añadir nuevo nivel</h2>
                <form onSubmit={handleAddLevel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del nivel</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.level_name}
                            onChange={(e) => setNewLevel({ ...newLevel, level_name: e.target.value })}
                            required
                            placeholder="Ej: Early Bird"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Precio</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-3 py-2 border rounded-md"
                                value={newLevel.price}
                                onChange={(e) => setNewLevel({ ...newLevel, price: e.target.value })}
                                required
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad disponible</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.quantity}
                            onChange={(e) => setNewLevel({ ...newLevel, quantity: e.target.value })}
                            placeholder="Dejar vacío para ilimitado"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Etiqueta (opcional)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.tag}
                            onChange={(e) => setNewLevel({ ...newLevel, tag: e.target.value })}
                            placeholder="Ej: Promoción"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.begin_date}
                            onChange={(e) => setNewLevel({ ...newLevel, begin_date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha de finalización</label>
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.end_date}
                            onChange={(e) => setNewLevel({ ...newLevel, end_date: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                            <PlusCircle width={20} height={20} />
                            <span>Añadir nivel</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Etiqueta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Periodo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {levels.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No hay niveles de precio configurados para este ticket.
                                </td>
                            </tr>
                        ) : (
                            levels.map((level) => (
                                <LevelRow key={level.id} level={level} onUpdate={handleUpdateLevel} onDelete={handleDeleteLevel} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function LevelRow({ level, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        level_name: level.level_name || "",
        price: level.price || "",
        quantity: level.quantity === null ? "" : level.quantity,
        tag: level.tag || "",
        begin_date: level.begin_date || "",
        end_date: level.end_date || "",
    })

    const handleSave = async () => {
        const success = await onUpdate(level.id, {
            ...editData,
            price: Number.parseFloat(editData.price) || 0,
            quantity: editData.quantity === "" ? null : Number.parseInt(editData.quantity),
        })

        if (success) {
            setIsEditing(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "No definido"
        return new Date(dateString).toLocaleString()
    }

    if (isEditing) {
        return (
            <tr>
                <td className="px-6 py-4">
                    <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editData.level_name}
                        onChange={(e) => setEditData({ ...editData, level_name: e.target.value })}
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full pl-6 pr-2 py-1 border rounded-md"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <input
                        type="number"
                        min="1"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editData.quantity}
                        onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                        placeholder="Ilimitado"
                    />
                </td>
                <td className="px-6 py-4">
                    <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editData.tag}
                        onChange={(e) => setEditData({ ...editData, tag: e.target.value })}
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                        <input
                            type="datetime-local"
                            className="w-full px-2 py-1 border rounded-md"
                            value={editData.begin_date}
                            onChange={(e) => setEditData({ ...editData, begin_date: e.target.value })}
                        />
                        <input
                            type="datetime-local"
                            className="w-full px-2 py-1 border rounded-md"
                            value={editData.end_date}
                            onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                        />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded-md text-sm">
                            Guardar
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-2 py-1 rounded-md text-sm">
                            Cancelar
                        </button>
                    </div>
                </td>
            </tr>
        )
    }

    return (
        <tr>
            <td className="px-6 py-4">{level.level_name || "Sin nombre"}</td>
            <td className="px-6 py-4">${level.price?.toFixed(2) || "0.00"}</td>
            <td className="px-6 py-4">{level.quantity === null ? "Ilimitado" : level.quantity}</td>
            <td className="px-6 py-4">
                {level.tag ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {level.tag}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="text-xs">
                    <div>Inicio: {formatDate(level.begin_date)}</div>
                    <div>Fin: {formatDate(level.end_date)}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-900 text-sm">
                        Editar
                    </button>
                    <button onClick={() => onDelete(level.id)} className="text-red-600 hover:text-red-900 text-sm">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default TicketLevelsPage

LevelRow.propTypes = {
    level: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};