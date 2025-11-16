import { Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  isWalletConnected: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export function Header({ 
  isWalletConnected, 
  walletAddress, 
  onConnectWallet,
  onDisconnectWallet 
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const relayerStatus: 'online' | 'syncing' | 'error' = 'online';

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-end gap-4">
        {/* Network Selector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Polygon Amoy</span>
        </div>

        {/* Relayer Status */}
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          ${relayerStatus === 'online' 
            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
            : relayerStatus === 'syncing'
            ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
          }
        `}>
          {relayerStatus === 'online' ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium capitalize">{relayerStatus}</span>
        </div>

        {/* Wallet Connection */}
        {isWalletConnected && walletAddress ? (
          <button
            onClick={onDisconnectWallet}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
          >
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatAddress(walletAddress)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                250.00 USDC
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={onConnectWallet}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors shadow-lg shadow-green-500/20"
          >
            Connect Wallet
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>
    </header>
  );
}
