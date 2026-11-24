import React, { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  canBarberCallNext,
  getNextEligibleCustomerForBarber,
  getWaitingEntries,
  getTotalServiceDuration
} from '../services/queueLogic';
import {
  Scissors,
  Users,
  Clock,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle,
  UserX
} from 'lucide-react';

export const ReceptionPage: React.FC = () => {
  const {
    barbers,
    entries,
    services,
    callNext,
    startService,
    completeService,
    markNoShow,
    cancelQueueEntry,
    addWalkIn,
    setBarberStatus
  } = useQueue();

  // Modals & form state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [noShowTargetId, setNoShowTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Walk-in form inputs
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState<string[]>(['svc-1']);
  const [walkInBarberId, setWalkInBarberId] = useState<string>('ANY');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  const waitingEntries = useMemo(() => getWaitingEntries(entries), [entries]);
  const activeServices = useMemo(() => services.filter(s => s.active), [services]);
  const onDutyBarbers = useMemo(() => barbers.filter(b => b.onDuty), [barbers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCallNext = (barberId: string) => {
    const result = callNext(barberId);
    if (result.success && result.entry) {
      showToast(`Called Token ${result.entry.token} (${result.entry.customerName}) to Station.`);
    } else {
      showToast(result.error || 'Unable to call next customer.');
    }
  };

  const handleAddWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    const clean = walkInPhone.replace(/\D/g, '');
    if (!walkInName.trim()) {
      setWalkInError('Please enter customer name.');
      return;
    }
    if (clean.length !== 10) {
      setWalkInError('Please enter a 10-digit mobile number.');
      return;
    }
    if (walkInServices.length === 0) {
      setWalkInError('Please select at least one service.');
      return;
    }

    const result = addWalkIn(walkInName, clean, walkInServices, walkInBarberId);
    if (result.success && result.entry) {
      showToast(`Walk-in added: Token ${result.entry.token} joined queue.`);
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServices(['svc-1']);
      setWalkInBarberId('ANY');
    } else {
      setWalkInError(result.error || 'Could not add walk-in.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-sage-deep text-beige-warm shadow-elevated border border-sage/40 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-muted-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-sage-deep font-semibold">Reception Desk</span>
            <span className="text-muted">•</span>
            <span className="text-xs text-muted">Landscape Tablet View</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-dark-heading mt-0.5">
            Station & Queue Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-beige text-xs text-muted">
            <Users className="w-4 h-4 text-sage" />
            <span>Waiting: <strong className="text-dark">{waitingEntries.length}</strong></span>
            <span className="text-muted-border">|</span>
            <Scissors className="w-4 h-4 text-sage" />
            <span>Active Barbers: <strong className="text-dark">{onDutyBarbers.length}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setShowWalkInModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm text-xs font-semibold shadow-subtle hover:shadow-refined transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-beige-warm" />
            <span>Add Walk-In</span>
          </button>
        </div>
      </div>

      {/* Section 1: Barber Stations Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-dark-heading">
            Barber Stations ({onDutyBarbers.length} on duty)
          </h2>
          <span className="text-xs text-muted font-medium">
            Tap 'Call Next' to seat the next eligible client
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {onDutyBarbers.map((barber) => {
            const isAvail = barber.status === 'AVAILABLE';
            const isBusy = barber.status === 'BUSY';
            const isBreak = barber.status === 'ON_BREAK';

            const activeEntry = barber.currentEntryId
              ? entries.find(e => e.id === barber.currentEntryId)
              : null;

            const nextEligible = getNextEligibleCustomerForBarber(barber.id, entries);
            const canCall = canBarberCallNext(barber) && Boolean(nextEligible);

            // Elapsed time calculation
            const elapsedMinutes = barber.currentServiceStartTime
              ? Math.max(0, Math.floor((Date.now() - new Date(barber.currentServiceStartTime).getTime()) / 60000))
              : 0;

            const totalActiveServiceDuration = activeEntry
              ? getTotalServiceDuration(activeEntry.serviceIds, services)
              : 0;

            return (
              <div
                key={barber.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isBusy
                    ? 'bg-amber-50/50 border-amber-200 shadow-subtle'
                    : isBreak
                    ? 'bg-beige/40 border-muted-border/80 opacity-90'
                    : 'bg-cream border-muted-border shadow-subtle'
                }`}
              >
                {/* Station Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                        Station {barber.stationNumber}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-dark-heading mt-0.5">
                        {barber.name}
                      </h3>
                      <p className="text-xs text-muted">{barber.role}</p>
                    </div>

                    {/* Status Pill & Break Toggle */}
                    <div className="flex flex-col items-end gap-1.5">
                      {isAvail && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Available
                        </span>
                      )}
                      {isBusy && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          In Chair
                        </span>
                      )}
                      {isBreak && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-200 text-gray-700">
                          On Break
                        </span>
                      )}

                      {!isBusy && (
                        <button
                          type="button"
                          onClick={() => setBarberStatus(barber.id, isBreak ? 'AVAILABLE' : 'ON_BREAK')}
                          className="text-[11px] text-muted hover:text-dark underline"
                        >
                          {isBreak ? 'End Break' : 'Take Break'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current Client Status */}
                  <div className="p-3.5 rounded-xl bg-beige-light/70 border border-muted-border/60 min-h-[90px] flex flex-col justify-center">
                    {activeEntry ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-dark">
                            {activeEntry.token} · {activeEntry.customerName}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sage-pale text-sage-deep">
                            {activeEntry.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sage" />
                            {elapsedMinutes}m elapsed
                          </span>
                          <span>Est. {totalActiveServiceDuration}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs text-muted">
                        {isBreak ? 'Station resting' : 'Station free · Ready for next client'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Station Actions */}
                <div className="pt-4 mt-4 border-t border-muted-border/60 space-y-2">
                  {activeEntry ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeEntry.status === 'CALLED' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startService(activeEntry.id, barber.id)}
                            className="py-2 px-3 text-xs font-semibold rounded-lg bg-sage-deep text-beige-warm hover:bg-sage-dark transition-colors"
                          >
                            Start Service
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoShowTargetId(activeEntry.id)}
                            className="py-2 px-3 text-xs font-semibold rounded-lg text-terracotta border border-terracotta/40 hover:bg-terracotta-light transition-colors"
                          >
                            No-Show
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => completeService(activeEntry.id, barber.id)}
                          className="col-span-2 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-700 text-cream hover:bg-emerald-800 transition-colors"
                        >
                          Finish Service & Free Chair
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        disabled={!canCall}
                        onClick={() => handleCallNext(barber.id)}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          canCall
                            ? 'bg-sage-deep hover:bg-sage-dark text-beige-warm shadow-subtle active:scale-[0.98]'
                            : 'bg-muted-border/60 text-muted cursor-not-allowed'
                        }`}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Call Next Client</span>
                      </button>

                      <div className="text-[11px] text-muted text-center mt-1.5 truncate">
                        {nextEligible
                          ? `Next: ${nextEligible.token} (${nextEligible.customerName})`
                          : 'No matching clients waiting'}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Waiting Queue Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-dark-heading">
              Waiting Queue (In Order of Arrival)
            </h2>
            <p className="text-xs text-muted">
              Clients are served strictly first-come, first-served while respecting barber preferences.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted">
            {waitingEntries.length} Active in Line
          </span>
        </div>

        {waitingEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-cream border border-muted-border space-y-3">
            <div className="w-12 h-12 rounded-full bg-beige text-muted mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-dark-heading">Queue is Clear</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              No clients are currently waiting. Walk-in visitors can be registered using the "Add Walk-In" button above.
            </p>
          </div>
        ) : (
          <div className="bg-cream rounded-2xl border border-muted-border overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-beige-light border-b border-muted-border text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pos</th>
                    <th className="py-3.5 px-4">Token</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Services</th>
                    <th className="py-3.5 px-4">Preferred Barber</th>
                    <th className="py-3.5 px-4">Wait Time</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-border/60">
                  {waitingEntries.map((entry, index) => {
                    const waitMinutes = Math.floor(
                      (Date.now() - new Date(entry.joinedAt).getTime()) / 60000
                    );
                    const isLongWait = waitMinutes >= 60; // Waiting > 60 minutes notice

                    return (
                      <tr
                        key={entry.id}
                        className={`hover:bg-beige/40 transition-colors ${
                          isLongWait ? 'bg-terracotta-light/40 border-l-4 border-l-terracotta' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-muted">
                          #{index + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-serif font-bold text-sm text-dark px-2.5 py-1 rounded-md bg-sage-pale text-sage-deep">
                            {entry.token}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-dark">{entry.customerName}</p>
                          <p className="text-[11px] text-muted">+91 {entry.phone}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {entry.serviceIds.map(id => {
                              const s = services.find(item => item.id === id);
                              return (
                                <span key={id} className="block text-dark truncate max-w-[180px]">
                                  {s?.name || id}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {entry.preferredBarberId === 'ANY' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 font-medium">
                              Any Barber
                            </span>
                          ) : (
                            <span className="font-medium text-dark">
                              {barbers.find(b => b.id === entry.preferredBarberId)?.name || 'Specific'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isLongWait ? 'text-terracotta' : 'text-muted'}`} />
                            <span className={`font-medium ${isLongWait ? 'text-terracotta font-bold' : 'text-dark'}`}>
                              {waitMinutes} mins
                            </span>
                            {isLongWait && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-terracotta text-cream text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                &gt;60m Wait
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            entry.isWalkIn ? 'bg-amber-100 text-amber-900' : 'bg-sage-pale text-sage-deep'
                          }`}>
                            {entry.isWalkIn ? 'Walk-in' : 'Online'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setCancelTargetId(entry.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded text-terracotta hover:bg-terracotta-light transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Walk-In Registration Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-lg w-full p-6 space-y-5 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-muted-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sage" />
                <h3 className="font-serif text-lg font-bold text-dark-heading">Register Walk-In Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="text-muted hover:text-dark p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <div className="p-3 rounded-xl bg-terracotta-light text-terracotta text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleAddWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Shah"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-beige-light border border-muted-border focus:border-sage outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-beige-light border border-muted-border focus:border-sage outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1">
                  Select Services *
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeServices.map(s => {
                    const isSelected = walkInServices.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            if (walkInServices.length > 1) {
                              setWalkInServices(walkInServices.filter(id => id !== s.id));
                            }
                          } else {
                            if (walkInServices.length < 3) {
                              setWalkInServices([...walkInServices, s.id]);
                            }
                          }
                        }}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer select-none ${
                          isSelected ? 'bg-sage-pale border-sage font-semibold' : 'bg-beige-light border-muted-border'
                        }`}
                      >
                        <span>{s.name} ({s.durationMinutes}m)</span>
                        <span>₹{s.priceRupees}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1">
                  Barber Preference
                </label>
                <select
                  value={walkInBarberId}
                  onChange={(e) => setWalkInBarberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-beige-light border border-muted-border focus:border-sage outline-none"
                >
                  <option value="ANY">Any Available Barber (Fastest)</option>
                  {onDutyBarbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (Station {b.stationNumber})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-muted-border hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-sage-deep text-beige-warm hover:bg-sage-dark"
                >
                  Add to End of Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <h3 className="font-serif text-lg font-bold text-dark-heading">Cancel Customer Ticket?</h3>
            <p className="text-xs text-muted">
              Are you sure you want to cancel this entry from the queue? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelTargetId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-muted-border hover:bg-beige"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelQueueEntry(cancelTargetId);
                  setCancelTargetId(null);
                  showToast('Queue entry cancelled.');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta text-cream hover:bg-terracotta-dark"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No-Show Confirmation Modal */}
      {noShowTargetId && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <div className="w-10 h-10 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-dark-heading">Mark Customer as No-Show?</h3>
            <p className="text-xs text-muted leading-relaxed">
              Customer called but did not arrive within 10 minutes. Marking them as no-show will release the barber station immediately. If they arrive later, they must receive a new token at the end of the queue.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNoShowTargetId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-muted-border hover:bg-beige"
              >
                Keep Calling
              </button>
              <button
                type="button"
                onClick={() => {
                  markNoShow(noShowTargetId);
                  setNoShowTargetId(null);
                  showToast('Customer marked as no-show. Barber station released.');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta text-cream hover:bg-terracotta-dark"
              >
                Mark No-Show
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
