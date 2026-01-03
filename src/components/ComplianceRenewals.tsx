import React, { useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Shield, 
  TrendingDown,
  FileText,
  Calendar
} from 'lucide-react';
import type { Event, Asset, Status } from '../types';
import { getEventTypeName, getEventTypeColor } from '../types/events';
import { getStatusName, getStatusColor } from '../types/status';
import { getSectorName } from '../types/sectors';
import { useAssets } from '../hooks/useAssets';
import { useEvents } from '../hooks/useEvents';

/**
 * Calculate TTL remaining days from event timestamp and ttlDays
 */
function calculateTTLRemaining(event: Event): number {
  const eventDate = new Date(event.timestamp);
  const expirationDate = new Date(eventDate);
  expirationDate.setDate(expirationDate.getDate() + event.ttlDays);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determine risk level based on TTL remaining
 */
function getRiskLevel(ttlRemaining: number): 'critical' | 'high' | 'medium' | 'low' {
  if (ttlRemaining <= 0) return 'critical';
  if (ttlRemaining <= 7) return 'critical';
  if (ttlRemaining <= 14) return 'high';
  if (ttlRemaining <= 30) return 'medium';
  return 'low';
}

/**
 * Get risk level display info
 */
function getRiskLevelInfo(riskLevel: 'critical' | 'high' | 'medium' | 'low') {
  switch (riskLevel) {
    case 'critical':
      return {
        label: 'Crítico',
        color: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
        icon: AlertTriangle,
        description: 'Acción inmediata requerida - riesgo de incumplimiento'
      };
    case 'high':
      return {
        label: 'Alto',
        color: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
        icon: AlertTriangle,
        description: 'Urgent renewal needed - operational continuity at risk'
      };
    case 'medium':
      return {
        label: 'Medio',
        color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        icon: Clock,
        description: 'Renewal due soon - plan compliance renewal'
      };
    case 'low':
      return {
        label: 'Bajo',
        color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        icon: Clock,
        description: 'Monitor - renewal not urgent'
      };
  }
}

export function ComplianceRenewals() {
  // Load data from IndexedDB
  const { assets: dbAssets } = useAssets();
  const { events: dbEvents } = useEvents();

  // Use DB data
  const mockAssets = dbAssets;
  const mockEvents = dbEvents;

  // Fallback mock data (only if DB is empty)
  const fallbackAssets: Asset[] = [
    { id: 'AST-001', name: 'Production Batch #2024-11-001', type: 'Manufacturing Asset', sector: 'industria', location: 'Factory A, Santiago', owner: 'Company XYZ', createdAt: '2024-11-01T10:00:00Z' },
    { id: 'AST-002', name: 'Quality Control System', type: 'Quality Asset', sector: 'industria', location: 'Factory B, Valparaíso', owner: 'Company XYZ', createdAt: '2024-10-15T08:00:00Z' },
    { id: 'AST-003', name: 'Environmental Monitoring Station', type: 'Environmental Asset', sector: 'energia', location: 'Plant C, Antofagasta', owner: 'Eco Corp', createdAt: '2024-09-20T12:00:00Z' },
    { id: 'AST-004', name: 'Agro Supply Chain Batch', type: 'Supply Chain Asset', sector: 'agro', location: 'Farm D, Maule', owner: 'Agro Ltd', createdAt: '2024-10-01T09:00:00Z' },
  ];

  const fallbackEvents: Event[] = [
    {
      id: 'EVT-001',
      assetId: 'AST-001',
      eventType: 'compliance_check',
      standardTag: 'ISO 9001:2015',
      operator: 'Compliance Office',
      timestamp: '2024-10-20T09:00:00Z',
      ttlDays: 90,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0x7a9c8b3e5f2d1a4b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      status: 'valid',
      txHash: '0x1234...'
    },
    {
      id: 'EVT-002',
      assetId: 'AST-002',
      eventType: 'quality_control',
      standardTag: 'NOM-001-SSA1',
      operator: 'QC Department',
      timestamp: '2024-11-01T10:15:30Z',
      ttlDays: 180,
      evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      fileSha256: '0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
      status: 'valid'
    },
    {
      id: 'EVT-003',
      assetId: 'AST-003',
      eventType: 'environmental_audit',
      standardTag: 'ISO 14001',
      operator: 'Eco Audit Ltd',
      timestamp: '2024-10-15T11:30:00Z',
      ttlDays: 365,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
      status: 'valid'
    },
    {
      id: 'EVT-004',
      assetId: 'AST-001',
      eventType: 'safety_inspection',
      standardTag: 'NOM-030-STPS',
      operator: 'Safety Board',
      timestamp: '2024-11-05T08:45:00Z',
      ttlDays: 30,
      evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      fileSha256: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      status: 'valid'
    },
    {
      id: 'EVT-005',
      assetId: 'AST-004',
      eventType: 'certification',
      standardTag: 'HACCP',
      operator: 'Food Safety Authority',
      timestamp: '2024-10-10T14:20:00Z',
      ttlDays: 60,
      evidenceCid: undefined,
      fileSha256: undefined,
      status: 'pending'
    },
    {
      id: 'EVT-006',
      assetId: 'AST-002',
      eventType: 'compliance_check',
      standardTag: 'ISO 27001',
      operator: 'IT Security Office',
      timestamp: '2024-09-25T16:00:00Z',
      ttlDays: 90,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
      status: 'expired'
    },
  ];

  // Calculate TTL for each event and filter those expiring in 7/14/30 days
  const eventsWithTTL = useMemo(() => {
    return allEvents.map(event => {
      const ttlRemaining = calculateTTLRemaining(event);
      const riskLevel = getRiskLevel(ttlRemaining);
      const asset = allAssets.find(a => a.id === event.assetId);
      
      return {
        ...event,
        ttlRemaining,
        riskLevel,
        asset
      };
    }).filter(item => 
      item.ttlRemaining <= 30 || item.ttlRemaining <= 0 // Show events expiring in 30 days or less, or expired
    ).sort((a, b) => a.ttlRemaining - b.ttlRemaining); // Sort by TTL (most urgent first)
  }, []);

  // Group by risk level
  const groupedByRisk = useMemo(() => {
    const groups: Record<'critical' | 'high' | 'medium' | 'low', typeof eventsWithTTL> = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    eventsWithTTL.forEach(event => {
      groups[event.riskLevel].push(event);
    });

    return groups;
  }, [eventsWithTTL]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      critical: groupedByRisk.critical.length,
      high: groupedByRisk.high.length,
      medium: groupedByRisk.medium.length,
      low: groupedByRisk.low.length,
      total: eventsWithTTL.length
    };
  }, [groupedByRisk, eventsWithTTL]);

  const handleRecertify = (event: typeof eventsWithTTL[0]) => {
    // TODO: Navigate to asset detail page or open recertification modal
    console.log('Recertify event:', event.id);
    alert(`Iniciar proceso de re-certificación para: ${event.asset?.name || event.assetId}\nEvento: ${getEventTypeName(event.eventType)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Renovaciones de Certificación Sostenible</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitorea renovaciones de certificaciones de sostenibilidad y asegura continuidad operativa — Rastrea eventos que requieren re-certificación
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.critical}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Crítico (≤7 días)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.high}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Riesgo Alto (≤14 días)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.medium}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Medio (≤30 días)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Renovaciones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Eventos que Requieren Renovación de Certificación
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Events expiring within 30 days that require re-certification to maintain compliance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo de Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estándar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TTL Restante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nivel de Riesgo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {eventsWithTTL.map((event) => {
                const riskInfo = getRiskLevelInfo(event.riskLevel);
                const RiskIcon = riskInfo.icon;
                
                return (
                  <tr 
                    key={event.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                      event.riskLevel === 'critical' ? 'bg-red-50/30 dark:bg-red-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.asset?.name || event.assetId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {event.asset ? `${getSectorName(event.asset.sector)} • ${event.asset.location}` : 'Activo no encontrado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeName(event.eventType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.standardTag ? (
                        <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                          {event.standardTag}
                        </code>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${
                          event.ttlRemaining <= 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : event.ttlRemaining <= 7
                            ? 'text-red-600 dark:text-red-400'
                            : event.ttlRemaining <= 14
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          event.ttlRemaining <= 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : event.ttlRemaining <= 7
                            ? 'text-red-600 dark:text-red-400'
                            : event.ttlRemaining <= 14
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {event.ttlRemaining <= 0 
                            ? `Expired ${Math.abs(event.ttlRemaining)} days ago`
                            : `${event.ttlRemaining} days`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${riskInfo.color}`}>
                        <RiskIcon className="w-3.5 h-3.5" />
                        {riskInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {getStatusName(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRecertify(event)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-certificar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {eventsWithTTL.length === 0 && (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se requieren renovaciones</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos los eventos de cumplimiento están al día. No se necesitan renovaciones en los próximos 30 días.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Guía de Niveles de Riesgo</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
            const info = getRiskLevelInfo(level);
            const Icon = info.icon;
            return (
              <div key={level} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{info.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{info.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

