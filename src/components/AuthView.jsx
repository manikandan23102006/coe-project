import React, { useState } from 'react';
import { Layers, Mail, Lock, User, Building, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';

export default function AuthView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState('admin@alphastudios.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedTenant, setSelectedTenant] = useState('tenant-alpha');

  // Signup Form State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Infrastructure Engineer');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [notification, setNotification] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setNotification({ type: 'success', message: 'Authentication successful! Loading tenant session engine...' });
    setTimeout(() => {
      onLoginSuccess({
        name: email.split('@')[0].toUpperCase(),
        email,
        tenantId: selectedTenant,
        role: 'Lead Infrastructure Engineer'
      });
    }, 600);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service to create an account.');
      return;
    }
    setNotification({ type: 'success', message: 'Account created! Initializing tenant storage sandbox...' });
    setTimeout(() => {
      onLoginSuccess({
        name: fullName || 'New Engineer',
        email: signupEmail || 'engineer@studio.com',
        tenantId: 'tenant-alpha',
        role: role
      });
    }, 800);
  };

  const handleQuickDemoLogin = (presetName, presetEmail, tenantKey, userRole) => {
    setEmail(presetEmail);
    setSelectedTenant(tenantKey);
    setNotification({ type: 'success', message: `Logging in as ${presetName}...` });
    setTimeout(() => {
      onLoginSuccess({
        name: presetName,
        email: presetEmail,
        tenantId: tenantKey,
        role: userRole
      });
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-xl shadow-cyan-500/25 mb-2">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            SessionStore <span className="text-cyan-400">Platform</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Multi-Tenant Session State Storage & Capacity Forecaster Portal
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In to Console
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register New Tenant
          </button>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          
          {notification && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {notification.message}
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Organization / Tenant Studio
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-medium text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tenant-alpha">Alpha Studio (FPS Engine)</option>
                    <option value="tenant-beta">Beta Games (MMO World State)</option>
                    <option value="tenant-gamma">Gamma Arcade (Casual Real-time)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link dispatched to registered admin email.'); }} className="text-[11px] text-cyan-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">
                  Remember session token (Privacy First, 0 PII)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Authenticate & Launch Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="alex@gamestudio.io"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Organization / Studio Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Nexus Interactive Studios"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Engineering Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="Infrastructure Engineer">Lead Infrastructure Engineer</option>
                  <option value="Game Operations Manager">Game Operations Manager</option>
                  <option value="Site Reliability Engineer">Site Reliability Engineer (SRE)</option>
                  <option value="Backend Developer">Multiplayer Backend Developer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-purple-500 focus:ring-0"
                />
                <label htmlFor="agree" className="text-xs text-slate-400 cursor-pointer">
                  I agree to Tenant Storage Quota Policies & Privacy Guidelines
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Register Tenant & Provision Storage</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* Quick Demo Login Presets */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono text-slate-500 block text-center uppercase tracking-wider">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Lead Platform Eng', 'lead.sre@alphastudios.com', 'tenant-alpha', 'Lead Infrastructure Engineer')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 text-left transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">Alpha FPS Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Game Ops Director', 'ops@betagames.io', 'tenant-beta', 'Game Operations Manager')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-purple-300 text-left transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Beta MMO Demo</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-mono">
          SessionStore Security • Tenant Data Isolation • Zero Personal PII Collection
        </p>

      </div>
    </div>
  );
}
