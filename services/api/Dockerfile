FROM python:3.12-slim

WORKDIR /app

COPY services/api/requirements-lock.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/api ./services/api
COPY docs ./docs
WORKDIR /app/services/api

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
