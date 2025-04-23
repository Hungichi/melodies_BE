const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const { 
  createArtistRequest, 
  getAllRequests, 
  updateRequestStatus,
  getUserRequest,
  updateArtistRequest
} = require('../controllers/artistRequestController');

// Cấu hình multer cơ bản nhất để test
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    fieldSize: 2 * 1024 * 1024 // 2MB cho các trường khác
  }
});

// Middleware xử lý upload đơn giản hóa
const handleUpload = (req, res, next) => {
  upload.single('profileImage')(req, res, function(err) {
    // Log để debug
    console.log('Request Headers:', req.headers);
    console.log('Content Type:', req.get('content-type'));
    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);

    if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên ảnh đại diện'
      });
    }

    // Kiểm tra mime type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận file ảnh'
      });
    }

    next();
  });
};

// Routes
router.post('/', protect, handleUpload, createArtistRequest);
router.get('/', protect, authorize('admin'), getAllRequests);
router.patch('/:requestId', protect, authorize('admin'), updateRequestStatus);
router.get('/me', protect, getUserRequest);
router.put('/:requestId', protect, upload.single('profileImage'), updateArtistRequest);

module.exports = router; 