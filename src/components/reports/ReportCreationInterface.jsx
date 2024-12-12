import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const topics = {
  News: ['Global News', 'Local News'],
  Finance: ['Market Trends', 'Cryptocurrency'],
  Cryptocurrency: ['Bitcoin', 'Ethereum']
};

const ReportCreationInterface = ({ onGenerateReport }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [timePeriod, setTimePeriod] = useState('Last 24 Hours');
  const [customDateRange, setCustomDateRange] = useState([null, null]);

  const handleGenerateReport = () => {
    const reportCriteria = {
      topic: selectedTopic,
      subtopic: selectedSubtopic,
      keywords: keywords.split(',').map(keyword => keyword.trim()),
      timePeriod,
      customDateRange
    };
    onGenerateReport(reportCriteria);
  };

  return (
    <Box sx={{ p: 3 }}>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="topic-select-label">Select Topic</InputLabel>
        <Select
          labelId="topic-select-label"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
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
          <InputLabel id="subtopic-select-label">Select Subtopic</InputLabel>
          <Select
            labelId="subtopic-select-label"
            value={selectedSubtopic}
            onChange={(e) => setSelectedSubtopic(e.target.value)}
            label="Select Subtopic"
          >
            {topics[selectedTopic].map((subtopic) => (
              <MenuItem key={subtopic} value={subtopic}>
                {subtopic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        fullWidth
        variant="outlined"
        margin="normal"
        label="Enter Keywords"
        placeholder="Comma-separated keywords"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="time-period-select-label">Select Time Period</InputLabel>
        <Select
          labelId="time-period-select-label"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          label="Select Time Period"
        >
          <MenuItem value="Last 24 Hours">Last 24 Hours</MenuItem>
          <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
          <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
          <MenuItem value="Custom Range">Custom Range</MenuItem>
        </Select>
      </FormControl>

      {timePeriod === 'Custom Range' && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={customDateRange[0]}
              onChange={(date) => setCustomDateRange([date, customDateRange[1]])}
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" margin="normal" />}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={customDateRange[1]}
              onChange={(date) => setCustomDateRange([customDateRange[0], date])}
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" margin="normal" />}
            />
          </Grid>
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateReport}
        sx={{ mt: 2 }}
      >
        Generate Report
      </Button>
    </Box>
  );
};

export default ReportCreationInterface;
