from . import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import jwt
import os
from time import time

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    default = db.Column(db.Boolean, default=False, index=True)
    permissions = db.Column(db.Integer)
    users = db.relationship('User', backref='role', lazy='dynamic')

    def __init__(self, **kwargs):
        super(Role, self).__init__(**kwargs)
        if self.permissions is None:
            self.permissions = 0

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))  # Increased from 128 to 256 to accommodate longer hash
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=False)  # Changed to False for email verification
    is_admin = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    
    # Profile fields
    bio = db.Column(db.Text)
    location = db.Column(db.String(64))
    avatar_url = db.Column(db.String(256))
    
    # Add relationship to user sessions
    sessions = db.relationship('UserSession', backref='user', lazy='dynamic')

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, os.getenv('JWT_SECRET'),
                          algorithms=['HS256'])['reset_password']
        except:
            return None
        return User.query.get(id)

    def get_email_verification_token(self, expires_in=172800):  # 48 hours
        return jwt.encode(
            {'email_verify': self.id, 'exp': time() + expires_in},
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )

    @staticmethod
    def verify_email_token(token):
        try:
            id = jwt.decode(token, os.getenv('JWT_SECRET'),
                          algorithms=['HS256'])['email_verify']
        except:
            return None
        return User.query.get(id)

    def __repr__(self):
        return f'<User {self.username}>'

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(64), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<UserSession {self.user_id}>'

class PasswordReset(db.Model):
    """Password reset requests"""
    __tablename__ = 'password_resets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref=db.backref('password_resets', lazy='dynamic'))

# Create tables
def init_db():
    """Initialize the database tables"""
    db.create_all()
    
    # Create default roles if they don't exist
    if Role.query.count() == 0:
        roles = ['user', 'admin', 'moderator']
        for role_name in roles:
            role = Role(name=role_name)
            db.session.add(role)
        db.session.commit()
