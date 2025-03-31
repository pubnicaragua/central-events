"use client"

import { Outlet } from "react-router-dom"
import NotificationBell from "../components/NotificationBell"
import UserProfileMenu from "../components/UserProfileMenu"

function AdminLayout() {
    return (
        <div className="bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 my-10">
                <div className="flex items-center justify-between mb-8 h-16">
                    <div className="flex items-center">
                        <div className="flex flex-col">
                            <h1 className="ml-4 text-4xl font-semibold text-gray-900">Panel de Administrador</h1>
                            <p className="ml-4 font-semibold text-gray-900">PassK</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationBell />

                        <UserProfileMenu />
                    </div>
                </div>

                <div className="py-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout

