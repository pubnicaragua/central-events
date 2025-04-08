"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types"

function DressCode({ eventConfig, eventId, supabase, setEventConfig }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [dressType, setDressType] = useState("")
    const [allowedAccessories, setAllowedAccessories] = useState("")
    const [restrictedAccessories, setRestrictedAccessories] = useState("")
    const [footwear, setFootwear] = useState("")
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)

    // Cargar datos de dress code cuando cambia eventConfig
    useEffect(() => {
        if (eventConfig?.dress_code) {
            const dressCode = eventConfig.dress_code
            setName(dressCode.name || "")
            setDescription(dressCode.description || "")
            setDressType(dressCode.dress_type || "")
            setAllowedAccessories(dressCode.allowed_accessories || "")
            setRestrictedAccessories(dressCode.restricted_accessories || "")
            setFootwear(dressCode.footwear || "")
            setNotes(dressCode.notes || "")
        }
    }, [eventConfig])

    // Cargar datos de dress code si no están en eventConfig pero tenemos dress_code_id
    useEffect(() => {
        const fetchDressCodeData = async () => {
            // Si ya tenemos los datos de dress code en eventConfig, no necesitamos hacer la consulta
            if (eventConfig?.dress_code) return

            // Si tenemos un dress_code_id pero no tenemos los datos completos
            if (eventConfig?.dress_code_id && !eventConfig?.dress_code) {
                try {
                    setLoading(true)
                    const { data, error } = await supabase
                        .from("dress_code")
                        .select("*")
                        .eq("id", eventConfig.dress_code_id)
                        .single()

                    if (error) {
                        console.error("Error fetching dress code:", error)
                        return
                    }

                    if (data) {
                        setName(data.name || "")
                        setDescription(data.description || "")
                        setDressType(data.dress_type || "")
                        setAllowedAccessories(data.allowed_accessories || "")
                        setRestrictedAccessories(data.restricted_accessories || "")
                        setFootwear(data.footwear || "")
                        setNotes(data.notes || "")

                        // Actualizar el estado local de eventConfig
                        setEventConfig({
                            ...eventConfig,
                            dress_code: data,
                        })
                    }
                } catch (error) {
                    console.error("Error in fetchDressCodeData:", error)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchDressCodeData()
    }, [eventConfig, supabase, setEventConfig])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)

            let dressCodeId = eventConfig?.dress_code_id

            // Preparar los datos para guardar
            const dressCodeData = {
                name,
                description,
                dress_type: dressType,
                allowed_accessories: allowedAccessories,
                restricted_accessories: restrictedAccessories,
                footwear,
                notes,
                event_id: Number.parseInt(eventId),
            }

            // Si no existe un dress code, crear uno nuevo
            if (!dressCodeId) {
                const { data: newDressCode, error: createError } = await supabase
                    .from("dress_code")
                    .insert(dressCodeData)
                    .select()
                    .single()

                if (createError) throw createError
                dressCodeId = newDressCode.id
            } else {
                // Actualizar el dress code existente
                const { error: updateError } = await supabase.from("dress_code").update(dressCodeData).eq("id", dressCodeId)

                if (updateError) throw updateError
            }

            // Actualizar o crear la configuración del evento
            if (eventConfig.id) {
                // CORREGIDO: Si eventConfig.id existe, debemos ACTUALIZAR, no insertar
                const { error: configError } = await supabase
                    .from("event_configs")
                    .update({ dress_code_id: dressCodeId })
                    .eq("id", eventConfig.id)

                if (configError) throw configError
            } else {
                // Si no existe eventConfig, crear uno nuevo
                const { error: configError } = await supabase
                    .from("event_configs")
                    .insert({ event_id: Number.parseInt(eventId), dress_code_id: dressCodeId })

                if (configError) throw configError
            }

            // Actualizar el estado local
            setEventConfig({
                ...eventConfig,
                dress_code_id: dressCodeId,
                dress_code: {
                    id: dressCodeId,
                    ...dressCodeData,
                },
            })

            toast.success("Código de vestimenta guardado correctamente")
        } catch (error) {
            console.error("Error saving dress code:", error)
            toast.error("Error al guardar el código de vestimenta")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="bg-white rounded-lg shadow p-6">Cargando datos del código de vestimenta...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium">Código de vestimenta</h3>
                <p className="text-sm text-gray-500">Configuración del código de vestimenta del evento</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Nombre del código de vestimenta
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Ej: Formal, Casual elegante, etc."
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                            placeholder="Descripción general del código de vestimenta"
                        />
                    </div>

                    <div>
                        <label htmlFor="dressType" className="block text-sm font-medium mb-1">
                            Tipo de prenda
                        </label>
                        <input
                            id="dressType"
                            type="text"
                            value={dressType}
                            onChange={(e) => setDressType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Ej: Traje, Vestido de cóctel, etc."
                        />
                    </div>

                    <div>
                        <label htmlFor="allowedAccessories" className="block text-sm font-medium mb-1">
                            Accesorios permitidos
                        </label>
                        <input
                            id="allowedAccessories"
                            type="text"
                            value={allowedAccessories}
                            onChange={(e) => setAllowedAccessories(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Ej: Corbata, joyas discretas, etc."
                        />
                    </div>

                    <div>
                        <label htmlFor="restrictedAccessories" className="block text-sm font-medium mb-1">
                            Accesorios restringidos
                        </label>
                        <input
                            id="restrictedAccessories"
                            type="text"
                            value={restrictedAccessories}
                            onChange={(e) => setRestrictedAccessories(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Ej: Gorras, ropa deportiva, etc."
                        />
                    </div>

                    <div>
                        <label htmlFor="footwear" className="block text-sm font-medium mb-1">
                            Calzado
                        </label>
                        <input
                            id="footwear"
                            type="text"
                            value={footwear}
                            onChange={(e) => setFootwear(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Ej: Zapatos formales, tacones, etc."
                        />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">
                            Observaciones
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                            placeholder="Información adicional o excepciones"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default DressCode

DressCode.propTypes = {
    eventConfig: PropTypes.object.isRequired,
    eventId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    supabase: PropTypes.object.isRequired,
    setEventConfig: PropTypes.func.isRequired,
}

