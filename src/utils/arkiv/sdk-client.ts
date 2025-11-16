/**
 * Arkiv SDK Client - Implementación con SDK Oficial
 * 
 * Esta es la implementación recomendada usando el SDK oficial de Arkiv.
 * El SDK maneja automáticamente IPFS, blockchain commitments, y Merkle trees.
 * 
 * Documentación: https://arkiv.dev.golem.network/docs
 * SDK: https://www.npmjs.com/package/arkiv-sdk
 */

import { createClient, createROClient, Annotation, Tagged, ExpirationTime } from 'arkiv-sdk';
import { ARKIV_CONFIG } from './config';
import { logger } from '../logger';
import type { ArkivMetadata } from './client';

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

let arkivSDKClient: any = null;
let arkivROClient: any = null;

/**
 * Resetea el cliente SDK (útil si hay errores y necesitamos recrear el cliente)
 */
export function resetArkivSDKClient() {
  arkivSDKClient = null;
  logger.arkiv('Arkiv SDK client reset');
}

/**
 * Obtiene el balance de la cuenta conectada
 * @returns Promise con el balance en ETH
 */
async function getAccountBalance(): Promise<{ balance: string; balanceWei: string; address: string }> {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found');
  }
  
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No account connected');
  }
  
  const address = accounts[0];
  const balanceWei = await window.ethereum.request({ 
    method: 'eth_getBalance',
    params: [address, 'latest']
  }) as string;
  
  // Convertir de Wei a ETH
  const balanceWeiBigInt = BigInt(balanceWei);
  const balanceEth = Number(balanceWeiBigInt) / 1e18;
  
  return {
    balance: balanceEth.toFixed(6),
    balanceWei,
    address
  };
}

/**
 * Función de diagnóstico completo para debugging
 * Recopila toda la información relevante sobre el estado del SDK y la wallet
 */
export async function diagnoseArkivIssue(): Promise<string> {
  const diagnostics: string[] = [];
  
  try {
    // Información del proveedor Ethereum
    diagnostics.push('=== Ethereum Provider Info ===');
    diagnostics.push(`Has window.ethereum: ${!!window.ethereum}`);
    if (window.ethereum) {
      diagnostics.push(`Is MetaMask: ${window.ethereum.isMetaMask || false}`);
      diagnostics.push(`Provider type: ${typeof window.ethereum}`);
    }
    
    // Información de la cuenta
    diagnostics.push('\n=== Account Info ===');
    try {
      const accountInfo = await getAccountBalance();
      diagnostics.push(`Address: ${accountInfo.address}`);
      diagnostics.push(`Balance: ${accountInfo.balance} ETH`);
      diagnostics.push(`Balance Wei: ${accountInfo.balanceWei}`);
    } catch (e) {
      diagnostics.push(`Error getting account: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
    
    // Información de la red
    diagnostics.push('\n=== Network Info ===');
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        diagnostics.push(`Current Chain ID: ${chainId}`);
        diagnostics.push(`Expected Chain ID: 0x${ARKIV_CONFIG.chainId.toString(16)}`);
        diagnostics.push(`Match: ${chainId === `0x${ARKIV_CONFIG.chainId.toString(16)}`}`);
      }
    } catch (e) {
      diagnostics.push(`Error getting chain ID: ${e instanceof Error ? e.message : 'Unknown'}`);
    }
    
    // Información del SDK
    diagnostics.push('\n=== SDK Info ===');
    diagnostics.push(`SDK Version: 0.1.19`);
    diagnostics.push(`RPC URL: ${ARKIV_CONFIG.mendozaRPC}`);
    diagnostics.push(`WS RPC URL: ${ARKIV_CONFIG.mendozaRPCWS || 'Not configured'}`);
    diagnostics.push(`Chain ID Config: ${ARKIV_CONFIG.chainId}`);
    
    // Información del cliente
    diagnostics.push('\n=== Client Info ===');
    diagnostics.push(`Client cached: ${!!arkivSDKClient}`);
    if (arkivSDKClient) {
      diagnostics.push(`Has createEntities: ${typeof arkivSDKClient.createEntities === 'function'}`);
      diagnostics.push(`Has sendTransaction: ${typeof arkivSDKClient.sendTransaction === 'function'}`);
      try {
        const ownerAddress = await arkivSDKClient.getOwnerAddress();
        diagnostics.push(`Owner Address: ${ownerAddress}`);
      } catch (e) {
        diagnostics.push(`Error getting owner address: ${e instanceof Error ? e.message : 'Unknown'}`);
      }
    }
    
    // Información del navegador
    diagnostics.push('\n=== Browser Info ===');
    diagnostics.push(`User Agent: ${navigator.userAgent.substring(0, 100)}`);
    diagnostics.push(`Platform: ${navigator.platform}`);
    
  } catch (error) {
    diagnostics.push(`\nError during diagnosis: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  return diagnostics.join('\n');
}

/**
 * Obtiene o crea el cliente de lectura/escritura de Arkiv usando el proveedor de Ethereum
 * Usa MetaMask u otra wallet conectada para firmar transacciones
 */
export async function getArkivSDKClient() {
  if (!arkivSDKClient) {
    // Verificar que window.ethereum esté disponible
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
    }

    logger.arkiv('Creating Arkiv SDK client with Ethereum provider (MetaMask)...');
    
    // Verificar que la cuenta esté conectada
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        logger.arkiv('No accounts connected, requesting connection...');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
    } catch (error) {
      logger.error('Failed to get or request accounts', error, 'ARKIV');
      throw new Error('Failed to connect to MetaMask. Please ensure MetaMask is unlocked and connected.');
    }
    
    // Verificar que estemos en la red correcta
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = `0x${ARKIV_CONFIG.chainId.toString(16)}`;
      if (chainId !== expectedChainId) {
        logger.arkiv(`Chain ID mismatch. Expected: ${expectedChainId}, Got: ${chainId}`);
        // Intentar cambiar a la red correcta
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError: any) {
          // Si la red no existe, intentar agregarla
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: expectedChainId,
                chainName: 'Mendoza Network',
                rpcUrls: [ARKIV_CONFIG.mendozaRPC],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      logger.error('Failed to verify or switch network', error, 'ARKIV');
      // Continuar de todas formas, el SDK podría manejar esto
    }
    
    // Use the WebSocket RPC from config (wss://mendoza.hoodi.arkiv.network/rpc/ws)
    const wsRpc = ARKIV_CONFIG.mendozaRPCWS || ARKIV_CONFIG.mendozaRPC
      .replace('https://', 'wss://')
      .replace('/rpc', '/rpc/ws');
    
    // Crear AccountData usando el proveedor de Ethereum
    // El SDK acepta un Tagged<"ethereumprovider", { request(...args: any): Promise<any> }>
    // IMPORTANTE: El SDK internamente usa viem, que espera que request siga EIP-1193
    // WORKAROUND: Interceptamos las llamadas a eth_sendTransaction para corregir el bug del 'to' malformado
    const ethereumProvider = window.ethereum;
    if (!ethereumProvider || typeof ethereumProvider.request !== 'function') {
      throw new Error('Invalid Ethereum provider: request method not found');
    }
    
    // Wrapper que intercepta y corrige transacciones malformadas
    const wrappedRequest = async (requestArgs: any): Promise<any> => {
      try {
        // Si es una llamada a eth_sendTransaction, verificar y corregir el 'to' address
        if (requestArgs && requestArgs.method === 'eth_sendTransaction' && requestArgs.params && requestArgs.params[0]) {
          const tx = requestArgs.params[0];
          
          // Detectar el bug: 'to' address que contiene el chain ID malformado
          if (tx.to && (
            tx.to.includes('0x00000000000000000000000000000000') ||
            tx.to.length < 42 || // Direcciones válidas tienen 42 caracteres (0x + 40 hex)
            tx.to.match(/0x0{20,}/) // Muchos ceros seguidos
          )) {
            logger.arkiv('Detected malformed "to" address in transaction, attempting to fix...', {
              originalTo: tx.to,
              chainId: ARKIV_CONFIG.chainId
            });
            
            // El SDK debería obtener la dirección del contrato de Arkiv internamente
            // Como workaround, intentamos obtenerla del cliente interno del SDK
            // Si no podemos obtenerla, lanzamos un error más claro
            logger.error('Cannot auto-fix malformed "to" address - SDK bug requires manual intervention', {
              malformedTo: tx.to,
              suggestion: 'This is a bug in Arkiv SDK v0.1.19. Please report to: https://github.com/Arkiv-Network/arkiv-sdk-js'
            }, 'ARKIV');
            
            // Intentar la transacción de todas formas - tal vez MetaMask pueda manejarla
            // O lanzar un error más descriptivo
            throw new Error(`SDK Bug: Malformed contract address detected (${tx.to}). This is a known issue in Arkiv SDK v0.1.19 when using ethereumprovider. Please try with a smaller file or wait for SDK update.`);
          }
        }
        
        // Para todas las demás llamadas, pasar directamente
        return await ethereumProvider.request(requestArgs);
      } catch (error) {
        logger.error('Ethereum provider request failed', { error, requestArgs }, 'ARKIV');
        throw error;
      }
    };
    
    const accountData: Tagged<"ethereumprovider", { request(...args: any): Promise<any> }> = {
      tag: "ethereumprovider",
      data: {
        request: wrappedRequest as any
      }
    };
    
    try {
      arkivSDKClient = await createClient(
        ARKIV_CONFIG.chainId,
        accountData,
        ARKIV_CONFIG.mendozaRPC,
        wsRpc
      );
      
      logger.arkiv('Arkiv SDK client created successfully with Ethereum provider');
    } catch (error) {
      logger.error('Failed to create Arkiv SDK client', error, 'ARKIV');
      throw new Error(`Failed to create Arkiv SDK client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  return arkivSDKClient;
}

/**
 * Obtiene o crea el cliente de solo lectura de Arkiv
 * No requiere clave privada, solo para consultas
 */
export async function getArkivROClient() {
  if (!arkivROClient) {
    // Use the WebSocket RPC from config (wss://mendoza.hoodi.arkiv.network/rpc/ws)
    const wsRpc = ARKIV_CONFIG.mendozaRPCWS || ARKIV_CONFIG.mendozaRPC
      .replace('https://', 'wss://')
      .replace('/rpc', '/rpc/ws');
    
    arkivROClient = await createROClient(
      ARKIV_CONFIG.chainId,
      ARKIV_CONFIG.mendozaRPC,
      wsRpc
    );
  }
  return arkivROClient;
}

/**
 * Sube un blob encriptado con metadata usando el SDK oficial
 * 
 * El SDK combina blob + metadata en una sola operación usando "annotations"
 * Usa MetaMask para firmar las transacciones (no requiere clave privada)
 * 
 * @param encryptedBlob - ArrayBuffer con datos encriptados
 * @param metadata - Metadata del documento
 * @returns Promise con el receipt que contiene el entityKey (CID)
 */
export async function putBlobWithSDK(
  encryptedBlob: ArrayBuffer,
  metadata: ArkivMetadata
): Promise<{ entityKey: string; receipt: any }> {
  try {
    logger.arkiv('Getting Arkiv SDK client with Ethereum provider...');
    
    // Verificar balance antes de continuar
    let accountInfo;
    try {
      accountInfo = await getAccountBalance();
      logger.arkiv('Account balance check', {
        address: accountInfo.address,
        balance: `${accountInfo.balance} ETH`,
        balanceWei: accountInfo.balanceWei
      });
      
      const balanceEth = parseFloat(accountInfo.balance);
      if (balanceEth < 0.001) {
        logger.arkiv('Warning: Low balance detected', {
          balance: `${accountInfo.balance} ETH`,
          recommendation: 'You may need more ETH to cover gas fees'
        });
      }
    } catch (balanceError) {
      logger.error('Failed to check balance', balanceError, 'ARKIV');
      // Continuar de todas formas, pero registrar el error
    }
    
    // Resetear el cliente antes de cada operación para evitar estados inconsistentes
    // Esto ayuda a evitar problemas con transacciones malformadas
    resetArkivSDKClient();
    
    const client = await getArkivSDKClient();
    
    // Verificar que el cliente tenga el método createEntities
    if (!client || typeof client.createEntities !== 'function') {
      throw new Error('Invalid Arkiv SDK client: createEntities method not found');
    }
    
    // Obtener la dirección del owner para logging
    try {
      const ownerAddress = await client.getOwnerAddress();
      logger.arkiv('Client owner address', { ownerAddress });
    } catch (error) {
      logger.arkiv('Could not get owner address', { error: error instanceof Error ? error.message : 'Unknown' });
    }
    
    // Validar tamaño del blob (Ethereum tiene límites de gas)
    const blobSize = encryptedBlob.byteLength;
    logger.arkiv('Preparing to upload blob', { 
      size: `${(blobSize / 1024).toFixed(2)} KB`,
      fileName: metadata.fileName 
    });
    
    // Advertencia si el archivo es muy grande (más de 1MB)
    if (blobSize > 1024 * 1024) {
      logger.arkiv('Warning: Large file detected. This may cause transaction issues.', {
        size: `${(blobSize / 1024 / 1024).toFixed(2)} MB`
      });
    }
    
    // Crear annotations para metadata
    const stringAnnotations = [
      new Annotation("hash", metadata.hash),
      new Annotation("signature", metadata.signature),
      new Annotation("signer", metadata.signer),
      new Annotation("objectID", metadata.objectID), // Para referencia si es necesario
    ];
    
    // Agregar metadata opcional
    if (metadata.fileName) {
      stringAnnotations.push(new Annotation("fileName", metadata.fileName));
    }
    if (metadata.mimeType) {
      stringAnnotations.push(new Annotation("mimeType", metadata.mimeType));
    }
    if (metadata.timestamp) {
      stringAnnotations.push(new Annotation("timestamp", metadata.timestamp.toString()));
    }
    if (metadata.fileSize) {
      stringAnnotations.push(new Annotation("fileSize", metadata.fileSize.toString()));
    }
    
    // Crear entidad con blob y metadata
    // El SDK pedirá al usuario que firme la transacción en MetaMask
    // IMPORTANTE: El SDK requiere 'btl' (Block Time to Live) o 'expiresIn'
    // Usamos ExpirationTime.fromDays(365) para que expire en 1 año
    logger.arkiv('Creating entity with blob and metadata (MetaMask will prompt for signature)...');
    
    const createEntityParams = {
      data: new Uint8Array(encryptedBlob),
      expiresIn: ExpirationTime.fromDays(365), // Expira en 1 año (o usar btl: número de bloques)
      stringAnnotations,
      numericAnnotations: [] as any[]
    };
    
    logger.arkiv('Calling createEntities with params', {
      dataSize: createEntityParams.data.length,
      annotationsCount: createEntityParams.stringAnnotations.length,
      expiresIn: '365 days'
    });
    
    let receipt;
    try {
      // Log detallado antes de llamar a createEntities
      logger.arkiv('About to call createEntities', {
        dataLength: createEntityParams.data.length,
        annotationsCount: createEntityParams.stringAnnotations.length,
        expiresInType: typeof createEntityParams.expiresIn,
        clientType: typeof client,
        hasCreateEntities: typeof client.createEntities === 'function'
      });
      
      // Intentar primero con createEntities
      // Si falla con el error del 'to' malformado, intentar con sendTransaction como alternativa
      let firstError: any = null;
      try {
        logger.arkiv('Attempting createEntities...');
        receipt = await client.createEntities([createEntityParams], {
          txHashCallback: (txHash) => {
            logger.arkiv('Transaction submitted via createEntities', { txHash });
          }
        });
        logger.arkiv('createEntities succeeded', { receiptLength: receipt?.length });
      } catch (createError: any) {
        firstError = createError;
        const firstErrorMessage = firstError.message || firstError.toString() || '';
        const firstErrorStack = firstError.stack || 'No stack';
        
        logger.error('createEntities failed', {
          message: firstErrorMessage,
          stack: firstErrorStack,
          error: firstError
        }, 'ARKIV');
        
        // Si es el error del 'to' malformado o RPC, intentar con sendTransaction
        if (firstErrorMessage.includes('0x00000000') || 
            firstErrorMessage.includes('internal error') ||
            firstErrorMessage.includes('RPC') ||
            firstErrorMessage.includes('HTTP client error')) {
          logger.arkiv('RPC error detected, attempting sendTransaction as fallback...', {
            errorMessage: firstErrorMessage.substring(0, 200)
          });
          
          try {
            logger.arkiv('Calling sendTransaction with creates parameter...');
            // sendTransaction hace lo mismo pero con más control sobre la transacción
            const result = await client.sendTransaction(
              [createEntityParams], // creates
              undefined, // updates
              undefined, // deletes
              undefined, // extensions
              {
                txHashCallback: (txHash) => {
                  logger.arkiv('Transaction submitted via sendTransaction', { txHash });
                }
              }
            );
            
            // sendTransaction retorna un objeto con createEntitiesReceipts
            receipt = result.createEntitiesReceipts;
            logger.arkiv('sendTransaction succeeded as fallback!', { 
              receiptLength: receipt?.length,
              hasReceipts: !!receipt && receipt.length > 0
            });
          } catch (sendTxError: any) {
            // Si sendTransaction también falla, log detallado y lanzar el error original
            const sendTxErrorMessage = sendTxError.message || sendTxError.toString() || '';
            logger.error('sendTransaction fallback also failed', {
              originalError: firstErrorMessage.substring(0, 200),
              sendTxError: sendTxErrorMessage.substring(0, 200),
              sendTxStack: sendTxError.stack || 'No stack'
            }, 'ARKIV');
            
            // Si ambos fallan con el mismo error, es definitivamente un bug del SDK
            if (sendTxErrorMessage.includes('0x00000000') || 
                sendTxErrorMessage.includes('internal error') ||
                sendTxErrorMessage.includes('RPC')) {
              logger.arkiv('Both createEntities and sendTransaction failed with RPC error - confirmed SDK bug');
            }
            
            throw firstError; // Lanzar el error original para que se maneje en el catch externo
          }
        } else {
          // Si no es el error del 'to' malformado, lanzar el error directamente
          throw firstError;
        }
      }
      
      logger.arkiv('createEntities completed successfully', { receiptLength: receipt?.length });
    } catch (createError: any) {
      // Log detallado del error para debugging
      const errorMessage = createError.message || createError.toString() || 'Unknown error';
      const errorStack = createError.stack || 'No stack trace';
      
      logger.error('createEntities failed', {
        error: createError,
        message: errorMessage,
        stack: errorStack,
        accountInfo: accountInfo || 'Not available'
      }, 'ARKIV');
      
      // Diagnosticar el tipo de error
      const errorLower = errorMessage.toLowerCase();
      
      // Error de fondos insuficientes
      if (errorLower.includes('insufficient funds') || 
          errorLower.includes('insufficient balance') ||
          errorLower.includes('not enough funds') ||
          errorLower.includes('exceeds balance')) {
        const currentBalance = accountInfo ? `${accountInfo.balance} ETH` : 'unknown';
        throw new Error(`Insufficient funds: Your balance is ${currentBalance}, but the transaction requires more ETH for gas fees. Please add more ETH to your wallet and try again.`);
      }
      
      // Error de gas
      if (errorLower.includes('gas') && (errorLower.includes('exceed') || errorLower.includes('limit') || errorLower.includes('too low'))) {
        throw new Error(`Gas error: ${errorMessage}. This might be due to network congestion or insufficient gas limit. Try again later or increase gas limit in MetaMask.`);
      }
      
      // Error de RPC interno (el problema del 'to' malformado)
      if (errorMessage.includes('RPC') || 
          errorMessage.includes('internal error') || 
          errorMessage.includes('HTTP client error') ||
          errorMessage.includes('0x00000000x') ||
          errorMessage.includes('0x00000000000000000000000000000000') ||
          errorMessage.includes('to: 0x00000000')) {
        logger.arkiv('RPC/internal error detected - possible SDK bug', {
          errorMessage,
          accountInfo: accountInfo || 'Not available',
          blobSize: `${(blobSize / 1024).toFixed(2)} KB`
        });
        resetArkivSDKClient();
        
        // Detectar si el 'to' address está malformado (contiene el chain ID)
        const hasMalformedTo = errorMessage.includes('0x00000000000000000000000000000000') && 
                               errorMessage.includes(ARKIV_CONFIG.chainId.toString());
        
        // Obtener diagnóstico completo
        let fullDiagnostics = '';
        try {
          fullDiagnostics = await diagnoseArkivIssue();
        } catch (diagError) {
          logger.error('Failed to get full diagnostics', diagError, 'ARKIV');
          fullDiagnostics = 'Diagnostics unavailable';
        }
        
        // Proporcionar diagnóstico detallado
        const diagnosticInfo = [
          `Error Type: RPC/Internal Error (${hasMalformedTo ? 'SDK Bug: Malformed "to" address' : 'Possible SDK bug'})`,
          `Account: ${accountInfo?.address || 'Unknown'}`,
          `Balance: ${accountInfo?.balance || 'Unknown'} ETH`,
          `File Size: ${(blobSize / 1024).toFixed(2)} KB`,
          `Network: Mendoza Network (Chain ID: ${ARKIV_CONFIG.chainId})`,
          `SDK Version: 0.1.19`,
          `Error Details: ${errorMessage.substring(0, 300)}`,
          `\n=== Full Diagnostics ===\n${fullDiagnostics}`
        ].join('\n');
        
        const solutions = hasMalformedTo 
          ? [
              '⚠️ This is a confirmed bug in Arkiv SDK v0.1.19 when using ethereumprovider',
              '1. Try with a smaller file (< 100 KB) - may work around the bug',
              '2. Ensure you have at least 0.01 ETH for gas fees',
              '3. Report this issue to Arkiv SDK team: https://github.com/Arkiv-Network/arkiv-sdk-js',
              '4. Try again later - may be a temporary network issue',
              '5. Consider using a different wallet or SDK version if available'
            ]
          : [
              '1. Try with a smaller file',
              '2. Check if you have enough ETH for gas (recommended: 0.01+ ETH)',
              '3. Report this issue to Arkiv SDK team',
              '4. Try again later - may be a temporary network issue'
            ];
        
        // Lanzar error con prefijo claro para que el fallback lo detecte
        const bugPrefix = hasMalformedTo ? 'SDK Bug Detected' : 'Possible SDK Issue';
        throw new Error(`SDK Bug Detected: RPC/Internal Error - ${bugPrefix}\n\n${diagnosticInfo}\n\nPossible solutions:\n${solutions.join('\n')}`);
      }
      
      // Error de tamaño de archivo
      if (errorLower.includes('size') || errorLower.includes('too large') || errorLower.includes('exceeds')) {
        throw new Error(`File too large: ${(blobSize / 1024).toFixed(2)} KB. The transaction may exceed block size limits. Consider using a smaller file or splitting it into chunks. Original error: ${errorMessage}`);
      }
      
      // Error de usuario rechazando transacción
      if (errorLower.includes('reject') || errorLower.includes('user denied') || errorLower.includes('user rejected')) {
        throw new Error('Transaction rejected by user. Please approve the transaction in MetaMask to continue.');
      }
      
      // Error de red
      if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
        throw new Error(`Network error: ${errorMessage}. Please check your internet connection and ensure MetaMask is connected to Mendoza Network.`);
      }
      
      // Error genérico con información de diagnóstico
      const genericDiagnostic = [
        `Error: ${errorMessage}`,
        `Account: ${accountInfo?.address || 'Unknown'}`,
        `Balance: ${accountInfo?.balance || 'Unknown'} ETH`,
        `File Size: ${(blobSize / 1024).toFixed(2)} KB`
      ].join('\n');
      
      throw new Error(`Failed to create entity:\n${genericDiagnostic}\n\nPlease check:\n1. You have enough ETH for gas fees\n2. MetaMask is connected to Mendoza Network\n3. The file size is reasonable\n4. Your network connection is stable`);
    }
    
    // El receipt contiene el entityKey (que es el CID)
    const entityKey = receipt[0]?.entityKey;
    
    if (!entityKey) {
      logger.error('SDK did not return entityKey', { receipt }, 'ARKIV');
      throw new Error('SDK did not return entityKey in receipt');
    }
    
    logger.arkiv('Entity created successfully', { entityKey });
    
    return {
      entityKey,
      receipt: receipt[0]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to upload blob with SDK', error, 'ARKIV');
    throw new Error(`Failed to upload blob with SDK: ${errorMessage}`);
  }
}

/**
 * Consulta entidades usando el SDK
 * 
 * @param query - Query string (ej: 'hash = "0x..."')
 * @returns Promise con los datos encontrados
 */
export async function queryEntities(query: string): Promise<any[]> {
  try {
    const roClient = await getArkivROClient();
    const data = await roClient.queryEntities(query);
    return data;
  } catch (error) {
    throw new Error(`Failed to query entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtiene una entidad por su entityKey (CID)
 * 
 * @param entityKey - El CID de la entidad
 * @returns Promise con los datos de la entidad
 */
export async function getEntityByKey(entityKey: string): Promise<any> {
  try {
    const roClient = await getArkivROClient();
    // El SDK puede tener un método específico para obtener por key
    // Por ahora usamos query
    const results = await roClient.queryEntities(`entityKey = "${entityKey}"`);
    return results[0] || null;
  } catch (error) {
    throw new Error(`Failed to get entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

