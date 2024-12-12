from app import create_app, db
from app.models import User, UserSession
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_app()

# Create tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")

if __name__ == '__main__':
    # Enable threaded mode
    app.run(
        host='127.0.0.1',  # Only allow local connections for development
        port=8080,
        debug=True,
        threaded=True,
        use_reloader=True
    )
