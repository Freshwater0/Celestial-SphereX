import React, { useState, useRef } from 'react';
import './Toolbar.css';

const Toolbar = ({ reports, onAddReport, onDeleteReport, onEditReport, onViewReport }) => {
    const [activeTab, setActiveTab] = useState('Home');
    const [fontSize, setFontSize] = useState('16px');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [trackChanges, setTrackChanges] = useState(false);
    const textRef = useRef(null);

    const handleTrackChanges = () => {
        setTrackChanges(!trackChanges);
    };

    const handleInsertImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                img.style.borderRadius = '10px';
                img.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
                img.style.margin = '10px 0';
                textRef.current.appendChild(img);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const handleInsertTable = () => {
        const rows = prompt('Enter number of rows:');
        const cols = prompt('Enter number of columns:');
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        for (let i = 0; i < rows; i++) {
            const row = table.insertRow(i);
            for (let j = 0; j < cols; j++) {
                const cell = row.insertCell(j);
                cell.innerHTML = '';
                cell.style.border = '1px solid #ccc';
                cell.style.padding = '10px';
            }
        }
        textRef.current.appendChild(table);
    };

    const handleToggleDarkMode = () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
    };

    const renderToolbarAndTOC = () => {
        return (
            <div className="toolbar-and-toc">
                <div className="toolbar">
                    <div className="dropdown">
                        <button>Font</button>
                        <div className="dropdown-content">
                            <button onClick={() => setFontFamily('Arial')}>Arial</button>
                            <button onClick={() => setFontFamily('Times New Roman')}>Times New Roman</button>
                            <button onClick={() => setFontFamily('Courier New')}>Courier New</button>
                        </div>
                    </div>
                    <div className="dropdown">
                        <button>Size</button>
                        <div className="dropdown-content">
                            <button onClick={() => setFontSize('12px')}>12</button>
                            <button onClick={() => setFontSize('14px')}>14</button>
                            <button onClick={() => setFontSize('16px')}>16</button>
                        </div>
                    </div>
                    <button onClick={handleInsertImage} className="button">Insert Image</button>
                    <button onClick={handleInsertTable} className="button">Insert Table</button>
                    <button onClick={handleToggleDarkMode} className="button">Toggle Dark Mode</button>
                </div>
                <div className="table-of-contents">
                    <h2>Table of Contents</h2>
                    <ul>
                        <li><a href="#section1">Section 1</a></li>
                        <li><a href="#section2">Section 2</a></li>
                        <li><a href="#section3">Section 3</a></li>
                    </ul>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Home':
                return (
                    <div className="home-tab">
                        {renderToolbarAndTOC()}
                    </div>
                );
            case 'Insert':
                return (
                    <div className="insert-tab">
                        <button onClick={handleInsertImage} className="button">Insert Image</button>
                        <button onClick={handleInsertTable} className="button">Insert Table</button>
                    </div>
                );
            case 'Review':
                return (
                    <div className="review-tab">
                        <button onClick={handleTrackChanges}>{trackChanges ? 'Stop Tracking Changes' : 'Track Changes'}</button>
                        {trackChanges && (
                            <div>
                                <button>Accept All Changes</button>
                                <button>Reject All Changes</button>
                            </div>
                        )}
                    </div>
                );
            // Add other tabs here
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="tabs">
                <button onClick={() => setActiveTab('Home')}>Home</button>
                <button onClick={() => setActiveTab('Insert')}>Insert</button>
                <button onClick={() => setActiveTab('Design')}>Design</button>
                <button onClick={() => setActiveTab('Layout')}>Layout</button>
                <button onClick={() => setActiveTab('References')}>References</button>
                <button onClick={() => setActiveTab('Review')}>Review</button>
                <button onClick={() => setActiveTab('View')}>View</button>
            </div>
            {renderTabContent()}
            <div ref={textRef} />
        </div>
    );
};

export default Toolbar;
