import supabase from "../api/supabase"

export async function getEvents(status = "Próximo", searchTerm = "", sortBy = "start_date") {
  let query = supabase.from("events").select("*");

  if (status === "Próximo") {
    query = query.eq("status", "Próximo");
  } else if (status === "Terminado") {
    query = query.eq("status", "Terminado");
  } else if (status === "Archivado") {
    query = query.eq("status", "Archivado");
  }

  // Buscar por nombre
  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  // Ordenar
  query = query.order("start_date", { ascending: sortBy === "start_date_asc" });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data;
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

