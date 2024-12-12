import React from 'react';
import {
  Typography,
  IconButton,
  Button,
  Box,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PaymentMethodCard, StyledSection } from '../BillingStyles';

const LoadingSkeleton = () => (
  <>
    {[1, 2].map((i) => (
      <PaymentMethodCard key={i}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={200} height={24} />
            <Skeleton width={120} height={20} />
          </Box>
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </PaymentMethodCard>
    ))}
  </>
);

const PaymentMethods = ({
  paymentMethods,
  onAddCard,
  onDeleteCard,
  loading,
}) => {
  const { t } = useTranslation();

  const formatCardNumber = (number) => {
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  return (
    <StyledSection>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {t('billing.paymentMethods')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCard}
          disabled={loading}
        >
          {t('billing.addNewCard')}
        </Button>
      </Box>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CreditCardIcon sx={{ fontSize: 32, opacity: 0.8 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {formatCardNumber(method.cardNumber)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('billing.expiresOn', { date: method.expiryDate })}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title={t('billing.deleteCard')}>
                  <IconButton
                    onClick={() => onDeleteCard(method.id)}
                    disabled={loading}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </PaymentMethodCard>
            ))
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <CreditCardIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
              <Typography variant="body2">
                {t('billing.noPaymentMethods')}
              </Typography>
            </Box>
          )}
        </>
      )}
    </StyledSection>
  );
};

export default PaymentMethods;
