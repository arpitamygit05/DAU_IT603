import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { RotateCcw, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetDemoData, settings } = useQueue();

  const handleReset = () => {
    if (window.confirm('Reset all queue data, barbers, and services to initial demo state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <footer className="bg-sage-dark text-beige-warm border-t border-sage-deep/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-beige-warm text-sage-deep flex items-center justify-center font-serif font-bold text-lg">
                A
              </div>
              <span className="font-serif font-bold text-lg tracking-wider text-beige-warm uppercase">
                {settings.salonName}
              </span>
            </div>
            <p className="text-xs text-beige-warm/75 leading-relaxed font-sans">
              {settings.tagline}. Calm, deliberate salon craft with seamless live queuing.
            </p>
            <div className="pt-2 text-xs text-beige-warm/60">
              © {new Date().getFullYear()} Aura Grooming. Demo System.
            </div>
          </div>

          {/* Salon Hours & Location */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-beige-warm uppercase mb-3">
              Studio & Hours
            </h4>
            <div className="flex items-start gap-2 text-beige-warm/80">
              <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p>Monday – Sunday</p>
                <p className="text-beige-warm/60">{settings.openTime} – {settings.closeTime}</p>
                <p className="text-[11px] text-gold/90 mt-1">Online Queue closes {settings.cutoffMinutesBeforeClosing}m prior</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-beige-warm/80 pt-2">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>Sindhu Bhavan Road, Bodakdev, Ahmedabad, Gujarat 380054</span>
            </div>
            <div className="flex items-center gap-2 text-beige-warm/80 pt-1">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
          </div>

          {/* Quick Staff Portals */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-beige-warm uppercase mb-3">
              Staff & Display Portals
            </h4>
            <ul className="space-y-2 text-beige-warm/75">
              <li>
                <Link to="/reception" className="hover:text-beige-warm transition-colors inline-flex items-center gap-1.5">
                  Reception Desk (Tablet)
                </Link>
              </li>
              <li>
                <Link to="/barber/Arjun" className="hover:text-beige-warm transition-colors inline-flex items-center gap-1.5">
                  Barber View: Arjun Sharma
                </Link>
              </li>
              <li>
                <Link to="/barber/Rohan" className="hover:text-beige-warm transition-colors inline-flex items-center gap-1.5">
                  Barber View: Rohan Patel
                </Link>
              </li>
              <li>
                <Link to="/display" className="hover:text-beige-warm transition-colors inline-flex items-center gap-1.5">
                  Waiting Area TV Display
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-beige-warm transition-colors inline-flex items-center gap-1.5">
                  Owner Management & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Controls & Quality Guarantee */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-beige-warm uppercase mb-3">
              System State
            </h4>
            <div className="p-3 rounded-lg bg-sage-deep/60 border border-sage/40 space-y-2">
              <div className="flex items-center gap-2 text-beige-warm/90">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span className="font-medium">Active Demo Storage</span>
              </div>
              <p className="text-[11px] text-beige-warm/70 leading-normal">
                State synchronizes automatically across browser tabs via BroadcastChannel.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-beige-warm/15 hover:bg-beige-warm/25 text-beige-warm transition-colors border border-beige-warm/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
