"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import LogoutButton from "./LogoutButton"
import { useAuth } from "../context/AuthContext"

export default function UserProfileMenu() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U"

    const handleProfileClick = () => {
        navigate("/admin/profile")
        setIsOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="relative h-10 w-10 rounded-full focus:outline-none">
                {user?.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url || "/placeholder.svg"}
                        alt="Profile"
                        className="h-10 w-10 rounded-full border-2 border-indigo-100 object-cover"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center border-2 border-indigo-100">
                        {userInitials}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500">{user?.user_metadata?.name || "Usuario"}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <button
                                onClick={handleProfileClick}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Mi Perfil
                            </button>

                            <button
                                onClick={() => {
                                    navigate("/admin/settings")
                                    setIsOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Configuración
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100"></div>

                        {/* Logout Button */}
                        <LogoutButton />
                    </div>
                </div>
            )}
        </div>
    )
}

