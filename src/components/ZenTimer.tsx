import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { playZenGong } from '../utils/audioEngine';
import { formatTime } from '../utils/timeEngine';

interface ZenTimerProps {
  maxMinutes: number; // Maximum minutes allowed to consume (saldo restante)
  onFinish: (requestedSeconds: number, consumedSeconds: number) => void;
}

export const ZenTimer: React.FC<ZenTimerProps> = ({ maxMinutes, onFinish }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(Math.min(5, maxMinutes));
  
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Timestamp-based tracking to survive backgrounding
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  
  // For calculating exact consumption
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [pausedTimeAccumulated, setPausedTimeAccumulated] = useState<number>(0);
  const [lastPauseTimestamp, setLastPauseTimestamp] = useState<number | null>(null);

  const requestAnimRef = useRef<number>();

  useEffect(() => {
    if (!isActive) return;

    const updateTimer = () => {
      if (isPaused) {
        // Just keep requestAnimationFrame alive but don't update time
        requestAnimRef.current = requestAnimationFrame(updateTimer);
        return;
      }
      
      const now = Date.now();
      if (endTime && now >= endTime) {
        // Finished naturally
        handleComplete();
        return;
      }
      
      if (endTime) {
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setTimeRemaining(remaining);
      }
      
      requestAnimRef.current = requestAnimationFrame(updateTimer);
    };

    requestAnimRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
    };
  }, [isActive, isPaused, endTime]);

  const startSession = () => {
    if (selectedMinutes > maxMinutes) return;
    const durationSeconds = selectedMinutes * 60;
    const now = Date.now();
    
    setIsActive(true);
    setIsPaused(false);
    setSessionStartTime(now);
    setEndTime(now + durationSeconds * 1000);
    setTimeRemaining(durationSeconds);
    setPausedTimeAccumulated(0);
    setLastPauseTimestamp(null);
  };

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
    // Calculate consumed time based on real world timestamps
    calculateAndFinish();
  };

  const handleComplete = () => {
    playZenGong();
    calculateAndFinish();
  };

  const calculateAndFinish = () => {
    setIsActive(false);
    setIsPaused(false);
    if (requestAnimRef.current) cancelAnimationFrame(requestAnimRef.current);
    
    if (!sessionStartTime) return;
    
    const now = Date.now();
    // If it was paused when ending, we don't count the time since last pause as active
    const extraPause = isPaused && lastPauseTimestamp ? (now - lastPauseTimestamp) : 0;
    const totalPaused = pausedTimeAccumulated + extraPause;
    
    const totalRealWorldTimeMs = now - sessionStartTime;
    const activeTimeMs = totalRealWorldTimeMs - totalPaused;
    
    let consumedSeconds = Math.floor(activeTimeMs / 1000);
    const requestedSeconds = selectedMinutes * 60;
    
    // Cap just in case
    if (consumedSeconds > requestedSeconds) consumedSeconds = requestedSeconds;
    if (consumedSeconds < 0) consumedSeconds = 0;
    
    onFinish(requestedSeconds, consumedSeconds);
  };

  // Visuals
  const totalSeconds = selectedMinutes * 60;
  const progress = isActive ? (timeRemaining / totalSeconds) : 1;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="zen-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
      
      {!isActive ? (
        <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: 500 }}>Configura tu Sesión</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[5, 10, 15, 20].map(min => (
              <button 
                key={min}
                className={`zen-button ${selectedMinutes === min ? '' : 'secondary'}`}
                disabled={min > maxMinutes}
                onClick={() => setSelectedMinutes(min)}
              >
                {min}m
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--zen-text-muted)' }}>
              Personalizado (min: 1, max: {maxMinutes})
            </label>
            <input 
              type="range" 
              min="1" 
              max={Math.max(1, maxMinutes)} 
              value={selectedMinutes}
              onChange={(e) => setSelectedMinutes(Number(e.target.value))}
              style={{ width: '80%', accentColor: 'var(--zen-accent)' }}
            />
            <div style={{ marginTop: '10px', fontSize: '1.5rem', fontWeight: 600 }}>
              {selectedMinutes} minutos
            </div>
          </div>
          
          <button 
            className="zen-button"
            style={{ width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '16px' }}
            onClick={startSession}
            disabled={maxMinutes <= 0 || selectedMinutes <= 0}
          >
            <Play size={20} /> Iniciar Sesión
          </button>
        </div>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px', height: '280px', marginBottom: '2rem' }}>
            {/* Background ring */}
            <svg width="280" height="280" viewBox="0 0 280 280">
              <circle 
                cx="140" cy="140" r={radius} 
                fill="none" 
                stroke="var(--zen-border)" 
                strokeWidth="8"
              />
              {/* Progress ring */}
              <circle 
                cx="140" cy="140" r={radius} 
                fill="none" 
                stroke="var(--zen-accent)" 
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s linear',
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%'
                }}
                className={!isPaused ? 'timer-breathing' : ''}
              />
            </svg>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '3rem', fontWeight: 300, fontFamily: 'monospace' }}>
                {formatTime(timeRemaining)}
              </span>
              <span style={{ color: 'var(--zen-text-muted)', fontSize: '0.9rem' }}>
                {isPaused ? 'Pausado' : 'Respirando...'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            {isPaused ? (
              <button className="zen-button" onClick={resumeSession}>
                <Play size={20} /> Reanudar
              </button>
            ) : (
              <button className="zen-button secondary" onClick={pauseSession}>
                <Pause size={20} /> Pausar
              </button>
            )}
            
            <button className="zen-button danger" onClick={endEarly}>
              <Square size={20} /> Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
