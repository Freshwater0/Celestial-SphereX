const express = require('express');
const router = express.Router();
const reportGenerationService = require('../services/reportGenerationService');
const { body, validationResult } = require('express-validator');
const { saveReport, getSavedReports, generateReportData } = require('../controllers/ReportController');

/**
 * Validate report generation request
 */
const validateReportRequest = [
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('filters.startDate').optional().isISO8601(),
  body('filters.endDate').optional().isISO8601(),
  body('exportFormat')
    .optional()
    .isIn(['PDF', 'CSV', 'XLSX'])
    .withMessage('Invalid export format')
];

/**
 * Generate Report Route
 * Handles report generation based on template and user filters
 */
router.post('/generate/report', validateReportRequest, async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      templateId, 
      filters = {}, 
      exportFormat = 'PDF' 
    } = req.body;

    // Fetch template from database or service
    const template = await reportGenerationService.getTemplateById(templateId);

    // Validate report parameters
    reportGenerationService.validateReportParameters(template, filters);

    // Fetch data for the report
    const reportData = await reportGenerationService.fetchTemplateData(template, filters);

    // Generate report
    const reportBuffer = reportGenerationService.generateReport(
      reportData, 
      template, 
      exportFormat
    );

    // Set appropriate headers for file download
    res.set({
      'Content-Type': {
        'PDF': 'application/pdf',
        'CSV': 'text/csv',
        'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }[exportFormat],
      'Content-Disposition': `attachment; filename=${template.name.replace(/\s+/g, '_')}_report.${exportFormat.toLowerCase()}`
    });

    // Send report buffer
    res.send(reportBuffer);

  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate report', 
      error: error.message 
    });
  }
});

/**
 * Get Available Templates Route
 * Returns list of pre-configured report templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await reportGenerationService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Template Retrieval Error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve templates', 
      error: error.message 
    });
  }
});

// Endpoint to get all report templates
router.get('/templates/fetch', (req, res) => {
  const templatesPath = path.join(__dirname, '../data/templates.json');
  fs.readFile(templatesPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading templates' });
    }
    const templates = JSON.parse(data);
    res.json(templates);
  });
});

// Route to save a report
router.post('/save', saveReport);

// Route to get saved reports
router.get('/saved/:userId', getSavedReports);

// Route to generate report data
router.post('/generate', generateReportData);

module.exports = router;
