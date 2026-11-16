import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, Gauge, Fuel, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const RentalReturnModal: React.FC = () => {
  const {
    activeRental,
    locations,
    isReturnOpen,
    setIsReturnOpen,
    processEarlyReturn,
  } = useWorkspace();

  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnTime, setReturnTime] = useState('12:00');
  const [locationId, setLocationId] = useState<number>(locations[0]?.id || 21);
  const [odometer, setOdometer] = useState<number>(34250);
  const [fuelLevel, setFuelLevel] = useState('Full');
  const [damageInspected, setDamageInspected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isReturnOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await processEarlyReturn({
      returnDate,
      returnTime,
      locationId,
      returnOdometer: odometer,
      fuelLevel,
    });
    setIsSubmitting(false);
    setSuccessMessage(res.message);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsReturnOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Vehicle Check-In / Early Return</h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Agreement #{activeRental.agreementNo} • {activeRental.vehicle.model}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReturnOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-semibold text-xs">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-in Time</label>
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Return Branch / Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city || 'UAE'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-slate-500" />
                <span>Return Odometer (km)</span>
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full px-2 py-1 font-mono border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Fuel className="w-3 h-3 text-slate-500" />
                <span>Fuel Level</span>
              </label>
              <select
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Full">Full (100%)</option>
                <option value="3/4">3/4 (75%)</option>
                <option value="1/2">1/2 (50%)</option>
                <option value="1/4">1/4 (25%)</option>
                <option value="Empty">Empty (Refuel Charge)</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-xs">Physical Damage Inspection</span>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={damageInspected}
                onChange={(e) => setDamageInspected(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-800 text-xs">No New Damage Reported</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speed Auto Systems ERP Integration</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsReturnOpen(false)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded font-semibold text-xs transition-colors"
              >
                {isSubmitting ? 'Closing...' : 'Complete Check-In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};