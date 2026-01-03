/**
 * Demo Configuration
 * 
 * Configuración para modo demo público y allowlist de wallets autorizadas
 * para firmar/certificar eventos en blockchain.
 */

export interface DemoConfig {
  /** Modo público: cualquiera puede ver dashboards sin login */
  publicMode: boolean;
  
  /** Lista de direcciones de wallets autorizadas para firmar */
  authorizedSigners: string[];
  
  /** Passcode opcional para proteger dashboards (null = sin protección) */
  dashboardPasscode: string | null;
  
  /** Mensaje mostrado en modo público */
  publicModeMessage?: string;
}

/**
 * Configuración de demo
 * 
 * Para agregar wallets autorizadas, agrega las direcciones en minúsculas
 * al array `authorizedSigners`.
 */
export const DEMO_CONFIG: DemoConfig = {
  // Modo público: cualquiera puede ver dashboards sin login
  publicMode: true,
  
  // Allowlist de wallets autorizadas para firmar/certificar
  // Agrega aquí las direcciones de wallets de certificadores/auditores
  authorizedSigners: [
    '0x3A56cD71f82aAb21C93f9463e331a40Df89BCa3F', // Wallet principal
    // Ejemplo: '0x1234567890123456789012345678901234567890',
    // Ejemplo: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    // Agregar más según necesites
  ],
  
  // Passcode opcional para dashboards (null = sin protección)
  // Si quieres proteger los dashboards, cambia a: dashboardPasscode: 'demo2024'
  dashboardPasscode: null,
  
  // Mensaje personalizado para modo público
  publicModeMessage: '📊 Modo Demo Público - Puedes explorar todos los dashboards sin login',
};

/**
 * Verifica si una dirección de wallet está autorizada para firmar
 */
export function isAuthorizedSigner(address: string | undefined | null): boolean {
  if (!address) return false;
  
  return DEMO_CONFIG.authorizedSigners
    .map(addr => addr.toLowerCase())
    .includes(address.toLowerCase());
}

/**
 * Verifica si el modo público está activo
 */
export function isPublicMode(): boolean {
  return DEMO_CONFIG.publicMode;
}

/**
 * Verifica si el dashboard requiere passcode
 */
export function requiresPasscode(): boolean {
  return DEMO_CONFIG.dashboardPasscode !== null;
}

/**
 * Verifica si el passcode es correcto
 */
export function validatePasscode(passcode: string): boolean {
  if (!DEMO_CONFIG.dashboardPasscode) return true; // Sin protección
  return passcode === DEMO_CONFIG.dashboardPasscode;
}

