export const TEMPLATE_TYPES = {
  MARKET_TRENDS: 'Market Trends',
  FINANCIAL_SUMMARY: 'Financial Summary',
  WEATHER_REPORT: 'Weather Report',
  CUSTOM: 'Custom Template',
};

export const DEFAULT_TEMPLATES = {
  [TEMPLATE_TYPES.MARKET_TRENDS]: {
    name: 'Market Trends Analysis',
    description: 'Comprehensive market analysis with price trends and volume data',
    sections: [
      {
        type: 'chart',
        chartType: 'line',
        dataSource: 'crypto',
        metrics: ['price', 'volume'],
      },
      {
        type: 'insights',
        rules: {
          max: 1000,
          min: 0,
          growthRate: 10,
        },
      },
      {
        type: 'table',
        columns: ['asset', 'price', 'change', 'volume'],
      },
    ],
  },
  [TEMPLATE_TYPES.FINANCIAL_SUMMARY]: {
    name: 'Financial Performance Summary',
    description: 'Key financial metrics and performance indicators',
    sections: [
      {
        type: 'summary',
        metrics: ['revenue', 'profit', 'growth'],
      },
      {
        type: 'chart',
        chartType: 'bar',
        dataSource: 'financial',
        metrics: ['revenue', 'expenses'],
      },
      {
        type: 'insights',
        rules: {
          profitMargin: 15,
          revenueGrowth: 5,
        },
      },
    ],
  },
  [TEMPLATE_TYPES.WEATHER_REPORT]: {
    name: 'Weather Analysis Report',
    description: 'Weather patterns and forecast analysis',
    sections: [
      {
        type: 'map',
        dataSource: 'weather',
        metrics: ['temperature', 'precipitation'],
      },
      {
        type: 'chart',
        chartType: 'line',
        dataSource: 'weather',
        metrics: ['temperature', 'humidity'],
      },
      {
        type: 'insights',
        rules: {
          temperatureMax: 35,
          temperatureMin: 0,
          humidityMax: 90,
        },
      },
    ],
  },
};
