import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  DragIndicator,
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const dataTypes = [
  { id: 'text', name: 'Text' },
  { id: 'number', name: 'Number' },
  { id: 'date', name: 'Date' },
  { id: 'boolean', name: 'Boolean' },
  { id: 'email', name: 'Email' },
  { id: 'url', name: 'URL' },
];

export const ColumnSettingsDialog = ({ open, onClose, columns, onChange }) => {
  const [editedColumns, setEditedColumns] = useState(columns);
  const [editingColumn, setEditingColumn] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(editedColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditedColumns(items);
  };

  const toggleColumnVisibility = (index) => {
    const newColumns = [...editedColumns];
    newColumns[index] = {
      ...newColumns[index],
      hidden: !newColumns[index].hidden,
    };
    setEditedColumns(newColumns);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
  };

  const handleDeleteColumn = (index) => {
    const newColumns = editedColumns.filter((_, i) => i !== index);
    setEditedColumns(newColumns);
  };

  const handleAddColumn = () => {
    setEditedColumns([
      ...editedColumns,
      {
        field: `column${editedColumns.length + 1}`,
        headerName: `Column ${editedColumns.length + 1}`,
        type: 'text',
        width: 150,
      },
    ]);
  };

  const handleSave = () => {
    onChange(editedColumns);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Column Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddColumn}
          >
            Add Column
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {editedColumns.map((column, index) => (
                  <Draggable
                    key={column.field}
                    draggableId={column.field}
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        divider
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragIndicator />
                        </ListItemIcon>
                        <ListItemText
                          primary={column.headerName}
                          secondary={`Type: ${column.type}, Width: ${column.width}px`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title={column.hidden ? "Show" : "Hide"}>
                            <IconButton
                              edge="end"
                              onClick={() => toggleColumnVisibility(index)}
                            >
                              {column.hidden ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            edge="end"
                            onClick={() => handleEditColumn(column)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteColumn(index)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        {/* Column Edit Dialog */}
        <Dialog
          open={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Column</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Header Name"
                value={editingColumn?.headerName || ''}
                onChange={(e) => setEditingColumn({
                  ...editingColumn,
                  headerName: e.target.value,
                })}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={editingColumn?.type || 'text'}
                  onChange={(e) => setEditingColumn({
                    ...editingColumn,
                    type: e.target.value,
                  })}
                >
                  {dataTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Width (px)"
                type="number"
                value={editingColumn?.width || 150}
                onChange={(e) => setEditingColumn({
                  ...editingColumn,
                  width: parseInt(e.target.value, 10),
                })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingColumn(null)}>Cancel</Button>
            <Button
              onClick={() => {
                const index = editedColumns.findIndex(c => c.field === editingColumn.field);
                const newColumns = [...editedColumns];
                newColumns[index] = editingColumn;
                setEditedColumns(newColumns);
                setEditingColumn(null);
              }}
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
