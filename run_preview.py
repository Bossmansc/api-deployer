import uvicorn
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from main_complete import app
    print("✅ Application imported successfully")
except ImportError as e:
    print(f"❌ Failed to import application: {e}")
    sys.exit(1)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print("="*50)
    print(f"🚀 STARTING BACKEND PREVIEW")
    print(f"📡 PORT: {port}")
    print(f"🌍 HOST: 0.0.0.0 (Publicly accessible)")
    print("="*50)
    
    try:
        # host="0.0.0.0" is critical for Cloud IDEs
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=port, 
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Server crashed: {e}")
