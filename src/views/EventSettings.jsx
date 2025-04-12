"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import BasicDetails from "../components/event-settings/BasicDetails"
import PaymentSettings from "../components/event-settings/PaymentSettings"
import NotificationSettings from "../components/event-settings/NotificationSettings"
import OtherSettings from "../components/event-settings/OtherSettings"
import LocationSettings from "../components/event-settings/LocationSettings"
import SeoSettings from "../components/event-settings/SeoSettings"
import DressCode from "../components/event-settings/DressCode"
import DangerZone from "../components/event-settings/DangerZone"
import PrintError from "../utils/helpers"
import { ArrowLeft } from "lucide-react"
import useAuth from "../hooks/useAuth"

function EventSettings() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [eventConfig, setEventConfig] = useState(null)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true)

        //Obtener datos del evento
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) {
          PrintError("events", "fetching", error)
        }

        const { data: configData, error: configError } = await supabase
          .from("event_configs")
          .select(`
                        *,
                        location:location_id(*),
                        pay_config:pay_config_id(*),
                        seo_config:seo_config_id(*),
                        notf_config:notf_config_id(*),
                        other_config:other_config_id(*)
                        dress_code:dress_code_id(*)
                      `)
          .eq("event_id", eventId)
          .single()

        if (configError) {
          PrintError("event_configs", "fetching", error)
        }

        setEvent(eventData)
        setEventConfig(configData || { event_id: Number.parseInt(eventId) })
      } catch (error) {
        console.error("Error fetching event data:", error)
        setError("Error al cargar los datos del evento")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId, error])

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!event) return <div className="p-8 text-center">Evento no encontrado</div>

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración del evento {event.name}</h1>

        <p
          className="font-medium text-gray-600 hover:cursor-pointer flex items-center gap-1"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          Volver a Eventos
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Ajustes</h2>

      <div className="space-y-6">
        <BasicDetails event={event} eventId={eventId} supabase={supabase} />
        <LocationSettings
          eventConfig={eventConfig}
          eventId={eventId}
          supabase={supabase}
          setEventConfig={setEventConfig}
        />
        <DressCode eventConfig={eventConfig} eventId={eventId} supabase={supabase} setEventConfig={setEventConfig} />
        <PaymentSettings
          eventConfig={eventConfig}
          eventId={eventId}
          supabase={supabase}
          setEventConfig={setEventConfig}
        />
        <SeoSettings eventConfig={eventConfig} eventId={eventId} supabase={supabase} setEventConfig={setEventConfig} />
        <NotificationSettings
          eventConfig={eventConfig}
          eventId={eventId}
          supabase={supabase}
          setEventConfig={setEventConfig}
        />
        <OtherSettings
          eventConfig={eventConfig}
          eventId={eventId}
          supabase={supabase}
          setEventConfig={setEventConfig}
        />

        {isAdmin && <DangerZone event={event} eventId={eventId} />}

      </div>
    </div>
  )
}

export default EventSettings
