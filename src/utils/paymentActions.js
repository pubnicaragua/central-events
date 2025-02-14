import supabase from "../api/supabase"

export async function getPayments() {
    try {
        const { data, error } = await supabase.from("payment_config").select("*")

        if (error) throw error
        console.log("Configuracion de pagos:", data)
        return data
    } catch (error) {
        console.log("Error al obtener datos de pago", error)
        throw error
    }
}

export async function getEventPayment(eventId) {
    try {
        // 🔹 Step 1: Fetch `location_id` from `event_configs`
        const { data: configData, error: configError } = await supabase
            .from("event_configs")
            .select("pay_config_id")
            .eq("event_id", eventId)
            .maybeSingle(); // ✅ Use maybeSingle() to avoid error
        console.log(configData)
        if (configError) throw configError;
        if (!configData?.pay_config_id) return null; // No location assigned

        // 🔹 Step 2: Fetch location data using `pay_config_id`
        const { data: paymentData, error: paymentError } = await supabase
            .from("payment_config")
            .select("*")
            .eq("id", configData.pay_config_id)
            .maybeSingle(); // ✅ Use maybeSingle() here too


        if (paymentError) throw paymentError;

        return paymentData;
    } catch (error) {
        console.error("Error fetching payment data:", error);
        throw error;
    }
}

export async function getPaymentById(id) {
    try {
        const { data, error } = await supabase.from("payment_config").select("*").eq("id", id).single()

        if (error) throw error
        return data
    } catch (error) {
        console.error("Error fetching payment config:", error)
        throw error
    }
}

export async function updatePaymentConfig(eventId, paymentId, paymentData) {
    try {
        console.log("Actualizando configuración de pago para el evento ID:", eventId);
        console.log("Datos enviados:", paymentData);

        let newPaymentId = paymentId;

        if (!paymentId) {
            console.warn("No se encontró un ID de configuración de pago. Creando una nueva...");

            // Convertir waiting_time a número para evitar errores
            const parsedWaitingTime = parseInt(paymentData.waiting_time, 10) || 15;

            // Insertar nueva configuración de pago
            const { data, error } = await supabase
                .from("payment_config")
                .insert([
                    {
                        pre_pay_msg: paymentData.pre_pay_msg || "",
                        post_pay_msg: paymentData.post_pay_msg || "",
                        waiting_time: parsedWaitingTime,
                    },
                ])
                .select();

            if (error) throw error;
            console.log("Configuración de pago creada:", data[0]);

            newPaymentId = data[0].id; // Guardamos el nuevo ID de pago
        } else {
            // Convertir waiting_time a número para evitar errores
            const parsedWaitingTime = parseInt(paymentData.waiting_time, 10) || 15;

            // Actualizar configuración de pago existente
            const { data, error } = await supabase
                .from("payment_config")
                .update({
                    pre_pay_msg: paymentData.pre_pay_msg || "",
                    post_pay_msg: paymentData.post_pay_msg || "",
                    waiting_time: parsedWaitingTime,
                })
                .eq("id", paymentId)
                .select();

            if (error) throw error;
            console.log("Configuración de pago actualizada:", data[0]);
        }

        // **Actualizar event_configs con el nuevo pay_config_id si no lo tiene**
        const { data: eventConfigData, error: eventConfigError } = await supabase
            .from("event_configs")
            .select("id, pay_config_id")
            .eq("event_id", eventId)
            .maybeSingle();

        if (eventConfigError) throw eventConfigError;

        if (eventConfigData) {
            if (!eventConfigData.pay_config_id) {
                console.warn("Actualizando event_configs con el nuevo pay_config_id...");

                const { error: updateEventConfigError } = await supabase
                    .from("event_configs")
                    .update({ pay_config_id: newPaymentId })
                    .eq("id", eventConfigData.id);

                if (updateEventConfigError) throw updateEventConfigError;

                console.log("event_configs actualizado correctamente con pay_config_id:", newPaymentId);
            }
        } else {
            console.warn("No se encontró configuración de evento para este eventId.");
        }

        return { id: newPaymentId };
    } catch (error) {
        console.error("Error actualizando o creando configuración de pago:", error);
        throw error;
    }
}



