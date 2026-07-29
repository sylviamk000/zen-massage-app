import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onDemoLogin: (role: 'cliente' | 'masajista') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onDemoLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--zen-bg)'
    }}>
      <div className="zen-card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 1.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🐻 🌿 🍄</div>
        
        <h1 style={{ fontSize: '1.8rem', color: 'var(--zen-forest-dark)', marginBottom: '0.5rem' }}>
          Zen Zen Regulado
        </h1>
        <p style={{ color: 'var(--zen-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Introduce tu correo y contraseña para entrar
        </p>

        {errorMsg && (
          <div style={{
            background: 'var(--status-rejected-bg)',
            color: 'var(--status-rejected-text)',
            padding: '12px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '6px', letterSpacing: '0.04em' }}>
              CORREO ELECTRÓNICO
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--zen-text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mataosos@gmail.com"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--zen-border)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  background: 'var(--zen-bg-card-alt)',
                  color: 'var(--zen-text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '6px', letterSpacing: '0.04em' }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--zen-text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--zen-border)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  background: 'var(--zen-bg-card-alt)',
                  color: 'var(--zen-text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button type="submit" className="zen-button primary" disabled={loading} style={{ padding: '16px', fontSize: '1rem', marginTop: '0.5rem' }}>
            <Sparkles size={18} /> {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--zen-border-subtle)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--zen-text-muted)', marginBottom: '10px' }}>
            Acceso rápido sin contraseña (Modo Demo):
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="zen-button secondary"
              onClick={() => onDemoLogin('cliente')}
              style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
            >
              🐻 Mataosos
            </button>
            <button
              className="zen-button secondary"
              onClick={() => onDemoLogin('masajista')}
              style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
            >
              🍄 Gnomo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
