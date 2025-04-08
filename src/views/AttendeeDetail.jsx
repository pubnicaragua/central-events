"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import { toast } from "react-hot-toast"
import { addToCalendar } from "../utils/helpers"
import AttendeeInfoCard from "../components/guess/attendee-info-card"
import EventInfoCard from "../components/guess/event-info-card"
import RaffleWinsCard from "../components/guess/raffle-wins-card"
import AmenitiesCard from "../components/guess/amenities-card"
import QRCodeCard from "../components/guess/qr-code-card"
import DressCodeCard from "../components/guess/dress-code-card"
import EventHeader from "../components/guess/event-header"
// Importación para obtener el diseño
import getAttendeePageDesign from "../components/lib/actions/homepage-design"

const AttendeeDetail = () => {
  const { eventId, attendeeId } = useParams()
  const navigate = useNavigate()
  const [attendee, setAttendee] = useState(null)
  const [event, setEvent] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [raffleWins, setRaffleWins] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState(null)
  const [dressCodeData, setDressCodeData] = useState(null)
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [homeConfig, setHomeConfig] = useState(null)

  // Modificar el useEffect para cargar el diseño
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener información del asistente
        const { data: attendeeData, error: attendeeError } = await supabase
          .from("attendants")
          .select("*")
          .eq("id", attendeeId)
          .single()

        if (attendeeError) throw attendeeError
        setAttendee(attendeeData)

        // Obtener información del evento
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) throw eventError
        setEvent(eventData)

        // Obtener configuración de la página de inicio para el evento
        const homeConfigData = await getAttendeePageDesign(eventId)
        setHomeConfig(homeConfigData || null)

        // Obtener conteo de asistentes para el evento
        const { count, error: countError } = await supabase
          .from("attendants")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId)

        if (!countError) {
          setAttendeesCount(count || 0)
        }

        // Obtener configuraciones del evento (para ubicación y código de vestimenta)
        const { data: eventConfigData, error: eventConfigError } = await supabase
          .from("event_configs")
          .select("location_id, dress_code_id")
          .eq("event_id", eventId)
          .single()

        if (eventConfigError && eventConfigError.code !== "PGRST116") {
          throw eventConfigError
        }

        // Obtener información de ubicación si existe
        if (eventConfigData?.location_id) {
          const { data: locationData, error: locationError } = await supabase
            .from("location")
            .select("*")
            .eq("id", eventConfigData.location_id)
            .single()

          if (locationError && locationError.code !== "PGRST116") {
            throw locationError
          }

          setLocationData(locationData || null)
        }

        // Obtener información del código de vestimenta si existe
        if (eventConfigData?.dress_code_id) {
          const { data: dressCodeData, error: dressCodeError } = await supabase
            .from("dress_code")
            .select("*")
            .eq("id", eventConfigData.dress_code_id)
            .single()

          if (dressCodeError && dressCodeError.code !== "PGRST116") {
            throw dressCodeError
          }

          setDressCodeData(dressCodeData || null)
        }

        // Obtener amenidades asignadas al asistente
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
              amenities_sections (
                id,
                name
              )
            )
          `)
          .eq("attendee_id", attendeeId)

        if (amenitiesError) throw amenitiesError

        const groupedAmenities = {}

        amenitiesData.forEach((item) => {
          const section = item.amenities?.amenities_sections
          const sectionId = section?.id || "default"

          if (!groupedAmenities[sectionId]) {
            groupedAmenities[sectionId] = {
              id: sectionId,
              name: section?.name || "Sin sección",
              description: section?.description || "",
              items: [],
            }
          }

          groupedAmenities[sectionId].items.push({
            id: item.amenities.id,
            name: item.amenities.name,
            description: item.amenities.description,
            quantity: item.quantity,
            total: item.total,
            is_active: item.is_active,
          })
        })

        setAmenities(Object.values(groupedAmenities))

        // Obtener rifas ganadas
        const { data: raffleWinsData, error: raffleWinsError } = await supabase
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

        if (raffleWinsError) throw raffleWinsError
        setRaffleWins(raffleWinsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos del asistente")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Suscripción a cambios en el asistente (check-in)
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
          // Actualizar el estado del asistente
          setAttendee((prev) => ({ ...prev, ...payload.new }))

          // Si el asistente ha hecho check-in, actualizar las amenidades
          if (payload.new && payload.new.checked_in === true) {
            fetchData()
          }
        },
      )
      .subscribe()

    // Suscripción a cambios en todos los asistentes con check-in
    const allAttendeesSubscription = supabase
      .channel("all-attendees-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendants",
          filter: `checked_in=eq.${true}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    // Suscripciones en tiempo real para amenidades
    const amenitiesSubscription = supabase
      .channel("amenities-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "amenities_attendees",
          filter: `attendee_id=eq.${attendeeId}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    // Suscripción para rifas ganadas
    const raffleWinsSubscription = supabase
      .channel("raffle-wins-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "raffle_winner",
          filter: `attendee_id=eq.${attendeeId}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(attendeeSubscription)
      supabase.removeChannel(allAttendeesSubscription)
      supabase.removeChannel(amenitiesSubscription)
      supabase.removeChannel(raffleWinsSubscription)
    }
  }, [eventId, attendeeId])

  const handleAddToCalendar = () => {
    if (event) {
      addToCalendar(event)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!attendee || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>No se encontró la información del asistente o del evento.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // Aplicar el estilo de fondo de la página si existe en la configuración
  const pageStyle = homeConfig
    ? {
      backgroundColor: homeConfig.pageBg || "#f5f5f5",
    }
    : {}

  return (
    <div className="px-4 py-8" style={pageStyle}>
      <div className="container mx-auto">
        {/* Botón de volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center hover:text-gray-900"
            style={{ color: homeConfig?.secondaryText || "#666666" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>

        {/* Header con imagen del evento */}
        <EventHeader event={event} attendeesCount={attendeesCount} homeConfig={homeConfig} />

        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Asistente */}
          <AttendeeInfoCard attendee={attendee} themeConfig={homeConfig} />

          {/* Información del Evento */}
          <EventInfoCard
            event={event}
            location={locationData}
            handleAddToCalendar={handleAddToCalendar}
            themeConfig={homeConfig}
          />

          {/* Amenidades */}
          <AmenitiesCard amenities={amenities} themeConfig={homeConfig} />

          {/* Rifas Ganadas */}
          <RaffleWinsCard raffleWins={raffleWins} themeConfig={homeConfig} />

          {/* Código de Vestimenta */}
          {dressCodeData && <DressCodeCard dressCode={dressCodeData} themeConfig={homeConfig} />}

          {/* Código QR */}
          <QRCodeCard attendee={attendee} eventId={eventId} themeConfig={homeConfig} />
        </div>
      </div>
    </div>
  )
}

export default AttendeeDetail

