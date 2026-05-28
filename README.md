# 🧭 RutaSegura

RutaSegura es un mapa colaborativo de seguridad urbana para reportar incidentes recientes, agrupar reportes duplicados, votar su confiabilidad y mostrar puntos seguros validados por la comunidad. 

Esta versión ha sido completamente refactorizada bajo estándares de **arquitectura de nivel Senior**, incorporando desacoplamiento de capas, procesamiento asíncrono, seguridad robusta y una cobertura geográfica extendida a nivel internacional.

---

## 🚀 Arquitectura Técnica y Mejoras de Seniority

El monorepo se encuentra dividido en `apps/api` (Backend) y `apps/web` (Frontend), con las siguientes implementaciones avanzadas:

### 1. Capa de Servicios de Negocio (`UserService`)
* **Desacoplamiento Total:** Se extrajo toda la lógica transaccional de autenticación, hash de contraseñas, validación y verificación de códigos OTP de las rutas del controlador de FastAPI.
* **Mantenibilidad:** Ubicado en `apps/api/app/services/user.py`, el servicio centraliza las transacciones de base de datos facilitando pruebas unitarias aisladas y reutilización de código.

### 2. Notificaciones Asíncronas No Bloqueantes
* **FastAPI BackgroundTasks:** Integrado en los endpoints de `/register` y `/resend-code`. En lugar de esperar de forma síncrona la respuesta del servidor de correo saliente (SMTP) —lo cual ralentizaba la petición HTTP de 1 a 3 segundos—, el envío del correo se delega a hilos en segundo plano. Esto reduce la latencia de respuesta para el cliente a **milisegundos**.

### 3. Modularización de Componentes de Interfaz
* **Adiós al Monolito:** Se extrajeron los bloques masivos de formularios integrados de `Dashboard.tsx` hacia subcomponentes limpios, fuertemente tipados y enfocados:
  * `AuthModal.tsx`: Controla de forma fluida el login, registro y la verificación OTP por correo.
  * `ReportFormModal.tsx`: Gestiona el formulario de reportes de incidentes e interactúa con el buscador Nominatim (OSM) para auto-sugerencias geográficas.
  * `BusinessFormModal.tsx`: Controla el registro de nuevos puntos seguros (comercios).
* **Contenedor Reutilizable (`NewModal.tsx`):** Un componente base estilizado con diseño de vidrio (glassmorphism), harmonización HSL, modo oscuro nativo y micro-animaciones premium.

### 4. Seguridad de Administrador y Gestión de Secretos
* **Carga por Secretos (`.env`):** Las credenciales de Administrador se cargan de forma dinámica en `Settings` (Pydantic) y se gestionan mediante variables de entorno secretas, eliminando claves duras del código.
* **Sincronización Automática de Clave (Criptografía):** Al arrancar la API, el script `seed.py` verifica si la clave del administrador almacenada en la base de datos (SQLite/Supabase PostgreSQL) coincide con la variable `ADMIN_PASSWORD`. Si cambió en el archivo `.env`, **el script actualiza y re-hashea automáticamente la contraseña en la base de datos**, garantizando una rotación de secretos perfecta sin intervención manual.
* **Blindaje contra Escalada de Privilegios:** Se bloqueó el endpoint `/register` para impedir de forma absoluta el registro del rol `ADMIN` de forma pública en cualquier entorno, previniendo ataques de inyección de permisos.

### 5. Expansión de Cobertura Internacional
RutaSegura cuenta con límites geográficos (`bounding boxes`), coordenadas centrales de precisión, semillas simuladas de incidentes y puntos seguros interactivos para **más de 20 metrópolis globales** en:
* **España:** Madrid, Barcelona.
* **Norteamérica:** Ciudad de México (CDMX), New York, Toronto.
* **Centroamérica:** Ciudad de Panamá, San José, Managua, Tegucigalpa, San Salvador, Ciudad de Guatemala, Belmopán.
* **Sudamérica:** Bogotá, Cartagena, Medellín, Cali, Barranquilla, Buenos Aires, Santiago, Lima, Quito, Caracas, Montevideo, Asunción, La Paz, Río de Janeiro, São Paulo, Georgetown, Paramaribo.

---

## 🛠️ Arranque en Entorno Local

### 1. Backend (API)
```powershell
cd apps/api
# Crear y activar entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Instalar dependencias en modo editable
pip install -e ".[dev]"
# Aplicar migraciones de base de datos
alembic upgrade head
# Iniciar servidor local
uvicorn app.main:app --reload --port 8001
```

### 2. Frontend (Next.js)
```powershell
cd apps/web
# Instalar dependencias de Node
npm install
# Iniciar servidor de desarrollo en puerto 3000
npm run dev -- --port 3000
```

### 3. Tareas de Mantenimiento Periódicas
Ejecutar para limpiar reportes antiguos, recalcular reputaciones y sincronizar datos:
```powershell
cd apps/api
.\.venv\Scripts\python -m app.jobs.local
```

---

## 🌍 Guía de Despliegue en Producción (Hosting)

Para llevar la aplicación a producción para usuarios reales, se recomienda utilizar la siguiente arquitectura de hosting de alta disponibilidad:

### A. Frontend (Vercel)
* **¿Por qué?** Es la plataforma de optimización oficial para Next.js. Provee CDN global, middleware de borde y despliegues automáticos desde tu repositorio de GitHub.
* **Configuración:** Conecta tu repo en Vercel, selecciona `apps/web` como directorio raíz e inyecta las siguientes variables:
  * `NEXT_PUBLIC_API_BASE_URL`: URL pública de tu API de FastAPI desplegada.
  * `NEXT_PUBLIC_MAPTILER_KEY`: Tu llave de mapas de Maptiler.
  * `NEXT_PUBLIC_ORS_TOKEN`: Token para la API de OpenRouteService.

### B. Backend (Railway.app o Render.com)
* **¿Por qué?** Proveen despliegues automáticos para FastAPI basados en git, SSL gratuito de forma nativa y bases de datos PostgreSQL administradas a bajo costo.
* **Configuración:** Conecta tu repositorio, apunta al directorio `apps/api` e inyecta los secretos del `.env`:
  * `DATABASE_URL`: Tu cadena de conexión PostgreSQL de Supabase.
  * `JWT_SECRET_KEY`: Llave criptográfica robusta para firmar tokens.
  * `ADMIN_EMAIL` y `ADMIN_PASSWORD`: Las credenciales seguras del Administrador de tu plataforma.

---

## 📁 Estructura del Repositorio
```text
apps/
  api/      FastAPI, Capa de Servicios, SQLite/PostgreSQL y Alembic
  web/      Next.js (TSX), MapLibre GL, Subcomponentes Modales Modularizados
infra/      Documentación de infraestructura de contenedores futuros
workers/    Diseños de scrapers de noticias automáticas comunitarias
docs/       Alcance, modelos de datos, arquitectura y gobernanza del MVP
```

---

## 🎯 URLs de Desarrollo Locales
* **Aplicación Web:** [http://localhost:3000](http://localhost:3000)
* **API Salud/Health:** [http://localhost:8001/health](http://localhost:8001/health)
* **Documentación Interactiva de API (Swagger):** [http://localhost:8001/docs](http://localhost:8001/docs)
