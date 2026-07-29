import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, SessionLog, MassageRequest } from '../types';
import { DailyBalance, getLocalDateString, calculateNewDayBalance } from '../utils/timeEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { playNotificationChime } from '../utils/audioEngine';

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
  requestNotificationPermission: () => void;
  notificationsEnabled: boolean;
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
  requestNotificationPermission: () => {},
  notificationsEnabled: false
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

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const previousCountRef = useRef<number>(requests.length);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('🌿 Zen Masajes', {
          body: '¡Notificaciones activadas con éxito!',
          icon: '/pwa-icon.png'
        });
      }
    }
  };

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        const saved = localStorage.getItem('zen_current_user');
        if (!saved) setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const u: User = {
          id: data.id,
          name: data.name,
          role: data.role,
          avatar_emoji: data.avatar_emoji || (data.role === 'cliente' ? '🐻' : '🍄')
        };
        setCurrentUser(u);
        localStorage.setItem('zen_current_user', JSON.stringify(u));
      } else {
        const isGnomo = email?.toLowerCase().includes('sylvia') || false;
        const newRole: 'cliente' | 'masajista' = isGnomo ? 'masajista' : 'cliente';
        const newName = isGnomo ? 'Gnomo' : 'Mataosos';
        const newEmoji = isGnomo ? '🍄' : '🐻';

        const newProfile = {
          id: userId,
          name: newName,
          role: newRole,
          avatar_emoji: newEmoji
        };

        const u: User = { id: userId, name: newName, role: newRole, avatar_emoji: newEmoji };
        setCurrentUser(u);
        localStorage.setItem('zen_current_user', JSON.stringify(u));

        await supabase.from('profiles').upsert([newProfile]);
      }
    } catch (e) {
      console.warn('Error fetching profile from Supabase:', e);
      const isGnomo = email?.toLowerCase().includes('sylvia') || false;
      const u = isGnomo ? adminUser : defaultUser;
      setCurrentUser(u);
      localStorage.setItem('zen_current_user', JSON.stringify(u));
    }
  };

  const fetchDbRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const mapped: MassageRequest[] = data.map(r => ({
          id: r.id,
          created_at: new Date(r.created_at).getTime(),
          minutes: r.minutes,
          note: r.note,
          status: r.status,
          reject_reason: r.reject_reason,
          started_at: r.started_at ? new Date(r.started_at).getTime() : undefined,
          actual_minutes: r.actual_minutes,
          rating: r.rating
        }));

        // Check if new pending request arrived
        if (mapped.length > previousCountRef.current && currentUser?.role === 'masajista') {
          const latest = mapped[0];
          if (latest.status === 'pendiente') {
            playNotificationChime();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🐻 ¡Nueva Petición de Masaje!', {
                body: `Mataosos te ha pedido un masaje de ${latest.minutes} min`,
                icon: '/pwa-icon.png'
              });
            }
          }
        }
        previousCountRef.current = mapped.length;

        setRequests(mapped);
      } else if (error) {
        console.warn('Error fetching requests from Supabase:', error.message);
      }
    } catch (e) {
      console.warn('Could not sync requests from Supabase:', e);
    }
  };

  // 🔔 REALTIME SUPABASE SYNC + 3s SMART POLLING
  useEffect(() => {
    if (!currentUser) return;

    fetchDbRequests();

    const pollInterval = setInterval(() => {
      fetchDbRequests();
    }, 3000);

    const channel = supabase
      .channel('realtime_requests_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          fetchDbRequests();
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Cross-tab local fallback synchronization
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout error:', e);
    }
    localStorage.removeItem('zen_current_user');
    setCurrentUser(null);
  };

  const updateProfile = async (name: string, avatar_emoji: string) => {
    if (currentUser) {
      const updated = { ...currentUser, name, avatar_emoji };
      setCurrentUser(updated);
      localStorage.setItem('zen_current_user', JSON.stringify(updated));

      try {
        const { error } = await supabase.from('profiles').upsert([{
          id: currentUser.id,
          name,
          avatar_emoji,
          role: currentUser.role
        }]);

        if (error) {
          console.warn('Could not save profile to Supabase:', error.message);
        }
      } catch (e) {
        console.warn('Could not update profile in Supabase:', e);
      }
    }
  };

  const createRequest = async (minutes: number, note?: string) => {
    const tempReq: MassageRequest = {
      id: Date.now().toString(),
      created_at: Date.now(),
      minutes,
      note,
      status: 'pendiente'
    };
    setRequests(prev => [tempReq, ...prev]);

    if (!isSupabaseConfigured) {
      alert('⚠️ Supabase no está conectado en Vercel.\n\nFalta añadir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel -> Settings -> Environment Variables y pulsar Redeploy.');
      return;
    }

    try {
      const payload: any = {
        minutes,
        note: note || null,
        status: 'pendiente'
      };

      if (currentUser?.id && currentUser.id.length > 20) {
        payload.user_id = currentUser.id;
      }

      const { error } = await supabase.from('requests').insert([payload]);
      if (error) {
        console.error('Supabase insert request error:', error.message);
        if (error.message.includes('Invalid path')) {
          alert('⚠️ Error de conexión a Supabase: La URL configurada en Vercel tiene un formato o barra sobrante.\nRevisa VITE_SUPABASE_URL en Vercel.');
        } else {
          alert('Aviso Supabase: ' + error.message);
        }
      } else {
        fetchDbRequests();
      }
    } catch (e: any) {
      console.error('Could not save request to Supabase:', e);
      alert('Error de conexión a Supabase: ' + (e.message || 'Desconocido'));
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
      const payload: any = {
        status,
        reject_reason: options?.reject_reason || null,
        rating: options?.rating || null
      };

      if (status === 'en_curso') {
        payload.started_at = new Date().toISOString();
      }

      const { error } = await supabase.from('requests').update(payload).eq('id', id);
      if (error) {
        console.warn('Supabase update request error:', error.message);
      } else {
        fetchDbRequests();
      }
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
      setDemoUser,
      requestNotificationPermission,
      notificationsEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
