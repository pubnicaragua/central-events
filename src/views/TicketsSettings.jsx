"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import TicketList from "../components/TicketList"
import CreateTicketModal from "../components/CreateTicketModal"
import { PlusIcon } from "../components/Icons"

function TicketsSettings() {
    const { eventId } = useParams()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [sortBy, setSortBy] = useState("Por defecto")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchTickets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            // Obtener tickets
            const { data: ticketsData, error: ticketsError } = await supabase
                .from("tickets")
                .select("*")
                .eq("event_id", eventId)

            if (ticketsError) throw ticketsError

            // Para cada ticket escalonado, obtener sus niveles
            const ticketsWithLevels = await Promise.all(
                ticketsData.map(async (ticket) => {
                    if (ticket.ticket_type === "ESCALONADO") {
                        const { data: levelsData } = await supabase.from("ticket_levels").select("*").eq("ticket_id", ticket.id)

                        return { ...ticket, levels: levelsData || [] }
                    }
                    return ticket
                }),
            )

            setTickets(ticketsWithLevels || [])
        } catch (error) {
            console.error("Error fetching tickets:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTicket = async (ticketData) => {
        try {
            // Extraer los niveles si existen
            const { levels, ...ticketDataWithoutLevels } = ticketData

            // Insertar el ticket primero
            const { data, error } = await supabase
                .from("tickets")
                .insert([{ ...ticketDataWithoutLevels, event_id: eventId }])
                .select()

            if (error) throw error

            // Si es un ticket escalonado y tiene niveles, insertarlos
            if (ticketData.ticket_type === "ESCALONADO" && levels && levels.length > 0) {
                const ticketId = data[0].id

                // Preparar los niveles para inserción
                const levelsToInsert = levels.map((level) => ({
                    ticket_id: ticketId,
                    level_name: level.level_name,
                    price: level.price,
                    quantity: level.quantity,
                    tag: level.tag,
                }))

                // Insertar los niveles
                const { error: levelsError } = await supabase.from("ticket_levels").insert(levelsToInsert)

                if (levelsError) throw levelsError

                // Añadir los niveles al ticket para la UI
                data[0].levels = levels
            }

            setTickets([...tickets, data[0]])
            setIsModalOpen(false)
            return { success: true }
        } catch (error) {
            console.error("Error creating ticket:", error)
            return { success: false, error }
        }
    }

    const handleUpdateTicket = async (ticketId, ticketData) => {
        try {
            // Extraer los niveles si existen
            const { levels, ...ticketDataWithoutLevels } = ticketData

            // Actualizar el ticket primero
            const { data, error } = await supabase.from("tickets").update(ticketDataWithoutLevels).eq("id", ticketId).select()

            if (error) throw error

            // Si es un ticket escalonado y tiene niveles, actualizar los niveles
            if (ticketData.ticket_type === "ESCALONADO" && levels && levels.length > 0) {
                // Primero eliminar los niveles existentes
                const { error: deleteError } = await supabase.from("ticket_levels").delete().eq("ticket_id", ticketId)

                if (deleteError) throw deleteError

                // Preparar los niveles para inserción
                const levelsToInsert = levels.map((level) => ({
                    ticket_id: ticketId,
                    level_name: level.level_name,
                    price: level.price,
                    quantity: level.quantity,
                    tag: level.tag,
                }))

                // Insertar los nuevos niveles
                const { error: levelsError } = await supabase.from("ticket_levels").insert(levelsToInsert)

                if (levelsError) throw levelsError

                // Añadir los niveles al ticket para la UI
                data[0].levels = levels
            }

            setTickets(tickets.map((ticket) => (ticket.id === ticketId ? { ...data[0], levels: levels || [] } : ticket)))
            return { success: true }
        } catch (error) {
            console.error("Error updating ticket:", error)
            return { success: false, error }
        }
    }

    const handleDeleteTicket = async (ticketId) => {
        try {
            // Si es un ticket escalonado, eliminar primero los niveles
            const ticketToDelete = tickets.find((ticket) => ticket.id === ticketId)
            if (ticketToDelete && ticketToDelete.ticket_type === "ESCALONADO") {
                const { error: levelsError } = await supabase.from("ticket_levels").delete().eq("ticket_id", ticketId)

                if (levelsError) throw levelsError
            }

            // Eliminar el ticket
            const { error } = await supabase.from("tickets").delete().eq("id", ticketId)

            if (error) throw error

            setTickets(tickets.filter((ticket) => ticket.id !== ticketId))
            return { success: true }
        } catch (error) {
            console.error("Error deleting ticket:", error)
            return { success: false, error }
        }
    }

    const filteredTickets = tickets.filter((ticket) => ticket.name?.toLowerCase().includes(searchQuery.toLowerCase()))

    const sortedTickets = [...filteredTickets].sort((a, b) => {
        switch (sortBy) {
            case "Nombre (A-Z)":
                return a.name?.localeCompare(b.name)
            case "Nombre (Z-A)":
                return b.name?.localeCompare(a.name)
            case "Precio (Menor-Mayor)":
                return (a.price || 0) - (b.price || 0)
            case "Precio (Mayor-Menor)":
                return (b.price || 0) - (a.price || 0)
            default:
                return 0
        }
    })

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Entradas</h1>

            <div className="flex justify-between mb-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por nombre del billete..."
                        className="w-full px-4 py-2 border rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </span>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border rounded-md px-4 py-2 pr-8"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option>Por defecto</option>
                            <option>Nombre (A-Z)</option>
                            <option>Nombre (Z-A)</option>
                            <option>Precio (Menor-Mayor)</option>
                            <option>Precio (Mayor-Menor)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Crear Ticket</span>
                    </button>
                </div>
            </div>

            <TicketList
                tickets={sortedTickets}
                loading={loading}
                onUpdate={handleUpdateTicket}
                onDelete={handleDeleteTicket}
                eventId={eventId}
            />

            {isModalOpen && (
                <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTicket} />
            )}
        </div>
    )
}

export default TicketsSettings

