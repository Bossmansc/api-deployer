"""
Script to create database tables directly.
Use this for SQLite initialization.
"""
from database import engine, Base
# Import all models to ensure they are registered with Base
from models import User, Project, Deployment, RefreshToken

if __name__ == "__main__":
    print(f"🔧 Creating database tables using engine: {engine.url}...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
