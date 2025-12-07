FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code is mounted via volume in docker-compose.yml for dev
# COPY . .

CMD ["python", "-m", "app.main"]
