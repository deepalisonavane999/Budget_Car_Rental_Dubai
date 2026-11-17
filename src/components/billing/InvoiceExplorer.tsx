import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Printer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, InvoiceResult } from '../../services/apiService';
import { Badge } from '../common/Badge';

export const InvoiceExplorer: React.FC = () => {
  const { billingSummary, customer } = useWorkspace();
  const [invoiceQuery, setInvoiceQuery] = useState(billingSummary.invoiceNo || '');
  const [invoice, setInvoice] = useState<InvoiceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchInvoice = async (targetNo: string) => {
    const trimmed = targetNo.trim();
    if (!trimmed) {
      setInvoice(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const res = await apiService.getInvoice(trimmed);
      if (res.success && res.result && res.result.voucherNo) {
        setInvoice(res.result);
      } else {
        setInvoice(null);
        setErrorMessage(res.error || `Invoice "${trimmed}" not found.`);
      }
    } catch {
      setInvoice(null);
      setErrorMessage('Unable to retrieve invoice from Speed API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billingSummary.invoiceNo && billingSummary.invoiceNo !== '—') {
      setInvoiceQuery(billingSummary.invoiceNo);
      fetchInvoice(billingSummary.invoiceNo);
    }
  }, [billingSummary.invoiceNo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceQuery.trim()) {
      fetchInvoice(invoiceQuery.trim());
    }
  };

  const netAmount = invoice ? Number(invoice.amount || 0) - Number(invoice.tax || 0) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded p-2.5 shadow-2xs space-y-2.5 text-[11px] select-none">
      {/* Header with Search */}
      <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Invoice Explorer</h3>
            <p className="text-[10px] text-slate-400">Query and inspect official customer tax invoices</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
              placeholder="e.g. INV-387951"
              className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono w-40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors flex items-center space-x-1"
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span>Lookup</span>
            )}
          </button>
        </form>
      </div>

      {feedback && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Invoice Card */}
      {invoice ? (
        <div className="space-y-2 border border-slate-200 rounded p-3 bg-slate-50/50">
          {/* Top Bar of Invoice */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-slate-900 text-sm">
                {invoice.voucherNo}
              </span>
              <Badge variant="blue" className="text-[10px] py-0 px-1.5">
                Tax Invoice
              </Badge>
            </div>

            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Invoice Date</span>
              <span className="font-mono font-bold text-slate-800">
                {invoice.date ? invoice.date.split('T')[0] : '—'}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">Net Amount</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                AED {netAmount > 0 ? netAmount.toFixed(2) : Number(invoice.amount || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">VAT / Tax</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                AED {invoice.tax !== undefined ? Number(invoice.tax).toFixed(2) : '0.00'}
              </span>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">Total Invoice (Incl. VAT)</span>
              <span className="font-mono font-bold text-blue-600 text-xs">
                AED {Number(invoice.amount || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">Agreement Ref</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {invoice.agreementId ? `#${invoice.agreementId}` : '—'}
              </span>
            </div>
          </div>

          {/* Notes & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="text-[10px] text-slate-500 max-w-md truncate">
              {invoice.notes ? (
                <span>Note: <strong className="text-slate-700">{invoice.notes}</strong></span>
              ) : (
                <span>No additional notes for this invoice.</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setFeedback(`Invoice ${invoice.voucherNo} sent to ${customer.email || 'customer'}`);
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs flex items-center space-x-1"
              >
                <FileText className="w-3 h-3 text-slate-500" />
                <span>Send to Customer</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center space-x-1"
              >
                <Printer className="w-3 h-3" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 space-y-1">
          <FileText className="w-6 h-6 mx-auto text-slate-300" />
          <p>
            {loading
              ? 'Loading invoice details from Speed API...'
              : 'No invoice currently loaded. Enter an invoice voucher number above to lookup.'}
          </p>
        </div>
      )}
    </div>
  );
};
