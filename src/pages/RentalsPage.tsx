import React, { useState, useEffect } from 'react';
import { MoreHorizontal, ChevronRight, FileText, Car, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CommunicationDock } from '../components/communication/CommunicationDock';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

export const RentalsPage: React.FC = () => {
  const {
    customer,
    activeRental,
    previousRental,
    commMode,
    setIsExtensionOpen,
    setIsReturnOpen,
    setActiveNavTab,
  } = useWorkspace();
  const navigate = useNavigate();
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  // Live Deposit Information from GetDeposit API
  const [depositAmount, setDepositAmount] = useState<number>(previousRental.depositAmount || 1000);
  const [depositStatus, setDepositStatus] = useState<string>('Refunded (Processing)');

  useEffect(() => {
    const fetchDeposit = async () => {
      const cleanId =
        customer.id && customer.id !== '—'
          ? parseInt(String(customer.id).replace(/\D/g, ''), 10)
          : undefined;

      if (cleanId && cleanId > 0) {
        try {
          const res = await apiService.getDeposit({ customerId: cleanId });
          if (res.success && res.result?.items && res.result.items.length > 0) {
            const first = res.result.items[0];
            if (first.amount) setDepositAmount(first.amount);
            if (first.statusName === 'Settled' || first.amountRefunded > 0) {
              setDepositStatus('Refunded (Processing)');
            } else if (first.statusText) {
              setDepositStatus(first.statusText);
            }
          }
        } catch {
          // ignore
        }
      }
    };

    fetchDeposit();
  }, [customer.id]);

  return (
    <div className="flex-1 flex flex-col justify-start overflow-hidden p-2 space-y-2 animate-fade-in select-none">
      {/* Upper Area: Rental Agreement Cards */}
      <div className="space-y-2 shrink-0">
        {/* 1. Active Rental Card */}
        <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Active Rental — {activeRental.agreementNo}
              </h2>
              <Badge variant={activeRental.status === 'Active' ? 'green' : 'gray'} className="text-[10px] py-0 px-1.5">
                {activeRental.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsExtensionOpen(true)}
                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                title="Request rental extension"
              >
                <CalendarPlus className="w-3 h-3 text-blue-600" />
                <span>Extend Rental</span>
              </button>
              <button
                onClick={() => setIsReturnOpen(true)}
                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                title="Process check-in or early return"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Early Return</span>
              </button>
              <button
                onClick={() => setAgreementModalOpen(true)}
                className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
              >
                <FileText className="w-3 h-3 text-slate-500" />
                <span>Agreement Details</span>
              </button>
            </div>
          </div>

          {/* Card Content Grid */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1.5 text-[11px]">
            {/* Vehicle icon & name */}
            <div className="col-span-4 flex items-center space-x-2.5">
              <div className="w-11 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-slate-900 text-xs">
                  {activeRental.vehicle.model}
                </h3>
                <p className="text-slate-500 text-[10px]">
                  {activeRental.vehicle.category}
                </p>
                {activeRental.vehicle.plateNo && (
                  <span className="inline-block mt-0.5 px-1 py-0 bg-slate-100 text-slate-700 font-mono text-[9px] rounded border border-slate-200">
                    {activeRental.vehicle.plateNo}
                  </span>
                )}
              </div>
            </div>

            {/* Pickup Info */}
            <div className="col-span-3 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Pick-up Date</span>
              <div className="font-bold text-slate-800 text-[11px]">
                {activeRental.pickupDate} {activeRental.pickupTime}
              </div>
              <div className="text-slate-500 text-[10px] truncate">
                {activeRental.pickupLocation}
              </div>
            </div>

            {/* Return Info */}
            <div className="col-span-3 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Return Date</span>
              <div className="font-bold text-slate-800 text-[11px]">
                {activeRental.returnDate} {activeRental.returnTime}
              </div>
              <div className="text-slate-500 text-[10px] truncate">
                {activeRental.returnLocation}
              </div>
            </div>

            {/* Period & Status */}
            <div className="col-span-2 leading-tight border-l border-slate-100 pl-2 flex flex-col justify-center space-y-1">
              <div>
                <span className="text-[9px] text-slate-400 block">Period</span>
                <span className="font-bold text-slate-900 text-[11px]">
                  {activeRental.rentalPeriodDays} days
                </span>
              </div>
              <Badge variant="green" className="text-[9px] py-0 px-1 w-max">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* 2. Previous Rental Card */}
        <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Previous Rental — {previousRental.agreementNo}
              </h2>
              <Badge variant="gray" className="text-[10px] py-0 px-1.5">
                Returned
              </Badge>
            </div>
          </div>

          {/* Card Content Grid */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1.5 text-[11px]">
            {/* Vehicle icon / thumbnail & name */}
            <div className="col-span-3 flex items-center space-x-2.5">
              <div className="w-11 h-9 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                <Car className="w-5 h-5 text-slate-500" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-slate-900 text-xs">
                  {previousRental.vehicle.model || 'Nissan Sunny'}
                </h3>
                <p className="text-slate-500 text-[10px]">
                  {previousRental.vehicle.category || 'Economy • Nissan Sunny or similar'}
                </p>
              </div>
            </div>

            {/* Pickup Info */}
            <div className="col-span-2 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Pick-up Date</span>
              <div className="font-bold text-slate-800 text-[10px]">
                {previousRental.pickupDate} {previousRental.pickupTime}
              </div>
              <div className="text-slate-500 text-[9px] truncate">
                {previousRental.pickupLocation || 'Dubai Airport (DXB) Terminal 1'}
              </div>
            </div>

            {/* Return Info */}
            <div className="col-span-2 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Return Date</span>
              <div className="font-bold text-slate-800 text-[10px]">
                {previousRental.returnDate} {previousRental.returnTime}
              </div>
              <div className="text-slate-500 text-[9px] truncate">
                {previousRental.returnLocation || 'Dubai Airport (DXB) Terminal 1'}
              </div>
            </div>

            {/* Rental Period */}
            <div className="col-span-2 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Rental Period</span>
              <span className="font-bold text-slate-900 text-[11px]">
                {previousRental.rentalPeriodDays} days
              </span>
            </div>

            {/* Status */}
            <div className="col-span-1 leading-tight border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Status</span>
              <Badge variant="gray" className="text-[9px] py-0 px-1 w-max mt-0.5">
                Returned
              </Badge>
            </div>

            {/* Deposit Section */}
            <div className="col-span-2 leading-tight border-l border-slate-100 pl-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block">Deposit</span>
                <span className="font-bold text-slate-900 text-[11px]">
                  AED {depositAmount.toLocaleString()}
                </span>
                <span className="text-[9px] text-amber-700 block">
                  {depositStatus}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Lower Area: Customer Communication Dock */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CommunicationDock
          phoneVariant="inbound"
          emailWrapUp={commMode === 'email'}
          linkedTicket="FIN-10482"
        />
      </div>

      {/* Rental Agreement Preview Modal */}
      {agreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs">
                  Rental Agreement — {activeRental.agreementNo}
                </h3>
              </div>
              <button
                onClick={() => setAgreementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 text-[11px]">
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px]">Agreement Number</span>
                  <span className="font-bold font-mono text-slate-900">{activeRental.agreementNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Vehicle Assigned</span>
                  <span className="font-bold text-slate-900">{activeRental.vehicle.model} ({activeRental.vehicle.plateNo})</span>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setAgreementModalOpen(false)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
