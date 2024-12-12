/**
 * Format a number with appropriate suffixes (K, M, B) and decimal places
 * @param {number} value - The number to format
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  if (typeof value !== 'number') return value;

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1000000000) {
    return `${sign}${(value / 1000000000).toFixed(decimals)}B`;
  }
  if (absValue >= 1000000) {
    return `${sign}${(value / 1000000).toFixed(decimals)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}${(value / 1000).toFixed(decimals)}K`;
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(decimals);
};

/**
 * Format a percentage value
 * @param {number} value - The percentage value
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format a currency value
 * @param {number} value - The value to format
 * @param {string} [currency='USD'] - Currency code
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date
 * @param {Date|string|number} date - The date to format
 * @param {string} [format='short'] - Format style ('short', 'medium', 'long')
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short', locale = 'en-US') => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';

  const options = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  };

  return new Intl.DateTimeFormat(locale, options[format] || options.short).format(dateObj);
};
