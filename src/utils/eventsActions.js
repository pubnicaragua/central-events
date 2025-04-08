import supabase from "../api/supabase"

export async function getEvents(
  status = "Próximo",
  searchTerm = "",
  sortOrder = "recent",
  userId = null,
  userRoleId = null,
) {
  let query = supabase.from("events").select("*")

  // Filtrar por estado
  if (status === "Próximo") {
    query = query.eq("status", "Próximo")
  } else if (status === "Terminado") {
    query = query.eq("status", "Terminado")
  } else if (status === "Archivado") {
    query = query.eq("status", "Archivado")
  }

  // Si el usuario es organizador (role_id = 2) o empleado (role_id = 4),
  // filtrar solo los eventos asignados a ese usuario
  if (userId && (userRoleId === 2 || userRoleId === 4)) {
    // Primero obtenemos los event_id asignados al usuario desde user_profile
    const { data: userProfileData, error: userProfileError } = await supabase
      .from("user_profile")
      .select("event_id")
      .eq("auth_id", userId)

    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError)
      throw userProfileError
    }

    // Si el usuario tiene eventos asignados, filtramos por esos eventos
    if (userProfileData && userProfileData.length > 0) {
      const eventIds = userProfileData.map((profile) => profile.event_id).filter(Boolean)
      if (eventIds.length > 0) {
        query = query.in("id", eventIds)
      } else {
        // Si no tiene eventos asignados, devolvemos un array vacío
        return []
      }
    } else {
      // Si no tiene perfil o no tiene eventos asignados, devolvemos un array vacío
      return []
    }
  }

  // Buscar por nombre
  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  // Ordenar
  if (sortOrder === "recent") {
    query = query.order("start_date", { ascending: false })
  } else {
    query = query.order("start_date", { ascending: true })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching events:", error)
    throw error
  }

  return data || []
}

export async function createEvent(eventData) {
  const { data, error } = await supabase.from("events").insert([eventData]).select()

  if (error) {
    console.error("Error creating event:", error)
    throw error
  }

  return data[0]
}

export async function updateEvent(id, eventData) {
  const { data, error } = await supabase.from("events").update(eventData).eq("id", id).select()

  if (error) {
    console.error("Error updating event:", error)
    throw error
  }

  return data[0]
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

// Nueva función para asignar un evento a un usuario
export async function assignEventToUser(userId, eventId) {
  // Primero verificamos si ya existe un perfil para este usuario
  const { data: existingProfile, error: profileError } = await supabase
    .from("user_profile")
    .select("*")
    .eq("auth_id", userId)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 es "no se encontró ningún registro"
    console.error("Error checking user profile:", profileError)
    throw profileError
  }

  if (existingProfile) {
    // Actualizar el perfil existente
    const { error: updateError } = await supabase
      .from("user_profile")
      .update({ event_id: eventId })
      .eq("auth_id", userId)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      throw updateError
    }
  } else {
    // Crear un nuevo perfil
    const { error: insertError } = await supabase.from("user_profile").insert([{ auth_id: userId, event_id: eventId }])

    if (insertError) {
      console.error("Error creating user profile:", insertError)
      throw insertError
    }
  }

  return true
}
