/**
 * Sector-specific types and utilities
 */

import type { Sector } from './index';

/**
 * Sector display names
 */
export const SECTOR_NAMES: Record<Sector, string> = {
  agro: 'Agroindustria',
  industria: 'Industria',
  energia: 'Energía',
};

/**
 * Sector descriptions
 */
export const SECTOR_DESCRIPTIONS: Record<Sector, string> = {
  agro: 'Sector agroindustrial y agrícola',
  industria: 'Sector industrial y manufacturero',
  energia: 'Sector energético y renovables',
};

/**
 * Get sector display name
 */
export function getSectorName(sector: Sector): string {
  return SECTOR_NAMES[sector] || sector;
}

/**
 * Get sector description
 */
export function getSectorDescription(sector: Sector): string {
  return SECTOR_DESCRIPTIONS[sector] || '';
}

