import { TrendingUp, Activity, Users, Database } from 'lucide-react';
import { AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const trendData = [
    { month: 'Jun', verifications: 145 },
    { month: 'Jul', verifications: 182 },
    { month: 'Aug', verifications: 203 },
    { month: 'Sep', verifications: 178 },
    { month: 'Oct', verifications: 221 },
    { month: 'Nov', verifications: 245 }
  ];

  const healthData = [
    { subject: 'Integrity', value: 95, fullMark: 100 },
    { subject: 'Uptime', value: 99, fullMark: 100 },
    { subject: 'Compliance', value: 92, fullMark: 100 },
    { subject: 'Validity', value: 96, fullMark: 100 },
    { subject: 'Security', value: 98, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={TrendingUp} label="Growth Rate" value="+24.5%" color="emerald" />
        <MetricCard icon={Activity} label="Avg Response Time" value="145ms" color="teal" />
        <MetricCard icon={Users} label="Active Users" value="1,247" color="blue" />
        <MetricCard icon={Database} label="Storage Used" value="2.4 TB" color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Verification Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVerifications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="verifications" stroke="#14B8A6" fillOpacity={1} fill="url(#colorVerifications)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Health Score</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={healthData}>
                <PolarGrid stroke="#374151" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar name="Health" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Metrics</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Metric</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Current</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Previous</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            <PerformanceRow metric="Documents Certified" current="2,456" previous="2,103" change="+16.8%" positive />
            <PerformanceRow metric="Avg Certification Time" current="1.2s" previous="1.8s" change="-33.3%" positive />
            <PerformanceRow metric="System Uptime" current="99.98%" previous="99.95%" change="+0.03%" positive />
            <PerformanceRow metric="Storage Efficiency" current="94.2%" previous="91.8%" change="+2.6%" positive />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colorMap: any = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: 'text-emerald-600 dark:text-emerald-400' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/20', icon: 'text-teal-600 dark:text-teal-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: 'text-purple-600 dark:text-purple-400' }
  };

  const colors = colorMap[color];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function PerformanceRow({ metric, current, previous, change, positive }: any) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 text-gray-900 dark:text-white">{metric}</td>
      <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-medium">{current}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{previous}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${positive ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
          {change}
        </span>
      </td>
    </tr>
  );
}
