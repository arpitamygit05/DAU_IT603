import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  calculateEstimatedWaitTime,
  getQueuePosition,
  getTotalServiceDuration,
  getTotalServicePrice
} from '../services/queueLogic';
import {
  Scissors,
  AlertCircle,
  ArrowLeft,
  Share2,
  BellRing,
  Coffee,
  Check
} from 'lucide-react';

export const StatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, barbers, services, cancelQueueEntry } = useQueue();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find this specific entry
  const entry = useMemo(() => entries.find(e => e.id === id), [entries, id]);

  const assignedBarber = useMemo(() => {
    if (!entry || !entry.assignedBarberId) return null;
    return barbers.find(b => b.id === entry.assignedBarberId);
  }, [entry, barbers]);

  const preferredBarber = useMemo(() => {
    if (!entry || entry.preferredBarberId === 'ANY') return null;
    return barbers.find(b => b.id === entry.preferredBarberId);
  }, [entry, barbers]);

  const position = useMemo(() => {
    if (!entry) return 0;
    return getQueuePosition(entry, entries);
  }, [entry, entries]);

  const estimatedWait = useMemo(() => {
    if (!entry) return 0;
    return calculateEstimatedWaitTime(entry, entries, barbers, services);
  }, [entry, entries, barbers, services]);

  const totalDuration = useMemo(() => {
    if (!entry) return 0;
    return getTotalServiceDuration(entry.serviceIds, services);
  }, [entry, services]);

  const totalPrice = useMemo(() => {
    if (!entry) return 0;
    return getTotalServicePrice(entry.serviceIds, services);
  }, [entry, services]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCancelConfirm = () => {
    if (entry) {
      cancelQueueEntry(entry.id);
      setShowCancelModal(false);
    }
  };

  if (!entry) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-beige text-muted mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-dark-heading">Ticket Not Found</h1>
        <p className="text-sm text-muted">
          We could not find an active queue ticket matching this ID. You may join the queue anew or search by phone.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl border border-muted-border text-sm font-semibold hover:bg-beige transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/join"
            className="px-5 py-2.5 rounded-xl bg-sage-deep text-beige-warm text-sm font-semibold hover:bg-sage-dark transition-colors"
          >
            Join Queue
          </Link>
        </div>
      </div>
    );
  }

  const isWaiting = entry.status === 'WAITING';
  const isCalled = entry.status === 'CALLED';
  const isInChair = entry.status === 'IN_CHAIR';
  const isDone = entry.status === 'DONE';
  const isCancelled = entry.status === 'CANCELLED';
  const isNoShow = entry.status === 'NO_SHOW';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salon Home</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-beige/60 hover:bg-beige text-xs font-semibold text-dark border border-muted-border transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-muted" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share / Bookmark'}</span>
        </button>
      </div>

      {/* Main Status Container */}
      <div className="space-y-6">

        {/* Dynamic Critical Alert Banners */}
        {/* At 2nd Position */}
        {isWaiting && position === 2 && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-4 shadow-refined animate-bounce-subtle">
            <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 flex-shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">Start coming to the salon!</h2>
              <p className="text-xs sm:text-sm mt-0.5 text-amber-900/90 leading-relaxed">
                You are currently <strong>#2 in line</strong>. The customer ahead is in the chair, so please head to the salon now to ensure you don’t miss your call.
              </p>
            </div>
          </div>
        )}

        {/* When CALLED */}
        {isCalled && (
          <div className="p-6 rounded-2xl bg-terracotta text-cream border-2 border-terracotta-dark shadow-elevated animate-call-pulse">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cream text-terracotta flex-shrink-0 shadow-subtle">
                <Scissors className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-bold text-cream/90 bg-terracotta-dark/40 px-2.5 py-0.5 rounded-full inline-block">
                  It's Your Turn Now!
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                  Please Proceed to Station {assignedBarber?.stationNumber || 1}
                </h2>
                <p className="text-xs sm:text-sm text-cream/95">
                  Barber <strong>{assignedBarber?.name || 'Your Stylist'}</strong> is ready for your appointment at Station {assignedBarber?.stationNumber || 1}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Ticket Card */}
        <div className="bg-cream rounded-3xl border border-muted-border p-6 sm:p-10 shadow-refined space-y-8 relative overflow-hidden">
          
          {/* Subtle watermark */}
          <div className="absolute right-4 -bottom-6 select-none opacity-5 pointer-events-none font-serif text-9xl font-bold text-sage-deep">
            {entry.token}
          </div>

          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-muted-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted font-semibold">Live Ticket</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs text-sage font-medium">Auto-sync active</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark-heading mt-1">
                {entry.customerName}
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Phone: +91 {entry.phone.slice(0, 5)} {entry.phone.slice(5)}
              </p>
            </div>

            {/* Token Badge */}
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted block uppercase tracking-wider font-semibold">Token Number</span>
              <div className="inline-block px-5 py-2 rounded-2xl bg-sage-deep text-beige-warm font-serif text-3xl sm:text-4xl font-bold tracking-wider shadow-subtle mt-1">
                {entry.token}
              </div>
            </div>
          </div>

          {/* Status Progression Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted px-1">
              <span className={isWaiting || isCalled || isInChair || isDone ? 'text-sage-deep font-bold' : ''}>1. Waiting</span>
              <span className={isCalled || isInChair || isDone ? 'text-sage-deep font-bold' : ''}>2. Called</span>
              <span className={isInChair || isDone ? 'text-sage-deep font-bold' : ''}>3. In Chair</span>
              <span className={isDone ? 'text-sage-deep font-bold' : ''}>4. Complete</span>
            </div>

            <div className="h-3 rounded-full bg-beige border border-muted-border/60 overflow-hidden flex">
              <div
                className={`transition-all duration-500 ${
                  isWaiting
                    ? 'w-1/4 bg-sage'
                    : isCalled
                    ? 'w-2/4 bg-terracotta'
                    : isInChair
                    ? 'w-3/4 bg-amber-500'
                    : isDone
                    ? 'w-full bg-emerald-600'
                    : 'w-0'
                }`}
              />
            </div>
          </div>

          {/* Current Position / Live Status Content */}
          <div className="p-6 rounded-2xl bg-beige-light border border-muted-border/80">
            {isWaiting && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted font-semibold block">Queue Position</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-dark-heading">
                      #{position}
                    </span>
                    <span className="text-xs text-muted font-medium">in queue</span>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    {position === 1
                      ? 'You are next in line! Stay ready.'
                      : position === 2
                      ? 'You are almost up. Please head to salon.'
                      : `${position - 1} clients ahead of you.`}
                  </p>
                </div>

                <div className="sm:border-l sm:border-muted-border sm:pl-6">
                  <span className="text-xs uppercase tracking-wider text-muted font-semibold block">Estimated Wait Time</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-sage-deep">
                      ~{estimatedWait}
                    </span>
                    <span className="text-xs text-muted font-medium">minutes</span>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Recalculated dynamically based on real station progress.
                  </p>
                </div>
              </div>
            )}

            {isCalled && (
              <div className="text-center py-4 space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-light text-terracotta-dark border border-terracotta/30">
                  Status: Called to Chair
                </span>
                <p className="text-sm text-dark font-medium pt-1">
                  Assigned Barber: <strong>{assignedBarber?.name}</strong> (Station {assignedBarber?.stationNumber})
                </p>
                <p className="text-xs text-muted">
                  Please introduce yourself to reception or walk directly to your designated station.
                </p>
              </div>
            )}

            {isInChair && (
              <div className="text-center py-4 space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  Status: Currently In Service
                </span>
                <p className="text-sm text-dark font-medium pt-1">
                  Enjoy your grooming session with <strong>{assignedBarber?.name}</strong>!
                </p>
              </div>
            )}

            {isDone && (
              <div className="text-center py-4 space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: Completed
                </span>
                <p className="font-serif text-lg font-bold text-dark">Thank You for Visiting The Style Atelier!</p>
                <p className="text-xs text-muted">
                  We hope you had an exceptional grooming experience today.
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="text-center py-4 space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                  Status: Cancelled
                </span>
                <p className="text-xs text-muted">
                  This queue ticket was cancelled. You may join again anytime online or at reception.
                </p>
              </div>
            )}

            {isNoShow && (
              <div className="text-center py-4 space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-light text-terracotta-dark">
                  Status: Marked No-Show
                </span>
                <p className="text-xs text-muted">
                  You were called but not present. To rejoin, please obtain a fresh token at the reception desk.
                </p>
              </div>
            )}
          </div>

          {/* Barber & Break Notice */}
          {preferredBarber && preferredBarber.status === 'ON_BREAK' && isWaiting && (
            <div className="p-4 rounded-xl bg-beige border border-muted-border flex items-start gap-3 text-xs text-dark">
              <Coffee className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <div>
                <strong>Barber Update:</strong> Your chosen barber, <strong>{preferredBarber.name}</strong>, is on a scheduled break.
                Your ticket remains reserved exclusively for them and will be called immediately upon their return.
              </div>
            </div>
          )}

          {/* Ticket Details Grid */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-dark-heading pb-2 border-b border-muted-border">
              Booking Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted block font-medium">Selected Services ({entry.serviceIds.length}):</span>
                <ul className="mt-1 space-y-1 text-dark font-medium">
                  {entry.serviceIds.map(id => {
                    const svc = services.find(s => s.id === id);
                    return (
                      <li key={id} className="flex justify-between py-0.5">
                        <span>{svc?.name || id}</span>
                        <span className="text-muted">₹{svc?.priceRupees}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-muted block font-medium">Barber Preference:</span>
                  <span className="font-semibold text-dark">
                    {entry.preferredBarberId === 'ANY'
                      ? 'Any Available Barber'
                      : barbers.find(b => b.id === entry.preferredBarberId)?.name || 'Specific Barber'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-medium">Estimated Duration:</span>
                  <span className="font-semibold text-dark">{totalDuration} minutes</span>
                </div>
                <div>
                  <span className="text-muted block font-medium">Total Bill:</span>
                  <span className="font-serif text-base font-bold text-dark">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Action */}
          {isWaiting && (
            <div className="pt-4 border-t border-muted-border flex justify-between items-center">
              <span className="text-xs text-muted">Change of plans?</span>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-terracotta border border-terracotta/40 hover:bg-terracotta-light transition-colors"
              >
                Cancel My Spot
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Cancel */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl border border-muted-border max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <div className="w-10 h-10 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-dark-heading">Cancel Your Spot?</h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to surrender Token <strong>{entry.token}</strong>? You will lose your position in line and need to take a new token to rejoin.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-muted-border hover:bg-beige transition-colors"
              >
                Keep My Spot
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta text-cream hover:bg-terracotta-dark transition-colors"
              >
                Yes, Cancel Spot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
