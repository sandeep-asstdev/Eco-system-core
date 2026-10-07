import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: '',
    fullName: '',
    email: '',
    phone: '',
    city: '',
    code: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        organizationName: formData.organizationName,
        legalName: `${formData.organizationName} Automotive Private Limited`,
        code: formData.code.toUpperCase() || undefined,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to create dealership account. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-[360px] sm:max-w-[400px] space-y-3">
          {/* Main Signup Card */}
          <div className="bg-white border border-slate-300/80 rounded-xl px-8 py-8 shadow-xs">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  HRFlow
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs mx-auto">
                Human Resource Management System for Automobile Dealerships
              </p>
            </div>

            {/* Centralized Onboarding Banner & Redirect */}
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-left space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Centralized Dealership Onboarding</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To ensure single-source tenant governance and shared organizational structure across <strong>HRFlow</strong>, <strong>MAINTLY</strong>, and <strong>CRM</strong>, customer onboarding is managed centrally through <strong>Ecosystem Core</strong>.
                </p>
              </div>

              <div className="space-y-2 text-center pt-1">
                <a
                  href="http://localhost:3000/signup"
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Register Dealership in Central Ecosystem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <p className="text-[11px] text-slate-400">
                  Already onboarded by your group admin?
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Switcher Card */}
          <div className="bg-white border border-slate-300/80 rounded-xl p-4 text-center shadow-xs text-xs text-slate-600">
            Have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Meta/Instagram Footer */}
      <footer className="py-6 px-4 text-center border-t border-slate-200/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 max-w-2xl mx-auto">
          <span className="hover:text-slate-600 cursor-pointer">About HRFlow</span>
          <span className="hover:text-slate-600 cursor-pointer">Automobile Dealership Network</span>
          <span className="hover:text-slate-600 cursor-pointer">Multi-Tenancy</span>
          <span className="hover:text-slate-600 cursor-pointer">EPFO & ESIC Compliance</span>
          <span className="hover:text-slate-600 cursor-pointer">API Status</span>
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
        </div>
        <div>© 2026 HRFlow from Automobile Dealership Solutions • PERN Stack</div>
      </footer>
    </div>
  );
};

export default SignupPage;
