const mongoose = require('mongoose');

const pricePackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  features: {
    type: [String],
    required: true
  },
  animation: {
    type: String,
    enum: ['left', 'right', 'top', 'down'],
    default: 'left'
  },
  packageType: {
    type: String,
    enum: ['standard', 'wedding'],
    default: 'standard'
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
pricePackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PricePackage = mongoose.model('PricePackage', pricePackageSchema);
module.exports = PricePackage; 
 
 
 