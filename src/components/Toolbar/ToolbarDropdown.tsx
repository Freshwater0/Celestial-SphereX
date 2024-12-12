import React from 'react';

const ToolbarDropdown = ({ options }) => {
    return (
        <select className="toolbar-dropdown">
            {options.map((option, index) => (
                <option key={index}>{option}</option>
            ))}
        </select>
    );
};

export default ToolbarDropdown;
