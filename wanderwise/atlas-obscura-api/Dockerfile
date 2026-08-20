# Use Python 3.7 instead of latest 3.9
FROM python:3.7

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libxml2-dev \
    libxslt1-dev \
    gcc \
    python3-dev \
    && apt-get clean

# Copy only the requirements first
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Expose the correct port (adjust if needed)
EXPOSE 5001

# Run API
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
