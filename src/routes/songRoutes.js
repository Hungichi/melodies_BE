const express = require('express');
const router = express.Router();
const multer = require('multer');
const songController = require('../controllers/songController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.get('/', songController.getAllSongs);
router.get('/:id', songController.getSong);

router.post('/', 
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  songController.createSong
);

router.put('/:id',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  songController.updateSong
);

router.delete('/:id', songController.deleteSong);

module.exports = router; 