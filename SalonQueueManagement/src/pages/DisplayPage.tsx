import React, { useState, useEffect, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import {
  calculateEstimatedWaitTime,
  getWaitingEntries
} from '../services/queueLogic';
import {
  Bell,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const DisplayPage: React.FC = () => {
  const { barbers, entries, services, settings, lastCalledEntry } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter next 5 tokens (called or waiting)
  const nextTokens = useMemo(() => {
    const called = entries.filter(e => e.status === 'CALLED');
    const waiting = getWaitingEntries(entries);
    return [...called, ...waiting].slice(0, 5);
  }, [entries]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const onDutyBarbers = barbers.filter(b => b.onDuty);

  return (
    <div className="min-h-screen bg-[#1E231E] text-[#FBF9F4] flex flex-col justify-between p-6 sm:p-10 select-none overflow-x-hidden">
      
      {/* Top Header Bar for TV */}
      <header className="flex items-center justify-between pb-6 border-b border-[#3D4F44]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#52675A] flex items-center justify-center text-[#F4EFE5] font-serif font-bold text-2xl shadow-elevated">
            S
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wider uppercase text-[#FAF6EE]">
                {settings.salonName}
              </h1>
              <span className="text-xs uppercase px-2.5 py-1 rounded bg-[#52675A]/60 text-[#E7ECE5] tracking-widest font-semibold">
                Live TV Display
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#829581] tracking-widest uppercase mt-0.5 font-medium">
              Waiting Area Live Ticket Board
            </p>
          </div>
        </div>

        {/* Live Clock & Fullscreen Button */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#FAF6EE]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-xs text-[#829581] font-semibold tracking-wider uppercase">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-[#292D29] hover:bg-[#3D4F44] border border-[#52675A]/40 text-[#E7ECE5] transition-colors"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Visual Announcement Banner: Highlighting Newly Called Token */}
      {lastCalledEntry && lastCalledEntry.status === 'CALLED' && (
        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-[#C26D53] border-4 border-[#F4EFE5] shadow-elevated animate-call-pulse flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F4] text-[#C26D53] flex items-center justify-center flex-shrink-0 shadow-refined">
              <Bell className="w-9 h-9 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full bg-[#1E231E]/30 text-[#FBF9F4]">
                NOW CALLING
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FBF9F4] mt-1">
                Token {lastCalledEntry.token} — {lastCalledEntry.customerName}
              </h2>
            </div>
          </div>

          <div className="text-center md:text-right bg-[#1E231E]/40 px-6 py-3.5 rounded-2xl border border-white/20">
            <span className="text-xs uppercase tracking-widest text-[#FAF6EE]/80 block font-semibold">
              Please Proceed To
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#FBF9F4]">
              {barbers.find(b => b.id === lastCalledEntry.assignedBarberId)?.name || 'Barber Station'}
              {' '}(Station {barbers.find(b => b.id === lastCalledEntry.assignedBarberId)?.stationNumber || 1})
            </span>
          </div>
        </div>
      )}

      {/* TV Split Screen: Stations on Left, Upcoming Queue on Right */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
        
        {/* Left Side: Barber Stations (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#3D4F44]">
            <h3 className="font-serif text-2xl font-bold tracking-wide text-[#FAF6EE]">
              Barber Stations
            </h3>
            <span className="text-xs text-[#829581] uppercase font-bold tracking-widest">
              Live Station Status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {onDutyBarbers.map((barber) => {
              const isAvail = barber.status === 'AVAILABLE';
              const isBusy = barber.status === 'BUSY';
              const isBreak = barber.status === 'ON_BREAK';

              const activeEntry = barber.currentEntryId
                ? entries.find(e => e.id === barber.currentEntryId)
                : null;

              return (
                <div
                  key={barber.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isBusy
                      ? 'bg-[#2A332B] border-[#829581]/50 shadow-refined'
                      : isBreak
                      ? 'bg-[#242924] border-[#3D4F44] opacity-75'
                      : 'bg-[#292D29] border-[#3D4F44]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#829581]">
                        Station {barber.stationNumber}
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#FBF9F4]">
                        {barber.name}
                      </h4>
                    </div>

                    <div>
                      {isAvail && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                          Ready
                        </span>
                      )}
                      {isBusy && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C26D53]/40 text-[#F4EFE5] border border-[#C26D53]">
                          Serving
                        </span>
                      )}
                      {isBreak && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3D4F44] text-[#E7ECE5]">
                          Break
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Station Subtext */}
                  <div className="mt-4 pt-4 border-t border-[#3D4F44]">
                    {activeEntry ? (
                      <div>
                        <span className="text-[11px] text-[#829581] uppercase tracking-wider block font-semibold">In Chair</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-serif text-2xl font-bold text-[#FAF6EE]">
                            {activeEntry.token}
                          </span>
                          <span className="text-sm font-semibold text-[#829581]">
                            {activeEntry.customerName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-sm text-[#829581] font-medium">
                        {isBreak ? 'Resting station' : 'Ready for next client'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Next 5 Tokens in Queue (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#3D4F44]">
            <h3 className="font-serif text-2xl font-bold tracking-wide text-[#FAF6EE]">
              Next In Queue (Top 5)
            </h3>
            <span className="text-xs text-[#829581] uppercase font-bold tracking-widest">
              Estimated Order
            </span>
          </div>

          <div className="space-y-3">
            {nextTokens.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#292D29] border border-[#3D4F44] text-[#829581]">
                Queue is clear. No customers waiting.
              </div>
            ) : (
              nextTokens.map((item, idx) => {
                const estWait = calculateEstimatedWaitTime(item, entries, barbers, services);
                const isItemCalled = item.status === 'CALLED';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isItemCalled
                        ? 'bg-[#C26D53]/20 border-[#C26D53] shadow-refined animate-call-pulse'
                        : 'bg-[#292D29] border-[#3D4F44]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#3D4F44] flex items-center justify-center font-bold text-sm text-[#FAF6EE]">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-2xl font-bold text-[#FAF6EE]">
                            {item.token}
                          </span>
                          {isItemCalled && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#C26D53] text-[#FBF9F4] uppercase">
                              Called
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#829581] font-medium">
                          {item.customerName} · {item.preferredBarberId === 'ANY' ? 'Any Barber' : 'Preferred Barber'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isItemCalled ? (
                        <span className="text-sm font-bold text-[#C26D53]">
                          Step to Station Now
                        </span>
                      ) : (
                        <div>
                          <span className="font-serif text-xl font-bold text-[#FAF6EE]">
                            ~{estWait}m
                          </span>
                          <span className="text-[11px] text-[#829581] block">est. wait</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* TV Footer Ticker */}
      <footer className="pt-4 border-t border-[#3D4F44] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#829581]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Please watch this screen. When your token is called, proceed to your designated station.</span>
        </div>
        <div>
          <span>Online Queue: <strong>{settings.isOnlineQueueOpen ? 'Open' : 'Reception Only'}</strong> · Closing Time: <strong>{settings.closeTime}</strong></span>
        </div>
      </footer>

    </div>
  );
};
