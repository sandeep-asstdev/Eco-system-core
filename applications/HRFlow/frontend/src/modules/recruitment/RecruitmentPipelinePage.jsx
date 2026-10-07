import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Briefcase,
  Star,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Building2,
  X,
  FileCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';

const PIPELINE_STAGES = [
  { id: 'APPLIED', name: 'Applied / Sourced', color: 'border-slate-300 bg-slate-50 text-slate-700' },
  { id: 'SCREENED', name: 'Phone Screened', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { id: 'INTERVIEW', name: 'Interview Scheduled', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { id: 'ASSESSMENT', name: 'Technical / Skill Test', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { id: 'OFFERED', name: 'Offer Extended', color: 'border-indigo-300 bg-indigo-50 text-indigo-700' },
  { id: 'HIRED', name: 'Hired & Ready for Joining', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
];

export const RecruitmentPipelinePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vacancies, setVacancies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Candidate Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    positionId: '',
    experienceYears: 2,
    rating: 4,
    notes: '',
  });

  // Candidate Details / Schedule Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vacRes, branchRes, joinRes] = await Promise.all([
        api.get('/vacancies').catch(() => ({ data: { data: [] } })),
        api.get('/branches').catch(() => ({ data: { data: [] } })),
        api.get('/joining').catch(() => ({ data: { data: [] } })),
      ]);

      const vacList = vacRes.data?.data || [];
      const bList = branchRes.data?.data || [];
      const joinList = joinRes.data?.data || [];

      setVacancies(vacList);
      setBranches(bList);

      // Prepopulate candidates with dealership profiles
      const initialCandidates = [
        {
          id: 'cand-1',
          name: 'Praveen Kumar',
          email: 'praveen.kumar@gmail.com',
          phone: '+91 98450 12345',
          positionTitle: 'Service Advisor',
          branch: 'Hubli Central HQ',
          department: 'Service',
          stage: 'SCREENED',
          rating: 4,
          experienceYears: 4.5,
          appliedDate: '2026-09-20',
        },
        {
          id: 'cand-2',
          name: 'Shweta Kulkarni',
          email: 'shweta.k@outlook.com',
          phone: '+91 94481 67890',
          positionTitle: 'Customer Care Executive',
          branch: 'Hubli Central HQ',
          department: 'Sales',
          stage: 'INTERVIEW',
          rating: 5,
          experienceYears: 3,
          appliedDate: '2026-09-18',
        },
        {
          id: 'cand-3',
          name: 'Ramesh Patil',
          email: 'ramesh.mechanic@yahoo.com',
          phone: '+91 91102 33445',
          positionTitle: 'Diagnostic Master Technician',
          branch: 'Dharwad Service & Bodyshop',
          department: 'Service',
          stage: 'ASSESSMENT',
          rating: 4,
          experienceYears: 6,
          appliedDate: '2026-09-15',
        },
        {
          id: 'cand-4',
          name: 'Deepak Hegde',
          email: 'deepak.hegde@gmail.com',
          phone: '+91 99800 55667',
          positionTitle: 'Parts & Accessories Specialist',
          branch: 'Belgaum Auto Hub',
          department: 'Spares',
          stage: 'OFFERED',
          rating: 4,
          experienceYears: 5,
          appliedDate: '2026-09-12',
        },
        {
          id: 'cand-5',
          name: 'Anil Desai',
          email: 'anil.desai@gmail.com',
          phone: '+91 94812 77889',
          positionTitle: 'Sales Consultant — New Cars',
          branch: 'Hubli Central HQ',
          department: 'Sales',
          stage: 'HIRED',
          rating: 5,
          experienceYears: 2,
          appliedDate: '2026-09-10',
        },
        {
          id: 'cand-6',
          name: 'Vikram Joshi',
          email: 'vikram.joshi@gmail.com',
          phone: '+91 98860 99887',
          positionTitle: 'Bodyshop Painter',
          branch: 'Dharwad Service & Bodyshop',
          department: 'Bodyshop',
          stage: 'APPLIED',
          rating: 3,
          experienceYears: 4,
          appliedDate: '2026-09-24',
        },
      ];

      // Add actual joining records into HIRED stage if any
      joinList.forEach((j) => {
        initialCandidates.push({
          id: `join-${j.id}`,
          name: j.candidateName,
          email: j.candidateEmail,
          phone: j.candidatePhone,
          positionTitle: j.designation,
          branch: j.branch?.name || 'Hubli HQ',
          department: j.department,
          stage: 'HIRED',
          rating: 5,
          experienceYears: 3,
          appliedDate: j.createdAt,
          joiningRecordToken: j.token,
        });
      });

      setCandidates(initialCandidates);
    } catch (err) {
      console.error('Failed to load recruitment pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveStage = (candId, direction) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candId) return c;
        const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === c.stage);
        const nextIdx = currentIdx + direction;
        if (nextIdx < 0 || nextIdx >= PIPELINE_STAGES.length) return c;
        return { ...c, stage: PIPELINE_STAGES[nextIdx].id };
      })
    );
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    const pos = vacancies.find((v) => v.id === newCandidate.positionId);
    const candidate = {
      id: `cand-${Date.now()}`,
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      positionTitle: pos?.title || 'Dealership Executive',
      branch: pos?.branch?.name || 'Hubli Central HQ',
      department: pos?.department || 'Operations',
      stage: 'APPLIED',
      rating: newCandidate.rating,
      experienceYears: Number(newCandidate.experienceYears),
      appliedDate: new Date().toISOString().split('T')[0],
      notes: newCandidate.notes,
    };

    setCandidates([candidate, ...candidates]);
    setShowAddModal(false);
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      positionId: '',
      experienceYears: 2,
      rating: 4,
      notes: '',
    });
  };

  const handleConvertDirectToJoining = async (cand) => {
    setActionLoading(true);
    try {
      // Create joining record via backend
      const res = await api.post('/joining', {
        candidateName: cand.name,
        candidateEmail: cand.email,
        candidatePhone: cand.phone,
        designation: cand.positionTitle,
        department: cand.department,
        branchId: branches[0]?.id || '',
        joiningDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      alert(`Candidate onboarded! Digital onboarding token generated for ${cand.name}.`);
      navigate('/joining');
    } catch (err) {
      console.error('Failed to convert to joining record:', err);
      // Navigate to joining page as fallback
      navigate('/joining');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (selectedVacancy !== 'ALL' && c.positionTitle !== selectedVacancy) return false;
    if (
      searchQuery &&
      !`${c.name} ${c.positionTitle} ${c.department} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <UserPlus className="w-4 h-4" />
            <span>Talent Acquisition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Recruitment Pipeline (ATS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Horilla-style Kanban applicant tracking & dealership interview stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/vacancies')}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>Manage Vacancies</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name, role or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedVacancy}
              onChange={(e) => setSelectedVacancy(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Roles / Openings</option>
              {vacancies.map((v) => (
                <option key={v.id} value={v.title}>
                  {v.title} ({v.positionCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Candidates in Pipeline: <span className="font-bold text-slate-900">{filteredCandidates.length}</span>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      {loading ? (
        <div className="h-96 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading recruitment pipeline...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage, sIdx) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3 flex flex-col min-w-[240px] max-h-[750px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                    <h3 className="text-xs font-bold text-slate-800 truncate" title={stage.name}>
                      {stage.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {stageCandidates.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-[11px] text-slate-400">
                      No candidates
                    </div>
                  ) : (
                    stageCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between gap-2.5"
                      >
                        {/* Top: Name & Rating */}
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{cand.name}</h4>
                            <div className="flex items-center text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span className="text-[10px] font-bold text-slate-700 ml-0.5">{cand.rating}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-indigo-700 font-semibold truncate mt-0.5">
                            {cand.positionTitle}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{cand.branch}</span>
                          </div>
                        </div>

                        {/* Experience & Contact */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{cand.experienceYears}y exp</span>
                          <span className="text-slate-400">{cand.phone}</span>
                        </div>

                        {/* Stage Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            disabled={sIdx === 0}
                            onClick={() => moveStage(cand.id, -1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          {stage.id === 'HIRED' ? (
                            <button
                              onClick={() => handleConvertDirectToJoining(cand)}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[10px] flex items-center gap-1 border border-emerald-200"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Onboard</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="text-slate-500 hover:text-indigo-600 font-medium text-[10px]"
                            >
                              Details
                            </button>
                          )}

                          <button
                            disabled={sIdx === PIPELINE_STAGES.length - 1}
                            onClick={() => moveStage(cand.id, 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="Move forward"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCandidate}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Candidate to ATS</h3>
                <p className="text-xs text-slate-500">Record a new candidate profile into pipeline</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="Candidate full name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  placeholder="candidate@email.com"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (10 digits)</label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9845012345"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Applying For Position</label>
              <select
                required
                value={newCandidate.positionId}
                onChange={(e) => setNewCandidate({ ...newCandidate, positionId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="">-- Select Vacancy --</option>
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title} ({v.positionCode}) - {v.branch?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={newCandidate.experienceYears}
                  onChange={(e) => setNewCandidate({ ...newCandidate, experienceYears: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Rating (1-5)</label>
                <select
                  value={newCandidate.rating}
                  onChange={(e) => setNewCandidate({ ...newCandidate, rating: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value={5}>5 Stars (Exceptional)</option>
                  <option value={4}>4 Stars (Strong Fit)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Borderline)</option>
                  <option value={1}>1 Star (Low)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Add to Pipeline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedCandidate.name}</h3>
                <p className="text-xs text-indigo-700 font-semibold">{selectedCandidate.positionTitle}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{selectedCandidate.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800">{selectedCandidate.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience:</span>
                <span className="text-slate-800 font-bold">{selectedCandidate.experienceYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stage:</span>
                <span className="font-bold text-indigo-700">{selectedCandidate.stage}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Schedule Interview / Test Date
              </label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleConvertDirectToJoining(selectedCandidate);
                  setSelectedCandidate(null);
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fast-track to Joining</span>
              </button>

              <button
                onClick={() => {
                  alert(`Interview scheduled for ${selectedCandidate.name} at ${interviewDate || 'selected time'}.`);
                  setSelectedCandidate(null);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPipelinePage;
