import uvicorn
import os
from main_complete import app

# Export app for production WSGI/ASGI servers
__all__ = ["app"]

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Host must be 0.0.0.0 for containerized environments
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
