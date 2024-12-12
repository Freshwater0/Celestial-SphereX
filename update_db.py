from app import create_app, db
from app.models import User, Role
from sqlalchemy import text

def update_database():
    app = create_app()
    with app.app_context():
        # Drop the users table
        db.session.execute(text('DROP TABLE IF EXISTS users CASCADE;'))
        
        # Create the users table with the correct schema
        db.session.execute(text('''
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(64) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(256),
                first_name VARCHAR(64),
                last_name VARCHAR(64),
                phone_number VARCHAR(20),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT FALSE,
                is_admin BOOLEAN DEFAULT FALSE,
                email_verified BOOLEAN DEFAULT FALSE,
                role_id INTEGER REFERENCES roles(id),
                bio TEXT,
                location VARCHAR(64),
                avatar_url VARCHAR(256)
            );
        '''))
        
        db.session.commit()
        print("Database schema updated successfully!")

if __name__ == '__main__':
    update_database()
