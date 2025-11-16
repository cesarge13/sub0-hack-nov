/**
 * Arkiv Configuration
 * 
 * Centralized configuration for Arkiv Network integration.
 * Update these values based on your environment and Arkiv API documentation.
 */

/**
 * Arkiv Configuration
 * 
 * All configuration values are loaded from environment variables.
 * See .env.example for required variables.
 */

export const ARKIV_CONFIG = {
  // Mendoza Network RPC HTTP - Loaded from VITE_MENDOZA_RPC
  mendozaRPC: import.meta.env.VITE_MENDOZA_RPC || 'https://mendoza.hoodi.arkiv.network/rpc',
  
  // Mendoza Network RPC WebSocket - Required for Arkiv SDK
  mendozaRPCWS: import.meta.env.VITE_MENDOZA_RPC_WS || 'wss://mendoza.hoodi.arkiv.network/rpc/ws',
  
  // Network Chain ID - Loaded from VITE_MENDOZA_CHAIN_ID
  chainId: Number(import.meta.env.VITE_MENDOZA_CHAIN_ID) || 60138453056,
  
  // Block Explorer URL - Loaded from VITE_MENDOZA_EXPLORER
  explorerUrl: import.meta.env.VITE_MENDOZA_EXPLORER || 'https://mendoza.hoodi.arkiv.network',
  
  // Use mock mode for development - Loaded from VITE_USE_MOCK
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  
  // Legacy API Base URL (for REST API if needed)
  apiBase: import.meta.env.VITE_ARKIV_API_BASE || 'https://api.arkiv.network',
  
  // API endpoints (these are relative to apiBase, for REST API)
  endpoints: {
    blob: '/blob',
    metadata: '/metadata',
    verify: '/verify',
  },
} as const;

