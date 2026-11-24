import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Percent,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Car,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, BookingTransactionPayload, ChargeSettingItem, LocationItem } from '../../services/apiService';

// Controlled Branch Dropdown with fixed max-height (Never spills over the modal)
interface BranchDropdownProps {
  label: string;
  value: number;
  locations: LocationItem[];
  isLoading?: boolean;
  badge?: string;
  onChange: (locationId: number, locationItem?: LocationItem) => void;
}

const BranchDropdown: React.FC<BranchDropdownProps> = ({
  label,
  value,
  locations,
  isLoading,
  badge,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedLoc = locations.find((l) => l.id === value);
  const selectedText = selectedLoc
    ? `${selectedLoc.id} - ${selectedLoc.name} (${selectedLoc.city || selectedLoc.code || 'UAE'})`
    : `${value} - Branch (${value})`;

  const filteredLocations = locations.filter((loc) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      loc.name?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q) ||
      loc.code?.toLowerCase().includes(q) ||
      loc.area?.toLowerCase().includes(q) ||
      String(loc.id).includes(q)
    );
  });

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold text-slate-700">{label}</label>
        {isLoading ? (
          <span className="text-[10px] text-blue-600 flex items-center space-x-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>Loading...</span>
          </span>
        ) : badge ? (
          <span className="text-[10px] text-slate-500 font-mono">{badge}</span>
        ) : null}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between text-left hover:bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Fixed Controlled-Height Popover Menu (capped at max-h-48 / 192px) */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Quick Search Header */}
          <div className="p-1.5 border-b border-slate-100 bg-slate-50/70 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              placeholder="Search branch ID, city, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-1.5 py-0.5 text-xs bg-transparent focus:outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 text-[10px] px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scrollable List capped strictly at max-h-48 (~192px) */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = loc.id === value;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onChange(loc.id, loc);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-xs text-slate-800">
                        <span className="font-mono text-blue-600 mr-1.5">{loc.id}</span>
                        <span>{loc.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {[loc.code, loc.city, loc.area].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">No branches matching search</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CreateBookingModal: React.FC = () => {
  const {
    isCreateBookingOpen,
    setIsCreateBookingOpen,
    customer,
    reservationQuote,
    locations,
    fetchLocations,
    createReservationBooking,
  } = useWorkspace();

  // Active step / tab - 2 clean steps matching the Postman CreateBooking API
  type BookingTab = 'customer' | 'schedule' | 'charges';
  const [activeTab, setActiveTab] = useState<BookingTab>('customer');
  const [isFetchingCustomer, setIsFetchingCustomer] = useState<boolean>(false);
  const [customerLookupQuery, setCustomerLookupQuery] = useState<string>('');

  // Loading state for locations API
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);

  // Helper to safely format dates to YYYY-MM-DD
  const parseSafeDate = (dateStr?: string, defaultDaysOffset = 0): string => {
    if (!dateStr || dateStr === '—') {
      const d = new Date();
      d.setDate(d.getDate() + defaultDaysOffset);
      return d.toISOString().split('T')[0];
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return defaultDaysOffset === 0 ? '2026-08-05' : '2026-08-07';
  };

  // Location & Schedule initialized from reservationQuote
  const initialBranchId = reservationQuote.pickupLocationId || customer.locationId || 61;
  const [locationId, setLocationId] = useState<number>(initialBranchId);
  const [closingLocationId, setClosingLocationId] = useState<number>(
    reservationQuote.returnLocationId || initialBranchId
  );
  const [pickupAddress, setPickupAddress] = useState<string>(
    reservationQuote.pickupLocation && reservationQuote.pickupLocation !== '—'
      ? reservationQuote.pickupLocation
      : 'Dubai Airport (DXB) Terminal 1'
  );
  const [startDate, setStartDate] = useState<string>(() =>
    parseSafeDate(reservationQuote.pickupDate, 0)
  );
  const [startTime, setStartTime] = useState<string>(
    reservationQuote.pickupTime && reservationQuote.pickupTime !== '—'
      ? reservationQuote.pickupTime
      : '10:00'
  );
  const [endDate, setEndDate] = useState<string>(() =>
    parseSafeDate(reservationQuote.returnDate, 2)
  );
  const [endTime, setEndTime] = useState<string>(
    reservationQuote.returnTime && reservationQuote.returnTime !== '—'
      ? reservationQuote.returnTime
      : '10:00'
  );

  // Optional Flight Information (Relevant for UAE Airport rentals)
  const [flightNo, setFlightNo] = useState<string>('');
  const [airline, setAirline] = useState<string>('');

  // Booking Type & Background Auto-generated References
  const [bookingType] = useState<number>(3); // 3 = Corporate / Web Portal
  const [bookingRefNo] = useState<string>(
    () => `REF-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [bookingConfirmationNumber] = useState<string>(
    () => `CONF-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [skipGatewayPayment, setSkipGatewayPayment] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Created via CRM Agent Workspace');

  // Tariff & Financials (Base Rent initialized from reservation quote)
  const [tariffGroupId] = useState<number>(10239);
  const initialDailyRate =
    reservationQuote.quoteBreakdown?.rentalCharges && reservationQuote.rentalDays
      ? Math.round(reservationQuote.quoteBreakdown.rentalCharges / reservationQuote.rentalDays)
      : 100.0;
  const [dailyRate, setDailyRate] = useState<string | number>(initialDailyRate);
  const [discountPercent, setDiscountPercent] = useState<string | number>(0);
  const [taxPercent] = useState<number>(5.0);
  const [advanceAmount] = useState<number>(0.0);

  // Customer Information automatically synchronized from GetCustomerDetailByEmailOrMobileNo
  const rawCustomerName =
    customer.name && customer.name !== '—' && !customer.name.toLowerCase().includes('not found')
      ? customer.name.trim()
      : customer.email && customer.email !== '—'
      ? customer.email.split('@')[0]
      : '';
  const initialNameParts = rawCustomerName ? rawCustomerName.split(/\s+/) : [];

  const [firstName, setFirstName] = useState<string>(
    customer.firstName || initialNameParts[0] || (customer.email && customer.email !== '—' ? customer.email.split('@')[0] : '')
  );
  const [lastName, setLastName] = useState<string>(
    customer.lastName || (initialNameParts.length > 1 ? initialNameParts.slice(1).join(' ') : '')
  );
  const [email, setEmail] = useState<string>(
    customer.email && customer.email !== '—' ? customer.email : ''
  );
  const [mobileNo, setMobileNo] = useState<string>(
    customer.mobile && customer.mobile !== '—' ? customer.mobile : ''
  );
  const [nationality, setNationality] = useState<string>(
    customer.nationality || 'United Arab Emirates (UAE)'
  );
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '1999-12-27'
  );
  const [gender, setGender] = useState<number>(customer.gender || 1); // 1 = Male, 2 = Female
  const [addressLine1, setAddressLine1] = useState<string>(
    customer.address?.addressLine1 || ''
  );
  const [city, setCity] = useState<string>(customer.address?.city || 'Dubai');
  const [country, setCountry] = useState<string>(
    customer.address?.country || 'United Arab Emirates (UAE)'
  );
  const [zipCode, setZipCode] = useState<string>(customer.address?.zipCode || '00000');
  const [state, setState] = useState<string>(
    customer.address?.state || customer.address?.city || 'United Arab Emirates'
  );

  // On-demand customer fetch from Speed Auto ERP
  const handleFetchCustomerFromApi = async (queryOverride?: string) => {
    const q = (queryOverride || customerLookupQuery || email || mobileNo || '').trim();
    if (!q) return;
    setIsFetchingCustomer(true);
    try {
      const isMail = q.includes('@');
      const res = await apiService.getCustomerDetail(isMail ? { email: q } : { mobileNo: q });
      if (res.success && res.result) {
        const c = res.result;
        if (c.firstName) setFirstName(c.firstName);
        if (c.lastName) setLastName(c.lastName);
        if (c.email) setEmail(c.email);
        if (c.mobileNo) setMobileNo(c.mobileNo);
        if (c.nationality) setNationality(c.nationality);
        if (c.dateOfBirth) setDateOfBirth(c.dateOfBirth.split('T')[0]);
        if (c.gender) setGender(c.gender);
        if (c.address) {
          if (c.address.addressLine1) setAddressLine1(c.address.addressLine1);
          if (c.address.city) setCity(c.address.city);
          if (c.address.state) setState(c.address.state);
          if (c.address.country) setCountry(c.address.country);
          if (c.address.zipCode) setZipCode(c.address.zipCode);
        }
      }
    } catch {
      // Keep existing values
    } finally {
      setIsFetchingCustomer(false);
    }
  };

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; message: string; bookingNo?: string } | null>(null);

  // Synchronize with active customer directly from GetCustomerDetailByEmailOrMobileNo
  useEffect(() => {
    if (isCreateBookingOpen) {
      // 1. Fetch live Locations from ERP on modal open
      if (locations.length === 0) {
        setIsLoadingLocations(true);
        fetchLocations().finally(() => setIsLoadingLocations(false));
      }

      // 2. Auto-populate Customer & Quote details
      const validName =
        customer.name && customer.name !== '—' && !customer.name.toLowerCase().includes('not found')
          ? customer.name.trim()
          : customer.email && customer.email !== '—'
          ? customer.email.split('@')[0]
          : '';
      const parts = validName ? validName.split(/\s+/) : [];

      setFirstName(
        customer.firstName || (parts.length > 0 ? parts[0] : (customer.email && customer.email !== '—' ? customer.email.split('@')[0] : ''))
      );
      setLastName(
        customer.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '')
      );

      if (customer.email && customer.email !== '—') {
        setEmail(customer.email);
      } else {
        setEmail('');
      }

      if (customer.mobile && customer.mobile !== '—') {
        let m = customer.mobile.trim();
        if (m.startsWith(' ')) m = '+' + m.trim();
        if (/^971\d+$/.test(m)) m = '+' + m;
        setMobileNo(m);
      } else {
        setMobileNo('');
      }

      // Prioritize vehicle pickup branch from quote, fallback to customer location
      if (reservationQuote.pickupLocationId) {
        setLocationId(reservationQuote.pickupLocationId);
        setClosingLocationId(reservationQuote.returnLocationId || reservationQuote.pickupLocationId);
      } else if (customer.locationId) {
        setLocationId(customer.locationId);
        setClosingLocationId(customer.locationId);
      }

      if (customer.address) {
        setAddressLine1(customer.address.addressLine1 || '');
        setCity(customer.address.city || 'Dubai');
        setState(customer.address.state || customer.address.city || 'United Arab Emirates');
        setCountry(customer.address.country || 'United Arab Emirates (UAE)');
        setZipCode(customer.address.zipCode || '00000');
      }

      if (customer.nationality) setNationality(customer.nationality);
      if (customer.dateOfBirth) setDateOfBirth(customer.dateOfBirth.split('T')[0]);
      if (customer.gender) setGender(customer.gender);

      // Synchronize with active reservation quote parameters
      if (reservationQuote) {
        if (reservationQuote.pickupLocation && reservationQuote.pickupLocation !== '—') {
          setPickupAddress(reservationQuote.pickupLocation);
        }
        if (reservationQuote.pickupDate && reservationQuote.pickupDate !== '—') {
          setStartDate(parseSafeDate(reservationQuote.pickupDate, 0));
        }
        if (reservationQuote.returnDate && reservationQuote.returnDate !== '—') {
          setEndDate(parseSafeDate(reservationQuote.returnDate, 2));
        }
        if (reservationQuote.pickupTime && reservationQuote.pickupTime !== '—') {
          setStartTime(reservationQuote.pickupTime);
        }
        if (reservationQuote.returnTime && reservationQuote.returnTime !== '—') {
          setEndTime(reservationQuote.returnTime);
        }
        if (reservationQuote.quoteBreakdown?.rentalCharges && reservationQuote.rentalDays) {
          const calculatedRate = Math.round(
            reservationQuote.quoteBreakdown.rentalCharges / reservationQuote.rentalDays
          );
          if (calculatedRate > 0) setDailyRate(calculatedRate);
        }
      }

      setResultMessage(null);
      setActiveTab('schedule');
    }
  }, [
    isCreateBookingOpen,
    customer,
    reservationQuote,
    locations.length,
    fetchLocations,
  ]);

  if (!isCreateBookingOpen) return null;

  // Calculate Duration
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const rentalDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24))) || 2;

  // Financial Calculations strictly matching Postman CreateBooking API
  const numericDailyRate = Math.max(0, Number(dailyRate) || 0);
  const numericDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent) || 0));

  const baseCharges = Number((numericDailyRate * rentalDays).toFixed(2));
  const discountAmount = Number(((baseCharges * numericDiscountPercent) / 100).toFixed(2));
  const discountedBase = Math.max(0, baseCharges - discountAmount);
  const totalTaxAmount = Number(((discountedBase * taxPercent) / 100).toFixed(2));
  const totalCharges = Number((discountedBase + totalTaxAmount).toFixed(2));

  // Customer ID fallback
  const resolvedCustomerId =
    customer.id && customer.id !== '—'
      ? parseInt(String(customer.id).replace(/\D/g, ''), 10) || 115129
      : 115129;

  // Exact Postman charges array (Base rental fee only, as in Postman CreateBooking)
  const erpChargesPayload = [
    {
      order: 1,
      chargesTypeId: 1,
      rateTypeId: 1,
      rate: numericDailyRate,
      units: rentalDays,
      charges: baseCharges,
      applyOnClosing: false,
      isMandatory: true,
      accepted: true,
      included: false,
      excessRate: 0.0,
      limit: 0.0,
      discountPercent: numericDiscountPercent,
      chargesType: null,
      rateType: null,
      tariff: [],
      notes: 'Base rental charge',
      tax: totalTaxAmount,
      taxable: true,
    },
  ];

  // Exact Postman Payload
  const bookingPayload: BookingTransactionPayload = {
    amount: totalCharges,
    skipBookingGewayPayment: skipGatewayPayment,
    currency: 'AED',
    booking: {
      locationId: Number(locationId) || 62,
      closingLocationId: Number(closingLocationId) || 62,
      bookingType: Number(bookingType) || 3,
      bookingRefNo: bookingRefNo,
      airline: airline ? airline.trim() : null,
      flightNo: flightNo ? flightNo.trim() : null,
      pickupLocationId: null,
      pickupLocationAddress: pickupAddress,
      bookingConfirmationNumber: bookingConfirmationNumber,
      notes: notes,
      startDate: startDate,
      endDate: endDate,
      tariffGroupId: Number(tariffGroupId) || 10239,
      tax: totalTaxAmount,
      taxPercent: taxPercent,
      terminal: null,
      totalCharges: totalCharges,
      discount: discountAmount,
      advance: advanceAmount,
      customerId: resolvedCustomerId,
      customer: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        mobileNo: mobileNo,
        nationality: nationality,
        dateOfBirth: dateOfBirth,
        gender: Number(gender) || 1,
        tariffCardId: 10026,
        tariffPlanId: 10415,
        locationId: Number(locationId) || 62,
        address: {
          addressLine1: addressLine1,
          city: city,
          country: country,
          zipCode: zipCode,
          state: state,
        },
      },
      charges: erpChargesPayload,
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await createReservationBooking(bookingPayload);
      setIsSubmitting(false);
      setResultMessage({
        success: res.success,
        message: res.message,
        bookingNo: res.bookingNo,
      });
      if (res.success) {
        setTimeout(() => {
          setIsCreateBookingOpen(false);
        }, 2200);
      }
    } catch {
      setIsSubmitting(false);
      setResultMessage({
        success: false,
        message: 'Failed to create booking in Speed Auto ERP',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 select-text animate-fade-in overflow-hidden">
      {/* Modal Card - Sized to comfortably fit all car rental reservation details */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl lg:max-w-4xl h-[560px] max-h-[92vh] overflow-hidden my-auto flex flex-col">
        {/* Header - Fixed Blue theme */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-tight">Create Reservation</h3>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-white/20 text-white border border-white/30 rounded-full">
                  Speed Auto ERP
                </span>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Customer: <span className="font-semibold text-white">{[firstName, lastName].filter(Boolean).join(' ') || email || 'Valued Customer'}</span> (ID: <span className="font-mono font-bold text-white">{resolvedCustomerId}</span>)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              <span className="block text-[9px] text-blue-100 uppercase font-semibold leading-none">Total Payable</span>
              <span className="font-mono font-bold text-emerald-300 text-xs">AED {totalCharges.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setIsCreateBookingOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/15 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segmented Step Navigation - 3 Clean Steps */}
        <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[9px] flex items-center justify-center">1</span>
              <span>Customer Details</span>
            </button>

            <ChevronRight className="w-3 h-3 text-slate-400" />

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[9px] flex items-center justify-center">2</span>
              <span>Vehicle &amp; Schedule</span>
            </button>

            <ChevronRight className="w-3 h-3 text-slate-400" />

            <button
              type="button"
              onClick={() => setActiveTab('charges')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'charges'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-black/20 text-[9px] flex items-center justify-center">3</span>
              <span>Rental Charges</span>
            </button>
          </div>

          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Dynamic Content Form with Fixed Outer Height */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Scrollable Tab Content Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* Status Alert Banner */}
            {resultMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center space-x-2.5 animate-fade-in ${
                  resultMessage.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {resultMessage.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div className="leading-tight">
                  <span className="font-bold text-xs">{resultMessage.message}</span>
                  {resultMessage.bookingNo && (
                    <p className="text-[10px] text-emerald-700 mt-0.5 font-mono font-bold">
                      Assigned Agreement: {resultMessage.bookingNo}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: Customer Details */}
            {activeTab === 'customer' && (
              <div className="space-y-3.5 animate-fade-in">
                {/* ERP Lookup Toolbar */}
                <div className="p-2.5 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/50 rounded-xl border border-blue-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Customer Profile (Speed Auto ERP)</h4>
                      <p className="text-[10px] text-slate-500">Auto-filled from ERP. You can review or modify any field below.</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Lookup phone / email..."
                      value={customerLookupQuery}
                      onChange={(e) => setCustomerLookupQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFetchCustomerFromApi();
                        }
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 w-44 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleFetchCustomerFromApi()}
                      disabled={isFetchingCustomer}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      {isFetchingCustomer ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>{isFetchingCustomer ? 'Fetching...' : 'Fetch'}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Contact Information */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Personal &amp; Contact Information</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Rifaz"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Tonse"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={mobileNo}
                          onChange={(e) => setMobileNo(e.target.value)}
                          placeholder="+971501234567"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="e.g. United Arab Emirates (UAE)"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      >
                        <option value={1}>Male</option>
                        <option value={2}>Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Address</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Street / Building Address
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. Sheikh Zayed Road, Al Quoz"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        City / Emirate
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Dubai"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United Arab Emirates (UAE)"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Vehicle & Schedule */}
            {activeTab === 'schedule' && (
              <div className="space-y-3 animate-fade-in">
                {/* Booked Vehicle & Category Banner */}
                <div className="p-2.5 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 rounded-xl border border-blue-200/80 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-xs text-slate-900">
                          {reservationQuote.vehicle?.model || 'Nissan Sunny'}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 rounded">
                          {reservationQuote.vehicleGroup || 'Group B • Sedan'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-2">
                        <span>{reservationQuote.vehicle?.transmission || 'Automatic'}</span>
                        <span>•</span>
                        <span>{reservationQuote.vehicle?.seats || 5} Seats</span>
                        <span>•</span>
                        <span>{reservationQuote.vehicle?.bags || 2} Luggage</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-400 font-medium uppercase">Daily Rate</span>
                    <span className="font-mono font-bold text-xs text-blue-700">AED {numericDailyRate.toFixed(2)}/day</span>
                  </div>
                </div>

                {/* Pickup & Return Locations using controlled BranchDropdown */}
                <div className="grid grid-cols-2 gap-3">
                  <BranchDropdown
                    label="Pickup Branch"
                    value={locationId}
                    locations={locations}
                    isLoading={isLoadingLocations}
                    onChange={(newId, loc) => {
                      setLocationId(newId);
                      if (loc) {
                        const full = [loc.name, loc.area, loc.city].filter(Boolean).join(', ');
                        setPickupAddress(full);
                      }
                    }}
                  />

                  <BranchDropdown
                    label="Return Branch"
                    value={closingLocationId}
                    locations={locations}
                    badge={locations.length > 0 ? `${locations.length} live branches` : undefined}
                    onChange={(newId) => {
                      setClosingLocationId(newId);
                    }}
                  />
                </div>

                {/* Pickup Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pickup Address Details
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Dubai Airport Terminal 1, Arrival Hall"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                {/* Date & Time Grid - 4 Columns */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

             
                {/* Notes & Payment Settlement */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Reservation Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes for rental station or agent comments..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  {/* <div className="pb-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={skipGatewayPayment}
                        onChange={(e) => setSkipGatewayPayment(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Skip Gateway Payment</span>
                    </label>
                  </div> */}
                </div>
              </div>
            )}

            {/* TAB 2: Rental Charges (Matching Postman CreateBooking Schema) */}
            {activeTab === 'charges' && (
              <div className="space-y-3.5 animate-fade-in pb-2">
                {/* Tariff Inputs - Clean 3 Columns (Tariff Group ID is handled in background) */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Rate / Day (AED)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      onBlur={() => {
                        if (dailyRate === '' || Number(dailyRate) < 0) setDailyRate(0);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Rental Duration</label>
                    <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                      <span>{rentalDays} days</span>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">from dates</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      onBlur={() => {
                        if (discountPercent === '' || Number(discountPercent) < 0) setDiscountPercent(0);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-amber-700 focus:ring-2 focus:ring-amber-100 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Charge Line Item Table matching Postman payload charges[] */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>Charge Items (1)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Speed Auto ERP Schema</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Rate</th>
                        <th className="py-2 px-3">Units</th>
                        <th className="py-2 px-3">Discount</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">Base Rental Fee (Rent)</span>
                          <span className="text-[10px] text-slate-400 font-mono">chargesTypeId: 1 • Mandatory</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">AED {numericDailyRate.toFixed(2)}/d</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{rentalDays} days</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              placeholder="0"
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(e.target.value)}
                              onBlur={() => {
                                if (discountPercent === '' || Number(discountPercent) < 0) setDiscountPercent(0);
                              }}
                              className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-amber-700 text-center focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="text-[11px] text-slate-500 font-bold">%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          AED {totalCharges.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Breakdown Summary Card */}
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Rental Charge ({rentalDays}d × AED {dailyRate}):</span>
                    <span className="font-mono font-semibold">AED {baseCharges.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Discount Amount ({discountPercent}%):</span>
                      <span className="font-mono font-semibold">-AED {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>VAT ({taxPercent}%):</span>
                    <span className="font-mono font-semibold">AED {totalTaxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Total Payable:</span>
                    <span className="font-mono text-blue-700 text-lg">AED {totalCharges.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pinned Footer Navigation & Actions */}
          <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            {/* Step navigation shortcuts */}
            <div className="flex items-center space-x-1.5">
              {activeTab === 'customer' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>Next: Vehicle &amp; Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeTab === 'schedule' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('customer')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('charges')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Next: Rental Charges</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {activeTab === 'charges' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Schedule</span>
                </button>
              )}
            </div>

            {/* Main Action Buttons: Create Booking ONLY on the LAST step ('charges') */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateBookingOpen(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              {activeTab === 'charges' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Create Booking</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
