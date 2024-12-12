import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const useDataImport = () => {
  const parseExcel = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Extract headers and data
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          // Create columns configuration
          const columns = headers.map(header => ({
            field: header,
            headerName: header,
            type: detectColumnType(rows.map(row => row[headers.indexOf(header)])),
          }));

          // Convert rows to objects
          const data = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });

          resolve({ data, columns });
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }, []);

  const parseCsv = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Failed to parse CSV file'));
            return;
          }

          const columns = Object.keys(results.data[0]).map(field => ({
            field,
            headerName: field,
            type: detectColumnType(results.data.map(row => row[field])),
          }));

          resolve({ data: results.data, columns });
        },
        error: (error) => reject(new Error('Failed to parse CSV file')),
      });
    });
  }, []);

  const parseJson = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (!Array.isArray(jsonData)) {
            reject(new Error('JSON file must contain an array of objects'));
            return;
          }

          const columns = Object.keys(jsonData[0]).map(field => ({
            field,
            headerName: field,
            type: detectColumnType(jsonData.map(row => row[field])),
          }));

          resolve({ data: jsonData, columns });
        } catch (error) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const detectColumnType = useCallback((values) => {
    const nonNullValues = values.filter(v => v != null);
    if (nonNullValues.length === 0) return 'text';

    const types = nonNullValues.map(value => {
      if (typeof value === 'number') return 'number';
      if (typeof value === 'boolean') return 'boolean';
      if (typeof value === 'string') {
        // Check if it's a date
        const date = new Date(value);
        if (!isNaN(date.getTime())) return 'date';
        // Check if it's an email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
      }
      return 'text';
    });

    // Return most common type
    return types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const importData = useCallback(async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return parseExcel(file);
      case 'csv':
        return parseCsv(file);
      case 'json':
        return parseJson(file);
      default:
        throw new Error('Unsupported file format');
    }
  }, [parseExcel, parseCsv, parseJson]);

  return {
    importData,
    parseExcel,
    parseCsv,
    parseJson,
  };
};
