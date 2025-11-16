import { useEffect, useState } from 'react';
import { DollarSign, Calendar, Wallet, AlertCircle } from 'lucide-react';
import { origenApi, Credit, Installment } from '../services/origenApi';

interface PaymentsProps {
  onNavigate: (screen: string) => void;
}

export function Payments({ onNavigate }: PaymentsProps) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [payingInstallment, setPayingInstallment] = useState<string | null>(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await origenApi.getCredits();
      setCredits(data.filter(c => c.status === 'Active'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (creditId: string, installmentNumber: number) => {
    setPayingInstallment(`${creditId}-${installmentNumber}`);
    try {
      await origenApi.payInstallment(creditId, installmentNumber);
      await loadCredits();
    } finally {
      setPayingInstallment(null);
    }
  };

  const allInstallments: Array<Installment & { creditId: string; lotId: string }> = [];
  credits.forEach(credit => {
    credit.installments.forEach(installment => {
      allInstallments.push({
        ...installment,
        creditId: credit.id,
        lotId: credit.lotId
      });
    });
  });

  const upcomingInstallments = allInstallments
    .filter(i => i.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

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
      <div>
        <h1 className="text-2xl text-gray-900 dark:text-white">Payments & Autopay</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage installments and automatic collection
        </p>
      </div>

      {/* Autopay Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl mb-2">Automatic Collection (x402-style Autopay)</h3>
            <p className="text-purple-100 text-sm">
              Installments can be charged automatically via a collection agent or manually from this panel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{autoPayEnabled ? 'Enabled' : 'Disabled'}</span>
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoPayEnabled ? 'bg-green-500' : 'bg-white/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoPayEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <p className="text-xs text-purple-100">
          When enabled, payments will be automatically processed from your connected wallet on due dates.
        </p>
      </div>

      {/* Upcoming Installments */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg text-gray-900 dark:text-white">Upcoming Installments</h2>
        </div>
        
        {upcomingInstallments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {upcomingInstallments.map((installment) => {
              const isOverdue = new Date(installment.dueDate) < new Date();
              const isPaying = payingInstallment === `${installment.creditId}-${installment.number}`;
              
              return (
                <div key={`${installment.creditId}-${installment.number}`} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isOverdue 
                          ? 'bg-red-100 dark:bg-red-500/10' 
                          : 'bg-blue-100 dark:bg-blue-500/10'
                      }`}>
                        <DollarSign className={`w-6 h-6 ${
                          isOverdue 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-gray-900 dark:text-white font-medium">
                            {installment.creditId} • Installment #{installment.number}
                          </h3>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4" />
                            Lot: {installment.lotId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(installment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl text-gray-900 dark:text-white">
                          ${installment.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">USDC</div>
                      </div>
                      <button
                        onClick={() => handlePayInstallment(installment.creditId, installment.number)}
                        disabled={isPaying}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium"
                      >
                        {isPaying ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg text-gray-900 dark:text-white mb-2">No Upcoming Payments</h3>
            <p className="text-gray-500 dark:text-gray-400">
              You're all caught up! No installments due at this time.
            </p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg text-gray-900 dark:text-white">Recent Payments</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {allInstallments
            .filter(i => i.status === 'Paid')
            .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
            .slice(0, 10)
            .map((installment) => (
              <div key={`${installment.creditId}-${installment.number}`} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {installment.creditId} • Installment #{installment.number}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paid: {new Date(installment.paidDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      ${installment.amount.toFixed(2)} USDC
                    </p>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      View TX
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
