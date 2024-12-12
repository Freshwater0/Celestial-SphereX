import React, { useState, useEffect } from 'react';
import './Reports.css';
import Editor from '../components/Editor/Editor.tsx';
import Header from '../components/Header/Header.tsx';
import Toolbar from '../components/Toolbar/Toolbar.tsx';
import DocumentWorkspace from './DocumentWorkspace';
import StatusBar from './StatusBar';
import Ruler from './Ruler';
import { Button, TextField, MenuItem } from '@mui/material';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [pageCount, setPageCount] = useState(1);
    const [wordCount, setWordCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isConnected, setIsConnected] = useState(true); // New state variable to track connection status
    const [footerText, setFooterText] = useState('');
    const [isCollaborating, setIsCollaborating] = useState(false); // New state variable to track collaboration status

    useEffect(() => {
        // Adding sample reports
        const initialReports = [
            { id: 1, name: 'Monthly Report' },
            { id: 2, name: 'Annual Report' },
            { id: 3, name: 'Sales Report' }
        ];
        setReports(initialReports);
    }, []);

    useEffect(() => {
        console.log('Reports:', reports);
    }, [reports]);

    const onAddReport = () => {
        const newReport = { id: reports.length + 1, name: `Report ${reports.length + 1}` };
        setReports([...reports, newReport]);
    };

    const onDeleteReport = (id) => {
        setReports(reports.filter(report => report.id !== id));
    };

    const onEditReport = (id) => {
        const updatedReports = reports.map(report => {
            if (report.id === id) {
                return { ...report, name: prompt('Edit report name:', report.name) };
            }
            return report;
        });
        setReports(updatedReports);
    };

    const onViewReport = (id) => {
        const selectedReport = reports.find(report => report.id === id);
        if (selectedReport) {
            alert(`Viewing report: ${selectedReport.name}`);
        }
    };

    const handleSaveStatus = () => {
        if (isSaving) {
            return 'Saving...';
        } else {
            return 'Saved';
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Logic to save reports
        setTimeout(() => {
            setIsSaving(false);
        }, 2000);
    };

    const handleConnectionStatus = () => {
        if (isConnected) {
            return <span style={{ color: 'green' }}>Connected</span>;
        } else {
            return <span style={{ color: 'red' }}>Disconnected</span>;
        }
    };

    const handleCollaborationStatus = () => {
        if (isCollaborating) {
            return 'Collaborating';
        } else {
            return 'Not Collaborating';
        }
    };

    const handleAddFooterText = () => {
        const newFooterText = prompt('Enter footer text:');
        setFooterText(newFooterText);
    };

    return (
        <div>
            <Toolbar 
                reports={reports} 
                onAddReport={onAddReport} 
                onDeleteReport={onDeleteReport} 
                onEditReport={onEditReport} 
                onViewReport={onViewReport} 
                onSave={handleSave}
            />
            <Ruler />
            <DocumentWorkspace />
            <StatusBar pageCount={pageCount} wordCount={wordCount} />
            <footer>
                <span>{handleSaveStatus()}</span>
                <span> | </span>
                {handleConnectionStatus()}
                <span> | </span>
                <span>{handleCollaborationStatus()}</span>
                {footerText && <span> | {footerText}</span>}
                <button onClick={handleAddFooterText}>Add Footer Text</button>
            </footer>
        </div>
    );
};

export default Reports;
