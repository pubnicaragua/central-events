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

                // Add a note about the password column being optional
                if (!headers.includes("password")) {
                    newLogs.push("ℹ️ No se encontró columna 'password'. Se generarán contraseñas aleatorias.")
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

                        // Use the password from Excel if provided, otherwise generate one
                        const password = user.password ? user.password : generatePassword(12)
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

                        // Add information about the password to the logs
                        if (user.password) {
                            newLogs.push(`✅ Usuario creado con contraseña personalizada: ${user.email}`)
                        } else {
                            newLogs.push(`✅ Usuario creado con contraseña generada: ${user.email}`)
                        }
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
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        X
                    </button>
                </div>

                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="mb-4" />

                {loading && <p className="text-blue-600">Importando usuarios...</p>}

                <div className="mt-4 max-h-64 overflow-y-auto text-sm">
                    {logs.map((log, idx) => (
                        <p key={idx} className={log.startsWith("✅") ? "text-green-600" : "text-red-600"}>
                            {log}
                        </p>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                    <h3 className="font-bold mb-2">Formato del archivo Excel:</h3>
                    <p>El archivo debe contener las siguientes columnas:</p>
                    <ul className="list-disc pl-5 mt-1">
                        <li>name - Nombre del usuario</li>
                        <li>second_name - Apellido del usuario</li>
                        <li>email - Correo electrónico</li>
                        <li>role_name - Nombre del rol</li>
                        <li>password (opcional) - Contraseña personalizada</li>
                    </ul>
                    <p className="mt-2 text-gray-600">
                        Si no se proporciona la columna password, se generarán contraseñas aleatorias seguras.
                    </p>
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
