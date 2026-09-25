import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Callback() {
  const { handleKeycloakCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      setError('No authorization code provided in callback.');
      return;
    }

    handleKeycloakCallback(code, state)
      .then(() => {
        window.location.href = '/';
      })
      .catch((err) => {
        setError(err.message || 'Keycloak authorization code exchange failed.');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-1">SSO Authentication Error</h2>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Verifying Keycloak Identity</h2>
        <p className="text-xs text-slate-500 mb-4">Exchanging PKCE cryptographic tokens with Identity Provider...</p>
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
