const corsConfig = {
  development: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'];
      
      // Allow requests with no origin (mobile apps, curl, etc.) in development
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS - Origin not in whitelist'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  },
  
  production: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : [
            'https://btf-fms-fullstack.onrender.com',
            'https://btf-fms-frontend.onrender.com',
            'https://btf-fms-backend.onrender.com',
            'https://btf-fms-full-stack-3.onrender.com'
          ];
      
      // Allow requests with no origin (mobile apps, curl, health checks, same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Allow localhost for Docker health checks and development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow any onrender.com subdomain for flexibility
      if (origin.includes('.onrender.com')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS - Origin not in whitelist'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
  }
};

module.exports = corsConfig;