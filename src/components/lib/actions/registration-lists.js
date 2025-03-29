import supabase from "../../../api/supabase"

/**
 * Obtiene todas las listas de registro
 * @returns {Promise<Array>} Lista de listas de registro
 */
export async function getRegistrationLists() {
  const { data, error } = await supabase
    .from("registration_list")
    .select("*, tickets(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Crea una nueva lista de registro
 * @param {Object} listData - Datos de la lista de registro
 * @returns {Promise<Object>} Lista de registro creada
 */
export async function createRegistrationList(listData) {
  const { data, error } = await supabase.from("registration_list").insert([listData]).select()

  if (error) throw error
  return data[0]
}

/**
 * Actualiza una lista de registro
 * @param {string} id - ID de la lista de registro
 * @param {Object} listData - Datos actualizados
 * @returns {Promise<Object>} Lista de registro actualizada
 */
export async function updateRegistrationList(id, listData) {
  const { data, error } = await supabase.from("registration_list").update(listData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

/**
 * Elimina una lista de registro
 * @param {string} id - ID de la lista de registro
 */
export async function deleteRegistrationList(id) {
  const { error } = await supabase.from("registration_list").delete().eq("id", id)

  if (error) throw error
}

