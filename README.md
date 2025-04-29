# Backdoor AI - CoreML Chat Application

A web application that uses Apple's CoreML model to provide AI chat functionality.

## Overview

This application consists of:

- **Backend**: A FastAPI server that loads and uses a CoreML model for processing chat messages
- **Frontend**: A React application that provides a user-friendly chat interface

## Prerequisites

- Python 3.8+
- Node.js 14+
- Docker and Docker Compose (optional, for containerized deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set Up the CoreML Model

The application requires a CoreML model file (`BERTSQUADFP16.mlmodel`) to function. You need to provide a Dropbox direct download link to your model file.

#### Option 1: Using the Setup Script

```bash
cd backend
python setup_model.py --dropbox-link "https://www.dropbox.com/your-direct-download-link?dl=1"
```

This script will:
- Update the Dropbox link in the configuration
- Download the model
- Verify that the model works correctly

#### Option 2: Manual Setup

1. Update the Dropbox link in `backend/download_model.py`:
   ```python
   DROPBOX_LINK = "https://www.dropbox.com/your-direct-download-link?dl=1"
   ```

2. Download the model:
   ```bash
   cd backend
   python download_model.py
   ```

3. Verify the model:
   ```bash
   python verify_model.py
   ```

### 3. Start the Backend Server

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The backend server will start at http://localhost:8000

### 4. Start the Frontend Application

```bash
cd frontend
npm install
npm start
```

The frontend application will start at http://localhost:3000

## Docker Deployment

You can also deploy the application using Docker Compose:

```bash
docker-compose up -d
```

This will start both the backend and frontend services in containers.

## Troubleshooting

### Model Not Loading

If the model is not loading correctly:

1. Verify that the model file exists:
   ```bash
   cd backend
   python verify_model.py
   ```

2. Check the backend logs for any errors:
   ```bash
   cd backend
   python run.py
   ```

3. Make sure the Dropbox link is a direct download link (ends with `?dl=1`)

### Chat Not Working

If the chat functionality is not working:

1. Check the browser console for any errors
2. Verify that the backend is running and accessible
3. Check the backend health endpoint: http://localhost:8000/
4. Try restarting both the backend and frontend services

## API Documentation

The backend API documentation is available at http://localhost:8000/docs when the server is running.

## License

[Your License Information]

