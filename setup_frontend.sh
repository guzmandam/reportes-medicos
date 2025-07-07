#!/bin/bash

echo "🌐 Medical Records Frontend - Docker Setup"
echo "=========================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build and start the frontend service
echo "🐳 Building and starting Frontend container..."
docker-compose -f docker-compose-frontend.yml up -d --build

echo ""
echo "🎉 Frontend setup complete!"
echo ""
echo "Services are now running:"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "To stop the frontend: docker-compose -f docker-compose-frontend.yml down"
echo "To view logs: docker-compose -f docker-compose-frontend.yml logs -f"
echo ""
echo "📝 Note: Make sure your backend is running on http://localhost:81 for API calls to work" 