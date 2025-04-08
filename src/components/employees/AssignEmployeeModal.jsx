"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import supabase from "../../api/supabase"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function AssignEmployeeModal({ isOpen, onClose, onAssign, assignedEmployees, eventId }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("")

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true)

                // 1. Obtener los user_id de la tabla user_roles donde role_id es 4 (empleado)
                const { data: userRoles, error: userRolesError } = await supabase
                    .from("user_roles")
                    .select("user_id")
                    .eq("role_id", 4)

                if (userRolesError) throw userRolesError

                const employeeAuthIds = userRoles.map((userRole) => userRole.user_id)

                // 2. Obtener los perfiles de usuario de la tabla user_profile usando los auth_id
                const { data: employeeProfiles, error: employeeProfilesError } = await supabase
                    .from("user_profile")
                    .select("auth_id, name, email, avatar_url")
                    .in("auth_id", employeeAuthIds)

                if (employeeProfilesError) throw employeeProfilesError

                // Filter out already assigned employees
                const availableEmployees = employeeProfiles.filter((profile) => {
                    return !assignedEmployees.some((assigned) => assigned.auth_id === profile.auth_id)
                })

                setEmployees(availableEmployees)
            } catch (error) {
                console.error("Error fetching employees:", error)
                toast.error("Error al cargar los empleados")
            } finally {
                setLoading(false)
            }
        }

        if (isOpen) {
            fetchEmployees()
        }
    }, [isOpen, assignedEmployees])

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        if (selectedEmployeeId) {
            onAssign(selectedEmployeeId)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Asignar empleado al evento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                            Buscar empleado
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                                placeholder="Buscar por nombre o email"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300">
                        {loading ? (
                            <div className="p-4 text-center text-sm text-gray-500">Cargando empleados...</div>
                        ) : filteredEmployees.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <label key={employee.auth_id} className="flex cursor-pointer items-center p-3 hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="employee"
                                            value={employee.auth_id}
                                            checked={selectedEmployeeId === employee.auth_id}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                            className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                            <p className="text-sm text-gray-500">{employee.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">No se encontraron empleados disponibles</div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!selectedEmployeeId}>
                            Asignar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
