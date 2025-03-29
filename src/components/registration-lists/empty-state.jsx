export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-4 h-40 w-40">
        <img src="/placeholder.svg?height=160&width=160" alt="No hay listas de registro" className="h-full w-full" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No hay listas de registro</h3>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Las listas de registro ayudan a gestionar la entrada de los asistentes a su evento. Puede asociar múltiples
        boletos con una lista de registro y asegurarse de que solo aquellos con boletos válidos puedan ingresar.
      </p>
    </div>
  )
}

