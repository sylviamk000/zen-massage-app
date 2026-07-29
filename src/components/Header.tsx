import React from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentUser, logout, resetApp } = useAppContext();

  if (!currentUser) return null;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 1.25rem 0.5rem 1.25rem',
      maxWidth: '580px',
      margin: '0 auto',
      width: '100%',
      zIndex: 10
    }}>
      <div>
        <h1 style={{ margin: '0 0 2px 0', fontSize: '1.65rem', fontWeight: 600, color: 'var(--zen-forest-dark)' }}>
          Hola, {currentUser.name} {currentUser.avatar_emoji}
        </h1>
        <p style={{ margin: 0, color: 'var(--zen-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          {currentUser.role === 'cliente' ? '¿Te apetece un masaje hoy?' : 'Panel de administración zen'}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Reset button ONLY visible for Gnomo (masajista) */}
        {currentUser.role === 'masajista' && (
          <button 
            onClick={resetApp}
            className="zen-button danger"
            style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'auto', borderRadius: '20px', gap: '4px' }}
            title="Reiniciar aplicación"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="zen-button secondary"
          style={{ padding: '8px 12px', borderRadius: '20px', width: 'auto', fontSize: '0.8rem', gap: '6px' }}
          title="Cerrar sesión"
        >
          <LogOut size={14} /> Salir
        </button>
      </div>
    </header>
  );
};
