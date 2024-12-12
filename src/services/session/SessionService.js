const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const moment = require('moment');

class SessionService {
  async createSession(userId, deviceInfo, ipAddress) {
    try {
      // Generate session token
      const token = jwt.sign(
        { userId, timestamp: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session record
      const session = await prisma.session.create({
        data: {
          userId,
          token,
          deviceInfo,
          ipAddress,
          expiresAt: moment().add(7, 'days').toDate(),
        },
      });

      return session;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  async validateSession(token) {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || !session.isValid || moment().isAfter(session.expiresAt)) {
        return null;
      }

      // Update last active timestamp
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActive: new Date() },
      });

      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  async invalidateSession(token) {
    try {
      await prisma.session.update({
        where: { token },
        data: { isValid: false },
      });
    } catch (error) {
      console.error('Session invalidation error:', error);
      throw error;
    }
  }

  async invalidateAllUserSessions(userId) {
    try {
      await prisma.session.updateMany({
        where: { userId },
        data: { isValid: false },
      });
    } catch (error) {
      console.error('User sessions invalidation error:', error);
      throw error;
    }
  }

  async cleanupExpiredSessions() {
    try {
      await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lte: new Date() } },
            { isValid: false },
          ],
        },
      });
    } catch (error) {
      console.error('Session cleanup error:', error);
      throw error;
    }
  }
}

module.exports = new SessionService();
