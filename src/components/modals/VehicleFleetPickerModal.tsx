import React, { useState, useEffect } from 'react';
import { X, Car, Check, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, VehicleItem } from '../../services/apiService';
import { Badge } from '../common/Badge';

export const VehicleFleetPickerModal: React.FC = () => {
  const {
    vehicleGroups,
    setVehicleGroups,
    isFleetPickerOpen,
    setIsFleetPickerOpen,
    selectVehicleForQuote,
    reservationQuote,
  } = useWorkspace();

  const [selectedGroupId, setSelectedGroupId] = useState<number>(31); // Default Group AZ which has live active vehicles
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  /*
  // Hardcoded dummy models mapping commented as requested:
  const modelNames: Record<number, { name: string; rate: number; category: string }> = {
    26: { name: 'Toyota Yaris / Sunny', rate: 85, category: 'Small Sedan' },
    30: { name: 'Nissan Sunny', rate: 95, category: 'Group B Economy' },
    31: { name: 'Hyundai Accent / MG5', rate: 110, category: 'Group AZ Compact' },
    32: { name: 'Toyota Corolla / Kia Pegas', rate: 125, category: 'Group K Standard' },
    33: { name: 'Nissan Kicks / Duster', rate: 145, category: 'Group A Small SUV' },
    34: { name: 'Toyota RAV4 / Sportage', rate: 195, category: 'Group G Medium SUV' },
    35: { name: 'Nissan Patrol / Prado', rate: 380, category: 'Group F Fullsize 4x4' },
  };
  */

  const fetchFleetVehicles = async (groupId: number) => {
    setLoadingVehicles(true);
    try {
      const res = await apiService.getVehicles({ vehicleGroupId: groupId, pageNumber: 1 });
      if (res.success && res.result?.items && res.result.items.length > 0) {
        setVehicles(res.result.items);
      } else {
        /*
        // Fallback realistic inventory commented as requested:
        const groupInfo = modelNames[groupId] || { name: 'Sedan Standard', rate: 100, category: 'Sedan' };
        setVehicles([
          {
            fleetCode: 10421,
            plateNo: 'DXB-32849',
            modelId: groupId,
            modelYear: '2025',
            statusId: 'Available',
            kMs: 14200,
            tariffGroupId: 10239,
          },
          ...
        ]);
        */
        setVehicles([]);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (isFleetPickerOpen) {
      if (vehicleGroups.length === 0) {
        apiService.getVehicleGroups(1, 50).then((res) => {
          if (res.success && res.result?.items?.length) {
            setVehicleGroups(res.result.items);
            const defaultGrp = res.result.items.find((g) => g.id === 31 || g.id === 33) || res.result.items[0];
            setSelectedGroupId(defaultGrp.id);
            fetchFleetVehicles(defaultGrp.id);
          }
        });
      } else {
        fetchFleetVehicles(selectedGroupId);
      }
    }
  }, [isFleetPickerOpen, selectedGroupId]);

  if (!isFleetPickerOpen) return null;

  const handleSelectCar = (veh: VehicleItem) => {
    const activeGroup = vehicleGroups.find((g) => g.id === selectedGroupId);
    const vehicleTitle =
      veh.tariffGroupTitle ||
      (veh.vehicleGroupName ? `Group ${veh.vehicleGroupName}` : activeGroup?.name || 'Fleet Vehicle');
    const vehicleCategory =
      veh.vehicleGroupName
        ? `Group ${veh.vehicleGroupName}`
        : activeGroup?.description || activeGroup?.name || 'Fleet';

    selectVehicleForQuote({
      model: vehicleTitle,
      group: vehicleCategory,
      plateNo: veh.plateNo,
      rate: 145,
    });

    setIsFleetPickerOpen(false);
  };

  const filteredList = vehicles.filter(
    (v) =>
      v.plateNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(v.fleetCode).includes(searchFilter)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Select Vehicle & Fleet Group</h3>
              <p className="text-[10px] text-slate-500">Live Speed Auto Systems Fleet Inventory</p>
            </div>
          </div>
          <button
            onClick={() => setIsFleetPickerOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Selector and Filter Bar */}
        <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Vehicle Category:</span>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              {vehicleGroups.length > 0 ? (
                vehicleGroups.map((grp) => {
                  const label = grp.description
                    ? `${grp.name} — ${grp.description}`
                    : `Group ${grp.name}`;
                  return (
                    <option key={grp.id} value={grp.id}>
                      {label}
                    </option>
                  );
                })
              ) : (
                /* Hardcoded options commented as requested:
                <>
                  <option value={30}>Group B — Nissan Sunny (Economy)</option>
                  <option value={26}>Small Sedan — Toyota Yaris / Sunny</option>
                  <option value={31}>Group AZ — Hyundai Accent / MG5 (Compact)</option>
                  <option value={32}>Group K — Toyota Corolla / Kia Pegas</option>
                  <option value={33}>Group A — Small SUV (Kicks / Duster)</option>
                  <option value={34}>Group G — Medium SUV (RAV4 / Sportage)</option>
                  <option value={35}>Group F — Fullsize 4x4 (Prado / Patrol)</option>
                </>
                */
                <option value={selectedGroupId}>Loading categories from Speed API...</option>
              )}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search plate or code..."
              className="pl-7 pr-3 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>
        </div>

        {/* Vehicle Grid list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 text-xs">
          {loadingVehicles ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p>Querying fleet vehicles from Speed API...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No vehicles available in this group right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredList.map((veh) => {
                const isCurrentActive =
                  reservationQuote.vehicle.plateNo === veh.plateNo;
                const activeGroup = vehicleGroups.find((g) => g.id === selectedGroupId);
                const vehicleTitle =
                  veh.tariffGroupTitle ||
                  (veh.vehicleGroupName ? `Group ${veh.vehicleGroupName}` : activeGroup?.name || 'Fleet Vehicle');
                const vehicleCategory =
                  veh.vehicleGroupName
                    ? `Group ${veh.vehicleGroupName}`
                    : activeGroup?.description || activeGroup?.name || 'Fleet';
                return (
                  <div
                    key={veh.fleetCode}
                    onClick={() => handleSelectCar(veh)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isCurrentActive
                        ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={vehicleTitle}>
                          {vehicleTitle}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {vehicleCategory} • Year {veh.modelYear || '2026'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-blue-600 text-xs shrink-0">
                        AED 145<span className="text-[9px] text-slate-400 font-normal">/day</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 text-[10px] text-slate-600 font-mono">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">Plate No</span>
                        <strong className="text-slate-800">{veh.plateNo}</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">Fleet ID</span>
                        <span>#{veh.fleetCode}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">Odometer</span>
                        <span>{veh.kMs ? `${veh.kMs.toLocaleString()} km` : '—'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <Badge variant="green" className="text-[9px] py-0 px-1">
                        {veh.statusId || 'IDL'}
                      </Badge>

                      <button
                        type="button"
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[10px] flex items-center space-x-1"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>Select for Quote</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Current Quote: <strong className="text-slate-800">{reservationQuote.vehicle.model}</strong> ({reservationQuote.vehicleGroup})
          </span>
          <button
            onClick={() => setIsFleetPickerOpen(false)}
            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};