import React from 'react';
import { Sliders, Clock, HardDrive, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RetentionSimulator({ tenants, onUpdateTenant }) {
  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            Retention Rules & Tenant Quota Configurator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Adjust TTL eviction policies and hard storage limits to see real-time impact on capacity exhaustion dates.
          </p>
        </div>
      </div>

      {/* Tenant Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tenants).map(([tid, config]) => (
          <div key={tid} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block">{tid}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{config.name}</h3>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* TTL Rule Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">TTL Retention Window:</span>
                <span className="text-purple-300 font-bold">{config.retentionDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={config.retentionDays}
                onChange={(e) => onUpdateTenant(tid, { retentionDays: Number(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-900 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Sessions and event rows older than {config.retentionDays} days are pruned.
              </p>
            </div>

            {/* Storage Quota Limit Slider */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Hard Storage Limit:</span>
                <span className="text-amber-400 font-bold">{config.storageLimitMB} MB</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={config.storageLimitMB}
                onChange={(e) => onUpdateTenant(tid, { storageLimitMB: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Current Active Sessions */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Row Growth Rate:</span>
              <span className="text-cyan-300 font-semibold">+{config.rowGrowthRate} rows/day</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
