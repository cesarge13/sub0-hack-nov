import React from 'react';
import { TrendingUp, Activity, Users, Database, Leaf, Droplet, Zap, Globe, TrendingDown } from 'lucide-react';
import { AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, Legend, Line as RechartsLine } from 'recharts';

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

  // Environmental Impact Data
  const carbonFootprintData = [
    { month: 'Jun', co2Reduced: 850, co2Baseline: 1200 },
    { month: 'Jul', co2Reduced: 920, co2Baseline: 1250 },
    { month: 'Aug', co2Reduced: 1050, co2Baseline: 1300 },
    { month: 'Sep', co2Reduced: 980, co2Baseline: 1280 },
    { month: 'Oct', co2Reduced: 1120, co2Baseline: 1350 },
    { month: 'Nov', co2Reduced: 1250, co2Baseline: 1400 }
  ];

  const resourceUsageData = [
    { sector: 'Lixiviación', water: 45, energy: 38, waste: 25 },
    { sector: 'Chancado', water: 62, energy: 75, waste: 58 },
    { sector: 'Molienda', water: 28, energy: 92, waste: 15 },
    { sector: 'Flotación', water: 35, energy: 68, waste: 42 }
  ];

  const sustainabilityScoreData = [
    { month: 'Jun', score: 72 },
    { month: 'Jul', score: 75 },
    { month: 'Aug', score: 78 },
    { month: 'Sep', score: 76 },
    { month: 'Oct', score: 82 },
    { month: 'Nov', score: 85 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analíticas de Recursos Mineros</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis integral de consumo de agua y energía para apoyo a la toma de decisiones operativas y estratégicas en faenas mineras</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={TrendingUp} label="Tasa de Crecimiento" value="+24.5%" color="emerald" />
        <MetricCard icon={Activity} label="Tiempo Promedio de Respuesta" value="145ms" color="teal" />
        <MetricCard icon={Users} label="Usuarios Activos" value="1,247" color="blue" />
        <MetricCard icon={Database} label="Almacenamiento Utilizado" value="2.4 TB" color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tendencias de Verificación</h3>
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Puntuación de Salud del Sistema</h3>
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

      {/* Environmental Impact Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Impacto Ambiental</h2>
            <p className="text-gray-600 dark:text-gray-400">Métricas de sostenibilidad y reducción de impacto ambiental</p>
          </div>
        </div>

        {/* Environmental KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard icon={Leaf} label="CO₂ Reducido" value="1,250 tCO₂e" color="emerald" />
          <MetricCard icon={Droplet} label="Eficiencia Hídrica" value="+18.2%" color="blue" />
          <MetricCard icon={Zap} label="Energía Renovable" value="68%" color="yellow" />
          <MetricCard icon={TrendingDown} label="Reducción Residuos" value="-24.5%" color="teal" />
        </div>

        {/* Environmental Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon Footprint Evolution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Evolución de Huella de Carbono</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={carbonFootprintData}>
                  <defs>
                    <linearGradient id="colorCO2Reduced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="co2Baseline" fill="#EF4444" fillOpacity={0.3} name="Línea Base" />
                  <RechartsLine type="monotone" dataKey="co2Reduced" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} name="CO₂ Reducido" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Reducción acumulada: <span className="font-semibold text-emerald-600 dark:text-emerald-400">1,250 tCO₂e</span> este mes</p>
            </div>
          </div>

          {/* Resource Usage by Sector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Consumo de Recursos por Área de Faena</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="sector" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="water" fill="#3B82F6" name="Agua (%)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="energy" fill="#F59E0B" name="Energía (%)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="waste" fill="#EF4444" name="Residuos (%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Eficiencia promedio: <span className="font-semibold text-teal-600 dark:text-teal-400">72%</span> (mejora +5% vs mes anterior)</p>
            </div>
          </div>
        </div>

        {/* Sustainability Score Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tendencia de Score de Sostenibilidad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sustainabilityScoreData}>
                <defs>
                  <linearGradient id="colorSustainability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorSustainability)" />
                <RechartsLine type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} dot={{ fill: '#14B8A6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Score actual: <span className="font-semibold text-teal-600 dark:text-teal-400">85/100</span></p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Mejora mensual: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+3.6%</span></p>
            </div>
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
            <PerformanceRow metric="Events Certified" current="2,456" previous="2,103" change="+16.8%" positive />
            <PerformanceRow metric="Carbon Footprint Reduction" current="1,250 tCO₂e" previous="1,120 tCO₂e" change="+11.6%" positive />
            <PerformanceRow metric="Sustainability Score" current="85/100" previous="82/100" change="+3.7%" positive />
            <PerformanceRow metric="Resource Efficiency" current="72%" previous="68%" change="+5.9%" positive />
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
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: 'text-purple-600 dark:text-purple-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20', icon: 'text-yellow-600 dark:text-yellow-400' }
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
