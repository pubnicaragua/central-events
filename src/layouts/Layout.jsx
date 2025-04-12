import { Outlet } from "react-router-dom"
import { EmployeeMobileMenu } from "../components/EmployeeMobileMenu"

function DashboardLayout () {
  return (
    <div className="flex min-h-screen">
      <EmployeeMobileMenu />
      <div className="flex-1">
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout