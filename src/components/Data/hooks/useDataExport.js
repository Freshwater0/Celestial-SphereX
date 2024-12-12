import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export const useDataExport = () => {
  const exportToExcel = useCallback(async (data, columns, filename = 'export.xlsx') => {
    try {
      // Convert data to worksheet format
      const ws = XLSX.utils.json_to_sheet(data);

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file
      saveAs(blob, filename);
    } catch (error) {
      throw new Error('Failed to export to Excel');
    }
  }, []);

  const exportToCsv = useCallback(async (data, columns, filename = 'export.csv') => {
    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } catch (error) {
      throw new Error('Failed to export to CSV');
    }
  }, []);

  const exportToJson = useCallback(async (data, columns, filename = 'export.json') => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      saveAs(blob, filename);
    } catch (error) {
      throw new Error('Failed to export to JSON');
    }
  }, []);

  const exportToPdf = useCallback(async (data, columns, filename = 'export.pdf') => {
    try {
      // Implementation for PDF export
      // This would typically use a library like pdfmake or jspdf
      throw new Error('PDF export not implemented');
    } catch (error) {
      throw new Error('Failed to export to PDF');
    }
  }, []);

  const exportData = useCallback(async (data, columns, format, filename) => {
    switch (format.toLowerCase()) {
      case 'xlsx':
        return exportToExcel(data, columns, filename || 'export.xlsx');
      case 'csv':
        return exportToCsv(data, columns, filename || 'export.csv');
      case 'json':
        return exportToJson(data, columns, filename || 'export.json');
      case 'pdf':
        return exportToPdf(data, columns, filename || 'export.pdf');
      default:
        throw new Error('Unsupported export format');
    }
  }, [exportToExcel, exportToCsv, exportToJson, exportToPdf]);

  return {
    exportData,
    exportToExcel,
    exportToCsv,
    exportToJson,
    exportToPdf,
  };
};
