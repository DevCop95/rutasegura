"""
Seed inicial: crea el usuario admin por defecto si no existe.
Se llama automáticamente al arrancar la API.
"""

import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import UserType
from app.models.user import User

logger = logging.getLogger(__name__)

ADMIN_ALIAS = "AdminRuta"


def seed_admin(db: Session) -> None:
    """Inserta el usuario admin si aún no existe."""
    existing = db.query(User).filter(User.email == settings.admin_email).first()
    if existing:
        # Verificar y sincronizar la contraseña si ha cambiado en la configuración/secretos
        from app.core.security import verify_password
        if not verify_password(settings.admin_password, existing.password_hash):
            existing.password_hash = hash_password(settings.admin_password)
            db.commit()
            logger.info("Seed: contraseña de usuario admin actualizada en base de datos para sincronizar con secretos.")
        else:
            logger.info("Seed: usuario admin ya existe y su contraseña está sincronizada, se omite.")
        return

    admin = User(
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
        alias=ADMIN_ALIAS,
        user_type=UserType.ADMIN,
        rank="EMBAJADOR",
        reputation_score=100,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    logger.info("Seed: usuario admin creado → %s", settings.admin_email)


def run_seed() -> None:
    """Punto de entrada: abre sesión y ejecuta seeds."""
    db: Session = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
