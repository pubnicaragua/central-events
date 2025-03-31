"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { ArrowLeft } from "lucide-react"
import { toast } from "react-hot-toast"

function AmenitiesPage() {
    const { eventId, ticketId } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [ticket, setTicket] = useState(null)
    const [amenities, setAmenities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Datos de los asistentes y sus amenidades seleccionadas
    const [attendees, setAttendees] = useState([])
    const [buyerData, setBuyerData] = useState(null)
    const [selectedAmenities, setSelectedAmenities] = useState({})

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                // Obtener datos del evento
                const { data: eventData, error: eventError } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", eventId)
                    .single()

                if (eventError) throw eventError

                // Obtener datos del ticket
                const { data: ticketData, error: ticketError } = await supabase
                    .from("tickets")
                    .select("*")
                    .eq("id", ticketId)
                    .single()

                if (ticketError) throw ticketError

                // Obtener amenidades disponibles
                const { data: amenitiesData, error: amenitiesError } = await supabase
                    .from("amenities")
                    .select("*")
                    .eq("event_id", eventId)

                if (amenitiesError) throw amenitiesError

                setEvent(eventData)
                setTicket(ticketData)
                setAmenities(amenitiesData || [])

                // Recuperar datos de los asistentes del localStorage
                const savedAttendees = localStorage.getItem("attendees")
                const savedBuyerData = localStorage.getItem("buyerData")

                if (savedAttendees && savedBuyerData) {
                    const parsedAttendees = JSON.parse(savedAttendees)
                    const parsedBuyerData = JSON.parse(savedBuyerData)
                    setAttendees(parsedAttendees)
                    setBuyerData(parsedBuyerData)

                    // Inicializar las amenidades seleccionadas
                    const initialSelectedAmenities = {}
                    parsedAttendees.forEach((_, index) => {
                        initialSelectedAmenities[index] = {}
                        amenitiesData.forEach((amenity) => {
                            initialSelectedAmenities[index][amenity.id] = 0
                        })
                    })

                    // Recuperar amenidades seleccionadas si existen
                    const savedSelectedAmenities = localStorage.getItem("selectedAmenities")
                    if (savedSelectedAmenities) {
                        setSelectedAmenities(JSON.parse(savedSelectedAmenities))
                    } else {
                        setSelectedAmenities(initialSelectedAmenities)
                    }
                } else {
                    // Si no hay datos de asistentes, redirigir al checkout
                    navigate(`/checkout/${eventId}/${ticketId}`)
                }
            } catch (err) {
                console.error("Error fetching data:", err)
                setError("Error al cargar los datos del evento o ticket")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [eventId, ticketId, supabase, navigate])

    const handleAmenityChange = (attendeeIndex, amenityId, quantity) => {
        setSelectedAmenities((prev) => ({
            ...prev,
            [attendeeIndex]: {
                ...prev[attendeeIndex],
                [amenityId]: Number.parseInt(quantity),
            },
        }))
    }

    const handleCopyToAll = (amenityId, quantity) => {
        const updatedSelectedAmenities = { ...selectedAmenities }

        attendees.forEach((_, index) => {
            updatedSelectedAmenities[index] = {
                ...updatedSelectedAmenities[index],
                [amenityId]: Number.parseInt(quantity),
            }
        })

        setSelectedAmenities(updatedSelectedAmenities)
        toast.success("Cantidad copiada a todos los asistentes")
    }

    const calculateTotal = () => {
        let total = 0

        // Sumar el precio de los tickets
        if (ticket) {
            total += Number.parseFloat(ticket.price) * attendees.length
        }

        // Sumar el precio de las amenidades
        Object.keys(selectedAmenities).forEach((attendeeIndex) => {
            Object.keys(selectedAmenities[attendeeIndex]).forEach((amenityId) => {
                const quantity = selectedAmenities[attendeeIndex][amenityId]
                const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())
                if (amenity && quantity > 0) {
                    total += Number.parseFloat(amenity.price) * quantity
                }
            })
        })

        return total
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)

            // Guardar las amenidades seleccionadas en localStorage
            localStorage.setItem("selectedAmenities", JSON.stringify(selectedAmenities))

            // Redirigir a la página de confirmación
            navigate(`/confirm/${eventId}/${ticketId}`)
        } catch (error) {
            console.error("Error saving amenities:", error)
            toast.error("Error al guardar las amenidades")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <Link to={`/event/${eventId}`} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al evento
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <Link
                    to={`/checkout/${eventId}/${ticketId}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al checkout
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna principal */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-6">Seleccionar amenidades</h2>

                            {attendees.map((attendee, attendeeIndex) => (
                                <div key={attendeeIndex} className="mb-8">
                                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                                        <h3 className="text-lg font-medium mb-2">
                                            Asistente {attendeeIndex + 1} - {attendee.firstName} {attendee.lastName}
                                        </h3>
                                        <p className="text-gray-600">{attendee.email}</p>
                                    </div>

                                    {amenities.length > 0 ? (
                                        <div className="space-y-4">
                                            {amenities.map((amenity) => (
                                                <div key={amenity.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{amenity.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                ${Number.parseFloat(amenity.price).toFixed(2)} c/u - Disponibles: {amenity.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={amenity.quantity}
                                                                value={selectedAmenities[attendeeIndex]?.[amenity.id] || 0}
                                                                onChange={(e) => handleAmenityChange(attendeeIndex, amenity.id, e.target.value)}
                                                                className="w-16 px-2 py-1 border rounded-md text-center"
                                                            />
                                                            {attendeeIndex === 0 && attendees.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleCopyToAll(amenity.id, selectedAmenities[attendeeIndex][amenity.id])
                                                                    }
                                                                    className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                                                >
                                                                    Copiar a todos
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No hay amenidades disponibles para este evento.</p>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-between mt-6">
                                <Link
                                    to={`/checkout/${eventId}/${ticketId}`}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                                >
                                    Atrás
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columna de resumen */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

                            <div className="border-b pb-4 mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium">{ticket?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {attendees.length} x ${Number.parseFloat(ticket?.price || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        ${(Number.parseFloat(ticket?.price || 0) * attendees.length).toFixed(2)}
                                    </p>
                                </div>

                                {/* Mostrar amenidades seleccionadas */}
                                {Object.keys(selectedAmenities).map((attendeeIndex) => {
                                    const attendeeAmenities = selectedAmenities[attendeeIndex]
                                    return Object.keys(attendeeAmenities)
                                        .map((amenityId) => {
                                            const quantity = attendeeAmenities[amenityId]
                                            const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())

                                            if (amenity && quantity > 0) {
                                                return (
                                                    <div key={`${attendeeIndex}-${amenityId}`} className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-sm">{amenity.name}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {quantity} x ${Number.parseFloat(amenity.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm">${(Number.parseFloat(amenity.price) * quantity).toFixed(2)}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        })
                                        .filter(Boolean)
                                })}
                            </div>

                            <div className="flex justify-between items-center font-bold">
                                <p>Total</p>
                                <p>${calculateTotal().toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AmenitiesPage

