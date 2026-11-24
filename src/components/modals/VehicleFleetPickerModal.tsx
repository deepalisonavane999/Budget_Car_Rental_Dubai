import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Car,
  Check,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Calendar,
  Hash,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Gauge,
  Fuel,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { apiService, VehicleItem, LocationItem, VehicleGroupItem } from '../../services/apiService';
import { Badge } from '../common/Badge';

interface RegistrationStatusInfo {
  status: 'valid' | 'expiring_soon' | 'expired' | 'unknown';
  label: string;
  badgeVariant: 'green' | 'amber' | 'red' | 'gray';
  daysLeft?: number;
}

export const VehicleFleetPickerModal: React.FC = () => {
  const {
    vehicleGroups,
    setVehicleGroups,
    locations,
    isFleetPickerOpen,
    setIsFleetPickerOpen,
    selectVehicleForQuote,
    reservationQuote,
  } = useWorkspace();

  // Selected Group: 'all' or specific group ID
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [backgroundLoadingText, setBackgroundLoadingText] = useState<string | null>(null);
  const [availableLocations, setAvailableLocations] = useState<LocationItem[]>(locations || []);

  // --- 7 Additional Search Filters ---
  // 1. Branch / Location
  const [filterBranch, setFilterBranch] = useState<string>('all');
  // 2. Registration Status (all | valid | expiring_soon | expired)
  const [filterRegStatus, setFilterRegStatus] = useState<string>('all');
  // 3. Vehicle Plate Number
  const [filterPlateNo, setFilterPlateNo] = useState<string>('');
  // 4. Vehicle Model
  const [filterModel, setFilterModel] = useState<string>('');
  // 5. Fleet ID
  const [filterFleetCode, setFilterFleetCode] = useState<string>('');
  // 6. Chassis Number (VIN)
  const [filterChassisNo, setFilterChassisNo] = useState<string>('');
  // 7. Generic Quick Search
  const [quickSearch, setQuickSearch] = useState<string>('');

  // Helper to compute Registration Status from nextRegistrationDate
  const getRegStatus = (dateStr?: string): RegistrationStatusInfo => {
    if (!dateStr) {
      return { status: 'unknown', label: 'No Reg Date', badgeVariant: 'gray' };
    }
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return { status: 'unknown', label: 'Invalid Date', badgeVariant: 'gray' };
    }

    const today = new Date();
    // Reset hours for accurate day comparison
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        label: `Expired (${Math.abs(diffDays)}d ago)`,
        badgeVariant: 'red',
        daysLeft: diffDays,
      };
    } else if (diffDays <= 30) {
      return {
        status: 'expiring_soon',
        label: `Expiring Soon (${diffDays}d left)`,
        badgeVariant: 'amber',
        daysLeft: diffDays,
      };
    } else {
      const formattedMonth = targetDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      return {
        status: 'valid',
        label: `Valid until ${formattedMonth}`,
        badgeVariant: 'green',
        daysLeft: diffDays,
      };
    }
  };

  // Vehicle in-memory cache to prevent duplicate network calls
  const vehicleCacheRef = useRef<Map<string | number, VehicleItem[]>>(new Map());
  const isFetchingRef = useRef<boolean>(false);

  // Helper to fetch all pages for a single vehicle group
  const fetchGroupVehicles = async (
    groupId: number,
    onFirstPage?: (items: VehicleItem[]) => void,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<VehicleItem[]> => {
    try {
      const p1 = await apiService.getVehicles({ vehicleGroupId: groupId, pageNumber: 1, pageSize: 50 });
      if (!p1.success || !p1.result?.items || p1.result.items.length === 0) {
        return [];
      }

      const firstPage = p1.result.items;
      if (onFirstPage) onFirstPage(firstPage);

      const totalCount = p1.result.totalCount || firstPage.length;
      const pageSize = firstPage.length || 10;
      const totalPages = Math.min(Math.ceil(totalCount / pageSize), 15);

      if (onProgress) onProgress(firstPage.length, totalCount);
      if (totalPages <= 1) return firstPage;

      // Parallel batching for remaining pages
      const remaining: number[] = [];
      for (let p = 2; p <= totalPages; p++) remaining.push(p);

      const all = [...firstPage];
      const batchSize = 4;
      for (let i = 0; i < remaining.length; i += batchSize) {
        const batch = remaining.slice(i, i + batchSize);
        const batchRes = await Promise.all(
          batch.map((p) => apiService.getVehicles({ vehicleGroupId: groupId, pageNumber: p, pageSize: 50 }))
        );
        batchRes.forEach((res) => {
          if (res.success && res.result?.items) {
            all.push(...res.result.items);
          }
        });
        if (onProgress) onProgress(Math.min(all.length, totalCount), totalCount);
      }
      return all;
    } catch {
      return [];
    }
  };

  // Main fetch function handling single group or 'all' groups
  const fetchFleetVehicles = async (
    groupId: number | 'all',
    currentGroups?: VehicleGroupItem[],
    forceRefresh: boolean = false
  ) => {
    // Return cached results if already loaded for this group unless force refresh
    if (!forceRefresh && vehicleCacheRef.current.has(groupId)) {
      setVehicles(vehicleCacheRef.current.get(groupId) || []);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingVehicles(true);
    setBackgroundLoadingText(null);

    try {
      const grps = currentGroups && currentGroups.length > 0 ? currentGroups : vehicleGroups;

      if (groupId === 'all') {
        // Query vehicles across all available groups
        setBackgroundLoadingText('Discovering fleet across all groups...');
        const targetGroups = grps.length > 0 ? grps : [{ id: 31, name: 'K' } as any];

        // Fetch Page 1 for all groups in parallel batches of 5
        const initialCombined: VehicleItem[] = [];
        const secondaryGroupJobs: { groupId: number; totalCount: number; pageSize: number }[] = [];

        const groupBatchSize = 5;
        for (let i = 0; i < targetGroups.length; i += groupBatchSize) {
          const batch = targetGroups.slice(i, i + groupBatchSize);
          const results = await Promise.all(
            batch.map((g) => apiService.getVehicles({ vehicleGroupId: g.id, pageNumber: 1, pageSize: 50 }))
          );

          results.forEach((gres, idx) => {
            if (gres.success && gres.result?.items && gres.result.items.length > 0) {
              initialCombined.push(...gres.result.items);
              const gObj = batch[idx];
              const total = gres.result.totalCount || gres.result.items.length;
              const pSize = gres.result.items.length || 10;
              if (total > pSize) {
                secondaryGroupJobs.push({ groupId: gObj.id, totalCount: total, pageSize: pSize });
              }
            }
          });

          // Show initial items immediately
          setVehicles([...initialCombined]);
          setLoadingVehicles(false);
        }

        // Fetch secondary pages for groups that had more records
        if (secondaryGroupJobs.length > 0) {
          setBackgroundLoadingText(`Loading full inventory across ${targetGroups.length} groups...`);
          const allSecondaryPageRequests: Promise<any>[] = [];
          secondaryGroupJobs.forEach((job) => {
            const pages = Math.min(Math.ceil(job.totalCount / job.pageSize), 10);
            for (let p = 2; p <= pages; p++) {
              allSecondaryPageRequests.push(apiService.getVehicles({ vehicleGroupId: job.groupId, pageNumber: p, pageSize: 50 }));
            }
          });

          // Batch secondary requests in chunks of 4
          for (let i = 0; i < allSecondaryPageRequests.length; i += 4) {
            const batch = allSecondaryPageRequests.slice(i, i + 4);
            const batchResults = await Promise.all(batch);
            batchResults.forEach((sres) => {
              if (sres.success && sres.result?.items) {
                initialCombined.push(...sres.result.items);
              }
            });
          }
        }

        // Deduplicate
        const unique = new Map<string, VehicleItem>();
        initialCombined.forEach((v) => {
          const key = String(v.id || v.plateNo || v.chassisNo || Math.random());
          unique.set(key, v);
        });
        const finalAll = Array.from(unique.values());
        vehicleCacheRef.current.set('all', finalAll);
        setVehicles(finalAll);
      } else {
        // Query specific group with auto-pagination
        const targetGid = Number(groupId);
        const groupName = grps.find((g) => g.id === targetGid)?.name || `Group ${targetGid}`;

        const allItems = await fetchGroupVehicles(
          targetGid,
          (p1) => {
            setVehicles(p1);
            setLoadingVehicles(false);
          },
          (loaded, total) => {
            if (total > loaded) {
              setBackgroundLoadingText(`Loading full ${groupName} fleet (${loaded} of ${total} vehicles)... `);
            } else {
              setBackgroundLoadingText(null);
            }
          }
        );

        // Deduplicate
        const unique = new Map<string, VehicleItem>();
        allItems.forEach((v) => {
          const key = String(v.id || v.plateNo || v.chassisNo || Math.random());
          unique.set(key, v);
        });
        const finalGroup = Array.from(unique.values());
        vehicleCacheRef.current.set(groupId, finalGroup);
        setVehicles(finalGroup);
      }
    } catch {
      // Retain current vehicles on network error
    } finally {
      isFetchingRef.current = false;
      setLoadingVehicles(false);
      setBackgroundLoadingText(null);
    }
  };

  // Load Reference Data on open
  useEffect(() => {
    if (isFleetPickerOpen) {
      // 1. Vehicle Groups
      if (vehicleGroups.length === 0) {
        apiService.getVehicleGroups(1, 50).then((res) => {
          if (res.success && res.result?.items?.length) {
            setVehicleGroups(res.result.items);
            fetchFleetVehicles(selectedGroupId, res.result.items);
          }
        });
      } else if (vehicles.length === 0) {
        fetchFleetVehicles(selectedGroupId, vehicleGroups);
      }

      // 2. Locations
      if (!locations || locations.length === 0) {
        apiService.getLocations(1, 100).then((locRes) => {
          if (locRes.success && locRes.result?.items) {
            setAvailableLocations(locRes.result.items);
          }
        });
      } else {
        setAvailableLocations(locations);
      }
    }
  }, [isFleetPickerOpen]);

  // Derived list of unique branches from vehicles + reference locations from GetLocations API
  const allBranches = useMemo(() => {
    const map = new Map<string, { id: string; name: string; label: string }>();

    // 1. Add reference locations from GetLocations API (active branches)
    availableLocations.forEach((loc) => {
      if (loc.inActive) return; // filter out closed/inactive branches
      const cityPart = loc.city ? ` • ${loc.city}` : '';
      const codePart = loc.code ? ` (${loc.code})` : '';
      const label = `${loc.name}${codePart}${cityPart}`;
      map.set(String(loc.id), { id: String(loc.id), name: loc.name, label });
    });

    // 2. Add any extra location discovered from current vehicles
    vehicles.forEach((v) => {
      if (v.locationId && v.locationName && !map.has(String(v.locationId))) {
        map.set(String(v.locationId), {
          id: String(v.locationId),
          name: v.locationName,
          label: v.locationName,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [availableLocations, vehicles]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGroupId !== 'all') count++;
    if (filterBranch !== 'all') count++;
    if (filterRegStatus !== 'all') count++;
    if (filterPlateNo.trim()) count++;
    if (filterModel.trim()) count++;
    if (filterFleetCode.trim()) count++;
    if (filterChassisNo.trim()) count++;
    if (quickSearch.trim()) count++;
    return count;
  }, [selectedGroupId, filterBranch, filterRegStatus, filterPlateNo, filterModel, filterFleetCode, filterChassisNo, quickSearch]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedGroupId('all');
    setFilterBranch('all');
    setFilterRegStatus('all');
    setFilterPlateNo('');
    setFilterModel('');
    setFilterFleetCode('');
    setFilterChassisNo('');
    setQuickSearch('');
  };

  // Filter Vehicles according to the 7 required criteria
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Branch Filter
      if (filterBranch !== 'all') {
        const matchesId = v.locationId && String(v.locationId) === filterBranch;
        const selectedBranchObj = allBranches.find((b) => b.id === filterBranch);
        const matchesName =
          v.locationName &&
          (v.locationName.toLowerCase() === filterBranch.toLowerCase() ||
            (selectedBranchObj && selectedBranchObj.name.toLowerCase() === v.locationName.toLowerCase()));
        if (!matchesId && !matchesName) return false;
      }

      // 2. Registration Status Filter
      if (filterRegStatus !== 'all') {
        const regInfo = getRegStatus(v.nextRegistrationDate);
        if (filterRegStatus === 'valid' && regInfo.status !== 'valid') return false;
        if (filterRegStatus === 'expiring_soon' && regInfo.status !== 'expiring_soon') return false;
        if (filterRegStatus === 'expired' && regInfo.status !== 'expired') return false;
      }

      // 3. Plate Number Filter
      if (filterPlateNo.trim()) {
        const qPlate = filterPlateNo.trim().toLowerCase();
        if (!v.plateNo || !v.plateNo.toLowerCase().includes(qPlate)) return false;
      }

      // 4. Vehicle Model Filter
      if (filterModel.trim()) {
        const qModel = filterModel.trim().toLowerCase();
        const modelHaystack = [
          v.tariffGroupTitle,
          v.model,
          v.make,
          v.variant,
          v.modelYear,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!modelHaystack.includes(qModel)) return false;
      }

      // 5. Fleet Filter
      if (filterFleetCode.trim()) {
        const qFleet = filterFleetCode.trim().toLowerCase();
        if (!String(v.fleetCode).toLowerCase().includes(qFleet)) return false;
      }

      // 6. Chassis Number Filter
      if (filterChassisNo.trim()) {
        const qChassis = filterChassisNo.trim().toLowerCase();
        if (!v.chassisNo || !v.chassisNo.toLowerCase().includes(qChassis)) return false;
      }

      // Quick Search across all attributes
      if (quickSearch.trim()) {
        const q = quickSearch.trim().toLowerCase();
        const universalHaystack = [
          v.plateNo,
          v.fleetCode,
          v.chassisNo,
          v.tariffGroupTitle,
          v.locationName,
          v.vehicleGroupName,
          v.modelYear,
          v.exteriorColor,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!universalHaystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    vehicles,
    filterBranch,
    filterRegStatus,
    filterPlateNo,
    filterModel,
    filterFleetCode,
    filterChassisNo,
    quickSearch,
  ]);

  if (!isFleetPickerOpen) return null;

  const handleSelectCar = (veh: VehicleItem) => {
    const matchedGroup = vehicleGroups.find((g) => g.id === veh.vehicleGroupId) ||
      (selectedGroupId !== 'all' ? vehicleGroups.find((g) => g.id === selectedGroupId) : undefined);
    const vehicleTitle =
      veh.tariffGroupTitle ||
      (veh.vehicleGroupName ? `Group ${veh.vehicleGroupName}` : matchedGroup?.name || 'Fleet Vehicle');
    const vehicleCategory =
      veh.vehicleGroupName
        ? `Group ${veh.vehicleGroupName}`
        : matchedGroup?.description || matchedGroup?.name || 'Fleet';

    // Resolve location ID: from veh.locationId, matched location by name, or filterBranch
    let resolvedLocationId = veh.locationId;
    if (!resolvedLocationId && veh.locationName) {
      const matchedLoc = availableLocations.find(
        (l) => l.name.toLowerCase() === veh.locationName?.toLowerCase()
      );
      if (matchedLoc) resolvedLocationId = matchedLoc.id;
    }
    if (!resolvedLocationId && filterBranch !== 'all') {
      const parsedBranch = Number(filterBranch);
      if (!isNaN(parsedBranch) && parsedBranch > 0) {
        resolvedLocationId = parsedBranch;
      }
    }

    const resolvedLocationName =
      veh.locationName ||
      availableLocations.find((l) => l.id === resolvedLocationId)?.name ||
      (filterBranch !== 'all' ? allBranches.find((b) => b.id === filterBranch)?.name : undefined) ||
      '';

    selectVehicleForQuote({
      model: vehicleTitle,
      group: vehicleCategory,
      plateNo: veh.plateNo,
      rate: 145,
      locationId: resolvedLocationId,
      locationName: resolvedLocationName,
    });
    setIsFleetPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Reservation & Vehicle Availability Search
              </h3>
              <p className="text-[11px] text-blue-100">
                Search available vehicles by Branch, Registration Status, Plate, Model, Fleet, Chassis, and Group
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFleetPickerOpen(false)}
            className="text-blue-100 hover:text-white p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Required Filters Container */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2.5 text-xs">
          {/* Top Row: Group Selector + Quick Search + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>7. Vehicle Group:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedGroupId(val);
                    fetchFleetVehicles(val, undefined, false);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                >
                  <option value="all">All Groups</option>
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
                    <option value={selectedGroupId}>Loading groups...</option>
                  )}
                </select>
                {loadingVehicles && (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Quick search everything..."
                  className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-52 shadow-2xs"
                />
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-md font-semibold text-xs flex items-center space-x-1 transition-colors shadow-2xs"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid of the remaining 6 filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-200/80">
            {/* 1. Branch / Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>1. Branch</span>
              </label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Branches</option>
                {allBranches.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Registration Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                <span>2. Reg Status</span>
              </label>
              <select
                value={filterRegStatus}
                onChange={(e) => setFilterRegStatus(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="valid">Valid (&gt; 30d)</option>
                <option value="expiring_soon">Expiring Soon (&le; 30d)</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* 3. Vehicle Plate Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>3. Plate No</span>
              </label>
              <input
                type="text"
                value={filterPlateNo}
                onChange={(e) => setFilterPlateNo(e.target.value)}
                placeholder="e.g. 92306-10"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 4. Vehicle Model */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <Car className="w-3 h-3 text-blue-500" />
                <span>4. Model</span>
              </label>
              <input
                type="text"
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                placeholder="e.g. City Ray / Sunny"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 5. Fleet */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <Hash className="w-3 h-3 text-blue-500" />
                <span>5. Fleet ID</span>
              </label>
              <input
                type="text"
                value={filterFleetCode}
                onChange={(e) => setFilterFleetCode(e.target.value)}
                placeholder="e.g. 183"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* 6. Chassis Number (VIN) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>6. Chassis No</span>
              </label>
              <input
                type="text"
                value={filterChassisNo}
                onChange={(e) => setFilterChassisNo(e.target.value)}
                placeholder="e.g. LB3G43S7..."
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Result Count and Active Filters Feedback */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
            <div className="flex items-center space-x-2">
              <span>
                Showing <strong className="text-slate-800">{filteredVehicles.length}</strong> of{' '}
                <strong className="text-slate-800">{vehicles.length}</strong> available vehicles
              </span>
              {backgroundLoadingText && (
                <span className="flex items-center space-x-1 text-blue-600 font-medium animate-pulse text-[10px]">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>{backgroundLoadingText}</span>
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <span className="text-blue-600 font-semibold">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
              </span>
            )}
          </div>
        </div>

        {/* Vehicle List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-100/40">
          {loadingVehicles ? (
            <div className="py-16 text-center text-slate-500 space-y-2.5">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-blue-600" />
              <p className="font-semibold text-sm">Loading Fleet Inventory...</p>
              <p className="text-xs text-slate-400">Filtering vehicles across branch and group allocations</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 bg-white rounded-xl border border-dashed border-slate-300 p-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">No vehicles matched the selected search filters</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search filters or click reset to view all available vehicles.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs inline-flex items-center space-x-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredVehicles.map((veh) => {
                const isCurrentActive = reservationQuote.vehicle.plateNo === veh.plateNo;
                const matchedGroup =
                  vehicleGroups.find((g) => g.id === veh.vehicleGroupId) ||
                  (selectedGroupId !== 'all' ? vehicleGroups.find((g) => g.id === selectedGroupId) : undefined);
                const vehicleTitle =
                  veh.tariffGroupTitle ||
                  (veh.vehicleGroupName ? `Group ${veh.vehicleGroupName}` : matchedGroup?.name || 'Fleet Vehicle');
                const vehicleCategory =
                  veh.vehicleGroupName
                    ? `Group ${veh.vehicleGroupName}`
                    : matchedGroup?.description || matchedGroup?.name || 'Fleet';

                const regInfo = getRegStatus(veh.nextRegistrationDate);

                return (
                  <div
                    key={`${veh.fleetCode}-${veh.plateNo}`}
                    onClick={() => {
                      if (window.getSelection()?.toString().trim()) {
                        return;
                      }
                      handleSelectCar(veh);
                    }}
                    className={`p-3.5 rounded-xl border transition-all select-text flex flex-col justify-between space-y-2.5 bg-white shadow-2xs hover:shadow-md ${
                      isCurrentActive
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {/* Top Row: Title, Group & Rate */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 select-text">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[9px] select-text">
                            {vehicleCategory}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium select-text">
                            Year {veh.modelYear || '2026'}
                          </span>
                          {veh.exteriorColor && (
                            <span className="text-[10px] text-slate-400 font-medium select-text">
                              • {veh.exteriorColor}
                            </span>
                          )}
                        </div>
                        <h4
                          className="font-bold text-slate-900 text-xs leading-tight line-clamp-1 select-text cursor-text"
                          title={vehicleTitle}
                        >
                          {vehicleTitle}
                        </h4>
                      </div>

                      <div className="text-right shrink-0 select-text">
                        <span className="font-mono font-bold text-blue-600 text-xs block select-text">
                          AED 145<span className="text-[9px] text-slate-400 font-normal">/day</span>
                        </span>
                        <Badge
                          variant={veh.status === 'Available' || veh.statusId === 'IDL' ? 'green' : 'amber'}
                          className="text-[8px] py-0 px-1 inline-block mt-0.5 select-text"
                        >
                          {veh.status || veh.statusId || 'Available'}
                        </Badge>
                      </div>
                    </div>

                    {/* Middle Row: Plate, Fleet, VIN / Chassis */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 grid grid-cols-3 gap-1.5 text-[10px] select-text">
                      <div>
                        <span className="text-[8px] text-slate-400 block font-semibold uppercase">Plate Number</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block shadow-2xs select-text cursor-text">
                          {veh.plateNo}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-semibold uppercase">Fleet ID</span>
                        <span className="font-mono font-semibold text-slate-700 block select-text cursor-text">
                          #{veh.fleetCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block font-semibold uppercase">Chassis (VIN)</span>
                        <span
                          className="font-mono text-slate-700 block truncate select-text cursor-text"
                          title={veh.chassisNo || 'No Chassis Number'}
                        >
                          {veh.chassisNo ? veh.chassisNo : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row: Branch Location & Registration Status */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] items-center pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-600 min-w-0" title={veh.locationName || 'Main Branch'}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{veh.locationName || 'Main Branch'}</span>
                      </div>

                      <div className="flex justify-end">
                        <span
                          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            regInfo.badgeVariant === 'green'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : regInfo.badgeVariant === 'amber'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : regInfo.badgeVariant === 'red'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {regInfo.badgeVariant === 'green' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {regInfo.badgeVariant === 'amber' && <AlertTriangle className="w-2.5 h-2.5" />}
                          {regInfo.badgeVariant === 'red' && <AlertCircle className="w-2.5 h-2.5" />}
                          <span>{regInfo.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status: Odometer, Fuel & Selection Action */}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center space-x-3 text-slate-500 font-mono">
                        <span className="flex items-center space-x-1" title="Current Odometer">
                          <Gauge className="w-3 h-3 text-slate-400" />
                          <span>{veh.kMs ? `${veh.kMs.toLocaleString()} km` : '—'}</span>
                        </span>
                        <span className="flex items-center space-x-1" title="Fuel Level">
                          <Fuel className="w-3 h-3 text-slate-400" />
                          <span>
                            {veh.fuelLevel !== undefined && veh.fuelLevel !== null
                              ? `${Math.round(veh.fuelLevel * 100)}%`
                              : '—'}
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCar(veh);
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold text-[10px] flex items-center space-x-1 transition-all ${
                          isCurrentActive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isCurrentActive ? 'Selected Car' : 'Select for Quote'}</span>
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
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <span>Active Quote Vehicle:</span>
            <strong className="text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
              {reservationQuote.vehicle.plateNo || 'None'}
            </strong>
            <span className="text-slate-700 font-semibold truncate max-w-xs">
              {reservationQuote.vehicle.model}
            </span>
          </div>
          <button
            onClick={() => setIsFleetPickerOpen(false)}
            className="px-3.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
