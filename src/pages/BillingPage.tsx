import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  ChevronDown,
  Car,
  Receipt,
  Layers,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CommunicationDock } from '../components/communication/CommunicationDock';
import { VoucherExplorer } from '../components/billing/VoucherExplorer';
import { useNavigate } from 'react-router-dom';

export const BillingPage: React.FC = () => {
  const {
    billingSummary,
    activeRental,
    previousRental,
    fetchInvoiceDetails,
    fetchStatementOfAccounts,
  } = useWorkspace();
  const navigate = useNavigate();
  const [selectedRentalType, setSelectedRentalType] = useState<'previous' | 'active'>('previous');
  const [billingView, setBillingView] = useState<'overview' | 'vouchers'>('overview');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const displayedRental = selectedRentalType === 'active' ? activeRental : previousRental;

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleSendInvoice = async () => {
    const res = await fetchInvoiceDetails(billingSummary.invoiceNo);
    showFeedback(res.message);
  };

  const handleSendStatement = async () => {
    const res = await fetchStatementOfAccounts();
    showFeedback(res.message);
  };

  return (
    <div className="flex-1 flex flex-col justify-start overflow-hidden p-2 space-y-2 animate-fade-in select-none">
      {/* Upper Area: Billing Details */}
      <div className="space-y-2 shrink-0">
        {/* 1. Header Card with Rental Agreement Selector & View Toggle */}
        <div className="bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Billing — {selectedRentalType === 'active' ? 'Active' : 'Previous'} Rental Agreement{' '}
                <span className="font-mono text-blue-600">{displayedRental.agreementNo}</span>
              </h2>
              <Badge variant={displayedRental.status === 'Active' ? 'green' : 'gray'} className="text-[10px] py-0 px-1.5">
                {displayedRental.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setBillingView('overview')}
                  className={`flex items-center space-x-1 px-2.5 py-0.5 rounded transition-all ${
                    billingView === 'overview'
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingView('vouchers')}
                  className={`flex items-center space-x-1 px-2.5 py-0.5 rounded transition-all ${
                    billingView === 'vouchers'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  <span>Vouchers & Invoices</span>
                </button>
              </div>

              <div className="relative">
                <select
                  value={selectedRentalType}
                  onChange={(e) => setSelectedRentalType(e.target.value as 'previous' | 'active')}
                  className="pl-2 pr-6 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-medium text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="previous">
                    Previous Rental: {previousRental.agreementNo} (Returned {previousRental.returnDate})
                  </option>
                  <option value="active">
                    Active Rental: {activeRental.agreementNo} ({activeRental.status})
                  </option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Info Row */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1.5 text-[11px]">
            <div className="col-span-3 flex items-center space-x-2">
              <div className="w-10 h-9 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-slate-900 text-xs">{displayedRental.vehicle.model}</h3>
                <p className="text-slate-500 text-[9px]">{displayedRental.vehicle.category}</p>
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Agreement No.</span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">
                {displayedRental.agreementNo}
              </span>
            </div>

            <div className="col-span-3 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Pickup Location</span>
              <span className="font-medium text-slate-800 text-[10px] truncate block">
                {displayedRental.pickupLocation}
              </span>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Pickup Date</span>
              <div className="font-bold text-slate-800 text-[10px]">
                {displayedRental.pickupDate} {displayedRental.pickupTime}
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Return Date</span>
              <div className="font-bold text-slate-800 text-[10px]">
                {displayedRental.returnDate} {displayedRental.returnTime}
              </div>
            </div>
          </div>
        </div>

        {billingView === 'vouchers' ? (
          <VoucherExplorer />
        ) : (
          <>
            {/* 2. Three Column Financial Summary, Breakdown, Fines */}
            <div className="grid grid-cols-12 gap-2 text-[10px]">
              {/* Box 1: Financial Summary */}
              <div className="col-span-4 bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-1.5">
                <h3 className="font-bold text-slate-900 text-[11px] border-b border-slate-100 pb-1">
                  Financial Summary
                </h3>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Security Deposit</span>
                    <span className="text-xs font-bold text-slate-900">
                      AED {billingSummary.securityDeposit.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block">Refund Status</span>
                    <div className="flex items-center space-x-1 text-amber-700 font-semibold text-[10px]">
                      <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span>{billingSummary.refundStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Invoice Total</span>
                    <span className="font-bold text-slate-900 text-[10px]">
                      AED {billingSummary.invoiceTotal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Amount Paid</span>
                    <span className="font-bold text-slate-900 text-[10px]">
                      AED {billingSummary.amountPaid}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Balance</span>
                    <span className="font-bold text-emerald-700 text-[10px]">
                      AED {billingSummary.balance} {billingSummary.isPaid ? '(Paid)' : '(Due)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Charge Breakdown Table */}
              <div className="col-span-4 bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-1">
                <h3 className="font-bold text-slate-900 text-[11px] border-b border-slate-100 pb-1">
                  Charge Breakdown (AED)
                </h3>

                <div className="space-y-0.5 text-[10px]">
                  {billingSummary.chargeBreakdown.slice(0, 4).map((row, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 py-0.2">
                      <span>{row.item}</span>
                      <span className="font-mono font-medium">{row.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[11px] font-bold text-blue-600 pt-0.5 border-t border-slate-100">
                    <span>Total (Incl. VAT)</span>
                    <span className="font-mono">{billingSummary.totalInclVat}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Fines & Salik */}
              <div className="col-span-4 bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-1.5">
                <h3 className="font-bold text-slate-900 text-[11px] border-b border-slate-100 pb-1">
                  Fines & Salik
                </h3>

                <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-bold text-slate-800">Traffic Fines</span>
                    <span className="text-[9px] text-slate-400 block">{billingSummary.fines.evidenceFile || 'fines.pdf'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">AED {billingSummary.fines.amount}</span>
                    <Badge variant="amber" className="text-[9px] py-0 px-1">{billingSummary.fines.status}</Badge>
                  </div>
                </div>

                <div className="p-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-bold text-slate-800">Salik Charges</span>
                    <span className="text-[9px] text-slate-400 block">{billingSummary.salik.evidenceFile || 'salik.pdf'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">AED {billingSummary.salik.amount}</span>
                    <Badge variant="green" className="text-[9px] py-0 px-1">{billingSummary.salik.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Available Actions Bar */}
            <div className="bg-white border border-slate-200 rounded p-1.5 shadow-2xs flex items-center space-x-1.5 text-[10px]">
              <span className="font-bold text-slate-800 mr-1">Actions:</span>
              <button
                onClick={handleSendInvoice}
                className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold flex items-center space-x-1"
              >
                <FileText className="w-2.5 h-2.5 text-slate-500" />
                <span>Send Invoice</span>
              </button>
              <button
                onClick={handleSendStatement}
                className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold flex items-center space-x-1"
              >
                <FileText className="w-2.5 h-2.5 text-slate-500" />
                <span>Send Statement</span>
              </button>
              <button
                onClick={() => setBillingView('vouchers')}
                className="px-2 py-0.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded font-semibold flex items-center space-x-1"
              >
                <Receipt className="w-2.5 h-2.5 text-blue-600" />
                <span>Explore Vouchers</span>
              </button>
              <button
                onClick={() => showFeedback('Payment link dispatched!')}
                className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold flex items-center space-x-1"
              >
                <LinkIcon className="w-2.5 h-2.5 text-slate-500" />
                <span>Payment Link</span>
              </button>
              <button
                onClick={() => navigate('/cases')}
                className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold flex items-center space-x-1"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-slate-500" />
                <span>Raise Dispute</span>
              </button>
              <button
                onClick={() => showFeedback('Refund approval submitted to Finance!')}
                className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 rounded font-semibold flex items-center space-x-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Request Refund Approval</span>
              </button>

              {actionSuccessMsg && (
                <span className="text-emerald-700 font-bold ml-2 animate-fade-in">{actionSuccessMsg}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lower Area: Customer Communication Dock */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CommunicationDock emailWrapUp={true} linkedTicket="FIN-10482" />
      </div>
    </div>
  );
};
