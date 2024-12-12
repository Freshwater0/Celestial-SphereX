import React from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Box,
  Skeleton,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { InvoiceTable, StatusChip, StyledSection } from '../BillingStyles';

const LoadingSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton width={100} />
        </TableCell>
        <TableCell>
          <Skeleton width={120} />
        </TableCell>
        <TableCell>
          <Skeleton width={80} />
        </TableCell>
        <TableCell>
          <Skeleton width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton width={40} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

const TransactionHistory = ({ 
  transactions, 
  onDownload, 
  loading 
}) => {
  const { t } = useTranslation();

  return (
    <StyledSection>
      <Typography variant="h6" gutterBottom>
        {t('billing.transactionHistory')}
      </Typography>
      <InvoiceTable>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.transactionId')}</TableCell>
                <TableCell>{t('billing.date')}</TableCell>
                <TableCell>{t('billing.amount')}</TableCell>
                <TableCell>{t('billing.status')}</TableCell>
                <TableCell align="right">{t('billing.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={transaction.status}>
                        {t(`billing.status.${transaction.status.toLowerCase()}`)}
                      </StatusChip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('billing.downloadReceipt')}>
                        <IconButton
                          size="small"
                          onClick={() => onDownload(transaction.id)}
                          disabled={transaction.status !== 'Paid'}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      <ReceiptIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                      <Typography variant="body2">
                        {t('billing.noTransactions')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </InvoiceTable>
    </StyledSection>
  );
};

export default TransactionHistory;
