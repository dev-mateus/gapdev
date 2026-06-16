"""Email service."""

import os
import smtplib
from email.message import EmailMessage


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Send password reset email using Brevo SMTP."""

    smtp_server = os.getenv("BREVO_SMTP_SERVER")
    smtp_port = int(os.getenv("BREVO_SMTP_PORT", "587"))
    smtp_login = os.getenv("BREVO_SMTP_LOGIN")
    smtp_password = os.getenv("BREVO_SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM")

    if not smtp_server or not smtp_login or not smtp_password or not email_from:
        raise RuntimeError("Configurações de e-mail incompletas.")

    message = EmailMessage()
    message["Subject"] = "Redefinição de senha - GapDev"
    message["From"] = email_from
    message["To"] = to_email

    message.set_content(
        f"""
Olá,

Recebemos uma solicitação para redefinir sua senha no GapDev.

Acesse o link abaixo para criar uma nova senha:

{reset_link}

Este link expira em 30 minutos.

Se você não solicitou essa alteração, ignore este e-mail.

GapDev
"""
    )

    with smtplib.SMTP(smtp_server, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_login, smtp_password)
        smtp.send_message(message)