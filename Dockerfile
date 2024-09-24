# Stage 1: Build the frontend
FROM oven/bun:1 as frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile
COPY frontend ./
RUN bun run build

# Stage 2: Set up the Python environment and copy the built frontend
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy project files except /frontend
COPY . /app
RUN rm -rf /app/frontend

# Copy built frontend from the frontend-builder stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Project initialization:
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-dev

# Run the chat server with specified arguments
CMD poetry run chat_server -d ddn -u "$SQL_URL" -H 'x-hasura-role: admin'
