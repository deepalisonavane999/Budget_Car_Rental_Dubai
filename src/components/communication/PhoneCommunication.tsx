import React, { useState } from 'react';
import { Phone, Calendar, ArrowRightLeft, ExternalLink, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

interface PhoneCommProps {
  variant?: 'inbound' | 'outbound';
}

export const PhoneCommunication: React.FC<PhoneCommProps> = ({ variant = 'inbound' }) => {
  const { customer, queueName, ivrPath, caseDetails, previousRental, setActiveNavTab } = useWorkspace();
  const navigate = useNavigate();

  // Agent Notes state
  const [reason, setReason] = useState(
    `Customer follow up on deposit refund for ${previousRental.agreementNo} (returned ${previousRental.returnDate}).`
  );
  const [action, setAction] = useState(
    'Contacted Finance team to check refund processing status. Confirmed under review.'
  );
  const [nextStep, setNextStep] = useState('Callback customer at 16:00 today with update.');

  // Transfer sub-box state
  const [showTransferBox, setShowTransferBox] = useState(true);
  const [destQueue, setDestQueue] = useState('Finance');
  const [transferType, setTransferType] = useState<'Warm' | 'Cold'>('Warm');
  const [transferNotes, setTransferNotes] = useState(
    `Customer following up on deposit refund (${caseDetails.ticketNo}) for ${previousRental.agreementNo}. Please assist.`
  );
  const [isTransferring, setIsTransferring] = useState(false);

  // Outbound / Wrap up state (for Operations screen)
  const [disposition, setDisposition] = useState('Customer informed - awaiting dispatch');
  const [followUpChecked, setFollowUpChecked] = useState(true);

  if (variant === 'outbound') {
    return (
      <div className="grid grid-cols-12 gap-2 text-[11px]">
        {/* Outbound call details */}
        <div className="col-span-7 bg-slate-50 p-2 rounded border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[9px]">
                {customer.avatarInitials}
              </div>
              <span className="font-bold text-slate-800 text-[11px]">Outbound call to customer</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">14:23</span>
          </div>
          <p className="text-slate-600 text-[10px] leading-relaxed">
            Confirmed current location at Oud Metha and verified that vehicle is not starting.
            Customer is safe and waiting.
          </p>

          <div className="pt-1">
            <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
              Agent Notes
            </label>
            <textarea
              rows={2}
              defaultValue="Customer confirmed vehicle not starting (battery). Safe at location. Provided location pin. Advised help is being arranged and we will update once provider confirms. Customer waiting on site."
              className="w-full p-1.5 border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <div className="text-right text-[9px] text-slate-400 mt-0.5">127 / 500</div>
          </div>
        </div>

        {/* Wrap up Form */}
        <div className="col-span-5 bg-slate-50 p-2 rounded border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-0.5 text-[11px]">
            Wrap-Up
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[9px] text-slate-500 mb-0.5">Date</label>
              <input
                type="text"
                readOnly
                value="08 Oct 2026"
                className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 mb-0.5">Time</label>
              <input
                type="text"
                readOnly
                value="14:23"
                className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 mb-0.5">Disposition *</label>
            <select
              value={disposition}
              onChange={(e) => setDisposition(e.target.value)}
              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option>Customer informed - awaiting dispatch</option>
              <option>Service Dispatched</option>
              <option>Resolved on Call</option>
              <option>Customer Unreachable</option>
            </select>
          </div>

          <div className="pt-0.5">
            <label className="flex items-center space-x-1.5 text-[10px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpChecked}
                onChange={(e) => setFollowUpChecked(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
              />
              <span className="font-medium">Follow up with customer</span>
            </label>

            {followUpChecked && (
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <input
                  type="text"
                  defaultValue="08 Oct 2026"
                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
                />
                <input
                  type="text"
                  defaultValue="16:00"
                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2 text-[10px]">
      {/* 1. Left Call Metadata Box */}
      <div className="col-span-3 bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
        <div className="flex items-center justify-between pb-0.5 border-b border-slate-200">
          <div className="flex items-center space-x-1 font-bold text-slate-800 text-[11px]">
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Phone className="w-2.5 h-2.5 fill-current" />
            </div>
            <span>Incoming Call</span>
          </div>
          <span className="font-mono text-blue-600 font-bold text-[10px]">00:04:18</span>
        </div>

        <div className="space-y-0.5 text-[10px] text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time</span>
            <span className="font-medium text-slate-800">08 Oct 2026 14:22</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Caller Number</span>
            <span className="font-mono font-medium text-slate-800">{customer.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Queue</span>
            <span className="font-medium text-slate-800">{queueName}</span>
          </div>
          <div className="pt-0.5">
            <span className="text-slate-400 block text-[9px]">IVR Path</span>
            <span className="font-medium text-slate-700 text-[10px] truncate block">{ivrPath}</span>
          </div>
        </div>

        <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Case</span>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-blue-600 font-mono">FIN-10482</span>
            <span className="px-1 py-0 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-semibold">
              Pending
            </span>
            <button
              onClick={() => setActiveNavTab('cases')}
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-[9px] ml-0.5"
            >
              <span>View</span>
              <ExternalLink className="w-2 h-2 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Middle Agent Notes Box */}
      <div className="col-span-5 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between space-y-1">
        <div className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-0.5 flex justify-between items-center">
          <span>Agent Notes</span>
          <span className="text-[9px] font-normal text-slate-400">Sync Active</span>
        </div>

        <div className="space-y-1 text-[10px]">
          <div>
            <label className="block text-[9px] font-semibold text-slate-600 mb-0.5">
              Reason for Contact <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-slate-600 mb-0.5">
              Action Taken <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-slate-600 mb-0.5">
              Next Step <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Right Actions & Transfer Call Box */}
      <div className="col-span-4 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-slate-800 text-[11px]">Actions</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                className="px-1.5 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[9px] font-medium text-slate-700 flex items-center space-x-0.5"
              >
                <Calendar className="w-2.5 h-2.5 text-slate-500" />
                <span>Callback</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTransferBox(!showTransferBox)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors ${
                  showTransferBox
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowRightLeft className="w-2.5 h-2.5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {showTransferBox && (
            <div className="mt-1.5 p-1.5 bg-white rounded border border-blue-200 space-y-1 text-[10px] animate-fade-in shadow-2xs">
              <div className="flex justify-between items-center pb-0.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-[10px]">Transfer Call</span>
                <button
                  onClick={() => setShowTransferBox(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-[9px] text-slate-500">Destination</label>
                  <select
                    value={destQueue}
                    onChange={(e) => setDestQueue(e.target.value)}
                    className="w-full px-1 py-0.5 bg-slate-50 border border-slate-300 rounded text-[9px] font-medium"
                  >
                    <option>Finance</option>
                    <option>Reservations</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-500">Type</label>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <label className="flex items-center space-x-0.5 cursor-pointer text-[9px]">
                      <input
                        type="radio"
                        name="transType"
                        checked={transferType === 'Warm'}
                        onChange={() => setTransferType('Warm')}
                        className="text-blue-600 w-2.5 h-2.5"
                      />
                      <span>Warm</span>
                    </label>
                    <label className="flex items-center space-x-0.5 cursor-pointer text-[9px]">
                      <input
                        type="radio"
                        name="transType"
                        checked={transferType === 'Cold'}
                        onChange={() => setTransferType('Cold')}
                        className="text-blue-600 w-2.5 h-2.5"
                      />
                      <span>Cold</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-1 pt-0.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferBox(false)}
                  className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[9px] text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferring(true);
                    setTimeout(() => {
                      setIsTransferring(false);
                      setShowTransferBox(false);
                      alert(`Call transferred to ${destQueue}!`);
                    }, 600);
                  }}
                  className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-semibold"
                >
                  {isTransferring ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
