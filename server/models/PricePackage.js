const mongoose = require('mongoose');

const PricePackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a package title'],
    trim: true
  },
  price: {
    type: String,
    required: [true, 'Please provide a package price'],
    trim: true
  },
  features: {
    type: [String],
    required: [true, 'Please provide at least one feature']
  },
  animation: {
    type: String,
    default: 'left',
    enum: ['left', 'right', 'top', 'down']
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
  translations: {
    type: Map,
    of: new mongoose.Schema({
      title: { type: String, required: true },
      price: { type: String, required: true },
      features: { type: [String], required: true }
    }, { _id: false }),
    default: {}
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

// Update the updatedAt field before saving
PricePackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PricePackage', PricePackageSchema); 
 
 
 