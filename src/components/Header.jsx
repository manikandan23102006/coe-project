import React from 'react';
import { Database, ShieldAlert, Cpu, Activity, Sliders, Layers, UserCheck, LogOut } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, metrics, currentUser, onSignOut }) {
  const tabs = [
    { id: 'forecast', label: 'Capacity Forecaster', icon: Database },
    { id: 'session', label: 'Multiplayer Session State', icon: Activity },
    { id: 'chaos', label: 'Chaos Engineering Lab', icon: ShieldAlert },
    { id: 'retention', label: 'Retention & Quota Config', icon: Sliders }
  ];

  return (
    <header className="glass-panel border-b border-slate-800/80 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                SessionStore <span className="text-cyan-400">Forecaster</span>
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                v2.4 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Tenant Rapid Session Storage & Tenant-Aware Capacity Predictor
            </p>
          </div>
        </div>

        {/* User Profile & Sign Out (If Logged In) */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 text-slate-950 font-bold flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{currentUser.role}</div>
              </div>
            </div>

            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Live System Status Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Integrity:</span>
            <span className="text-emerald-400 font-semibold">0x1A2B3C4D</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Evts:</span>
            <span className="text-cyan-300 font-semibold">{metrics.totalReceived}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {currentUser && (
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

      </div>
    </header>
  );
}
