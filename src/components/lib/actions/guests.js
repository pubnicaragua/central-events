import supabase from "../../../api/supabase"

export async function getGuestDetails(guestId) {
    const { data, error } = await supabase
        .from("attendants")
        .select(`
      *,
      amenities_attendees (
        quantity,
        amenities (
          name
        )
      ),
      menu:menus (
        starter,
        main,
        dessert
      )
    `)
        .eq("id", guestId)
        .single()

    if (error) throw error
    return data
}

export async function performCheckIn(guestId) {
    const { data, error } = await supabase
        .from("attendants")
        .update({ checked_in: true, check_in_time: new Date().toISOString() })
        .eq("id", guestId)
        .select()

    if (error) throw error
    return data
}

