// Debug script to trace server startup errors
process.env.NODE_ENV = 'development';

try {
  console.log('Starting debug...');
  
  // Check MongoDB connection first
  try {
    console.log('Checking if MongoDB connection is the issue...');
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photography';
    console.log('Using MongoDB URI:', process.env.MONGO_URI);
  } catch (err) {
    console.error('Error setting up MongoDB:', err);
  }
  
  // First check portfolio routes
  try {
    console.log('\nTesting portfolio routes...');
    const portfolioRoutes = require('./routes/portfolioRoutes');
    console.log('✓ Portfolio routes loaded successfully');
  } catch (error) {
    console.error('✗ Error loading portfolio routes:', error);
  }
  
  // Then check service routes
  try {
    console.log('\nTesting service routes...');
    const serviceRoutes = require('./routes/serviceRoutes');
    console.log('✓ Service routes loaded successfully');
  } catch (error) {
    console.error('✗ Error loading service routes:', error);
  }
  
  // Then check pricing routes
  try {
    console.log('\nTesting pricing routes...');
    const pricingRoutes = require('./routes/pricingRoutes');
    console.log('✓ Pricing routes loaded successfully');
  } catch (error) {
    console.error('✗ Error loading pricing routes:', error);
  }
  
  // Express server setup
  try {
    console.log('\nSetting up Express app...');
    const express = require('express');
    const app = express();
    console.log('✓ Express app created');
    
    // Register routes
    app.use('/api/portfolio', require('./routes/portfolioRoutes'));
    console.log('✓ Portfolio routes registered');
    app.use('/api/services', require('./routes/serviceRoutes'));
    console.log('✓ Service routes registered');
    app.use('/api/pricing', require('./routes/pricingRoutes'));
    console.log('✓ Pricing routes registered');
    
    console.log('All routes registered successfully');
  } catch (error) {
    console.error('Error setting up Express app:', error);
  }
  
  console.log('\nNow trying full server import...');
  require('./server.js');
} catch (error) {
  console.error('Server startup error:', error);
  console.error('Stack trace:', error.stack);
} 
 