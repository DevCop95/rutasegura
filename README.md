# RutaSegura

RutaSegura es un mapa colaborativo de seguridad urbana para reportar incidentes recientes, agrupar reportes duplicados, votar su confiabilidad y mostrar puntos seguros validados por la comunidad.

Este repositorio arranca con una base documental para convertir la idea en un MVP implementable, medible y gobernable.

## Documentos base

- [00 - Alcance del MVP](docs/00-alcance-mvp.md)
- [01 - Modelo de datos y flujos](docs/01-modelo-datos-y-flujos.md)
- [02 - Arquitectura tecnica](docs/02-arquitectura.md)
- [03 - Roadmap por fases](docs/03-roadmap-fases.md)
- [04 - Gobernanza y riesgos](docs/04-gobernanza-y-riesgos.md)

## Decision inicial

La ciudad piloto propuesta es Cartagena, Colombia. La primera version debe concentrarse en valor civico basico: reportes de calle, mapa, votacion comunitaria, reputacion, fuentes/noticias, empresas en validacion y deteccion simple de duplicados.

Stripe real y scraping automatico quedan pendientes. La UI ya muestra los flujos para campanas y aporte de noticias, pero esos pagos y verificaciones todavia no procesan servicios externos.

## Estructura tecnica actual

```text
apps/
  api/      FastAPI, SQLAlchemy, Alembic y SQLite local
  web/      Next.js, React, MapLibre/mapcn y tablero MVP
infra/
  README.md Infra futura, sin Docker por ahora
workers/
  scraper/  Placeholder para la Fase 4
```

## Arranque local

API con SQLite:

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Jobs locales:

```powershell
cd apps/api
.\.venv\Scripts\Activate.ps1
python -m app.jobs.local
```

Frontend:

```powershell
cd apps/web
npm install
npm run dev -- --port 3000
```

Variables de entorno base:

- Copiar `.env.example` si se trabaja desde la raiz.
- Copiar `apps/api/.env.example` para la API.
- Copiar `apps/web/.env.example` para la web.

## URLs locales

- Web: `http://localhost:3000`
- API health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

## Nota de base de datos

Por ahora el entorno local usa `sqlite:///./rutasegura.db`. PostGIS queda como una mejora futura cuando el producto necesite consultas geoespaciales mas fuertes o despliegue multiusuario.

## Mapa

La web usa un componente local en `apps/web/components/ui/map.tsx`, inspirado en el modelo copy-paste de mapcn y montado sobre MapLibre GL. No usa Leaflet.
