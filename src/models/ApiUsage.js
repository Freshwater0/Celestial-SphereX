const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class ApiUsage extends Model {}

ApiUsage.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  response_time: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  request_body: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_body: {
    type: DataTypes.JSON,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rate_limit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'ApiUsage',
  tableName: 'api_usages',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['endpoint'] }
  ]
});

class ApiUsageHelper {
  static async logRequest(data) {
    return ApiUsage.create({
      user_id: data.user_id,
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.status_code,
      response_time: data.response_time,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      request_body: data.request_body,
      response_body: data.response_body,
      error: data.error,
      rate_limit: data.rate_limit
    });
  }

  static async getUserStats(userId, options = {}) {
    const { startDate, endDate, limit = 50, offset = 0, endpoint, method, statusCode } = options;

    const where = { user_id: userId };

    if (startDate && endDate) {
      where.createdAt = {
        [DataTypes.Op.gte]: startDate,
        [DataTypes.Op.lte]: endDate
      };
    }

    if (endpoint) {
      where.endpoint = endpoint;
    }

    if (method) {
      where.method = method;
    }

    if (statusCode) {
      where.status_code = statusCode;
    }

    const stats = await ApiUsage.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', 'id'), 'totalRequests'],
        [sequelize.fn('AVG', 'response_time'), 'avgResponseTime'],
        [sequelize.fn('MIN', 'response_time'), 'minResponseTime'],
        [sequelize.fn('MAX', 'response_time'), 'maxResponseTime']
      ],
      raw: true
    });

    const errorCount = await ApiUsage.count({
      where: {
        ...where,
        status_code: {
          [DataTypes.Op.gte]: 400
        }
      }
    });

    return {
      totalRequests: stats[0].totalRequests,
      avgResponseTime: stats[0].avgResponseTime,
      minResponseTime: stats[0].minResponseTime,
      maxResponseTime: stats[0].maxResponseTime,
      errorCount
    };
  }

  static async cleanup(daysToKeep = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysToKeep);

    return ApiUsage.destroy({
      where: {
        createdAt: {
          [DataTypes.Op.lt]: dateThreshold
        }
      }
    });
  }
}

module.exports = ApiUsage;
