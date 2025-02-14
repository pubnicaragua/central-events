import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getEventPayment, updatePaymentConfig } from "../../utils/paymentActions";

export function PaymentSettingsForm({ eventId }) {
  const [paymentData, setPaymentData] = useState({
    pre_pay_msg: "",
    post_pay_msg: "",
    waiting_time: 15,
  });

  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPaymentData() {
      if (!eventId) {
        console.error("No se encontró eventId.");
        setLoading(false);
        return;
      }

      try {
        const paymentConfig = await getEventPayment(eventId);

        if (paymentConfig) {
          setPaymentId(paymentConfig.id);
          setPaymentData({
            pre_pay_msg: paymentConfig.pre_pay_msg || "",
            post_pay_msg: paymentConfig.post_pay_msg || "",
            waiting_time: paymentConfig.waiting_time || 15,
          });
        } else {
          console.warn("No hay configuración de pago asignada a este evento.");
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setError("No se pudo cargar la configuración de pago.");
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentData();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando datos de pago:", paymentData);

      const updatedConfig = await updatePaymentConfig(eventId, paymentId, paymentData);

      if (updatedConfig?.id) {
        setPaymentId(updatedConfig.id);
        alert("Configuración de pago actualizada correctamente!");
      } else {
        alert("Error: No se pudo guardar la configuración de pago.");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error al actualizar la configuración de pago");
    }
  };

  if (loading) return <div>Cargando configuración de pago...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de pago</CardTitle>
        <CardDescription>Personaliza la página de pago del evento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pre_pay_msg">Mensaje previo al pago</Label>
            <Textarea
              id="pre_pay_msg"
              name="pre_pay_msg"
              value={paymentData.pre_pay_msg}
              onChange={handleInputChange}
              placeholder="Mensaje antes de pagar..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post_pay_msg">Mensaje posterior al pago</Label>
            <Textarea
              id="post_pay_msg"
              name="post_pay_msg"
              value={paymentData.post_pay_msg}
              onChange={handleInputChange}
              placeholder="Mensaje después del pago..."
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waiting_time">Tiempo de espera del pedido</Label>
            <Input
              id="waiting_time"
              name="waiting_time"
              type="number"
              value={paymentData.waiting_time}
              onChange={handleInputChange}
              placeholder="15"
            />
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
