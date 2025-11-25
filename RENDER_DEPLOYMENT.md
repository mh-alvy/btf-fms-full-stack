# BTF Fee Management System - Render.com Deployment Guide

## 🚀 Deployment Options

### Option 1: Full-Stack Deployment (Recommended)

Deploy both frontend and backend together in a single container using PM2 process management.

1. **Create Web Service** on Render.com:
   - **Service Type**: Web Service
   - **Environment**: Docker
   - **Repository**: `https://github.com/mh-alvy/btf-fms-full-stack`
   - **Name**: `btf-fms-fullstack`
   - **Plan**: Free
   - **Dockerfile**: `Dockerfile` (uses the main Dockerfile)

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   BACKEND_PORT=3001
   MONGODB_URI=mongodb+srv://u2204118_alvy:alvy65596@cluster0.40yo9qy.mongodb.net/fee-management-system?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=your_secure_session_secret_here_minimum_32_characters
   CORS_ORIGIN=*
   NEXT_TELEMETRY_DISABLED=1
   ```

3. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy both frontend and backend
   - The service will be available at: `https://btf-fms-fullstack.onrender.com`

### Option 2: Backend-Only Deployment

Deploy just the backend API for use with external frontend.

1. **Create Backend Service** on Render.com:
   - **Service Type**: Web Service
   - **Environment**: Docker
   - **Repository**: `https://github.com/mh-alvy/btf-fms-full-stack`
   - **Name**: `btf-fms-backend`
   - **Plan**: Free
   - **Dockerfile**: `Dockerfile.backend`

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://u2204118_alvy:alvy65596@cluster0.40yo9qy.mongodb.net/fee-management-system?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=your_secure_session_secret_here_minimum_32_characters
   CORS_ORIGIN=https://btf-fms-frontend.onrender.com
   ```

3. **Deploy and Test**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Test API at: `https://btf-fms-backend.onrender.com/api/health`

### Option 3: Separate Frontend Deployment

Deploy frontend separately (requires backend to be deployed first).

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

### Full-Stack Deployment Testing

**Application Access**:
- Frontend: `https://btf-fms-fullstack.onrender.com`
- Backend API: `https://btf-fms-fullstack.onrender.com/api`

**Health Check**:
```bash
curl https://btf-fms-fullstack.onrender.com/api/health
```

**Login Test**:
```bash
curl -X POST https://btf-fms-fullstack.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**PM2 Process Monitoring** (if you have shell access):
```bash
# Check running processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### Backend-Only Testing

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

### Common Issues

**Build Failures**:
- Check logs in Render dashboard
- Ensure environment variables are set correctly
- Verify package-lock.json files exist in all directories
- Try Node.js environment instead of Docker if Docker fails

**Database Connection Issues**:
- Verify MongoDB Atlas network access (allow 0.0.0.0/0)
- Check connection string format and credentials
- Test connection locally first
- Ensure SESSION_SECRET is at least 32 characters

**PM2 Process Issues** (Full-Stack):
- Check if PM2 processes are running: `pm2 list`
- View process logs: `pm2 logs`
- Restart processes: `pm2 restart all`
- Check ecosystem.config.js configuration

**Frontend Build Errors**:
- Remove `output: 'export'` from next.config.js for server deployment
- Ensure NEXT_TELEMETRY_DISABLED=1 is set
- Check if all dependencies are properly installed

**Port Conflicts**:
- Ensure PORT environment variable is set to 10000 for Render
- Backend should use BACKEND_PORT (default: 3001)
- Frontend should use PORT (default: 3000, but Render overrides to 10000)

**CORS Errors**:
- Set CORS_ORIGIN=* for full-stack deployment
- For backend-only, set to your frontend domain
- Include both HTTP and HTTPS if needed

### Performance Optimization

**Memory Management**:
- PM2 will restart processes if memory usage exceeds 1GB
- Monitor memory usage with `pm2 monit`
- Consider using cluster mode for better performance

**Log Management**:
- Logs are stored in `/logs` directory
- Use `pm2 logs --lines 100` to view recent logs
- Log files are rotated automatically

## 🎯 Success Indicators

### Full-Stack Deployment
✅ Application accessible at `https://btf-fms-fullstack.onrender.com`
✅ Frontend loads without errors
✅ Backend API health check returns 200 OK
✅ Login functionality works through frontend
✅ PM2 processes are running (both frontend and backend)
✅ No CORS errors in browser console
✅ Database connection established

### Backend-Only Deployment
✅ Backend health check returns 200 OK at `/api/health`
✅ Login endpoint accepts admin credentials  
✅ Students API returns data at `/api/students`
✅ No database connection errors
✅ CORS headers properly configured

## 🚀 Available Endpoints

Your deployment provides these API endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - Authentication
- `POST /api/auth/logout` - Logout
- `GET /api/students` - Students data
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/payments` - Payment reports
- `POST /api/payments` - Process payments
- `GET /api/courses` - Courses data
- `GET /api/batches` - Batch data
- `GET /api/invoices` - Invoice data

## 📞 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🎉 Deployment Complete

### Full-Stack Option
**Your complete application will be available at**: `https://btf-fms-fullstack.onrender.com`
- Frontend and backend running in single container
- PM2 managing both processes
- Automatic restarts and logging

### Backend-Only Option  
**Your API will be available at**: `https://btf-fms-backend.onrender.com`
- Can be used with local frontend development
- Can be integrated with other frontend frameworks
- Suitable for mobile app backends