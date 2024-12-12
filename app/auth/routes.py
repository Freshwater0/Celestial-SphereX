from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime, timedelta
import uuid
import re
import logging

# Create a logger
logger = logging.getLogger(__name__)

from . import auth
from .. import db, limiter
from ..models import User, UserSession, Role, PasswordReset
from ..email import send_password_reset_email, send_verification_email
from .utils import validate_password, send_password_change_notification

@auth.route('/register', methods=['POST', 'OPTIONS'])
@limiter.limit("3 per hour")  # Limit registration attempts
def register():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = auth.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response

    try:
        # Log the incoming request
        logger.info(f"Registration request received from {request.remote_addr}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        # Get JSON data with error handling
        try:
            data = request.get_json()
            if not data:
                logger.error("No JSON data received in request")
                return jsonify({'error': 'No data provided'}), 400
        except Exception as e:
            logger.error(f"Error parsing JSON data: {str(e)}")
            return jsonify({'error': 'Invalid JSON data'}), 400

        # Log the request data (excluding password)
        safe_data = {k: v for k, v in data.items() if k != 'password'}
        logger.debug(f"Registration data received: {safe_data}")
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        if not all(k in data for k in required_fields):
            missing_fields = [f for f in required_fields if f not in data]
            logger.warning(f"Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Validate password
        is_valid, error_message = validate_password(data['password'])
        if not is_valid:
            logger.warning(f"Password validation failed: {error_message}")
            return jsonify({'error': error_message}), 400
        
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            logger.warning(f"Invalid email format: {data['email']}")
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            logger.warning(f"Username already exists: {data['username']}")
            return jsonify({'error': 'Username already exists'}), 400
        if User.query.filter_by(email=data['email']).first():
            logger.warning(f"Email already exists: {data['email']}")
            return jsonify({'error': 'Email already exists'}), 400
        
        # Get default role
        role = Role.query.filter_by(default=True).first()
        if role is None:
            logger.info("Creating default user role")
            role = Role(name='User', default=True, permissions=1)
            db.session.add(role)
            db.session.commit()
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data.get('phone_number'),
            role=role,
            bio=data.get('bio'),
            location=data.get('location')
        )
        user.password = data['password']
        
        try:
            db.session.add(user)
            db.session.commit()
            logger.info(f"User created successfully: {user.username}")
            
            try:
                # Send verification email
                send_verification_email(user)
                logger.info(f"Verification email sent to: {user.email}")
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
                # Don't fail registration if email fails
            
            response = jsonify({
                'message': 'User registered successfully. Please check your email to verify your account.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response, 201
            
        except Exception as e:
            db.session.rollback()
            error_message = str(e)
            logger.error(f"Database error during user creation: {error_message}")
            if 'unique constraint' in error_message.lower():
                if 'username' in error_message.lower():
                    return jsonify({'error': 'Username already exists'}), 400
                if 'email' in error_message.lower():
                    return jsonify({'error': 'Email already exists'}), 400
            return jsonify({'error': 'Registration failed. Please try again later.'}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@auth.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.verify_password(data['password']):
        if not user.is_active:
            return jsonify({'error': 'Please verify your email before logging in'}), 401
            
        # Create session
        session = UserSession(
            user_id=user.id,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string
        )
        db.session.add(session)
        
        try:
            db.session.commit()
            login_user(user)
            
            # Generate access token
            token = user.generate_auth_token()
            
            return jsonify({
                'message': 'Logged in successfully',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Login failed'}), 500
    
    return jsonify({'error': 'Invalid email or password'}), 401

@auth.route('/verify-email/<token>')
def verify_email(token):
    user = User.verify_email_token(token)
    if not user:
        return jsonify({'error': 'Invalid or expired verification token'}), 400
    
    user.email_verified = True
    user.is_active = True
    db.session.commit()
    
    return jsonify({'message': 'Email verified successfully'}), 200

@auth.route('/forgot-password', methods=['GET', 'POST'])
@limiter.limit("3 per hour")
def forgot_password():
    """Request a password reset"""
    if request.method == 'GET':
        return render_template('auth/forgot_password.html')
        
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    # Always return success to prevent email enumeration
    if user:
        # Generate reset token
        token = user.get_reset_password_token()
        
        # Create password reset record
        reset_request = PasswordReset(
            user_id=user.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        try:
            db.session.add(reset_request)
            db.session.commit()
            
            # Send reset email
            send_password_reset_email(user)
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in forgot password: {str(e)}")
    
    return jsonify({
        'message': 'If an account exists with that email, you will receive password reset instructions.'
    }), 200

@auth.route('/reset-password/<token>', methods=['GET', 'POST'])
@limiter.limit("3 per hour")
def reset_password(token):
    """Reset password using token"""
    if request.method == 'GET':
        # Verify token
        user = User.verify_reset_password_token(token)
        if not user:
            flash('Invalid or expired reset token')
            return redirect(url_for('auth.forgot_password'))
        
        # Check if token is used
        reset_request = PasswordReset.query.filter_by(
            token=token,
            used=False
        ).filter(PasswordReset.expires_at > datetime.utcnow()).first()
        
        if not reset_request:
            flash('Invalid or expired reset token')
            return redirect(url_for('auth.forgot_password'))
        
        return render_template('auth/reset_password.html')
    
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({'error': 'New password is required'}), 400
    
    # Validate password
    is_valid, error_message = validate_password(data['password'])
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    user = User.verify_reset_password_token(token)
    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    # Check if token is used
    reset_request = PasswordReset.query.filter_by(
        token=token,
        used=False
    ).filter(PasswordReset.expires_at > datetime.utcnow()).first()
    
    if not reset_request:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    try:
        # Update password
        user.password = data['password']
        
        # Mark token as used
        reset_request.used = True
        
        db.session.commit()
        
        # Send notification
        send_password_change_notification(user)
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reset password'}), 500

@auth.route('/change-password', methods=['GET', 'POST'])
@login_required
@limiter.limit("3 per hour")
def change_password():
    """Change password while logged in"""
    if request.method == 'GET':
        return render_template('auth/change_password.html')
    
    data = request.get_json()
    
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    # Validate current password
    if not current_user.verify_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    is_valid, error_message = validate_password(data['new_password'])
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    try:
        # Update password
        current_user.password = data['new_password']
        db.session.commit()
        
        # Send notification
        send_password_change_notification(current_user)
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password'}), 500

@auth.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server status"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@auth.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    if request.method == 'GET':
        return jsonify({
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'phone_number': current_user.phone_number,
                'bio': current_user.bio,
                'location': current_user.location,
                'avatar_url': current_user.avatar_url,
                'created_at': current_user.created_at.isoformat(),
                'role': current_user.role.name
            }
        })
    else:  # PUT
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone_number', 'bio', 'location']
        for field in allowed_fields:
            if field in data:
                setattr(current_user, field, data[field])
        
        try:
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to update profile'}), 500

@auth.route('/logout')
@login_required
def logout():
    # Invalidate current session
    current_session = UserSession.query.filter_by(
        user_id=current_user.id,
        is_active=True
    ).first()
    
    if current_session:
        current_session.is_active = False
        db.session.commit()
    
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200
