import supabase from "../../../api/supabase"

// Obtener todos los módulos
export async function getAllModules() {
    const { data, error } = await supabase.from("modules").select("*").order("module_name")

    if (error) throw error
    return data
}

// Obtener un módulo específico
export async function getModule(moduleId) {
    const { data, error } = await supabase.from("modules").select("*").eq("id", moduleId).single()

    if (error) throw error
    return data
}

// Crear un nuevo módulo
export async function createModule(moduleData) {
    const { data, error } = await supabase.from("modules").insert(moduleData).select()

    if (error) throw error
    return data[0]
}

// Actualizar un módulo existente
export async function updateModule(moduleId, moduleData) {
    const { data, error } = await supabase.from("modules").update(moduleData).eq("id", moduleId).select()

    if (error) throw error
    return data[0]
}

// Eliminar un módulo
export async function deleteModule(moduleId) {
    // Primero eliminar los permisos asociados
    await supabase.from("modules_permission").delete().eq("module_id", moduleId)

    // Luego eliminar el módulo
    const { error } = await supabase.from("modules").delete().eq("id", moduleId)

    if (error) throw error
    return true
}

// Obtener permisos de módulos para un rol específico
export async function getModulePermissionsByRole(roleId) {
    const { data, error } = await supabase.from("modules_permission").select("module_id").eq("role_id", roleId)

    if (error) throw error
    return data.map((item) => item.module_id)
}

// Asignar permisos de módulos a un rol
export async function assignModulesToRole(roleId, moduleIds) {
    // Primero eliminar los permisos existentes
    await supabase.from("modules_permission").delete().eq("role_id", roleId)

    // Si no hay módulos para asignar, terminar
    if (!moduleIds || moduleIds.length === 0) {
        return []
    }

    // Crear los nuevos permisos
    const permissionsToInsert = moduleIds.map((moduleId) => ({
        role_id: roleId,
        module_id: moduleId,
    }))

    const { data, error } = await supabase.from("modules_permission").insert(permissionsToInsert).select()

    if (error) throw error
    return data
}
