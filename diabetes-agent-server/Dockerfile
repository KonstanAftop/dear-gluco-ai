# Multi-stage build for DearGluco.ai Diabetes Agent
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN groupadd -r diabetes && useradd -r -g diabetes -s /bin/bash diabetes
RUN chown -R diabetes:diabetes /app
USER diabetes

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import config; print('Agent healthy')" || exit 1

# Expose port for Prometheus metrics (if enabled)
EXPOSE 8080

# Default command
CMD ["python", "run_agent.py"]

# Production stage
FROM base as production

# Additional production configurations
ENV LOG_LEVEL=INFO
ENV DEBUG=false

# Development stage
FROM base as development

# Development-specific packages
RUN pip install --no-cache-dir \
    pytest \
    pytest-asyncio \
    black \
    flake8 \
    mypy

ENV DEBUG=true
ENV LOG_LEVEL=DEBUG

CMD ["python", "run_agent.py"]