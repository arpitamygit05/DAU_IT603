import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  getNextEligibleCustomerForBarber,
  getTotalServiceDuration,
  getTotalServicePrice
} from '../services/queueLogic';
import {
  Scissors,
  CheckCircle2,
  Coffee,
  Play,
  Check
} from 'lucide-react';

export const BarberPage: React.FC = () => {
  const { name: paramName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const {
    barbers,
    entries,
    services,
    setBarberStatus,
    startService,
    completeService,
    callNext
  } = useQueue();

  // Find barber matching paramName (case-insensitive substring or match)
  const currentBarber = useMemo(() => {
    if (!paramName) return barbers[0];
    const match = barbers.find(
      b => b.name.toLowerCase().includes(paramName.toLowerCase())
    );
    return match || barbers[0];
  }, [barbers, paramName]);

  // Current client for this barber
  const activeEntry = useMemo(() => {
    if (!currentBarber || !currentBarber.currentEntryId) return null;
    return entries.find(e => e.id === currentBarber.currentEntryId) || null;
  }, [currentBarber, entries]);

  // Next eligible customer waiting for this barber
  const nextEligible = useMemo(() => {
    if (!currentBarber) return null;
    return getNextEligibleCustomerForBarber(currentBarber.id, entries);
  }, [currentBarber, entries]);

  // Live timer for elapsed service duration
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!currentBarber || !currentBarber.currentServiceStartTime || !activeEntry) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(currentBarber.currentServiceStartTime).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [currentBarber, activeEntry]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentBarber) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-xl font-bold">Barber Not Found</h2>
        <button
          onClick={() => navigate('/barber/Arjun')}
          className="mt-4 px-4 py-2 bg-sage-deep text-beige-warm rounded-lg text-xs font-semibold"
        >
          Go to Arjun Sharma
        </button>
      </div>
    );
  }

  const isBreak = currentBarber.status === 'ON_BREAK';
  const isBusy = currentBarber.status === 'BUSY';
  const isAvail = currentBarber.status === 'AVAILABLE';

  const totalServiceDuration = activeEntry
    ? getTotalServiceDuration(activeEntry.serviceIds, services)
    : 0;
  const totalServicePrice = activeEntry
    ? getTotalServicePrice(activeEntry.serviceIds, services)
    : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      
      {/* Barber Selector Pill Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-muted-border">
        <div>
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
            Barber Station Terminal
          </span>
          <h1 className="font-serif text-2xl font-bold text-dark-heading">
            {currentBarber.name}
          </h1>
        </div>

        {/* Quick Barber Switcher */}
        <select
          value={currentBarber.name.split(' ')[0]}
          onChange={(e) => navigate(`/barber/${e.target.value}`)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-beige border border-muted-border text-dark outline-none cursor-pointer"
        >
          {barbers.map(b => (
            <option key={b.id} value={b.name.split(' ')[0]}>
              {b.name} (Station {b.stationNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Break / Availability Status Toggle */}
      <div className="p-4 rounded-2xl bg-cream border border-muted-border flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isAvail ? 'bg-emerald-600' : isBusy ? 'bg-amber-500' : 'bg-gray-400'}`} />
          <div>
            <span className="text-xs uppercase font-semibold text-muted tracking-wider block">Status</span>
            <span className="font-semibold text-dark text-sm">
              {isAvail ? 'Available for Next Client' : isBusy ? 'Client in Station' : 'Taking a Break'}
            </span>
          </div>
        </div>

        {!isBusy && (
          <button
            type="button"
            onClick={() => setBarberStatus(currentBarber.id, isBreak ? 'AVAILABLE' : 'ON_BREAK')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isBreak
                ? 'bg-sage-deep text-beige-warm hover:bg-sage-dark'
                : 'bg-beige border border-muted-border text-dark hover:bg-muted-border/40'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{isBreak ? 'Resume Duty' : 'Go On Break'}</span>
          </button>
        )}
      </div>

      {/* Main Working Card: Current Customer in Chair */}
      <div className="bg-cream rounded-3xl border border-muted-border p-6 shadow-refined space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-muted-border">
          <span className="text-xs uppercase tracking-widest text-muted font-bold">Current Chair</span>
          <span className="text-xs font-medium text-sage-deep bg-sage-pale px-2.5 py-1 rounded-full">
            Station {currentBarber.stationNumber}
          </span>
        </div>

        {activeEntry ? (
          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-muted block">Client Name</span>
                <h2 className="font-serif text-2xl font-bold text-dark-heading mt-0.5">
                  {activeEntry.customerName}
                </h2>
                <p className="text-xs text-muted">+91 {activeEntry.phone}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted block">Ticket</span>
                <span className="font-serif text-3xl font-bold text-sage-deep">
                  {activeEntry.token}
                </span>
              </div>
            </div>

            {/* Service Timer Display */}
            <div className="p-5 rounded-2xl bg-beige-light border border-muted-border text-center space-y-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                {activeEntry.status === 'CALLED' ? 'Client Called · Waiting for Chair' : 'Active Service Duration'}
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-dark py-1">
                {formatTimer(elapsedSeconds)}
              </div>
              <p className="text-xs text-muted">
                Est. Duration: {totalServiceDuration} mins · ₹{totalServicePrice}
              </p>
            </div>

            {/* Services Checklist */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-semibold text-muted tracking-wider block">
                Services to Deliver:
              </span>
              <div className="space-y-1.5">
                {activeEntry.serviceIds.map(id => {
                  const s = services.find(item => item.id === id);
                  return (
                    <div
                      key={id}
                      className="p-3 rounded-xl bg-beige/60 border border-muted-border flex items-center justify-between text-xs font-medium text-dark"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{s?.name || id}</span>
                      </div>
                      <span className="text-muted">{s?.durationMinutes}m</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2">
              {activeEntry.status === 'CALLED' ? (
                <button
                  type="button"
                  onClick={() => startService(activeEntry.id, currentBarber.id)}
                  className="w-full py-4 px-6 rounded-2xl bg-sage-deep hover:bg-sage-dark text-beige-warm font-semibold text-base shadow-refined transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Client Seated · Start Service</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => completeService(activeEntry.id, currentBarber.id)}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-cream font-semibold text-base shadow-refined transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Service Completed · Done</span>
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-beige text-muted mx-auto flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-dark-heading">
                Chair is Currently Empty
              </h3>
              <p className="text-xs text-muted max-w-xs mx-auto mt-1">
                {isBreak
                  ? 'You are on break. Resume duty to seat the next client.'
                  : 'Ready to call the next waiting client in queue.'}
              </p>
            </div>

            {!isBreak && nextEligible && (
              <button
                type="button"
                onClick={() => callNext(currentBarber.id)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm text-sm font-semibold shadow-subtle active:scale-[0.99] transition-all"
              >
                <Scissors className="w-4 h-4" />
                <span>Call Next: {nextEligible.token} ({nextEligible.customerName})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Next Up Preview */}
      <div className="p-5 rounded-2xl bg-cream border border-muted-border space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted block">
          Next In Line for You
        </span>

        {nextEligible ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-beige-light border border-muted-border">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-base text-dark px-2.5 py-1 rounded bg-sage-pale text-sage-deep">
                {nextEligible.token}
              </span>
              <div>
                <p className="font-semibold text-dark text-xs sm:text-sm">{nextEligible.customerName}</p>
                <p className="text-[11px] text-muted">
                  {nextEligible.preferredBarberId === 'ANY' ? 'Prefers Any Barber' : 'Chose You Exclusively'}
                </p>
              </div>
            </div>

            <span className="text-xs text-muted font-medium">
              Waiting ~{Math.floor((Date.now() - new Date(nextEligible.joinedAt).getTime()) / 60000)}m
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted py-2 text-center">
            No customers waiting for your station.
          </div>
        )}
      </div>

    </div>
  );
};
