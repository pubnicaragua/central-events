import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Settings, Ticket, Users, ShoppingCart, HelpCircle, Tag, MessageSquare, Users2, ClipboardList, Palette, Code2 } from 'lucide-react'

export function Sidebar() {
    const location = useLocation();
    const eventId = location.pathname.split("/")[3]; // Extraer el eventId de la URL

    return (
        <div className="hidden border-r bg-gray-700/95 lg:block">
            <div className="flex h-full max-h-screen flex-col">
                <div className="flex h-[60px] items-center border-b px-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-white">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <span>Central Events</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <Link
                            to={`/manage/event/${eventId}/getting-started`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname.includes("getting-started") ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white"}`}
                        >
                            Empezando
                        </Link>

                        <div className="mt-6">
                            <h4 className="px-2 py-2 text-xs font-semibold text-gray-400">Administrar</h4>
                            <div className="grid gap-1">
                                <Link to={`/manage/event/${eventId}/dashboard`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/dashboard`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Panel
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/settings`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/settings`}
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    Ajustes
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/tickets`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/tickets`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Ticket className="h-4 w-4" />
                                    Entradas
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/attendees`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/attendees`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Users className="h-4 w-4" />
                                    Asistentes
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/orders`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}orders`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Pedidos
                                </Link>
                                <Link
                                    to="/manage/event/questions"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/manage/event/questions'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <HelpCircle className="h-4 w-4" />
                                    Preguntas
                                </Link>
                                <Link
                                    to="/manage/event/promo-codes"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/manage/event/promo-codes'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Tag className="h-4 w-4" />
                                    Códigos promocionales
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/messages`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/messages`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Mensajes
                                </Link>
                                <Link
                                    to={`/manage/event/${eventId}/capacity`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === `/manage/event/${eventId}/capacity`
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Users2 className="h-4 w-4" />
                                    Capacidad
                                </Link>
                                <Link
                                    to="/manage/event/registration-lists"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/manage/event/registration-lists'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    Listas de registro
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="px-2 py-2 text-xs font-semibold text-gray-400">Herramientas</h4>
                            <div className="grid gap-1">
                                <Link
                                    to="/manage/event/page-designer"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/manage/event/page-designer'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Palette className="h-4 w-4" />
                                    Diseñador de página de inicio
                                </Link>
                                <Link
                                    to="/manage/event/widget"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/manage/event/widget'
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <Code2 className="h-4 w-4" />
                                    Insertar widget
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    )
}
