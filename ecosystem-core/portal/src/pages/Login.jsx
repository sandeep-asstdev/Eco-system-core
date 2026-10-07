import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Car, Lock, Mail, ArrowRight, Shield, AlertCircle, Key, ShieldAlert } from 'lucide-react';
import Toast from '../components/common/Toast.jsx';

export default function Login({ onNavigate }) {
  const { login, loginWithKeycloak } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setToastData(null);
    setIsLoading(true);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password.';
      const isSuspended = err.code === 'TENANT_SUSPENDED' || 
                          err.code === 'ACCOUNT_SUSPENDED' || 
                          errorMsg.toLowerCase().includes('suspended') ||
                          errorMsg.toLowerCase().includes('inactive');

      setError(errorMsg);
      setToastData({
        title: isSuspended ? 'Access Denied - Account Suspended' : 'Authentication Failed',
        message: errorMsg,
        type: isSuspended ? 'suspended' : 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setPersona = (personaEmail, personaPassword = 'Admin@123') => {
    setEmail(personaEmail);
    setPassword(personaPassword);
    setError(null);
    setToastData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      {/* Floating Notification Toast */}
      {toastData && (
        <Toast
          title={toastData.title}
          message={toastData.message}
          type={toastData.type}
          onClose={() => setToastData(null)}
          duration={6000}
        />
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Automobile Ecosystem</h1>
          <p className="text-xs text-slate-500 mt-1">Central Identity & Multi-Tenant Dealership Platform</p>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Keycloak SSO Button */}
          <div>
            <button
              type="button"
              onClick={loginWithKeycloak}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              <Key className="w-4 h-4" />
              <span>Sign In with Keycloak SSO (PKCE Flow)</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Redirects to Keycloak Authorization Server on port 8080
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase">Or Sign In Directly</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@dealership.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* In-Form Error Alert Box */}
            {error && (
              <div 
                id="login-error-alert"
                role="alert"
                className={`p-3.5 rounded-xl border-2 flex items-start gap-3 text-xs shadow-sm ${
                  error.toLowerCase().includes('suspended')
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {error.toLowerCase().includes('suspended') ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    {error.toLowerCase().includes('suspended') ? 'Account Suspended' : 'Invalid email or password'}
                  </p>
                  <p className="mt-0.5 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Dealership Register Link */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-500">
              New dealership holding group?{' '}
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('/signup') : (window.location.href = '/signup')}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Register & Enter Dashboard →
              </button>
            </p>
          </div>

          {/* One-Click Personas */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Test Personas
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setPersona('admin@ecosystem.com')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">Platform SuperAdmin</div>
                  <div className="text-[10px] text-slate-500">admin@ecosystem.com</div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">GLOBAL</span>
              </button>

              <button
                type="button"
                onClick={() => setPersona('md.bellad@belladgroup.com')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">Bellad Group MD</div>
                  <div className="text-[10px] text-slate-500">md.bellad@belladgroup.com</div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">TENANT</span>
              </button>

              <button
                type="button"
                onClick={() => setPersona('bm.hubli@belladgroup.com')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">Hubli Branch Manager</div>
                  <div className="text-[10px] text-slate-500">bm.hubli@belladgroup.com</div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">BRANCH</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
