from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database URL from environment variable
database_url = os.getenv('DATABASE_URL')

try:
    # Create engine
    engine = create_engine(database_url)
    
    # Try to connect
    with engine.connect() as connection:
        print("Successfully connected to the database!")
        
except Exception as e:
    print(f"Error connecting to the database: {e}")
