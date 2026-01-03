/**
 * IndexedDB service for persistent storage
 * Stores Assets, Events, and Attestations locally
 */

import type { Asset, Event, Attestation } from '../types';
import { logger } from '../utils/logger';

const DB_NAME = 'certifik-db';
const DB_VERSION = 1;

const STORES = {
  ASSETS: 'assets',
  EVENTS: 'events',
  ATTESTATIONS: 'attestations',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open IndexedDB', { error: request.error }, 'DB');
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      logger.debug('IndexedDB opened successfully', { dbName: DB_NAME }, 'DB');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create Assets store
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        const assetStore = db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
        assetStore.createIndex('sector', 'sector', { unique: false });
        assetStore.createIndex('owner', 'owner', { unique: false });
        assetStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create Events store
      if (!db.objectStoreNames.contains(STORES.EVENTS)) {
        const eventStore = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
        eventStore.createIndex('assetId', 'assetId', { unique: false });
        eventStore.createIndex('eventType', 'eventType', { unique: false });
        eventStore.createIndex('status', 'status', { unique: false });
        eventStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create Attestations store
      if (!db.objectStoreNames.contains(STORES.ATTESTATIONS)) {
        const attestationStore = db.createObjectStore(STORES.ATTESTATIONS, { keyPath: 'txHash' });
        attestationStore.createIndex('eventId', 'eventId', { unique: false });
        attestationStore.createIndex('assetId', 'assetId', { unique: false });
        attestationStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      logger.debug('IndexedDB schema created', { stores: Object.values(STORES) }, 'DB');
    };
  });
}

/**
 * Get database instance (initialize if needed)
 */
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// ============================================================================
// Assets Operations
// ============================================================================

export async function saveAsset(asset: Asset): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readwrite');
    const store = transaction.objectStore(STORES.ASSETS);
    const request = store.put(asset);

    request.onsuccess = () => {
      logger.debug('Asset saved', { assetId: asset.id }, 'DB');
      resolve();
    };

    request.onerror = () => {
      logger.error('Failed to save asset', { error: request.error, assetId: asset.id }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAsset(assetId: string): Promise<Asset | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readonly');
    const store = transaction.objectStore(STORES.ASSETS);
    const request = store.get(assetId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      logger.error('Failed to get asset', { error: request.error, assetId }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAllAssets(): Promise<Asset[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readonly');
    const store = transaction.objectStore(STORES.ASSETS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      logger.error('Failed to get all assets', { error: request.error }, 'DB');
      reject(request.error);
    };
  });
}

export async function deleteAsset(assetId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS], 'readwrite');
    const store = transaction.objectStore(STORES.ASSETS);
    const request = store.delete(assetId);

    request.onsuccess = () => {
      logger.debug('Asset deleted', { assetId }, 'DB');
      resolve();
    };

    request.onerror = () => {
      logger.error('Failed to delete asset', { error: request.error, assetId }, 'DB');
      reject(request.error);
    };
  });
}

// ============================================================================
// Events Operations
// ============================================================================

export async function saveEvent(event: Event): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EVENTS);
    const request = store.put(event);

    request.onsuccess = () => {
      logger.debug('Event saved', { eventId: event.id, assetId: event.assetId }, 'DB');
      resolve();
    };

    request.onerror = () => {
      logger.error('Failed to save event', { error: request.error, eventId: event.id }, 'DB');
      reject(request.error);
    };
  });
}

export async function getEvent(eventId: string): Promise<Event | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readonly');
    const store = transaction.objectStore(STORES.EVENTS);
    const request = store.get(eventId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      logger.error('Failed to get event', { error: request.error, eventId }, 'DB');
      reject(request.error);
    };
  });
}

export async function getEventsByAsset(assetId: string): Promise<Event[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readonly');
    const store = transaction.objectStore(STORES.EVENTS);
    const index = store.index('assetId');
    const request = index.getAll(assetId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      logger.error('Failed to get events by asset', { error: request.error, assetId }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAllEvents(): Promise<Event[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readonly');
    const store = transaction.objectStore(STORES.EVENTS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      logger.error('Failed to get all events', { error: request.error }, 'DB');
      reject(request.error);
    };
  });
}

export async function updateEventStatus(eventId: string, status: Event['status'], txHash?: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EVENTS);
    const getRequest = store.get(eventId);

    getRequest.onsuccess = () => {
      const event = getRequest.result;
      if (!event) {
        reject(new Error(`Event ${eventId} not found`));
        return;
      }

      const updatedEvent: Event = {
        ...event,
        status,
        ...(txHash && { txHash }),
      };

      const putRequest = store.put(updatedEvent);
      putRequest.onsuccess = () => {
        logger.debug('Event status updated', { eventId, status, txHash }, 'DB');
        resolve();
      };
      putRequest.onerror = () => {
        logger.error('Failed to update event status', { error: putRequest.error, eventId }, 'DB');
        reject(putRequest.error);
      };
    };

    getRequest.onerror = () => {
      logger.error('Failed to get event for update', { error: getRequest.error, eventId }, 'DB');
      reject(getRequest.error);
    };
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EVENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EVENTS);
    const request = store.delete(eventId);

    request.onsuccess = () => {
      logger.debug('Event deleted', { eventId }, 'DB');
      resolve();
    };

    request.onerror = () => {
      logger.error('Failed to delete event', { error: request.error, eventId }, 'DB');
      reject(request.error);
    };
  });
}

// ============================================================================
// Attestations Operations
// ============================================================================

export async function saveAttestation(attestation: Attestation): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTESTATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.ATTESTATIONS);
    const request = store.put(attestation);

    request.onsuccess = () => {
      logger.debug('Attestation saved', { txHash: attestation.txHash, eventId: attestation.eventId }, 'DB');
      resolve();
    };

    request.onerror = () => {
      logger.error('Failed to save attestation', { error: request.error, txHash: attestation.txHash }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAttestation(txHash: string): Promise<Attestation | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTESTATIONS], 'readonly');
    const store = transaction.objectStore(STORES.ATTESTATIONS);
    const request = store.get(txHash);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      logger.error('Failed to get attestation', { error: request.error, txHash }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAttestationsByEvent(eventId: string): Promise<Attestation[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTESTATIONS], 'readonly');
    const store = transaction.objectStore(STORES.ATTESTATIONS);
    const index = store.index('eventId');
    const request = index.getAll(eventId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      logger.error('Failed to get attestations by event', { error: request.error, eventId }, 'DB');
      reject(request.error);
    };
  });
}

export async function getAllAttestations(): Promise<Attestation[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTESTATIONS], 'readonly');
    const store = transaction.objectStore(STORES.ATTESTATIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      logger.error('Failed to get all attestations', { error: request.error }, 'DB');
      reject(request.error);
    };
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all data (useful for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ASSETS, STORES.EVENTS, STORES.ATTESTATIONS], 'readwrite');
    
    let completed = 0;
    const total = 3;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        logger.debug('All data cleared', {}, 'DB');
        resolve();
      }
    };

    transaction.objectStore(STORES.ASSETS).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.EVENTS).clear().onsuccess = checkComplete;
    transaction.objectStore(STORES.ATTESTATIONS).clear().onsuccess = checkComplete;

    transaction.onerror = () => {
      logger.error('Failed to clear data', { error: transaction.error }, 'DB');
      reject(transaction.error);
    };
  });
}

/**
 * Initialize database and seed with mock data if empty
 */
export async function initDBWithMockData(): Promise<void> {
  try {
    await initDB();
    
    const assets = await getAllAssets();
    const events = await getAllEvents();

    // Only seed if database is empty
    if (assets.length === 0 && events.length === 0) {
      logger.debug('Seeding database with mock data', {}, 'DB');
      
      // Mock assets
      const mockAssets: Asset[] = [
        { id: 'AST-001', name: 'Production Batch #2024-11-001', type: 'Manufacturing Asset', sector: 'industria', location: 'Factory A, Santiago', owner: 'Company XYZ', createdAt: '2024-11-01T10:00:00Z' },
        { id: 'AST-002', name: 'Quality Control System', type: 'Quality Asset', sector: 'industria', location: 'Factory B, Valparaíso', owner: 'Company XYZ', createdAt: '2024-10-15T08:00:00Z' },
        { id: 'AST-003', name: 'Environmental Monitoring Station', type: 'Environmental Asset', sector: 'energia', location: 'Plant C, Antofagasta', owner: 'Eco Corp', createdAt: '2024-09-20T12:00:00Z' },
        { id: 'AST-004', name: 'Agro Supply Chain Batch', type: 'Supply Chain Asset', sector: 'agro', location: 'Farm D, Maule', owner: 'Agro Ltd', createdAt: '2024-10-01T09:00:00Z' },
        { id: 'AST-005', name: 'Planta Solar Fotovoltaica - Región de Atacama', type: 'Renewable Energy Asset', sector: 'energia', location: 'Atacama Desert, Chile', owner: 'Solar Energy Corp', createdAt: '2024-08-10T14:00:00Z' },
        { id: 'AST-006', name: 'Agro Processing Facility', type: 'Processing Asset', sector: 'agro', location: 'Facility F, Ñuble', owner: 'Agro Ltd', createdAt: '2024-09-05T11:00:00Z' },
        { id: 'AST-007', name: 'Sistema de Tratamiento de Aguas Residuales', type: 'Water Management Asset', sector: 'industria', location: 'Factory G, Concepción', owner: 'Water Solutions Ltd', createdAt: '2024-09-15T10:00:00Z' },
        { id: 'AST-008', name: 'Centro de Reciclaje y Economía Circular', type: 'Circular Economy Asset', sector: 'industria', location: 'Plant H, Valparaíso', owner: 'Circular Economy Corp', createdAt: '2024-10-20T08:00:00Z' },
      ];

      // Mock events
      const mockEvents: Event[] = [
        {
          id: 'EVT-001',
          assetId: 'AST-001',
          eventType: 'compliance_check',
          standardTag: 'ISO 9001:2015',
          operator: 'Compliance Office',
          timestamp: '2024-10-20T09:00:00Z',
          ttlDays: 90,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0x7a9c8b3e5f2d1a4b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
          status: 'valid',
          txHash: '0x1234...'
        },
        {
          id: 'EVT-002',
          assetId: 'AST-002',
          eventType: 'quality_control',
          standardTag: 'NOM-001-SSA1',
          operator: 'QC Department',
          timestamp: '2024-11-01T10:15:30Z',
          ttlDays: 180,
          evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          fileSha256: '0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
          status: 'valid'
        },
        {
          id: 'EVT-003',
          assetId: 'AST-003',
          eventType: 'environmental_audit',
          standardTag: 'ISO 14001',
          operator: 'Eco Audit Ltd',
          timestamp: '2024-10-15T11:30:00Z',
          ttlDays: 365,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
          status: 'valid'
        },
        {
          id: 'EVT-004',
          assetId: 'AST-001',
          eventType: 'safety_inspection',
          standardTag: 'NOM-030-STPS',
          operator: 'Safety Board',
          timestamp: '2024-11-05T08:45:00Z',
          ttlDays: 30,
          evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          fileSha256: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
          status: 'valid'
        },
        {
          id: 'EVT-005',
          assetId: 'AST-004',
          eventType: 'certification',
          standardTag: 'HACCP',
          operator: 'Food Safety Authority',
          timestamp: '2024-10-10T14:20:00Z',
          ttlDays: 60,
          evidenceCid: undefined,
          fileSha256: undefined,
          status: 'pending'
        },
        {
          id: 'EVT-006',
          assetId: 'AST-002',
          eventType: 'compliance_check',
          standardTag: 'ISO 27001',
          operator: 'IT Security Office',
          timestamp: '2024-09-25T16:00:00Z',
          ttlDays: 90,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
          status: 'expired'
        },
        {
          id: 'EVT-007',
          assetId: 'AST-005',
          eventType: 'renewable_energy_certification',
          standardTag: 'I-REC (International Renewable Energy Certificate)',
          operator: 'Renewable Energy Authority',
          timestamp: '2024-11-10T09:00:00Z',
          ttlDays: 365,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
          status: 'valid',
          txHash: '0x7890...'
        },
        {
          id: 'EVT-008',
          assetId: 'AST-005',
          eventType: 'carbon_footprint_measurement',
          standardTag: 'ISO 14064-1',
          operator: 'Carbon Trust',
          timestamp: '2024-11-01T10:00:00Z',
          ttlDays: 180,
          evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          fileSha256: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
          status: 'valid',
          txHash: '0x8901...'
        },
        {
          id: 'EVT-009',
          assetId: 'AST-007',
          eventType: 'water_usage_tracking',
          standardTag: 'ISO 14046',
          operator: 'Water Management Authority',
          timestamp: '2024-11-05T08:00:00Z',
          ttlDays: 90,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
          status: 'valid'
        },
        {
          id: 'EVT-010',
          assetId: 'AST-008',
          eventType: 'circular_economy_tracking',
          standardTag: 'BS 8001:2017',
          operator: 'Circular Economy Institute',
          timestamp: '2024-11-08T10:00:00Z',
          ttlDays: 365,
          evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          fileSha256: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
          status: 'valid',
          txHash: '0x9012...'
        },
        {
          id: 'EVT-011',
          assetId: 'AST-004',
          eventType: 'waste_management',
          standardTag: 'ISO 14001',
          operator: 'Waste Management Authority',
          timestamp: '2024-10-25T14:00:00Z',
          ttlDays: 180,
          evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
          fileSha256: '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
          status: 'valid'
        },
      ];

      // Save all assets
      for (const asset of mockAssets) {
        await saveAsset(asset);
      }

      // Save all events
      for (const event of mockEvents) {
        await saveEvent(event);
      }

      logger.debug('Mock data seeded successfully', { assets: mockAssets.length, events: mockEvents.length }, 'DB');
    }
  } catch (error) {
    logger.error('Failed to initialize DB with mock data', { error: error instanceof Error ? error.message : 'Unknown' }, 'DB');
    throw error;
  }
}

