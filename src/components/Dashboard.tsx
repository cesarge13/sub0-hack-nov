import { Upload, ShieldCheck, FileText, Clock, Award, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onUploadDocument: () => void;
  walletAddress: string | null;
}

export function Dashboard({ onNavigate, onUploadDocument, walletAddress }: DashboardProps) {
  const stats = {
    totalDocuments: 156,
    expiringSoon: 8,
    validCertificates: 142,
    pendingCertificates: 6,
    auditRequests: 23,
    avgIntegrityScore: 96.8
  };

  const statusData = [
    { name: 'Valid', value: 142, color: '#14B8A6' },
    { name: 'Pending', value: 6, color: '#F59E0B' },
    { name: 'Expired', value: 5, color: '#EF4444' },
    { name: 'Revoked', value: 3, color: '#6B7280' }
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
    { id: 'CERT-001', name: 'ISO 27001 Certification', issuer: 'CyberSec Corp', version: 'v2.1.0', ttl: 45, integrity: 98, status: 'Valid' },
    { id: 'CERT-002', name: 'SOC 2 Type II Report', issuer: 'Audit Partners LLC', version: 'v1.3.0', ttl: 12, integrity: 100, status: 'Valid' },
    { id: 'CERT-003', name: 'GDPR Compliance Certificate', issuer: 'Privacy Authority', version: 'v3.0.1', ttl: 89, integrity: 96, status: 'Valid' },
  ];

  return (
    <div className="space-y-8">
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
                    Certik — Enterprise Document Certification & Verification
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Powered by Arkiv Protocol
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={onUploadDocument}
                  disabled={!walletAddress}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  Upload Document
                </button>
                <button
                  disabled={!walletAddress}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Verify Document
                </button>
                {!walletAddress && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Connect wallet to upload documents
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard icon={FileText} label="Total Documents" value={stats.totalDocuments} color="teal" />
        <StatCard icon={Clock} label="Expiring Soon (TTL)" value={stats.expiringSoon} color="amber" />
        <StatCard icon={Award} label="Valid Certificates" value={stats.validCertificates} color="emerald" />
        <StatCard icon={AlertTriangle} label="Pending Certificates" value={stats.pendingCertificates} color="blue" />
        <StatCard icon={TrendingUp} label="Audit Requests" value={stats.auditRequests} color="purple" />
        <StatCard icon={ShieldCheck} label="Avg Integrity Score" value={`${stats.avgIntegrityScore}%`} color="cyan" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Certificate Status Distribution</h3>
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Verification Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="certificates" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="verifications" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Certifications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Certifications</h3>
          <button 
            onClick={() => onNavigate('certifications')}
            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issuer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TTL Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Integrity Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
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
                      {cert.ttl} days
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
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', icon: 'text-cyan-600 dark:text-cyan-400' }
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
