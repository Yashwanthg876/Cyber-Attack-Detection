# Use official lightweight Python 3.11 image
FROM python:3.11-slim

# Set environment variable controls
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set build CWD
WORKDIR /app

# Install system dependencies (build-essential needed for compiling C modules if required)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies first (allows caching layer if requirements don't change)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy source code and models directory
COPY . .

# Expose FastAPI listening port
EXPOSE 8000

# Command to launch FastAPI ASGI server using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
