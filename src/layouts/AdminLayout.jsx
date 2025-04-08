"use client"

import { Outlet } from "react-router-dom"
import Sidebar from "../components/AdminSidebar"
import { AdminMobileMenu } from "../components/AdminMobileMenu"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"


function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Si estamos exactamente en la ruta raíz, redirigir a /admin/events
        if (location.pathname === '/') {
            navigate('/admin/events');
        }
    }, [location, navigate]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <AdminMobileMenu />
            <div className="flex-1">
                <main className="flex-1 p-4 md:p-6 bg-emerald-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout

