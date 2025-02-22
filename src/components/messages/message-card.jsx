import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MessageCard({ message }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{message.topic}</p>
          <p className="text-sm text-muted-foreground">
            Enviado el {format(new Date(message.created_at), "PPpp", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Enviado a: {message.attendants?.email || "Todos los asistentes"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{message.content}</p>
      </CardContent>
    </Card>
  )
}

