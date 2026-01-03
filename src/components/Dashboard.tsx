import React, { useMemo } from 'react';
import { Upload, ShieldCheck, FileText, Clock, Award, TrendingUp, AlertTriangle, ArrowRight, CheckCircle, Target, Activity, Leaf, Droplet, Zap, Globe, RefreshCw, Gauge, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Asset, Event } from '../types';
import { useAssets } from '../hooks/useAssets';
import { useEvents } from '../hooks/useEvents';
import { PublicModeBanner } from './AccessControl';
import { calculateTTLRemaining } from '../utils/date';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onUploadDocument: () => void;
  walletAddress: string | null;
}

export function Dashboard({ onNavigate, onUploadDocument, walletAddress }: DashboardProps) {
  // Load data from IndexedDB
  const { assets: dbAssets, isLoading: assetsLoading } = useAssets();
  const { events: dbEvents, isLoading: eventsLoading } = useEvents();

  // Use DB data, fallback to empty arrays while loading
  const mockAssets = dbAssets.length > 0 ? dbAssets : [];
  const mockEvents = dbEvents.length > 0 ? dbEvents : [];

  // Mock Events data (fallback - will be replaced by DB data)
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
    {
      id: 'EVT-007',
      assetId: 'AST-005',
      eventType: 'renewable_energy_certification',
      standardTag: 'I-REC (International Renewable Energy Certificate)',
      operator: 'Renewable Energy Authority',
      timestamp: '2024-11-10T09:00:00Z',
      ttlDays: 365,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
      status: 'valid',
      txHash: '0x7890...'
    },
    {
      id: 'EVT-008',
      assetId: 'AST-005',
      eventType: 'carbon_footprint_measurement',
      standardTag: 'ISO 14064-1',
      operator: 'Carbon Trust',
      timestamp: '2024-11-01T10:00:00Z',
      ttlDays: 180,
      evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      fileSha256: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
      status: 'valid',
      txHash: '0x8901...'
    },
    {
      id: 'EVT-009',
      assetId: 'AST-007',
      eventType: 'water_usage_tracking',
      standardTag: 'ISO 14046',
      operator: 'Water Management Authority',
      timestamp: '2024-11-05T08:00:00Z',
      ttlDays: 90,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
      status: 'valid'
    },
    {
      id: 'EVT-010',
      assetId: 'AST-008',
      eventType: 'circular_economy_tracking',
      standardTag: 'BS 8001:2017',
      operator: 'Circular Economy Institute',
      timestamp: '2024-11-08T10:00:00Z',
      ttlDays: 365,
      evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      fileSha256: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
      status: 'valid',
      txHash: '0x9012...'
    },
    {
      id: 'EVT-011',
      assetId: 'AST-004',
      eventType: 'waste_management',
      standardTag: 'ISO 14001',
      operator: 'Waste Management Authority',
      timestamp: '2024-10-25T14:00:00Z',
      ttlDays: 180,
      evidenceCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      fileSha256: '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      status: 'valid'
    },
  ];

  // Use DB events if available, otherwise use fallback (only during initial load)
  const allEvents = mockEvents.length > 0 ? mockEvents : (assetsLoading || eventsLoading ? [] : fallbackEvents);

  // Calculate KPIs
  const kpis = useMemo(() => {
    // KPI 1: Compliance Rate (% of assets with valid non-critical events)
    const assetsWithValidEvents = new Set<string>();
    const assetsWithCriticalEvents = new Set<string>();
    
    allEvents.forEach(event => {
      const ttlRemaining = calculateTTLRemaining(event);
      const isCritical = ttlRemaining <= 7 || ttlRemaining <= 0;
      
      if (event.status === 'valid' && !isCritical) {
        assetsWithValidEvents.add(event.assetId);
      }
      if (isCritical || event.status === 'expired') {
        assetsWithCriticalEvents.add(event.assetId);
      }
    });

    const compliantAssets = Array.from(assetsWithValidEvents).filter(
      assetId => !assetsWithCriticalEvents.has(assetId)
    );
    const complianceRate = mockAssets.length > 0 
      ? Math.round((compliantAssets.length / mockAssets.length) * 100)
      : 0;

    // KPI 2: Expiring Soon (count by windows: 7/14/30 days)
    const expiring7Days = allEvents.filter(e => {
      const ttl = calculateTTLRemaining(e);
      return ttl > 0 && ttl <= 7 && e.status === 'valid';
    }).length;

    const expiring14Days = allEvents.filter(e => {
      const ttl = calculateTTLRemaining(e);
      return ttl > 7 && ttl <= 14 && e.status === 'valid';
    }).length;

    const expiring30Days = allEvents.filter(e => {
      const ttl = calculateTTLRemaining(e);
      return ttl > 14 && ttl <= 30 && e.status === 'valid';
    }).length;

    // KPI 3: Audit Readiness Score (0-100 based on event coverage)
    // Factors:
    // - % of assets with at least one valid event (40%)
    // - % of events that are attested on-chain (30%)
    // - % of events with evidence (20%)
    // - Average event validity (10%)
    
    const assetsWithEvents = new Set(allEvents.map(e => e.assetId));
    const assetCoverage = mockAssets.length > 0 
      ? (assetsWithEvents.size / mockAssets.length) * 100 
      : 0;
    
    const attestedEvents = allEvents.filter(e => e.txHash && e.status === 'valid').length;
    const attestationRate = allEvents.length > 0 
      ? (attestedEvents / allEvents.length) * 100 
      : 0;
    
    const eventsWithEvidence = allEvents.filter(e => e.evidenceCid).length;
    const evidenceRate = allEvents.length > 0 
      ? (eventsWithEvidence / allEvents.length) * 100 
      : 0;
    
    const validEvents = allEvents.filter(e => e.status === 'valid').length;
    const validityRate = allEvents.length > 0 
      ? (validEvents / allEvents.length) * 100 
      : 0;
    
    // Calculate weighted score
    const auditReadinessScore = Math.round(
      (assetCoverage * 0.4) +
      (attestationRate * 0.3) +
      (evidenceRate * 0.2) +
      (validityRate * 0.1)
    );

    // KPI 4: Carbon Footprint Reduction (tCO₂e)
    const sustainabilityEvents = allEvents.filter(e => 
      e.eventType === 'carbon_footprint_measurement' || 
      e.eventType === 'renewable_energy_certification' ||
      e.eventType === 'environmental_audit' ||
      e.eventType === 'waste_management'
    );
    // Mock calculation: assume each sustainability event represents CO2 reduction
    const carbonFootprintReduced = sustainabilityEvents.length > 0
      ? Math.round(sustainabilityEvents.length * 312.5) // Mock: ~312.5 tCO₂e per event
      : 0;
    const carbonFootprintPrevious = Math.round(carbonFootprintReduced * 0.88); // Mock: 12% increase
    const carbonFootprintChange = carbonFootprintReduced - carbonFootprintPrevious;

    // KPI 5: Resource Efficiency Score (0-100)
    const iso14001Events = allEvents.filter(e => 
      e.standardTag?.includes('ISO 14001') && e.status === 'valid'
    ).length;
    const iso50001Events = allEvents.filter(e => 
      e.standardTag?.includes('ISO 50001') && e.status === 'valid'
    ).length;
    const efficiencyEvents = allEvents.filter(e => 
      e.eventType === 'water_usage_tracking' || 
      e.eventType === 'waste_management' ||
      e.eventType === 'renewable_energy_certification'
    ).length;
    
    const iso14001Coverage = mockAssets.length > 0 
      ? (iso14001Events / mockAssets.length) * 100 
      : 0;
    const efficiencyEventRate = allEvents.length > 0 
      ? (efficiencyEvents / allEvents.length) * 100 
      : 0;
    const iso50001Coverage = mockAssets.length > 0 
      ? (iso50001Events / mockAssets.length) * 100 
      : 0;
    
    const resourceEfficiencyScore = Math.round(
      (iso14001Coverage * 0.4) +
      (efficiencyEventRate * 0.3) +
      (iso50001Coverage * 0.3)
    );

    // KPI 6: Sustainability Standards Coverage
    const sustainabilityStandards = [
      'ISO 14001', 'ISO 50001', 'ISO 14064', 'GRI', 'SDG', 'Carbon Trust', 'B-Corp'
    ];
    const assetsWithSustainabilityStandards = new Set<string>();
    
    allEvents.forEach(event => {
      if (event.status === 'valid' && event.standardTag) {
        sustainabilityStandards.forEach(standard => {
          if (event.standardTag?.includes(standard)) {
            assetsWithSustainabilityStandards.add(event.assetId);
          }
        });
      }
    });
    
    const sustainabilityStandardsCoverage = mockAssets.length > 0
      ? Math.round((assetsWithSustainabilityStandards.size / mockAssets.length) * 100)
      : 0;

    return {
      complianceRate,
      expiring7Days,
      expiring14Days,
      expiring30Days,
      auditReadinessScore,
      totalAssets: mockAssets.length,
      totalEvents: allEvents.length,
      carbonFootprintReduced,
      carbonFootprintChange,
      resourceEfficiencyScore,
      sustainabilityStandardsCoverage
    };
  }, []);

  const stats = {
    totalAssets: kpis.totalAssets,
    complianceRate: kpis.complianceRate,
    expiring7Days: kpis.expiring7Days,
    expiring14Days: kpis.expiring14Days,
    expiring30Days: kpis.expiring30Days,
    auditReadinessScore: kpis.auditReadinessScore,
    totalEvents: kpis.totalEvents,
    carbonFootprintReduced: kpis.carbonFootprintReduced,
    carbonFootprintChange: kpis.carbonFootprintChange,
    resourceEfficiencyScore: kpis.resourceEfficiencyScore,
    sustainabilityStandardsCoverage: kpis.sustainabilityStandardsCoverage
  };

  const statusData = [
    { name: 'Válido', value: 142, color: '#14B8A6' },
    { name: 'Pendiente', value: 6, color: '#F59E0B' },
    { name: 'Expirado', value: 5, color: '#EF4444' },
    { name: 'Revocado', value: 3, color: '#6B7280' }
  ];

  const monthlyData = [
    { month: 'Jun', verifications: 145, certificates: 89 },
    { month: 'Jul', verifications: 182, certificates: 102 },
    { month: 'Aug', verifications: 203, certificates: 118 },
    { month: 'Sep', verifications: 178, certificates: 94 },
    { month: 'Oct', verifications: 221, certificates: 135 },
    { month: 'Nov', verifications: 245, certificates: 156 }
  ];

  const recentCerts = [
    { id: 'CERT-001', name: 'Certificación ISO 27001', issuer: 'CyberSec Corp', version: 'v2.1.0', ttl: 45, integrity: 98, status: 'Valid' },
    { id: 'CERT-002', name: 'Informe SOC 2 Tipo II', issuer: 'Audit Partners LLC', version: 'v1.3.0', ttl: 12, integrity: 100, status: 'Valid' },
    { id: 'CERT-003', name: 'Certificado de Cumplimiento GDPR', issuer: 'Privacy Authority', version: 'v3.0.1', ttl: 89, integrity: 96, status: 'Valid' },
  ];

  return (
    <div className="space-y-8">
      {/* Public Mode Banner */}
      <PublicModeBanner />
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-cyan-500/10 dark:from-teal-500/5 dark:via-emerald-500/5 dark:to-cyan-500/5 border border-teal-500/20 dark:border-teal-500/10 p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <ShieldCheck className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Certifik — Gestión de Recursos para Faenas Mineras
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Plataforma digital que integra y certifica datos de consumo de agua y energía en faenas mineras, apoyando decisiones operativas y estratégicas orientadas a la reducción de impacto ambiental y cumplimiento regulatorio ESG verificable
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={onUploadDocument}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Registrar Activo
                </button>
                <button
                  onClick={() => onNavigate('assets')}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-700 transition-all flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Ver Todos los Activos
                </button>
                <button
                  onClick={() => onNavigate('compliance-renewals')}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-700 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Ver Renovaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KPI 1: Compliance Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tasa de Cumplimiento Sostenible</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.complianceRate}%</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Assets con eventos de sostenibilidad válidos</span>
              <span>{Math.round((stats.complianceRate / 100) * stats.totalAssets)}/{stats.totalAssets}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stats.complianceRate >= 80 
                    ? 'bg-emerald-500' 
                    : stats.complianceRate >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.complianceRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Expiring Soon */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Próximos a Vencer</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.expiring7Days + stats.expiring14Days + stats.expiring30Days}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ≤7 días
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.expiring7Days}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ≤14 días
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.expiring14Days}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ≤30 días
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.expiring30Days}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Audit Readiness Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Índice de Preparación ESG</div>
              <div className={`text-3xl font-bold ${
                stats.auditReadinessScore >= 80 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : stats.auditReadinessScore >= 60 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.auditReadinessScore}/100
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Basado en cobertura de eventos y certificación</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stats.auditReadinessScore >= 80 
                    ? 'bg-emerald-500' 
                    : stats.auditReadinessScore >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.auditReadinessScore}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Cobertura de Eventos</span>
                <span className="font-medium">{Math.round((new Set(allEvents.map(e => e.assetId)).size / mockAssets.length) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Certificación en Blockchain</span>
                <span className="font-medium">{Math.round((allEvents.filter(e => e.txHash).length / allEvents.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Operativas - Agua y Energía */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 border-2 border-red-200 dark:border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alertas Operativas - Desviaciones Detectadas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitoreo en tiempo real de consumo de agua y energía en faenas mineras</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Consumo de Agua</span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                Alerta
              </span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">+15.3%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sobre el límite operativo establecido</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Actual: 2,450 m³/día | Límite: 2,125 m³/día
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Consumo de Energía</span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Advertencia
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">+8.7%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sobre el promedio histórico</div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Actual: 18,500 kWh/día | Promedio: 17,025 kWh/día
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Recomendación:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Revisar procesos de lixiviación y sistemas de bombeo</span>
          </div>
        </div>
      </div>

      {/* KPIs de Recursos Mineros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI: Consumo de Agua */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consumo de Agua - Faena Minera</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">2,450</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">m³/día</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>vs. Límite Operativo</span>
              <span className={`font-medium ${115.3 > 100 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {115.3}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  115.3 > 110 
                    ? 'bg-red-500' 
                    : 115.3 > 100 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(115.3, 120)}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Meta mensual</span>
                <span className="font-medium">2,125 m³/día</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Eficiencia hídrica</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">+5.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI: Consumo de Energía */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consumo de Energía - Faena Minera</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">18,500</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">kWh/día</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>vs. Promedio Histórico</span>
              <span className={`font-medium ${108.7 > 100 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {108.7}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  108.7 > 110 
                    ? 'bg-red-500' 
                    : 108.7 > 100 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(108.7, 120)}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Promedio histórico</span>
                <span className="font-medium">17,025 kWh/día</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Energía renovable</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 4: Carbon Footprint Reduction */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Huella de Carbono Reducida</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.carbonFootprintReduced.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">tCO₂e</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Este mes</span>
              <span className={`font-medium ${stats.carbonFootprintChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.carbonFootprintChange >= 0 ? '+' : ''}{stats.carbonFootprintChange.toLocaleString()} tCO₂e
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all"
                style={{ width: `${Math.min((stats.carbonFootprintReduced / 5000) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Basado en eventos de sostenibilidad y certificaciones ambientales
            </div>
          </div>
        </div>

        {/* KPI 5: Resource Efficiency Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eficiencia de Recursos</div>
              <div className={`text-3xl font-bold ${
                stats.resourceEfficiencyScore >= 80 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : stats.resourceEfficiencyScore >= 60 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.resourceEfficiencyScore}/100
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Score de eficiencia energética y recursos</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stats.resourceEfficiencyScore >= 80 
                    ? 'bg-emerald-500' 
                    : stats.resourceEfficiencyScore >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.resourceEfficiencyScore}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Cobertura ISO 14001</span>
                <span className="font-medium">{Math.round((allEvents.filter(e => e.standardTag?.includes('ISO 14001') && e.status === 'valid').length / mockAssets.length) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Eventos de Eficiencia</span>
                <span className="font-medium">{Math.round((allEvents.filter(e => e.eventType === 'water_usage_tracking' || e.eventType === 'waste_management' || e.eventType === 'renewable_energy_certification').length / allEvents.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 6: Sustainability Standards Coverage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cobertura de Estándares</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.sustainabilityStandardsCoverage}%
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Assets con estándares de sostenibilidad</span>
              <span>{Math.round((stats.sustainabilityStandardsCoverage / 100) * stats.totalAssets)}/{stats.totalAssets}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stats.sustainabilityStandardsCoverage >= 80 
                    ? 'bg-blue-500' 
                    : stats.sustainabilityStandardsCoverage >= 60 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.sustainabilityStandardsCoverage}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded">ISO 14001</span>
                <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded">ISO 50001</span>
                <span className="px-2 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded">GRI</span>
                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded">SDGs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FileText} label="Total de Activos" value={stats.totalAssets} color="teal" />
        <StatCard icon={Activity} label="Total de Eventos" value={stats.totalEvents} color="blue" />
        <StatCard icon={ShieldCheck} label="Estado de Sostenibilidad" value={stats.complianceRate >= 80 ? "Excelente" : stats.complianceRate >= 60 ? "Bueno" : "Requiere Atención"} color={stats.complianceRate >= 80 ? "emerald" : stats.complianceRate >= 60 ? "amber" : "red"} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribución de Estado de Certificados</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actividad Mensual de Verificaciones</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="certificates" fill="#14B8A6" radius={[8, 8, 0, 0]} name="Certificados" />
                <Line type="monotone" dataKey="verifications" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Verificaciones" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Certifications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Certificaciones Recientes</h3>
          <button 
            onClick={() => onNavigate('certifications')}
            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium flex items-center gap-1"
          >
            Ver Todo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre del Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Emisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TTL Restante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score de Integridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {recentCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                      {cert.version}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${cert.ttl <= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {cert.ttl} días
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{ width: `${cert.integrity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{cert.integrity}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorMap: any = {
    teal: { bg: 'bg-teal-100 dark:bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/20', text: 'text-teal-600 dark:text-teal-400', icon: 'text-teal-600 dark:text-teal-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', icon: 'text-cyan-600 dark:text-cyan-400' },
    red: { bg: 'bg-red-100 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20', text: 'text-red-600 dark:text-red-400', icon: 'text-red-600 dark:text-red-400' }
  };

  const colors = colorMap[color];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1">
          <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}
