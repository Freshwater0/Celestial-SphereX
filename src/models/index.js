const { sequelize, Sequelize } = require('../config/database');
const User = require('./User');
const Session = require('./Session');
const Profile = require('./Profile');
const Settings = require('./Settings');
const Widget = require('./Widget');
const CryptoWatchlist = require('./CryptoWatchlist');
const ActivityLog = require('./ActivityLog');
const ApiUsage = require('./ApiUsage');
const Notification = require('./Notification');
const Subscription = require('./Subscription');
const EmailVerification = require('./EmailVerification');
const Report = require('./Report');

console.log('User:', User);
console.log('Session:', Session);
console.log('Profile:', Profile);
console.log('Settings:', Settings);
console.log('Widget:', Widget);
console.log('CryptoWatchlist:', CryptoWatchlist);
console.log('ActivityLog:', ActivityLog);
console.log('ApiUsage:', ApiUsage);
console.log('Notification:', Notification);
console.log('Subscription:', Subscription);
console.log('EmailVerification:', EmailVerification);
console.log('Report:', Report);

// Define relationships with explicit foreign key configuration
User.hasMany(Session, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Session.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasOne(Profile, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Profile.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasOne(Settings, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Settings.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(Widget, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Widget.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(CryptoWatchlist, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
CryptoWatchlist.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(ActivityLog, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
ActivityLog.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(ApiUsage, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
ApiUsage.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

User.hasMany(Notification, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Notification.belongsTo(User, { 
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

// User - Subscription association
User.hasOne(Subscription, {
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  },
  as: 'subscription'
});
Subscription.belongsTo(User, {
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  },
  as: 'user'
});

// User - EmailVerification association
User.hasMany(EmailVerification, {
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
EmailVerification.belongsTo(User, {
  foreignKey: {
    name: 'user_id', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

// User - Report association
User.hasMany(Report, {
  foreignKey: {
    name: 'userId', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});
Report.belongsTo(User, {
  foreignKey: {
    name: 'userId', 
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = {
  sequelize,
  User,
  Session,
  Profile,
  Settings,
  Widget,
  CryptoWatchlist,
  ActivityLog,
  ApiUsage,
  Notification,
  Subscription,
  EmailVerification,
  Report
};
