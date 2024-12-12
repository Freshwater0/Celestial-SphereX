import React, { useState, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Stack, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Divider, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { 
  CloudUpload,
  CloudDownload,
  ViewColumn,
  Functions,
  Save,
  FilterList,
  Sort,
  Search,
  Undo,
  Redo
} from '@mui/icons-material';

// Constants
/** @type {Array<{label: string, value: string, shortcut: string}>} */
const EXPORT_FORMATS = [
  { label: 'Export as CSV', value: 'csv', shortcut: 'Alt + C' },
  { label: 'Export as Excel', value: 'xlsx', shortcut: 'Alt + E' },
  { label: 'Export as JSON', value: 'json', shortcut: 'Alt + J' },
];

/** @type {Object<string, {key: string, ctrl: boolean}>} */
const KEYBOARD_SHORTCUTS = {
  save: { key: 's', ctrl: true },
  undo: { key: 'z', ctrl: true },
  redo: { key: 'y', ctrl: true },
  search: { key: 'f', ctrl: true },
};

const ToolbarDivider = memo(() => (
  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
));

/**
 * Toolbar Button Props Type
 * @typedef {Object} ToolbarButtonProps
 * @property {string} title
 * @property {React.ComponentType} icon
 * @property {function} onClick
 * @property {boolean} [disabled]
 * @property {string} [shortcut]
 * @property {'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'} [color]
 */

/**
 * Toolbar Button Component
 * @param {ToolbarButtonProps} props
 * @returns {React.ReactElement}
 */
const ToolbarButton = memo(function ToolbarButton(props) {
  const { 
    title, 
    icon: Icon, 
    onClick, 
    disabled = false,
    shortcut,
    color = 'default'
  } = props;

  return (
    <Tooltip 
      title={shortcut ? `${title} (${shortcut})` : title}
      placement="bottom"
      arrow
    >
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          size="medium"
          aria-label={title}
          color={color}
          sx={{
            '&:focus-visible': {
              outline: '2px solid #1976d2',
              outlineOffset: 2,
            },
          }}
        >
          <Icon />
        </IconButton>
      </span>
    </Tooltip>
  );
});

// Explicitly define PropTypes for type checking
ToolbarButton.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  shortcut: PropTypes.string,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
};

/**
 * Data Toolbar Props Type
 * @typedef {Object} DataToolbarProps
 * @property {function} onImport
 * @property {function(string): void} onExport
 * @property {function} onColumnSettings
 * @property {function} onFormula
 * @property {function(): Promise<void>} onSave
 * @property {boolean} [canUndo]
 * @property {boolean} [canRedo]
 * @property {function} [onUndo]
 * @property {function} [onRedo]
 * @property {function} [onFilter]
 * @property {function} [onSort]
 * @property {function} [onSearch]
 * @property {boolean} [hasUnsavedChanges]
 * @property {boolean} [isLoading]
 */

/**
 * Data Toolbar Component
 * @param {DataToolbarProps} props
 * @returns {React.ReactElement}
 */
const DataToolbarComponent = function DataToolbarComponent(props) {
  const {
    onImport,
    onExport,
    onColumnSettings,
    onFormula,
    onSave,
    canUndo = false,
    canRedo = false,
    onUndo = () => {},
    onRedo = () => {},
    onFilter = () => {},
    onSort = () => {},
    onSearch = () => {},
    hasUnsavedChanges = false,
    isLoading = false,
  } = props;

  /** @type {[HTMLElement | null, function(HTMLElement | null)]} */
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  
  /** @type {[string | null, function(string | null)]} */
  const [error, setError] = useState(null);
  
  /** @type {[boolean, function(boolean)]} */
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /**
   * Handle save operation
   * @returns {Promise<void>}
   */
  const handleSave = useCallback(async () => {
    try {
      await onSave();
      setError(null);
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Save failed: ${errorMessage}`);
      console.error('Save error:', err);
    }
  }, [onSave]);

  /**
   * Handle filter operation
   * @returns {void}
   */
  const handleFilter = useCallback(() => {
    try {
      // Open filter dialog or apply default filter
      if (onFilter) {
        onFilter();
      } else {
        // Default filter implementation
        console.warn('No custom filter implementation provided');
        setError('Filter functionality not configured');
        setSnackbarOpen(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Filter error: ${errorMessage}`);
      console.error('Filter error:', err);
      setSnackbarOpen(true);
    }
  }, [onFilter]);

  /**
   * Handle sort operation
   * @returns {void}
   */
  const handleSort = useCallback(() => {
    try {
      // Open sort dialog or apply default sorting
      if (onSort) {
        onSort();
      } else {
        // Default sort implementation
        console.warn('No custom sort implementation provided');
        setError('Sorting functionality not configured');
        setSnackbarOpen(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Sort error: ${errorMessage}`);
      console.error('Sort error:', err);
      setSnackbarOpen(true);
    }
  }, [onSort]);

  /**
   * Handle search operation
   * @returns {void}
   */
  const handleSearch = useCallback(() => {
    try {
      // Open search dialog or apply default search
      if (onSearch) {
        onSearch();
      } else {
        // Default search implementation
        console.warn('No custom search implementation provided');
        setError('Search functionality not configured');
        setSnackbarOpen(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Search error: ${errorMessage}`);
      console.error('Search error:', err);
      setSnackbarOpen(true);
    }
  }, [onSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    /** @param {KeyboardEvent} event */
    const handleKeyDown = (event) => {
      if (isLoading) return;

      // Handle keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case KEYBOARD_SHORTCUTS.save.key:
            if (hasUnsavedChanges) {
              event.preventDefault();
              handleSave();
            }
            break;
          case KEYBOARD_SHORTCUTS.undo.key:
            if (canUndo) {
              event.preventDefault();
              onUndo();
            }
            break;
          case KEYBOARD_SHORTCUTS.redo.key:
            if (canRedo) {
              event.preventDefault();
              onRedo();
            }
            break;
          case KEYBOARD_SHORTCUTS.search.key:
            event.preventDefault();
            handleSearch();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, hasUnsavedChanges, canUndo, canRedo, onUndo, onRedo, handleSave, handleSearch]);

  /** 
   * Handle export button click
   * @param {React.MouseEvent<HTMLButtonElement>} event 
   */
  const handleExportClick = useCallback((event) => {
    setExportAnchorEl(event.currentTarget);
  }, []);

  /**
   * Close export menu
   * @returns {void}
   */
  const handleExportClose = useCallback(() => {
    setExportAnchorEl(null);
  }, []);

  /**
   * Handle specific export format selection
   * @param {string} format
   * @returns {Promise<void>}
   */
  const handleExportFormat = useCallback(async (format) => {
    try {
      await onExport(format);
      handleExportClose();
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Export failed: ${errorMessage}`);
      console.error('Export error:', err);
    }
  }, [onExport, handleExportClose]);

  /** 
   * Handle Snackbar close
   * @param {React.SyntheticEvent | Event} [event] 
   * @param {string} [reason] 
   * @returns {void}
   */
  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }, []);

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ width: '100%' }}
          >
            <ToolbarButton
              title="Import Data"
              icon={CloudUpload}
              onClick={onImport}
              disabled={isLoading}
              shortcut="Ctrl + O"
            />

            <ToolbarButton
              title="Export Data"
              icon={CloudDownload}
              onClick={handleExportClick}
              disabled={isLoading}
              shortcut="Ctrl + E"
            />

            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={handleExportClose}
            >
              {EXPORT_FORMATS.map((format) => (
                <MenuItem 
                  key={format.value} 
                  onClick={() => handleExportFormat(format.value)}
                >
                  {format.label}
                </MenuItem>
              ))}
            </Menu>

            <ToolbarDivider />

            <ToolbarButton
              title="Column Settings"
              icon={ViewColumn}
              onClick={onColumnSettings}
              disabled={isLoading}
              shortcut="Alt + C"
            />

            <ToolbarButton
              title="Formula Editor"
              icon={Functions}
              onClick={onFormula}
              disabled={isLoading}
              shortcut="Alt + F"
            />

            <ToolbarDivider />

            <ToolbarButton
              title="Save"
              icon={Save}
              onClick={handleSave}
              disabled={isLoading || !hasUnsavedChanges}
              color="primary"
              shortcut="Ctrl + S"
            />

            <ToolbarDivider />

            <ToolbarButton
              title="Undo"
              icon={Undo}
              onClick={onUndo}
              disabled={!canUndo || isLoading}
              shortcut="Ctrl + Z"
            />

            <ToolbarButton
              title="Redo"
              icon={Redo}
              onClick={onRedo}
              disabled={!canRedo || isLoading}
              shortcut="Ctrl + Y"
            />

            <ToolbarDivider />

            <ToolbarButton
              title="Filter Data"
              icon={FilterList}
              onClick={handleFilter}
              disabled={isLoading}
              shortcut="Ctrl + Shift + F"
            />

            <ToolbarButton
              title="Sort Data"
              icon={Sort}
              onClick={handleSort}
              disabled={isLoading}
              shortcut="Alt + S"
            />

            <ToolbarButton
              title="Search"
              icon={Search}
              onClick={handleSearch}
              disabled={isLoading}
              shortcut="Ctrl + F"
            />
          </Stack>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || 'Operation successful'}
        </Alert>
      </Snackbar>
    </>
  );
};

// Explicitly define PropTypes for type checking
DataToolbarComponent.propTypes = {
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onColumnSettings: PropTypes.func.isRequired,
  onFormula: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  onFilter: PropTypes.func,
  onSort: PropTypes.func,
  onSearch: PropTypes.func,
  hasUnsavedChanges: PropTypes.bool,
  isLoading: PropTypes.bool,
};

// Memoize the component and export
export const DataToolbar = memo(DataToolbarComponent);
export default DataToolbar;
