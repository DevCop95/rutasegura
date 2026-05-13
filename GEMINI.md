# RutaSegura - Instrucciones del Proyecto

Este archivo contiene las convenciones, flujos de trabajo y arquitectura de RutaSegura para asegurar un desarrollo consistente y despliegues rápidos.

## Arquitectura

- **Backend:** FastAPI (Python 3.12+) con SQLAlchemy y Alembic.
- **Frontend:** Next.js (TypeScript) con MapLibre GL.
- **Base de Datos:** SQLite para desarrollo local (`apps/api/rutasegura.db`).
- **Estructura:** Monorepo dividido en `apps/api` y `apps/web`.

## Flujo de Arranque Local

Para evitar la configuración manual repetitiva, se recomienda seguir este orden:

### 1. Preparación de Entorno
Asegurarse de que los archivos `.env` existen en ambas carpetas:
- `apps/api/.env` (basado en `apps/api/.env.example`)
- `apps/web/.env` (basado en `apps/web/.env.example`)

### 2. Backend (API)
```powershell
cd apps/api
# Activar entorno virtual
.\.venv\Scripts\Activate.ps1
# Instalar dependencias
pip install -e ".[dev]"
# Aplicar migraciones
alembic upgrade head
# Iniciar servidor
uvicorn app.main:app --reload --port 8001
```

### 3. Frontend (Web)
```powershell
cd apps/web
# Instalar dependencias
npm install
# Iniciar desarrollo
npm run dev -- --port 3000
```

## Tareas de Mantenimiento
Ejecutar periódicamente para limpiar reportes antiguos y recalcular reputaciones:
```powershell
cd apps/api
.\.venv\Scripts\python -m app.jobs.local
```

## Convenciones de Desarrollo
- **Seguridad:** Nunca subir archivos `.env` o la base de datos `.db` al repositorio.
- **Base de Datos:** Siempre generar una nueva migración con Alembic al cambiar modelos en `apps/api/app/models/`.
- **Mapas:** El componente principal del mapa reside en `apps/web/components/ui/map.tsx`.

## Troubleshooting
- **Puertos:** La API debe estar en el 8001 y la Web en el 3000. Si están ocupados, el comando `netstat -ano | findstr :8001` ayuda a identificar el proceso.
- **Seguridad de Comandos:** Al usar herramientas automáticas, evitar sub-expresiones de PowerShell `$()` en una sola línea para no activar filtros de seguridad. Es preferible ejecutar comandos secuenciales.
