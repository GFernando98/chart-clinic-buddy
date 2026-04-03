# SmileOS – Dental Clinic Management SaaS

Sistema de gestión integral para clínicas dentales multi-tenant. Cada clínica opera con su propia base de datos SQL Server aislada.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 + shadcn/ui |
| Estado servidor | TanStack React Query |
| Formularios | React Hook Form + Zod |
| Routing | React Router DOM 6 |
| i18n | react-i18next (ES / EN) |
| HTTP | Axios (interceptors JWT) |
| Gráficas | Recharts |
| PDF | pdfmake |
| Sesión | js-cookie |

## Módulos

### Pacientes
- CRUD completo con historial médico, alergias y contacto de emergencia
- Foto de perfil y búsqueda por nombre/cédula
- **Endpoints:** `GET/POST /api/Patients`, `GET/PUT/DELETE /api/Patients/{id}`

### Doctores
- Gestión de especialistas con número de licencia
- Vinculación opcional con usuario del sistema
- **Endpoints:** `GET/POST /api/Doctors`, `GET/PUT/DELETE /api/Doctors/{id}`

### Citas
- Vista calendario y lista con estados (Programada → Confirmada → En Progreso → Completada/Cancelada/No Show)
- Confirmación pública por token sin autenticación
- **Endpoints:** `GET/POST /api/Appointments`, `PATCH /api/Appointments/{id}/status`
- **Público:** `GET /api/appointments/confirm?token=...&action=confirm|cancel`

### Odontograma
- Carta dental interactiva (notación FDI, 32 dientes permanentes)
- Condiciones por superficie (Mesial, Distal, Bucal, Lingual, Oclusal, Incisal)
- Tratamientos por diente y tratamientos globales
- Asociación de productos al odontograma
- **Endpoints:** `GET/POST /api/Odontograms`, `POST /api/Odontograms/{id}/teeth/{toothId}/treatments`

### Facturación
- Cumplimiento fiscal hondureño (CAI/SAR)
- Generación de PDF con datos fiscales
- Registro de pagos parciales/totales con múltiples métodos
- **Endpoints:** `GET/POST /api/Invoices`, `POST /api/Invoices/{id}/payments`

### Productos e Inventario
- Catálogo de productos con categorías y control de stock
- Movimientos de entrada/salida con trazabilidad
- Alertas de stock mínimo
- **Endpoints:** `GET/POST /api/Products`, `GET/POST /api/Inventory/movements`

### Tratamientos
- Catálogo con categorías, código, precio y duración estimada
- Marca de tratamiento global (no asociado a diente específico)
- **Endpoints:** `GET/POST /api/Treatments`, `GET /api/TreatmentCategories`

### Dashboard
- KPIs: pacientes, citas del día, ingresos del mes
- Gráficas de ingresos, citas por estado, tratamientos populares
- Resumen de ventas de productos y movimientos de inventario
- **Endpoints:** `GET /api/Dashboard/summary`, `GET /api/Dashboard/product-sales`, `GET /api/Dashboard/inventory-summary`

### Configuración
- Información de la clínica (nombre, dirección, logo)
- Información fiscal (CAI, rangos de facturación)
- Categorías de tratamientos y productos
- **Endpoints:** `GET/PUT /api/ClinicInformation`, `GET/POST /api/TaxInformation`

### Panel Maestro (`/master`)
- Login independiente: `POST /api/master/login`
- CRUD de tenants (clínicas): `GET/POST /api/master/tenants`
- Toggle de estado: `PATCH /api/master/tenants/{id}/toggle-status`
- Clínicas públicas: `GET /api/Master/tenants/public`
- Token JWT almacenado solo en memoria (seguridad)

## Autenticación

1. Se cargan las clínicas disponibles: `GET /api/Master/tenants/public`
2. El usuario selecciona clínica, ingresa credenciales
3. Login: `POST /api/Auth/login` con `{ userName, password, tenantId }`
4. Se recibe `accessToken` + `refreshToken` (almacenados en cookies httpOnly-like)
5. Refresh automático vía interceptor Axios en respuestas 401
6. Todas las peticiones incluyen `Authorization: Bearer {token}`

## Estructura del Proyecto

```
src/
├── assets/            # Imágenes y recursos estáticos
├── components/
│   ├── layout/        # MainLayout, AppSidebar, TopBar
│   ├── master/        # MasterLayout
│   ├── odontogram/    # DentalChart, ToothSVG, dialogs
│   └── ui/            # shadcn/ui components
├── contexts/          # AuthContext, MasterAuthContext, ThemeContext
├── hooks/             # Custom hooks (usePatients, useDoctors, etc.)
├── i18n/              # Traducciones ES/EN
├── pages/             # Páginas por módulo
├── services/          # apiClient.ts + servicios por entidad
├── types/             # TypeScript interfaces y enums
└── utils/             # Generación PDF, impresión
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del API | `https://clinic-api.syscore.app` |

## Desarrollo Local

```bash
npm install
npm run dev
```

## Deploy

El proyecto se despliega desde [Lovable](https://lovable.dev) → Share → Publish.

---

© SysCore – Distribuidor autorizado de SmileOS
