from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.enums import UserType
from app.models.user import User
from app.schemas.auth import RegisterRequest, VerifyEmailRequest, ResendCodeRequest
from app.services.email import generate_verification_code, send_verification_email


class UserService:
    @staticmethod
    def register(db: Session, payload: RegisterRequest, background_tasks: BackgroundTasks) -> User:
        existing = db.scalar(select(User).where(User.email == payload.email.lower()))
        
        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        if existing is not None:
            if existing.is_active:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya esta registrado.")
            else:
                # Reutilizar y actualizar el registro de usuario inactivo existente
                existing.alias = payload.alias
                existing.password_hash = hash_password(payload.password)
                
                requested_type = payload.user_type
                if requested_type == UserType.ADMIN:
                    requested_type = UserType.CITIZEN
                existing.user_type = requested_type
                
                existing.verification_code = code
                existing.verification_code_expires_at = expires_at
                user = existing
        else:
            requested_type = payload.user_type
            if requested_type == UserType.ADMIN:
                requested_type = UserType.CITIZEN

            user = User(
                email=payload.email.lower(),
                alias=payload.alias,
                password_hash=hash_password(payload.password),
                user_type=requested_type,
                is_active=False,  # Inactivo por defecto hasta verificar
                verification_code=code,
                verification_code_expires_at=expires_at,
            )
            db.add(user)

        db.commit()
        db.refresh(user)

        # Enviar el correo de verificación de forma asíncrona
        background_tasks.add_task(send_verification_email, user.email, code)

        return user

    @staticmethod
    def verify(db: Session, payload: VerifyEmailRequest) -> User:
        user = db.scalar(select(User).where(User.email == payload.email.lower(), User.is_active.is_(False)))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado o ya verificado.",
            )

        if user.verification_code != payload.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de verificación inválido.",
            )

        # Comparación segura de zona horaria
        expires_at = user.verification_code_expires_at
        if expires_at is not None:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código ha expirado.",
                )

        # Activar usuario y limpiar campos de verificación
        user.is_active = True
        user.verification_code = None
        user.verification_code_expires_at = None
        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def resend_code(db: Session, payload: ResendCodeRequest, background_tasks: BackgroundTasks) -> User:
        user = db.scalar(select(User).where(User.email == payload.email.lower(), User.is_active.is_(False)))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado o ya verificado.",
            )

        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        user.verification_code = code
        user.verification_code_expires_at = expires_at
        db.add(user)
        db.commit()
        db.refresh(user)

        # Reenviar el correo de verificación de forma asíncrona
        background_tasks.add_task(send_verification_email, user.email, code)

        return user
