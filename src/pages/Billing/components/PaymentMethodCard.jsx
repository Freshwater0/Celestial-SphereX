import React from 'react';
import {
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Star as StarIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PaymentMethodCard as StyledCard, CardTypeIcon } from '../BillingStyles';

const getCardIcon = (cardType) => {
  // In a real app, you'd have different icons for different card types
  return <CreditCardIcon />;
};

const PaymentMethodCard = ({ 
  method, 
  onSetDefault, 
  onDelete,
  disabled 
}) => {
  const { t } = useTranslation();

  return (
    <StyledCard>
      <CardContent>
        <CardTypeIcon>
          {getCardIcon(method.cardType)}
        </CardTypeIcon>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {method.cardType}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            **** **** **** {method.lastFour}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t('billing.expiresOn')} {method.expiry}
        </Typography>
        {method.name && (
          <Typography variant="caption" color="text.secondary" display="block">
            {method.name}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
        {!method.default && (
          <Tooltip title={t('billing.setAsDefault')}>
            <IconButton
              size="small"
              onClick={() => onSetDefault(method.id)}
              color="primary"
              disabled={disabled}
            >
              <StarIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={t('billing.removeCard')}>
          <span>
            <IconButton
              size="small"
              onClick={() => onDelete(method.id)}
              color="error"
              disabled={method.default || disabled}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </CardActions>
    </StyledCard>
  );
};

export default PaymentMethodCard;
