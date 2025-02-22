import supabase from "../../../api/supabase"

export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        event_id: orderData.event_id,
        ticket_id: orderData.ticket_id,
        quantity: orderData.quantity,
        total: orderData.total,
        name: orderData.name,
        second_name: orderData.second_name,
        email: orderData.email,
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function getOrder(orderId) {
  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (error) throw error
  return data
}

