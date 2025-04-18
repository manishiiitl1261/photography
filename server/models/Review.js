const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  event: {
    type: String,
    required: [true, 'Please provide an event'],
    maxlength: 50
  },
  text: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: 500
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  brand: {
    type: String,
    required: true,
    default: function() {
      return this.event.toUpperCase();
    }
  },
  eventImage: {
    type: String,
    default: function() {
      const eventType = this.event.toLowerCase();
      if (eventType.includes('wedding')) return '/assest/wedding1.jpg';
      if (eventType.includes('birthday')) return '/assest/birthday2.jpg';
      if (eventType.includes('corporate')) return '/assest/event1.jpg';
      if (eventType.includes('portrait')) return '/assest/user2.jpg';
      return '/assest/wedding2.jpg'; // Default image
    }
  },
  image: {
    type: String,
    default: '/assest/user1.jpg'
  },
  // User who created the review (if authenticated)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // User avatar (if authenticated)
  userAvatar: {
    type: String,
    default: '/assets/avtar.png'
  },
  approved: {
    type: Boolean,
    default: null, // null means pending, true means approved, false means rejected
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);