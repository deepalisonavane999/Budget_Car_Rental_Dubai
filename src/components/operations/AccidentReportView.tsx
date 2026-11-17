import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, Search, CheckCircle2, Car } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, AccidentResult } from '../../services/apiService';
import { useSearchParams } from 'react-router-dom';
/*
// Hardcoded fallback response commented as requested:
import { collectionAccidentResponse } from '../../services/mockDataAccCollection';
*/

export const AccidentReportView: React.FC = () => {
  const { customer, activeRental, previousRental } = useWorkspace();
  const [searchParams] = useSearchParams();
  const urlPlate = searchParams.get('plate');
  const defaultPlate = urlPlate || activeRental?.vehicle?.plateNo || previousRental?.vehicle?.plateNo || '32849-EE-DXB';

  const [plateQuery, setPlateQuery] = useState(defaultPlate);
  const [loading, setLoading] = useState(false);
  const [accidentRecord, setAccidentRecord] = useState<(AccidentResult & Record<string, any>) | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAccident = async (targetPlate: string) => {
    if (!targetPlate.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await apiService.getAccident({
        plateNo: targetPlate.trim(),
      });
      if (res.success && res.result) {
        setAccidentRecord(res.result);
      } else {
        setAccidentRecord(null);
        setFeedback(res.error || `No accident or police report on file for plate "${targetPlate}".`);
      }
    } catch {
      setAccidentRecord(null);
      setFeedback('Unable to query accident records right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlPlate) {
      setPlateQuery(urlPlate);
      fetchAccident(urlPlate);
    } else if (defaultPlate) {
      fetchAccident(defaultPlate);
    }
  }, [urlPlate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plateQuery.trim()) fetchAccident(plateQuery.trim());
  };

  const getFaultBadge = (faultCode?: number) => {
    if (faultCode === 2) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          🟢 Third Party at Fault (Covered)
        </span>
      );
    }
    if (faultCode === 1) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          🔴 Customer at Fault (Deductible Applies)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
        🟡 Under Police Investigation
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-3 shadow-2xs space-y-3 text-xs select-none">
      {/* Header and Search */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-xs">Accident & Police Report Documentation</h3>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value)}
              placeholder="Enter plate number..."
              className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono w-44"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors"
          >
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </form>
      </div>

      {feedback && (
        <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
          {feedback}
        </div>
      )}

      {/* Incident Details Card */}
      {accidentRecord ? (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Incident #{accidentRecord.id}
                </span>
                {getFaultBadge(accidentRecord.whosFault)}
              </div>

              <span className="text-slate-500 font-mono text-[11px]">
                Report Date: {accidentRecord.accidentDateTime ? accidentRecord.accidentDateTime.replace('T', ' ').slice(0, 16) : '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Vehicle Plate</span>
                <strong className="text-slate-800 font-mono">{plateQuery}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Movement Ref</span>
                <strong className="text-blue-600 font-mono">{accidentRecord.movement?.refNo || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Police Report No</span>
                <strong className="text-slate-800 font-mono">{accidentRecord.policeReportNo || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Police Verified</span>
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{accidentRecord.isPoliceReport ? 'Verified' : 'Pending'}</span>
                </span>
              </div>
            </div>

            {accidentRecord.calcDetail && (
              <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
                <span className="text-slate-400 block text-[9px] uppercase mb-0.5">Assessment Details</span>
                <p className="whitespace-pre-line">{accidentRecord.calcDetail}</p>
              </div>
            )}

            <div className="p-2 bg-white rounded border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800 block">
                    {accidentRecord.documents?.[0]?.name || 'Police Report Document.pdf'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {accidentRecord.state || 'Dubai'} • Excess: AED {accidentRecord.excessAmount ?? 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => alert('Downloading Dubai Police Report')}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => alert('Attached to insurance claim case')}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs"
                >
                  Link to Case
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 space-y-1">
          <Car className="w-6 h-6 mx-auto text-slate-300" />
          <p>No accident incidents reported for plate {plateQuery}.</p>
        </div>
      )}
    </div>
  );
};