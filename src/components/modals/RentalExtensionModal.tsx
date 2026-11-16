import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const RentalExtensionModal: React.FC = () => {
  const {
    activeRental,
    isExtensionOpen,
    setIsExtensionOpen,
    extendRentalAgreement,
  } = useWorkspace();

  const [newReturnDate, setNewReturnDate] = useState('2026-11-10');
  const [newReturnTime, setNewReturnTime] = useState('14:00');
  const [extensionDays, setExtensionDays] = useState(5);
  const [dailyRate] = useState(65); // AED 65 / day
  const [notes, setNotes] = useState('Customer requested 5 additional days due to extended business trip.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isExtensionOpen) return null;

  const handleDaysChange = (days: number) => {
    setExtensionDays(days);
    const d = new Date();
    d.setDate(d.getDate() + 30 + days);
    setNewReturnDate(d.toISOString().split('T')[0]);
  };

  const calculatedTotal = Math.round(extensionDays * dailyRate * 1.05);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await extendRentalAgreement({
      newReturnDate,
      newReturnTime,
      additionalCharges: calculatedTotal,
      notes,
    });
    setIsSubmitting(false);
    setSuccessMessage(res.message);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsExtensionOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Extend Rental Agreement</h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Agreement #{activeRental.agreementNo} • {activeRental.vehicle.model}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExtensionOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-semibold text-xs">
              {successMessage}
            </div>
          )}

          {/* Current vs Proposed Date */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Current Return Date</span>
              <strong className="text-slate-700 block mt-0.5">{activeRental.returnDate}</strong>
              <span className="text-slate-500 text-[10px]">{activeRental.returnTime}</span>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[9px] text-blue-600 font-semibold block uppercase">Proposed Return</span>
              <strong className="text-blue-700 block mt-0.5">{newReturnDate}</strong>
              <span className="text-blue-600 text-[10px]">{newReturnTime}</span>
            </div>
          </div>

          {/* Extension duration selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Additional Extension Days:
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 5, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDaysChange(d)}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition-all ${
                    extensionDays === d
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  +{d}d
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Return Date</label>
              <input
                type="date"
                value={newReturnDate}
                onChange={(e) => setNewReturnDate(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Return Time</label>
              <input
                type="time"
                value={newReturnTime}
                onChange={(e) => setNewReturnTime(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Additional Charges Calculation */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-blue-900 block">Estimated Extension Charges</span>
              <span className="text-[10px] text-blue-700 font-mono">
                {extensionDays} days × AED {dailyRate} + 5% VAT
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-blue-700 text-sm">AED {calculatedTotal}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Extension Reason / Agent Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-updates ERP contract</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsExtensionOpen(false)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded font-semibold text-xs transition-colors"
              >
                {isSubmitting ? 'Extending...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};