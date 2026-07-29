import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SessionLog, MassageRequest } from '../types';
import { DailyBalance, getLocalDateString, calculateNewDayBalance } from '../utils/timeEngine';
import { supabase } from '../lib/supabase';

interface AppState {
  currentUser: User | null;
  dailyBalance: DailyBalance | null;
  history: SessionLog[];
  requests: MassageRequest[];
  switchRole: () => void;
  recordSession: (reqId: string, durationRequested: number, durationConsumed: number, rating?: number) => void;
  createRequest: (minutes: number, note?: string) => void;
  updateRequestStatus: (id: string, status: MassageRequest['status'], options?: { reject_reason?: string, rating?: number }) => void;
  updateProfile: (name: string, avatar_emoji: string) => void;
  logout: () => void;
  resetApp: () => void;
  setDemoUser: (role: 'cliente' | 'masajista') => void;
}

const defaultUser: User = { id: 'u1', name: 'Mataosos', role: 'cliente', avatar_emoji: '🐻' };
const adminUser: User = { id: 'a1', name: 'Gnomo', role: 'masajista', avatar_emoji: '🍄' };

const defaultState: AppState = {
  currentUser: null,
  dailyBalance: null,
  history: [],
  requests: [],
  switchRole: () => {},
  recordSession: () => {},
  createRequest: () => {},
  updateRequestStatus: () => {},
  updateProfile: () => {},
  logout: () => {},
  resetApp: () => {},
  setDemoUser: () => {},
};

const AppContext = createContext<AppState>(defaultState);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zen_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
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

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        const saved = localStorage.getItem('zen_current_user');
        if (!saved) setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const u: User = {
          id: data.id,
          name: data.name,
          role: data.role,
          avatar_emoji: data.avatar_emoji || (data.role === 'cliente' ? '🐻' : '🍄')
        };
        setCurrentUser(u);
        localStorage.setItem('zen_current_user', JSON.stringify(u));
      }
    } catch (e) {
      console.warn('Error fetching profile from Supabase:', e);
    }
  };

  // Cross-tab & local storage synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zen_requests' && e.newValue) setRequests(JSON.parse(e.newValue));
      if (e.key === 'zen_history' && e.newValue) setHistory(JSON.parse(e.newValue));
      if (e.key === 'zen_dailyBalance' && e.newValue) setDailyBalance(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'cliente') return;
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
    setCurrentUser(prev => {
      const next = prev?.role === 'cliente' ? adminUser : defaultUser;
      localStorage.setItem('zen_current_user', JSON.stringify(next));
      return next;
    });
  };

  const setDemoUser = (role: 'cliente' | 'masajista') => {
    const u = role === 'cliente' ? defaultUser : adminUser;
    setCurrentUser(u);
    localStorage.setItem('zen_current_user', JSON.stringify(u));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('zen_current_user');
    setCurrentUser(null);
  };

  const updateProfile = async (name: string, avatar_emoji: string) => {
    if (currentUser) {
      const updated = { ...currentUser, name, avatar_emoji };
      setCurrentUser(updated);
      localStorage.setItem('zen_current_user', JSON.stringify(updated));

      try {
        await supabase.from('profiles').update({ name, avatar_emoji }).eq('id', currentUser.id);
      } catch (e) {
        console.warn('Could not update profile in Supabase:', e);
      }
    }
  };

  const createRequest = async (minutes: number, note?: string) => {
    const newReq: MassageRequest = {
      id: Date.now().toString(),
      created_at: Date.now(),
      minutes,
      note,
      status: 'pendiente'
    };
    setRequests(prev => [newReq, ...prev]);

    try {
      if (currentUser?.id) {
        await supabase.from('requests').insert([{
          user_id: currentUser.id,
          minutes,
          note,
          status: 'pendiente'
        }]);
      }
    } catch (e) {
      console.warn('Could not save request to Supabase:', e);
    }
  };

  const updateRequestStatus = async (id: string, status: MassageRequest['status'], options?: { reject_reason?: string, rating?: number }) => {
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

    try {
      await supabase.from('requests').update({ 
        status, 
        reject_reason: options?.reject_reason,
        rating: options?.rating,
        started_at: status === 'en_curso' ? new Date().toISOString() : undefined
      }).eq('id', id);
    } catch (e) {
      console.warn('Could not update request in Supabase:', e);
    }
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

    setRequests(prev => prev.map(req => req.id === reqId ? { ...req, status: 'completada', actual_minutes: Math.floor(durationConsumed/60), rating } : req));
  };

  const resetApp = () => {
    localStorage.removeItem('zen_dailyBalance');
    localStorage.removeItem('zen_history');
    localStorage.removeItem('zen_requests');
    localStorage.removeItem('zen_current_user');
    setDailyBalance(null);
    setHistory([]);
    setRequests([]);
    setCurrentUser(null);
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
      logout,
      resetApp,
      setDemoUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
