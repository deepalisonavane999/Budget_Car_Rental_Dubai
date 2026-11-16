import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TransferCallModal: React.FC = () => {
  const { isTransferOpen, setIsTransferOpen, caseDetails, previousRental } = useWorkspace();
  const [destQueue, setDestQueue] = useState('Finance');
  const [transferType, setTransferType] = useState<'Warm' | 'Cold'>('Warm');
  const [notes, setNotes] = useState(
    `Customer following up on deposit refund (${caseDetails.ticketNo}) for ${previousRental.agreementNo}. Please assist.`
  );
  const [loading, setLoading] = useState(false);

  if (!isTransferOpen) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsTransferOpen(false);
      alert(`Call successfully transferred to ${destQueue} (${transferType})!`);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Transfer Call</h3>
          </div>
          <button
            onClick={() => setIsTransferOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Destination Queue <span className="text-rose-500">*</span>
            </label>
            <select
              value={destQueue}
              onChange={(e) => setDestQueue(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-medium bg-slate-50"
            >
              <option>Finance</option>
              <option>Reservations</option>
              <option>Operations & Roadside</option>
              <option>Fleet DXB Airport Terminal 1</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transfer Type</label>
            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalTransType"
                  checked={transferType === 'Warm'}
                  onChange={() => setTransferType('Warm')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Warm Transfer</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalTransType"
                  checked={transferType === 'Cold'}
                  onChange={() => setTransferType('Cold')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Cold Transfer</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transfer Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{loading ? 'Initiating...' : 'Start Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
