//src/components/lib/actions/tickets.js
import supabase from "../../../api/supabase"

export async function createTicket(ticketData) {
  if (!ticketData.event_id) {
    throw new Error("Error: event_id es obligatorio")
  }

  console.log("Datos enviados:", ticketData) // Debug
  const { data, error } = await supabase.from("tickets").insert([ticketData]).select()

  if (error) throw error
  return data[0]
}

export async function getTickets(eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getTicket(ticketId) {
  const { data, error } = await supabase.from("tickets").select("*").eq("id", ticketId).single()

  if (error) throw error
  return data
}

export async function updateTicket(id, ticketData) {
  const { data, error } = await supabase.from("tickets").update(ticketData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deleteTicket(id) {
  const { error } = await supabase.from("tickets").delete().eq("id", id)

  if (error) throw error
}

export async function createEscaledTicket(escaledTicketData) {
  const { data, error } = await supabase.from("escaled_ticket").insert([escaledTicketData]).select()

  if (error) throw error
  return data[0]
}

export async function getEscaledTickets(ticketId) {
  const { data, error } = await supabase
    .from("escaled_ticket")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

