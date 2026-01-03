import React, { useState } from 'react';
import { Search, Filter, Upload, Download, Eye, RefreshCw, Package } from 'lucide-react';
import { DocumentRegister } from './DocumentRegister';
import { getSustainabilityBadges } from '../utils/sustainability';
import type { Event } from '../types';
import { useAssets } from '../hooks/useAssets';
import { useEvents } from '../hooks/useEvents';

interface AssetsProps {
  onUploadDocument: () => void;
  onAssetClick?: (assetId: string) => void;
}

export function Assets({ onUploadDocument, onAssetClick }: AssetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDocumentRegister, setShowDocumentRegister] = useState(false);

  // Load assets and events from IndexedDB
  const { assets: dbAssets, isLoading: assetsLoading } = useAssets();
  const { events: dbEvents } = useEvents();

  // Use DB data
  const assets = dbAssets.length > 0 ? dbAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    issuer: asset.owner,
    version: 'v1.0.0', // Default version
    ttl: 90, // Default TTL - could calculate from events
    integrity: 98, // Default integrity - could calculate from events
    status: 'Valid' as const, // Default status - could calculate from events
    hash: '0x...' // Default hash
  })) : (assetsLoading ? [] : [
    { id: 'AST-001', name: 'Production Batch #2024-11-001', type: 'Manufacturing Asset', issuer: 'Factory A', version: 'v2.1.0', ttl: 45, integrity: 98, status: 'Valid', hash: '0x7a9c8b3e...' },
    { id: 'AST-002', name: 'Quality Control Report Q4', type: 'Quality Certificate', issuer: 'QC Department', version: 'v1.3.0', ttl: 12, integrity: 100, status: 'Valid', hash: '0x3f4a5b6c...' },
    { id: 'AST-003', name: 'Supply Chain Traceability Record', type: 'Traceability Asset', issuer: 'Logistics Corp', version: 'v3.0.1', ttl: -5, integrity: 95, status: 'Expired', hash: '0x9b8c7d6e...' },
    { id: 'AST-004', name: 'Environmental Compliance Certificate', type: 'Compliance Asset', issuer: 'Eco Audit Ltd', version: 'v1.0.0', ttl: 89, integrity: 96, status: 'Valid', hash: '0x1a2b3c4d...' },
    { id: 'AST-005', name: 'Process Validation Report', type: 'Process Asset', issuer: 'Engineering Team', version: 'v2.0.0', ttl: 0, integrity: 92, status: 'Pending', hash: '0x8f7e6d5c...' },
    { id: 'AST-006', name: 'Safety Inspection Record', type: 'Safety Asset', issuer: 'Safety Board', version: 'v1.5.2', ttl: 67, integrity: 94, status: 'Valid', hash: '0x5c6d7e8f...' },
  ]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Pending': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Expired': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'Revoked': return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
      default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activos Mineros</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión y trazabilidad de activos de faenas mineras con certificación de consumo de agua y energía</p>
        </div>
              {(canCreateAsset || !isAuthenticated) && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      // En modo público, permitir crear
                      setShowDocumentRegister(true);
                    } else if (canCreateAsset) {
                      setShowDocumentRegister(true);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Registrar Nuevo Activo
                </button>
              )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar activos..."
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
            <option value="Valid">Válido</option>
            <option value="Pending">Pendiente</option>
            <option value="Expired">Expirado</option>
            <option value="Revoked">Revocado</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="text-sm">Mostrando {filteredAssets.length} activos</span>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{asset.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{asset.type}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{asset.issuer}</p>
            
            {/* Sustainability Badges */}
            {(() => {
              const badges = getSustainabilityBadges(asset.id, dbEvents);
              return badges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                      title={badge.label}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Versión</span>
                <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                  {asset.version}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Días TTL</span>
                <span className={asset.ttl <= 30 && asset.ttl > 0 ? 'text-amber-600 dark:text-amber-400' : asset.ttl <= 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
                  {asset.ttl > 0 ? `${asset.ttl} días` : 'Expirado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Integridad</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                      style={{ width: `${asset.integrity}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{asset.integrity}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAssetClick?.(asset.id)}
                className="flex-1 px-3 py-2 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se encontraron activos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Intenta ajustar tu búsqueda o criterios de filtro</p>
          <button
            onClick={() => setShowDocumentRegister(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 mx-auto"
          >
            <Upload className="w-5 h-5" />
            Registra tu Primer Activo
          </button>
        </div>
      )}

      {/* Document Register Modal */}
      {showDocumentRegister && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DocumentRegister
              onClose={() => setShowDocumentRegister(false)}
              onComplete={(result) => {
                console.log('Asset registered:', result);
                // TODO: Refresh assets list
                setShowDocumentRegister(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

