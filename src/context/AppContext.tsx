import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SessionLog, MassageRequest } from '../types';
import { DailyBalance, getLocalDateString, calculateNewDayBalance } from '../utils/timeEngine';

interface AppState {
  currentUser: User;
  dailyBalance: DailyBalance | null;
  history: SessionLog[];
  requests: MassageRequest[];
  switchRole: () => void;
  recordSession: (reqId: string, durationRequested: number, durationConsumed: number, rating?: number) => void;
  createRequest: (minutes: number, note?: string) => void;
  updateRequestStatus: (id: string, status: MassageRequest['status'], options?: { reject_reason?: string, rating?: number }) => void;
  updateProfile: (name: string, avatar_emoji: string) => void;
  resetApp: () => void;
}

const defaultUser: User = { id: 'u1', name: 'Mataosos', role: 'cliente', avatar_emoji: '🐻' };
const adminUser: User = { id: 'a1', name: 'Gnomo', role: 'masajista', avatar_emoji: '🍄' };

const defaultState: AppState = {
  currentUser: defaultUser,
  dailyBalance: null,
  history: [],
  requests: [],
  switchRole: () => {},
  recordSession: () => {},
  createRequest: () => {},
  updateRequestStatus: () => {},
  updateProfile: () => {},
  resetApp: () => {},
};

const AppContext = createContext<AppState>(defaultState);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  
  const [dailyBalance, setDailyBalance] = useState<DailyBalance | null>(() => {
    const saved = localStorage.getItem('zen_dailyBalance');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [history, setHistory] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('zen_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [requests, setRequests] = useState<MassageRequest[]>(() => {
    const saved = localStorage.getItem('zen_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Cross-tab synchronization to simulate Supabase Realtime
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zen_requests' && e.newValue) setRequests(JSON.parse(e.newValue));
      if (e.key === 'zen_history' && e.newValue) setHistory(JSON.parse(e.newValue));
      if (e.key === 'zen_dailyBalance' && e.newValue) setDailyBalance(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync state to local storage when changed locally
  useEffect(() => {
    localStorage.setItem('zen_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (currentUser.role !== 'cliente') return;
    const todayStr = getLocalDateString();
    
    setDailyBalance(prevBalance => {
      const newBalance = calculateNewDayBalance(todayStr, prevBalance, 20); 
      
      if (prevBalance && prevBalance.date !== todayStr) {
        const renewalLog: SessionLog = {
          id: Date.now().toString(),
          date: todayStr,
          timestamp: Date.now(),
          durationRequested: 0,
          durationConsumed: 0,
          type: 'renewal',
          note: `Mañana: 20 min + la mitad de lo que no gastes hoy`
        };
        setHistory(prev => {
          const newHistory = [renewalLog, ...prev];
          localStorage.setItem('zen_history', JSON.stringify(newHistory));
          return newHistory;
        });
      }
      
      localStorage.setItem('zen_dailyBalance', JSON.stringify(newBalance));
      return newBalance;
    });
  }, [currentUser]);

  const switchRole = () => {
    setCurrentUser(prev => prev.role === 'cliente' ? adminUser : defaultUser);
  };

  const updateProfile = (name: string, avatar_emoji: string) => {
    setCurrentUser(prev => ({ ...prev, name, avatar_emoji }));
    // Si estuviéramos en Supabase, esto actualizaría la tabla profiles.
  };

  const createRequest = (minutes: number, note?: string) => {
    const newReq: MassageRequest = {
      id: Date.now().toString(),
      created_at: Date.now(),
      minutes,
      note,
      status: 'pendiente'
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const updateRequestStatus = (id: string, status: MassageRequest['status'], options?: { reject_reason?: string, rating?: number }) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          status, 
          reject_reason: options?.reject_reason ?? req.reject_reason,
          rating: options?.rating ?? req.rating,
          started_at: status === 'en_curso' ? Date.now() : req.started_at
        };
      }
      return req;
    }));
  };

  const recordSession = (reqId: string, durationRequested: number, durationConsumed: number, rating?: number) => {
    const todayStr = getLocalDateString();
    const newLog: SessionLog = {
      id: Date.now().toString(),
      date: todayStr,
      timestamp: Date.now(),
      durationRequested,
      durationConsumed,
      type: 'session',
      note: `Sesión completada`,
      rating
    };

    setHistory(prev => {
      const newHistory = [newLog, ...prev];
      localStorage.setItem('zen_history', JSON.stringify(newHistory));
      return newHistory;
    });

    setDailyBalance(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        usedToday: prev.usedToday + durationConsumed
      };
      localStorage.setItem('zen_dailyBalance', JSON.stringify(updated));
      return updated;
    });

    // Mark request as completada
    setRequests(prev => prev.map(req => req.id === reqId ? { ...req, status: 'completada', actual_minutes: Math.floor(durationConsumed/60), rating } : req));
  };

  const resetApp = () => {
    localStorage.removeItem('zen_dailyBalance');
    localStorage.removeItem('zen_history');
    localStorage.removeItem('zen_requests');
    setDailyBalance(null);
    setHistory([]);
    setRequests([]);
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      dailyBalance,
      history,
      requests,
      switchRole,
      createRequest,
      updateRequestStatus,
      updateProfile,
      recordSession,
      resetApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
