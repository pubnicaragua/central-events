"use client"

import * as React from "react"
import { Download, MoreVertical, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddAttendeeDialog } from "../components/attendees/attendee-details-dialog"

// This is sample data
const attendees = [
  {
    id: "A-VN3BXAB",
    name: "Benjamin Galán",
    email: "bgaland0108@gmail.com",
    orderId: "O-BLNEVRG",
    ticket: "Entrada gratis",
    status: "ACTIVE",
  },
]

export default function AttendeesPage() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Asistentes</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Busque por nombre del asistente, correo electrónico..." className="pl-8" />
        </div>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Más reciente Primero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más reciente Primero</SelectItem>
            <SelectItem value="oldest">Primera actualización</SelectItem>
            <SelectItem value="last">Última actualización</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Nombre</div>
          <div className="col-span-3">Correo electrónico</div>
          <div className="col-span-2">Orden</div>
          <div className="col-span-2">Boleto</div>
          <div className="col-span-1">Estado</div>
        </div>
        {attendees.map((attendee) => (
          <div key={attendee.id} className="grid grid-cols-12 gap-4 border-b p-4">
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <span className="text-sm font-medium">BG</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{attendee.name}</span>
                <span className="text-sm text-muted-foreground">{attendee.id}</span>
              </div>
            </div>
            <div className="col-span-3 flex items-center">{attendee.email}</div>
            <div className="col-span-2 flex items-center">
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                {attendee.orderId}
              </span>
            </div>
            <div className="col-span-2 flex items-center">{attendee.ticket}</div>
            <div className="col-span-1 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {attendee.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver asistente</DropdownMenuItem>
                  <DropdownMenuItem>Asistente del mensaje</DropdownMenuItem>
                  <DropdownMenuItem>Editar asistente</DropdownMenuItem>
                  <DropdownMenuItem>Reenviar correo electrónico del ticket</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Cancelar boleto</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <AddAttendeeDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

