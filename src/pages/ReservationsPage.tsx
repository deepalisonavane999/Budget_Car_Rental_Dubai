import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Cog,
  Search,
  Send,
  CalendarPlus,
  Clock,
  ChevronDown,
  Car,
  Edit3,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { apiService } from '../services/apiService';
import { Badge } from '../components/common/Badge';
import { CommunicationDock } from '../components/communication/CommunicationDock';
// import { mockLeadHistory } from '../services/mockData';
import { mockLeadHistory, mockReservationQuote } from '../services/mockDataAccCollection';

export const ReservationsPage: React.FC = () => {
  const {
    reservationQuote,
    setReservationQuote,
    checkVehicleAvailability,
    confirmReservationBooking,
    cancelReservationBooking,
    setIsFleetPickerOpen,
    openCreateBookingModal,
    openUpdateBookingModal,
    setVehicleGroups,
  } = useWorkspace();
  const [leadHistory] = useState(mockLeadHistory || []);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Safe normalized quote and vehicle data to prevent render crashes
  const quote = reservationQuote || mockReservationQuote;
  const vehicle = quote.vehicle || mockReservationQuote.vehicle || {
    model: 'Small Sedan',
    group: 'Group AZ',
    seats: 5,
    bags: 2,
    transmission: 'Automatic',
    plateNo: '',
  };
  const quoteBreakdown = quote.quoteBreakdown || mockReservationQuote.quoteBreakdown || {
    rentalCharges: 190,
    vatAmount: 9.5,
    totalAmount: 199.5,
  };
  const refundableDeposit = quote.refundableDeposit ?? mockReservationQuote.refundableDeposit ?? 1000;

  const renderVehicleGroup = (vg: any): string => {
    if (!vg) return '—';
    if (typeof vg === 'string') return vg;
    if (typeof vg === 'object') return vg.name || vg.description || vg.groupNo || '—';
    return String(vg);
  };

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCheckAvailability = async () => {
    setIsBusy(true);
    try {
      const vgRes = await apiService.getVehicleGroups(1, 50);
      if (vgRes.success && vgRes.result?.items) {
        setVehicleGroups(vgRes.result.items);
      }
    } catch {
      // ignore
    }
    setIsBusy(false);
    setIsFleetPickerOpen(true);
  };

  const handleCreateBooking = () => {
    openCreateBookingModal();
  };

  const handleConfirmBooking = async () => {
    setIsBusy(true);
    const res = await confirmReservationBooking();
    setIsBusy(false);
    triggerNotice(res.message);
  };

  const handleUpdateBooking = () => {
    openUpdateBookingModal();
  };

  const handleCancelBooking = async () => {
    setIsBusy(true);
    const res = await cancelReservationBooking();
    setIsBusy(false);
    triggerNotice(res.message);
  };

  return (
    <div className="flex-1 flex flex-col justify-start overflow-hidden p-2 space-y-2 animate-fade-in select-text">
      {/* Upper Area: Availability & Quote Engine */}
      <div className="space-y-2 shrink-0">
        <div className="bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Availability & Quote
              </h2>
              <span className="text-[10px] text-slate-400">
                Source: <span className="font-semibold text-slate-700">{quote.source || 'Direct'}</span>
              </span>
            </div>
          </div>

          {/* Search Row Parameters */}
          <div className="grid grid-cols-7 gap-1.5 text-[10px] bg-slate-50/70 p-1.5 rounded border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[9px]">Pickup</span>
              <span className="font-bold text-slate-800 truncate block">
                {quote.pickupLocation || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Pickup Date</span>
              <span className="font-bold text-slate-800 block">
                {quote.pickupDate || '—'} {quote.pickupTime || ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Return</span>
              <span className="font-bold text-slate-800 truncate block">
                {quote.returnLocation || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Return Date</span>
              <span className="font-bold text-slate-800 block">
                {quote.returnDate || '—'} {quote.returnTime || ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Rental Type</span>
              <span className="font-bold text-slate-800 block">
                {quote.rentalType || 'Daily'} ({quote.rentalDays || 1}d)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Vehicle Group</span>
              <span className="font-bold text-slate-800 block">{renderVehicleGroup(quote.vehicleGroup)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Availability</span>
              <div className="flex items-center space-x-0.5 text-amber-700 font-bold">
                <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                <span>{quote.availabilityStatus || 'Available'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Specs & Breakdown */}
          <div className="grid grid-cols-12 gap-2 items-center text-[10px]">
            <div className="col-span-4 flex items-center justify-between">
              <div
                onClick={handleCheckAvailability}
                className="flex items-center space-x-2 cursor-pointer group"
                title="Click to check vehicle availability and select vehicle"
              >
                <div className="w-10 h-9 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded flex items-center justify-center border border-blue-100 transition-colors shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                      {vehicle.model || 'Small Sedan'}
                    </h3>
                    {vehicle.plateNo && (
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 text-[9px]">
                        {vehicle.plateNo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[9px] mt-0.5">
                    <span>{vehicle.seats || 5} Seats</span>
                    <span>•</span>
                    <span>{vehicle.bags || 2} Bags</span>
                    <span>•</span>
                    <span>{vehicle.transmission || 'Auto'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Quote Breakdown</span>
              <div className="flex justify-between text-slate-700">
                <span>Rental + VAT</span>
                <span className="font-mono font-bold text-blue-600 text-xs">
                  AED {quoteBreakdown.totalAmount ?? 199.5}
                </span>
              </div>
            </div>

            <div className="col-span-3 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Deposit (Separate)</span>
              <span className="font-bold text-slate-900 block">
                AED {refundableDeposit.toLocaleString()}
              </span>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Eligibility</span>
              <span className="font-bold text-amber-700 block">{quote.eligibilityCheck || 'Pending Check'}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center flex-wrap gap-1.5 text-[10px]">
            <button
              onClick={handleCheckAvailability}
              disabled={isBusy}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded font-semibold flex items-center space-x-1"
              title="Search vehicle availability with 7 filters (Branch, Reg Status, Plate, Model, Fleet, Chassis, Group)"
            >
              <Search className="w-2.5 h-2.5" />
              <span>Check Vehicle Availability</span>
            </button>
            <button
              onClick={() => triggerNotice('Quote emailed to customer!')}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold flex items-center space-x-1"
            >
              <Send className="w-2.5 h-2.5 text-slate-500" />
              <span>Send Quote</span>
            </button>
            <button
              onClick={handleCreateBooking}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
              title="Open Create Booking modal with ERP payload"
            >
              <CalendarPlus className="w-3 h-3 text-white" />
              <span>Create Booking</span>
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isBusy}
              className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 rounded font-semibold"
            >
              Confirm
            </button>
            <button
              onClick={handleUpdateBooking}
              disabled={isBusy}
              className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
              title="Open Update Booking modal to modify dates, vehicle, branch or charges"
            >
              <Edit3 className="w-3 h-3 text-blue-600" />
              <span>Update</span>
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={isBusy}
              className="px-2 py-0.5 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-60 text-rose-600 rounded font-semibold"
            >
              Cancel Booking
            </button>

            {actionNotice && (
              <span className="text-emerald-700 font-bold ml-1 animate-fade-in truncate max-w-xs">{actionNotice}</span>
            )}
          </div>
        </div>

        {/* Lead / Booking History Mini Table */}
        <div className="bg-white border border-slate-200 rounded p-1.5 shadow-2xs text-[10px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-[11px]">Booking / Lead History</span>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-1 text-slate-700 font-medium">
            {leadHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 p-1 rounded">
                <span className="font-mono font-bold text-blue-600">{item.reference}</span>
                <span className="text-slate-500">{item.pickupDate}</span>
                <Badge variant={item.status === 'Confirmed' ? 'green' : 'gray'} className="text-[9px] py-0 px-1">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Area: Customer Communication Dock with Chat Active */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CommunicationDock linkedTicket="FIN-10482" />
      </div>
    </div>
  );
};
