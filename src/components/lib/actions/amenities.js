import supabase from "../../../api/supabase"

export async function getEventAmenities(eventId) {
    if (!eventId) throw new Error("Event ID is required")

    const { data, error } = await supabase.from("amenities").select("*").eq("event_id", eventId).gt("quantity", 0)

    if (error) {
        console.error("Error fetching amenities:", error)
        throw error
    }

    return data || []
}

export async function createAmenityAttendee(amenityAttendeeData) {
    if (!amenityAttendeeData.amenityId || !amenityAttendeeData.attendeeId) {
        throw new Error("Amenity ID and Attendee ID are required")
    }

    // Primero verificamos la cantidad disponible
    const { data: amenityData, error: amenityError } = await supabase
        .from("amenities")
        .select("quantity")
        .eq("id", amenityAttendeeData.amenityId)
        .single()

    if (amenityError) {
        console.error("Error checking amenity quantity:", amenityError)
        throw amenityError
    }

    if (!amenityData) {
        throw new Error("Amenidad no encontrada")
    }

    if (amenityData.quantity < amenityAttendeeData.quantity) {
        throw new Error(`No hay suficientes unidades disponibles. Disponibles: ${amenityData.quantity}`)
    }

    // Iniciamos una "transacción manual"
    try {
        // 1. Crear el registro en amenities_attendees
        const { data: attendeeAmenity, error: insertError } = await supabase
            .from("amenities_attendees")
            .insert([
                {
                    amenitie_id: amenityAttendeeData.amenityId,
                    attendee_id: amenityAttendeeData.attendeeId,
                    quantity: amenityAttendeeData.quantity,
                    total: amenityAttendeeData.total,
                },
            ])
            .select()

        if (insertError) throw insertError

        // 2. Actualizar la cantidad en amenities
        const newQuantity = amenityData.quantity - amenityAttendeeData.quantity
        const { error: updateError } = await supabase
            .from("amenities")
            .update({ quantity: newQuantity })
            .eq("id", amenityAttendeeData.amenityId)

        if (updateError) {
            // Si hay error al actualizar la cantidad, intentamos revertir la inserción
            await supabase.from("amenities_attendees").delete().eq("id", attendeeAmenity[0].id)
            throw updateError
        }

        return attendeeAmenity[0]
    } catch (error) {
        console.error("Error in createAmenityAttendee transaction:", error)
        throw new Error(error.message || "Error al procesar la amenidad")
    }
}

export async function updateAmenityQuantity(amenityId, newQuantity) {
    if (!amenityId) throw new Error("Amenity ID is required")
    if (newQuantity < 0) throw new Error("La cantidad no puede ser negativa")

    const { error } = await supabase.from("amenities").update({ quantity: newQuantity }).eq("id", amenityId)

    if (error) {
        console.error("Error updating amenity quantity:", error)
        throw error
    }
}

// Función auxiliar para verificar disponibilidad
export async function checkAmenityAvailability(amenityId, requestedQuantity) {
    const { data, error } = await supabase.from("amenities").select("quantity").eq("id", amenityId).single()

    if (error) throw error

    return {
        available: data.quantity >= requestedQuantity,
        currentQuantity: data.quantity,
    }
}

export async function getAttendeeAmenities(attendeeId) {
    if (!attendeeId) throw new Error("Attendee ID is required")

    const { data, error } = await supabase
        .from("amenities_attendees")
        .select(`
            id,
            quantity,
            total,
            amenities (
                id,
                name,
                price,
                img_url
            )
        `)
        .eq("attendee_id", attendeeId)

    if (error) {
        console.error("Error fetching attendee amenities:", error)
        throw error
    }

    return data || []
}

