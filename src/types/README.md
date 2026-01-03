# Certifik Type Definitions

Este directorio contiene todas las definiciones de tipos TypeScript para la plataforma Certifik.

## Estructura

- `index.ts` - Tipos principales (Asset, Event, Evidence, Attestation)
- `sectors.ts` - Utilidades para sectores
- `status.ts` - Utilidades para estados
- `events.ts` - Utilidades para tipos de eventos

## Uso

```typescript
import type { Asset, Event, Evidence, Attestation, Sector, Status } from '@/types';
import { getSectorName, getStatusName, getEventTypeName } from '@/types';
```

## Tipos Principales

### Asset
Representa un activo físico o digital que se está rastreando.

```typescript
const asset: Asset = {
  id: 'AST-001',
  name: 'Production Batch #2024-11-001',
  type: 'Manufacturing Asset',
  sector: 'industria',
  location: 'Factory A, Santiago',
  owner: 'Company XYZ',
  createdAt: '2024-11-01T10:00:00Z'
};
```

### Event
Representa un evento de proceso o actividad relacionada con un activo.

```typescript
const event: Event = {
  id: 'EVT-001',
  assetId: 'AST-001',
  eventType: 'manufacturing',
  standardTag: 'ISO 9001',
  operator: 'Factory A',
  timestamp: '2024-11-16T14:32:15Z',
  ttlDays: 365,
  evidenceCid: 'bafy...',
  fileSha256: '0x7a9c8b3e...',
  status: 'valid'
};
```

### Evidence
Representa un archivo o documento que sirve como prueba.

```typescript
const evidence: Evidence = {
  cid: 'bafy...',
  sha256: '0x7a9c8b3e...',
  mime: 'application/pdf',
  size: 1024000,
  source: 'Factory A',
  createdAt: '2024-11-16T14:32:15Z',
  manifest: { version: '1.0' }
};
```

### Attestation
Representa un registro certificado en blockchain.

```typescript
const attestation: Attestation = {
  chainId: 60138453056,
  txHash: '0x1234...',
  issuer: '0x742d35Cc...',
  eventId: 'EVT-001',
  assetId: 'AST-001',
  cid: 'bafy...',
  sha256: '0x7a9c8b3e...',
  timestamp: '2024-11-16T14:32:15Z',
  ttlExpiresAt: '2025-11-16T14:32:15Z'
};
```

## Enums y Union Types

### Sector
```typescript
type Sector = 'agro' | 'industria' | 'energia';
```

### Status
```typescript
type Status = 'pending' | 'valid' | 'expired' | 'revoked';
```

### EventType
```typescript
type EventType = 
  | 'manufacturing'
  | 'quality_control'
  | 'compliance_check'
  | 'traceability_update'
  | 'process_validation'
  | 'safety_inspection'
  | 'environmental_audit'
  | 'certification'
  | 'other';
```

## Utilidades

### Sectores
```typescript
import { getSectorName, getSectorDescription } from '@/types/sectors';

getSectorName('agro'); // 'Agroindustria'
getSectorDescription('industria'); // 'Sector industrial y manufacturero'
```

### Estados
```typescript
import { getStatusName, getStatusColor, isStatusActive } from '@/types/status';

getStatusName('valid'); // 'Válido'
getStatusColor('pending'); // 'bg-amber-100...'
isStatusActive('valid'); // true
```

### Eventos
```typescript
import { getEventTypeName, getEventTypeColor } from '@/types/events';

getEventTypeName('manufacturing'); // 'Manufactura'
getEventTypeColor('quality_control'); // 'bg-purple-100...'
```

