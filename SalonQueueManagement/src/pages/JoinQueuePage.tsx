import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  checkOnlineQueueAvailability,
  estimateWaitForNewJoin,
  getTotalServiceDuration,
  getTotalServicePrice
} from '../services/queueLogic';
import {
  Clock,
  User,
  Phone,
  Check,
  AlertCircle,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export const JoinQueuePage: React.FC = () => {
  const { settings, services, barbers, entries, joinQueue } = useQueue();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['svc-1']);
  const [preferredBarberId, setPreferredBarberId] = useState<string>('ANY');
  const [error, setError] = useState<string | null>(null);
  const [existingActiveSpot, setExistingActiveSpot] = useState<{ id: string; token: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeServices = useMemo(() => services.filter(s => s.active), [services]);
  const onDutyBarbers = useMemo(() => barbers.filter(b => b.onDuty), [barbers]);
  const queueStatus = checkOnlineQueueAvailability(settings);

  // Dynamic calculations as selections change
  const totalDuration = useMemo(
    () => getTotalServiceDuration(selectedServices, services),
    [selectedServices, services]
  );

  const totalPrice = useMemo(
    () => getTotalServicePrice(selectedServices, services),
    [selectedServices, services]
  );

  const estimatedWait = useMemo(
    () => estimateWaitForNewJoin(preferredBarberId, entries, barbers, services),
    [preferredBarberId, entries, barbers, services]
  );

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length === 1) {
        setError('Please select at least one service.');
        return;
      }
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
      setError(null);
    } else {
      if (selectedServices.length >= 3) {
        setError('You may select a maximum of 3 services per visit.');
        return;
      }
      setSelectedServices([...selectedServices, serviceId]);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingActiveSpot(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit Indian phone number.');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least 1 service.');
      return;
    }

    setIsSubmitting(true);
    const result = joinQueue(name, cleanPhone, selectedServices, preferredBarberId);
    setIsSubmitting(false);

    if (result.success && result.entry) {
      navigate(`/status/${result.entry.id}`);
    } else if (result.existingEntry) {
      setExistingActiveSpot({
        id: result.existingEntry.id,
        token: result.existingEntry.token
      });
      setError(result.error || 'You already have an active spot in the queue.');
    } else {
      setError(result.error || 'Failed to join the queue. Please try again.');
    }
  };

  // If online queue is closed
  if (!queueStatus.isOpen) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-cream rounded-2xl border border-muted-border p-8 text-center space-y-4 shadow-refined">
          <div className="w-12 h-12 rounded-full bg-terracotta-light text-terracotta mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-dark-heading">Online Queue Closed</h1>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            {queueStatus.reason}
          </p>
          <div className="p-4 rounded-xl bg-beige-light border border-muted-border max-w-sm mx-auto text-xs text-dark text-left space-y-1">
            <p><strong>Salon Closing Time:</strong> {queueStatus.closingTime}</p>
            <p><strong>Online Cutoff:</strong> {queueStatus.cutoffTime}</p>
            <p className="text-muted mt-1">Walk-in visitors are still welcome in person at the reception desk!</p>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl border border-muted-border text-sm font-semibold hover:bg-beige transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/reception"
              className="px-6 py-2.5 rounded-xl bg-sage-deep text-beige-warm text-sm font-semibold hover:bg-sage-dark transition-colors"
            >
              Reception Desk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-sage-deep font-semibold uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Step into the Salon Experience</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-dark-heading">
          Join Live Salon Queue
        </h1>
        <p className="text-sm text-muted mt-1">
          Fill in your details, choose your services, and receive your digital ticket token immediately.
        </p>
      </div>

      {/* Duplicate active spot warning banner if exists */}
      {existingActiveSpot && (
        <div className="mb-6 p-4 rounded-xl bg-terracotta-light border border-terracotta/40 text-terracotta-dark flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-semibold">Active Token Already Assigned</strong>
              <p className="text-xs mt-0.5">
                This phone number already holds Token <strong>{existingActiveSpot.token}</strong> in our queue. Each customer may hold one active place at a time.
              </p>
            </div>
          </div>
          <Link
            to={`/status/${existingActiveSpot.id}`}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-terracotta text-cream hover:bg-terracotta-dark transition-colors whitespace-nowrap shadow-subtle"
          >
            Open My Spot
          </Link>
        </div>
      )}

      {error && !existingActiveSpot && (
        <div className="mb-6 p-4 rounded-xl bg-terracotta-light border border-terracotta/40 text-terracotta-dark text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Inputs */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Customer Info */}
          <div className="p-6 rounded-2xl bg-cream border border-muted-border shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-muted-border pb-3">
              <span className="w-6 h-6 rounded-full bg-sage-deep text-beige-warm text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-serif text-lg font-bold text-dark-heading">Your Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-beige-light border border-muted-border focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm text-dark transition-all"
                  />
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark uppercase tracking-wider mb-1.5">
                  Mobile Number (10 digits) <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 text-muted text-xs font-semibold pr-2 border-r border-muted-border">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 py-3 rounded-xl bg-beige-light border border-muted-border focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm text-dark transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  We use your phone number exclusively to verify your queue ticket.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Select Services */}
          <div className="p-6 rounded-2xl bg-cream border border-muted-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-muted-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sage-deep text-beige-warm text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="font-serif text-lg font-bold text-dark-heading">Select Services (Up to 3)</h2>
              </div>
              <span className="text-xs text-muted font-medium">
                {selectedServices.length} of 3 selected
              </span>
            </div>

            <div className="space-y-2.5">
              {activeServices.map((service) => {
                const isSelected = selectedServices.includes(service.id);

                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') handleServiceToggle(service.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      isSelected
                        ? 'bg-sage-pale/60 border-sage shadow-subtle'
                        : 'bg-beige-light/70 border-muted-border/80 hover:bg-beige-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-sage-deep text-beige-warm' : 'border border-muted-border bg-cream'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-sage-dark' : 'text-dark'}`}>
                          {service.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                          <span>{service.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sage" />
                            {service.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-base font-bold text-dark block">
                        ₹{service.priceRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Barber Preference */}
          <div className="p-6 rounded-2xl bg-cream border border-muted-border shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-muted-border pb-3">
              <span className="w-6 h-6 rounded-full bg-sage-deep text-beige-warm text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="font-serif text-lg font-bold text-dark-heading">Barber Preference</h2>
            </div>

            <div className="space-y-2">
              {/* Option 1: Any Barber */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  preferredBarberId === 'ANY'
                    ? 'bg-sage-pale/60 border-sage shadow-subtle'
                    : 'bg-beige-light/70 border-muted-border/80 hover:bg-beige-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="barber"
                    value="ANY"
                    checked={preferredBarberId === 'ANY'}
                    onChange={() => setPreferredBarberId('ANY')}
                    className="w-4 h-4 text-sage-deep accent-sage-deep focus:ring-sage"
                  />
                  <div>
                    <span className="text-sm font-semibold text-dark block">
                      Any Available Barber (Fastest)
                    </span>
                    <span className="text-xs text-muted">
                      You will be called by whichever skilled station becomes free first.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Recommended
                </span>
              </label>

              {/* Specific Barbers */}
              {onDutyBarbers.map((barber) => {
                const isSelected = preferredBarberId === barber.id;
                const isBreak = barber.status === 'ON_BREAK';

                return (
                  <label
                    key={barber.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sage-pale/60 border-sage shadow-subtle'
                        : 'bg-beige-light/70 border-muted-border/80 hover:bg-beige-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="barber"
                        value={barber.id}
                        checked={isSelected}
                        onChange={() => setPreferredBarberId(barber.id)}
                        className="w-4 h-4 text-sage-deep accent-sage-deep focus:ring-sage"
                      />
                      <div>
                        <span className="text-sm font-semibold text-dark block">
                          {barber.name}
                        </span>
                        <span className="text-xs text-muted">
                          {barber.role} (Station {barber.stationNumber})
                        </span>
                      </div>
                    </div>

                    <div>
                      {isBreak ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          On Break
                        </span>
                      ) : barber.status === 'BUSY' ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          In Chair
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Available
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {preferredBarberId !== 'ANY' && barbers.find(b => b.id === preferredBarberId)?.status === 'ON_BREAK' && (
              <div className="p-3 rounded-xl bg-beige border border-muted-border text-xs text-dark flex items-start gap-2">
                <Info className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Your chosen barber is currently taking a scheduled break. You will hold your place exclusively for them, but your wait time may be longer.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Summary & Confirmation */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-cream rounded-2xl border border-muted-border p-6 shadow-refined space-y-6">
              <h2 className="font-serif text-xl font-bold text-dark-heading pb-3 border-b border-muted-border">
                Queue Ticket Summary
              </h2>

              {/* Dynamic Estimates */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-beige-light border border-muted-border/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">Estimated Wait:</span>
                    <span className="font-serif text-lg font-bold text-sage-deep">
                      ~{estimatedWait} mins
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">Estimated Service Time:</span>
                    <span className="font-semibold text-dark">
                      {totalDuration} mins
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-muted-border/60">
                    <span className="text-muted font-medium">Barber Preference:</span>
                    <span className="font-semibold text-dark truncate max-w-[160px]">
                      {preferredBarberId === 'ANY'
                        ? 'Any Available Barber'
                        : onDutyBarbers.find(b => b.id === preferredBarberId)?.name || 'Selected'}
                    </span>
                  </div>
                </div>

                {/* Selected Services Pill list */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                    Selected Services ({selectedServices.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedServices.map(id => {
                      const svc = services.find(s => s.id === id);
                      if (!svc) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-xs py-1 text-dark">
                          <span className="truncate pr-2">{svc.name}</span>
                          <span className="font-semibold text-muted">₹{svc.priceRupees}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Price */}
                <div className="pt-3 border-t border-muted-border flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted">Total Price</span>
                  <div className="text-right">
                    <span className="font-serif text-3xl font-bold text-dark">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-muted font-medium">Taxes included (Pay at Salon)</span>
                  </div>
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm font-semibold text-base shadow-refined hover:shadow-elevated transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Securing Spot...' : 'Confirm & Get Token'}</span>
                <ArrowRight className="w-5 h-5 text-beige-warm" />
              </button>

              <div className="text-[11px] text-muted text-center leading-normal">
                No upfront payment required. You will receive an immediate live ticket with real-time alerts.
              </div>

            </div>

            {/* Salon Guarantee Notice */}
            <div className="p-4 rounded-xl bg-beige/60 border border-muted-border text-xs text-muted flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <span>
                <strong>First-Come, First-Served:</strong> Tokens are served strictly in order of arrival, respecting your barber choice.
              </span>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
