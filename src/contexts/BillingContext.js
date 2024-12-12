import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BillingContext = createContext();

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

export const BillingProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [balance, setBalance] = useState(0);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/billing/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/billing/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/billing/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addPaymentMethod = useCallback(async (paymentMethodData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/billing/payment-methods', paymentMethodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment method');
      return { success: false, error: err.response?.data?.message || 'Failed to add payment method' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/billing/payment-methods/${paymentMethodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethodId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove payment method');
      return { success: false, error: err.response?.data?.message || 'Failed to remove payment method' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/billing/payment-methods/${paymentMethodId}/default`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        default: method.id === paymentMethodId,
      })));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default payment method');
      return { success: false, error: err.response?.data?.message || 'Failed to set default payment method' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addCredit = useCallback(async (amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/billing/credit', { amount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add credit');
      return { success: false, error: err.response?.data?.message || 'Failed to add credit' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const downloadInvoice = useCallback(async (invoiceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/billing/invoices/${invoiceId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download invoice');
      return { success: false, error: err.response?.data?.message || 'Failed to download invoice' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const value = {
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
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};
