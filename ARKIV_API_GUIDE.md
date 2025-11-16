# Guía de Integración con Arkiv API

## 📚 Documentación Oficial

**Importante:** Siempre consulta la documentación oficial de Arkiv:
- **Getting Started (TypeScript)**: https://arkiv.network/getting-started/typescript
- **Dev Portal**: https://arkiv.network/dev
- **GitHub**: https://github.com/arkiv-network

## 🔧 Configuración Actual

### Endpoints Configurados

```typescript
// En src/utils/arkiv/config.ts
apiBase: 'https://api.arkiv.network'  // Verificar con documentación oficial
endpoints: {
  blob: '/blob',           // Para upload de blobs
  metadata: '/metadata',   // Para upload de metadata
  verify: '/verify',       // Para verificación (futuro)
}
```

### Variables de Entorno

```env
VITE_ARKIV_API_BASE=https://api.arkiv.network
VITE_USE_MOCK=false
```

## ✅ Implementación Actual

### 1. Upload Blob (`putBlob`)

**Lo que hace:**
- Sube un blob encriptado a Arkiv/IPFS
- Retorna un CID (Content Identifier) u objectID

**Formato esperado:**
```typescript
const objectID = await arkivClient.putBlob(encryptedArrayBuffer);
```

**Respuesta esperada:**
```json
{
  "objectID": "bafy...",  // o "cid", "id", "blobId"
  "cid": "bafy...",       // IPFS CID
  "size": 12345
}
```

### 2. Upload Metadata (`putMetadata`)

**Lo que hace:**
- Sube metadata del documento a Arkiv
- Arkiv crea automáticamente un Merkle commitment
- Publica el commitment a Mendoza Network

**Formato esperado:**
```typescript
const metadata: ArkivMetadata = {
  hash: "0x...",           // SHA-256 hash
  signature: "0x...",       // ECDSA signature
  signer: "0x...",         // Wallet address
  objectID: "bafy...",     // CID del blob
  timestamp: 1234567890,
  fileName: "document.pdf",
  fileSize: 12345,
  mimeType: "application/pdf"
};

const metadataID = await arkivClient.putMetadata(metadata);
```

**Respuesta esperada:**
```json
{
  "metadataID": "bafy...",  // o "cid", "id", "metadataId"
  "cid": "bafy...",         // IPFS CID
  "merkleRoot": "0x...",   // Merkle root (si disponible)
  "txHash": "0x..."        // Transaction hash en Mendoza (si disponible)
}
```

## ⚠️ Verificaciones Necesarias

### 1. Verificar Endpoints Reales

Consulta la documentación oficial para verificar:
- ¿El endpoint base es correcto?
- ¿Los paths (`/blob`, `/metadata`) son correctos?
- ¿Hay autenticación requerida (API keys, tokens)?

### 2. Verificar Formato de Request

- ¿El FormData usa el campo `file` o otro nombre?
- ¿Se requiere algún header adicional?
- ¿Hay límites de tamaño?

### 3. Verificar Formato de Response

- ¿El campo se llama `objectID`, `cid`, `id`, u otro?
- ¿Hay campos adicionales útiles (como `merkleRoot`, `txHash`)?

### 4. Verificar SDK Oficial

Si Arkiv tiene un SDK oficial de npm:
```bash
npm install @arkiv/ts  # o el nombre correcto
```

Luego reemplazar las funciones REST con el SDK.

## 🧪 Cómo Probar

### 1. Prueba de Conexión

```typescript
import { verifyArkivConnection } from './utils/arkiv/client';

const isConnected = await verifyArkivConnection();
console.log('Arkiv API reachable:', isConnected);
```

### 2. Prueba de Upload

```typescript
import { arkivClient } from './utils/arkiv/client';

// 1. Crear un blob de prueba
const testBlob = new ArrayBuffer(100);
const objectID = await arkivClient.putBlob(testBlob);
console.log('Uploaded blob:', objectID);

// 2. Crear metadata de prueba
const metadata = {
  hash: '0x' + '0'.repeat(64),
  signature: '0x' + '0'.repeat(130),
  signer: '0x' + '0'.repeat(40),
  objectID: objectID,
};
const metadataID = await arkivClient.putMetadata(metadata);
console.log('Uploaded metadata:', metadataID);
```

## 🔍 Debugging

### Ver Estado de Configuración

```typescript
import { getArkivStatus } from './utils/arkiv/client';

const status = getArkivStatus();
console.log('Arkiv Status:', status);
```

### Ver Errores Detallados

Los errores ahora incluyen:
- Status code y status text
- URL completa del endpoint
- Respuesta del servidor
- Estructura de la respuesta recibida

## 📝 Notas Importantes

1. **Merkle Commitments**: Arkiv crea automáticamente los Merkle trees y publica a Mendoza Network. No necesitas hacerlo manualmente.

2. **IPFS**: Los blobs se almacenan en IPFS. Los CIDs son permanentes y únicos.

3. **Metadata**: La metadata es pública y verificable. Contiene toda la información necesaria para verificar el documento.

4. **Blockchain**: El commitment se publica en Mendoza Network automáticamente. Puedes verificar el transaction hash si está disponible en la respuesta.

## 🚀 Próximos Pasos

1. ✅ Verificar endpoints con documentación oficial
2. ✅ Probar con API real
3. ✅ Ajustar formato si es necesario
4. ⏳ Migrar a SDK oficial si está disponible
5. ⏳ Implementar verificación de documentos
6. ⏳ Agregar UI para ver transaction hashes

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola del navegador
2. Verifica la documentación oficial de Arkiv
3. Revisa el estado de la API con `getArkivStatus()`
4. Prueba la conexión con `verifyArkivConnection()`

