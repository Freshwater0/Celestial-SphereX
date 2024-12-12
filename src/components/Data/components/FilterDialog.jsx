import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'regex', label: 'Matches pattern' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In list' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
    { value: 'inLast', label: 'In last' },
  ],
};

const FilterCondition = ({
  condition,
  index,
  columns,
  onUpdate,
  onRemove,
}) => {
  const handleChange = (field, value) => {
    onUpdate(index, { ...condition, [field]: value });
  };

  const column = columns.find(col => col.field === condition.field);
  const operators = OPERATORS[column?.type || 'text'];

  return (
    <ListItem>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Field</InputLabel>
          <Select
            value={condition.field || ''}
            onChange={(e) => handleChange('field', e.target.value)}
            label="Field"
          >
            {columns.map((col) => (
              <MenuItem key={col.field} value={col.field}>
                {col.headerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={condition.operator || ''}
            onChange={(e) => handleChange('operator', e.target.value)}
            label="Operator"
          >
            {operators.map((op) => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {condition.operator === 'between' ? (
          <>
            <TextField
              label="From"
              value={condition.value?.[0] || ''}
              onChange={(e) => handleChange('value', [e.target.value, condition.value?.[1]])}
              type={column?.type === 'number' ? 'number' : 'text'}
            />
            <TextField
              label="To"
              value={condition.value?.[1] || ''}
              onChange={(e) => handleChange('value', [condition.value?.[0], e.target.value])}
              type={column?.type === 'number' ? 'number' : 'text'}
            />
          </>
        ) : condition.operator === 'in' ? (
          <TextField
            label="Values (comma-separated)"
            value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
            onChange={(e) => handleChange('value', e.target.value.split(',').map(v => v.trim()))}
            fullWidth
          />
        ) : (
          <TextField
            label="Value"
            value={condition.value || ''}
            onChange={(e) => handleChange('value', e.target.value)}
            type={column?.type === 'number' ? 'number' : 'text'}
          />
        )}

        <IconButton onClick={() => onRemove(index)} color="error">
          <RemoveIcon />
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export const FilterDialog = ({
  open,
  onClose,
  onApply,
  columns,
  activeFilters,
}) => {
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    setFilters(activeFilters || []);
  }, [activeFilters]);

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }]);
  };

  const handleUpdateFilter = (index, newCondition) => {
    const newFilters = [...filters];
    newFilters[index] = newCondition;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const validFilters = filters.filter(f => f.field && f.operator && f.value);
    onApply(validFilters);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Advanced Filters
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddFilter}
            variant="contained"
            color="primary"
          >
            Add Filter
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {filters.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <FilterIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              No filters added. Click "Add Filter" to create one.
            </Typography>
          </Box>
        ) : (
          <List>
            {filters.map((condition, index) => (
              <FilterCondition
                key={index}
                condition={condition}
                index={index}
                columns={columns}
                onUpdate={handleUpdateFilter}
                onRemove={handleRemoveFilter}
              />
            ))}
          </List>
        )}

        {filters.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Filters:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.map((filter, index) => (
                filter.field && filter.operator && (
                  <Chip
                    key={index}
                    label={`${columns.find(c => c.field === filter.field)?.headerName || filter.field} 
                           ${filter.operator} ${filter.value}`}
                    onDelete={() => handleRemoveFilter(index)}
                    color="primary"
                    variant="outlined"
                  />
                )
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={filters.length === 0}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};
