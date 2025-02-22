import supabase from "../../../api/supabase";

export async function getTicketsSold(eventId) {
  if (!eventId) return 0;
  
  const { data, error } = await supabase
    .from("tickets")
    .select("quantity")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error obteniendo entradas vendidas:", error);
    return data;
  }

  // Sumar la cantidad de entradas vendidas para el evento
  const totalTicketsSold = data.reduce((acc, ticket) => acc + ticket.quantity, 0);
  return totalTicketsSold;
}

export async function getGrossSales(eventId) {
  if (!eventId) return 0;

  const { data, error } = await supabase
    .from("orders")
    .select("total")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error obteniendo ventas brutas:", error);
    return data;
  }

  // Contar el número total de órdenes creadas para el evento
  return data.length;
}

export async function getDashboardStats(eventId) {
  // Mock data for demonstration purposes
  return {
    ticketsSold: Math.floor(Math.random() * 100),
    grossSales: Math.floor(Math.random() * 1000),
    pageViews: Math.floor(Math.random() * 500),
    ordersCreated: Math.floor(Math.random() * 75),
  }
}

export async function getTicketSalesData(eventId) {
  // Mock data for demonstration purposes
  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toLocaleDateString()
    data.push({
      date: dateString,
      ordersCreated: Math.floor(Math.random() * 20),
      ticketsSold: Math.floor(Math.random() * 30),
    })
  }
  return data.reverse()
}

export async function getRevenueData(eventId) {
  // Mock data for demonstration purposes
  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toLocaleDateString()
    data.push({
      date: dateString,
      totalFees: Math.floor(Math.random() * 50),
      grossSales: Math.floor(Math.random() * 200),
      totalTaxes: Math.floor(Math.random() * 30),
    })
  }
  return data.reverse()
}

