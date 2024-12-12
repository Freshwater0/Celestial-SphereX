import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';
import './DataTable.css';

// Function to convert number to Excel-style column header
const getExcelColumnName = (index) => {
  let columnName = '';
  let num = index;
  
  while (num >= 0) {
    columnName = String.fromCharCode(65 + (num % 26)) + columnName;
    num = Math.floor(num / 26) - 1;
  }
  
  return columnName;
};

const DataTable = ({ 
  data = [], 
  columns = [], 
  pageSize = 10,
  onCellChange,
  selectedRows = [],
  onSelectRow,
  highlightedCells = [],
  onHighlightCell,
  cellStyles = {},
  onCellSelection,
  getCellDisplayValue,
  selectedCells = [],
  onScroll,
  virtualScroll = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [editCell, setEditCell] = useState({ rowIndex: -1, colIndex: -1 });
  const [tableData, setTableData] = useState(data);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(false);
  const resizeRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Handle column resize
  const handleResizeStart = (e, columnId) => {
    e.stopPropagation();
    setResizing(true);
    const startX = e.pageX;
    const currentWidth = columnWidths[columnId] || 100;

    const handleMouseMove = (moveEvent) => {
      if (resizing) {
        const difference = moveEvent.pageX - startX;
        const newWidth = Math.max(100, currentWidth + difference);
        setColumnWidths(prev => ({
          ...prev,
          [columnId]: newWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Sorting handler
  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });

    const sortedData = [...tableData].sort((a, b) => {
      if (a[columnKey] < b[columnKey]) return direction === 'asc' ? -1 : 1;
      if (a[columnKey] > b[columnKey]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setTableData(sortedData);
  };

  // Filter handler
  const handleFilter = (event) => {
    const value = event.target.value;
    setFilterText(value);
    setPage(0); // Reset to first page when filtering
    
    if (!value) {
      setTableData(data);
      return;
    }

    const filtered = data.filter(row =>
      Object.values(row).some(cell =>
        String(cell).toLowerCase().includes(value.toLowerCase())
      )
    );
    setTableData(filtered);
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = new Set(tableData.map((_, index) => index));
      onSelectRow(newSelected);
    } else {
      onSelectRow(new Set());
    }
  };

  const handleSelectRow = (index) => {
    onSelectRow(index);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle scroll events for virtual scrolling
  const handleScroll = useCallback((event) => {
    if (virtualScroll && onScroll) {
      const { scrollTop } = event.target;
      onScroll(scrollTop);
    }
  }, [virtualScroll, onScroll]);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer && virtualScroll) {
      tableContainer.addEventListener('scroll', handleScroll);
      return () => tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, virtualScroll]);

  // Render cell content
  const renderCell = (row, column, rowIndex, colIndex) => {
    const isEditing = editCell.rowIndex === rowIndex && editCell.colIndex === colIndex;
    const value = row[column.accessor] || '';
    const cellId = `${rowIndex}-${column.accessor}`;
    const isSelected = selectedCells.includes(cellId);
    const isHighlighted = highlightedCells.includes(cellId);
    
    if (isEditing) {
      return (
        <div className="cell-content editing">
          <input
            className="cell-input"
            autoFocus
            defaultValue={value}
            onKeyPress={(e) => handleKeyPress(e, rowIndex, column.accessor)}
            onBlur={(e) => handleCellEdit(e.target.value, rowIndex, column.accessor)}
          />
        </div>
      );
    }
    
    return (
      <div
        className={`cell-content ${isSelected ? 'cell-selected' : ''} ${isHighlighted ? 'cell-highlighted' : ''}`}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        tabIndex={0}
      >
        {value.toString()}
      </div>
    );
  };

  const handleCellClick = (rowIndex, colIndex) => {
    setEditCell({ rowIndex, colIndex });
    if (onCellSelection) {
      onCellSelection(`${rowIndex}-${colIndex}`);
    }
  };

  const handleCellEdit = (value, rowIndex, columnAccessor) => {
    const newData = [...tableData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnAccessor]: value
    };
    setTableData(newData);
    setEditCell({ rowIndex: -1, colIndex: -1 });
    if (onCellChange) {
      onCellChange(rowIndex, columnAccessor, value);
    }
  };

  const handleKeyPress = (event, rowIndex, columnAccessor) => {
    if (event.key === 'Enter') {
      handleCellEdit(event.target.value, rowIndex, columnAccessor);
    }
  };

  return (
    <Paper className="data-table-container">
      <TableContainer 
        ref={tableContainerRef}
        component={Paper} 
        style={{ maxHeight: virtualScroll ? '600px' : 'auto' }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell className="row-number row-number-header"></TableCell>
              {columns.map((column, index) => (
                <TableCell
                  key={column.accessor}
                  className="column-header"
                  style={{ width: columnWidths[column.accessor] || 100 }}
                >
                  <span className="column-header-text">{getExcelColumnName(index)}</span>
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleResizeStart(e, column.accessor)}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => {
              const actualRowIndex = page * rowsPerPage + rowIndex + 1;
              return (
                <TableRow
                  key={rowIndex}
                  selected={selectedRows.includes(rowIndex)}
                  hover
                >
                  <TableCell className="row-number">{actualRowIndex}</TableCell>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`${rowIndex}-${column.accessor}`}
                      className="data-cell"
                      style={{
                        ...cellStyles[`${rowIndex}-${column.accessor}`],
                        width: columnWidths[column.accessor] || 100
                      }}
                    >
                      {renderCell(row, column, rowIndex, colIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default DataTable;
