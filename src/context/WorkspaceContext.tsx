import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CustomerProfile,
  RentalAgreement,
  BillingSummary,
  ReservationQuote,
  CaseDetails,
  RoadsideAssistanceRequest,
} from '../types/crm.types';
// import {
//   mockCustomer,
//   mockActiveRental,
//   mockPreviousRental,
//   mockBillingSummary,
//   mockReservationQuote,
//   mockCaseDetails,
//   mockRoadsideAssistance,
// } from '../services/mockData';
import {
  mockCustomer,
  mockActiveRental,
  mockPreviousRental,
  mockBillingSummary,
  mockReservationQuote,
  mockCaseDetails,
  mockRoadsideAssistance,
  collectionAgreementsResponse,
  collectionBookingsResponse,
} from '../services/mockDataAccCollection';
import {
  apiService,
  CustomerDetailResult,
  AgreementItem,
  BookingItem,
  ContactCardItem,
  LocationItem,
  VehicleGroupItem,
  ChargeSettingItem,
  BookingTransactionPayload,
  VoucherItem,
  InvoiceLineItem,
} from '../services/apiService';

export type CommMode = 'phone' | 'chat' | 'email';
export type ActivityTab = 'all' | 'calls' | 'chats' | 'emails' | 'tickets';
export type OperationsSubTab = 'roadside' | 'accidents' | 'maintenance' | 'replacement' | 'delivery' | 'lost_found';

interface WorkspaceContextType {
  // Agent
  agentName: string;
  agentInitials: string;

  // Telephony info
  queueName: string;
  ivrPath: string;

  // Customer & Entities
  customer: CustomerProfile;
  customerCards: ContactCardItem[];
  updateCustomer: (updated: Partial<CustomerProfile>) => void;
  activeRental: RentalAgreement;
  previousRental: RentalAgreement;
  billingSummary: BillingSummary;
  reservationQuote: ReservationQuote;
  caseDetails: CaseDetails;
  roadsideAssistance: RoadsideAssistanceRequest;

  // Reference Data
  locations: LocationItem[];
  vehicleGroups: VehicleGroupItem[];
  setVehicleGroups: React.Dispatch<React.SetStateAction<VehicleGroupItem[]>>;
  chargesSettings: ChargeSettingItem[];
  fetchLocations: () => Promise<LocationItem[]>;
  fetchChargesSettings: () => Promise<ChargeSettingItem[]>;
  isLoadingCustomer: boolean;
  refreshCustomerData: () => Promise<void>;

  // Domain Actions
  checkVehicleAvailability: (vehicleGroupId?: number) => Promise<{ count: number; success: boolean; message: string }>;
  createReservationBooking: (customPayload?: BookingTransactionPayload) => Promise<{ success: boolean; bookingNo: string; message: string }>;
  updateReservationBooking: (notes?: string) => Promise<{ success: boolean; message: string }>;
  confirmReservationBooking: (bookingNo?: string) => Promise<{ success: boolean; message: string }>;
  cancelReservationBooking: (bookingNo?: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  saveCustomerContactCards: (cards: ContactCardItem[]) => Promise<{ success: boolean; message: string }>;
  fetchInvoiceDetails: (voucherNo: string) => Promise<{ success: boolean; message: string }>;
  fetchStatementOfAccounts: () => Promise<{ success: boolean; message: string }>;
  fetchVehicleAccident: (plateNo: string) => Promise<{ success: boolean; message: string; data?: any }>;
  searchBookingOrAgreement: (query: string) => Promise<{ success: boolean; message: string; plateNo?: string }>;
  loadBillingForAgreement: (
    agreementNo: string,
    customerId?: number,
    options?: { fromDate?: string; toDate?: string; status?: string }
  ) => Promise<{ success: boolean; message: string }>;
  selectedAgreementVouchers: VoucherItem[];
  setSelectedAgreementVouchers: React.Dispatch<React.SetStateAction<VoucherItem[]>>;
  selectedInvoiceLines: InvoiceLineItem[];
  setSelectedInvoiceLines: React.Dispatch<React.SetStateAction<InvoiceLineItem[]>>;
  isLoadingBillingAgreement: boolean;

  // Booking Filter & Query Results
  bookingResults: BookingItem[];
  setBookingResults: React.Dispatch<React.SetStateAction<BookingItem[]>>;
  agreementResults: AgreementItem[];
  setAgreementResults: React.Dispatch<React.SetStateAction<AgreementItem[]>>;
  executeBookingFilter: (params?: {
    customerId?: number;
    bookingNo?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => Promise<{ success: boolean; count: number; message: string }>;
  executeAgreementFilter: (params?: {
    customerId?: number;
    agreementNo?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    forceRefresh?: boolean;
  }) => Promise<{ success: boolean; count: number; message: string }>;
  isSearchingBooking: boolean;
  isSearchingAgreement: boolean;

  // Navigation & Communication State
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  commMode: CommMode;
  setCommMode: (mode: CommMode) => void;
  activityFilter: ActivityTab;
  setActivityFilter: (filter: ActivityTab) => void;
  operationsSubTab: OperationsSubTab;
  setOperationsSubTab: (sub: OperationsSubTab) => void;

  // Sidebar Toggles
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  // Modals & UI Controls
  isTransferOpen: boolean;
  setIsTransferOpen: (open: boolean) => void;
  isCustomerEditOpen: boolean;
  setIsCustomerEditOpen: (open: boolean) => void;
  isAddCardOpen: boolean;
  setIsAddCardOpen: (open: boolean) => void;
  editingCard: ContactCardItem | null;
  openEditCardModal: (card: ContactCardItem) => void;
  isDocDrawerOpen: boolean;
  setIsDocDrawerOpen: (open: boolean) => void;
  isFleetPickerOpen: boolean;
  setIsFleetPickerOpen: (open: boolean) => void;
  isExtensionOpen: boolean;
  setIsExtensionOpen: (open: boolean) => void;
  isReturnOpen: boolean;
  setIsReturnOpen: (open: boolean) => void;
  isCreateBookingOpen: boolean;
  setIsCreateBookingOpen: (open: boolean) => void;

  // Search & Profile Actions
  searchCustomer: (query: string) => Promise<{ success: boolean; message: string }>;
  resetCustomer: () => void;

  // Fleet & Vehicle Selection
  selectVehicleForQuote: (vehicle: {
    model: string;
    group: string;
    plateNo?: string;
    rate?: number;
    locationId?: number;
    locationName?: string;
  }) => void;

  // Agreement Extension & Return Actions
  extendRentalAgreement: (params: { newReturnDate: string; newReturnTime: string; additionalCharges: number; notes: string }) => Promise<{ success: boolean; message: string }>;
  processEarlyReturn: (params: { returnDate: string; returnTime: string; locationId: number; returnOdometer: number; fuelLevel: string }) => Promise<{ success: boolean; message: string }>;

  // Actions
  addCaseReply: (replyText: string, isInternal?: boolean) => void;
  updateRoadsideStep: (stepIndex: number) => void;
  updateCaseStatus: (newStatus: CaseDetails['status']) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const agentName = 'Sara Ahmed';
  const agentInitials = 'SA';
  const queueName = 'Arabic CRM';
  const ivrPath = 'Arabic → Existing Rental → Billing Support';

  // Helper to extract phone/mobile from URL while strictly preserving '+' symbol
  // (Standard searchParams.get decodes '+' into space ' ', which loses the international dial code)
  const extractMobileFromUrl = (): string | null => {
    const rawSearch = typeof window !== 'undefined' ? window.location.search : location.search;
    const paramNames = ['mobile', 'mobileno', 'mobileNo', 'phone', 'caller', 'callerNumber'];

    for (const name of paramNames) {
      const match = rawSearch.match(new RegExp(`(?:[?&])${name}=([^&#]*)`, 'i'));
      if (match && match[1]) {
        const rawVal = match[1];
        if (rawVal.includes('+')) {
          try {
            return decodeURIComponent(rawVal.replace(/\+/g, '%2B')).trim();
          } catch {
            return rawVal.trim();
          }
        }
        try {
          const decoded = decodeURIComponent(rawVal).trim();
          if (decoded) {
            if (decoded.startsWith(' ') && /^\s*\d+$/.test(decoded)) {
              return '+' + decoded.trim();
            }
            return decoded;
          }
        } catch {
          return rawVal.trim();
        }
      }
    }

    // Fallback to searchParams - if searchParams turned '+' into space ' ', restore '+'
    for (const name of paramNames) {
      const val = searchParams.get(name);
      if (val) {
        if (val.startsWith(' ') && /^\s*\d+$/.test(val)) {
          return '+' + val.trim();
        }
        return val.trim();
      }
    }

    return null;
  };

  let rawExtractedMobile = extractMobileFromUrl();
  let rawExtractedEmail = searchParams.get('email');

  // If mobile parameter contains '@', it is an email
  if (rawExtractedMobile && rawExtractedMobile.includes('@')) {
    if (!rawExtractedEmail) rawExtractedEmail = rawExtractedMobile;
    rawExtractedMobile = null;
  }
  // If email parameter does not contain '@' and looks like a phone number, it is a mobile
  if (rawExtractedEmail && !rawExtractedEmail.includes('@') && /^\+?[\d\s-]{6,}$/.test(rawExtractedEmail.trim())) {
    if (!rawExtractedMobile) rawExtractedMobile = rawExtractedEmail;
    rawExtractedEmail = null;
  }

  const urlMobile = rawExtractedMobile
    ? rawExtractedMobile.startsWith(' ')
      ? '+' + rawExtractedMobile.trim()
      : /^971\d+$/.test(rawExtractedMobile)
      ? '+' + rawExtractedMobile
      : rawExtractedMobile
    : null;

  const urlEmail = rawExtractedEmail ? rawExtractedEmail.trim() : null;
  const urlApiKey = searchParams.get('apiKey');
  const hasUrlSearch = Boolean(urlMobile || urlEmail);

  if (urlApiKey && urlApiKey !== apiService.getApiKey()) {
    apiService.setApiKey(urlApiKey);
  }

  const emptyCustomer: CustomerProfile = {
    id: '—',
    tenantId: undefined,
    firstName: null,
    lastName: null,
    name: '—',
    avatarInitials: '?',
    isVerified: false,
    mobile: urlMobile || '—',
    email: urlEmail || '—',
    contactCategory: null,
    locationId: null,
    locationName: undefined,
    nationality: null,
    dateOfBirth: null,
    gender: null,
    address: null,
    identityDocuments: [],
    contactCards: [],
    preferredLanguage: '—',
    idLicenseStatus: 'No docs',
    openTicketsCount: 0,
    activeRentalNo: undefined,
    previousRentalNo: undefined,
  };

  const emptyRental: RentalAgreement = {
    agreementNo: '—',
    status: 'Active',
    vehicle: {
      model: '—',
      group: '—',
      category: '—',
      image: '/assets/nissan-sunny.png',
      plateNo: '—',
      seats: 5,
      bags: 2,
      transmission: 'Automatic',
    },
    pickupDate: '—',
    pickupTime: '—',
    pickupLocation: '—',
    returnDate: '—',
    returnTime: '—',
    returnLocation: '—',
    rentalPeriodDays: 0,
    depositAmount: 0,
    depositStatus: '—',
    totalCharges: 0,
    rentalCharges: 0,
    estimatedCharges: 0,
  };

  const [customer, setCustomer] = useState<CustomerProfile>(() =>
    hasUrlSearch ? emptyCustomer : mockCustomer
  );
  const [customerCards, setCustomerCards] = useState<ContactCardItem[]>(() =>
    hasUrlSearch ? [] : (mockCustomer.contactCards || [])
  );
  const [activeRental, setActiveRental] = useState<RentalAgreement>(mockActiveRental);
  const [previousRental, setPreviousRental] = useState<RentalAgreement>(mockPreviousRental);
  const [billingSummary, setBillingSummary] = useState<BillingSummary>(mockBillingSummary);
  const [reservationQuote, setReservationQuote] = useState<ReservationQuote>(mockReservationQuote);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>(mockCaseDetails);
  const [roadsideAssistance, setRoadsideAssistance] =
    useState<RoadsideAssistanceRequest>(mockRoadsideAssistance);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [vehicleGroups, setVehicleGroups] = useState<VehicleGroupItem[]>([]);
  const [chargesSettings, setChargesSettings] = useState<ChargeSettingItem[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCustomerEditOpen, setIsCustomerEditOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ContactCardItem | null>(null);
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);

  const openEditCardModal = (card: ContactCardItem) => {
    setEditingCard(card);
    setIsAddCardOpen(true);
  };
  const [isFleetPickerOpen, setIsFleetPickerOpen] = useState(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen((prev) => !prev);
  const toggleRightSidebar = () => setIsRightSidebarOpen((prev) => !prev);

  const currentPath = location.pathname.replace('/', '') || 'rentals';
  const activeNavTab = ['rentals', 'reservations', 'billing', 'operations', 'cases'].includes(
    currentPath
  )
    ? currentPath
    : 'rentals';

  const setActiveNavTab = (tab: string) => {
    navigate(`/${tab}${location.search}`);
  };

  const commParam = searchParams.get('comm') as CommMode;
  const commMode: CommMode = ['phone', 'chat', 'email'].includes(commParam) ? commParam : 'phone';

  const setCommMode = (mode: CommMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('comm', mode);
      return next;
    });
  };

  const activityParam = searchParams.get('activity') as ActivityTab;
  const activityFilter: ActivityTab = [
    'all',
    'calls',
    'chats',
    'emails',
    'tickets',
  ].includes(activityParam)
    ? activityParam
    : 'calls';

  const setActivityFilter = (filter: ActivityTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('activity', filter);
      return next;
    });
  };

  const opParam = searchParams.get('op') as OperationsSubTab;
  const operationsSubTab: OperationsSubTab = [
    'roadside',
    'accidents',
    'maintenance',
    'replacement',
    'delivery',
    'lost_found',
  ].includes(opParam)
    ? opParam
    : 'roadside';

  const setOperationsSubTab = (sub: OperationsSubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('op', sub);
      return next;
    });
  };


  const lastFetchedUrlKeyRef = useRef<string | null>(null);

  // Resolve location name dynamically once locations load
  useEffect(() => {
    if (customer.locationId && locations.length > 0) {
      const matched = locations.find((l) => l.id === customer.locationId);
      if (matched && customer.locationName !== matched.name) {
        setCustomer((prev) => ({ ...prev, locationName: matched.name }));
      }
    }
  }, [locations, customer.locationId, customer.locationName]);

  const applyCustomerResultToState = useCallback(
    async (c: CustomerDetailResult, fallbackMobile?: string, fallbackEmail?: string) => {
      const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
      const fallbackCardName = c.contactCards?.find((card) => card.nameOnCard)?.nameOnCard?.trim();
      const displayName = fullName || c.name || fallbackCardName || c.email || '—';

      let currentLocations = locations;
      if (c.locationId && currentLocations.length === 0) {
        const locRes = await apiService.getLocations(1, 50);
        if (locRes.success && locRes.result?.items) {
          currentLocations = locRes.result.items;
          setLocations(currentLocations);
        }
      }

      const matchedLoc = c.locationId ? currentLocations.find((l) => l.id === c.locationId) : undefined;
      const docs = Array.isArray(c.identityDocuments) ? c.identityDocuments : [];
      const cards = Array.isArray(c.contactCards) ? c.contactCards : [];

      // Ensure mobile strictly has phone and email strictly has email
      let finalMobile = c.mobileNo || fallbackMobile || undefined;
      let finalEmail = c.email || fallbackEmail || undefined;

      if (finalMobile && finalMobile.includes('@')) {
        if (!finalEmail) finalEmail = finalMobile;
        finalMobile = undefined;
      }
      if (finalEmail && !finalEmail.includes('@') && /^\+?[\d\s-]{6,}$/.test(finalEmail.trim())) {
        if (!finalMobile) finalMobile = finalEmail;
        finalEmail = undefined;
      }

      setCustomerCards(cards);
      setCustomer({
        id: c.id !== undefined && c.id !== null ? String(c.id) : '—',
        tenantId: c.tenantId,
        firstName: c.firstName,
        lastName: c.lastName,
        name: displayName,
        avatarInitials: getInitials(displayName),
        isVerified: docs.length > 0,
        mobile: finalMobile || '—',
        email: finalEmail || '—',
        contactCategory: c.contactCategory ?? null,
        locationId: c.locationId ?? null,
        locationName: matchedLoc?.name || c.address?.city || undefined,
        nationality: c.nationality ?? null,
        dateOfBirth: c.dateOfBirth ?? null,
        gender: c.gender ?? null,
        address: c.address ?? null,
        identityDocuments: docs,
        contactCards: cards,
        preferredLanguage: '—',
        idLicenseStatus: docs.length > 0 ? 'Verified' : 'No docs',
        openTicketsCount: 0,
        activeRentalNo: undefined,
        previousRentalNo: undefined,
      });

      const custId = c.id;
      if (custId) {
        // Fetch agreements and bookings in parallel (2 lean calls instead of eager billing queries)
        const [agrRes, bookRes] = await Promise.all([
          apiService.getAgreements({ customerId: custId }),
          apiService.getBookings({ customerId: custId }),
        ]);

        if (agrRes.success && agrRes.result?.items) {
          const items = agrRes.result.items;
          setAgreementResults(items);

          // 1. Map Active/Open Agreement
          const openAgr =
            items.find(
              (a) =>
                (a.agreementStatus || '').toLowerCase() === 'open' ||
                (a.agreementStatus || '').toLowerCase() === 'active'
            ) || items[0];

          if (openAgr) {
            const [startDt, startTm] = (openAgr.startDate || '').split('T');
            const [endDt, endTm] = (openAgr.endDate || '').split('T');
            const resolvedPlate = (openAgr as any).vehicle?.plateNo || (openAgr as any).plateNo || '';
            setCustomer((prev) => ({ ...prev, activeRentalNo: openAgr.agreementNo }));
            setActiveRental((prev) => ({
              ...prev,
              agreementNo: openAgr.agreementNo,
              pickupLocation: openAgr.location || openAgr.pickupLocation || '—',
              returnLocation: openAgr.location || openAgr.pickupLocation || '—',
              pickupDate: startDt || '—',
              pickupTime: startTm ? startTm.slice(0, 5) : prev.pickupTime,
              returnDate: endDt || '—',
              returnTime: endTm ? endTm.slice(0, 5) : prev.returnTime,
              totalCharges: openAgr.totalCharges ?? 0,
              rentalCharges: openAgr.totalCharges ?? 0,
              estimatedCharges: openAgr.totalCharges ?? 0,
              status: openAgr.agreementStatus === 'Open' ? 'Active' : 'Returned',
              vehicle: {
                ...prev.vehicle,
                plateNo: resolvedPlate || prev.vehicle.plateNo,
                model: openAgr.vehicle?.model || openAgr.vehicle?.make || prev.vehicle.model,
                category: openAgr.vehicleGroup?.name || prev.vehicle.category,
              },
            }));
          }

          // 2. Map Previous/Closed Agreement
          const closedAgr =
            items.find(
              (a) =>
                (a.agreementStatus || '').toLowerCase() === 'closed' ||
                (a.agreementStatus || '').toLowerCase() === 'returned'
            ) || (items.length > 1 ? items[1] : undefined);

          if (closedAgr) {
            const [startDt, startTm] = (closedAgr.startDate || '').split('T');
            const [endDt, endTm] = (closedAgr.endDate || '').split('T');
            const resolvedPlate = (closedAgr as any).vehicle?.plateNo || (closedAgr as any).plateNo || '';
            setCustomer((prev) => ({ ...prev, previousRentalNo: closedAgr.agreementNo }));
            setPreviousRental((prev) => ({
              ...prev,
              agreementNo: closedAgr.agreementNo,
              pickupLocation: closedAgr.location || closedAgr.pickupLocation || '—',
              returnLocation: closedAgr.location || closedAgr.pickupLocation || '—',
              pickupDate: startDt || '—',
              pickupTime: startTm ? startTm.slice(0, 5) : prev.pickupTime,
              returnDate: endDt || '—',
              returnTime: endTm ? endTm.slice(0, 5) : prev.returnTime,
              totalCharges: closedAgr.totalCharges ?? prev.totalCharges,
              vehicle: {
                ...prev.vehicle,
                plateNo: resolvedPlate || prev.vehicle.plateNo,
                model: closedAgr.vehicle?.model || closedAgr.vehicle?.make || prev.vehicle.model,
                category: closedAgr.vehicleGroup?.name || prev.vehicle.category,
              },
            }));
          }
        }

        if (bookRes.success && bookRes.result?.items) {
          const bItems = bookRes.result.items;
          setBookingResults(bItems);
          const book =
            bItems.find(
              (b) => (b.bookingStatus || (b as any).status || '').toLowerCase() === 'confirmed'
            ) || bItems[0];
          if (book) {
            const [startDt, startTm] = (book.startDate || '').split('T');
            const [endDt, endTm] = (book.endDate || '').split('T');
            setReservationQuote((prev) => ({
              ...prev,
              quoteNo: book.agreementNo || book.bookingNo || prev.quoteNo,
              pickupDate: startDt || prev.pickupDate,
              pickupTime: startTm ? startTm.slice(0, 5) : prev.pickupTime,
              returnDate: endDt || prev.returnDate,
              returnTime: endTm ? endTm.slice(0, 5) : prev.returnTime,
              pickupLocation: book.location || prev.pickupLocation,
              returnLocation: book.location || prev.returnLocation,
              quoteBreakdown: {
                ...prev.quoteBreakdown,
                totalAmount: book.totalCharges ?? prev.quoteBreakdown.totalAmount,
              },
            }));
          }
        }
      }
    },
    [locations]
  );

  const fetchCustomerData = useCallback(async () => {
    if (!urlMobile && !urlEmail) {
      return;
    }

    const queryKey = `${urlMobile || ''}|${urlEmail || ''}`;
    if (lastFetchedUrlKeyRef.current === queryKey) {
      return;
    }
    lastFetchedUrlKeyRef.current = queryKey;

    setIsLoadingCustomer(true);

    try {
      const custRes = await apiService.getCustomerDetail({
        mobileNo: urlMobile || undefined,
        email: urlEmail || undefined,
      });

      if (custRes.success && custRes.result) {
        await applyCustomerResultToState(custRes.result, urlMobile || undefined, urlEmail || undefined);
      } else {
        // Customer lookup returned no record in live database — clear customer details cleanly but keep sample cards for agent review
        setCustomerCards([]);
        setCustomer({
          id: '—',
          tenantId: undefined,
          firstName: null,
          lastName: null,
          name: 'Customer Record Not Found',
          avatarInitials: '?',
          isVerified: false,
          mobile: urlMobile || '—',
          email: urlEmail || '—',
          contactCategory: null,
          locationId: null,
          locationName: undefined,
          nationality: null,
          dateOfBirth: null,
          gender: null,
          address: null,
          identityDocuments: [],
          contactCards: [],
          preferredLanguage: '—',
          idLicenseStatus: 'No docs',
          openTicketsCount: 0,
          activeRentalNo: mockActiveRental.agreementNo,
          previousRentalNo: mockPreviousRental.agreementNo,
        });
        setActiveRental(mockActiveRental);
        setPreviousRental(mockPreviousRental);
      }
    } catch {
      setCustomer((prev) => ({
        ...prev,
        mobile: urlMobile || prev.mobile,
        email: urlEmail || prev.email,
      }));
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [urlMobile, urlEmail, applyCustomerResultToState]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const buildBookingPayload = (notes?: string): BookingTransactionPayload => {
    const [firstName, ...rest] = customer.name.split(' ');
    return {
      amount: reservationQuote.quoteBreakdown.totalAmount,
      skipBookingGewayPayment: false,
      currency: 'AED',
      booking: {
        locationId: customer.locationId || 62,
        bookingType: 3,
        bookingRefNo: reservationQuote.quoteNo,
        airline: null,
        closingLocationId: customer.locationId || 62,
        discount: 0,
        flightNo: null,
        pickupLocationId: null,
        pickupLocationAddress: reservationQuote.pickupLocation,
        bookingConfirmationNumber: reservationQuote.quoteNo,
        notes: notes || 'CRM Agent Booking',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        tariffGroupId: 10239,
        tax: reservationQuote.quoteBreakdown.vatAmount,
        taxPercent: 5.0,
        terminal: null,
        totalCharges: reservationQuote.quoteBreakdown.totalAmount,
        advance: 0,
        customerId: Number(customer.id) || 0,
        customer: {
          email: customer.email,
          firstName: customer.firstName || firstName || 'Customer',
          lastName: customer.lastName || rest.join(' ') || 'UAE',
          mobileNo: customer.mobile,
          nationality: customer.nationality || 'United Arab Emirates (UAE)',
          dateOfBirth: customer.dateOfBirth || '1999-12-27',
          gender: customer.gender || 1,
          tariffCardId: 10026,
          tariffPlanId: 10415,
          locationId: customer.locationId || 62,
          address: {
            addressLine1: customer.address?.addressLine1 || 'Dubai',
            city: customer.address?.city || 'DUBAI',
            country: customer.address?.country || 'AE',
            zipCode: customer.address?.zipCode || '00000',
            state: customer.address?.state || 'Dubai',
          },
        },
        charges: [
          {
            order: 1,
            chargesTypeId: 1,
            rateTypeId: 1,
            rate: 100.0,
            units: reservationQuote.rentalDays || 3,
            charges: reservationQuote.quoteBreakdown.totalAmount,
            applyOnClosing: false,
            isMandatory: true,
            accepted: true,
            included: false,
            excessRate: 0,
            limit: 0,
            discountPercent: 0,
            chargesType: null,
            rateType: null,
            tariff: [],
            notes: 'Base rental charge',
            tax: reservationQuote.quoteBreakdown.vatAmount,
            taxable: true,
          },
        ],
      },
    };
  };

  const checkVehicleAvailability = async (vehicleGroupId) => {
    const [vehRes, vgRes, locRes] = await Promise.all([
      apiService.getVehicles({ vehicleGroupId, pageNumber: 1 }),
      apiService.getVehicleGroups(1, 50),
      apiService.getLocations(1, 50),
    ]);
    if (vgRes.success && vgRes.result?.items) setVehicleGroups(vgRes.result.items);
    if (locRes.success && locRes.result?.items) setLocations(locRes.result.items);

    if (vehRes.success && vehRes.result?.items) {
      const count = vehRes.result.totalCount || vehRes.result.items.length;
      setReservationQuote((prev) => ({ ...prev, availabilityStatus: 'Available' }));
      return { count, success: true, message: `${count} vehicles available` };
    }
    return {
      count: 0,
      success: false,
      message: 'No live vehicles returned for selected group',
    };
  };

  const createReservationBooking = async (customPayload?: BookingTransactionPayload) => {
    const payload = customPayload || buildBookingPayload('Created via CRM Workspace');
    const res = await apiService.createBooking(payload);
    if (res.success && (res.result?.agreementNo || res.result?.bookingNo || res.result?.id)) {
      const assignedNo = res.result.agreementNo || res.result.bookingNo || `BKG-${res.result.id}`;
      setReservationQuote((prev) => ({
        ...prev,
        quoteNo: assignedNo,
        status: 'Created',
        pickupDate: payload.booking?.startDate || prev.pickupDate,
        returnDate: payload.booking?.endDate || prev.returnDate,
        pickupLocation: payload.booking?.pickupLocationAddress || prev.pickupLocation,
        quoteBreakdown: {
          ...prev.quoteBreakdown,
          totalAmount: payload.amount || payload.booking?.totalCharges || prev.quoteBreakdown.totalAmount,
        },
      }));

      // Add newly created booking to live bookingResults list
      if (res.result) {
        setBookingResults((prev) => [
          {
            id: res.result.id || Date.now(),
            bookingNo: assignedNo,
            agreementNo: res.result.agreementNo || assignedNo,
            bookingStatus: 'Confirmed',
            startDate: payload.booking.startDate,
            endDate: payload.booking.endDate,
            totalCharges: payload.booking.totalCharges,
            location: payload.booking.pickupLocationAddress,
            locationId: payload.booking.locationId,
            vehicleGroup: {
              id: payload.booking.tariffGroupId || 35,
              name: 'Sedan',
              groupNo: 'Group AZ',
            },
            customer: {
              id: payload.booking.customerId,
              name: `${payload.booking.customer.firstName} ${payload.booking.customer.lastName}`,
              email: payload.booking.customer.email,
              mobileNo: payload.booking.customer.mobileNo,
            },
          } as any,
          ...prev,
        ]);
      }

      return {
        success: true,
        bookingNo: assignedNo,
        message: `Booking ${assignedNo} created successfully in Speed Auto ERP`,
      };
    }
    return {
      success: false,
      bookingNo: reservationQuote.quoteNo,
      message: res.error || 'Unable to create booking right now',
    };
  };

  const updateReservationBooking = async (notes?: string) => {
    const payload = buildBookingPayload(notes || 'Updated via CRM Workspace');
    payload.booking.bookingNo = reservationQuote.quoteNo;
    const res = await apiService.updateBooking(payload);
    return {
      success: res.success,
      message: res.success ? `Booking ${reservationQuote.quoteNo} updated` : 'Unable to update booking right now',
    };
  };

  const confirmReservationBooking = async (bookingNo?: string) => {
    const targetNo = bookingNo || reservationQuote.quoteNo;
    const res = await apiService.confirmBooking(targetNo);
    if (res.success) {
      setReservationQuote((prev) => ({ ...prev, status: 'Confirmed', availabilityStatus: 'Available' }));
      return { success: true, message: `Booking ${targetNo} confirmed` };
    }
    return { success: false, message: 'Unable to confirm booking right now' };
  };

  const cancelReservationBooking = async (bookingNo?: string, reason = 'Customer requested cancellation') => {
    const targetNo = bookingNo || reservationQuote.quoteNo;
    const res = await apiService.cancelBooking({ bookingNo: targetNo, reason });
    if (res.success) {
      setReservationQuote((prev) => ({ ...prev, status: 'Cancelled' }));
      return { success: true, message: `Booking ${targetNo} cancelled` };
    }
    return { success: false, message: 'Unable to cancel booking right now' };
  };

  const saveCustomerContactCards = async (cards: ContactCardItem[]) => {
    setCustomerCards(cards);
    setCustomer((prev) => ({ ...prev, contactCards: cards }));
    const contactId = Number(customer.id);
    if (!contactId) {
      return { success: true, message: 'Profile updated' };
    }
    const res = await apiService.updateCustomerContactCards({
      contactId,
      contactCards: cards,
    });
    if (res.success && Array.isArray(res.result)) {
      setCustomerCards(res.result);
      setCustomer((prev) => ({ ...prev, contactCards: res.result }));
      return { success: true, message: 'Customer card details saved' };
    }
    return { success: false, message: 'Saved locally' };
  };

  const fetchInvoiceDetails = async (voucherNo: string) => {
    const invRes = await apiService.getInvoice(voucherNo);
    if (invRes.success && invRes.result) {
      if (invRes.result.voucherLines && invRes.result.voucherLines.length > 0) {
        setSelectedInvoiceLines(invRes.result.voucherLines);
      }
      if (invRes.result.voucherNo) {
        setBillingSummary((prev) => ({
          ...prev,
          invoiceNo: invRes.result.voucherNo,
          invoiceTotal: invRes.result.amount ?? prev.invoiceTotal,
          amountPaid: invRes.result.amount ?? prev.amountPaid,
          vatAmount: invRes.result.tax ?? prev.vatAmount,
        }));
      }
      return { success: true, message: `Loaded invoice ${invRes.result.voucherNo}` };
    }
    return { success: false, message: `Invoice ${voucherNo} queued` };
  };

  const fetchStatementOfAccounts = async () => {
    const contactId = Number(customer.id) || 0;
    const res = await apiService.getStatementOfAccounts({
      contactId,
      fromDate: '2026-01-01T00:00:00',
      toDate: '2026-12-31T23:59:59',
    });
    return {
      success: res.success,
      message: res.success ? 'Statement prepared for dispatch' : 'Statement request queued',
    };
  };

  const fetchVehicleAccident = async (plateNo: string) => {
    // Only PlateNo as per collection: { "PlateNo": "..." }
    const res = await apiService.getAccident({
      plateNo: plateNo.trim(),
    });
    if (res.success && res.result) {
      return { success: true, message: `Incident #${res.result.id} attached`, data: res.result };
    }
    return { success: false, message: 'No prior incident found for vehicle' };
  };

  const updateCustomer = (updated: Partial<CustomerProfile>) => {
    setCustomer((prev) => ({ ...prev, ...updated }));
  };

  const addCaseReply = (replyText: string, isInternal = false) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      author: agentName,
      role: 'Customer Care Agent',
      timestamp: 'Today 14:30',
      isInternal,
      content: replyText,
      avatarInitials: agentInitials,
      avatarBg: 'bg-blue-600',
    };
    setCaseDetails((prev) => ({
      ...prev,
      thread: [...prev.thread, newMsg],
    }));
  };

  const updateRoadsideStep = (stepIndex: number) => {
    const statuses: RoadsideAssistanceRequest['status'][] = [
      'Request Logged',
      'Dispatch Pending',
      'Assigned',
      'On Site',
      'Completed',
    ];
    setRoadsideAssistance((prev) => ({
      ...prev,
      currentStepIndex: stepIndex,
      status: statuses[stepIndex] || prev.status,
    }));
  };

  const updateCaseStatus = (newStatus: CaseDetails['status']) => {
    setCaseDetails((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const searchCustomer = async (query: string): Promise<{ success: boolean; message: string }> => {
    let trimmed = query.trim();
    if (!trimmed) return { success: false, message: 'Please enter an email or phone number' };

    const isEmail = trimmed.includes('@');
    if (!isEmail) {
      if (trimmed.startsWith(' ')) trimmed = '+' + trimmed.trim();
      if (/^971\d+$/.test(trimmed)) trimmed = '+' + trimmed;
    }
    const searchParam = isEmail ? { email: trimmed } : { mobileNo: trimmed };
    const queryKey = isEmail ? `|${trimmed}` : `${trimmed}|`;
    lastFetchedUrlKeyRef.current = queryKey;

    setIsLoadingCustomer(true);
    try {
      const custRes = await apiService.getCustomerDetail(searchParam);
      if (custRes.success && custRes.result) {
        const c: CustomerDetailResult = custRes.result;
        const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
        const fallbackCardName = c.contactCards?.find((card) => card.nameOnCard)?.nameOnCard?.trim();
        const displayName = fullName || c.name || fallbackCardName || c.email || 'Customer';

        await applyCustomerResultToState(
          c,
          isEmail ? undefined : trimmed,
          isEmail ? trimmed : undefined
        );

        const paramKey = isEmail ? 'email' : 'mobile';
        navigate(`${location.pathname}?${paramKey}=${encodeURIComponent(trimmed)}`, { replace: true });

        return { success: true, message: `Loaded customer ${displayName}` };
      }

      // Record not found: update customer cleanly with searched email in Email, or searched phone in Mobile
      setCustomerCards([]);
      setCustomer({
        id: '—',
        tenantId: undefined,
        firstName: null,
        lastName: null,
        name: 'Customer Record Not Found',
        avatarInitials: '?',
        isVerified: false,
        mobile: isEmail ? '—' : trimmed,
        email: isEmail ? trimmed : '—',
        contactCategory: null,
        locationId: null,
        locationName: undefined,
        nationality: null,
        dateOfBirth: null,
        gender: null,
        address: null,
        identityDocuments: [],
        contactCards: [],
        preferredLanguage: '—',
        idLicenseStatus: 'No docs',
        openTicketsCount: 0,
        activeRentalNo: mockActiveRental.agreementNo,
        previousRentalNo: mockPreviousRental.agreementNo,
      });

      const paramKey = isEmail ? 'email' : 'mobile';
      navigate(`${location.pathname}?${paramKey}=${encodeURIComponent(trimmed)}`, { replace: true });

      return { success: false, message: `No record found for "${trimmed}"` };
    } catch {
      return { success: false, message: 'Network or lookup error' };
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const resetCustomer = () => {
    lastFetchedUrlKeyRef.current = null;
    setCustomer(mockCustomer);
    setCustomerCards(mockCustomer.contactCards || []);
    setActiveRental(mockActiveRental);
    setPreviousRental(mockPreviousRental);
    setBillingSummary(mockBillingSummary);
    setReservationQuote(mockReservationQuote);
    setCaseDetails(mockCaseDetails);
    setRoadsideAssistance(mockRoadsideAssistance);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('email');
      next.delete('mobile');
      next.delete('mobileno');
      next.delete('mobileNo');
      return next;
    });
  };

  const selectVehicleForQuote = (vehicle: {
    model: string;
    group: string;
    plateNo?: string;
    rate?: number;
    locationId?: number;
    locationName?: string;
  }) => {
    setReservationQuote((prev) => {
      const newTotal = vehicle.rate ? vehicle.rate * (prev.rentalDays || 3) * 1.05 : prev.quoteBreakdown.totalAmount;
      return {
        ...prev,
        pickupLocationId: vehicle.locationId ?? prev.pickupLocationId,
        pickupLocation: vehicle.locationName || prev.pickupLocation,
        returnLocationId: vehicle.locationId ?? prev.returnLocationId,
        returnLocation: vehicle.locationName || prev.returnLocation,
        vehicleGroup: vehicle.group,
        vehicleSubtitle: `${vehicle.group} • ${vehicle.model}`,
        vehicle: {
          ...prev.vehicle,
          model: vehicle.model,
          group: vehicle.group,
          plateNo: vehicle.plateNo || prev.vehicle.plateNo,
          locationId: vehicle.locationId,
          locationName: vehicle.locationName,
        },
        quoteBreakdown: {
          ...prev.quoteBreakdown,
          totalAmount: Math.round(newTotal),
        },
      };
    });
  };

  const extendRentalAgreement = async (params: { newReturnDate: string; newReturnTime: string; additionalCharges: number; notes: string }) => {
    setActiveRental((prev) => ({
      ...prev,
      returnDate: params.newReturnDate,
      returnTime: params.newReturnTime,
      totalCharges: (prev.totalCharges || 0) + params.additionalCharges,
    }));
    return { success: true, message: `Agreement ${activeRental.agreementNo} extended to ${params.newReturnDate}` };
  };

  const processEarlyReturn = async (params: { returnDate: string; returnTime: string; locationId: number; returnOdometer: number; fuelLevel: string }) => {
    const loc = locations.find((l) => l.id === params.locationId);
    setActiveRental((prev) => ({
      ...prev,
      returnDate: params.returnDate,
      returnTime: params.returnTime,
      returnLocation: loc?.name || prev.returnLocation,
      status: 'Returned',
    }));
    return { success: true, message: `Agreement ${activeRental.agreementNo} check-in recorded at ${loc?.name || 'Branch'}` };
  };

  const fetchLocations = async (): Promise<LocationItem[]> => {
    if (locations.length > 0) return locations;
    try {
      const res = await apiService.getLocations(1, 100);
      if (res.success && res.result?.items) {
        setLocations(res.result.items);
        return res.result.items;
      }
    } catch (e) {
      console.warn('Failed to fetch locations', e);
    }
    return locations;
  };

  const fetchChargesSettings = async (): Promise<ChargeSettingItem[]> => {
    if (chargesSettings.length > 0) return chargesSettings;
    try {
      const res = await apiService.getChargesSettings();
      if (res.success && res.result) {
        const items = Array.isArray(res.result) ? res.result : [];
        setChargesSettings(items);
        return items;
      }
    } catch (e) {
      console.warn('Failed to fetch charges settings', e);
    }
    return chargesSettings;
  };

  const searchBookingOrAgreement = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return { success: false, message: 'Please enter a booking or agreement number' };

    try {
      // 1. Try Agreement lookup first
      const agrRes = await apiService.getAgreements({ agreementNo: trimmed });
      if (agrRes.success && agrRes.result?.items && agrRes.result.items.length > 0) {
        const item = agrRes.result.items[0];
        const [startDt, startTm] = (item.startDate || '').split('T');
        const [endDt, endTm] = (item.endDate || '').split('T');

        const resolvedPlate = (item as any).vehicle?.plateNo || (item as any).plateNo || '';
        const updatedRental: RentalAgreement = {
          agreementNo: item.agreementNo,
          status: item.agreementStatus === 'Open' ? 'Active' : 'Returned',
          pickupDate: startDt || '—',
          pickupTime: startTm ? startTm.slice(0, 5) : '00:00',
          returnDate: endDt || '—',
          returnTime: endTm ? endTm.slice(0, 5) : '00:00',
          pickupLocation: item.location || item.pickupLocation || 'Dubai',
          returnLocation: item.location || item.pickupLocation || 'Dubai',
          rentalPeriodDays: 30,
          depositAmount: 1500,
          depositStatus: 'Held',
          totalCharges: item.totalCharges ?? 0,
          vehicle: {
            model: item.vehicleGroup?.name ? `Group ${item.vehicleGroup.name}` : 'Sedan',
            group: item.vehicleGroup?.name || 'Group A',
            category: item.vehicleGroup?.name || 'Standard',
            image: '/cars/nissan-kicks.png',
            plateNo: resolvedPlate,
          },
        };

        if (item.agreementStatus === 'Open') {
          setActiveRental(updatedRental);
        } else {
          setPreviousRental(updatedRental);
        }

        if (item.customerId) {
          setCustomer((prev) => ({
            ...prev,
            id: String(item.customerId),
            name: item.customer?.name || prev.name,
            mobile: item.customer?.mobileNo || prev.mobile,
          }));
        }

        await loadBillingForAgreement(item.agreementNo, item.customerId);

        return {
          success: true,
          message: `Loaded agreement ${item.agreementNo}`,
          plateNo: resolvedPlate,
        };
      }

      // 2. Try Booking lookup
      const bookRes = await apiService.getBookings({ bookingNo: trimmed });
      if (bookRes.success && bookRes.result?.items && bookRes.result.items.length > 0) {
        const item = bookRes.result.items[0];
        const [startDt, startTm] = (item.startDate || '').split('T');
        const [endDt, endTm] = (item.endDate || '').split('T');

        const resolvedPlate = (item as any).vehicle?.plateNo || (item as any).plateNo || '';
        const updatedRental: RentalAgreement = {
          agreementNo: item.agreementNo || item.bookingNo || trimmed,
          status: item.bookingStatus === 'Closed' ? 'Returned' : 'Active',
          pickupDate: startDt || '—',
          pickupTime: startTm ? startTm.slice(0, 5) : '00:00',
          returnDate: endDt || '—',
          returnTime: endTm ? endTm.slice(0, 5) : '00:00',
          pickupLocation: item.location || 'Dubai',
          returnLocation: item.location || 'Dubai',
          rentalPeriodDays: 30,
          depositAmount: 1500,
          depositStatus: 'Held',
          totalCharges: item.totalCharges ?? 0,
          vehicle: {
            model: item.vehicleGroup?.name ? `Group ${item.vehicleGroup.name}` : 'Sedan',
            group: item.vehicleGroup?.name || 'Group A',
            category: item.vehicleGroup?.name || 'Standard',
            image: '/cars/nissan-kicks.png',
            plateNo: resolvedPlate,
          },
        };

        setPreviousRental(updatedRental);
        await loadBillingForAgreement(item.agreementNo || item.bookingNo || trimmed, (item as any).customerId);
        return {
          success: true,
          message: `Loaded booking ${item.bookingNo || item.agreementNo}`,
          plateNo: resolvedPlate,
        };
      }

      return { success: false, message: `No booking or agreement found for "${trimmed}"` };
    } catch {
      return { success: false, message: 'Network or lookup error' };
    }
  };

  const [bookingResults, setBookingResults] = useState<BookingItem[]>(
    () => (collectionBookingsResponse.items as unknown as BookingItem[]) || []
  );
  const [agreementResults, setAgreementResults] = useState<AgreementItem[]>(
    () => (collectionAgreementsResponse.items as unknown as AgreementItem[]) || []
  );
  const [isSearchingBooking, setIsSearchingBooking] = useState(false);
  const [isSearchingAgreement, setIsSearchingAgreement] = useState(false);
  const [selectedAgreementVouchers, setSelectedAgreementVouchers] = useState<VoucherItem[]>([]);
  const [selectedInvoiceLines, setSelectedInvoiceLines] = useState<InvoiceLineItem[]>([]);
  const [isLoadingBillingAgreement, setIsLoadingBillingAgreement] = useState(false);
  const lastLoadedAgreementRef = useRef<string | null>(null);

  const loadBillingForAgreement = async (
    agreementNo: string,
    customCustomerId?: number,
    options?: { fromDate?: string; toDate?: string; status?: string }
  ) => {
    const trimmed = agreementNo.trim();
    if (!trimmed) return { success: false, message: 'Invalid agreement number' };

    const cacheKey = `${trimmed}|${options?.fromDate || ''}|${options?.toDate || ''}|${options?.status || ''}`;
    if (lastLoadedAgreementRef.current === cacheKey) {
      return { success: true, message: `Loaded agreement ${trimmed} into Billing Overview` };
    }

    setIsLoadingBillingAgreement(true);
    try {
      lastLoadedAgreementRef.current = cacheKey;
      let resolvedCustomerId = customCustomerId && customCustomerId > 0 ? customCustomerId : 0;
      if (!resolvedCustomerId && customer.id && customer.id !== '—') {
        const parsed = parseInt(String(customer.id).replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) resolvedCustomerId = parsed;
      }

      // Check if already in agreementResults
      let agrItem: AgreementItem | null = agreementResults.find((a) => a.agreementNo === trimmed) || null;
      if (!agrItem) {
        const agrRes = await apiService.getAgreements({
          agreementNo: trimmed,
          customerId: resolvedCustomerId > 0 ? resolvedCustomerId : undefined,
          fromDate: options?.fromDate,
          toDate: options?.toDate,
          status: options?.status,
        });
        if (agrRes.success && agrRes.result?.items && agrRes.result.items.length > 0) {
          agrItem = agrRes.result.items[0];
          if (agrItem.customerId && (!resolvedCustomerId || resolvedCustomerId <= 0)) {
            resolvedCustomerId = agrItem.customerId;
          }
        }
      }

      if (agrItem) {
        const [startDt, startTm] = (agrItem.startDate || '').split('T');
        const [endDt, endTm] = (agrItem.endDate || '').split('T');
        const resolvedPlate = (agrItem as any).vehicle?.plateNo || (agrItem as any).plateNo || '';
        const updatedRental: RentalAgreement = {
          agreementNo: agrItem.agreementNo,
          status: agrItem.agreementStatus === 'Open' ? 'Active' : 'Returned',
          pickupDate: startDt || '—',
          pickupTime: startTm ? startTm.slice(0, 5) : '00:00',
          returnDate: endDt || '—',
          returnTime: endTm ? endTm.slice(0, 5) : '00:00',
          pickupLocation: agrItem.location || agrItem.pickupLocation || 'Dubai',
          returnLocation: agrItem.location || agrItem.pickupLocation || 'Dubai',
          rentalPeriodDays: 30,
          depositAmount: 100,
          depositStatus: 'Held',
          totalCharges: agrItem.totalCharges ?? 0,
          vehicle: {
            model: agrItem.vehicleGroup?.name ? `Group ${agrItem.vehicleGroup.name}` : 'Sedan',
            group: agrItem.vehicleGroup?.name || 'Group A',
            category: agrItem.vehicleGroup?.name || 'Standard',
            image: '/cars/nissan-kicks.png',
            plateNo: resolvedPlate,
          },
        };

        if (agrItem.agreementStatus === 'Open') {
          setActiveRental(updatedRental);
        } else {
          setPreviousRental(updatedRental);
        }
      }

      // 2. Call GetVouchers with CustomerId and AgreementNo
      const voucherRes = await apiService.getVouchers({
        customerId: resolvedCustomerId,
        agreementNo: trimmed,
      });

      let vouchersList: VoucherItem[] = [];
      if (voucherRes.success && voucherRes.result?.items) {
        vouchersList = voucherRes.result.items;
        setSelectedAgreementVouchers(vouchersList);
      } else {
        setSelectedAgreementVouchers([]);
      }

      // 3. Find Invoice Voucher & Call GetInvoice
      const invVoucher =
        vouchersList.find((v) => v.type === 1 || (v.voucherTypesName || '').toLowerCase().includes('invoice')) ||
        vouchersList[0];

      let invoiceLines: InvoiceLineItem[] = [];
      let invoiceAmount = 84.25;
      let invoiceTax = 4.01;
      let invoiceVoucherNo = invVoucher?.voucherNo || 'INV-387951';
      let breakdownRows: Array<{ item: string; amount: number }> = [];
      let salikTotal = 0;
      let salikTripsCount = 0;

      if (invVoucher?.voucherNo) {
        const invRes = await apiService.getInvoice(invVoucher.voucherNo);
        if (invRes.success && invRes.result) {
          invoiceVoucherNo = invRes.result.voucherNo;
          invoiceAmount = invRes.result.amount ?? invVoucher.amount ?? 84.25;
          invoiceTax = invRes.result.tax ?? 4.01;

          if (invRes.result.voucherLines && invRes.result.voucherLines.length > 0) {
            invoiceLines = invRes.result.voucherLines;
            setSelectedInvoiceLines(invoiceLines);

            let rentalTotal = 0;
            let surchargeTotal = 0;

            invoiceLines.forEach((l) => {
              const name = (l.chargesType?.name || l.description || '').toLowerCase();
              const chargeVal = Number(l.credit || l.debit || 0);

              if (name.includes('toll') && !name.includes('surcharge')) {
                salikTotal += chargeVal;
                salikTripsCount += l.quantity || 1;
              } else if (name.includes('surcharge')) {
                surchargeTotal += chargeVal;
              } else {
                rentalTotal += chargeVal;
              }
            });

            if (rentalTotal > 0) {
              breakdownRows.push({
                item: `Rental Charges (${invoiceVoucherNo})`,
                amount: Number(rentalTotal.toFixed(2)),
              });
            }
            if (salikTotal > 0) {
              breakdownRows.push({
                item: `Salik Charges (${salikTripsCount} trips)`,
                amount: Number(salikTotal.toFixed(2)),
              });
            }
            if (surchargeTotal > 0) {
              breakdownRows.push({
                item: `Tolls Surcharge`,
                amount: Number(surchargeTotal.toFixed(2)),
              });
            }
            if (invoiceTax > 0) {
              breakdownRows.push({
                item: `VAT (5%)`,
                amount: Number(invoiceTax.toFixed(2)),
              });
            }
          }
        }
      }

      // 4. Call GetDeposit
      const depositRes = await apiService.getDeposit({
        customerId: resolvedCustomerId,
        agreementNo: trimmed,
      });

      let depositAmt = 100;
      let depositStatus = 'Settled';
      if (depositRes.success && depositRes.result?.items?.length) {
        const dep = depositRes.result.items[0];
        depositAmt = Math.abs(dep.amountRemaining ?? dep.amount ?? dep.amountUsed ?? 100);
        depositStatus = dep.statusName || (dep.isClosed ? 'Settled' : 'Pending Finance');
      }

      // 5. Call GetTrafficFines
      const finesRes = await apiService.getTrafficFines({
        customerId: resolvedCustomerId,
        agreementNo: trimmed,
      });

      let fineAmt = 170;
      let fineTicket = '30201916';
      let fineStatus: 'Paid' | 'Unpaid' | 'Under Dispute' = 'Unpaid';

      if (finesRes.success && finesRes.result?.items?.length) {
        const firstFine = finesRes.result.items[0];
        fineAmt = finesRes.result.items.reduce((acc, f) => acc + (f.amountWithSurcharge || f.amount || 0), 0);
        fineTicket = firstFine.fineNo || '30201916';
        fineStatus = firstFine.isPaid ? 'Paid' : 'Unpaid';
      }

      // If breakdownRows is empty, build clean default rows from invoice totals
      if (breakdownRows.length === 0) {
        const baseAmt = invoiceAmount > invoiceTax ? invoiceAmount - invoiceTax : invoiceAmount;
        breakdownRows = [
          { item: `Imported Invoice: ${invoiceVoucherNo}`, amount: Number(baseAmt.toFixed(2)) },
          { item: `VAT`, amount: Number(invoiceTax.toFixed(2)) },
          { item: `RTA (Parking Fines) - ${fineTicket}`, amount: 150 },
          { item: `Fine Surcharge - ${fineTicket}`, amount: 20 },
        ];
      }

      // Update Billing Summary dynamically
      setBillingSummary((prev) => ({
        ...prev,
        agreementNo: trimmed,
        securityDeposit: depositAmt,
        refundStatus: depositStatus,
        invoiceNo: invoiceVoucherNo,
        invoiceTotal: invoiceAmount || prev.invoiceTotal,
        amountPaid: invoiceAmount || prev.amountPaid,
        balance: 0,
        isPaid: true,
        chargeBreakdown: breakdownRows,
        totalInclVat: invoiceAmount || prev.totalInclVat,
        vatAmount: invoiceTax || prev.vatAmount,
        fines: {
          amount: fineAmt,
          evidenceFile: fineTicket,
          status: fineStatus,
        },
        salik: {
          amount: salikTotal,
          evidenceFile: salikTripsCount > 0 ? `${salikTripsCount} trips registered` : 'Salik Portal',
          status: salikTotal > 0 ? 'Accepted' : 'Pending',
        },
      }));

      return {
        success: true,
        message: `Loaded agreement ${trimmed} into Billing Overview`,
      };
    } catch {
      return { success: false, message: `Failed to load billing details for ${trimmed}` };
    } finally {
      setIsLoadingBillingAgreement(false);
    }
  };

  const executeBookingFilter = async (params?: {
    customerId?: number;
    bookingNo?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setIsSearchingBooking(true);
    try {
      const targetCustomerId =
        params?.customerId !== undefined
          ? params.customerId
          : customer.id && customer.id !== '—'
          ? parseInt(String(customer.id).replace(/\D/g, ''), 10) || 0
          : 0;

      const res = await apiService.getBookings({
        customerId: targetCustomerId,
        bookingNo: params?.bookingNo,
        status: params?.status,
        fromDate: params?.fromDate,
        toDate: params?.toDate,
      });

      if (res.success && res.result?.items) {
        setBookingResults(res.result.items);
        return {
          success: true,
          count: res.result.items.length,
          message: `Loaded ${res.result.items.length} booking${res.result.items.length === 1 ? '' : 's'}`,
        };
      } else {
        setBookingResults([]);
        return {
          success: false,
          count: 0,
          message: res.error || 'No bookings found',
        };
      }
    } catch {
      setBookingResults([]);
      return { success: false, count: 0, message: 'Failed to load bookings' };
    } finally {
      setIsSearchingBooking(false);
    }
  };

  const lastFilteredAgreementQueryRef = useRef<string | null>(null);

  const executeAgreementFilter = async (params?: {
    customerId?: number;
    agreementNo?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    forceRefresh?: boolean;
  }) => {
    const targetCustomerId =
      params?.customerId !== undefined
        ? params.customerId
        : customer.id && customer.id !== '—'
        ? parseInt(String(customer.id).replace(/\D/g, ''), 10) || 0
        : 0;

    const queryKey = `${targetCustomerId}|${params?.agreementNo ?? ''}|${params?.status ?? ''}|${params?.fromDate ?? ''}|${params?.toDate ?? ''}`;
    if (!params?.forceRefresh && lastFilteredAgreementQueryRef.current === queryKey) {
      return { success: true, count: agreementResults.length, message: 'Agreements already loaded' };
    }
    lastFilteredAgreementQueryRef.current = queryKey;

    setIsSearchingAgreement(true);
    try {
      const res = await apiService.getAgreements({
        customerId: targetCustomerId,
        agreementNo: params?.agreementNo,
        status: params?.status,
        fromDate: params?.fromDate,
        toDate: params?.toDate,
      });

      if (res.success && res.result?.items) {
        setAgreementResults(res.result.items);
        return {
          success: true,
          count: res.result.items.length,
          message: `Loaded ${res.result.items.length} agreement${res.result.items.length === 1 ? '' : 's'}`,
        };
      } else {
        setAgreementResults([]);
        return {
          success: false,
          count: 0,
          message: res.error || 'No agreements found',
        };
      }
    } catch {
      setAgreementResults([]);
      return { success: false, count: 0, message: 'Failed to load agreements' };
    } finally {
      setIsSearchingAgreement(false);
    }
  };



  return (
    <WorkspaceContext.Provider
      value={{
        agentName,
        agentInitials,
        queueName,
        ivrPath,
        customer,
        customerCards,
        updateCustomer,
        activeRental,
        previousRental,
        billingSummary,
        reservationQuote,
        caseDetails,
        roadsideAssistance,
        locations,
        vehicleGroups,
        setVehicleGroups,
        chargesSettings,
        fetchLocations,
        fetchChargesSettings,
        isLoadingCustomer,
        refreshCustomerData: fetchCustomerData,
        checkVehicleAvailability,
        createReservationBooking,
        updateReservationBooking,
        confirmReservationBooking,
        cancelReservationBooking,
        saveCustomerContactCards,
        fetchInvoiceDetails,
        fetchStatementOfAccounts,
        fetchVehicleAccident,
        searchBookingOrAgreement,
        loadBillingForAgreement,
        selectedAgreementVouchers,
        setSelectedAgreementVouchers,
        selectedInvoiceLines,
        setSelectedInvoiceLines,
        isLoadingBillingAgreement,
        bookingResults,
        setBookingResults,
        agreementResults,
        setAgreementResults,
        executeBookingFilter,
        executeAgreementFilter,
        isSearchingBooking,
        isSearchingAgreement,
        activeNavTab,
        setActiveNavTab,
        commMode,
        setCommMode,
        activityFilter,
        setActivityFilter,
        operationsSubTab,
        setOperationsSubTab,
        isLeftSidebarOpen,
        toggleLeftSidebar,
        isRightSidebarOpen,
        toggleRightSidebar,
        isTransferOpen,
        setIsTransferOpen,
        isCustomerEditOpen,
        setIsCustomerEditOpen,
        isAddCardOpen,
        setIsAddCardOpen,
        editingCard,
        openEditCardModal,
        isDocDrawerOpen,
        setIsDocDrawerOpen,
        isFleetPickerOpen,
        setIsFleetPickerOpen,
        isExtensionOpen,
        setIsExtensionOpen,
        isReturnOpen,
        setIsReturnOpen,
        isCreateBookingOpen,
        setIsCreateBookingOpen,
        searchCustomer,
        resetCustomer,
        selectVehicleForQuote,
        extendRentalAgreement,
        processEarlyReturn,
        addCaseReply,
        updateRoadsideStep,
        updateCaseStatus,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
