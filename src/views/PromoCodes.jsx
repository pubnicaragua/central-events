"use client"

import * as React from "react"
import { Copy, MoreVertical, Percent, Plus, Search, Tag, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CreatePromoCodeForm } from "../components/promo-codes/create-promo-code-form"

const promoCodes = [
  {
    code: "200OFF",
    discount: "NINGUNO",
    usageCount: "0 / ∞",
    tickets: "2 ENTRADAS",
    expiration: "Nunca",
  },
]

export default function PromoCodesPage() {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Códigos promocionales</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre..." className="pl-8" />
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
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>

      {promoCodes.length > 0 ? (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Código</div>
            <div className="col-span-2">Descuento</div>
            <div className="col-span-2">Tiempos utilizados</div>
            <div className="col-span-2">Entradas</div>
            <div className="col-span-2">Vence</div>
            <div className="col-span-1"></div>
          </div>
          {promoCodes.map((code) => (
            <div key={code.code} className="grid grid-cols-12 gap-4 border-b p-4">
              <div className="col-span-3 flex items-center">
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                  {code.code}
                </span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">{code.discount}</div>
              <div className="col-span-2 flex items-center">{code.usageCount}</div>
              <div className="col-span-2 flex items-center">
                <span className="inline-flex items-center rounded-full bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20">
                  {code.tickets}
                </span>
              </div>
              <div className="col-span-2 flex items-center">{code.expiration}</div>
              <div className="col-span-1 flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Tag className="mr-2 h-4 w-4" />
                      Editar código
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(code.code)
                        toast({
                          title: "URL copiada",
                          description: "La URL del código promocional ha sido copiada al portapapeles.",
                        })
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar código
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Percent className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No hay códigos promocionales para mostrar</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Los códigos promocionales se pueden utilizar para ofrecer descuentos, acceso de preventa o proporcionar
            acceso especial a su evento.
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear código promocional</DialogTitle>
            <DialogDescription>Cree un nuevo código promocional para su evento.</DialogDescription>
          </DialogHeader>
          <CreatePromoCodeForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

