"use client"

import * as React from "react"
import { Download, Eye, MoreVertical, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDetailsDialog } from "../components/orders/order-details-dialog"

// This is sample data
const orders = [
  {
    id: "O-BLNEVRG",
    client: {
      name: "Benjamin Galán",
      email: "bgaland0108@gmail.com",
    },
    attendees: 1,
    amount: "$0.00",
    created: "3 days ago",
    status: "COMPLETED",
    items: [
      {
        name: "Entrada gratis",
        quantity: 1,
        price: "$0.00",
      },
    ],
    total: "Gratis",
  },
]

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = React.useState<(typeof orders)[0] | null>(null)

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Busque por nombre, correo electrónico o número de pedido..." className="pl-8" />
        </div>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lo más nuevo primero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Lo más nuevo primero</SelectItem>
            <SelectItem value="oldest">Lo más antiguo primero</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Order #</div>
          <div className="col-span-3">Cliente</div>
          <div className="col-span-2">Asistentes</div>
          <div className="col-span-2">Cantidad</div>
          <div className="col-span-2">Creado</div>
          <div className="col-span-1">Estado</div>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-12 gap-4 border-b p-4">
            <div className="col-span-2 flex items-center">
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                {order.id}
              </span>
            </div>
            <div className="col-span-3 flex flex-col">
              <span className="font-medium">{order.client.name}</span>
              <span className="text-sm text-muted-foreground">{order.client.email}</span>
            </div>
            <div className="col-span-2 flex items-center">{order.attendees}</div>
            <div className="col-span-2 flex items-center font-medium text-emerald-600">{order.amount}</div>
            <div className="col-span-2 flex items-center">{order.created}</div>
            <div className="col-span-1 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {order.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver pedido
                  </DropdownMenuItem>
                  <DropdownMenuItem>Mensaje del comprador</DropdownMenuItem>
                  <DropdownMenuItem>Reenviar correo electrónico del pedido</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Cancelar orden</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  )
}

