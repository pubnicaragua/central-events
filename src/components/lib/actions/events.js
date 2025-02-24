import supabase from "../../../api/supabase"

export async function getEvent(eventId) {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

  if (error) throw error
  return data
}

export async function getEventTickets(eventId) {
  const { data, error } = await supabase.from("tickets").select("*").eq("event_id", eventId)

  if (error) throw error
  return data
}

export async function getEventDetails(eventId) {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

  if (error) throw error
  return data
}

