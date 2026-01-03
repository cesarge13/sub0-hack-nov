import { Wallet, Sun, Moon, ChevronDown, Power, Copy, Check, User, LogOut } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { AuthorizationStatus, PublicModeBanner } from './AccessControl';
import { useIsPublicMode } from './AccessControl';
import { useUser } from '../hooks/useUser';
import { usePermissions } from '../hooks/usePermissions';
import { getRoleName } from '../types/user';

interface WalletPanelProps {
  onShowLogin?: () => void;
}

export function WalletPanel({ onShowLogin }: WalletPanelProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, logout, isAuthenticated } = useUser();
  const { role } = usePermissions();

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
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const isConnecting = isPending;
  const isPublicMode = useIsPublicMode();

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side: Public Mode Badge + Authorization Status */}
        <div className="flex items-center gap-3">
          {isPublicMode && (
            <div className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                🌐 Modo Público
              </span>
            </div>
          )}
          {isConnected && <AuthorizationStatus />}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Login/User Button */}
          {!isAuthenticated ? (
            <button
              onClick={() => onShowLogin?.()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all"
            >
              <User className="w-5 h-5" />
              Iniciar Sesión
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name || user?.email}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                    {role && (
                      <div className="mt-2">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400">
                          {getRoleName(role)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
              {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
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
                    <button 
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Power className="w-4 h-4" />
                      <span className="text-sm">Desconectar Wallet</span>
                    </button>
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
