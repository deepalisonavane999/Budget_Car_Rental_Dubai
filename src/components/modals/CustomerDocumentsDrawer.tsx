import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const CustomerDocumentsDrawer: React.FC = () => {
  const { customer, isDocDrawerOpen, setIsDocDrawerOpen } = useWorkspace();

  if (!isDocDrawerOpen) return null;

  const docs = Array.isArray(customer.identityDocuments) ? customer.identityDocuments : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs select-none animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Identity Documents</h3>
              <p className="text-[10px] text-slate-500">
                Customer: <span className="font-mono font-semibold">{customer.name} ({customer.id})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDocDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list strictly from API response */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
          {docs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No docs
            </div>
          ) : (
            <div className="space-y-2.5">
              {docs.map((doc: any, idx: number) => (
                <div
                  key={doc.id ?? idx}
                  className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      {doc.documentType || doc.type || doc.name || `Document #${doc.id ?? idx + 1}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Available</span>
                    </span>
                  </div>
                  {(doc.documentNo || doc.number) && (
                    <div className="text-[11px] text-slate-600 font-mono">
                      No: {doc.documentNo || doc.number}
                    </div>
                  )}
                  {(doc.expiryDate || doc.expiry) && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Expiry: {String(doc.expiryDate || doc.expiry).split('T')[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-[11px] shrink-0">
          <button
            onClick={() => setIsDocDrawerOpen(false)}
            className="px-4 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
