// Test script to check controller exports
console.log('Testing controllers...');

try {
  console.log('\nLoading portfolioController...');
  const portfolioController = require('./controllers/portfolioController');
  console.log('Portfolio controller functions:');
  Object.keys(portfolioController).forEach(fn => {
    console.log(`- ${fn}: ${typeof portfolioController[fn]}`);
  });
  
  console.log('\nLoading serviceController...');
  const serviceController = require('./controllers/serviceController');
  console.log('Service controller functions:');
  Object.keys(serviceController).forEach(fn => {
    console.log(`- ${fn}: ${typeof serviceController[fn]}`);
  });
  
  console.log('\nLoading pricingController...');
  const pricingController = require('./controllers/pricingController');
  console.log('Pricing controller functions:');
  Object.keys(pricingController).forEach(fn => {
    console.log(`- ${fn}: ${typeof pricingController[fn]}`);
  });
} catch (error) {
  console.error('Error testing controllers:', error);
} 
 
 
 