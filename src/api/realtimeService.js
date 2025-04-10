import supabase from "../api/supabase"

// Función para suscribirse a cambios en una tabla
export function subscribeToTable(tableName, callback) {
    return supabase
        .channel(`public:${tableName}`)
        .on("postgres_changes", { event: "*", schema: "public", table: tableName }, (payload) => {
            callback(payload)
        })
        .subscribe()
}

// Función para cancelar una suscripción
export function unsubscribeFromChannel(channel) {
    if (channel) {
        supabase.removeChannel(channel)
    }
}
