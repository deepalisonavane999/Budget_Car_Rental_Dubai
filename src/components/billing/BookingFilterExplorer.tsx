import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertTriangle, Calendar, Car, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, BookingItem } from '../../services/apiService';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

export const BookingFilterExplorer: React.FC<{
  onSelectBooking?: (booking: BookingItem) => void;
}> = ({ onSelectBooking }) => {
  const { customer, searchBookingOrAgreement, setActiveNavTab } = useWorkspace();
  const navigate = useNavigate();

  const getCleanCustomerId = (id?: string | null) => {
    if (!id || id === '—' || id === 'N/A') return '';
    const digitsOnly = String(id).replace(/\D/g, '');
    return digitsOnly;
  };

  const [bookingNo, setBookingNo] = useState('');
  const [confirmationNo, setConfirmationNo] = useState('');
  const [bookingStatus, setBookingStatus] = useState<string>('NA');
  const [customerId, setCustomerId] = useState<string>(getCleanCustomerId(customer.id));
  const [fromDate, setFromDate] = useState('2020-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const clean = getCleanCustomerId(customer.id);
    if (clean && !customerId) {
      setCustomerId(clean);
    }
  }, [customer.id]);

  const executeSearch = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const parsedId = parseInt(customerId.trim(), 10);
      const validCustomerId = !isNaN(parsedId) && parsedId > 0 ? parsedId : 0;

      const res = await apiService.getBookings({
        customerId: validCustomerId,
        bookingNo: bookingNo.trim() || undefined,
        bookingConfirmationNumber: confirmationNo.trim() || undefined,
        status: bookingStatus,
        fromDate: `${fromDate}T00:00:00`,
        toDate: `${toDate}T23:59:59`,
      });

      if (res.success && res.result?.items) {
        setBookings(res.result.items);
        if (res.result.items.length === 0) {
          setFeedback('No bookings found matching the selected filter criteria.');
        }
      } else {
        setBookings([]);
        // Filter out technical backend exception strings (e.g. System.Int64 / JSON parser)
        const isTechnical = res.error && (res.error.includes('System.') || res.error.includes('LineNumber') || res.error.includes('BytePosition'));
        if (!isTechnical && res.error) {
          setFeedback(res.error);
        } else {
          setFeedback('No bookings found for the given criteria.');
        }
      }
    } catch {
      setBookings([]);
      setFeedback('No bookings found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clean = getCleanCustomerId(customer.id);
    if (clean) {
      executeSearch();
    }
  }, [customer.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSelectBooking = async (b: BookingItem) => {
    const targetNo = b.bookingNo || b.agreementNo || String(b.id);
    await searchBookingOrAgreement(targetNo);
    if (onSelectBooking) onSelectBooking(b);
  };

  const handleNavigateToAccidents = (plateNo: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('op', 'accidents');
    params.set('plate', plateNo);
    navigate(`/operations?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-2.5 text-[11px] select-none">
      {/* Title & Filter Header */}
      <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Booking Filter Search</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={executeSearch}
          disabled={loading}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors flex items-center space-x-1"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          <span>{loading ? 'Searching...' : 'Apply Filters'}</span>
        </button>
      </div>

      {/* Filter Parameters Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-6 gap-2 bg-slate-50 p-2 rounded border border-slate-200">
        <div>
          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Booking #</label>
          <input
            type="text"
            value={bookingNo}
            onChange={(e) => setBookingNo(e.target.value)}
            placeholder="e.g. C9OBDLY00890"
            className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Confirmation #</label>
          <input
            type="text"
            value={confirmationNo}
            onChange={(e) => setConfirmationNo(e.target.value)}
            placeholder="Confirmation ref..."
            className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Booking Status</label>
          <select
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value)}
            className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
          >
            <option value="NA">All Statuses (NA)</option>
            <option value="Closed">Closed (Completed)</option>
            <option value="Confirmed">Confirmed</option>
            <option value="New">New</option>
            <option value="Cancelled">Cancelled</option>
            <option value="NoShow">No Show</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Customer ID</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Customer ID..."
            className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
        <span>
          Showing <span className="font-bold text-slate-800">{bookings.length}</span> booking records
        </span>
        {feedback && <span className="text-amber-600 font-medium">{feedback}</span>}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <p className="text-[11px]">Executing GetBookingByDifferentFilters...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded">
          <p className="text-xs">No bookings found for the given criteria.</p>
          <p className="text-[10px] mt-0.5">Adjust the date range, status, or booking number above to search.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {bookings.map((b) => {
            const plateNo = (b as any).vehicle?.plateNo || (b as any).plateNo || '32849-EE-DXB';
            const bNo = b.bookingNo || b.agreementNo || `BKG-${b.id}`;
            const isClosed = b.bookingStatus === 'Closed';

            return (
              <div
                key={b.id || bNo}
                className="p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded transition-all shadow-2xs flex items-center justify-between gap-3"
              >
                {/* Left: Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 font-mono text-xs">{bNo}</span>
                      <Badge
                        variant={isClosed ? 'gray' : 'green'}
                        className="text-[9px] py-0 px-1.5"
                      >
                        {b.bookingStatus || 'Active'}
                      </Badge>
                      <span className="text-[10px] text-slate-500">
                        {b.vehicleGroup?.name ? `Group ${b.vehicleGroup.name}` : 'Rental Vehicle'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                      <span>
                        <span className="text-slate-400">Dates: </span>
                        {b.startDate?.split('T')[0] || '—'} → {b.endDate?.split('T')[0] || '—'}
                      </span>
                      {b.location && (
                        <span>
                          <span className="text-slate-400">Location: </span>
                          {b.location}
                        </span>
                      )}
                      <span>
                        <span className="text-slate-400">Total: </span>
                        <strong className="text-slate-800 font-mono">
                          AED {Number(b.totalCharges || 0).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Plate & Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Plate Display */}
                  <div className="text-right leading-tight mr-1">
                    <span className="text-[9px] text-slate-400 block">Plate No</span>
                    <span className="font-bold text-slate-800 font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {plateNo}
                    </span>
                  </div>

                  {/* Check Accident Button */}
                  <button
                    type="button"
                    onClick={() => handleNavigateToAccidents(plateNo)}
                    title="Check accident & police reports for this vehicle plate"
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Check Accidents</span>
                  </button>

                  {/* Load Booking into Billing */}
                  <button
                    type="button"
                    onClick={() => handleSelectBooking(b)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>Load for Billing</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
