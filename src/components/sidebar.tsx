import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  ShoppingCart,
  HelpCircle,
  Tag,
  MessageSquare,
  Users2,
  ClipboardList,
  Palette,
} from "lucide-react"

function Sidebar() {
  const location = useLocation()
  const eventId = location.pathname.split("/")[3] // Extraer el eventId de la URL

  return (
    <div className="hidden border-r bg-emerald-900 shadow-lg lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-[60px] items-center border-b border-emerald-800 px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-lg">PassK</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2 scrollbar-thin scrollbar-thumb-emerald-700">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              to={`/manage/event/${eventId}/getting-started`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                location.pathname === `/manage/event/${eventId}/getting-started`
                  ? "bg-emerald-950 text-white font-medium"
                  : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
              }`}
            >
              Empezando
            </Link>

            <div className="mt-6">
              <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">Administrar</h4>
              <div className="grid gap-1 mt-2">
                <Link
                  to={`/manage/event/${eventId}/dashboard`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/dashboard`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </Link>
                <Link
                  to={`/manage/event/${eventId}/settings`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/settings`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Ajustes
                </Link>
                <Link
                  to={`/manage/event/${eventId}/tickets`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/tickets`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  Entradas
                </Link>
                <Link
                  to={`/manage/event/${eventId}/attendees`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/attendees`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Asistentes
                </Link>
                <Link
                  to={`/manage/event/${eventId}/amenities`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/amenities`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Amenidades
                </Link>
                <Link
                  to={`/manage/event/${eventId}/check-in`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/check-in`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Check-in
                </Link>
                <Link
                  to={`/manage/event/${eventId}/orders`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/orders`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Pedidos
                </Link>
                <Link
                  to={`/manage/event/${eventId}/raffles`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/raffles`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Rifas
                </Link>
                <Link
                  to={`/manage/event/${eventId}/questions`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/questions`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Preguntas
                </Link>
                <Link
                  to={`/manage/event/${eventId}/promo-codes`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/promo-codes`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  Códigos promocionales
                </Link>
                <Link
                  to={`/manage/event/${eventId}/messages`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/messages`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Mensajes
                </Link>
                <Link
                  to={`/manage/event/${eventId}/capacity`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/capacity`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Users2 className="h-4 w-4" />
                  Capacidad
                </Link>
                <Link
                  to={`/manage/event/${eventId}/registration-lists`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/registration-lists`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Listas de registro
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="px-2 py-2 text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Herramientas
              </h4>
              <div className="grid gap-1 mt-2">
                <Link
                  to={`/manage/event/${eventId}/page-designer`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    location.pathname === `/manage/event/${eventId}/page-designer`
                      ? "bg-emerald-950 text-white font-medium"
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Diseñador de página de inicio
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

