/**
 * useUser Hook
 * 
 * Hook para gestionar el estado del usuario actual
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentSession, logout as logoutService, linkWalletToUser } from '../services/auth';
import type { User, Organization, UserSession } from '../types/user';
import { logger } from '../utils/logger';

interface UseUserReturn {
  user: User | null;
  organization: Organization | null;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentSession = await getCurrentSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setOrganization(currentSession.organization || null);
      } else {
        setSession(null);
        setUser(null);
        setOrganization(null);
      }
    } catch (error) {
      logger.error('Error loading session', { error }, 'useUser');
      setSession(null);
      setUser(null);
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    
    // Escuchar cambios en localStorage (para cuando se hace login en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'certifik_session_token' || e.key === 'certifik_user') {
        loadSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSession]);

  const logout = useCallback(async () => {
    await logoutService();
    setSession(null);
    setUser(null);
    setOrganization(null);
  }, []);

  const linkWallet = useCallback(async (walletAddress: string) => {
    if (!user) {
      return false;
    }
    
    const success = await linkWalletToUser(user.id, walletAddress);
    if (success) {
      // Recargar sesión para obtener wallet actualizada
      await loadSession();
    }
    return success;
  }, [user, loadSession]);

  return {
    user,
    organization,
    session,
    isLoading,
    isAuthenticated: !!user,
    logout,
    linkWallet,
    refreshSession: loadSession,
  };
}

