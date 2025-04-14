const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: {
      validator: function(password) {
        // Password must have at least one uppercase, one lowercase, and one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  avatar: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Fields for email verification
  verificationOTP: String,
  verificationOTPExpires: Date,
  // End of email verification fields
  // Fields for refresh token
  refreshToken: String,
  refreshTokenExpiresAt: Date,
  // End of refresh token fields
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  accountLockedUntil: Date,
  lastLogin: Date,
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        amount: Number,
        type: String, // 'credit' or 'debit'
        description: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  // Make sure password meets requirements
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(this.password)) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Update last password change
  this.lastPasswordChange = Date.now();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
UserSchema.methods.handleLoginAttempt = async function(isSuccessful) {
  if (isSuccessful) {
    // Reset counter on successful login
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.accountLockedUntil = undefined;
    this.lastLogin = Date.now();
    await this.save();
    return true;
  } else {
    // Increment counter on failed login
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.accountLocked = true;
      
      // Lock for 30 minutes
      const lockTime = new Date();
      lockTime.setMinutes(lockTime.getMinutes() + 30);
      this.accountLockedUntil = lockTime;
    }
    
    await this.save();
    return false;
  }
};

// Generate and set OTP for verification
UserSchema.methods.generateVerificationOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiry (default 10 minutes)
  this.verificationOTP = otp;
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || 10);
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
  this.verificationOTPExpires = expiryTime;
  
  return otp;
};

// Verify OTP method
UserSchema.methods.verifyOTP = function(otp) {
  // Check if OTP matches and hasn't expired
  if (!this.verificationOTP || !this.verificationOTPExpires) {
    return false;
  }
  
  if (this.verificationOTP !== otp) {
    return false;
  }
  
  if (this.verificationOTPExpires < new Date()) {
    return false;
  }
  
  // Clear OTP fields and mark as verified
  this.verificationOTP = undefined;
  this.verificationOTPExpires = undefined;
  this.isVerified = true;
  
  return true;
};

module.exports = mongoose.model('User', UserSchema); 