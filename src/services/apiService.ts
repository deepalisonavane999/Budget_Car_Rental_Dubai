/**
 * Speed Auto Systems / Budget Rent A Car UAE API Client
 */

export interface ApiResponse<T = any> {
  success: boolean;
  error: string | null;
  result: T;
}

export interface ContactCardItem {
  id: number | null;
  type: number;
  cardNoLastFourDigits: string;
  expiry: string;
  nameOnCard: string;
  bankName?: string | null;
  cardNo?: string;
}

export interface CustomerDetailResult {
  id: number;
  tenantId?: number;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  mobileNo?: string | null;
  contactCategory?: number | null;
  locationId?: number | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  address?: {
    addressLine1?: string | null;
    city?: string | null;
    country?: string | null;
    zipCode?: string | null;
    state?: string | null;
  } | null;
  identityDocuments?: any[];
  contactCards?: ContactCardItem[];
}

export interface AgreementItem {
  id: number;
  agreementNo: string;
  agreementNoPrefix?: string;
  agreementNoMain?: number;
  agreementNoSub?: number;
  startDate: string;
  endDate: string;
  pickupLocationId?: number | null;
  tariffGroupId?: number | null;
  tariffCardId?: number | null;
  vehicleId?: number | null;
  customerId: number;
  driverId: number;
  agreementStatus: string;
  bookingStatus?: string;
  totalCharges?: number | null;
  notes?: string | null;
  documents?: any[];
  manualAgreementNo?: string | null;
  agreementType?: number;
  pickupLocation?: string;
  location?: string;
  vehicleType?: string | null;
  vehicle?: any;
  customer?: {
    id: number;
    name: string;
    email?: string | null;
    mobileNo?: string | null;
    isVip?: boolean;
  };
  vehicleGroup?: {
    id: number;
    name: string | null;
    groupNo: string | null;
    description: string | null;
  };
  vehicleGroupId?: number;
}

export interface BookingItem {
  id: number;
  agreementNo?: string;
  bookingNo?: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
  agreementStatus?: string;
  totalCharges?: number | null;
  location?: string;
  customer?: {
    id: number;
    name: string;
    mobileNo?: string | null;
  };
  vehicleGroup?: {
    id: number;
    name: string | null;
  };
}

export interface VoucherItem {
  id: number;
  type: number;
  voucherTypesName: string;
  voucherSubTypeId?: number | null;
  voucherSubTypeName?: string | null;
  voucherNo: string;
  date: string;
  amount: number;
  tax?: number | null;
  allocatedAmount?: number | null;
  isClosed?: boolean;
  dueAmount?: number;
  statusText?: string | null;
  url?: string | null;
  notes?: string | null;
}

export interface InvoiceLineItem {
  id: number;
  voucherId?: number;
  srNo?: number;
  description?: string;
  chargesTypeId?: number;
  chargesType?: {
    id: number;
    name: string;
    detail?: string | null;
    code?: string | null;
  } | null;
  vehicleId?: number;
  vehicle?: {
    plateNo?: string;
    make?: string;
    id?: number;
  } | null;
  quantity?: number;
  credit?: number;
  debit?: number;
  tax?: number;
  taxable?: boolean;
  price?: number;
}

export interface InvoiceResult {
  id: number;
  voucherNo: string;
  date: string;
  amount: number;
  tax?: number;
  discount?: number;
  notes?: string;
  agreementId?: number;
  contactId?: number;
  voucherLines?: InvoiceLineItem[];
}

export interface DepositItem {
  id: number;
  type: number;
  voucherNo: string;
  amount?: number;
  amountUsed: number;
  amountRefunded: number;
  amountRemaining: number;
  date: string;
  isClosed?: boolean;
  notes?: string | null;
  status?: number;
  statusName?: string;
  statusText?: string;
  voucherTypesName?: string;
}

export interface TrafficFineItem {
  tenantId?: number;
  fineNo: string;
  server?: string;
  authority: string;
  fineDateTime: string;
  originalAmount?: number;
  amount: number;
  surcharge?: number;
  amountWithSurcharge?: number;
  plateNo?: string;
  plateInfo?: string;
  fineDescription?: string;
  isPaid?: boolean;
}

export interface VehicleItem {
  id?: number;
  fleetCode: number;
  plateNo: string;
  modelId: number;
  modelYear: string;
  statusId: string;
  status?: string;
  kMs: number;
  tariffGroupId?: number;
  tariffGroupTitle?: string;
  locationId?: number;
  locationName?: string;
  vehicleGroupId?: number;
  vehicleGroupName?: string;
  chassisNo?: string;
  make?: string;
  model?: string;
  variant?: string;
  exteriorColor?: string;
  fuelLevel?: number;
  isBooked?: boolean;
  registrationDate?: string;
  nextRegistrationDate?: string;
  insuranceDate?: string;
  nextInsuranceDate?: string;
  insurancePolicyNo?: string;
  eTag?: string;
}

export interface AccidentResult {
  id: number;
  accidentDateTime: string;
  vehicleId: number;
  movementId: number;
  whosFault?: number;
  isPoliceReport?: boolean;
  policeReportNo?: string;
  state?: string;
  excessAmount?: number;
  invoiceId?: number;
  calcDetail?: string;
  movement?: {
    refNo?: string;
    contact?: {
      id: number;
      name: string;
    };
  };
  documents?: Array<{
    id: number;
    name: string;
    url: string;
    guid?: string;
    documentType?: number;
    accidentId?: number;
  }>;
}

export interface LocationItem {
  id: number;
  tenantId: number;
  code: string;
  name: string;
  area?: string;
  city?: string;
  province?: string;
  inActive?: boolean;
  contactNo?: string;
}

export interface VehicleGroupItem {
  id: number;
  name: string;
  description?: string | null;
  groupNo?: string | null;
}

export interface ChargeSettingItem {
  id: number;
  module: number;
  order: number;
  chargesTypeId: number;
  rateTypeId: number | null;
  isMandatory: boolean;
  taxable: boolean;
  applyOnClosing?: boolean;
  chargesType?: {
    id: number;
    name: string;
    code: string;
  };
  rateType?: {
    id: number;
    name: string;
  } | null;
}

export interface BookingTransactionPayload {
  amount: number;
  skipBookingGewayPayment: boolean;
  currency: string;
  booking: {
    id?: number;
    bookingNo?: string;
    locationId: number;
    bookingType: number;
    bookingRefNo?: string;
    airline?: string | null;
    closingLocationId: number;
    discount: number;
    flightNo?: string | null;
    pickupLocationId?: number | null;
    pickupLocationAddress?: string;
    bookingConfirmationNumber?: string;
    notes?: string;
    startDate: string;
    endDate: string;
    tariffGroupId: number;
    tax: number;
    taxPercent: number;
    terminal?: string | null;
    totalCharges: number;
    advance: number;
    customerId: number;
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      mobileNo: string;
      nationality: string;
      dateOfBirth: string;
      gender: number;
      tariffCardId: number;
      tariffPlanId: number;
      locationId: number;
      address: {
        addressLine1: string;
        city: string;
        country: string;
        zipCode: string;
        state: string;
      };
    };
    charges: Array<{
      order: number;
      chargesTypeId: number;
      rateTypeId: number;
      rate: number;
      units: number;
      charges: number;
      applyOnClosing: boolean;
      isMandatory: boolean;
      accepted: boolean;
      included: boolean;
      excessRate: number;
      limit: number;
      discountPercent: number;
      chargesType?: any;
      rateType?: any;
      tariff?: any[];
      notes?: string;
      tax: number;
      taxable: boolean;
    }>;
  };
}

const DEFAULT_BASE_URL = 'https://speedapi-budgetgensys-grgacxg8grhvh2cs.uaenorth-01.azurewebsites.net/api/';
const DEFAULT_CODE = 'Q0v3wAs_N1IY-j9J_N-v3vGOT637kyC698U0zuUlssrqAzFuNubk5A==';
const DEFAULT_API_KEY = 'hLlMiyHLx89ZktLpSMXg7HcjobK8gmuWuKwNhQokTsY%3D';

export class BudgetApiService {
  private baseUrl: string;
  private code: string;
  private apiKey: string;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.DEV ? '/speed-api/' : DEFAULT_BASE_URL);
    this.code = import.meta.env.VITE_API_CODE || DEFAULT_CODE;
    this.apiKey = import.meta.env.VITE_API_KEY || DEFAULT_API_KEY;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  private buildUrl(endpoint: string): string {
    const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    return `${cleanBase}${endpoint}?code=${encodeURIComponent(this.code)}`;
  }

  private async request<T>(endpoint: string, body: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          result: null as any,
        };
      }

      const json: ApiResponse<T> = await response.json();
      return json;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error',
        result: null as any,
      };
    }
  }

  public async getCustomerDetail(params: {
    mobileNo?: string;
    email?: string;
  }): Promise<ApiResponse<CustomerDetailResult>> {
    const payload: Record<string, any> = {};
    if (params.mobileNo) {
      let m = params.mobileNo;
      // If it starts with a space (due to unencoded '+' in URL query params decoded as space), restore '+'
      if (m.startsWith(' ')) {
        m = '+' + m.trim();
      } else {
        m = m.trim();
      }
      // If standard UAE 12-digit number starting with 971 without '+', prepend '+'
      if (/^971\d+$/.test(m)) {
        m = '+' + m;
      }
      payload.MobileNo = m;
    }
    if (params.email) payload.Email = params.email.trim();
    return this.request<CustomerDetailResult>('GetCustomerDetailByEmailOrMobileNo', payload);
  }

  public async getVouchers(params: {
    customerId?: number;
    agreementNo?: string;
    fromDate?: string;
    toDate?: string;
    dateRangeEnable?: boolean;
    voucherTypesId?: number;
    status?: number;
  }): Promise<ApiResponse<{ totalCount: number; items: VoucherItem[] }>> {
    const payload: Record<string, any> = {};
    if (params.customerId !== undefined && !isNaN(params.customerId) && params.customerId > 0) {
      payload.CustomerId = params.customerId;
    }
    if (params.agreementNo) payload.AgreementNo = params.agreementNo;
    if (params.fromDate) payload.FromDate = params.fromDate;
    if (params.toDate) payload.ToDate = params.toDate;
    if (params.dateRangeEnable !== undefined) payload.DateRangeEnable = params.dateRangeEnable;
    if (params.voucherTypesId !== undefined) payload.VoucherTypesId = params.voucherTypesId;
    if (params.status !== undefined) payload.Status = params.status;
    return this.request<{ totalCount: number; items: VoucherItem[] }>('GetVouchers', payload);
  }

  public async getInvoice(voucherNo: string): Promise<ApiResponse<InvoiceResult>> {
    return this.request<InvoiceResult>('GetInvoice', { VoucherNo: voucherNo });
  }

  public async getDeposit(params: {
    customerId?: number;
    agreementNo?: string;
  }): Promise<ApiResponse<{ totalCount: number; items: DepositItem[] }>> {
    const payload: Record<string, any> = {};
    if (params.customerId !== undefined && !isNaN(params.customerId) && params.customerId > 0) {
      payload.CustomerId = params.customerId;
    }
    if (params.agreementNo) payload.AgreementNo = params.agreementNo;
    return this.request<{ totalCount: number; items: DepositItem[] }>('GetDeposit', payload);
  }

  public async getTrafficFines(params: {
    fineNo?: string;
    customerId?: number;
    agreementNo?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<{ totalCount: number; items: TrafficFineItem[] }>> {
    const payload: Record<string, any> = {};
    if (params.fineNo) payload.FineNo = params.fineNo;
    if (params.customerId !== undefined && !isNaN(params.customerId) && params.customerId > 0) {
      payload.CustomerId = params.customerId;
    }
    if (params.agreementNo) payload.AgreementNo = params.agreementNo;
    if (params.fromDate) payload.FromDate = params.fromDate;
    if (params.toDate) payload.ToDate = params.toDate;
    return this.request<{ totalCount: number; items: TrafficFineItem[] }>('GetTrafficFines', payload);
  }

  public async getVehicles(params: {
    vehicleGroupId?: number;
    pageNumber?: number;
  } = {}): Promise<ApiResponse<{ totalCount: number; items: VehicleItem[] }>> {
    const payload: Record<string, any> = {
      PageNumber: params.pageNumber ?? 1,
    };
    if (params.vehicleGroupId !== undefined && params.vehicleGroupId > 0) {
      payload.VehicleGroupId = params.vehicleGroupId;
    }
    return this.request<{ totalCount: number; items: VehicleItem[] }>('GetVehicles', payload);
  }

  public async getStatementOfAccounts(params: {
    contactId: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('GetStatementOfAccounts', {
      ContactId: params.contactId,
      FromDate: params.fromDate || '2026-01-01T00:00:00',
      ToDate: params.toDate || '2026-12-31T23:59:59',
    });
  }

  public async getBookings(params: {
    customerId?: number;
    status?: string;
    bookingNo?: string;
    bookingConfirmationNumber?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<{ totalCount: number; items: BookingItem[] }>> {
    const validCustomerId =
      typeof params.customerId === 'number' && !isNaN(params.customerId) && params.customerId > 0
        ? params.customerId
        : 0;

    const payload: Record<string, any> = {
      CustomerId: validCustomerId,
      BookingConfirmationNumber: params.bookingConfirmationNumber ?? '',
      BookingStatus: params.status || (params.bookingNo ? 'NA' : 'Closed'),
    };
    if (params.fromDate) payload.FromDate = params.fromDate;
    if (params.toDate) payload.ToDate = params.toDate;
    if (params.bookingNo) payload.BookingNo = params.bookingNo;
    return this.request<{ totalCount: number; items: BookingItem[] }>(
      'GetBookingByDifferentFilters',
      payload
    );
  }

  public async getAgreements(params: {
    customerId?: number;
    status?: string;
    agreementNo?: string;
    manualAgreementNo?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<{ totalCount: number; items: AgreementItem[] }>> {
    const validCustomerId =
      typeof params.customerId === 'number' && !isNaN(params.customerId) && params.customerId > 0
        ? params.customerId
        : 0;

    const payload: Record<string, any> = {
      ManualAgreementNo: params.manualAgreementNo ?? '',
      CustomerId: validCustomerId,
      Status: params.status || (params.agreementNo ? 'NA' : 'Open'),
    };
    if (params.fromDate) payload.FromDate = params.fromDate;
    if (params.toDate) payload.ToDate = params.toDate;
    if (params.agreementNo) payload.AgreementNo = params.agreementNo;
    return this.request<{ totalCount: number; items: AgreementItem[] }>(
      'GetAgreementByDifferentFilters',
      payload
    );
  }

  public async getAccident(params: {
    plateNo?: string;
    customerId?: number;
    policeReportNo?: string;
  }): Promise<ApiResponse<AccidentResult>> {
    const payload: Record<string, any> = {};
    if (params.plateNo) payload.PlateNo = params.plateNo;
    if (params.customerId !== undefined && !isNaN(params.customerId) && params.customerId > 0) {
      payload.CustomerId = params.customerId;
    }
    if (params.policeReportNo) payload.PoliceReportNo = params.policeReportNo;
    const res = await this.request<AccidentResult>('GetAccident', payload);
    if (!res.success && res.error && (res.error.includes('Data is Null') || res.error.includes('Null values'))) {
      return {
        success: false,
        error: `No accident or police report on file for vehicle ${params.plateNo || ''} (Clean vehicle record).`,
        result: null,
      };
    }
    return res;
  }

  public async createBooking(payload: BookingTransactionPayload): Promise<ApiResponse<any>> {
    return this.request<any>('CreateBooking', payload);
  }

  public async updateBooking(payload: BookingTransactionPayload): Promise<ApiResponse<any>> {
    return this.request<any>('UpdateBooking', payload);
  }

  public async cancelBooking(params: { bookingNo: string; reason: string }): Promise<ApiResponse<null>> {
    return this.request<null>('CancelBooking', {
      bookingNo: params.bookingNo,
      reason: params.reason,
    });
  }

  public async updateCustomerContactCards(params: {
    contactId: number;
    contactCards: ContactCardItem[];
  }): Promise<ApiResponse<ContactCardItem[]>> {
    return this.request<ContactCardItem[]>('UpdateCustomerContactCards', {
      contactId: params.contactId,
      ContactCards: params.contactCards,
    });
  }

  public async confirmBooking(bookingNo: string): Promise<ApiResponse<null>> {
    return this.request<null>('ConfirmBooking', { bookingNo });
  }

  public async getLocations(
    pageNumber = 1,
    pageSize = 20
  ): Promise<ApiResponse<{ items: LocationItem[] }>> {
    return this.request<{ items: LocationItem[] }>('GetLocations', {
      pageNumber,
      pageSize,
    });
  }

  public async getChargesSettings(): Promise<ApiResponse<ChargeSettingItem[]>> {
    return this.request<ChargeSettingItem[]>('GetChargesSettings', {});
  }

  public async getVehicleGroups(
    pageNumber = 1,
    pageSize = 20
  ): Promise<ApiResponse<{ totalCount: number; items: VehicleGroupItem[] }>> {
    return this.request<{ totalCount: number; items: VehicleGroupItem[] }>(
      'GetVehicleGroups',
      { PageNumber: pageNumber, pageSize }
    );
  }
}

export const apiService = new BudgetApiService();
