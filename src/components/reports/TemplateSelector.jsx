import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const TemplateSelector = ({ onTemplateSelect, selectedTopic }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`/api/templates?category=${selectedTopic}`);
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    if (selectedTopic) {
      fetchTemplates();
    }
  }, [selectedTopic]);

  const handleTemplateChange = (event) => {
    const template = templates.find(t => t.id === event.target.value);
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel id="template-select-label">Select Template</InputLabel>
      <Select
        labelId="template-select-label"
        value={selectedTemplate.id || ''}
        onChange={handleTemplateChange}
        label="Select Template"
      >
        {templates.map((template) => (
          <MenuItem key={template.id} value={template.id}>
            {template.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TemplateSelector;
