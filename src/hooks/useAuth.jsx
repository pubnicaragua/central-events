"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import supabase from "../api/supabase"

export default function useAuth() {
  const { user, userRole, loading } = useContext(AuthContext)
  const [modulePermissions, setModulePermissions] = useState({})

  // Cargar permisos de módulos desde la base de datos
  useEffect(() => {
    const fetchModulePermissions = async () => {
      if (!userRole) {
        return
      }

      try {
        // Obtener todos los módulos disponibles para inicializar con false
        const { data: allModules, error: modulesError } = await supabase
          .from("modules")
          .select("id, module_key")
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
          return
        }

        // Para otros roles, obtener permisos específicos
        const { data: permissions, error: permissionsError } = await supabase
          .from("modules_permission")
          .select("module_id")
          .eq("role_id", userRole)

        if (permissionsError) throw permissionsError

        // Obtener las claves de módulo para los IDs de módulo permitidos
        const moduleIds = permissions.map((p) => p.module_id)

        if (moduleIds.length > 0) {
          const { data: permittedModules, error: permittedError } = await supabase
            .from("modules")
            .select("module_key")
            .in("id", moduleIds)
            .eq("is_enabled", true)

          if (permittedError) throw permittedError

          // Actualizar permisos basados en los resultados de la consulta
          const userPermissions = { ...initialPermissions }
          permittedModules.forEach((module) => {
            userPermissions[module.module_key] = true
          })

          setModulePermissions(userPermissions)
        } else {
          setModulePermissions(initialPermissions)
        }
      } catch (error) {
        console.error("Error al cargar permisos de módulos:", error)
        // En caso de error, usar permisos por defecto (ningún acceso)
      }
    }

    if (userRole !== null) {
      fetchModulePermissions()
    }
  }, [userRole])

  // Determinar si el usuario está autenticado
  const isAuthenticated = !!user

  return {
    user,
    userRole,
    loading,
    isAuthenticated,
    modulePermissions,

    // Helper para verificar si tiene permiso para un módulo específico
    hasPermission: (module) => {
      // Si es admin (rol 1), siempre tiene permiso
      if (userRole === 1) return true

      // Si el módulo no existe en los permisos, no tiene acceso
      if (modulePermissions[module] === undefined) return false

      // Devolver el valor del permiso
      return modulePermissions[module]
    },

    // Helper para verificar si es admin
    isAdmin: userRole === 1,
    isOrganizer: userRole === 2,
    isEmployee: userRole === 4,
  }
}
