import { Outlet } from "react-router-dom"
import  Sidebar  from "../components/sidebar"
import { MobileMenu } from "../components/MobileMenu"

function DashboardLayout () {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1">
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout