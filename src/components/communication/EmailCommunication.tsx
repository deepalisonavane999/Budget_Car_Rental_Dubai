import React, { useState } from 'react';
import { Mail, Paperclip, Send, Reply, ReplyAll, Forward, X, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface EmailCommProps {
  showWrapUp?: boolean;
}

export const EmailCommunication: React.FC<EmailCommProps> = ({ showWrapUp = false }) => {
  const { customer, agentName } = useWorkspace();

  const [selectedEmailId, setSelectedEmailId] = useState('1');
  const [internalNote, setInternalNote] = useState(
    'Customer called earlier about refund. Confirmed identity and explained ticket FIN-10482 is with Finance.'
  );
  const [replyText, setReplyText] = useState(
    `Dear ${customer.name},\nWe are following up with Finance on ticket FIN-10482 and will update you by 16:00 today.\n\nKind regards,\n${agentName}`
  );
  const [hasAttachment, setHasAttachment] = useState(true);
  const [isSent, setIsSent] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [disposition, setDisposition] = useState('Customer Enquiry - Refund');

  const emails = [
    {
      id: '1',
      subject: 'Deposit refund follow-up',
      preview: 'I would like to follow up on deposit refund...',
      time: '14:10',
      date: '8 Oct 2026',
      from: `${customer.name} <${customer.email}>`,
      to: 'care@budget-uae.com',
      body: `Dear Team,\nI would like to follow up on the status of my security deposit refund for rental agreement RA-20301 (returned on 5 Oct 2026). Could you please confirm when it will be processed?\nThank you, ${customer.name}`,
      ticketLink: 'FIN-10482',
    },
    {
      id: '2',
      subject: 'Re: Agreement RA-20301',
      preview: 'Thank you for the documents.',
      time: '5 Oct',
      date: '5 Oct 2026',
      from: `${customer.name} <${customer.email}>`,
      to: 'care@budget-uae.com',
      body: `Hello,\nThank you for sending the rental agreement documents.\nRegards, ${customer.name}`,
      ticketLink: null,
    },
  ];

  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const handleSendEmail = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      alert('Email reply sent!');
    }, 500);
  };

  if (showWrapUp) {
    return (
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        {/* Email preview */}
        <div className="col-span-6 bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
          <div className="flex items-center space-x-1.5 pb-0.5 border-b border-slate-200">
            <div className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[9px]">
              {customer.avatarInitials}
            </div>
            <div className="leading-tight">
              <span className="font-bold text-slate-800 text-[11px] block">
                Re: Deposit refund for RA-20301
              </span>
              <span className="text-[9px] text-slate-400">
                From: {customer.email} • 8 Oct 2026 10:16
              </span>
            </div>
          </div>
          <p className="text-slate-700 text-[10px] leading-relaxed">
            Hello, I'm following up on my deposit refund for rental RA-20301. Please confirm the
            status and processing timeline. Thank you.
          </p>
        </div>

        {/* Agent Notes */}
        <div className="col-span-4 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
          <div>
            <label className="block text-[9px] font-semibold text-slate-700 mb-0.5">
              Agent Notes (Internal)
            </label>
            <textarea
              rows={2}
              defaultValue="Customer requested an update on deposit refund for RA-20301. Shared that request has been escalated to Finance."
              className="w-full p-1 bg-white border border-slate-300 rounded text-[10px]"
            />
          </div>
          <div className="text-right text-[9px] text-slate-400">116 / 500</div>
        </div>

        {/* Wrap-up Disposition */}
        <div className="col-span-2 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
          <div>
            <label className="block text-[9px] font-semibold text-slate-700 mb-0.5">
              Disposition *
            </label>
            <select
              value={disposition}
              onChange={(e) => setDisposition(e.target.value)}
              className="w-full p-1 bg-white border border-slate-300 rounded text-[9px] font-medium"
            >
              <option>Customer Enquiry - Refund</option>
              <option>Statement Sent</option>
              <option>Dispute Logged</option>
            </select>
          </div>

          <button
            onClick={() => alert('Interaction complete!')}
            className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[10px]"
          >
            Complete Interaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2 text-[10px]">
      {/* 1. Left Inbox List */}
      <div className="col-span-3 bg-slate-50 p-1.5 rounded border border-slate-200 space-y-1">
        <div className="font-bold text-slate-800 text-[10px] pb-0.5 border-b border-slate-200 flex justify-between">
          <span>Inbox</span>
          <span className="font-mono text-blue-600 font-bold">{emails.length}</span>
        </div>

        {emails.map((email) => {
          const isSelected = selectedEmailId === email.id;
          return (
            <div
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`p-1 rounded cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-300 font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="truncate text-[10px] text-slate-800">{email.subject}</span>
                <span className="text-[8px] text-slate-400 font-mono ml-1">{email.time}</span>
              </div>
              <p className="text-[9px] text-slate-500 truncate">{email.preview}</p>
            </div>
          );
        })}
      </div>

      {/* 2. Middle Email Viewer & Reply */}
      <div className="col-span-6 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between space-y-1">
        <div>
          <div className="flex items-center justify-between pb-0.5 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-[11px] truncate">
              {activeEmail.subject}
            </span>
            <span className="text-[9px] text-slate-400">{activeEmail.time}</span>
          </div>

          <p className="text-slate-700 text-[10px] p-1 bg-white rounded border border-slate-100 mt-1 leading-snug">
            {activeEmail.body}
          </p>
        </div>

        <div className="space-y-1 pt-1">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-1 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-slate-600">
              <button
                type="button"
                className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[9px] flex items-center space-x-0.5"
              >
                <Reply className="w-2.5 h-2.5" />
                <span>Reply</span>
              </button>
              {hasAttachment && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-[9px] text-slate-700">
                  <Paperclip className="w-2.5 h-2.5 text-slate-500" />
                  <span>return-receipt.pdf</span>
                  <button type="button" onClick={() => setHasAttachment(false)}>
                    <X className="w-2.5 h-2.5 ml-0.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSent}
              className="px-3 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 shadow-2xs"
            >
              <Send className="w-2.5 h-2.5" />
              <span>{isSent ? 'Sent' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Right Internal Note */}
      <div className="col-span-3 bg-amber-50/50 p-2 rounded border border-amber-200 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-900 block pb-0.5 border-b border-amber-200">
            🔒 Internal Note
          </span>
          <p className="text-[9px] text-amber-950 mt-1 leading-snug">{internalNote}</p>
        </div>

        <button
          onClick={() => {
            setIsNoteSaved(true);
            setTimeout(() => setIsNoteSaved(false), 1200);
          }}
          className="w-full py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-semibold flex items-center justify-center space-x-1"
        >
          {isNoteSaved ? <Check className="w-2.5 h-2.5" /> : null}
          <span>{isNoteSaved ? 'Saved' : 'Save Note'}</span>
        </button>
      </div>
    </div>
  );
};
