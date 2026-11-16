import React, { useState } from 'react';
import { FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService } from '../../services/apiService';
import { collectionVouchersResponse } from '../../services/mockDataAccCollection';
import { Badge } from '../common/Badge';

export const VoucherExplorer: React.FC = () => {
  const { customer } = useWorkspace();
  const [vouchers, setVouchers] = useState<any[]>(collectionVouchersResponse.items);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'invoices' | 'credit_notes' | 'deposits' | 'refunds'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVoucherList = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const custId = Number(customer.id) || 89082;
      const res = await apiService.getVouchers({ customerId: custId });
      if (res.success && res.result?.items && res.result.items.length > 0) {
        setVouchers(res.result.items);
      } else {
        setVouchers(collectionVouchersResponse.items);
      }
    } catch {
      setErrorMsg('Unable to retrieve vouchers right now.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const type = (v.voucherTypesName || v.voucherSubTypeName || '').toLowerCase();
    if (activeFilter === 'invoices') return type.includes('invoice') || v.type === 1;
    if (activeFilter === 'credit_notes') return type.includes('credit') || v.type === 8;
    if (activeFilter === 'deposits') return type.includes('deposit') && !type.includes('refund');
    if (activeFilter === 'refunds') return type.includes('refund') || v.type === 3;
    return true;
  });

  const getVoucherBadge = (v: any) => {
    const type = (v.voucherTypesName || v.voucherSubTypeName || '').toLowerCase();
    if (type.includes('invoice')) return <Badge variant="blue" className="text-[9px] py-0 px-1">Invoice</Badge>;
    if (type.includes('credit')) return <Badge variant="purple" className="text-[9px] py-0 px-1">Credit Note</Badge>;
    if (type.includes('refund')) return <Badge variant="green" className="text-[9px] py-0 px-1">Refund</Badge>;
    if (type.includes('deposit')) return <Badge variant="amber" className="text-[9px] py-0 px-1">Deposit</Badge>;
    return <Badge variant="gray" className="text-[9px] py-0 px-1">{v.voucherTypesName || 'Receipt'}</Badge>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-2 text-[11px] select-none">
      {/* Header and Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-xs">Vouchers, Receipts & Invoices</h3>
          <span className="text-[10px] text-slate-400 font-mono">({filteredVouchers.length} items)</span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Subtabs filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded text-[10px] font-semibold text-slate-600">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'invoices', label: 'Invoices' },
                { id: 'credit_notes', label: 'Credit Notes' },
                { id: 'deposits', label: 'Deposits' },
                { id: 'refunds', label: 'Refunds' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-2 py-0.5 rounded transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchVoucherList}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
            title="Refresh Vouchers list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-h-48 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-1 px-2">Voucher No</th>
              <th className="py-1 px-2">Type</th>
              <th className="py-1 px-2">Date</th>
              <th className="py-1 px-2 text-right">Amount (AED)</th>
              <th className="py-1 px-2 text-right">Due (AED)</th>
              <th className="py-1 px-2 text-center">Status</th>
              <th className="py-1 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[10px]">
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-slate-400">
                  {loading ? 'Querying vouchers from Speed API...' : 'No vouchers found for this filter.'}
                </td>
              </tr>
            ) : (
              filteredVouchers.map((item, idx) => {
                const dateStr = item.date ? item.date.split('T')[0] : '—';
                const hasUrl = Boolean(item.url);
                return (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5 px-2 font-mono font-bold text-blue-600">
                      {item.voucherNo || `VOUCH-${item.id}`}
                    </td>
                    <td className="py-1.5 px-2">{getVoucherBadge(item)}</td>
                    <td className="py-1.5 px-2 text-slate-600 font-mono">{dateStr}</td>
                    <td className="py-1.5 px-2 font-mono font-semibold text-slate-900 text-right">
                      {item.amount !== undefined ? item.amount.toFixed(2) : '—'}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">
                      {item.dueAmount !== undefined ? item.dueAmount.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className="inline-block px-1.5 py-0 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                        {item.statusText || item.statusName || 'Closed'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      {hasUrl ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-0.5 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <span>Print PDF</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(`Viewing voucher ${item.voucherNo}`)}
                          className="text-slate-500 hover:text-slate-800 font-medium"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};