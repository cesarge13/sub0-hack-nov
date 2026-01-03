/**
 * usePermissions Hook
 * 
 * Hook para gestionar permisos del usuario actual
 */

import { useMemo } from 'react';
import { useUser } from './useUser';
import { ROLE_PERMISSIONS, hasPermission, type Permission, type UserRole } from '../types/user';

interface UsePermissionsReturn {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  canSign: boolean;
  canCertify: boolean;
  canCreateEvent: boolean;
  canCreateAsset: boolean;
  canEditEvent: boolean;
  canEditAsset: boolean;
  canDeleteEvent: boolean;
  canDeleteAsset: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  role: UserRole | null;
  isAdmin: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useUser();

  const permissions = useMemo(() => {
    if (!user || !isAuthenticated) {
      // Visitante solo tiene acceso público
      return ROLE_PERMISSIONS.visitor;
    }
    
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user, isAuthenticated]);

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) {
        return permission === 'view:public';
      }
      
      // Admin tiene todos los permisos
      if (permissions.includes('*')) {
        return true;
      }
      
      return permissions.includes(permission);
    };
  }, [user, permissions]);

  const canSign = checkPermission('sign');
  const canCertify = checkPermission('certify');
  const canCreateEvent = checkPermission('create:event');
  const canCreateAsset = checkPermission('create:asset');
  const canEditEvent = checkPermission('edit:event');
  const canEditAsset = checkPermission('edit:asset');
  const canDeleteEvent = checkPermission('delete:event');
  const canDeleteAsset = checkPermission('delete:asset');
  const canViewAll = checkPermission('view:all');
  const canManageUsers = checkPermission('manage:users');
  const canManageSettings = checkPermission('manage:settings');
  const isAdmin = user?.role === 'admin' || permissions.includes('*');

  return {
    permissions,
    hasPermission: checkPermission,
    canSign,
    canCertify,
    canCreateEvent,
    canCreateAsset,
    canEditEvent,
    canEditAsset,
    canDeleteEvent,
    canDeleteAsset,
    canViewAll,
    canManageUsers,
    canManageSettings,
    role: user?.role || null,
    isAdmin,
  };
}

