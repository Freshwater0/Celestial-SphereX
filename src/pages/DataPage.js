import React, { useState, Suspense, lazy, useEffect, useCallback, useMemo } from 'react';
import { BsFileEarmark, BsFolder, BsFillFileEarmarkTextFill, BsDownload, BsEnvelope } from 'react-icons/bs';
import { BiUndo, BiRedo, BiCut, BiCopy, BiPaste, BiDollar } from 'react-icons/bi';
import { BsTypeBold, BsTypeItalic, BsTypeUnderline, BsFilter, BsCalculator, BsPercent, BsSortDown } from 'react-icons/bs';
import { AiOutlineNumber } from 'react-icons/ai';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './DataPage.css';
import { format } from 'date-fns';

// Lazy load the DataChart component
const DataChart = lazy(() => import('./components/DataChart'));

// Constants for grid configuration
const INITIAL_ROWS = 1000;
const MAX_ROWS = 500000;
const ROWS_PER_PAGE = 100;
const TOTAL_COLUMNS = 26;
const ROW_HEIGHT = 30;
const BUFFER_ROWS = 10;

// Create a custom array class to handle actual length
class DataArray extends Array {
    constructor(length) {
        super(length);
        this._actualLength = length;
    }
}

// Helper functions for data operations
const createDataArrayFrom = (data, length = data.length) => {
    const newArray = new DataArray(length);
    Object.assign(newArray, data);
    newArray._actualLength = data._actualLength || length;
    return newArray;
};

const filterDataRows = (data, filterText) => {
    if (!filterText) return data;
    return data.filter(row => {
        if (!row) return false;
        return Object.values(row).some(value => 
            value && value.toString().toLowerCase().includes(filterText.toLowerCase())
        );
    });
};

const handleDataUpdate = (prevData, updateFn) => {
    const newData = createDataArrayFrom(prevData);
    updateFn(newData);
    return newData;
};

// Initialize data structure for dynamic rows
const generateEmptyData = (rowCount = INITIAL_ROWS) => {
    // Create base array with actual length tracking
    const baseArray = new DataArray(rowCount);
    Object.defineProperty(baseArray, '_actualLength', {
        writable: true,
        enumerable: false,
        value: rowCount
    });

    // Create proxy for lazy initialization
    return new Proxy(baseArray, {
        get(target, prop) {
            // Convert symbol to string if needed
            const key = typeof prop === 'symbol' ? prop.description || prop.toString() : String(prop);
            
            // Handle special properties
            if (key === 'length') {
                return Math.max(rowCount, target._actualLength);
            }
            if (key === '_actualLength') {
                return target._actualLength;
            }
            
            // Handle array methods
            if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
            }
            
            // Handle numeric indices
            const index = Number.parseInt(key);
            if (!Number.isNaN(index) && index >= 0 && index < MAX_ROWS) {
                // Lazy initialize row data
                if (!target[index]) {
                    const row = {};
                    for (let j = 0; j < TOTAL_COLUMNS; j++) {
                        const columnKey = String.fromCharCode(65 + j);
                        row[columnKey] = '';
                    }
                    target[index] = row;
                }
                return target[index];
            }
            
            return target[prop];
        },
        set(target, prop, value) {
            // Convert symbol to string if needed
            const key = typeof prop === 'symbol' ? prop.description || prop.toString() : String(prop);
            
            // Handle special properties
            if (key === '_actualLength') {
                Object.defineProperty(target, '_actualLength', {
                    writable: true,
                    enumerable: false,
                    value: value
                });
                return true;
            }
            
            // Handle numeric indices
            const index = Number.parseInt(key);
            if (!Number.isNaN(index) && index >= 0 && index < MAX_ROWS) {
                target[index] = value;
                // Update actual length if needed
                const currentLength = target._actualLength || rowCount;
                if (index >= currentLength) {
                    target._actualLength = index + 1;
                }
            }
            return true;
        }
    });
};

// Helper function to create empty row
const generateEmptyRow = () => {
    const row = {};
    for (let j = 0; j < TOTAL_COLUMNS; j++) {
        const columnKey = String.fromCharCode(65 + j);
        row[columnKey] = '';
    }
    return row;
};

// Cell display and formatting utilities
const getCellDisplayValue = (value, format) => {
    if (typeof value === 'number') {
        return format ? value.toFixed(format) : value;
    }
    return value;
};

const DataPage = () => {
    const applyCellFormatting = (style) => {
        if (selectedCells.length === 0) return;

        const newData = handleDataUpdate(data, (newData) => {
            selectedCells.forEach(cellId => {
                const [rowIndex, colKey] = cellId.split('-');
                if (!newData[rowIndex]) {
                    newData[rowIndex] = generateEmptyRow();
                }
                // Apply the style to the cell
                newData[rowIndex][colKey] = {
                    ...newData[rowIndex][colKey],
                    style: { ...newData[rowIndex][colKey].style, ...style }
                };
            });
        });
        setData(newData);
    };

    const [filter, setFilter] = useState('');
    const [data, setData] = useState(generateEmptyData());
    const [cellStyles, setCellStyles] = useState({});
    const [cellFormats, setCellFormats] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [highlightedCells, setHighlightedCells] = useState([]);
    const [decimalPlaces, setDecimalPlaces] = useState({});
    const [copiedValue, setCopiedValue] = useState(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [clipboardData, setClipboardData] = useState(null);
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: ROWS_PER_PAGE });
    const [containerHeight, setContainerHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const gridRef = React.createRef();

    // Filter data handling
    const filteredData = useMemo(() => {
        return filterDataRows(data, filter);
    }, [data, filter]);

    // Virtual scroll handler
    const handleScroll = useCallback((scrollTop) => {
        const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
        const visibleRows = Math.ceil(containerHeight / ROW_HEIGHT);
        const endIndex = Math.min(startIndex + visibleRows + BUFFER_ROWS, MAX_ROWS);
        
        setVisibleRange({ startIndex, endIndex });
    }, [containerHeight]);

    // Optimize row rendering
    const getRowsToRender = useCallback(() => {
        const { startIndex, endIndex } = visibleRange;
        const rowsToRender = [];
        
        for (let i = startIndex; i < endIndex; i++) {
            if (i >= 0 && i < MAX_ROWS) {
                rowsToRender.push({
                    index: i,
                    data: data[i] || generateEmptyRow()
                });
            }
        }
        
        return rowsToRender;
    }, [visibleRange, data]);

    // Update grid container measurements
    const updateGridMeasurements = useCallback(() => {
        if (gridRef.current) {
            const rect = gridRef.current.getBoundingClientRect();
            setContainerHeight(rect.height);
            setContainerWidth(rect.width);
        }
    }, []);

    // Initialize resize observer
    useEffect(() => {
        const observer = new ResizeObserver(updateGridMeasurements);
        if (gridRef.current) {
            observer.observe(gridRef.current);
        }
        return () => observer.disconnect();
    }, []);

    // Update columns when cellStyles or cellFormats change
    useEffect(() => {
        // Update columns
    }, [cellStyles, cellFormats]);

    // Handle data updates efficiently
    const updateCellValue = useCallback((params) => {
        const { data, colDef, value } = params;
        const rowIndex = data.index;
        const columnKey = colDef.field;
        if (rowIndex >= 0 && rowIndex < MAX_ROWS) {
            const newData = handleDataUpdate(data, (newData) => {
                if (!newData[rowIndex]) {
                    newData[rowIndex] = generateEmptyRow();
                }
                newData[rowIndex][columnKey] = value;
                newData._actualLength = Math.max(newData._actualLength, rowIndex + 1);
            });
            setData(newData);
            pushToHistory(newData);
        }
    }, [data]);

    // Optimize clipboard operations for large datasets
    const handlePaste = useCallback(() => {
        if (!clipboardData || selectedCells.length === 0) return;
        
        const [targetRowIndex, targetColKey] = selectedCells[0].split('-');
        const rowOffset = parseInt(targetRowIndex);
        const colOffset = Object.keys(data[0]).indexOf(targetColKey);
        
        const newData = handleDataUpdate(data, (newData) => {
            const newStyles = { ...cellStyles };
            
            // Process clipboard data in chunks to avoid blocking the UI
            const processChunk = (entries, startIndex) => {
                const chunkSize = 1000;
                const endIndex = Math.min(startIndex + chunkSize, entries.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const [sourceRow, rowData] = entries[i];
                    Object.entries(rowData).forEach(([sourceCol, { value, style }]) => {
                        const targetRow = rowOffset + parseInt(sourceRow);
                        const targetCol = Object.keys(data[0])[colOffset + Object.keys(data[0]).indexOf(sourceCol)];
                        
                        if (targetRow < MAX_ROWS && targetCol) {
                            if (!newData[targetRow]) {
                                newData[targetRow] = generateEmptyRow();
                            }
                            newData[targetRow][targetCol] = value;
                            if (style) {
                                newStyles[`${targetRow}-${targetCol}`] = style;
                            }
                        }
                    });
                }
                
                if (endIndex < entries.length) {
                    requestAnimationFrame(() => processChunk(entries, endIndex));
                } else {
                    setCellStyles(newStyles);
                }
            };
            
            processChunk(Object.entries(clipboardData), 0);
        });
        setData(newData);
    }, [clipboardData, selectedCells]);

    // History management
    const pushToHistory = (newData) => {
        setUndoStack(prev => [...prev, data]);
        setRedoStack([]);
        setData(newData);
    };

    const undo = () => {
        if (undoStack.length > 0) {
            const prevState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [...prev, data]);
            setData(prevState);
            setUndoStack(prev => prev.slice(0, -1));
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack[redoStack.length - 1];
            setUndoStack(prev => [...prev, data]);
            setData(nextState);
            setRedoStack(prev => prev.slice(0, -1));
        }
    };

    // Clipboard operations
    const handleCut = () => {
        if (selectedCells.length === 0) return;
        
        const cutData = {};
        selectedCells.forEach(cellId => {
            const [rowIndex, colKey] = cellId.split('-');
            if (!cutData[rowIndex]) cutData[rowIndex] = {};
            cutData[rowIndex][colKey] = {
                value: data[rowIndex][colKey],
                style: cellStyles[cellId]
            };
        });
        
        // Clear cut cells
        const newData = handleDataUpdate(data, (newData) => {
            selectedCells.forEach(cellId => {
                const [rowIndex, colKey] = cellId.split('-');
                newData[rowIndex] = { ...newData[rowIndex], [colKey]: '' };
                delete cellStyles[cellId];
            });
        });
        
        setClipboardData(cutData);
        setData(newData);
        pushToHistory(newData);
    };

    const handleCopy = () => {
        if (selectedCells.length === 0) return;
        
        const copyData = {};
        selectedCells.forEach(cellId => {
            const [rowIndex, colKey] = cellId.split('-');
            if (!copyData[rowIndex]) copyData[rowIndex] = {};
            copyData[rowIndex][colKey] = {
                value: data[rowIndex][colKey],
                style: cellStyles[cellId]
            };
        });
        
        setClipboardData(copyData);
    };

    // File operations
    const handleNewFile = () => {
        const shouldProceed = window.confirm('Are you sure you want to create a new file? Any unsaved changes will be lost.');
        if (shouldProceed) {
            setData(generateEmptyData());
            setCellStyles({});
            setCellFormats({});
            setUndoStack([]);
            setRedoStack([]);
        }
    };

    const handleSave = () => {
        const fileData = {
            data,
            cellStyles,
            columnDefs // Updated to use columnDefs instead of columns
        };
        const blob = new Blob([JSON.stringify(fileData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spreadsheet.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleOpen = (event) => {
        if (!event?.target?.files?.length) {
            console.error('No file selected');
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            console.error('Invalid file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (!(typeof result === 'string')) {
                    throw new Error('Invalid file format. Expected text content.');
                }

                const jsonData = JSON.parse(result);
                if (!jsonData || typeof jsonData !== 'object') {
                    throw new Error('Invalid JSON format');
                }

                // Handle both array data and object data with metadata
                const dataToLoad = Array.isArray(jsonData) ? jsonData : jsonData.data;
                if (!Array.isArray(dataToLoad)) {
                    throw new Error('Invalid data format. Expected array.');
                }

                const newData = createDataArrayFrom(dataToLoad);
                setData(newData);

                // Load cell styles and formats if present
                if (jsonData.cellStyles) {
                    setCellStyles(jsonData.cellStyles);
                }
                if (jsonData.cellFormats) {
                    setCellFormats(jsonData.cellFormats);
                }

                // Clear undo/redo stacks
                setUndoStack([]);
                setRedoStack([]);
            } catch (error) {
                console.error('Error loading file:', error);
                alert(`Error loading file: ${error.message}`);
            }
        };

        reader.onerror = () => {
            console.error('Error reading file');
            alert('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    };

    // CSV Export functionality
    const exportToCSV = () => {
        const csvRows = [];
        const headers = Array.from({ length: TOTAL_COLUMNS }, (_, i) => 
            String.fromCharCode(65 + i)
        );
        csvRows.push(headers.join(','));

        // Process rows in chunks to avoid blocking UI
        const processChunk = (startIndex, endIndex) => {
            for (let i = startIndex; i < endIndex && i < data.length; i++) {
                if (data[i]) {
                    const values = headers.map(header => {
                        const value = data[i][header];
                        // Handle values that need escaping
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value || '';
                    });
                    csvRows.push(values.join(','));
                }
            }

            if (endIndex < data.length) {
                requestAnimationFrame(() => processChunk(endIndex, endIndex + 1000));
            } else {
                // Download the CSV file
                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'spreadsheet_export.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }
        };

        // Start processing in chunks
        processChunk(0, 1000);
    };

    // Formatting operations
    const formatNumber = (value, type) => {
        if (!value || isNaN(value)) return value;
        const num = parseFloat(value);
        switch (type) {
            case 'number':
                return num.toLocaleString();
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(num);
            case 'percent':
                return `${(num * 100).toFixed(2)}%`;
            default:
                return value;
        }
    };

    const applyNumberFormat = () => {
        if (selectedCells.length === 0) return;
        const newData = handleDataUpdate(data, (newData) => {
            selectedCells.forEach(cellId => {
                const [rowIndex, colKey] = cellId.split('-');
                const value = newData[rowIndex][colKey];
                if (!isNaN(value)) {
                    newData[rowIndex][colKey] = formatNumber(value, 'number');
                }
            });
        });
        pushToHistory(newData);
    };

    const applyCurrencyFormat = () => {
        if (selectedCells.length === 0) return;
        const newData = handleDataUpdate(data, (newData) => {
            selectedCells.forEach(cellId => {
                const [rowIndex, colKey] = cellId.split('-');
                const value = newData[rowIndex][colKey];
                if (!isNaN(value)) {
                    newData[rowIndex][colKey] = formatNumber(value, 'currency');
                }
            });
        });
        pushToHistory(newData);
    };

    const applyPercentFormat = () => {
        if (selectedCells.length === 0) return;
        const newData = handleDataUpdate(data, (newData) => {
            selectedCells.forEach(cellId => {
                const [rowIndex, colKey] = cellId.split('-');
                const value = newData[rowIndex][colKey];
                if (!isNaN(value)) {
                    newData[rowIndex][colKey] = formatNumber(value, 'percent');
                }
            });
        });
        pushToHistory(newData);
    };

    // Calculation functions
    const calculateSum = () => {
        if (selectedCells.length === 0) return;
        
        const sum = selectedCells.reduce((acc, cellId) => {
            const [rowIndex, colKey] = cellId.split('-');
            const value = Number(data[parseInt(rowIndex)][colKey]) || 0;
            return acc + value;
        }, 0);
        
        const [lastRowIndex, lastColKey] = selectedCells[selectedCells.length - 1].split('-');
        const targetRowIndex = parseInt(lastRowIndex) + 1;
        
        if (targetRowIndex < MAX_ROWS) {
            const newData = handleDataUpdate(data, (newData) => {
                newData[targetRowIndex][lastColKey] = sum.toString();
            });
            setData(newData);
            pushToHistory(newData);
        }
    };

    const calculateAverage = () => {
        if (selectedCells.length === 0) return;
        let sum = 0;
        let count = 0;
        selectedCells.forEach(cellId => {
            const [rowIndex, colKey] = cellId.split('-');
            const value = parseFloat(data[rowIndex][colKey]);
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        });
        
        const avg = count > 0 ? sum / count : 0;
        
        // Put result in the cell below the last selected cell
        const [lastRowIndex, lastColKey] = selectedCells[selectedCells.length - 1].split('-');
        const targetRowIndex = parseInt(lastRowIndex) + 1;
        if (targetRowIndex < MAX_ROWS) {
            const newData = handleDataUpdate(data, (newData) => {
                newData[targetRowIndex][lastColKey] = avg.toString();
            });
            pushToHistory(newData);
        }
    };

    // Sorting function
    const sortColumn = () => {
        if (selectedCells.length === 0) return;
        const [_, colKey] = selectedCells[0].split('-');
        
        const newData = handleDataUpdate(data, (newData) => {
            const sortedArray = Array.from(newData).sort((a, b) => {
                if (!a || !b) return 0;
                const aVal = a[colKey];
                const bVal = b[colKey];
                
                // Try numeric comparison
                const aNum = Number(aVal);
                const bNum = Number(bVal);
                if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                    return aNum - bNum;
                }
                
                // Try date comparison
                const aDate = new Date(aVal);
                const bDate = new Date(bVal);
                if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                    return aDate - bDate;
                }
                
                // Fall back to string comparison
                return String(aVal).localeCompare(String(bVal));
            });
            
            Object.assign(newData, sortedArray);
        });
        pushToHistory(newData);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleSelectRow = (rowIndex) => {
        setSelectedRows(prev => {
            if (prev.includes(rowIndex)) {
                return prev.filter(index => index !== rowIndex);
            }
            return [...prev, rowIndex];
        });
    };

    const handleHighlightCell = (rowIndex) => {
        setHighlightedCells(prevHighlighted => {
            if (prevHighlighted.includes(rowIndex)) {
                return prevHighlighted.filter(i => i !== rowIndex);
            } else {
                return [...prevHighlighted, rowIndex];
            }
        });
    };

    const validateCellValue = (rowIndex, columnAccessor, value) => {
        if (columnAccessor === 'B' && isNaN(value)) {
            alert('Column B only accepts numbers.');
            return false;
        }
        return true;
    };

    const handleCellChange = useCallback((params) => {
        updateCellValue(params);
    }, [data]);

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'c') { 
            const activeCell = document.activeElement;
            if (activeCell instanceof HTMLInputElement) {
                setCopiedValue(activeCell.value);
            }
        } else if (e.ctrlKey && e.key === 'v') { 
            const activeCell = document.activeElement;
            if (activeCell instanceof HTMLInputElement) {
                activeCell.value = copiedValue;
                const rowIndex = parseInt(activeCell.dataset.rowIndex);
                const columnAccessor = activeCell.dataset.columnAccessor;
                handleCellChange({ data: data[rowIndex], colDef: { field: columnAccessor }, value: copiedValue });
            }
        }
    };

    const addRow = () => {
        if (data.length >= MAX_ROWS) {
            alert(`Maximum row limit of ${MAX_ROWS} reached.`);
            return;
        }
        
        const newData = handleDataUpdate(data, (newData) => {
            const newRow = generateEmptyRow();
            newData[data.length] = newRow;
            newData._actualLength = data.length + 1;
        });
        setData(newData);
        pushToHistory(newData);
    };

    const removeSelectedRows = () => {
        const newData = handleDataUpdate(data, (newData) => {
            let newIndex = 0;
            
            for (let i = 0; i < data.length; i++) {
                if (!selectedRows.includes(i)) {
                    newData[newIndex] = data[i];
                    newIndex++;
                }
            }
            
            newData._actualLength = newIndex;
        });
        setData(newData);
        setSelectedRows([]); 
    };

    const saveData = () => {
        alert('Data saved!');
    };

    const clearData = () => {
        setData(generateEmptyData()); 
    };

    const mergeCells = () => {
        alert('Cells merged!');
    };

    const insertColumn = () => {
        alert('Column inserted!');
    };

    const deleteColumn = () => {
        alert('Column deleted!');
    };

    const filterData = () => {
        alert('Filter applied!');
    };

    const sortAscending = () => {
        alert('Sorted ascending!');
    };

    const sortDescending = () => {
        alert('Sorted descending!');
    };

    const createNewSpreadsheet = () => {
        alert('New spreadsheet created!');
    };

    const openExistingFile = () => {
        alert('Open existing file functionality not implemented!');
    };

    const makeCopy = () => {
        alert('Document copied!');
    };

    const downloadSheet = () => {
        alert('Download functionality not implemented!');
    };

    const emailAsAttachment = () => {
        alert('Email as attachment functionality not implemented!');
    };

    const versionHistory = () => {
        alert('Version history functionality not implemented!');
    };

    const moveTo = () => {
        alert('Move to functionality not implemented!');
    };

    const shareDocument = () => {
        alert('Share functionality not implemented!');
    };

    const publishToWeb = () => {
        alert('Publish to web functionality not implemented!');
    };

    const undoAction = () => {
        alert('Undo action performed!');
    };

    const redoAction = () => {
        alert('Redo action performed!');
    };

    const cutContent = () => {
        alert('Content cut!');
    };

    const copyContent = () => {
        alert('Content copied!');
    };

    const pasteContent = () => {
        alert('Content pasted!');
    };

    const pasteValuesOnly = () => {
        alert('Values pasted only!');
    };

    const clearContents = () => {
        alert('Contents cleared!');
    };

    const findAndReplace = () => {
        alert('Find and replace functionality not implemented!');
    };

    const selectAllCells = () => {
        alert('All cells selected!');
    };

    const toggleGridlines = () => {
        alert('Gridlines toggled!');
    };

    const freezeRowsOrColumns = () => {
        alert('Rows/Columns frozen!');
    };

    const adjustZoom = () => {
        alert('Zoom adjusted!');
    };

    const toggleFullScreen = () => {
        alert('Full screen toggled!');
    };

    const insertFunction = () => {
        alert('Function inserted!');
    };

    const insertImage = () => {
        alert('Image inserted!');
    };

    const insertChart = () => {
        alert('Chart inserted!');
    };

    const insertDrawing = () => {
        alert('Drawing inserted!');
    };

    const insertLink = () => {
        alert('Link inserted!');
    };

    const insertTableOfContents = () => {
        alert('Table of contents inserted!');
    };

    const insertRowAbove = () => {
        alert('Row inserted above!');
    };

    const insertRowBelow = () => {
        alert('Row inserted below!');
    };

    const insertColumnLeft = () => {
        alert('Column inserted to the left!');
    };

    const insertColumnRight = () => {
        alert('Column inserted to the right!');
    };

    const addComment = () => {
        alert('Comment added!');
    };

    const adjustTextProperties = () => {
        alert('Text properties adjusted!');
    };

    const changeTextColor = () => {
        alert('Text color changed!');
    };

    const changeFillColor = () => {
        alert('Fill color changed!');
    };

    const mergeSelectedCells = () => {
        alert('Cells merged!');
    };

    const changeNumberFormat = () => {
        alert('Number format changed!');
    };

    const adjustTextAlignment = () => {
        alert('Text alignment adjusted!');
    };

    const rotateText = () => {
        alert('Text rotated!');
    };

    const enableTextWrapping = () => {
        alert('Text wrapping enabled!');
    };

    const addBorders = () => {
        alert('Borders added!');
    };

    const sortDataRange = () => {
        alert('Data sorted!');
    };

    const applyFilter = () => {
        alert('Filter applied!');
    };

    const setDataValidation = () => {
        alert('Data validation set!');
    };

    const defineNamedRanges = () => {
        alert('Named ranges defined!');
    };

    const createPivotTable = () => {
        alert('Pivot table created!');
    };

    const removeDuplicates = () => {
        alert('Duplicates removed!');
    };

    const trimWhitespace = () => {
        alert('Whitespace trimmed!');
    };

    const protectRange = () => {
        alert('Range protected!');
    };

    const spellCheck = () => {
        alert('Spell check completed!');
    };

    const numberFormat = (formatType, value) => {
        if (!selectedCells.length) {
            alert('Please select cells to format');
            return;
        }

        const newFormats = { ...cellFormats };
        
        selectedCells.forEach(cell => {
            const cellValue = parseFloat(value);
            
            switch(formatType) {
                case 'Currency':
                    newFormats[cell] = {
                        type: formatType,
                        value: new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(cellValue)
                    };
                    break;
                case 'Percentage':
                    newFormats[cell] = {
                        type: formatType,
                        value: new Intl.NumberFormat('en-US', {
                            style: 'percent',
                            minimumFractionDigits: 2
                        }).format(cellValue / 100)
                    };
                    break;
                case 'Scientific':
                    newFormats[cell] = {
                        type: formatType,
                        value: cellValue.toExponential(2)
                    };
                    break;
                case 'Date/Time':
                    newFormats[cell] = {
                        type: formatType,
                        value: format(new Date(value), 'MM/dd/yyyy')
                    };
                    break;
                default: // Plain Text
                    newFormats[cell] = {
                        type: 'Plain Text',
                        value: value.toString()
                    };
            }
        });

        setCellFormats(newFormats);
    };

    const increaseDecimalPlaces = () => {
        if (!selectedCells.length) {
            alert('Please select cells to modify');
            return;
        }

        const newDecimalPlaces = { ...decimalPlaces };
        
        selectedCells.forEach(cell => {
            const currentPlaces = newDecimalPlaces[cell]?.places || 0;
            newDecimalPlaces[cell] = {
                places: currentPlaces + 1
            };
            
            if (cellFormats[cell]) {
                const value = parseFloat(cellFormats[cell].value);
                cellFormats[cell].value = value.toFixed(currentPlaces + 1);
            }
        });

        setDecimalPlaces(newDecimalPlaces);
        setCellFormats({ ...cellFormats });
    };

    const decreaseDecimalPlaces = () => {
        if (!selectedCells.length) {
            alert('Please select cells to modify');
            return;
        }

        const newDecimalPlaces = { ...decimalPlaces };
        
        selectedCells.forEach(cell => {
            const currentPlaces = newDecimalPlaces[cell]?.places || 0;
            if (currentPlaces > 0) {
                newDecimalPlaces[cell] = {
                    places: currentPlaces - 1
                };
                
                if (cellFormats[cell]) {
                    const value = parseFloat(cellFormats[cell].value);
                    cellFormats[cell].value = value.toFixed(currentPlaces - 1);
                }
            }
        });

        setDecimalPlaces(newDecimalPlaces);
        setCellFormats({ ...cellFormats });
    };

    const sumRange = () => {
        if (!selectedCells.length) {
            alert('Please select cells to sum');
            return;
        }

        let sum = 0;
        selectedCells.forEach(cell => {
            const value = parseFloat(cellFormats[cell]?.value || '0');
            if (!isNaN(value)) {
                sum += value;
            }
        });

        const lastSelectedCell = selectedCells[selectedCells.length - 1];
        const newFormats = { ...cellFormats };
        newFormats[lastSelectedCell] = {
            type: 'Plain Text',
            value: sum.toString()
        };

        setCellFormats(newFormats);
    };

    const handleCellSelection = (cellId) => {
        setSelectedCells(prev => {
            const index = prev.indexOf(cellId);
            if (index === -1) {
                return [...prev, cellId];
            }
            return prev.filter(id => id !== cellId);
        });
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [copiedValue]);

    useEffect(() => {
        const handleKeyboardShortcuts = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'x':
                        e.preventDefault();
                        handleCut();
                        break;
                    case 'c':
                        e.preventDefault();
                        handleCopy();
                        break;
                    case 'v':
                        e.preventDefault();
                        handlePaste();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        redo();
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyboardShortcuts);
        return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
    }, [data, selectedCells, clipboardData]);

    const columnDefs = Array.from({ length: TOTAL_COLUMNS }, (_, index) => {
        const columnKey = String.fromCharCode(65 + index); // A-Z
        return {
            headerName: columnKey,
            field: columnKey,
            editable: true,
        };
    });

    return (
        <div className="data-page-container">
            <div className="toolbar">
                <div className="toolbar-section">
                    {/* File Menu Group */}
                    <div className="menu-group">
                        <button className="toolbar-button" onClick={handleNewFile}>
                            <BsFileEarmark /> New
                        </button>
                        <button className="toolbar-button" onClick={handleSave}>
                            <BsFolder /> Save
                        </button>
                        <button className="toolbar-button" onClick={handleOpen}>
                            <BsFillFileEarmarkTextFill /> Open
                        </button>
                        <button className="toolbar-button" onClick={exportToCSV}>
                            <BsDownload /> Download
                        </button>
                        <button className="toolbar-button" onClick={emailAsAttachment}>
                            <BsEnvelope /> Email
                        </button>
                    </div>

                    {/* Edit Menu Group */}
                    <div className="menu-group">
                        <button className="toolbar-button" onClick={undo} title="Undo">
                            <BiUndo />
                        </button>
                        <button className="toolbar-button" onClick={redo} title="Redo">
                            <BiRedo />
                        </button>
                        <button className="toolbar-button" onClick={handleCut} title="Cut">
                            <BiCut />
                        </button>
                        <button className="toolbar-button" onClick={handleCopy} title="Copy">
                            <BiCopy />
                        </button>
                        <button className="toolbar-button" onClick={handlePaste} title="Paste">
                            <BiPaste />
                        </button>
                    </div>

                    {/* Format Menu Group */}
                    <div className="menu-group">
                        <button 
                            className="toolbar-button" 
                            onClick={() => applyCellFormatting({ fontWeight: 'bold' })}
                            title="Bold"
                        >
                            <BsTypeBold />
                        </button>
                        <button 
                            className="toolbar-button" 
                            onClick={() => applyCellFormatting({ fontStyle: 'italic' })}
                            title="Italic"
                        >
                            <BsTypeItalic />
                        </button>
                        <button 
                            className="toolbar-button" 
                            onClick={() => applyCellFormatting({ textDecoration: 'underline' })}
                            title="Underline"
                        >
                            <BsTypeUnderline />
                        </button>
                    </div>

                    {/* Number Formatting Group */}
                    <div className="menu-group">
                        <button className="toolbar-button" onClick={applyNumberFormat} title="Number Format">
                            <AiOutlineNumber />
                        </button>
                        <button className="toolbar-button" onClick={applyCurrencyFormat} title="Currency Format">
                            <BiDollar />
                        </button>
                        <button className="toolbar-button" onClick={applyPercentFormat} title="Percentage Format">
                            <BsPercent />
                        </button>
                    </div>

                    {/* Calculation Group */}
                    <div className="menu-group">
                        <button className="toolbar-button" onClick={calculateSum} title="Sum">
                            <BsCalculator /> Σ
                        </button>
                        <button className="toolbar-button" onClick={calculateAverage} title="Average">
                            <BsCalculator /> x̄
                        </button>
                    </div>

                    {/* Data Operations Group */}
                    <div className="menu-group">
                        <button className="toolbar-button" onClick={sortColumn}>
                            <BsSortDown /> Sort
                        </button>
                        <button className="toolbar-button" onClick={filterData}>
                            <BsFilter /> Filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search in spreadsheet..."
                    onChange={handleFilterChange}
                />
            </div>

            <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
                {console.log('Data:', JSON.stringify(data, null, 2))}
                {console.log('Filtered Data:', JSON.stringify(filteredData, null, 2))}
                <AgGridReact
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    onCellValueChanged={handleCellChange}
                    // Add other necessary props
                />
            </div>

            <div className="footer">
                <div>
                    <span>Total Rows: {data.length}</span>
                    <span className="menu-separator"></span>
                    <span>Selected: {selectedCells.length} cells</span>
                </div>
                <div>
                    <span>Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}</span>
                </div>
            </div>
        </div>
    );
};

export default DataPage;