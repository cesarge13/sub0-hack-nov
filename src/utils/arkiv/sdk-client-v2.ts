/**
 * Arkiv SDK Client V2 - Implementación con SDK Oficial @arkiv-network/sdk
 * 
 * Esta es la implementación usando el SDK oficial moderno de Arkiv (@arkiv-network/sdk).
 * Basado en la documentación oficial: https://arkiv.network/docs#sdk
 * 
 * El SDK oficial usa viem y soporta MetaMask directamente.
 */

import { createWalletClient, createPublicClient, http, custom } from '@arkiv-network/sdk';
import { toAccount } from '@arkiv-network/sdk/accounts';
import { mendoza } from '@arkiv-network/sdk/chains';
import { ExpirationTime } from '@arkiv-network/sdk/utils';
import { ARKIV_CONFIG } from './config';
import { logger } from '../logger';
import type { ArkivMetadata } from './client';
import type { Address } from 'viem';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

let walletClient: any = null;
let publicClient: any = null;

/**
 * Obtiene o crea el cliente de escritura usando MetaMask
 */
async function getWalletClient() {
  if (!walletClient) {
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found. Please install MetaMask.');
    }

    logger.arkiv('Creating Arkiv wallet client v2 with MetaMask...');
    
    // Verificar que la cuenta esté conectada
    let accounts: string[] = [];
    try {
      accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      logger.arkiv('Current accounts', { count: accounts.length, firstAccount: accounts[0]?.substring(0, 10) });
    } catch (error) {
      logger.error('Failed to get accounts', error, 'ARKIV');
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      logger.arkiv('No accounts connected, requesting connection...');
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Obtener las cuentas de nuevo después de conectar
        accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        logger.arkiv('Accounts after request', { count: accounts.length, firstAccount: accounts[0]?.substring(0, 10) });
        if (!accounts || accounts.length === 0) {
          throw new Error('No account connected after request');
        }
      } catch (error) {
        logger.error('Failed to request accounts', error, 'ARKIV');
        throw error;
      }
    }

    // Verificar que estemos en la red correcta
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const expectedChainId = `0x${ARKIV_CONFIG.chainId.toString(16)}`;
      logger.arkiv('Chain ID check', { current: chainId, expected: expectedChainId });
      
      if (chainId !== expectedChainId) {
        logger.arkiv(`Chain ID mismatch. Expected: ${expectedChainId}, Got: ${chainId}. Attempting to switch...`);
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
          logger.arkiv('Successfully switched to Mendoza network');
        } catch (switchError: any) {
          // Si la red no existe, intentar agregarla
          if (switchError.code === 4902) {
            logger.arkiv('Network not found, adding Mendoza network...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: expectedChainId,
                chainName: 'Mendoza Network',
                rpcUrls: [ARKIV_CONFIG.mendozaRPC],
              }],
            });
            logger.arkiv('Mendoza network added successfully');
          } else {
            logger.error('Failed to switch network', switchError, 'ARKIV');
            throw switchError;
          }
        }
      }
    } catch (error) {
      logger.error('Failed to verify or switch network', error, 'ARKIV');
      // Continuar de todas formas, el SDK podría manejar esto
    }

    // Crear wallet client usando custom transport con window.ethereum
    // El SDK requiere que client.account esté disponible, así que creamos la cuenta explícitamente
    try {
      const accountAddress = accounts[0] as Address;
      logger.arkiv('Creating wallet client with account', { 
        account: accountAddress.substring(0, 10) + '...',
        chain: mendoza.name,
        chainId: mendoza.id,
        hasEthereum: !!window.ethereum,
        isMetaMask: !!window.ethereum?.isMetaMask
      });
      
      // Crear una cuenta JsonRpcAccount desde la dirección de MetaMask
      // Esto permite que el SDK acceda a client.account
      const account = toAccount(accountAddress);
      
      walletClient = createWalletClient({
        chain: mendoza,
        transport: custom(window.ethereum),
        account: account, // Especificar la cuenta explícitamente para que el SDK la pueda usar
      });
      
      logger.arkiv('Arkiv wallet client v2 created successfully', {
        chain: mendoza.name,
        chainId: mendoza.id,
        account: accountAddress.substring(0, 10) + '...',
        accountType: account.type
      });
    } catch (error: any) {
      const errorDetails = {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack',
        name: error?.name,
        code: error?.code
      };
      logger.error('Failed to create wallet client', errorDetails, 'ARKIV');
      throw error;
    }
  }
  return walletClient;
}

/**
 * Obtiene o crea el cliente de solo lectura
 */
function getPublicClient() {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: mendoza,
      transport: http(ARKIV_CONFIG.mendozaRPC),
    });
  }
  return publicClient;
}

/**
 * Sube un blob encriptado con metadata usando el SDK oficial moderno
 * 
 * @param encryptedBlob - ArrayBuffer con datos encriptados
 * @param metadata - Metadata del documento
 * @returns Promise con el entityKey (CID)
 */
export async function putBlobWithSDKV2(
  encryptedBlob: ArrayBuffer,
  metadata: ArkivMetadata
): Promise<{ entityKey: string; receipt: any }> {
  try {
    logger.arkiv('Getting Arkiv SDK v2 wallet client...');
    const client = await getWalletClient();
    
    const blobSize = encryptedBlob.byteLength;
    logger.arkiv('Preparing to upload blob', { 
      size: `${(blobSize / 1024).toFixed(2)} KB`,
      fileName: metadata.fileName 
    });
    
    // Convertir ArrayBuffer a Uint8Array para el payload
    const payload = new Uint8Array(encryptedBlob);
    
    // Crear attributes desde metadata
    const attributes = [
      { key: 'hash', value: metadata.hash },
      { key: 'signature', value: metadata.signature },
      { key: 'signer', value: metadata.signer },
      { key: 'objectID', value: metadata.objectID },
    ];
    
    if (metadata.fileName) {
      attributes.push({ key: 'fileName', value: metadata.fileName });
    }
    if (metadata.mimeType) {
      attributes.push({ key: 'mimeType', value: metadata.mimeType });
    }
    if (metadata.timestamp) {
      attributes.push({ key: 'timestamp', value: metadata.timestamp.toString() });
    }
    if (metadata.fileSize) {
      attributes.push({ key: 'fileSize', value: metadata.fileSize.toString() });
    }
    
    logger.arkiv('Creating entity with SDK v2...', {
      payloadSize: payload.length,
      attributesCount: attributes.length,
      attributes: attributes.map(a => ({ key: a.key, valueLength: a.value.length }))
    });
    
    // Crear entidad usando el SDK oficial
    logger.arkiv('Calling client.createEntity...');
    const result = await client.createEntity({
      payload: payload,
      contentType: 'application/octet-stream',
      attributes: attributes,
      expiresIn: ExpirationTime.fromDays(365),
    });
    
    logger.arkiv('Entity created successfully', { 
      entityKey: result.entityKey, 
      txHash: result.txHash,
      hasEntityKey: !!result.entityKey,
      hasTxHash: !!result.txHash
    });
    
    return {
      entityKey: result.entityKey,
      receipt: { entityKey: result.entityKey, txHash: result.txHash }
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    const errorDetails = {
      message: errorMessage,
      stack: errorStack.substring(0, 500),
      name: error?.name,
      code: error?.code,
      data: error?.data
    };
    
    logger.error('Failed to upload blob with SDK v2', errorDetails, 'ARKIV');
    logger.arkiv('SDK v2 error details', errorDetails);
    
    // Re-lanzar con más contexto
    throw new Error(`Failed to upload blob with SDK v2: ${errorMessage}`);
  }
}

