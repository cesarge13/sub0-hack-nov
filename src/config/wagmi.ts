import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

// Load configuration from environment variables
const MENDOZA_RPC = import.meta.env.VITE_MENDOZA_RPC || 'https://mendoza.hoodi.arkiv.network/rpc';
const MENDOZA_CHAIN_ID = Number(import.meta.env.VITE_MENDOZA_CHAIN_ID) || 60138453056;
const MENDOZA_EXPLORER = import.meta.env.VITE_MENDOZA_EXPLORER || 'https://mendoza.hoodi.arkiv.network';

// Definir la red Mendoza Network como una cadena personalizada
export const mendozaNetwork = defineChain({
  id: MENDOZA_CHAIN_ID,
  name: 'Mendoza Network',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [MENDOZA_RPC],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mendoza Explorer',
      url: MENDOZA_EXPLORER,
    },
  },
});

// Configuración de wagmi
export const wagmiConfig = createConfig({
  chains: [mendozaNetwork],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mendozaNetwork.id]: http(),
  },
});

