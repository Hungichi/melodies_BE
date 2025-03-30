const Song = require('../models/Song');
const cloudinary = require('../config/cloudinary');

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: folder,
            resource_type: 'auto',
        });
        return result.secure_url;
    } catch (error) {
        throw new Error(`Error uploading to Cloudinary: ${error.message}`);
    }
};

// Get all songs with filters and pagination
exports.getAllSongs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const genre = req.query.genre;
        const search = req.query.search;
        const sort = req.query.sort || '-createdAt';

        let query = {};

        // Apply filters
        if (genre) {
            query.genre = genre;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const songs = await Song.find(query)
            .populate('artist', 'username')
            .populate('album', 'title')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        // Get total count for pagination
        const total = await Song.countDocuments(query);

        res.json({
            success: true,
            data: songs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get single song
exports.getSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
            .populate('artist', 'username')
            .populate('album', 'title')
            .populate('comments.user', 'username');

        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found',
            });
        }

        // Increment play count
        song.plays += 1;
        await song.save();

        res.json({
            success: true,
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Create new song
exports.createSong = async (req, res) => {
    try {
        const { title, genre, duration, lyrics, album } = req.body;
        const audioFile = req.files?.audio;
        const coverImage = req.files?.coverImage;

        if (!audioFile) {
            return res.status(400).json({
                success: false,
                message: 'Audio file is required',
            });
        }

        const audioUrl = await uploadToCloudinary(audioFile, 'audio');
        const coverImageUrl = coverImage
            ? await uploadToCloudinary(coverImage, 'covers')
            : null;

        const song = await Song.create({
            title,
            artist: req.user._id,
            album,
            genre,
            duration,
            lyrics,
            audioUrl,
            coverImage: coverImageUrl,
        });

        res.status(201).json({
            success: true,
            message: 'Song created successfully',
            data: song,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update song
exports.updateSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found',
            });
        }

        // Check if user is the artist or admin
        if (
            song.artist.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this song',
            });
        }

        const { title, genre, duration, lyrics, album } = req.body;
        const audioFile = req.files?.audio;
        const coverImage = req.files?.coverImage;

        if (title) song.title = title;
        if (genre) song.genre = genre;
        if (duration) song.duration = duration;
        if (lyrics) song.lyrics = lyrics;
        if (album) song.album = album;

        if (audioFile) {
            song.audioUrl = await uploadToCloudinary(audioFile, 'audio');
        }

        if (coverImage) {
            song.coverImage = await uploadToCloudinary(coverImage, 'covers');
        }

        const updatedSong = await song.save();

        res.json({
            success: true,
            message: 'Song updated successfully',
            data: updatedSong,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete song
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found',
            });
        }

        // Check if user is the artist or admin
        if (
            song.artist.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this song',
            });
        }

        // Delete files from Cloudinary
        if (song.audioUrl) {
            const publicId = song.audioUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`audio/${publicId}`);
        }
        if (song.coverImage) {
            const publicId = song.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`covers/${publicId}`);
        }

        await song.remove();

        res.json({
            success: true,
            message: 'Song deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Like/Unlike song
exports.toggleLike = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found',
            });
        }

        const likeIndex = song.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            song.likes.push(req.user._id);
        } else {
            song.likes.splice(likeIndex, 1);
        }

        await song.save();

        res.json({
            success: true,
            message:
                likeIndex === -1
                    ? 'Song liked successfully'
                    : 'Song unliked successfully',
            data: {
                likes: song.likes.length,
                isLiked: likeIndex === -1,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Add comment to song
exports.addComment = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found',
            });
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required',
            });
        }

        song.comments.push({
            user: req.user._id,
            text,
        });

        await song.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: song.comments[song.comments.length - 1],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get trending songs
exports.getTrendingSongs = async (req, res) => {
    try {
        const songs = await Song.find()
            .sort({ plays: -1 })
            .limit(10)
            .populate('artist', 'username')
            .populate('album', 'title');

        res.json({
            success: true,
            data: songs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
