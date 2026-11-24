import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  checkOnlineQueueAvailability,
  getWaitingEntries,
  estimateWaitForNewJoin
} from '../services/queueLogic';
import {
  Clock,
  Users,
  Scissors,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, services, barbers, entries } = useQueue();
  const navigate = useNavigate();
  const [tokenLookup, setTokenLookup] = useState('');
  const [lookupError, setLookupError] = useState('');

  const waitingList = getWaitingEntries(entries);
  const queueStatus = checkOnlineQueueAvailability(settings);
  const onDutyBarbers = barbers.filter(b => b.onDuty);
  const approxWait = estimateWaitForNewJoin('ANY', entries, barbers, services);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const clean = tokenLookup.trim().toUpperCase();
    if (!clean) return;

    // Search by Token (e.g. S-14) or Phone number
    const found = entries.find(
      entry => entry.token.toUpperCase() === clean || entry.phone === clean
    );

    if (found) {
      navigate(`/status/${found.id}`);
    } else {
      setLookupError('No queue record found for this token or phone number.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-beige-light border-b border-muted-border/70 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-pale border border-sage/20 text-xs font-semibold text-sage-deep">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Live Digital Queue Active</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-dark-heading leading-[1.15]">
                  Refined Grooming, <br />
                  <span className="italic font-normal text-sage-deep">Without the Waiting Room.</span>
                </h1>
                <p className="text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                  Join our live queue from anywhere. Track your place in real time, arrive just as your chair is ready, and experience uncompromised salon care.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {queueStatus.isOpen ? (
                  <Link
                    to="/join"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-sage-deep hover:bg-sage-dark text-beige-warm font-semibold text-base shadow-refined hover:shadow-elevated transition-all active:scale-[0.99]"
                  >
                    <span>Join the Queue Online</span>
                    <ArrowRight className="w-5 h-5 text-beige-warm" />
                  </Link>
                ) : (
                  <div className="p-4 rounded-xl bg-terracotta-light border border-terracotta/30 text-terracotta-dark text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Online Joining Currently Closed</strong>
                      <p className="text-xs mt-0.5">{queueStatus.reason}</p>
                    </div>
                  </div>
                )}

                {/* Token Tracker Input */}
                <form onSubmit={handleLookup} className="flex-1 max-w-sm">
                  <div className="relative">
                    <input
                      type="text"
                      value={tokenLookup}
                      onChange={(e) => {
                        setTokenLookup(e.target.value);
                        setLookupError('');
                      }}
                      placeholder="Enter Token (e.g. S-14) or Phone"
                      className="w-full pl-10 pr-20 py-3.5 text-sm rounded-xl bg-cream border border-muted-border focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-dark transition-all shadow-subtle"
                    />
                    <Search className="w-4 h-4 text-muted absolute left-3.5 top-4" />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-beige hover:bg-sage-pale text-xs font-semibold text-dark border border-muted-border/60 transition-colors"
                    >
                      Track
                    </button>
                  </div>
                  {lookupError && (
                    <p className="text-xs text-terracotta font-medium mt-1.5 px-1">{lookupError}</p>
                  )}
                </form>
              </div>

              {/* Real-time Status Micro-bar */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sage-pale text-sage-deep">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Today's Hours: <strong className="text-dark font-medium">{settings.openTime} – {settings.closeTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sage-pale text-sage-deep">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span>Online Cutoff: <strong className="text-dark font-medium">{queueStatus.cutoffTime}</strong></span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Queue Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="bg-cream rounded-2xl border border-muted-border p-6 sm:p-8 shadow-refined space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-muted-border">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted font-semibold">Live Salon Status</span>
                    <h2 className="font-serif text-2xl font-bold text-dark-heading mt-0.5">Queue Overview</h2>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sage-pale text-sage-deep border border-sage/20">
                      Real-time
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-beige-light border border-muted-border/60">
                    <div className="flex items-center gap-2 text-muted text-xs font-medium">
                      <Users className="w-4 h-4 text-sage" />
                      <span>In Line</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-dark">
                        {waitingList.length}
                      </span>
                      <span className="text-xs text-muted font-medium">clients</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-beige-light border border-muted-border/60">
                    <div className="flex items-center gap-2 text-muted text-xs font-medium">
                      <Clock className="w-4 h-4 text-sage" />
                      <span>Approx. Wait</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-dark">
                        ~{approxWait}
                      </span>
                      <span className="text-xs text-muted font-medium">mins</span>
                    </div>
                  </div>
                </div>

                {/* Active Barbers Strip */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold uppercase tracking-wider">Barbers On Duty ({onDutyBarbers.length})</span>
                    <span>Station Status</span>
                  </div>

                  <div className="space-y-2">
                    {onDutyBarbers.map((barber) => {
                      const isBusy = barber.status === 'BUSY';
                      const isBreak = barber.status === 'ON_BREAK';
                      const isAvail = barber.status === 'AVAILABLE';

                      return (
                        <div
                          key={barber.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-beige/40 border border-muted-border/60 text-sm hover:bg-beige/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sage-pale border border-sage/30 flex items-center justify-center text-xs font-serif font-bold text-sage-deep">
                              {barber.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-dark text-xs sm:text-sm">{barber.name}</p>
                              <p className="text-[11px] text-muted">{barber.role}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAvail && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Available</span>
                              </span>
                            )}
                            {isBusy && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                                <Scissors className="w-3.5 h-3.5" />
                                <span>In Chair</span>
                              </span>
                            )}
                            {isBreak && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-200 text-gray-800 border border-gray-300">
                                <Coffee className="w-3.5 h-3.5" />
                                <span>On Break</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Link */}
                <Link
                  to="/display"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-muted-border hover:bg-beige text-xs font-semibold text-dark transition-colors"
                >
                  <span>Open Waiting Area TV View</span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </Link>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Menu Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-widest text-sage-deep font-semibold">Our Offerings</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark-heading">
              Curated Salon Services
            </h2>
            <p className="text-sm text-muted">
              Select your required grooming services when joining the queue. Indian Rupee pricing and transparent durations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.active).map((service) => (
              <div
                key={service.id}
                className="group p-6 rounded-2xl bg-beige-light border border-muted-border/80 hover:border-sage/40 hover:shadow-refined transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sage-pale text-sage-deep border border-sage/20">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="w-3.5 h-3.5 text-sage" />
                      <span>{service.durationMinutes} mins</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-dark-heading group-hover:text-sage-deep transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">
                    {service.description || 'Premium grooming with master consultation.'}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-muted-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted uppercase tracking-wider block">Price</span>
                    <span className="font-serif text-xl font-bold text-dark">
                      ₹{service.priceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    to="/join"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cream hover:bg-sage-pale border border-muted-border text-xs font-semibold text-dark hover:text-sage-deep transition-colors"
                  >
                    <span>Book Spot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Staff Navigation Callout */}
          <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-sage-pale/60 border border-sage/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl font-bold text-sage-dark">
                  Staff Portals & Waiting Room Display
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-dark/75 max-w-xl">
                Operating a receptionist tablet, barber station, or TV monitor? Switch to your dedicated role view instantly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/reception"
                className="px-4 py-2.5 rounded-xl bg-sage-deep text-beige-warm text-xs font-semibold shadow-subtle hover:bg-sage-dark transition-colors"
              >
                Reception Desk
              </Link>
              <Link
                to="/barber/Arjun"
                className="px-4 py-2.5 rounded-xl bg-cream border border-muted-border hover:bg-beige text-dark text-xs font-semibold shadow-subtle transition-colors"
              >
                Barber View
              </Link>
              <Link
                to="/display"
                className="px-4 py-2.5 rounded-xl bg-cream border border-muted-border hover:bg-beige text-dark text-xs font-semibold shadow-subtle transition-colors"
              >
                TV Display
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
