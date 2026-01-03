/**
 * Status types and utilities
 */

import type { Status } from './index';

/**
 * Status display names
 */
export const STATUS_NAMES: Record<Status, string> = {
  pending: 'Pendiente',
  valid: 'Válido',
  expired: 'Expirado',
  revoked: 'Revocado',
};

/**
 * Status color classes for UI
 */
export const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  valid: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  expired: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  revoked: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
};

/**
 * Get status display name
 */
export function getStatusName(status: Status): string {
  return STATUS_NAMES[status] || status;
}

/**
 * Get status color classes
 */
export function getStatusColor(status: Status): string {
  return STATUS_COLORS[status] || STATUS_COLORS.pending;
}

/**
 * Check if status is active (not expired or revoked)
 */
export function isStatusActive(status: Status): boolean {
  return status === 'valid' || status === 'pending';
}

