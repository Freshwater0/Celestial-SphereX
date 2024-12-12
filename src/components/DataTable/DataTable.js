import React from 'react';
import { useTable, useSortBy } from 'react-table';
import './DataTable.css';

const DataTable = ({ 
    columns, 
    data, 
    onCellChange, 
    onSelectRow, 
    selectedRows = [], 
    highlightedCells = [],
    onHighlightCell,
    cellStyles = {},
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
    } = useTable(
        {
            columns,
            data,
        },
        useSortBy
    );

    const handleCellClick = (rowIndex, columnId, e) => {
        const cellId = `${rowIndex}-${columnId}`;
        
        if (e.shiftKey) {
            onHighlightCell(cellId);
        } else {
            onCellSelection(cellId);
        }
    };

    const handleRowClick = (rowIndex, e) => {
        e.preventDefault();
        onSelectRow(rowIndex);
    };

    const getCellStyle = (rowIndex, columnId) => {
        const cellId = `${rowIndex}-${columnId}`;
        const isSelected = selectedCells.includes(cellId);
        const isHighlighted = highlightedCells.includes(cellId);
        const customStyle = cellStyles[cellId] || {};

        return {
            ...customStyle,
            backgroundColor: isHighlighted ? 'var(--primary-light)' : 
                           isSelected ? 'var(--primary-light)' : 'transparent',
            border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)'
        };
    };

    return (
        <div className="data-table-wrapper">
            <table {...getTableProps()} className="data-table">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    className={column.isSorted ? (column.isSortedDesc ? 'sort-desc' : 'sort-asc') : ''}
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
                                onClick={(e) => handleRowClick(rowIndex, e)}
                                className={selectedRows.includes(rowIndex) ? 'selected-row' : ''}
                            >
                                {row.cells.map(cell => {
                                    const displayValue = getCellDisplayValue
                                        ? getCellDisplayValue(rowIndex, cell.column.id, cell.value)
                                        : cell.value;

                                    return (
                                        <td
                                            {...cell.getCellProps()}
                                            onClick={(e) => handleCellClick(rowIndex, cell.column.id, e)}
                                            style={getCellStyle(rowIndex, cell.column.id)}
                                        >
                                            <input
                                                type="text"
                                                value={displayValue || ''}
                                                onChange={(e) => onCellChange(rowIndex, cell.column.id, e.target.value)}
                                                data-row-index={rowIndex}
                                                data-column-accessor={cell.column.id}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
