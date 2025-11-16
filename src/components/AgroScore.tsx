import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { origenApi, Lot } from '../services/origenApi';

interface AgroScoreProps {
  onNavigate: (screen: string) => void;
  onViewLot: (lotId: string) => void;
}

export function AgroScore({ onNavigate, onViewLot }: AgroScoreProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      const data = await origenApi.getLots();
      setLots(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      // Simulate refreshing all scores
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadLots();
    } finally {
      setRefreshing(false);
    }
  };

  const highScoreLots = lots.filter(l => l.agroScore >= 80);
  const mediumScoreLots = lots.filter(l => l.agroScore >= 60 && l.agroScore < 80);
  const lowScoreLots = lots.filter(l => l.agroScore < 60);

  const averageScore = lots.length > 0 
    ? Math.round(lots.reduce((sum, lot) => sum + lot.agroScore, 0) / lots.length)
    : 0;

  const pieData = [
    { name: 'High (80+)', value: highScoreLots.length, color: '#22C55E' },
    { name: 'Medium (60-79)', value: mediumScoreLots.length, color: '#F97316' },
    { name: 'Low (<60)', value: lowScoreLots.length, color: '#EF4444' }
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 dark:text-white">AgroScore Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Score distribution and lot performance
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Scores'}
        </button>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Average Score</h3>
          </div>
          <p className="text-3xl text-gray-900 dark:text-white">{averageScore}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">out of 100</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">High Score</h3>
          </div>
          <p className="text-3xl text-gray-900 dark:text-white">{highScoreLots.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">lots (80+)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Medium Score</h3>
          </div>
          <p className="text-3xl text-gray-900 dark:text-white">{mediumScoreLots.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">lots (60-79)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Low Score</h3>
          </div>
          <p className="text-3xl text-gray-900 dark:text-white">{lowScoreLots.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">lots ({'<'}60)</p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
        <h2 className="text-lg text-gray-900 dark:text-white mb-4">Score Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Scored via EVVM MATE on Sepolia testnet
        </p>
      </div>

      {/* Lots Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg text-gray-900 dark:text-white">All Lots by Score</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lot ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  AgroScore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[...lots].sort((a, b) => b.agroScore - a.agroScore).map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{lot.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{lot.cropType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{lot.area} ha</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      lot.status === 'Active' 
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                        : lot.status === 'Harvested'
                        ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                    }`}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(lot.agroScore)}`}>
                      {lot.agroScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewLot(lot.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </button>
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