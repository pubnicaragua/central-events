import supabase from "../../../api/supabase"

/**
 * Obtiene el diseño de la página de inicio de un evento
 * @param {string} eventId - ID del evento
 * @returns {Promise<Object>} Diseño de la página
 */
export async function getHomepageDesign(eventId) {
    const { data, error } = await supabase.from("homepage_design").select("*").eq("event_id", eventId).single()

    if (error) throw error
    return data
}

/**
 * Actualiza el diseño de la página de inicio
 * @param {string} eventId - ID del evento
 * @param {Object} designData - Datos del diseño
 * @returns {Promise<Object>} Diseño actualizado
 */
export async function updateHomepageDesign(eventId, designData) {
    const { data: existing } = await supabase.from("homepage_design").select("id").eq("event_id", eventId).single()

    if (existing) {
        const { data, error } = await supabase
            .from("homepage_design")
            .update({
                ...designData,
                updated_at: new Date().toISOString(),
            })
            .eq("event_id", eventId)
            .select()

        if (error) throw error
        return data[0]
    } else {
        const { data, error } = await supabase
            .from("homepage_design")
            .insert([
                {
                    event_id: eventId,
                    ...designData,
                },
            ])
            .select()

        if (error) throw error
        return data[0]
    }
}

