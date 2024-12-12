import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

// Import components
import ReportTemplate, { TEMPLATE_TYPES, DEFAULT_TEMPLATES } from '../components/reports/ReportTemplate';
import DataVisualization from '../components/reports/DataVisualization';
import ReportTemplateManager from '../components/reports/ReportTemplateManager';

const AnalyticsPage = () => {
  // State for managing report templates
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  // Template selection handlers
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(false);
    setActiveStep(1);
  };

  const handleCreateCustomTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: 'New Custom Template',
      description: 'A custom template for your specific needs',
      type: TEMPLATE_TYPES.CUSTOM,
      sections: [],
    };
    setCustomTemplates([...customTemplates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setIsEditMode(true);
    setActiveStep(1);
  };

  const handleSaveTemplate = (updatedTemplate) => {
    if (updatedTemplate.id) {
      setCustomTemplates(
        customTemplates.map((template) =>
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      );
    } else {
      setCustomTemplates([...customTemplates, { ...updatedTemplate, id: Date.now() }]);
    }
    setIsEditMode(false);
  };

  const handleDeleteTemplate = (templateToDelete) => {
    setCustomTemplates(
      customTemplates.filter((template) => template.id !== templateToDelete.id)
    );
    if (selectedTemplate?.id === templateToDelete.id) {
      setSelectedTemplate(null);
      setActiveStep(0);
    }
  };

  const handleShareTemplate = (template) => {
    // Implement template sharing functionality
    console.log('Sharing template:', template);
  };

  const handleExportReport = () => {
    // Implement report export functionality
    console.log('Exporting report with template:', selectedTemplate);
  };

  const steps = ['Select Template', 'Configure Report', 'Preview & Export'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics & Reports
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {activeStep === 0 && (
          <>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCustomTemplate}
                >
                  Create Custom Template
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Default Templates" />
                <CardContent>
                  <ReportTemplateManager
                    categories={Object.keys(DEFAULT_TEMPLATES)}
                    templates={DEFAULT_TEMPLATES}
                    onTemplateSelect={handleTemplateSelect}
                    selectedTemplate={selectedTemplate}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Custom Templates" />
                <CardContent>
                  <ReportTemplateManager
                    categories={['Custom']}
                    templates={customTemplates}
                    onTemplateSelect={handleTemplateSelect}
                    selectedTemplate={selectedTemplate}
                  />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {activeStep === 1 && selectedTemplate && (
          <Grid item xs={12}>
            <ReportTemplate
              template={selectedTemplate}
              isEditing={isEditMode}
              onSave={handleSaveTemplate}
              onShare={handleShareTemplate}
              onDelete={handleDeleteTemplate}
              onCancel={() => setIsEditMode(false)}
            />
          </Grid>
        )}

        {activeStep === 2 && selectedTemplate && (
          <>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Report Preview"
                  action={
                    <Button
                      variant="contained"
                      startIcon={<ExportIcon />}
                      onClick={handleExportReport}
                    >
                      Export Report
                    </Button>
                  }
                />
                <CardContent>
                  <DataVisualization template={selectedTemplate} />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          disabled={!selectedTemplate || activeStep === 2}
          onClick={() => setActiveStep((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
