import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  FilterList,
  Sort,
  MoreVert,
  Calculate,
  Functions,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { useFormulaParser } from './hooks/useFormulaParser';
import { useDataValidation } from './hooks/useDataValidation';
import { useConditionalFormatting } from './hooks/useConditionalFormatting';

const COLUMN_WIDTH = 150;
const ROW_HEIGHT = 35;
const HEADER_HEIGHT = 40;
const SCROLL_THRESHOLD = 0.8;

const VirtualizedDataGrid = ({
  data,
  columns,
  onCellEdit,
  validationRules,
  conditionalFormatting,
  sortConfig,
  filterConfig,
  formulaConfig,
  loadMoreRows,
  totalRows,
  isLoading,
  onSelectionChange,
}) => {
  const gridRef = useRef(null);
  const [editingCell, setEditingCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [error, setError] = useState(null);

  const { evaluateFormula, isFormulaCell } = useFormulaParser(formulaConfig);
  const { validateCell, getValidationError } = useDataValidation(validationRules);
  const { getCellStyle } = useConditionalFormatting(conditionalFormatting);

  // Memoize column widths and row heights
  const columnWidths = useMemo(() => 
    columns.map(col => col.width || COLUMN_WIDTH),
    [columns]
  );

  const getColumnWidth = useCallback(
    (index) => columnWidths[index],
    [columnWidths]
  );

  const getRowHeight = useCallback(
    () => ROW_HEIGHT,
    []
  );

  // Optimized key generator
  const getItemKey = useCallback(
    ({ columnIndex, rowIndex }) => `${rowIndex}:${columnIndex}`,
    []
  );

  // Debounced scroll handler
  const handleScroll = useMemo(
    () => debounce(({ scrollTop, scrollHeight, clientHeight }) => {
      if (!isLoading && loadMoreRows && scrollTop > scrollHeight * SCROLL_THRESHOLD) {
        loadMoreRows();
      }
    }, 150),
    [isLoading, loadMoreRows]
  );

  // Cell editing handlers
  const handleCellDoubleClick = useCallback((rowIndex, columnIndex) => {
    if (!columns[columnIndex].readOnly) {
      setEditingCell({ rowIndex, columnIndex });
    }
  }, [columns]);

  const handleCellEdit = useCallback((value, rowIndex, columnIndex) => {
    try {
      if (validateCell(value, columns[columnIndex].type)) {
        onCellEdit(value, rowIndex, columnIndex);
        setEditingCell(null);
        setError(null);
      }
    } catch (err) {
      setError(`Error updating cell: ${err.message}`);
      console.error('Cell edit error:', err);
    }
  }, [columns, onCellEdit, validateCell]);

  // Selection handlers
  const handleCellSelect = useCallback((rowIndex, columnIndex, isMultiSelect) => {
    setSelectedCells(prev => {
      const newSelection = isMultiSelect
        ? [...prev, { rowIndex, columnIndex }]
        : [{ rowIndex, columnIndex }];
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Context menu handlers
  const handleContextMenu = useCallback((event, rowIndex, columnIndex) => {
    event.preventDefault();
    setContextMenu({
      position: { x: event.clientX, y: event.clientY },
      cell: { rowIndex, columnIndex },
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      handleScroll.cancel();
    };
  }, [handleScroll]);

  // Cell renderer with memoization
  const Cell = useMemo(() => {
    return React.memo(({ columnIndex, rowIndex, style }) => {
      const column = columns[columnIndex];
      const cellData = data[rowIndex]?.[column.field];
      const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnIndex === columnIndex;
      const isHovered = hoveredCell?.rowIndex === rowIndex && hoveredCell?.columnIndex === columnIndex;
      const isSelected = selectedCells.some(cell => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex);
      const isFormula = isFormulaCell(cellData);
      const validationError = getValidationError(cellData, column.type);
      const conditionalStyle = getCellStyle(cellData, rowIndex, columnIndex);

      const cellStyle = {
        ...style,
        ...conditionalStyle,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        borderRight: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'white',
        cursor: 'default',
        position: 'relative',
      };

      if (isEditing) {
        return (
          <Box style={cellStyle}>
            <TextField
              autoFocus
              fullWidth
              defaultValue={cellData}
              onBlur={(e) => handleCellEdit(e.target.value, rowIndex, columnIndex)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCellEdit(e.target.value, rowIndex, columnIndex);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              error={!!validationError}
              helperText={validationError}
              size="small"
            />
          </Box>
        );
      }

      return (
        <Box
          style={cellStyle}
          onDoubleClick={() => handleCellDoubleClick(rowIndex, columnIndex)}
          onContextMenu={(e) => handleContextMenu(e, rowIndex, columnIndex)}
          onMouseEnter={() => setHoveredCell({ rowIndex, columnIndex })}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={(e) => handleCellSelect(rowIndex, columnIndex, e.ctrlKey)}
          role="gridcell"
          tabIndex={0}
          aria-selected={isSelected}
          aria-readonly={column.readOnly}
          data-row={rowIndex}
          data-col={columnIndex}
        >
          <Typography
            variant="body2"
            noWrap
            title={cellData}
            sx={{
              color: isFormula ? 'primary.main' : 'inherit',
              fontStyle: isFormula ? 'italic' : 'normal',
            }}
          >
            {isFormula ? evaluateFormula(cellData) : cellData}
          </Typography>
          {validationError && (
            <Tooltip title={validationError} placement="top">
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 8px 8px 0',
                  borderColor: 'transparent #f44336 transparent transparent',
                }}
              />
            </Tooltip>
          )}
        </Box>
      );
    });
  }, [
    columns,
    data,
    editingCell,
    hoveredCell,
    selectedCells,
    evaluateFormula,
    isFormulaCell,
    getValidationError,
    getCellStyle,
    handleCellDoubleClick,
    handleCellEdit,
    handleCellSelect,
    handleContextMenu,
  ]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            ref={gridRef}
            columnCount={columns.length}
            columnWidth={getColumnWidth}
            height={height}
            rowCount={data.length}
            rowHeight={getRowHeight}
            width={width}
            itemKey={getItemKey}
            onScroll={handleScroll}
            overscanRowCount={5}
            overscanColumnCount={2}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
      
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="caption">Loading more rows...</Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            backgroundColor: 'error.main',
            color: 'white',
            padding: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant="caption">{error}</Typography>
        </Box>
      )}

      <Menu
        open={!!contextMenu}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu?.position
            ? { top: contextMenu.position.y, left: contextMenu.position.x }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (contextMenu) {
            handleCellDoubleClick(contextMenu.cell.rowIndex, contextMenu.cell.columnIndex);
          }
          setContextMenu(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
      </Menu>
    </Box>
  );
};

VirtualizedDataGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    width: PropTypes.number,
    readOnly: PropTypes.bool,
  })).isRequired,
  onCellEdit: PropTypes.func.isRequired,
  validationRules: PropTypes.object,
  conditionalFormatting: PropTypes.object,
  sortConfig: PropTypes.object,
  filterConfig: PropTypes.object,
  formulaConfig: PropTypes.object,
  loadMoreRows: PropTypes.func,
  totalRows: PropTypes.number,
  isLoading: PropTypes.bool,
  onSelectionChange: PropTypes.func,
};

VirtualizedDataGrid.defaultProps = {
  validationRules: {},
  conditionalFormatting: {},
  sortConfig: {},
  filterConfig: {},
  formulaConfig: {},
  isLoading: false,
};

export default React.memo(VirtualizedDataGrid);
