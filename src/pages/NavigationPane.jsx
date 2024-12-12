import React, { useState } from 'react';

const NavigationPane = ({ headings, onHeadingClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="navigation-pane">
            <h3>Table of Contents</h3>
            <input type="text" placeholder="Search headings..." onChange={(e) => setSearchTerm(e.target.value)} />
            <ul>
                {headings.filter(heading => heading.text.toLowerCase().includes(searchTerm.toLowerCase())).map((heading, index) => (
                    <li key={index} onClick={() => onHeadingClick(heading.id)}>
                        {heading.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NavigationPane;
