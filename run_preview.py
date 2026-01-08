import uvicorn
import os
import sys

# Ensure current directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the actual application
from main_complete import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Preview Server on port {port}")
    print(f"📡 Listening on 0.0.0.0:{port}")
    
    # Run with reload enabled for development
    uvicorn.run(
        "main_complete:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True,
        log_level="info"
    )
