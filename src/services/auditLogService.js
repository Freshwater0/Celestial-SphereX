const AuditLog = require('../models/AuditLog');

class AuditLogService {
  async logAdminAction(adminId, actionType, details = {}, status = 'success') {
    try {
      const logEntry = await AuditLog.create({
        adminId,
        actionType,
        details: JSON.stringify(details),
        status,
        timestamp: new Date()
      });

      return logEntry;
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Optionally, you could send this to a monitoring service
      return null;
    }
  }

  async getAdminLogs(filters = {}) {
    const { 
      adminId, 
      actionType, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      pageSize = 50 
    } = filters;

    const whereCondition = {};

    if (adminId) whereCondition.adminId = adminId;
    if (actionType) whereCondition.actionType = actionType;
    if (status) whereCondition.status = status;
    
    if (startDate && endDate) {
      whereCondition.timestamp = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereCondition,
      order: [['timestamp', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [{ model: User, attributes: ['username', 'email'] }]
    });

    return {
      logs: rows,
      total: count,
      page,
      pageSize
    };
  }

  // Cleanup old logs (e.g., delete logs older than 1 year)
  async cleanupOldLogs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await AuditLog.destroy({
      where: {
        timestamp: {
          [Op.lt]: oneYearAgo
        }
      }
    });
  }
}

module.exports = new AuditLogService();
