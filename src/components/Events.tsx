import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { isSustainabilityEvent, isSustainabilityStandard } from '../utils/sustainability';
import type { EventType } from '../types';
import { useEvents } from '../hooks/useEvents';
import { getEventTypeName } from '../types/events';

export function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Load events from IndexedDB
  const { events: dbEvents, isLoading } = useEvents();

  // Transform DB events to display format
  const events = useMemo(() => {
    return dbEvents.map(event => ({
      id: event.id,
      name: getEventTypeName(event.eventType),
      type: getEventTypeName(event.eventType),
      assetId: event.assetId,
      timestamp: new Date(event.timestamp).toLocaleString('es-ES'),
      status: event.status === 'valid' ? 'Completed' as const : event.status === 'pending' ? 'Pending' as const : event.status === 'expired' ? 'Failed' as const : 'Completed' as const,
      description: `${event.operator}${event.standardTag ? ` - ${event.standardTag}` : ''}`,
      actor: event.operator,
      hash: event.evidenceCid?.slice(0, 20) + '...' || 'N/A'
    }));
  }, [dbEvents]);

  // Fallback events for display (only if DB is empty and not loading)
  const fallbackEvents = [
    { 
      id: 'EVT-001', 
      name: 'Production Batch Created', 
      type: 'Manufacturing', 
      assetId: 'AST-001',
      timestamp: '2024-11-16 14:32:15', 
      status: 'Completed',
      description: 'New production batch #2024-11-001 initiated',
      actor: 'Factory A',
      hash: '0x7a9c8b3e...'
    },
    { 
      id: 'EVT-002', 
      name: 'Quality Inspection Passed', 
      type: 'Quality Control', 
      assetId: 'AST-002',
      timestamp: '2024-11-16 13:18:42', 
      status: 'Completed',
      description: 'Quality control inspection completed successfully',
      actor: 'QC Department',
      hash: '0x3f4a5b6c...'
    },
    { 
      id: 'EVT-003', 
      name: 'Compliance Check Failed', 
      type: 'Compliance', 
      assetId: 'AST-003',
      timestamp: '2024-11-16 11:05:33', 
      status: 'Failed',
      description: 'Environmental compliance check did not meet standards',
      actor: 'Eco Audit Ltd',
      hash: '0x9b8c7d6e...'
    },
    { 
      id: 'EVT-004', 
      name: 'Traceability Record Updated', 
      type: 'Traceability', 
      assetId: 'AST-004',
      timestamp: '2024-11-16 09:47:21', 
      status: 'Completed',
      description: 'Supply chain traceability record updated',
      actor: 'Logistics Corp',
      hash: '0x1a2b3c4d...'
    },
    { 
      id: 'EVT-005', 
      name: 'Process Validation Pending', 
      type: 'Process', 
      assetId: 'AST-005',
      timestamp: '2024-11-15 16:22:09', 
      status: 'Pending',
      description: 'Process validation report awaiting approval',
      actor: 'Engineering Team',
      hash: '0x8f7e6d5c...'
    },
    { 
      id: 'EVT-006', 
      name: 'Safety Inspection Completed', 
      type: 'Safety', 
      assetId: 'AST-006',
      timestamp: '2024-11-15 14:15:33', 
      status: 'Completed',
      description: 'Safety inspection completed and certified',
      actor: 'Safety Board',
      hash: '0x5c6d7e8f...'
    },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Pending': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Failed': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
      default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'Pending': return Clock;
      case 'Failed': return XCircle;
      default: return AlertCircle;
    }
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'Manufacturing': 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Quality Control': 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
      'Compliance': 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
      'Traceability': 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      'Process': 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      'Safety': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    };
    return colorMap[type] || 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Eventos Operativos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Registro y seguimiento de eventos de consumo de agua y energía en faenas mineras</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="Completed">Completado</option>
            <option value="Pending">Pendiente</option>
            <option value="Failed">Fallido</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos los Tipos</option>
            <option value="Manufacturing">Manufactura</option>
            <option value="Quality Control">Control de Calidad</option>
            <option value="Compliance">Cumplimiento</option>
            <option value="Traceability">Trazabilidad</option>
            <option value="Process">Proceso</option>
            <option value="Safety">Seguridad</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="text-sm">Mostrando {filteredEvents.length} eventos</span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Operador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha y Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredEvents.map((event) => {
                const StatusIcon = getStatusIcon(event.status);
                return (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{event.name}</span>
                          {/* Sustainability Badge */}
                          {(() => {
                            const isSustainability = event.type === 'Compliance' && event.description.toLowerCase().includes('environmental');
                            return isSustainability ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" title="Certificado Sostenible">
                                🌱 Certificado Sostenible
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{event.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                        {event.assetId}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{event.actor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {event.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {event.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

