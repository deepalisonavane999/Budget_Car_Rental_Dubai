import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Download,
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
  X,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CommunicationDock } from '../components/communication/CommunicationDock';
import { useNavigate } from 'react-router-dom';

export const BillingPage: React.FC = () => {
  const {
    customer,
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
    agreementResults,
    isSearchingBooking,
    isSearchingAgreement,
    executeBookingFilter,
    executeAgreementFilter,
  } = useWorkspace();
  const navigate = useNavigate();
  const [selectedRentalType, setSelectedRentalType] = useState<'previous' | 'active'>('previous');
  const [activeBillingSection, setActiveBillingSection] = useState<'agreements_billing' | 'booking_details'>('agreements_billing');
  const [lowerTab, setLowerTab] = useState<'bookings' | 'vouchers' | 'invoice_lines'>('bookings');
  const [selectedAgreementNo, setSelectedAgreementNo] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Agreement Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Booking Pagination & Search
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);

  // Automatically switch to Booking Details view when top navbar filter is triggered
  useEffect(() => {
    const handleShowBookings = () => {
      setActiveBillingSection('booking_details');
    };
    window.addEventListener('billing:show-bookings', handleShowBookings);
    return () => window.removeEventListener('billing:show-bookings', handleShowBookings);
  }, []);

  // Select initial agreement for billing view once available or from active/previous rental
  const hasInitializedBillingTabRef = useRef(false);

  useEffect(() => {
    if (selectedAgreementNo || hasInitializedBillingTabRef.current) return;

    const targetAgr =
      previousRental.agreementNo && previousRental.agreementNo !== '—'
        ? previousRental.agreementNo
        : activeRental.agreementNo && activeRental.agreementNo !== '—'
        ? activeRental.agreementNo
        : agreementResults[0]?.agreementNo;

    if (targetAgr) {
      hasInitializedBillingTabRef.current = true;
      setSelectedAgreementNo(targetAgr);
      loadBillingForAgreement(targetAgr);
    }
  }, [
    selectedAgreementNo,
    previousRental.agreementNo,
    activeRental.agreementNo,
    agreementResults,
    loadBillingForAgreement,
  ]);

  const handleSelectAgreement = async (
    bNo: string,
    custId?: number,
    targetTab: 'vouchers' | 'invoice_lines' = 'vouchers'
  ) => {
    setSelectedAgreementNo(bNo);
    setActiveBillingSection('agreements_billing');
    const workspaceCustId =
      customer.id && customer.id !== '—'
        ? parseInt(String(customer.id).replace(/\D/g, ''), 10)
        : undefined;
    const resolvedCustId = custId && custId > 0 ? custId : workspaceCustId;
    const res = await loadBillingForAgreement(bNo, resolvedCustId, {
      fromDate: agreementFromDate ? `${agreementFromDate}T00:00:00` : undefined,
      toDate: agreementToDate ? `${agreementToDate}T23:59:59` : undefined,
      status: agreementStatusFilter !== 'all' ? agreementStatusFilter : undefined,
    });
    showFeedback(res.message);
    setLowerTab(targetTab);
  };

  // Agreement Date-Based and Search Filtering (with pre-filled Customer ID)
  const [agreementCustomerId, setAgreementCustomerId] = useState<string>(() => {
    return customer.id && customer.id !== '—' ? customer.id : '';
  });
  const [agreementFromDate, setAgreementFromDate] = useState<string>('');
  const [agreementToDate, setAgreementToDate] = useState<string>('');
  const [agreementStatusFilter, setAgreementStatusFilter] = useState<string>('all');
  const [agreementSearchQuery, setAgreementSearchQuery] = useState<string>('');

  // Grab customer ID initially from customerDetail when it loads, while allowing manual edits
  useEffect(() => {
    if (customer.id && customer.id !== '—' && !agreementCustomerId) {
      setAgreementCustomerId(customer.id);
    }
  }, [customer.id]);

  // Filter Agreements based on Date Range, Status, Customer ID & Search Query
  const filteredAgreements = useMemo(() => {
    const source = agreementResults.length > 0 ? agreementResults : (bookingResults as any);
    return source.filter((b: any) => {
      const bNo = (b.agreementNo || b.bookingNo || `AGR-${b.id}`).toLowerCase();
      const plate = ((b as any).vehicle?.plateNo || (b as any).plateNo || '').toLowerCase();

      // Customer ID filter
      if (agreementCustomerId.trim()) {
        const qCust = agreementCustomerId.trim();
        const itemCust = String(b.customerId || b.customer?.id || '');
        if (itemCust && itemCust !== qCust) return false;
      }

      // Text search
      if (agreementSearchQuery.trim()) {
        const q = agreementSearchQuery.trim().toLowerCase();
        if (!bNo.includes(q) && !plate.includes(q)) return false;
      }

      // Status filter
      if (agreementStatusFilter !== 'all') {
        const status = b.agreementStatus || b.status || b.bookingStatus || 'Active';
        if (agreementStatusFilter === 'Active' && status !== 'Active' && status !== 'Open') return false;
        if (agreementStatusFilter === 'Closed' && status !== 'Closed' && status !== 'Returned') return false;
      }

      // Date-based filter
      if (agreementFromDate) {
        const bStartDate = (b.startDate || '').split('T')[0];
        if (bStartDate && bStartDate < agreementFromDate) return false;
      }
      if (agreementToDate) {
        const bEndDate = (b.endDate || b.startDate || '').split('T')[0];
        if (bEndDate && bEndDate > agreementToDate) return false;
      }

      return true;
    });
  }, [
    agreementResults,
    bookingResults,
    agreementCustomerId,
    agreementSearchQuery,
    agreementStatusFilter,
    agreementFromDate,
    agreementToDate,
  ]);

  // Filter Bookings from top navbar search
  const filteredBookings = useMemo(() => {
    return bookingResults.filter((b) => {
      if (!bookingSearchQuery.trim()) return true;
      const q = bookingSearchQuery.trim().toLowerCase();
      const bNo = (b.bookingNo || b.agreementNo || `BKG-${b.id}`).toLowerCase();
      const plate = ((b as any).vehicle?.plateNo || (b as any).plateNo || '').toLowerCase();
      return bNo.includes(q) || plate.includes(q);
    });
  }, [bookingResults, bookingSearchQuery]);

  const totalBookingPages = Math.ceil(filteredBookings.length / bookingPageSize) || 1;
  const paginatedBookingsList = filteredBookings.slice(
    (bookingCurrentPage - 1) * bookingPageSize,
    bookingCurrentPage * bookingPageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAgreements]);

  const totalPages = Math.ceil(filteredAgreements.length / pageSize) || 1;
  const paginatedBookings = filteredAgreements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const handleApplyApiDateFilter = async () => {
    const cleanIdStr = agreementCustomerId.trim();
    const custId = cleanIdStr ? parseInt(cleanIdStr.replace(/\D/g, ''), 10) || undefined : undefined;
    const res = await executeAgreementFilter({
      customerId: custId,
      fromDate: agreementFromDate ? `${agreementFromDate}T00:00:00` : undefined,
      toDate: agreementToDate ? `${agreementToDate}T23:59:59` : undefined,
      status: agreementStatusFilter !== 'all' ? agreementStatusFilter : undefined,
      agreementNo: agreementSearchQuery.trim() || undefined,
      forceRefresh: true,
    });
    showFeedback(res.message);
  };

  return (
    <div className="flex-1 flex flex-col justify-start overflow-y-auto p-2 space-y-2 animate-fade-in">
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
              <div className="relative">
                <select
                  value={selectedRentalType}
                  onChange={(e) => setSelectedRentalType(e.target.value as 'previous' | 'active')}
                  className="pl-2 pr-6 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-medium text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
            <div className="bg-white border border-slate-200 rounded p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5 text-[10px]">
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
                disabled={!selectedAgreementNo}
                onClick={async () => {
                  if (billingSummary.invoiceNo && selectedInvoiceLines.length === 0) {
                    await fetchInvoiceDetails(billingSummary.invoiceNo);
                  }
                  setLowerTab('invoice_lines');
                }}
                className={`px-2 py-0.5 rounded font-semibold flex items-center space-x-1 transition-all ${
                  !selectedAgreementNo
                    ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs'
                }`}
                title="View itemized invoice lines & charges"
              >
                <FileText className="w-2.5 h-2.5 text-slate-500" />
                <span>View Invoice</span>
              </button>
              <button
                type="button"
                disabled={lowerTab === 'bookings'}
                onClick={() => lowerTab !== 'bookings' && setLowerTab('vouchers')}
                className={`px-2 py-0.5 rounded font-semibold flex items-center space-x-1 transition-all ${
                  lowerTab === 'bookings'
                    ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60 cursor-default'
                    : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer'
                }`}
                title={lowerTab === 'bookings' ? 'Select an agreement first to explore vouchers' : 'Explore vouchers for selected agreement'}
              >
                <Receipt className="w-2.5 h-2.5 text-slate-500" />
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
            {isSearchingBooking || isSearchingAgreement || isLoadingBillingAgreement ? (
              <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <span className="text-xs text-slate-500 mt-2 block font-medium">
                  Loading...
                </span>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-2 animate-fade-in">
                {/* View Switcher: Rental Agreements & Invoices vs Booking Details */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                      <button
                      type="button"
                      onClick={() => setActiveBillingSection('booking_details')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        activeBillingSection === 'booking_details'
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : 'hover:text-slate-900 text-slate-600'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 text-slate-600" />
                      <span>Booking Details</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
                        {filteredBookings.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBillingSection('agreements_billing')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                        activeBillingSection === 'agreements_billing'
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : 'hover:text-slate-900 text-slate-600'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rental Agreements & Billing</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full font-mono font-bold border border-blue-200">
                        {filteredAgreements.length}
                      </span>
                    </button>
                  
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {activeBillingSection === 'agreements_billing'
                      ? 'Agreements → Vouchers (Receipts) → Invoices (Charges)'
                      : 'Filtered via Top Navbar Booking Search'}
                  </span>
                </div>

                {activeBillingSection === 'booking_details' ? (
                  /* Booking Details Table (Populated by Top Navbar Filter) */
                  <div className="space-y-2 animate-fade-in">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Bookings:</span>
                        </span>
                        <div className="relative">
                          <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5 pointer-events-none" />
                          <input
                            type="text"
                            value={bookingSearchQuery}
                            onChange={(e) => setBookingSearchQuery(e.target.value)}
                            placeholder="Search booking # or plate..."
                            className="pl-5 pr-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:ring-1 focus:ring-blue-500 w-44"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                        <span>Rows:</span>
                        <select
                          value={bookingPageSize}
                          onChange={(e) => {
                            setBookingPageSize(Number(e.target.value));
                            setBookingCurrentPage(1);
                          }}
                          className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value={10}>10 / page</option>
                          <option value={15}>15 / page</option>
                          <option value={25}>25 / page</option>
                        </select>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-slate-700">{filteredBookings.length} booking records</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px] select-text">
                          <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                            <tr>
                              <th className="py-1.5 px-3 bg-slate-50">Booking #</th>
                              <th className="py-1.5 px-3 bg-slate-50">Booking Status</th>
                              <th className="py-1.5 px-3 bg-slate-50">Vehicle / Group</th>
                              <th className="py-1.5 px-3 bg-slate-50">Assigned Plate</th>
                              <th className="py-1.5 px-3 bg-slate-50">Booking Dates</th>
                              <th className="py-1.5 px-3 bg-slate-50">Location</th>
                              <th className="py-1.5 px-3 bg-slate-50">Total Charges</th>
                              <th className="py-1.5 px-3 bg-slate-50 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedBookingsList.length > 0 ? (
                              paginatedBookingsList.map((b) => {
                                const bNo = b.bookingNo || `BKG-${b.id}`;
                                const linkedAgrNo = b.agreementNo;
                                const plate = (b as any).vehicle?.plateNo || (b as any).plateNo || '—';
                                const status = b.bookingStatus || 'New';
                                const isClosed = status === 'Closed';

                                return (
                                  <tr key={b.id || bNo} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-1.5 px-3">
                                      <span className="font-mono font-bold text-slate-900 text-xs block">{bNo}</span>
                                      {(b as any).bookingRefNo && (
                                        <span className="text-[9px] text-slate-400 font-mono">Ref: {(b as any).bookingRefNo}</span>
                                      )}
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <Badge
                                        variant={
                                          status === 'Confirmed'
                                            ? 'blue'
                                            : isClosed
                                            ? 'gray'
                                            : status === 'Cancelled'
                                            ? 'red'
                                            : 'green'
                                        }
                                        className="text-[9px] py-0 px-1.5"
                                      >
                                        {status}
                                      </Badge>
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-700 text-[10px]">
                                      {b.vehicleGroup?.name ? `Group ${b.vehicleGroup.name}` : 'Rental Vehicle'}
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <span className="font-mono font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                                        {plate}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-600 text-[10px]">
                                      <span>{b.startDate?.split('T')[0] || '—'} → {b.endDate?.split('T')[0] || '—'}</span>
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-600 text-[10px]">
                                      {b.location || (b as any).pickupLocation || 'Dubai'}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                                      AED {Number(b.totalCharges || 0).toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-3 text-right">
                                      <div className="flex items-center justify-end space-x-1.5">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const params = new URLSearchParams(window.location.search);
                                            params.set('op', 'accidents');
                                            if (plate && plate !== '—') params.set('plate', plate);
                                            navigate(`/operations?${params.toString()}`);
                                          }}
                                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                                          title="Check Accident & Police Reports"
                                        >
                                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                          <span>Accidents</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                                  No booking records found. Use the <strong>Filter Bookings</strong> button in the top navbar to filter by date range or booking status.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Rental Agreements & Billing Stepper Flow */
                  <div className="space-y-2 animate-fade-in">
                    {/* Stepper Tabs Bar (Direct Tab Navigation) */}
                    <div className="border-b border-slate-200 pb-3 pt-1 px-1">
                      <div className="flex items-center justify-between gap-3">
                    
                    {/* Item 1: Rental Agreements */}
                    <div
                      onClick={() => setLowerTab('bookings')}
                      className={`flex items-center space-x-2.5 cursor-pointer select-none transition-all group ${
                        lowerTab === 'bookings' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          lowerTab === 'bookings'
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100'
                            : selectedAgreementNo
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {lowerTab !== 'bookings' && selectedAgreementNo ? '✓' : '1'}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-bold leading-tight ${
                            lowerTab === 'bookings' ? 'text-blue-600' : 'text-slate-800'
                          }`}>
                            Rental Agreements
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono font-medium">
                            {filteredAgreements.length}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {selectedAgreementNo ? `Selected: ${selectedAgreementNo}` : 'Select an agreement'}
                        </p>
                      </div>
                    </div>

                    {/* Connecting Line 1 -> 2 */}
                    <div className={`flex-1 h-px self-center transition-colors ${
                      lowerTab === 'vouchers' || lowerTab === 'invoice_lines' ? 'bg-blue-500' : 'bg-slate-200'
                    }`}></div>

                    {/* Item 2: Vouchers (Payment Receipts) */}
                    <div
                      onClick={() => (lowerTab === 'vouchers' || lowerTab === 'invoice_lines') && setLowerTab('vouchers')}
                      className={`flex items-center space-x-2.5 select-none transition-all ${
                        lowerTab === 'bookings'
                          ? 'opacity-40 cursor-default'
                          : lowerTab === 'vouchers'
                          ? 'opacity-100 cursor-pointer'
                          : 'opacity-80 hover:opacity-100 cursor-pointer'
                      }`}
                      title={lowerTab === 'bookings' ? 'Select an agreement from the list below to view payment vouchers' : undefined}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          lowerTab === 'bookings'
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : lowerTab === 'vouchers'
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {lowerTab === 'invoice_lines' ? '✓' : '2'}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-bold leading-tight ${
                            lowerTab === 'vouchers'
                              ? 'text-blue-600'
                              : lowerTab === 'bookings'
                              ? 'text-slate-400'
                              : 'text-slate-800'
                          }`}>
                            Vouchers (Payment Receipts)
                          </span>
                          {selectedAgreementNo && lowerTab !== 'bookings' && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full font-mono font-medium">
                              {selectedAgreementVouchers.length}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Payment receipts &amp; refunds
                        </p>
                      </div>
                    </div>

                    {/* Connecting Line 2 -> 3 */}
                    <div className={`flex-1 h-px self-center transition-colors ${
                      lowerTab === 'invoice_lines' ? 'bg-blue-500' : 'bg-slate-200'
                    }`}></div>

                    {/* Item 3: Invoices (Amounts Charged) */}
                    <div
                      onClick={async () => {
                        if (selectedAgreementNo) {
                          if (billingSummary.invoiceNo && selectedInvoiceLines.length === 0) {
                            await fetchInvoiceDetails(billingSummary.invoiceNo);
                          }
                          setLowerTab('invoice_lines');
                        }
                      }}
                      className={`flex items-center space-x-2.5 select-none transition-all ${
                        !selectedAgreementNo
                          ? 'opacity-40 cursor-not-allowed'
                          : 'opacity-100 cursor-pointer hover:opacity-90'
                      }`}
                      title={!selectedAgreementNo ? 'Select an agreement first to view invoice charges' : 'Click to view itemized invoice charges'}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          lowerTab === 'invoice_lines'
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        3
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-bold leading-tight ${
                            lowerTab === 'invoice_lines' ? 'text-blue-600 font-bold' : 'text-slate-700'
                          }`}>
                            Invoices (Amounts Charged)
                          </span>
                          {selectedAgreementNo && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-mono font-medium">
                              {selectedInvoiceLines.length > 0 ? selectedInvoiceLines.length : '1'}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Itemized lines &amp; charges
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Tab 1: Bookings & Agreements */}
                {lowerTab === 'bookings' && (
                  <div className="space-y-2">
                    {/* Date-Based and Status Filter Toolbar */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-700 flex items-center space-x-1">
                          <Filter className="w-3 h-3 text-blue-600" />
                          <span>Filter Agreements:</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">Customer ID:</span>
                          <input
                            type="text"
                            value={agreementCustomerId}
                            onChange={(e) => setAgreementCustomerId(e.target.value)}
                            placeholder="e.g. 103278"
                            className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 font-mono focus:ring-1 focus:ring-blue-500 w-20"
                            title="Filter by Speed Auto ERP Customer ID (pre-filled from Customer Details, editable)"
                          />
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">From:</span>
                          <input
                            type="date"
                            value={agreementFromDate}
                            onChange={(e) => setAgreementFromDate(e.target.value)}
                            className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">To:</span>
                          <input
                            type="date"
                            value={agreementToDate}
                            onChange={(e) => setAgreementToDate(e.target.value)}
                            className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <select
                            value={agreementStatusFilter}
                            onChange={(e) => setAgreementStatusFilter(e.target.value)}
                            className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="all">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed / Returned</option>
                          </select>
                        </div>

                        <div className="relative">
                          <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5 pointer-events-none" />
                          <input
                            type="text"
                            value={agreementSearchQuery}
                            onChange={(e) => setAgreementSearchQuery(e.target.value)}
                            placeholder="Agreement # or plate..."
                            className="pl-5 pr-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:ring-1 focus:ring-blue-500 w-36"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <div className="flex items-center space-x-1 text-[10px] text-slate-600 mr-1">
                          <span className="font-medium">Rows:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value={10}>10 / page</option>
                            <option value={15}>15 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                          </select>
                        </div>
                        {(agreementCustomerId || agreementFromDate || agreementToDate || agreementStatusFilter !== 'all' || agreementSearchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setAgreementCustomerId(customer.id && customer.id !== '—' ? customer.id : '');
                              setAgreementFromDate('');
                              setAgreementToDate('');
                              setAgreementStatusFilter('all');
                              setAgreementSearchQuery('');
                            }}
                            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-[10px] font-medium flex items-center space-x-0.5 cursor-pointer"
                            title="Reset filters"
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-slate-500" />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleApplyApiDateFilter}
                          disabled={isSearchingBooking}
                          className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Search className="w-2.5 h-2.5" />
                          <span>Search</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px] select-text">
                          <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                            <tr>
                              <th className="py-1.5 px-3 bg-slate-50">Rental Agreement #</th>
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
                                const bNo = b.agreementNo || b.bookingNo || `AGR-${b.id}`;
                                const plate = (b as any).vehicle?.plateNo || (b as any).plateNo || '';
                                const isClosed = b.agreementStatus === 'Closed' || b.bookingStatus === 'Closed';
                                const isSelected = selectedAgreementNo === bNo;
                                const itemCustId = b.customer?.id || (b as any).customerId;

                                return (
                                  <tr
                                    key={b.id || bNo}
                                    onClick={() => handleSelectAgreement(bNo, itemCustId, 'vouchers')}
                                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                  >
                                    <td className="py-1 px-3">
                                      <div className="flex items-center space-x-1.5 leading-none">
                                        <span className="font-mono font-bold text-slate-900 text-xs leading-none">{bNo}</span>
                                        {isSelected && (
                                          <span className="text-[8px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                            Selected
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-slate-400 block mt-0.5">
                                        {b.vehicleGroup?.name ? `Group ${b.vehicleGroup.name}` : 'Rental Vehicle'}
                                      </span>
                                    </td>
                                    <td className="py-1 px-3">
                                      <Badge variant={isClosed ? 'gray' : 'green'} className="text-[9px] py-0 px-1.5">
                                        {b.agreementStatus || b.bookingStatus || 'Active'}
                                      </Badge>
                                    </td>
                                    <td className="py-1 px-3">
                                      <span className="font-mono font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                                        {plate || '—'}
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
                                          disabled={!plate}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!plate) return;
                                            const params = new URLSearchParams(window.location.search);
                                            params.set('op', 'accidents');
                                            params.set('plate', plate);
                                            if (itemCustId) params.set('customerId', String(itemCustId));
                                            navigate(`/operations?${params.toString()}`);
                                          }}
                                          className={`px-2 py-0.5 rounded text-[9px] font-semibold flex items-center space-x-0.5 transition-colors ${
                                            plate
                                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                                          }`}
                                          title={plate ? `Check Accident & Police Reports for plate ${plate}` : 'No plate assigned'}
                                        >
                                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                          <span>Accidents</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectAgreement(bNo, itemCustId, 'vouchers');
                                          }}
                                          className="px-2.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                                        >
                                          <span>View Vouchers</span>
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
                                  No agreements matched the selected date and search filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {filteredAgreements.length > 0 && (
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px]">
                          <div className="flex items-center space-x-3 text-slate-500">
                            <span>
                              Showing{' '}
                              <span className="font-semibold text-slate-800">
                                {(currentPage - 1) * pageSize + 1}
                              </span>{' '}
                              to{' '}
                              <span className="font-semibold text-slate-800">
                                {Math.min(currentPage * pageSize, filteredAgreements.length)}
                              </span>{' '}
                              of{' '}
                              <span className="font-semibold text-slate-800">
                                {filteredAgreements.length}
                              </span>{' '}
                              agreements
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
                          <span>All Agreements</span>
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800 font-medium">
                          Payment Vouchers for <span className="font-mono font-semibold text-slate-900">{selectedAgreementNo || billingSummary.agreementNo || displayedRental.agreementNo}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedAgreementVouchers.length} voucher{selectedAgreementVouchers.length === 1 ? '' : 's'} linked
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px] select-text">
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
                                    <td className="py-1.5 px-3">
                                      <span className="font-mono font-bold text-slate-900 text-xs block">{v.voucherNo}</span>
                                      <span className="text-[9px] text-slate-400">ID: {v.id}</span>
                                    </td>
                                    <td className="py-1.5 px-3">
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
                                        {v.voucherTypesName || 'Payment Receipt'}
                                      </Badge>
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-600 text-[10px]">
                                      {v.date?.split('T')[0] || '—'}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900">
                                      AED {Number(v.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono text-slate-700">
                                      AED {Number(v.allocatedAmount ?? v.amount ?? 0).toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <Badge variant={v.isClosed ? 'gray' : 'green'} className="text-[9px] py-0 px-1.5">
                                        {v.statusText || (v.isClosed ? 'Closed' : 'Open')}
                                      </Badge>
                                    </td>
                                    <td className="py-1.5 px-3 text-right">
                                      <div className="flex items-center justify-end space-x-1.5">
                                        {v.url && (
                                          <a
                                            href={v.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                                            title="Download Report"
                                          >
                                            <span>Report</span>
                                            <Download className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await fetchInvoiceDetails(v.voucherNo);
                                            setLowerTab('invoice_lines');
                                          }}
                                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                                          title={`View invoice breakdown for voucher ${v.voucherNo}`}
                                        >
                                          <span>View Invoice Charges</span>
                                          <ArrowRight className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                    No payment vouchers recorded for agreement {selectedAgreementNo || billingSummary.agreementNo || displayedRental.agreementNo}. Click &quot;View Vouchers&quot; on any agreement in All Agreements.
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
                  <div className="space-y-1.5 animate-fade-in">
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
                        <button
                          type="button"
                          onClick={() => setLowerTab('bookings')}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>All Agreements</span>
                        </button>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">
                          Invoice Line Items for <span className="font-mono font-bold text-slate-900">{selectedAgreementNo || billingSummary.agreementNo}</span>: <span className="font-mono font-bold text-slate-900">{billingSummary.invoiceNo || 'INV-387951'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden">
                      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                        <table className="w-full text-left text-[11px] select-text">
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
                                    <td className="py-1.5 px-3 font-mono text-slate-500">{line.srNo || idx + 1}</td>
                                    <td className="py-1.5 px-3 font-medium text-slate-800">
                                      {line.chargesType?.name || 'Rental Fee'}
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-600">{line.description || 'Basic Rental'}</td>
                                    <td className="py-1.5 px-3">
                                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-800">
                                        {line.vehicle?.plateNo || displayedRental.vehicle.plateNo}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-3 font-mono">{line.quantity || 1}</td>
                                    <td className="py-1.5 px-3 font-mono">
                                      AED {Number(line.credit || line.debit || 0).toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono text-slate-600">
                                      AED {Number(line.tax || 0).toFixed(2)}
                                    </td>
                                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900 text-right">
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
              </div>
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
