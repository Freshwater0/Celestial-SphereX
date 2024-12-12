const { PrismaClient } = require('@prisma/client');
const ReportTemplateService = require('../../src/services/reportTemplateService');
const logger = require('../../src/utils/logger');

describe('ReportTemplateService', () => {
  let prisma;
  let reportTemplateService;

  beforeAll(() => {
    prisma = new PrismaClient();
    reportTemplateService = new ReportTemplateService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Predefined Templates', () => {
    it('should have predefined templates', () => {
      const predefinedTemplates = ReportTemplateService.predefinedTemplates;
      expect(predefinedTemplates.length).toBeGreaterThan(0);
      
      const cryptoTemplate = predefinedTemplates.find(t => t.name === 'Cryptocurrency Trends');
      expect(cryptoTemplate).toBeDefined();
      expect(cryptoTemplate.category).toBe('Finance');
    });
  });

  describe('Template Creation', () => {
    it('should create a new report template', async () => {
      const templateData = {
        name: 'Test Template',
        description: 'A test template',
        category: 'Test',
        tags: ['test', 'example'],
        configuration: { chartTypes: ['bar', 'line'] }
      };

      const createdTemplate = await reportTemplateService.createTemplate(templateData);
      
      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.name).toBe('Test Template');
      expect(createdTemplate.tags).toEqual(['test', 'example']);
    });
  });

  describe('Template Search', () => {
    beforeEach(async () => {
      // Seed some test templates
      await prisma.reportTemplate.createMany({
        data: [
          {
            name: 'Finance Report',
            category: 'Finance',
            tags: ['finance', '2023'],
            createdAt: new Date('2023-01-15')
          },
          {
            name: 'Weather Analysis',
            category: 'Climate',
            tags: ['weather', '2023'],
            createdAt: new Date('2023-06-01')
          }
        ]
      });
    });

    it('should search templates by category', async () => {
      const results = await reportTemplateService.searchTemplates({ 
        category: 'Finance' 
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('Finance');
    });

    it('should search templates by tags', async () => {
      const results = await reportTemplateService.searchTemplates({ 
        tags: ['weather'] 
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].tags).toContain('weather');
    });
  });

  describe('Error Handling', () => {
    it('should handle template creation errors', async () => {
      const invalidTemplateData = {
        // Missing required fields
      };

      await expect(reportTemplateService.createTemplate(invalidTemplateData))
        .rejects.toThrow();
    });
  });
});
