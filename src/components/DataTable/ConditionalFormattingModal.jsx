import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const ConditionalFormattingModal = ({ open, onClose, onSave }) => {
  const [condition, setCondition] = useState('');
  const [style, setStyle] = useState('');

  const handleSave = () => {
    onSave({ condition, style });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6">Conditional Formatting Rule</Typography>
        <TextField
          label="Condition"
          fullWidth
          margin="normal"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        <TextField
          label="Style"
          fullWidth
          margin="normal"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConditionalFormattingModal;
