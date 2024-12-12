import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Constants
const MAX_IMAGE_SIZE = 2000; // Maximum dimension for chart images
const MAX_TEXT_LENGTH = 5000; // Maximum characters per section
const DEFAULT_MARGIN = 10;
const DEFAULT_PAGE_BREAK_MARGIN = 20;

// Error types
const ReportError = {
  INVALID_DATA: 'INVALID_DATA',
  CHART_RENDER: 'CHART_RENDER',
  PDF_GENERATION: 'PDF_GENERATION',
  EXCEL_GENERATION: 'EXCEL_GENERATION',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
};

class ReportGenerationError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'ReportGenerationError';
    this.type = type;
    this.originalError = originalError;
  }
}

// Helper functions
const resizeCanvas = (canvas, maxDimension) => {
  if (!canvas || !canvas.width || !canvas.height) {
    throw new ReportGenerationError(
      ReportError.CHART_RENDER,
      'Invalid canvas element'
    );
  }

  try {
    const ratio = Math.min(1, maxDimension / Math.max(canvas.width, canvas.height));
    const width = Math.floor(canvas.width * ratio);
    const height = Math.floor(canvas.height * ratio);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(canvas, 0, 0, width, height);
    return tempCanvas;
  } catch (error) {
    throw new ReportGenerationError(
      ReportError.CHART_RENDER,
      'Failed to resize canvas',
      error
    );
  }
};

const splitTextToFit = (doc, text, maxWidth) => {
  if (!text) return [];
  
  try {
    const sanitizedText = text.toString().substring(0, MAX_TEXT_LENGTH);
    return doc.splitTextToSize(sanitizedText, maxWidth);
  } catch (error) {
    throw new ReportGenerationError(
      ReportError.PDF_GENERATION,
      'Failed to split text',
      error
    );
  }
};

const validateReportData = (reportData) => {
  if (!reportData) {
    throw new ReportGenerationError(
      ReportError.INVALID_DATA,
      'Report data is required'
    );
  }

  if (!Array.isArray(reportData.sections)) {
    throw new ReportGenerationError(
      ReportError.INVALID_DATA,
      'Report must contain sections array'
    );
  }

  return {
    name: reportData.name || 'Report',
    description: reportData.description || '',
    sections: reportData.sections,
  };
};

const addChartToPDF = async (doc, section, yOffset, pageConfig) => {
  const { margin, pageHeight, effectiveWidth } = pageConfig;
  
  try {
    const canvas = document.querySelector(`#chart-${section.id}`);
    if (!canvas) {
      throw new Error('Chart canvas not found');
    }

    const resizedCanvas = resizeCanvas(canvas, MAX_IMAGE_SIZE);
    const imgData = resizedCanvas.toDataURL('image/png', 0.8); // Compress image
    
    // Calculate image dimensions
    const imgWidth = effectiveWidth;
    const imgHeight = (resizedCanvas.height * imgWidth) / resizedCanvas.width;

    // Add new page if needed
    if (yOffset + imgHeight > pageHeight - margin) {
      doc.addPage();
      yOffset = margin;
    }

    // Add image and update offset
    doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
    return yOffset + imgHeight + 10;
  } catch (error) {
    console.error('Error adding chart to PDF:', error);
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text('Error: Chart could not be rendered', margin, yOffset);
    doc.setTextColor(0);
    return yOffset + 10;
  }
};

export const generatePDF = async (reportData) => {
  try {
    const validatedData = validateReportData(reportData);
    const doc = new jsPDF();
    
    // Page configuration
    const pageConfig = {
      pageHeight: doc.internal.pageSize.height,
      pageWidth: doc.internal.pageSize.width,
      margin: DEFAULT_MARGIN,
      effectiveWidth: doc.internal.pageSize.width - 2 * DEFAULT_MARGIN,
    };

    let yOffset = DEFAULT_MARGIN;

    // Add title
    doc.setFontSize(20);
    const titleLines = splitTextToFit(doc, validatedData.name, pageConfig.effectiveWidth);
    doc.text(titleLines, pageConfig.margin, yOffset);
    yOffset += titleLines.length * 10;

    // Add description
    if (validatedData.description) {
      yOffset += 5;
      doc.setFontSize(12);
      const descLines = splitTextToFit(doc, validatedData.description, pageConfig.effectiveWidth);
      doc.text(descLines, pageConfig.margin, yOffset);
      yOffset += descLines.length * 7;
    }

    // Process sections
    for (const section of validatedData.sections) {
      // Add new page if needed
      if (yOffset > pageConfig.pageHeight - DEFAULT_PAGE_BREAK_MARGIN) {
        doc.addPage();
        yOffset = DEFAULT_MARGIN;
      }

      // Add section title
      yOffset += 10;
      doc.setFontSize(14);
      const titleLines = splitTextToFit(doc, section.title, pageConfig.effectiveWidth);
      doc.text(titleLines, pageConfig.margin, yOffset);
      yOffset += titleLines.length * 7 + 3;

      // Add section content
      if (section.type === 'chart') {
        yOffset = await addChartToPDF(doc, section, yOffset, pageConfig);
      } else {
        doc.setFontSize(12);
        const contentLines = splitTextToFit(doc, section.content, pageConfig.effectiveWidth);
        
        if (yOffset + contentLines.length * 7 > pageConfig.pageHeight - pageConfig.margin) {
          doc.addPage();
          yOffset = pageConfig.margin;
        }

        doc.text(contentLines, pageConfig.margin, yOffset);
        yOffset += contentLines.length * 7;
      }
    }

    return doc;
  } catch (error) {
    if (error instanceof ReportGenerationError) {
      throw error;
    }
    throw new ReportGenerationError(
      ReportError.PDF_GENERATION,
      'Failed to generate PDF report',
      error
    );
  }
};

export const generateExcel = (reportData) => {
  try {
    const validatedData = validateReportData(reportData);
    const wb = XLSX.utils.book_new();
    const data = [];

    // Add metadata
    data.push(['Report: ' + validatedData.name]);
    if (validatedData.description) {
      data.push(['Description: ' + validatedData.description]);
    }
    data.push([]);  // Spacing

    // Process sections
    validatedData.sections.forEach((section) => {
      data.push([section.title]);
      if (section.type !== 'chart') {
        const content = section.content || '';
        data.push([content.toString().substring(0, MAX_TEXT_LENGTH)]);
      } else {
        data.push(['[Chart data not included in Excel export]']);
      }
      data.push([]); // Spacing
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add column widths
    const maxWidth = 50;
    ws['!cols'] = [{ wch: maxWidth }];

    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    return wb;
  } catch (error) {
    throw new ReportGenerationError(
      ReportError.EXCEL_GENERATION,
      'Failed to generate Excel report',
      error
    );
  }
};

export const downloadReport = async (reportData, format = 'PDF') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = (reportData.name || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    const filename = `${sanitizedName}-${timestamp}`;

    switch (format.toUpperCase()) {
      case 'PDF': {
        const doc = await generatePDF(reportData);
        doc.save(`${filename}.pdf`);
        break;
      }
      case 'XLSX': {
        const wb = generateExcel(reportData);
        XLSX.writeFile(wb, `${filename}.xlsx`);
        break;
      }
      default:
        throw new ReportGenerationError(
          ReportError.UNSUPPORTED_FORMAT,
          `Unsupported format: ${format}`
        );
    }

    return true;
  } catch (error) {
    if (error instanceof ReportGenerationError) {
      throw error;
    }
    throw new ReportGenerationError(
      ReportError.PDF_GENERATION,
      `Failed to download report in ${format} format`,
      error
    );
  }
};
