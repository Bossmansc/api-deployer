# Use official Python runtime
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# Install system dependencies (needed for psycopg2 and other libs)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a startup script to run migrations and start the app
RUN echo "#!/bin/bash\n\
echo 'Running database migrations...'\n\
alembic upgrade head || python create_tables.py\n\
echo 'Starting server on port \$PORT...'\n\
uvicorn main:app --host 0.0.0.0 --port \${PORT:-8000}" > start.sh

RUN chmod +x start.sh

# Run the startup script
CMD ["./start.sh"]
