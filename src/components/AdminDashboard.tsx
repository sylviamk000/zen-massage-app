import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, Clock, Award, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { requests, dailyBalance, updateRequestStatus } = useAppContext();
  
  const pendingRequests = requests.filter(r => r.status === 'pendiente');
  const totalMasajes = requests.filter(r => r.status === 'completada').length;
  
  const ratings = requests.filter(r => r.rating).map(r => r.rating as number);
  const avgRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1) : '—';

  return (
    <div className="fade-in" style={{ padding: '0 1.25rem 2rem 1.25rem', maxWidth: '580px', margin: '0 auto' }}>
      
      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
        <div className="zen-card" style={{ padding: '1.2rem 0.75rem', textAlign: 'center' }}>
          <Activity size={18} style={{ color: 'var(--zen-forest-medium)', marginBottom: '4px' }} />
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)' }}>
            {dailyBalance ? Math.max(0, dailyBalance.totalStartingBalance - Math.floor(dailyBalance.usedToday/60)) : 20}
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 500 }}>
            min restantes
          </p>
        </div>

        <div className="zen-card" style={{ padding: '1.2rem 0.75rem', textAlign: 'center' }}>
          <Clock size={18} style={{ color: 'var(--zen-amber)', marginBottom: '4px' }} />
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)' }}>
            {totalMasajes}
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 500 }}>
            masajes dados
          </p>
        </div>

        <div className="zen-card" style={{ padding: '1.2rem 0.75rem', textAlign: 'center' }}>
          <Award size={18} style={{ color: '#D97724', marginBottom: '4px' }} />
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 2px 0', color: 'var(--zen-forest-dark)' }}>
            {avgRating} <span style={{ fontSize: '1rem' }}>🐻</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--zen-text-muted)', fontWeight: 500 }}>
            valoración
          </p>
        </div>
      </div>
      
      {/* Solicitudes Section */}
      <div className="zen-card" style={{ background: 'var(--zen-bg-card)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', color: 'var(--zen-forest-dark)' }}>Solicitudes</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--zen-text-muted)' }}>Peticiones de masaje pendientes</span>
          </div>
          {pendingRequests.length > 0 && (
            <span className="badge-status pending">
              {pendingRequests.length} activa{pendingRequests.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--zen-text-muted)', padding: '2.5rem 1rem', background: 'var(--zen-bg-card-alt)', borderRadius: '16px' }}>
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
                    onClick={() => updateRequestStatus(req.id, 'rechazada', { reject_reason: 'Ahora no puedo' })}
                    style={{ flex: 1, padding: '14px' }}
                  >
                    <X size={18} /> Rechazar
                  </button>
                  <button 
                    className="zen-button primary" 
                    onClick={() => updateRequestStatus(req.id, 'aprobada')}
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

    </div>
  );
};
