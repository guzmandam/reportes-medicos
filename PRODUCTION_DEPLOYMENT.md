# Production Deployment Guide

This guide covers deploying the Medical Records Application in a production environment with security, monitoring, and scalability best practices.

## 🏗️ Architecture Overview

```
Internet
    ↓
[Nginx Reverse Proxy] (Port 80/443)
    ↓
[Frontend Container] (Port 3000) ← [Backend Container] (Port 8000)
    ↓                                      ↓
[MongoDB Container] (Internal) ← [Internal Network]
```

## 🚀 Quick Production Setup

1. **Run the production setup script:**
   ```bash
   chmod +x scripts/setup-production.sh
   ./scripts/setup-production.sh
   ```

2. **Deploy the application:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Monitor the deployment:**
   ```bash
   ./scripts/monitor.sh
   ```

## 📁 File Structure

```
reportes-medicos/
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production optimized
├── Dockerfile.frontend         # Development frontend
├── Dockerfile.backend          # Development backend
├── Dockerfile.frontend.prod    # Production frontend (optimized)
├── Dockerfile.backend.prod     # Production backend (optimized)
├── nginx/
│   ├── nginx.conf             # Production Nginx config
│   └── ssl/                   # SSL certificates
├── secrets/                   # Secret files (auto-generated)
├── scripts/
│   ├── setup-production.sh    # Initial setup
│   ├── deploy.sh             # Deployment script
│   ├── backup.sh             # Backup script
│   └── monitor.sh            # Monitoring script
└── mongo-init/               # MongoDB initialization
```

## 🔐 Security Features

### ✅ Implemented Security

1. **Secrets Management**
   - No hardcoded passwords
   - Docker secrets for sensitive data
   - Secure secret generation

2. **Container Security**
   - Non-root users in containers
   - Minimal base images
   - Security updates included

3. **Network Security**
   - Internal container network
   - Only necessary ports exposed
   - Nginx rate limiting

4. **SSL/TLS**
   - HTTPS enforcement
   - Modern TLS configuration
   - Security headers

5. **Application Security**
   - JWT token authentication
   - CORS configuration
   - Input validation

### 🔧 Production Hardening

1. **Resource Limits**
   - CPU and memory constraints
   - Prevent resource exhaustion

2. **Health Checks**
   - Container health monitoring
   - Automatic restart on failure

3. **Logging**
   - Centralized logging
   - Log rotation
   - Structured log format

## 🌐 Network Configuration

### Exposed Ports
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (Nginx reverse proxy)

### Internal Services
- **Frontend**: 3000 (internal)
- **Backend**: 8000 (internal)
- **MongoDB**: 27017 (internal)

### Security Groups/Firewall Rules
```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp

# Allow HTTP traffic (for redirects)
sudo ufw allow 80/tcp

# Block all other external access
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Frontend**: `https://localhost/api/health`
- **Backend**: `https://localhost/health`
- **Overall Status**: `./scripts/monitor.sh`

### Log Monitoring
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View Nginx access logs
docker exec medical_records_nginx_prod tail -f /var/log/nginx/access.log
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# System resource usage
htop
df -h
free -m
```

## 🔄 Deployment & Updates

### Initial Deployment
```bash
# 1. Setup production environment
./scripts/setup-production.sh

# 2. Deploy application
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify deployment
./scripts/monitor.sh
```

### Rolling Updates
```bash
# Use the deployment script for zero-downtime updates
./scripts/deploy.sh
```

### Manual Deployment
```bash
# 1. Pull latest code
git pull

# 2. Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Update services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify health
./scripts/monitor.sh
```

## 💾 Backup & Recovery

### Automatic Backups
```bash
# Setup daily backups via cron
echo "0 2 * * * /path/to/project/scripts/backup.sh" | sudo crontab -
```

### Manual Backup
```bash
# Create backup
./scripts/backup.sh

# Backups are stored in: /opt/medical_records/backups/
```

### Recovery
```bash
# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Restore MongoDB data
docker run --rm -v mongodb_data:/data/db -v /path/to/backup:/backup mongo:7.0 \
  mongorestore --drop /backup

# 3. Restore uploads
sudo tar -xzf /path/to/uploads_backup.tar.gz -C /

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration Management

### Environment Variables

Production environment variables are managed through:
- `.env.production` - Non-sensitive configuration
- `secrets/` directory - Sensitive data

### SSL Certificates

Replace self-signed certificates with proper ones:
```bash
# Place your certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Database Configuration

MongoDB is configured with:
- Authentication enabled
- Proper indexes for performance
- Regular backup schedule

## 📈 Performance Optimization

### Container Resources
- **Frontend**: 256MB RAM, 0.3 CPU
- **Backend**: 512MB RAM, 0.5 CPU
- **MongoDB**: 1GB RAM, 0.5 CPU
- **Nginx**: 128MB RAM, 0.2 CPU

### Nginx Optimizations
- Gzip compression
- Static asset caching
- Connection keep-alive
- Rate limiting

### Database Optimizations
- Indexes on frequently queried fields
- Connection pooling
- Query optimization

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Check resource usage
   docker stats
   ```

2. **SSL certificate errors**
   ```bash
   # Verify certificate
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   
   # Test SSL configuration
   curl -I https://localhost
   ```

3. **Database connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose -f docker-compose.prod.yml logs mongodb
   
   # Test database connectivity
   docker exec medical_records_mongo_prod mongosh --eval "db.runCommand('ping')"
   ```

4. **High resource usage**
   ```bash
   # Monitor resources
   ./scripts/monitor.sh
   
   # Adjust resource limits in docker-compose.prod.yml
   ```

### Health Check Failures

```bash
# Check individual services
curl -f http://localhost/health
curl -f http://localhost/api/health

# Restart unhealthy services
docker-compose -f docker-compose.prod.yml restart backend
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use proper SSL certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban for intrusion detection
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup encryption
- [ ] Access control and user management

## 📋 Maintenance Tasks

### Daily
- [ ] Check application health
- [ ] Monitor resource usage
- [ ] Review error logs

### Weekly
- [ ] Update system packages
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly
- [ ] Update Docker images
- [ ] Review and rotate secrets
- [ ] Performance optimization review
- [ ] Security audit

## 🚀 Scaling Considerations

For higher traffic loads, consider:

1. **Horizontal Scaling**
   - Multiple backend containers
   - Load balancer configuration
   - Database clustering

2. **Caching**
   - Redis for session storage
   - CDN for static assets
   - Database query caching

3. **Monitoring**
   - Prometheus + Grafana
   - ELK stack for logging
   - Alerting system

## 📞 Support

For production issues:
1. Check application logs
2. Run monitoring script
3. Review this documentation
4. Check container health status

Emergency commands:
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Emergency restart
sudo systemctl restart medical-records

# View all logs
docker-compose -f docker-compose.prod.yml logs --tail=100
``` 