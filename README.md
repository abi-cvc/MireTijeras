# MireTijeras

Plataforma web para salones de belleza que digitaliza la gestión de citas, reseñas, sugerencias y convenios empresariales.

## Características

### Para clientes
- **Reserva de citas** — Calendario semanal con franjas horarias configuradas por el admin. Selección de servicio, fecha y hora. Confirmación por email automática.
- **Reseñas verificadas** — Solo usuarios autenticados con Google pueden dejar reseñas, incluyendo foto, procedimiento y edad.
- **Buzón de sugerencias** — Formulario anónimo con animación de sobre.
- **Convenios y beneficios** — Formulario para empresas interesadas en convenios corporativos.

### Para administradores
- **Panel de administración** con acceso a todos los módulos.
- **Gestión de citas** — Calendario visual (FullCalendar), franjas horarias por fecha con edición y eliminación, cancelación de citas con liberación automática de franja.
- **Gestión de reseñas** — Visibilidad, pinear hasta 10 reseñas destacadas, moderación.
- **Gestión de sugerencias** — Estados: por revisar / revisando / finalizado.
- **Gestión de convenios** — Estados y aprobación de solicitudes.
- **Notificaciones por email** — Al agendar una cita (confirmación al cliente + aviso al admin) y al recibir una solicitud de convenio.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JavaScript vanilla |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL (Neon) |
| Auth pública | Google OAuth2 |
| Auth admin | JWT + bcryptjs |
| Email | Nodemailer (SMTP) |
| Deploy frontend | Vercel |
| Deploy backend | Render |

---

## Estructura del proyecto

```
MireTijeras/
├── html/                        # Páginas HTML
│   ├── booking.html             # Reserva de citas (pública)
│   ├── reviews.html             # Reseñas (pública)
│   ├── suggestions.html         # Sugerencias (pública)
│   ├── benefits.html            # Convenios (pública)
│   ├── services.html            # Servicios (pública)
│   ├── admin-login.html
│   ├── admin-panel.html
│   ├── admin-citas.html
│   ├── admin-reviews.html
│   ├── admin-suggestions.html
│   └── admin-convenios.html
├── js/
│   ├── admin-common.js          # API_BASE_URL, auth helpers, escapeHtml (compartido)
│   ├── admin-citas.js
│   ├── admin-reviews.js
│   ├── admin-suggestions.js
│   ├── admin-convenios.js
│   ├── admin-login.js
│   ├── admin-panel.js
│   ├── booking.js
│   ├── reviews.js
│   └── suggestions.js
├── css/
├── backend/
│   ├── index.js                 # Servidor Express, rutas de suggestions y login
│   ├── db.js                    # Pool de conexión PostgreSQL
│   ├── logger.js                # Logger estructurado
│   ├── citas.routes.js          # Franjas y citas
│   ├── reviews.routes.js        # Reseñas
│   ├── convenios.routes.js      # Convenios
│   ├── schema.sql               # Esquema de base de datos
│   ├── middleware/
│   │   ├── verifyAdmin.js       # JWT middleware
│   │   └── validate.js          # express-validator middleware
│   ├── services/
│   │   ├── AuthService.js       # Login con bcrypt
│   │   └── emailService.js      # Notificaciones por email
│   └── scripts/
│       └── generateHash.js      # Utilidad para generar hash de contraseña
└── index.html                   # Página principal
```

---

## API — Rutas

### Públicas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/franjas` | Franjas horarias disponibles |
| GET | `/api/citas/disponibilidad` | Fechas y horas ocupadas (sin datos personales) |
| POST | `/api/citas` | Agendar una cita |
| GET | `/api/reviews` | Reseñas visibles |
| POST | `/api/reviews` | Crear reseña |
| POST | `/api/suggestions` | Enviar sugerencia |
| POST | `/api/convenios` | Solicitar convenio |
| POST | `/api/admin/login` | Login administrador |
| POST | `/api/google-login` | Verificar token de Google |
| GET | `/api/health` | Health check |

### Protegidas (requieren `Authorization: Bearer <token>`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/citas` | Todas las citas |
| DELETE | `/api/citas/:id` | Cancelar cita |
| DELETE | `/api/citas/pasadas` | Eliminar citas y franjas anteriores a hoy |
| POST | `/api/franjas` | Crear franja horaria |
| PATCH | `/api/franjas/:id` | Editar franja horaria |
| DELETE | `/api/franjas/:id` | Eliminar franja horaria |
| GET | `/api/reviews/all` | Todas las reseñas |
| PUT | `/api/reviews/:id/pin` | Pinear / despinear reseña |
| PUT | `/api/reviews/:id/visible` | Cambiar visibilidad |
| GET | `/api/suggestions` | Todas las sugerencias |
| PUT | `/api/suggestions/:id` | Actualizar estado |
| GET | `/api/convenios` | Todas las solicitudes |
| PATCH | `/api/convenios/:id` | Actualizar estado |

---

<!--## Variables de entorno (Render)

```env
# Base de datos (Neon)
PGHOST=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGPORT=5432

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=        # Generar con: node backend/scripts/generateHash.js TU_PASSWORD
JWT_SECRET=                 # Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# CORS
ALLOWED_ORIGINS=https://tu-dominio.vercel.app

# Google OAuth2
GOOGLE_CLIENT_ID=

# Email (SMTP — compatible con Resend, Gmail, etc.)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
ADMIN_NOTIFY_EMAIL=
```
-->
---

## Setup local

```bash
# 1. Instalar dependencias del backend
cd backend && npm install

# 2. Crear backend/.env con las variables de entorno

# 3. Inicializar la base de datos
psql -h <host> -U <user> -d <database> -f backend/schema.sql

# 4. Generar hash de contraseña admin
node backend/scripts/generateHash.js TU_PASSWORD

# 5. Arrancar el servidor
node backend/index.js
```

El frontend es HTML estático — ábrelo directamente en el navegador o sírvelo con cualquier servidor estático.

---

## Seguridad

- Autenticación admin con JWT (8h de expiración) + bcryptjs
- Rate limiting: 10 intentos de login cada 15 min, 20 citas por hora por IP
- Validación de inputs con express-validator en todos los endpoints POST
- SSL obligatorio en la conexión a PostgreSQL
- CORS restringido a orígenes permitidos
- Rutas admin protegidas tanto en frontend (guard de ruta) como en backend (middleware JWT)
- Datos personales de citas no expuestos en rutas públicas
