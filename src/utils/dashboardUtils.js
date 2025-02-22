import supabase from "../api/supabase"

export async function getDashboardStats(eventId) {
    try {
        // Get tickets sold
        const { data: ticketsSold, error: ticketsError } = await supabase
            .from("orders")
            .select("quantity")
            .eq("event_id", eventId)

        if (ticketsError) throw ticketsError

        // Get gross sales
        const { data: sales, error: salesError } = await supabase.from("orders").select("total").eq("event_id", eventId)

        if (salesError) throw salesError

        // Get orders count
        const { count: ordersCount, error: ordersError } = await supabase
            .from("orders")
            .select("*", { count: "exact" })
            .eq("event_id", eventId)

        if (ordersError) throw ordersError

        return {
            ticketsSold: ticketsSold.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
            grossSales: sales.reduce((acc, curr) => acc + (curr.total || 0), 0),
            pageViews: 0, // This would need analytics implementation
            ordersCreated: ordersCount || 0,
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

        return Object.entries(dailyData).map(([date, data]) => ({
            date,
            ...data,
        }))
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
            acc[date].totalFees += total * 0.1 // Example: 10% fees
            acc[date].totalTaxes += total * 0.16 // Example: 16% VAT
            return acc
        }, {})

        return Object.entries(dailyData).map(([date, data]) => ({
            date,
            ...data,
        }))
    } catch (error) {
        console.error("Error fetching revenue data:", error)
        throw error
    }
}

