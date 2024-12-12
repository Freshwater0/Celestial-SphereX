const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reportTemplate.deleteMany();

  // Create predefined report templates
  const templates = [
    {
      name: 'Cryptocurrency Market Trends',
      description: 'Comprehensive analysis of cryptocurrency market performance',
      category: 'CRYPTO_MARKET',
      tags: ['crypto', 'market', 'trends'],
      isPublic: true,
      configuration: {
        dataSource: 'CoinGecko',
        defaultCoins: ['bitcoin', 'ethereum', 'binancecoin'],
        defaultTimeframe: '30d'
      }
    },
    {
      name: 'Stock Market Performance',
      description: 'Detailed stock market performance and analysis',
      category: 'STOCK_MARKET',
      tags: ['stocks', 'finance', 'investment'],
      isPublic: true,
      configuration: {
        dataSource: 'Alpha Vantage',
        defaultStocks: ['AAPL', 'GOOGL', 'MSFT'],
        defaultTimeframe: '90d'
      }
    },
    {
      name: 'Weather Impact Analysis',
      description: 'Climate trends and their potential economic impacts',
      category: 'WEATHER_IMPACT',
      tags: ['climate', 'weather', 'economic'],
      isPublic: true,
      configuration: {
        dataSource: 'OpenWeatherMap',
        defaultRegions: ['Global'],
        defaultTimeframe: '365d'
      }
    },
    {
      name: 'Personal Finance Summary',
      description: 'Monthly personal finance and spending overview',
      category: 'PERSONAL_FINANCE',
      tags: ['finance', 'budget', 'spending'],
      isPublic: false,
      configuration: {
        dataSource: 'User Bank API',
        defaultCategories: ['Income', 'Expenses', 'Savings'],
        defaultTimeframe: '30d'
      }
    }
  ];

  // Create templates
  for (const template of templates) {
    await prisma.reportTemplate.create({
      data: template
    });
  }

  console.log('Report templates seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
