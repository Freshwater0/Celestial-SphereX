from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS with more permissive settings
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", 
                            "X-Requested-With", "Access-Control-Allow-Origin"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True,
            "max_age": 120
        }
    })
    
    # Configure Flask app
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:admin@localhost:5432/celestial_sphere')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True  # Log SQL queries for debugging
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Password policy
    app.config['PASSWORD_MIN_LENGTH'] = 8
    app.config['PASSWORD_REQUIRE_UPPERCASE'] = True
    app.config['PASSWORD_REQUIRE_LOWERCASE'] = True
    app.config['PASSWORD_REQUIRE_NUMBERS'] = True
    app.config['PASSWORD_REQUIRE_SPECIAL'] = True
    
    # Initialize extensions
    mail.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    
    # Initialize Flask-Login
    login_manager.init_app(app)
    
    # Initialize database
    db.init_app(app)
    with app.app_context():
        from .models import init_db
        init_db()
    
    login_manager.login_view = 'auth.login'

    # Register blueprints
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

    return app
