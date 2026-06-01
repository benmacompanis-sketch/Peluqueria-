# STACK TECNOLÓGICO — G-M PELUQUEROS PALERMO

---

## JUSTIFICACIÓN GENERAL
Priorizamos: bajo costo operativo (contexto argentino), velocidad de entrega, 
escalabilidad futura y facilidad de mantenimiento por el dueño del negocio.

---

## FRONTEND

| Capa             | Tecnología         | Justificación                                            |
|------------------|--------------------|----------------------------------------------------------|
| Framework        | **Next.js 14**     | SSR/SSG para SEO, App Router, imágenes optimizadas       |
| Lenguaje         | **TypeScript**     | Tipado → menos bugs en el sistema de reservas            |
| Estilos          | **Tailwind CSS**   | Desarrollo rápido, responsive-first, sin CSS sin usar     |
| Componentes UI   | **shadcn/ui**      | Accesible, sin vendor lock-in, estilos personalizables    |
| Calendario       | **react-day-picker**| Ligero, accesible, i18n                                  |
| Formularios      | **React Hook Form**| Mínimo re-render, validación con Zod                     |
| Animaciones      | **Framer Motion**  | Profesional, 60fps, tree-shakeable                       |
| Íconos           | **Lucide React**   | Línea fina, consistente, MIT license                     |
| Mapas            | **Google Maps Embed**| Sin costo para embed básico, integración GBP             |
| Estado global    | **Zustand**        | Liviano, para estado del wizard de reservas              |
| Fetching         | **TanStack Query** | Cache, loading states, invalidación automática           |

---

## BACKEND

| Capa               | Tecnología         | Justificación                                            |
|--------------------|--------------------|----------------------------------------------------------|
| Runtime            | **Node.js 20 LTS** | Madurez, ecosistema, mismo lenguaje que frontend         |
| Framework          | **Next.js API Routes** | Monorepo simple, serverless-ready                   |
| ORM                | **Prisma**         | Type-safe, migraciones, seed, compatible PG              |
| Autenticación      | **NextAuth.js v5** | Google OAuth + email/contraseña, sesiones JWT            |
| Validación         | **Zod**            | Schema compartido front/back                             |
| Notificaciones     | **Resend**         | Email transaccional moderno, 3000 emails gratis/mes      |
| WhatsApp           | **WhatsApp Business Cloud API** (Meta) | Oficial, gratuito hasta 1000 conv/mes   |
| Pagos              | **MercadoPago SDK**| Único obligatorio en Argentina, checkout en español      |
| Google Calendar    | **Google Calendar API v3** | OAuth 2.0, sync de eventos de reservas         |
| Tareas programadas | **node-cron**      | Recordatorios automáticos, reportes, limpieza            |
| Archivos/imágenes  | **Cloudinary**     | Transformaciones automáticas WebP, CDN global            |

---

## BASE DE DATOS

| Componente     | Tecnología         | Plan                                                    |
|----------------|--------------------|---------------------------------------------------------|
| Principal      | **PostgreSQL 16**  | Supabase (gratis 500MB / $25 USD al crecer)             |
| Cache          | **Redis** (Upstash)| Slots disponibles en tiempo real, sesiones              |
| Backups        | Supabase automáticos + dump semanal S3                            |

---

## HOSTING E INFRAESTRUCTURA

| Componente     | Servicio           | Costo aprox.                                            |
|----------------|--------------------|---------------------------------------------------------|
| Frontend/API   | **Vercel**         | Gratis (hobby) → $20 USD/mes al escalar                 |
| Base de datos  | **Supabase**       | Gratis → $25 USD/mes                                    |
| Cache          | **Upstash Redis**  | Gratis (10K req/día)                                    |
| Imágenes       | **Cloudinary**     | Gratis (25 créditos/mes)                                |
| Dominio        | **NIC.ar**         | ~$1.500 ARS/año (.com.ar)                               |
| Email          | **Resend**         | Gratis (3.000/mes)                                      |
| DNS/CDN        | **Cloudflare**     | Gratis                                                  |

**Costo total inicial estimado: $0–$20 USD/mes**

---

## SEGURIDAD

| Aspecto                    | Implementación                                              |
|----------------------------|-------------------------------------------------------------|
| HTTPS                      | Vercel/Cloudflare automático                                |
| Autenticación              | NextAuth + JWT httpOnly cookies                             |
| Contraseñas                | bcrypt (salt rounds 12)                                     |
| CSRF                       | NextAuth built-in                                           |
| Rate limiting              | Upstash Ratelimit (API de reservas: 10 req/min/IP)          |
| SQL injection              | Prisma ORM (queries parametrizadas)                         |
| XSS                        | Next.js escaping automático + CSP headers                   |
| Variables de entorno       | .env.local, Vercel env secrets (nunca en el repo)           |
| Logs de auditoría          | Tabla `audit_logs` para acciones sensibles del admin        |
| GDPR/PDPA Argentina        | Política de privacidad + consentimiento explícito cookies   |
| Datos de pago              | Nunca se almacenan en DB propia; solo token MercadoPago     |

---

## INTEGRACIONES

| Integración             | Propósito                                   | SDK/API                         |
|-------------------------|---------------------------------------------|---------------------------------|
| MercadoPago             | Pagos online opcionales                     | `mercadopago` SDK Node.js       |
| WhatsApp Business       | Notificaciones automáticas                  | Meta Cloud API (HTTP)           |
| Google Calendar         | Sync de turnos del profesional              | `googleapis` npm                |
| Google Maps             | Embed del mapa en contacto                  | Iframe embed (sin costo)        |
| Instagram Basic Display | Preview de últimas fotos en galería         | Meta API                        |
| Resend                  | Emails transaccionales y marketing          | `resend` SDK                    |
| Cloudinary              | Almacenamiento y optimización de imágenes   | `cloudinary` SDK Node.js        |
| Analytics               | Google Analytics 4 + Vercel Analytics       | Script tag + `@vercel/analytics`|

---

## ESTRUCTURA DEL PROYECTO (Next.js)

```
/
├── app/
│   ├── (public)/               # Páginas públicas (SSG/ISR)
│   │   ├── page.tsx            # Inicio
│   │   ├── servicios/          # Servicios
│   │   ├── galeria/            # Galería
│   │   ├── equipo/             # Equipo
│   │   ├── blog/               # Blog
│   │   ├── contacto/           # Contacto
│   │   ├── faq/                # FAQ
│   │   └── [slug]/             # Páginas de blog
│   ├── turnos/                 # Sistema de reservas (SSR)
│   │   ├── page.tsx            # Wizard de reservas
│   │   ├── confirmacion/       # Confirmación
│   │   └── mis-turnos/         # Historial cliente
│   ├── auth/                   # Login / Registro
│   ├── admin/                  # Panel administración (protegido)
│   │   ├── empleado/           # Vista empleado
│   │   └── gerente/            # Vista gerente
│   └── api/                    # API Routes
│       ├── auth/               # NextAuth
│       ├── appointments/       # CRUD turnos
│       ├── services/           # Servicios disponibles
│       ├── employees/          # Empleados y disponibilidad
│       ├── payments/           # MercadoPago webhook
│       ├── notifications/      # Envío de notificaciones
│       └── admin/              # Endpoints protegidos admin
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── booking/                # Wizard de reservas
│   ├── admin/                  # Componentes del panel
│   └── shared/                 # Header, Footer, etc.
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── whatsapp.ts             # WhatsApp helper
│   ├── email.ts                # Resend helper
│   ├── gcal.ts                 # Google Calendar helper
│   └── availability.ts        # Engine de disponibilidad
├── prisma/
│   ├── schema.prisma           # Schema completo
│   └── seed.ts                 # Datos iniciales
└── public/
    ├── images/                 # Imágenes estáticas
    └── fonts/                  # Tipografías self-hosted
```
