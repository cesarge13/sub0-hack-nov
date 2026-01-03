import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  Calendar, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { Asset, Event, Status } from '../types';
import { getStatusName, getStatusColor } from '../types/status';
import { getEventTypeName, getEventTypeColor } from '../types/events';
import { getSectorName } from '../types/sectors';
import { AddEventModal } from './AddEventModal';
import { isSustainabilityEvent, isSustainabilityStandard } from '../utils/sustainability';
import { useAssets } from '../hooks/useAssets';
import { useEvents } from '../hooks/useEvents';

interface AssetDetailPageProps {
  assetId: string;
  onBack: () => void;
}

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
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get status icon
 */
function getStatusIcon(status: Status) {
  switch (status) {
    case 'valid':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'expired':
      return XCircle;
    case 'revoked':
      return AlertCircle;
    default:
      return AlertCircle;
  }
}

export function AssetDetailPage({ assetId, onBack }: AssetDetailPageProps) {
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  
  // Load asset and events from IndexedDB
  const { assets, getAssetById } = useAssets();
  const { events: allEvents, getEventsForAsset, refreshEvents } = useEvents();
  
  // Get asset data
  const asset = useMemo(() => {
    return assets.find(a => a.id === assetId) || {
      id: assetId,
      name: 'Asset Not Found',
      type: 'Unknown',
      sector: 'industria' as const,
      location: 'Unknown',
      owner: 'Unknown',
      createdAt: new Date().toISOString()
    };
  }, [assets, assetId]);

  // Get events for this asset
  const events = useMemo(() => {
    return allEvents.filter(e => e.assetId === assetId);
  }, [allEvents, assetId]);

  // Update events when a new one is added
  const handleEventAdded = async (newEvent: Event) => {
    // Event is already saved to IndexedDB by AddEventModal
    // Just refresh the events list
    await refreshEvents();
    setShowAddEventModal(false);
  };

  // Sort events by timestamp (newest first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver a Activos</span>
      </button>

      {/* Asset Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {asset.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {asset.type}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="px-3 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium">
                    {getSectorName(asset.sector)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{asset.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{asset.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Creado {formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {asset.id}
            </code>
          </div>
        </div>
      </div>

      {/* Event Timeline Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Línea de Tiempo de Eventos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Historial cronológico de todos los eventos para este activo
            </p>
          </div>
          <button
            onClick={handleAddEvent}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Evento
          </button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />

          {/* Events */}
          <div className="space-y-8">
            {sortedEvents.map((event, index) => {
              const ttlRemaining = calculateTTLRemaining(event);
              const StatusIcon = getStatusIcon(event.status);
              const isExpired = ttlRemaining <= 0;
              const isExpiringSoon = ttlRemaining > 0 && ttlRemaining <= 30;

              return (
                <div key={event.id} className="relative flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 ${
                      event.status === 'valid' 
                        ? 'bg-emerald-500' 
                        : event.status === 'pending'
                        ? 'bg-amber-500'
                        : event.status === 'expired'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}>
                      <StatusIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {getEventTypeName(event.eventType)}
                          </h3>
                          {event.standardTag && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                              {event.standardTag}
                            </span>
                          )}
                          {/* Sustainability Badge */}
                          {(isSustainabilityEvent(event.eventType) || isSustainabilityStandard(event.standardTag)) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" title="Certificado Sostenible">
                              🌱 Certificado Sostenible
                            </span>
                          )}
                          {event.eventType === 'renewable_energy_certification' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20" title="Energía Renovable">
                              ⚡ Energía Renovable
                            </span>
                          )}
                          {event.eventType === 'circular_economy_tracking' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-lime-100 dark:bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-500/20" title="Economía Circular">
                              ♻️ Economía Circular
                            </span>
                          )}
                          {event.standardTag?.toUpperCase().includes('SDG') && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20" title="SDG Aligned">
                              🌍 SDG Aligned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Operador: <span className="font-medium text-gray-900 dark:text-white">{event.operator}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.timestamp)}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${
                            isExpired 
                              ? 'text-red-600 dark:text-red-400' 
                              : isExpiringSoon 
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {isExpired 
                                ? 'Expirado' 
                                : isExpiringSoon
                                ? `${ttlRemaining} días restantes`
                                : `${ttlRemaining} días restantes`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {getStatusName(event.status)}
                      </span>
                    </div>

                    {/* Evidence Section */}
                    {event.evidenceCid && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Evidencia</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                            CID: {event.evidenceCid.slice(0, 20)}...
                          </code>
                          {event.fileSha256 && (
                            <code className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                              SHA256: {event.fileSha256.slice(0, 20)}...
                            </code>
                          )}
                          <button
                            onClick={() => navigator.clipboard.writeText(event.evidenceCid || '')}
                            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Copiar CID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://ipfs.io/ipfs/${event.evidenceCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedEvents.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aún no hay eventos</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Comienza a rastrear eventos para este activo</p>
              <button
                onClick={handleAddEvent}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          assetId={assetId}
          onClose={() => setShowAddEventModal(false)}
          onEventAdded={handleEventAdded}
        />
      )}
    </div>
  );
}

