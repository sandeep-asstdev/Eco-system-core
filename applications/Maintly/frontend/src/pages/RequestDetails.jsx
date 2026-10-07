import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import { WorkStatusBadge, PriorityBadge } from '../components/StatusBadge.jsx';
import { getMediaUrl, isImageFile, isPdfFile } from '../utils/media.js';
import {
  ArrowLeft, CheckCircle2, XCircle, UserCheck, Wrench, Clock,
  Upload, MessageSquare, AlertTriangle, Paperclip, Plus, FileText,
  RotateCcw, DollarSign, Calendar, MapPin, Building, ShieldCheck,
  CheckSquare, ExternalLink, ChevronRight, AlertCircle, RefreshCw,
  Send, User, Phone, Check, CreditCard, Eye, X, Image as ImageIcon,
  Download, ArrowRight, Printer, Package, ThumbsUp, ThumbsDown
} from 'lucide-react';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Users for Assignment
  const [usersList, setUsersList] = useState([]);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'APPROVE', 'REJECT', 'COMPLETE', 'INVOICE', 'PAYMENT', 'CLOSE', 'UPLOAD_IMAGE', 'IMAGE_PREVIEW'
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  // Form states
  // Approve & Assign
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeContact, setAssigneeContact] = useState('');
  const [approvedCost, setApprovedCost] = useState('');
  const [approvalDeadline, setApprovalDeadline] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // Reject
  const [rejectionReason, setRejectionReason] = useState('');

  // Work Progress / Notes
  const [workNotes, setWorkNotes] = useState('');

  // Completion
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [completionFiles, setCompletionFiles] = useState([]);
  const [completionFilePreviews, setCompletionFilePreviews] = useState([]);

  // Invoice
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceRemarks, setInvoiceRemarks] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Payment
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  // Close Request
  const [closeRemarks, setCloseRemarks] = useState('');

  // Upload Image Modal
  const [uploadImageType, setUploadImageType] = useState('PROBLEM');
  const [uploadImageDescription, setUploadImageDescription] = useState('');
  const [pendingUploadFiles, setPendingUploadFiles] = useState([]);
  const [pendingUploadPreviews, setPendingUploadPreviews] = useState([]);

  // Team Notes & Collaboration
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Dissatisfaction / Reopen
  const [dissatisfactionReason, setDissatisfactionReason] = useState('');

  // Spare Parts & Consumables
  const [materialName, setMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState('1');
  const [materialUnit, setMaterialUnit] = useState('pcs');
  const [materialCost, setMaterialCost] = useState('0');

  const isManagerOrAdmin = ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(role);

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/maintenance/requests/${id}`);
      const data = res.data.data;
      setRequest(data);

      // Pre-fill fields for quick action
      if (data.invoice) {
        setInvoiceNumber(data.invoice.number || '');
        setInvoiceDate(data.invoice.date ? data.invoice.date.slice(0, 10) : '');
        setInvoiceAmount(data.invoice.amount !== null && data.invoice.amount !== undefined ? data.invoice.amount : '');
        setInvoiceRemarks(data.invoice.remarks || '');
      }
      if (data.payment) {
        setPaymentStatus(data.payment.status || 'PAID');
        setPaymentDate(data.payment.date ? data.payment.date.slice(0, 10) : '');
        setPaymentAmount(data.payment.amount !== null && data.payment.amount !== undefined ? data.payment.amount : '');
        setPaymentMethod(data.payment.method || 'Bank Transfer');
        setPaymentRemarks(data.payment.remarks || '');
      }
      if (data.assignedToId) {
        setAssigneeId(data.assignedToId);
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError(err.response?.data?.message || 'Failed to load maintenance request.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/org/users');
      setUsersList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users for assignment', err);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
    fetchUsers();
  }, [id]);

  // Handle Approve + Assign
  const handleApprove = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await api.put(`/maintenance/requests/${id}/approve`, {
        assignedToId: assigneeId || undefined,
        assignedToContact: assigneeContact || undefined,
        approvedCost: approvedCost ? parseFloat(approvedCost) : undefined,
        deadline: approvalDeadline ? new Date(approvalDeadline) : undefined,
        remarks: approvalRemarks || 'Approved and assigned'
      });
      setModalType(null);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setModalError('Please provide a reason for rejection.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await api.put(`/maintenance/requests/${id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      setModalType(null);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Start Work (moves to IN_PROGRESS)
  const handleStartWork = async () => {
    try {
      await api.put(`/maintenance/requests/${id}/status`, {
        workStatus: 'IN_PROGRESS',
        remarks: 'Work commenced by assigned personnel'
      });
      await fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work.');
    }
  };

  // Handle Complete Work
  const handleComplete = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      // If completion images were selected, upload them first
      if (completionFiles.length > 0) {
        const imgForm = new FormData();
        imgForm.append('type', 'COMPLETION');
        imgForm.append('description', completionRemarks || 'Solved / Work Completed');
        completionFiles.forEach(file => {
          imgForm.append('images', file);
        });
        await api.post(`/maintenance/requests/${id}/images`, imgForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await api.put(`/maintenance/requests/${id}/status`, {
        workStatus: 'COMPLETED',
        completionRemarks: completionRemarks || 'Maintenance repair completed.',
        actualCost: actualCost ? parseFloat(actualCost) : undefined
      });

      setModalType(null);
      setCompletionFiles([]);
      setCompletionFilePreviews([]);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to complete work.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Record Invoice
  const handleRecordInvoice = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const invForm = new FormData();
      if (invoiceNumber) invForm.append('invoiceNumber', invoiceNumber);
      if (invoiceDate) invForm.append('invoiceDate', invoiceDate);
      if (invoiceAmount) invForm.append('invoiceAmount', invoiceAmount);
      if (invoiceRemarks) invForm.append('invoiceRemarks', invoiceRemarks);
      if (invoiceFile) invForm.append('invoiceFile', invoiceFile);

      await api.put(`/maintenance/requests/${id}/invoice`, invForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModalType(null);
      setInvoiceFile(null);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to record invoice.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const payForm = new FormData();
      payForm.append('paymentStatus', paymentStatus);
      if (paymentDate) payForm.append('paymentDate', paymentDate);
      if (paymentAmount) payForm.append('paymentAmount', paymentAmount);
      if (paymentMethod) payForm.append('paymentMethod', paymentMethod);
      if (paymentRemarks) payForm.append('paymentRemarks', paymentRemarks);
      if (paymentProofFile) payForm.append('paymentProofFile', paymentProofFile);

      await api.put(`/maintenance/requests/${id}/payment`, payForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModalType(null);
      setPaymentProofFile(null);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Close Request
  const handleCloseRequest = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await api.put(`/maintenance/requests/${id}/close`, {
        remarks: closeRemarks || 'Request verified and closed.'
      });
      setModalType(null);
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to close request.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle direct upload of additional images
  const handleUploadImagesSubmit = async (e) => {
    e.preventDefault();
    if (pendingUploadFiles.length === 0) {
      setModalError('Please select at least one image file.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const form = new FormData();
      form.append('type', uploadImageType);
      form.append('description', uploadImageDescription);
      pendingUploadFiles.forEach(file => {
        form.append('images', file);
      });

      await api.post(`/maintenance/requests/${id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModalType(null);
      setPendingUploadFiles([]);
      setPendingUploadPreviews([]);
      setUploadImageDescription('');
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to upload image(s).');
    } finally {
      setModalLoading(false);
    }
  };

  const handlePendingFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingUploadFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f)
    }));
    setPendingUploadPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleCompletionFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCompletionFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f)
    }));
    setCompletionFilePreviews(prev => [...prev, ...newPreviews]);
  };

  // Handle Add Comment / Team Note
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      await api.post(`/maintenance/requests/${id}/comments`, {
        comment: newComment.trim()
      });
      setNewComment('');
      await fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post note.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Confirm Satisfaction (closes request)
  const handleConfirmSatisfaction = async () => {
    if (!window.confirm('Confirm that maintenance work was inspected and satisfactorily completed?')) return;
    try {
      await api.put(`/maintenance/requests/${id}/satisfaction`, {
        satisfaction: 'SATISFIED'
      });
      await fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm satisfaction.');
    }
  };

  // Handle Dissatisfaction / Reopen
  const handleDissatisfactionSubmit = async (e) => {
    e.preventDefault();
    if (!dissatisfactionReason.trim()) {
      setModalError('Please specify the reason for dissatisfaction.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await api.put(`/maintenance/requests/${id}/satisfaction`, {
        satisfaction: 'DISSATISFIED',
        reason: dissatisfactionReason.trim()
      });
      setModalType(null);
      setDissatisfactionReason('');
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to report dissatisfaction.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Add Spare Part / Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialName.trim()) {
      setModalError('Spare part / material name is required.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await api.post(`/maintenance/requests/${id}/materials`, {
        materialName: materialName.trim(),
        quantity: parseFloat(materialQty) || 1,
        unit: materialUnit.trim() || 'pcs',
        unitCost: parseFloat(materialCost) || 0
      });
      setModalType(null);
      setMaterialName('');
      setMaterialQty('1');
      setMaterialUnit('pcs');
      setMaterialCost('0');
      await fetchRequestDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add spare part.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading maintenance request...</span>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This maintenance request does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </button>
      </div>
    );
  }

  const problemImages = request.problemImages || [];
  const completionImages = request.completionImages || [];
  const timeline = request.timeline || [];
  const invoice = request.invoice || {};
  const payment = request.payment || { status: 'NOT_REQUIRED' };

  const isPendingApproval = ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'NEW'].includes(request.workStatus);
  const isAssigned = request.workStatus === 'ASSIGNED';
  const isInProgress = request.workStatus === 'IN_PROGRESS';
  const isCompleted = request.workStatus === 'COMPLETED';
  const isClosed = request.workStatus === 'CLOSED';
  const isRejected = request.workStatus === 'REJECTED';

  const canApprove = isPendingApproval && isManagerOrAdmin;
  const canStart = (isAssigned || request.workStatus === 'APPROVED' || request.workStatus === 'REOPENED' || isPendingApproval) && (request.assignedToId === user?.id || isManagerOrAdmin || role === 'MAINTENANCE_USER');
  const canComplete = (isInProgress || isAssigned) && (request.assignedToId === user?.id || isManagerOrAdmin || role === 'MAINTENANCE_USER');
  const canInvoice = isCompleted || isClosed;
  const canPay = isCompleted || isClosed;
  const canClose = (isCompleted && payment.status === 'PAID') || (isCompleted && isManagerOrAdmin);
  const canVerifySatisfaction = (request.requesterId === user?.id) || isManagerOrAdmin;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Print Dealership Work Order / Job Card"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Print Job Card</span>
          </button>

          <button
            onClick={fetchRequestDetails}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh details"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Request Card (Section 12 Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Dissatisfaction Warning Banner (if reopened) */}
        {(request.isDissatisfied || request.workStatus === 'REOPENED') && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-amber-950 flex items-center gap-2">
                <span>Request Reopened for Rework (Dissatisfied)</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold">REWORK REQUIRED</span>
              </div>
              <p className="text-amber-800 mt-0.5 font-medium">
                Reason: "{request.dissatisfactionReason || 'Work was not satisfactory and requires corrective repair.'}"
              </p>
              {request.dissatisfiedBy && (
                <span className="text-[10px] text-amber-600 block mt-1">
                  Reported by {request.dissatisfiedBy.firstName} {request.dissatisfiedBy.lastName} on {request.dissatisfiedAt ? new Date(request.dissatisfiedAt).toLocaleString() : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Satisfaction Verification Banner (when COMPLETED) */}
        {isCompleted && !isClosed && (
          <div className="p-4 bg-emerald-50/90 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-950">Maintenance Work Done — Awaiting Verification</h3>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Assigned technician finished the repair. Inspect work quality, then accept to close or report dissatisfaction to reopen.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canVerifySatisfaction ? (
                <>
                  <button
                    onClick={handleConfirmSatisfaction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Confirm Satisfied &amp; Close</span>
                  </button>
                  <button
                    onClick={() => {
                      setDissatisfactionReason('');
                      setModalType('DISSATISFIED');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Reopen (Dissatisfied)</span>
                  </button>
                </>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                  Awaiting Requester Sign-off
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-bold text-slate-900 tracking-tight">
                REQUEST #{request.requestNumber}
              </span>
              <WorkStatusBadge status={request.workStatus} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              {request.subject}
            </h1>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && (
              <>
                <button
                  onClick={() => {
                    setAssigneeId(request.assignedToId || (usersList[0]?.id || ''));
                    setModalType('APPROVE');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Assign</span>
                </button>
                <button
                  onClick={() => setModalType('REJECT')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {canStart && (
              <button
                onClick={handleStartWork}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Start Work</span>
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => setModalType('COMPLETE')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            )}

            {canInvoice && (
              <button
                onClick={() => setModalType('INVOICE')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{invoice.number ? 'Edit Invoice' : 'Record Invoice'}</span>
              </button>
            )}

            {canPay && (
              <button
                onClick={() => setModalType('PAYMENT')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{payment.status === 'PAID' ? 'Edit Payment' : 'Record Payment'}</span>
              </button>
            )}

            {canClose && !isClosed && (
              <button
                onClick={() => setModalType('CLOSE')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Close Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Request Overview Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{request.branch?.name || '-'}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{request.department?.name || '-'}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{request.location || '-'}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned To</span>
            <span className="font-semibold text-indigo-700 text-sm mt-0.5 block">
              {request.assignedTo
                ? `${request.assignedTo.firstName || ''} ${request.assignedTo.lastName || ''}`.trim()
                : <span className="text-slate-400 italic">Not Assigned</span>}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Requester</span>
            <span className="font-medium text-slate-700 mt-0.5 block">
              {request.requester ? `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim() : '-'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contact</span>
            <span className="font-medium text-slate-700 mt-0.5 block">{request.requesterContact || request.requester?.phone || '-'}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category / Type</span>
            <span className="font-medium text-slate-700 mt-0.5 block">{request.maintenanceType?.name || '-'}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Requested Date</span>
            <span className="font-medium text-slate-700 mt-0.5 block">
              {new Date(request.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-6 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Problem Description</span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {request.description || 'No description provided.'}
          </p>
        </div>

        {/* ================= SECTION 1: PROBLEM IMAGES ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Problem Images</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visual proof of the issue captured during request creation or initial inspection
              </p>
            </div>

            <button
              onClick={() => {
                setUploadImageType('PROBLEM');
                setModalType('UPLOAD_IMAGE');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem Image</span>
            </button>
          </div>

          {problemImages.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No problem images uploaded for this request.</p>
              <button
                onClick={() => {
                  setUploadImageType('PROBLEM');
                  setModalType('UPLOAD_IMAGE');
                }}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Upload an image now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {problemImages.map((img) => {
                const fullUrl = getMediaUrl(img.fileUrl);

                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedPreviewImage({ ...img, fullUrl })}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer shadow-2xs hover:shadow-md transition-all"
                  >
                    <img
                      src={fullUrl}
                      alt={img.originalFilename || 'Problem Image'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                      <span className="text-[10px] font-medium truncate">{img.originalFilename || 'problem_image'}</span>
                      <span className="text-[9px] text-slate-300">Click to enlarge</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= SECTION 2: WORK DETAILS & COMPLETION IMAGES ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Work Details & Completion</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Resolution notes, execution timeline, and completion photo proof
              </p>
            </div>

            <button
              onClick={() => {
                setUploadImageType('COMPLETION');
                setModalType('UPLOAD_IMAGE');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Completion Image</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Execution Status</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Assigned To:</span>
                <span className="text-indigo-700 font-semibold">{request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : 'Unassigned'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Started:</span>{' '}
                <span className="text-slate-600">{request.startedAt ? new Date(request.startedAt).toLocaleString() : 'Not started'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Completed:</span>{' '}
                <span className="text-slate-600">{request.completedAt ? new Date(request.completedAt).toLocaleString() : 'Pending completion'}</span>
              </div>
              {request.actualCost > 0 && (
                <div>
                  <span className="font-semibold text-slate-800">Actual Cost:</span>{' '}
                  <span className="text-emerald-700 font-bold">₹{request.actualCost.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Completion Notes</span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {request.completionRemarks || 'No completion remarks recorded yet.'}
              </p>
            </div>
          </div>

          {/* Completion Images Gallery */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Solved / Completion Images</span>
            {completionImages.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
                No completion images uploaded yet. Completion photos can be uploaded when marking the job complete or using the button above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {completionImages.map((img) => {
                  const fullUrl = getMediaUrl(img.fileUrl);

                  return (
                    <div
                      key={img.id}
                      onClick={() => setSelectedPreviewImage({ ...img, fullUrl })}
                      className="group relative rounded-xl overflow-hidden border border-emerald-200 bg-slate-100 aspect-square cursor-pointer shadow-2xs hover:shadow-md transition-all"
                    >
                      <img
                        src={fullUrl}
                        alt={img.originalFilename || 'Completion Image'}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-medium truncate">{img.originalFilename || 'completion_image'}</span>
                        <span className="text-[9px] text-emerald-300 font-semibold">Solved Proof</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 2.5: REPLACEMENT PARTS & MATERIALS ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Replacement Parts &amp; Materials</span>
                {request.materials?.length > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
                    {request.materials.length}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Spare parts, filters, consumables, and hardware used during repair
              </p>
            </div>

            {(isInProgress || isAssigned || isManagerOrAdmin) && (
              <button
                onClick={() => setModalType('ADD_MATERIAL')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spare Part</span>
              </button>
            )}
          </div>

          {(!request.materials || request.materials.length === 0) ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
              No spare parts or consumables logged for this request yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Part / Material</th>
                    <th className="py-2.5 px-3.5">Quantity</th>
                    <th className="py-2.5 px-3.5">Unit Cost (₹)</th>
                    <th className="py-2.5 px-3.5">Total Cost (₹)</th>
                    <th className="py-2.5 px-3.5">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{m.materialName}</td>
                      <td className="py-2.5 px-3.5 text-slate-600">{m.quantity} {m.unit || 'pcs'}</td>
                      <td className="py-2.5 px-3.5 text-slate-600">₹{(m.unitCost || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">₹{(m.totalCost || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 text-slate-500">{m.addedBy ? `${m.addedBy.firstName} ${m.addedBy.lastName}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2 px-3.5 text-right text-slate-600">Total Materials Cost:</td>
                    <td colSpan={2} className="py-2 px-3.5 text-emerald-700">
                      ₹{request.materials.reduce((sum, item) => sum + (item.totalCost || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ================= SECTION 3: INVOICE ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Invoice Details</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Billing invoice reference and uploaded document
              </p>
            </div>

            <button
              onClick={() => setModalType('INVOICE')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{invoice.number ? 'Update Invoice' : 'Record Invoice'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Number</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{invoice.number || 'Not Recorded'}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Date</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Amount</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {invoice.amount !== null && invoice.amount !== undefined ? `₹${parseFloat(invoice.amount).toLocaleString()}` : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Invoice File</span>
              {invoice.url ? (
                <a
                  href={getMediaUrl(invoice.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold mt-1 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View / Download</span>
                </a>
              ) : (
                <span className="text-slate-400 italic mt-0.5 block">No file attached</span>
              )}
            </div>

            {invoice.remarks && (
              <div className="col-span-full pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                <p className="text-slate-600 mt-0.5">{invoice.remarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 4: PAYMENT ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Payment Settlement</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Payment status, proof receipt, and transaction settlement details
              </p>
            </div>

            <button
              onClick={() => setModalType('PAYMENT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{payment.status === 'PAID' ? 'Update Payment' : 'Record Payment'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 ${
                payment.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : payment.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {payment.status || 'NOT REQUIRED'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Date</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Amount Paid</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {payment.amount !== null && payment.amount !== undefined ? `₹${parseFloat(payment.amount).toLocaleString()}` : '-'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Method</span>
              <span className="font-medium text-slate-700 mt-0.5 block">{payment.method || '-'}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Proof / Receipt</span>
              {payment.proofUrl ? (
                <a
                  href={getMediaUrl(payment.proofUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-semibold mt-1 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View Proof</span>
                </a>
              ) : (
                <span className="text-slate-400 italic mt-0.5 block">No proof uploaded</span>
              )}
            </div>

            {payment.remarks && (
              <div className="col-span-full pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Remarks</span>
                <p className="text-slate-600 mt-0.5">{payment.remarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 4.5: TEAM NOTES & COLLABORATION ================= */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Team Notes &amp; Collaboration</span>
                {request.comments?.length > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
                    {request.comments.length}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Internal work notes, technician updates, and team communication
              </p>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {(!request.comments || request.comments.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No notes logged yet. Use the input below to add updates.</p>
            ) : (
              request.comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {c.user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {c.user ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() : 'Staff Member'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold uppercase">
                          {c.user?.role?.replace('_', ' ') || 'Staff'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                      {c.comment}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a team note, technician update, or instructions..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
            <button
              type="submit"
              disabled={commentSubmitting || !newComment.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{commentSubmitting ? 'Posting...' : 'Post Note'}</span>
            </button>
          </form>
        </div>

        {/* ================= SECTION 5: ACTIVITY TIMELINE ================= */}
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Activity History</span>
          </h2>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 pl-8">No activity history recorded yet.</p>
            ) : (
              timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs group pl-1">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                  <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-100 flex-1 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-slate-800">
                        {item.title || item.status || 'Status Change'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp || item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-slate-600 mt-1">{item.description}</p>
                    )}
                    {item.user && (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        By {item.user.firstName || item.user.email}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Printable Job Card Sign-Off Section (Automotive Dealership Work Order) */}
        <div className="hidden print:block p-8 border-t-2 border-slate-900 text-xs mt-6">
          <div className="mb-6 text-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              MAINTLY WORK ORDER &amp; DEALERSHIP JOB CARD
            </h3>
            <p className="text-[10px] text-slate-500">
              Official physical verification and handover form for dealership equipment, bays, and facility maintenance.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="border-t-2 border-slate-800 pt-2 text-center">
              <p className="font-bold text-slate-900">Assigned Technician</p>
              <p className="text-[10px] text-slate-600 mt-1">Signature &amp; Date</p>
            </div>
            <div className="border-t-2 border-slate-800 pt-2 text-center">
              <p className="font-bold text-slate-900">Facility / Service Manager</p>
              <p className="text-[10px] text-slate-600 mt-1">Approved &amp; Quality Checked</p>
            </div>
            <div className="border-t-2 border-slate-800 pt-2 text-center">
              <p className="font-bold text-slate-900">Requester Acceptance</p>
              <p className="text-[10px] text-slate-600 mt-1">Verified &amp; Confirmed Satisfied</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Approve & Assign Modal */}
      <Modal
        isOpen={modalType === 'APPROVE'}
        onClose={() => setModalType(null)}
        title="Approve & Assign Maintenance Request"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApprove} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assign To <span className="text-rose-500">*</span>
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              <option value="">-- Select Person --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role.replace('_', ' ')}) - {u.email}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Can be assigned to any employee, maintenance staff, manager, or vendor.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Completion Date</label>
              <input
                type="datetime-local"
                value={approvalDeadline}
                onChange={(e) => setApprovalDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Approved Amount (₹)</label>
              <input
                type="number"
                placeholder="Optional budget"
                value={approvedCost}
                onChange={(e) => setApprovedCost(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks / Instructions</label>
            <textarea
              rows={3}
              placeholder="Instructions for the assigned person..."
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Approving...' : 'Confirm Approval & Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Reject Modal */}
      <Modal
        isOpen={modalType === 'REJECT'}
        onClose={() => setModalType(null)}
        title="Reject Maintenance Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain clearly why this request is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Mark Complete Modal */}
      <Modal
        isOpen={modalType === 'COMPLETE'}
        onClose={() => setModalType(null)}
        title="Mark Maintenance Work Completed"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleComplete} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Completion Notes / Solution <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe what work was done to resolve the issue..."
              value={completionRemarks}
              onChange={(e) => setCompletionRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Actual Cost Incurred (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5500"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Completion Image(s) / Solved Proof
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCompletionFileSelection}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {completionFilePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {completionFilePreviews.map((p, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 relative">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Mark Completed'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Record Invoice Modal */}
      <Modal
        isOpen={modalType === 'INVOICE'}
        onClose={() => setModalType(null)}
        title="Record Invoice"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRecordInvoice} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Invoice Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. INV-2026-0891"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Invoice Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              step="any"
              placeholder="e.g. 5500"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Invoice File (PDF or Image)</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Invoice Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional invoice notes..."
              value={invoiceRemarks}
              onChange={(e) => setInvoiceRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Record Payment Modal */}
      <Modal
        isOpen={modalType === 'PAYMENT'}
        onClose={() => setModalType(null)}
        title="Record Payment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="NOT_REQUIRED">NOT REQUIRED</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 5500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Proof / Receipt (Image or PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Ref / Transaction UTR #..."
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Close Request Modal */}
      <Modal
        isOpen={modalType === 'CLOSE'}
        onClose={() => setModalType(null)}
        title="Officially Close Maintenance Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCloseRequest} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <p className="text-slate-600">
            Confirming closure will mark this maintenance request officially <strong>CLOSED</strong>. All work, images, invoice, and payment history will remain securely archived in this single record.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Closing Remarks</label>
            <textarea
              rows={3}
              placeholder="Optional closing notes or verification remarks..."
              value={closeRemarks}
              onChange={(e) => setCloseRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Closing...' : 'Confirm Closure'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Upload Additional Images Modal */}
      <Modal
        isOpen={modalType === 'UPLOAD_IMAGE'}
        onClose={() => setModalType(null)}
        title={`Upload ${uploadImageType === 'COMPLETION' ? 'Completion' : 'Problem'} Images`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadImagesSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image Type</label>
            <select
              value={uploadImageType}
              onChange={(e) => setUploadImageType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              <option value="PROBLEM">Problem Image (Issue Proof)</option>
              <option value="COMPLETION">Completion Image (Solved Proof)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Images <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handlePendingFileSelection}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {pendingUploadPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pendingUploadPreviews.map((p, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 relative">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Broken water pipe valve / Replaced valve"
              value={uploadImageDescription}
              onChange={(e) => setUploadImageDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading || pendingUploadFiles.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Uploading...' : 'Upload Image(s)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Full Resolution Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <span className="font-semibold text-xs text-slate-800 truncate">
                {selectedPreviewImage.originalFilename || 'Image Preview'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewImage.fullUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60"
                  title="Open in new tab / download"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedPreviewImage(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 p-2">
              <img
                src={selectedPreviewImage.fullUrl}
                alt="Enlarged Preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
              <span>Type: {selectedPreviewImage.type || 'IMAGE'}</span>
              <span>Uploaded: {new Date(selectedPreviewImage.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. Dissatisfaction / Reopen Modal */}
      <Modal
        isOpen={modalType === 'DISSATISFIED'}
        onClose={() => setModalType(null)}
        title="Report Dissatisfaction &amp; Reopen Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDissatisfactionSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason for Dissatisfaction <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain why the repair was incomplete or not satisfactory so the team can rework it..."
              value={dissatisfactionReason}
              onChange={(e) => setDissatisfactionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading || !dissatisfactionReason.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {modalLoading ? 'Submitting...' : 'Reopen for Rework'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 10. Add Spare Part / Material Modal */}
      <Modal
        isOpen={modalType === 'ADD_MATERIAL'}
        onClose={() => setModalType(null)}
        title="Add Replacement Part / Material"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Part / Material Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hydraulic Ram Seal Kit, 30A Contactor"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={materialQty}
                onChange={(e) => setMaterialQty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                placeholder="pcs, meters, litres"
                value={materialUnit}
                onChange={(e) => setMaterialUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1200"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading || !materialName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {modalLoading ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
