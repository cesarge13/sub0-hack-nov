# Guía de Integración - Flujo 2: Document Registration

## 🎯 Recomendación: Arquitectura Híbrida

He creado una arquitectura que permite usar **mocks para desarrollo** y **API real para producción**, con la flexibilidad de cambiar fácilmente.

## 📁 Estructura Recomendada

```
src/
├── components/
│   └── DocumentRegister.tsx     ✅ Componente principal (ya creado)
├── services/
│   └── arkivApi.ts              📝 Servicio mock existente (mantener para compatibilidad)
└── utils/
    └── arkiv/
        ├── config.ts             ✅ Configuración centralizada (NUEVO)
        ├── client.ts             ✅ Cliente real de Arkiv (NUEVO)
        └── adapter.ts            📝 Adaptador para unificar ambos (OPCIONAL)
```

## 🔧 Configuración Recomendada

### Opción 1: Usar Cliente Real (Recomendado para Producción)

El cliente en `src/utils/arkiv/client.ts` está listo para usar con la API real de Arkiv.

**Pasos:**

1. **Configurar variables de entorno** (crear `.env`):
```env
VITE_ARKIV_API_BASE=https://api.arkiv.network
VITE_USE_MOCK=false
```

2. **Actualizar endpoint si es necesario**:
   - Edita `src/utils/arkiv/config.ts`
   - Verifica la documentación de Arkiv: https://arkiv.network/dev
   - Ajusta los endpoints según la API real

3. **Usar el componente**:
```tsx
import { DocumentRegister } from './components/DocumentRegister';

// En tu App.tsx o donde necesites
<DocumentRegister
  onComplete={(result) => {
    console.log('Documento registrado:', result);
  }}
/>
```

### Opción 2: Integrar con Servicio Existente

Si quieres mantener compatibilidad con el servicio mock existente, puedes crear un adaptador:

```typescript
// src/utils/arkiv/adapter.ts
import { arkivClient } from './client';
import { arkivApi } from '../../services/arkivApi';
import { ARKIV_CONFIG } from './config';

export const arkiv = ARKIV_CONFIG.useMock 
  ? arkivApi  // Usa mock para desarrollo
  : arkivClient; // Usa cliente real para producción
```

## 🚀 Integración en la Aplicación

### Paso 1: Agregar DocumentRegister a la navegación

**Opción A: Como pantalla independiente**

```tsx
// En App.tsx
import { DocumentRegister } from './components/DocumentRegister';

type Screen = 'dashboard' | 'documents' | 'register' | ...;

const renderScreen = () => {
  switch (currentScreen) {
    case 'register':
      return <DocumentRegister onClose={() => setCurrentScreen('documents')} />;
    // ...
  }
};
```

**Opción B: Como modal desde Documents**

```tsx
// En Documents.tsx
import { DocumentRegister } from './DocumentRegister';

const [showRegister, setShowRegister] = useState(false);

// En el botón de upload
<button onClick={() => setShowRegister(true)}>
  Register Document
</button>

{showRegister && (
  <DocumentRegister
    onClose={() => setShowRegister(false)}
    onComplete={(result) => {
      // Actualizar lista de documentos
      refreshDocuments();
      setShowRegister(false);
    }}
  />
)}
```

### Paso 2: Actualizar el servicio existente (opcional)

Si quieres que `arkivApi.ts` use el cliente real:

```typescript
// En src/services/arkivApi.ts
import { arkivClient } from '../utils/arkiv/client';
import { ARKIV_CONFIG } from '../utils/arkiv/config';

class ArkivAPI {
  async uploadDocument(file: File): Promise<Document> {
    if (ARKIV_CONFIG.useMock) {
      // Lógica mock existente
      return this.mockUpload(file);
    }
    
    // Usar cliente real
    // Implementar flujo completo: hash -> sign -> encrypt -> upload
    // ...
  }
}
```

## 📋 Checklist de Integración

- [x] ✅ Componente DocumentRegister creado
- [x] ✅ Utilidades de crypto (hashing, encryption)
- [x] ✅ Utilidades de wallet (signing)
- [x] ✅ Cliente Arkiv configurado
- [ ] ⏳ Configurar endpoint real de Arkiv API
- [ ] ⏳ Integrar componente en UI
- [ ] ⏳ Probar flujo completo
- [ ] ⏳ Agregar manejo de errores específicos
- [ ] ⏳ Implementar verificación de documentos

## 🔍 Verificación del Endpoint de Arkiv

**Importante:** Necesitas verificar el endpoint correcto de Arkiv:

1. Consulta la documentación: https://arkiv.network/getting-started/typescript
2. Verifica si hay un SDK oficial de npm
3. Si hay SDK, instálalo y actualiza `client.ts`:
```bash
npm install @arkiv/ts  # o el nombre correcto del paquete
```

4. Si no hay SDK, verifica los endpoints REST:
   - Revisa: https://arkiv.network/dev
   - Actualiza `config.ts` con los endpoints correctos

## 🎨 Mejores Prácticas Implementadas

1. **Separación de responsabilidades**
   - Crypto utilities separadas
   - Cliente Arkiv separado
   - Componente UI separado

2. **Configuración centralizada**
   - Variables de entorno
   - Fácil cambio entre mock/real

3. **TypeScript completo**
   - Tipos bien definidos
   - Interfaces claras

4. **Manejo de errores**
   - Try/catch en todas las funciones
   - Mensajes de error descriptivos

5. **Documentación**
   - Comentarios en código
   - README completo

## 🐛 Troubleshooting

### Error: "Failed to upload blob to Arkiv"
- Verifica que `VITE_ARKIV_API_BASE` esté configurado correctamente
- Verifica que el endpoint `/blob` sea correcto
- Revisa la consola del navegador para ver el error completo

### Error: "No Ethereum provider found"
- Asegúrate de tener MetaMask instalado
- Verifica que la wallet esté conectada

### Error: "Encryption failed"
- Verifica que el navegador soporte Web Crypto API
- Revisa que el archivo no esté corrupto

## 📚 Próximos Pasos Recomendados

1. **Verificar API de Arkiv**
   - Consultar documentación oficial
   - Probar endpoints manualmente
   - Ajustar configuración

2. **Integrar en UI**
   - Agregar a navegación
   - Conectar con lista de documentos
   - Mostrar documentos registrados

3. **Implementar Verificación**
   - Crear componente de verificación
   - Permitir verificar documentos por hash/metadataID
   - Mostrar resultados de verificación

4. **Mejorar UX**
   - Agregar progress bar detallado
   - Mostrar estimación de tiempo
   - Agregar notificaciones

## 💡 Recomendación Final

**Lo mejor es:**

1. **Mantener ambos servicios** (mock y real) para flexibilidad
2. **Usar variables de entorno** para cambiar entre ellos
3. **Integrar DocumentRegister** como componente principal
4. **Verificar endpoints** de Arkiv antes de producción
5. **Crear tests** para el flujo completo

¿Quieres que integre el componente en alguna pantalla específica o que ajuste algo más?

