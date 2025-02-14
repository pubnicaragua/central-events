import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getOtherConfig, updateOtherConfig } from "../../utils/otherConfigUtils";

export function OtherSettingsForm({ eventId }) {
  const [configData, setConfigData] = useState({
    include_tax: true,
    show_home: true,
  });

  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchConfigData() {
      if (!eventId) {
        setError("No se encontró el ID del evento.");
        setLoading(false);
        return;
      }

      try {
        const config = await getOtherConfig(eventId);
        setConfigId(config.id || null);
        setConfigData({
          include_tax: config.include_tax ?? true,
          show_home: config.show_home ?? true,
        });
      } catch (error) {
        setError("No se pudo cargar la configuración.", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfigData();
  }, [eventId]);

  const handleInputChange = (name, value) => {
    setConfigData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedConfig = await updateOtherConfig(eventId, configData, configId);

      if (updatedConfig?.id) {
        setConfigId(updatedConfig.id);
        alert("Configuración guardada correctamente!");
      } else {
        alert("Error al guardar la configuración.");
      }
    } catch (error) {
      alert("Error al actualizar la configuración.", error);
    }
  };

  if (loading) return <div>Cargando configuración...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otras configuraciones</CardTitle>
        <CardDescription>Personaliza las configuraciones diversas para este evento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch checked={configData.include_tax} onCheckedChange={(checked) => handleInputChange("include_tax", checked)} />
              <Label htmlFor="include_tax">Incluir impuestos en el precio</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch checked={configData.show_home} onCheckedChange={(checked) => handleInputChange("show_home", checked)} />
              <Label htmlFor="show_home">Mostrar página de inicio</Label>
            </div>
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

OtherSettingsForm.propTypes = {
  eventId: PropTypes.string.isRequired,
};
