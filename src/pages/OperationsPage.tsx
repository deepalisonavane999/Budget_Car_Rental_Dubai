import React, { useState } from 'react';
import {
  Wrench,
  AlertOctagon,
  MapPin,
  Phone,
  Check,
  ChevronDown,
  Navigation,
  Truck,
  RotateCcw,
  AlertTriangle,
  Clock,
  Luggage,
  Car,
} from 'lucide-react';
import { useWorkspace, OperationsSubTab } from '../context/WorkspaceContext';
import { CommunicationDock } from '../components/communication/CommunicationDock';
import { AccidentReportView } from '../components/operations/AccidentReportView';

export const OperationsPage: React.FC = () => {
  const {
    customer,
    roadsideAssistance,
    updateRoadsideStep,
    operationsSubTab,
    setOperationsSubTab,
    activeRental,
    fetchVehicleAccident,
    checkVehicleAvailability,
  } = useWorkspace();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const subTabs: { id: OperationsSubTab; label: string; icon: any }[] = [
    { id: 'roadside', label: 'Roadside Assistance', icon: Navigation },
    { id: 'accidents', label: 'Accidents / Police Reports', icon: AlertTriangle },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'replacement', label: 'Replacement', icon: RotateCcw },
    { id: 'delivery', label: 'Delivery / Collection', icon: Truck },
    { id: 'lost_found', label: 'Lost & Found', icon: Luggage },
  ];

  const steps = [
    { label: 'Request Logged', subtext: '8 Oct, 14:20' },
    { label: 'Dispatch Pending', subtext: 'Awaiting' },
    { label: 'Assigned', subtext: 'Unassigned' },
    { label: 'On Site', subtext: 'Not started' },
    { label: 'Completed', subtext: 'Not started' },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-start overflow-hidden p-2 space-y-2 animate-fade-in select-none">
      {/* Upper Area: Operations Dashboard */}
      <div className="space-y-1.5 shrink-0">
        {/* Operations Sub-Navigation */}
        <div className="flex items-center space-x-1 border-b border-slate-200 bg-white p-0.5 rounded text-[11px] font-semibold">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = operationsSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setOperationsSubTab(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Operations Content Area */}
        {operationsSubTab === 'accidents' ? (
          <AccidentReportView />
        ) : (
        <div className="bg-white border border-slate-200 rounded p-2 shadow-2xs space-y-1.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Roadside Assistance Request —{' '}
                <span className="font-mono text-blue-600">{roadsideAssistance.requestNo}</span>
              </h2>
              {roadsideAssistance.isPriority && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  🚨 Priority
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400">Status:</span>
              <div className="relative">
                <select
                  value={roadsideAssistance.currentStepIndex}
                  onChange={(e) => updateRoadsideStep(Number(e.target.value))}
                  className="pl-2 pr-6 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded text-[10px] font-semibold appearance-none focus:ring-1 focus:ring-blue-500"
                >
                  {steps.map((st, i) => (
                    <option key={i} value={i}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-blue-600 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Request Details Row */}
          <div className="grid grid-cols-12 gap-2 items-center text-[10px]">
            <div className="col-span-3 flex items-center space-x-2">
              <div className="w-10 h-9 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="font-bold font-mono text-blue-600 text-[11px]">
                  {roadsideAssistance.linkedRentalNo}
                </span>
                <p className="text-slate-500 text-[9px]">
                  {roadsideAssistance.vehicleModel} | {roadsideAssistance.vehicleClass}
                </p>
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Requested</span>
              <div className="font-bold text-slate-800">8 Oct, 14:20</div>
              <span className="text-slate-500 text-[9px]">Phone</span>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Issue</span>
              <div className="font-bold text-slate-900">{roadsideAssistance.issueCategory}</div>
              <span className="text-rose-600 font-medium text-[9px]">
                {roadsideAssistance.issueSubtext}
              </span>
            </div>

            <div className="col-span-3 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Location</span>
              <div className="flex items-center space-x-1 font-bold text-slate-900">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Oud Metha, Dubai</span>
              </div>
            </div>

            <div className="col-span-2 border-l border-slate-100 pl-2">
              <span className="text-slate-400 block text-[9px]">Callback</span>
              <div className="flex items-center space-x-1 font-mono font-bold text-slate-800">
                <Phone className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                <span>{customer.mobile && customer.mobile !== '—' ? customer.mobile : roadsideAssistance.callbackNumber}</span>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          {!roadsideAssistance.isVehicleDrivable && (
            <div className="p-1.5 bg-rose-50 border border-rose-200 rounded flex items-center space-x-2 text-[10px]">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-bold text-rose-900">Vehicle not drivable:</span>
              <span className="text-rose-800">
                Safety assessment completed. Customer is safe at location.
              </span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="py-1 px-1">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-4 right-4 top-2 h-0.5 bg-slate-200 -z-0" />
              {steps.map((st, idx) => {
                const isPassed = idx <= roadsideAssistance.currentStepIndex;
                const isCurrent = idx === roadsideAssistance.currentStepIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => updateRoadsideStep(idx)}
                    className="flex flex-col items-center relative z-10 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        isPassed
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-400'
                      } ${isCurrent ? 'ring-1 ring-blue-400' : ''}`}
                    >
                      {isPassed ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] mt-0.5 font-bold ${
                        isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Actions Row */}
          <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-100 text-[10px]">
            <div className="col-span-4 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block text-[10px] mb-0.5">Dispatch</span>
              <div className="flex justify-between text-slate-600">
                <span>Team: Operations</span>
                <span className="font-semibold text-amber-700">ETA: Pending</span>
              </div>
            </div>

            <div className="col-span-4 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block text-[10px] mb-0.5">Update</span>
              <p className="text-slate-600 truncate">
                Vehicle not starting (battery). Help being arranged.
              </p>
            </div>

            <div className="col-span-4 flex items-center justify-end space-x-1">
              <button
                onClick={async () => {
                  const res = await fetchVehicleAccident(activeRental.vehicle.plateNo || '');
                  showToast(`Dispatch requested! (${res.message})`);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[10px] flex items-center space-x-1"
              >
                <Truck className="w-2.5 h-2.5" />
                <span>Request Dispatch</span>
              </button>
              <button
                onClick={async () => {
                  const res = await checkVehicleAvailability(31);
                  showToast(`Replacement check: ${res.message}`);
                }}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-[10px] flex items-center space-x-1"
              >
                <RotateCcw className="w-2.5 h-2.5 text-blue-600" />
                <span>Replace</span>
              </button>
              <button
                onClick={() => showToast('Delay escalated!')}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-rose-600 rounded font-semibold text-[10px] flex items-center space-x-1"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                <span>Escalate</span>
              </button>
            </div>
          </div>

          {toastMsg && (
            <span className="text-emerald-700 font-bold block text-[10px] animate-fade-in">{toastMsg}</span>
          )}
        </div>
        )}
      </div>

      {/* Lower Area: Customer Communication Dock with Outbound Variant */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CommunicationDock phoneVariant="outbound" linkedTicket="FIN-10482" />
      </div>
    </div>
  );
};
