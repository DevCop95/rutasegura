"""
Seed inicial: crea el usuario admin por defecto si no existe.
Se llama automáticamente al arrancar la API.
"""

import logging

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import UserType
from app.models.user import User

logger = logging.getLogger(__name__)

ADMIN_EMAIL = "admin@rutasegura.com"
ADMIN_PASSWORD = "Amin@123"
ADMIN_ALIAS = "AdminRuta"


def seed_admin(db: Session) -> None:
    """Inserta el usuario admin si aún no existe."""
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        logger.info("Seed: usuario admin ya existe, se omite.")
        return

    admin = User(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        alias=ADMIN_ALIAS,
        user_type=UserType.ADMIN,
        rank="EMBAJADOR",
        reputation_score=100,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    logger.info("Seed: usuario admin creado → %s", ADMIN_EMAIL)


def run_seed() -> None:
    """Punto de entrada: abre sesión y ejecuta seeds."""
    db: Session = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
