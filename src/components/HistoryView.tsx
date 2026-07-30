import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, RefreshCw } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, currentUser } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'today'>('all');
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const filteredHistory = history.filter(item => {
    if (filter === 'today') {
      return item.date === todayDateStr;
    }
    return true;
  });

  return (
    <div className="fade-in" style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Historial</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '20px', 
            border: '1px solid var(--zen-border)',
            background: 'var(--zen-bg-card)',
            color: 'var(--zen-text-main)',
            outline: 'none'
          }}
        >
          <option value="all">Todo</option>
          <option value="today">Hoy</option>
        </select>
      </div>

      {filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--zen-text-muted)', padding: '2rem 0', background: 'var(--zen-bg-card)', borderRadius: '20px' }}>
          {currentUser?.role === 'cliente' 
            ? 'Aún no has disfrutado ningún masaje.\nPide el primero'
            : 'Todavía no has dado ningún masaje.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredHistory.map(log => (
            <div key={log.id} className="zen-card" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                background: log.type === 'renewal' ? 'var(--zen-accent-light)' : 'var(--zen-bg)', 
                padding: '10px', 
                borderRadius: '50%',
                color: 'var(--zen-accent)'
              }}>
                {log.type === 'renewal' ? <RefreshCw size={20} /> : <Clock size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 500, fontSize: '0.95rem' }}>
                    {log.type === 'renewal' ? 'Renovación Diaria' : 'Sesión de Masaje'}
                  </p>
                  {log.type === 'session' && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--zen-accent)', background: 'var(--zen-accent-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      {Math.floor(log.durationConsumed / 60)} min
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--zen-text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {log.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
