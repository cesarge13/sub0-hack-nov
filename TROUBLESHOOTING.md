# 🔧 Troubleshooting - Problema de Encriptación

## 🐛 Problema Reportado

**Después de firmar con la wallet, el documento se queda cargando en el paso de encriptación y no procede.**

## ✅ Soluciones Implementadas

### 1. **Logger Completo**
- ✅ Logger creado en `src/utils/logger.ts`
- ✅ Logging agregado a todos los pasos del flujo
- ✅ Logs detallados en consola del navegador

### 2. **Auto-trigger después de Firma**
```typescript
// Después de firmar exitosamente:
setTimeout(() => {
  handleEncrypt();
}, 100);
```

### 3. **Estado de Carga Visual**
- ✅ Muestra spinner mientras encripta
- ✅ Mensaje claro: "Encrypting with AES-256-GCM..."
- ✅ Instrucción: "Check console for progress"

### 4. **Logging Detallado en Encriptación**
- ✅ Cada paso del proceso de encriptación está logueado
- ✅ Tiempos de ejecución
- ✅ Tamaños de archivos
- ✅ Errores con contexto completo

## 🔍 Cómo Diagnosticar

### Paso 1: Abre la Consola
1. Abre Developer Tools (F12)
2. Ve a la pestaña **Console**
3. Limpia la consola (Clear)

### Paso 2: Inicia el Flujo
1. Selecciona un PDF
2. Click en "Compute Hash"
3. Click en "Sign Hash"
4. **Aproba la firma en MetaMask**
5. Observa los logs

### Paso 3: Busca estos Logs

#### ✅ Si el Auto-trigger Funciona:
```
[FLOW] Signature complete, moving to encryption step
[FLOW] Auto-triggering encryption...
[FLOW] Starting encryption process { fileName: '...', fileSize: '...' }
[FLOW] Step changed to: encrypting
[FLOW] Calling encryptFile...
```

#### ✅ Si la Encriptación Empieza:
```
[ENCRYPTION] Starting file encryption { fileName: '...', fileSize: '...', fileType: '...' }
[ENCRYPTION] Reading file as ArrayBuffer...
[ENCRYPTION] File read successfully { arrayBufferSize: '...' }
[ENCRYPTION] Starting AES-256-GCM encryption { originalSize: '...' }
```

#### ❌ Si hay un Error:
```
[ERROR] [ENCRYPTION] Encryption failed { error: '...', duration: '...', originalSize: ... }
[ERROR] [FLOW] Encryption failed { error: '...', fileName: '...' }
```

## 🎯 Posibles Causas y Soluciones

### Causa 1: Auto-trigger no se ejecuta
**Síntoma**: No aparece el log "Auto-triggering encryption..."

**Solución**: 
- Verifica que la firma se completó exitosamente
- Revisa si hay errores en `handleSignHash`
- El setTimeout debería ejecutarse después de `setCurrentStep('encrypting')`

### Causa 2: handleEncrypt no se llama
**Síntoma**: Aparece "Auto-triggering encryption..." pero no "Starting encryption process"

**Solución**:
- Verifica que `handleEncrypt` está definido correctamente
- Revisa las dependencias del useCallback
- El problema puede ser que `handleEncrypt` no está en el scope correcto

### Causa 3: Error silencioso en encriptación
**Síntoma**: Aparece "Calling encryptFile..." pero no aparece "Starting file encryption"

**Solución**:
- Revisa si hay un error antes de llamar `encryptFile`
- Verifica que `selectedFile` no es null
- Revisa los logs de error

### Causa 4: Web Crypto API no disponible
**Síntoma**: Error "crypto.subtle is undefined"

**Solución**:
- Verifica que estás usando HTTPS (Web Crypto requiere contexto seguro)
- En desarrollo local, usa `http://localhost` (permitido)
- Verifica que el navegador soporta Web Crypto API

## 🔧 Debugging Avanzado

### Ver todos los logs almacenados:
```javascript
// En la consola del navegador:
window.__arkivLogs
```

### Filtrar logs por componente:
```javascript
// Solo logs de FLOW
window.__arkivLogs.filter(log => log.component === 'FLOW')

// Solo logs de ENCRYPTION
window.__arkivLogs.filter(log => log.component === 'ENCRYPTION')

// Solo errores
window.__arkivLogs.filter(log => log.level === 'ERROR')
```

### Ver último error:
```javascript
const errors = window.__arkivLogs.filter(log => log.level === 'ERROR');
console.log(errors[errors.length - 1]);
```

## 📋 Checklist de Verificación

Cuando pruebes el flujo, verifica:

- [ ] ✅ La consola está abierta ANTES de empezar
- [ ] ✅ Aparece el log "Auto-triggering encryption..." después de firmar
- [ ] ✅ Aparece el log "Starting encryption process"
- [ ] ✅ Aparece el log "Calling encryptFile..."
- [ ] ✅ Aparece el log "Starting file encryption"
- [ ] ✅ Aparece el log "Encryption completed successfully"
- [ ] ✅ El UI cambia de "Encrypting..." a "Document Encrypted"

## 🚨 Si el Problema Persiste

### 1. Verifica el Código
Revisa que `handleEncrypt` esté correctamente definido y accesible en el scope de `handleSignHash`.

### 2. Verifica las Dependencias
El `useCallback` de `handleEncrypt` tiene dependencias `[selectedFile, currentStep]`. Asegúrate de que estas están disponibles.

### 3. Prueba Manualmente
En la consola del navegador, prueba:
```javascript
// Ver si handleEncrypt está disponible
// (Esto requiere acceso al componente, puede no funcionar directamente)
```

### 4. Revisa Errores de React
- Abre la pestaña **Console** en DevTools
- Busca warnings de React sobre dependencias faltantes
- Revisa si hay errores de renderizado

## 💡 Solución Temporal

Si el auto-trigger no funciona, puedes agregar un botón manual:

```typescript
// En el paso de signing, después de mostrar la firma:
{signature && (
  <button onClick={handleEncrypt}>
    Continue to Encryption
  </button>
)}
```

## 📞 Feedback Esperado

Cuando pruebes, por favor comparte:

1. **¿Aparece el log "Auto-triggering encryption..."?**
2. **¿Aparece el log "Starting encryption process"?**
3. **¿Aparece algún error en la consola?**
4. **¿El spinner de "Encrypting..." aparece?**
5. **¿Cuánto tiempo se queda cargando?**

Con esta información podremos identificar exactamente dónde está el problema.

