/**
 * Event types and utilities
 */

import type { EventType } from './index';

/**
 * Event type display names
 */
export const EVENT_TYPE_NAMES: Record<EventType, string> = {
  manufacturing: 'Manufactura',
  quality_control: 'Control de Calidad',
  compliance_check: 'Verificación de Cumplimiento',
  traceability_update: 'Actualización de Trazabilidad',
  process_validation: 'Validación de Proceso',
  safety_inspection: 'Inspección de Seguridad',
  environmental_audit: 'Auditoría Ambiental',
  certification: 'Certificación',
  carbon_footprint_measurement: 'Medición de Huella de Carbono',
  water_usage_tracking: 'Seguimiento de Uso de Agua',
  waste_management: 'Gestión de Residuos',
  renewable_energy_certification: 'Certificación de Energía Renovable',
  circular_economy_tracking: 'Seguimiento de Economía Circular',
  social_impact_measurement: 'Medición de Impacto Social',
  biodiversity_assessment: 'Evaluación de Biodiversidad',
  supply_chain_sustainability: 'Sostenibilidad de Cadena de Suministro',
  other: 'Otro',
};

/**
 * Event type color classes for UI
 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  manufacturing: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  quality_control: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  compliance_check: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
  traceability_update: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  process_validation: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  safety_inspection: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  environmental_audit: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  certification: 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400',
  carbon_footprint_measurement: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  water_usage_tracking: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  waste_management: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  renewable_energy_certification: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  circular_economy_tracking: 'bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400',
  social_impact_measurement: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400',
  biodiversity_assessment: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  supply_chain_sustainability: 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400',
  other: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400',
};

/**
 * Get event type display name
 */
export function getEventTypeName(eventType: EventType): string {
  return EVENT_TYPE_NAMES[eventType] || eventType;
}

/**
 * Get event type color classes
 */
export function getEventTypeColor(eventType: EventType): string {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.other;
}

