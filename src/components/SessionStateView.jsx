import React from 'react';
import { Activity, Database, Table, Hash, CheckCircle, Shield } from 'lucide-react';

export default function SessionStateView({ engine, storageMetrics }) {
  const { tables, tenantStats, metrics } = engine;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Multiplayer Session State Tables & Index Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time storage telemetry across tenants, tables (`session_state`, `player_events`, `match_metadata`), and indexes.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Total Mutations Applied: </span>
            <span className="text-cyan-400 font-bold">{metrics.appliedMutations}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">State Checksum: </span>
            <span className="text-emerald-400 font-bold">0x{metrics.stateChecksum.toString(16).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Table & Index Storage Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {storageMetrics.tableBreakdown.map((t, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{t.table}</h3>
                  <span className="text-xs text-slate-400">{t.rowCount} active rows</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Total Footprint:</span>
                <span className="text-sm font-bold text-cyan-300">{t.totalMB} MB</span>
              </div>
            </div>

            {/* Row vs Index Split Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Data: {t.dataMB} MB</span>
                <span>Indexes: {t.indexMB} MB</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(t.dataBytes / (t.dataBytes + t.indexBytes || 1)) * 100}%` }}
                  className="bg-cyan-500 h-full"
                />
                <div
                  style={{ width: `${(t.indexBytes / (t.dataBytes + t.indexBytes || 1)) * 100}%` }}
                  className="bg-purple-500 h-full"
                />
              </div>
            </div>

            {/* Index Details */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Attached Indexes
              </span>
              {t.indexDetails.map((idxDetail, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-purple-400" />
                    {idxDetail.name} <span className="text-slate-500 text-[10px]">({idxDetail.type})</span>
                  </span>
                  <span className="text-purple-300 font-semibold">{idxDetail.mb} MB</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant Activity & Quota Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Tenant Isolation & Storage Quota Allocation
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-4">Tenant Key</th>
                <th className="pb-3 px-4">Workload Name</th>
                <th className="pb-3 px-4 text-right">Active Sessions</th>
                <th className="pb-3 px-4 text-right">Daily Row Growth</th>
                <th className="pb-3 px-4 text-right">Retention Window</th>
                <th className="pb-3 px-4 text-right">Storage Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {Object.entries(tenantStats).map(([tid, stats]) => (
                <tr key={tid} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-cyan-400">{tid}</td>
                  <td className="py-3 px-4 text-slate-100 font-sans">{stats.name}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">{stats.activeSessions}</td>
                  <td className="py-3 px-4 text-right text-slate-300">+{stats.rowGrowthRate} / day</td>
                  <td className="py-3 px-4 text-right text-purple-300">{stats.retentionDays} Days TTL</td>
                  <td className="py-3 px-4 text-right text-amber-400 font-bold">{stats.storageLimitMB} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
