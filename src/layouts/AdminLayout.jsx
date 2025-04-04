"use client"

import { Outlet } from "react-router-dom"
import Sidebar from "../components/AdminSidebar"

function AdminLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">
                <main className="flex-1 p-4 md:p-6 bg-emerald-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout

