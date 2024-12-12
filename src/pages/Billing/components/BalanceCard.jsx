import React from 'react';
import {
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { BalanceSection } from '../BillingStyles';

const BalanceCard = ({ 
  balance, 
  onAddCredit, 
  loading 
}) => {
  const { t } = useTranslation();

  return (
    <BalanceSection>
      <Typography variant="h6" gutterBottom>
        {t('billing.accountBalance')}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WalletIcon sx={{ fontSize: 48, mr: 2, opacity: 0.9 }} />
        <Box>
          {loading ? (
            <Skeleton width={150} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          ) : (
            <>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {t('billing.availableCredit')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                ${balance.toFixed(2)}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddCredit}
        disabled={loading}
        sx={{
          bgcolor: 'white',
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.9)',
          },
          '&:disabled': {
            bgcolor: 'rgba(255,255,255,0.5)',
          },
        }}
      >
        {t('billing.addFunds')}
      </Button>
    </BalanceSection>
  );
};

export default BalanceCard;
