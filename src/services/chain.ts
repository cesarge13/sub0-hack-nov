/**
 * Blockchain Service - Attestation Contract Interface
 * 
 * Provides functions for interacting with the Attestation smart contract.
 * 
 * TODO: Deploy actual smart contract and update with real ABI and address.
 * 
 * Contract Interface (expected):
 * - function attestEvent(
 *     string memory assetId,
 *     string memory eventId,
 *     string memory cidManifest,
 *     bytes32 fileSha256,
 *     uint256 ttlDays
 *   ) external returns (bytes32 attestationId)
 */

import { logger } from '../utils/logger';
import { mendozaNetwork } from '../config/wagmi';

/**
 * Attestation Contract ABI (Mock - TODO: Replace with actual contract ABI)
 */
export const ATTESTATION_CONTRACT_ABI = [
  {
    name: 'attestEvent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assetId', type: 'string', internalType: 'string' },
      { name: 'eventId', type: 'string', internalType: 'string' },
      { name: 'cidManifest', type: 'string', internalType: 'string' },
      { name: 'fileSha256', type: 'bytes32', internalType: 'bytes32' },
      { name: 'ttlDays', type: 'uint256', internalType: 'uint256' }
    ],
    outputs: [
      { name: 'attestationId', type: 'bytes32', internalType: 'bytes32' }
    ]
  },
  {
    name: 'getAttestation',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'attestationId', type: 'bytes32', internalType: 'bytes32' }
    ],
    outputs: [
      { name: 'assetId', type: 'string', internalType: 'string' },
      { name: 'eventId', type: 'string', internalType: 'string' },
      { name: 'cidManifest', type: 'string', internalType: 'string' },
      { name: 'fileSha256', type: 'bytes32', internalType: 'bytes32' },
      { name: 'ttlDays', type: 'uint256', internalType: 'uint256' },
      { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
      { name: 'issuer', type: 'address', internalType: 'address' }
    ]
  }
] as const;

/**
 * Mock Attestation Contract Address
 * 
 * TODO: Replace with actual deployed contract address on Mendoza Network
 * 
 * To deploy contract:
 * 1. Write Solidity contract with attestEvent function
 * 2. Compile and deploy to Mendoza Network
 * 3. Update this address with the deployed contract address
 */
export const ATTESTATION_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Interface for attestation function parameters
 */
export interface AttestEventParams {
  assetId: string;
  eventId: string;
  cidManifest: string;
  fileSha256: string; // Hex string (0x...)
  ttlDays: number;
}

/**
 * Result of attestation transaction
 */
export interface AttestationResult {
  txHash: string;
  attestationId?: string; // If contract returns attestationId
  blockNumber?: number;
}

/**
 * Validates attestation parameters
 */
export function validateAttestParams(params: AttestEventParams): void {
  if (!params.assetId || params.assetId.trim() === '') {
    throw new Error('assetId is required');
  }
  if (!params.eventId || params.eventId.trim() === '') {
    throw new Error('eventId is required');
  }
  if (!params.cidManifest || params.cidManifest.trim() === '') {
    throw new Error('cidManifest is required');
  }
  if (!params.fileSha256 || params.fileSha256.trim() === '') {
    throw new Error('fileSha256 is required');
  }
  if (params.ttlDays <= 0 || params.ttlDays > 3650) {
    throw new Error('ttlDays must be between 1 and 3650');
  }
  
  // Validate fileSha256 format (should be hex string, 64 chars + 0x prefix = 66 chars)
  const sha256Regex = /^0x[a-fA-F0-9]{64}$/;
  if (!sha256Regex.test(params.fileSha256)) {
    throw new Error('fileSha256 must be a valid hex string (0x + 64 hex characters)');
  }
}

/**
 * Converts a hex string SHA-256 hash to bytes32 format
 * 
 * @param hexHash - Hex string (with or without 0x prefix)
 * @returns bytes32 formatted hash
 */
export function sha256ToBytes32(hexHash: string): `0x${string}` {
  // Remove 0x prefix if present
  const cleanHash = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  
  // Ensure it's exactly 64 hex characters
  if (cleanHash.length !== 64) {
    throw new Error(`Invalid SHA-256 hash length: expected 64 characters, got ${cleanHash.length}`);
  }
  
  // Validate hex characters
  if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
    throw new Error('Invalid hex characters in SHA-256 hash');
  }
  
  return `0x${cleanHash}` as `0x${string}`;
}

/**
 * Checks if the attestation contract is configured
 * 
 * @returns true if contract address is set (not zero address)
 */
export function isContractConfigured(): boolean {
  return ATTESTATION_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
}

/**
 * Gets the explorer URL for a transaction
 * 
 * @param txHash - Transaction hash
 * @returns Explorer URL
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${mendozaNetwork.blockExplorers.default.url}/tx/${txHash}`;
}

