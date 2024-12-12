import re
from flask import current_app
from ..email import send_email

def validate_password(password):
    """
    Validate password against policy requirements
    Returns (bool, str) tuple: (is_valid, error_message)
    """
    if len(password) < current_app.config['PASSWORD_MIN_LENGTH']:
        return False, f"Password must be at least {current_app.config['PASSWORD_MIN_LENGTH']} characters long"
    
    if current_app.config['PASSWORD_REQUIRE_UPPERCASE']:
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
    
    if current_app.config['PASSWORD_REQUIRE_LOWERCASE']:
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
    
    if current_app.config['PASSWORD_REQUIRE_NUMBERS']:
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
    
    if current_app.config['PASSWORD_REQUIRE_SPECIAL']:
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain at least one special character"
    
    return True, ""

def send_password_change_notification(user):
    """Send notification email when password is changed"""
    subject = "Password Changed - Celestial Sphere"
    text_body = f"""
    Dear {user.username},

    Your password was recently changed. If you did not make this change, please contact support immediately.

    Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
    IP Address: {request.remote_addr}

    Best regards,
    Celestial Sphere Team
    """
    
    html_body = f"""
    <h2>Password Changed</h2>
    <p>Dear {user.username},</p>
    <p>Your password was recently changed. If you did not make this change, please contact support immediately.</p>
    <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
    <strong>IP Address:</strong> {request.remote_addr}</p>
    <p>Best regards,<br>
    Celestial Sphere Team</p>
    """
    
    send_email(
        subject=subject,
        recipients=[user.email],
        text_body=text_body,
        html_body=html_body
    )
