require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

// Print the connection string (with password masked)
const maskedUri = process.env.MONGO_URI 
  ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:****@')
  : 'MONGO_URI is undefined';

console.log('Connection string:', maskedUri);

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful!');
    return mongoose.connection.close();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

testConnection();