/**
 * Crypto Utilities - AES-256-GCM Encryption
 * 
 * Provides client-side encryption using AES-256-GCM algorithm.
 * This ensures documents are encrypted before uploading to Arkiv.
 */

import { logger } from '../logger';

export interface EncryptionResult {
  encryptedData: ArrayBuffer;
  key: CryptoKey;
  nonce: Uint8Array;
  keyData: ArrayBuffer; // For storage/transmission (if needed)
}

/**
 * Generates a random AES-256-GCM key
 * @returns Promise resolving to CryptoKey
 */
export async function generateAESKey(): Promise<CryptoKey> {
  try {
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      const errorMsg = 'Web Crypto API is not available. Make sure you are using HTTPS or localhost.';
      logger.error('Web Crypto API unavailable', {
        hasCrypto: !!crypto,
        hasSubtle: !!(crypto && crypto.subtle),
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
      }, 'ENCRYPTION');
      throw new Error(errorMsg);
    }
    
    logger.encryption('Generating AES-256 key...');
    const startTime = performance.now();
    
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256, // AES-256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    const duration = performance.now() - startTime;
    logger.encryption('AES-256 key generated successfully', { duration: `${duration.toFixed(2)}ms` });
    
    return key;
  } catch (error) {
    logger.error('Failed to generate AES key', error, 'ENCRYPTION');
    throw new Error(`Failed to generate AES key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a random nonce (96 bits for AES-GCM)
 * @returns Uint8Array containing 12 random bytes
 */
export function generateNonce(): Uint8Array {
  // Check if Web Crypto API is available
  if (!crypto || !crypto.getRandomValues) {
    const errorMsg = 'Web Crypto API is not available. Make sure you are using HTTPS or localhost.';
    logger.error('Web Crypto API unavailable for nonce generation', {
      hasCrypto: !!crypto,
      hasGetRandomValues: !!(crypto && crypto.getRandomValues),
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
    }, 'ENCRYPTION');
    throw new Error(errorMsg);
  }
  
  logger.encryption('Generating random nonce (96 bits)...');
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  logger.encryption('Nonce generated', { 
    nonce: Array.from(nonce).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16) + '...' 
  });
  return nonce;
}

/**
 * Exports a CryptoKey to ArrayBuffer (for storage/transmission)
 * @param key - The CryptoKey to export
 * @returns Promise resolving to ArrayBuffer containing key data
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  try {
    return await crypto.subtle.exportKey('raw', key);
  } catch (error) {
    throw new Error(`Failed to export key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Imports a key from ArrayBuffer
 * @param keyData - ArrayBuffer containing key data
 * @returns Promise resolving to CryptoKey
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  try {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new Error(`Failed to import key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypts data using AES-256-GCM
 * @param data - ArrayBuffer to encrypt
 * @param key - CryptoKey to use for encryption (optional, will generate if not provided)
 * @param nonce - Nonce to use (optional, will generate if not provided)
 * @returns Promise resolving to EncryptionResult containing encrypted data, key, and nonce
 */
export async function encryptAES256GCM(
  data: ArrayBuffer,
  key?: CryptoKey,
  nonce?: Uint8Array
): Promise<EncryptionResult> {
  const startTime = performance.now();
  const originalSize = data.byteLength;
  
  try {
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      const errorMsg = 'Web Crypto API is not available. Make sure you are using HTTPS or localhost.';
      logger.error('Web Crypto API unavailable', {
        hasCrypto: !!crypto,
        hasSubtle: !!(crypto && crypto.subtle),
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
      }, 'ENCRYPTION');
      throw new Error(errorMsg);
    }
    
    logger.encryption('Starting AES-256-GCM encryption', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      hasKey: !!key,
      hasNonce: !!nonce,
    });
    
    // Generate key and nonce if not provided
    logger.encryption('Generating encryption key and nonce...');
    const encryptionKey = key || await generateAESKey();
    const encryptionNonce = nonce || generateNonce();
    
    logger.encryption('Encrypting data with AES-256-GCM...', {
      dataSize: `${(data.byteLength / 1024).toFixed(2)} KB`,
      nonceLength: encryptionNonce.length,
    });
    
    // Encrypt the data
    // TypeScript workaround: cast nonce to BufferSource
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: encryptionNonce as BufferSource,
        tagLength: 128, // 128-bit authentication tag
      },
      encryptionKey,
      data
    );
    
    const encryptedSize = encryptedData.byteLength;
    const duration = performance.now() - startTime;
    
    logger.encryption('Encryption completed successfully', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      encryptedSize: `${(encryptedSize / 1024).toFixed(2)} KB`,
      overhead: `${((encryptedSize - originalSize) / 1024).toFixed(2)} KB`,
      duration: `${duration.toFixed(2)}ms`,
      speed: `${(originalSize / duration / 1024).toFixed(2)} MB/s`,
    });
    
    // Export key for storage (if needed)
    logger.encryption('Exporting key for storage...');
    const keyData = await exportKey(encryptionKey);
    
    logger.encryption('Encryption process complete', {
      encryptedDataSize: encryptedData.byteLength,
      keyDataSize: keyData.byteLength,
      nonceSize: encryptionNonce.length,
    });
    
    return {
      encryptedData,
      key: encryptionKey,
      nonce: encryptionNonce,
      keyData,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('Encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration.toFixed(2)}ms`,
      originalSize,
    }, 'ENCRYPTION');
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData - ArrayBuffer containing encrypted data
 * @param key - CryptoKey to use for decryption
 * @param nonce - Nonce used during encryption
 * @returns Promise resolving to decrypted ArrayBuffer
 */
export async function decryptAES256GCM(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  nonce: Uint8Array
): Promise<ArrayBuffer> {
  try {
    // TypeScript workaround: cast nonce to BufferSource
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce as BufferSource,
        tagLength: 128,
      },
      key,
      encryptedData
    );
    
    return decryptedData;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypts a File object using AES-256-GCM
 * @param file - File to encrypt
 * @returns Promise resolving to EncryptionResult
 */
export async function encryptFile(file: File): Promise<EncryptionResult> {
  const startTime = performance.now();
  
  try {
    logger.encryption('Starting file encryption', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type,
    });
    
    logger.encryption('Reading file as ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();
    
    logger.encryption('File read successfully', {
      arrayBufferSize: `${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`,
    });
    
    const result = await encryptAES256GCM(arrayBuffer);
    
    const totalDuration = performance.now() - startTime;
    logger.encryption('File encryption complete', {
      fileName: file.name,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('File encryption failed', {
      fileName: file.name,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration.toFixed(2)}ms`,
    }, 'ENCRYPTION');
    throw new Error(`Failed to encrypt file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

