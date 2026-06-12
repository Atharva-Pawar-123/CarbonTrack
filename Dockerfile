# Stage 1: Build the Vite frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend and combine
FROM python:3.11-slim
WORKDIR /app

# System dependencies (for python packages if needed)
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend assets to the backend's static directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose the port Cloud Run uses
EXPOSE 8080

# Command to run the application using the PORT env var (Cloud Run sets this)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
