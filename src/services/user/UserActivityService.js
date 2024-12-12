const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserActivityService {
  async logActivity(userId, activityType, description, metadata = null, ipAddress = null, userAgent = null) {
    try {
      const activity = await prisma.userActivity.create({
        data: {
          userId,
          activityType,
          description,
          metadata,
          ipAddress,
          userAgent,
        },
      });

      return activity;
    } catch (error) {
      console.error('Activity logging error:', error);
      throw error;
    }
  }

  async getUserActivities(userId, options = {}) {
    const {
      limit = 10,
      offset = 0,
      activityType = null,
      startDate = null,
      endDate = null,
    } = options;

    try {
      const whereClause = {
        userId,
        ...(activityType && { activityType }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      const activities = await prisma.userActivity.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return activities;
    } catch (error) {
      console.error('Get user activities error:', error);
      throw error;
    }
  }

  async getActivityStats(userId) {
    try {
      const stats = await prisma.userActivity.groupBy({
        by: ['activityType'],
        where: {
          userId,
        },
        _count: {
          activityType: true,
        },
      });

      return stats;
    } catch (error) {
      console.error('Get activity stats error:', error);
      throw error;
    }
  }

  async cleanupOldActivities(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await prisma.userActivity.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
    } catch (error) {
      console.error('Activity cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new UserActivityService();
