from fastapi import APIRouter

from app.api.routes import admin, auth, businesses, reports, sources, users, votes

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])
api_router.include_router(votes.router, tags=["votes"])
api_router.include_router(sources.router, tags=["sources"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
