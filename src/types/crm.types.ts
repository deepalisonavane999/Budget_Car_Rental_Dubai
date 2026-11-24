export interface CustomerAddress {
  addressLine1?: string | null;
  city?: string | null;
  country?: string | null;
  zipCode?: string | null;
  state?: string | null;
}

export interface CustomerCard {
  id: number | null;
  cardNoLastFourDigits: string;
  expiry: string;
  nameOnCard: string;
  bankName?: string | null;
  type: number;
}

export interface CustomerProfile {
  id: string;
  tenantId?: number;
  firstName?: string | null;
  lastName?: string | null;
  name: string;
  avatarInitials: string;
  isVerified: boolean;
  mobile: string;
  email: string;
  contactCategory?: number | null;
  locationId?: number | null;
  locationName?: string;
  nationality?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  address?: CustomerAddress | null;
  identityDocuments?: any[];
  contactCards?: CustomerCard[];
  preferredLanguage: string;
  idLicenseStatus: 'Verified' | 'Pending' | 'Expired' | 'No docs' | 'Not Provided';
  activeRentalNo?: string;
  previousRentalNo?: string;
  openTicketsCount: number;
}

export interface RentalAgreement {
  agreementNo: string;
  status: 'Active' | 'Returned' | 'Closed' | 'Pending';
  vehicle: {
    model: string;
    group: string;
    category: string;
    image: string;
    plateNo?: string;
    seats?: number;
    bags?: number;
    transmission?: string;
  };
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  returnDate: string;
  returnTime: string;
  returnLocation: string;
  rentalPeriodDays: number;
  depositAmount: number;
  depositStatus: string;
  estimatedCharges?: number;
  rentalCharges?: number;
  extras?: number;
  totalCharges?: number;
  relatedCaseId?: string;
}

export interface BillingSummary {
  agreementNo: string;
  securityDeposit: number;
  refundStatus: string;
  refundStatusSubtext: string;
  invoiceNo: string;
  invoiceTotal: number;
  amountPaid: number;
  balance: number;
  isPaid: boolean;
  chargeBreakdown: Array<{
    item: string;
    amount: number;
  }>;
  vatAmount: number;
  totalInclVat: number;
  fines: {
    amount: number;
    evidenceFile: string;
    status: 'Under Dispute' | 'Paid' | 'Unpaid';
  };
  salik: {
    amount: number;
    evidenceFile: string;
    status: 'Accepted' | 'Pending' | 'Disputed';
  };
  transactions: Array<{
    date: string;
    refNo: string;
    type: string;
    amount: number;
    status: 'Completed' | 'Pending Approval' | 'Failed';
    details: string;
  }>;
}

export interface ReservationQuote {
  quoteNo: string;
  source: string;
  status: string;
  pickupLocation: string;
  pickupLocationId?: number;
  pickupDate: string;
  pickupTime: string;
  returnLocation: string;
  returnLocationId?: number;
  returnDate: string;
  returnTime: string;
  rentalType: string;
  rentalDays: number;
  vehicleGroup: string;
  vehicleSubtitle: string;
  availabilityStatus: 'To confirm' | 'Available' | 'Unavailable';
  vehicle: {
    model: string;
    group: string;
    seats: number;
    bags: number;
    transmission: string;
    image: string;
    plateNo?: string;
    locationId?: number;
    locationName?: string;
  };
  quoteBreakdown: {
    rentalCharges: number;
    vatAmount: number;
    totalAmount: number;
  };
  refundableDeposit: number;
  requiredDocuments: string[];
  eligibilityCheck: 'Pending' | 'Passed' | 'Action Required';
}

export interface LeadHistoryItem {
  reference: string;
  pickupDate: string;
  returnDate: string;
  vehicleGroup: string;
  branch: string;
  status: 'Confirmed' | 'Quoted' | 'Cancelled';
  assignedOwner: string;
}

export interface CaseDetails {
  ticketNo: string;
  title: string;
  status: 'Open' | 'Pending' | 'Ongoing' | 'Resolved';
  relatedRentalNo: string;
  relatedRentalSubtitle: string;
  createdOn: string;
  latestUpdate: string;
  ownerDepartment: string;
  ownerName: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  classification: string;
  department: string;
  category: string;
  subcategory: string;
  branch: string;
  channel: string;
  slaDue: string;
  slaStatusText: string;
  nextAction: string;
  callbackTime: string;
  thread: Array<{
    id: string;
    author: string;
    role: string;
    timestamp: string;
    isInternal: boolean;
    content: string;
    avatarInitials: string;
    avatarBg: string;
  }>;
  relatedTickets: Array<{
    ticketNo: string;
    subject: string;
    created: string;
    closed: string;
    status: 'Resolved' | 'Open' | 'Closed';
  }>;
}

export interface RoadsideAssistanceRequest {
  requestNo: string;
  isPriority: boolean;
  status: 'Request Logged' | 'Dispatch Pending' | 'Assigned' | 'On Site' | 'Completed';
  currentStepIndex: number;
  linkedRentalNo: string;
  vehicleModel: string;
  vehicleClass: string;
  vehicleImage: string;
  requestDateTime: string;
  reportMethod: string;
  issueCategory: string;
  issueSubtext: string;
  location: string;
  callbackNumber: string;
  isVehicleDrivable: boolean;
  safetyAlertText: string;
  dispatchDetails: {
    assignedTeam: string;
    serviceProvider: string;
    eta: string;
  };
  latestUpdate: {
    timestamp: string;
    summary: string;
    updatedBy: string;
  };
  relatedServices: {
    maintenance: {
      status: string;
      actionText: string;
    };
    replacementVehicle: {
      status: string;
      actionText: string;
    };
    deliveryCollection: {
      location: string;
      actionText: string;
    };
  };
}

export interface ActivityItem {
  id: string;
  type: 'call' | 'chat' | 'email' | 'ticket';
  title: string;
  timestamp: string;
  subtitle?: string;
  description?: string;
  meta?: string;
  badge?: {
    text: string;
    color: 'amber' | 'green' | 'blue' | 'purple' | 'red';
  };
}

export interface ActivityGroup {
  dateHeader: string;
  items: ActivityItem[];
}
