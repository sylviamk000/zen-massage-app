import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Award, Lock, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { SessionLog } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText: string;
}

export function computeAchievements(history: SessionLog[]): Achievement[] {
  const completedSessions = history.filter(s => s.durationConsumed > 0);
  const totalMinutes = completedSessions.reduce((acc, s) => acc + s.durationConsumed, 0);
  const maxSession = completedSessions.reduce((max, s) => Math.max(max, s.durationConsumed), 0);
  const hasFiveStar = completedSessions.some(s => s.rating === 5);

  return [
    {
      id: 'first_massage',
      title: 'Primer Relax 5 min',
      description: 'Completar tu primer masaje registrado de al menos 5 minutos.',
      icon: '🌱',
      unlocked: completedSessions.length >= 1 && maxSession >= 5,
      progressText: completedSessions.length >= 1 ? '¡Completado!' : '0 / 1 Masaje'
    },
    {
      id: 'session_15',
      title: 'Sesión Profunda 15 min',
      description: 'Completar una sesión de masaje de 15 minutos o más de una sola vez.',
      icon: '🧘‍♂️',
      unlocked: maxSession >= 15,
      progressText: maxSession >= 15 ? '¡Completado!' : `${maxSession} / 15 min max.`
    },
    {
      id: 'session_30',
      title: 'Maratón Zen 30 min',
      description: 'Completar una sesión intensiva de 30 minutos continuos.',
      icon: '⚡',
      unlocked: maxSession >= 30,
      progressText: maxSession >= 30 ? '¡Completado!' : `${maxSession} / 30 min max.`
    },
    {
      id: 'star_rating',
      title: 'Excelencia 5 Estrellas',
      description: 'Valorar o recibir una calificación perfecta de 5 estrellas.',
      icon: '⭐',
      unlocked: hasFiveStar,
      progressText: hasFiveStar ? '¡5 Estrellas alcanzadas!' : 'Pendiente 5⭐'
    },
    {
      id: 'total_3_sessions',
      title: 'Hábito Saludable (3 masajes)',
      description: 'Acumular un total de 3 masajes registrados en tu historial.',
      icon: '🔥',
      unlocked: completedSessions.length >= 3,
      progressText: `${Math.min(completedSessions.length, 3)} / 3 Masajes`
    },
    {
      id: 'master_60_min',
      title: 'Maestro del Tiempo (1 Hora)',
      description: 'Acumular un tiempo total de 60 minutos de masajes disfrutados.',
      icon: '👑',
      unlocked: totalMinutes >= 60,
      progressText: `${Math.min(totalMinutes, 60)} / 60 Minutos`
    }
  ];
}

export const AchievementsView: React.FC = () => {
  const { history } = useAppContext();
  const achievements = computeAchievements(history);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fade-in" style={{ padding: '0 1.25rem 2rem 1.25rem', maxWidth: '580px', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--zen-forest-dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Trophy size={24} color="var(--zen-amber)" /> Logros Zen
        </h2>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          background: 'rgba(249, 115, 22, 0.15)', 
          color: 'var(--zen-amber)', 
          padding: '6px 12px', 
          borderRadius: '20px',
          border: '1px solid rgba(249, 115, 22, 0.3)'
        }}>
          {unlockedCount} / {totalCount} Conseguidos
        </span>
      </div>

      {/* PROGRESS BAR CARD */}
      <div className="zen-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--zen-bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--zen-text-main)', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--zen-amber)" /> Progreso de Insignias
          </span>
          <span>{percentage}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'var(--zen-bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
      </div>

      {/* ACHIEVEMENTS GRID LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {achievements.map((item) => (
          <div 
            key={item.id}
            className="zen-card"
            style={{
              padding: '1.1rem 1.25rem',
              background: item.unlocked ? 'var(--zen-bg-card)' : 'var(--zen-bg-card-alt)',
              opacity: item.unlocked ? 1 : 0.75,
              border: item.unlocked ? '1.5px solid var(--zen-amber)' : '1px solid var(--zen-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {/* ICON / EMBLEM */}
            <div style={{
              fontSize: '1.8rem',
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: item.unlocked ? 'rgba(249, 115, 22, 0.15)' : 'var(--zen-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: item.unlocked ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid var(--zen-border)'
            }}>
              {item.icon}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: item.unlocked ? 'var(--zen-text-main)' : 'var(--zen-text-muted)' }}>
                  {item.title}
                </h3>
                {item.unlocked ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-approved-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={15} color="var(--status-approved-text)" /> Conseguido
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--zen-text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={13} /> Bloqueado
                  </span>
                )}
              </div>

              {/* DESCRIPTION & CONDITION */}
              <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: 'var(--zen-text-muted)', lineHeight: 1.4 }}>
                {item.description}
              </p>

              {/* PROGRESS TEXT */}
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: item.unlocked ? 'var(--zen-amber)' : 'var(--zen-text-light)' }}>
                Estado: {item.progressText}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
