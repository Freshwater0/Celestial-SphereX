import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';

const topics = {
  Crypto: ['Current Price', 'Market Cap', 'Volume', 'Supply'],
  Trading: ['Buy Volume', 'Sell Volume', 'Open Interest'],
  News: ['Headline', 'Source', 'Published Date'],
  Weather: ['Temperature', 'Humidity', 'Wind Speed']
};

const TopicSelector = ({ onSelectionChange }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDataPoints, setSelectedDataPoints] = useState([]);

  useEffect(() => {
    onSelectionChange(selectedTopic, selectedDataPoints);
  }, [selectedTopic, selectedDataPoints, onSelectionChange]);

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
    setSelectedDataPoints([]); // Reset data points when topic changes
  };

  const handleDataPointToggle = (dataPoint) => {
    setSelectedDataPoints((prev) =>
      prev.includes(dataPoint)
        ? prev.filter((dp) => dp !== dataPoint)
        : [...prev, dataPoint]
    );
  };

  return (
    <div>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="topic-select-label">Select Topic</InputLabel>
        <Select
          labelId="topic-select-label"
          value={selectedTopic}
          onChange={handleTopicChange}
          label="Select Topic"
        >
          {Object.keys(topics).map((topic) => (
            <MenuItem key={topic} value={topic}>
              {topic}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTopic && (
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="data-point-select-label">Select Data Points</InputLabel>
          <Select
            labelId="data-point-select-label"
            multiple
            value={selectedDataPoints}
            renderValue={(selected) => selected.join(', ')}
          >
            {topics[selectedTopic].map((dataPoint) => (
              <MenuItem key={dataPoint} value={dataPoint}>
                <Checkbox
                  checked={selectedDataPoints.includes(dataPoint)}
                  onChange={() => handleDataPointToggle(dataPoint)}
                />
                <ListItemText primary={dataPoint} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default TopicSelector;
