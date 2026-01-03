/**
 * User Types and Roles
 * 
 * Definiciones de tipos para usuarios, roles y permisos
 */

/**
 * Roles de usuario disponibles en el sistema
 */
export type UserRole = 
  | 'visitor'      // Sin login, solo lectura pública
  | 'viewer'       // Usuario registrado, ver datos de su org
  | 'operator'     // Puede agregar datos
  | 'esg_responsible' // Responsable ESG
  | 'auditor'      // Auditor
  | 'certifier'    // Certificador (puede firmar)
  | 'admin';       // Administrador

/**
 * Permisos disponibles en el sistema
 */
export type Permission = 
  | 'view:public'           // Ver datos públicos
  | 'view:organization'    // Ver datos de su organización
  | 'view:all'             // Ver todos los datos
  | 'create:event'         // Crear eventos
  | 'create:asset'         // Crear activos
  | 'edit:event'           // Editar eventos
  | 'edit:asset'           // Editar activos
  | 'delete:event'         // Eliminar eventos
  | 'delete:asset'         // Eliminar activos
  | 'view:esg'             // Ver datos ESG
  | 'audit'                // Realizar auditorías
  | 'certify'              // Certificar datos
  | 'sign'                 // Firmar on-chain
  | 'manage:users'         // Gestionar usuarios
  | 'manage:settings'      // Gestionar configuración
  | '*';                   // Todos los permisos (admin)

/**
 * Mapeo de roles a permisos
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  visitor: ['view:public'],
  viewer: ['view:public', 'view:organization'],
  operator: [
    'view:public',
    'view:organization',
    'create:event',
    'create:asset',
    'edit:event',
    'edit:asset',
  ],
  esg_responsible: [
    'view:public',
    'view:organization',
    'create:event',
    'create:asset',
    'edit:event',
    'edit:asset',
    'view:esg',
  ],
  auditor: [
    'view:public',
    'view:organization',
    'view:all',
    'audit',
  ],
  certifier: [
    'view:public',
    'view:organization',
    'view:all',
    'certify',
    'sign',
  ],
  admin: ['*'], // Todos los permisos
};

/**
 * Información del usuario
 */
export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  walletAddress?: string; // Wallet vinculada (opcional)
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

/**
 * Información de la organización
 */
export interface Organization {
  id: string;
  name: string;
  sector: 'agro' | 'industria' | 'energia';
  location: string;
  isPublic: boolean; // Si los datos son públicos
  createdAt: string;
}

/**
 * Sesión de usuario
 */
export interface UserSession {
  user: User;
  organization?: Organization;
  permissions: Permission[];
  expiresAt: string;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Resultado de autenticación
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  organization?: Organization;
  error?: string;
  token?: string;
}

/**
 * Información para registro de usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  sector?: 'agro' | 'industria' | 'energia';
  role?: UserRole;
}

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  // Admin tiene todos los permisos
  if (permissions.includes('*')) {
    return true;
  }
  
  return permissions.includes(permission);
}

/**
 * Obtiene el nombre legible de un rol
 */
export function getRoleName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    visitor: 'Visitante',
    viewer: 'Visualizador',
    operator: 'Operador',
    esg_responsible: 'Responsable ESG',
    auditor: 'Auditor',
    certifier: 'Certificador',
    admin: 'Administrador',
  };
  
  return names[role] || role;
}

/**
 * Obtiene la descripción de un rol
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    visitor: 'Acceso público de solo lectura',
    viewer: 'Puede ver datos de su organización',
    operator: 'Puede crear y editar eventos y activos',
    esg_responsible: 'Responsable de datos ESG y sostenibilidad',
    auditor: 'Puede auditar todos los datos',
    certifier: 'Puede certificar y firmar eventos on-chain',
    admin: 'Acceso completo al sistema',
  };
  
  return descriptions[role] || '';
}

