import { toast } from 'react-toastify';

/**
 * Centralized error handling utility
 */
export const ErrorHandler = {
  /**
   * Handle and log network errors
   * @param {Error} error - The error object
   * @param {string} [customMessage] - Optional custom error message
   */
  handleNetworkError(error, customMessage) {
    console.error('Network Error:', error);
    toast.error(customMessage || 'Network connection failed. Please try again.');
  },

  /**
   * Handle API response errors
   * @param {Object} response - API response object
   */
  handleApiError(response) {
    const errorMap = {
      400: 'Bad Request: Invalid data submitted',
      401: 'Unauthorized: Please log in again',
      403: 'Forbidden: You do not have permission',
      404: 'Resource not found',
      500: 'Internal Server Error',
      503: 'Service Unavailable'
    };

    const errorMessage = errorMap[response.status] || 'An unexpected error occurred';
    toast.error(errorMessage);
    
    // Optional: Log to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorMessage));
    }
  },

  /**
   * Handle form validation errors
   * @param {Object} errors - Validation error object
   */
  handleValidationErrors(errors) {
    Object.values(errors).forEach(error => {
      toast.warn(error);
    });
  },

  /**
   * Generic error fallback
   * @param {Error} error - Any error object
   */
  handleGenericError(error) {
    console.error('Unhandled Error:', error);
    toast.error('Something went wrong. Please try again later.');
  }
};

export default ErrorHandler;
