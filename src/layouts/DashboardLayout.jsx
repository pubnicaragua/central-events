import { Outlet } from "react-router-dom"
import { Sidebar } from "../components/sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

