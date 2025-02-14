import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getNotifications, updateNotificationsConfig } from "../../utils/notificationsUtils";

export function EmailSettingsForm({ eventId }) {
  const [emailConfig, setEmailConfig] = useState({
    support_email: "",
    message: "",
    order_notifications: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNotifications() {
      if (!eventId) {
        setError("No se encontró el ID del evento.");
        setLoading(false);
        return;
      }

      try {
        const notificationsData = await getNotifications(eventId);

        setEmailConfig({
          support_email: notificationsData.support_email || "",
          message: notificationsData.message || "",
          order_notifications: notificationsData.order_notifications ?? false,
        });
      } catch (error) {
        setError("No se pudo cargar la configuración de notificaciones.", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setEmailConfig((prevData) => ({
      ...prevData,
      order_notifications: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await updateNotificationsConfig(eventId, emailConfig);
      if (success) {
        alert("Configuración de notificaciones guardada correctamente!");
      } else {
        alert("Error al guardar la configuración de notificaciones.");
      }
    } catch (error) {
      alert("Error al actualizar la configuración de notificaciones.", error);
    }
  };

  if (loading) return <div>Cargando configuración de notificaciones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de correo electrónico y notificaciones</CardTitle>
        <CardDescription>
          Personaliza la configuración de correo electrónico y notificaciones para este evento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="support_email">Correo electrónico de soporte</Label>
            <Input
              id="support_email"
              name="support_email"
              type="email"
              value={emailConfig.support_email}
              onChange={handleInputChange}
              placeholder="soporte@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje de pie de página de correo electrónico</Label>
            <Textarea
              id="message"
              name="message"
              value={emailConfig.message}
              onChange={handleInputChange}
              placeholder="Este mensaje se incluirá en el pie de página..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Configuración de las notificaciones</h3>
            <div className="flex items-center space-x-2">
              <Switch id="order_notifications" checked={emailConfig.order_notifications} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="order_notifications">Notificar al organizador de nuevos pedidos</Label>
            </div>
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

EmailSettingsForm.propTypes = {
  eventId: PropTypes.string.isRequired,
};
