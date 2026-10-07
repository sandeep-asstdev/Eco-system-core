import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Callback() {
  const { handleKeycloakCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      setError('No authorization code provided in Keycloak callback.');
      return;
    }

    exchangedRef.current = true;
    window.history.replaceState({}, document.title, window.location.pathname);

    handleKeycloakCallback(code, state)
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('SSO callback exchange error:', err);
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
          <h2 className="text-base font-bold text-slate-800 mb-1">Central SSO Authentication Error</h2>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
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
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Authenticating with Keycloak</h2>
        <p className="text-xs text-slate-500 mb-4">Exchanging PKCE cryptographic tokens with Central Identity Provider...</p>
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
