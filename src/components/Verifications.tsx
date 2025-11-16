import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

export function Verifications() {
  const verifications = [
    { id: 'VER-001', document: 'ISO 27001 Certification', hash: '0x7a9c8b3e5f2d1a4b...', timestamp: '2024-11-16 14:32:15', result: 'Valid', verifier: '0x742d35Cc...' },
    { id: 'VER-002', document: 'SOC 2 Type II Report', hash: '0x3f4a5b6c7d8e9f0a...', timestamp: '2024-11-16 13:18:42', result: 'Valid', verifier: '0x8f9A1B2C...' },
    { id: 'VER-003', document: 'GDPR Compliance Certificate', hash: '0x9b8c7d6e5f4a3b2c...', timestamp: '2024-11-16 11:05:33', result: 'Failed', verifier: '0x1A2B3C4D...' },
    { id: 'VER-004', document: 'PCI DSS Attestation', hash: '0x1a2b3c4d5e6f7a8b...', timestamp: '2024-11-16 09:47:21', result: 'Valid', verifier: '0x5C6D7E8F...' },
    { id: 'VER-005', document: 'HIPAA Compliance Report', hash: '0x8f7e6d5c4b3a2918...', timestamp: '2024-11-15 16:22:09', result: 'Pending', verifier: '0x9F0A1B2C...' },
  ];

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'Valid':
        return { icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' };
      case 'Failed':
        return { icon: XCircle, bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' };
      case 'Pending':
        return { icon: Clock, bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' };
      default:
        return { icon: ShieldCheck, bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Document verification history and results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Verifications</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,198</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">32</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">17</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verification ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hash</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verifier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {verifications.map((ver) => {
              const badge = getResultBadge(ver.result);
              const Icon = badge.icon;
              
              return (
                <tr key={ver.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{ver.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ver.document}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-teal-600 dark:text-teal-400">{ver.hash}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ver.timestamp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{ver.verifier}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                      <Icon className="w-3 h-3" />
                      {ver.result}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
