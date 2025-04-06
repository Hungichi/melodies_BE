const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const { 
  createArtistRequest, 
  getAllRequests, 
  updateRequestStatus,
  getUserRequest 
} = require('../controllers/artistRequestController');

// Cấu hình multer để xử lý upload file
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// Routes
router.post('/', auth, upload.single('profileImage'), createArtistRequest);
router.get('/admin/all', auth, isAdmin, getAllRequests);
router.patch('/admin/:requestId', auth, isAdmin, updateRequestStatus);
router.get('/me', auth, getUserRequest);

module.exports = router; 