const Profile = require('../models/Profile');
const User = require('../models/User');
const { ValidationError } = require('sequelize');
const createError = require('http-errors');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['email', 'username']
      }]
    });

    if (!profile) {
      throw createError(404, 'Profile not found');
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const [profile, created] = await Profile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        ...req.body,
        userId: req.user.id
      }
    });

    if (!created) {
      await profile.update(req.body);
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof ValidationError) {
      next(createError(400, error.message));
    } else {
      next(error);
    }
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'No file uploaded');
    }

    const profile = await Profile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      throw createError(404, 'Profile not found');
    }

    // Assuming you have a file upload service that returns a URL
    const avatarUrl = req.file.path;
    await profile.update({ avatar: avatarUrl });

    res.json({ avatarUrl });
  } catch (error) {
    next(error);
  }
};

exports.deleteAvatar = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      throw createError(404, 'Profile not found');
    }

    await profile.update({ avatar: null });
    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    next(error);
  }
};
