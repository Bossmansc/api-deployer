FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create production .env file
RUN echo "ENVIRONMENT=production" > .env
RUN echo "PORT=10000" >> .env  # Render uses PORT 10000 by default

RUN echo "#!/bin/bash\n\
echo 'Running database migrations...'\n\
alembic upgrade head || python create_tables.py\n\
echo 'Starting server on port \$PORT...'\n\
uvicorn main:app --host 0.0.0.0 --port \${PORT:-10000} --workers 4" > start.sh

RUN chmod +x start.sh

CMD ["./start.sh"]
