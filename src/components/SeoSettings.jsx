"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";

function SeoSettings({ eventConfig, eventId, supabase, setEventConfig }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [keywords, setKeywords] = useState("")
    const [allowIndex, setAllowIndex] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (eventConfig?.seo_config) {
            const seoConfig = eventConfig.seo_config
            setTitle(seoConfig.title || "")
            setDescription(seoConfig.description || "")
            setKeywords(seoConfig.tags || "")
            setAllowIndex(seoConfig.allow_index !== false)
        }
    }, [eventConfig])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)

            let seoConfigId = eventConfig?.seo_config_id

            // Si no existe una configuración SEO, crear una nueva
            if (!seoConfigId) {
                const { data: newSeoConfig, error: createError } = await supabase
                    .from("seo_config")
                    .insert({
                        title,
                        description,
                        tags: keywords,
                        allow_index: allowIndex,
                    })
                    .select()
                    .single()

                if (createError) throw createError
                seoConfigId = newSeoConfig.id
            } else {
                // Actualizar la configuración SEO existente
                const { error: updateError } = await supabase
                    .from("seo_config")
                    .update({
                        title,
                        description,
                        tags: keywords,
                        allow_index: allowIndex,
                    })
                    .eq("id", seoConfigId)

                if (updateError) throw updateError
            }

            // Actualizar o crear la configuración del evento
            if (eventConfig.id) {
                const { error: configError } = await supabase
                    .from("event_configs")
                    .update({ seo_config_id: seoConfigId })
                    .eq("id", eventConfig.id)

                if (configError) throw configError
            } else {
                const { error: configError } = await supabase
                    .from("event_configs")
                    .insert({ event_id: Number.parseInt(eventId), seo_config_id: seoConfigId })

                if (configError) throw configError
            }

            // Actualizar el estado local
            setEventConfig({
                ...eventConfig,
                seo_config_id: seoConfigId,
                seo_config: {
                    id: seoConfigId,
                    title,
                    description,
                    tags: keywords,
                    allow_index: allowIndex,
                },
            })

            toast.success("Configuración SEO actualizada")
        } catch (error) {
            console.error("Error updating SEO config:", error)
            toast.error("Error al guardar la configuración SEO")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium">Configuración SEO</h3>
                <p className="text-sm text-gray-500">Personaliza la configuración SEO para este evento.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="seo-title" className="block text-sm font-medium mb-1">
                            Título SEO
                        </label>
                        <input
                            id="seo-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="seo-description" className="block text-sm font-medium mb-1">
                            Descripción SEO
                        </label>
                        <textarea
                            id="seo-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label htmlFor="keywords" className="block text-sm font-medium mb-1">
                            Palabras clave (separadas por coma)
                        </label>
                        <input
                            id="keywords"
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="evento, conferencia, taller"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="allow-index"
                            type="checkbox"
                            checked={allowIndex}
                            onChange={(e) => setAllowIndex(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="allow-index" className="ml-2 text-sm">
                            Permitir indexación
                        </label>
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

export default SeoSettings


SeoSettings.propTypes = {
    eventConfig: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
    setEventConfig: PropTypes.func.isRequired,
};
