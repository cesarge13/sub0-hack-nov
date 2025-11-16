import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ThemeProvider } from './components/ThemeProvider';
import { Sidebar } from './components/Sidebar';
import { WalletPanel } from './components/WalletPanel';
import { Dashboard } from './components/Dashboard';
import { Documents } from './components/Documents';
import { Certifications } from './components/Certifications';
import { Verifications } from './components/Verifications';
import { TTLAlerts } from './components/TTLAlerts';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { CertificationFlowModal } from './components/CertificationFlowModal';

type Screen = 'dashboard' | 'documents' | 'certifications' | 'verifications' | 'ttl-alerts' | 'analytics' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showCertificationFlow, setShowCertificationFlow] = useState(false);
  const { address: walletAddress } = useAccount();

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
      case 'documents':
        return <Documents onUploadDocument={() => setShowCertificationFlow(true)} />;
      case 'certifications':
        return <Certifications />;
      case 'verifications':
        return <Verifications />;
      case 'ttl-alerts':
        return <TTLAlerts />;
      case 'analytics':
        return <Analytics />;
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
          <WalletPanel />
          
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
      </div>
    </ThemeProvider>
  );
}
