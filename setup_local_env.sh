#!/bin/bash

# # Create .env file from sample if it doesn't exist
# if [ ! -f api/.env ]; then
#   echo "Creating .env file from sample..."
#   cp api/env.sample api/.env
#   echo "Please edit api/.env if needed before continuing."
#   read -p "Press enter to continue..."
# fi

# Start Docker containers
echo "Starting MongoDB containers..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 5

echo "==============================================="
echo "Local development environment is now ready:"
echo "- MongoDB running on localhost:27017"
echo "- MongoDB Express available at http://localhost:8081"
echo "- API configured to use local MongoDB"
echo ""
echo "To start the API, run:"
echo "  cd api"
echo "  python -m venv venv"
echo "  source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "  pip install -r requirements.txt"
echo "  python run.py"
echo "===============================================" 