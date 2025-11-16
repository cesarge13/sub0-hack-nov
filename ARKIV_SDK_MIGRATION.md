# Migración al SDK Oficial de Arkiv

## 🔍 Descubrimiento Importante

Según la documentación oficial de Arkiv, existe un **SDK oficial** que debería usarse en lugar de llamadas REST directas.

### SDK Oficial de Arkiv

**Instalación:**
```bash
npm install arkiv-sdk
# o
npm install @arkiv/ts
```

**Uso según documentación:**
```typescript
import { createClient } from 'arkiv-sdk';

// Crear cliente de lectura/escritura
const client = await createClient(
  60138453056,  // Chain ID (Mendoza Network)
  "PRIVATE_KEY", // Clave privada de la wallet
  "https://mendoza.hoodi.arkiv.network/rpc",  // HTTP RPC
  "wss://mendoza.hoodi.arkiv.network/rpc/ws"  // WebSocket RPC
);

// Crear entidades (blobs + metadata)
const receipt = await client.createEntities([{
  data: new TextEncoder().encode("Datos encriptados"),
  expiresIn: 1800, // Expira en 30 minutos (opcional)
  stringAnnotations: [
    new Annotation("type", "document"),
    new Annotation("hash", "0x..."),
    new Annotation("signature", "0x..."),
    new Annotation("signer", "0x...")
  ],
  numericAnnotations: []
}]);

// Consultar entidades
const roClient = await createReadOnlyClient(...);
const data = await roClient.queryEntities('type = "document"');
```

## 🔄 Diferencias con Implementación Actual

### Implementación Actual (REST API)
```typescript
// putBlob
const objectID = await arkivClient.putBlob(encryptedBlob);

// putMetadata
const metadataID = await arkivClient.putMetadata(metadata);
```

### Implementación con SDK Oficial
```typescript
// Todo en una sola llamada
const receipt = await client.createEntities([{
  data: encryptedBlob,  // ArrayBuffer
  stringAnnotations: [
    new Annotation("hash", hash),
    new Annotation("signature", signature),
    new Annotation("signer", signer),
    new Annotation("fileName", fileName)
  ]
}]);
```

## 📋 Plan de Migración

### Opción 1: Migrar Completamente al SDK (Recomendado)

1. **Instalar SDK oficial**
   ```bash
   npm install arkiv-sdk
   ```

2. **Actualizar cliente Arkiv**
   - Reemplazar funciones REST con SDK
   - Usar `createClient` con configuración de Mendoza
   - Usar `createEntities` para uploads

3. **Actualizar DocumentRegister**
   - Adaptar para usar SDK en lugar de REST
   - Mantener mismo flujo de UI

### Opción 2: Mantener REST + Agregar SDK (Híbrido)

1. **Mantener implementación REST actual**
   - Para compatibilidad
   - Como fallback

2. **Agregar soporte SDK**
   - Detectar si SDK está disponible
   - Usar SDK si está disponible, REST si no

### Opción 3: Verificar Primero (Actual)

1. **Verificar si SDK existe realmente**
   ```bash
   npm search arkiv
   npm search @arkiv
   ```

2. **Revisar documentación oficial**
   - https://arkiv.dev.golem.network/docs
   - Verificar nombre exacto del paquete

3. **Decidir estrategia** basada en resultados

## 🔧 Implementación con SDK (Propuesta)

### Nuevo Cliente con SDK

```typescript
// src/utils/arkiv/sdk-client.ts
import { createClient, createReadOnlyClient, Annotation } from 'arkiv-sdk';
import { ARKIV_CONFIG } from './config';

let arkivSDKClient: any = null;

export async function getArkivSDKClient(privateKey: string) {
  if (!arkivSDKClient) {
    arkivSDKClient = await createClient(
      ARKIV_CONFIG.chainId,
      privateKey,
      ARKIV_CONFIG.mendozaRPC,
      ARKIV_CONFIG.mendozaRPC.replace('https://', 'wss://').replace('/rpc', '/rpc/ws')
    );
  }
  return arkivSDKClient;
}

export async function putBlobWithSDK(
  encryptedBlob: ArrayBuffer,
  metadata: {
    hash: string;
    signature: string;
    signer: string;
    fileName?: string;
  },
  privateKey: string
) {
  const client = await getArkivSDKClient(privateKey);
  
  const receipt = await client.createEntities([{
    data: encryptedBlob,
    expiresIn: undefined, // Sin expiración, o configurar según necesidad
    stringAnnotations: [
      new Annotation("hash", metadata.hash),
      new Annotation("signature", metadata.signature),
      new Annotation("signer", metadata.signer),
      ...(metadata.fileName ? [new Annotation("fileName", metadata.fileName)] : [])
    ],
    numericAnnotations: []
  }]);
  
  return receipt; // Contiene CID y otra información
}
```

## ⚠️ Consideraciones Importantes

### 1. Clave Privada

El SDK requiere la clave privada de la wallet. Esto es diferente a nuestra implementación actual que usa la wallet del navegador.

**Opciones:**
- Usar `window.ethereum` para obtener signer y extraer clave privada (NO recomendado por seguridad)
- Usar el SDK solo en backend
- Usar un enfoque híbrido: firmar con wallet del navegador, enviar a backend que usa SDK

### 2. Anotaciones vs Metadata

El SDK usa "annotations" (anotaciones) en lugar de metadata separada. Esto es más eficiente pero requiere cambiar la estructura.

### 3. Expiración

El SDK permite configurar `expiresIn`. Nuestra implementación actual no tiene esto.

## 🚀 Recomendación

### Paso 1: Verificar SDK
```bash
npm search arkiv
```

### Paso 2: Si existe SDK oficial
1. Instalarlo
2. Crear wrapper que use SDK
3. Mantener REST como fallback
4. Migrar gradualmente

### Paso 3: Si NO existe SDK oficial
1. Mantener implementación REST actual
2. Mejorar según documentación de API REST
3. Agregar funcionalidades faltantes

## 📝 Notas

- La documentación menciona `arkiv-sdk` pero necesitamos verificar el nombre exacto del paquete npm
- El SDK parece requerir clave privada, lo cual es un cambio arquitectónico importante
- Las "annotations" son más flexibles que metadata estructurada
- El SDK maneja automáticamente IPFS y blockchain commitments

## 🔗 Referencias

- Documentación: https://arkiv.dev.golem.network/docs
- Playground: https://arkiv.network/playground
- Ejemplos: Buscar en GitHub "arkiv-network"

