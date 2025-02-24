import supabase from "../../../api/supabase"

export async function getAttendeeCount(eventId) {
  if (!eventId) return 0

  // First get all tickets for this event
  const { data: tickets, error: ticketsError } = await supabase.from("tickets").select("id").eq("event_id", eventId)

  if (ticketsError) {
    console.error("Error obteniendo tickets:", ticketsError)
    return 0
  }

  if (!tickets || tickets.length === 0) {
    return 0
  }

  // Get attendants count for these tickets
  const ticketIds = tickets.map((ticket) => ticket.id)
  const { data: attendants, error: attendantsError } = await supabase
    .from("attendants")
    .select("id")
    .in("ticket_id", ticketIds)

  if (attendantsError) {
    console.error("Error obteniendo asistentes:", attendantsError)
    return 0
  }

  return attendants?.length || 0
}

// Alternative approach using a single query with joins
export async function getAttendeeCountWithJoin(eventId) {
  if (!eventId) return 0

  const { data, error } = await supabase
    .from("attendants")
    .select(`
      id,
      tickets!inner(
        event_id
      )
    `)
    .eq("tickets.event_id", eventId)

  if (error) {
    console.error("Error obteniendo asistentes:", error)
    return 0
  }

  return data?.length || 0
}

export async function getDashboardStats(eventId) {
  try {
    // Get tickets sold and orders count
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, quantity, total")
      .eq("event_id", eventId)

    if (ordersError) throw ordersError

    // Get attendee count
    const attendeeCount = await getAttendeeCount(eventId)

    const ticketsSold = orders.reduce((sum, order) => sum + (order.quantity || 0), 0)
    const grossSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)

    return {
      ticketsSold,
      grossSales,
      attendeeCount,
      ordersCreated: orders.length,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}

export async function getTicketSalesData(eventId) {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("created_at, quantity")
      .eq("event_id", eventId)
      .order("created_at")

    if (error) throw error

    // Group by date
    const dailyData = orders.reduce((acc, curr) => {
      const date = new Date(curr.created_at).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = {
          ordersCreated: 0,
          ticketsSold: 0,
        }
      }
      acc[date].ordersCreated++
      acc[date].ticketsSold += curr.quantity || 0
      return acc
    }, {})

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch (error) {
    console.error("Error fetching ticket sales data:", error)
    throw error
  }
}

export async function getRevenueData(eventId) {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("created_at, total")
      .eq("event_id", eventId)
      .order("created_at")

    if (error) throw error

    // Group by date
    const dailyData = orders.reduce((acc, curr) => {
      const date = new Date(curr.created_at).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = {
          totalFees: 0,
          grossSales: 0,
          totalTaxes: 0,
        }
      }
      const total = curr.total || 0
      acc[date].grossSales += total
      acc[date].totalFees += total * 0.1 // 10% fees
      acc[date].totalTaxes += total * 0.16 // 16% taxes
      return acc
    }, {})

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    throw error
  }
}

