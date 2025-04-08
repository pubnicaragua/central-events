import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function AccessDenied() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-emerald-50">
            <div className="text-center p-8 max-w-md">
                <div className="flex justify-center mb-6">
                    <ShieldAlert className="h-24 w-24 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
                <p className="text-gray-600 mb-8">
                    No tienes permisos para acceder a esta sección. Por favor, contacta con el administrador si crees que deberías
                    tener acceso.
                </p>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                    <Link
                        to="/admin/events"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}

