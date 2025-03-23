const Song = require('../models/Song');
const cloudinary = require('../config/cloudinary');

// Get all songs
exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single song
exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Create new song
exports.createSong = async (req, res) => {
  try {
    const { title, artist, album, duration, genre, releaseDate } = req.body;
    const audioFile = req.files?.audio;
    const coverImage = req.files?.coverImage;

    if (!audioFile) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioUrl = await uploadToCloudinary(audioFile, 'audio');
    const coverImageUrl = coverImage ? await uploadToCloudinary(coverImage, 'covers') : null;

    const song = new Song({
      title,
      artist,
      album,
      duration,
      genre,
      releaseDate,
      audioUrl,
      coverImage: coverImageUrl
    });

    const newSong = await song.save();
    res.status(201).json(newSong);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update song
exports.updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const { title, artist, album, duration, genre, releaseDate } = req.body;
    const audioFile = req.files?.audio;
    const coverImage = req.files?.coverImage;

    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (album) song.album = album;
    if (duration) song.duration = duration;
    if (genre) song.genre = genre;
    if (releaseDate) song.releaseDate = releaseDate;

    if (audioFile) {
      song.audioUrl = await uploadToCloudinary(audioFile, 'audio');
    }

    if (coverImage) {
      song.coverImage = await uploadToCloudinary(coverImage, 'covers');
    }

    const updatedSong = await song.save();
    res.json(updatedSong);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete song
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete files from Cloudinary if they exist
    if (song.audioUrl) {
      const publicId = song.audioUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`audio/${publicId}`);
    }
    if (song.coverImage) {
      const publicId = song.coverImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`covers/${publicId}`);
    }

    await song.remove();
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 