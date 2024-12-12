import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const StyledSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
}));

export const BalanceSection = styled(StyledSection)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

export const InvoiceTable = styled('div')(({ theme }) => ({
  '& .MuiTableContainer-root': {
    maxHeight: 400,
    overflowY: 'auto',
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5),
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const StatusChip = styled('span')(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return {
          color: theme.palette.success.main,
          background: theme.palette.success.light,
        };
      case 'pending':
        return {
          color: theme.palette.warning.main,
          background: theme.palette.warning.light,
        };
      case 'failed':
        return {
          color: theme.palette.error.main,
          background: theme.palette.error.light,
        };
      default:
        return {
          color: theme.palette.text.secondary,
          background: theme.palette.action.hover,
        };
    }
  };

  const { color, background } = getStatusColor();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color,
    backgroundColor: background,
  };
});

export const PaymentMethodCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));
