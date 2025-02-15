"use client"
import { Eye, Mail, MessageSquare, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex justify-between">
          <DialogHeader>
            <DialogTitle>Detalles del pedido {order.id}</DialogTitle>
            <DialogDescription>Ver los detalles completos del pedido</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver pedido</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mensaje del comprador</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reenviar correo electrónico del pedido</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium">Resumen del pedido</h3>
            <div className="mt-4 space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between border-b pb-4">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>{item.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium">
                <span>Total parcial</span>
                <span>{order.total}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Asistentes</h3>
            <div className="mt-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">BG</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{order.client.name}</span>
                  <span className="text-sm text-muted-foreground">Entrada gratis</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-red-600">Zona peligrosa</h3>
            <div className="mt-4">
              <Button variant="destructive" className="w-full">
                <Trash className="mr-2 h-4 w-4" />
                Cancelar orden
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

