import React, { useState, useEffect } from 'react';
import {
  X,
  Car,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RentalAgreement } from '../../types/crm.types';

interface EditRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'active' | 'previous';
}

export const EditRentalModal: React.FC<EditRentalModalProps> = ({
  isOpen,
  onClose,
  target,
}) => {
  const {
    activeRental,
    previousRental,
    updateActiveRental,
    updatePreviousRental,
    locations,
  } = useWorkspace();

  const sourceRental = target === 'active' ? activeRental : previousRental;

  // Form states
  const [agreementNo, setAgreementNo] = useState(sourceRental.agreementNo);
  const [status, setStatus] = useState<'Active' | 'Returned' | 'Closed' | 'Pending'>(
    sourceRental.status || (target === 'active' ? 'Active' : 'Returned')
  );
  const [model, setModel] = useState(sourceRental.vehicle.model || '');
  const [category, setCategory] = useState(sourceRental.vehicle.category || sourceRental.vehicle.group || '');
  const [plateNo, setPlateNo] = useState(sourceRental.vehicle.plateNo || '');
  const [pickupLocation, setPickupLocation] = useState(sourceRental.pickupLocation || '');
  const [pickupDate, setPickupDate] = useState(sourceRental.pickupDate || '');
  const [pickupTime, setPickupTime] = useState(sourceRental.pickupTime || '10:00');
  const [returnLocation, setReturnLocation] = useState(sourceRental.returnLocation || '');
  const [returnDate, setReturnDate] = useState(sourceRental.returnDate || '');
  const [returnTime, setReturnTime] = useState(sourceRental.returnTime || '10:00');
  const [totalCharges, setTotalCharges] = useState<number>(sourceRental.totalCharges || 0);
  const [depositAmount, setDepositAmount] = useState<number>(sourceRental.depositAmount || 1000);
  const [depositStatus, setDepositStatus] = useState<string>(
    sourceRental.depositStatus || (target === 'active' ? 'Holding' : 'Settled')
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Synchronize when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      setAgreementNo(sourceRental.agreementNo);
      setStatus(sourceRental.status || (target === 'active' ? 'Active' : 'Returned'));
      setModel(sourceRental.vehicle.model || '');
      setCategory(sourceRental.vehicle.category || sourceRental.vehicle.group || '');
      setPlateNo(sourceRental.vehicle.plateNo || '');
      setPickupLocation(sourceRental.pickupLocation || '');
      setPickupDate(sourceRental.pickupDate || '');
      setPickupTime(sourceRental.pickupTime || '10:00');
      setReturnLocation(sourceRental.returnLocation || '');
      setReturnDate(sourceRental.returnDate || '');
      setReturnTime(sourceRental.returnTime || '10:00');
      setTotalCharges(sourceRental.totalCharges || 0);
      setDepositAmount(sourceRental.depositAmount || 1000);
      setDepositStatus(sourceRental.depositStatus || (target === 'active' ? 'Holding' : 'Settled'));
      setSuccessNotice(null);
    }
  }, [isOpen, target, sourceRental]);

  if (!isOpen) return null;

  // Auto calculate duration in days
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return sourceRental.rentalPeriodDays || 1;
    const d1 = new Date(pickupDate.replace(' ', 'T')).getTime();
    const d2 = new Date(returnDate.replace(' ', 'T')).getTime();
    if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 1;
    return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  };

  const periodDays = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: Partial<RentalAgreement> = {
      agreementNo: agreementNo.trim() || sourceRental.agreementNo,
      status,
      pickupLocation: pickupLocation.trim() || sourceRental.pickupLocation,
      pickupDate: pickupDate || sourceRental.pickupDate,
      pickupTime: pickupTime || sourceRental.pickupTime,
      returnLocation: returnLocation.trim() || sourceRental.returnLocation,
      returnDate: returnDate || sourceRental.returnDate,
      returnTime: returnTime || sourceRental.returnTime,
      rentalPeriodDays: periodDays,
      totalCharges: Number(totalCharges) || 0,
      rentalCharges: Number(totalCharges) || 0,
      depositAmount: Number(depositAmount) || 0,
      depositStatus: depositStatus.trim() || 'Settled',
      vehicle: {
        ...sourceRental.vehicle,
        model: model.trim() || sourceRental.vehicle.model,
        category: category.trim() || sourceRental.vehicle.category,
        plateNo: plateNo.trim() || sourceRental.vehicle.plateNo,
      },
    };

    if (target === 'active') {
      updateActiveRental(updatedData);
    } else {
      updatePreviousRental(updatedData);
    }

    setSuccessNotice(`${target === 'active' ? 'Active' : 'Previous'} Rental (${agreementNo}) updated!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 select-text animate-fade-in overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-2xs">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-tight">
                  Update {target === 'active' ? 'Current (Active)' : 'Previous'} Rental
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white/20 rounded-full border border-white/30">
                  {agreementNo}
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Modify vehicle, dates, locations, or deposit details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {successNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Section 1: Agreement Identity & Status */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Agreement & Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Agreement Number
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={agreementNo}
                    onChange={(e) => setAgreementNo(e.target.value)}
                    placeholder="e.g. DXBBDLY01160"
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Rental Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Active">Active (Ongoing)</option>
                  <option value="Returned">Returned</option>
                  <option value="Closed">Closed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Information */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Vehicle Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Model & Make
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Small Sedan"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category / Group
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Group B or Economy"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={plateNo}
                  onChange={(e) => setPlateNo(e.target.value)}
                  placeholder="e.g. 92306-10-AUH"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Schedule & Locations */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Schedule & Locations
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Period: {periodDays} day{periodDays === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup */}
              <div className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500">Pick-up Details</span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Location / Branch</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. DXB ARRIVAL TER 1"
                    className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Return */}
              <div className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500">Return Details</span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Location / Branch</label>
                  <input
                    type="text"
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    placeholder="e.g. DXB ARRIVAL TER 1"
                    className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Date</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Time</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Financials & Deposit */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Financials & Deposit
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Total Rental Charges (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalCharges}
                  onChange={(e) => setTotalCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deposit Amount (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  placeholder="1000.00"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deposit Status
                </label>
                <select
                  value={depositStatus}
                  onChange={(e) => setDepositStatus(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Settled">Settled</option>
                  <option value="Holding">Holding</option>
                  <option value="Pending Refund">Pending Refund</option>
                  <option value="Refunded (Processing)">Refunded (Processing)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update Rental Agreement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
