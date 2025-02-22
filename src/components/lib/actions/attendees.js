import supabase from "../../../api/supabase"

export async function createAttendee(attendeeData) {
  const { data, error } = await supabase
    .from("assistants")
    .insert([
      {
        ticket_id: attendeeData.ticket_id,
        order_id: attendeeData.order_id,
        name: attendeeData.name,
        second_name: attendeeData.second_name,
        email: attendeeData.email,
        status: "confirmed",
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function getEventAttendees(eventId) {
  const { data, error } = await supabase.from("assistants").select("*").eq("event_id", eventId)

  if (error) throw error
  return data
}

