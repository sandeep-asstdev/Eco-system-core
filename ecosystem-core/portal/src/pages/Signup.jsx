import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Car, 
  User, 
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Signup({ onNavigate }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    code: '',
    adminName: '',
    email: '',
    phone: '',
    password: '',
    subscriptionTier: 'ENTERPRISE'
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'code') {
      const cleanCode = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanCode }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const nameTrimmed = formData.name.trim();
    const legalNameTrimmed = formData.legalName.trim();
    const codeTrimmed = formData.code.trim().toUpperCase();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const adminNameTrimmed = formData.adminName.trim();

    if (!nameTrimmed || !legalNameTrimmed || !codeTrimmed || !emailTrimmed || !formData.password) {
      setError('Please fill in all required enterprise and administrator fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid business email address.');
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      setError('Contact phone number must be exactly 10 digits.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        name: nameTrimmed,
        legalName: legalNameTrimmed,
        code: codeTrimmed,
        adminName: adminNameTrimmed,
        email: emailTrimmed,
        phone: formData.phone || null,
        password: formData.password,
        subscriptionTier: formData.subscriptionTier
      });
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Dealership registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = (e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate('/login');
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Car className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Automotive Dealership Holding Group Setup</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register Your Dealership Group</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Create your enterprise tenant context, standard 3S operational capabilities, and initial Tenant Administrator account.
          </p>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Dealership Group Identity */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. Dealership Holding Group Profile</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dealership Group Commercial Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Advait Group / Kalyani Automotive"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Common public brand name for the entire automotive dealership network.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Legal Entity Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    placeholder="e.g. Advait Motors Private Limited"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Official corporate name registered with MCA/RoC for statutory legal isolation.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tenant Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. ADV_GRP"
                    required
                    maxLength={20}
                    className="w-full px-3 py-2 text-xs uppercase font-mono font-bold tracking-wider border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50/50"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Unique multi-tenant identifier.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    name="subscriptionTier"
                    value={formData.subscriptionTier}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="ENTERPRISE">ENTERPRISE (Full 3S Multi-Firm)</option>
                    <option value="PROFESSIONAL">PROFESSIONAL (Standard Multi-Branch)</option>
                    <option value="STARTER">STARTER (Single Dealership)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Administrator Account */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-600" />
                <span>2. Initial Tenant Administrator Account</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="e.g. Advait Administrator"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@advaitgroup.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone (10 digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Master Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters for tenant administrative access.</p>
              </div>
            </div>

            {/* Included Capabilities List */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic 3S Dealership Capabilities Included</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] text-slate-600">
                <span>✔ New Vehicle Sales</span>
                <span>✔ Mechanical Workshop</span>
                <span>✔ Genuine Spares Depot</span>
                <span>✔ Bodyshop & Paint</span>
                <span>✔ Pre-Delivery Inspection</span>
                <span>✔ Pre-Owned Exchange</span>
                <span>✔ Lifestyle Accessories</span>
                <span>✔ Insurance & Finance</span>
                <span>✔ Customer CRM Hub</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Setting up Dealership Group...' : 'Register & Enter Dealership Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an enterprise account?{' '}
              <button
                type="button"
                onClick={handleGoToLogin}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Sign In to Dealership Portal →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
