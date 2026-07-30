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
      <div>
        <h1 style={{ margin: '0 0 2px 0', fontSize: '1.65rem', fontWeight: 600, color: 'var(--zen-forest-dark)' }}>
          Hola, {currentUser.name} {currentUser.avatar_emoji}
        </h1>
        <p style={{ margin: 0, color: 'var(--zen-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          {currentUser.role === 'cliente' ? '¿Te apetece un masaje hoy?' : 'Panel de administración zen'}
        </p>
      </div>
    </header>
  );
};
