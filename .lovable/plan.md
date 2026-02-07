

# 🦷 DentalClinic - Sistema de Gestión de Clínica Dental

## Visión General
Un sistema moderno y completo para gestión de clínicas dentales con odontograma interactivo como característica principal. Interfaz en español (con soporte para inglés), diseño contemporáneo y elegante, totalmente responsive con soporte para modo oscuro.

---

## Fase 1: Fundamentos del Sistema

### 1.1 Configuración del Proyecto
- Configurar react-i18next con español como idioma predeterminado e inglés secundario
- Crear archivos de traducción organizados por módulo
- Configurar Axios con interceptores para autenticación y refresh de tokens
- Implementar sistema de mock API que simule todas las respuestas del backend .NET

### 1.2 Sistema de Autenticación
- Pantalla de login centrada con branding "Clínica Dental"
- AuthContext para manejo de tokens en memoria (nunca localStorage)
- Interceptor de Axios para:
  - Agregar Bearer token a cada request
  - Detectar 401 y auto-refresh del token
  - Tracking de inactividad (logout automático a 60 min)
  - Diálogo de advertencia a los 55 minutos
- Protección de rutas basada en roles

### 1.3 Layout Principal
- **Sidebar colapsible** (240px expandido → 64px colapsado → menú hamburguesa en móvil)
  - Navegación con íconos Lucide
  - Indicador visual de ruta activa
  - Items filtrados por rol del usuario
- **Top Bar**:
  - Toggle de modo oscuro (Sol/Luna)
  - Selector de idioma (🇪🇸/🇺🇸)
  - Nombre de usuario, badge de rol, botón logout
- **Tema visual**: Colores médicos profesionales con toque moderno, bordes redondeados, sombras sutiles

---

## Fase 2: Odontograma Interactivo (Característica Principal)

### 2.1 Componente SVG de Dientes
- SVG interactivo semi-realista mostrando los 32 dientes (adulto) o 20 dientes (pediátrico)
- Disposición anatómica correcta:
  ```
       Maxilar Superior
  18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
  ─────────────────────────────────────────────────
  48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
       Mandíbula Inferior
  ```
- Cada diente renderizado con formas estilizadas según tipo (molar, premolar, canino, incisivo)
- 5 superficies clicables por diente con códigos de color por condición:
  - Sano (blanco), Cariado (rojo), Obturado (azul), Ausente (gris punteado), etc.
- Indicadores visuales: X para extraído, línea punteada para ausente
- Números de diente visibles, tooltips al hover

### 2.2 Panel de Detalles del Diente
- Panel lateral que aparece al seleccionar un diente
- Muestra: número, condición actual, superficies
- Dropdown para cambiar condición del diente
- Lista de superficies con edición de condición por superficie
- Botón "Agregar Tratamiento"
- Historial de tratamientos realizados en ese diente

### 2.3 Gestión de Odontogramas
- Vista de historial de odontogramas por paciente
- Selector dropdown para ver odontogramas anteriores
- Botón "Nuevo Odontograma"
- Toggle Adulto/Pediátrico
- Opción de impresión

### 2.4 Responsive del Odontograma
- Scroll horizontal con indicadores visuales en tablet
- Pinch-to-zoom en móvil
- Panel de detalles como modal en pantallas pequeñas

---

## Fase 3: Gestión de Pacientes

### 3.1 Lista de Pacientes
- Búsqueda por nombre o número de identidad
- Tabla con columnas: Nombre, Identidad, Teléfono, Email, Ciudad, Acciones
- Paginación y ordenamiento
- Acciones: Ver, Editar, Eliminar (solo Admin)
- Vista de tarjetas en móvil

### 3.2 Detalle del Paciente
- Tarjeta de encabezado con foto, nombre, edad, género
- Sistema de tabs:
  - **Datos Personales**: Información organizada en secciones
  - **Historial Dental**: Lista de odontogramas con acceso directo
  - **Citas**: Historial y próximas citas del paciente
  - **Historial Médico**: Alergias, condiciones, medicamentos

### 3.3 Formulario de Paciente
- Organizado en secciones colapsables:
  - Información Personal
  - Contacto
  - Información Laboral
  - Contacto de Emergencia
  - Información Médica
- Validación con Zod (campos requeridos marcados)
- Diseño de 2 columnas en desktop, 1 columna en móvil

---

## Fase 4: Gestión de Citas

### 4.1 Vista de Calendario
- Calendario semanal con slots de 8:00 AM - 6:00 PM
- Bloques de citas coloreados por estado
- Filtro por doctor
- Click en slot vacío → crear cita
- Click en cita → ver/editar detalles
- Vista de 3 días en tablet, lista diaria en móvil

### 4.2 Vista de Lista
- Tabla con: Fecha/Hora, Paciente, Doctor, Motivo, Estado, Acciones
- Badges de estado coloreados
- Filtros: rango de fechas, doctor, estado

### 4.3 Formulario y Gestión de Citas
- Búsqueda de paciente en dropdown
- Selección de doctor
- Date/Time pickers con formato Honduras
- Botones rápidos para cambiar estado (Confirmar, Iniciar, Completar, Cancelar)
- Validación de conflictos de horario

---

## Fase 5: Dashboard

### 5.1 Tarjetas de Estadísticas
- Citas Hoy (contador)
- Pacientes Totales
- Citas Pendientes (Programadas + Confirmadas)
- Tratamientos del Mes

### 5.2 Gráficos con Recharts
- **Gráfico de barras**: Citas por día (últimos 7 días)
- **Gráfico de pastel**: Tratamientos por categoría
- Adaptación automática a modo oscuro

### 5.3 Próximas Citas
- Tabla con las 5 próximas citas
- Nombre del paciente, doctor, hora, badge de estado

---

## Fase 6: Módulos Administrativos

### 6.1 Gestión de Doctores (Solo Admin)
- CRUD completo de doctores
- Campos: Nombre, Colegiado, Especialidad, Teléfono, Email
- Activar/Desactivar doctores

### 6.2 Catálogo de Tratamientos (Solo Admin)
- CRUD de tratamientos
- Campos: Código, Nombre, Descripción, Categoría, Precio, Duración
- Badges de categoría coloreados

### 6.3 Gestión de Usuarios (Solo Admin)
- Lista de usuarios con roles como badges
- Crear nuevos usuarios (no hay auto-registro)
- Cambiar roles (modal multi-select)
- Activar/Desactivar usuarios

---

## Fase 7: Funcionalidades Transversales

### 7.1 Modo Oscuro
- Toggle en top bar con animación suave
- Colores adaptados para sidebar, cards, tablas, formularios
- Odontograma adaptado (contornos de dientes ajustados)
- Gráficos con colores para fondo oscuro
- Preferencia persistida en contexto React

### 7.2 Internacionalización
- Español como idioma predeterminado
- Toggle de idioma en top bar
- Todos los textos desde archivos de traducción
- Formatos de fecha localizados (dd/MM/yyyy HH:mm)
- Números de teléfono en formato Honduras

### 7.3 Experiencia de Usuario
- Loading states con skeletons
- Toasts para todas las acciones (éxito, error, info)
- Estados vacíos amigables con iconos
- Validación inline en formularios
- Diálogos de confirmación para acciones destructivas

### 7.4 Sistema de Mocks
- Mock API layer completo simulando respuestas del backend .NET
- Datos de ejemplo realistas en español
- Estructura lista para conectar al backend real cuando esté disponible

---

## Resumen Técnico

| Aspecto | Implementación |
|---------|---------------|
| **Framework** | React 18 + TypeScript |
| **Estilos** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router v6 |
| **HTTP** | Axios con interceptores |
| **Forms** | React Hook Form + Zod |
| **i18n** | react-i18next (ES/EN) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Dates** | date-fns (locale español) |
| **Estado** | React Context (auth, theme, language) |

---

## Resultado Final

Una aplicación web moderna, profesional y completamente funcional para gestión de clínicas dentales, con énfasis especial en el odontograma interactivo, preparada para conectarse al backend .NET cuando esté disponible.

