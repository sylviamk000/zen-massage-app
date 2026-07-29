import { useState } from 'react';
import { Header } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { useAppContext } from './context/AppContext';
import { Clock, Home, Settings } from 'lucide-react';

function App() {
  const { currentUser, setDemoUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');

  if (!currentUser) {
    return <LoginView onDemoLogin={(role) => setDemoUser(role)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' ? (
          currentUser.role === 'masajista' ? <AdminDashboard /> : <UserDashboard />
        ) : activeTab === 'history' ? (
          <HistoryView />
        ) : (
          <SettingsView />
        )}
      </main>
      
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        backgroundColor: 'var(--zen-bg-card)',
        borderTop: '1px solid var(--zen-border)',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            background: 'none', border: 'none', 
            color: activeTab === 'dashboard' ? 'var(--zen-forest-dark)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'dashboard' ? 600 : 400
          }}
        >
          <Home size={24} />
          <span style={{ fontSize: '0.8rem' }}>Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            background: 'none', border: 'none', 
            color: activeTab === 'history' ? 'var(--zen-forest-dark)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'history' ? 600 : 400
          }}
        >
          <Clock size={24} />
          <span style={{ fontSize: '0.8rem' }}>Historial</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ 
            background: 'none', border: 'none', 
            color: activeTab === 'settings' ? 'var(--zen-forest-dark)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'settings' ? 600 : 400
          }}
        >
          <Settings size={24} />
          <span style={{ fontSize: '0.8rem' }}>Ajustes</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
