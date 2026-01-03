/**
 * IPFS Service
 * 
 * Provides functions for uploading JSON manifests and files to IPFS.
 * Uses public IPFS gateways or configured IPFS service.
 */

import { logger } from '../utils/logger';

export interface IPFSUploadResult {
  cid: string;
  size?: number;
}

/**
 * Uploads a JSON object to IPFS
 * 
 * @param jsonData - JSON object to upload
 * @returns Promise resolving to CID
 */
export async function uploadJson(jsonData: Record<string, any>): Promise<string> {
  try {
    logger.debug('Uploading JSON to IPFS', {
      keys: Object.keys(jsonData),
      size: JSON.stringify(jsonData).length
    }, 'IPFS');

    const jsonString = JSON.stringify(jsonData);
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });
    const jsonBuffer = await jsonBlob.arrayBuffer();

    // Upload to IPFS service
    const cid = await uploadToPublicIPFS(jsonBuffer, 'application/json');
    logger.debug('JSON uploaded to IPFS', { cid }, 'IPFS');
    return cid;
  } catch (error) {
    logger.error('Failed to upload JSON to IPFS', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'IPFS');
    throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads a file to IPFS
 * 
 * @param file - File to upload
 * @returns Promise resolving to CID
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    logger.debug('Uploading file to IPFS', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    }, 'IPFS');

    const arrayBuffer = await file.arrayBuffer();

    // Upload to IPFS service
    const cid = await uploadToPublicIPFS(arrayBuffer, file.type);
    logger.debug('File uploaded to IPFS', { cid, fileName: file.name }, 'IPFS');
    return cid;
  } catch (error) {
    logger.error('Failed to upload file to IPFS', {
      fileName: file.name,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'IPFS');
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads data to a public IPFS gateway (placeholder implementation)
 * 
 * Note: This is a placeholder. In production, you should:
 * - Use a service like Pinata, Web3.Storage, or NFT.Storage
 * - Configure API keys in environment variables
 * - Handle authentication properly
 * 
 * @param data - ArrayBuffer to upload
 * @param mimeType - MIME type of the data
 * @returns Promise resolving to CID (mock for now)
 */
async function uploadToPublicIPFS(data: ArrayBuffer, mimeType: string): Promise<string> {
  // Placeholder implementation
  // In production, replace with actual IPFS service
  
  // For now, generate a mock CID
  // In real implementation, use Pinata, Web3.Storage, or similar
  const mockCid = `bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku${Date.now().toString(36)}`;
  
  logger.warn('Using mock IPFS CID (configure real IPFS service)', {
    mockCid,
    dataSize: data.byteLength,
    mimeType
  }, 'IPFS');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockCid;
}

/**
 * Validates if a CID is valid format
 * 
 * @param cid - CID to validate
 * @returns true if CID format is valid
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation (starts with 'Qm' for v0 or 'bafy' for v1)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56,})$/.test(cid);
}

