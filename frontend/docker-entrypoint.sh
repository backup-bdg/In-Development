#!/bin/sh
set -e

# Get the backend URL from environment variable or use default
BACKEND_URL=${REACT_APP_API_URL:-http://backend:8000}

# Replace the environment variable in the nginx config
sed -i "s|\${BACKEND_URL:-http://backend:8000}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

# Replace environment variables in the JavaScript files
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$BACKEND_URL|g" {} \;

echo "Backend API URL set to: $BACKEND_URL"

# Execute the CMD
exec "$@"
