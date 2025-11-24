# BTF Fee Management System - Render.com Deployment Guide

## 🚀 Recommended Deployment Strategy

### Step 1: Deploy Backend API First

1. **Create Backend Service** on Render.com:
   - **Service Type**: Web Service
   - **Environment**: Docker
   - **Repository**: `https://github.com/mh-alvy/btf-fms-full-stack`
   - **Name**: `btf-fms-backend`
   - **Plan**: Free
   - **Dockerfile**: `Dockerfile` (default)

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://u2204118_alvy:alvy65596@cluster0.40yo9qy.mongodb.net/fee-management-system?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=your_secure_session_secret_here
   CORS_ORIGIN=https://btf-fms-frontend.onrender.com
   ```

3. **Deploy and Test**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Test API at: `https://btf-fms-backend.onrender.com/api/health`

### Step 2: Deploy Frontend (Optional)

1. **Create Frontend Service**:
   - **Service Type**: Web Service  
   - **Environment**: Docker
   - **Repository**: Same repository
   - **Name**: `btf-fms-frontend`
   - **Plan**: Free
   - **Dockerfile**: `Dockerfile.frontend`

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://btf-fms-backend.onrender.com/api
   NEXT_TELEMETRY_DISABLED=1
   ```

## 🔧 Alternative: Node.js Backend Deployment

If Docker fails, use Node.js environment:

1. **Service Settings**:
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install --production`
   - **Start Command**: `cd backend && npm start`

2. **Same Environment Variables** as above

## 📱 API Endpoints

Your backend will provide these endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - Authentication
- `GET /api/students` - Students data
- `POST /api/payments` - Process payments
- `GET /api/payments` - Payment reports
- `GET /api/courses` - Courses data
- `GET /api/batches` - Batch data

## 🔗 Testing Your Deployment

**Backend Health Check**:
```bash
curl https://btf-fms-backend.onrender.com/api/health
```

**Login Test**:
```bash
curl -X POST https://btf-fms-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🐛 Troubleshooting

**Build Failures**:
- Check logs in Render dashboard
- Ensure environment variables are set
- Try Node.js environment instead of Docker

**Database Connection Issues**:
- Verify MongoDB Atlas network access (allow 0.0.0.0/0)
- Check connection string format
- Test connection locally first

**CORS Errors**:
- Update CORS_ORIGIN to match your frontend domain
- Include both HTTP and HTTPS if needed

## 📞 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🎯 Success Indicators

✅ Backend health check returns 200 OK
✅ Login endpoint accepts admin credentials  
✅ Students API returns data
✅ No CORS errors in browser console

Once backend is deployed successfully, you can either:
1. Use it with your local frontend (update API URL)
2. Deploy frontend separately 
3. Use a different frontend hosting service (Vercel, Netlify)

**Your API will be available at**: `https://btf-fms-backend.onrender.com`