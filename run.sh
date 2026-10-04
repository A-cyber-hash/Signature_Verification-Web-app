#!/bin/bash

# SignaSecure Enterprise - Run Both Backend and Frontend
# This script starts both servers in the background

set -e

echo "🚀 SignaSecure Enterprise - Starting Services"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Function to start backend
start_backend() {
    echo -e "${BLUE}Starting Backend Server...${NC}"
    cd "$PROJECT_ROOT/backend"
    
    # Check if venv exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Virtual environment not found. Running setup...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip setuptools wheel -q
        pip install --only-binary :all: \
            Django==4.2.7 \
            djangorestframework==3.14.0 \
            django-cors-headers==4.3.1 \
            djangorestframework-simplejwt==5.3.1 \
            python-decouple==3.8 \
            requests==2.31.0 \
            cryptography==41.0.7 \
            drf-spectacular==0.26.5 \
            gunicorn==21.2.0 \
            whitenoise==6.6.0 \
            -q
        python manage.py migrate --noinput -q
    fi
    
    source venv/bin/activate
    python manage.py runserver &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
    echo "   URL: http://localhost:8000"
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}Starting Frontend Server...${NC}"
    cd "$PROJECT_ROOT/frontend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
        npm install -q
    fi
    
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo "   URL: http://localhost:5173"
}

# Start both services
start_backend
sleep 2
start_frontend

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "${YELLOW}📝 Demo Credentials:${NC}"
echo "   Admin: admin@signasecure.com / Admin@123456"
echo "   User:  user@signasecure.com / User@123456"
echo ""
echo -e "${YELLOW}🌐 Access the application:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/api/docs/"
echo ""
echo -e "${YELLOW}🛑 To stop services:${NC}"
echo "   Press Ctrl+C"
echo ""

# Wait for all background processes
wait
