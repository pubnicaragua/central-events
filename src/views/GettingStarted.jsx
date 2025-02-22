import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom"
import { Ticket, Settings, Layout, Radio, CreditCard, Mail, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GettingStarted() {
  const { eventId } = useParams();
  const location = useLocation();
  const eventName = location.state?.eventName || "Evento sin nombre";
  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <Link to="/events">Eventos</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/manage/event/${eventId}/getting-started`}>{eventName}</Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">¡Felicitaciones por crear un evento!</h1>
          <p className="text-gray-600">Antes de que su evento pueda comenzar, hay algunas cosas que debe hacer.</p>
        </div>
        <img src="/balloons.png" alt="Celebración" className="h-24 w-24" />
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
          <Button className="mt-4" variant="secondary">
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

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-2.5">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold">Conéctate con Stripe</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">Conecte su cuenta Stripe para comenzar a recibir pagos.</p>
          <Button className="mt-4" variant="secondary">
            Conéctate con Stripe
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-emerald-100 p-2.5">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Confirma tu dirección de correo electrónico</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Debes confirmar tu dirección de correo electrónico antes de que tu evento pueda comenzar.
          </p>
          <div className="mt-4 flex h-8 items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-500">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <span className="ml-2 text-sm text-green-600">Verificado</span>
          </div>
        </div>
      </div>
    </div>
  )
}

