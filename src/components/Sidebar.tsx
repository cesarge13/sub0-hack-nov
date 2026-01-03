import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Activity,
  Award, 
  ShieldCheck,
  RefreshCw, 
  BarChart3, 
  Settings,
  Target,
  Users,
  AlertTriangle
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { Logo } from './Logo';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const { isAdmin, canManageUsers } = usePermissions();
  
  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'operational-alerts', label: 'Alertas Operativas', icon: AlertTriangle },
    { id: 'decision-support', label: 'Apoyo a Decisiones', icon: Target },
    { id: 'assets', label: 'Activos Mineros', icon: Package },
    { id: 'events', label: 'Eventos', icon: Activity },
    { id: 'certifications', label: 'Certificaciones', icon: Award },
    { id: 'verifications', label: 'Verificaciones', icon: ShieldCheck },
    { id: 'compliance-renewals', label: 'Renovaciones', icon: RefreshCw },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
    ...(isAdmin || canManageUsers ? [{ id: 'user-management', label: 'Gestión de Usuarios', icon: Users }] : []),
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <Logo size="md" />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">Gestión de Recursos Mineros</p>
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
          <p className="mb-2">Plataforma para faenas mineras</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-medium">
              Agua & Energía
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
              ESG Verificable
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
