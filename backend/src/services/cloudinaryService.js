const cloudinary = require('../config/cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload audio file to Cloudinary
const uploadAudio = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: 'auto',
            folder: 'melodies/songs',
            use_filename: true
        });
        console.log('Audio uploaded successfully:', {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading audio:', error);
        throw new Error(`Error uploading audio: ${error.message}`);
    }
};

// Upload image file to Cloudinary
const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'melodies/covers',
            use_filename: true
        });
        console.log('Image uploaded successfully:', {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Error uploading image: ${error.message}`);
    }
};

module.exports = {
    uploadAudio,
    uploadImage
}; 