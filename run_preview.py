import uvicorn
import os
import sys

# Ensure current directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("🔍 Initializing Backend...")

try:
    from main_complete import app
    print("✅ Application imported successfully")
except ImportError as e:
    print(f"❌ Failed to import application: {e}")
    sys.exit(1)

if __name__ == "__main__":
    # Project IDX and other cloud IDEs set PORT env var
    port = int(os.getenv("PORT", 8000))
    
    print("="*60)
    print(f"🚀 CLOUD DEPLOY BACKEND RUNNING")
    print(f"📡 LISTENING ON: 0.0.0.0:{port}")
    print("="*60)
    
    try:
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=port, 
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Server crashed: {e}")
