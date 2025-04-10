// ImportUsersModalOptimized.jsx
"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import supabase from "../../api/supabase"

const ImportUsersModalOptimized = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)

    const generatePassword = (length) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#"
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    }

    const handleFileChange = async (e) => {
        const selected = e.target.files[0]
        if (!selected) return
        setFile(selected)
        importUsersFromExcel(selected)
    }

    const importUsersFromExcel = async (file) => {
        setLoading(true)
        setLogs([])
        const newLogs = []

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: "array" })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

                const headers = rows[0]
                const requiredHeaders = ["name", "second_name", "email", "role_name"]
                const missing = requiredHeaders.filter((h) => !headers.includes(h))

                if (missing.length > 0) {
                    alert(`Faltan columnas: ${missing.join(", ")}`)
                    return
                }

                const users = rows.slice(1).map((row) => {
                    const user = {}
                    headers.forEach((header, i) => {
                        user[header] = row[i] || ""
                    })
                    return user
                })

                const { data: rolesData } = await supabase.from("roles").select("*")
                const rolesMap = {}
                rolesData.forEach((r) => {
                    rolesMap[r.name.trim().toLowerCase()] = r.id
                })

                for (const user of users) {
                    try {
                        const roleId = rolesMap[user.role_name.trim().toLowerCase()]
                        if (!roleId) {
                            newLogs.push(`❌ Rol no encontrado: ${user.role_name}`)
                            continue
                        }

                        const password = generatePassword(12)
                        const { data: authData, error: authError } = await supabase.auth.signUp({
                            email: user.email,
                            password,
                        })

                        if (authError || !authData?.user?.id) {
                            newLogs.push(`❌ Error auth para ${user.email}: ${authError?.message}`)
                            continue
                        }

                        const authId = authData.user.id

                        const { error: profileError } = await supabase.from("user_profile").insert({
                            name: user.name,
                            second_name: user.second_name,
                            email: user.email,
                            auth_id: authId,
                        })

                        if (profileError) {
                            newLogs.push(`❌ Error perfil para ${user.email}: ${profileError.message}`)
                            continue
                        }

                        const { error: roleError } = await supabase.from("user_roles").insert({
                            user_id: authId,
                            role_id: roleId,
                        })

                        if (roleError) {
                            newLogs.push(`❌ Error asignando rol a ${user.email}: ${roleError.message}`)
                            continue
                        }

                        newLogs.push(`✅ Usuario creado: ${user.email}`)
                    } catch (err) {
                        newLogs.push(`❌ Error inesperado para ${user.email}: ${err.message}`)
                    }
                }

                setLogs(newLogs)
                if (onSuccess) onSuccess()
            } catch (err) {
                alert("Error procesando archivo: " + err.message)
            } finally {
                setLoading(false)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Importar Usuarios</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">X</button>
                </div>

                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="mb-4" />

                {loading && <p className="text-blue-600">Importando usuarios...</p>}

                <div className="mt-4 max-h-64 overflow-y-auto text-sm">
                    {logs.map((log, idx) => (
                        <p key={idx} className={log.startsWith("✅") ? "text-green-600" : "text-red-600"}>{log}</p>
                    ))}
                </div>

                <div className="mt-4 text-right">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportUsersModalOptimized
