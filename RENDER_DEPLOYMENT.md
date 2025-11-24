# BTF Fee Management System - Render.com Deployment Guide

## 🚀 Full-Stack Deployment Options

### Option 1: Single Service (Recommended for Free Tier)
Deploy both frontend and backend as a single Docker service.

**Steps:**
1. **Create a new Web Service** on Render.com
2. **Connect your GitHub repository**: `https://github.com/mh-alvy/btf-fms-full-stack`
3. **Configure service settings:**
   - **Name**: `btf-fms-fullstack`
   - **Environment**: `Docker`
   - **Plan**: `Free`
   - **Build Command**: (leave empty - uses Dockerfile)
   - **Start Command**: (leave empty - uses Dockerfile)

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://u2204118_alvy:alvy65596@cluster0.40yo9qy.mongodb.net/fee-management-system?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=alvy5696_production_secret_change_this
   CORS_ORIGIN=https://btf-fms-fullstack.onrender.com
   NEXT_PUBLIC_API_URL=https://btf-fms-fullstack.onrender.com/api
   NEXTAUTH_URL=https://btf-fms-fullstack.onrender.com
   ```

5. **Deploy**: Click "Create Web Service"

### Option 2: Separate Services
Deploy frontend and backend as separate services.

**Backend Service:**
1. Create new Web Service
2. **Environment**: `Node`
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_uri
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=https://btf-fms-frontend.onrender.com
   ```

**Frontend Service:**
1. Create new Web Service  
2. **Environment**: `Node`
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Start Command**: `cd frontend && npm start`
5. **Environment Variables:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://btf-fms-backend.onrender.com/api
   ```

## 🔧 Environment Variables Setup

### Required Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `SESSION_SECRET`: Random string for session encryption
- `CORS_ORIGIN`: Your frontend domain(s)
- `NEXT_PUBLIC_API_URL`: Your backend API URL

### Security Notes:
- Change `SESSION_SECRET` to a strong random string
- Ensure MongoDB URI is for production database
- Update CORS origins to match your actual domains

## 📱 Frontend Routes:
- `/` - Dashboard (Login page)
- `/dashboard` - Main dashboard  
- `/fee-payment` - Payment processing
- `/reports` - Financial reports
- `/students-database` - Student management
- `/user-management` - User administration
- `/batch-management` - Batch/class management

## 🔗 API Endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/students` - Get students
- `POST /api/payments` - Process payments
- `GET /api/payments` - Get payment reports

## 🐛 Troubleshooting:

**Build Failures:**
- Ensure all `package-lock.json` files are committed
- Check environment variables are set correctly
- Verify MongoDB connection string

**CORS Errors:**
- Update `CORS_ORIGIN` environment variable
- Ensure frontend URL matches CORS settings

**Database Connection:**
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check network access settings in MongoDB Atlas

## 📞 Default Login:
- **Username**: `admin`
- **Password**: `admin123`

After deployment, access your application at the Render-provided URL!