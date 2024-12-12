import PropTypes from 'prop-types';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Add,
  ViewColumn,
  Functions,
  Save,
  Settings,
  Calculate,
  TrendingUp,
  PieChart,
  Timeline,
  FilterAlt,
  Sort,
  AutoGraph,
} from '@mui/icons-material';
import VirtualizedDataGrid from './DataGrid/VirtualizedDataGrid';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDataImport } from './hooks/useDataImport';
import { useDataExport } from './hooks/useDataExport';
import { DataToolbar } from './components/DataToolbar';
import { ImportDialog } from './components/ImportDialog';
import { ExportDialog } from './components/ExportDialog';
import { ColumnSettingsDialog } from './components/ColumnSettingsDialog';
import { FormulaDialog } from './components/FormulaDialog';
import { CalculationDialog } from './components/CalculationDialog';
import { FilterDialog } from './components/FilterDialog';
import { ChartDialog } from './components/ChartDialog';

const ROWS_PER_PAGE = 50;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataPage error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Typography variant="h6" color="error">
            Something went wrong. Please try refreshing the page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const DataPage = () => {
  // State management
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculationResults, setCalculationResults] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState([]);
  const [aggregations, setAggregations] = useState({});
  const [chartData, setChartData] = useState(null);

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);

  // Refs
  const gridRef = useRef(null);

  // Custom hooks
  const { importData, parseFile } = useDataImport();
  const { exportData } = useDataExport();
  const { saveToLocal, loadFromLocal } = useLocalStorage();

  // Validation rules
  const validationRules = {
    number: {
      min: -1000000,
      max: 1000000,
      precision: 2,
      allowNegative: true,
      customValidation: (value) => {
        if (value > 100000) return 'Consider using scientific notation';
        return null;
      },
    },
    date: {
      format: 'YYYY-MM-DD',
      minDate: '1900-01-01',
      maxDate: '2100-12-31',
      allowFutureDates: true,
      customValidation: (value) => {
        const date = new Date(value);
        if (date.getDay() === 0 || date.getDay() === 6) {
          return 'Weekend date selected';
        }
        return null;
      },
    },
    text: {
      maxLength: 1000,
      minLength: 0,
      allowSpecialChars: true,
      trim: true,
      case: 'any',
      pattern: null,
    },
    formula: {
      maxLength: 2000,
      allowedFunctions: ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX', 'IF', 'VLOOKUP'],
      validateSyntax: true,
    },
  };

  // Conditional formatting
  const conditionalFormatting = {
    numeric: [
      {
        condition: { type: 'lessThan', value: 0 },
        style: { color: '#d32f2f', fontWeight: 'bold' },
      },
      {
        condition: { type: 'greaterThan', value: 1000 },
        style: { color: '#2e7d32', fontWeight: 'bold' },
      },
      {
        condition: { type: 'between', min: 0, max: 1000 },
        style: { color: '#1976d2' },
      },
      {
        condition: { type: 'equals', value: 0 },
        style: { backgroundColor: '#f5f5f5' },
      },
    ],
    text: [
      {
        condition: { type: 'contains', value: 'ERROR' },
        style: { color: '#d32f2f', backgroundColor: '#ffebee' },
      },
      {
        condition: { type: 'startsWith', value: '#' },
        style: { fontWeight: 'bold' },
      },
    ],
    date: [
      {
        condition: { type: 'isPast' },
        style: { color: '#757575' },
      },
      {
        condition: { type: 'isFuture' },
        style: { color: '#1976d2' },
      },
      {
        condition: { type: 'isToday' },
        style: { backgroundColor: '#e3f2fd', fontWeight: 'bold' },
      },
    ],
    custom: [
      {
        condition: (value, row, column) => {
          return value > row.average;
        },
        style: { backgroundColor: '#e8f5e9' },
      },
    ],
  };

  // Advanced calculation handlers
  const handleAdvancedCalculation = useCallback((type, selection) => {
    const selectedData = selection.map(cell => data[cell.rowIndex][columns[cell.columnIndex].field]);

    let result;
    switch (type) {
      case 'statistics':
        result = {
          sum: selectedData.reduce((a, b) => a + (Number(b) || 0), 0),
          average: selectedData.reduce((a, b) => a + (Number(b) || 0), 0) / selectedData.length,
          min: Math.min(...selectedData.map(v => Number(v) || Infinity)),
          max: Math.max(...selectedData.map(v => Number(v) || -Infinity)),
          count: selectedData.length,
          distinctCount: new Set(selectedData).size,
          variance: calculateVariance(selectedData),
          stdDev: calculateStdDev(selectedData),
        };
        break;
      case 'timeSeries':
        result = {
          trend: calculateTrend(selectedData),
          movingAverage: calculateMovingAverage(selectedData, 3),
          seasonality: detectSeasonality(selectedData),
        };
        break;
      case 'distribution':
        result = {
          histogram: calculateHistogram(selectedData),
          quartiles: calculateQuartiles(selectedData),
          outliers: detectOutliers(selectedData),
        };
        break;
    }

    setCalculationResults(prev => ({ ...prev, [type]: result }));
  }, [data, columns]);

  // Enhanced cell edit handler with formula support
  const handleCellEdit = useCallback((value, rowIndex, columnIndex) => {
    setData(prevData => {
      const newData = [...prevData];
      const field = columns[columnIndex].field;

      if (typeof value === 'string' && value.startsWith('=')) {
        try {
          const formulaResult = evaluateFormula(value.substring(1), newData, rowIndex, columns);
          newData[rowIndex] = { 
            ...newData[rowIndex], 
            [field]: value,
            [`${field}_calculated`]: formulaResult 
          };
        } catch (err) {
          newData[rowIndex] = { 
            ...newData[rowIndex], 
            [field]: value,
            [`${field}_error`]: err.message 
          };
        }
      } else {
        newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      }

      return newData;
    });
  }, [columns]);

  // Advanced filtering
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    const filteredData = applyFilters(data, filters);
    setData(filteredData);
  }, [data]);

  // Advanced sorting
  const handleSortChange = useCallback((sortConfig) => {
    setSortConfig(sortConfig);
    const sortedData = applySort(data, sortConfig);
    setData(sortedData);
  }, [data]);

  // Chart generation
  const handleChartGenerate = useCallback((config) => {
    const chartData = generateChartData(data, config);
    setChartData(chartData);
  }, [data]);

  // SpeedDial actions
  const actions = [
    { icon: <Calculate />, name: 'Advanced Calculations', onClick: () => setCalculationDialogOpen(true) },
    { icon: <FilterAlt />, name: 'Advanced Filters', onClick: () => setFilterDialogOpen(true) },
    { icon: <Sort />, name: 'Advanced Sort', onClick: () => setSortDialogOpen(true) },
    { icon: <AutoGraph />, name: 'Generate Chart', onClick: () => setChartDialogOpen(true) },
  ];

  // Load more data handler
  const handleLoadMoreRows = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newData = await fetchMoreData(page, ROWS_PER_PAGE);
      setData(prevData => [...prevData, ...newData]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError('Failed to load more data');
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading]);

  // Import handlers
  const handleImport = useCallback(async (files) => {
    try {
      const importedData = await importData(files[0]);
      setData(importedData.data);
      setColumns(importedData.columns);
      setImportDialogOpen(false);
    } catch (err) {
      setError('Failed to import data');
    }
  }, [importData]);

  // Export handlers
  const handleExport = useCallback(async (format) => {
    try {
      await exportData(data, columns, format);
      setExportDialogOpen(false);
    } catch (err) {
      setError('Failed to export data');
    }
  }, [data, columns, exportData]);

  // Column settings handlers
  const handleColumnSettingsChange = useCallback((newColumns) => {
    setColumns(newColumns);
    setColumnSettingsOpen(false);
  }, []);

  // Formula handlers
  const handleFormulaAdd = useCallback((formula, targetCells) => {
    setData(prevData => {
      const newData = [...prevData];
      targetCells.forEach(({ rowIndex, columnIndex }) => {
        const field = columns[columnIndex].field;
        newData[rowIndex] = { ...newData[rowIndex], [field]: `=${formula}` };
      });
      return newData;
    });
    setFormulaDialogOpen(false);
  }, [columns]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any subscriptions or pending operations
      if (gridRef.current) {
        gridRef.current.destroy();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <DataToolbar
          onImport={() => setImportDialogOpen(true)}
          onExport={() => setExportDialogOpen(true)}
          onColumnSettings={() => setColumnSettingsOpen(true)}
          onFormula={() => setFormulaDialogOpen(true)}
          onSave={() => saveToLocal('gridData', { data, columns })}
          calculationResults={calculationResults}
          activeFilters={activeFilters}
          sortConfig={sortConfig}
        />

        <Paper sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <VirtualizedDataGrid
            ref={gridRef}
            data={data}
            columns={columns}
            onCellEdit={handleCellEdit}
            validationRules={validationRules}
            conditionalFormatting={conditionalFormatting}
            loadMoreRows={handleLoadMoreRows}
            totalRows={data.length}
            isLoading={isLoading}
            onSelectionChange={setSelectedCells}
            activeFilters={activeFilters}
            sortConfig={sortConfig}
          />

          <SpeedDial
            ariaLabel="Data operations"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onClick}
              />
            ))}
          </SpeedDial>
        </Paper>

        <ImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImport}
        />

        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleExport}
        />

        <ColumnSettingsDialog
          open={columnSettingsOpen}
          columns={columns}
          onClose={() => setColumnSettingsOpen(false)}
          onChange={handleColumnSettingsChange}
        />

        <FormulaDialog
          open={formulaDialogOpen}
          onClose={() => setFormulaDialogOpen(false)}
          onAdd={handleFormulaAdd}
          selectedCells={selectedCells}
        />

        <CalculationDialog
          open={calculationDialogOpen}
          onClose={() => setCalculationDialogOpen(false)}
          onCalculate={handleAdvancedCalculation}
          selectedCells={selectedCells}
          results={calculationResults}
        />

        <FilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApply={handleFilterChange}
          columns={columns}
          activeFilters={activeFilters}
        />

        <ChartDialog
          open={chartDialogOpen}
          onClose={() => setChartDialogOpen(false)}
          onGenerate={handleChartGenerate}
          data={data}
          columns={columns}
          chartData={chartData}
        />

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
};

DataPage.propTypes = {
  initialData: PropTypes.array,
  onDataChange: PropTypes.func,
  onError: PropTypes.func,
};

DataPage.defaultProps = {
  initialData: [],
  onDataChange: () => {},
  onError: () => {},
};

export default React.memo(DataPage);
