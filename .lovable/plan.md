

# Pagina de Citas - Vista de Lista y Calendario

## Resumen
Implementar una pagina de citas completa con dos modos de visualizacion: **Lista** (tabla con filtros) y **Calendario** (vista semanal interactiva). El usuario podra alternar entre ambas vistas con un toggle.

---

## Componentes a Crear

### 1. AppointmentsPage.tsx (Pagina principal)
- Header con titulo, subtitulo y boton "Nueva Cita"
- Toggle para alternar entre vista Lista/Calendario
- Filtros: Doctor, Estado, Rango de fechas
- Renderiza el componente de vista activa

### 2. AppointmentListView.tsx
- Tabla con columnas: Fecha/Hora, Paciente, Doctor, Motivo, Estado, Acciones
- Badges de estado coloreados segun especificacion
- Paginacion y ordenamiento
- Vista de tarjetas en movil
- Acciones rapidas: Ver detalles, Cambiar estado

### 3. AppointmentCalendarView.tsx
- Calendario semanal (Lunes a Domingo)
- Horario de 8:00 AM a 6:00 PM en slots de 30 minutos
- Navegacion: semana anterior/siguiente, ir a hoy
- Citas renderizadas como bloques coloreados por estado
- Click en slot vacio: abrir formulario de nueva cita
- Click en cita: abrir detalle/edicion
- Vista adaptativa: 7 dias en desktop, 3 dias en tablet, lista diaria en movil

### 4. AppointmentFormDialog.tsx
- Modal/Dialog para crear/editar citas
- Campos:
  - Paciente: dropdown con busqueda (usa mockPatients)
  - Doctor: dropdown (usa mockDoctors)
  - Fecha: DatePicker
  - Hora inicio/fin: Time selectors
  - Motivo: input texto
  - Notas: textarea opcional
- Validacion con Zod

### 5. AppointmentDetailDialog.tsx
- Modal mostrando detalles completos de la cita
- Informacion del paciente y doctor
- Botones de accion rapida para cambiar estado:
  - Confirmar (si esta Programada)
  - Iniciar (si esta Confirmada)
  - Completar (si esta En Progreso)
  - Cancelar (cualquier estado, pide motivo)
  - Marcar No Show
- Boton Editar que abre AppointmentFormDialog

---

## Estructura de Archivos

```text
src/pages/appointments/
  +-- index.ts                    (barrel export)
  +-- AppointmentsPage.tsx        (pagina principal)
  +-- components/
      +-- AppointmentListView.tsx
      +-- AppointmentCalendarView.tsx
      +-- AppointmentFormDialog.tsx
      +-- AppointmentDetailDialog.tsx
      +-- AppointmentStatusBadge.tsx
      +-- TimeSlot.tsx
```

---

## Colores de Estado (CSS Variables existentes)

| Estado | Color | Variable CSS |
|--------|-------|--------------|
| Scheduled (Programada) | Azul | --status-scheduled |
| Confirmed (Confirmada) | Verde | --status-confirmed |
| InProgress (En Progreso) | Amarillo | --status-inprogress |
| Completed (Completada) | Gris | --status-completed |
| Cancelled (Cancelada) | Rojo | --status-cancelled |
| NoShow | Naranja | --status-noshow |

---

## Vista del Calendario (Detalle Tecnico)

```text
            Semana del 3 al 9 de Febrero 2025
         [< Anterior]  [Hoy]  [Siguiente >]
+--------+--------+--------+--------+--------+--------+--------+
|   Lun  |   Mar  |   Mie  |   Jue  |   Vie  |   Sab  |   Dom  |
|   3    |   4    |   5    |   6    |   7    |   8    |   9    |
+--------+--------+--------+--------+--------+--------+--------+
| 8:00   |        | Juan P |        |        |        |        |
|        |        | Limpieza        |        |        |        |
+--------+--------+--------+--------+--------+--------+--------+
| 8:30   |        |        |        |        |        |        |
+--------+--------+--------+--------+--------+--------+--------+
| 9:00   | Maria G|        | Ana L  |        |        |        |
|        | Conducto       | Extrac.|        |        |        |
+--------+--------+--------+--------+--------+--------+--------+
...
```

- Cada bloque de cita muestra: nombre del paciente, motivo (truncado)
- Color de fondo segun estado
- Hover muestra tooltip con detalles
- Drag & drop para reagendar (opcional/futuro)

---

## Traducciones a Agregar

```json
{
  "appointments": {
    "subtitle": "Gestiona las citas de tus pacientes",
    "viewCalendar": "Calendario",
    "viewList": "Lista", 
    "thisWeek": "Esta Semana",
    "previousWeek": "Semana Anterior",
    "nextWeek": "Semana Siguiente",
    "goToToday": "Ir a Hoy",
    "allDoctors": "Todos los Doctores",
    "allStatuses": "Todos los Estados",
    "noAppointmentsToday": "No hay citas programadas para hoy",
    "noAppointmentsWeek": "No hay citas esta semana",
    "clickToCreate": "Haz clic en un horario para crear una cita",
    "appointmentCreated": "Cita Creada",
    "appointmentUpdated": "Cita Actualizada",
    "appointmentCancelled": "Cita Cancelada",
    "statusChanged": "Estado Actualizado",
    "confirmCancel": "Confirmar Cancelacion",
    "cancelReason": "Motivo de la cancelacion",
    "selectPatient": "Buscar paciente...",
    "selectDoctor": "Seleccionar doctor",
    "startTime": "Hora de Inicio",
    "endTime": "Hora de Fin",
    "reasonPlaceholder": "Ej: Limpieza dental, Revision general..."
  }
}
```

---

## Flujo de Usuario

1. **Ver citas en calendario**: Usuario ve la semana actual con todas las citas como bloques coloreados
2. **Cambiar a lista**: Click en toggle "Lista" para ver tabla filtrable
3. **Crear cita desde calendario**: Click en slot vacio abre formulario con fecha/hora prellenados
4. **Crear cita desde lista**: Click en "Nueva Cita" abre formulario vacio
5. **Ver detalles**: Click en cita abre panel de detalles
6. **Cambiar estado**: Desde el panel de detalles, usar botones de accion rapida
7. **Cancelar cita**: Requiere ingresar motivo de cancelacion
8. **Navegar semanas**: Flechas para ir a semana anterior/siguiente
9. **Filtrar por doctor**: Dropdown en header para filtrar citas

---

## Responsive

| Viewport | Calendario | Lista |
|----------|-----------|-------|
| Desktop (lg+) | 7 dias completos | Tabla completa |
| Tablet (md) | 3 dias con scroll | Tabla con scroll horizontal |
| Movil (sm) | Lista diaria (agenda) | Cards por cita |

---

## Integracion

- Actualizar `App.tsx` para usar `AppointmentsPage` en lugar del placeholder
- Agregar traducciones a `es.json` y `en.json`
- Usar datos de `mockAppointments`, `mockPatients`, `mockDoctors`

