/**
 * Date utility functions
 */

import type { Event } from '../types';

/**
 * Calculate TTL remaining days from event timestamp and ttlDays
 */
export function calculateTTLRemaining(event: Event): number {
  const eventDate = new Date(event.timestamp);
  const expirationDate = new Date(eventDate);
  expirationDate.setDate(expirationDate.getDate() + event.ttlDays);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time string (e.g., "hace 2 días")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 1 ? 'hace un momento' : `hace ${diffMinutes} minutos`;
    }
    return diffHours === 1 ? 'hace una hora' : `hace ${diffHours} horas`;
  }
  
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'hace una semana' : `hace ${weeks} semanas`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'hace un mes' : `hace ${months} meses`;
  }
  
  const years = Math.floor(diffDays / 365);
  return years === 1 ? 'hace un año' : `hace ${years} años`;
}

