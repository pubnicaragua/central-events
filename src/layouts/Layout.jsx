import { Outlet } from "react-router-dom"

export default function Layout(){
    return (
        <div className="font-bold">
            Layout

            <Outlet />
        </div>
    )
}