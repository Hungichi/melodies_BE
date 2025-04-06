const ArtistRequest = require('../models/ArtistRequest');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createArtistRequest = async (req, res) => {
  try {
    const { artistName, email, phone, shortDescription, biography } = req.body;
    const userId = req.user._id;

    // Kiểm tra request đang pending
    const existingRequest = await ArtistRequest.findOne({ 
      userId, 
      status: 'pending' 
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có một yêu cầu đang chờ xử lý'
      });
    }

    // Upload ảnh lên Cloudinary
    let profileImage;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'artist_profiles',
          width: 500,
          height: 500,
          crop: 'fill'
        });
        profileImage = result.secure_url;
        
        // Xóa file tạm sau khi upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên ảnh đại diện'
      });
    }

    // Tạo artist request mới
    const artistRequest = new ArtistRequest({
      userId,
      artistName,
      email,
      phone,
      shortDescription,
      biography,
      profileImage
    });

    await artistRequest.save();

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Yêu cầu của bạn đang được xem xét.',
      data: artistRequest
    });

  } catch (error) {
    console.error('Error in createArtistRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
    });
  }
};

// Lấy danh sách request cho admin
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ArtistRequest.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error in getAllRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi lấy danh sách yêu cầu'
    });
  }
};

// Approve hoặc reject request
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const request = await ArtistRequest.findByIdAndUpdate(
      requestId,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }

    const statusMessage = status === 'approved' ? 'chấp nhận' : 'từ chối';
    res.status(200).json({
      success: true,
      message: `Yêu cầu đã được ${statusMessage}`,
      data: request
    });

  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi cập nhật trạng thái'
    });
  }
};

// Lấy request của user hiện tại
exports.getUserRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const request = await ArtistRequest.findOne({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error in getUserRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra khi lấy thông tin yêu cầu'
    });
  }
}; 