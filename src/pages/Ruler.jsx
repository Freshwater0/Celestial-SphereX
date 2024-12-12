import React from 'react';
import './Ruler.css';

const Ruler = () => {
    return (
        <div className="ruler" style={{ width: '100%' }}>
            <div className="horizontal-ruler" style={{ height: '2px', backgroundColor: 'black' }}></div>
            <div className="vertical-ruler" style={{ width: '2px', backgroundColor: 'black' }}></div>
        </div>
    );
};

export default Ruler;
