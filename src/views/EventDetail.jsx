/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

function EventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [eventConfig, setEventConfig] = useState(null)
  const [homeConfig, setHomeConfig] = useState(null)
  const [location, setLocation] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

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

        // Obtener configuración del evento
        const { data: configData, error: configError } = await supabase
          .from("event_configs")
          .select(`
            *,
            location:location_id(*)
          `)
          .eq("event_id", eventId)
          .single()

        if (configError && configError.code !== "PGRST116") throw configError

        // Obtener configuración de la página de inicio
        const { data: homeConfigData, error: homeConfigError } = await supabase
          .from("homepage_conf")
          .select("*")
          .eq("event_id", eventId)
          .single()

        if (homeConfigError && homeConfigError.code !== "PGRST116") {
          console.warn("No se encontró configuración de página de inicio:", homeConfigError)
        }

        // Obtener tickets disponibles
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("*")
          .eq("event_id", eventId)
          .order("price", { ascending: true })

        if (ticketsError) throw ticketsError

        setEvent(eventData)
        setEventConfig(configData || { event_id: Number.parseInt(eventId) })
        setLocation(configData?.location || null)
        setHomeConfig(homeConfigData || null)
        setTickets(ticketsData || [])
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
  }, [eventId, supabase])

  const handleSelectTicket = (ticketId) => {
    navigate(`/checkout/${eventId}/${ticketId}`)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Evento no encontrado</h2>
          <p className="text-gray-700">El evento que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    )

  // Determinar el estilo del encabezado según la configuración
  const headerStyle = {}
  const textColorStyle = {}

  if (homeConfig) {
    if (homeConfig.bg_type === "image" && homeConfig.image_url) {
      headerStyle.backgroundImage = `url(${homeConfig.image_url})`
      headerStyle.backgroundSize = "cover"
      headerStyle.backgroundPosition = "center"
      // Añadir un overlay oscuro para mejorar la legibilidad del texto
      headerStyle.backgroundColor = "rgba(0, 0, 0, 0.5)"
      headerStyle.backgroundBlendMode = "darken"
      textColorStyle.color = homeConfig.primary_text_color || "white"
    } else {
      headerStyle.backgroundColor = homeConfig.page_bg_color || "#f3f4f6"
      textColorStyle.color = homeConfig.primary_text_color || "#1f2937"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con imagen o color de fondo */}
      <div
        className="w-full relative py-20 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center"
        style={headerStyle}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={textColorStyle}>
          {event.name}
        </h1>
        <div className="flex items-center text-sm md:text-base" style={textColorStyle}>
          <Calendar className="mr-2 h-5 w-5" />
          <span>{formatDate(event.start_date)}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna izquierda: Información del evento */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Sobre el evento</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">{event.description}</p>

              <div className="flex items-center mb-4">
                <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Fecha y hora</h3>
                  <p className="text-gray-600">{formatDate(event.start_date)}</p>
                  {event.end_date && event.end_date !== event.start_date && (
                    <p className="text-gray-600">Hasta: {formatDate(event.end_date)}</p>
                  )}
                </div>
              </div>

              {location && !location.is_online && (
                <div className="flex items-start mb-4">
                  <MapPin className="mr-3 h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-medium">{location.name || "Ubicación"}</h3>
                    <p className="text-gray-600">{location.address}</p>
                    {location.second_address && <p className="text-gray-600">{location.second_address}</p>}
                    <p className="text-gray-600">
                      {[location.city, location.state, location.postal_code].filter(Boolean).join(", ")}
                    </p>

                    {location.map_url && (
                      <a
                        href={location.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Ver mapa
                      </a>
                    )}

                    {location.address && !location.map_url && googleMapsApiKey && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          [location.address, location.city, location.state, location.postal_code]
                            .filter(Boolean)
                            .join(", "),
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

              {location && location.is_online && (
                <div className="flex items-center mb-4">
                  <Clock className="mr-3 h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Evento en línea</h3>
                    <p className="text-gray-600">Este es un evento virtual</p>
                    {location.description && <p className="text-gray-600 mt-1">{location.description}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Tickets */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Entradas</h2>

              {tickets.length === 0 ? (
                <p className="text-gray-600">No hay entradas disponibles en este momento.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{ticket.name}</h3>
                          {ticket.description && <p className="text-sm text-gray-600">{ticket.description}</p>}
                        </div>
                        <div className="text-right">
                          {ticket.ticket_type === "GRATIS" ? (
                            <span className="font-bold text-green-600">Gratis</span>
                          ) : ticket.ticket_type === "DONACION" ? (
                            <span className="font-bold">Min: ${ticket.price?.toFixed(2) || "0.00"}</span>
                          ) : ticket.ticket_type === "ESCALONADO" ? (
                            <span className="font-bold">Varios precios</span>
                          ) : (
                            <span className="font-bold">${ticket.price?.toFixed(2) || "0.00"}</span>
                          )}

                          {ticket.quantity !== 0 && ticket.show_available_quantity && (
                            <p className="text-xs text-gray-500">{ticket.quantity} disponibles</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectTicket(ticket.id)}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventPage

