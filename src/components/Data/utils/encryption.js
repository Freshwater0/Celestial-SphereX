/**
 * Encryption utility for secure data storage
 * Uses Web Crypto API for secure encryption/decryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Generate a cryptographic key from a password
 * @param {string} password - Password to derive key from
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Derived key
 */
const getKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt data using AES-GCM
 * @param {string} data - Data to encrypt
 * @param {string} [password] - Optional password for encryption
 * @returns {Promise<string>} Encrypted data as base64 string
 */
export const encrypt = async (data, password = 'default-secure-key') => {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await getKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      encoder.encode(data)
    );

    // Combine salt, iv, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} [password] - Password used for encryption
 * @returns {Promise<string>} Decrypted data
 */
export const decrypt = async (encryptedData, password = 'default-secure-key') => {
  try {
    const decoder = new TextDecoder();
    const encrypted = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    // Extract salt, iv, and data
    const salt = encrypted.slice(0, SALT_LENGTH);
    const iv = encrypted.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = encrypted.slice(SALT_LENGTH + IV_LENGTH);

    const key = await getKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      data
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generate a secure random key
 * @param {number} length - Length of the key in bytes
 * @returns {string} Base64 encoded random key
 */
export const generateKey = (length = 32) => {
  const key = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...key));
};

/**
 * Hash a string using SHA-256
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Base64 encoded hash
 */
export const hash = async (data) => {
  try {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Compare a string with its hash
 * @param {string} data - Original data
 * @param {string} hashedData - Base64 encoded hash to compare against
 * @returns {Promise<boolean>} True if the data matches the hash
 */
export const verifyHash = async (data, hashedData) => {
  try {
    const newHash = await hash(data);
    return newHash === hashedData;
  } catch (error) {
    console.error('Hash verification error:', error);
    throw new Error('Failed to verify hash');
  }
};
