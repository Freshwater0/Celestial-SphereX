import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  PaymentOutlined as PaymentIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBilling } from '../../contexts/BillingContext';
import BackButton from '../../components/BackButton';

const Billing = () => {
  const { t } = useTranslation();
  const {
    loading,
    error,
    paymentMethods,
    invoices,
    balance,
    fetchPaymentMethods,
    fetchInvoices,
    fetchBalance,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    addCredit,
    downloadInvoice,
  } = useBilling();

  const [openAddCard, setOpenAddCard] = useState(false);
  const [openAddCredit, setOpenAddCredit] = useState(false);
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [creditAmount, setCreditAmount] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    fetchPaymentMethods();
    fetchInvoices();
    fetchBalance();
  }, [fetchPaymentMethods, fetchInvoices, fetchBalance]);

  const handleAddCard = async () => {
    const errors = {};
    if (!newCardData.cardNumber) errors.cardNumber = t('billing.errors.cardNumberRequired');
    if (!newCardData.expiryDate) errors.expiryDate = t('billing.errors.expiryRequired');
    if (!newCardData.cvv) errors.cvv = t('billing.errors.cvvRequired');
    if (!newCardData.name) errors.name = t('billing.errors.nameRequired');

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    const result = await addPaymentMethod(newCardData);
    if (result.success) {
      setOpenAddCard(false);
      setNewCardData({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
      setSnackbar({
        open: true,
        message: t('billing.cardAddedSuccess'),
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  const handleAddCredit = async () => {
    if (!creditAmount || isNaN(creditAmount) || parseFloat(creditAmount) <= 0) {
      setSnackbar({
        open: true,
        message: t('billing.errors.invalidAmount'),
        severity: 'error',
      });
      return;
    }

    const result = await addCredit(parseFloat(creditAmount));
    if (result.success) {
      setOpenAddCredit(false);
      setCreditAmount('');
      setSnackbar({
        open: true,
        message: t('billing.creditAddedSuccess'),
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  const handleDeleteCard = async (id) => {
    const result = await removePaymentMethod(id);
    if (result.success) {
      setSnackbar({
        open: true,
        message: t('billing.cardRemovedSuccess'),
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  const handleSetDefaultCard = async (id) => {
    const result = await setDefaultPaymentMethod(id);
    if (result.success) {
      setSnackbar({
        open: true,
        message: t('billing.defaultCardSetSuccess'),
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error,
        severity: 'error',
      });
    }
  };

  if (loading && !paymentMethods.length && !invoices.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <BackButton />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Payment Method & Balance Section */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{t('billing.paymentMethods')}</Typography>
                <Button
                  variant="contained"
                  startIcon={<CreditCardIcon />}
                  size="small"
                  onClick={() => setOpenAddCard(true)}
                >
                  {t('billing.addNewCard')}
                </Button>
              </Box>
              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} sm={6} key={method.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {method.cardType} ****{method.lastFour}
                          </Typography>
                          {method.default && (
                            <Chip 
                              label={t('billing.default')} 
                              size="small" 
                              color="primary"
                              icon={<StarIcon />}
                            />
                          )}
                        </Box>
                        <Typography color="text.secondary" variant="body2">
                          {t('billing.expires')} {method.expiry}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        {!method.default && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleSetDefaultCard(method.id)}
                            title={t('billing.setAsDefault')}
                          >
                            <StarIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteCard(method.id)}
                          disabled={method.default}
                          title={t('billing.removeCard')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                {t('billing.billingInfo')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WalletIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2">
                    {t('billing.currentBalance')}
                  </Typography>
                  <Typography variant="h4">
                    ${balance.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                startIcon={<PaymentIcon />}
                onClick={() => setOpenAddCredit(true)}
              >
                {t('billing.addCredit')}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Invoices Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              {t('billing.invoiceHistory')}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('billing.invoiceId')}</TableCell>
                  <TableCell>{t('billing.date')}</TableCell>
                  <TableCell>{t('billing.amount')}</TableCell>
                  <TableCell>{t('billing.status')}</TableCell>
                  <TableCell align="right">{t('billing.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`billing.status.${invoice.status.toLowerCase()}`)}
                        size="small"
                        color={
                          invoice.status === 'Paid'
                            ? 'success'
                            : invoice.status === 'Pending'
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => downloadInvoice(invoice.id)}
                        title={t('billing.downloadInvoice')}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Add Card Dialog */}
      <Dialog open={openAddCard} onClose={() => setOpenAddCard(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('billing.addNewCard')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('billing.cardNumber')}
            value={newCardData.cardNumber}
            onChange={(e) => setNewCardData({ ...newCardData, cardNumber: e.target.value })}
            margin="normal"
            error={!!cardErrors.cardNumber}
            helperText={cardErrors.cardNumber}
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('billing.expiryDate')}
                value={newCardData.expiryDate}
                onChange={(e) => setNewCardData({ ...newCardData, expiryDate: e.target.value })}
                margin="normal"
                placeholder="MM/YY"
                error={!!cardErrors.expiryDate}
                helperText={cardErrors.expiryDate}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('billing.cvv')}
                value={newCardData.cvv}
                onChange={(e) => setNewCardData({ ...newCardData, cvv: e.target.value })}
                margin="normal"
                error={!!cardErrors.cvv}
                helperText={cardErrors.cvv}
                required
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label={t('billing.cardholderName')}
            value={newCardData.name}
            onChange={(e) => setNewCardData({ ...newCardData, name: e.target.value })}
            margin="normal"
            error={!!cardErrors.name}
            helperText={cardErrors.name}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddCard(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleAddCard} variant="contained">{t('common.add')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={openAddCredit} onClose={() => setOpenAddCredit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('billing.addCredit')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('billing.amount')}
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            margin="normal"
            type="number"
            InputProps={{
              startAdornment: '$',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddCredit(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleAddCredit} variant="contained">{t('common.add')}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Billing;
