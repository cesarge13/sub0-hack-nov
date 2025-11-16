import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, ExternalLink, RefreshCw, CreditCard, File, CheckCircle, AlertCircle } from 'lucide-react';
import { origenApi, Lot, Credit } from '../services/origenApi';

interface LotDetailProps {
  lotId: string | null;
  onNavigate: (screen: string) => void;
}

export function LotDetail({ lotId, onNavigate }: LotDetailProps) {
  const [lot, setLot] = useState<Lot | null>(null);
  const [credit, setCredit] = useState<Credit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (lotId) {
      loadLotDetail();
    }
  }, [lotId]);

  const loadLotDetail = async () => {
    if (!lotId) return;
    
    try {
      const lotData = await origenApi.getLotById(lotId);
      setLot(lotData);
      
      if (lotData?.creditId) {
        const creditData = await origenApi.getCreditById(lotData.creditId);
        setCredit(creditData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshScore = async () => {
    if (!lotId) return;
    
    setRefreshing(true);
    try {
      const newScore = await origenApi.refreshAgroScore(lotId);
      if (lot) {
        setLot({ ...lot, agroScore: newScore });
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !lot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-500/10';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-500/10';
    return 'bg-red-100 dark:bg-red-500/10';
  };

  const estimatedCredit = lot.agroScore > 70 ? Math.floor(lot.area * 1000) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('lots')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-white">{lot.id} - {lot.cropType}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                lot.status === 'Active' 
                  ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                  : lot.status === 'Harvested'
                  ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
              }`}>
                {lot.status}
              </span>
              {lot.creditStatus === 'Eligible' && (
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  Eligible for Credit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Crop Type</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.cropType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.area} hectares</p>
          </div>
          {lot.weight && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
              <p className="text-gray-900 dark:text-white mt-1">{lot.weight} kg</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cooperative</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.cooperative}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Planting Date</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.plantingDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Harvest Date</p>
            <p className="text-gray-900 dark:text-white mt-1">{lot.harvestDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900 dark:text-white">Evidence</h3>
            <button className="px-3 py-1 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Add Evidence
            </button>
          </div>

          {lot.evidenceFiles.length > 0 ? (
            <div className="space-y-2">
              {lot.evidenceFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB • {file.uploadDate}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Stored on Filecoin Onchain Cloud
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No evidence uploaded yet</p>
          )}
        </div>

        {/* AgroScore */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900 dark:text-white">AgroScore</h3>
            <button
              onClick={handleRefreshScore}
              disabled={refreshing}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Score
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(lot.agroScore)}`}>
              <div className={`text-4xl ${getScoreColor(lot.agroScore)}`}>
                {lot.agroScore}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">out of 100</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Evidence Quality</span>
                <span className="text-gray-900 dark:text-white">85%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Data Consistency</span>
                <span className="text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Historical Behavior</span>
                <span className="text-gray-900 dark:text-white">78%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <span className="inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Scored via EVVM MATE on Sepolia
            </span>
          </p>
        </div>
      </div>

      {/* Credit Status */}
      {!credit && lot.creditStatus !== 'Active' && lot.creditStatus !== 'Repaid' ? (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl mb-2">Credit Available</h3>
              <p className="text-blue-100 mb-4">
                This lot is eligible for a credit up to <span className="font-bold">${estimatedCredit.toLocaleString()} USDC</span>
              </p>
              <p className="text-sm text-blue-100 mb-4">
                • APR: 12.0% • Term: 12 months • Runs on Polygon PoS
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('credits')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Request Credit for This Lot
          </button>
        </div>
      ) : credit ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <h3 className="text-lg text-gray-900 dark:text-white mb-4">Associated Credit</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Original Amount</p>
              <p className="text-xl text-gray-900 dark:text-white mt-1">${credit.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">APR</p>
              <p className="text-xl text-gray-900 dark:text-white mt-1">{credit.apr}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Term</p>
              <p className="text-xl text-gray-900 dark:text-white mt-1">{credit.termMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className={`text-xl mt-1 ${
                credit.status === 'Active' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {credit.status}
              </p>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Repayment Progress</span>
              <span className="text-gray-900 dark:text-white">
                ${credit.paidAmount.toLocaleString()} / ${credit.amount.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${(credit.paidAmount / credit.amount) * 100}%` }} 
              />
            </div>
          </div>

          <button
            onClick={() => onNavigate('credits')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View full credit details →
          </button>
        </div>
      ) : null}
    </div>
  );
}
