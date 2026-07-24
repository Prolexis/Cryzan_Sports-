# 🏆 Cryzan Sport - E-Commerce Platform 2026

Plataforma e-commerce de alto rendimiento para la marca **Cryzan Sport** (Trujillo, Perú), especializada en vestimenta, calzado y equipamiento deportivo.

Arquitectura full-stack profesional nivel 2026 contenedorizada con Docker, optimizada para **Growth**, **Escalabilidad** y **Procesamiento Asíncrono**.

---

## 🚀 Nuevas Funcionalidades y Guía de Prueba (Bloques 1 - 6)

### 🧠 Bloque 1 — Inteligencia y Crecimiento
- **Recuperación de Carrito Abandonado:** Modelo `AbandonedCart` que registra ítems sin actividad y programa alertas en segundo plano con enlace directo al checkout.
- **Recomendaciones de Productos:** Sección *"También te puede interesar"* en la ficha del producto ([lib/recommendations.ts](file:///c:/Users/Usuario/Desktop/Deportes_Tienda11/lib/recommendations.ts)), calculada sobre co-compras frecuentes (`OrderItem`) y categorías.
- **Programa de Fidelidad (Puntos Cryzan):** Acumulación de 1 punto por cada S/. 10 gastados, visible en [/mi-cuenta/puntos](http://localhost:3000/mi-cuenta/puntos).
- **Sistema de Referidos:** Código único de invitación por usuario en [/mi-cuenta/referidos](http://localhost:3000/mi-cuenta/referidos) con descuento automático.

### 🌐 Bloque 2 — Alcance y Canales
- **Login Social (OAuth):** Integración de proveedores Google y Facebook en NextAuth ([lib/auth.ts](file:///c:/Users/Usuario/Desktop/Deportes_Tienda11/lib/auth.ts)).
- **Tracking de Envío en Tiempo Real:** Línea de tiempo interactiva (`Confirmado` → `Preparando` → `En Camino` → `Entregado`) con número de guía Olva/Shalom en [/mi-cuenta/pedidos/[id]](http://localhost:3000/mi-cuenta/pedidos).
- **Notificaciones Web Push:** Service Worker activo en `public/sw.js` para recepción de alertas de pedido.

### 💳 Bloque 3 — Pagos Reales y Devoluciones
- **Webhook Asíncrono de Pagos:** Confirmación segura de transacciones en [/api/webhooks/payments](http://localhost:3000/api/webhooks/payments) con firmas digitales.
- **Gestión Atómica de Devoluciones:** Solicitud por el cliente y aprobación desde [/admin/devoluciones](http://localhost:3000/admin/devoluciones) con **reversión atómica de stock en Prisma** (`prisma.$transaction`).

### 🏗️ Bloque 4 — Escalabilidad Técnica y Colas
- **Colas de Trabajo BullMQ sobre Redis:** Procesamiento en segundo plano ([lib/queue.ts](file:///c:/Users/Usuario/Desktop/Deportes_Tienda11/lib/queue.ts)) de emails, boletas PDF y alertas.
- **Ambiente Staging:** Archivo `docker-compose.staging.yml` para pruebas intermedias.
- **Feature Flags:** Evaluación dinámica de características en tiempo real ([lib/flags.ts](file:///c:/Users/Usuario/Desktop/Deportes_Tienda11/lib/flags.ts)).

### 📋 Bloque 5 — Cumplimiento y Privacidad
- **Portal de Privacidad & ARCO:** Exportación de datos personales en `.json` descargable y anonimización de cuenta según la Ley N° 29733 en [/mi-cuenta/privacidad](http://localhost:3000/mi-cuenta/privacidad).
- **Documentación API Swagger:** Especificación OpenAPI 3.0 servida en [/api/docs](http://localhost:3000/api/docs).

### 📈 Bloque 6 — Medición y Analytics
- **Embudo de Conversión:** Dashboard administrativo en [/admin/analytics](http://localhost:3000/admin/analytics) con cálculo visual desde visitas hasta compras completadas.

---

## ⚡ Arranque Local con Un Solo Comando (Docker Compose)

Para levantar **todo el ecosistema** (Aplicación Next.js, PostgreSQL `cryzan_sport_db`, Redis y Adminer) de forma automática con migraciones y datos sembrados:

```bash
docker compose up --build
```

### 🔗 Enlaces Directos de Prueba Local:
- 🌐 **Aplicación Web Cryzan Sport:** [http://localhost:3000](http://localhost:3000)
- 📊 **Dashboard de Analytics:** [http://localhost:3000/admin/analytics](http://localhost:3000/admin/analytics)
- 📄 **Documentación REST API:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- 🏆 **Programa de Puntos:** [http://localhost:3000/mi-cuenta/puntos](http://localhost:3000/mi-cuenta/puntos)
- 👥 **Sistema de Referidos:** [http://localhost:3000/mi-cuenta/referidos](http://localhost:3000/mi-cuenta/referidos)
- 🔒 **Portal de Privacidad (ARCO):** [http://localhost:3000/mi-cuenta/privacidad](http://localhost:3000/mi-cuenta/privacidad)
- 🗄️ **Adminer DB Manager:** [http://localhost:8080](http://localhost:8080) (Usuario: `cryzan`, Pass: `cryzan123`, DB: `cryzan_sport_db`)

---

## 🔐 Credenciales de Prueba (Sembradas en BD)

- **Administrador (Rol ADMIN):**
  - **Correo:** `admin@cryzan.com`
  - **Contraseña:** `123456`
- **Cliente (Rol CLIENT):**
  - **Correo:** `cliente@cryzan.com`
  - **Contraseña:** `123456`

---

## 🧪 Pruebas Unitarias

Para ejecutar la suite de pruebas unitarias automatizadas con Vitest:

```bash
npm run test
```
