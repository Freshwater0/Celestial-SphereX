from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from flask import current_app, render_template
import os

def send_async_email(app, subject, recipients, text_body, html_body):
    with app.app_context():
        send_email(subject, recipients, text_body, html_body)

def send_email(subject, recipients, text_body, html_body):
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        message = Mail(
            from_email=os.getenv('MAIL_DEFAULT_SENDER'),
            to_emails=recipients,
            subject=subject,
            plain_text_content=text_body,
            html_content=html_body
        )
        sg.send(message)
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise e

def send_password_reset_email(user):
    token = user.get_reset_password_token()
    send_email('[Celestial] Reset Your Password',
               [user.email],
               render_template('email/reset_password.txt',
                               user=user, token=token),
               render_template('email/reset_password.html',
                               user=user, token=token))

def send_verification_email(user):
    token = user.get_email_verification_token()
    send_email('[Celestial] Verify Your Email',
               [user.email],
               render_template('email/verify_email.txt',
                               user=user, token=token),
               render_template('email/verify_email.html',
                               user=user, token=token))
