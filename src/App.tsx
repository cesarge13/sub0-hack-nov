import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ThemeProvider } from './components/ThemeProvider';
import { Sidebar } from './components/Sidebar';
import { WalletPanel } from './components/WalletPanel';
import { Dashboard } from './components/Dashboard';
import { Assets } from './components/Assets';
import { Events } from './components/Events';
import { Certifications } from './components/Certifications';
import { Verifications } from './components/Verifications';
import { ComplianceRenewals } from './components/ComplianceRenewals';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { CertificationFlowModal } from './components/CertificationFlowModal';
import { AssetDetailPage } from './components/AssetDetailPage';
import { DecisionSupport } from './components/DecisionSupport';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { OperationalAlerts } from './components/OperationalAlerts';
import { useUser } from './hooks/useUser';

type Screen = 'dashboard' | 'decision-support' | 'assets' | 'asset-detail' | 'events' | 'certifications' | 'verifications' | 'compliance-renewals' | 'analytics' | 'operational-alerts' | 'user-management' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCertificationFlow, setShowCertificationFlow] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { address: walletAddress } = useAccount();
  const { user, isLoading: userLoading, isAuthenticated } = useUser();

  // Mostrar login si no hay usuario autenticado (opcional en modo público)
  // En modo público, el login es opcional
  useEffect(() => {
    // Solo mostrar login automáticamente si no hay sesión guardada
    // En modo público, permitir navegación sin login
    const hasSession = localStorage.getItem('certifik_session_token');
    if (!hasSession && !userLoading) {
      // No forzar login en modo público
      // setShowLogin(true);
    }
  }, [userLoading]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setCurrentScreen} 
            onUploadDocument={() => setShowCertificationFlow(true)}
            walletAddress={walletAddress}
          />
        );
      case 'assets':
        return (
          <Assets 
            onUploadDocument={() => setShowCertificationFlow(true)}
            onAssetClick={(assetId) => {
              setSelectedAssetId(assetId);
              setCurrentScreen('asset-detail');
            }}
          />
        );
      case 'asset-detail':
        return selectedAssetId ? (
          <AssetDetailPage
            assetId={selectedAssetId}
            onBack={() => {
              setCurrentScreen('assets');
              setSelectedAssetId(null);
            }}
          />
        ) : (
          <Assets 
            onUploadDocument={() => setShowCertificationFlow(true)}
            onAssetClick={(assetId) => {
              setSelectedAssetId(assetId);
              setCurrentScreen('asset-detail');
            }}
          />
        );
      case 'decision-support':
        return <DecisionSupport />;
      case 'events':
        return <Events />;
      case 'certifications':
        return <Certifications />;
      case 'verifications':
        return <Verifications />;
      case 'compliance-renewals':
        return <ComplianceRenewals />;
      case 'analytics':
        return <Analytics />;
      case 'operational-alerts':
        return <OperationalAlerts />;
      case 'user-management':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            onNavigate={setCurrentScreen} 
            onUploadDocument={() => setShowCertificationFlow(true)}
            walletAddress={walletAddress}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
        <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <WalletPanel onShowLogin={() => setShowLogin(true)} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1800px] mx-auto px-6 py-8">
              {renderScreen()}
            </div>
          </main>
        </div>

        {showCertificationFlow && (
          <CertificationFlowModal 
            onClose={() => setShowCertificationFlow(false)}
            walletAddress={walletAddress}
          />
        )}

        {showLogin && (
          <Login 
            onClose={() => setShowLogin(false)}
            onSuccess={() => {
              setShowLogin(false);
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
