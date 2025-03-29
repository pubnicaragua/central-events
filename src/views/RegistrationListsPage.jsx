"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateRegistrationListDialog } from "../components/registration-lists/create-registration-list-dialog"
import { getRegistrationLists } from "@actions/registration-lists"
import { EmptyState } from "../components/registration-lists/empty-state"

export default function RegistrationListsPage() {
  const [open, setOpen] = useState(false)
  const [registrationLists, setRegistrationLists] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRegistrationLists = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getRegistrationLists()
      setRegistrationLists(data)
    } catch (error) {
      console.error("Error al obtener las listas de registro:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistrationLists()
  }, [fetchRegistrationLists])

  const handleListCreated = () => {
    fetchRegistrationLists()
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listas de registro</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar listas de registro..." className="pl-8" />
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
          Crear lista de registro
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando listas...</div>
      ) : registrationLists.length > 0 ? (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">NOMBRE</div>
            <div className="col-span-3">TICKETS ASOCIADOS</div>
            <div className="col-span-2">FECHA DE ACTIVACIÓN</div>
            <div className="col-span-2">FECHA DE VENCIMIENTO</div>
            <div className="col-span-1"></div>
          </div>
          {registrationLists.map((list) => (
            <div key={list.id} className="grid grid-cols-12 gap-4 border-t p-4">
              <div className="col-span-4">{list.name}</div>
              <div className="col-span-3">{list.tickets?.length || 0} tickets</div>
              <div className="col-span-2">{new Date(list.activation_date).toLocaleDateString()}</div>
              <div className="col-span-2">{new Date(list.due_date).toLocaleDateString()}</div>
              <div className="col-span-1 flex justify-end">{/* TODO: Implementar acciones */}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      <CreateRegistrationListDialog open={open} onOpenChange={setOpen} onListCreated={handleListCreated} />
    </div>
  )
}

