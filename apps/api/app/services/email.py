import json
import logging
import random
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_verification_code() -> str:
    """Genera un código de verificación aleatorio de 6 dígitos."""
    return f"{random.randint(100000, 999999)}"


def send_verification_email(email_to: str, code: str) -> None:
    """Envía un código de verificación por correo usando Resend, SMTP, o lo registra en consola."""
    subject = "Código de verificación - RutaSegura"
    body = f"""Hola,

Gracias por registrarte en RutaSegura. Tu código de verificación es:

👉 {code}

Este código expirará en 15 minutos.

Atentamente,
El equipo de RutaSegura
"""

    # 1. Intentar con Resend (API HTTP, recomendado para entornos restringidos como Railway)
    if settings.resend_api_key:
        try:
            url = "https://api.resend.com/emails"
            payload = {
                "from": settings.resend_from,
                "to": [email_to],
                "subject": subject,
                "text": body
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "rutasegura/1.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                logger.info(f"Correo enviado exitosamente vía Resend a {email_to}. Response: {res_body}")
                return
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logger.error(f"Error HTTP de Resend al enviar correo a {email_to}: Status {e.code}, Body: {err_body}")
        except Exception as e:
            logger.error(f"Error inesperado al enviar correo con Resend: {e}")
        logger.info("Resend falló, intentando canal de respaldo...")

    # 2. Intentar con SMTP tradicional como respaldo
    if all([settings.smtp_host, settings.smtp_user, settings.smtp_password]):
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

            logger.info(f"Correo de verificación enviado a {email_to} vía SMTP")
            return
        except Exception as e:
            logger.error(f"Error al enviar correo de verificación a {email_to} vía SMTP: {e}")
            logger.info(f"[RESPALDO] Código para {email_to}: {code}")
            print(f"\n[RESPALDO SMTP ERROR] Código para {email_to}: {code}\n", flush=True)
            return

    # 3. Simulación si nada está configurado
    logger.info(
        f"\n=================================================="
        f"\n[EMAIL SIMULATION] Hacia: {email_to}"
        f"\nAsunto: {subject}"
        f"\nCuerpo: \n{body}"
        f"\n=================================================="
    )
    print(
        f"\n=================================================="
        f"\n[EMAIL SIMULATION] Hacia: {email_to}"
        f"\nCódigo de Verificación: {code}"
        f"\n==================================================\n",
        flush=True
    )
