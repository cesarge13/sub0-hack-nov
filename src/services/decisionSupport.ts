/**
 * Decision Support Service
 * 
 * Genera recomendaciones inteligentes basadas en análisis de datos
 * para mejorar la toma de decisiones operativas y estratégicas
 */

import type { Asset, Event } from '../types';
import { calculateTTLRemaining } from '../utils/date';

export interface DecisionRecommendation {
  id: string;
  type: 'operational' | 'strategic';
  priority: 'high' | 'medium' | 'low';
  category: 'efficiency' | 'compliance' | 'sustainability' | 'cost';
  title: string;
  description: string;
  dataSource: {
    assets?: string[];
    events?: string[];
    metrics?: string[];
  };
  suggestedAction: string;
  expectedImpact: {
    carbonReduction?: number; // tCO₂e
    resourceSavings?: {
      water?: number; // litros
      energy?: number; // kWh
      waste?: number; // kg
    };
    costSavings?: number; // CLP
    efficiencyGain?: number; // porcentaje
  };
  confidence: number; // 0-100
  urgency: 'immediate' | 'soon' | 'planning';
  relatedData: {
    currentValue?: number;
    targetValue?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
  };
}

/**
 * Genera recomendaciones basadas en análisis de datos de activos y eventos
 */
export function generateRecommendations(
  assets: Asset[],
  events: Event[]
): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];

  // 1. RECOMENDACIÓN OPERATIVA: Renovaciones críticas
  const expiringEvents = events
    .map(e => ({ event: e, ttl: calculateTTLRemaining(e) }))
    .filter(({ ttl }) => ttl <= 30 && ttl > 0 && ttl <= 30)
    .sort((a, b) => a.ttl - b.ttl);

  if (expiringEvents.length > 0) {
    const critical = expiringEvents.filter(({ ttl }) => ttl <= 7);
    if (critical.length > 0) {
      recommendations.push({
        id: 'rec-compliance-critical',
        type: 'operational',
        priority: 'high',
        category: 'compliance',
        title: `${critical.length} certificación${critical.length > 1 ? 'es' : ''} crítica${critical.length > 1 ? 's' : ''} por vencer`,
        description: `Hay ${critical.length} evento${critical.length > 1 ? 's' : ''} que vencen en menos de 7 días. Renovar ahora evitará interrupciones operativas y posibles multas.`,
        dataSource: {
          events: critical.map(({ event }) => event.id)
        },
        suggestedAction: 'Renovar certificaciones críticas inmediatamente para mantener continuidad operativa',
        expectedImpact: {
          efficiencyGain: 100 // Mantener operaciones sin interrupciones
        },
        confidence: 95,
        urgency: 'immediate',
        relatedData: {
          currentValue: critical.length,
          targetValue: 0,
          trend: 'stable'
        }
      });
    }

    const highPriority = expiringEvents.filter(({ ttl }) => ttl > 7 && ttl <= 14);
    if (highPriority.length > 0) {
      recommendations.push({
        id: 'rec-compliance-high',
        type: 'operational',
        priority: 'medium',
        category: 'compliance',
        title: `${highPriority.length} certificación${highPriority.length > 1 ? 'es' : ''} requieren atención`,
        description: `Hay ${highPriority.length} evento${highPriority.length > 1 ? 's' : ''} que vencen en 8-14 días. Planificar renovación ahora evitará urgencias futuras.`,
        dataSource: {
          events: highPriority.map(({ event }) => event.id)
        },
        suggestedAction: 'Iniciar proceso de renovación en los próximos días',
        expectedImpact: {
          efficiencyGain: 80
        },
        confidence: 90,
        urgency: 'soon',
        relatedData: {
          currentValue: highPriority.length,
          targetValue: 0,
          trend: 'stable'
        }
      });
    }
  }

  // 2. RECOMENDACIÓN ESTRATÉGICA: Optimización energética
  const waterEvents = events.filter(e => e.eventType === 'water_usage_tracking' && e.status === 'valid');
  const energyEvents = events.filter(e => 
    (e.eventType === 'renewable_energy_certification' || 
     e.eventType === 'environmental_audit') && 
    e.status === 'valid'
  );

  if (waterEvents.length > 0 && energyEvents.length === 0) {
    recommendations.push({
      id: 'rec-energy-optimization',
      type: 'strategic',
      priority: 'medium',
      category: 'efficiency',
      title: 'Oportunidad de optimización energética',
      description: 'Tienes seguimiento de agua implementado pero falta optimización energética. Implementar certificación de energía renovable podría reducir costos operativos y emisiones significativamente.',
      dataSource: {
        events: waterEvents.map(e => e.id),
        metrics: ['water_usage', 'energy_consumption']
      },
      suggestedAction: 'Evaluar implementación de sistema de energía renovable o certificación ISO 50001',
      expectedImpact: {
        carbonReduction: 200, // tCO₂e estimado por año
        resourceSavings: {
          energy: 50000 // kWh estimado por año
        },
        costSavings: 5000000 // CLP estimado por año
      },
      confidence: 75,
      urgency: 'planning',
      relatedData: {
        currentValue: 0,
        targetValue: 1,
        trend: 'stable'
      }
    });
  }

  // 3. RECOMENDACIÓN OPERATIVA: Mejora de cobertura de eventos
  const lowEfficiencyAssets = assets.filter(asset => {
    const assetEvents = events.filter(e => e.assetId === asset.id && e.status === 'valid');
    return assetEvents.length < 2; // Menos de 2 eventos válidos
  });

  if (lowEfficiencyAssets.length > 0) {
    recommendations.push({
      id: 'rec-coverage-improvement',
      type: 'operational',
      priority: 'medium',
      category: 'efficiency',
      title: `${lowEfficiencyAssets.length} activo${lowEfficiencyAssets.length > 1 ? 's' : ''} con baja cobertura de eventos`,
      description: `Estos activos tienen pocos eventos registrados. Agregar más eventos de sostenibilidad mejorará la trazabilidad y permitirá mejores decisiones basadas en datos.`,
      dataSource: {
        assets: lowEfficiencyAssets.map(a => a.id)
      },
      suggestedAction: 'Agregar eventos de sostenibilidad (medición de carbono, uso de agua, gestión de residuos) a activos con baja cobertura',
      expectedImpact: {
        efficiencyGain: 15 // % estimado de mejora en trazabilidad
      },
      confidence: 80,
      urgency: 'soon',
      relatedData: {
        currentValue: lowEfficiencyAssets.length,
        targetValue: 0,
        trend: 'stable'
      }
    });
  }

  // 4. RECOMENDACIÓN ESTRATÉGICA: Acelerar reducción de carbono
  const carbonEvents = events.filter(e => 
    e.eventType === 'carbon_footprint_measurement' && e.status === 'valid'
  );
  const totalCarbonReduced = carbonEvents.length * 150; // Mock: 150 tCO₂e por evento

  if (totalCarbonReduced > 0) {
    const recentCarbonEvents = carbonEvents.filter(e => {
      const eventDate = new Date(e.timestamp);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return eventDate >= threeMonthsAgo;
    });

    const trend = recentCarbonEvents.length >= carbonEvents.length * 0.5 ? 'increasing' : 'stable';
    
    if (trend === 'stable' && carbonEvents.length >= 2) {
      recommendations.push({
        id: 'rec-carbon-acceleration',
        type: 'strategic',
        priority: 'medium',
        category: 'sustainability',
        title: 'Oportunidad de acelerar reducción de carbono',
        description: `Has reducido ${totalCarbonReduced} tCO₂e hasta ahora. Implementar más medidas de reducción podría acelerar el impacto y alcanzar metas de carbono neutralidad más rápido.`,
        dataSource: {
          events: carbonEvents.map(e => e.id),
          metrics: ['carbon_footprint', 'emissions']
        },
        suggestedAction: 'Implementar programa adicional de reducción de carbono: optimización de procesos, energía renovable, eficiencia de recursos',
        expectedImpact: {
          carbonReduction: 300 // tCO₂e adicional estimado por año
        },
        confidence: 70,
        urgency: 'planning',
        relatedData: {
          currentValue: totalCarbonReduced,
          targetValue: totalCarbonReduced + 300,
          trend: 'stable'
        }
      });
    }
  }

  // 5. RECOMENDACIÓN OPERATIVA: Optimización de recursos por sector
  const sectorAnalysis = ['agro', 'industria', 'energia'].map(sector => {
    const sectorAssets = assets.filter(a => a.sector === sector);
    const sectorEvents = events.filter(e => 
      sectorAssets.some(a => a.id === e.assetId) && e.status === 'valid'
    );
    
    const waterEvents = sectorEvents.filter(e => e.eventType === 'water_usage_tracking');
    const energyEvents = sectorEvents.filter(e => 
      e.eventType === 'renewable_energy_certification' || 
      e.eventType === 'environmental_audit'
    );
    const wasteEvents = sectorEvents.filter(e => e.eventType === 'waste_management');

    return {
      sector,
      assets: sectorAssets.length,
      events: sectorEvents.length,
      waterEvents: waterEvents.length,
      energyEvents: energyEvents.length,
      wasteEvents: wasteEvents.length,
      coverage: sectorAssets.length > 0 ? (sectorEvents.length / sectorAssets.length) : 0
    };
  });

  const lowCoverageSector = sectorAnalysis.find(s => s.coverage < 1.5 && s.assets > 0);
  if (lowCoverageSector) {
    recommendations.push({
      id: `rec-sector-${lowCoverageSector.sector}`,
      type: 'operational',
      priority: 'low',
      category: 'efficiency',
      title: `Mejorar cobertura de eventos en sector ${lowCoverageSector.sector}`,
      description: `El sector ${lowCoverageSector.sector} tiene ${lowCoverageSector.assets} activos pero solo ${lowCoverageSector.events} eventos registrados. Aumentar la cobertura permitirá mejores decisiones operativas.`,
      dataSource: {
        assets: assets.filter(a => a.sector === lowCoverageSector.sector).map(a => a.id),
        metrics: ['event_coverage', 'sector_efficiency']
      },
      suggestedAction: `Agregar eventos de sostenibilidad a activos del sector ${lowCoverageSector.sector}`,
      expectedImpact: {
        efficiencyGain: 10 // % estimado
      },
      confidence: 75,
      urgency: 'planning',
      relatedData: {
        currentValue: lowCoverageSector.coverage,
        targetValue: 2.0,
        trend: 'stable'
      }
    });
  }

  // 6. RECOMENDACIÓN ESTRATÉGICA: Expansión de estándares de sostenibilidad
  const sustainabilityStandards = new Set<string>();
  events.forEach(event => {
    if (event.standardTag && event.status === 'valid') {
      if (event.standardTag.includes('ISO 14001')) sustainabilityStandards.add('ISO 14001');
      if (event.standardTag.includes('ISO 50001')) sustainabilityStandards.add('ISO 50001');
      if (event.standardTag.includes('ISO 14064')) sustainabilityStandards.add('ISO 14064');
      if (event.standardTag.includes('GRI')) sustainabilityStandards.add('GRI');
      if (event.standardTag.includes('SDG')) sustainabilityStandards.add('SDG');
    }
  });

  const totalPossibleStandards = 5; // ISO 14001, ISO 50001, ISO 14064, GRI, SDG
  const coverage = (sustainabilityStandards.size / totalPossibleStandards) * 100;

  if (coverage < 60 && assets.length > 0) {
    recommendations.push({
      id: 'rec-standards-expansion',
      type: 'strategic',
      priority: 'medium',
      category: 'sustainability',
      title: 'Expandir cobertura de estándares de sostenibilidad',
      description: `Actualmente cubres ${sustainabilityStandards.size} de ${totalPossibleStandards} estándares principales (${coverage.toFixed(0)}%). Expandir la cobertura mejorará el posicionamiento y acceso a mercados internacionales.`,
      dataSource: {
        metrics: ['sustainability_standards_coverage']
      },
      suggestedAction: 'Implementar estándares faltantes: ISO 50001 (energía), ISO 14064 (carbono), GRI (reportes), SDGs (objetivos de desarrollo)',
      expectedImpact: {
        efficiencyGain: 25, // % estimado de mejora en posicionamiento
        costSavings: 2000000 // CLP estimado en acceso a mercados
      },
      confidence: 80,
      urgency: 'planning',
      relatedData: {
        currentValue: sustainabilityStandards.size,
        targetValue: totalPossibleStandards,
        trend: 'stable'
      }
    });
  }

  // Ordenar por prioridad (high > medium > low) y luego por urgencia
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const urgencyOrder = { immediate: 3, soon: 2, planning: 1 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });
}

