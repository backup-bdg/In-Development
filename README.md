# Backdoor AI

Backdoor AI is a web application that allows users to chat with an AI powered by a BERT-based ML model. The application consists of two main components:

1. **Backend Service**: Handles the ML model and provides API endpoints for the frontend
2. **Frontend Service**: Provides a beautiful UI for users to interact with the AI

## Features

- Natural language understanding and processing
- Web search integration for up-to-date information
- Beautiful and responsive UI
- Chat session export in JSON format
- Separate backend service for ML model to optimize resource usage

## Architecture

The application is designed to run as two separate services on Render.com:

1. **Backend Service**: Hosts the ML model and provides API endpoints
2. **Frontend Service**: Serves the React application and communicates with the backend

This separation allows for better resource allocation, as the ML model can be resource-intensive.

## Deployment to Render.com

### Prerequisites

- A Render.com account
- Git repository with this code

### Backend Service Deployment

1. Log in to your Render.com account
2. Click on "New" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: backdoor-ai-backend
   - **Environment**: Docker
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: backend
   - **Instance Type**: Standard (512 MB) or higher depending on model requirements
   - **Region**: Choose the region closest to your users
   - **Auto-Deploy**: Yes
5. Click "Create Web Service"

### Frontend Service Deployment

1. Click on "New" and select "Web Service"
2. Connect your Git repository (same as backend)
3. Configure the service:
   - **Name**: backdoor-ai-frontend
   - **Environment**: Docker
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: frontend
   - **Instance Type**: Free (starter) is sufficient
   - **Region**: Same as backend
   - **Auto-Deploy**: Yes
   - **Environment Variables**:
     - `REACT_APP_API_URL`: URL of your backend service (e.g., https://backdoor-ai-backend.onrender.com)
4. Click "Create Web Service"

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for frontend development)
- Python 3.9+ (for backend development)

### Running Locally

1. Clone the repository
2. Start both services using Docker Compose:

```bash
docker-compose up
```

3. Access the application at http://localhost:3000

### Development Workflow

For frontend development:

```bash
cd frontend
npm install
npm start
```

For backend development:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Documentation

Once the backend is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

This project is licensed under the MIT License - see the LICENSE file for details.

