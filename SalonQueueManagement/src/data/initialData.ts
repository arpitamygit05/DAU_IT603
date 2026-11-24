import type { Barber, QueueEntry, SalonSettings, Service } from '../types/queue';

export const INITIAL_SETTINGS: SalonSettings = {
  salonName: 'The Style Atelier',
  tagline: 'Modern Salon & Grooming Atelier',
  openTime: '09:00',
  closeTime: '21:00',
  isOpenToday: true,
  isOnlineQueueOpen: true,
  cutoffMinutesBeforeClosing: 30,
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Classic Precision Haircut & Styling',
    durationMinutes: 30,
    priceRupees: 450,
    active: true,
    category: 'Hair',
    description: 'Bespoke consultation, shear cut, warm rinse, and styled finish.'
  },
  {
    id: 'svc-2',
    name: 'Royal Hot Towel Beard Sculpting',
    durationMinutes: 25,
    priceRupees: 350,
    active: true,
    category: 'Beard',
    description: 'Beard shaping, razor line definition, infused hot towel treatment, and beard balm.'
  },
  {
    id: 'svc-3',
    name: 'Signature Hair Spa & Scalp Massage',
    durationMinutes: 40,
    priceRupees: 850,
    active: true,
    category: 'Spa',
    description: 'Deep conditioning scalp treatment, revitalizing steam, and pressure-point massage.'
  },
  {
    id: 'svc-4',
    name: 'Charcoal Detox Deep Cleansing Facial',
    durationMinutes: 45,
    priceRupees: 950,
    active: true,
    category: 'Facial',
    description: 'Activated charcoal exfoliation, pore unclogging steam, and cold stone calm mask.'
  },
  {
    id: 'svc-5',
    name: 'Express Mustache & Neckline Tidy',
    durationMinutes: 15,
    priceRupees: 200,
    active: true,
    category: 'Beard',
    description: 'Quick perimeter cleanup, neck razor taper, and soothing alum rub.'
  },
  {
    id: 'svc-6',
    name: 'Grooming Executive Combo',
    durationMinutes: 60,
    priceRupees: 1450,
    active: true,
    category: 'Combo',
    description: 'Precision haircut, royal beard sculpting, and refreshing quick glow cleanup.'
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-1',
    name: 'Arjun Sharma',
    role: 'Master Stylist & Director',
    onDuty: true,
    status: 'AVAILABLE',
    currentEntryId: null,
    currentServiceStartTime: null,
    stationNumber: 1,
  },
  {
    id: 'barber-2',
    name: 'Rohan Patel',
    role: 'Beard & Skin Fade Specialist',
    onDuty: true,
    status: 'AVAILABLE',
    currentEntryId: null,
    currentServiceStartTime: null,
    stationNumber: 2,
  },
  {
    id: 'barber-3',
    name: 'Vikram Joshi',
    role: 'Senior Grooming Expert',
    onDuty: true,
    status: 'ON_BREAK',
    currentEntryId: null,
    currentServiceStartTime: null,
    stationNumber: 3,
  },
  {
    id: 'barber-4',
    name: 'Dev Mehta',
    role: 'Traditional Barber',
    onDuty: false,
    status: 'AVAILABLE',
    currentEntryId: null,
    currentServiceStartTime: null,
    stationNumber: 4,
  }
];

// Known seeded entry IDs from initial mock/sample data (entry-1 through entry-25).
// QueueContext strips these from persisted localStorage on load
// so the app starts with an empty queue on first visit, preserving any real user entries.
export const SEEDED_ENTRY_IDS = new Set([
  'entry-1', 'entry-2', 'entry-3', 'entry-4', 'entry-5',
  'entry-6', 'entry-7', 'entry-8', 'entry-9', 'entry-10',
  'entry-11', 'entry-12', 'entry-13', 'entry-14', 'entry-15',
  'entry-16', 'entry-17', 'entry-18', 'entry-19', 'entry-20',
  'entry-21', 'entry-22', 'entry-23', 'entry-24', 'entry-25'
]);

export const INITIAL_ENTRIES: QueueEntry[] = [];
