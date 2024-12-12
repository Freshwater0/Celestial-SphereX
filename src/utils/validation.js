// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const validatePassword = (password) => {
  // Log password characteristics for debugging
  console.log('Password validation check:', {
    length: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
    allowedChars: /^[A-Za-z\d!@#$%^&*]+$/.test(password)
  });

  // Individual checks for better error reporting
  if (password.length < 8) {
    console.log('Password too short');
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    console.log('Missing uppercase letter');
    return false;
  }
  if (!/\d/.test(password)) {
    console.log('Missing number');
    return false;
  }
  if (!/[!@#$%^&*]/.test(password)) {
    console.log('Missing special character');
    return false;
  }
  if (!/^[A-Za-z\d!@#$%^&*]+$/.test(password)) {
    console.log('Contains invalid characters');
    return false;
  }

  return true;
};

// Username validation
const validateUsername = (username) => {
  // 3-20 characters, letters, numbers, and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Name validation
const validateName = (name) => {
  // 2-50 characters, letters, spaces, apostrophes, and hyphens allowed
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name);
};

// URL validation
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation
const validatePhone = (phone) => {
  // Basic international phone number format
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Date validation
const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Cryptocurrency symbol validation
const validateCryptoSymbol = (symbol) => {
  // Common crypto symbol format (e.g., BTCUSDT, ETH-USD)
  const symbolRegex = /^[A-Z0-9]{2,10}(-[A-Z]{2,5}|USDT)?$/;
  return symbolRegex.test(symbol);
};

// Object ID validation (MongoDB)
const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Color validation (hex)
const validateColor = (color) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

// JWT token validation
const validateToken = (token) => {
  // Basic JWT format validation
  const tokenRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return tokenRegex.test(token);
};

// IP address validation
const validateIp = (ip) => {
  // IPv4 and IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Social media handle validation
const validateSocialHandle = (handle) => {
  // Common social media handle format
  const handleRegex = /^[a-zA-Z0-9_\.]{1,30}$/;
  return handleRegex.test(handle);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validateUrl,
  validatePhone,
  validateDate,
  validateCryptoSymbol,
  validateObjectId,
  validateColor,
  validateToken,
  validateIp,
  validateSocialHandle
};
