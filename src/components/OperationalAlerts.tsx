import React from 'react';
import { AlertTriangle, Droplet, Zap, TrendingUp, TrendingDown, Gauge, Clock, CheckCircle } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { useAssets } from '../hooks/useAssets';

interface Alert {
  id: string;
  type: 'water' | 'energy' | 'compliance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  currentValue: number;
  threshold: number;
  unit: string;
  deviation: number;
  area: string;
  timestamp: string;
  recommendation: string;
}

export function OperationalAlerts() {
  const { events } = useEvents();
  const { assets } = useAssets();

  // Mock alerts - En producción esto vendría de análisis de datos reales
  const alerts: Alert[] = [
    {
      id: 'ALERT-001',
      type: 'water',
      severity: 'critical',
      title: 'Consumo de Agua Excede Límite Operativo',
      description: 'El consumo de agua en el área de Lixiviación ha superado el límite establecido en 15.3%',
      currentValue: 2450,
      threshold: 2125,
      unit: 'm³/día',
      deviation: 15.3,
      area: 'Lixiviación',
      timestamp: new Date().toISOString(),
      recommendation: 'Revisar sistemas de bombeo y optimizar procesos de lixiviación. Considerar recirculación de agua.'
    },
    {
      id: 'ALERT-002',
      type: 'energy',
      severity: 'warning',
      title: 'Consumo de Energía Sobre Promedio Histórico',
      description: 'El consumo de energía en el área de Chancado está 8.7% por encima del promedio histórico',
      currentValue: 18500,
      threshold: 17025,
      unit: 'kWh/día',
      deviation: 8.7,
      area: 'Chancado',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      recommendation: 'Revisar eficiencia de equipos de chancado. Verificar horarios de operación y carga de trabajo.'
    },
    {
      id: 'ALERT-003',
      type: 'water',
      severity: 'info',
      title: 'Tendencia de Consumo de Agua en Aumento',
      description: 'El consumo de agua en Molienda muestra una tendencia creciente en los últimos 7 días',
      currentValue: 1250,
      threshold: 1200,
      unit: 'm³/día',
      deviation: 4.2,
      area: 'Molienda',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      recommendation: 'Monitorear continuamente. Considerar mantenimiento preventivo de sistemas de agua.'
    }
  ];

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/20',
          icon: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
          text: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/20',
          icon: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/20',
          icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water':
        return Droplet;
      case 'energy':
        return Zap;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alertas Operativas</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitoreo de desviaciones en consumo de agua y energía en faenas mineras
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{criticalAlerts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alertas Críticas</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{warningAlerts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Advertencias</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Alertas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Alertas Críticas - Acción Inmediata Requerida
          </h2>
          {criticalAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Advertencias - Requiere Atención
          </h2>
          {warningAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Gauge className="w-6 h-6" />
            Información - Monitoreo Continuo
          </h2>
          {infoAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay alertas activas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Todos los indicadores de consumo de agua y energía están dentro de los rangos operativos establecidos
          </p>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const colors = getSeverityColor(alert.severity);
  const TypeIcon = getTypeIcon(alert.type);
  const isPositive = alert.deviation > 0;

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center ${alert.severity === 'critical' ? 'animate-pulse' : ''}`}>
            <TypeIcon className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alert.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
                {alert.severity === 'critical' ? 'Crítica' : alert.severity === 'warning' ? 'Advertencia' : 'Información'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {alert.area}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{alert.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor Actual</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {alert.currentValue.toLocaleString()} <span className="text-xs">{alert.unit}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Límite/Referencia</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {alert.threshold.toLocaleString()} <span className="text-xs">{alert.unit}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Desviación</div>
                <div className={`text-lg font-bold flex items-center gap-1 ${colors.text}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(alert.deviation).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Área</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{alert.area}</div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recomendación:</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{alert.recommendation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-3xl font-bold ${colors.text} mb-1`}>
            {isPositive ? '+' : ''}{alert.deviation.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(alert.timestamp).toLocaleString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50 dark:bg-red-500/10',
        border: 'border-red-200 dark:border-red-500/20',
        icon: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
        text: 'text-red-600 dark:text-red-400'
      };
    case 'warning':
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
        icon: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400'
      };
    default:
      return {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-200 dark:border-blue-500/20',
        icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400'
      };
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'water':
      return Droplet;
    case 'energy':
      return Zap;
    default:
      return AlertTriangle;
  }
}

