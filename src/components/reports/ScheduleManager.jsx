import React, { useState, useEffect } from 'react';
import schedulingService from '../../services/schedulingService';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const RECURRENCE_TYPES = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

const DELIVERY_METHODS = {
  EMAIL: 'email',
  DOWNLOAD: 'download',
  SLACK: 'slack',
  TEAMS: 'teams',
  WEBHOOK: 'webhook',
};

const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json',
};

const ScheduleManager = ({ report, onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    recurrenceType: RECURRENCE_TYPES.ONCE,
    startTime: new Date(),
    endTime: null,
    deliveryMethods: [],
    exportFormats: [],
    customRecurrence: {
      interval: 1,
      unit: 'days',
    },
    active: true,
  });

  useEffect(() => {
    // Load existing schedules for this report
    const loadSchedules = async () => {
      try {
        const existingSchedules = await schedulingService.getReportSchedules(report.id);
        setSchedules(existingSchedules);
      } catch (error) {
        console.error('Error loading schedules:', error);
      }
    };

    loadSchedules();
  }, [report.id]);

  const handleCreateSchedule = async () => {
    try {
      const scheduleToSave = {
        ...newSchedule,
        reportId: report.id,
      };

      const savedSchedule = await schedulingService.createSchedule(scheduleToSave);
      setSchedules([...schedules, savedSchedule]);
      
      // Reset new schedule form
      setNewSchedule({
        recurrenceType: RECURRENCE_TYPES.ONCE,
        startTime: new Date(),
        endTime: null,
        deliveryMethods: [],
        exportFormats: [],
        customRecurrence: {
          interval: 1,
          unit: 'days',
        },
        active: true,
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      const updatedSchedule = await schedulingService.updateSchedule(editingSchedule);
      setSchedules(schedules.map(s => 
        s.id === updatedSchedule.id ? updatedSchedule : s
      ));
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await schedulingService.deleteSchedule(scheduleId);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const renderScheduleCard = (schedule) => (
    <Card key={schedule.id} sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {schedule.recurrenceType.charAt(0).toUpperCase() + schedule.recurrenceType.slice(1)} Schedule
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={schedule.active}
                  onChange={() => {
                    const updatedSchedule = { ...schedule, active: !schedule.active };
                    handleUpdateSchedule(updatedSchedule);
                  }}
                />
              }
              label="Active"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2">Start Time</Typography>
            <Typography variant="body2">
              {new Date(schedule.startTime).toLocaleString()}
            </Typography>
          </Box>

          {schedule.endTime && (
            <Box>
              <Typography variant="subtitle2">End Time</Typography>
              <Typography variant="body2">
                {new Date(schedule.endTime).toLocaleString()}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2">Delivery Methods</Typography>
            <Stack direction="row" spacing={1}>
              {schedule.deliveryMethods.map(method => (
                <Chip 
                  key={method} 
                  label={method.toUpperCase()} 
                  size="small" 
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2">Export Formats</Typography>
            <Stack direction="row" spacing={1}>
              {schedule.exportFormats.map(format => (
                <Chip 
                  key={format} 
                  label={format.toUpperCase()} 
                  size="small" 
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => setEditingSchedule(schedule)}>
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={() => handleDeleteSchedule(schedule.id)}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  const renderScheduleForm = () => (
    <Box>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>Recurrence Type</InputLabel>
          <Select
            value={editingSchedule?.recurrenceType || newSchedule.recurrenceType}
            onChange={(e) => {
              const value = e.target.value;
              if (editingSchedule) {
                setEditingSchedule({ 
                  ...editingSchedule, 
                  recurrenceType: value 
                });
              } else {
                setNewSchedule({ 
                  ...newSchedule, 
                  recurrenceType: value 
                });
              }
            }}
          >
            {Object.values(RECURRENCE_TYPES).map(type => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DateTimePicker
          label="Start Time"
          value={editingSchedule?.startTime || newSchedule.startTime}
          onChange={(date) => {
            if (editingSchedule) {
              setEditingSchedule({ 
                ...editingSchedule, 
                startTime: date 
              });
            } else {
              setNewSchedule({ 
                ...newSchedule, 
                startTime: date 
              });
            }
          }}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />

        {(editingSchedule?.recurrenceType !== RECURRENCE_TYPES.ONCE || 
          newSchedule.recurrenceType !== RECURRENCE_TYPES.ONCE) && (
          <DateTimePicker
            label="End Time"
            value={editingSchedule?.endTime || newSchedule.endTime}
            onChange={(date) => {
              if (editingSchedule) {
                setEditingSchedule({ 
                  ...editingSchedule, 
                  endTime: date 
                });
              } else {
                setNewSchedule({ 
                  ...newSchedule, 
                  endTime: date 
                });
              }
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        )}

        <FormControl fullWidth>
          <InputLabel>Delivery Methods</InputLabel>
          <Select
            multiple
            value={editingSchedule?.deliveryMethods || newSchedule.deliveryMethods}
            onChange={(e) => {
              const value = e.target.value;
              if (editingSchedule) {
                setEditingSchedule({ 
                  ...editingSchedule, 
                  deliveryMethods: value 
                });
              } else {
                setNewSchedule({ 
                  ...newSchedule, 
                  deliveryMethods: value 
                });
              }
            }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {Object.values(DELIVERY_METHODS).map(method => (
              <MenuItem key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Export Formats</InputLabel>
          <Select
            multiple
            value={editingSchedule?.exportFormats || newSchedule.exportFormats}
            onChange={(e) => {
              const value = e.target.value;
              if (editingSchedule) {
                setEditingSchedule({ 
                  ...editingSchedule, 
                  exportFormats: value 
                });
              } else {
                setNewSchedule({ 
                  ...newSchedule, 
                  exportFormats: value 
                });
              }
            }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {Object.values(EXPORT_FORMATS).map(format => (
              <MenuItem key={format} value={format}>
                {format.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(editingSchedule?.recurrenceType === RECURRENCE_TYPES.CUSTOM || 
          newSchedule.recurrenceType === RECURRENCE_TYPES.CUSTOM) && (
          <Box display="flex" gap={2}>
            <TextField
              label="Interval"
              type="number"
              value={
                editingSchedule?.customRecurrence?.interval || 
                newSchedule.customRecurrence.interval
              }
              onChange={(e) => {
                const value = e.target.value;
                if (editingSchedule) {
                  setEditingSchedule({ 
                    ...editingSchedule, 
                    customRecurrence: {
                      ...editingSchedule.customRecurrence,
                      interval: value
                    }
                  });
                } else {
                  setNewSchedule({ 
                    ...newSchedule, 
                    customRecurrence: {
                      ...newSchedule.customRecurrence,
                      interval: value
                    }
                  });
                }
              }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={
                  editingSchedule?.customRecurrence?.unit || 
                  newSchedule.customRecurrence.unit
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingSchedule) {
                    setEditingSchedule({ 
                      ...editingSchedule, 
                      customRecurrence: {
                        ...editingSchedule.customRecurrence,
                        unit: value
                      }
                    });
                  } else {
                    setNewSchedule({ 
                      ...newSchedule, 
                      customRecurrence: {
                        ...newSchedule.customRecurrence,
                        unit: value
                      }
                    });
                  }
                }}
              >
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
                <MenuItem value="months">Months</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Stack>
    </Box>
  );

  return (
    <Box>
      <DialogTitle>
        Report Scheduling
        <Button 
          startIcon={<AddIcon />} 
          sx={{ ml: 2 }}
          onClick={() => setEditingSchedule({})}
        >
          Create Schedule
        </Button>
      </DialogTitle>
      <DialogContent>
        {editingSchedule !== null ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {editingSchedule.id ? 'Edit' : 'Create'} Schedule
            </Typography>
            {renderScheduleForm()}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={editingSchedule.id ? handleUpdateSchedule : handleCreateSchedule}
              >
                {editingSchedule.id ? 'Update' : 'Create'} Schedule
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setEditingSchedule(null)}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {schedules.map(renderScheduleCard)}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Box>
  );
};

export default ScheduleManager;
