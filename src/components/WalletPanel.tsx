import { Wallet, Sun, Moon, ChevronDown, ExternalLink, Power, Copy, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { mendozaNetwork } from '../config/wagmi';
import { ARKIV_CONFIG } from '../utils/arkiv/config';

export function WalletPanel() {
  const { theme, toggleTheme } = useTheme();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    // Intentar conectar con el primer connector disponible (MetaMask o Injected)
    const connector = connectors.find(c => c.id === 'metaMask') || connectors[0];
    if (connector) {
      connect({ connector, chainId: mendozaNetwork.id });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const explorerUrl = ARKIV_CONFIG.explorerUrl;
  const isConnecting = isPending;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Tech Stack Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 dark:border-teal-500/30">
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400">
              Vite + React + TypeScript + wagmi
            </span>
          </div>
          
          {/* Network Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
              Mendoza Network
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Wallet Connection */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
            >
              <Wallet className="w-5 h-5" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 dark:border-teal-500/30 hover:border-teal-500/40 dark:hover:border-teal-500/50 transition-all"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <code className="text-sm font-mono text-teal-700 dark:text-teal-400">
                  {address ? formatAddress(address) : ''}
                </code>
                <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Connected Address</span>
                      <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {address}
                    </code>
                  </div>

                  <div className="p-2">
                    <a
                      href={`${explorerUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">View on Explorer</span>
                    </a>
                    <button 
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Power className="w-4 h-4" />
                      <span className="text-sm">Disconnect</span>
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">RPC Endpoint</div>
                    <code className="text-xs font-mono text-teal-600 dark:text-teal-400 break-all">
                      https://mendoza.hoodi.arkiv.network/rpc
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
