import supabase from "../../../api/supabase"

// Función para obtener la configuración de diseño para la página del asistente
async function getAttendeePageDesign(eventId) {
  try {
    if (!eventId) return null

    // Buscar la configuración de tema para este evento
    const { data, error } = await supabase.from("theme_configs").select("*").eq("event_id", eventId).maybeSingle()

    if (error) {
      console.error("Error al obtener la configuración de diseño:", error)
      return null
    }

    // Si no hay configuración, devolver null
    if (!data) return null

    // Convertir los datos de la base de datos al formato que usa nuestra aplicación
    return {
      id: data.id,
      name: data.name,
      headerBg: data.header_bg,
      pageBg: data.page_bg,
      cardBg: data.card_bg,
      primaryText: data.primary_text,
      secondaryText: data.secondary_text,
      accentColor: data.accent_color,
      borderColor: data.border_color,
      iconColor: data.icon_color,
      headerImageUrl: data.header_image_url,
      qrModuleColor: data.qr_module_color,
      qrBackgroundColor: data.qr_background_color,
      event_id: data.event_id,
    }
  } catch (error) {
    console.error("Error al obtener la configuración de diseño:", error)
    return null
  }
}

export default getAttendeePageDesign

