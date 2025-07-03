#!/bin/bash

# Production Setup Script for Medical Records Application
# This script sets up the production environment with proper security

set -e

echo "🚀 Setting up Medical Records Application for Production..."

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p secrets
mkdir -p /opt/medical_records/data/{mongodb,uploads}
mkdir -p logs

# Generate secure secrets
echo "🔐 Generating secure secrets..."

# Generate MongoDB credentials
echo "admin$(openssl rand -hex 8)" > secrets/mongo_root_username.txt
openssl rand -base64 32 > secrets/mongo_root_password.txt

# Generate JWT secret
openssl rand -base64 64 > secrets/jwt_secret.txt

# Generate MongoDB URL
MONGO_USER=$(cat secrets/mongo_root_username.txt)
MONGO_PASS=$(cat secrets/mongo_root_password.txt)
echo "mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/medical_records?authSource=admin" > secrets/mongodb_url.txt

echo "✅ Secrets generated successfully!"

# Set proper permissions
echo "🔧 Setting permissions..."
chmod 600 secrets/*
chmod -R 755 /opt/medical_records/data

# Create environment file for production
echo "📝 Creating production environment file..."
cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
ENVIRONMENT=production

# Database
MONGODB_DATABASE=medical_records

# Security
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
PROJECT_NAME=Medical Records API
API_V1_PREFIX=/api/v1

# Logging
LOG_LEVEL=INFO
EOF

# Create MongoDB initialization script
echo "🗄️  Creating MongoDB initialization script..."
mkdir -p mongo-init
cat > mongo-init/01-init.js << 'EOF'
// MongoDB Initialization Script
db = db.getSiblingDB('medical_records');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('patients');
db.createCollection('documents');
db.createCollection('medical_notes');
db.createCollection('prescriptions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.patients.createIndex({ "national_id": 1 }, { unique: true });
db.patients.createIndex({ "email": 1 });
db.documents.createIndex({ "patient_id": 1 });
db.documents.createIndex({ "created_at": -1 });
db.medical_notes.createIndex({ "patient_id": 1 });
db.medical_notes.createIndex({ "created_at": -1 });
db.prescriptions.createIndex({ "patient_id": 1 });
db.prescriptions.createIndex({ "created_at": -1 });

print("Database initialized successfully!");
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for Medical Records Application
BACKUP_DIR="/opt/medical_records/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $DATE"

# Backup MongoDB
docker exec medical_records_mongo_prod mongodump --db medical_records --out /tmp/backup_$DATE
docker cp medical_records_mongo_prod:/tmp/backup_$DATE "$BACKUP_DIR/"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/medical_records/data/uploads/

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x scripts/backup.sh

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
echo "=== Medical Records Application Status ==="
echo "Date: $(date)"
echo

# Check container status
echo "🐳 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo
echo "🔋 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo
echo "🌐 Health Checks:"
curl -s http://localhost:4081/health | jq . || echo "Backend health check failed"
curl -s http://localhost:4080/api/health | jq . || echo "Frontend health check failed"

echo
echo "📊 Log Summary (last 10 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=10
EOF

chmod +x scripts/monitor.sh

# Create deployment script
echo "🚀 Creating deployment script..."
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

set -e

echo "🚀 Deploying Medical Records Application..."

# Pull latest changes
git pull

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check health
./scripts/monitor.sh

echo "✅ Deployment completed!"
EOF

chmod +x scripts/deploy.sh

# Create systemd service for auto-start
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/medical-records.service > /dev/null << EOF
[Unit]
Description=Medical Records Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable medical-records.service

echo "✅ Production setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update secrets in ./secrets/ directory"
echo "2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Monitor: ./scripts/monitor.sh"
echo ""
echo "🔧 Management commands:"
echo "- Start:   sudo systemctl start medical-records"
echo "- Stop:    sudo systemctl stop medical-records"
echo "- Status:  sudo systemctl status medical-records"
echo "- Backup:  ./scripts/backup.sh"
echo "- Deploy:  ./scripts/deploy.sh"
echo ""
echo "⚠️  Remember to:"
echo "- Change default passwords"
echo "- Configure firewall rules"
echo "- Set up log rotation"
echo "- Configure monitoring alerts"
EOF

chmod +x scripts/setup-production.sh 