# Docker Setup Guide for Medical Records Application

This guide explains how to run the Medical Records application stack using Docker in a VM environment.

## Overview

The application consists of:
- **Frontend**: Next.js application (React + TypeScript + Tailwind CSS)
- **Backend**: FastAPI application (Python + MongoDB)
- **Database**: MongoDB with optional Mongo Express admin interface

## Ports Configuration

- **Frontend**: `http://localhost:4080` (external port 4080 → internal port 3000)
- **Backend API**: `http://localhost:4081` (external port 4081 → internal port 8000)
- **Database**: Internal only (not exposed to host)
- **Mongo Express**: Internal only (can be enabled for debugging)

## Prerequisites

1. Docker and Docker Compose installed on your VM
2. At least 2GB of available RAM
3. At least 5GB of free disk space

## Quick Start

1. Clone the repository to your VM:
   ```bash
   git clone <repository-url>
   cd reportes-medicos
   ```

2. Build and start all services:
   ```bash
   docker-compose up --build
   ```

3. Wait for all services to start (this may take a few minutes on first run)

4. Access the application:
   - Frontend: http://localhost:4080
   - Backend API: http://localhost:4080/api/v1
   - API Documentation: http://localhost:4081/docs

## Detailed Commands

### Build and Start Services
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode (background)
docker-compose up -d --build

# Start only specific services
docker-compose up frontend backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete database data)
docker-compose down -v
```

### View Logs
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

### Database Management

#### Access MongoDB directly
```bash
# Connect to MongoDB container
docker exec -it medical_records_mongo mongosh

# In mongosh, connect to the database:
use medical_records
show collections
```

#### Enable Mongo Express (Database Web UI)
To enable the web-based database admin interface, uncomment the ports section in `docker-compose.yml`:

```yaml
mongo-express:
  # ... other config ...
  ports:
    - "8081:8081"  # Uncomment this line
```

Then restart: `docker-compose up -d`
Access at: http://localhost:8081

## Configuration

### Environment Variables

The application uses the following environment variables (configured in docker-compose.yml):

#### Backend Environment
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens (change in production!)
- `JWT_ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

#### Frontend Environment
- `NODE_ENV`: Set to production
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Persistent Data

- **Database Data**: Stored in Docker volume `mongodb_data`
- **File Uploads**: Stored in `./api/uploads` (mapped to container)

## Development vs Production

### Development Setup
For development, you might want to:
1. Enable Mongo Express by uncommenting its ports
2. Mount source code as volumes for hot reload
3. Use development environment variables

### Production Setup
For production:
1. Change the JWT secret key in docker-compose.yml
2. Use proper SSL certificates
3. Configure proper backup for the mongodb_data volume
4. Use environment files instead of hardcoded values

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 4080 or 4081 are already in use, change them in docker-compose.yml

2. **Permission issues**: Ensure the docker user has access to the project directory

3. **Memory issues**: Increase VM memory if builds fail

4. **Database connection issues**: Ensure MongoDB container is running before backend starts

### Health Checks

Check if services are running:
```bash
# Check container status
docker-compose ps

# Check specific service health
curl http://localhost:4081/
curl http://localhost:4080/
```

### Reset Everything
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove all build cache
docker system prune -a

# Start fresh
docker-compose up --build
```

## Performance Optimization

1. **Build Cache**: The Dockerfiles are optimized for layer caching
2. **Multi-stage Builds**: Frontend uses multi-stage build for smaller production image
3. **Volume Mounts**: Database and uploads use volumes for persistence

## Security Notes

1. **Default Passwords**: Change all default passwords in production
2. **JWT Secret**: Use a strong, random JWT secret key
3. **Network**: Only frontend and backend ports are exposed
4. **Database**: MongoDB is not exposed to the host network

## Backup and Recovery

### Backup Database
```bash
# Create backup
docker exec medical_records_mongo mongodump --db medical_records --out /tmp/backup
docker cp medical_records_mongo:/tmp/backup ./backup
```

### Restore Database
```bash
# Restore backup
docker cp ./backup medical_records_mongo:/tmp/backup
docker exec medical_records_mongo mongorestore /tmp/backup
```

## Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build
```

### Update Dependencies
Rebuild the images when package.json or requirements.txt change:
```bash
docker-compose build --no-cache
docker-compose up
```

## Support

For issues related to:
- **Docker setup**: Check this document and Docker logs
- **Application bugs**: Check application logs in the containers
- **Database issues**: Check MongoDB logs and connection strings 