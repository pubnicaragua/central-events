"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import supabase from "../api/supabase"

export default function useAuth() {
    const { user, userRole, loading: authLoading } = useContext(AuthContext)
    const [modulePermissions, setModulePermissions] = useState({})
    const [loading, setLoading] = useState(true)

    // Cargar permisos de módulos desde la base de datos
    useEffect(() => {
        const fetchModulePermissions = async () => {
            if (!userRole) {
                setLoading(false)
                return
            }

            try {
                // Obtener todos los módulos disponibles para inicializar con false
                const { data: allModules, error: modulesError } = await supabase
                    .from("modules")
                    .select("module_key")
                    .eq("is_enabled", true)

                if (modulesError) throw modulesError

                // Inicializar todos los permisos como false
                const initialPermissions = {}
                allModules.forEach((module) => {
                    initialPermissions[module.module_key] = false
                })

                // Si es administrador (rol 1), dar acceso a todo
                if (userRole === 1) {
                    const fullAccess = {}
                    allModules.forEach((module) => {
                        fullAccess[module.module_key] = true
                    })
                    setModulePermissions(fullAccess)
                    setLoading(false)
                    return
                }

                // Para otros roles, obtener permisos específicos
                const { data: permissions, error: permissionsError } = await supabase
                    .from("modules_permission")
                    .select(`
            modules!inner(
              module_key
            )
          `)
                    .eq("role_id", userRole)

                if (permissionsError) throw permissionsError

                // Actualizar permisos basados en los resultados de la consulta
                const userPermissions = { ...initialPermissions }
                permissions.forEach((permission) => {
                    userPermissions[permission.modules.module_key] = true
                })

                setModulePermissions(userPermissions)
            } catch (error) {
                console.error("Error al cargar permisos de módulos:", error)
                // En caso de error, usar permisos por defecto (ningún acceso)
            } finally {
                setLoading(false)
            }
        }

        fetchModulePermissions()
    }, [userRole])

    // Determinar si el usuario está autenticado
    const isAuthenticated = !!user

    return {
        user,
        userRole,
        loading: authLoading || loading,
        isAuthenticated,
        modulePermissions,

        // Helper para verificar si tiene permiso para un módulo específico
        hasPermission: (module) => modulePermissions[module] || false,

        // Helper para verificar si es admin
        isAdmin: userRole === 1,
    }
}
