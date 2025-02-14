import { useParams } from "react-router-dom"
import EventSettings from "../components/events/event-settings-layout"

export default function Page() {
  const { eventId } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Configuración del evento #{eventId}</h1>
      <EventSettings eventId={eventId} />
    </div>
  )
}

