const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Please provide an icon']
  },
  animation: {
    type: String,
    default: 'left',
    enum: ['left', 'right', 'top', 'down']
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
      description: { type: String, required: true }
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
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', ServiceSchema); 
 
 
 