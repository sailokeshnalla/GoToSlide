FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by python-pptx / PyMuPDF / LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY . .

# Expose the backend port
EXPOSE 8000

# Run gunicorn with uvicorn workers
CMD ["gunicorn", "app:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
