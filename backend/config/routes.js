const express = require('express');
const path = require('path');

const configureRoutes = (app) => {
  // API Routes
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/users', require('../routes/users'));
  app.use('/api/batches', require('../routes/batches'));
  app.use('/api/courses', require('../routes/courses'));
  app.use('/api/months', require('../routes/months'));
  app.use('/api/institutions', require('../routes/institutions'));
  app.use('/api/students', require('../routes/students'));
  app.use('/api/payments', require('../routes/payments'));
  app.use('/api/invoices', require('../routes/invoices'));
  app.use('/api/activities', require('../routes/activities'));
  app.use('/api/reference-options', require('../routes/reference-options'));
  app.use('/api/received-by-options', require('../routes/received-by-options'));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  // Serve the frontend app for all non-API routes (in all environments)
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../public/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(500).send('Error loading application');
      }
    });
  });
};

module.exports = configureRoutes;