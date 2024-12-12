const { Report } = require('../models');
const { fetchNewsData, fetchFinancialData, fetchCryptoData } = require('../services/dataFetchService');

// Save a report
exports.saveReport = async (req, res) => {
  const { userId, reportData } = req.body;

  try {
    const userReports = await Report.findAll({ where: { userId } });

    if (userReports.length >= 5) {
      return res.status(400).json({ message: 'Maximum of 5 reports can be saved.' });
    }

    const newReport = await Report.create({
      userId,
      name: reportData.name || 'Unnamed Report',
      content: reportData.content
    });

    res.status(200).json({ message: 'Report saved successfully.', report: newReport });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Fetch saved reports
exports.getSavedReports = async (req, res) => {
  const { userId } = req.params;

  try {
    const userReports = await Report.findAll({ where: { userId } });
    res.status(200).json(userReports);
  } catch (error) {
    console.error('Error fetching saved reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Generate report data based on criteria
exports.generateReportData = async (req, res) => {
  const { topic, subtopic, keywords, timePeriod, customDateRange } = req.body;

  try {
    let data;

    if (topic === 'News') {
      data = await fetchNewsData(keywords, timePeriod, customDateRange);
    } else if (topic === 'Finance') {
      data = await fetchFinancialData(subtopic, timePeriod);
    } else if (topic === 'Cryptocurrency') {
      data = await fetchCryptoData(subtopic, timePeriod);
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
