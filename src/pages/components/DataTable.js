import React, { useState } from 'react';
import { useTable, useSortBy } from 'react-table';

const DataTable = ({ 
    columns, 
    data, 
    onCellChange, 
    onSelectRow, 
    selectedRows = [], 
    highlightedCells, 
    onHighlightCell,
    cellStyles,
    onCellSelection,
    getCellDisplayValue,
    selectedCells = [] 
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    const [isDragging, setIsDragging] = useState(false);
    const [startRow, setStartRow] = useState(null);
    const [frozenRows] = useState(1); 
    const [frozenColumns] = useState(1); 

    const handleMouseDownRow = (rowIndex) => {
        setIsDragging(true);
        setStartRow(rowIndex);
        onSelectRow(rowIndex);
    };

    const handleMouseEnter = (rowIndex) => {
        if (isDragging) {
            onSelectRow(rowIndex);
        }
    };

    const handleMouseUpRow = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleCellClick = (rowIndex, columnName) => {
        const cellId = `${rowIndex}-${columnName}`;
        if (onCellSelection) {
            onCellSelection(cellId);
        }
        if (onHighlightCell) {
            onHighlightCell(rowIndex, columnName);
        }
    };

    const renderCell = (rowIndex, columnName, value) => {
        const cellId = `${rowIndex}-${columnName}`;
        const displayValue = getCellDisplayValue ? getCellDisplayValue(cellId, value) : value;
        const isSelected = selectedCells.includes(cellId);
        
        return (
            <td 
                key={`${rowIndex}-${columnName}`}
                onClick={() => handleCellClick(rowIndex, columnName)}
                style={{
                    ...cellStyles?.[cellId],
                    border: isSelected ? '2px solid blue' : '1px solid #ddd',
                    backgroundColor: highlightedCells?.includes(cellId) ? '#e6f3ff' : 'white',
                    padding: '0',
                    width: '99px',
                    height: '22px',
                    textAlign: 'center',
                }}
            >
                <input
                    type="text"
                    value={displayValue || ''}
                    onChange={(e) => onCellChange(rowIndex, columnName, e.target.value)}
                    data-row={rowIndex}
                    data-column={columnName}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        border: 'none', 
                        outline: 'none',
                        textAlign: 'center'
                    }}
                />
            </td>
        );
    };

    return (
        <table {...getTableProps()} style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, index) => (
                            <th
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                style={{
                                    border: '1px solid black',
                                    background: '#f2f2f2',
                                    padding: '8px',
                                    position: index < frozenColumns ? 'sticky' : 'static',
                                    left: index * 100,
                                    zIndex: 2
                                }}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, rowIndex) => {
                    prepareRow(row);
                    return (
                        <tr 
                            {...row.getRowProps()} 
                            style={{ 
                                background: selectedRows.includes(rowIndex) ? 'lightyellow' : 'white',
                                position: rowIndex < frozenRows ? 'sticky' : 'static',
                                top: rowIndex * 30
                            }}
                        >
                            {row.cells.map((cell) => {
                                const columnName = cell.column.id;
                                const value = cell.value;
                                return renderCell(rowIndex, columnName, value);
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DataTable;
