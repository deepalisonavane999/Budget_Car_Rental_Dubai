import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar';
// import { CustomerActivitySidebar } from './CustomerActivitySidebar';
import { NavigationTabs } from '../common/NavigationTabs';
import { SkeletonCard } from '../common/SkeletonCard';
import { CustomerEditModal } from '../modals/CustomerEditModal';
import { TransferCallModal } from '../modals/TransferCallModal';
import { AddPaymentCardModal } from '../modals/AddPaymentCardModal';
import { CustomerDocumentsDrawer } from '../modals/CustomerDocumentsDrawer';
import { VehicleFleetPickerModal } from '../modals/VehicleFleetPickerModal';
import { RentalExtensionModal } from '../modals/RentalExtensionModal';
import { RentalReturnModal } from '../modals/RentalReturnModal';

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top Navigation Bar with Centered Module Tabs */}
      <NavigationTabs />

      {/* 2. Main Flex Workspace (Fits Window 100% with Clean Rails) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Customer 360 Column (Full or Mini-Rail) */}
        <CustomerSidebar />

        {/* Center Workspace (Page Content + Communication Dock) */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#f4f6f9] relative">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Suspense
              fallback={
                <div className="p-3 space-y-3">
                  <SkeletonCard lines={2} />
                  <SkeletonCard lines={3} />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Right Customer Activity Timeline Column (Commented out for now) */}
        {/* <CustomerActivitySidebar /> */}
      </div>

      {/* Global Modals & Drawers */}
      <CustomerEditModal />
      <TransferCallModal />
      <AddPaymentCardModal />
      <CustomerDocumentsDrawer />
      <VehicleFleetPickerModal />
      <RentalExtensionModal />
      <RentalReturnModal />
    </div>
  );
};
