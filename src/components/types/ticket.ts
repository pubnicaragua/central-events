export type TicketType = "paid" | "free" | "donation" | "tiered"

export interface Ticket {
  id: string
  title: string
  description?: string
  status: string
  bill_type: TicketType
  quantity?: number
  name?: string
  price?: number
  min_per_order?: number
  max_per_order?: number
  begin_date?: Date
  end_date?: Date
  hide_before_sale?: boolean
  hide_after_sale?: boolean
  colapse_ticket?: boolean
  show_quantity?: boolean
  hide_if_spent?: boolean
  hide_if_promo_code?: boolean
  hide_to_clients?: boolean
  event_id: string
}

export interface TicketFormData {
  name: string
  description: string
  type: TicketType
  price?: string
  quantity: string
  minQuantity: string
  maxQuantity: string
  startDate: string
  endDate: string
  hideBeforeStart: boolean
  hideAfterEnd: boolean
  hideWhenSoldOut: boolean
  showQuantity: boolean
  hideFromCustomers: boolean
  taxes?: string
}

