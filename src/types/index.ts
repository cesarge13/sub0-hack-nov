/**
 * Certifik - Process Traceability & Compliance Platform
 * TypeScript Type Definitions
 */

// ============================================================================
// Enums & Union Types
// ============================================================================

/**
 * Sector types for assets
 */
export type Sector = 'agro' | 'industria' | 'energia';

/**
 * Status types for assets and events
 */
export type Status = 'pending' | 'valid' | 'expired' | 'revoked';

/**
 * Event types for process tracking and sustainability
 */
export type EventType = 
  | 'manufacturing'
  | 'quality_control'
  | 'compliance_check'
  | 'traceability_update'
  | 'process_validation'
  | 'safety_inspection'
  | 'environmental_audit'
  | 'certification'
  | 'carbon_footprint_measurement'
  | 'water_usage_tracking'
  | 'waste_management'
  | 'renewable_energy_certification'
  | 'circular_economy_tracking'
  | 'social_impact_measurement'
  | 'biodiversity_assessment'
  | 'supply_chain_sustainability'
  | 'other';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Asset represents a physical or digital asset being tracked
 */
export interface Asset {
  /** Unique identifier for the asset */
  id: string;
  
  /** Name or description of the asset */
  name: string;
  
  /** Type/category of the asset */
  type: string;
  
  /** Sector the asset belongs to */
  sector: Sector;
  
  /** Geographic or logical location of the asset */
  location: string;
  
  /** Owner or responsible entity */
  owner: string;
  
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Event represents a process event or activity related to an asset
 */
export interface Event {
  /** Unique identifier for the event */
  id: string;
  
  /** Reference to the associated asset */
  assetId: string;
  
  /** Type of event */
  eventType: EventType;
  
  /** Standard or compliance tag (e.g., ISO, NOM, etc.) */
  standardTag?: string;
  
  /** Operator or entity that performed the event */
  operator: string;
  
  /** Timestamp when the event occurred (ISO 8601) */
  timestamp: string;
  
  /** Time-to-live in days */
  ttlDays: number;
  
  /** IPFS CID of the evidence file (optional) */
  evidenceCid?: string;
  
  /** SHA-256 hash of the evidence file (optional) */
  fileSha256?: string;
  
  /** Current status of the event */
  status: Status;
  
  /** Transaction hash of the on-chain attestation (if attested) */
  txHash?: string;
}

/**
 * Evidence represents a file or document that serves as proof
 */
export interface Evidence {
  /** IPFS Content Identifier */
  cid: string;
  
  /** SHA-256 hash of the file content */
  sha256: string;
  
  /** MIME type of the file */
  mime: string;
  
  /** File size in bytes */
  size: number;
  
  /** Source or origin of the evidence */
  source: string;
  
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  
  /** Optional manifest/metadata */
  manifest?: Record<string, any>;
}

/**
 * Attestation represents a blockchain-attested record
 */
export interface Attestation {
  /** Blockchain network chain ID */
  chainId: number;
  
  /** Transaction hash on the blockchain */
  txHash: string;
  
  /** Entity that issued the attestation */
  issuer: string;
  
  /** Reference to the associated event */
  eventId: string;
  
  /** Reference to the associated asset */
  assetId: string;
  
  /** IPFS CID of the attested content */
  cid: string;
  
  /** SHA-256 hash of the attested content */
  sha256: string;
  
  /** Timestamp when attestation was created (ISO 8601) */
  timestamp: string;
  
  /** Expiration timestamp (ISO 8601) */
  ttlExpiresAt: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Asset with computed fields
 */
export interface AssetWithMetadata extends Asset {
  /** Total number of events associated */
  eventCount?: number;
  
  /** Most recent event timestamp */
  lastEventAt?: string;
  
  /** Current overall status */
  overallStatus?: Status;
}

/**
 * Event with related asset information
 */
export interface EventWithAsset extends Event {
  /** Associated asset information */
  asset?: Asset;
  
  /** Associated evidence information */
  evidence?: Evidence;
  
  /** Associated attestation information */
  attestation?: Attestation;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

