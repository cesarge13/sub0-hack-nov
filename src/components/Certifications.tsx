import { Award, Calendar, User, RefreshCw } from 'lucide-react';

export function Certifications() {
  const certifications = [
    { id: 'CERT-001', title: 'ISO 27001:2022 Information Security', issuer: 'CyberSec Corp', issuerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f912a3', version: 'v2.1.0', expiration: '2025-12-31', integrity: 98, status: 'Valid' },
    { id: 'CERT-002', title: 'SOC 2 Type II Compliance', issuer: 'Audit Partners LLC', issuerAddress: '0x8f9A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8', version: 'v1.3.0', expiration: '2025-01-15', integrity: 100, status: 'Valid' },
    { id: 'CERT-003', title: 'GDPR Data Protection Certificate', issuer: 'Privacy Authority', issuerAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0', version: 'v3.0.1', expiration: '2025-03-20', integrity: 96, status: 'Valid' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Active and pending certificate validations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">142</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Certificates</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">6</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Validation</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Award className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cert.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {cert.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Issuer</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{cert.issuer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Issuer Address</p>
                      <code className="text-xs font-mono text-teal-600 dark:text-teal-400">{cert.issuerAddress.slice(0, 10)}...</code>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                      <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                        {cert.version}
                      </code>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{cert.expiration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Integrity Score</span>
                        <span className="text-gray-900 dark:text-white font-medium">{cert.integrity}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{ width: `${cert.integrity}%` }}
                        />
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/20 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Re-Verify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
