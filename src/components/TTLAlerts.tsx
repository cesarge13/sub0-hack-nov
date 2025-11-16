import { Clock, AlertTriangle, XCircle } from 'lucide-react';

export function TTLAlerts() {
  const alerts = {
    critical: [
      { id: 'DOC-002', name: 'SOC 2 Type II Report', issuer: 'Audit Partners LLC', ttl: 5, expiration: '2024-11-21' },
      { id: 'DOC-008', name: 'Security Audit Certificate', issuer: 'SecureIT Ltd', ttl: 3, expiration: '2024-11-19' },
    ],
    warning: [
      { id: 'DOC-010', name: 'API Security Certificate', issuer: 'DevSec Tools', ttl: 23, expiration: '2024-12-09' },
      { id: 'DOC-011', name: 'Cloud Infrastructure Audit', issuer: 'CloudSafe Inc', ttl: 28, expiration: '2024-12-14' },
    ],
    expired: [
      { id: 'DOC-003', name: 'GDPR Compliance Certificate', issuer: 'Privacy Authority', ttl: -5, expiration: '2024-11-11' },
      { id: 'DOC-009', name: 'Network Security Assessment', issuer: 'NetSec Corp', ttl: -12, expiration: '2024-11-04' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TTL Alerts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor document expiration and renewal deadlines</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.critical.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical (≤7 days)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.warning.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Warning (≤30 days)</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-500/10 border border-gray-200 dark:border-gray-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.expired.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.critical.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Critical - Immediate Action Required
          </h2>
          {alerts.critical.map((alert) => (
            <AlertCard key={alert.id} alert={alert} type="critical" />
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {alerts.warning.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Warning - Expiring Soon
          </h2>
          {alerts.warning.map((alert) => (
            <AlertCard key={alert.id} alert={alert} type="warning" />
          ))}
        </div>
      )}

      {/* Expired */}
      {alerts.expired.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <XCircle className="w-6 h-6" />
            Expired Documents
          </h2>
          {alerts.expired.map((alert) => (
            <AlertCard key={alert.id} alert={alert} type="expired" />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, type }: any) {
  const colors = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-500/5',
      border: 'border-red-200 dark:border-red-500/20',
      icon: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-500/5',
      border: 'border-amber-200 dark:border-amber-500/20',
      icon: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    expired: {
      bg: 'bg-gray-50 dark:bg-gray-500/5',
      border: 'border-gray-200 dark:border-gray-500/20',
      icon: 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400',
      button: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  };

  const style = colors[type as keyof typeof colors];

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-14 h-14 rounded-xl ${style.icon} flex items-center justify-center ${type === 'critical' ? 'animate-pulse' : ''}`}>
            {type === 'critical' ? (
              <AlertTriangle className="w-7 h-7" />
            ) : type === 'warning' ? (
              <Clock className="w-7 h-7" />
            ) : (
              <XCircle className="w-7 h-7" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{alert.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>ID: {alert.id}</span>
              <span>•</span>
              <span>Issuer: {alert.issuer}</span>
              <span>•</span>
              <span className="font-medium">
                {alert.ttl <= 0 
                  ? `Expired ${Math.abs(alert.ttl)} days ago`
                  : `Expires in ${alert.ttl} days`
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-3xl font-bold ${type === 'critical' ? 'text-red-600 dark:text-red-400' : type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {alert.ttl > 0 ? alert.ttl : 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">days remaining</div>
          </div>
          <button className={`px-4 py-2 rounded-lg ${style.button} font-medium transition-all shadow-lg`}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
