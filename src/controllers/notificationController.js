const Notification = require('../models/Notification');
const createError = require('http-errors');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, read } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (read !== undefined) {
      where.read = read === 'true';
    }

    const notifications = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      totalPages: Math.ceil(notifications.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    await notification.update({ read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { read: true },
      {
        where: {
          userId: req.user.id,
          read: false
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.destroy({
      where: {
        userId: req.user.id
      }
    });

    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    next(error);
  }
};
