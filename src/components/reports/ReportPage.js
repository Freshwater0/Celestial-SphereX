import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import TemplateGallery from "./TemplateGallery";
import DataSourceSelector from "./DataSourceSelector";
import ReportPreview from "./ReportPreview";
import VisualizationEditor from "./VisualizationEditor";
import BrandingEditor from "./BrandingEditor";
import ScheduleManager from "./ScheduleManager";

const ReportPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportData, setReportData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    'Select Template',
    'Configure Data Sources',
    'Customize Report',
    'Preview & Schedule'
  ];

  const handleTemplateSelect = async (template, category) => {
    setIsLoading(true);
    setError(null);
    try {
      setSelectedTemplate(template);
      setSelectedCategory(category);
      // Load template-specific data
      const data = await fetchTemplateData(template);
      setReportData(data);
      setActiveStep(1); // Move to next step
    } catch (err) {
      setError("Failed to load template data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataSourceUpdate = async (newData) => {
    setReportData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleExport = async (format) => {
    setIsLoading(true);
    try {
      // Export logic here
      await exportReport(format, reportData);
    } catch (err) {
      setError("Export failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TemplateGallery
            onTemplateSelect={handleTemplateSelect}
          />
        );
      case 1:
        return (
          <DataSourceSelector
            template={selectedTemplate}
            category={selectedCategory}
            onDataUpdate={handleDataSourceUpdate}
          />
        );
      case 2:
        return (
          <>
            <VisualizationEditor
              data={reportData}
              onVisualizationUpdate={handleDataSourceUpdate}
            />
            <BrandingEditor
              onBrandingUpdate={handleDataSourceUpdate}
            />
          </>
        );
      case 3:
        return (
          <>
            <ReportPreview
              template={selectedTemplate}
              data={reportData}
              onExport={handleExport}
            />
            <ScheduleManager
              template={selectedTemplate}
              category={selectedCategory}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Report
        </Typography>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: "error.light" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1 || !selectedTemplate}
                >
                  {activeStep === steps.length - 2 ? 'Preview' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ReportPage;
