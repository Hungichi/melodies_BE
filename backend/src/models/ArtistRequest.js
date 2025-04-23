const mongoose = require('mongoose');

const artistRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stageName: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true,
    minLength: [2, 'Stage name must be at least 2 characters long'],
    maxLength: [50, 'Stage name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  bio: {
    type: String,
    required: [true, 'Vui lòng cung cấp tiểu sử ngắn']
  },
  profileImageUrl: {
    type: String,
    required: [true, 'Vui lòng cung cấp ảnh đại diện']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// Middleware để đảm bảo email trùng với email của user
artistRequestSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.email !== this.email) {
      throw new Error('Email must match with your account email');
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('ArtistRequest', artistRequestSchema); 