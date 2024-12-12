const Widget = require('../models/Widget');
const createError = require('http-errors');

exports.getWidgets = async (req, res, next) => {
  try {
    const widgets = await Widget.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']]
    });

    res.json(widgets);
  } catch (error) {
    next(error);
  }
};

exports.createWidget = async (req, res, next) => {
  try {
    const widget = await Widget.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(widget);
  } catch (error) {
    next(error);
  }
};

exports.updateWidget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const widget = await Widget.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!widget) {
      throw createError(404, 'Widget not found');
    }

    const updatedWidget = await widget.update(req.body);
    res.json(updatedWidget);
  } catch (error) {
    next(error);
  }
};

exports.deleteWidget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const widget = await Widget.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!widget) {
      throw createError(404, 'Widget not found');
    }

    await widget.destroy();
    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateWidgetPositions = async (req, res, next) => {
  try {
    const { positions } = req.body;

    // Validate positions array
    if (!Array.isArray(positions)) {
      throw createError(400, 'Positions must be an array');
    }

    // Update each widget position
    await Promise.all(
      positions.map(({ id, position }) =>
        Widget.update(
          { position },
          {
            where: {
              id,
              userId: req.user.id
            }
          }
        )
      )
    );

    const updatedWidgets = await Widget.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']]
    });

    res.json(updatedWidgets);
  } catch (error) {
    next(error);
  }
};

exports.toggleWidgetActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const widget = await Widget.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!widget) {
      throw createError(404, 'Widget not found');
    }

    const updatedWidget = await widget.update({
      active: !widget.active
    });

    res.json(updatedWidget);
  } catch (error) {
    next(error);
  }
};
