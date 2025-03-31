"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { ArrowLeft, Search, Check, X, QrCode } from "lucide-react"
import { toast } from "react-hot-toast"
import QrScanner from "qr-scanner"

function CheckInPage() {
    const { eventId } = useParams()
    const [event, setEvent] = useState(null)
    const [attendees, setAttendees] = useState([])
    const [filteredAttendees, setFilteredAttendees] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scanning, setScanning] = useState(false)

    const videoRef = useRef(null)
    const scannerRef = useRef(null)

    useEffect(() => {
        async function fetchEventData() {
            try {
                setLoading(true)

                // Obtener datos del evento
                const { data: eventData, error: eventError } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", eventId)
                    .single()

                if (eventError) throw eventError

                setEvent(eventData)

                // Obtener todos los asistentes para este evento
                const { data: ordersData, error: ordersError } = await supabase
                    .from("orders")
                    .select("id")
                    .eq("event_id", eventId)

                if (ordersError) throw ordersError

                if (ordersData && ordersData.length > 0) {
                    const orderIds = ordersData.map((order) => order.id)

                    const { data: attendeesData, error: attendeesError } = await supabase
                        .from("attendants")
                        .select(`
              *,
              order:order_id(*)
            `)
                        .in("order_id", orderIds)

                    if (attendeesError) throw attendeesError

                    setAttendees(attendeesData || [])
                    setFilteredAttendees(attendeesData || [])
                }
            } catch (err) {
                console.error("Error fetching event data:", err)
                setError("Error al cargar los datos del evento")
            } finally {
                setLoading(false)
            }
        }

        if (eventId) {
            fetchEventData()
        }

        return () => {
            // Limpiar el scanner al desmontar
            if (scannerRef.current) {
                scannerRef.current.stop()
            }
        }
    }, [eventId, supabase])

    useEffect(() => {
        // Filtrar asistentes según la búsqueda
        if (searchQuery.trim() === "") {
            setFilteredAttendees(attendees)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = attendees.filter(
                (attendee) =>
                    attendee.name?.toLowerCase().includes(query) ||
                    attendee.second_name?.toLowerCase().includes(query) ||
                    attendee.email?.toLowerCase().includes(query) ||
                    attendee.id?.toString().includes(query),
            )
            setFilteredAttendees(filtered)
        }
    }, [searchQuery, attendees])

    const handleStatusChange = async (attendeeId, newStatus) => {
        try {
            const { error } = await supabase.from("attendants").update({ status: newStatus }).eq("id", attendeeId)

            if (error) throw error

            // Actualizar el estado local
            setAttendees(
                attendees.map((attendee) => (attendee.id === attendeeId ? { ...attendee, status: newStatus } : attendee)),
            )

            setFilteredAttendees(
                filteredAttendees.map((attendee) =>
                    attendee.id === attendeeId ? { ...attendee, status: newStatus } : attendee,
                ),
            )

            toast.success(`Asistente ${newStatus === "CONFIRMED" ? "confirmado" : "marcado como no confirmado"}`)
        } catch (error) {
            console.error("Error updating attendee status:", error)
            toast.error("Error al actualizar el estado del asistente")
        }
    }

    const startScanner = () => {
        setScanning(true)

        setTimeout(() => {
            if (videoRef.current) {
                if (scannerRef.current) {
                    scannerRef.current.stop()
                }

                scannerRef.current = new QrScanner(
                    videoRef.current,
                    (result) => {
                        try {
                            const data = JSON.parse(result.data)

                            if (data.attendeeId) {
                                handleQRCodeScanned(data)
                            } else {
                                toast.error("Código QR inválido")
                            }
                        } catch (error) {
                            console.error("Error parsing QR code:", error)
                            toast.error("Código QR inválido o mal formateado")
                        }
                    },
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    },
                )

                scannerRef.current.start().catch((error) => {
                    console.error("Error starting scanner:", error)
                    toast.error("Error al iniciar el escáner")
                    setScanning(false)
                })
            }
        }, 100)
    }

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop()
        }
        setScanning(false)
    }

    const handleQRCodeScanned = (data) => {
        const { attendeeId } = data

        // Buscar el asistente en la lista
        const attendee = attendees.find((a) => a.id.toString() === attendeeId.toString())

        if (attendee) {
            // Confirmar automáticamente al asistente
            handleStatusChange(attendee.id, "CONFIRMED")

            // Detener el escáner
            stopScanner()

            // Mostrar mensaje de éxito
            toast.success(`Asistente ${attendee.name} ${attendee.second_name} confirmado`)
        } else {
            toast.error("Asistente no encontrado para este evento")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error || "No se encontró el evento solicitado"}</p>
                    <Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        to={`/manage/event/${eventId}/dashboard`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al panel
                    </Link>

                    <h1 className="text-2xl font-bold">{event.name}</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Control de asistencia</h2>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border rounded-md"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>

                        <button
                            onClick={scanning ? stopScanner : startScanner}
                            className={`inline-flex items-center ${scanning ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                                } text-white py-2 px-4 rounded-md transition-colors`}
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            {scanning ? "Detener escáner" : "Escanear QR"}
                        </button>
                    </div>

                    {scanning && (
                        <div className="mb-6">
                            <div className="max-w-md mx-auto border-4 border-blue-500 rounded-lg overflow-hidden">
                                <video ref={videoRef} className="w-full h-auto"></video>
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">Apunta la cámara al código QR del asistente</p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAttendees.length > 0 ? (
                                    filteredAttendees.map((attendee) => (
                                        <tr key={attendee.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendee.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {attendee.name} {attendee.second_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendee.status === "CONFIRMED"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {attendee.status === "CONFIRMED" ? "Confirmado" : "No confirmado"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {attendee.status === "CONFIRMED" ? (
                                                    <button
                                                        onClick={() => handleStatusChange(attendee.id, "ACTIVE")}
                                                        className="text-red-600 hover:text-red-900 mr-4"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(attendee.id, "CONFIRMED")}
                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <Link to={`/order/${attendee.order_id}`} className="text-blue-600 hover:text-blue-900">
                                                    Ver orden
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No se encontraron asistentes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckInPage

