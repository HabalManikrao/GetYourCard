FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for Pillow are already present in slim for common formats.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Storage + sqlite live under /data (mount a volume to persist).
ENV SM_STORAGE_DIR=/data/storage \
    SM_DATABASE_URL=sqlite:////data/shubha_muhurta.db
RUN mkdir -p /data/storage

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
