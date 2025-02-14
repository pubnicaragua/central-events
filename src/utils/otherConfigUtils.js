import supabase from "../api/supabase"

export async function getOtherConfig(eventId) {
    try {
        if (!eventId) throw new Error("eventId no proporcionado");

        // 🔹 Obtener `other_config_id` desde `event_configs`
        const { data: configData, error: configError } = await supabase
            .from("event_configs")
            .select("other_config_id")
            .eq("event_id", eventId)
            .maybeSingle();

        if (configError) throw configError;

        if (!configData?.other_config_id) {
            console.warn("No hay configuración de otras opciones para este evento.");
            return { include_tax: true, show_home: true };
        }

        // 🔹 Obtener configuración desde `other_config`
        const { data: otherConfig, error: otherError } = await supabase
            .from("other_config")
            .select("*")
            .eq("id", configData.other_config_id)
            .maybeSingle();

        if (otherError) throw otherError;

        return otherConfig || { include_tax: true, show_home: true };
    } catch (error) {
        console.error("Error obteniendo otras configuraciones:", error);
        return { include_tax: true, show_home: true };
    }
}

export async function updateOtherConfig(eventId, configData, otherConfigId) {
    try {
        console.log("Actualizando configuración de otras opciones para el evento ID:", eventId);
        console.log("Datos enviados:", configData);

        let newConfigId = otherConfigId;

        if (!otherConfigId) {
            console.warn("No se encontró un ID de configuración. Creando una nueva...");

            const { data, error } = await supabase
                .from("other_config")
                .insert([
                    {
                        include_tax: configData.include_tax ?? true,
                        show_home: configData.show_home ?? true,
                    },
                ])
                .select();

            if (error) throw error;
            console.log("Configuración creada:", data[0]);

            newConfigId = data[0].id; // Guardamos el nuevo ID
        } else {
            const { data, error } = await supabase
                .from("other_config")
                .update({
                    include_tax: configData.include_tax ?? true,
                    show_home: configData.show_home ?? true,
                })
                .eq("id", otherConfigId)
                .select();

            if (error) throw error;
            console.log("Configuración actualizada:", data[0]);
        }

        // **Actualizar `event_configs` si `other_config_id` es `null`**
        const { data: eventConfigData, error: eventConfigError } = await supabase
            .from("event_configs")
            .select("id, other_config_id")
            .eq("event_id", eventId)
            .maybeSingle();

        if (eventConfigError) throw eventConfigError;

        if (eventConfigData && !eventConfigData.other_config_id) {
            console.warn("Actualizando event_configs con el nuevo other_config_id...");

            const { error: updateEventConfigError } = await supabase
                .from("event_configs")
                .update({ other_config_id: newConfigId })
                .eq("id", eventConfigData.id);

            if (updateEventConfigError) throw updateEventConfigError;

            console.log("event_configs actualizado correctamente con id:", newConfigId);
        }

        return { id: newConfigId };
    } catch (error) {
        console.error("Error actualizando configuración de otras opciones:", error);
        throw error;
    }
}
