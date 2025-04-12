import supabase from "../../../api/supabase"

/**
 * Elimina un usuario completamente aprovechando las eliminaciones en cascada
 * @param {string} authId - ID de autenticación del usuario
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteUserCompletely(authId) {
    try {
        // Eliminar directamente el usuario de auth.users
        // Las eliminaciones en cascada se encargarán de los registros relacionados
        const { error: authError } = await supabase.auth.admin.deleteUser(authId)

        if (authError) throw authError

        return { success: true, error: null }
    } catch (error) {
        console.error("Error al eliminar usuario:", error)
        return {
            success: false,
            error: error.message || "Error desconocido al eliminar usuario",
        }
    }
}
