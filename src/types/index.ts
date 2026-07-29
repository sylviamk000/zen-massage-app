export interface User {
  id: string;
  role: 'cliente' | 'masajista';
  name: string;
  avatar_emoji: string;
}

export type RequestStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'en_curso' | 'completada';

export interface MassageRequest {
  id: string;
  created_at: number;
  minutes: number;
  note?: string;
  status: RequestStatus;
  reject_reason?: string;
  started_at?: number;
  actual_minutes?: number;
  rating?: number;
}

export interface SessionLog {
  id: string;
  date: string;
  timestamp: number;
  durationRequested: number;
  durationConsumed: number;
  type: 'session' | 'renewal';
  note?: string;
  rating?: number;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null; // timestamp
  totalRequestedSeconds: number;
  consumedSecondsBeforePause: number;
  lastResumeTime: number | null; // timestamp
}
