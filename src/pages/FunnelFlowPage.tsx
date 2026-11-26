import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  ExternalLink,
  RefreshCw,
  Search,
  Tag,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Building,
  Car,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronDown,
  RotateCcw,
  FileText,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export interface FunnelLead {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  vehicleInterest: string;
  duration: string;
  stage: 'New' | 'Contacted' | 'In Discussion' | 'Converted' | 'Lost';
  source: string;
  assignedAgent: string;
  date: string;
  notes: string;
}

export const FunnelFlowPage: React.FC = () => {
  const { customer, agentName } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'create' | 'existing'>('create');
  const [iframeKey, setIframeKey] = useState(0);

  // Form State for "Create Lead"
  const [leadCustomerName, setLeadCustomerName] = useState(
    customer.name && customer.name !== '—' ? customer.name : ''
  );
  const [leadPhone, setLeadPhone] = useState(
    customer.mobile && customer.mobile !== '—' ? customer.mobile : ''
  );
  const [leadEmail, setLeadEmail] = useState(
    customer.email && customer.email !== '—' ? customer.email : ''
  );
  const [vehicleCategory, setVehicleCategory] = useState('Compact SUV / Crossover');
  const [duration, setDuration] = useState('Weekly (7 Days)');
  const [leadSource, setLeadSource] = useState('Inbound Phone Call');
  const [leadNotes, setLeadNotes] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [createdResult, setCreatedResult] = useState<{
    success: boolean;
    message: string;
    leadId: string;
  } | null>(null);

  // Existing Leads Pipeline State
  const [leadsList, setLeadsList] = useState<FunnelLead[]>([
    {
      id: 'FF-2026-11-0892',
      customerName: customer.name && customer.name !== '—' ? customer.name : 'Ahmad Alkiswani',
      phone: customer.mobile && customer.mobile !== '—' ? customer.mobile : '+971559597844',
      email: customer.email && customer.email !== '—' ? customer.email : 'example_Ahkiswani@gmail.com',
      vehicleInterest: 'Premium SUV • BMW X2 xDrive',
      duration: 'Weekly (7 Days)',
      stage: 'Contacted',
      source: 'Inbound Phone Call',
      assignedAgent: agentName || 'Agent Workspace',
      date: '2026-11-25',
      notes: 'Customer interested in weekly rental rates for BMW X2. Follow-up scheduled.',
    },
    {
      id: 'FF-2026-11-0641',
      customerName: customer.name && customer.name !== '—' ? customer.name : 'Ahmad Alkiswani',
      phone: customer.mobile && customer.mobile !== '—' ? customer.mobile : '+971559597844',
      email: customer.email && customer.email !== '—' ? customer.email : 'example_Ahkiswani@gmail.com',
      vehicleInterest: 'Sedan • Monthly Long-term Lease',
      duration: 'Monthly Lease (3 Months)',
      stage: 'Converted',
      source: 'Website Inquiry',
      assignedAgent: agentName || 'Agent Workspace',
      date: '2026-10-18',
      notes: 'Converted to active rental DXBBDLY01160.',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState(
    customer.mobile && customer.mobile !== '—'
      ? customer.mobile
      : customer.email && customer.email !== '—'
      ? customer.email
      : ''
  );
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const iframeSrc = 'https://funnelflow.agmcgroup.ae/dashboard';

  // Handle Create Lead Submission
  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!leadCustomerName.trim()) errors.leadCustomerName = 'Please enter customer name.';
    if (!leadPhone.trim() && !leadEmail.trim()) {
      errors.leadPhone = 'Please provide either mobile or email.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingLead(true);
    setCreatedResult(null);

    setTimeout(() => {
      const generatedId = `FF-2026-11-${Math.floor(1000 + Math.random() * 9000)}`;
      const newLead: FunnelLead = {
        id: generatedId,
        customerName: leadCustomerName.trim(),
        phone: leadPhone.trim() || '—',
        email: leadEmail.trim() || '—',
        vehicleInterest: vehicleCategory,
        duration: duration,
        stage: 'New',
        source: leadSource,
        assignedAgent: agentName || 'Agent Workspace',
        date: new Date().toISOString().split('T')[0],
        notes: leadNotes.trim() || 'Direct lead created via CRM Agent Workspace',
      };

      setLeadsList((prev) => [newLead, ...prev]);
      setIsSubmittingLead(false);
      setCreatedResult({
        success: true,
        message: `Lead ${generatedId}`,
        leadId: generatedId,
      });
    }, 600);
  };

  // Update lead stage in-place
  const handleStageChange = (leadId: string, newStage: FunnelLead['stage']) => {
    setLeadsList((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: newStage } : lead))
    );
  };

  // Filtered Leads
  const filteredLeads = leadsList.filter((l) => {
    const matchesStage = stageFilter === 'all' || l.stage.toLowerCase() === stageFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStage;
    const matchesQuery =
      l.id.toLowerCase().includes(q) ||
      l.customerName.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.vehicleInterest.toLowerCase().includes(q) ||
      l.stage.toLowerCase().includes(q);
    return matchesStage && matchesQuery;
  });

  // Pipeline metrics
  const totalCount = leadsList.length;
  const activeCount = leadsList.filter(
    (l) => l.stage === 'New' || l.stage === 'Contacted' || l.stage === 'In Discussion'
  ).length;
  const convertedCount = leadsList.filter((l) => l.stage === 'Converted').length;

  return (
    <div className="flex-1 w-full h-full bg-slate-50/70 p-3 flex flex-col overflow-hidden select-text">
      {/* Sleek Sub-Tabs Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs shrink-0 mb-3">
        {/* Real Segmented Tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Lead</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'existing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Existing Lead</span>
            <span className="ml-1 bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {totalCount}
            </span>
          </button>
        </div>

        {/* Quick Actions */}
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
            href={iframeSrc}
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

      {/* VIEW 1: Create Lead Tab (Form commented out, Official FunnelFlow Iframe active) */}
      {activeTab === 'create' && (
        <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-hidden">
          {/* =========================================================================
              [COMMENTED OUT AS REQUESTED: Create FunnelFlow Lead Form Portion]
              To re-enable, uncomment the JSX block below:
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-3 animate-fade-in shrink-0">
            {/*  Header  * /}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    Create FunnelFlow Lead
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Capture customer rental inquiries, vehicle preferences, and pipeline stage
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Agent: <span className="font-semibold text-slate-800 ml-1">{agentName || 'Agent'}</span>
                </span>
                {(leadCustomerName || leadNotes) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLeadCustomerName(customer.name && customer.name !== '—' ? customer.name : '');
                      setLeadPhone(customer.mobile && customer.mobile !== '—' ? customer.mobile : '');
                      setLeadEmail(customer.email && customer.email !== '—' ? customer.email : '');
                      setLeadNotes('');
                      setFormErrors({});
                      setCreatedResult(null);
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

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3">
              {/*  Form Grid  * /}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/*  Customer Name (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Customer Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={leadCustomerName}
                      onChange={(e) => {
                        setLeadCustomerName(e.target.value);
                        if (formErrors.leadCustomerName) setFormErrors((p) => ({ ...p, leadCustomerName: '' }));
                      }}
                      placeholder="Customer full name"
                      className={`w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border rounded-lg transition-all focus:bg-white focus:outline-hidden ${
                        formErrors.leadCustomerName
                          ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-200'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>

                {/*  Mobile No (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={leadPhone}
                      onChange={(e) => {
                        setLeadPhone(e.target.value);
                        if (formErrors.leadPhone) setFormErrors((p) => ({ ...p, leadPhone: '' }));
                      }}
                      placeholder="+971 5X XXX XXXX"
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/*  Email (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="customer@domain.com"
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                    />
                  </div>
                </div>

                {/*  Vehicle Interest (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vehicle Category Interest
                  </label>
                  <div className="relative">
                    <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                      className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer outline-hidden"
                    >
                      <option value="Economy Sedan (Nissan Sunny / similar)">Economy Sedan (Nissan Sunny / similar)</option>
                      <option value="Compact SUV / Crossover">Compact SUV / Crossover</option>
                      <option value="Premium SUV (BMW X2 / similar)">Premium SUV (BMW X2 / similar)</option>
                      <option value="Mid-Size Sedan">Mid-Size Sedan</option>
                      <option value="Commercial / 7-Seater Van">Commercial / 7-Seater Van</option>
                      <option value="Monthly Corporate Lease Fleet">Monthly Corporate Lease Fleet</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>

                {/*  Rental Duration (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Rental Duration
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer outline-hidden"
                    >
                      <option value="Daily (1-3 Days)">Daily (1-3 Days)</option>
                      <option value="Weekly (7 Days)">Weekly (7 Days)</option>
                      <option value="Fortnight (14 Days)">Fortnight (14 Days)</option>
                      <option value="Monthly Lease (30+ Days)">Monthly Lease (30+ Days)</option>
                      <option value="Long Term Annual Lease">Long Term Annual Lease</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>

                {/*  Source (4 cols)  * /}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer outline-hidden"
                    >
                      <option value="Inbound Phone Call">Inbound Phone Call</option>
                      <option value="Website Inquiry Form">Website Inquiry Form</option>
                      <option value="WhatsApp Business Chat">WhatsApp Business Chat</option>
                      <option value="Airport Counter Walk-in">Airport Counter Walk-in</option>
                      <option value="Corporate Referral">Corporate Referral</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>

                {/*  Inquiry Notes (12 cols)  * /}
                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Inquiry Notes / Customer Requirements
                  </label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="Add any specific vehicle requests, pickup airport preference, or rate inquiries..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/60 border border-slate-300 rounded-lg transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {/*  Submit Action Footer  * /}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs">
                  {createdResult && (
                    <div className="flex items-center space-x-2 font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="select-text font-semibold">{createdResult.message}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdResult.leadId, 'created-lead')}
                        className="p-1 rounded-md bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                        title="Copy Lead ID"
                      >
                        {copiedKey === 'created-lead' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-emerald-600 hover:text-emerald-800" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ml-auto"
                >
                  {isSubmittingLead ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Lead...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          ============================================================================= */}

          {/* Embedded Iframe Container */}
          <div className="flex-1 w-full h-full bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden relative">
            <iframe
              key={`${iframeKey}-create`}
              src={iframeSrc}
              title="Create Lead - Funnel Flow"
              height="100%"
              width="100%"
              style={{ overflow: 'auto', border: 'none', minHeight: '100%' }}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Existing Lead Tab (Pipeline Table commented out, Official FunnelFlow Iframe active) */}
      {activeTab === 'existing' && (
        <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-hidden">
          {/* =========================================================================
              [COMMENTED OUT AS REQUESTED: FunnelFlow Sales Pipeline & Leads Table Portion]
              To re-enable, uncomment the JSX block below:
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex-1 overflow-y-auto animate-fade-in flex flex-col">
          {/*  Header & KPI Summary Row  * /}
          <div className="pb-3 mb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    FunnelFlow Sales Pipeline &amp; Leads
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Track, qualify, and update existing inquiries in the conversion funnel
                  </p>
                </div>
              </div>

              {/*  KPI Badges  * /}
              <div className="flex items-center space-x-2 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none">Total</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{totalCount} Leads</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] text-blue-500 block font-semibold leading-none">In Follow-up</span>
                  <span className="font-mono font-bold text-blue-700 text-xs">{activeCount} Active</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] text-emerald-600 block font-semibold leading-none">Won</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs">{convertedCount} Converted</span>
                </div>
              </div>
            </div>

            {/*  Filter and Search Bar  * /}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              {/*  Stage Filter Buttons  * /}
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 space-x-1 text-[11px]">
                {['all', 'New', 'Contacted', 'In Discussion', 'Converted'].map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setStageFilter(stage)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      stageFilter === stage
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {stage === 'all' ? 'All Stages' : stage}
                  </button>
                ))}
              </div>

              {/*  Search Input  * /}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Lead ID, Name, Phone..."
                  className="w-full text-xs pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/*  Leads Table  * /}
          <div className="flex-1 overflow-x-auto min-h-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3">Lead ID</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Contact</th>
                  <th className="py-2 px-3">Vehicle Interest</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Stage / Status</th>
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/*  Lead ID  * /}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700 select-text">
                            {lead.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(lead.id, lead.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title="Copy Lead ID"
                          >
                            {copiedKey === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
          ============================================================================= */}

          {/* Embedded Iframe Container */}
          <div className="flex-1 w-full h-full bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden relative">
            <iframe
              key={`${iframeKey}-existing`}
              src={iframeSrc}
              title="Existing Lead - Funnel Flow"
              height="100%"
              width="100%"
              style={{ overflow: 'auto', border: 'none', minHeight: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
