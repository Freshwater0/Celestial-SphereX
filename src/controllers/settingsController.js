const Settings = require('../models/Settings');
const createError = require('http-errors');

exports.getSettings = async (req, res, next) => {
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId: req.user.id }
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id
      }
    });

    const updatedSettings = await settings.update(req.body);
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};

exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id
      }
    });

    const updatedSettings = await settings.update({
      notifications: {
        ...settings.notifications,
        ...req.body
      }
    });

    res.json(updatedSettings.notifications);
  } catch (error) {
    next(error);
  }
};

exports.updateSecuritySettings = async (req, res, next) => {
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id
      }
    });

    const updatedSettings = await settings.update({
      security: {
        ...settings.security,
        ...req.body
      }
    });

    res.json(updatedSettings.security);
  } catch (error) {
    next(error);
  }
};

exports.updateWidgets = async (req, res, next) => {
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id
      }
    });

    const updatedSettings = await settings.update({
      widgets: req.body
    });

    res.json(updatedSettings.widgets);
  } catch (error) {
    next(error);
  }
};
