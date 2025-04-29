#!/bin/sh
set -e

# Get the backend URL from environment variable or use default
BACKEND_URL=${BACKEND_URL:-http://backend:8000}

# Replace the environment variable in the nginx config
sed -i "s|\${BACKEND_URL:-http://backend:8000}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

# Execute the CMD
exec "$@"

