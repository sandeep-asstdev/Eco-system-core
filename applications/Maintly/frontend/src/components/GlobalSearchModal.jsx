import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
  Search, X, Wrench, Box, ShoppingCart, Truck, User, ArrowRight, CornerDownLeft
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else if (window.__openGlobalSearch) window.__openGlobalSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/intelligence/search', { params: { q: query } });
        setResults(res.data.data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (link) => {
    onClose();
    navigate(link);
  };

  const hasResults = results && (
    results.requests?.length > 0 ||
    results.assets?.length > 0 ||
    results.purchases?.length > 0 ||
    results.vendors?.length > 0 ||
    results.people?.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Request ID, Asset, Serial No, QR, Vendor, Employee..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-10 text-slate-400 text-xs">
              Type at least 2 characters to search across all dealership operations.
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono">Ctrl + K</span>
                <span>to toggle anywhere</span>
              </div>
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {/* Group 1: Maintenance Requests */}
          {results?.requests?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                <span>Maintenance Requests ({results.requests.length})</span>
              </div>
              <div className="space-y-1">
                {results.requests.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(r.link)}
                    className="p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{r.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
                          {r.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{r.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Assets */}
          {results?.assets?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Box className="w-3.5 h-3.5 text-amber-500" />
                <span>Equipment & Assets ({results.assets.length})</span>
              </div>
              <div className="space-y-1">
                {results.assets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelect(a.link)}
                    className="p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{a.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                          {a.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{a.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Purchase Orders */}
          {results?.purchases?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />
                <span>Purchase Requests ({results.purchases.length})</span>
              </div>
              <div className="space-y-1">
                {results.purchases.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p.link)}
                    className="p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{p.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-semibold">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{p.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Vendors */}
          {results?.vendors?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Truck className="w-3.5 h-3.5 text-teal-500" />
                <span>External Contractors & Vendors ({results.vendors.length})</span>
              </div>
              <div className="space-y-1">
                {results.vendors.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelect(v.link)}
                    className="p-2.5 rounded-xl hover:bg-teal-50/70 border border-transparent hover:border-teal-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900">{v.title}</span>
                      <div className="text-xs text-slate-600 mt-0.5">{v.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 5: People / Users */}
          {results?.people?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Personnel & Technicians ({results.people.length})</span>
              </div>
              <div className="space-y-1">
                {results.people.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelect(u.link)}
                    className="p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900">{u.title}</span>
                      <div className="text-xs text-slate-600 mt-0.5">{u.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</span>
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Select:</span>
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
