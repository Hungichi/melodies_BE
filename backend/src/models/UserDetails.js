const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserDetails', userDetailsSchema); 