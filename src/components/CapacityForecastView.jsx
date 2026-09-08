import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CapacityForecaster } from '../engine/capacityForecaster';
import { AlertTriangle, CheckCircle, Info, TrendingUp, Layers, HelpCircle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CapacityForecastView({ tenants, storageMetrics }) {
  const [selectedTenantKey, setSelectedTenantKey] = useState('tenant-alpha');
  const [modelType, setModelType] = useState('TENANT_AWARE');
  const [forecastDays, setForecastDays] = useState(90);

  const forecaster = useMemo(() => new CapacityForecaster({ forecastDays }), [forecastDays]);

  const currentTenant = tenants[selectedTenantKey];

  const forecastData = useMemo(() => {
    return forecaster.generateForecast(
      currentTenant,
      storageMetrics.totalTableBytes / 3,
      storageMetrics.totalIndexBytes / 3,
      modelType
    );
  }, [forecaster, currentTenant, storageMetrics, modelType]);

  // Backtest comparison data
  const backtestEval = useMemo(() => forecaster.evaluateBacktest(), [forecaster]);

  // Build ChartJS dataset
  const chartLabels = [
    ...forecastData.history.map(h => h.date),
    ...forecastData.forecast.map(f => f.date)
  ];

  const historyTotals = forecastData.history.map(h => h.totalMB);
  const forecastTotals = [
    forecastData.history[forecastData.history.length - 1].totalMB,
    ...forecastData.forecast.map(f => f.totalMB)
  ];

  const lowerBounds = [
    forecastData.history[forecastData.history.length - 1].totalMB,
    ...forecastData.forecast.map(f => f.lowerMB)
  ];

  const upperBounds = [
    forecastData.history[forecastData.history.length - 1].totalMB,
    ...forecastData.forecast.map(f => f.upperMB)
  ];

  const limitLine = Array(chartLabels.length).fill(forecastData.storageLimitMB);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Historical Actual (MB)',
        data: [...historyTotals, ...Array(forecastData.forecast.length).fill(null)],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderWidth: 3,
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: `${modelType === 'BASELINE' ? 'Baseline Linear Forecast' : 'Tenant-Aware Forecast'} (MB)`,
        data: [...Array(forecastData.history.length - 1).fill(null), ...forecastTotals],
        borderColor: modelType === 'BASELINE' ? '#F43F5E' : '#8B5CF6',
        borderDash: [5, 5],
        borderWidth: 3,
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: '90% Upper Bound (CI)',
        data: [...Array(forecastData.history.length - 1).fill(null), ...upperBounds],
        borderColor: 'rgba(139, 92, 246, 0.25)',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        fill: '+1',
        borderWidth: 1,
        pointRadius: 0
      },
      {
        label: '90% Lower Bound (CI)',
        data: [...Array(forecastData.history.length - 1).fill(null), ...lowerBounds],
        borderColor: 'rgba(139, 92, 246, 0.25)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0
      },
      {
        label: 'Storage Quota Limit (MB)',
        data: limitLine,
        borderColor: '#F59E0B',
        borderWidth: 2,
        borderDash: [2, 2],
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 12 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } },
        title: { display: true, text: 'Storage Size (MB)', color: '#64748B', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector & Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Tenant / Workload
            </label>
            <select
              value={selectedTenantKey}
              onChange={(e) => setSelectedTenantKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 font-medium text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(tenants).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name} ({t.activeSessions} sessions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Forecast Horizon
            </label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-100 font-medium text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
        </div>

        {/* Model Selector Toggle */}
        <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 w-full md:w-auto justify-center">
          <button
            onClick={() => setModelType('BASELINE')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              modelType === 'BASELINE'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Baseline Linear Model
          </button>
          <button
            onClick={() => setModelType('TENANT_AWARE')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              modelType === 'TENANT_AWARE'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tenant-Aware Forecaster (Recommended)
          </button>
        </div>
      </div>

      {/* Main Forecast Chart & Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Chart Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Storage Growth Projection & Exhaustion Window
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates table row accumulation + B-Tree index fragmentation bloat over time.
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 block">Exhaustion Limit:</span>
              <span className="text-sm font-bold text-amber-400">{forecastData.storageLimitMB} MB</span>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Model Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">
                {modelType === 'TENANT_AWARE' ? 'Tenant-Aware Algorithm Details:' : 'Baseline Model Limitations:'}
              </span>{' '}
              {modelType === 'TENANT_AWARE'
                ? 'Combines tenant concurrency scaling (1.15x), B-Tree page split overhead (1.45x index multiplier), TTL retention eviction curves, and 90% confidence bounds.'
                : 'Assumes flat static linear extrapolation of aggregate table bytes. Dangerously underestimates exhaustion date by ignoring index expansion.'}
            </div>
          </div>
        </div>

        {/* Prediction Output & Metrics Panel */}
        <div className="space-y-6">
          
          {/* Exhaustion Date Prediction Card */}
          <div className={`glass-card p-6 rounded-2xl border ${
            forecastData.exhaustionDay ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/30 to-slate-900' : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${forecastData.exhaustionDay ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {forecastData.exhaustionDay ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Forecasted Capacity Exhaustion
                </span>
                <div className="text-2xl font-extrabold font-mono text-white mt-1">
                  {forecastData.exhaustionDay ? `Day ${forecastData.exhaustionDay}` : 'Safe Capacity'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Date:</span>
                <span className="text-slate-100 font-semibold">{forecastData.exhaustionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Band (90% CI):</span>
                <span className="text-purple-400 font-semibold">
                  {forecastData.exhaustionDay ? `Day ${Math.max(1, forecastData.exhaustionDay - 3)} - Day ${forecastData.exhaustionDay + 4}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Accuracy Backtest Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Backtest Validation Accuracy</span>
              <span className="text-xs font-mono text-cyan-400">{backtestEval.improvementFactor}</span>
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Baseline Linear MAE</div>
                  <div className="text-slate-400">Simple raw row extrapolation</div>
                </div>
                <div className="font-mono font-bold text-rose-400 text-sm">
                  {backtestEval.baseline.maeDays} Days
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-purple-200">Tenant-Aware MAE</div>
                  <div className="text-purple-400">Includes index bloat & TTL</div>
                </div>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  {backtestEval.tenantAware.maeDays} Days
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
