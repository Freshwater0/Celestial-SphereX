import jsPDF from 'jspdf';
import jspdfAutoTable from 'jspdf-autotable';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { format } from 'date-fns';

// Apply the plugin to jsPDF
jsPDF.API.autoTable = jspdfAutoTable;

// PDF Export Functions
export const exportToPDF = async (reportData, options = {}) => {
  const {
    title = 'Report',
    author = 'Celestial Sphere',
    orientation = 'portrait',
    unit = 'pt',
    format = 'a4',
    margins = { top: 40, right: 40, bottom: 40, left: 40 },
  } = options;

  const doc = new jsPDF(orientation, unit, format);
  
  // Set document properties
  doc.setProperties({
    title: title,
    author: author,
    creationDate: new Date(),
  });

  // Add header
  doc.setFontSize(20);
  doc.text(title, margins.left, margins.top);
  doc.setFontSize(10);
  doc.text(
    `Generated on ${format(new Date(), 'PPpp')}`,
    margins.left,
    margins.top + 20
  );

  let currentY = margins.top + 40;

  // Add sections
  reportData.sections.forEach((section) => {
    // Add section title
    doc.setFontSize(14);
    doc.text(section.title, margins.left, currentY);
    currentY += 20;

    switch (section.type) {
      case 'table':
        // Add table data
        doc.autoTable({
          startY: currentY,
          head: [section.columns],
          body: section.data,
          margin: margins,
          styles: { fontSize: 8 },
        });
        currentY = doc.lastAutoTable.finalY + 20;
        break;

      case 'chart':
        // Convert chart to image and add it
        if (section.chartRef && section.chartRef.current) {
          const canvas = section.chartRef.current.canvas;
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(
            imgData,
            'PNG',
            margins.left,
            currentY,
            500,
            300
          );
          currentY += 320;
        }
        break;

      case 'text':
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(
          section.content,
          format === 'a4' ? 595 - margins.left - margins.right : 842 - margins.left - margins.right
        );
        doc.text(lines, margins.left, currentY);
        currentY += lines.length * 12 + 10;
        break;
    }

    // Add page if needed
    if (currentY > (format === 'a4' ? 842 : 595) - margins.bottom) {
      doc.addPage();
      currentY = margins.top;
    }
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      format === 'a4' ? 595 / 2 : 842 / 2,
      format === 'a4' ? 842 - 20 : 595 - 20,
      { align: 'center' }
    );
  }

  return doc;
};

// Excel Export Functions
export const exportToExcel = (reportData, options = {}) => {
  const {
    sheetName = 'Report Data',
    fileName = 'report.xlsx',
  } = options;

  const workbook = XLSXUtils.book_new();
  
  reportData.sections.forEach((section, index) => {
    if (section.type === 'table') {
      // Convert data to worksheet
      const ws = XLSXUtils.json_to_sheet(section.data, {
        header: section.columns,
      });

      // Add worksheet to workbook
      XLSXUtils.book_append_sheet(
        workbook,
        ws,
        `${sheetName}${index > 0 ? ` ${index + 1}` : ''}`
      );
    }
  });

  return workbook;
};

// CSV Export Function
export const exportToCSV = (data, options = {}) => {
  const {
    delimiter = ',',
    includeHeaders = true,
  } = options;

  const headers = Object.keys(data[0]);
  let csv = includeHeaders ? headers.join(delimiter) + '\n' : '';

  data.forEach(row => {
    csv += headers.map(header => {
      const cell = row[header];
      // Handle cells that contain the delimiter, quotes, or newlines
      if (cell && (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(delimiter) + '\n';
  });

  return csv;
};

// Helper function to download files
export const downloadFile = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
