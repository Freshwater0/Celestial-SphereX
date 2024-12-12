const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper for running queries with automatic error handling
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Helper for batch inserts
const batchInsert = async (table, columns, values) => {
  const sql = format(
    'INSERT INTO %I (%I) VALUES %L RETURNING *',
    table,
    columns,
    values
  );
  return query(sql);
};

// Helper for updating with dynamic fields
const updateById = async (table, id, updates) => {
  const keys = Object.keys(updates);
  const sets = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  const values = keys.map(key => updates[key]);
  
  const sql = `
    UPDATE ${table}
    SET ${sets}
    WHERE id = $1
    RETURNING *
  `;
  
  return query(sql, [id, ...values]);
};

// Models
const models = {
  // Users
  async createUser({ email, passwordHash }) {
    return query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );
  },

  async getUserById(id) {
    return query('SELECT * FROM users WHERE id = $1', [id]);
  },

  async getUserByEmail(email) {
    return query('SELECT * FROM users WHERE email = $1', [email]);
  },

  // Profiles
  async createProfile({ userId, name, avatarUrl, bio }) {
    return query(
      'INSERT INTO profiles (user_id, name, avatar_url, bio) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, avatarUrl, bio]
    );
  },

  async getProfileByUserId(userId) {
    return query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  },

  // Settings
  async createSettings({ userId, settings }) {
    const { theme, notificationEmail, notificationPush, notificationPriceAlerts, defaultCurrency, timeFormat } = settings;
    return query(
      `INSERT INTO user_settings 
       (user_id, theme, notification_email, notification_push, notification_price_alerts, default_currency, time_format)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, theme, notificationEmail, notificationPush, notificationPriceAlerts, defaultCurrency, timeFormat]
    );
  },

  async getSettingsByUserId(userId) {
    return query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
  },

  // Sessions
  async createSession({ userId, token, deviceInfo, ipAddress, expiresAt }) {
    return query(
      `INSERT INTO sessions 
       (user_id, token, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, token, deviceInfo, ipAddress, expiresAt]
    );
  },

  async getActiveSessionsByUserId(userId) {
    return query(
      'SELECT * FROM sessions WHERE user_id = $1 AND is_active = true AND expires_at > NOW()',
      [userId]
    );
  },

  // Widgets
  async createWidget({ userId, type, name, position, size, settings }) {
    return query(
      `INSERT INTO widgets 
       (user_id, type, name, position, size, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, name, position, size, settings]
    );
  },

  async getWidgetsByUserId(userId) {
    return query('SELECT * FROM widgets WHERE user_id = $1 AND is_active = true', [userId]);
  },

  // Crypto Watchlist
  async addToWatchlist({ userId, symbol, alertPriceHigh, alertPriceLow, alertPercentChange }) {
    return query(
      `INSERT INTO crypto_watchlist 
       (user_id, symbol, alert_price_high, alert_price_low, alert_percent_change)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, symbol, alertPriceHigh, alertPriceLow, alertPercentChange]
    );
  },

  async getWatchlistByUserId(userId) {
    return query('SELECT * FROM crypto_watchlist WHERE user_id = $1', [userId]);
  },

  // Price Alerts
  async createPriceAlert({ userId, symbol, targetPrice, condition }) {
    return query(
      `INSERT INTO price_alerts 
       (user_id, symbol, target_price, condition)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, symbol, targetPrice, condition]
    );
  },

  async getActivePriceAlerts(userId) {
    return query(
      'SELECT * FROM price_alerts WHERE user_id = $1 AND is_triggered = false',
      [userId]
    );
  },

  // Activity Logs
  async logActivity({ userId, action, entityType, entityId, metadata, ipAddress, userAgent }) {
    return query(
      `INSERT INTO activity_logs 
       (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, action, entityType, entityId, metadata, ipAddress, userAgent]
    );
  },

  // Notifications
  async createNotification({ userId, type, title, message, metadata }) {
    return query(
      `INSERT INTO notifications 
       (user_id, type, title, message, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, metadata]
    );
  },

  async getUnreadNotifications(userId) {
    return query(
      'SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC',
      [userId]
    );
  },

  // API Usage
  async trackApiUsage({ userId, endpoint, method, statusCode, responseTime, ipAddress, userAgent }) {
    return query(
      `INSERT INTO api_usage 
       (user_id, endpoint, method, status_code, response_time, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, endpoint, method, statusCode, responseTime, ipAddress, userAgent]
    );
  }
};

module.exports = {
  query,
  batchInsert,
  updateById,
  ...models
};
