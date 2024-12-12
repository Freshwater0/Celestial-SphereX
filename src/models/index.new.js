const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Import all helper classes
const UserHelper = require('./User');
const SessionHelper = require('./Session');
const ProfileHelper = require('./Profile');
const SettingsHelper = require('./Settings');
const WidgetHelper = require('./Widget');
const CryptoWatchlistHelper = require('./CryptoWatchlist');
const ActivityLogHelper = require('./ActivityLog');
const ApiUsageHelper = require('./ApiUsage');
const NotificationHelper = require('./Notification');
const SubscriptionHelper = require('./Subscription');
const EmailVerificationHelper = require('./EmailVerification');
const ReportHelper = require('./Report');

// Export Prisma client and all helpers
module.exports = {
  prisma,
  UserHelper,
  SessionHelper,
  ProfileHelper,
  SettingsHelper,
  WidgetHelper,
  CryptoWatchlistHelper,
  ActivityLogHelper,
  ApiUsageHelper,
  NotificationHelper,
  SubscriptionHelper,
  EmailVerificationHelper,
  ReportHelper
};
