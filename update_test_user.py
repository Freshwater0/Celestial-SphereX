from app import create_app, db
from app.models import User

def update_test_user():
    app = create_app()
    with app.app_context():
        # Get the test user
        test_user = User.query.filter_by(email='test@example.com').first()
        if test_user:
            # Update user properties
            test_user.username = 'testuser'
            test_user.first_name = 'Test'
            test_user.last_name = 'User'
            test_user.is_active = True
            test_user.email_verified = True
            # Set password using the property
            test_user.password = 'Test123!'
            
            try:
                db.session.commit()
                print("Test user updated successfully!")
            except Exception as e:
                db.session.rollback()
                print(f"Error updating test user: {e}")
        else:
            print("Test user not found!")

if __name__ == '__main__':
    update_test_user()
