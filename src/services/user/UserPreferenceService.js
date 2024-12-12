const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserPreferenceService {
  async getPreferences(userId) {
    try {
      const preferences = await prisma.userPreference.findUnique({
        where: { userId },
      });

      return preferences || this.createDefaultPreferences(userId);
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  async createDefaultPreferences(userId) {
    try {
      return await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            subscription: true,
            security: true,
          },
          dashboardLayout: {
            widgets: ['recentReports', 'subscriptionStatus', 'quickActions'],
            layout: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Create preferences error:', error);
      throw error;
    }
  }

  async updatePreferences(userId, updates) {
    try {
      const preferences = await prisma.userPreference.upsert({
        where: { userId },
        update: updates,
        create: {
          userId,
          ...updates,
        },
      });

      return preferences;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  async updateTheme(userId, theme) {
    return this.updatePreferences(userId, { theme });
  }

  async updateLanguage(userId, language) {
    return this.updatePreferences(userId, { language });
  }

  async updateTimezone(userId, timezone) {
    return this.updatePreferences(userId, { timezone });
  }

  async updateNotifications(userId, notifications) {
    return this.updatePreferences(userId, { notifications });
  }

  async updateDashboardLayout(userId, dashboardLayout) {
    return this.updatePreferences(userId, { dashboardLayout });
  }

  async resetPreferences(userId) {
    try {
      await prisma.userPreference.delete({
        where: { userId },
      });

      return this.createDefaultPreferences(userId);
    } catch (error) {
      console.error('Reset preferences error:', error);
      throw error;
    }
  }
}

module.exports = new UserPreferenceService();
