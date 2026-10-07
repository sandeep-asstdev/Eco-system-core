import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Callback from './pages/Callback';
import DashboardPage from './modules/dashboard/DashboardPage';
import EmployeeListPage from './modules/employees/EmployeeListPage';
import EmployeeDetailPage from './modules/employees/EmployeeDetailPage';
import OrgChartPage from './modules/employees/OrgChartPage';
import DocumentRequestsPage from './modules/employees/DocumentRequestsPage';
import VacancyListPage from './modules/vacancies/VacancyListPage';
import RecruitmentPipelinePage from './modules/recruitment/RecruitmentPipelinePage';
import JoiningListPage from './modules/joining/JoiningListPage';
import CandidateJoiningPage from './modules/joining/CandidateJoiningPage';
import PayrollListPage from './modules/payroll/PayrollListPage';
import PaymentAdvicePage from './modules/payroll/PaymentAdvicePage';
import AdvancesPage from './modules/advances/AdvancesPage';
import AttendancePage from './modules/attendance/AttendancePage';
import LeaveManagementPage from './modules/leave/LeaveManagementPage';
import ClaimsPage from './modules/claims/ClaimsPage';
import AssetManagementPage from './modules/assets/AssetManagementPage';
import HelpdeskPage from './modules/helpdesk/HelpdeskPage';
import ExitManagementPage from './modules/exit/ExitManagementPage';
import ApprovalsPage from './modules/approvals/ApprovalsPage';
import ReportsPage from './modules/reports/ReportsPage';
import AuditLogsPage from './modules/audit/AuditLogsPage';
import TenantsPage from './modules/platform/TenantsPage';
import TenantSettingsPage from './modules/settings/TenantSettingsPage';
import OrganizationMastersPage from './modules/settings/OrganizationMastersPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Candidate Onboarding */}
          <Route element={<PublicLayout />}>
            <Route path="/join/:token" element={<CandidateJoiningPage />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/callback" element={<Callback />} />

          {/* Authenticated Workspace */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Workforce & Organization */}
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/org-chart" element={<OrgChartPage />} />
            <Route path="/employees/document-requests" element={<DocumentRequestsPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />

            {/* Talent Acquisition */}
            <Route path="/vacancies" element={<VacancyListPage />} />
            <Route path="/recruitment" element={<RecruitmentPipelinePage />} />
            <Route path="/joining" element={<JoiningListPage />} />

            {/* Time & Leaves */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeaveManagementPage />} />

            {/* Compensation & Benefits */}
            <Route path="/payroll" element={<PayrollListPage />} />
            <Route path="/payroll/advice" element={<PaymentAdvicePage />} />
            <Route path="/advances" element={<AdvancesPage />} />
            <Route path="/claims" element={<ClaimsPage />} />

            {/* Facilities, Support & Exit */}
            <Route path="/assets" element={<AssetManagementPage />} />
            <Route path="/helpdesk" element={<HelpdeskPage />} />
            <Route path="/exit" element={<ExitManagementPage />} />

            {/* Governance & Reporting */}
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />

            {/* Platform & Masters Settings */}
            <Route path="/platform/tenants" element={<TenantsPage />} />
            <Route path="/tenant/settings" element={<TenantSettingsPage />} />
            <Route path="/tenant/organization-masters" element={<OrganizationMastersPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
