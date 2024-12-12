import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';
import 'react-pivottable/pivottable.css';

const PivotTableModal = ({ open, onClose, data }) => {
  const [rowAttr, setRowAttr] = useState('');
  const [colAttr, setColAttr] = useState('');
  const [valAttr, setValAttr] = useState('');

  const handleRowAttrChange = (event) => {
    setRowAttr(event.target.value);
  };

  const handleColAttrChange = (event) => {
    setColAttr(event.target.value);
  };

  const handleValAttrChange = (event) => {
    setValAttr(event.target.value);
  };

  const attributes = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6">Configure Pivot Table</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Row Attribute</InputLabel>
          <Select value={rowAttr} onChange={handleRowAttrChange}>
            {attributes.map(attr => <MenuItem key={attr} value={attr}>{attr}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Column Attribute</InputLabel>
          <Select value={colAttr} onChange={handleColAttrChange}>
            {attributes.map(attr => <MenuItem key={attr} value={attr}>{attr}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Value Attribute</InputLabel>
          <Select value={valAttr} onChange={handleValAttrChange}>
            {attributes.map(attr => <MenuItem key={attr} value={attr}>{attr}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ mt: 4 }}>
          <PivotTableUI
            data={data}
            rows={[rowAttr]}
            cols={[colAttr]}
            vals={[valAttr]}
            aggregatorName="Sum"
            rendererName="Table"
            renderers={TableRenderers}
          />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PivotTableModal;
