import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  Chip,
  Autocomplete,
  Paper,
} from '@mui/material';
import {
  Functions,
  Add,
  Remove,
  Timeline,
  Calculate,
  Today,
  TextFields,
} from '@mui/icons-material';

const formulaCategories = [
  {
    name: 'Math',
    icon: <Calculate />,
    formulas: [
      { name: 'SUM', syntax: 'SUM(range)', description: 'Add up the numbers in a range' },
      { name: 'AVERAGE', syntax: 'AVERAGE(range)', description: 'Calculate the average of numbers in a range' },
      { name: 'MAX', syntax: 'MAX(range)', description: 'Find the largest number in a range' },
      { name: 'MIN', syntax: 'MIN(range)', description: 'Find the smallest number in a range' },
      { name: 'COUNT', syntax: 'COUNT(range)', description: 'Count the number of cells in a range that contain numbers' },
    ],
  },
  {
    name: 'Text',
    icon: <TextFields />,
    formulas: [
      { name: 'CONCATENATE', syntax: 'CONCATENATE(text1, text2, ...)', description: 'Join text strings together' },
      { name: 'LEFT', syntax: 'LEFT(text, num_chars)', description: 'Get characters from the start of a text string' },
      { name: 'RIGHT', syntax: 'RIGHT(text, num_chars)', description: 'Get characters from the end of a text string' },
      { name: 'TRIM', syntax: 'TRIM(text)', description: 'Remove extra spaces from text' },
    ],
  },
  {
    name: 'Date',
    icon: <Today />,
    formulas: [
      { name: 'TODAY', syntax: 'TODAY()', description: 'Get the current date' },
      { name: 'NOW', syntax: 'NOW()', description: 'Get the current date and time' },
      { name: 'DATEDIF', syntax: 'DATEDIF(start_date, end_date, unit)', description: 'Calculate the difference between two dates' },
    ],
  },
  {
    name: 'Statistical',
    icon: <Timeline />,
    formulas: [
      { name: 'STDEV', syntax: 'STDEV(range)', description: 'Calculate standard deviation' },
      { name: 'MEDIAN', syntax: 'MEDIAN(range)', description: 'Find the middle value in a range' },
      { name: 'MODE', syntax: 'MODE(range)', description: 'Find the most common value in a range' },
    ],
  },
];

export const FormulaDialog = ({ open, onClose, onAdd, selectedCells }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [formulaInput, setFormulaInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedFormula) {
      setFormulaInput(selectedFormula.syntax);
    }
  }, [selectedFormula]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedFormula(null);
    setFormulaInput('');
  };

  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
  };

  const validateFormula = (formula) => {
    try {
      // Basic validation - can be extended based on requirements
      if (!formula.startsWith('=')) return false;
      if (!formula.includes('(') || !formula.includes(')')) return false;
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAdd = () => {
    if (!formulaInput) {
      setError('Please enter a formula');
      return;
    }

    const formula = formulaInput.startsWith('=') ? formulaInput : `=${formulaInput}`;
    if (!validateFormula(formula)) {
      setError('Invalid formula syntax');
      return;
    }

    onAdd(formula, selectedCells);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Insert Formula</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, height: '400px' }}>
          {/* Categories */}
          <Paper sx={{ width: '200px', overflow: 'auto' }}>
            <List>
              {formulaCategories.map((category) => (
                <ListItem
                  key={category.name}
                  button
                  selected={selectedCategory?.name === category.name}
                  onClick={() => handleCategorySelect(category)}
                >
                  <ListItemIcon>{category.icon}</ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Formulas */}
          <Paper sx={{ flex: 1, overflow: 'auto' }}>
            {selectedCategory ? (
              <List>
                {selectedCategory.formulas.map((formula) => (
                  <React.Fragment key={formula.name}>
                    <ListItem
                      button
                      selected={selectedFormula?.name === formula.name}
                      onClick={() => handleFormulaSelect(formula)}
                    >
                      <ListItemIcon>
                        <Functions />
                      </ListItemIcon>
                      <ListItemText
                        primary={formula.name}
                        secondary={formula.description}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Select a category to see available formulas
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Formula Input */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Formula"
            value={formulaInput}
            onChange={(e) => {
              setFormulaInput(e.target.value);
              setError(null);
            }}
            error={!!error}
            helperText={error}
            placeholder="Enter your formula"
          />
          {selectedFormula && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Syntax: {selectedFormula.syntax}
            </Typography>
          )}
        </Box>

        {/* Selected Cells */}
        {selectedCells?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Cells:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedCells.map((cell, index) => (
                <Chip
                  key={index}
                  label={`${String.fromCharCode(65 + cell.columnIndex)}${cell.rowIndex + 1}`}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!formulaInput}
        >
          Add Formula
        </Button>
      </DialogActions>
    </Dialog>
  );
};
