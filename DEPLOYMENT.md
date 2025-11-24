# Fee Management System - Deployment Guide

## 🚀 Local Deployment (Currently Running)

The application is currently deployed locally with:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: MongoDB Atlas (Connected)

## 📦 Deployment Options

### 1. Vercel (Recommended for Frontend + Serverless Backend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Features:**
- Automatic deployments from Git
- Global CDN
- Serverless functions for API
- Free tier available

### 2. Netlify (Static Frontend + Netlify Functions)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend/out
```

### 3. Railway (Full-Stack Deployment)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t fms-frontend ./frontend
docker build -t fms-backend ./backend
```

### 5. Heroku Deployment

```bash
# Install Heroku CLI
# Create two apps (one for frontend, one for backend)
heroku create fms-frontend
heroku create fms-backend

# Deploy backend
cd backend
git init
heroku git:remote -a fms-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Deploy frontend
cd ../frontend
git init
heroku git:remote -a fms-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## 🔧 Environment Variables

Make sure to set these environment variables in your deployment platform:

### Backend (.env)
```
NODE_ENV=production
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CORS_ORIGIN=your_frontend_url
```

### Frontend
```
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## 🌐 Production URLs

After deployment, your application will be available at:
- **Frontend**: `https://your-frontend-domain.com`
- **Backend API**: `https://your-backend-domain.com/api`

## 🔒 Security Considerations

1. Update CORS_ORIGIN to your production frontend URL
2. Use strong SESSION_SECRET
3. Enable HTTPS in production
4. Set secure cookies in production
5. Use environment variables for sensitive data

## 📊 Monitoring

Consider setting up:
- Application monitoring (e.g., Sentry)
- Database monitoring
- Performance monitoring
- Uptime monitoring

## 🚀 Quick Deploy Commands

### For Vercel:
```bash
vercel --prod
```

### For Netlify:
```bash
netlify deploy --prod
```

### For Railway:
```bash
railway up
```

### For Docker:
```bash
docker-compose up -d
```

Choose the deployment option that best fits your needs and infrastructure requirements.