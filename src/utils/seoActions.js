import supabase from "../api/supabase"

export async function getSeoData() {
    try {
        const { data, error } = await supabase.from("seo_config").select("*")

        if (error) throw error
        console.log("Configuracion de seo:", data)
        return data
    } catch (error) {
        console.log("Error al obtener datos de pago", error)
        throw error
    }
}

export async function getEventSeo(eventId) {
    try {
      if (!eventId) throw new Error("eventId no proporcionado");
  
      // 🔹 Obtener `seo_config_id` desde `event_configs`
      const { data: configData, error: configError } = await supabase
        .from("event_configs")
        .select("seo_config_id")
        .eq("event_id", eventId)
        .maybeSingle();
  
      if (configError) throw configError;
      if (!configData?.seo_config_id) return { title: "", description: "", tags: "[]", allow_index: true };
  
      // 🔹 Obtener datos de SEO desde `seo_config`
      const { data: seoData, error: seoError } = await supabase
        .from("seo_config")
        .select("*")
        .eq("id", configData.seo_config_id)
        .maybeSingle();
  
      if (seoError) throw seoError;
      return seoData;
    } catch (error) {
      console.error("Error obteniendo configuración SEO:", error);
      return { title: "", description: "", tags: "[]", allow_index: true };
    }
  }
  

export async function getSeoById(id) {
    try {
        const { data, error } = await supabase.from("seo_config").select("*").eq("id", id).single()

        if (error) throw error
        return data
    } catch (error) {
        console.error("Error fetching seo config:", error)
        throw error
    }
}

export async function updateSeoConfig(eventId, seoId, seoData) {
    try {
      console.log("Actualizando configuración SEO para el evento ID:", eventId);
      console.log("Datos enviados:", seoData);
  
      let newSeoId = seoId;
  
      if (!seoId) {
        console.warn("No se encontró un ID de configuración SEO. Creando una nueva...");
  
        // Insertar nueva configuración SEO
        const { data, error } = await supabase
          .from("seo_config")
          .insert([
            {
              title: seoData.title || "",
              description: seoData.description || "",
              tags: seoData.tags || "[]",
              allow_index: seoData.allow_index ?? true,
            },
          ])
          .select();
  
        if (error) throw error;
        console.log("Configuración SEO creada:", data[0]);
  
        newSeoId = data[0].id; // Guardamos el nuevo ID SEO
      } else {
        // Actualizar configuración SEO existente
        const { data, error } = await supabase
          .from("seo_config")
          .update({
            title: seoData.title || "",
            description: seoData.description || "",
            tags: seoData.tags || "[]",
            allow_index: seoData.allow_index ?? true,
          })
          .eq("id", seoId)
          .select();
  
        if (error) throw error;
        console.log("Configuración SEO actualizada:", data[0]);
      }
  
      // **Actualizar event_configs con el nuevo seo_config_id si no lo tiene**
      const { data: eventConfigData, error: eventConfigError } = await supabase
        .from("event_configs")
        .select("id, seo_config_id")
        .eq("event_id", eventId)
        .maybeSingle();
  
      if (eventConfigError) throw eventConfigError;
  
      if (eventConfigData) {
        if (!eventConfigData.seo_config_id) {
          console.warn("Actualizando event_configs con el nuevo seo_config_id...");
  
          const { error: updateEventConfigError } = await supabase
            .from("event_configs")
            .update({ seo_config_id: newSeoId })
            .eq("id", eventConfigData.id);
  
          if (updateEventConfigError) throw updateEventConfigError;
  
          console.log("event_configs actualizado correctamente con seo_config_id:", newSeoId);
        }
      } else {
        console.warn("No se encontró configuración de evento para este eventId.");
      }
  
      return { id: newSeoId };
    } catch (error) {
      console.error("Error actualizando o creando configuración SEO:", error);
      throw error;
    }
  }
  