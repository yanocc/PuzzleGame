#!/bin/bash
echo "Server..."
echo ""
echo "Opening game in your browser..."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo ""

# Start server in background
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open browser (works on Mac and most Linux)
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:8000
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:8000
fi

echo ""
echo "Game is now running in your browser!"
echo "Keep this window open while playing."
echo ""

# Wait for user to press Ctrl+C
wait $SERVER_PID