import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import MainLayout from './layouts/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Requests from './pages/Requests.jsx';
import RequestDetails from './pages/RequestDetails.jsx';
import Assets from './pages/Assets.jsx';
import PreventiveMaintenance from './pages/PreventiveMaintenance.jsx';
import ApprovalMatrix from './pages/ApprovalMatrix.jsx';
import Analytics from './pages/Analytics.jsx';
import Purchases from './pages/Purchases.jsx';
import Vendors from './pages/Vendors.jsx';
import Reports from './pages/Reports.jsx';
import MasterData from './pages/MasterData.jsx';
import Users from './pages/Users.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import TenantSettings from './pages/TenantSettings.jsx';
import Callback from './pages/Callback.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Work & Requests */}
              <Route path="requests" element={<Requests />} />
              <Route path="requests/:id" element={<RequestDetails />} />
              <Route path="work" element={<Navigate to="/work/work-orders" replace />} />
              <Route path="work/my-tasks" element={<Requests defaultView="wip" />} />
              <Route path="work/work-orders" element={<Requests defaultView="all" />} />
              <Route path="work/approvals" element={<Requests defaultView="waiting_approval" />} />
              <Route path="work/vendors" element={<Requests defaultView="wip" />} />
              <Route path="work/dissatisfied" element={<Requests defaultView="dissatisfied" />} />

              {/* Equipment & Assets */}
              <Route path="assets" element={<Assets />} />
              <Route path="assets/:id" element={<Assets />} />

              {/* Preventive Maintenance */}
              <Route path="pm" element={<PreventiveMaintenance />} />
              <Route path="pm/plans" element={<PreventiveMaintenance initialTab="plans" />} />
              <Route path="pm/upcoming" element={<PreventiveMaintenance initialTab="upcoming" />} />
              <Route path="pm/inspections" element={<PreventiveMaintenance initialTab="upcoming" />} />

              {/* Analytics & Maintenance Intelligence */}
              <Route path="analytics" element={<Analytics />} />
              <Route path="analytics/branches" element={<Analytics initialTab="branches" />} />
              <Route path="analytics/cost" element={<Analytics initialTab="cost" />} />
              <Route path="analytics/sla" element={<Analytics initialTab="sla" />} />
              <Route path="analytics/asset-health" element={<Analytics initialTab="health" />} />

              {/* Procurement & Vendors */}
              <Route path="purchases" element={<Purchases />} />
              <Route path="vendors" element={<Vendors />} />

              {/* Administration & Configuration */}
              <Route path="admin/approval-matrix" element={<ApprovalMatrix />} />
              <Route path="approval-matrix" element={<ApprovalMatrix />} />
              <Route path="reports" element={<Reports />} />
              <Route path="master-data" element={<MasterData />} />
              <Route path="users" element={<Users />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<TenantSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
