# 📊 Guía de Logging - Document Registration Flow

## ✅ Logger Implementado

Se ha creado un sistema de logging completo que registra todos los pasos del flujo de registro de documentos.

## 🔍 Cómo Ver los Logs

### En la Consola del Navegador

1. Abre las **Developer Tools** (F12 o Cmd+Option+I)
2. Ve a la pestaña **Console**
3. Verás logs detallados de cada paso

### Formato de los Logs

```
[2024-11-16T04:56:00.000Z] [INFO] [FLOW] Starting hash signing process { hash: '0x7a9c8b3e5f2d1a4b6e8c...' }
[2024-11-16T04:56:00.100Z] [DEBUG] [WALLET] Getting signer from wallet provider...
[2024-11-16T04:56:00.200Z] [DEBUG] [ENCRYPTION] Starting AES-256-GCM encryption { originalSize: '245.32 KB' }
```

## 📋 Logs por Componente

### 🔄 FLOW - Flujo Principal
- Inicio de cada paso
- Cambios de estado
- Completación de pasos
- Errores del flujo

### 🔐 ENCRYPTION - Encriptación
- Generación de clave AES-256
- Generación de nonce
- Proceso de encriptación
- Tiempos y tamaños
- Errores de encriptación

### 💼 WALLET - Wallet/Signing
- Conexión con wallet
- Obtención de dirección
- Proceso de firma
- Aprobación/rechazo del usuario
- Errores de wallet

### 🌐 ARKIV - Arkiv Network
- Upload de blobs
- Upload de metadata
- Respuestas de la API
- Errores de conexión

## 🐛 Debugging del Problema Actual

### Problema Reportado:
**Después de firmar con la wallet, el documento se queda cargando en el paso de encriptación.**

### Logs que Verás:

1. **Cuando se completa la firma:**
   ```
   [WALLET] Hash signed successfully { signature: '0x...', duration: '1234.56ms' }
   [FLOW] Signature complete, moving to encryption step
   [FLOW] Auto-triggering encryption...
   ```

2. **Cuando empieza la encriptación:**
   ```
   [FLOW] Starting encryption process { fileName: 'document.pdf', fileSize: '245.32 KB' }
   [FLOW] Step changed to: encrypting
   [FLOW] Calling encryptFile...
   [ENCRYPTION] Starting file encryption { fileName: 'document.pdf', fileSize: '245.32 KB', fileType: 'application/pdf' }
   ```

3. **Durante la encriptación:**
   ```
   [ENCRYPTION] Reading file as ArrayBuffer...
   [ENCRYPTION] File read successfully { arrayBufferSize: '245.32 KB' }
   [ENCRYPTION] Starting AES-256-GCM encryption { originalSize: '245.32 KB' }
   [ENCRYPTION] Generating encryption key and nonce...
   [ENCRYPTION] Generating AES-256 key...
   [ENCRYPTION] AES-256 key generated successfully { duration: '5.23ms' }
   [ENCRYPTION] Generating random nonce (96 bits)...
   [ENCRYPTION] Encrypting data with AES-256-GCM... { dataSize: '245.32 KB', nonceLength: 12 }
   ```

4. **Si hay un error:**
   ```
   [ERROR] [ENCRYPTION] Encryption failed { error: '...', duration: '...', originalSize: ... }
   [ERROR] [FLOW] Encryption failed { error: '...', fileName: '...' }
   ```

## 🔧 Soluciones Implementadas

### 1. **Auto-trigger después de Firma**
```typescript
// Después de firmar, automáticamente inicia encriptación
setTimeout(() => {
  handleEncrypt();
}, 100);
```

### 2. **Estado de Carga Visual**
- Muestra spinner mientras encripta
- Mensaje: "Encrypting with AES-256-GCM..."
- Instrucción: "Check console for progress"

### 3. **Logging Detallado**
- Cada paso del proceso está logueado
- Tiempos de ejecución
- Tamaños de archivos
- Errores con contexto completo

## 🎯 Qué Buscar en los Logs

### Si se queda en "Encrypting":

1. **¿Aparece el log "Starting encryption process"?**
   - ✅ Sí → El auto-trigger funcionó
   - ❌ No → El auto-trigger no se ejecutó

2. **¿Aparece "Calling encryptFile..."?**
   - ✅ Sí → La función se está llamando
   - ❌ No → Hay un problema antes de llamar encryptFile

3. **¿Aparece "Starting file encryption"?**
   - ✅ Sí → La función encryptFile se ejecutó
   - ❌ No → Hay un problema en el componente

4. **¿Aparece algún error?**
   - Busca líneas con `[ERROR]`
   - Revisa el mensaje de error
   - Verifica el stack trace

## 📝 Ejemplo de Logs Completos

```
[FLOW] Starting hash signing process { hash: '0x7a9c8b3e...' }
[FLOW] Step changed to: signing
[WALLET] Getting wallet address...
[WALLET] Ethereum provider found { isMetaMask: true }
[WALLET] BrowserProvider created
[WALLET] Requesting account access...
[WALLET] Account access granted
[WALLET] Signer obtained { address: '0x3A56...Ca3F' }
[WALLET] Wallet address obtained { address: '0x3A56...Ca3F', duration: '234.56ms' }
[WALLET] Requesting signature from wallet... { hash: '0x7a9c8b3e...' }
[WALLET] Prepared hash for signing { originalHash: '0x7a9c8b3e...', prefixedHash: '0x0x7a9c8b3e...' }
[WALLET] Requesting signature from wallet (user may need to approve)...
[WALLET] Signature received from wallet { signature: '0x1234...', signatureLength: 132, duration: '3456.78ms' }
[FLOW] Signature complete, moving to encryption step
[FLOW] Auto-triggering encryption...
[FLOW] Starting encryption process { fileName: 'document.pdf', fileSize: '245.32 KB' }
[FLOW] Step changed to: encrypting
[FLOW] Calling encryptFile...
[ENCRYPTION] Starting file encryption { fileName: 'document.pdf', fileSize: '245.32 KB', fileType: 'application/pdf' }
[ENCRYPTION] Reading file as ArrayBuffer...
[ENCRYPTION] File read successfully { arrayBufferSize: '245.32 KB' }
[ENCRYPTION] Starting AES-256-GCM encryption { originalSize: '245.32 KB', hasKey: false, hasNonce: false }
[ENCRYPTION] Generating encryption key and nonce...
[ENCRYPTION] Generating AES-256 key...
[ENCRYPTION] AES-256 key generated successfully { duration: '5.23ms' }
[ENCRYPTION] Generating random nonce (96 bits)...
[ENCRYPTION] Nonce generated { nonce: 'a1b2c3d4e5f6...' }
[ENCRYPTION] Encrypting data with AES-256-GCM... { dataSize: '245.32 KB', nonceLength: 12 }
[ENCRYPTION] Encryption completed successfully { originalSize: '245.32 KB', encryptedSize: '245.45 KB', overhead: '0.13 KB', duration: '123.45ms', speed: '1.98 MB/s' }
[ENCRYPTION] Exporting key for storage...
[ENCRYPTION] Encryption process complete { encryptedDataSize: 251456, keyDataSize: 32, nonceSize: 12 }
[ENCRYPTION] File encryption complete { fileName: 'document.pdf', totalDuration: '234.56ms' }
[FLOW] Encryption completed { encryptedSize: '245.45 KB', duration: '234.56ms' }
[FLOW] Moving to blob upload step
[FLOW] Auto-triggering blob upload...
```

## 🚨 Errores Comunes y Soluciones

### Error: "Failed to sign hash"
- **Causa**: Usuario rechazó la firma en MetaMask
- **Solución**: Asegúrate de aprobar la firma en MetaMask

### Error: "Encryption failed"
- **Causa**: Problema con Web Crypto API o archivo corrupto
- **Solución**: Revisa los logs de ENCRYPTION para más detalles

### Error: "Network error: Unable to reach Arkiv API"
- **Causa**: Problema de conexión o endpoint incorrecto
- **Solución**: Verifica `.env` y la conexión a internet

## 💡 Tips para Debugging

1. **Abre la consola ANTES de empezar el flujo**
2. **Filtra por componente**: Usa el filtro de la consola para ver solo `[FLOW]`, `[ENCRYPTION]`, etc.
3. **Busca errores**: Filtra por `ERROR` para ver solo problemas
4. **Revisa tiempos**: Los logs incluyen duraciones para identificar cuellos de botella

## 🔍 Acceso a Logs en Código

```typescript
import { logger } from './utils/logger';

// Ver todos los logs almacenados
const logs = logger.getLogs();
console.table(logs);

// Limpiar logs
logger.clearLogs();
```

## ✅ Conclusión

Con el logging implementado, ahora puedes:
- ✅ Ver exactamente dónde se queda el proceso
- ✅ Identificar errores específicos
- ✅ Medir tiempos de ejecución
- ✅ Debuggear problemas de forma eficiente

**Abre la consola del navegador y revisa los logs cuando pruebes el flujo.**

