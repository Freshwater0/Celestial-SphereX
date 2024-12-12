from flask import jsonify
from . import auth
from ..email import send_email

@auth.route('/test-email', methods=['POST'])
def test_email():
    try:
        send_email(
            subject='Celestial Sphere - Test Email',
            recipients=['kasongotshoji@gmail.com'],
            text_body='This is a test email from your Celestial Sphere application.',
            html_body='''
            <h1>Welcome to Celestial Sphere!</h1>
            <p>This is a test email from your Flask application.</p>
            <p>If you received this email, your SendGrid configuration is working correctly.</p>
            '''
        )
        return jsonify({'message': 'Test email sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to send email: {str(e)}'}), 500
