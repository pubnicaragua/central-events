"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import QRCode from "react-qr-code"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Ticket,
  ArrowLeft,
  Download,
  CalendarPlus,
  Trophy,
  Gift,
} from "lucide-react"
import { toast } from "../components/ui/use-toast"
import { ToastAction } from "../components/ui/toast"

const AttendeeDetail = () => {
  const { eventId, attendeeId } = useParams()
  const [attendee, setAttendee] = useState(null)
  const [event, setEvent] = useState(null)
  const [location, setLocation] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [raffleWins, setRaffleWins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWinNotification, setShowWinNotification] = useState(false)
  const [newWin, setNewWin] = useState(null)

  // Función para cargar las amenidades
  const fetchAmenities = async () => {
    try {
      // Fetch amenities for this attendee
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from("amenities_attendees")
        .select(`
          id,
          quantity,
          total,
          is_active,
          amenities (
            id,
            name,
            description,
            section_id,
            price
          )
        `)
        .eq("attendee_id", attendeeId)

      if (amenitiesError) throw amenitiesError

      if (amenitiesData && amenitiesData.length > 0) {
        // Obtener todos los section_ids únicos
        const sectionIds = [
          ...new Set(
            amenitiesData
              .filter((item) => item.amenities && item.amenities.section_id)
              .map((item) => item.amenities.section_id),
          ),
        ]

        // Si hay secciones, obtenerlas
        let sectionsMap = {}
        if (sectionIds.length > 0) {
          const { data: sectionsData } = await supabase
            .from("amenities_sections")
            .select("id, name, description")
            .in("id", sectionIds)

          if (sectionsData) {
            sectionsMap = sectionsData.reduce((acc, section) => {
              acc[section.id] = {
                id: section.id,
                name: section.name,
                description: section.description || "",
                items: [],
              }
              return acc
            }, {})
          }
        }

        // Agrupar amenidades por sección
        const groupedAmenities = amenitiesData.reduce((acc, item) => {
          if (!item.amenities) return acc

          const sectionId = item.amenities.section_id || "default"

          if (!acc[sectionId]) {
            // Si la sección existe en el mapa, usarla; si no, crear una sección por defecto
            if (sectionsMap[sectionId]) {
              acc[sectionId] = { ...sectionsMap[sectionId], items: [] }
            } else {
              acc[sectionId] = {
                id: "default",
                name: "General",
                description: "",
                items: [],
              }
            }
          }

          acc[sectionId].items.push({
            id: item.amenities.id,
            name: item.amenities.name,
            description: item.amenities.description || "",
            price: item.amenities.price || 0,
            quantity: item.quantity || 0,
            is_active: item.is_active,
            amenity_attendee_id: item.id,
          })

          return acc
        }, {})

        setAmenities(Object.values(groupedAmenities))
      } else {
        setAmenities([])
      }
    } catch (err) {
      console.error("Error fetching amenities:", err)
    }
  }

  // Función para cargar las rifas ganadas
  const fetchRaffleWins = async () => {
    try {
      const { data, error } = await supabase
        .from("raffle_winner")
        .select(`
          id,
          created_at,
          raffles (
            id,
            name,
            description
          )
        `)
        .eq("attendee_id", attendeeId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setRaffleWins(data || [])
    } catch (err) {
      console.error("Error fetching raffle wins:", err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch attendee data
        const { data: attendeeData, error: attendeeError } = await supabase
          .from("attendants")
          .select("*, tickets(*)")
          .eq("id", attendeeId)
          .eq("event_id", eventId)
          .single()

        if (attendeeError) throw new Error("No se pudo encontrar la información del asistente")
        setAttendee(attendeeData)

        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) throw new Error("No se pudo encontrar la información del evento")
        setEvent(eventData)

        // Fetch location data if available
        if (eventData.location_id) {
          const { data: locationData } = await supabase
            .from("location")
            .select("*")
            .eq("id", eventData.location_id)
            .single()

          setLocation(locationData)
        }

        // Cargar amenidades
        await fetchAmenities()

        // Cargar rifas ganadas
        await fetchRaffleWins()
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Configurar suscripción en tiempo real para cambios en el estado de check-in
    const attendeeSubscription = supabase
      .channel("attendee-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "attendants",
          filter: `id=eq.${attendeeId}`,
        },
        (payload) => {
          // Si el asistente ha hecho check-in, actualizar las amenidades
          if (payload.new && payload.new.checked_in === true) {
            fetchAmenities()
            // Actualizar el estado del asistente
            setAttendee((prev) => ({ ...prev, ...payload.new }))
          }
        },
      )
      .subscribe()

    // Suscripción para cambios en amenities_attendees
    const amenitiesSubscription = supabase
      .channel(`amenities-changes-${attendeeId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "amenities_attendees",
          filter: `attendee_id=eq.${attendeeId}`,
        },
        (payload) => {
          console.log("Cambio detectado en amenidades:", payload)
          // Cuando hay cambios en las amenidades del asistente, recargarlas
          fetchAmenities()
        },
      )
      .subscribe()

    // Añadir también una suscripción para cambios en la tabla amenities
    // ya que las cantidades pueden cambiar allí también
    const amenitiesTableSubscription = supabase
      .channel(`amenities-table-changes-${attendeeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "amenities",
          // No podemos filtrar directamente por attendee_id aquí porque no es una columna de esta tabla
        },
        () => {
          // Cuando hay cambios en la tabla amenities, verificar si afectan a este asistente
          fetchAmenities()
        },
      )
      .subscribe()

    // Suscripción para notificaciones de ganadores de rifas
    const raffleWinnerSubscription = supabase
      .channel(`raffle-winner-changes-${attendeeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "raffle_winner",
          filter: `attendee_id=eq.${attendeeId}`,
        },
        async (payload) => {
          console.log("¡El asistente ha ganado una rifa!", payload)

          // Obtener detalles de la rifa ganada
          const { data: raffleData } = await supabase
            .from("raffles")
            .select("name, description")
            .eq("id", payload.new.raffle_id)
            .single()

          if (raffleData) {
            // Guardar la nueva victoria para mostrar notificación
            setNewWin({
              id: payload.new.id,
              raffleName: raffleData.name,
              raffleDescription: raffleData.description,
              created_at: payload.new.created_at,
            })

            // Mostrar notificación
            toast({
              title: "¡Felicidades! 🎉",
              description: `Has ganado la rifa: ${raffleData.name}`,
              variant: "success",
              duration: 10000,
              action: <ToastAction altText="Ver detalles">Ver detalles</ToastAction>,
            })

            // Actualizar la lista de rifas ganadas
            fetchRaffleWins()
          }
        },
      )
      .subscribe()

    return () => {
      // Limpiar suscripciones al desmontar
      attendeeSubscription.unsubscribe()
      amenitiesSubscription.unsubscribe()
      amenitiesTableSubscription.unsubscribe()
      raffleWinnerSubscription.unsubscribe()
    }
  }, [eventId, attendeeId])

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "EEEE, d MMMM yyyy", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: es })
    } catch (error) {
      return ""
    }
  }

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  // Generate QR code data
  const getQrCodeData = () => {
    if (!attendee || !eventId) return ""

    const data = {
      attendeeId: attendee.id,
      eventId: eventId,
      name: attendee.name,
      code: attendee.code,
    }

    return JSON.stringify(data)
  }

  // Add to calendar function
  const addToCalendar = () => {
    if (!event) return

    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date || startDate)

    // Format dates for Google Calendar
    const formatForCalendar = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "")
    }

    const start = formatForCalendar(startDate)
    const end = formatForCalendar(endDate)

    // Create location string
    let locationStr = ""
    if (location) {
      locationStr = [location.name, location.address, location.city, location.state, location.postal_code]
        .filter(Boolean)
        .join(", ")
    }

    // Create Google Calendar URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(locationStr)}`

    window.open(url, "_blank")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to={`/events/${eventId}`} className="text-red-700 underline mt-2 inline-block">
            Volver al evento
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to={`/events/${eventId}`} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al evento
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Attendee Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del asistente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Nombre</h3>
                <p className="text-lg">
                  {attendee.name} {attendee.second_name || ""}
                </p>
              </div>

              {attendee.email && (
                <div>
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </h3>
                  <p>{attendee.email}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-700 flex items-center">
                  <Ticket className="h-4 w-4 mr-1" />
                  Código de asistente
                </h3>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{attendee.code}</code>
              </div>

              {attendee.tickets && (
                <div>
                  <h3 className="font-medium text-gray-700">Tipo de entrada</h3>
                  <Badge variant="outline" className="mt-1">
                    {attendee.tickets.name}
                  </Badge>
                </div>
              )}

              {attendee.checked_in && (
                <div>
                  <Badge className="bg-green-500">Check-in completado</Badge>
                  {attendee.checked_in_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Registrado el {format(new Date(attendee.checked_in_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del evento</CardTitle>
              <CardDescription>{event.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Fecha</h3>
                  <p>{formatDate(event.start_date)}</p>
                  {event.end_date && event.end_date !== event.start_date && <p>hasta {formatDate(event.end_date)}</p>}
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Hora</h3>
                  <p>{formatTime(event.start_date)}</p>
                </div>
              </div>

              {location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Ubicación</h3>
                    <p>{location.name}</p>
                    <p className="text-gray-600 text-sm">
                      {location.address}, {location.city}, {location.state}
                    </p>
                    {location.map_url && (
                      <a
                        href={location.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-1"
                      >
                        Ver en mapa
                      </a>
                    )}
                  </div>
                </div>
              )}

              {event.description && (
                <div>
                  <h3 className="font-medium mb-1">Descripción</h3>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={addToCalendar}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Añadir a calendario
              </Button>
            </CardFooter>
          </Card>

          {/* Raffle Wins Card */}
          {raffleWins.length > 0 && (
            <Card className={newWin ? "border-2 border-yellow-400 animate-pulse" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Rifas ganadas
                </CardTitle>
                <CardDescription>Premios obtenidos en el evento</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {raffleWins.map((win) => (
                    <li
                      key={win.id}
                      className={`p-3 rounded-md border ${win.id === newWin?.id ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex items-start gap-3">
                        <Gift
                          className={`h-5 w-5 mt-0.5 ${win.id === newWin?.id ? "text-yellow-500" : "text-gray-500"}`}
                        />
                        <div>
                          <p className="font-medium">{win.raffles.name}</p>
                          {win.raffles.description && (
                            <p className="text-sm text-gray-600">{win.raffles.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Ganado el {formatDateTime(win.created_at)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Amenities Card */}
          {amenities.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Amenidades incluidas</CardTitle>
                <CardDescription>Beneficios incluidos con tu entrada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {amenities.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="font-medium text-lg">{section.name}</h3>
                      {section.description && <p className="text-gray-600 text-sm">{section.description}</p>}
                      <ul className="space-y-2 mt-2">
                        {section.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.quantity > 0 ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {item.quantity} disponible{item.quantity !== 1 ? "s" : ""}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100">
                                  Agotado
                                </Badge>
                              )}
                              {!item.is_active && (
                                <Badge variant="outline" className="bg-gray-100">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : attendee.checked_in ? (
            <Card>
              <CardHeader>
                <CardTitle>Amenidades incluidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">No hay amenidades asignadas para este asistente.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Amenidades incluidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">
                  Las amenidades se mostrarán después de realizar el check-in en el evento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>Presenta este código al ingresar al evento</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={getQrCodeData()} size={200} level="H" />
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">
                Este código será escaneado al ingresar al evento para confirmar tu asistencia
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AttendeeDetail

