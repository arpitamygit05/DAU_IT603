export type BarberStatus = 'AVAILABLE' | 'BUSY' | 'ON_BREAK';

export interface Barber {
  id: string;
  name: string;
  role: string;
  onDuty: boolean;
  status: BarberStatus;
  currentEntryId: string | null;
  currentServiceStartTime: string | null;
  stationNumber: number;
}

export type QueueEntryStatus = 'WAITING' | 'CALLED' | 'IN_CHAIR' | 'DONE' | 'CANCELLED' | 'NO_SHOW';

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceRupees: number;
  active: boolean;
  category: 'Hair' | 'Beard' | 'Spa' | 'Facial' | 'Combo';
  description?: string;
}

export interface QueueEntry {
  id: string;
  token: string; // e.g. "S-14"
  customerName: string;
  phone: string; // 10 digits
  serviceIds: string[];
  preferredBarberId: string | 'ANY'; // 'ANY' or barber.id
  assignedBarberId: string | null;
  status: QueueEntryStatus;
  joinedAt: string; // ISO string
  calledAt: string | null;
  inChairAt: string | null;
  completedAt: string | null;
  isWalkIn: boolean;
  notes?: string;
}

export interface SalonSettings {
  salonName: string;
  tagline: string;
  openTime: string; // "09:00"
  closeTime: string; // "20:30"
  isOpenToday: boolean;
  isOnlineQueueOpen: boolean;
  cutoffMinutesBeforeClosing: number; // 30 mins
}

export interface DailyStats {
  customersServed: number;
  averageWaitMinutes: number;
  noShowsCount: number;
  totalRevenueEstimate: number;
}
