"use client";

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getEventSeo, updateSeoConfig } from "../../utils/seoActions";
//import supabase from "../../api/supabase";

export function SeoSettingsForm({ eventId }) {
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    tags: [],
    allow_index: true,
  });

  const [seoId, setSeoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSeoData() {
      if (!eventId) {
        setError("No se encontró el ID del evento.");
        setLoading(false);
        return;
      }

      try {
        const seoConfig = await getEventSeo(eventId);

        setSeoId(seoConfig.id || null);
        setSeoData({
          title: seoConfig.title || "",
          description: seoConfig.description || "",
          tags: JSON.parse(seoConfig.tags || "[]"), // ✅ Convertir `tags` a array
          allow_index: seoConfig.allow_index ?? true,
        });
      } catch (error) {
        setError("No se pudo cargar la configuración SEO.", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSeoData();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(",").map(tag => tag.trim()); // ✅ Convertir string en array
    setSeoData((prevData) => ({ ...prevData, tags: tagsArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedConfig = await updateSeoConfig(eventId, seoId, { ...seoData, tags: JSON.stringify(seoData.tags) });

      if (updatedConfig?.id) {
        setSeoId(updatedConfig.id);
        alert("Configuración SEO guardada correctamente!");
      } else {
        alert("Error al guardar la configuración SEO.");
      }
    } catch (error) {
      alert("Error al actualizar la configuración SEO.", error);
    }
  };

  if (loading) return <div>Cargando configuración SEO...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración SEO</CardTitle>
        <CardDescription>Personaliza la configuración SEO para este evento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <Label htmlFor="title">Título SEO</Label>
          <Input id="title" name="title" value={seoData.title} onChange={handleInputChange} required />

          <Label htmlFor="description">Descripción SEO</Label>
          <Textarea id="description" name="description" value={seoData.description} onChange={handleInputChange} required />

          <Label htmlFor="tags">Palabras clave (separadas por coma)</Label>
          <Input id="tags" name="tags" value={seoData.tags.join(", ")} onChange={handleTagsChange} />

          <div className="flex items-center space-x-2">
            <Switch id="allow_index" name="allow_index" checked={seoData.allow_index} onCheckedChange={(checked) => setSeoData({ ...seoData, allow_index: checked })} />
            <Label htmlFor="allow_index">Permitir indexación</Label>
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

SeoSettingsForm.propTypes = {
  eventId: PropTypes.string.isRequired,
};
