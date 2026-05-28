import logging
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_verification_code() -> str:
    """Genera un código de verificación aleatorio de 6 dígitos."""
    return f"{random.randint(100000, 999999)}"


def send_verification_email(email_to: str, code: str) -> None:
    """Envía un código de verificación por correo usando SMTP, o lo registra en consola si no está configurado."""
    subject = "Código de verificación - RutaSegura"
    body = f"""Hola,

Gracias por registrarte en RutaSegura. Tu código de verificación es:

👉 {code}

Este código expirará en 15 minutos.

Atentamente,
El equipo de RutaSegura
"""

    if not all([settings.smtp_host, settings.smtp_user, settings.smtp_password]):
        logger.info(
            f"\n=================================================="
            f"\n[EMAIL SIMULATION] Hacia: {email_to}"
            f"\nAsunto: {subject}"
            f"\nCuerpo: \n{body}"
            f"\n=================================================="
        )
        # También imprimimos en stdout directo por si los niveles de logger ocultan los logs en desarrollo
        print(
            f"\n=================================================="
            f"\n[EMAIL SIMULATION] Hacia: {email_to}"
            f"\nCódigo de Verificación: {code}"
            f"\n==================================================\n",
            flush=True
        )
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_from
        msg['To'] = email_to
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)

        logger.info(f"Correo de verificación enviado a {email_to}")
    except Exception as e:
        logger.error(f"Error al enviar correo de verificación a {email_to}: {e}")
        # Logueo de respaldo
        logger.info(f"[RESPALDO] Código para {email_to}: {code}")
        print(f"\n[RESPALDO SMTP ERROR] Código para {email_to}: {code}\n", flush=True)
