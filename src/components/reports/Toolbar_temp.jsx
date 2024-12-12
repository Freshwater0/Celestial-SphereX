import React from 'react';
import './Toolbar_temp.css';

const Toolbar = ({ reports, onAddReport, onDeleteReport, onEditReport, onViewReport }) => {
    return (
        <div className="toolbar">
            <select onChange={(e) => onViewReport(e.target.value)}>
                <option value="">Select Report</option>
                {reports.map(report => (
                    <option key={report.id} value={report.id}>{report.name}</option>
                ))}
            </select>
            <button onClick={onAddReport}>Add Report</button>
            <button onClick={onEditReport}>Edit Report</button>
            <button onClick={onDeleteReport}>Delete Report</button>
            <button onClick={() => console.log('Exporting reports')}>Export</button>
            <button onClick={() => console.log('Refreshing reports')}>Refresh</button>
        </div>
    );
};

export default Toolbar;
