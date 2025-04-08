# PassK - Plataforma de Gestión de Eventos


## Notas de Actualización - Abril 2025

#### Correos Electrónicos:
- Corrección en el envío de correos desde la app.
- Inclusión del código QR en los correos enviados.

#### Módulo de Mapa:
- Persistencia de datos en el mapa tras recargas o cambios de vista.

#### Página de Invitado – Mejoras:
- Campo editable para código de vestimenta.

### Actualización durante la jornada de 24 horas continuas

#### Seguridad y Control de Acceso:
- Redirección automática a login para usuarios no autenticados.
- Protección de rutas según rol de usuario (admin, empleado, organizador, etc.).

#### Navegación y Menús:
- Separación clara entre el menú de administración y el de gestión de eventos.

#### Dashboard:
- Nuevas estadísticas y gráficos en tiempo real.

#### Módulo de Amenidades:
- Posibilidad de asignar empleados responsables a cada amenidad.

#### Módulo de Asistentes:
- Corrección del estado de los asistentes (confirmado, pendiente, cancelado).

#### Página de Inicio – Personalización Visual Completa:
- Cambio de colores de fuente.
- Estilos personalizados para cards.
- Imagen de fondo configurable.
- Vista previa en tiempo real de los colores del código QR.

#### Página de Invitado – Rediseño Total:
- Inclusión de código de vestimenta.
- Enlace directo a mapa en Google Maps.
- Opción para guardar evento en calendario.

### Actualización Final – 7/4/2025

#### Estado de pruebas:
- COMPLETADO: Verificación correcta del código QR con estilos personalizados.
- COMPLETADO: Validación de asignación de empleados a amenidades.
- COMPLETADO: Revisión de configuración visual de la página del evento.

#### Roles y Permisos:

##### Empleados:
- Solo pueden acceder al check-in.
- Solo pueden ver sus amenidades asignadas.

##### Organizadores:
- No pueden crear nuevos eventos.
- No deben acceder a la sección "Empezando".
- Solo pueden ver su evento asignado.
- No pueden agregar entradas.
- No pueden agregar amenidades ni asistentes (solo visualización).
- Sí pueden crear rifas y ajustar su evento.

#### Otros ajustes:
- Se cambió el logo por el oficial de PassK.

## Características principales

### Gestión de eventos
- Creación y configuración de eventos
- Gestión de tickets y amenidades
- Control de asistentes

### Check-in y control de acceso
- Escaneo de códigos QR
- Verificación de amenidades
- Registro de asistencia

### Personalización
- Diseño personalizado de la página del evento
- Códigos QR con estilos personalizados
- Opciones de marca y diseño flexibles

## Tecnologías utilizadas
- React
- Vite
- Supabase
- Tailwind CSS


