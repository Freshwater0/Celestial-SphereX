import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActionArea,
  CircularProgress
} from '@mui/material';
import { 
  DataSourceSelector, 
  VisualizationEditor, 
  BrandingEditor, 
  ReportPreview
} from '../reports';
import reportTemplateService from '../../services/reportTemplateService';
import { useError } from '../../contexts/ErrorContext';

const ReportWizard = ({ onComplete, initialTemplate = null }) => {
  const { showError, showErrorDialog } = useError();
  const [activeStep, setActiveStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [dataSources, setDataSources] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [branding, setBranding] = useState({
    logo: null,
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e'
    },
    header: '',
    footer: ''
  });
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    regions: [],
    metrics: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch available templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const fetchedTemplates = await reportTemplateService.getTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        // Use error context to display error
        showErrorDialog({
          title: 'Template Fetch Error',
          message: 'Unable to load report templates',
          details: error.details || {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    handleNext();
  };

  const handleDataSourcesUpdate = (sources) => {
    setDataSources(sources);
    handleNext();
  };

  const handleVisualizationsUpdate = (visualizationConfigs) => {
    setVisualizations(visualizationConfigs);
    handleNext();
  };

  const handleBrandingUpdate = (brandingConfig) => {
    setBranding(brandingConfig);
    handleNext();
  };

  const handleReportGeneration = async () => {
    try {
      setLoading(true);
      // Validate all required data
      if (!selectedTemplate) {
        showError('Please select a template', 'warning');
        return;
      }

      // Prepare report generation payload
      const reportConfig = {
        templateId: selectedTemplate.id,
        dataSources,
        visualizations,
        branding,
        filters
      };

      // Generate report
      await reportTemplateService.generateReport(
        selectedTemplate.id, 
        reportConfig, 
        'PDF'
      );

      // Optional: Call onComplete callback
      onComplete && onComplete(reportConfig);

      // Show success message
      showError('Report generated successfully!', 'success');
    } catch (error) {
      // Use error context to display detailed error
      showErrorDialog({
        title: 'Report Generation Error',
        message: 'Failed to generate report',
        details: error.details || {}
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Select Template',
      component: (
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card>
                <CardActionArea onClick={() => handleTemplateSelect(template)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={template.previewImage || '/default-template.png'}
                    alt={template.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )
    },
    {
      label: 'Data Sources',
      component: (
        <DataSourceSelector
          sources={dataSources}
          onChange={handleDataSourcesUpdate}
          template={selectedTemplate}
          filters={filters}
          onFilterChange={setFilters}
        />
      )
    },
    {
      label: 'Configure Visualizations',
      component: (
        <VisualizationEditor 
          onUpdate={handleVisualizationsUpdate} 
          initialVisualizations={visualizations}
        />
      )
    },
    {
      label: 'Customize Branding',
      component: (
        <BrandingEditor 
          onUpdate={handleBrandingUpdate} 
          initialBranding={branding}
        />
      )
    },
    {
      label: 'Preview & Generate',
      component: (
        <ReportPreview 
          template={selectedTemplate}
          dataSources={dataSources}
          visualizations={visualizations}
          branding={branding}
        />
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(({ label }) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="300px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {steps[activeStep].component}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleReportGeneration}
              >
                Generate Report
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={!selectedTemplate}
              >
                Next
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReportWizard;
