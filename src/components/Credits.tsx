import { useEffect, useState } from 'react';
import { DollarSign, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { origenApi, Credit } from '../services/origenApi';

interface CreditsProps {
  onNavigate: (screen: string) => void;
  onViewLot: (lotId: string) => void;
}

export function Credits({ onNavigate, onViewLot }: CreditsProps) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await origenApi.getCredits();
      setCredits(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Eligible': { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', icon: Clock },
      'Active': { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      'Delinquent': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
      'Repaid': { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', icon: CheckCircle }
    };
    return styles[status as keyof typeof styles] || styles.Eligible;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const eligibleCredits = credits.filter(c => c.status === 'Eligible');
  const activeCredits = credits.filter(c => c.status === 'Active');
  const completedCredits = credits.filter(c => c.status === 'Repaid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900 dark:text-white">Credits</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your USDC loans and repayments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white">Eligible</h3>
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">{eligibleCredits.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${eligibleCredits.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} USDC
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white">Active</h3>
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">{activeCredits.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${activeCredits.reduce((sum, c) => sum + c.remainingAmount, 0).toLocaleString()} remaining
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white">Completed</h3>
          </div>
          <p className="text-2xl text-gray-900 dark:text-white">{completedCredits.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ${completedCredits.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} repaid
          </p>
        </div>
      </div>

      {/* Eligible Credits */}
      {eligibleCredits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl text-gray-900 dark:text-white">Eligible Credits</h2>
          {eligibleCredits.map((credit) => (
            <div key={credit.id} className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-2">Credit Available for {credit.lotId}</h3>
                  <p className="text-blue-100">
                    Estimated amount: <span className="font-bold">${credit.amount.toLocaleString()} USDC</span>
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-blue-100">
                    <span>APR: {credit.apr}%</span>
                    <span>Term: {credit.termMonths} months</span>
                  </div>
                </div>
                <button
                  onClick={() => onViewLot(credit.lotId)}
                  className="text-blue-100 hover:text-white"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  Simulate Repayment Plan
                </button>
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium">
                  Confirm Credit Request
                </button>
              </div>
              <p className="text-xs text-blue-100 mt-3">
                Runs on Polygon • Managed via CreditVault
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Active & Completed Credits */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg text-gray-900 dark:text-white">All Credits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Credit ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {credits.filter(c => c.status !== 'Eligible').map((credit) => {
                const badge = getStatusBadge(credit.status);
                const Icon = badge.icon;
                const progress = credit.amount > 0 ? (credit.paidAmount / credit.amount) * 100 : 0;
                
                return (
                  <tr key={credit.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{credit.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onViewLot(credit.lotId)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {credit.lotId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">${credit.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {credit.apr}% APR • {credit.termMonths}mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        <Icon className="w-3 h-3" />
                        {credit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{progress.toFixed(0)}%</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            ${credit.remainingAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
