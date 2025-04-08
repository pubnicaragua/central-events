"use client"

import { createContext, useContext, useEffect, useState } from "react"
import supabase from "../api/supabase"
import PropTypes from "prop-types"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        console.error("Error obteniendo usuario:", error)
        setUser(null)
        setUserRole(null)
        setLoading(false)
        return
      }

      setUser(data.user)

      // Obtener el rol desde la tabla user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", data.user.id)
        .single()

      if (roleError) {
        console.error("Error obteniendo rol:", roleError)
        setUserRole(null)
      } else {
        setUserRole(roleData?.role_id) // Si no tiene rol, asumimos "user"
      }

      setLoading(false)
    }

    fetchUser()

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, userRole, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

