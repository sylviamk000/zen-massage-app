import { useState } from 'react';
import { Header } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { useAppContext } from './context/AppContext';
import { AchievementsView } from './components/AchievementsView';
import { Clock, Home, User as UserIcon, X, Trophy } from 'lucide-react';

function App() {
  const { currentUser, setDemoUser, updateBannerMessage, dismissUpdateBanner } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'achievements' | 'settings'>('dashboard');

  if (!currentUser) {
    return <LoginView onDemoLogin={(role) => setDemoUser(role)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Floating App Update Notification Banner */}
      {updateBannerMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          color: '#FFFFFF',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: '12px' }}>
            <span>{updateBannerMessage}</span>
          </div>
          <button 
            onClick={dismissUpdateBanner}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Header />
      
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' ? (
          currentUser.role === 'masajista' ? <AdminDashboard /> : <UserDashboard />
        ) : activeTab === 'history' ? (
          <HistoryView />
        ) : activeTab === 'achievements' && currentUser.role === 'masajista' ? (
          <AchievementsView />
        ) : (
          <SettingsView />
        )}
      </main>
      
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.85rem 0.5rem',
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
            color: activeTab === 'dashboard' ? 'var(--zen-amber)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'dashboard' ? 600 : 400
          }}
        >
          <Home size={22} />
          <span style={{ fontSize: '0.75rem' }}>Inicio</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            background: 'none', border: 'none', 
            color: activeTab === 'history' ? 'var(--zen-amber)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'history' ? 600 : 400
          }}
        >
          <Clock size={22} />
          <span style={{ fontSize: '0.75rem' }}>Historial</span>
        </button>

        {/* LOGROS (SÓLO VISIBLE Y ACCESIBLE PARA EL GNOMO) */}
        {currentUser.role === 'masajista' && (
          <button 
            onClick={() => setActiveTab('achievements')}
            style={{ 
              background: 'none', border: 'none', 
              color: activeTab === 'achievements' ? 'var(--zen-amber)' : 'var(--zen-text-muted)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: activeTab === 'achievements' ? 600 : 400
            }}
          >
            <Trophy size={22} />
            <span style={{ fontSize: '0.75rem' }}>Logros</span>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('settings')}
          style={{ 
            background: 'none', border: 'none', 
            color: activeTab === 'settings' ? 'var(--zen-amber)' : 'var(--zen-text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'settings' ? 600 : 400
          }}
        >
          <UserIcon size={22} />
          <span style={{ fontSize: '0.75rem' }}>Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
