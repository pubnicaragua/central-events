import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Settings, Ticket, Users, ShoppingCart, HelpCircle, Tag, MessageSquare, Users2, ClipboardList, Palette, Code2 } from 'lucide-react'

export function Sidebar() {
    const location = useLocation()

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
                            to="/getting-started"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${location.pathname === '/getting-started'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" fill="currentColor" />
                                </svg>
                                Empezando
                            </span>
                        </Link>

                        <div className="mt-6">
                            <h4 className="px-2 py-2 text-xs font-semibold text-gray-400">Administrar</h4>
                            <div className="grid gap-1">
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Panel
                                </Link>
                                <Link
                                    to="/manage/event/settings"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Settings className="h-4 w-4" />
                                    Ajustes
                                </Link>
                                <Link
                                    to="/tickets"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Ticket className="h-4 w-4" />
                                    Entradas
                                </Link>
                                <Link
                                    to="/attendees"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Users className="h-4 w-4" />
                                    Asistentes
                                </Link>
                                <Link
                                    to="/orders"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Pedidos
                                </Link>
                                <Link
                                    to="/questions"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                    Preguntas
                                </Link>
                                <Link
                                    to="/promo-codes"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Tag className="h-4 w-4" />
                                    Códigos promocionales
                                </Link>
                                <Link
                                    to="/messages"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Mensajes
                                </Link>
                                <Link
                                    to="/capacity"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Users2 className="h-4 w-4" />
                                    Capacidad
                                </Link>
                                <Link
                                    to="/registration-lists"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
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
                                    to="/page-designer"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
                                >
                                    <Palette className="h-4 w-4" />
                                    Diseñador de página de inicio
                                </Link>
                                <Link
                                    to="/widget"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:text-white"
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
