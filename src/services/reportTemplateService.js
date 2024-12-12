import axios from 'axios';

const API_BASE_URL = '/api/reports';

// Custom error class for API errors
class APIError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

class ReportTemplateService {
  /**
   * Handle API errors consistently
   * @param {Error} error - Axios error object
   * @throws {APIError}
   */
  _handleError(error) {
    if (error.response) {
      // If response is a blob, we need to convert it to text first
      if (error.response.data instanceof Blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              reject(new APIError(
                errorData.message || 'An error occurred',
                error.response.status,
                errorData
              ));
            } catch (e) {
              reject(new APIError(
                'Failed to parse error response',
                error.response.status,
                { raw: reader.result }
              ));
            }
          };
          reader.onerror = () => {
            reject(new APIError(
              'Failed to read error response',
              error.response.status
            ));
          };
          reader.readAsText(error.response.data);
        });
      }
      
      // Regular JSON response
      throw new APIError(
        error.response.data.message || 'An error occurred',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new APIError(
        'No response received from server', 
        0, 
        { requestDetails: error.request }
      );
    } else {
      // Something happened in setting up the request
      throw new APIError(
        error.message || 'Error setting up the request', 
        -1
      );
    }
  }

  /**
   * Fetch all available report templates
   * @param {Object} options - Optional filtering options
   * @returns {Promise<Array>} List of report templates
   */
  async getTemplates(options = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates`, { 
        params: options 
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get a specific report template by ID
   * @param {string} templateId - ID of the template
   * @returns {Promise<Object>} Report template details
   */
  async getTemplateById(templateId) {
    try {
      if (!templateId) {
        throw new APIError('Template ID is required', 400);
      }
      const response = await axios.get(`${API_BASE_URL}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Create a new report template
   * @param {Object} templateData - Template creation data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    try {
      if (!this.validateTemplate(templateData)) {
        throw new APIError('Invalid template data', 400);
      }
      const response = await axios.post(`${API_BASE_URL}/templates`, templateData);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Update an existing report template
   * @param {string} templateId - ID of the template to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(templateId, updateData) {
    try {
      if (!templateId) {
        throw new APIError('Template ID is required', 400);
      }
      if (!this.validateTemplate(updateData)) {
        throw new APIError('Invalid template data', 400);
      }
      const response = await axios.put(`${API_BASE_URL}/templates/${templateId}`, updateData);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Delete a report template
   * @param {string} templateId - ID of the template to delete
   * @returns {Promise<Object>} Deleted template
   */
  async deleteTemplate(templateId) {
    try {
      if (!templateId) {
        throw new APIError('Template ID is required', 400);
      }
      const response = await axios.delete(`${API_BASE_URL}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Generate a report based on template and filters
   * @param {string} templateId - ID of the template
   * @param {Object} filters - Report generation filters
   * @param {string} exportFormat - Export format (PDF, CSV, XLSX)
   * @returns {Promise<Blob>} Generated report file
   */
  async generateReport(templateId, filters = {}, exportFormat = 'PDF') {
    try {
      if (!templateId) {
        throw new APIError('Template ID is required', 400);
      }
      if (!['PDF', 'CSV', 'XLSX'].includes(exportFormat)) {
        throw new APIError('Invalid export format', 400);
      }

      const response = await axios.post(`${API_BASE_URL}/generate`, {
        templateId,
        filters,
        exportFormat
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Check if the response is an error (some servers send errors as blobs)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const reader = new FileReader();
        const textContent = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsText(response.data);
        });

        try {
          const jsonResponse = JSON.parse(textContent);
          if (jsonResponse.error) {
            throw new APIError(jsonResponse.error, response.status, jsonResponse);
          }
        } catch (e) {
          // If it's not valid JSON, assume it's the actual file content
        }
      }

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${templateId}.${exportFormat.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Validate report template
   * @param {Object} template - Template to validate
   * @returns {boolean} Validation result
   */
  validateTemplate(template) {
    const requiredKeys = ['name', 'category', 'fields', 'visuals'];
    return requiredKeys.every(key => template[key] !== undefined);
  }
}

export default new ReportTemplateService();
