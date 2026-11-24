import React, { useState } from 'react';
import { UserPlus, Users, ExternalLink, RefreshCw } from 'lucide-react';

export const FunnelFlowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'existing'>('create');
  const [key, setKey] = useState(0);

  const iframeSrc = 'https://funnelflow.agmcgroup.ae/dashboard';

  return (
    <div className="flex-1 w-full h-full bg-slate-50/70 p-3 flex flex-col overflow-hidden select-text">
      {/* Sleek Sub-Tabs Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs shrink-0 mb-3">
        {/* Real Segmented Tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Lead</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'existing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Existing Lead</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
            title="Reload Frame"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            title="Open in new window"
          >
            <span className="hidden sm:inline">Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Embedded Iframe Container with Space, Rounded Corners & Clean Border */}
      <div className="flex-1 w-full h-full bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden relative">
        <iframe
          key={`${key}-${activeTab}`}
          src={iframeSrc}
          title={activeTab === 'create' ? 'Create Lead' : 'Existing Lead'}
          height="100%"
          width="100%"
          style={{ overflow: 'auto', border: 'none', minHeight: '100%' }}
        />
      </div>
    </div>
  );
};
