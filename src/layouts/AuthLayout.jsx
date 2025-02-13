import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <main className="max-w-4xl w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="md:w-1/2 p-6 flex items-center justify-center">
            <img src="../../public/logo.jpg" alt="Logo de Central Events" className="w-40 h-auto" />
          </div>
          <div className="md:w-1/2">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

