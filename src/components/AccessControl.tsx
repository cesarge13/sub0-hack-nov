/**
 * Access Control Components and Hooks
 * 
 * Sistema de control de acceso para Fase 1 (Demo):
 * - Modo público: cualquiera puede ver dashboards
 * - Allowlist: solo wallets autorizadas pueden firmar
 */

import { useAccount } from 'wagmi';
import { isAuthorizedSigner, isPublicMode, requiresPasscode, validatePasscode } from '../config/demo';
import { useMemo } from 'react';

/**
 * Hook para verificar si el usuario actual puede firmar/certificar
 * 
 * Requisitos (Fase 1 - Allowlist):
 * 1. Wallet conectada
 * 2. Wallet está en allowlist de autorizadas
 * 
 * Requisitos (Fase 2 - Permisos):
 * 1. Usuario autenticado con rol certifier/auditor/esg_responsible/admin
 * 2. Wallet conectada (opcional, puede estar vinculada al usuario)
 */
export function useCanSign(): boolean {
  const { address, isConnected } = useAccount();
  
  // Fase 2: Verificar permisos del usuario
  try {
    const { usePermissions } = require('../hooks/usePermissions');
    const { canSign } = usePermissions();
    
    // Si el usuario tiene permiso de firmar, verificar wallet
    if (canSign) {
      // Si el usuario tiene wallet vinculada, verificar que coincida
      // Si no tiene wallet vinculada, cualquier wallet autorizada funciona
      if (isConnected && address) {
        return true; // Usuario con permiso + wallet conectada
      }
      return false; // Usuario con permiso pero sin wallet
    }
  } catch (e) {
    // Si el hook no está disponible, usar lógica de Fase 1
  }
  
  // Fase 1: Fallback a allowlist
  if (!isConnected || !address) return false;
  return isAuthorizedSigner(address);
}

/**
 * Hook para verificar si el modo público está activo
 */
export function useIsPublicMode(): boolean {
  return isPublicMode();
}

/**
 * Hook para obtener el estado de autorización del usuario
 */
export function useAuthorizationStatus() {
  const { address, isConnected } = useAccount();
  const canSign = useCanSign();
  const isPublic = useIsPublicMode();
  
  return useMemo(() => {
    if (!isConnected || !address) {
      return {
        isConnected: false,
        canSign: false,
        isAuthorized: false,
        status: 'not_connected' as const,
        message: isPublic 
          ? 'Modo público - Puedes explorar sin wallet' 
          : 'Conecta tu wallet para continuar',
      };
    }
    
    if (canSign) {
      return {
        isConnected: true,
        canSign: true,
        isAuthorized: true,
        status: 'authorized' as const,
        message: '✅ Autorizado para firmar y certificar',
        address,
      };
    }
    
    return {
      isConnected: true,
      canSign: false,
      isAuthorized: false,
      status: 'unauthorized' as const,
      message: '⚠️ Solo lectura - Tu wallet no está autorizada para firmar',
      address,
    };
  }, [isConnected, address, canSign, isPublic]);
}

/**
 * Hook para verificar si se requiere passcode
 */
export function useRequiresPasscode(): boolean {
  return requiresPasscode();
}

/**
 * Hook para validar passcode
 */
export function useValidatePasscode() {
  return (passcode: string) => validatePasscode(passcode);
}

/**
 * Componente para mostrar el estado de autorización
 */
export function AuthorizationStatus() {
  const status = useAuthorizationStatus();
  
  if (!status.isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {status.message}
        </span>
      </div>
    );
  }
  
  if (status.isAuthorized) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {status.message}
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
      <div className="w-2 h-2 bg-amber-500 rounded-full" />
      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
        {status.message}
      </span>
    </div>
  );
}

/**
 * Componente para mostrar banner de modo público
 */
export function PublicModeBanner() {
  const isPublic = useIsPublicMode();
  
  if (!isPublic) return null;
  
  return (
    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🌐</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Modo Demo Público
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Puedes explorar todos los dashboards y datos sin necesidad de login. 
            Para certificar eventos, necesitas conectar una wallet autorizada.
          </p>
        </div>
      </div>
    </div>
  );
}

