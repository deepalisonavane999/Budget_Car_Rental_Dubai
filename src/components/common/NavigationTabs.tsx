import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Calendar,
  CreditCard,
  Settings,
  FolderCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, BookingItem } from '../../services/apiService';
import { Badge } from './Badge';

export const NavigationTabs: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    searchCustomer,
    resetCustomer,
    isLoadingCustomer,
    customer,
    searchBookingOrAgreement,
    executeBookingFilter,
    executeAgreementFilter,
    isSearchingBooking,
  } = useWorkspace();

  // General Customer Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Billing Booking Filter & Search State
  const [bookingQuery, setBookingQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>();
  const [filterCustomerId, setFilterCustomerId] = useState<string>('');
  const [filterFromDate, setFilterFromDate] = useState<any>();
  const [filterToDate, setFilterToDate] = useState<any>();
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isFilterOpen]);

  // Sync customer ID for filter
  useEffect(() => {
    if (customer.id && customer.id !== '—') {
      const clean = String(customer.id).replace(/\D/g, '');
      if (clean) setFilterCustomerId(clean);
    }
  }, [customer.id]);

  const tabs = [
    { id: 'rentals', label: 'Rentals', icon: Car },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'operations', label: 'Operations', icon: Settings },
    { id: 'cases', label: 'Cases', icon: FolderCheck },
  ];

  // Standard Customer Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await searchCustomer(searchQuery);
    setSearchFeedback(res.message);
    setTimeout(() => setSearchFeedback(null), 4000);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchFeedback(null);
    resetCustomer();
  };

  // Booking Lookup & Filter (for Billing / Reservations)
  const handleBookingSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bookingQuery.trim();
    if (!trimmed) {
      handleApplyFilters();
      return;
    }

    setBookingFeedback(null);
    const parsedId = parseInt(filterCustomerId.trim(), 10);
    const validCustomerId =
      !isNaN(parsedId) && parsedId > 0
        ? parsedId
        : customer.id && customer.id !== '—'
        ? parseInt(String(customer.id).replace(/\D/g, ''), 10)
        : undefined;

    window.dispatchEvent(new CustomEvent('billing:show-bookings'));
    const res = await executeBookingFilter({
      customerId: validCustomerId,
      bookingNo: trimmed,
    });
    setBookingFeedback(res.message);
    setTimeout(() => setBookingFeedback(null), 4000);
  };

  const handleApplyFilters = async () => {
    setBookingFeedback(null);
    const parsedId = parseInt(filterCustomerId.trim(), 10);
    const validCustomerId =
      !isNaN(parsedId) && parsedId > 0
        ? parsedId
        : customer.id && customer.id !== '—'
        ? parseInt(String(customer.id).replace(/\D/g, ''), 10)
        : undefined;

    window.dispatchEvent(new CustomEvent('billing:show-bookings'));
    const res = await executeBookingFilter({
      customerId: validCustomerId,
      bookingNo: bookingQuery.trim() || undefined,
      status: filterStatus && filterStatus !== 'NA' && filterStatus !== 'all' ? filterStatus : undefined,
      fromDate: filterFromDate ? `${filterFromDate}T00:00:00` : undefined,
      toDate: filterToDate ? `${filterToDate}T23:59:59` : undefined,
    });

    setBookingFeedback(res.message);
    setIsFilterOpen(false); // Close popover so results render directly in Billing page!
    setTimeout(() => setBookingFeedback(null), 4000);
  };

  return (
    <div className="relative flex items-center justify-between border-b border-slate-200 bg-white h-9 px-3 shrink-0 select-none shadow-2xs">
      {/* Flush Left: Toggle Left Sidebar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleLeftSidebar}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title={isLeftSidebarOpen ? 'Collapse Customer Details' : 'Expand Customer Details'}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-blue-600" />
          )}
        </button>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase hidden lg:inline">
          Customer: <span className="text-slate-800 font-mono">#{customer.id}</span>
        </span>
      </div>

      {/* Center: Module Tabs */}
      <div className="flex items-center space-x-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNavTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold rounded-t transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flush Right: Top Context-Aware Search & Filter Bar */}
      <div className="flex items-center space-x-1.5" ref={filterRef}>
        {activeNavTab === 'billing' ? (
          /* Billing: Booking Filter & Search Bar */
          <div className="relative flex items-center space-x-1">
            <form onSubmit={handleBookingSearchSubmit} className="flex items-center relative">
              <div className="relative flex items-center">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  value={bookingQuery}
                  onChange={(e) => setBookingQuery(e.target.value)}
                  placeholder="Search Booking # or ref..."
                  className="w-44 sm:w-52 pl-7 pr-6 py-0.5 text-[10px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 transition-all font-mono text-slate-800"
                />
                {bookingQuery && (
                  <button
                    type="button"
                    onClick={() => setBookingQuery('')}
                    className="absolute right-1.5 p-0.5 text-slate-400 hover:text-slate-600"
                    title="Clear"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`ml-1 px-1.5 py-0.5 border rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors ${
                  isFilterOpen
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Bookings"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Filter</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {/* Lookup Button */}
              <button
                type="submit"
                disabled={isSearchingBooking}
                className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
              >
                {isSearchingBooking ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <span>Lookup</span>
                )}
              </button>
            </form>

            {bookingFeedback && (
              <span className="text-[10px] font-semibold text-blue-600 animate-fade-in bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[150px]">
                {bookingFeedback}
              </span>
            )}

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute top-8 right-0 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-fade-in space-y-2.5 text-[10px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs">Filter Bookings</span>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] text-slate-800"
                    >
                      <option value="NA">All Statuses (NA)</option>
                      <option value="Closed">Closed</option>
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
                      value={filterCustomerId}
                      onChange={(e) => setFilterCustomerId(e.target.value)}
                      placeholder="Customer ID..."
                      className="w-full px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">From Date</label>
                    <input
                      type="date"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      className="w-full px-1 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-500 font-semibold block mb-0.5">To Date</label>
                    <input
                      type="date"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      className="w-full px-1 py-0.5 bg-slate-50 border border-slate-300 rounded text-[10px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    disabled={isSearchingBooking}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center space-x-1"
                  >
                    {isSearchingBooking && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* General Customer Search Bar for Other Pages */
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email or phone..."
                className="w-44 sm:w-56 pl-7 pr-6 py-0.5 text-[10px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-1.5 p-0.5 text-slate-400 hover:text-slate-600"
                  title="Clear Search"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoadingCustomer || !searchQuery.trim()}
              className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
            >
              {isLoadingCustomer ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <span>Lookup</span>
              )}
            </button>
            {searchFeedback && (
              <span className="ml-1 text-[10px] font-semibold text-blue-600 animate-fade-in bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[150px]">
                {searchFeedback}
              </span>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
