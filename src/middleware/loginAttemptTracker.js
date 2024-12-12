class LoginAttemptTracker {
  constructor() {
    // In-memory storage for login attempts
    this.loginAttempts = new Map();
    this.lockedAccounts = new Map();
  }

  // Track login attempts for an account
  trackLoginAttempt(email) {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || [];
    
    // Remove attempts older than 1 hour
    const recentAttempts = attempts.filter(time => now - time < 3600000);
    
    // Add current attempt
    recentAttempts.push(now);
    this.loginAttempts.set(email, recentAttempts);

    // Check if account should be locked
    if (recentAttempts.length >= 5) {
      // Lock the account for 1 hour
      this.lockedAccounts.set(email, now + 3600000);
      return true;
    }

    return false;
  }

  // Check if account is locked
  isAccountLocked(email) {
    const lockExpiration = this.lockedAccounts.get(email);
    
    if (!lockExpiration) return false;

    // Check if lock has expired
    if (Date.now() > lockExpiration) {
      // Remove lock
      this.lockedAccounts.delete(email);
      // Reset login attempts
      this.loginAttempts.delete(email);
      return false;
    }

    return true;
  }

  // Middleware to check and track login attempts
  loginAttemptMiddleware() {
    return (req, res, next) => {
      const { email } = req.body;

      // Check if account is locked
      if (this.isAccountLocked(email)) {
        return res.status(403).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.'
        });
      }

      // Attach tracker to request for successful/failed login tracking
      req.loginTracker = {
        trackFailedAttempt: () => this.trackLoginAttempt(email)
      };

      next();
    };
  }

  // Reset login attempts on successful login
  resetLoginAttempts(email) {
    this.loginAttempts.delete(email);
    this.lockedAccounts.delete(email);
  }
}

module.exports = new LoginAttemptTracker();
