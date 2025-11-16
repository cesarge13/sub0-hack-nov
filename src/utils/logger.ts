/**
 * Logger Utility
 * 
 * Provides structured logging for debugging and monitoring.
 * Logs to console with different levels and can be extended to send to external services.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  private enabled: boolean = true;
  private minLevel: LogLevel = LogLevel.DEBUG;

  constructor() {
    // Enable logging in development, disable in production
    this.enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true';
    this.minLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    
    return currentLevelIndex >= minLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentStr = component ? `[${component}]` : '';
    return `[${timestamp}] [${level}] ${componentStr} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any, component?: string): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, component);
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };

    // Console output with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }

    // Store in window for debugging (optional)
    if (typeof window !== 'undefined') {
      if (!(window as any).__arkivLogs) {
        (window as any).__arkivLogs = [];
      }
      (window as any).__arkivLogs.push(entry);
      
      // Keep only last 100 logs
      if ((window as any).__arkivLogs.length > 100) {
        (window as any).__arkivLogs.shift();
      }
    }
  }

  debug(message: string, data?: any, component?: string): void {
    this.log(LogLevel.DEBUG, message, data, component);
  }

  info(message: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.log(LogLevel.WARN, message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.log(LogLevel.ERROR, message, data, component);
  }

  // Convenience methods for specific components
  encryption(message: string, data?: any): void {
    this.debug(message, data, 'ENCRYPTION');
  }

  wallet(message: string, data?: any): void {
    this.debug(message, data, 'WALLET');
  }

  arkiv(message: string, data?: any): void {
    this.debug(message, data, 'ARKIV');
  }

  flow(message: string, data?: any): void {
    this.info(message, data, 'FLOW');
  }

  // Get all logs (for debugging)
  getLogs(): LogEntry[] {
    if (typeof window !== 'undefined' && (window as any).__arkivLogs) {
      return (window as any).__arkivLogs;
    }
    return [];
  }

  // Clear logs
  clearLogs(): void {
    if (typeof window !== 'undefined') {
      (window as any).__arkivLogs = [];
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for convenience
export default logger;

