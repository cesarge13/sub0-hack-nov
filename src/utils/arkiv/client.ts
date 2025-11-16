/**
 * Arkiv Client Utilities
 * 
 * Provides functions for interacting with Arkiv Network.
 * Handles blob uploads and metadata storage.
 * 
 * Note: This implementation uses REST API calls. If Arkiv provides
 * an official SDK, replace these functions with SDK methods.
 */

import { ARKIV_CONFIG } from './config';
import { logger } from '../logger';

export interface ArkivMetadata {
  hash: string;
  signature: string;
  signer: string;
  objectID: string;
  timestamp?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ArkivBlobResponse {
  objectID?: string;
  cid?: string;
  id?: string;
  blobId?: string;
  size?: number;
}

export interface ArkivMetadataResponse {
  metadataID?: string;
  cid?: string;
  id?: string;
  metadataId?: string;
  merkleRoot?: string;
  txHash?: string;
}

/**
 * Uploads an encrypted blob to Arkiv
 * 
 * According to Arkiv documentation, this should:
 * - Upload the encrypted blob to IPFS via Arkiv
 * - Return a CID (Content Identifier) or objectID
 * 
 * @param encryptedBlob - ArrayBuffer containing encrypted data
 * @returns Promise resolving to objectID (CID)
 */
export async function putBlob(encryptedBlob: ArrayBuffer): Promise<string> {
  try {
    logger.arkiv('Attempting to upload encrypted blob to Arkiv...');
    
    // Convert ArrayBuffer to Blob for FormData
    const blob = new Blob([encryptedBlob], { type: 'application/octet-stream' });
    
    // Intentar múltiples endpoints como fallback
    const endpoints = [
      `${ARKIV_CONFIG.explorerUrl}/api/blob`, // Mendoza explorer API
      `${ARKIV_CONFIG.apiBase}${ARKIV_CONFIG.endpoints.blob}`, // Base API
      `https://api.arkiv.network${ARKIV_CONFIG.endpoints.blob}`, // Direct API
    ];
    
    let lastError: Error | null = null;
    
    for (const uploadUrl of endpoints) {
      try {
        logger.arkiv('Attempting upload to:', { url: uploadUrl });
        
        // Crear FormData nuevo para cada intento (no se puede reutilizar después de fetch)
        const formData = new FormData();
        formData.append('file', blob, 'encrypted-document.bin');
        
        // Upload to Arkiv
        // Note: Arkiv API may expect different field names or formats
        // Verify with official documentation: https://arkiv.network/dev
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          // Note: Don't set Content-Type header - browser will set it with boundary for FormData
        });
        
        if (response.ok) {
          const result: ArkivBlobResponse = await response.json();
          const objectID = result.objectID || result.cid || result.id || (result as any).blobId;
          
          if (objectID) {
            logger.arkiv('Blob uploaded successfully', { objectID, url: uploadUrl });
            return objectID;
          }
        }
        
        // Si llegamos aquí, el endpoint no funcionó
        const errorText = await response.text().catch(() => 'No error text');
        logger.arkiv('Endpoint failed, trying next...', { 
          url: uploadUrl,
          status: response.status,
          error: errorText.substring(0, 100)
        });
        lastError = new Error(`Endpoint ${uploadUrl} failed: ${response.status} - ${errorText.substring(0, 100)}`);
      } catch (error) {
        logger.arkiv('Endpoint error, trying next...', { 
          url: uploadUrl,
          error: error instanceof Error ? error.message : 'Unknown'
        });
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }
    }
    
    // Si todos los endpoints fallaron, lanzar el último error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('All endpoints failed - CORS or endpoint issues');
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      const uploadUrl = ARKIV_CONFIG.useMock 
        ? `${ARKIV_CONFIG.apiBase}${ARKIV_CONFIG.endpoints.blob}`
        : `${ARKIV_CONFIG.explorerUrl}/api/blob`;
      logger.error(`Network error: Unable to reach Arkiv API at ${uploadUrl}`, error, 'ARKIV');
      throw new Error(`Network error: Unable to reach Arkiv API. Please check your connection and API endpoint.`);
    }
    logger.error('Failed to upload blob to Arkiv', error, 'ARKIV');
    throw error;
  }
}

/**
 * Uploads metadata to Arkiv
 * 
 * According to Arkiv documentation, metadata should include:
 * - hash: SHA-256 hash of the original document
 * - signature: ECDSA signature of the hash
 * - signer: Wallet address that signed
 * - objectID: Reference to the encrypted blob
 * 
 * Arkiv will automatically create a Merkle commitment and publish to Mendoza Network
 * 
 * @param metadata - Metadata object to upload
 * @returns Promise resolving to metadataID (CID)
 */
export async function putMetadata(metadata: ArkivMetadata): Promise<string> {
  try {
    logger.arkiv('Attempting to upload metadata to Arkiv...');
    
    // Validate required fields
    if (!metadata.hash || !metadata.signature || !metadata.signer || !metadata.objectID) {
      logger.error('Missing required metadata fields', { metadata }, 'ARKIV');
      throw new Error('Missing required metadata fields: hash, signature, signer, or objectID');
    }
    
    // Try Mendoza Network endpoint first (primary)
    // Fallback to apiBase if configured
    const uploadUrl = ARKIV_CONFIG.useMock 
      ? `${ARKIV_CONFIG.apiBase}${ARKIV_CONFIG.endpoints.metadata}`
      : `${ARKIV_CONFIG.explorerUrl}/api/metadata`; // Try Mendoza explorer API endpoint
    
    logger.arkiv('Uploading metadata to:', { url: uploadUrl });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Arkiv metadata upload failed', { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText, 
        url: uploadUrl,
        metadata: { ...metadata, signature: metadata.signature.substring(0, 20) + '...' } 
      }, 'ARKIV');
      throw new Error(`Arkiv metadata upload failed: ${response.status} - ${errorText}`);
    }
    
    const result: ArkivMetadataResponse = await response.json();
    
    // Arkiv may return 'cid', 'metadataID', 'id', or similar
    // Check all possible fields
    const metadataID = result.metadataID || result.cid || result.id || (result as any).metadataId;
    
    if (!metadataID) {
      logger.error('Arkiv did not return a metadataID or CID', { response: result }, 'ARKIV');
      throw new Error('Arkiv did not return a metadataID or CID. Response: ' + JSON.stringify(result));
    }
    
    logger.arkiv('Metadata uploaded successfully', { metadataID });
    return metadataID;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      logger.error(`Network error: Unable to reach Arkiv API`, error, 'ARKIV');
      throw new Error(`Network error: Unable to reach Arkiv API. Please check your connection and API endpoint.`);
    }
    logger.error('Failed to upload metadata to Arkiv', error, 'ARKIV');
    throw error;
  }
}

/**
 * Retrieves a blob from Arkiv by objectID
 * @param objectID - The objectID to retrieve
 * @returns Promise resolving to ArrayBuffer containing the blob
 */
export async function getBlob(objectID: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`${ARKIV_CONFIG.apiBase}${ARKIV_CONFIG.endpoints.blob}/${objectID}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve blob: ${response.status}`);
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(`Failed to get blob from Arkiv: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves metadata from Arkiv by metadataID
 * @param metadataID - The metadataID to retrieve
 * @returns Promise resolving to metadata object
 */
export async function getMetadata(metadataID: string): Promise<ArkivMetadata> {
  try {
    const response = await fetch(`${ARKIV_CONFIG.apiBase}${ARKIV_CONFIG.endpoints.metadata}/${metadataID}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve metadata: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to get metadata from Arkiv: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative implementation using Arkiv SDK (if available)
 * This is a placeholder for when the official SDK is integrated
 */
export class ArkivClient {
  private apiBase: string;
  
  constructor(apiBase?: string) {
    this.apiBase = apiBase || ARKIV_CONFIG.apiBase;
  }
  
  async putBlob(encryptedBlob: ArrayBuffer): Promise<string> {
    return putBlob(encryptedBlob);
  }
  
  async putMetadata(metadata: ArkivMetadata): Promise<string> {
    return putMetadata(metadata);
  }
  
  async getBlob(objectID: string): Promise<ArrayBuffer> {
    return getBlob(objectID);
  }
  
  async getMetadata(metadataID: string): Promise<ArkivMetadata> {
    return getMetadata(metadataID);
  }
}

// Export singleton instance
export const arkivClient = new ArkivClient();

/**
 * Verify connection to Arkiv API
 * Useful for health checks and debugging
 * @returns Promise resolving to true if API is reachable
 */
export async function verifyArkivConnection(): Promise<boolean> {
  try {
    // Try to reach the API base URL
    const response = await fetch(`${ARKIV_CONFIG.apiBase}/health`, {
      method: 'GET',
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    console.warn('Arkiv API health check failed:', error);
    return false;
  }
}

/**
 * Get Arkiv API status and configuration
 * Useful for debugging and UI display
 */
export function getArkivStatus() {
  return {
    apiBase: ARKIV_CONFIG.apiBase,
    endpoints: ARKIV_CONFIG.endpoints,
    chainId: ARKIV_CONFIG.chainId,
    explorerUrl: ARKIV_CONFIG.explorerUrl,
    useMock: ARKIV_CONFIG.useMock,
  };
}

