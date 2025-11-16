# 🔐 Detalles de Encriptación AES-256-GCM

## 📚 Librería Utilizada

### ✅ **Web Crypto API (Nativa del Navegador)**

**NO estamos usando una librería externa.** Estamos usando la **Web Crypto API** que es:

- ✅ **Nativa del navegador** - No requiere instalación
- ✅ **Estándar W3C** - Especificación oficial
- ✅ **Muy segura** - Implementada por el navegador
- ✅ **Eficiente** - Optimizada a nivel de sistema
- ✅ **Disponible en todos los navegadores modernos**

### Código Utilizado:

```typescript
// src/utils/crypto/encryption.ts

// Generar clave AES-256
crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 256, // AES-256
  },
  true, // extractable
  ['encrypt', 'decrypt']
)

// Encriptar datos
crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: nonce,           // Vector de inicialización (96 bits)
    tagLength: 128,      // Tag de autenticación (128 bits)
  },
  key,
  data
)
```

## 🔍 Cómo Funciona en el Modal

### Flujo en DocumentRegister.tsx:

1. **Usuario hace clic en "Encrypt Document"**
   ```typescript
   const handleEncrypt = async () => {
     const result = await encryptFile(selectedFile);
     setEncryptionResult(result);
   }
   ```

2. **Se llama a `encryptFile()`**
   ```typescript
   // src/utils/crypto/encryption.ts
   export async function encryptFile(file: File): Promise<EncryptionResult> {
     const arrayBuffer = await file.arrayBuffer();
     return await encryptAES256GCM(arrayBuffer);
   }
   ```

3. **Se genera clave y nonce aleatorios**
   ```typescript
   const encryptionKey = await generateAESKey();  // Clave AES-256 aleatoria
   const encryptionNonce = generateNonce();      // Nonce de 96 bits aleatorio
   ```

4. **Se encripta el documento**
   ```typescript
   const encryptedData = await crypto.subtle.encrypt(
     { name: 'AES-GCM', iv: nonce, tagLength: 128 },
     key,
     data
   );
   ```

5. **Se retorna el resultado**
   ```typescript
   return {
     encryptedData,    // ArrayBuffer encriptado
     key,              // CryptoKey (para desencriptar después)
     nonce,            // Uint8Array (necesario para desencriptar)
     keyData,          // ArrayBuffer de la clave (para almacenar)
   };
   ```

## 🔐 Especificaciones Técnicas

### AES-256-GCM:

- **Algoritmo**: AES (Advanced Encryption Standard)
- **Tamaño de clave**: 256 bits (muy seguro)
- **Modo**: GCM (Galois/Counter Mode)
- **Nonce**: 96 bits (12 bytes aleatorios)
- **Tag de autenticación**: 128 bits
- **Propiedades**:
  - ✅ Confidencialidad (solo quien tiene la clave puede leer)
  - ✅ Integridad (detecta si los datos fueron modificados)
  - ✅ Autenticación (verifica que los datos son auténticos)

## 📦 Ventajas de Web Crypto API

### vs Librerías Externas:

| Aspecto | Web Crypto API | Librerías Externas |
|---------|----------------|-------------------|
| **Tamaño** | 0 KB (nativa) | +50-200 KB |
| **Velocidad** | Optimizada | Depende |
| **Seguridad** | Implementación del navegador | Depende de la librería |
| **Compatibilidad** | Todos los navegadores modernos | Depende |
| **Mantenimiento** | Mantenida por navegadores | Mantenida por desarrolladores |

## 🎯 En el Modal

### Paso 4: "Encrypt"

Cuando el usuario llega al paso de encriptación:

1. **UI muestra**: "Encrypting Document..."
2. **Se ejecuta**: `encryptFile(selectedFile)`
3. **Proceso**:
   - Lee el PDF como ArrayBuffer
   - Genera clave AES-256 aleatoria
   - Genera nonce aleatorio
   - Encripta usando Web Crypto API
4. **Resultado**: Documento encriptado listo para subir

### Visualización en el Modal:

```typescript
{currentStep === 'encrypting' && encryptionResult && (
  <div>
    <h3>Document Encrypted</h3>
    <p>AES-256-GCM Encryption Complete</p>
    <p>Encrypted size: {encryptionResult.encryptedData.byteLength} bytes</p>
  </div>
)}
```

## 🔒 Seguridad

### ¿Por qué es seguro?

1. **Clave aleatoria**: Cada encriptación usa una clave única
2. **Nonce único**: Cada encriptación usa un nonce diferente
3. **Client-side**: La encriptación ocurre en el navegador, nunca se envía el documento sin encriptar
4. **GCM mode**: Proporciona autenticación además de encriptación
5. **256 bits**: Tamaño de clave muy seguro (imposible de romper con tecnología actual)

### ⚠️ Importante:

- **La clave NO se almacena automáticamente**
- **El usuario debe guardar la clave si quiere desencriptar después**
- **Sin la clave, el documento NO puede ser desencriptado**

## 📝 Código Completo

### Archivo: `src/utils/crypto/encryption.ts`

```typescript
// Usa Web Crypto API nativa
import { crypto } from 'crypto'; // NO - esto es Node.js

// ✅ CORRECTO: Usa window.crypto o crypto global del navegador
// No necesita import, está disponible globalmente

export async function encryptAES256GCM(
  data: ArrayBuffer,
  key?: CryptoKey,
  nonce?: Uint8Array
): Promise<EncryptionResult> {
  // Generar clave si no existe
  const encryptionKey = key || await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Generar nonce si no existe
  const encryptionNonce = nonce || crypto.getRandomValues(new Uint8Array(12));
  
  // Encriptar
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: encryptionNonce,
      tagLength: 128,
    },
    encryptionKey,
    data
  );
  
  return {
    encryptedData,
    key: encryptionKey,
    nonce: encryptionNonce,
    keyData: await crypto.subtle.exportKey('raw', encryptionKey),
  };
}
```

## ✅ Conclusión

**Estamos usando Web Crypto API nativa del navegador**, que es:

- ✅ Más segura que librerías externas
- ✅ Más rápida (optimizada por el navegador)
- ✅ Sin dependencias adicionales
- ✅ Estándar de la industria
- ✅ Perfecta para encriptación client-side

**No necesitamos instalar ninguna librería adicional** para la encriptación AES-256-GCM.

