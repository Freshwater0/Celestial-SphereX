import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AddPaymentDialog = ({
  open,
  onClose,
  onAdd,
  loading,
}) => {
  const { t } = useTranslation();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!cardData.cardNumber) {
      newErrors.cardNumber = t('billing.errors.cardNumberRequired');
    } else if (!/^\d{16}$/.test(cardData.cardNumber)) {
      newErrors.cardNumber = t('billing.errors.invalidCardNumber');
    }

    if (!cardData.expiryDate) {
      newErrors.expiryDate = t('billing.errors.expiryRequired');
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = t('billing.errors.invalidExpiry');
    }

    if (!cardData.cvv) {
      newErrors.cvv = t('billing.errors.cvvRequired');
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = t('billing.errors.invalidCvv');
    }

    if (!cardData.name) {
      newErrors.name = t('billing.errors.nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(cardData);
    }
  };

  const handleChange = (field) => (event) => {
    setCardData({ ...cardData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon color="primary" />
          <Typography variant="h6">
            {t('billing.addNewCard')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('billing.cardNumber')}
              value={formatCardNumber(cardData.cardNumber)}
              onChange={(e) => handleChange('cardNumber')(e)}
              error={!!errors.cardNumber}
              helperText={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              inputProps={{ maxLength: 19 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('billing.expiryDate')}
              value={cardData.expiryDate}
              onChange={(e) => {
                const formatted = formatExpiryDate(e.target.value);
                handleChange('expiryDate')({ target: { value: formatted } });
              }}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
              placeholder="MM/YY"
              inputProps={{ maxLength: 5 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('billing.cvv')}
              value={cardData.cvv}
              onChange={handleChange('cvv')}
              error={!!errors.cvv}
              helperText={errors.cvv}
              type="password"
              inputProps={{ maxLength: 4 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('billing.cardholderName')}
              value={cardData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              placeholder={t('billing.cardholderNamePlaceholder')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<CreditCardIcon />}
        >
          {t('billing.addCard')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentDialog;
