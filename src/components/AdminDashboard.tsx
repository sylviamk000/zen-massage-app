import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, Clock, Award, Activity, Calendar, Zap, TrendingUp, RefreshCw, ListFilter } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { requests, dailyBalance, history, updateRequestStatus } = useAppContext();
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'metrics'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Rejection reason modal state
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Ahora no puedo');

  const pendingRequests = requests.filter(r => r.status === 'pendiente');
  const completedRequests = requests.filter(r => r.status === 'completada');
  const totalMasajes = completedRequests.length;
  
  // Rating calculation
  const ratings = requests.filter(r => r.rating).map(r => r.rating as number);
  const avgRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1) : '5.0';

  // KPI Analytics calculations
  const historySessions = history.filter(h => h.type === 'session');
  
  const longestFromHistory = historySessions.length 
    ? Math.max(...historySessions.map(s => Math.floor(s.durationConsumed / 60))) 
    : 0;
  const longestFromRequests = completedRequests.length
    ? Math.max(...completedRequests.map(r => r.actual_minutes || r.minutes))
    : 0;
  const longestMassage = Math.max(longestFromHistory, longestFromRequests, 20);

  const totalMinutesFromHistory = historySessions.reduce((acc, s) => acc + Math.floor(s.durationConsumed / 60), 0);
  const totalMinutesFromRequests = completedRequests.reduce((acc, r) => acc + (r.actual_minutes || r.minutes), 0);
  const totalMinutesGiven = Math.max(totalMinutesFromHistory, totalMinutesFromRequests);
  const avgDuration = totalMasajes > 0 ? Math.round(totalMinutesGiven / totalMasajes) : 15;

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayCounts: { [key: string]: number } = {
    'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0, 'Domingo': 0
  };

  requests.forEach(r => {
    if (r.created_at) {
      const day = dayNames[new Date(r.created_at).getDay()];
      if (dayCounts[day] !== undefined) dayCounts[day]++;
    }
  });

  let mostPopularDay = 'Viernes';
  let maxDayCount = -1;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostPopularDay = day;
    }
  });

  const totalDayRequests = Math.max(1, Object.values(dayCounts).reduce((a, b) => a + b, 0));

  const usedMinutes = dailyBalance ? Math.floor(dailyBalance.usedToday / 60) : 0;
  const remainingMinutes = dailyBalance ? Math.max(0, dailyBalance.totalStartingBalance - usedMinutes) : 20;

  const handleApprove = (id: string) => {
    updateRequestStatus(id, 'aprobada');
    setToastMessage('¡Masaje de Mataosos aceptado! 🐻');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectModalReqId(id);
    setRejectReason('Ahora no puedo');
  };

  const handleConfirmReject = () => {
    if (rejectModalReqId) {
      updateRequestStatus(rejectModalReqId, 'rechazada', { reject_reason: rejectReason || 'Ahora no puedo' });
      setRejectModalReqId(null);
      setRejectReason('Ahora no puedo');
      setToastMessage('Petición rechazada 🌿');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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

      {/* Rejection Reason Modal (PERFECTLY CENTERED SCREEN OVERLAY) */}
      {rejectModalReqId && (
        <div className="fade-in" style={{
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21, 32, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999, 
          padding: '1.25rem'
        }}>
          <div className="zen-card fade-in" style={{ 
            maxWidth: '380px', 
            width: '100%', 
            padding: '1.75rem 1.25rem',
            background: 'var(--zen-bg-card)',
            borderRadius: '28px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
            border: '1.5px solid var(--zen-border)',
            margin: 'auto'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--zen-forest-dark)', fontSize: '1.3rem', textAlign: 'center' }}>
              Motivo del rechazo
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: 'var(--zen-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              Indica a Mataosos por qué no puedes ahora:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
              {['Ahora no puedo', 'En 30 minutos sí puedo', 'Estoy haciendo cosas', 'Mañana sin falta'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectReason(preset)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    background: rejectReason === preset ? 'var(--zen-forest-light)' : 'var(--zen-bg-card-alt)',
                    border: rejectReason === preset ? '2px solid var(--zen-forest-dark)' : '1px solid var(--zen-border)',
                    color: 'var(--zen-text-main)',
                    cursor: 'pointer',
                    fontWeight: rejectReason === preset ? 600 : 400,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Escribe un motivo personalizado..."
              rows={2}
              style={{
                width: '100%', padding: '12px', borderRadius: '14px',
                border: '1.5px solid var(--zen-border)', marginBottom: '1.25rem',
                fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
                background: 'var(--zen-bg-card-alt)', color: 'var(--zen-text-main)',
                resize: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="zen-button secondary" 
                onClick={() => setRejectModalReqId(null)}
                style={{ flex: 1, padding: '14px' }}
              >
                Cancelar
              </button>
              <button 
                className="zen-button danger" 
                onClick={handleConfirmReject}
                style={{ flex: 1, padding: '14px' }}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation: Solicitudes e Historial VS Dashboard Métricas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', background: 'var(--zen-bg-card)', padding: '6px', borderRadius: '18px', border: '1px solid var(--zen-border)' }}>
        <button
          onClick={() => setActiveSubTab('overview')}
          style={{
            flex: 1, padding: '10px', borderRadius: '14px', border: 'none',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            background: activeSubTab === 'overview' ? 'var(--zen-forest-dark)' : 'transparent',
            color: activeSubTab === 'overview' ? '#FFFFFF' : 'var(--zen-text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListFilter size={16} /> Solicitudes e Historial
        </button>

        <button
          onClick={() => setActiveSubTab('metrics')}
          style={{
            flex: 1, padding: '10px', borderRadius: '14px', border: 'none',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            background: activeSubTab === 'metrics' ? 'var(--zen-forest-dark)' : 'transparent',
            color: activeSubTab === 'metrics' ? '#FFFFFF' : 'var(--zen-text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <TrendingUp size={16} /> Dashboard Métricas
        </button>
      </div>

      {activeSubTab === 'overview' ? (
        <div className="fade-in">
          {/* Top Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1.25rem' }}>
            
            <div className="zen-card" style={{ padding: '1rem 0.5rem', textAlign: 'center', background: 'var(--zen-bg-card)' }}>
              <Activity size={18} style={{ color: 'var(--zen-forest-medium)', marginBottom: '4px' }} />
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)', fontWeight: 700 }}>
                {remainingMinutes}
              </h2>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--zen-text-muted)', fontWeight: 600 }}>
                min restantes
              </p>
            </div>

            <div className="zen-card" style={{ padding: '1rem 0.5rem', textAlign: 'center', background: 'var(--zen-bg-card)' }}>
              <Clock size={18} style={{ color: 'var(--zen-amber)', marginBottom: '4px' }} />
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)', fontWeight: 700 }}>
                {totalMasajes}
              </h2>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--zen-text-muted)', fontWeight: 600 }}>
                masajes dados
              </p>
            </div>

            <div className="zen-card" style={{ padding: '1rem 0.5rem', textAlign: 'center', background: 'var(--zen-bg-card)' }}>
              <Zap size={18} style={{ color: '#D97724', marginBottom: '4px' }} />
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)', fontWeight: 700 }}>
                {longestMassage}m
              </h2>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--zen-text-muted)', fontWeight: 600 }}>
                más largo
              </p>
            </div>

            <div className="zen-card" style={{ padding: '1rem 0.5rem', textAlign: 'center', background: 'var(--zen-bg-card)' }}>
              <Award size={18} style={{ color: '#D97724', marginBottom: '4px' }} />
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)', fontWeight: 700 }}>
                {avgRating} <span style={{ fontSize: '0.8rem' }}>🐻</span>
              </h2>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--zen-text-muted)', fontWeight: 600 }}>
                valoración
              </p>
            </div>

          </div>

          {/* Solicitudes Pendientes Section */}
          <div className="zen-card" style={{ background: 'var(--zen-bg-card)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', color: 'var(--zen-forest-dark)' }}>Solicitudes</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--zen-text-muted)' }}>Peticiones de masaje de Mataosos</span>
              </div>
              {pendingRequests.length > 0 && (
                <span className="badge-status pending">
                  {pendingRequests.length} activa{pendingRequests.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--zen-text-muted)', padding: '2rem 1rem', background: 'var(--zen-bg-card-alt)', borderRadius: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Sin solicitudes por responder</p>
                <span style={{ fontSize: '0.85rem' }}>Todo tranquilo en el bosque zen 🌿</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingRequests.map(req => (
                  <div 
                    key={req.id} 
                    style={{ 
                      border: '1.5px solid var(--zen-amber)', 
                      borderRadius: '20px', 
                      padding: '1.25rem',
                      background: 'var(--zen-amber-light)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--zen-forest-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🐻</span> Mataosos
                      </div>
                      <span className="badge-status pending">
                        Pendiente
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: req.note ? '8px' : '16px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--zen-forest-dark)' }}>
                        {req.minutes}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: 'var(--zen-text-muted)', fontWeight: 500 }}>minutos solicitados</span>
                    </div>

                    {req.note && (
                      <p style={{ 
                        margin: '0 0 16px 0', 
                        fontSize: '0.9rem', 
                        color: 'var(--zen-forest-dark)', 
                        fontStyle: 'italic', 
                        background: 'rgba(255, 255, 255, 0.7)', 
                        padding: '10px 14px', 
                        borderRadius: '12px' 
                      }}>
                        "{req.note}"
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="zen-button danger" 
                        onClick={() => handleOpenRejectModal(req.id)}
                        style={{ flex: 1, padding: '14px' }}
                      >
                        <X size={18} /> Rechazar
                      </button>
                      <button 
                        className="zen-button primary" 
                        onClick={() => handleApprove(req.id)}
                        style={{ flex: 1, padding: '14px' }}
                      >
                        <Check size={18} /> Aprobar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial de últimos masajes en la pantalla principal de Gnomo */}
          <div className="zen-card" style={{ padding: '1.5rem', background: 'var(--zen-bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--zen-forest-dark)' }}>Historial Reciente</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--zen-text-muted)' }}>Últimos masajes dados</span>
            </div>
            
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--zen-text-muted)', padding: '2rem 1rem', background: 'var(--zen-bg-card-alt)', borderRadius: '16px' }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 500 }}>Aún no hay masajes en el historial.</p>
                <span style={{ fontSize: '0.85rem' }}>Aparecerán aquí cuando des el primero 🍄</span>
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
      ) : (
        /* DASHBOARD DE ESTADÍSTICAS KPI DE GNOMO (SECCIÓN APARTE) */
        <div className="zen-card fade-in" style={{ background: 'var(--zen-bg-card)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <TrendingUp size={20} color="var(--zen-forest-dark)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--zen-forest-dark)' }}>Métricas Zen de Gnomo</h3>
          </div>

          {/* Highlight Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--zen-bg-card-alt)', padding: '14px', borderRadius: '16px', border: '1px solid var(--zen-border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                DURACIÓN MEDIA
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--zen-forest-dark)' }}>
                {avgDuration} min / masaje
              </div>
            </div>

            <div style={{ background: 'var(--zen-bg-card-alt)', padding: '14px', borderRadius: '16px', border: '1px solid var(--zen-border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                DÍA PREFERIDO
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--zen-forest-dark)' }}>
                {mostPopularDay} 📅
              </div>
            </div>

            <div style={{ background: 'var(--zen-bg-card-alt)', padding: '14px', borderRadius: '16px', border: '1px solid var(--zen-border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                TIEMPO TOTAL DADO
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--zen-forest-dark)' }}>
                {totalMinutesGiven} min
              </div>
            </div>

            <div style={{ background: 'var(--zen-bg-card-alt)', padding: '14px', borderRadius: '16px', border: '1px solid var(--zen-border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                RÉCORD DE MASAJE
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--zen-amber)' }}>
                {longestMassage} min 🏆
              </div>
            </div>
          </div>

          {/* Day Breakdown Bar Graph */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--zen-forest-medium)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} /> Frecuencia de Masajes por Día de la Semana
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
              const count = dayCounts[day] || 0;
              const pct = Math.round((count / totalDayRequests) * 100);
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <span style={{ width: '70px', color: 'var(--zen-text-main)', fontWeight: 500 }}>{day}</span>
                  <div style={{ flex: 1, background: 'var(--zen-bg-card-alt)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.max(5, pct)}%`, 
                      background: count > 0 ? 'var(--zen-forest-medium)' : 'var(--zen-border)', 
                      height: '100%', 
                      borderRadius: '5px',
                      transition: 'width 0.4s ease-out' 
                    }} />
                  </div>
                  <span style={{ width: '25px', textAlign: 'right', fontWeight: 600, color: 'var(--zen-text-muted)', fontSize: '0.8rem' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
