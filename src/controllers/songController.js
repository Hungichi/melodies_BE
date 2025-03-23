const Song = require('../models/Song');
const { uploadToS3 } = require('../config/s3');

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

// Create new song
exports.createSong = async (req, res) => {
  try {
    const { title, artist, album, duration, genre, releaseDate } = req.body;
    const audioFile = req.files?.audio;
    const coverImage = req.files?.coverImage;

    if (!audioFile) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioUrl = await uploadToS3(audioFile, 'audio');
    const coverImageUrl = coverImage ? await uploadToS3(coverImage, 'covers') : null;

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
      song.audioUrl = await uploadToS3(audioFile, 'audio');
    }

    if (coverImage) {
      song.coverImage = await uploadToS3(coverImage, 'covers');
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

    await song.remove();
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 