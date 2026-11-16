import React from 'react';
import { Phone, Mail, MessageSquare, Ticket, ChevronRight, ChevronLeft, Activity } from 'lucide-react';
import { useWorkspace, ActivityTab } from '../../context/WorkspaceContext';
// import { mockActivityTimeline } from '../../services/mockData';
import { mockActivityTimeline } from '../../services/mockDataAccCollection';
export const CustomerActivitySidebar: React.FC = () => {
  const { activityFilter, setActivityFilter, isRightSidebarOpen, toggleRightSidebar } =
    useWorkspace();

  const filterTabs: { id: ActivityTab; label: string }[] = [
    { id: 'calls', label: 'Calls' },
    { id: 'chats', label: 'Chats' },
    { id: 'emails', label: 'Emails' },
    { id: 'tickets', label: 'Tickets' },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'call':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Phone className="w-2.5 h-2.5 fill-current" />
          </div>
        );
      case 'chat':
        return (
          <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-2.5 h-2.5 fill-current" />
          </div>
        );
      case 'email':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Mail className="w-2.5 h-2.5" />
          </div>
        );
      case 'ticket':
        return (
          <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
            <Ticket className="w-2.5 h-2.5 fill-current" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-500 text-white flex items-center justify-center shrink-0">
            <Phone className="w-2.5 h-2.5" />
          </div>
        );
    }
  };

  // Collapsed Sleek Mini-Rail View (Flush, No Floating Overlays)
  if (!isRightSidebarOpen) {
    return (
      <aside
        onClick={toggleRightSidebar}
        className="w-8 bg-white border-l border-slate-200 flex flex-col items-center py-2 space-y-2.5 shrink-0 select-none cursor-pointer hover:bg-slate-50 transition-colors z-10"
        title="Click to expand Customer Activity"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRightSidebar();
          }}
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Expand Customer Activity"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-blue-600" />
        </button>

        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Activity className="w-3 h-3" />
        </div>

        <div className="flex-1 flex items-center justify-center py-2">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase [writing-mode:vertical-lr] select-none">
            Activity Feed
          </span>
        </div>
      </aside>
    );
  }

  // Expanded Full View
  return (
    <aside className="w-64 xl:w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none overflow-hidden transition-all duration-200 ease-in-out z-10">
      <div className="w-64 xl:w-72 flex flex-col h-full">
        {/* Header with filter tabs and collapse button */}
        <div className="p-2.5 border-b border-slate-100 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">Customer Activity</h2>
            <button
              onClick={toggleRightSidebar}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
              title="Collapse Activity Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
            {filterTabs.map((tab) => {
              const isActive = activityFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivityFilter(tab.id)}
                  className={`py-0.5 rounded text-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
          {mockActivityTimeline.map((group, groupIdx) => {
            const filteredItems = group.items.filter((item) => {
              if (activityFilter === 'all') return true;
              if (activityFilter === 'calls') return item.type === 'call';
              if (activityFilter === 'chats') return item.type === 'chat';
              if (activityFilter === 'emails') return item.type === 'email';
              if (activityFilter === 'tickets') return item.type === 'ticket';
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.dateHeader}
                </div>

                <div className="space-y-1.5">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start space-x-2 cursor-pointer"
                    >
                      {getEventIcon(item.type)}

                      <div className="flex-1 min-w-0 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                            {item.timestamp}
                          </span>
                        </div>

                        {item.subtitle && (
                          <div className="text-slate-700 font-medium truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}

                        {item.description && (
                          <div className="text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}

                        {item.meta && (
                          <div className="text-slate-400 text-[9px] mt-0.5">{item.meta}</div>
                        )}

                        {item.badge && (
                          <div className="mt-1 flex items-center">
                            <span
                              className={`px-1 py-0.2 text-[9px] font-medium rounded ${
                                item.badge.color === 'amber'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {item.badge.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
