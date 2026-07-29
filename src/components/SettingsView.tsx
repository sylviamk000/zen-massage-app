import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, Bell, BellOff } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile, requestNotificationPermission, notificationsEnabled } = useAppContext();
  const [name, setName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState(currentUser?.avatar_emoji || '🐻');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile(name, emoji);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ padding: '0 1.25rem 2rem 1.25rem', maxWidth: '580px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--zen-forest-dark)' }}>
        Ajustes de Perfil
      </h2>

      <div className="zen-card" style={{ background: 'var(--zen-bg-card)', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            TU NOMBRE
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '14px', 
              border: '1.5px solid var(--zen-border)',
              fontFamily: 'var(--font-sans)', fontSize: '1rem', background: 'var(--zen-bg-card-alt)',
              color: 'var(--zen-text-main)', outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '10px', letterSpacing: '0.04em' }}>
            EMOJI AVATAR
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: '100%' }}>
            {['🐻', '🍄', '🦊', '🐨', '🐼'].map(e => (
              <button 
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: '1.75rem', 
                  padding: '10px 4px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: emoji === e ? 'var(--zen-forest-light)' : 'var(--zen-bg-card-alt)',
                  border: emoji === e ? '2px solid var(--zen-forest-dark)' : '1px solid var(--zen-border)',
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: emoji === e ? 'scale(1.05)' : 'scale(1)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            NOTIFICACIONES AL MÓVIL
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--zen-bg-card-alt)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--zen-border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--zen-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {notificationsEnabled ? <Bell size={18} color="var(--zen-forest-dark)" /> : <BellOff size={18} color="var(--zen-text-muted)" />}
              {notificationsEnabled ? 'Notificaciones de móvil activas' : 'Notificaciones inactivas'}
            </span>
            <button
              onClick={requestNotificationPermission}
              className={`zen-button ${notificationsEnabled ? 'secondary' : 'primary'}`}
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {notificationsEnabled ? 'Activas' : 'Activar'}
            </button>
          </div>
        </div>

        <button 
          className="zen-button primary" 
          onClick={handleSave}
          style={{ marginTop: '0.5rem' }}
        >
          {saved ? <><Check size={18} /> ¡Guardado!</> : 'Guardar Cambios'}
        </button>

      </div>
    </div>
  );
};
