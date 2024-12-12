import sys
import logging
from app import create_app, db
from app.models import User, Role, UserSession
from datetime import datetime
from sqlalchemy.exc import ProgrammingError, OperationalError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database with required tables and default data"""
    app = create_app()
    
    with app.app_context():
        try:
            # Test database connection
            db.engine.connect()
            logger.info("Successfully connected to database")
            
            # Create all tables
            db.create_all()
            logger.info("Created all database tables")
            
            # Create default roles if they don't exist
            roles = {
                'User': {'default': True, 'permissions': 0x01},
                'Admin': {'default': False, 'permissions': 0xff},
                'Moderator': {'default': False, 'permissions': 0x0f}
            }
            
            for role_name, attrs in roles.items():
                if not Role.query.filter_by(name=role_name).first():
                    role = Role(
                        name=role_name,
                        default=attrs['default'],
                        permissions=attrs['permissions']
                    )
                    db.session.add(role)
                    logger.info(f"Created role: {role_name}")
        
            # Create admin user if it doesn't exist
            admin_email = 'admin@celestialsphere.com'
            if not User.query.filter_by(email=admin_email).first():
                admin_role = Role.query.filter_by(name='Admin').first()
                admin = User(
                    username='admin',
                    email=admin_email,
                    first_name='Admin',
                    last_name='User',
                    role=admin_role,
                    is_active=True,
                    is_admin=True,
                    email_verified=True
                )
                admin.password = 'Admin@123456'  # Change this in production
                db.session.add(admin)
                logger.info("Created admin user")
            
            db.session.commit()
            logger.info("Database initialized successfully!")
            
        except OperationalError as e:
            logger.error(f"Database connection error: {str(e)}")
            logger.error("Please check if PostgreSQL is running and the connection details are correct")
            sys.exit(1)
        except ProgrammingError as e:
            logger.error(f"Database schema error: {str(e)}")
            db.session.rollback()
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error initializing database: {str(e)}")
            db.session.rollback()
            sys.exit(1)

if __name__ == '__main__':
    init_db()
