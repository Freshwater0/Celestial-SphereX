const { Op } = require('sequelize');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionService = require('../services/subscriptionService');

class AdminController {
  // Get paginated list of users
  async getUsers(req, res) {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        search = '', 
        status = null 
      } = req.query;

      const whereCondition = {};
      
      // Optional search filter
      if (search) {
        whereCondition[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Optional status filter
      if (status) {
        whereCondition.accountStatus = status;
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereCondition,
        include: [{ 
          model: Subscription, 
          attributes: ['status', 'endDate', 'trialPeriod'] 
        }],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']],
        attributes: { 
          exclude: ['password'] // Never return password
        }
      });

      res.json({
        users,
        totalUsers: count,
        currentPage: page,
        totalPages: Math.ceil(count / pageSize)
      });
    } catch (error) {
      console.error('Get Users Error:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }

  // Manage user account status
  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user status
      await user.update({ 
        accountStatus: status,
        statusChangeReason: reason
      });

      // If suspending, also handle subscription
      if (status === 'suspended') {
        await Subscription.update(
          { status: 'suspended' },
          { where: { userId: user.id } }
        );
      }

      res.json({ 
        message: 'User status updated successfully',
        user: { 
          id: user.id, 
          username: user.username, 
          status: user.accountStatus 
        }
      });
    } catch (error) {
      console.error('Update User Status Error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  // Manually extend or modify subscription
  async manageSubscription(req, res) {
    try {
      const { userId } = req.params;
      const { 
        action, 
        duration, 
        durationUnit 
      } = req.body;

      const subscription = await Subscription.findOne({ 
        where: { userId },
        include: [{ model: User }]
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      switch (action) {
        case 'extend':
          await SubscriptionService.extendSubscription(
            subscription.id, 
            duration, 
            durationUnit
          );
          break;
        
        case 'pause':
          await SubscriptionService.pauseSubscription(subscription.id);
          break;
        
        case 'resume':
          await SubscriptionService.resumeSubscription(subscription.id);
          break;

        default:
          return res.status(400).json({ error: 'Invalid subscription action' });
      }

      res.json({ 
        message: `Subscription ${action} successful`,
        subscription: await Subscription.findByPk(subscription.id)
      });
    } catch (error) {
      console.error('Manage Subscription Error:', error);
      res.status(500).json({ error: 'Failed to manage subscription' });
    }
  }

  // Generate admin reports
  async generateReports(req, res) {
    try {
      const { reportType } = req.query;

      switch (reportType) {
        case 'userGrowth':
          const userGrowthReport = await this.generateUserGrowthReport();
          res.json(userGrowthReport);
          break;
        
        case 'subscriptionStats':
          const subscriptionReport = await this.generateSubscriptionReport();
          res.json(subscriptionReport);
          break;

        default:
          res.status(400).json({ error: 'Invalid report type' });
      }
    } catch (error) {
      console.error('Report Generation Error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  // Helper method for user growth report
  async generateUserGrowthReport() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const newUsers = await User.count({
      where: { 
        createdAt: { [Op.gte]: thirtyDaysAgo } 
      }
    });

    const totalUsers = await User.count();

    return {
      newUsersLast30Days: newUsers,
      totalUsers,
      growthRate: ((newUsers / totalUsers) * 100).toFixed(2) + '%'
    };
  }

  // Helper method for subscription report
  async generateSubscriptionReport() {
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });

    const trialSubscriptions = await Subscription.count({
      where: { 
        status: 'active', 
        trialPeriod: true 
      }
    });

    const expiredSubscriptions = await Subscription.count({
      where: { 
        status: 'expired' 
      }
    });

    return {
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions
    };
  }
}

module.exports = new AdminController();
