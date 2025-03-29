const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Artist is required'],
        },
        album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Album',
        },
        genre: {
            type: String,
            required: [true, 'Genre is required'],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
        },
        audioUrl: {
            type: String,
            required: [true, 'Audio URL is required'],
        },
        coverImage: {
            type: String,
        },
        lyrics: {
            type: String,
        },
        releaseDate: {
            type: Date,
            default: Date.now,
        },
        plays: {
            type: Number,
            default: 0,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for search
songSchema.index({ title: 'text', genre: 'text' });

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
