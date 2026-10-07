import React from 'react';
import { useAuth } from '../../context/AuthContext';
import HRDashboard from './HRDashboard';
import BMDashboard from './BMDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import PlatformDashboard from './PlatformDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'PLATFORM_ADMIN') return <PlatformDashboard />;
  if (user?.role === 'HR') return <HRDashboard />;
  if (user?.role === 'BM') return <BMDashboard />;
  return <EmployeeDashboard />;
};

export default DashboardPage;
