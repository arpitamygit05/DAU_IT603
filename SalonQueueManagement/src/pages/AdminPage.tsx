import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import type { Service } from '../types/queue';
import {
  Clock,
  Users,
  UserX,
  TrendingUp,
  Plus,
  Edit2,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  X
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    settings,
    services,
    barbers,
    dailyStats,
    updateSettings,
    updateService,
    addService,
    toggleServiceActive,
    toggleBarberOnDuty,
    setBarberStatus,
    addBarber,
    resetToDefaults
  } = useQueue();

  // Modals & form state
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddBarberModal, setShowAddBarberModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Service form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(500);
  const [newServiceCategory, setNewServiceCategory] = useState<'Hair' | 'Beard' | 'Spa' | 'Facial' | 'Combo'>('Hair');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New Barber form
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberRole, setNewBarberRole] = useState('Stylist');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    addService({
      name: newServiceName.trim(),
      durationMinutes: Number(newServiceDuration),
      priceRupees: Number(newServicePrice),
      active: true,
      category: newServiceCategory,
      description: newServiceDesc.trim() || undefined,
    });

    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServiceDuration(30);
    setNewServicePrice(500);
    setNewServiceDesc('');
    showToast('New service added successfully.');
  };

  const handleSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    updateService(editingService);
    setEditingService(null);
    showToast('Service updated successfully.');
  };

  const handleCreateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;

    addBarber(newBarberName.trim(), newBarberRole.trim());
    setShowAddBarberModal(false);
    setNewBarberName('');
    setNewBarberRole('Stylist');
    showToast('New barber added to team.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-sage-deep text-beige-warm shadow-elevated border border-sage/40 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-muted-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-sage-deep font-semibold">Management Console</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-dark-heading mt-0.5">
            Owner Settings & Control
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all queue data (queue, barbers, services) to defaults?')) {
              resetToDefaults();
              showToast('Queue data reset to defaults.');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-beige hover:bg-beige-dark border border-muted-border text-dark transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sage" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Daily Performance Metrics */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold text-dark-heading">Daily Salon Performance</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-cream border border-muted-border shadow-subtle">
            <div className="flex items-center justify-between text-muted text-xs font-medium">
              <span>Clients Served Today</span>
              <Users className="w-4 h-4 text-sage" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-dark-heading">
                {dailyStats.customersServed}
              </span>
              <span className="text-xs text-muted">completed</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cream border border-muted-border shadow-subtle">
            <div className="flex items-center justify-between text-muted text-xs font-medium">
              <span>Average Wait Time</span>
              <Clock className="w-4 h-4 text-sage" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-sage-deep">
                {dailyStats.averageWaitMinutes}
              </span>
              <span className="text-xs text-muted">minutes</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cream border border-muted-border shadow-subtle">
            <div className="flex items-center justify-between text-muted text-xs font-medium">
              <span>No-Show Rate</span>
              <UserX className="w-4 h-4 text-terracotta" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-terracotta">
                {dailyStats.noShowsCount}
              </span>
              <span className="text-xs text-muted">missed calls</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cream border border-muted-border shadow-subtle">
            <div className="flex items-center justify-between text-muted text-xs font-medium">
              <span>Est. Daily Revenue</span>
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-dark-heading">
                ₹{dailyStats.totalRevenueEstimate.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted">INR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Online Queue & Salon Operating Controls */}
      <section className="p-6 rounded-2xl bg-cream border border-muted-border shadow-subtle space-y-4">
        <h2 className="font-serif text-xl font-bold text-dark-heading">
          Queue Availability & Operating Hours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Online Queue Toggle */}
          <div className="p-4 rounded-xl bg-beige-light border border-muted-border/80 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-muted tracking-wider block">
                Online Queue Status
              </span>
              <span className="font-bold text-dark text-sm mt-0.5 block">
                {settings.isOnlineQueueOpen ? 'Accepting Online Joins' : 'Paused for Online Joins'}
              </span>
              <p className="text-[11px] text-muted mt-1">
                When paused, customers are instructed to visit as walk-ins.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateSettings({ isOnlineQueueOpen: !settings.isOnlineQueueOpen });
                showToast(`Online queue ${!settings.isOnlineQueueOpen ? 'opened' : 'paused'}.`);
              }}
              className="text-sage-deep hover:text-sage-dark p-1"
            >
              {settings.isOnlineQueueOpen ? (
                <ToggleRight className="w-10 h-10 text-sage" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted" />
              )}
            </button>
          </div>

          {/* Closing Time Setting */}
          <div className="p-4 rounded-xl bg-beige-light border border-muted-border/80 space-y-2">
            <span className="text-xs uppercase font-semibold text-muted tracking-wider block">
              Salon Closing Time
            </span>
            <input
              type="time"
              value={settings.closeTime}
              onChange={(e) => updateSettings({ closeTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-cream border border-muted-border text-sm font-semibold outline-none focus:border-sage"
            />
            <p className="text-[11px] text-muted">
              Online queue automatically stops 30 mins before this time.
            </p>
          </div>

          {/* Salon Open Today Toggle */}
          <div className="p-4 rounded-xl bg-beige-light border border-muted-border/80 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-muted tracking-wider block">
                Open Today
              </span>
              <span className="font-bold text-dark text-sm mt-0.5 block">
                {settings.isOpenToday ? 'Salon Open Today' : 'Salon Closed Today'}
              </span>
              <p className="text-[11px] text-muted mt-1">
                Toggles the public open/closed banner on home.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateSettings({ isOpenToday: !settings.isOpenToday });
                showToast(`Salon marked as ${!settings.isOpenToday ? 'Open' : 'Closed'}.`);
              }}
              className="text-sage-deep hover:text-sage-dark p-1"
            >
              {settings.isOpenToday ? (
                <ToggleRight className="w-10 h-10 text-sage" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted" />
              )}
            </button>
          </div>

        </div>
      </section>

      {/* Barbers Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-dark-heading">
              Barber Team & Duty Roster
            </h2>
            <p className="text-xs text-muted">
              Manage on-duty status and station assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddBarberModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Barber</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className={`p-4 rounded-2xl border transition-all ${
                barber.onDuty ? 'bg-cream border-muted-border shadow-subtle' : 'bg-beige/40 border-muted-border opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-dark-heading">{barber.name}</h4>
                  <p className="text-xs text-muted">{barber.role}</p>
                  <p className="text-[11px] text-sage font-medium mt-0.5">Station {barber.stationNumber}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleBarberOnDuty(barber.id, !barber.onDuty)}
                  className="text-xs font-semibold text-muted hover:text-dark p-1"
                >
                  {barber.onDuty ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">On Duty</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[11px]">Off Duty</span>
                  )}
                </button>
              </div>

              {barber.onDuty && (
                <div className="mt-3 pt-3 border-t border-muted-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted">Status:</span>
                  <select
                    value={barber.status}
                    onChange={(e) => setBarberStatus(barber.id, e.target.value as any)}
                    className="px-2 py-1 rounded bg-beige-light border border-muted-border text-xs font-medium outline-none"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">In Chair</option>
                    <option value="ON_BREAK">On Break</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Services Catalog Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-dark-heading">
              Salon Services Catalog
            </h2>
            <p className="text-xs text-muted">
              Add, update prices, adjust durations, or toggle service active availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddServiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="bg-cream rounded-2xl border border-muted-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-beige-light border-b border-muted-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Service Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-border/60">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-beige/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-dark">{service.name}</p>
                      {service.description && (
                        <p className="text-[11px] text-muted max-w-sm truncate">{service.description}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-sage-pale text-sage-deep text-[11px] font-semibold">
                        {service.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-dark font-medium">
                      {service.durationMinutes} mins
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-serif font-bold text-dark">
                        ₹{service.priceRupees.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleServiceActive(service.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          service.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {service.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingService(service)}
                        className="p-1 text-muted hover:text-dark transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-md w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between pb-2 border-b border-muted-border">
              <h3 className="font-serif text-lg font-bold text-dark-heading">Add New Salon Service</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-muted hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Royal Keratin Hair Treatment"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={180}
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Category</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                >
                  <option value="Hair">Hair</option>
                  <option value="Beard">Beard</option>
                  <option value="Spa">Spa</option>
                  <option value="Facial">Facial</option>
                  <option value="Combo">Combo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Short description of the service..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 font-semibold rounded-lg border border-muted-border hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold rounded-lg bg-sage-deep text-beige-warm hover:bg-sage-dark"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-md w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between pb-2 border-b border-muted-border">
              <h3 className="font-serif text-lg font-bold text-dark-heading">Edit Service</h3>
              <button onClick={() => setEditingService(null)} className="text-muted hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={editingService.durationMinutes}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingService.priceRupees}
                    onChange={(e) => setEditingService({ ...editingService, priceRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 font-semibold rounded-lg border border-muted-border hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold rounded-lg bg-sage-deep text-beige-warm hover:bg-sage-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Barber Modal */}
      {showAddBarberModal && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between pb-2 border-b border-muted-border">
              <h3 className="font-serif text-lg font-bold text-dark-heading">Add Barber</h3>
              <button onClick={() => setShowAddBarberModal(false)} className="text-muted hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBarber} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Barber Name *</label>
                <input
                  type="text"
                  required
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  placeholder="e.g. Samir Khan"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                />
              </div>

              <div>
                <label className="block font-semibold text-dark uppercase tracking-wider mb-1">Specialty / Role *</label>
                <input
                  type="text"
                  required
                  value={newBarberRole}
                  onChange={(e) => setNewBarberRole(e.target.value)}
                  placeholder="e.g. Senior Fade Stylist"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-beige-light border border-muted-border outline-none focus:border-sage"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBarberModal(false)}
                  className="px-4 py-2 font-semibold rounded-lg border border-muted-border hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold rounded-lg bg-sage-deep text-beige-warm hover:bg-sage-dark"
                >
                  Add Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
