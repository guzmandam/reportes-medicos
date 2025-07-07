#!/bin/bash

echo "🏥 Medical Records - Quick Docker Setup"
echo "======================================="

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

# Create .env file for API if it doesn't exist
if [ ! -f "api/.env" ]; then
    echo "📝 Creating API environment file..."
    mkdir -p api
    cat > api/.env << EOF
# Database Configuration
MONGODB_URL=mongodb://admin:adminpassword@mongodb:27017/medical_records?authSource=admin

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1000

# Application Configuration
PROJECT_NAME=Medical Records API
API_V1_PREFIX=/api/v1
EOF
    echo "✅ Created api/.env file"
else
    echo "✅ API .env file already exists"
fi

# Create uploads directory
mkdir -p api/uploads
echo "✅ Created uploads directory"

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Services are now running:"
echo "📊 MongoDB: localhost:27017"
echo "🗄️  Mongo Express: http://localhost:8081 (admin/admin)"
echo "🚀 FastAPI Backend: http://localhost:81"
echo "📖 API Documentation: http://localhost:81/docs"
echo ""
echo "Default login credentials:"
echo "Email: admin@example.com"
echo "Password: adminpassword"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f" 