import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom"
import { Ticket, Settings, Layout, Radio, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GettingStarted() {
  const { eventId } = useParams();
  const location = useLocation();
  const eventName = location.state?.eventName || "Evento sin nombre";
  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <Link to="/admin/events">Eventos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/manage/event/${eventId}/getting-started`}>{eventName}</Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">¡Felicitaciones por crear un evento!</h1>
          <p className="text-gray-600">Antes de que su evento pueda comenzar, hay algunas cosas que debe hacer.</p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-2.5">
              <Ticket className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold">Agregar entradas</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Crea entradas para tu evento, establece precios y gestiona la cantidad disponible.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => navigate(`/manage/event/${eventId}/tickets`, { state: { openModal: true } })}
          >
            Agregar entradas
          </Button>

        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-2.5">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Configura tu evento</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Agregue detalles del evento y administre la configuración del evento.
          </p>
          <Button className="mt-4" variant="secondary"
            onClick={() => navigate(`/manage/event/${eventId}/settings`, { state: { eventId, eventName } })}>
            Configura tu evento
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-2.5">
              <Layout className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Personaliza la página de tu evento</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Personalice la página de su evento para que coincida con su marca y estilo.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate(`/manage/event/${eventId}/page-designer`)} >
            Personaliza la página de tu evento
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-2.5">
              <Radio className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Configura tu evento en vivo</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Una vez que esté listo, configure su evento en vivo y comience a vender entradas.
          </p>
          <Button className="mt-4" variant="secondary">
            Configura tu evento en vivo
          </Button>
        </div>
      </div>
    </div>
  )
}

