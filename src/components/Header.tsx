import React from 'react';
import { useAppContext } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentUser } = useAppContext();

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img 
          src="/pwa-icon.svg" 
          alt="Zen Logo" 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            border: '1.5px solid var(--zen-border)',
            objectFit: 'cover'
          }} 
        />
        <div>
          <h1 style={{ margin: '0 0 2px 0', fontSize: '1.55rem', fontWeight: 600, color: 'var(--zen-forest-dark)' }}>
            Hola, {currentUser.name} {currentUser.avatar_emoji}
          </h1>
          <p style={{ margin: 0, color: 'var(--zen-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
            {currentUser.role === 'cliente' ? '¿Te apetece un masaje hoy?' : 'Panel de administración zen'}
          </p>
        </div>
      </div>
    </header>
  );
};
