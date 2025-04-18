const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Package title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Package description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Package price is required']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Package category is required'],
    enum: ['Wedding', 'Portrait', 'Event', 'Commercial', 'Family'],
    trim: true
  },
  features: [{
    type: String,
    required: true
  }],
  duration: {
    type: String,
    required: [true, 'Package duration is required'],
    trim: true
  },
  images: {
    type: Number,
    required: [true, 'Number of images included is required']
  },
  order: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema); 
 
 
 