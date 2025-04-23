const UserDetails = require('../models/UserDetails');
const jwt = require('jsonwebtoken');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const mongoose = require('mongoose');
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists."
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Create user details (optional)
    const userDetails = await UserDetails.create({
      userId: user._id
    });

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', user ? user.email : 'not found');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
        algorithm: 'HS256'  // Explicitly specify the algorithm
      }
    );
    console.log('Generated token:', token);
    console.log('Using JWT Secret:', process.env.JWT_SECRET);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // Fetch user from User collection
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User ID:', user._id);

    // Fetch user details from UserDetails collection
    const userDetails = await UserDetails.findOne({
      userId: new mongoose.Types.ObjectId(user._id),
    });

    // Log userDetails to check if it's null or empty
    console.log('UserDetails:', userDetails);

    if (!userDetails) {
      console.log('No additional user details found.');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        premiumExpireAt: user.premiumExpireAt,
        favoriteSongs: user.favoriteSongs,
        favoriteArtists: user.favoriteArtists,
        playlists: user.playlists,
        createdAt: user.createdAt,
        ...(userDetails ? userDetails.toObject() : {}), // If userDetails exists, merge it, else use an empty object
      },
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Your update profile route
exports.updateProfile = [
  async (req, res) => {
    try {
      const { userId, fullName, dateOfBirth, bio, location, profileImage } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const updatedFields = {
        fullName,
        dateOfBirth,
        bio,
        location
      };

      // If the profile image is passed as a string, update the profileImage field
      if (profileImage) {
        updatedFields.profileImage = profileImage;
      }

      const userDetails = await UserDetails.findOneAndUpdate(
        { userId },
        { $set: updatedFields },
        { new: true, upsert: true }
      );

      res.status(200).json({ message: 'Profile updated', userDetails });
    } catch (error) {
      console.error('Update profile error:', error.message);
      console.error(error.stack);
      res.status(500).json({ message: 'Server error' });
    }
  }
];