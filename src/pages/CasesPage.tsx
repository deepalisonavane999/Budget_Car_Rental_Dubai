import React, { useState } from 'react';
import {
  Clock,
  Phone,
  Calendar,
  UserCheck,
  RefreshCw,
  TrendingUp,
  Paperclip,
  Send,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CaseDetails } from '../types/crm.types';
import { useNavigate } from 'react-router-dom';

export const CasesPage: React.FC = () => {
  const { customer, caseDetails, updateCaseStatus, addCaseReply, agentName, agentInitials } =
    useWorkspace();
  const navigate = useNavigate();

  const [activeThreadTab, setActiveThreadTab] = useState<
    'replies' | 'internal' | 'attachments' | 'audit'
  >('internal');

  const [replyMode, setReplyMode] = useState<'customer' | 'internal'>('customer');
  const [composerText, setComposerText] = useState(
    `Dear ${customer.name},\nThank you for contacting us regarding your deposit refund for ${caseDetails.relatedRentalNo}. We are currently checking the status with our Finance team and will update you by today at 16:00.\n\nBest regards,\n${agentName}\nAGMC | Budget Rent a Car`
  );
  const [templateSelected, setTemplateSelected] = useState('');

  const templates: Record<string, string> = {
    refund_status: `Dear ${customer.name},\nThank you for contacting us regarding your deposit refund for ${caseDetails.relatedRentalNo}. We are currently checking the status with our Finance team and will update you by today at 16:00.\n\nBest regards,\n${agentName}\nAGMC | Budget Rent a Car`,
    sla_extension: `Dear ${customer.name},\nWe require an additional 24 hours to finalize reconciliation with the banking provider. We will follow up with you tomorrow morning.\n\nBest regards,\n${agentName}`,
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTemplateSelected(val);
    if (templates[val]) {
      setComposerText(templates[val]);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;
    addCaseReply(composerText.trim(), replyMode === 'internal');
    alert('Message posted to case thread!');
  };

  return (
    <div className="flex-1 flex flex-col justify-start overflow-hidden p-2 space-y-2 animate-fade-in select-none">
      {/* 1. Case Metadata Header Card */}
      <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-1.5 shrink-0">
        {/* Case Title Row */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              Case {caseDetails.ticketNo} — {caseDetails.title}
            </h2>
            <Badge variant="amber" className="text-[10px] py-0 px-1.5">
              {caseDetails.status}
            </Badge>
          </div>

          <div className="relative">
            <select
              value={caseDetails.status}
              onChange={(e) => updateCaseStatus(e.target.value as CaseDetails['status'])}
              className="pl-2 pr-6 py-0.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Metadata Row 1 */}
        <div className="grid grid-cols-6 gap-2 text-[10px] pt-0.5">
          <div>
            <span className="text-slate-400 block">Ticket No.</span>
            <span className="font-bold text-slate-900 font-mono text-[11px]">
              {caseDetails.ticketNo}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Related Rental</span>
            <button
              onClick={() => navigate('/billing')}
              className="font-bold text-blue-600 hover:underline block text-left text-[11px]"
            >
              {caseDetails.relatedRentalNo}
            </button>
            <span className="text-slate-500 truncate block text-[9px]">
              {caseDetails.relatedRentalSubtitle}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Created On</span>
            <span className="font-bold text-slate-800 text-[11px] block">
              {caseDetails.createdOn.split(' ')[0]}
            </span>
            <span className="text-slate-400 font-mono text-[9px]">
              {caseDetails.createdOn.split(' ')[1] || '14:28'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Latest Update</span>
            <span className="font-bold text-slate-800 text-[11px] block">
              {caseDetails.latestUpdate.split(' ')[0]}
            </span>
            <span className="text-slate-400 font-mono text-[9px]">
              {caseDetails.latestUpdate.split(' ')[1] || '10:16'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Owner (Dept)</span>
            <span className="font-bold text-slate-900 text-[11px] block">
              {caseDetails.ownerDepartment}
            </span>
            <span className="text-slate-500 truncate block text-[9px]">
              {caseDetails.ownerName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Priority</span>
            <div className="flex items-center space-x-1 text-blue-600 font-bold text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{caseDetails.priority}</span>
            </div>
          </div>
        </div>

        {/* Metadata Row 2 */}
        <div className="grid grid-cols-8 gap-2 text-[10px] pt-1 border-t border-slate-100">
          <div>
            <span className="text-slate-400 block">Classification</span>
            <span className="font-semibold text-slate-800">{caseDetails.classification}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-800">{caseDetails.department}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Category</span>
            <span className="font-semibold text-slate-800">{caseDetails.category}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Subcategory</span>
            <span className="font-semibold text-slate-800">{caseDetails.subcategory}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Branch</span>
            <span className="font-semibold text-slate-800 truncate block">
              {caseDetails.branch}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Channel</span>
            <div className="flex items-center space-x-1 font-semibold text-slate-800">
              <Phone className="w-2.5 h-2.5 text-blue-600" />
              <span>{caseDetails.channel}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block">SLA Due</span>
            <div className="flex items-center space-x-0.5 text-amber-700 font-semibold text-[10px]">
              <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
              <span>{caseDetails.slaDue}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block">Callback</span>
            <div className="flex items-center space-x-0.5 text-blue-600 font-bold text-[10px]">
              <Calendar className="w-2.5 h-2.5" />
              <span>{caseDetails.callbackTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Thread on Left + Actions on Right */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* Left: Thread Tabs & Message List & Reply Composer */}
        <div className="col-span-8 bg-white border border-slate-200 rounded p-2.5 shadow-2xs flex flex-col justify-between overflow-hidden">
          {/* Subtabs */}
          <div className="flex items-center space-x-1 border-b border-slate-200 text-[11px] font-semibold shrink-0">
            <button
              onClick={() => setActiveThreadTab('replies')}
              className={`pb-1 px-2.5 border-b-2 transition-colors ${
                activeThreadTab === 'replies'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Customer Replies
            </button>
            <button
              onClick={() => setActiveThreadTab('internal')}
              className={`pb-1 px-2.5 border-b-2 transition-colors ${
                activeThreadTab === 'internal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Internal Thread
            </button>
            <button
              onClick={() => setActiveThreadTab('attachments')}
              className={`pb-1 px-2.5 border-b-2 transition-colors ${
                activeThreadTab === 'attachments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Attachments (2)
            </button>
            <button
              onClick={() => setActiveThreadTab('audit')}
              className={`pb-1 px-2.5 border-b-2 transition-colors ${
                activeThreadTab === 'audit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit History (6)
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-1.5 py-1.5 pr-1 min-h-0">
            {caseDetails.thread.map((msg) => (
              <div
                key={msg.id}
                className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div
                      className={`w-5 h-5 rounded-full text-white font-bold flex items-center justify-center text-[9px] ${msg.avatarBg}`}
                    >
                      {msg.avatarInitials}
                    </div>
                    <span className="font-bold text-slate-800 text-[11px]">{msg.author}</span>
                    <span className="text-[10px] text-slate-400">
                      {msg.role} • {msg.timestamp}
                    </span>
                    {msg.isInternal && (
                      <span className="px-1 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-semibold">
                        Internal Only
                      </span>
                    )}
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-slate-700 whitespace-pre-line pl-6 text-[10px] leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          {/* Composer Form */}
          <form
            onSubmit={handleSendReply}
            className="pt-1.5 border-t border-slate-200 space-y-1.5 text-[11px] shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px]">
                  {agentInitials}
                </div>
                <div className="relative">
                  <select
                    value={replyMode}
                    onChange={(e) => setReplyMode(e.target.value as 'customer' | 'internal')}
                    className="pl-2 pr-6 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="customer">Reply to Customer</option>
                    <option value="internal">Add Internal Note</option>
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500 absolute right-1.5 top-1.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <select
                  value={templateSelected}
                  onChange={handleTemplateChange}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-600 focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="">Insert Template</option>
                  <option value="refund_status">Deposit Refund Follow-up</option>
                  <option value="sla_extension">SLA 24h Extension Notice</option>
                </select>

                <button
                  type="submit"
                  className="px-3 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              className="w-full p-1.5 bg-slate-50/60 border border-slate-300 rounded text-[11px] focus:ring-1 focus:ring-blue-500 focus:bg-white leading-normal"
            />
          </form>
        </div>

        {/* Right: Case Actions, Status Options */}
        <div className="col-span-4 space-y-2 flex flex-col justify-start overflow-hidden">
          {/* Case Actions */}
          <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs text-[11px] space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
              Case Actions
            </h3>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => alert('Assign case dialog')}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-2xs"
              >
                <UserCheck className="w-3 h-3 text-blue-600" />
                <span>Assign</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Change status dialog')}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Change Status</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Case escalated to Operations Manager!')}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-2xs"
              >
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span>Escalate</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Attach file')}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-2xs"
              >
                <Paperclip className="w-3 h-3 text-blue-600" />
                <span>Add Attachment</span>
              </button>
            </div>
          </div>

          {/* Status Radio Options */}
          <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs text-[11px] space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
              Status Options
            </h3>

            <div className="grid grid-cols-2 gap-1">
              {(['Open', 'Pending', 'Ongoing', 'Resolved'] as CaseDetails['status'][]).map(
                (statusVal) => (
                  <label
                    key={statusVal}
                    className="flex items-center space-x-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded"
                  >
                    <input
                      type="radio"
                      name="caseStatusOption"
                      checked={caseDetails.status === statusVal}
                      onChange={() => updateCaseStatus(statusVal)}
                      className="text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                    <span className="font-medium text-slate-800 text-[10px]">{statusVal}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
