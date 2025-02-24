//src/components/lib/actions/tickets.js
import supabase from "../../../api/supabase"


/**
 * Crea un nuevo ticket
 * @param {Object} ticketData - Datos del ticket a crear
 * @returns {Promise<Object>} Ticket creado
 */
export async function createTicket(ticketData) {
  if (!ticketData.event_id) {
    throw new Error("Error: event_id es obligatorio")
  }

  console.log("Datos enviados:", ticketData) // Debug
  const { data, error } = await supabase.from("tickets").insert([ticketData]).select()

  if (error) throw error
  return data[0]
}

/**
 * Obtiene todos los tickets de un evento
 * @param {string} eventId - ID del evento
 * @returns {Promise<Array>} Lista de tickets
 */
export async function getTickets(eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId) // Filtrar por event_id
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}


/**
 * Obtiene un ticket específico por su ID
 * @param {string} ticketId - ID del ticket
 * @returns {Promise<Object>} Ticket encontrado
 */
export async function getTicket(ticketId) {
  const { data, error } = await supabase.from("tickets").select("*").eq("id", ticketId).single()

  if (error) throw error
  return data
}

/**
 * Actualiza un ticket existente
 * @param {string} id - ID del ticket
 * @param {Object} ticketData - Datos actualizados del ticket
 * @returns {Promise<Object>} Ticket actualizado
 */
export async function updateTicket(id, ticketData) {
  const { data, error } = await supabase.from("tickets").update(ticketData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

/**
 * Elimina un ticket
 * @param {string} id - ID del ticket
 */
export async function deleteTicket(id) {
  const { error } = await supabase.from("tickets").delete().eq("id", id)

  if (error) throw error
}

/**
 * Crea un nuevo ticket escalonado
 * @param {Object} escaledTicketData - Datos del ticket escalonado
 * @returns {Promise<Object>} Ticket escalonado creado
 */
export async function createEscaledTicket(escaledTicketData) {
  const { data, error } = await supabase.from("escaled_ticket").insert([escaledTicketData]).select()

  if (error) throw error
  return data[0]
}

/**
 * Obtiene todos los tickets escalonados
 * @returns {Promise<Array>} Lista de tickets escalonados
 */
export async function getEscaledTickets() {
  const { data, error } = await supabase.from("escaled_ticket").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Obtiene los tickets escalonados de un ticket específico
 * @param {string} ticketId - ID del ticket principal
 * @returns {Promise<Array>} Lista de tickets escalonados
 */
export async function getTicketEscaledTickets(ticketId) {
  const { data, error } = await supabase
    .from("escaled_ticket")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Obtiene el ticket disponible más barato de un evento
 * @param {string} eventId - ID del evento
 * @returns {Promise<Object>} Ticket disponible más barato
 */
export async function getAvailableTicket(eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, price, quantity")
    .eq("event_id", eventId)
    .gt("quantity", 0)
    .order("price")
    .limit(1)
    .single()

  if (error) throw error
  return data
}

/**
 * Actualiza la cantidad disponible de un ticket
 * @param {string} ticketId - ID del ticket
 * @param {number} quantity - Nueva cantidad
 */
export async function updateTicketQuantity(ticketId, quantity) {
  const { error } = await supabase
    .from("tickets")
    .update({ quantity: quantity - 1 })
    .eq("id", ticketId)

  if (error) throw error
}

