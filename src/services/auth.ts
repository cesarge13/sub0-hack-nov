/**
 * Authentication Service
 * 
 * Servicio de autenticación con soporte para múltiples proveedores
 * Actualmente implementa autenticación mock para desarrollo
 * 
 * Para producción, reemplazar con:
 * - Supabase Auth
 * - Firebase Auth
 * - Auth0
 */

import type { User, Organization, LoginCredentials, RegisterData, AuthResult, UserSession, UserRole } from '../types/user';
import { ROLE_PERMISSIONS } from '../types/user';
import { logger } from '../utils/logger';

// Mock data storage (en producción, esto vendría de una base de datos)
const MOCK_USERS: User[] = [];
const MOCK_ORGANIZATIONS: Organization[] = [];
const MOCK_SESSIONS: Map<string, UserSession> = new Map();

/**
 * Inicializa datos mock para desarrollo
 */
function initializeMockData() {
  if (MOCK_ORGANIZATIONS.length === 0) {
    // Crear organización demo
    const demoOrg: Organization = {
      id: 'org-demo-001',
      name: 'Organización Demo',
      sector: 'industria',
      location: 'Santiago, Chile',
      isPublic: true,
      createdAt: new Date().toISOString(),
    };
    MOCK_ORGANIZATIONS.push(demoOrg);

    // Crear usuario admin demo
    const adminUser: User = {
      id: 'user-admin-001',
      email: 'admin@certifik.cl',
      name: 'Administrador Demo',
      organizationId: demoOrg.id,
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    MOCK_USERS.push(adminUser);

    // Crear usuario certificador demo
    const certifierUser: User = {
      id: 'user-certifier-001',
      email: 'certifier@certifik.cl',
      name: 'Certificador Demo',
      organizationId: demoOrg.id,
      role: 'certifier',
      walletAddress: '0x3A56cD71f82aAb21C93f9463e331a40Df89BCa3F', // Tu wallet
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    MOCK_USERS.push(certifierUser);
  }
}

// Inicializar datos mock al cargar el módulo
initializeMockData();

/**
 * Genera un token de sesión simple (en producción usar JWT)
 */
function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Login de usuario
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    logger.info('Attempting login', { email: credentials.email }, 'AUTH');
    
    // Buscar usuario
    const user = MOCK_USERS.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase() && 
      u.isActive
    );
    
    if (!user) {
      logger.warn('Login failed: user not found', { email: credentials.email }, 'AUTH');
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      };
    }
    
    // En producción, verificar contraseña con hash
    // Por ahora, cualquier contraseña funciona para usuarios mock
    if (credentials.password.length < 6) {
      return {
        success: false,
        error: 'Contraseña debe tener al menos 6 caracteres',
      };
    }
    
    // Obtener organización
    const organization = MOCK_ORGANIZATIONS.find(org => org.id === user.organizationId);
    
    // Crear sesión
    const sessionToken = generateSessionToken();
    const session: UserSession = {
      user: {
        ...user,
        lastLogin: new Date().toISOString(),
      },
      organization,
      permissions: getPermissionsForRole(user.role),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    };
    
    MOCK_SESSIONS.set(sessionToken, session);
    
    // Guardar en localStorage
    localStorage.setItem('certifik_session_token', sessionToken);
    localStorage.setItem('certifik_user', JSON.stringify(session.user));
    
    logger.info('Login successful', { userId: user.id, email: user.email }, 'AUTH');
    
    return {
      success: true,
      user: session.user,
      organization: session.organization,
      token: sessionToken,
    };
  } catch (error) {
    logger.error('Login error', { error }, 'AUTH');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Registro de nuevo usuario
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    logger.info('Attempting registration', { email: data.email }, 'AUTH');
    
    // Verificar si el usuario ya existe
    const existingUser = MOCK_USERS.find(u => 
      u.email.toLowerCase() === data.email.toLowerCase()
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'El email ya está registrado',
      };
    }
    
    // Crear organización si no existe
    let organization: Organization | undefined;
    if (data.organizationId) {
      organization = MOCK_ORGANIZATIONS.find(org => org.id === data.organizationId);
    } else if (data.organizationName) {
      // Crear nueva organización
      organization = {
        id: `org-${Date.now()}`,
        name: data.organizationName,
        sector: data.sector || 'industria',
        location: 'Chile',
        isPublic: false,
        createdAt: new Date().toISOString(),
      };
      MOCK_ORGANIZATIONS.push(organization);
    }
    
    if (!organization) {
      return {
        success: false,
        error: 'Debe especificar una organización',
      };
    }
    
    // Crear usuario
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      organizationId: organization.id,
      role: data.role || 'viewer',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    MOCK_USERS.push(newUser);
    
    // Crear sesión automáticamente
    const sessionToken = generateSessionToken();
    const session: UserSession = {
      user: newUser,
      organization,
      permissions: getPermissionsForRole(newUser.role),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    MOCK_SESSIONS.set(sessionToken, session);
    localStorage.setItem('certifik_session_token', sessionToken);
    localStorage.setItem('certifik_user', JSON.stringify(newUser));
    
    logger.info('Registration successful', { userId: newUser.id, email: newUser.email }, 'AUTH');
    
    return {
      success: true,
      user: newUser,
      organization,
      token: sessionToken,
    };
  } catch (error) {
    logger.error('Registration error', { error }, 'AUTH');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Logout de usuario
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('certifik_session_token');
  if (token) {
    MOCK_SESSIONS.delete(token);
  }
  localStorage.removeItem('certifik_session_token');
  localStorage.removeItem('certifik_user');
  logger.info('Logout successful', {}, 'AUTH');
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  const token = localStorage.getItem('certifik_session_token');
  if (!token) {
    return null;
  }
  
  const session = MOCK_SESSIONS.get(token);
  if (!session) {
    // Sesión expirada o inválida
    localStorage.removeItem('certifik_session_token');
    localStorage.removeItem('certifik_user');
    return null;
  }
  
  // Verificar expiración
  if (new Date(session.expiresAt) < new Date()) {
    MOCK_SESSIONS.delete(token);
    localStorage.removeItem('certifik_session_token');
    localStorage.removeItem('certifik_user');
    return null;
  }
  
  return session;
}

/**
 * Obtiene permisos para un rol
 */
function getPermissionsForRole(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Vincula una wallet a un usuario
 */
export async function linkWalletToUser(userId: string, walletAddress: string): Promise<boolean> {
  try {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      return false;
    }
    
    user.walletAddress = walletAddress.toLowerCase();
    
    // Actualizar en localStorage si es el usuario actual
    const currentUserStr = localStorage.getItem('certifik_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        currentUser.walletAddress = walletAddress.toLowerCase();
        localStorage.setItem('certifik_user', JSON.stringify(currentUser));
      }
    }
    
    logger.info('Wallet linked to user', { userId, walletAddress }, 'AUTH');
    return true;
  } catch (error) {
    logger.error('Error linking wallet', { error, userId, walletAddress }, 'AUTH');
    return false;
  }
}

/**
 * Obtiene todos los usuarios (solo admin)
 */
export async function getAllUsers(): Promise<User[]> {
  return [...MOCK_USERS];
}

/**
 * Obtiene todas las organizaciones
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  return [...MOCK_ORGANIZATIONS];
}

/**
 * Actualiza el rol de un usuario (solo admin)
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  try {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      return false;
    }
    
    user.role = newRole;
    
    // Actualizar sesión si existe
    const token = localStorage.getItem('certifik_session_token');
    if (token) {
      const session = MOCK_SESSIONS.get(token);
      if (session && session.user.id === userId) {
        session.user.role = newRole;
        session.permissions = getPermissionsForRole(newRole);
      }
    }
    
    logger.info('User role updated', { userId, newRole }, 'AUTH');
    return true;
  } catch (error) {
    logger.error('Error updating user role', { error, userId, newRole }, 'AUTH');
    return false;
  }
}

