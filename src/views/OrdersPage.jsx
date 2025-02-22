"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { Search, Mail, Eye, Ban, MoreVertical, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { OrderDetailsDialog } from "../components/orders/order-details-dialog"
import { MessageDialog } from "../components/orders/message-dialog"
import { useToast } from "@/components/ui/use-toast"
import supabase from "../api/supabase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const { eventId } = useParams()
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          attendants (
            id,
            name,
            email,
            ticket_id,
            tickets (
              title
            )
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los pedidos",
      })
    } finally {
      setIsLoading(false)
    }
  }, [eventId, toast])

  useEffect(() => {
    if (eventId) {
      fetchOrders()
    }
  }, [eventId, fetchOrders])

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleMessageBuyer = (order) => {
    setSelectedOrder(order)
    setMessageOpen(true)
  }

  const handleCancelOrder = async (order) => {
    try {
      // Actualizar estado del pedido
      const { error: orderError } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id)

      if (orderError) throw orderError

      // Actualizar estado de los asistentes
      const { error: attendeesError } = await supabase
        .from("attendants")
        .update({ status: "cancelled" })
        .eq("order_id", order.id)

      if (attendeesError) throw attendeesError

      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado exitosamente",
      })

      fetchOrders()
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar el pedido",
      })
    }
  }

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
            <SelectValue placeholder="Lo más nuevo prim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Lo más nuevo prim</SelectItem>
            <SelectItem value="oldest">Lo más antiguo prim</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Exportar</Button>
      </div>

      {isLoading ? (
        <div>Cargando pedidos...</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Order #</div>
            <div className="col-span-3">Cliente</div>
            <div className="col-span-2">Asistentes</div>
            <div className="col-span-1">Cantidad</div>
            <div className="col-span-2">Creado</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-1"></div>
          </div>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="grid grid-cols-12 gap-4 border-t p-4 items-center">
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {order.id}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="font-medium">{order.name}</div>
                  <div className="text-sm text-muted-foreground">{order.email}</div>
                </div>
                <div className="col-span-2">{order.attendants?.length || 0}</div>
                <div className="col-span-1">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    ${order.total || "0.00"}
                  </span>
                </div>
                <div className="col-span-2">
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${
                      order.status === "completed"
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : order.status === "cancelled"
                          ? "bg-red-50 text-red-700 ring-red-600/20"
                          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                    } ring-1 ring-inset`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver pedido
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMessageBuyer(order)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Mensaje del comprador
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        Reenviar correo electrónico del pedido
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleCancelOrder(order)}
                        className="text-red-600"
                        disabled={order.status === "cancelled"}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancelar pedido
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No hay pedidos para mostrar</div>
          )}
        </div>
      )}

      <OrderDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} order={selectedOrder} />

      <MessageDialog open={messageOpen} onOpenChange={setMessageOpen} order={selectedOrder} />
    </div>
  )
}

