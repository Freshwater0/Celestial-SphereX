const axios = require('axios');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

class ReportGenerationService {
  constructor() {
    this.prisma = new PrismaClient();
    
    // API configurations
    this.apiConfigs = {
      COINGECKO_API: 'https://api.coingecko.com/api/v3',
      ALPHA_VANTAGE_API: 'https://www.alphavantage.co/query',
      OPENWEATHER_API: 'https://api.openweathermap.org/data/2.5'
    };
  }

  /**
   * Get all available report templates
   * @param {Object} options - Optional filtering options
   * @returns {Promise<Array>} List of report templates
   */
  async getAllTemplates(options = {}) {
    const { 
      userId, 
      category, 
      isPublic = true 
    } = options;

    return this.prisma.reportTemplate.findMany({
      where: {
        ...(userId && { userId }),
        ...(category && { category }),
        isPublic
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        configuration: true
      }
    });
  }

  /**
   * Get a specific report template by ID
   * @param {string} templateId - ID of the template
   * @returns {Promise<Object>} Report template details
   */
  async getTemplateById(templateId) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id: templateId },
      include: {
        reports: {
          select: {
            id: true,
            name: true,
            configuration: true
          }
        }
      }
    });

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    return template;
  }

  /**
   * Create a new report template
   * @param {Object} templateData - Template creation data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    return this.prisma.reportTemplate.create({
      data: {
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update an existing report template
   * @param {string} templateId - ID of the template to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(templateId, updateData) {
    return this.prisma.reportTemplate.update({
      where: { id: templateId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete a report template
   * @param {string} templateId - ID of the template to delete
   * @returns {Promise<Object>} Deleted template
   */
  async deleteTemplate(templateId) {
    return this.prisma.reportTemplate.delete({
      where: { id: templateId }
    });
  }

  /**
   * Fetch data based on template and user filters
   * @param {Object} template - Selected report template
   * @param {Object} filters - User-defined filters
   * @returns {Promise<Array>} Fetched data
   */
  async fetchTemplateData(template, filters) {
    switch (template.category) {
      case 'CRYPTO_MARKET':
        return this.fetchCryptoData(filters);
      case 'STOCK_MARKET':
        return this.fetchStockData(filters);
      case 'WEATHER_IMPACT':
        return this.fetchWeatherData(filters);
      default:
        throw new Error('Unsupported template category');
    }
  }

  /**
   * Fetch cryptocurrency market data
   * @param {Object} filters - Date range, coins
   * @returns {Promise<Array>} Crypto market data
   */
  async fetchCryptoData(filters) {
    const { 
      startDate, 
      endDate, 
      coins = ['bitcoin', 'ethereum'] 
    } = filters;

    const cryptoPromises = coins.map(async (coin) => {
      try {
        const response = await axios.get(`${this.apiConfigs.COINGECKO_API}/coins/${coin}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from: Math.floor(new Date(startDate).getTime() / 1000),
            to: Math.floor(new Date(endDate).getTime() / 1000)
          }
        });

        return {
          coin,
          prices: response.data.prices,
          market_caps: response.data.market_caps,
          total_volumes: response.data.total_volumes
        };
      } catch (error) {
        console.error(`Error fetching data for ${coin}:`, error);
        return null;
      }
    });

    return (await Promise.all(cryptoPromises)).filter(Boolean);
  }

  /**
   * Generate report in specified format
   * @param {Array} data - Processed report data
   * @param {Object} template - Report template
   * @param {string} format - Export format (PDF, CSV, XLSX)
   * @returns {Buffer} Generated report
   */
  generateReport(data, template, format = 'PDF') {
    switch (format.toUpperCase()) {
      case 'PDF':
        return this.generatePDFReport(data, template);
      case 'CSV':
        return this.generateCSVReport(data, template);
      case 'XLSX':
        return this.generateExcelReport(data, template);
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Generate PDF Report
   * @param {Array} data - Report data
   * @param {Object} template - Report template
   * @returns {Buffer} PDF report buffer
   */
  generatePDFReport(data, template) {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // PDF Report Header
    doc.fontSize(20).text(template.name, { align: 'center' });
    doc.moveDown();

    // Add data to PDF
    data.forEach((entry, index) => {
      doc.fontSize(12).text(`Entry ${index + 1}:`, { underline: true });
      Object.entries(entry).forEach(([key, value]) => {
        doc.text(`${key}: ${JSON.stringify(value)}`);
      });
      doc.moveDown();
    });

    doc.end();

    return Buffer.concat(buffers);
  }

  /**
   * Generate CSV Report
   * @param {Array} data - Report data
   * @param {Object} template - Report template
   * @returns {Buffer} CSV report buffer
   */
  generateCSVReport(data, template) {
    const parser = new Parser({
      fields: template.fields.map(field => field.key)
    });
    
    return Buffer.from(parser.parse(data));
  }

  /**
   * Generate Excel Report
   * @param {Array} data - Report data
   * @param {Object} template - Report template
   * @returns {Buffer} Excel report buffer
   */
  generateExcelReport(data, template) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, template.name);
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Save generated report
   * @param {Object} reportData - Report generation details
   * @returns {Promise<Object>} Saved report
   */
  async saveReport(reportData) {
    return this.prisma.report.create({
      data: {
        ...reportData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Validate report generation parameters
   * @param {Object} template - Report template
   * @param {Object} filters - User filters
   * @returns {boolean} Validation result
   */
  validateReportParameters(template, filters) {
    // Validate template
    if (!template || !template.category) {
      throw new Error('Invalid template');
    }

    // Validate date range
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      if (start > end) {
        throw new Error('Start date must be before end date');
      }
    }

    return true;
  }
}

module.exports = new ReportGenerationService();
