import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FullscreenTimer } from './FullscreenTimer';
import { Clock, RefreshCw, CheckCircle2, Sliders } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { dailyBalance, requests, history, createRequest, updateRequestStatus, recordSession } = useAppContext();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMinutes, setRequestMinutes] = useState(10);
  const [requestNote, setRequestNote] = useState('');
  
  const [showRatingScreen, setShowRatingScreen] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!dailyBalance) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--zen-text-muted)' }}>
        <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '12px' }} />
        <p>Cargando tu bolsa de tiempo zen...</p>
      </div>
    );
  }

  const usedMinutes = Math.floor(dailyBalance.usedToday / 60);
  const remainingMinutes = Math.max(0, dailyBalance.totalStartingBalance - usedMinutes);
  
  const currentRequest = requests.find(r => ['pendiente', 'aprobada', 'en_curso'].includes(r.status));

  const handleCreateRequest = () => {
    createRequest(requestMinutes, requestNote);
    setShowRequestForm(false);
    setRequestNote('');

    // Floating toast message that disappears after 3 seconds
    setToastMessage('Petición enviada a Gnomo 🍄');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartSession = () => {
    if (currentRequest) {
      updateRequestStatus(currentRequest.id, 'en_curso');
    }
  };

  const handleTimerFinish = (reqId: string, _requestedSeconds: number, _consumedSeconds: number) => {
    updateRequestStatus(reqId, 'completada', { rating: 5 });
    setShowRatingScreen(reqId);
  };

  const submitRating = () => {
    if (showRatingScreen) {
      const req = requests.find(r => r.id === showRatingScreen);
      if (req) {
        recordSession(req.id, req.minutes * 60, req.actual_minutes ? req.actual_minutes * 60 : req.minutes * 60, rating);
      }
      setShowRatingScreen(null);
    }
  };

  // Ultra-responsive Rating Overlay Modal
  if (showRatingScreen) {
    return (
      <div className="fade-in" style={{
        position: 'fixed', inset: 0, 
        background: 'rgba(21, 32, 23, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '1rem'
      }}>
        <div className="zen-card" style={{ 
          maxWidth: '400px', 
          width: '92%', 
          textAlign: 'center', 
          padding: '2rem 1.25rem',
          background: 'var(--zen-bg-card)',
          borderRadius: '28px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid var(--zen-border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐻✨</div>
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: 'var(--zen-forest-dark)', fontWeight: 600 }}>
            ¿Qué tal tu masaje?
          </h2>
          <p style={{ color: 'var(--zen-text-muted)', fontSize: '0.9rem', margin: '0 0 1.75rem 0', lineHeight: 1.4 }}>
            Valora tu sesión de masaje para guardarla en tu historial zen
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val} 
                onClick={() => setRating(val)}
                style={{ 
                  background: val <= rating ? 'var(--zen-forest-light)' : 'var(--zen-bg-card-alt)',
                  border: val <= rating ? '2px solid var(--zen-forest-dark)' : '1px solid var(--zen-border)',
                  borderRadius: '16px',
                  fontSize: '2rem', 
                  cursor: 'pointer',
                  padding: '12px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: val <= rating ? 1 : 0.4,
                  transform: val === rating ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                title={`${val} Oso${val !== 1 ? 's' : ''}`}
              >
                🐻
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--zen-forest-dark)' }}>
            Valoración: {rating} / 5 🐻
          </div>

          <button className="zen-button primary" onClick={submitRating} style={{ width: '100%', padding: '16px' }}>
            Guardar Valoración
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Timer Active State
  if (currentRequest?.status === 'en_curso') {
    return (
      <FullscreenTimer 
        request={currentRequest}
        onFinish={(reqId, reqSec, conSec) => handleTimerFinish(reqId, reqSec, conSec)}
      />
    );
  }

  return (
    <div className="fade-in" style={{ padding: '0 1.25rem 2rem 1.25rem', maxWidth: '580px', margin: '0 auto', position: 'relative' }}>
      
      {/* Toast Notification message - 100% PERFECTLY CENTERED */}
      {toastMessage && (
        <div className="fade-in" style={{
          position: 'fixed',
          top: '24px',
          left: '0',
          right: '0',
          margin: '0 auto',
          width: 'fit-content',
          maxWidth: '88vw',
          background: 'var(--zen-forest-dark)',
          color: '#FFFFFF',
          padding: '14px 26px',
          borderRadius: '30px',
          boxShadow: '0 14px 35px rgba(0,0,0,0.35)',
          zIndex: 99999,
          fontSize: '0.95rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: '1.5px solid rgba(255,255,255,0.25)',
          textAlign: 'center'
        }}>
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* Hero Stats Card */}
      <div className="zen-card-hero" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, fontWeight: 600 }}>
              ESTADO DEL DÍA
            </span>
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '1rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }}></span>
                Acumulado: <strong style={{ color: '#FFFFFF' }}>{dailyBalance.totalStartingBalance} min</strong>
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FDBA74' }}></span>
                Usado: <strong style={{ color: '#FFFFFF' }}>{usedMinutes} min</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '86px', height: '86px', 
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              {remainingMinutes}
            </div>
            <span style={{ fontSize: '0.8rem', marginTop: '8px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', letterSpacing: '0.04em' }}>
              RESTANTE
            </span>
          </div>
        </div>
      </div>

      {/* Active Request Handler */}
      {currentRequest ? (
        <div className="zen-card" style={{ marginBottom: '1.5rem', background: 'var(--zen-bg-card-alt)', border: '1.5px solid var(--zen-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--zen-text-muted)' }}>
              SOLICITUD EN CURSO
            </span>
            <span className={`badge-status ${currentRequest.status === 'aprobada' ? 'approved' : 'pending'}`}>
              {currentRequest.status === 'aprobada' ? (
                <><CheckCircle2 size={14} /> ¡Aprobada por Gnomo!</>
              ) : (
                <><Clock size={14} /> Esperando a Gnomo</>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: currentRequest.note ? '8px' : '16px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--zen-forest-dark)' }}>
              {currentRequest.minutes}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--zen-text-muted)', fontWeight: 500 }}>minutos de masaje</span>
          </div>

          {currentRequest.note && (
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--zen-text-muted)', fontStyle: 'italic', background: 'var(--zen-bg-subtle)', padding: '10px 14px', borderRadius: '12px' }}>
              "{currentRequest.note}"
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="zen-button secondary" 
              onClick={() => updateRequestStatus(currentRequest.id, 'cancelada')}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            {currentRequest.status === 'aprobada' && (
              <button className="zen-button primary" onClick={handleStartSession} style={{ flex: 1 }}>
                Comenzar
              </button>
            )}
          </div>
        </div>
      ) : (
        !showRequestForm && (
          <button 
            className="zen-button primary"
            onClick={() => setShowRequestForm(true)}
            style={{ marginBottom: '1.5rem', padding: '18px 24px', fontSize: '1.05rem' }}
            disabled={remainingMinutes <= 0}
          >
            {remainingMinutes <= 0 ? 'Sin minutos restantes hoy' : 'Pedir masaje'}
          </button>
        )
      )}

      {/* Request Form Drawer / Card */}
      {showRequestForm && !currentRequest && (
        <div className="zen-card fade-in" style={{ marginBottom: '1.5rem', background: 'var(--zen-bg-card)', border: '2px solid var(--zen-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--zen-forest-dark)' }}>Nueva petición</h3>
            <button 
              onClick={() => setShowRequestForm(false)}
              style={{ background: 'none', border: 'none', color: 'var(--zen-text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
            >
              ✕
            </button>
          </div>
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '10px', letterSpacing: '0.04em' }}>
            DURACIÓN DEL MASAJE ({requestMinutes} MIN)
          </label>
          
          {/* Quick Selector Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {[5, 10, 15, 20].map(val => {
              const isDisabled = val > remainingMinutes;
              const isSelected = requestMinutes === val;
              return (
                <button 
                  key={val}
                  type="button"
                  className={`zen-button ${isSelected ? 'primary' : 'secondary'}`}
                  style={{ 
                    padding: '10px 4px', 
                    fontSize: '0.9rem', 
                    borderRadius: '12px',
                    ...(isSelected && { border: 'none' })
                  }}
                  onClick={() => setRequestMinutes(val)}
                  disabled={isDisabled}
                >
                  {val} min
                </button>
              );
            })}
          </div>

          {/* Custom Time Range Controller */}
          <div style={{ background: 'var(--zen-bg-card-alt)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--zen-border)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--zen-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} /> Ajustar tiempo exacto:
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--zen-forest-dark)' }}>
                {requestMinutes} min
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={Math.max(1, remainingMinutes)} 
              value={requestMinutes}
              onChange={(e) => setRequestMinutes(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--zen-amber)', cursor: 'pointer' }}
            />
          </div>

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--zen-forest-medium)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            NOTA PARA GNOMO (OPCIONAL)
          </label>
          <textarea 
            value={requestNote}
            onChange={e => setRequestNote(e.target.value)}
            placeholder='ej: "Hoy también quiero glops"'
            style={{ 
              width: '100%', padding: '14px', borderRadius: '14px', 
              border: '1.5px solid var(--zen-border)', marginBottom: '1.25rem',
              fontFamily: 'var(--font-sans)', fontSize: '0.95rem', background: 'var(--zen-bg-card-alt)',
              resize: 'none', color: 'var(--zen-text-main)', outline: 'none'
            }}
            rows={3}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="zen-button secondary" 
              onClick={() => setShowRequestForm(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="zen-button primary" 
              onClick={handleCreateRequest} 
              disabled={requestMinutes <= 0 || requestMinutes > remainingMinutes}
              style={{ flex: 2 }}
            >
              Enviar petición
            </button>
          </div>
        </div>
      )}

      {/* History section on Home screen */}
      <div className="zen-card" style={{ padding: '1.5rem', background: 'var(--zen-bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--zen-forest-dark)' }}>Historial</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--zen-text-muted)' }}>Últimas sesiones</span>
        </div>
        
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--zen-text-muted)', padding: '2rem 1rem', background: 'var(--zen-bg-card-alt)', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: 500 }}>Aún no has disfrutado ningún masaje.</p>
            <span style={{ fontSize: '0.85rem' }}>Pide el primero arriba 🐻</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.slice(0, 5).map(log => (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 14px', 
                  borderRadius: '16px',
                  background: 'var(--zen-bg-card-alt)',
                  border: '1px solid var(--zen-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: log.type === 'renewal' ? 'var(--zen-amber-light)' : 'var(--zen-forest-light)', 
                    padding: '10px', borderRadius: '12px', color: log.type === 'renewal' ? 'var(--zen-amber)' : 'var(--zen-forest-dark)'
                  }}>
                    {log.type === 'renewal' ? <RefreshCw size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '0.9rem', color: 'var(--zen-text-main)' }}>
                      {log.type === 'renewal' ? 'Renovación Diaria' : 'Sesión de Masaje'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--zen-text-muted)' }}>
                      {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {log.type === 'session' && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--zen-forest-dark)', display: 'block' }}>
                      {Math.floor(log.durationConsumed / 60)} min
                    </span>
                    {log.rating && (
                      <span style={{ fontSize: '0.8rem' }}>{'🐻'.repeat(log.rating)}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
