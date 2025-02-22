export interface Assistant {
    id: number
    created_at: string
    name: string
    code: string
    email: string
    status: string
    ticket_id: number
    second_name: string
    order_id: number
  }
  
  export interface Order {
    id: number
    created_at: string
    event_id: number
    ticket_id: number
    quantity: number
    total: number
    promo_code: string
    discount: number
    assistant_id: number
    email: string
    name: string
    second_name: string
  }
  
  export interface Event {
    id: number
    created_at: string
    organizer_id: number
    name: string
    start_date: string
    end_date: string
    status: string
    description: string
    config_id: number
  }
  
  export interface Ticket {
    id: number
    created_at: string
    title: string
    status: string
    bill_type: string
    quantity: number
    name: string
    description: string
    hide_before_sale: boolean
    hide_after_sale: boolean
    collapse_ticket: boolean
    show_quantity: boolean
    hide_if_spent: boolean
    hide_if_promo_code: boolean
    hide_to_clients: boolean
    min_per_order: number
    max_per_order: number
    end_date: string
    begin_date: string
    price: number
    escaled_id: number
    event_id: number
  }
  
  export interface DashboardStats {
    ticketsSold: number
    grossSales: number
    pageViews: number
    ordersCreated: number
  }
  
  export interface ChartData {
    date: string
    ordersCreated: number
    ticketsSold: number
  }
  
  export interface RevenueData {
    date: string
    totalFees: number
    grossSales: number
    totalTaxes: number
  }
  
  