FROM python:3.9-slim

WORKDIR /app

# Copy requirements file first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m appuser
USER appuser

# Expose port
EXPOSE 5000

# Run gunicorn with 4 workers
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:application", "--workers", "4"] 