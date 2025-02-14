import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import supabase from "../api/supabase"
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  //Estado para manejar errores
  const [error, setError] = useState('');

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple
    if (!formData.email || !formData.password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    // Limpia el error antes de intentar iniciar sesión
    setError('');

    try {
      // Usar Supabase para autenticar al usuario
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);  // Muestra el mensaje de error de Supabase
      } else {
        // Si la autenticación es exitosa, redirige al usuario
        navigate('/');  // Cambia esta URL si tienes otro destino
      }
    } catch (error) {
      setError('Ocurrió un error, intenta nuevamente.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Ingrese su contraseña"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Iniciar Sesión
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Regístrate
        </a>
      </p>
    </div>
  )
}

