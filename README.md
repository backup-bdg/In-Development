# Backdoor AI - ML Model Integration

This project integrates an Apple .mlmodel file (BERTSQUADFP16.mlmodel) for AI-powered chat functionality. The application consists of a React frontend and a FastAPI backend that uses the Core ML model for processing user queries.

## Features

- AI-powered chat interface
- Integration with Apple's Core ML model
- Web search capability for enhanced responses
- Responsive UI with Material-UI components
- Docker containerization for easy deployment

## Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── app/                 # Main application code
│   │   ├── model/           # Directory for the ML model
│   │   └── main.py          # FastAPI application
│   ├── download_model.py    # Script to download the model from Dropbox
│   ├── test_model.py        # Script to test the model functionality
│   ├── run.py               # Script to run the backend locally
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Docker configuration for backend
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── Dockerfile           # Docker configuration for frontend
│   ├── nginx.conf           # Nginx configuration
│   └── docker-entrypoint.sh # Docker entrypoint script
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # Project documentation
```

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)
- Python 3.9+ (for local development)
- A Dropbox link to the BERTSQUADFP16.mlmodel file

## Setup Instructions

### 1. Configure the Dropbox Link

Edit the `backend/download_model.py` file and update the `DROPBOX_LINK` variable with your Dropbox direct download link:

```python
DROPBOX_LINK = "https://www.dropbox.com/scl/fi/your-file-path/BERTSQUADFP16.mlmodel?dl=1"
```

Make sure the link ends with `?dl=1` to enable direct download.

### 2. Running with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the containers
docker-compose up --build

# To run in detached mode
docker-compose up -d --build
```

This will:
- Build the backend and frontend containers
- Download the ML model from Dropbox
- Start the services
- Make the application available at http://localhost:3000

### 3. Running Locally for Development

#### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download the model
python download_model.py

# Run the backend
python run.py
```

The backend will be available at http://localhost:8000.

#### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000 and will proxy API requests to the backend.

## API Endpoints

- `GET /`: Health check endpoint
- `POST /api/query`: Process a query using the ML model
- `POST /api/chat/session`: Create a new chat session
- `POST /api/chat/{session_id}`: Add a message to a chat session and get a response
- `GET /api/chat/{session_id}/export`: Export a chat session as JSON

## Troubleshooting

### Model Download Issues

If the model fails to download:

1. Check that your Dropbox link is valid and accessible
2. Ensure the link ends with `?dl=1` for direct download
3. Try downloading the model manually and placing it in `backend/app/model/BERTSQUADFP16.mlmodel`

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Check that both services are running
2. Verify the API URL configuration in the frontend
3. Check for CORS issues in the browser console

### Model Loading Issues

If the model fails to load:

1. Ensure the model file exists in the correct location
2. Check the backend logs for specific error messages
3. Verify that the model format is compatible with the coremltools version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

