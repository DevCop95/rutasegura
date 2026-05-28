from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """Ejecuta el seed al iniciar y libera recursos al cerrar."""
    run_seed()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="RutaSegura API",
        version="0.1.0",
        description="Backend REST para el MVP civico de RutaSegura.",
        lifespan=lifespan,
    )

    # Separar orígenes si vienen como lista por coma (e.g., producción + desarrollo)
    origins = [o.strip() for o in settings.web_origin.split(",") if o.strip()]
    for local_origin in ["http://127.0.0.1:3000", "http://localhost:3000"]:
        if local_origin not in origins:
            origins.append(local_origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "rutasegura-api"}

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
