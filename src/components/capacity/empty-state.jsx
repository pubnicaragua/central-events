export function EmptyState() {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-4 h-40 w-40">
          <img
            src="/placeholder.svg?height=160&width=160"
            alt="No hay asignaciones de capacidad"
            className="h-full w-full"
          />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No hay Asignaciones de Capacidad</h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Las asignaciones de capacidad te permiten gestionar la capacidad en entradas o en todo un evento. Ideal para
          eventos de varios días, talleres y más, donde es crucial controlar la asistencia.
        </p>
      </div>
    )
  }
  
  