import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Shield,
  Clock,
  Banknote,
  CheckCircle2,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const TenantSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [dealership, setDealership] = useState(null);
  const [settings, setSettings] = useState({
    workingDaysPerMonth: 30,
    salarySettings: {
      standardWorkingDays: 30,
      pfRate: 0.12,
      esiRate: 0.0075,
      esiThreshold: 21000,
    },
    attendanceRules: {
      gracePeriodMinutes: 15,
      halfDayHours: 4,
      fullDayHours: 8,
    },
    leavePolicies: {
      paidLeavesPerYear: 18,
      probationNoticeDays: 15,
      regularNoticeDays: 30,
    },
    codeFormats: {
      employeeCodePrefix: 'EMP-',
      positionCodePrefix: 'POS-',
    },
  });

  const [profile, setProfile] = useState({
    contactEmail: '',
    contactPhone: '',
    address: '',
    logoUrl: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/tenants/settings');
        const data = res.data.data;
        setDealership(data);
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            salarySettings: { ...prev.salarySettings, ...(data.settings.salarySettings || {}) },
            attendanceRules: { ...prev.attendanceRules, ...(data.settings.attendanceRules || {}) },
            leavePolicies: { ...prev.leavePolicies, ...(data.settings.leavePolicies || {}) },
            codeFormats: { ...prev.codeFormats, ...(data.settings.codeFormats || {}) },
          }));
        }
        setProfile({
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
          logoUrl: data.logoUrl || '',
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load dealership configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('/tenants/settings', {
        contactEmail: profile.contactEmail,
        contactPhone: profile.contactPhone,
        address: profile.address,
        logoUrl: profile.logoUrl,
        settings,
      });
      setMessage('Dealership configurations saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dealership Configuration & Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure dealership HR policies, payroll parameters, statutory rules, and branding
          </p>
        </div>
        <Button
          size="sm"
          icon={Save}
          loading={saving}
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Save Configurations
        </Button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Dealership Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {dealership?.code?.slice(0, 3)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{dealership?.organizationName}</h2>
            <p className="text-xs text-slate-500">{dealership?.legalName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                Code: {dealership?.code}
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                Plan: {dealership?.subscriptionPlan}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Row-level isolated workspace</div>
          <div className="text-[11px] text-emerald-600 font-medium">Tenant Verified</div>
        </div>
      </div>

      {/* Form sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Contact & Branding */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Dealership Contact & Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={profile.contactPhone}
                onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Corporate Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Salary & Statutory Parameters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-600" />
            Dealership Payroll & Statutory Engine Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Working Days
              </label>
              <input
                type="number"
                value={settings.salarySettings.standardWorkingDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    salarySettings: {
                      ...settings.salarySettings,
                      standardWorkingDays: parseInt(e.target.value) || 30,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Used for pro-rated daily salary</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PF Rate (Employee)</label>
              <input
                type="number"
                step="0.01"
                value={settings.salarySettings.pfRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    salarySettings: {
                      ...settings.salarySettings,
                      pfRate: parseFloat(e.target.value) || 0.12,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">0.12 = 12% of Basic</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ESI Rate (Employee)</label>
              <input
                type="number"
                step="0.0001"
                value={settings.salarySettings.esiRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    salarySettings: {
                      ...settings.salarySettings,
                      esiRate: parseFloat(e.target.value) || 0.0075,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">0.0075 = 0.75% of Gross</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ESI Gross Ceiling (₹)</label>
              <input
                type="number"
                value={settings.salarySettings.esiThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    salarySettings: {
                      ...settings.salarySettings,
                      esiThreshold: parseInt(e.target.value) || 21000,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Statutory threshold (₹21,000)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Attendance & Punch Rules */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Attendance & Biometric Punch Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                value={settings.attendanceRules.gracePeriodMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    attendanceRules: {
                      ...settings.attendanceRules,
                      gracePeriodMinutes: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Half-Day Threshold (Hours)
              </label>
              <input
                type="number"
                value={settings.attendanceRules.halfDayHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    attendanceRules: {
                      ...settings.attendanceRules,
                      halfDayHours: parseFloat(e.target.value) || 4,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full-Day Required (Hours)
              </label>
              <input
                type="number"
                value={settings.attendanceRules.fullDayHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    attendanceRules: {
                      ...settings.attendanceRules,
                      fullDayHours: parseFloat(e.target.value) || 8,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Code Prefixes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Identifier Formats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee Code Prefix
              </label>
              <input
                type="text"
                value={settings.codeFormats.employeeCodePrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    codeFormats: {
                      ...settings.codeFormats,
                      employeeCodePrefix: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Position Code Prefix
              </label>
              <input
                type="text"
                value={settings.codeFormats.positionCodePrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    codeFormats: {
                      ...settings.codeFormats,
                      positionCodePrefix: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TenantSettingsPage;
