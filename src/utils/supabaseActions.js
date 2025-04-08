import supabase from "../api/supabase"

// Función para crear un organizador
export async function createOrganizer(name, email, currencyId, timezoneId) {
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const { data, error } = await supabase
      .from("organizers")
      .insert([{ user_id: user.id, name, email, currency_id: currencyId, timezone_id: timezoneId }])
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error("Error creating organizer:", error)
    throw error
  }
}

// Función para crear un evento
export async function createEvent(organizerId, name, startDate, endDate, status) {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([{ organizer_id: organizerId, name, start_date: startDate, end_date: endDate, status }])
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

// Función para obtener las monedas
export async function getCurrencies() {
  try {
    const { data, error } = await supabase.from("currencies").select("id, code, name, symbol")

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching currencies:", error)
    throw error
  }
}

// Función para obtener las zonas horarias
export async function getTimezones() {
  try {
    const { data, error } = await supabase.from("timezones").select("id, name, utc")

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching timezones:", error)
    throw error
  }
}

// Función para actualizar un evento en Supabase
export async function updateEvent(eventId, updatedFields) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update(updatedFields)
      .eq("id", eventId)
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

// Añadir esta nueva función para obtener el diseño de la página de detalles del asistente
export async function getAttendeePageDesign(eventId) {
  try {
    const { data, error } = await supabase.from("homepage_design").select("*").eq("event_id", eventId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error fetching attendee page design:", error)
    throw error
  }
}
