#!/bin/bash

# Start Backend
echo "Starting Backend Server..."
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend Server..."
cd /home/kali/Desktop/qspider/SignaSecure-Enterprise/frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Backend running on http://localhost:8000"
echo "✅ Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
