import axios from 'axios';

export const fetchDataForReport = async (topic, dataPoints, timeframe, customDateRange) => {
  try {
    // Example API endpoint and request payload
    const response = await axios.post('/api/data/fetch', {
      topic,
      dataPoints,
      timeframe,
      customDateRange
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
};

export const generateReportContent = (fetchedData) => {
  // Example logic to transform fetched data into report content
  const reportContent = {
    sections: fetchedData.map((dataPoint) => ({
      title: dataPoint.name,
      content: JSON.stringify(dataPoint.data, null, 2),
      type: 'text' // or 'chart' if applicable
    }))
  };

  return reportContent;
};
