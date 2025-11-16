import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

// Definir la red Mendoza Network como una cadena personalizada
export const mendozaNetwork = defineChain({
  id: 60138453056, // Chain ID de Mendoza Network
  name: 'Mendoza Network',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mendoza.hoodi.arkiv.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mendoza Explorer',
      url: 'https://mendoza.hoodi.arkiv.network',
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

