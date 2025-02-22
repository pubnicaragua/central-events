import PropTypes from "prop-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

export function OrderDetailsDialog({ open, onOpenChange, order }) {
  const navigate = useNavigate()

  if (!order) return null

  const handleNavigateToAttendee = (attendeeId) => {
    navigate(`/manage/event/${order.event_id}/attendees?query=${attendeeId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del pedido {order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Información del pedido */}
          <div className="rounded-lg border bg-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-muted-foreground">Nombre</h3>
                <p>{order.name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Correo electrónico</h3>
                <p>{order.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Fecha</h3>
                <p>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Estado</h3>
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
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Monto total del pedido</h3>
                <p>${order.total || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Total reembolsado</h3>
                <p>${order.refunded_amount || "0.00"}</p>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Resumen del pedido</h3>
            <div className="space-y-4 rounded-lg border bg-card p-6">
              {order.attendants?.map((attendant) => (
                <div key={attendant.id} className="flex items-center justify-between">
                  <div>
                    <p>1 x {attendant.tickets?.title || "Entrada"}</p>
                  </div>
                  <p>${order.total || "0.00"}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="font-semibold">Total parcial</p>
                  <p>{order.total > 0 ? `$${order.total}` : "Gratis"}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Total</p>
                  <p>{order.total > 0 ? `$${order.total}` : "Gratis"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Asistentes */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Asistentes</h3>
            <div className="space-y-2">
              {order.attendants?.map((attendant) => (
                <div key={attendant.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-800">
                      {attendant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{attendant.name}</p>
                      <p className="text-sm text-muted-foreground">{attendant.tickets?.title || "Entrada"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleNavigateToAttendee(attendant.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

OrderDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    total: PropTypes.number,
    refunded_amount: PropTypes.number,
    created_at: PropTypes.string.isRequired,
    event_id: PropTypes.string.isRequired,
    attendants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        tickets: PropTypes.shape({
          title: PropTypes.string,
        }),
      }),
    ),
  }),
}

