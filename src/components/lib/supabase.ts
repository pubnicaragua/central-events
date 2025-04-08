import supabase from "../../api/supabase"

// Modificar la interfaz ThemeConfig para incluir el id y event_id
export interface ThemeConfig {
  id?: string
  name: string
  user_id?: string
  event_id?: string
  headerBg: string
  pageBg: string
  cardBg: string
  primaryText: string
  secondaryText: string
  accentColor: string
  borderColor: string
  iconColor: string
  headerImageUrl?: string
  qrModuleColor: string
  qrBackgroundColor: string
  created_at?: string
}

// Modificar la función saveThemeConfig para que actualice si ya existe una configuración para el evento
export async function saveThemeConfig(config: ThemeConfig) {
  try {
    // Si tenemos una URL de imagen local (blob), necesitamos subirla a Supabase Storage
    let headerImageUrl = config.headerImageUrl

    if (headerImageUrl && headerImageUrl.startsWith("blob:")) {
      // Convertir la URL blob a un archivo
      const response = await fetch(headerImageUrl)
      const blob = await response.blob()
      const file = new File([blob], "header-image.jpg", { type: blob.type })

      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage.from("homepage").upload(`header-${Date.now()}.jpg`, file)

      if (error) {
        throw error
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = supabase.storage.from("homepage").getPublicUrl(data.path)

      headerImageUrl = urlData.publicUrl
    }

    // Preparar los datos para guardar
    const themeData = {
      name: config.name,
      event_id: config.event_id,
      header_bg: config.headerBg,
      page_bg: config.pageBg,
      card_bg: config.cardBg,
      primary_text: config.primaryText,
      secondary_text: config.secondaryText,
      accent_color: config.accentColor,
      border_color: config.borderColor,
      icon_color: config.iconColor,
      header_image_url: headerImageUrl,
      qr_module_color: config.qrModuleColor,
      qr_background_color: config.qrBackgroundColor,
    }

    let result

    // Si tenemos un ID, actualizamos el registro existente
    if (config.id) {
      const { data, error } = await supabase
        .from("theme_configs")
        .update(themeData)
        .eq("id", config.id)
        .select()
        .single()

      if (error) throw error
      result = data
    }
    // Si tenemos un event_id pero no un id, buscamos si ya existe una configuración para ese evento
    else if (config.event_id) {
      // Primero verificamos si ya existe una configuración para este evento
      const { data: existingConfig, error: fetchError } = await supabase
        .from("theme_configs")
        .select("*")
        .eq("event_id", config.event_id)
        .maybeSingle()

      if (fetchError) throw fetchError

      // Si ya existe una configuración, la actualizamos
      if (existingConfig) {
        const { data, error } = await supabase
          .from("theme_configs")
          .update(themeData)
          .eq("id", existingConfig.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Si no existe, creamos una nueva
        const { data, error } = await supabase.from("theme_configs").insert(themeData).select().single()

        if (error) throw error
        result = data
      }
    } else {
      // Si no tenemos ni id ni event_id, creamos una nueva configuración
      const { data, error } = await supabase.from("theme_configs").insert(themeData).select().single()

      if (error) throw error
      result = data
    }

    return result
  } catch (error) {
    console.error("Error al guardar la configuración:", error)
    throw error
  }
}

// Función para obtener todas las configuraciones de tema
export async function getThemeConfigs() {
  try {
    const { data, error } = await supabase.from("theme_configs").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Convertir los datos de la base de datos al formato que usa nuestra aplicación
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      user_id: item.user_id,
      event_id: item.event_id,
      headerBg: item.header_bg,
      pageBg: item.page_bg,
      cardBg: item.card_bg,
      primaryText: item.primary_text,
      secondaryText: item.secondary_text,
      accentColor: item.accent_color,
      borderColor: item.border_color,
      iconColor: item.icon_color,
      headerImageUrl: item.header_image_url,
      qrModuleColor: item.qr_module_color,
      qrBackgroundColor: item.qr_background_color,
      created_at: item.created_at,
    })) as ThemeConfig[]
  } catch (error) {
    console.error("Error al obtener las configuraciones:", error)
    throw error
  }
}

// Función para obtener una configuración de tema específica por ID
export async function getThemeConfigById(id: string) {
  try {
    const { data, error } = await supabase.from("theme_configs").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    // Convertir los datos de la base de datos al formato que usa nuestra aplicación
    return {
      id: data.id,
      name: data.name,
      user_id: data.user_id,
      event_id: data.event_id,
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
      created_at: data.created_at,
    } as ThemeConfig
  } catch (error) {
    console.error("Error al obtener la configuración:", error)
    throw error
  }
}

// Función para eliminar una configuración de tema
export async function deleteThemeConfig(id: string) {
  try {
    const { error } = await supabase.from("theme_configs").delete().eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error al eliminar la configuración:", error)
    throw error
  }
}

// Función para obtener la configuración de tema por ID de evento
export async function getThemeConfigByEventId(eventId: string) {
  try {
    const { data, error } = await supabase.from("theme_configs").select("*").eq("event_id", eventId).maybeSingle()

    if (error) {
      throw error
    }

    if (!data) return null

    // Convertir los datos de la base de datos al formato que usa nuestra aplicación
    return {
      id: data.id,
      name: data.name,
      user_id: data.user_id,
      event_id: data.event_id,
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
      created_at: data.created_at,
    } as ThemeConfig
  } catch (error) {
    console.error("Error al obtener la configuración por ID de evento:", error)
    throw error
  }
}

