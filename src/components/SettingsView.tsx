import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, Bell, BellOff, LogOut, RotateCcw, Smartphone, Moon, Sun } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile, requestNotificationPermission, notificationsEnabled, logout, resetApp } = useAppContext();
  const [name, setName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState(currentUser?.avatar_emoji || '🐻');
  const [saved, setSaved] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('zen_dark_mode') === 'true' || 
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('zen_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('zen_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const handleSave = () => {
    updateProfile(name, emoji);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      requestNotificationPermission();
    } else {
      alert('ℹ️ Para desactivar notificaciones por completo, puedes desactivar los permisos en los ajustes de tu navegador o móvil.');
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 1.25rem 2rem 1.25rem', maxWidth: '580px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--zen-forest-dark)' }}>
        Mi Perfil
      </h2>

      <div className="zen-card" style={{ background: 'var(--zen-bg-card)', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
        
        {/* NOMBRE */}
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

        {/* EMOJI AVATAR */}
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

        <button 
          className="zen-button primary" 
          onClick={handleSave}
          style={{ marginTop: '0.25rem' }}
        >
          {saved ? <><Check size={18} /> ¡Guardado!</> : 'Guardar Cambios'}
        </button>

        {/* MODO OSCURO SWITCH */}
        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            APARIENCIA
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--zen-bg-card-alt)', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--zen-border)' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--zen-text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
              {isDarkMode ? <Moon size={18} color="var(--zen-amber)" /> : <Sun size={18} color="var(--zen-amber)" />}
              Modo Oscuro
            </span>

            {/* iOS Switch Toggle */}
            <div 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                background: isDarkMode ? 'var(--zen-amber)' : 'var(--zen-border)',
                padding: '3px',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#FFFFFF',
                transform: isDarkMode ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }} />
            </div>
          </div>
        </div>

        {/* NOTIFICACIONES SECTION WITH SWITCH */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            NOTIFICACIONES AL MÓVIL
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--zen-bg-card-alt)', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--zen-border)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--zen-text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
              {notificationsEnabled ? <Bell size={18} color="var(--zen-forest-dark)" /> : <BellOff size={18} color="var(--zen-text-muted)" />}
              {notificationsEnabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
            </span>

            {/* iOS Switch Toggle for Notifications */}
            <div 
              onClick={handleToggleNotifications}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                background: notificationsEnabled ? 'var(--zen-forest-dark)' : 'var(--zen-border)',
                padding: '3px',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#FFFFFF',
                transform: notificationsEnabled ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }} />
            </div>
          </div>

          <div style={{ background: 'var(--zen-amber-light)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--zen-border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Smartphone size={16} style={{ color: 'var(--zen-amber)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--zen-text-main)', lineHeight: 1.4 }}>
              <strong>Para notificaciones con la pantalla apagada:</strong> Toca <i>Compartir</i> → <i>"Añadir a pantalla de inicio"</i> en tu navegador e instala la app en tu móvil.
            </p>
          </div>
        </div>

        {/* REINICIAR APLICACIÓN (SÓLO DENTRO DEL PERFIL DEL GNOMO) */}
        {currentUser?.role === 'masajista' && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
              ADMINISTRACIÓN GNOMO
            </label>
            <button 
              onClick={resetApp}
              className="zen-button danger"
              style={{ width: '100%', padding: '12px', gap: '6px', fontSize: '0.9rem' }}
            >
              <RotateCcw size={16} /> Reiniciar aplicación y datos
            </button>
          </div>
        )}

        {/* CERRAR SESIÓN */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
          <button 
            onClick={logout}
            className="zen-button secondary"
            style={{ width: '100%', padding: '12px', gap: '6px', color: '#B91C1C', borderColor: 'rgba(185, 28, 28, 0.2)' }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
};
