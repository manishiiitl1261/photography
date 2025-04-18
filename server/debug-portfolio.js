// Debug script specifically for portfolio routes
process.env.NODE_ENV = 'development';

// Add a global error handler to capture uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  console.error('Stack trace:', error.stack);
});

try {
  console.log('Starting portfolio routes debug...');
  
  // Check the adminAuth middleware
  console.log('\nChecking adminAuth middleware...');
  try {
    const adminAuth = require('./middleware/adminAuth');
    console.log('adminAuth exports:', Object.keys(adminAuth));
    console.log('adminAuth type:', typeof adminAuth);
    
    if (typeof adminAuth === 'function') {
      console.log('adminAuth is a function');
    } else if (typeof adminAuth === 'object') {
      Object.keys(adminAuth).forEach(key => {
        console.log(`  ${key} type:`, typeof adminAuth[key]);
      });
    }
  } catch (error) {
    console.error('Error loading adminAuth middleware:', error);
  }
  
  // Check multer is available
  console.log('\nChecking multer...');
  try {
    const multer = require('multer');
    console.log('✓ Multer loaded successfully');
  } catch (error) {
    console.error('✗ Error loading multer:', error);
  }
  
  // Check portfolio controller
  console.log('\nChecking portfolio controller...');
  try {
    const portfolioController = require('./controllers/portfolioController');
    console.log('Portfolio controller exports:', Object.keys(portfolioController));
    
    // Check createPortfolioItem is properly defined
    if (typeof portfolioController.createPortfolioItem === 'function') {
      console.log('✓ createPortfolioItem is properly defined as a function');
    } else {
      console.error('✗ createPortfolioItem is not a function:', typeof portfolioController.createPortfolioItem);
    }
  } catch (error) {
    console.error('Error loading portfolio controller:', error);
  }

  // Now test loading the portfolio routes
  console.log('\nLoading portfolio routes...');
  try {
    const portfolioRoutes = require('./routes/portfolioRoutes');
    console.log('✓ Portfolio routes loaded successfully');
  } catch (error) {
    console.error('✗ Error loading portfolio routes:', error);
    console.error(error.stack);
  }
  
  console.log('\nPortfolio routes debug complete');
} catch (error) {
  console.error('Debug script error:', error);
  console.error('Stack trace:', error.stack);
} 