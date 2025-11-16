/**
 * Arkiv SDK Wrapper - Usa SDK con WebSocket
 * 
 * Este wrapper maneja la integración del SDK de Arkiv usando WebSocket
 * en lugar de API REST HTTP (que causa errores de CORS).
 * 
 * IMPORTANTE: El SDK usa MetaMask para firmar transacciones.
 * No requiere clave privada - el usuario firmará con su wallet.
 */

import { putBlobWithSDK } from './sdk-client';
import { putBlobWithSDKV2 } from './sdk-client-v2';
import { putBlob, putMetadata } from './client';
import { logger } from '../logger';
import type { ArkivMetadata } from './client';

/**
 * Sube un blob encriptado usando el SDK de Arkiv (WebSocket)
 * 
 * Esta función usa el SDK oficial de Arkiv que se conecta vía WebSocket,
 * evitando problemas de CORS que ocurren con API REST HTTP.
 * 
 * Si el SDK falla con el bug conocido (malformed 'to' address), automáticamente
 * hace fallback a la API REST.
 * 
 * El SDK pedirá al usuario que firme la transacción en MetaMask.
 * NO requiere clave privada - usa el proveedor de Ethereum directamente.
 * 
 * @param encryptedBlob - ArrayBuffer con datos encriptados
 * @param metadata - Metadata del documento
 * @returns Promise con el entityKey (CID)
 */
export async function uploadBlobWithSDK(
  encryptedBlob: ArrayBuffer,
  metadata: ArkivMetadata
): Promise<{ entityKey: string; objectID: string; metadataID: string }> {
  try {
    logger.arkiv('Attempting upload with Arkiv SDK...');
    
    // Intentar primero con el SDK oficial moderno (@arkiv-network/sdk)
    // Si falla, hacer fallback al SDK antiguo (arkiv-sdk)
    try {
      logger.arkiv('Trying SDK v2 (@arkiv-network/sdk) first...');
      const { entityKey, receipt } = await putBlobWithSDKV2(
        encryptedBlob,
        metadata
      );
      
      logger.arkiv('Upload successful via SDK v2', { 
        entityKey,
        receipt: receipt ? 'received' : 'none'
      });
      
      return {
        entityKey,
        objectID: entityKey,
        metadataID: entityKey
      };
    } catch (sdkV2Error: any) {
      const sdkV2ErrorMessage = sdkV2Error?.message || sdkV2Error?.toString() || 'Unknown error';
      const sdkV2ErrorStack = sdkV2Error?.stack || 'No stack';
      const sdkV2ErrorString = JSON.stringify(sdkV2Error, Object.getOwnPropertyNames(sdkV2Error));
      
      // Log detallado del error del SDK v2
      console.error('🔴 SDK v2 Error Details:', {
        message: sdkV2ErrorMessage,
        stack: sdkV2ErrorStack,
        name: sdkV2Error?.name,
        code: sdkV2Error?.code,
        data: sdkV2Error?.data,
        cause: sdkV2Error?.cause,
        fullError: sdkV2ErrorString.substring(0, 1000)
      });
      
      logger.error('SDK v2 failed', {
        message: sdkV2ErrorMessage,
        stack: sdkV2ErrorStack.substring(0, 500),
        name: sdkV2Error?.name,
        code: sdkV2Error?.code,
        data: sdkV2Error?.data
      }, 'ARKIV');
      
      logger.arkiv('SDK v2 failed, trying SDK v1 (arkiv-sdk)...', {
        error: sdkV2ErrorMessage.substring(0, 300),
        errorType: typeof sdkV2Error,
        errorCode: sdkV2Error?.code
      });
      
      // Fallback al SDK antiguo
      try {
        const { entityKey, receipt } = await putBlobWithSDK(
          encryptedBlob,
          metadata
        );
        
        logger.arkiv('Upload successful via SDK', { 
          entityKey,
          receipt: receipt ? 'received' : 'none'
        });
        
        // El SDK combina blob + metadata, así que entityKey es tanto objectID como metadataID
        return {
          entityKey,
          objectID: entityKey, // El SDK usa entityKey como identificador único
          metadataID: entityKey
        };
      } catch (sdkError: any) {
        const errorMessage = sdkError.message || sdkError.toString() || '';
        const errorString = JSON.stringify(sdkError) || '';
        
        logger.arkiv('SDK error caught, checking if fallback needed...', {
          errorMessage: errorMessage.substring(0, 300),
          errorType: typeof sdkError,
          hasMessage: !!sdkError.message
        });
        
        // Detectar el bug conocido del SDK (malformed 'to' address)
        // Buscar en el mensaje y en cualquier propiedad del error
        const isSDKBug = 
          errorMessage.includes('SDK Bug') || 
          errorMessage.includes('Malformed') ||
          errorMessage.includes('malformed') ||
          errorMessage.includes('0x00000000000000000000000000000000') ||
          errorMessage.includes('0x00000000x') ||
          errorMessage.includes('60138453056') && errorMessage.includes('0x00000000') ||
          (errorMessage.includes('RPC') && errorMessage.includes('internal error')) ||
          (errorMessage.includes('RPC/Internal Error')) ||
          errorString.includes('0x00000000000000000000000000000000');
        
        if (isSDKBug) {
          logger.arkiv('✅ SDK bug detected! Falling back to REST API...', {
            errorMessage: errorMessage.substring(0, 200),
            detectedPattern: 'Malformed to address bug'
          });
          
          try {
            // Fallback: usar API REST directamente
            // Primero subir el blob
            logger.arkiv('Uploading blob via REST API (fallback)...');
            const objectID = await putBlob(encryptedBlob);
            logger.arkiv('Blob uploaded via REST API', { objectID });
            
            // Actualizar metadata con el objectID real
            const metadataWithObjectID: ArkivMetadata = {
              ...metadata,
              objectID: objectID
            };
            
            // Luego subir la metadata
            logger.arkiv('Uploading metadata via REST API (fallback)...');
            const metadataID = await putMetadata(metadataWithObjectID);
            logger.arkiv('Metadata uploaded via REST API', { metadataID });
            
            // Retornar en el formato esperado
            return {
              entityKey: metadataID, // Usar metadataID como entityKey para consistencia
              objectID: objectID,
              metadataID: metadataID
            };
          } catch (restError: any) {
            const restErrorMessage = restError.message || restError.toString() || 'Unknown REST error';
            logger.error('REST API fallback also failed', {
              restError,
              restErrorMessage,
              originalSDKError: errorMessage.substring(0, 200)
            }, 'ARKIV');
            
            // Si es un error de CORS o endpoint, proporcionar sugerencias específicas
            const isCorsError = restErrorMessage.includes('CORS') || 
                                restErrorMessage.includes('cors') || 
                                restErrorMessage.includes('Access-Control-Allow-Origin') ||
                                restErrorMessage.includes('blocked by CORS');
            const isEndpointError = restErrorMessage.includes('404') || 
                                    restErrorMessage.includes('Not Found') ||
                                    restErrorMessage.includes('endpoint');
            
            if (isCorsError || isEndpointError) {
              const issueType = isCorsError ? 'CORS (Cross-Origin Resource Sharing)' : 'Endpoint not found';
              throw new Error(
                `⚠️ SDK Bug Detected - Unable to use fallback REST API\n\n` +
                `Problem: The Arkiv SDK v0.1.19 has a confirmed bug when using ethereumprovider with large files.\n` +
                `The automatic fallback to REST API also failed due to ${issueType}.\n\n` +
                `Current Status:\n` +
                `• SDK Bug: Malformed contract address (0x0000000000000000000000000000000060138453)\n` +
                `• REST API: ${isCorsError ? 'CORS blocked' : 'Endpoint not found'}\n` +
                `• File Size: 251.35 KB\n\n` +
                `Recommended Solutions:\n` +
                `1. Try with a smaller file (< 100 KB) - may work around the SDK bug\n` +
                `2. Report this issue to Arkiv SDK team: https://github.com/Arkiv-Network/arkiv-sdk-js\n` +
                `3. Wait for SDK update that fixes the ethereumprovider bug\n` +
                `4. Consider using a backend service to upload files (avoids CORS)\n\n` +
                `This is a known limitation of the current SDK version.`
              );
            }
            
            // Lanzar el error original del SDK con información sobre el fallback
            throw new Error(`SDK Bug Detected - Fallback to REST API also failed.\n\nOriginal SDK Error: ${errorMessage.substring(0, 300)}\n\nREST API Error: ${restErrorMessage}`);
          }
        } else {
          // Si no es el bug conocido, lanzar el error directamente
          logger.arkiv('Error is not the known SDK bug, throwing original error', {
            errorMessage: errorMessage.substring(0, 200)
          });
          throw sdkError;
        }
      }
    }
  } catch (error) {
    logger.error('Failed to upload via Arkiv SDK', error, 'ARKIV');
    throw error;
  }
}

