"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateCapacityDialog } from "../components/capacity/create-capacity-dialog"
import { getCapacityAssignments } from "@actions/capacity"
import { EmptyState } from "../components/capacity/empty-state"

export default function CapacityPage() {
  const [open, setOpen] = useState(false)
  const [capacityAssignments, setCapacityAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCapacityAssignments = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCapacityAssignments()
      setCapacityAssignments(data)
    } catch (error) {
      console.error("Error al obtener las asignaciones de capacidad:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCapacityAssignments()
  }, [fetchCapacityAssignments])

  const handleCapacityCreated = () => {
    fetchCapacityAssignments()
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Capacidad</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar asignaciones de capacidad..." className="pl-8" />
        </div>
        <Select defaultValue="default">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lo más nuevo primero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Lo más nuevo primero</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Crear Asignación de Capacidad
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando asignaciones...</div>
      ) : capacityAssignments.length > 0 ? (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">NOMBRE</div>
            <div className="col-span-2">ESTADO</div>
            <div className="col-span-2">CAPACIDAD</div>
            <div className="col-span-2">TICKETS</div>
            <div className="col-span-2"></div>
          </div>
          {capacityAssignments.map((assignment) => (
            <div key={assignment.id} className="grid grid-cols-12 gap-4 border-t p-4">
              <div className="col-span-4">{assignment.name}</div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    assignment.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}
                >
                  {assignment.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="col-span-2">{assignment.capacity || "Ilimitado"}</div>
              <div className="col-span-2">{assignment.tickets?.length || 0} tickets</div>
              <div className="col-span-2 flex justify-end">{/* TODO: Implementar acciones */}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      <CreateCapacityDialog open={open} onOpenChange={setOpen} onCapacityCreated={handleCapacityCreated} />
    </div>
  )
}

