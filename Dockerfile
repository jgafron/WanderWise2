# Use an official Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the Flask port
EXPOSE 5000

# Set the environment variable for your Google Maps API key
# (Optional: This can be overridden at runtime using --env)
ENV GOOGLE_API_KEY=your-google-api-key-here

# Start the Flask app
CMD ["python", "app.py"]