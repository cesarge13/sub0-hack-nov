import { 
  LayoutDashboard, 
  FileText, 
  Award, 
  ShieldCheck,
  Clock, 
  BarChart3, 
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'ttl-alerts', label: 'TTL Alerts', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg"
              style={{ boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)' }}
            >
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Certik</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Document Certification</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-teal-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="mb-2">Powered by</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-medium">
              Arkiv Protocol
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium">
              IPFS
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
