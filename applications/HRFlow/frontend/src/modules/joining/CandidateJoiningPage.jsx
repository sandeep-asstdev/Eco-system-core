import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  CreditCard,
  Phone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export const CandidateJoiningPage = () => {
  const { token } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    phone: '',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    pan: '',
    aadhaar: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifsc: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyRelation: 'Parent',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await api.get(`/joining/public/candidate/${token}`);
        const data = res.data.data;
        setCandidate(data);
        if (data.status === 'COMPLETED') {
          setSubmitted(true);
        } else if (data.formData) {
          setFormData((prev) => ({ ...prev, ...data.formData }));
        } else {
          const names = data.candidateName.split(' ');
          setFormData((prev) => ({
            ...prev,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            phone: data.candidatePhone || '',
          }));
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired joining link.');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/joining/public/submit/${token}`, formData);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit onboarding form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2">Loading your onboarding form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Unable to Load Onboarding Form</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Onboarding Formalities Submitted!</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Thank you, <span className="font-semibold">{candidate?.candidateName}</span>. Your details have been received by the HR Team at {candidate?.branch?.name}. Your official employee ID and credentials will be issued on your joining date ({formatDate(candidate?.joiningDate)}).
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span>Designation:</span>
            <span className="font-semibold text-slate-900">{candidate?.designation}</span>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="font-semibold text-slate-900">{candidate?.department}</span>
          </div>
          <div className="flex justify-between">
            <span>Branch Office:</span>
            <span className="font-semibold text-slate-900">{candidate?.branch?.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              New Joiner Onboarding
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Welcome to HRFlow</h1>
            <p className="text-xs text-slate-500">
              Position: <span className="font-semibold text-slate-700">{candidate?.designation}</span> • Branch: <span className="font-semibold text-slate-700">{candidate?.branch?.name}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Joining Date</span>
            <span className="text-sm font-bold text-indigo-700">{formatDate(candidate?.joiningDate)}</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 text-xs">
          <div
            className={`flex items-center gap-1.5 font-medium ${
              currentStep === 1 ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </span>
            <span>Personal Details</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2"></div>
          <div
            className={`flex items-center gap-1.5 font-medium ${
              currentStep === 2 ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </span>
            <span>KYC & Banking</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2"></div>
          <div
            className={`flex items-center gap-1.5 font-medium ${
              currentStep === 3 ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              3
            </span>
            <span>Emergency Contact</span>
          </div>
        </div>
      </div>

      {/* Multi-step Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> 1. Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="9845012345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep(2)}
              >
                Proceed to KYC & Banking <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> 2. KYC & Bank Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  placeholder="12-digit Aadhaar number"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permanent Account Number (PAN) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="Bank Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0000240"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep(3)}
              >
                Proceed to Emergency Contact <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" /> 3. Emergency Contact & Final Declaration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="Name of contact"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent / Sibling"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="9800000000"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                <span>
                  I hereby declare that all information provided in this joining formality form is accurate, complete, and legally valid.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                type="submit"
                variant="success"
                loading={submitting}
                icon={CheckCircle2}
              >
                Submit Joining Formalities
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CandidateJoiningPage;
