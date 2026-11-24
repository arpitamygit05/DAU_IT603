import type { Barber, QueueEntry, Service, SalonSettings, DailyStats } from '../types/queue';

/**
 * Filter entries that are actively waiting in queue (ordered by joinedAt, FCFS)
 */
export function getWaitingEntries(entries: QueueEntry[]): QueueEntry[] {
  return entries
    .filter(e => e.status === 'WAITING')
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
}

/**
 * Get active entries: WAITING, CALLED, IN_CHAIR
 */
export function getActiveEntries(entries: QueueEntry[]): QueueEntry[] {
  return entries.filter(e => ['WAITING', 'CALLED', 'IN_CHAIR'].includes(e.status));
}

/**
 * Calculate sequential position in the waiting line for a specific entry.
 * Position 1 means next in line.
 */
export function getQueuePosition(entry: QueueEntry, entries: QueueEntry[]): number {
  if (entry.status !== 'WAITING') return 0;
  
  const waitingList = getWaitingEntries(entries);
  const index = waitingList.findIndex(e => e.id === entry.id);
  return index === -1 ? 0 : index + 1;
}

/**
 * Check if a customer has an existing active spot in the queue by phone number.
 */
export function findActiveEntryByPhone(phone: string, entries: QueueEntry[]): QueueEntry | undefined {
  const cleanPhone = phone.replace(/\D/g, '');
  return entries.find(e => {
    const entryPhone = e.phone.replace(/\D/g, '');
    return entryPhone === cleanPhone && ['WAITING', 'CALLED', 'IN_CHAIR'].includes(e.status);
  });
}

/**
 * Find the next eligible waiting customer for a specific barber.
 * - Customer chose this barber specifically OR chose 'ANY'.
 * - Must be the earliest waiting customer matching this criterion (FCFS).
 */
export function getNextEligibleCustomerForBarber(
  barberId: string,
  entries: QueueEntry[]
): QueueEntry | null {
  const waiting = getWaitingEntries(entries);
  return waiting.find(e => e.preferredBarberId === 'ANY' || e.preferredBarberId === barberId) || null;
}

/**
 * Check if a barber is currently eligible to call a customer:
 * - Barber must be on duty
 * - Barber must have status AVAILABLE
 * - Barber must NOT have a customer in chair or currently called
 */
export function canBarberCallNext(barber: Barber): boolean {
  return barber.onDuty && barber.status === 'AVAILABLE' && !barber.currentEntryId;
}

/**
 * Calculate total service duration in minutes for given service IDs
 */
export function getTotalServiceDuration(serviceIds: string[], services: Service[]): number {
  return serviceIds.reduce((total, id) => {
    const s = services.find(item => item.id === id);
    return total + (s ? s.durationMinutes : 20);
  }, 0);
}

/**
 * Calculate total service price in ₹ for given service IDs
 */
export function getTotalServicePrice(serviceIds: string[], services: Service[]): number {
  return serviceIds.reduce((total, id) => {
    const s = services.find(item => item.id === id);
    return total + (s ? s.priceRupees : 0);
  }, 0);
}

/**
 * Dynamic Wait Time Calculation:
 * - If customer has chosen a specific barber:
 *     wait time = (estimated remaining time of that barber's current client) +
 *                 (sum of service durations for all waiting customers ahead who chose this barber or are assigned to him)
 * - If customer chose "ANY" barber:
 *     wait time = sum of durations of all waiting work ahead / number of available on-duty barbers.
 */
export function calculateEstimatedWaitTime(
  entry: QueueEntry,
  allEntries: QueueEntry[],
  barbers: Barber[],
  services: Service[]
): number {
  if (entry.status === 'CALLED' || entry.status === 'IN_CHAIR') {
    return 0;
  }
  if (entry.status === 'DONE' || entry.status === 'CANCELLED' || entry.status === 'NO_SHOW') {
    return 0;
  }

  const waitingList = getWaitingEntries(allEntries);
  const entryIndex = waitingList.findIndex(e => e.id === entry.id);
  if (entryIndex === -1) return 0;

  // Active on-duty barbers
  const onDutyBarbers = barbers.filter(b => b.onDuty);
  if (onDutyBarbers.length === 0) return 60; // Fallback if no barbers are on duty

  if (entry.preferredBarberId !== 'ANY') {
    // Specific barber queue calculation
    const barber = barbers.find(b => b.id === entry.preferredBarberId);
    let waitMinutes = 0;

    // Remaining time on current client in chair
    if (barber && barber.currentEntryId) {
      const activeEntry = allEntries.find(e => e.id === barber.currentEntryId);
      if (activeEntry && barber.currentServiceStartTime) {
        const clientDuration = getTotalServiceDuration(activeEntry.serviceIds, services);
        const elapsed = Math.floor((Date.now() - new Date(barber.currentServiceStartTime).getTime()) / 60000);
        waitMinutes += Math.max(5, clientDuration - Math.max(0, elapsed));
      } else {
        waitMinutes += 20; // Default estimate for active service
      }
    }

    // Add durations of customers ahead in queue who are for this barber or general queue ahead of him
    for (let i = 0; i < entryIndex; i++) {
      const ahead = waitingList[i];
      if (ahead.preferredBarberId === entry.preferredBarberId || ahead.preferredBarberId === 'ANY') {
        waitMinutes += getTotalServiceDuration(ahead.serviceIds, services);
      }
    }

    return Math.max(5, waitMinutes);
  } else {
    // ANY barber calculation: distribute work ahead across all on-duty active barbers
    let totalWorkAheadMinutes = 0;

    // Add remaining time from barbers currently busy
    onDutyBarbers.forEach(b => {
      if (b.status === 'BUSY' && b.currentEntryId) {
        const activeEntry = allEntries.find(e => e.id === b.currentEntryId);
        if (activeEntry && b.currentServiceStartTime) {
          const clientDuration = getTotalServiceDuration(activeEntry.serviceIds, services);
          const elapsed = Math.floor((Date.now() - new Date(b.currentServiceStartTime).getTime()) / 60000);
          totalWorkAheadMinutes += Math.max(5, clientDuration - Math.max(0, elapsed));
        } else {
          totalWorkAheadMinutes += 15;
        }
      }
    });

    // Add work of all waiting customers ahead
    for (let i = 0; i < entryIndex; i++) {
      totalWorkAheadMinutes += getTotalServiceDuration(waitingList[i].serviceIds, services);
    }

    const effectiveBarbers = Math.max(1, onDutyBarbers.filter(b => b.status !== 'ON_BREAK').length);
    const estimated = Math.ceil(totalWorkAheadMinutes / effectiveBarbers);
    return Math.max(5, estimated);
  }
}

/**
 * Estimate wait for a prospective customer joining now
 */
export function estimateWaitForNewJoin(
  preferredBarberId: string | 'ANY',
  entries: QueueEntry[],
  barbers: Barber[],
  services: Service[]
): number {
  const dummyEntry: QueueEntry = {
    id: 'prospective',
    token: 'NEW',
    customerName: '',
    phone: '',
    serviceIds: ['svc-1'],
    preferredBarberId,
    assignedBarberId: null,
    status: 'WAITING',
    joinedAt: new Date().toISOString(),
    calledAt: null,
    inChairAt: null,
    completedAt: null,
    isWalkIn: false,
  };

  const syntheticList = [...entries, dummyEntry];
  return calculateEstimatedWaitTime(dummyEntry, syntheticList, barbers, services);
}

/**
 * Check if online queue is currently open according to business rules:
 * - Admin setting `isOnlineQueueOpen` must be true
 * - Salon must be open today (`isOpenToday` is true)
 * - Cutoff: 30 minutes before closing time
 */
export function checkOnlineQueueAvailability(settings: SalonSettings, now = new Date()): {
  isOpen: boolean;
  reason?: string;
  closingTime: string;
  cutoffTime: string;
} {
  const [closeHours, closeMinutes] = settings.closeTime.split(':').map(Number);
  const closingDate = new Date(now);
  closingDate.setHours(closeHours, closeMinutes, 0, 0);

  const cutoffDate = new Date(closingDate.getTime() - settings.cutoffMinutesBeforeClosing * 60000);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!settings.isOpenToday) {
    return {
      isOpen: false,
      reason: 'The salon is closed today. Online queue will reopen on the next working day.',
      closingTime: formatTime(closingDate),
      cutoffTime: formatTime(cutoffDate)
    };
  }

  if (!settings.isOnlineQueueOpen) {
    return {
      isOpen: false,
      reason: 'Online queue joining is temporarily paused by salon management. Walk-ins are accepted at reception.',
      closingTime: formatTime(closingDate),
      cutoffTime: formatTime(cutoffDate)
    };
  }

  if (now.getTime() >= cutoffDate.getTime()) {
    return {
      isOpen: false,
      reason: `Online joining closes 30 minutes before salon closing time (${formatTime(cutoffDate)}). Please visit as a walk-in at reception!`,
      closingTime: formatTime(closingDate),
      cutoffTime: formatTime(cutoffDate)
    };
  }

  return {
    isOpen: true,
    closingTime: formatTime(closingDate),
    cutoffTime: formatTime(cutoffDate)
  };
}

/**
 * Calculate daily statistics
 */
export function calculateDailyStats(entries: QueueEntry[], services: Service[]): DailyStats {
  const doneEntries = entries.filter(e => e.status === 'DONE');
  const noShows = entries.filter(e => e.status === 'NO_SHOW').length;

  let totalWaitMs = 0;
  let validWaitEntriesCount = 0;
  let revenue = 0;

  doneEntries.forEach(entry => {
    if (entry.calledAt && entry.joinedAt) {
      const wait = new Date(entry.calledAt).getTime() - new Date(entry.joinedAt).getTime();
      if (wait > 0) {
        totalWaitMs += wait;
        validWaitEntriesCount++;
      }
    }
    revenue += getTotalServicePrice(entry.serviceIds, services);
  });

  const avgWaitMins = validWaitEntriesCount > 0 ? Math.round(totalWaitMs / (validWaitEntriesCount * 60000)) : 18;

  return {
    customersServed: doneEntries.length,
    averageWaitMinutes: avgWaitMins,
    noShowsCount: noShows,
    totalRevenueEstimate: revenue
  };
}
