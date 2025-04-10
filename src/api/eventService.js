import supabase from "../api/supabase"

// Obtener detalles del evento
export async function getEventDetails(eventId) {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

  if (error) {
    console.error("Error obteniendo detalles del evento:", error)
    throw error
  }

  return data
}

// Obtener asistentes del evento
export async function getEventAttendees(eventId) {
  const { data, error } = await supabase.from("attendants").select("*").eq("event_id", eventId)

  if (error) {
    console.error("Error obteniendo asistentes:", error)
    throw error
  }

  return data || []
}

// Obtener amenidades del evento
export async function getEventAmenities(eventId) {
  const { data, error } = await supabase.from("amenities").select("*").eq("event_id", eventId)

  if (error) {
    console.error("Error obteniendo amenidades:", error)
    throw error
  }

  return data || []
}

// Obtener relación entre amenidades y asistentes
export async function getAmenitiesAttendees(eventId) {
  const { data, error } = await supabase
    .from("amenities_attendees")
    .select(`
      *,
      amenities!inner(event_id)
    `)
    .eq("amenities.event_id", eventId)

  if (error) {
    console.error("Error obteniendo relación amenidades-asistentes:", error)
    throw error
  }

  return data || []
}

// Obtener rifas del evento
export async function getEventRaffles(eventId) {
  const { data, error } = await supabase.from("raffles").select("*").eq("event_id", eventId)

  if (error) {
    console.error("Error obteniendo rifas:", error)
    throw error
  }

  return data || []
}

// Obtener ganadores de rifas
export async function getRaffleWinners(eventId) {
  const { data, error } = await supabase
    .from("raffle_winner")
    .select(`
      *,
      raffles!inner(event_id),
      attendants(id, name, second_name, email)
    `)
    .eq("raffles.event_id", eventId)

  if (error) {
    console.error("Error obteniendo ganadores de rifas:", error)
    throw error
  }

  return data || []
}

// Obtener estadísticas de check-in
export async function getCheckInStats(eventId) {
  const { data, error } = await supabase
    .from("attendants")
    .select("id, checked_in, checked_in_at")
    .eq("event_id", eventId)

  if (error) {
    console.error("Error obteniendo estadísticas de check-in:", error)
    throw error
  }

  // Agrupar por hora de check-in
  const checkInsByHour = data.reduce((acc, attendant) => {
    if (attendant.checked_in && attendant.checked_in_at) {
      const date = new Date(attendant.checked_in_at)
      const hour = date.getHours()
      const hourKey = `${hour}:00`

      if (!acc[hourKey]) {
        acc[hourKey] = 0
      }

      acc[hourKey]++
    }
    return acc
  }, {})

  return {
    totalAttendees: data.length,
    checkedIn: data.filter((a) => a.checked_in).length,
    checkInsByHour,
  }
}
