import React from 'react';
import './StatusBar.css';

const StatusBar = ({ pageCount, wordCount }) => {
    return (
        <div className="status-bar">
            <span>Page: {pageCount}</span>
            <span onClick={() => alert(`Word Count: ${wordCount}`)}>Word Count: {wordCount}</span>
        </div>
    );
};

export default StatusBar;
