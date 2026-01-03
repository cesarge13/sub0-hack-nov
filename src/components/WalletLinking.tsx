import React, { useState } from 'react';
import { Wallet, Link2, Check, AlertCircle, Loader2, Copy } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { useUser } from '../hooks/useUser';
import { logger } from '../utils/logger';

export function WalletLinking() {
  const { user, linkWallet } = useUser();
  const { address, isConnected } = useAccount();
  const { signMessage, isPending: isSigning } = useSignMessage();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLinkWallet = async () => {
    if (!isConnected || !address) {
      setError('Conecta tu wallet primero');
      return;
    }

    if (!user) {
      setError('Debes estar autenticado para vincular una wallet');
      return;
    }

    setIsLinking(true);
    setError(null);
    setSuccess(false);

    try {
      // Crear mensaje para firmar
      const message = `Link wallet to Certifik\n\nUser ID: ${user.id}\nEmail: ${user.email}\n\nThis will link your wallet to your account.`;

      // Firmar mensaje
      logger.info('Requesting signature for wallet linking', { userId: user.id, address }, 'WALLET_LINKING');
      
      const signature = await signMessage({ message });
      
      logger.info('Signature received, linking wallet', { userId: user.id, address, signature: signature.substring(0, 20) + '...' }, 'WALLET_LINKING');

      // Guardar wallet vinculada
      const success = await linkWallet(address);
      
      if (success) {
        setSuccess(true);
        logger.info('Wallet linked successfully', { userId: user.id, address }, 'WALLET_LINKING');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al vincular la wallet');
      }
    } catch (err) {
      logger.error('Error linking wallet', { error: err, userId: user.id, address }, 'WALLET_LINKING');
      
      if (err instanceof Error && err.message.includes('reject')) {
        setError('Firma cancelada por el usuario');
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al vincular wallet');
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return null; // No mostrar si no hay usuario autenticado
  }

  const isWalletLinked = user.walletAddress && 
    address && 
    user.walletAddress.toLowerCase() === address.toLowerCase();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Vincular Wallet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vincula tu wallet a tu cuenta para poder firmar y certificar eventos on-chain.
          </p>

          {/* Wallet Status */}
          {isConnected && address && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Wallet Conectada
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Linked Wallet Info */}
          {isWalletLinked && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">
                  Tu wallet está vinculada a tu cuenta
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Wallet vinculada exitosamente
              </p>
            </div>
          )}

          {/* Link Button */}
          {!isWalletLinked && (
            <button
              onClick={handleLinkWallet}
              disabled={!isConnected || isLinking || isSigning}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLinking || isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  {isConnected ? 'Vincular Wallet' : 'Conecta tu wallet primero'}
                </>
              )}
            </button>
          )}

          {/* Info */}
          {!isConnected && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Conecta tu wallet usando el botón en la parte superior para vincularla.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

