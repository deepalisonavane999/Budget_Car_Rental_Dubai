import React, { lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Optimized Lazy Loaded Page Components
const RentalsPage = lazy(() =>
  import('../pages/RentalsPage').then((m) => ({ default: m.RentalsPage }))
);
const ReservationsPage = lazy(() =>
  import('../pages/ReservationsPage').then((m) => ({ default: m.ReservationsPage }))
);
const BillingPage = lazy(() =>
  import('../pages/BillingPage').then((m) => ({ default: m.BillingPage }))
);
const OperationsPage = lazy(() =>
  import('../pages/OperationsPage').then((m) => ({ default: m.OperationsPage }))
);
const CasesPage = lazy(() =>
  import('../pages/CasesPage').then((m) => ({ default: m.CasesPage }))
);

const RedirectToRentals: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/rentals${location.search}`} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Default route redirects to rentals, preserving search query */}
        <Route index element={<RedirectToRentals />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="cases" element={<CasesPage />} />
        {/* Catch-all redirect to rentals to avoid 404 on refresh, preserving search query */}
        <Route path="*" element={<RedirectToRentals />} />
      </Route>
    </Routes>
  );
};
