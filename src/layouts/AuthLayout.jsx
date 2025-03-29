import { Outlet } from "react-router-dom"

function AuthLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Columna izquierda con fondo azul oscuro */}
      <div className="hidden sm:flex bg-gray-800 items-center justify-center">
        <img src="/logo.png" alt="" />
      </div>

      {/* Columna derecha con fondo gris claro */}
      <div className="bg-slate-100 flex  items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout

