import React, { useState, useEffect, useRef } from 'react';
import { Square, Pause, Play } from 'lucide-react';
import { playZenGong, playNotificationChime } from '../utils/audioEngine';
import { formatTime } from '../utils/timeEngine';
import { MassageRequest } from '../types';

interface FullscreenTimerProps {
  request: MassageRequest;
  onFinish: (reqId: string, requestedSeconds: number, consumedSeconds: number) => void;
}

export const FullscreenTimer: React.FC<FullscreenTimerProps> = ({ request, onFinish }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(request.minutes * 60);
  
  const requestAnimRef = useRef<number>();
  
  const [isPaused, setIsPaused] = useState(false);
  const [endTime, setEndTime] = useState<number>(request.started_at ? request.started_at + request.minutes * 60 * 1000 : Date.now() + request.minutes * 60 * 1000);
  const [pausedTimeAccumulated, setPausedTimeAccumulated] = useState<number>(0);
  const [lastPauseTimestamp, setLastPauseTimestamp] = useState<number | null>(null);

  const durationSeconds = request.minutes * 60;
  const startTime = request.started_at || Date.now();

  useEffect(() => {
    const updateTimer = () => {
      if (isPaused) {
        requestAnimRef.current = requestAnimationFrame(updateTimer);
        return;
      }

      const now = Date.now();
      
      if (now >= endTime) {
        handleComplete();
        return;
      }
      
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      requestAnimRef.current = requestAnimationFrame(updateTimer);
    };

    requestAnimRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
    };
  }, [endTime, isPaused]);

  const pauseSession = () => {
    setIsPaused(true);
    setLastPauseTimestamp(Date.now());
  };

  const resumeSession = () => {
    if (lastPauseTimestamp && endTime) {
      const pausedDuration = Date.now() - lastPauseTimestamp;
      setPausedTimeAccumulated(prev => prev + pausedDuration);
      setEndTime(endTime + pausedDuration);
    }
    setIsPaused(false);
    setLastPauseTimestamp(null);
  };

  const endEarly = () => {
    calculateAndFinish();
  };

  const handleComplete = () => {
    playZenGong();
    playNotificationChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🌿 ¡Tiempo completado!', {
        body: 'Tu sesión de masaje ha finalizado.',
        icon: '/pwa-icon.png'
      });
    }
    calculateAndFinish();
  };

  const calculateAndFinish = () => {
    setIsPaused(false);
    if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
    
    const now = Date.now();
    const extraPause = isPaused && lastPauseTimestamp ? (now - lastPauseTimestamp) : 0;
    const totalPaused = pausedTimeAccumulated + extraPause;
    
    const totalRealWorldTimeMs = now - startTime;
    const activeTimeMs = totalRealWorldTimeMs - totalPaused;
    
    let consumedSeconds = Math.floor(activeTimeMs / 1000);
    
    if (consumedSeconds > durationSeconds) consumedSeconds = durationSeconds;
    if (consumedSeconds < 0) consumedSeconds = 0;
    
    onFinish(request.id, durationSeconds, consumedSeconds);
  };

  const progress = timeRemaining / durationSeconds;
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, 
      background: 'radial-gradient(circle at center, #253629 0%, #152017 100%)', 
      color: '#FFFFFF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '2rem'
    }}>
      <div style={{ position: 'absolute', top: '48px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontWeight: 600 }}>
          SESIÓN ACTIVA
        </span>
        <h2 style={{ fontSize: '1.5rem', margin: '4px 0 0 0', fontWeight: 400, color: '#EBF0EC' }}>
          Masaje en curso
        </h2>
      </div>

      <div style={{ position: 'relative', width: '310px', height: '310px', margin: '2rem 0' }}>
        <svg width="310" height="310" viewBox="0 0 310 310">
          <circle 
            cx="155" cy="155" r={radius} 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="8"
          />
          <circle 
            cx="155" cy="155" r={radius} 
            fill="none" 
            stroke="#D97724" 
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
            className={isPaused ? '' : 'timer-breathing'}
          />
        </svg>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '4.2rem', fontWeight: 300, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            {formatTime(timeRemaining)}
          </span>
          {isPaused && (
            <span style={{ 
              background: 'rgba(254, 243, 199, 0.2)', 
              color: '#FDE68A', 
              padding: '4px 14px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              marginTop: '8px'
            }}>
              Pausado
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '340px' }}>
        {isPaused ? (
          <button 
            className="zen-button primary" 
            onClick={resumeSession} 
            style={{ flex: 1, padding: '16px' }}
          >
            <Play size={20} /> Reanudar
          </button>
        ) : (
          <button 
            className="zen-button secondary" 
            onClick={pauseSession} 
            style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Pause size={20} /> Pausar
          </button>
        )}
        <button 
          className="zen-button danger" 
          onClick={endEarly} 
          style={{ flex: 1, padding: '16px' }}
        >
          <Square size={20} /> Terminar
        </button>
      </div>
    </div>
  );
};
