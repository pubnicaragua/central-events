import supabase from "../api/supabase"

export async function getNotifications(eventId) {
    try {
        if (!eventId) throw new Error("eventId no proporcionado");

        const { data: configData, error: configError } = await supabase
            .from("event_configs")
            .select("notf_config_id")
            .eq("event_id", eventId)
            .maybeSingle();

        if (configError) throw configError;

        if (!configData?.notf_config_id) {
            console.warn("No hay configuración de notificaciones asignada a este evento.");
            return { support_email: "", message: "", notificate: false };
        }

        // 🔹 Obtener configuración de notificaciones
        const { data: notificationData, error: notificationError } = await supabase
            .from("notifications_config")
            .select("*")
            .eq("id", configData.notf_config_id)
            .maybeSingle();

        if (notificationError) throw notificationError;

        return notificationData || { support_email: "", message: "", notificate: false };
    } catch (error) {
        console.error("Error obteniendo configuración de notificaciones:", error);
        return { support_email: "", message: "", notificate: false };
    }
}

export async function updateNotificationsConfig(eventId, notificationData, notificationId) {
    try {
        console.log("Actualizando configuración de notificaciones para el evento ID:", eventId);
        console.log("Datos enviados:", notificationData);

        let newNotificationId = notificationId;

        if (!notificationId) {
            console.warn("No se encontró un ID de configuración de notificaciones. Creando una nueva...");

            const { data, error } = await supabase
                .from("notifications_config")
                .insert([
                    {
                        support_email: notificationData.support_email || "",
                        message: notificationData.message || "",
                        notificate: notificationData.notificate ?? false,
                    },
                ])
                .select();

            if (error) throw error;
            console.log("Configuración de notificaciones creada:", data[0]);

            newNotificationId = data[0].id; // Guardamos el nuevo ID de notificaciones
        } else {
            const { data, error } = await supabase
                .from("notifications_config")
                .update({
                    support_email: notificationData.support_email || "",
                    message: notificationData.message || "",
                    notificate: notificationData.notificate ?? false,
                })
                .eq("id", notificationId)
                .select();

            if (error) throw error;
            console.log("Configuración de notificaciones actualizada:", data[0]);
        }

        // **Actualizar `event_configs` si `notf_config_id` es `null`**
        const { data: eventConfigData, error: eventConfigError } = await supabase
            .from("event_configs")
            .select("id, notf_config_id")
            .eq("event_id", eventId)
            .maybeSingle();

        if (eventConfigError) throw eventConfigError;

        if (eventConfigData && !eventConfigData.notf_config_id) {
            console.warn("Actualizando event_configs con el nuevo notf_config_id...");

            const { error: updateEventConfigError } = await supabase
                .from("event_configs")
                .update({ notf_config_id: newNotificationId })
                .eq("id", eventConfigData.id);

            if (updateEventConfigError) throw updateEventConfigError;

            console.log("event_configs actualizado correctamente con id:", newNotificationId);
        }

        return { id: newNotificationId };
    } catch (error) {
        console.error("Error actualizando o creando configuración de notificaciones:", error);
        throw error;
    }
}


