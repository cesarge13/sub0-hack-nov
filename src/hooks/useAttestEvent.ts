/**
 * Hook for attesting events on-chain using wagmi
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback, useState } from 'react';
import { 
  ATTESTATION_CONTRACT_ADDRESS, 
  ATTESTATION_CONTRACT_ABI,
  type AttestEventParams,
  validateAttestParams,
  sha256ToBytes32,
  isContractConfigured
} from '../services/chain';
import { logger } from '../utils/logger';

export interface UseAttestEventResult {
  attestEvent: (params: AttestEventParams) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash: string | undefined;
}

/**
 * Hook for attesting events on-chain
 * 
 * @returns Object with attestEvent function and transaction state
 */
export function useAttestEvent(): UseAttestEventResult {
  const { isConnected } = useAccount();
  const [error, setError] = useState<Error | null>(null);
  
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError
  } = useWriteContract();

  const {
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash
    }
  });

  const attestEvent = useCallback(async (params: AttestEventParams) => {
    setError(null);

    // Check wallet connection
    if (!isConnected) {
      const err = new Error('Wallet not connected. Please connect your wallet to attest on-chain.');
      setError(err);
      throw err;
    }

    // Check contract configuration
    if (!isContractConfigured()) {
      const err = new Error('Attestation contract not configured. Please deploy contract and update ATTESTATION_CONTRACT_ADDRESS.');
      logger.warn('Contract not configured', { contractAddress: ATTESTATION_CONTRACT_ADDRESS }, 'CHAIN');
      setError(err);
      throw err;
    }

    // Validate parameters
    try {
      validateAttestParams(params);
    } catch (validationError) {
      const err = validationError instanceof Error ? validationError : new Error('Invalid attestation parameters');
      setError(err);
      throw err;
    }

    // Convert fileSha256 to bytes32 format
    let fileSha256Bytes32: `0x${string}`;
    try {
      fileSha256Bytes32 = sha256ToBytes32(params.fileSha256);
    } catch (conversionError) {
      const err = conversionError instanceof Error ? conversionError : new Error('Failed to convert SHA-256 hash to bytes32');
      setError(err);
      throw err;
    }

    logger.debug('Attesting event on-chain', {
      assetId: params.assetId,
      eventId: params.eventId,
      cidManifest: params.cidManifest.substring(0, 20) + '...',
      ttlDays: params.ttlDays
    }, 'CHAIN');

    try {
      // Call the contract
      await writeContract({
        address: ATTESTATION_CONTRACT_ADDRESS,
        abi: ATTESTATION_CONTRACT_ABI,
        functionName: 'attestEvent',
        args: [
          params.assetId,
          params.eventId,
          params.cidManifest,
          fileSha256Bytes32,
          BigInt(params.ttlDays)
        ]
      });

      logger.debug('Attestation transaction sent', {
        assetId: params.assetId,
        eventId: params.eventId
      }, 'CHAIN');
    } catch (contractError) {
      const err = contractError instanceof Error ? contractError : new Error('Failed to write contract');
      logger.error('Contract write failed', {
        error: err.message,
        assetId: params.assetId,
        eventId: params.eventId
      }, 'CHAIN');
      setError(err);
      throw err;
    }
  }, [isConnected, writeContract]);

  // Determine final error state
  const finalError = error || writeError || receiptError;
  const finalIsError = isWriteError || isReceiptError || !!error;

  return {
    attestEvent,
    isLoading: isReceiptLoading,
    isPending: isWritePending || isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: finalIsError,
    error: finalError instanceof Error ? finalError : finalError ? new Error(String(finalError)) : null,
    txHash: hash
  };
}

