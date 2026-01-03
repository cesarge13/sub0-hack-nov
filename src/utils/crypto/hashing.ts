/**
 * Crypto Utilities - SHA-256 Hashing
 * 
 * Provides functions for computing SHA-256 hashes of files/data.
 * Used for document integrity verification and signing.
 */

import { logger } from '../logger';

/**
 * Computes SHA-256 hash of an ArrayBuffer
 * @param buffer - The ArrayBuffer to hash
 * @returns Promise resolving to hex string of the hash
 */
export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const startTime = performance.now();
  const bufferSize = buffer.byteLength;
  
  try {
    logger.debug('Computing SHA-256 hash', {
      bufferSize: `${(bufferSize / 1024).toFixed(2)} KB`
    }, 'HASHING');
    
    // Check if Web Crypto API is available
    if (!crypto || !crypto.subtle) {
      const errorMsg = 'Web Crypto API is not available. Make sure you are using HTTPS or localhost.';
      logger.error('Web Crypto API unavailable', {
        hasCrypto: !!crypto,
        hasSubtle: !!(crypto && crypto.subtle),
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
      }, 'HASHING');
      throw new Error(errorMsg);
    }
    
    // Use Web Crypto API for SHA-256 hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    const duration = performance.now() - startTime;
    logger.debug('SHA-256 hash computed', {
      hash: hashHex.substring(0, 20) + '...',
      duration: `${duration.toFixed(2)}ms`,
      speed: `${(bufferSize / duration / 1024).toFixed(2)} MB/s`
    }, 'HASHING');
    
    return hashHex;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('Failed to compute SHA-256 hash', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration.toFixed(2)}ms`,
      bufferSize
    }, 'HASHING');
    throw new Error(`Failed to compute SHA-256 hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Computes SHA-256 hash of a File object
 * @param file - The File to hash
 * @returns Promise resolving to hex string of the hash
 */
export async function computeFileHash(file: File): Promise<string> {
  const startTime = performance.now();
  
  try {
    logger.debug('Starting file hash computation', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    }, 'HASHING');
    
    logger.debug('Reading file as ArrayBuffer...', null, 'HASHING');
    const arrayBuffer = await file.arrayBuffer();
    
    logger.debug('File read, computing hash...', {
      arrayBufferSize: `${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`
    }, 'HASHING');
    
    const hash = await computeSHA256(arrayBuffer);
    
    const totalDuration = performance.now() - startTime;
    logger.debug('File hash computation complete', {
      fileName: file.name,
      hash: hash.substring(0, 20) + '...',
      totalDuration: `${totalDuration.toFixed(2)}ms`
    }, 'HASHING');
    
    return hash;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('File hash computation failed', {
      fileName: file.name,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration.toFixed(2)}ms`
    }, 'HASHING');
    throw new Error(`Failed to compute file hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts a hex string to ArrayBuffer
 * @param hex - Hex string to convert
 * @returns ArrayBuffer representation
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Converts an ArrayBuffer to hex string
 * @param buffer - ArrayBuffer to convert
 * @returns Hex string representation
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

