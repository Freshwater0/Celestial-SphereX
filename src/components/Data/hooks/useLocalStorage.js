import { useCallback } from 'react';
import { encrypt, decrypt } from '../utils/encryption';

export const useLocalStorage = () => {
  const saveToLocal = useCallback(async (key, data, encrypt = false) => {
    try {
      const serializedData = JSON.stringify(data);
      const valueToStore = encrypt ? await encrypt(serializedData) : serializedData;
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save data locally');
    }
  }, []);

  const loadFromLocal = useCallback(async (key, decrypt = false) => {
    try {
      const storedValue = localStorage.getItem(key);
      if (!storedValue) return null;

      const decryptedValue = decrypt ? await decrypt(storedValue) : storedValue;
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      throw new Error('Failed to load data from local storage');
    }
  }, []);

  const removeFromLocal = useCallback((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      throw new Error('Failed to remove data from local storage');
    }
  }, []);

  const clearLocal = useCallback(() => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new Error('Failed to clear local storage');
    }
  }, []);

  return {
    saveToLocal,
    loadFromLocal,
    removeFromLocal,
    clearLocal,
  };
};
