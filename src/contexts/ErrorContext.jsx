import React, { createContext, useState, useContext } from 'react';
import { 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';

// Create the error context
const ErrorContext = createContext({
  showError: () => {},
  showErrorDialog: () => {}
});

/**
 * Error Provider Component
 * Manages application-wide error handling and display
 */
export const ErrorProvider = ({ children }) => {
  const [snackbarError, setSnackbarError] = useState(null);
  const [dialogError, setDialogError] = useState(null);

  /**
   * Show a temporary snackbar error
   * @param {string} message - Error message to display
   * @param {string} [severity='error'] - Error severity
   */
  const showError = (message, severity = 'error') => {
    setSnackbarError({ message, severity });
  };

  /**
   * Show a persistent error dialog
   * @param {Object} errorDetails - Detailed error information
   */
  const showErrorDialog = (errorDetails) => {
    setDialogError(errorDetails);
  };

  /**
   * Close the snackbar error
   */
  const handleSnackbarClose = () => {
    setSnackbarError(null);
  };

  /**
   * Close the error dialog
   */
  const handleDialogClose = () => {
    setDialogError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, showErrorDialog }}>
      {children}

      {/* Snackbar for temporary errors */}
      {snackbarError && (
        <Snackbar
          open={!!snackbarError}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose}
            severity={snackbarError.severity}
            sx={{ width: '100%' }}
          >
            {snackbarError.message}
          </Alert>
        </Snackbar>
      )}

      {/* Dialog for persistent errors */}
      {dialogError && (
        <Dialog
          open={!!dialogError}
          onClose={handleDialogClose}
          aria-labelledby="error-dialog-title"
          aria-describedby="error-dialog-description"
        >
          <DialogTitle id="error-dialog-title">
            {dialogError.title || 'Error'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="error-dialog-description">
              {dialogError.message}
            </DialogContentText>
            {dialogError.details && (
              <pre style={{ 
                backgroundColor: '#f4f4f4', 
                padding: '10px', 
                borderRadius: '4px',
                overflowX: 'auto'
              }}>
                {JSON.stringify(dialogError.details, null, 2)}
              </pre>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </ErrorContext.Provider>
  );
};

/**
 * Custom hook for using error context
 * @returns {Object} Error context methods
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  return context;
};

export default ErrorContext;
