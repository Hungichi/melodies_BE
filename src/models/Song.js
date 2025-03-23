const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  genre: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', songSchema); 