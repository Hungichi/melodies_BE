const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Artist is required']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: {
      values: [
        'Pop',
        'Rock',
        'Hip-Hop',
        'R&B',
        'Electronic',
        'Classical',
        'Jazz',
        'Country',
        'Folk',
        'Blues',
        'Metal',
        'Indie',
        'K-Pop',
        'V-Pop',
        'World Music'
      ],
      message: '{VALUE} is not a valid genre'
    }
  },
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative']
  },
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  lyrics: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  plays: {
    type: Number,
    default: 0,
    min: [0, 'Plays cannot be negative']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for search functionality
songSchema.index({ title: 'text', lyrics: 'text' });

module.exports = mongoose.model('Song', songSchema);
