# DevTracker - Deployment Guide

## 🚀 Development Setup

### Prerequisites
- Node.js v16+
- MongoDB (Atlas or Local)
- Docker & Docker Compose (optional)

### Quick Start
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose
```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **Frontend**: http://localhost (Nginx)
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

---

## ☁️ Cloud Deployment

### Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku
   heroku login
   ```

2. **Create Apps**
   ```bash
   heroku create your-app-backend
   heroku create your-app-frontend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_secret
   ```

4. **Deploy**
   ```bash
   # Backend
   git subtree push --prefix backend heroku main
   
   # Frontend
   git subtree push --prefix frontend heroku main
   ```

### AWS EC2

1. **SSH to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm mongodb
   ```

3. **Setup Application**
   ```bash
   git clone your-repo
   cd dev-task-tracker

   # Backend
   cd backend && npm install && npm start &

   # Frontend
   cd frontend && npm install && npm run build
   # Serve with Nginx
   ```

4. **Setup Nginx**
   ```bash
   sudo apt install nginx
   sudo systemctl start nginx
   ```

### DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Connect GitHub repository
3. Configure:
   - Frontend: Node.js buildpack, `npm start`
   - Backend: Node.js buildpack, `npm start`
4. Set environment variables
5. Deploy

---

## 📊 Production Checklist

- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Set `CORS_ORIGIN` to production domain
- [ ] Enable HTTPS (SSL certificate)
- [ ] Setup MongoDB backup
- [ ] Configure monitoring & logging
- [ ] Setup error tracking (Sentry)
- [ ] Enable rate limiting
- [ ] Setup CI/CD pipeline
- [ ] Database indexing optimized
- [ ] Environment variables in `.env.production`

---

## 🔐 Security Checklist

- [ ] No `.env` files in git
- [ ] Passwords hashed with bcryptjs
- [ ] JWT tokens with expiration
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection protection
- [ ] XSS protection
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Secrets stored securely

---

## 📈 Scaling Considerations

### Database
- Add MongoDB replica set for high availability
- Implement read replicas
- Setup automated backups

### Backend
- Implement caching (Redis)
- Use load balancer (Nginx, HAProxy)
- Horizontal scaling with multiple instances
- Setup message queue (Bull, RabbitMQ)

### Frontend
- CDN for static assets (CloudFlare, AWS CloudFront)
- Image optimization
- Code splitting
- Lazy loading

---

## 🛠️ Monitoring & Logging

### Application Monitoring
```bash
# PM2 for Node.js process management
npm install -g pm2
pm2 start backend/src/server.js
pm2 logs
```

### Log Aggregation
- Setup ELK Stack (Elasticsearch, Logstash, Kibana)
- Or use cloud service (CloudWatch, Stackdriver)

### Error Tracking
- Sentry: https://sentry.io
- Rollbar: https://rollbar.com
- LogRocket: https://logrocket.com

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy to server
        run: npm run deploy
```

---

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test API: `curl http://localhost:5000/api/health`
4. Check database connection

---

**Last Updated**: 2026-08-29
