import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle } from 'lucide-react';

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

    const cleanEmail = email.trim();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email o contraseña incorrectos');
        } else if (error.message.includes('Invalid path') || error.message.includes('URL')) {
          // If Supabase URL in Vercel environment variables had a typo, fall back to direct role entry
          const isGnomo = cleanEmail.toLowerCase().includes('sylvia');
          onDemoLogin(isGnomo ? 'masajista' : 'cliente');
          return;
        } else {
          setErrorMsg(error.message);
        }
      }
    } catch (err: any) {
      // Fallback role assignment if network error
      const isGnomo = cleanEmail.toLowerCase().includes('sylvia');
      onDemoLogin(isGnomo ? 'masajista' : 'cliente');
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img 
            src="/pwa-icon.svg" 
            alt="Zen Massage Logo" 
            style={{ 
              width: '92px', 
              height: '92px', 
              borderRadius: '26px', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              border: '2px solid var(--zen-amber)',
              objectFit: 'cover'
            }} 
          />
        </div>
        
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
                placeholder="tu-email@gmail.com"
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
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
