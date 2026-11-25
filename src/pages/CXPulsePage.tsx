import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronDown,
  X,
  User,
  Tag,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { apiService } from '../services/apiService';
import { Badge } from '../components/common/Badge';

export const CXPulsePage: React.FC = () => {
  const { customer, agentName } = useWorkspace();

  // Active tab: 'create' (Create Ticket) by default, or 'status' (Ticket Status)
  const [activeAction, setActiveAction] = useState<'create' | 'status'>('create');

  // Create Ticket Form State
  const [customerName, setCustomerName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [createResult, setCreateResult] = useState<{
    success: boolean;
    message: string;
    ticketNumber?: string;
    data?: any;
  } | null>(null);

  // Status Lookup Form State
  const [lookupTicketId, setLookupTicketId] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    message?: string;
    data?: any;
  } | null>(null);

  // Iframe state
  const [iframeKey, setIframeKey] = useState(0);
  const iframeUrl = 'https://cxpulse.agmcgroup.ae/login';

  // Sync active customer name
  useEffect(() => {
    const validName =
      customer.name && customer.name !== '—' && !customer.name.toLowerCase().includes('not found')
        ? customer.name.trim()
        : customer.email && customer.email !== '—'
        ? customer.email.split('@')[0]
        : '';
    if (validName) {
      setCustomerName(validName);
    }
  }, [customer.name, customer.email]);

  // Handle Create Lead / Ticket Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.customerName = 'Please fill out this field.';
    if (!subject.trim()) errors.subject = 'Please fill out this field.';
    if (!description.trim()) errors.description = 'Please fill out this field.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setCreateResult(null);

    const res = await apiService.createCXPulseTicket({
      customerName: customerName.trim() || 'Valued Customer',
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      const tNum = res.data.ticketNumber || res.data.ticketId || '';
      setCreateResult({
        success: true,
        message: `Ticket ${tNum} successfully created in CXPulse!`,
        ticketNumber: tNum,
        data: res.data,
      });
      if (tNum) {
        setLookupTicketId(tNum);
      }
    } else {
      setCreateResult({
        success: false,
        message: res.error || 'Failed to create ticket in CXPulse.',
        data: res.data,
      });
    }
  };

  // Handle Ticket Status Lookup
  const handleStatusLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupTicketId.trim()) {
      setLookupError('Please fill out this field.');
      return;
    }

    setLookupError(null);
    setIsFetchingStatus(true);
    setStatusResult(null);

    const res = await apiService.getCXPulseTicketStatus(lookupTicketId.trim());
    setIsFetchingStatus(false);

    if (res.success && res.data) {
      setStatusResult({
        success: true,
        data: res.data,
      });
    } else {
      setStatusResult({
        success: false,
        message: res.error || `Could not find ticket #${lookupTicketId}`,
      });
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-50/70 p-3 flex flex-col overflow-hidden select-text">
      {/* Top Action Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs shrink-0 mb-3">
        {/* The 2 Requested Buttons: 'Create Ticket' & 'Ticket Status' */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 space-x-1">
          <button
            type="button"
            onClick={() => setActiveAction('create')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeAction === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('status')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeAction === 'status'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Ticket Status</span>
          </button>
        </div>

        {/* Right: Quick actions for the embedded portal */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
            title="Reload Frame"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            title="Open in new window"
          >
            <span className="hidden sm:inline">Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Action Drawer 1: Create Lead / Ticket Form */}
      {activeAction === 'create' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-3 animate-fade-in shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Create CXPulse Ticket
                </h3>
                <p className="text-[10px] text-slate-500">
                  Log customer grievances, inquiries, or support requests directly into CXPulse
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Agent: <span className="font-semibold text-slate-800 ml-1">{agentName || 'Agent'}</span>
              </span>
              {(customerName || subject || description) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerName(customer.name && customer.name !== '—' ? customer.name : '');
                    setSubject('');
                    setDescription('');
                    setFormErrors({});
                    setCreateResult(null);
                  }}
                  className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Reset form fields"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3">
            {/* Form Fields Grid: 2 balanced rows */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Customer Name (4 cols) */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.customerName) setFormErrors((p) => ({ ...p, customerName: '' }));
                    }}
                    placeholder="Customer full name"
                    className={`w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border rounded-lg transition-all focus:bg-white focus:outline-hidden ${
                      formErrors.customerName
                        ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>

              {/* Subject (8 cols) */}
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Subject / Summary <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (formErrors.subject) setFormErrors((p) => ({ ...p, subject: '' }));
                    }}
                    placeholder="e.g. Deposit Refund Status or Booking Modification Inquiry"
                    className={`w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border rounded-lg transition-all focus:bg-white focus:outline-hidden ${
                      formErrors.subject
                        ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>

              {/* Priority Dropdown (4 cols) */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer outline-hidden"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Description / Details (8 cols) */}
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description / Complaint Details <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formErrors.description) setFormErrors((p) => ({ ...p, description: '' }));
                    }}
                    placeholder="Enter detailed description of complaint or customer inquiry..."
                    className={`w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border rounded-lg transition-all focus:bg-white focus:outline-hidden resize-none ${
                      formErrors.description
                        ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-200'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs">
                {createResult && (
                  <div
                    className={`flex items-center space-x-1.5 font-medium px-2.5 py-1 rounded-lg ${
                      createResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {createResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{createResult.message}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Drawer 2: Ticket Status Lookup Form */}
      {activeAction === 'status' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-3 animate-fade-in shrink-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Check CXPulse Ticket Status
                </h3>
                <p className="text-[10px] text-slate-500">
                  Search live ticket status, assignment, and SLA metrics
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleStatusLookup} className="space-y-2">
            <div className="flex items-center space-x-2 max-w-xl">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={lookupTicketId}
                  onChange={(e) => {
                    setLookupTicketId(e.target.value);
                    if (lookupError) setLookupError(null);
                  }}
                  placeholder="e.g. TKT-2026-11-0019 or TKT-2026-09-0003"
                  className={`w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border rounded-lg font-mono transition-all focus:bg-white focus:outline-hidden ${
                    lookupError
                      ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-200'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isFetchingStatus}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                {isFetchingStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Result Card */}
          {statusResult && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              {statusResult.success && statusResult.data ? (
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                      Ticket No.
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {statusResult.data.ticketNumber || lookupTicketId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                      Status
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                      {statusResult.data.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                      Priority / Dept
                    </span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {statusResult.data.priority || 'High'} • {statusResult.data.department || 'CRM'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                      SLA Status
                    </span>
                    <span className={`font-semibold ${statusResult.data.slaBreached ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {statusResult.data.slaBreached ? 'Breached' : 'On Target'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-rose-600 font-medium flex items-center space-x-1.5 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{statusResult.message}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Embedded Iframe Below that with https://cxpulse.agmcgroup.ae/login */}
      <div className="flex-1 w-full h-full bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden relative">
        <iframe
          key={iframeKey}
          src={iframeUrl}
          title="CX Pulse"
          height="100%"
          width="100%"
          style={{ overflow: 'auto', border: 'none', minHeight: '100%' }}
        />
      </div>
    </div>
  );
};
