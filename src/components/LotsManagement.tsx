import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Eye, Upload, ExternalLink } from 'lucide-react';
import { origenApi, Lot } from '../services/origenApi';

interface LotsManagementProps {
  onNavigate: (screen: string) => void;
  onViewLot: (lotId: string) => void;
}

export function LotsManagement({ onNavigate, onViewLot }: LotsManagementProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creditFilter, setCreditFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

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

  const filteredLots = lots.filter(lot => {
    const matchesSearch = 
      lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    const matchesCredit = creditFilter === 'all' || lot.creditStatus === creditFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'high') matchesScore = lot.agroScore >= 80;
    else if (scoreFilter === 'medium') matchesScore = lot.agroScore >= 60 && lot.agroScore < 80;
    else if (scoreFilter === 'low') matchesScore = lot.agroScore < 60;
    
    return matchesSearch && matchesStatus && matchesCredit && matchesScore;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400';
  };

  const getCreditStatusBadge = (status: string) => {
    const styles = {
      'No credit': 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400',
      'Eligible': 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Active': 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
      'Delinquent': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      'Repaid': 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
    };
    return styles[status as keyof typeof styles] || styles['No credit'];
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
          <h1 className="text-2xl text-gray-900 dark:text-white">Lots Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your agricultural lots and evidence
          </p>
        </div>
        <button
          onClick={() => onNavigate('register-lot')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Register New Lot
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Lot Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Harvested">Harvested</option>
            <option value="Certified">Certified</option>
          </select>

          {/* Credit Status Filter */}
          <select
            value={creditFilter}
            onChange={(e) => setCreditFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Credits</option>
            <option value="No credit">No Credit</option>
            <option value="Eligible">Eligible</option>
            <option value="Active">Active</option>
            <option value="Delinquent">Delinquent</option>
            <option value="Repaid">Repaid</option>
          </select>

          {/* Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Scores</option>
            <option value="high">High (80+)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low ({'<'}60)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredLots.length} of {lots.length} lots
      </div>

      {/* Lots Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
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
                  Lot Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  AgroScore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Credit Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredLots.map((lot) => (
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
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(lot.agroScore)}`}>
                      {lot.agroScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCreditStatusBadge(lot.creditStatus)}`}>
                      {lot.creditStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewLot(lot.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Upload Evidence"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      {lot.evidenceFiles.length > 0 && (
                        <button
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="View in Filecoin"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No lots found matching your filters</p>
        </div>
      )}
    </div>
  );
}