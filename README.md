# 🏆 Cryzan Sport - E-Commerce Platform 2026

Plataforma e-commerce moderna para la marca **Cryzan Sport** (Trujillo, Perú), especializada en vestimenta, calzado y equipamiento deportivo de alto rendimiento.

El proyecto ha sido completamente migrado y relanzado desde su versión estática original hacia una arquitectura full-stack profesional nivel 2026 contenedorizada con Docker.

---

## 🛠️ Stack Tecnológico

- **Frontend & Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Gestión de Estado Global:** Zustand con persistencia en `localStorage`
- **Autenticación & Seguridad:** NextAuth.js (Auth.js) v5 con `bcrypt` para hashing de contraseñas y JWT
- **Base de Datos & ORM:** PostgreSQL 16 + Prisma ORM
- **Caché / Sesiones:** Redis
- **Validación de Formularios:** Zod + `react-hook-form`
- **Pasarela de Pagos:** Integración sandbox de MercadoPago / Culqi en Soles (S/.)
- **Testing:** Vitest + Testing Library (3 pruebas unitarias para carrito, login y contacto)
- **Contenedorización:** Docker + Docker Compose (servicios: `app`, `db`, `redis`, `adminer`)
- **CI/CD:** GitHub Actions pipeline (`.github/workflows/ci.yml`)

---

## ⚡ Arranque con Un Solo Comando (Docker Compose)

Para levantar **todo el ecosistema** (Aplicación Next.js, PostgreSQL `cryzan_sport_db`, Redis y Adminer) de forma automática con migraciones y datos sembrados:

```bash
docker compose up --build
```

### 🔗 Servicios Disponibles al Iniciar:
- 🌐 **Aplicación Web Cryzan Sport:** [http://localhost:3000](http://localhost:3000)
- 🗄️ **Adminer (Gestor de Base de Datos DB):** [http://localhost:8080](http://localhost:8080)
  - **Sistema:** PostgreSQL
  - **Servidor:** `db`
  - **Usuario:** `cryzan`
  - **Contraseña:** `cryzan123`
  - **Base de Datos:** `cryzan_sport_db`

---

## 🔐 Credenciales de Prueba (Sembradas en BD)

- **Administrador (Rol ADMIN - Acceso al Panel Admin):**
  - **Correo:** `admin@cryzan.com`
  - **Contraseña:** `123456`
- **Cliente (Rol CLIENT):**
  - **Correo:** `cliente@cryzan.com`
  - **Contraseña:** `123456`

---

## 📂 Estructura del Proyecto

```text
Deportes_Tienda11/
├── app/                        # Next.js App Router
│   ├── admin/                  # Panel de administración protegido por rol ADMIN
│   ├── api/                    # Route Handlers REST (auth, productos, checkout, contacto)
│   ├── carrito/                # Vista de carrito de compras Zustand
│   ├── checkout/               # Flujo de pago Sandbox MercadoPago / Culqi
│   ├── contacto/               # Formulario de contacto validado con Zod
│   ├── login/                  # Autenticación NextAuth Credentials
│   ├── productos/              # Catálogo con filtros SSR y búsqueda
│   ├── layout.tsx              # Root Layout con Theme & Auth Providers
│   └── page.tsx                # Landing Page oficial de Cryzan Sport
├── components/                 # Componentes UI reutilizables (Header, Footer, ProductCard, etc.)
├── lib/                        # Clientes de Prisma, NextAuth, Zustand Store y Schemas Zod
├── prisma/                     # Esquema de base de datos y script seed.ts
├── scripts/                    # Entrypoint.sh para Docker
├── tests/                      # Pruebas unitarias automatizadas con Vitest
├── docker-compose.yml          # Setup multicontenedor para desarrollo
├── docker-compose.prod.yml     # Setup para producción
├── Dockerfile                  # Multi-stage Dockerfile basado en node:20-alpine
├── package.json                # Nombre: "cryzan-sport"
└── .github/workflows/ci.yml   # Workflow CI/CD
```

---

## 🧪 Pruebas Unitarias

Para ejecutar las pruebas unitarias con Vitest:

```bash
npm run test
```

---

## 🎨 Identidad de Marca y Rebranding

- **Nombre comercial:** Cryzan Sport
- **Contenedor:** `cryzan_sport_app`
- **Base de Datos:** `cryzan_sport_db`
- **Colores corporativos:** Rojo Deportivo (`#d32f2f`), Negro Carbono (`#121212`) y Blanco Puro.
