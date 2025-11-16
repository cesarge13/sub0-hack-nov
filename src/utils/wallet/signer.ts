/**
 * Wallet Utilities - ECDSA Signing
 * 
 * Provides functions for signing messages using the user's EVM wallet.
 * Uses ethers.js to interact with the wallet provider.
 */

import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { logger } from '../logger';

/**
 * Gets a signer instance from the connected wallet
 * @returns Promise resolving to JsonRpcSigner
 */
export async function getSigner(): Promise<JsonRpcSigner> {
  try {
    logger.wallet('Getting signer from wallet provider...');
    
    // Check if window.ethereum is available
    if (!window.ethereum) {
      logger.error('No Ethereum provider found', null, 'WALLET');
      throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
    }
    
    logger.wallet('Ethereum provider found', { 
      isMetaMask: window.ethereum.isMetaMask 
    });
    
    // Create a provider from window.ethereum
    const provider = new BrowserProvider(window.ethereum);
    logger.wallet('BrowserProvider created');
    
    // Request account access if needed
    logger.wallet('Requesting account access...');
    await provider.send('eth_requestAccounts', []);
    logger.wallet('Account access granted');
    
    // Get the signer
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    logger.wallet('Signer obtained', { address });
    
    return signer;
  } catch (error) {
    logger.error('Failed to get signer', error, 'WALLET');
    throw new Error(`Failed to get signer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Signs a message hash using the user's wallet
 * @param hash - Hex string of the hash to sign
 * @returns Promise resolving to the signature string
 */
export async function signHash(hash: string): Promise<string> {
  try {
    logger.wallet('Starting hash signing', { 
      hash: hash.substring(0, 20) + '...',
      hashLength: hash.length 
    });
    
    const signer = await getSigner();
    
    // Convert hash to bytes if needed (ethers expects hex string)
    // Ensure hash is prefixed with 0x
    const hashWithPrefix = hash.startsWith('0x') ? hash : `0x${hash}`;
    
    logger.wallet('Prepared hash for signing', { 
      originalHash: hash.substring(0, 20) + '...',
      prefixedHash: hashWithPrefix.substring(0, 22) + '...'
    });
    
    logger.wallet('Requesting signature from wallet (user may need to approve)...');
    const signStartTime = performance.now();
    
    // Sign the hash - this will trigger MetaMask popup
    const signature = await signer.signMessage(hashWithPrefix);
    
    const signDuration = performance.now() - signStartTime;
    logger.wallet('Signature received from wallet', {
      signature: signature.substring(0, 30) + '...',
      signatureLength: signature.length,
      duration: `${signDuration.toFixed(2)}ms`
    });
    
    return signature;
  } catch (error) {
    logger.error('Failed to sign hash', {
      error: error instanceof Error ? error.message : 'Unknown error',
      hash: hash.substring(0, 20) + '...'
    }, 'WALLET');
    
    // Check if user rejected the signature
    if (error instanceof Error && error.message.includes('reject')) {
      throw new Error('Signature rejected by user');
    }
    
    throw new Error(`Failed to sign hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the address of the connected wallet
 * @returns Promise resolving to the wallet address
 */
export async function getWalletAddress(): Promise<string> {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    throw new Error(`Failed to get wallet address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Signs a message directly (for text messages)
 * @param message - Message string to sign
 * @returns Promise resolving to the signature string
 */
export async function signMessage(message: string): Promise<string> {
  try {
    const signer = await getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      send: (method: string, params?: unknown[]) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

