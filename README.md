# Certifik - Plataforma de Trazabilidad Sostenible para el Gobierno de Chile

> **Plataforma gubernamental de trazabilidad sostenible y cumplimiento ambiental mediante blockchain**

> **Desarrollada para el Gobierno de Chile - Cluster 6: Tecnologías Aplicadas a la Sostenibilidad**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Transparente-00D9FF?style=flat)](https://www.gob.cl/)

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Flujo Completo de Certificación](#-flujo-completo-de-certificación)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 📖 Guía de Usuario

**¿Eres nuevo en la plataforma?** 👋

👉 **[Lee la Guía Completa de Usuario aquí](./GUIA_USUARIO.md)**

Esta guía explica paso a paso:
- ✅ Para qué sirve la plataforma
- ✅ Cómo registrar activos y eventos
- ✅ Cómo interpretar alertas y métricas
- ✅ Casos de uso prácticos para faenas mineras
- ✅ Conceptos clave explicados de forma simple

---

## 🎯 Descripción

**Certifik** es una plataforma descentralizada de **trazabilidad y cumplimiento enfocada en sostenibilidad**, que permite a empresas de los sectores **agro, industria y energía**:

- **Rastrear el impacto ambiental** de sus activos y procesos mediante blockchain inmutable
- **Certificar cumplimiento** con estándares internacionales de sostenibilidad (ISO 14001, ISO 50001, GRI, SDGs)
- **Medir y reducir** la huella de carbono y uso de recursos naturales
- **Demostrar transparencia** en prácticas sostenibles mediante registros blockchain verificables
- **Facilitar reportes ESG** (Environmental, Social, Governance) con trazabilidad completa
- **Gestionar renovaciones** de certificaciones ambientales y de sostenibilidad

### Casos de Uso Principales

#### 1. **Certificación de Productos Sostenibles**
- Trazabilidad de productos con certificación orgánica o sostenible
- Verificación de cadena de suministro sostenible
- Certificación de energía renovable (I-REC, Carbon Trust)
- Certificación de economía circular

#### 2. **Gestión de Cumplimiento Ambiental**
- Auditorías ambientales (ISO 14001)
- Medición de huella de carbono (ISO 14064)
- Gestión de residuos y economía circular
- Seguimiento de uso de agua y recursos naturales
- Evaluación de biodiversidad

#### 3. **Reportes de Sostenibilidad**
- Reportes GRI Standards (Global Reporting Initiative)
- Alineación con SDGs (Objetivos de Desarrollo Sostenible)
- Certificaciones B-Corp
- Reportes de impacto social y ambiental

### Flujo Principal (según último commit)

> *"La wallet se conecta con el cliente, el cliente se conecta con el RPC, se sube un archivo de bajo peso, se encripta con AES256 se genera la metadata, se pasa a firma con la wallet, se firma la metadata, se paga el fee, se manda la metadata"*

## ✨ Características Principales

### 🔐 Seguridad de Nivel Empresarial

- **Encriptación AES-256-GCM**: Encriptación client-side antes de subir
- **Firmas ECDSA**: Verificación criptográfica con wallets de Ethereum
- **Hashing SHA-256**: Verificación de integridad de documentos
- **Almacenamiento Descentralizado**: IPFS para almacenamiento distribuido y verificable

### 🌐 Integración Blockchain

- **Blockchain Público**: Registros inmutables y verificables mediante tecnología blockchain
- **Integración de Wallets**: Conexión con wallets para firmas criptográficas
- **Registros Transparentes**: Todos los eventos y certificaciones son verificables públicamente
- **Trazabilidad Completa**: Historial completo e inmutable de todos los eventos de sostenibilidad

### 📊 Dashboard Completo de Sostenibilidad

- **KPIs de Sostenibilidad**: 
  - Huella de Carbono Reducida (tCO₂e)
  - Eficiencia de Recursos (score 0-100)
  - Cobertura de Estándares de Sostenibilidad
  - Compliance Rate y Audit Readiness Score
- **Gestión de Assets**: Trazabilidad completa de activos con impacto ambiental
- **Eventos de Sostenibilidad**: Seguimiento de eventos ambientales, certificaciones y auditorías
- **Analytics de Impacto Ambiental**: Gráficos de huella de carbono, uso de recursos, y comparativas
- **Compliance Renewals**: Alertas y gestión de renovaciones de certificaciones ambientales
- **Verificaciones**: Sistema de verificación de integridad mediante blockchain

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Upload     │→ │  Encryption  │→ │   Signing     │     │
│  │   Component  │  │  (AES-256)   │  │  (ECDSA)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘            │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  Arkiv SDK v2   │                       │
│                   │  (@arkiv/sdk)   │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  MetaMask     │  │  Mendoza RPC    │  │  Arkiv Network │
│  (Wallet)     │  │  (Blockchain)   │  │  (IPFS Storage)│
└───────────────┘  └─────────────────┘  └────────────────┘
```

### Componentes Clave

1. **Frontend (React + TypeScript)**
   - Componentes UI con Radix UI
   - Gestión de estado con React Hooks
   - Integración con wagmi para wallets

2. **Arkiv SDK Integration**
   - SDK v2 oficial (`@arkiv-network/sdk`)
   - Fallback a SDK v1 (`arkiv-sdk`)
   - Fallback a REST API si es necesario

3. **Crypto Layer**
   - Web Crypto API para encriptación
   - ethers.js para firmas ECDSA
   - SHA-256 para hashing

4. **Blockchain Layer**
   - Mendoza Network (Chain ID: 60138453056)
   - RPC: `https://mendoza.hoodi.arkiv.network/rpc`
   - WebSocket: `wss://mendoza.hoodi.arkiv.network/rpc/ws`

## 🔄 Flujo Completo de Certificación

### Paso 1: Conexión de Wallet
```
Usuario → MetaMask → Conexión → Cliente Web3
```
- El usuario conecta su wallet MetaMask
- El cliente se conecta al RPC de Mendoza Network
- Se verifica la conexión y el balance

### Paso 2: Upload de Archivo
```
Usuario selecciona PDF → Validación → Lectura como ArrayBuffer
```
- Validación de tipo de archivo (PDF)
- Validación de tamaño (recomendado < 100KB para evitar bugs del SDK)
- Lectura del archivo como `ArrayBuffer` para procesamiento

### Paso 3: Generación de Hash
```
ArrayBuffer → SHA-256 → Hash Hex (64 caracteres)
```
- Se calcula el hash SHA-256 del documento original
- El hash sirve como huella digital única del documento
- Cualquier cambio en el documento produce un hash diferente

### Paso 4: Encriptación AES-256-GCM
```
ArrayBuffer + Key (256 bits) + Nonce (96 bits) → Encrypted Blob
```
- **Generación de clave**: Se genera una clave AES-256 aleatoria
- **Generación de nonce**: Se genera un nonce único de 96 bits
- **Encriptación**: El documento se encripta completamente client-side
- **Resultado**: Blob encriptado que nunca se envía sin encriptar

### Paso 5: Generación de Metadata
```
Hash + Signature + Signer + ObjectID + Timestamp → Metadata Object
```
- Se crea un objeto de metadata con:
  - `hash`: Hash SHA-256 del documento
  - `signature`: Firma ECDSA del hash
  - `signer`: Dirección de la wallet que firmó
  - `objectID`: Referencia al blob encriptado
  - `timestamp`: Fecha y hora de registro
  - `fileName`, `fileSize`, `mimeType`: Metadatos del archivo

### Paso 6: Firma con Wallet
```
Hash → MetaMask → Usuario aprueba → Signature ECDSA
```
- Se solicita al usuario que firme el hash con su wallet
- MetaMask muestra un popup de confirmación
- El usuario aprueba la firma
- Se obtiene la firma ECDSA y la dirección del firmante

### Paso 7: Pago de Fee
```
Transacción → Gas Estimation → MetaMask → Usuario aprueba → Fee pagado
```
- Se estima el gas necesario para la transacción
- MetaMask muestra el costo estimado
- El usuario aprueba el pago del fee
- La transacción se envía a Mendoza Network

### Paso 8: Upload a Arkiv Network
```
Encrypted Blob → Arkiv SDK → IPFS → ObjectID
Metadata → Arkiv SDK → Blockchain → MetadataID
```
- **Blob Upload**: El blob encriptado se sube a Arkiv Network (IPFS)
- **Metadata Upload**: La metadata se registra en Arkiv
- **Merkle Commitment**: Arkiv crea un Merkle tree y publica el root en blockchain
- **Resultado**: Se obtienen `objectID` y `metadataID`

### Paso 9: Verificación y Resultados
```
ObjectID + MetadataID → Verificación → Dashboard
```
- Se muestran los resultados al usuario
- Se puede verificar la integridad del documento
- El documento aparece en el dashboard de documentos certificados

## 🚀 Instalación

### Prerrequisitos

- **Node.js**: v18.10.0 o superior
- **npm**: v9.0.0 o superior
- **MetaMask**: Extensión del navegador instalada
- **Cuenta en Mendoza Network**: Con ETH para pagar gas fees

### Instalación de Dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd Polkadothack

# Instalar dependencias
npm install
```

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Mendoza Network Configuration
VITE_MENDOZA_RPC=https://mendoza.hoodi.arkiv.network/rpc
VITE_MENDOZA_RPC_WS=wss://mendoza.hoodi.arkiv.network/rpc/ws
VITE_MENDOZA_CHAIN_ID=60138453056
VITE_MENDOZA_EXPLORER=https://mendoza.hoodi.arkiv.network

# Arkiv API Configuration
VITE_ARKIV_API_BASE=https://api.arkiv.network

# Development Mode
VITE_USE_MOCK=false
```

### Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`

## ⚙️ Configuración

### Configuración de Red

La configuración de red está en `src/config/wagmi.ts`:

```typescript
export const mendozaNetwork = {
  id: 60138453056,
  name: 'Mendoza Network',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mendoza.hoodi.arkiv.network/rpc'] }
  },
  blockExplorers: {
    default: { name: 'Mendoza Explorer', url: 'https://mendoza.hoodi.arkiv.network' }
  }
};
```

### Configuración de Arkiv

La configuración de Arkiv está en `src/utils/arkiv/config.ts`:

```typescript
export const ARKIV_CONFIG = {
  mendozaRPC: 'https://mendoza.hoodi.arkiv.network/rpc',
  mendozaRPCWS: 'wss://mendoza.hoodi.arkiv.network/rpc/ws',
  chainId: 60138453056,
  explorerUrl: 'https://mendoza.hoodi.arkiv.network',
  apiBase: 'https://api.arkiv.network',
};
```

### Configuración de Vite

El archivo `vite.config.ts` incluye configuración especial para WebAssembly:

```typescript
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
          }
          next();
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['brotli-wasm'],
  },
  assetsInclude: ['**/*.wasm'],
});
```

## 📖 Uso

### Registrar un Asset Sostenible

1. **Conectar Wallet**
   - Haz clic en "Connect Wallet" en la parte superior
   - Aprueba la conexión en MetaMask
   - Asegúrate de estar conectado a Mendoza Network

2. **Registrar Asset**
   - Navega a la sección "Assets"
   - Haz clic en "Register New Asset"
   - Completa la información del asset (nombre, tipo, sector, ubicación)

3. **Agregar Eventos de Sostenibilidad**
   - Desde el detalle del asset, haz clic en "Add Event"
   - Selecciona el tipo de evento (ej: Medición de Huella de Carbono, Certificación de Energía Renovable)
   - Ingresa el estándar aplicable (ISO 14001, ISO 50001, GRI, SDGs, etc.)
   - Sube evidencia (opcional) y calcula hash SHA-256
   - El sistema subirá el manifest a IPFS automáticamente

4. **Attest on-chain (Opcional)**
   - Después de subir a IPFS, puedes hacer "Attest on-chain"
   - Esto registra el evento permanentemente en blockchain
   - El evento quedará con status "valid" y txHash

5. **Monitorear KPIs**
   - Ve al Dashboard para ver KPIs de sostenibilidad actualizados
   - Revisa Analytics para ver impacto ambiental detallado
   - Usa Compliance Renewals para gestionar renovaciones

### Verificar un Documento

1. **Buscar Documento**
   - Ve a la sección "Verifications"
   - Ingresa el `metadataID` del documento

2. **Verificar Integridad**
   - El sistema verificará:
     - ✅ La firma ECDSA
     - ✅ El hash SHA-256
     - ✅ El registro en blockchain

### Ejemplo de Código

```typescript
import { DocumentRegister } from './components/DocumentRegister';

function App() {
  return (
    <DocumentRegister
      onComplete={(result) => {
        console.log('Documento registrado:', {
          objectID: result.objectID,
          metadataID: result.metadataID,
          hash: result.hash,
          signature: result.signature,
          signer: result.signer
        });
      }}
    />
  );
}
```

## 🛠️ Tecnologías

### Frontend

- **React 18.3.1**: Framework UI
- **TypeScript**: Tipado estático
- **Vite 6.3.5**: Build tool y dev server
- **Tailwind CSS**: Estilos utility-first
- **Radix UI**: Componentes accesibles

### Blockchain & Web3

- **wagmi 2.19.4**: React hooks para Ethereum
- **viem 2.39.0**: Cliente TypeScript para Ethereum
- **ethers 6.15.0**: Biblioteca para interacción con blockchain
- **@arkiv-network/sdk 0.4.5**: SDK oficial de Arkiv Network
- **arkiv-sdk 0.1.19**: SDK legacy (fallback)

### Criptografía

- **Web Crypto API**: Encriptación AES-256-GCM nativa del navegador
- **SHA-256**: Hashing criptográfico
- **ECDSA**: Firmas digitales con wallets de Ethereum

### Almacenamiento

- **Arkiv Network**: Red descentralizada basada en IPFS
- **IPFS**: Sistema de archivos distribuido
- **Mendoza Network**: Blockchain L3 de Arkiv

### Utilidades

- **brotli-wasm**: Compresión WebAssembly para transacciones
- **lucide-react**: Iconos
- **sonner**: Notificaciones toast
- **react-query**: Gestión de estado del servidor

## 📁 Estructura del Proyecto

```
Polkadothack/
├── src/
│   ├── components/           # Componentes React
│   │   ├── DocumentRegister.tsx    # Componente principal de registro
│   │   ├── Documents.tsx            # Lista de documentos
│   │   ├── Verifications.tsx         # Verificación de documentos
│   │   ├── Dashboard.tsx             # Dashboard principal
│   │   ├── WalletPanel.tsx          # Panel de wallet
│   │   └── ui/                      # Componentes UI (Radix)
│   │
│   ├── utils/                # Utilidades
│   │   ├── arkiv/           # Cliente Arkiv
│   │   │   ├── config.ts            # Configuración de Arkiv
│   │   │   ├── client.ts             # Cliente REST API
│   │   │   ├── sdk-client.ts         # SDK v1 (arkiv-sdk)
│   │   │   ├── sdk-client-v2.ts     # SDK v2 (@arkiv-network/sdk)
│   │   │   └── sdk-wrapper.ts       # Wrapper con fallbacks
│   │   ├── crypto/          # Criptografía
│   │   │   ├── hashing.ts           # SHA-256
│   │   │   └── encryption.ts        # AES-256-GCM
│   │   ├── wallet/          # Wallet utilities
│   │   │   └── signer.ts            # Firmas ECDSA
│   │   └── logger.ts                # Sistema de logging
│   │
│   ├── config/              # Configuración
│   │   └── wagmi.ts                 # Configuración de wagmi
│   │
│   ├── services/            # Servicios externos
│   │   ├── arkivApi.ts              # API de Arkiv
│   │   ├── atsApi.ts                # API de ATS
│   │   └── origenApi.ts             # API de Origen
│   │
│   ├── backend/             # Backend Python (opcional)
│   │   ├── app.py                   # Flask app
│   │   ├── ats_processor.py         # Procesador ATS
│   │   └── database.py              # Base de datos
│   │
│   ├── App.tsx              # Componente raíz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
│
├── public/                  # Archivos estáticos
├── vite.config.ts           # Configuración de Vite
├── package.json             # Dependencias
├── tsconfig.json            # Configuración TypeScript
└── README.md                # Este archivo
```

## 🔒 Seguridad

### Medidas de Seguridad Implementadas

1. **Encriptación Client-Side**
   - Los documentos se encriptan antes de salir del navegador
   - Las claves nunca se almacenan en servidores
   - Solo el usuario tiene acceso a las claves de desencriptación

2. **Firmas Criptográficas**
   - Cada documento se firma con ECDSA
   - Las firmas verifican la autenticidad y autoría
   - Las firmas son verificables públicamente

3. **Hashing SHA-256**
   - Cada documento tiene un hash único
   - Cualquier modificación cambia el hash
   - Permite verificación de integridad

4. **Almacenamiento Descentralizado**
   - Los documentos se almacenan en IPFS
   - Sin punto único de fallo
   - Resistente a censura

5. **Registro Inmutable**
   - Los registros en blockchain son permanentes
   - No se pueden modificar ni eliminar
   - Prueba de existencia y timestamp

### Mejores Prácticas

- ✅ **Nunca compartas tus claves de encriptación**
- ✅ **Verifica siempre las firmas antes de confiar en documentos**
- ✅ **Usa HTTPS en producción**
- ✅ **Mantén tu wallet segura y nunca compartas tu private key**
- ✅ **Verifica los hashes antes de procesar documentos**

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. "No Ethereum provider found"
**Solución**: 
- Instala MetaMask o otra wallet compatible
- Asegúrate de que la extensión esté habilitada
- Recarga la página

#### 2. "Failed to upload blob: SDK Bug Detected"
**Solución**:
- Este es un bug conocido del SDK v0.1.19
- El sistema intentará automáticamente con SDK v2
- Si falla, intentará con REST API
- **Recomendación**: Usa archivos < 100KB para evitar el bug

#### 3. "WebAssembly.instantiate() error"
**Solución**:
- Reinicia el servidor de desarrollo (`npm run dev`)
- Asegúrate de que Vite esté configurado correctamente
- Verifica que `brotli-wasm` esté instalado

#### 4. "Insufficient funds for gas"
**Solución**:
- Asegúrate de tener ETH en tu wallet
- Conecta a Mendoza Network
- Obtén ETH del faucet: https://mendoza.hoodi.arkiv.network/faucet/

#### 5. "Network error: Unable to reach Arkiv API"
**Solución**:
- Verifica tu conexión a internet
- Verifica que los endpoints de Arkiv estén disponibles
- Revisa la configuración en `.env`

### Logs y Debugging

El sistema incluye logging detallado. Para ver los logs:

1. Abre la consola del navegador (F12)
2. Busca logs con prefijos:
   - `[ARKIV]`: Logs relacionados con Arkiv
   - `[FLOW]`: Logs del flujo de registro
   - `[WALLET]`: Logs de wallet
   - `[CRYPTO]`: Logs de criptografía

### Obtener Ayuda

Si encuentras problemas:

1. Revisa los logs en la consola
2. Verifica la configuración en `.env`
3. Asegúrate de tener las últimas versiones de las dependencias
4. Consulta la documentación de Arkiv: https://arkiv.network/docs

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Estilo

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de React
- Añade comentarios para código complejo
- Actualiza la documentación cuando sea necesario

## 📄 Licencia

Este proyecto es parte de Certik y está bajo la licencia del proyecto principal.

## 🔗 Enlaces Útiles

- **Arkiv Network**: https://arkiv.network
- **Documentación Arkiv**: https://arkiv.network/docs
- **Mendoza Network Explorer**: https://mendoza.hoodi.arkiv.network
- **Mendoza Faucet**: https://mendoza.hoodi.arkiv.network/faucet/
- **GitHub Arkiv SDK**: https://github.com/Arkiv-Network/arkiv-sdk-js

## 📝 Notas Adicionales

### Sobre el SDK de Arkiv

El proyecto usa múltiples estrategias para garantizar la compatibilidad:

1. **SDK v2** (`@arkiv-network/sdk` v0.4.5): SDK oficial moderno, preferido
2. **SDK v1** (`arkiv-sdk` v0.1.19): SDK legacy, usado como fallback
3. **REST API**: Fallback final si ambos SDKs fallan

### Limitaciones Conocidas

- El SDK v0.1.19 tiene un bug conocido con archivos grandes (>100KB)
- Se recomienda usar archivos pequeños para evitar problemas
- El sistema implementa fallbacks automáticos para manejar estos casos

### Próximas Mejoras

- [ ] Soporte para múltiples archivos simultáneos
- [ ] Interfaz de verificación mejorada
- [ ] Exportación de claves de encriptación
- [ ] Búsqueda avanzada de documentos
- [ ] Notificaciones de expiración de documentos

---

**Desarrollado con ❤️ para Polkadot Hackathon**
