"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Users, ArrowLeft, Save, Search, Loader, CheckCircle, AlertCircle } from "lucide-react"
import supabase from "../api/supabase"
import { getEvent } from "../components/lib/actions/events"

function AssignEmployees() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [employees, setEmployees] = useState([])
    const [selectedEmployees, setSelectedEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [event, setEvent] = useState(null)

    useEffect(() => {
        if (eventId) {
            fetchEmployees()
            fetchEventDetails()
        }
    }, [eventId])

    const fetchEventDetails = async () => {
        try {
            const eventData = await getEvent(eventId)
            setEvent(eventData)
        } catch (err) {
            console.error("Error al obtener detalles del evento:", err)
            setError("No se pudo cargar la información del evento")
        }
    }

    async function fetchEmployees() {
        setLoading(true)
        setError(null)
        try {
            // Primero, obtener el ID del rol de empleado (4)
            const employeeRoleId = 4

            // Obtener usuarios con rol de empleado
            const { data: userRolesData, error: userRolesError } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role_id", employeeRoleId)

            if (userRolesError) throw userRolesError

            if (userRolesData && userRolesData.length > 0) {
                // Extraer los IDs de usuario
                const userIds = userRolesData.map((item) => item.user_id)

                // Obtener los perfiles de usuario
                const { data: usersData, error: usersError } = await supabase
                    .from("user_profile")
                    .select("*")
                    .in("auth_id", userIds)

                if (usersError) throw usersError

                // Verificar cuáles ya están asignados a este evento
                const employeesWithAssignment = usersData.map((user) => ({
                    ...user,
                    isAssigned: user.event_id === Number(eventId),
                }))

                // Preseleccionar los empleados ya asignados
                const preselected = employeesWithAssignment.filter((emp) => emp.isAssigned).map((emp) => emp.auth_id)

                setSelectedEmployees(preselected)
                setEmployees(employeesWithAssignment)
            } else {
                setEmployees([])
            }
        } catch (err) {
            console.error("Error al obtener empleados:", err)
            setError("No se pudieron cargar los empleados. Por favor, intenta de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAll = () => {
        if (selectedEmployees.length === employees.length) {
            // Si todos están seleccionados, deseleccionar todos
            setSelectedEmployees([])
        } else {
            // Seleccionar todos
            setSelectedEmployees(employees.map((emp) => emp.auth_id))
        }
    }

    const handleCheckboxChange = (authId) => {
        setSelectedEmployees((prev) => {
            if (prev.includes(authId)) {
                return prev.filter((id) => id !== authId)
            } else {
                return [...prev, authId]
            }
        })
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            // 1. Primero, eliminar la asignación actual para todos los empleados de este evento
            const { error: clearError } = await supabase
                .from("user_profile")
                .update({ event_id: null })
                .eq("event_id", eventId)

            if (clearError) throw clearError

            // 2. Asignar el evento a los empleados seleccionados
            if (selectedEmployees.length > 0) {
                const { error: assignError } = await supabase
                    .from("user_profile")
                    .update({ event_id: eventId })
                    .in("auth_id", selectedEmployees)

                if (assignError) throw assignError
            }

            setSuccess(true)
            // Recargar los datos para mostrar los cambios
            fetchEmployees()
        } catch (err) {
            console.error("Error al asignar empleados:", err)
            setError("Ocurrió un error al asignar empleados al evento. Por favor, intenta de nuevo.")
        } finally {
            setSubmitting(false)
        }
    }

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.second_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleRetry = () => {
        fetchEmployees()
    }

    return (
        <div className="min-h-screen bg-emerald-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/admin/events`)}
                                className="mr-4 p-2 rounded-full hover:bg-emerald-100 transition-colors"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="w-5 h-5 text-emerald-700" />
                            </button>
                            <h2 className="text-2xl font-bold text-emerald-900 flex items-center">
                                <Users className="w-7 h-7 mr-3 text-emerald-700" />
                                Asignar Empleados a Evento
                            </h2>
                        </div>
                        <button
                            className="bg-emerald-800 text-white px-5 py-2.5 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Guardando...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Save className="h-5 w-5 mr-2" />
                                    Guardar Asignaciones
                                </span>
                            )}
                        </button>
                    </div>

                    {event && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <h3 className="font-semibold text-emerald-800 mb-1">Evento: {event.name}</h3>
                            <p className="text-sm text-emerald-700">
                                Fecha: {new Date(event.start_date).toLocaleDateString()} -{" "}
                                {new Date(event.end_date).toLocaleDateString()}
                            </p>
                            {event.description && <p className="text-sm text-emerald-600 mt-1">{event.description}</p>}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                <p>{error}</p>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center shadow-sm">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            <p>Los empleados han sido asignados correctamente al evento.</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-emerald-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar empleado..."
                                    className="pl-10 px-4 py-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64 bg-white shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-emerald-200 rounded-lg shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-emerald-200">
                                <thead className="bg-emerald-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                                                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                                                    onChange={handleSelectAll}
                                                    disabled={loading}
                                                />
                                                <span className="ml-2">Seleccionar Todos</span>
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                                        >
                                            Apellido
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider"
                                        >
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-emerald-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <Loader className="h-8 w-8 animate-spin text-emerald-700 mx-auto mb-4" />
                                                <p className="text-emerald-800">Cargando empleados...</p>
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <Users className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                                                <p className="text-emerald-700 mb-2">No se encontraron empleados</p>
                                                <p className="text-sm text-emerald-500">
                                                    {searchTerm ? "Intenta con otra búsqueda" : "No hay empleados disponibles para asignar"}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.auth_id} className="hover:bg-emerald-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                                                        checked={selectedEmployees.includes(employee.auth_id)}
                                                        onChange={() => handleCheckboxChange(employee.auth_id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name || "—"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{employee.second_name || "—"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{employee.email || "—"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.isAssigned ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Asignado
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            No asignado
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            className="bg-emerald-800 text-white px-5 py-2.5 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Guardando...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Save className="h-5 w-5 mr-2" />
                                    Guardar Asignaciones
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssignEmployees
