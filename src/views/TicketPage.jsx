"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTicketDialog } from "../components/tickets/create-ticket-dialog"

export default function TicketsPage() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entradas</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre del billete..." className="pl-8" />
        </div>
        <Select defaultValue="default">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Orden de la página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Por defecto</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="price-asc">Precio (Menor-Mayor)</SelectItem>
            <SelectItem value="price-desc">Precio (Mayor-Menor)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Ticket
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">TÍTULO</div>
          <div className="col-span-2">ESTADO</div>
          <div className="col-span-2">MG+OJS</div>
          <div className="col-span-2">8KAH54</div>
          <div className="col-span-2"></div>
        </div>
        <div className="grid grid-cols-12 gap-4 p-4">
          <div className="col-span-4">Entrada VIP</div>
          <div className="col-span-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              EN VENTA
            </span>
          </div>
          <div className="col-span-2 font-medium text-emerald-600">$10.00</div>
          <div className="col-span-2">0</div>
          <div className="col-span-2"></div>
        </div>
        <div className="grid grid-cols-12 gap-4 border-t p-4">
          <div className="col-span-4">Entrada gratis</div>
          <div className="col-span-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              EN VENTA
            </span>
          </div>
          <div className="col-span-2 font-medium text-emerald-600">Gratis</div>
          <div className="col-span-2">1</div>
          <div className="col-span-2"></div>
        </div>
      </div>

      <CreateTicketDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

