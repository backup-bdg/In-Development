FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create model directory
RUN mkdir -p /app/app/model

# Download the model
RUN python download_model.py

# Create a non-root user and switch to it
RUN useradd -m appuser
# Give ownership of the model directory to appuser
RUN chown -R appuser:appuser /app

USER appuser

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
