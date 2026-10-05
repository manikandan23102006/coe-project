import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SystemMetricsCard from './components/SystemMetricsCard';
import CapacityForecastView from './components/CapacityForecastView';
import SessionStateView from './components/SessionStateView';
import ChaosLabView from './components/ChaosLabView';
import RetentionSimulator from './components/RetentionSimulator';
import AuthView from './components/AuthView';
import { SessionEngine } from './engine/sessionEngine';
import { ChaosSimulator } from './engine/chaosSimulator';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Lead SRE',
    email: 'admin@alphastudios.com',
    tenantId: 'tenant-alpha',
    role: 'Lead Infrastructure Engineer'
  });
  const [activeTab, setActiveTab] = useState('forecast');
  
  // Single persistent SessionEngine instance
  const engine = useMemo(() => new SessionEngine(), []);
  
  const [tenants, setTenants] = useState(engine.tenantStats);
  const [metrics, setMetrics] = useState(engine.metrics);
  const [storageMetrics, setStorageMetrics] = useState(engine.getStorageMetrics());

  // Warmup simulation: process an initial batch of 50 events
  useEffect(() => {
    const simulator = new ChaosSimulator({ duplicateRate: 0.1, outOfOrderRate: 0.15, delayRate: 0.05 });
    const initialEvents = simulator.generateEventBatch(50);
    initialEvents.forEach(evt => engine.processEvent(evt));
    refreshState();
  }, [engine]);

  const refreshState = () => {
    setMetrics({ ...engine.metrics });
    setStorageMetrics(engine.getStorageMetrics());
  };

  const handleUpdateTenant = (tenantId, updates) => {
    engine.tenantStats[tenantId] = {
      ...engine.tenantStats[tenantId],
      ...updates
    };
    setTenants({ ...engine.tenantStats });
    refreshState();
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {!currentUser ? (
          /* AUTHENTICATION VIEW (LOGIN & SIGNUP) */
          <AuthView onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* AUTHENTICATED DASHBOARD WORKSPACE */
          <>
            {/* Top Key Metrics Banner */}
            <SystemMetricsCard
              storageMetrics={storageMetrics}
              metrics={metrics}
              tenants={tenants}
            />

            {/* Tab Views */}
            {activeTab === 'forecast' && (
              <CapacityForecastView tenants={tenants} storageMetrics={storageMetrics} />
            )}

            {activeTab === 'session' && (
              <SessionStateView engine={engine} storageMetrics={storageMetrics} />
            )}

            {activeTab === 'chaos' && (
              <ChaosLabView engine={engine} onProcessEvents={refreshState} />
            )}

            {activeTab === 'retention' && (
              <RetentionSimulator tenants={tenants} onUpdateTenant={handleUpdateTenant} />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        Multiplayer Session State Storage & Tenant-Aware Capacity Forecaster • Privacy-First Architecture • IE28 Project Milestone
      </footer>

    </div>
  );
}
