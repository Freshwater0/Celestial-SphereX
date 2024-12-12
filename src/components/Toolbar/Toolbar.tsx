import React from 'react';
import ToolbarButton from './ToolbarButton.tsx';
import ToolbarDropdown from './ToolbarDropdown.tsx';

const Toolbar = () => {
    return (
        <div className="toolbar">
            <ToolbarButton label="New" />
            <ToolbarButton label="Open" />
            <ToolbarButton label="Save" />
            <ToolbarDropdown options={['Option 1', 'Option 2']} />
            {/* Add more buttons and dropdowns as needed */}
        </div>
    );
};

export default Toolbar;
