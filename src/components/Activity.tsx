import { useEffect, useState } from 'react';
import { Sprout, CreditCard, DollarSign, AlertCircle, Filter } from 'lucide-react';
import { origenApi, ActivityEvent } from '../services/origenApi';

interface ActivityProps {
  onNavigate: (screen: string) => void;
}

export function Activity({ onNavigate }: ActivityProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lot' | 'credit' | 'payment' | 'system'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      const data = await origenApi.getActivities(filter === 'all' ? undefined : filter);
      setActivities(data);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lot':
        return { icon: Sprout, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/10' };
      case 'credit':
        return { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' };
      case 'payment':
        return { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' };
      case 'system':
        return { icon: AlertCircle, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/10' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10' };
    }
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
          <h1 className="text-2xl text-gray-900 dark:text-white">Activity Timeline</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Recent events and system activity
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex gap-2">
            {['all', 'lot', 'credit', 'payment', 'system'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="p-6">
          <div className="space-y-6">
            {activities.map((event, index) => {
              const iconConfig = getActivityIcon(event.type);
              const Icon = iconConfig.icon;
              
              return (
                <div key={event.id} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconConfig.bg}`}>
                      <Icon className={`w-6 h-6 ${iconConfig.color}`} />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute top-12 left-6 w-px h-6 bg-gray-200 dark:bg-slate-700" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white font-medium">{event.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.type === 'lot' 
                              ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                              : event.type === 'credit'
                              ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              : event.type === 'payment'
                              ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                              : 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                      {event.lotId && (
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          View Lot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {activities.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg text-gray-900 dark:text-white mb-2">No Activity</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No events found for the selected filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
