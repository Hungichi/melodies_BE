const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllSongs,
    getSong,
    createSong,
    updateSong,
    deleteSong,
    toggleLike,
    addComment,
    getTrendingSongs,
} = require('../controllers/songController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Get all songs
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: List of all songs
 */
router.get('/', getAllSongs);

/**
 * @swagger
 * /api/songs/trending:
 *   get:
 *     summary: Get trending songs
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: List of trending songs
 */
router.get('/trending', getTrendingSongs);

/**
 * @swagger
 * /api/songs/{id}:
 *   get:
 *     summary: Get a song by ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Song details
 *       404:
 *         description: Song not found
 */
router.get('/:id', getSong);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/songs/{id}/like:
 *   post:
 *     summary: Toggle like on a song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status updated
 *       401:
 *         description: Not authorized
 */
router.post('/:id/like', toggleLike);

/**
 * @swagger
 * /api/songs/{id}/comments:
 *   post:
 *     summary: Add a comment to a song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Not authorized
 */
router.post('/:id/comments', addComment);

/**
 * @swagger
 * /api/songs:
 *   post:
 *     summary: Create a new song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - audioFile
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               audioFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Song created successfully
 *       401:
 *         description: Not authorized
 */
router.post(
    '/',
    authorize('artist', 'admin'),
    upload.single('audioFile'),
    createSong
);

/**
 * @swagger
 * /api/songs/{id}:
 *   put:
 *     summary: Update a song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *     responses:
 *       200:
 *         description: Song updated successfully
 *       401:
 *         description: Not authorized
 */
router.put('/:id', authorize('artist', 'admin'), updateSong);

/**
 * @swagger
 * /api/songs/{id}:
 *   delete:
 *     summary: Delete a song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Song deleted successfully
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', authorize('artist', 'admin'), deleteSong);

module.exports = router;
