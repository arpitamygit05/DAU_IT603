import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Barber, BarberStatus, QueueEntry, SalonSettings, Service, DailyStats } from '../types/queue';
import { INITIAL_BARBERS, INITIAL_ENTRIES, INITIAL_SERVICES, INITIAL_SETTINGS } from '../data/initialData';
import {
  calculateDailyStats,
  findActiveEntryByPhone,
  getNextEligibleCustomerForBarber,
} from '../services/queueLogic';

interface QueueContextType {
  settings: SalonSettings;
  services: Service[];
  barbers: Barber[];
  entries: QueueEntry[];
  lastCalledEntry: QueueEntry | null;
  dailyStats: DailyStats;
  joinQueue: (
    customerName: string,
    phone: string,
    serviceIds: string[],
    preferredBarberId: string | 'ANY'
  ) => { success: boolean; entry?: QueueEntry; error?: string; existingEntry?: QueueEntry };
  addWalkIn: (
    customerName: string,
    phone: string,
    serviceIds: string[],
    preferredBarberId: string | 'ANY'
  ) => { success: boolean; entry?: QueueEntry; error?: string };
  callNext: (barberId: string) => { success: boolean; entry?: QueueEntry; error?: string };
  startService: (entryId: string, barberId: string) => void;
  completeService: (entryId: string, barberId: string) => void;
  markNoShow: (entryId: string) => void;
  cancelQueueEntry: (entryId: string) => void;
  setBarberStatus: (barberId: string, status: BarberStatus) => void;
  toggleBarberOnDuty: (barberId: string, onDuty: boolean) => void;
  addBarber: (name: string, role: string) => void;
  updateService: (service: Service) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  toggleServiceActive: (serviceId: string) => void;
  updateSettings: (newSettings: Partial<SalonSettings>) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'style_atelier_queue_state_v1';
const SYNC_CHANNEL_NAME = 'style_atelier_broadcast_sync';

interface PersistedState {
  settings: SalonSettings;
  services: Service[];
  barbers: Barber[];
  entries: QueueEntry[];
  lastCalledId: string | null;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or use initial demo data
  const [settings, setSettings] = useState<SalonSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        if (parsed.settings && parsed.settings.salonName === INITIAL_SETTINGS.salonName) {
          return parsed.settings;
        }
      }
    } catch {
      // fallback to bundled demo settings
    }
    return INITIAL_SETTINGS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        if (parsed.services && parsed.services.length > 0) return parsed.services;
      }
    } catch {
      // fallback
    }
    return INITIAL_SERVICES;
  });

  const [barbers, setBarbers] = useState<Barber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        if (parsed.barbers && parsed.barbers.length > 0) return parsed.barbers;
      }
    } catch {
      // fallback
    }
    return INITIAL_BARBERS;
  });

  const [entries, setEntries] = useState<QueueEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        if (parsed.entries && parsed.entries.length > 0) return parsed.entries;
      }
    } catch {
      // fallback
    }
    return INITIAL_ENTRIES;
  });

  const [lastCalledId, setLastCalledId] = useState<string | null>(null);

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'QUEUE_STATE_UPDATE') {
            const payload: PersistedState = event.data.payload;
            if (payload) {
              setSettings(payload.settings);
              setServices(payload.services);
              setBarbers(payload.barbers);
              setEntries(payload.entries);
              setLastCalledId(payload.lastCalledId);
            }
          }
        };
      }
    } catch {
      // fallback to storage event
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed: PersistedState = JSON.parse(e.newValue);
          setSettings(parsed.settings);
          setServices(parsed.services);
          setBarbers(parsed.barbers);
          setEntries(parsed.entries);
          setLastCalledId(parsed.lastCalledId);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Helper to persist and broadcast state updates
  const persistAndBroadcast = useCallback((
    newSettings: SalonSettings,
    newServices: Service[],
    newBarbers: Barber[],
    newEntries: QueueEntry[],
    calledId: string | null
  ) => {
    const statePayload: PersistedState = {
      settings: newSettings,
      services: newServices,
      barbers: newBarbers,
      entries: newEntries,
      lastCalledId: calledId,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statePayload));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: 'QUEUE_STATE_UPDATE', payload: statePayload });
        channel.close();
      }
    } catch {
      // localStorage error fallback
    }
  }, []);

  // Compute highest token number to assign next S-XX
  const getNextTokenString = useCallback((currentEntries: QueueEntry[]): string => {
    let maxNumber = 10;
    currentEntries.forEach(entry => {
      const match = entry.token.match(/S-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    return `S-${maxNumber + 1}`;
  }, []);

  // Join Queue Action
  const joinQueue = useCallback((
    customerName: string,
    phone: string,
    serviceIds: string[],
    preferredBarberId: string | 'ANY'
  ) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!customerName.trim()) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (serviceIds.length === 0) {
      return { success: false, error: 'Please select at least one service.' };
    }
    if (serviceIds.length > 3) {
      return { success: false, error: 'You can select up to 3 services only.' };
    }

    // Check for duplicate active entry by phone
    const existing = findActiveEntryByPhone(cleanPhone, entries);
    if (existing) {
      return {
        success: false,
        error: `A queue entry already exists for ${cleanPhone} (Token ${existing.token}). Redirecting to your status screen.`,
        existingEntry: existing
      };
    }

    const token = getNextTokenString(entries);
    const newEntry: QueueEntry = {
      id: `entry-${Date.now()}`,
      token,
      customerName: customerName.trim(),
      phone: cleanPhone,
      serviceIds,
      preferredBarberId,
      assignedBarberId: null,
      status: 'WAITING',
      joinedAt: new Date().toISOString(),
      calledAt: null,
      inChairAt: null,
      completedAt: null,
      isWalkIn: false,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    persistAndBroadcast(settings, services, barbers, updatedEntries, lastCalledId);

    return { success: true, entry: newEntry };
  }, [entries, getNextTokenString, settings, services, barbers, lastCalledId, persistAndBroadcast]);

  // Add Walk-in (from Reception)
  const addWalkIn = useCallback((
    customerName: string,
    phone: string,
    serviceIds: string[],
    preferredBarberId: string | 'ANY'
  ) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!customerName.trim()) {
      return { success: false, error: 'Please enter customer name.' };
    }
    if (serviceIds.length === 0) {
      return { success: false, error: 'Please select at least one service.' };
    }

    const existing = findActiveEntryByPhone(cleanPhone, entries);
    if (existing) {
      return {
        success: false,
        error: `Customer already has active spot ${existing.token} (${existing.status}).`
      };
    }

    const token = getNextTokenString(entries);
    const newEntry: QueueEntry = {
      id: `entry-${Date.now()}`,
      token,
      customerName: customerName.trim(),
      phone: cleanPhone,
      serviceIds,
      preferredBarberId,
      assignedBarberId: null,
      status: 'WAITING',
      joinedAt: new Date().toISOString(),
      calledAt: null,
      inChairAt: null,
      completedAt: null,
      isWalkIn: true,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    persistAndBroadcast(settings, services, barbers, updatedEntries, lastCalledId);

    return { success: true, entry: newEntry };
  }, [entries, getNextTokenString, settings, services, barbers, lastCalledId, persistAndBroadcast]);

  // Call Next customer for a barber
  const callNext = useCallback((barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber) return { success: false, error: 'Barber not found.' };

    if (!barber.onDuty) {
      return { success: false, error: `${barber.name} is currently off duty.` };
    }
    if (barber.status === 'ON_BREAK') {
      return { success: false, error: `${barber.name} is currently on break.` };
    }
    if (barber.currentEntryId) {
      return { success: false, error: `${barber.name} already has a customer assigned in station.` };
    }

    const eligibleCustomer = getNextEligibleCustomerForBarber(barberId, entries);
    if (!eligibleCustomer) {
      return { success: false, error: 'No eligible customer waiting in line for this station.' };
    }

    const nowIso = new Date().toISOString();
    const updatedEntries = entries.map(e => {
      if (e.id === eligibleCustomer.id) {
        return {
          ...e,
          status: 'CALLED' as const,
          calledAt: nowIso,
          assignedBarberId: barberId,
        };
      }
      return e;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          status: 'BUSY' as const,
          currentEntryId: eligibleCustomer.id,
          currentServiceStartTime: nowIso,
        };
      }
      return b;
    });

    setEntries(updatedEntries);
    setBarbers(updatedBarbers);
    setLastCalledId(eligibleCustomer.id);
    persistAndBroadcast(settings, services, updatedBarbers, updatedEntries, eligibleCustomer.id);

    return {
      success: true,
      entry: updatedEntries.find(e => e.id === eligibleCustomer.id)
    };
  }, [barbers, entries, settings, services, persistAndBroadcast]);

  // Start Service
  const startService = useCallback((entryId: string, barberId: string) => {
    const nowIso = new Date().toISOString();
    const updatedEntries = entries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          status: 'IN_CHAIR' as const,
          inChairAt: nowIso,
          assignedBarberId: barberId,
        };
      }
      return e;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          status: 'BUSY' as const,
          currentEntryId: entryId,
          currentServiceStartTime: nowIso,
        };
      }
      return b;
    });

    setEntries(updatedEntries);
    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, updatedEntries, lastCalledId);
  }, [entries, barbers, settings, services, lastCalledId, persistAndBroadcast]);

  // Complete Service
  const completeService = useCallback((entryId: string, barberId: string) => {
    const nowIso = new Date().toISOString();
    const updatedEntries = entries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          status: 'DONE' as const,
          completedAt: nowIso,
        };
      }
      return e;
    });

    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          status: 'AVAILABLE' as const,
          currentEntryId: null,
          currentServiceStartTime: null,
        };
      }
      return b;
    });

    setEntries(updatedEntries);
    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, updatedEntries, lastCalledId);
  }, [entries, barbers, settings, services, lastCalledId, persistAndBroadcast]);

  // Mark No-Show
  const markNoShow = useCallback((entryId: string) => {
    const target = entries.find(e => e.id === entryId);
    if (!target) return;

    const updatedEntries = entries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          status: 'NO_SHOW' as const,
        };
      }
      return e;
    });

    // If barber was assigned to this entry, release barber
    const updatedBarbers = barbers.map(b => {
      if (b.currentEntryId === entryId) {
        return {
          ...b,
          status: 'AVAILABLE' as const,
          currentEntryId: null,
          currentServiceStartTime: null,
        };
      }
      return b;
    });

    setEntries(updatedEntries);
    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, updatedEntries, lastCalledId);
  }, [entries, barbers, settings, services, lastCalledId, persistAndBroadcast]);

  // Cancel Queue Entry
  const cancelQueueEntry = useCallback((entryId: string) => {
    const updatedEntries = entries.map(e => {
      if (e.id === entryId && e.status === 'WAITING') {
        return {
          ...e,
          status: 'CANCELLED' as const,
        };
      }
      return e;
    });

    setEntries(updatedEntries);
    persistAndBroadcast(settings, services, barbers, updatedEntries, lastCalledId);
  }, [entries, settings, services, barbers, lastCalledId, persistAndBroadcast]);

  // Barber Status update
  const setBarberStatus = useCallback((barberId: string, status: BarberStatus) => {
    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          status,
        };
      }
      return b;
    });

    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, entries, lastCalledId);
  }, [barbers, settings, services, entries, lastCalledId, persistAndBroadcast]);

  // Toggle Barber On-Duty
  const toggleBarberOnDuty = useCallback((barberId: string, onDuty: boolean) => {
    const updatedBarbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          onDuty,
          status: onDuty ? ('AVAILABLE' as const) : ('AVAILABLE' as const),
          currentEntryId: onDuty ? b.currentEntryId : null,
        };
      }
      return b;
    });

    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, entries, lastCalledId);
  }, [barbers, settings, services, entries, lastCalledId, persistAndBroadcast]);

  // Add new Barber
  const addBarber = useCallback((name: string, role: string) => {
    const newBarber: Barber = {
      id: `barber-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Stylist',
      onDuty: true,
      status: 'AVAILABLE',
      currentEntryId: null,
      currentServiceStartTime: null,
      stationNumber: barbers.length + 1,
    };

    const updatedBarbers = [...barbers, newBarber];
    setBarbers(updatedBarbers);
    persistAndBroadcast(settings, services, updatedBarbers, entries, lastCalledId);
  }, [barbers, settings, services, entries, lastCalledId, persistAndBroadcast]);

  // Service Management
  const updateService = useCallback((service: Service) => {
    const updatedServices = services.map(s => (s.id === service.id ? service : s));
    setServices(updatedServices);
    persistAndBroadcast(settings, updatedServices, barbers, entries, lastCalledId);
  }, [services, settings, barbers, entries, lastCalledId, persistAndBroadcast]);

  const addService = useCallback((service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: `svc-${Date.now()}`,
    };
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    persistAndBroadcast(settings, updatedServices, barbers, entries, lastCalledId);
  }, [services, settings, barbers, entries, lastCalledId, persistAndBroadcast]);

  const toggleServiceActive = useCallback((serviceId: string) => {
    const updatedServices = services.map(s => {
      if (s.id === serviceId) {
        return { ...s, active: !s.active };
      }
      return s;
    });
    setServices(updatedServices);
    persistAndBroadcast(settings, updatedServices, barbers, entries, lastCalledId);
  }, [services, settings, barbers, entries, lastCalledId, persistAndBroadcast]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<SalonSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persistAndBroadcast(updated, services, barbers, entries, lastCalledId);
  }, [settings, services, barbers, entries, lastCalledId, persistAndBroadcast]);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(INITIAL_SETTINGS);
    setServices(INITIAL_SERVICES);
    setBarbers(INITIAL_BARBERS);
    setEntries(INITIAL_ENTRIES);
    setLastCalledId(null);
    persistAndBroadcast(INITIAL_SETTINGS, INITIAL_SERVICES, INITIAL_BARBERS, INITIAL_ENTRIES, null);
  }, [persistAndBroadcast]);

  // Computed: last called entry object
  const lastCalledEntry = useMemo(() => {
    if (!lastCalledId) {
      // Find the most recently called entry
      const calledEntries = entries
        .filter(e => e.status === 'CALLED' && e.calledAt)
        .sort((a, b) => new Date(b.calledAt!).getTime() - new Date(a.calledAt!).getTime());
      return calledEntries[0] || null;
    }
    return entries.find(e => e.id === lastCalledId) || null;
  }, [entries, lastCalledId]);

  // Computed: daily stats
  const dailyStats = useMemo(() => {
    return calculateDailyStats(entries, services);
  }, [entries, services]);

  return (
    <QueueContext.Provider
      value={{
        settings,
        services,
        barbers,
        entries,
        lastCalledEntry,
        dailyStats,
        joinQueue,
        addWalkIn,
        callNext,
        startService,
        completeService,
        markNoShow,
        cancelQueueEntry,
        setBarberStatus,
        toggleBarberOnDuty,
        addBarber,
        updateService,
        addService,
        toggleServiceActive,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
