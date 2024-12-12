from flask_migrate import Migrate, upgrade
from app import create_app, db
from app.models import User, Role

app = create_app()
migrate = Migrate(app, db)

def init_db():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create default roles if they don't exist
        if Role.query.count() == 0:
            roles = ['user', 'admin', 'moderator']
            for role_name in roles:
                role = Role(name=role_name, default=(role_name == 'user'))
                db.session.add(role)
            db.session.commit()
            print("Created default roles")

if __name__ == '__main__':
    init_db()
    print("Database initialized")
