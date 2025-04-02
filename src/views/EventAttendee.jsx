"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Info, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Alert, AlertDescription } from "../components/ui/alert"

const EventAttendee = () => {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [eventDesign, setEventDesign] = useState(null)
    const [loading, setLoading] = useState(true)
    const [attendeeCode, setAttendeeCode] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState("")
    const [location, setLocation] = useState(null)
    const [organizer, setOrganizer] = useState(null)
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyC-BA-7oTyLAxz4dXapvVLM3SdK5KdZVcQ"

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true)

                // Fetch event details
                const { data: eventData, error: eventError } = await supabase
                    .from("events")
                    .select("*, organizer_id")
                    .eq("id", eventId)
                    .single()

                if (eventError) throw eventError

                setEvent(eventData)

                // Fetch event design
                const { data: designData, error: designError } = await supabase
                    .from("homepage_design")
                    .select("*")
                    .eq("event_id", eventId)
                    .single()

                if (!designError) {
                    setEventDesign(designData)
                }

                // Fetch location if available
                if (eventData.location_id) {
                    const { data: locationData, error: locationError } = await supabase
                        .from("location")
                        .select("*")
                        .eq("id", eventData.location_id)
                        .single()

                    if (!locationError) {
                        setLocation(locationData)
                    }
                }

                // Fetch organizer if available
                if (eventData.organizer_id) {
                    const { data: organizerData, error: organizerError } = await supabase
                        .from("organizers")
                        .select("*")
                        .eq("id", eventData.organizer_id)
                        .single()

                    if (!organizerError) {
                        setOrganizer(organizerData)
                    }
                }
            } catch (error) {
                console.error("Error fetching event data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchEventData()
    }, [eventId])

    const verifyAttendeeCode = async () => {
        if (!attendeeCode.trim()) {
            setError("Por favor ingresa tu código de asistente")
            return
        }

        try {
            setVerifying(true)
            setError("")

            const { data, error } = await supabase
                .from("attendants")
                .select("id")
                .eq("event_id", eventId)
                .eq("code", attendeeCode.trim())
                .single()

            if (error) {
                setError("Código de asistente no válido")
                return
            }

            if (data) {
                // Redirect to attendee page
                navigate(`/events/${eventId}/attendee/${data.id}`)
            }
        } catch (error) {
            console.error("Error verifying attendee code:", error)
            setError("Ocurrió un error al verificar el código")
        } finally {
            setVerifying(false)
        }
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return ""
        try {
            return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
        } catch (error) {
            return dateString
        }
    }

    // Helper function to format time
    const formatTime = (timeString) => {
        if (!timeString) return ""
        try {
            return format(new Date(`2000-01-01T${timeString}`), "h:mm a")
        } catch (error) {
            return timeString
        }
    }

    // Get background style based on design settings
    const getBackgroundStyle = () => {
        if (!eventDesign) return {}

        if (eventDesign.background_type === "image" && eventDesign.cover_image) {
            return {
                backgroundImage: `url(${eventDesign.cover_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        } else if (eventDesign.background_type === "color") {
            return {
                backgroundColor: eventDesign.page_background_color || "#f7f9fb",
            }
        }

        return {}
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <span className="ml-2 text-lg">Cargando evento...</span>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold mb-2">Evento no encontrado</h1>
                <p className="text-gray-600 mb-4">El evento que buscas no existe o ha sido eliminado.</p>
                <Button onClick={() => window.history.back()}>Volver</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero section with event banner or color */}
            <div className="w-full h-64 md:h-80 flex items-center justify-center relative" style={getBackgroundStyle()}>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{event.name}</h1>
                        <div className="flex items-center justify-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            <p>{formatDate(event.start_date)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event details */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sobre el evento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {event.description && (
                                    <div>
                                        <p className="whitespace-pre-line">{event.description}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                                        <div>
                                            <h3 className="font-medium">Fecha y hora</h3>
                                            <p className="text-gray-600">{formatDate(event.start_date)}</p>
                                            <p className="text-gray-600">
                                                {formatTime(event.start_time)}
                                                {event.end_time && ` - ${formatTime(event.end_time)}`}
                                            </p>
                                            {event.end_date && event.end_date !== event.start_date && (
                                                <p className="text-gray-600">Hasta: {formatDate(event.end_date)}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                                        <div>
                                            <h3 className="font-medium">Dirección</h3>
                                            {location ? (
                                                <>
                                                    <p className="text-gray-600">{location.name}</p>
                                                    <p className="text-gray-600">{location.address}</p>
                                                    {location.second_address && <p className="text-gray-600">{location.second_address}</p>}
                                                    <p className="text-gray-600">
                                                        {location.city}, {location.state} {location.postal_code}
                                                    </p>

                                                    {location.map_url && (
                                                        <a
                                                            href={location.map_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline inline-flex items-center mt-2"
                                                        >
                                                            Ver en mapa <ArrowRight className="w-4 h-4 ml-1" />
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-600">{event.location || "Ubicación por confirmar"}</p>
                                            )}

                                            {/* Google Maps embed if we have coordinates */}
                                            {location && location.map_url && (
                                                <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(
                                                            `${location.address}, ${location.city}, ${location.state}`,
                                                        )}`}
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {organizer && (
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-gray-500 mt-1" />
                                            <div>
                                                <h3 className="font-medium">Organizador</h3>
                                                <div className="flex items-center">
                                                    {organizer.logo_url && (
                                                        <img
                                                            src={organizer.logo_url || "/placeholder.svg"}
                                                            alt={organizer.name}
                                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                                            onError={(e) => {
                                                                e.target.src = "/placeholder.svg?height=40&width=40"
                                                            }}
                                                        />
                                                    )}
                                                    <p className="text-gray-600">{organizer.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendee verification */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Verificar asistencia</CardTitle>
                                <CardDescription>Ingresa tu código de asistente para verificar tu registro</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Código de asistente"
                                        value={attendeeCode}
                                        onChange={(e) => setAttendeeCode(e.target.value)}
                                    />

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button className="w-full" onClick={verifyAttendeeCode} disabled={verifying || !attendeeCode.trim()}>
                                        {verifying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            "Verificar código"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start text-sm text-gray-500">
                                <p>El código fue enviado a tu correo electrónico.</p>
                                <p>Si no lo encuentras, revisa tu carpeta de spam.</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            <footer className="bg-gray-100 py-6 mt-8">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Central Events - Todos los derechos reservados</p>
                </div>
            </footer>
        </div>
    )
}

export default EventAttendee

