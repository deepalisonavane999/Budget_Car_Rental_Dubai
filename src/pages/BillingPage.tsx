import React, { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Car,
  Receipt,
  Layers,
  Search,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CommunicationDock } from '../components/communication/CommunicationDock';
import { VoucherExplorer } from '../components/billing/VoucherExplorer';
import { InvoiceExplorer } from '../components/billing/InvoiceExplorer';
import { useNavigate } from 'react-router-dom';

export const BillingPage: React.FC = () => {
  const {
    billingSummary,
    activeRental,
    previousRental,
    fetchInvoiceDetails,
    fetchStatementOfAccounts,
    setActiveNavTab,
    searchBookingOrAgreement,
    loadBillingForAgreement,
    selectedAgreementVouchers,
    selectedInvoiceLines,
    isLoadingBillingAgreement,
    bookingResults,
    isSearchingBooking,
  } = useWorkspace();
  const navigate = useNavigate();
  const [selectedRentalType, setSelectedRentalType] = useState<'previous' | 'active'>('previous');
  const [billingView, setBillingView] = useState<'overview' | 'vouchers' | 'invoices'>('overview');
  const [lowerTab, setLowerTab] = useState<'bookings' | 'vouchers' | 'invoice_lines'>('bookings');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingResults]);

  const totalPages = Math.ceil(bookingResults.length / pageSize) || 1;
  const paginatedBookings = bookingResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

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
    <div className="flex-1 flex flex-col justify-start overflow-y-auto p-2 space-y-2 animate-fade-in select-none">
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
              {actionSuccessMsg && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium animate-fade-in">
                  {actionSuccessMsg}
                </span>
              )}
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
                  <span>Vouchers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingView('invoices')}
                  className={`flex items-center space-x-1 px-2.5 py-0.5 rounded transition-all ${
                    billingView === 'invoices'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Invoices</span>
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
              <div className="leading-tight truncate">
                <h3 className="font-bold text-slate-900 text-xs truncate">{displayedRental.vehicle.model}</h3>
                <p className="text-slate-500 text-[9px]">{displayedRental.vehicle.category}</p>
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Agreement No.</span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">
                {displayedRental.agreementNo}
              </span>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Assigned Plate</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="font-bold text-slate-900 font-mono text-[10px]">
                  {displayedRental.vehicle.plateNo || '—'}
                </span>
                {displayedRental.vehicle.plateNo && (
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('op', 'accidents');
                      params.set('plate', displayedRental.vehicle.plateNo!);
                      navigate(`/operations?${params.toString()}`);
                    }}
                    title="Check Accident & Police Reports for this plate"
                    className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                    <span>Accidents</span>
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-[9px] text-slate-400 block">Pickup Location</span>
              <span className="font-medium text-slate-800 text-[10px] truncate block">
                {displayedRental.pickupLocation}
              </span>
            </div>

            <div className="col-span-3 border-l border-slate-100 pl-2 flex space-x-3">
              <div>
                <span className="text-[9px] text-slate-400 block">Pickup</span>
                <div className="font-bold text-slate-800 text-[10px]">
                  {displayedRental.pickupDate} {displayedRental.pickupTime}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Return</span>
                <div className="font-bold text-slate-800 text-[10px]">
                  {displayedRental.returnDate} {displayedRental.returnTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {billingView === 'vouchers' ? (
          <VoucherExplorer />
        ) : billingView === 'invoices' ? (
          <InvoiceExplorer />
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
                type="button"
                onClick={() => setLowerTab('invoice_lines')}
                className="px-2 py-0.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <FileText className="w-2.5 h-2.5 text-blue-600" />
                <span>View Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setLowerTab('vouchers')}
                className="px-2 py-0.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded font-semibold flex items-center space-x-1 cursor-pointer"
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
                onClick={() => setActiveNavTab('cases')}
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

            {/* 4. Single Clean Tabbed Container for Connected Billing Flow */}
            {isSearchingBooking || isLoadingBillingAgreement ? (
              <div className="bg-white border border-slate-200 rounded p-6 text-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <span className="text-xs font-medium block">
                  {isSearchingBooking ? 'Querying GetBookingByDifferentFilters...' : 'Loading live agreement vouchers & invoice lines...'}
                </span>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-2 select-none animate-fade-in">
                {/* Clean Tab Selector Bar */}
                <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-0.5 rounded text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setLowerTab('bookings')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-all cursor-pointer ${
                        lowerTab === 'bookings'
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>All Bookings & Agreements</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                        {bookingResults.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLowerTab('vouchers')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-all cursor-pointer ${
                        lowerTab === 'vouchers'
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Vouchers ({billingSummary.agreementNo || displayedRental.agreementNo})</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full font-mono">
                        {selectedAgreementVouchers.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLowerTab('invoice_lines')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-all cursor-pointer ${
                        lowerTab === 'invoice_lines'
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice Lines ({billingSummary.invoiceNo || 'INV-387951'})</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                        {selectedInvoiceLines.length}
                      </span>
                    </button>
                  </div>

                  {lowerTab === 'bookings' && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-600">
                      <span className="font-medium">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value={10}>10 / page</option>
                        <option value={15}>15 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Tab 1: Bookings & Agreements */}
                {lowerTab === 'bookings' && (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                          <tr>
                            <th className="py-1.5 px-3 bg-slate-50">Booking / Agreement #</th>
                            <th className="py-1.5 px-3 bg-slate-50">Status</th>
                            <th className="py-1.5 px-3 bg-slate-50">Assigned Plate</th>
                            <th className="py-1.5 px-3 bg-slate-50">Rental Dates</th>
                            <th className="py-1.5 px-3 bg-slate-50">Total Charges</th>
                            <th className="py-1.5 px-3 bg-slate-50 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedBookings.length > 0 ? (
                            paginatedBookings.map((b) => {
                              const bNo = b.bookingNo || b.agreementNo || `BKG-${b.id}`;
                              const plate = (b as any).vehicle?.plateNo || (b as any).plateNo || '32849-EE-DXB';
                              const isClosed = b.bookingStatus === 'Closed';

                              return (
                                <tr key={b.id || bNo} className="hover:bg-blue-50/40 transition-colors">
                                  <td className="py-1 px-3">
                                    <span className="font-mono font-bold text-slate-900 text-xs block">{bNo}</span>
                                    <span className="text-[9px] text-slate-400">
                                      {b.vehicleGroup?.name ? `Group ${b.vehicleGroup.name}` : 'Rental Vehicle'}
                                    </span>
                                  </td>
                                  <td className="py-1 px-3">
                                    <Badge variant={isClosed ? 'gray' : 'green'} className="text-[9px] py-0 px-1.5">
                                      {b.bookingStatus || 'Active'}
                                    </Badge>
                                  </td>
                                  <td className="py-1 px-3">
                                    <span className="font-mono font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                                      {plate}
                                    </span>
                                  </td>
                                  <td className="py-1 px-3 text-slate-600 text-[10px]">
                                    <span>{b.startDate?.split('T')[0] || '—'} → {b.endDate?.split('T')[0] || '—'}</span>
                                    {b.location && (
                                      <span className="text-slate-400 block text-[9px]">{b.location}</span>
                                    )}
                                  </td>
                                  <td className="py-1 px-3 font-mono font-bold text-slate-900">
                                    AED {Number(b.totalCharges || 0).toLocaleString()}
                                  </td>
                                  <td className="py-1 px-3 text-right">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const params = new URLSearchParams(window.location.search);
                                          params.set('op', 'accidents');
                                          params.set('plate', plate);
                                          navigate(`/operations?${params.toString()}`);
                                        }}
                                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                                        title="Check Accident & Police Reports for this plate"
                                      >
                                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                        <span>Accidents</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const res = await loadBillingForAgreement(bNo, (b as any).customerId);
                                          showFeedback(res.message);
                                          setLowerTab('vouchers');
                                        }}
                                        className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                                      >
                                        <span>Load for Billing</span>
                                        <ArrowRight className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                                No bookings found for this customer.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {bookingResults.length > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px]">
                        <div className="flex items-center space-x-3 text-slate-500">
                          <span>
                            Showing{' '}
                            <span className="font-semibold text-slate-800">
                              {(currentPage - 1) * pageSize + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-semibold text-slate-800">
                              {Math.min(currentPage * pageSize, bookingResults.length)}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-800">
                              {bookingResults.length}
                            </span>{' '}
                            bookings
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
                            <span className="font-semibold text-slate-800">{totalPages}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-1.5 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border border-slate-300 rounded text-slate-700 flex items-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="First Page"
                          >
                            <ChevronsLeft className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border border-slate-300 rounded text-slate-700 flex items-center space-x-0.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Prev</span>
                          </button>

                          <div className="flex items-center space-x-1 px-1">
                            {getPageNumbers().map((item, idx) => {
                              if (item === '...') {
                                return (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                                    ...
                                  </span>
                                );
                              }
                              const pageNum = Number(item);
                              return (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-5 h-5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border border-slate-300 rounded text-slate-700 flex items-center space-x-0.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-1.5 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border border-slate-300 rounded text-slate-700 flex items-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="Last Page"
                          >
                            <ChevronsRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Vouchers for Selected Agreement */}
                {lowerTab === 'vouchers' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] px-1 py-0.5 text-slate-500">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setLowerTab('bookings')}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>All Bookings</span>
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800 font-medium">
                          Vouchers for <span className="font-mono font-semibold text-slate-900">{billingSummary.agreementNo || displayedRental.agreementNo}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedAgreementVouchers.length} voucher{selectedAgreementVouchers.length === 1 ? '' : 's'} linked
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                            <tr>
                              <th className="py-1.5 px-3 bg-slate-50">Voucher #</th>
                              <th className="py-1.5 px-3 bg-slate-50">Type</th>
                              <th className="py-1.5 px-3 bg-slate-50">Date</th>
                              <th className="py-1.5 px-3 bg-slate-50">Amount</th>
                              <th className="py-1.5 px-3 bg-slate-50">Allocated</th>
                              <th className="py-1.5 px-3 bg-slate-50">Status</th>
                              <th className="py-1.5 px-3 bg-slate-50 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedAgreementVouchers.length > 0 ? (
                              selectedAgreementVouchers.map((v) => {
                                const type = (v.voucherTypesName || v.voucherSubTypeName || '').toLowerCase();
                                const isInvoice = type.includes('invoice') || v.type === 1;

                                return (
                                  <tr key={v.id || v.voucherNo} className="hover:bg-blue-50/40 transition-colors">
                                    <td className="py-2 px-3">
                                      <span className="font-mono font-bold text-slate-900 text-xs block">{v.voucherNo}</span>
                                      <span className="text-[9px] text-slate-400">ID: {v.id}</span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <Badge
                                        variant={
                                          isInvoice
                                            ? 'blue'
                                            : type.includes('credit')
                                            ? 'purple'
                                            : type.includes('refund')
                                            ? 'green'
                                            : 'amber'
                                        }
                                        className="text-[9px] py-0 px-1.5"
                                      >
                                        {v.voucherTypesName || 'Voucher'}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600 text-[10px]">
                                      {v.date?.split('T')[0] || '—'}
                                    </td>
                                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                      AED {Number(v.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-slate-700">
                                      AED {Number(v.allocatedAmount ?? v.amount ?? 0).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3">
                                      <Badge variant={v.isClosed ? 'gray' : 'green'} className="text-[9px] py-0 px-1.5">
                                        {v.statusText || (v.isClosed ? 'Closed' : 'Open')}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <div className="flex items-center justify-end space-x-1.5">
                                        {v.url && (
                                          <a
                                            href={v.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                                          >
                                            <span>Report</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                        {isInvoice && (
                                          <button
                                            type="button"
                                            onClick={() => setLowerTab('invoice_lines')}
                                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                                          >
                                            <span>Inspect Lines</span>
                                            <ArrowRight className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                  No vouchers recorded for agreement {billingSummary.agreementNo || displayedRental.agreementNo}. Click "Load for Billing" on any agreement above.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Invoice Lines Breakdown */}
                {lowerTab === 'invoice_lines' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] px-1 pb-1">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setLowerTab('vouchers')}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Back to Vouchers</span>
                        </button>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">
                          Invoice Line Items: <span className="font-mono font-bold text-slate-900">{billingSummary.invoiceNo || 'INV-387951'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                            <tr>
                              <th className="py-1.5 px-3 bg-slate-50">Line #</th>
                              <th className="py-1.5 px-3 bg-slate-50">Charge Type</th>
                              <th className="py-1.5 px-3 bg-slate-50">Description</th>
                              <th className="py-1.5 px-3 bg-slate-50">Assigned Plate</th>
                              <th className="py-1.5 px-3 bg-slate-50">Qty</th>
                              <th className="py-1.5 px-3 bg-slate-50">Credit / Rate</th>
                              <th className="py-1.5 px-3 bg-slate-50">Tax (5%)</th>
                              <th className="py-1.5 px-3 bg-slate-50 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedInvoiceLines.length > 0 ? (
                              selectedInvoiceLines.map((line, idx) => {
                                const total = Number((line.credit || 0) + (line.tax || 0)).toFixed(2);
                                return (
                                  <tr key={line.id || idx} className="hover:bg-blue-50/40 transition-colors">
                                    <td className="py-2 px-3 font-mono text-slate-500">{line.srNo || idx + 1}</td>
                                    <td className="py-2 px-3 font-medium text-slate-800">
                                      {line.chargesType?.name || 'Rental Fee'}
                                    </td>
                                    <td className="py-2 px-3 text-slate-600">{line.description || 'Basic Rental'}</td>
                                    <td className="py-2 px-3">
                                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-800">
                                        {line.vehicle?.plateNo || displayedRental.vehicle.plateNo}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 font-mono">{line.quantity || 1}</td>
                                    <td className="py-2 px-3 font-mono">
                                      AED {Number(line.credit || line.debit || 0).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-slate-600">
                                      AED {Number(line.tax || 0).toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right">
                                      AED {total}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                                  {billingSummary.chargeBreakdown.length > 0
                                    ? 'Detailed itemized invoice lines loaded into overview cards above.'
                                    : 'No line items available for this invoice.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Footer for Invoice Lines */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px]">
                        <span className="text-slate-500">
                          Invoice: <span className="font-mono font-bold text-slate-800">{billingSummary.invoiceNo}</span>
                          {billingSummary.isPaid ? ' (Paid)' : ' (Due)'}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-600">
                            VAT (5%): <span className="font-mono font-bold text-slate-900">AED {billingSummary.vatAmount}</span>
                          </span>
                          <span className="text-slate-600">
                            Total (Incl. VAT): <span className="font-mono font-bold text-blue-600 text-xs">AED {billingSummary.totalInclVat}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lower Area: Customer Communication Dock */}
      {/*
      <div className="flex-1 min-h-0 overflow-hidden">
        <CommunicationDock emailWrapUp={true} linkedTicket="FIN-10482" />
      </div>
      */}
    </div>
  );
};
