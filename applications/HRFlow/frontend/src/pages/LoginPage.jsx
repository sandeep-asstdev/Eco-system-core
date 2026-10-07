import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Shield,
  HelpCircle,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, switchRole, loginWithKeycloak } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Active phone mockup tab
  const [mockupTab, setMockupTab] = useState(0);

  const mockupScreens = [
    {
      title: 'Branch Attendance & Punches',
      time: '09:14 AM',
      badge: 'Real-Time Biometrics',
      content: [
        { label: 'Rahul Sharma (Sales)', status: 'Punched In (09:05 AM)', color: 'text-emerald-600' },
        { label: 'Priya Patel (HR)', status: 'Punched In (09:12 AM)', color: 'text-emerald-600' },
        { label: 'Amit Deshmukh (Service)', status: 'On Field Duty', color: 'text-indigo-600' },
      ],
    },
    {
      title: 'Automated Payroll & Payslip',
      time: 'July 2026',
      badge: 'Processed in 12s',
      content: [
        { label: 'Standard Working Days', status: '30 Days', color: 'text-slate-700' },
        { label: 'PF & ESI Compliance', status: 'Calculated (12% / 0.75%)', color: 'text-emerald-600' },
        { label: 'Disbursement Advice', status: 'PA-APEX-2026-07 Ready', color: 'text-purple-600' },
      ],
    },
    {
      title: 'Branch Approvals & Assets',
      time: 'Pending: 2',
      badge: 'BM Mumbai Hub',
      content: [
        { label: 'CUG SIM Request', status: 'Auto-Triggered (Rule 1)', color: 'text-amber-600' },
        { label: 'Laptop Allocation', status: 'Awaiting BM Approval', color: 'text-blue-600' },
        { label: 'Replacement Vacancy', status: 'Auto-Opened (Rule 2)', color: 'text-indigo-600' },
      ],
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Invalid email or password. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoKey, demoEmail, demoPass) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      await switchRole(demoKey);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  // Recent Logins / Quick Profiles (Instagram & Facebook style)
  const recentProfiles = [
    {
      name: 'Bellad HR Administrator',
      role: 'HR',
      email: 'hr.bellad@hrflow.com',
      pass: 'hr123456',
      demoKey: 'HR_BELLAD',
      avatarBg: 'bg-indigo-600',
      initials: 'BH',
      badge: 'Dealer HR',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      tenant: 'Bellad Group (15 Emps, 101 Desigs)',
    },
    {
      name: 'BM Hubli Central HQ',
      role: 'BM',
      email: 'bm.hubli@hrflow.com',
      pass: 'bm123456',
      demoKey: 'BM_HUBLI',
      avatarBg: 'bg-blue-600',
      initials: 'BM',
      badge: 'Branch Mgr',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      tenant: 'Bellad Group • Hubli Branch',
    },
    {
      name: 'Platform SuperAdmin',
      role: 'PLATFORM_ADMIN',
      email: 'admin@hrflow.com',
      pass: 'admin123456',
      demoKey: 'PLATFORM_ADMIN',
      avatarBg: 'bg-amber-600',
      initials: 'SA',
      badge: 'Platform',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      tenant: 'SaaS Platform SuperAdmin',
    },
    {
      name: 'Apex HR Administrator',
      role: 'HR',
      email: 'hr@hrflow.com',
      pass: 'hr123456',
      demoKey: 'HR',
      avatarBg: 'bg-purple-600',
      initials: 'HR',
      badge: 'Dealer HR',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      tenant: 'Apex Auto Group',
    },
    {
      name: 'BM Mumbai HQ',
      role: 'BM',
      email: 'bm.mumbai@hrflow.com',
      pass: 'bm123456',
      demoKey: 'BM_MUMBAI',
      avatarBg: 'bg-sky-600',
      initials: 'BM',
      badge: 'Branch Mgr',
      badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
      tenant: 'Apex Auto Group',
    },
    {
      name: 'Rahul Sharma',
      role: 'EMPLOYEE',
      email: 'emp.rahul@hrflow.com',
      pass: 'emp123456',
      demoKey: 'EMP_RAHUL',
      avatarBg: 'bg-emerald-600',
      initials: 'RS',
      badge: 'Employee',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      tenant: 'Apex Auto Group',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-4xl flex items-center justify-center gap-12">
          {/* Left: Instagram-style Smartphone Product Showcase (Desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-[380px]">
            {/* Realistic Smartphone Frame */}
            <div className="relative w-[340px] h-[660px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl ring-1 ring-slate-900/10 border-4 border-slate-800">
              {/* Screen Inner */}
              <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col relative border border-slate-200/40">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20 flex items-center justify-between px-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>

                {/* Mobile Status Bar */}
                <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-700 select-none">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <span className="w-4 h-2 rounded-xs border border-slate-700 inline-block p-0.5">
                      <span className="block w-full h-full bg-slate-700 rounded-2xs"></span>
                    </span>
                  </div>
                </div>

                {/* App Mobile Header */}
                <div className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      H
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">
                        HRFlow Mobile
                      </div>
                      <div className="text-[9px] text-indigo-600 font-semibold mt-0.5">
                        Apex Auto Group
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                    Live
                  </span>
                </div>

                {/* Interactive Phone Content Slider */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 overflow-y-auto">
                  {/* Top Notification Card */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {mockupScreens[mockupTab].title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {mockupScreens[mockupTab].time}
                      </span>
                    </div>
                    <div className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {mockupScreens[mockupTab].badge}
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {mockupScreens[mockupTab].content.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-2 bg-slate-50/80 rounded-lg border border-slate-100"
                        >
                          <span className="font-medium text-slate-700">{item.label}</span>
                          <span className={`font-semibold text-[10px] ${item.color}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dealership KPI Capsule */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-200 text-[11px] font-medium">
                        Active Dealership Workforce
                      </span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                        APEX-AUTO
                      </span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">48 Employees</div>
                    <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                      <div className="bg-white/10 rounded p-1">
                        <div className="font-bold">3</div>
                        <div className="text-[9px] text-indigo-200">Branches</div>
                      </div>
                      <div className="bg-white/10 rounded p-1">
                        <div className="font-bold">100%</div>
                        <div className="text-[9px] text-indigo-200">Isolated</div>
                      </div>
                      <div className="bg-white/10 rounded p-1">
                        <div className="font-bold">PF/ESI</div>
                        <div className="text-[9px] text-indigo-200">Compliant</div>
                      </div>
                    </div>
                  </div>

                  {/* Screen Selector Dots */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {mockupScreens.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMockupTab(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          mockupTab === i ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="pb-2 flex justify-center">
                  <div className="w-28 h-1 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Automobile Dealership SaaS • Multi-Branch Operations
            </p>
          </div>

          {/* Right: Instagram/Facebook-style Clean Login Card Stack */}
          <div className="w-full max-w-[360px] sm:max-w-[380px] space-y-3">
            {/* Main Login Card */}
            <div className="bg-white border border-slate-300/80 rounded-xl px-8 py-8 shadow-xs">
              {/* Brand Logo & Tagline */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    HRFlow
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Log in to manage your dealership network
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-center animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Central Keycloak SSO Integration */}
              <button
                type="button"
                onClick={() => loginWithKeycloak(false)}
                className="w-full py-2.5 px-3 mb-3.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-950"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign in with Central Ecosystem SSO</span>
              </button>

              <div className="relative mb-3.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative bg-white px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  OR USE LOCAL ACCOUNT
                </div>
              </div>

              {/* Classic Meta/Instagram-Style Login Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Email / Username Input */}
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work email or username"
                    className="w-full px-3 py-2.5 text-xs bg-[#fafafa] border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 focus:bg-white text-slate-900 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Password Input with Reveal Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-[#fafafa] border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 focus:bg-white text-slate-900 transition placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* High-Contrast Instagram-Style Action Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition shadow-2xs mt-2 flex items-center justify-center gap-1.5 ${
                    email && password && !loading
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer'
                      : 'bg-indigo-400 cursor-not-allowed opacity-80'
                  }`}
                >
                  {loading ? 'Authenticating...' : 'Log in'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* OR Divider Line */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative bg-white px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OR
                </div>
              </div>

              {/* 1-Click Recent Account Avatars (Facebook/Instagram Style) */}
              <div className="space-y-2">
                <div className="text-center text-[11px] font-semibold text-slate-500 mb-1">
                  1-Click Quick Demo Sign In
                </div>

                <div className="space-y-1.5">
                  {recentProfiles.slice(0, 3).map((p) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => handleQuickLogin(p.demoKey, p.email, p.pass)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100/90 text-left flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${p.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                        >
                          {p.initials}
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition">
                            {p.name}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {p.tenant}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${p.badgeColor}`}
                      >
                        {p.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* View All Accounts Link */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowCredentialsModal(true)}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> View All 10 Seeded Accounts & Passwords
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Card: Instagram-style Sign Up Switcher */}
            <div className="bg-white border border-slate-300/80 rounded-xl p-4 text-center shadow-xs text-xs text-slate-600">
              Don't have a dealership account?{' '}
              <Link
                to="/signup"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign up
              </Link>
            </div>

            {/* Security Guarantee Badge */}
            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PostgreSQL 18 Row-Level Tenant Scoping
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta/Instagram-Style Footer */}
      <footer className="py-6 px-4 text-center border-t border-slate-200/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 max-w-2xl mx-auto">
          <span className="hover:text-slate-600 cursor-pointer">About HRFlow</span>
          <span className="hover:text-slate-600 cursor-pointer">Automobile Dealership Network</span>
          <span className="hover:text-slate-600 cursor-pointer">Multi-Tenancy</span>
          <span className="hover:text-slate-600 cursor-pointer">EPFO & ESIC Compliance</span>
          <span className="hover:text-slate-600 cursor-pointer">API Status</span>
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-600 cursor-pointer">Security</span>
        </div>
        <div>© 2026 HRFlow from Automobile Dealership Solutions • PERN Stack</div>
      </footer>

      {/* Modal: All Seeded Accounts Directory */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Seeded User Credentials Directory
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pre-configured accounts for testing platform and dealership boundaries
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 text-xs space-y-3">
              {/* Section 1: Platform Level */}
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1. SaaS Platform SuperAdmin</span>
                  <span className="text-[9px] bg-amber-100 px-1.5 rounded">Global</span>
                </div>
                <div
                  onClick={() => {
                    handleQuickLogin('PLATFORM_ADMIN', 'admin@hrflow.com', 'admin123456');
                    setShowCredentialsModal(false);
                  }}
                  className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 hover:bg-amber-100/70 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900">admin@hrflow.com</div>
                    <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">admin123456</span></div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">Log In →</span>
                </div>
              </div>

              {/* Section 2: Tenant A - Apex Auto Group */}
              <div className="pt-2">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Tenant A: Apex Auto Group</span>
                  <span className="text-[9px] bg-indigo-100 px-1.5 rounded">Code: APEX-AUTO</span>
                </div>
                <div className="space-y-1.5">
                  <div
                    onClick={() => {
                      handleQuickLogin('HR', 'hr@hrflow.com', 'hr123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Apex HR Admin (hr@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">hr123456</span> (Dealership Master)</div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600">Select</span>
                  </div>

                  <div
                    onClick={() => {
                      handleQuickLogin('BM_MUMBAI', 'bm.mumbai@hrflow.com', 'bm123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">BM Mumbai HQ (bm.mumbai@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">bm123456</span> (Mumbai Branch)</div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">Select</span>
                  </div>

                  <div
                    onClick={() => {
                      handleQuickLogin('EMP_RAHUL', 'emp.rahul@hrflow.com', 'emp123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-emerald-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Emp Rahul Sharma (emp.rahul@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">emp123456</span> (Self Profile)</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Select</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Tenant B - Zenith Motors */}
              <div className="pt-2">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>3. Tenant B: Zenith Motors Group</span>
                  <span className="text-[9px] bg-emerald-100 px-1.5 rounded">Code: ZENITH-MOTORS</span>
                </div>
                <div className="space-y-1.5">
                  <div
                    onClick={() => {
                      handleQuickLogin('HR_ZENITH', 'hr.zenith@hrflow.com', 'hr123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-purple-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Zenith HR Admin (hr.zenith@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">hr123456</span> (Dealership Master)</div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600">Select</span>
                  </div>

                  <div
                    onClick={() => {
                      handleQuickLogin('BM_PUNE', 'bm.pune@hrflow.com', 'bm123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">BM Pune Hub (bm.pune@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">bm123456</span> (Pune Branch)</div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">Select</span>
                  </div>

                  <div
                    onClick={() => {
                      handleQuickLogin('EMP_ROHIT', 'emp.rohit@hrflow.com', 'emp123456');
                      setShowCredentialsModal(false);
                    }}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-emerald-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Emp Rohit Kumar (emp.rohit@hrflow.com)</div>
                      <div className="text-[10px] text-slate-500">Password: <span className="font-mono font-bold text-slate-700">emp123456</span> (Self Profile)</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Select</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                size="xs"
                variant="outline"
                onClick={() => setShowCredentialsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
