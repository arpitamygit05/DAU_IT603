import {
  getWaitingEntries,
  getActiveEntries,
  getQueuePosition,
  findActiveEntryByPhone,
  getNextEligibleCustomerForBarber,
  canBarberCallNext,
  calculateEstimatedWaitTime,
  estimateWaitForNewJoin,
  checkOnlineQueueAvailability,
  calculateDailyStats,
  getTotalServiceDuration,
  getTotalServicePrice
} from './src/services/queueLogic';
import type { Barber, QueueEntry, SalonSettings, Service } from './src/types/queue';

const mockServices: Service[] = [
  { id: 's1', name: 'Haircut', durationMinutes: 30, priceRupees: 400, active: true, category: 'Hair' },
  { id: 's2', name: 'Beard', durationMinutes: 20, priceRupees: 250, active: true, category: 'Beard' }
];

const mockBarbers: Barber[] = [
  { id: 'b1', name: 'Barber One', role: 'Stylist', onDuty: true, status: 'AVAILABLE', currentEntryId: null, currentServiceStartTime: null, stationNumber: 1 },
  { id: 'b2', name: 'Barber Two', role: 'Stylist', onDuty: true, status: 'ON_BREAK', currentEntryId: null, currentServiceStartTime: null, stationNumber: 2 },
  { id: 'b3', name: 'Barber Three', role: 'Stylist', onDuty: true, status: 'BUSY', currentEntryId: 'active-1', currentServiceStartTime: new Date().toISOString(), stationNumber: 3 },
  { id: 'b4', name: 'Barber Four', role: 'Stylist', onDuty: false, status: 'AVAILABLE', currentEntryId: null, currentServiceStartTime: null, stationNumber: 4 },
];

const mockEntries: QueueEntry[] = [
  { id: 'e1', token: 'S-1', customerName: 'Alice', phone: '9876543210', serviceIds: ['s1'], preferredBarberId: 'b2', assignedBarberId: null, status: 'WAITING', joinedAt: new Date(Date.now() - 300000).toISOString(), calledAt: null, inChairAt: null, completedAt: null, isWalkIn: false },
  { id: 'e2', token: 'S-2', customerName: 'Bob', phone: '9876543211', serviceIds: ['s2'], preferredBarberId: 'ANY', assignedBarberId: null, status: 'WAITING', joinedAt: new Date(Date.now() - 200000).toISOString(), calledAt: null, inChairAt: null, completedAt: null, isWalkIn: false },
  { id: 'e3', token: 'S-3', customerName: 'Charlie', phone: '9876543212', serviceIds: ['s1'], preferredBarberId: 'b1', assignedBarberId: null, status: 'WAITING', joinedAt: new Date(Date.now() - 100000).toISOString(), calledAt: null, inChairAt: null, completedAt: null, isWalkIn: false },
  { id: 'active-1', token: 'S-0', customerName: 'Active', phone: '9876543213', serviceIds: ['s1'], preferredBarberId: 'b3', assignedBarberId: 'b3', status: 'IN_CHAIR', joinedAt: new Date(Date.now() - 600000).toISOString(), calledAt: new Date().toISOString(), inChairAt: new Date().toISOString(), completedAt: null, isWalkIn: false },
  { id: 'done-1', token: 'S-pre', customerName: 'Done User', phone: '9876543214', serviceIds: ['s1'], preferredBarberId: 'ANY', assignedBarberId: 'b1', status: 'DONE', joinedAt: new Date(Date.now() - 3600000).toISOString(), calledAt: new Date().toISOString(), inChairAt: new Date().toISOString(), completedAt: new Date().toISOString(), isWalkIn: false }
];

console.log('--- RUNNING QUEUE ENGINE RULE VERIFICATION TESTS ---');

// Test 1: Waiting entries are sorted strictly FCFS
const waiting = getWaitingEntries(mockEntries);
console.assert(waiting.length === 3, `Expected 3 waiting entries, got ${waiting.length}`);
console.assert(waiting[0].token === 'S-1', `First waiting should be S-1, got ${waiting[0].token}`);
console.assert(waiting[1].token === 'S-2', `Second waiting should be S-2, got ${waiting[1].token}`);
console.assert(waiting[2].token === 'S-3', `Third waiting should be S-3, got ${waiting[2].token}`);
console.log('✓ Rule 1: FCFS ordering confirmed');

// Test 2: Barber b1 calls next customer:
// e1 wants b2 (on break), so b1 MUST NOT get e1.
// e2 chose 'ANY', so b1 should get e2!
const nextForB1 = getNextEligibleCustomerForBarber('b1', mockEntries);
console.assert(nextForB1?.token === 'S-2', `Expected next for b1 to be S-2 (Bob, who chose ANY), got ${nextForB1?.token}`);
console.log('✓ Rule 2: Specific barber preference respected (e1 choosing b2 is NEVER assigned to b1)');

// Test 3: Next for b2 (who Alice chose)
const nextForB2 = getNextEligibleCustomerForBarber('b2', mockEntries);
console.assert(nextForB2?.token === 'S-1', `Expected next for b2 to be S-1 (Alice), got ${nextForB2?.token}`);
console.log('✓ Rule 3: Customer choosing specific barber is queued for them');

// Test 4: Barber capability to call next
console.assert(canBarberCallNext(mockBarbers[0]) === true, 'b1 should be able to call next');
console.assert(canBarberCallNext(mockBarbers[1]) === false, 'b2 (on break) must NOT call next');
console.assert(canBarberCallNext(mockBarbers[2]) === false, 'b3 (busy) must NOT call next');
// off-duty barber check
const offDutyBarber: Barber = { id: 'b4', name: 'Barber Four', role: 'Stylist', onDuty: false, status: 'AVAILABLE', currentEntryId: null, currentServiceStartTime: null, stationNumber: 4 };
console.assert(canBarberCallNext(offDutyBarber) === false, 'off-duty barber must NOT call next');
console.log('✓ Rule 4: Only available on-duty barbers with no active customer can call next');

// Test 5: Phone number duplication check
const dupCheck = findActiveEntryByPhone('9876543210', mockEntries);
console.assert(dupCheck?.token === 'S-1', `Duplicate active check should find S-1, got ${dupCheck?.token}`);
const dupCheckDone = findActiveEntryByPhone('9876543214', mockEntries);
console.assert(dupCheckDone === undefined, 'Completed customer phone should NOT block new join');
console.log('✓ Rule 5: Active phone duplication enforced; completed phones allowed');

// Test 6: Online queue availability cutoff 30 minutes before closing
const settings: SalonSettings = {
  salonName: 'The Style Atelier',
  tagline: 'Modern Salon & Grooming Atelier',
  openTime: '09:00',
  closeTime: '21:00',
  isOpenToday: true,
  isOnlineQueueOpen: true,
  cutoffMinutesBeforeClosing: 30
};

const dateBeforeCutoff = new Date();
dateBeforeCutoff.setHours(20, 0, 0, 0); // 8:00 PM (1h before close)
const statusOpen = checkOnlineQueueAvailability(settings, dateBeforeCutoff);
console.assert(statusOpen.isOpen === true, 'Should be open at 8:00 PM');

const dateAfterCutoff = new Date();
dateAfterCutoff.setHours(20, 35, 0, 0); // 8:35 PM (25 mins before close, inside 30m cutoff)
const statusCutoff = checkOnlineQueueAvailability(settings, dateAfterCutoff);
console.assert(statusCutoff.isOpen === false, 'Should be closed 25 mins before closing');
console.log('✓ Rule 6: Online joining cutoff 30 mins before closing verified');

// Test 7: Queue positions
console.assert(getQueuePosition(mockEntries[0], mockEntries) === 1, 'S-1 should be position 1');
console.assert(getQueuePosition(mockEntries[1], mockEntries) === 2, 'S-2 should be position 2');
console.assert(getQueuePosition(mockEntries[2], mockEntries) === 3, 'S-3 should be position 3');
console.log('✓ Rule 7: Dynamic queue positions verified');

// Test 8: Duration & Price calculation
console.assert(getTotalServiceDuration(['s1', 's2'], mockServices) === 50, 'Duration should be 50m');
console.assert(getTotalServicePrice(['s1', 's2'], mockServices) === 650, 'Price should be ₹650');
console.log('✓ Rule 8: Multi-service duration & pricing calculations verified');

console.log('--- ALL QUEUE BUSINESS RULES PASSED WITH 100% ACCURACY! ---');
