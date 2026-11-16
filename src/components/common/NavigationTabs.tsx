import React, { useState } from 'react';
import {
  Car,
  Calendar,
  CreditCard,
  Settings,
  FolderCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const NavigationTabs: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    searchCustomer,
    resetCustomer,
    isLoadingCustomer,
    customer,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const tabs = [
    { id: 'rentals', label: 'Rentals', icon: Car },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'operations', label: 'Operations', icon: Settings },
    { id: 'cases', label: 'Cases', icon: FolderCheck },
  ];

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await searchCustomer(searchQuery);
    setSearchFeedback(res.message);
    setTimeout(() => setSearchFeedback(null), 4000);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchFeedback(null);
    resetCustomer();
  };

  return (
    <div className="relative flex items-center justify-between border-b border-slate-200 bg-white h-9 px-3 shrink-0 select-none shadow-2xs">
      {/* Flush Left: Toggle Left Sidebar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleLeftSidebar}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title={isLeftSidebarOpen ? 'Collapse Customer Details' : 'Expand Customer Details'}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-blue-600" />
          )}
        </button>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase hidden lg:inline">
          Customer: <span className="text-slate-800 font-mono">#{customer.id}</span>
        </span>
      </div>

      {/* Center: Module Tabs */}
      <div className="flex items-center space-x-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNavTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold rounded-t transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flush Right: Live Customer Search Bar */}
      <div className="flex items-center space-x-1.5">
        <form onSubmit={handleSearchSubmit} className="flex items-center relative">
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email or phone..."
              className="w-44 sm:w-56 pl-7 pr-6 py-0.5 text-[10px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-1.5 p-0.5 text-slate-400 hover:text-slate-600"
                title="Clear Search"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoadingCustomer || !searchQuery.trim()}
            className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
          >
            {isLoadingCustomer ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            ) : (
              <span>Lookup</span>
            )}
          </button>
        </form>

        {searchFeedback && (
          <span className="text-[10px] font-semibold text-blue-600 animate-fade-in bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[150px]">
            {searchFeedback}
          </span>
        )}
      </div>
    </div>
  );
};
