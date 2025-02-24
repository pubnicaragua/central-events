import supabase from "../../../api/supabase"

/**
 * Obtiene todas las asignaciones de capacidad
 * @returns {Promise<Array>} Lista de asignaciones de capacidad
 */
export async function getCapacityAssignments() {
  const { data, error } = await supabase
    .from("capacity")
    .select("*, tickets(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Crea una nueva asignación de capacidad
 * @param {Object} capacityData - Datos de la asignación de capacidad
 * @returns {Promise<Object>} Asignación de capacidad creada
 */
export async function createCapacityAssignment(capacityData) {
  const { data, error } = await supabase.from("capacity").insert([capacityData]).select()

  if (error) throw error
  return data[0]
}

/**
 * Actualiza una asignación de capacidad
 * @param {string} id - ID de la asignación de capacidad
 * @param {Object} capacityData - Datos actualizados
 * @returns {Promise<Object>} Asignación de capacidad actualizada
 */
export async function updateCapacityAssignment(id, capacityData) {
  const { data, error } = await supabase.from("capacity").update(capacityData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

/**
 * Elimina una asignación de capacidad
 * @param {string} id - ID de la asignación de capacidad
 */
export async function deleteCapacityAssignment(id) {
  const { error } = await supabase.from("capacity").delete().eq("id", id)

  if (error) throw error
}

