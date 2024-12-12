from app import create_app, db
from app.models import User, Role

def create_test_user():
    app = create_app()
    with app.app_context():
        # Create default user role if it doesn't exist
        user_role = Role.query.filter_by(name='user').first()
        if not user_role:
            user_role = Role(name='user', default=True)
            db.session.add(user_role)
            db.session.commit()

        # Check if test user already exists
        if User.query.filter_by(email='test@example.com').first():
            print("Test user already exists!")
            return

        # Create test user
        user = User(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            role=user_role,
            is_active=True,  # Make user active by default
            email_verified=True  # Skip email verification for test user
        )
        user.password = 'Test123!'  # This will be hashed automatically

        try:
            db.session.add(user)
            db.session.commit()
            print("Test user created successfully!")
            print("\nLogin credentials:")
            print("Email: test@example.com")
            print("Password: Test123!")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test user: {str(e)}")

if __name__ == '__main__':
    create_test_user()
