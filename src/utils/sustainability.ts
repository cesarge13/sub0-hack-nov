/**
 * Sustainability utilities and helpers
 */

import type { Event, EventType, Asset } from '../types';

/**
 * Check if an event type is related to sustainability
 */
export function isSustainabilityEvent(eventType: EventType): boolean {
  const sustainabilityTypes: EventType[] = [
    'environmental_audit',
    'carbon_footprint_measurement',
    'water_usage_tracking',
    'waste_management',
    'renewable_energy_certification',
    'circular_economy_tracking',
    'social_impact_measurement',
    'biodiversity_assessment',
    'supply_chain_sustainability'
  ];
  return sustainabilityTypes.includes(eventType);
}

/**
 * Check if a standard tag is related to sustainability
 */
export function isSustainabilityStandard(standardTag?: string): boolean {
  if (!standardTag) return false;
  const sustainabilityStandards = [
    'ISO 14001',
    'ISO 50001',
    'ISO 14064',
    'ISO 14046',
    'GRI',
    'SDG',
    'SDGs',
    'Carbon Trust',
    'B-Corp',
    'I-REC',
    'REC',
    'BS 8001'
  ];
  return sustainabilityStandards.some(standard => 
    standardTag.toUpperCase().includes(standard.toUpperCase())
  );
}

/**
 * Check if an asset has sustainability-related events
 */
export function hasSustainabilityEvents(assetId: string, events: Event[]): boolean {
  return events.some(event => 
    event.assetId === assetId && 
    (isSustainabilityEvent(event.eventType) || isSustainabilityStandard(event.standardTag))
  );
}

/**
 * Check if an asset has renewable energy certification
 */
export function hasRenewableEnergyCertification(assetId: string, events: Event[]): boolean {
  return events.some(event => 
    event.assetId === assetId && 
    event.eventType === 'renewable_energy_certification' &&
    event.status === 'valid'
  );
}

/**
 * Check if an asset has circular economy tracking
 */
export function hasCircularEconomyTracking(assetId: string, events: Event[]): boolean {
  return events.some(event => 
    event.assetId === assetId && 
    event.eventType === 'circular_economy_tracking' &&
    event.status === 'valid'
  );
}

/**
 * Check if an asset is aligned with SDGs
 */
export function isSDGAligned(assetId: string, events: Event[]): boolean {
  return events.some(event => 
    event.assetId === assetId && 
    event.standardTag?.toUpperCase().includes('SDG') &&
    event.status === 'valid'
  );
}

/**
 * Get sustainability badges for an asset
 */
export interface SustainabilityBadge {
  label: string;
  icon: string;
  color: string;
}

export function getSustainabilityBadges(assetId: string, events: Event[]): SustainabilityBadge[] {
  const badges: SustainabilityBadge[] = [];
  
  if (hasRenewableEnergyCertification(assetId, events)) {
    badges.push({
      label: 'Energía Renovable',
      icon: '⚡',
      color: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
    });
  }
  
  if (hasCircularEconomyTracking(assetId, events)) {
    badges.push({
      label: 'Economía Circular',
      icon: '♻️',
      color: 'bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/20'
    });
  }
  
  if (isSDGAligned(assetId, events)) {
    badges.push({
      label: 'SDG Aligned',
      icon: '🌍',
      color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
    });
  }
  
  if (hasSustainabilityEvents(assetId, events)) {
    badges.push({
      label: 'Certificado Sostenible',
      icon: '🌱',
      color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    });
  }
  
  return badges;
}

