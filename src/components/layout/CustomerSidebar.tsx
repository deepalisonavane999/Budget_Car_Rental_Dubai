import React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

const formatDob = (dob?: string | null): string => {
  if (!dob) return '—';
  const datePart = dob.split('T')[0];
  return datePart || '—';
};

const formatExpiry = (exp?: string | null): string => {
  if (!exp) return '';
  const d = new Date(exp);
  if (Number.isNaN(d.getTime())) return exp.slice(0, 7);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
};

const formatGender = (gender?: number | null): string => {
  if (gender === 1) return 'Male';
  if (gender === 2) return 'Female';
  return '—';
};

const formatCategory = (category?: number | null): string => {
  if (category === 1) return 'Individual';
  if (category === 2) return 'Corporate';
  if (category !== null && category !== undefined) return `Category ${category}`;
  return '—';
};

export const CustomerSidebar: React.FC = () => {
  const {
    customer,
    customerCards,
    setIsCustomerEditOpen,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isLoadingCustomer,
    refreshCustomerData,
    openEditCardModal,
    setIsDocDrawerOpen,
    setActiveNavTab,
  } = useWorkspace();
  const navigate = useNavigate();

  // Collapsed Sleek Mini-Rail View
  if (!isLeftSidebarOpen) {
    return (
      <aside
        onClick={toggleLeftSidebar}
        className="w-8 bg-white border-r border-slate-200 flex flex-col items-center py-2 space-y-2.5 shrink-0 select-none cursor-pointer hover:bg-slate-50 transition-colors z-10"
        title="Click to expand Customer Details"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLeftSidebar();
          }}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Expand Customer Details"
        >
          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
        </button>

        <div className="w-5 h-5 rounded-full bg-slate-500 text-white font-bold text-[8px] flex items-center justify-center shrink-0 shadow-2xs">
          {customer.avatarInitials}
        </div>

        <div className="flex-1 flex items-center justify-center py-2">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase [writing-mode:vertical-lr] rotate-180 select-none">
            Customer Details
          </span>
        </div>
      </aside>
    );
  }

  const cards = customer.contactCards ?? customerCards ?? [];
  const addr = customer.address;
  const formattedAddress = addr
    ? [addr.addressLine1, addr.city, addr.state, addr.country, addr.zipCode]
        .map((v) => (v || '').trim().replace(/,+$/, ''))
        .filter(Boolean)
        .join(', ')
    : '';

  const docsCount = customer.identityDocuments?.length ?? 0;

  const rawMobile = customer.mobile || '';
  const rawEmail = customer.email || '';

  const displayMobile =
    rawMobile && !rawMobile.includes('@')
      ? rawMobile
      : rawEmail && !rawEmail.includes('@') && /^\+?[\d\s-]{6,}$/.test(rawEmail.trim())
      ? rawEmail
      : '—';

  const displayEmail =
    rawEmail && rawEmail.includes('@')
      ? rawEmail
      : rawMobile && rawMobile.includes('@')
      ? rawMobile
      : '—';

  return (
    <aside className="w-56 xl:w-60 bg-white border-r border-slate-200 flex flex-col justify-start shrink-0 select-none overflow-hidden transition-all duration-200 ease-in-out z-10">
      <div className="p-2.5 space-y-1.5 w-56 xl:w-60">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">Customer Details</h2>
            <button
              onClick={() => setIsCustomerEditOpen(true)}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-0.5"
            >
              Edit
            </button>
            <button
              onClick={() => refreshCustomerData()}
              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
              title="Refresh customer profile"
            >
              <RefreshCw
                className={`w-2.5 h-2.5 ${isLoadingCustomer ? 'animate-spin text-blue-600' : ''}`}
              />
            </button>
          </div>

          <button
            onClick={toggleLeftSidebar}
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center space-x-2 py-0.5">
          <div className="w-8 h-8 rounded-full bg-slate-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
            {customer.avatarInitials}
          </div>
          <div className="min-w-0">
            <h3
              className="text-xs font-bold text-slate-900 leading-snug truncate"
              title={customer.name}
            >
              {customer.name || '—'}
            </h3>
            {customer.isVerified ? (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-800 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified Customer</span>
              </span>
            ) : formatCategory(customer.contactCategory) !== '—' ? (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-slate-100 text-slate-600 mt-0.5">
                {formatCategory(customer.contactCategory)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Core Profile Fields */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between items-baseline py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Customer ID</span>
            <span className="font-semibold text-slate-800 font-mono">{customer.id || '—'}</span>
          </div>

          <div className="flex justify-between items-baseline py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Mobile</span>
            <span className="font-semibold text-slate-800 font-mono truncate max-w-[130px]" title={displayMobile}>
              {displayMobile}
            </span>
          </div>

          <div className="flex justify-between items-baseline py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Email</span>
            <span
              className="font-medium text-slate-800 truncate max-w-[135px]"
              title={displayEmail}
            >
              {displayEmail}
            </span>
          </div>

          <div className="flex justify-between items-baseline py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Category</span>
            <span className="font-medium text-slate-800">
              {formatCategory(customer.contactCategory)}
            </span>
          </div>

          <div className="flex justify-between items-baseline py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Location</span>
            <span
              className="font-medium text-slate-800 truncate max-w-[130px]"
              title={customer.locationName || (customer.locationId ? `ID ${customer.locationId}` : '—')}
            >
              {customer.locationName || (customer.locationId ? `#${customer.locationId}` : '—')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 py-0.5 border-b border-slate-50">
            <div>
              <span className="text-slate-400 block text-[9px]">Nationality</span>
              <span className="font-medium text-slate-800 truncate block">
                {customer.nationality || '—'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[9px]">DOB / Gender</span>
              <span className="font-medium text-slate-800">
                {formatDob(customer.dateOfBirth)} • {formatGender(customer.gender)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
            <span className="text-slate-400">Identity Docs</span>
            {docsCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsDocDrawerOpen(true)}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                title="Click to view identity documents"
              >
                <span>{docsCount} {docsCount === 1 ? 'Doc' : 'Docs'}</span>
                <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
              </button>
            ) : (
              <span className="text-[10px] font-medium text-slate-500">No docs</span>
            )}
          </div>

          {/* Address */}
          <div className="py-0.5 border-b border-slate-50">
            <div className="flex items-center space-x-1 text-slate-400 text-[9px]">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span>Address</span>
            </div>
            <p
              className="text-[10px] font-medium text-slate-700 leading-tight line-clamp-2 mt-0.5"
              title={formattedAddress || 'No address on file'}
            >
              {formattedAddress || '—'}
            </p>
          </div>

          {/* Contact Cards */}
          <div className="py-0.5 border-b border-slate-50">
            <div className="flex items-center justify-between text-slate-400 text-[9px] mb-0.5">
              <span className="flex items-center space-x-1">
                <CreditCard className="w-2.5 h-2.5 shrink-0" />
                <span>Saved Cards</span>
              </span>
              <span className="font-semibold text-slate-500">{cards.length}</span>
            </div>
            {cards.length > 0 ? (
              <div className="space-y-0.5">
                {cards.map((card, idx) => (
                  <div
                    key={card.id ?? idx}
                    className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[9px]"
                  >
                    <div className="min-w-0 truncate">
                      <span className="font-mono font-bold text-slate-800">
                        •••• {card.cardNoLastFourDigits}
                      </span>
                      <span className="text-slate-500 ml-1 truncate">
                        {card.bankName || card.nameOnCard || ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                      <span className="font-mono text-slate-500">
                        {formatExpiry(card.expiry)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditCardModal(card)}
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        title="Update this card"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-slate-400">No cards on file</span>
            )}
          </div>

          {/* Rentals & Tickets */}
          {customer.activeRentalNo && (
            <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
              <span className="text-slate-400">Active Rental</span>
              <button
                onClick={() => setActiveNavTab('rentals')}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {customer.activeRentalNo}
              </button>
            </div>
          )}

          {customer.previousRentalNo && (
            <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
              <span className="text-slate-400">Previous Rental</span>
              <button
                onClick={() => setActiveNavTab('billing')}
                className="font-medium text-slate-700 hover:text-blue-600 hover:underline text-right"
              >
                {customer.previousRentalNo}
              </button>
            </div>
          )}

          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400">Open Tickets</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900">{customer.openTicketsCount}</span>
              <button
                onClick={() => setActiveNavTab('cases')}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-0.5"
              >
                <span>View all</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
