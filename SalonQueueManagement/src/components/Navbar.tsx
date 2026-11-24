import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { checkOnlineQueueAvailability, getWaitingEntries } from '../services/queueLogic';
import { Clock, Users, Scissors, Tv, Shield, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { settings, entries, barbers } = useQueue();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const waitingEntries = getWaitingEntries(entries);
  const queueStatus = checkOnlineQueueAvailability(settings);
  const onDutyCount = barbers.filter(b => b.onDuty).length;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/join', label: 'Join Queue', highlight: true },
    { to: '/reception', label: 'Reception', icon: Scissors },
    { to: '/display', label: 'Waiting Display', icon: Tv },
    { to: '/admin', label: 'Admin', icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-muted-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Wordmark & Typographic Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sage rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-sage-deep flex items-center justify-center text-beige-warm shadow-subtle group-hover:bg-sage-dark transition-colors">
              <span className="font-serif font-bold text-xl tracking-wider">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-dark-heading uppercase">
                  The Style Atelier
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-muted font-sans font-medium">
                Salon & Grooming Lounge (Demo)
              </p>
            </div>
          </Link>

          {/* Real-time Status Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 py-1.5 px-3.5 rounded-full bg-beige/60 border border-muted-border/60 text-xs text-dark">
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${queueStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-terracotta'}`} />
              <span>{queueStatus.isOpen ? 'Queue Open' : 'Queue Closed'}</span>
            </div>
            <span className="text-muted-border">|</span>
            <div className="flex items-center gap-1 text-muted">
              <Users className="w-3.5 h-3.5 text-sage" />
              <span><strong className="text-dark font-semibold">{waitingEntries.length}</strong> in line</span>
            </div>
            <span className="text-muted-border">|</span>
            <div className="flex items-center gap-1 text-muted">
              <Clock className="w-3.5 h-3.5 text-sage" />
              <span>Closes {settings.closeTime}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              if (link.highlight) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sage-deep hover:bg-sage-dark text-beige-warm text-sm font-medium transition-all shadow-subtle hover:shadow-refined active:scale-[0.98]"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                );
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-sage-pale/70 text-sage-deep font-semibold'
                      : 'text-dark hover:text-sage-deep hover:bg-beige/50'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-muted" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <Link
              to="/join"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sage-deep text-beige-warm shadow-subtle"
            >
              Join Queue
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-dark hover:bg-beige/60 focus:outline-none focus:ring-2 focus:ring-sage"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-muted-border bg-cream px-4 pt-2 pb-6 space-y-2 shadow-elevated">
          {/* Status badge in mobile */}
          <div className="p-3 mb-3 rounded-lg bg-beige/70 border border-muted-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${queueStatus.isOpen ? 'bg-emerald-600' : 'bg-terracotta'}`} />
              <span className="font-medium text-dark">{queueStatus.isOpen ? 'Live Queue Open' : 'Queue Paused'}</span>
            </div>
            <span className="text-muted"><strong>{waitingEntries.length}</strong> Waiting · <strong>{onDutyCount}</strong> Barbers</span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-sage-pale text-sage-deep font-semibold'
                    : 'text-dark hover:bg-beige/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon && <link.icon className="w-5 h-5 text-muted" />}
                  <span>{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            ))}
          </div>

          {/* Quick Barber links in mobile */}
          <div className="pt-3 border-t border-muted-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">Barber View Quick Switch</p>
            <div className="grid grid-cols-3 gap-2">
              {barbers.filter(b => b.onDuty).map(b => (
                <Link
                  key={b.id}
                  to={`/barber/${encodeURIComponent(b.name.split(' ')[0])}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-2 text-center text-xs font-medium rounded-lg bg-beige/60 hover:bg-sage-pale border border-muted-border text-dark truncate"
                >
                  {b.name.split(' ')[0]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
