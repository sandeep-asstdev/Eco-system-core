import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

// Pages
import Login from './pages/Login.jsx';
import Callback from './pages/Callback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tenants from './pages/Tenants.jsx';
import FirmsBrands from './pages/FirmsBrands.jsx';
import Branches from './pages/Branches.jsx';
import Users from './pages/Users.jsx';
import RolesPermissions from './pages/RolesPermissions.jsx';
import Applications from './pages/Applications.jsx';
import AppLauncher from './pages/AppLauncher.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import SyncMonitor from './pages/SyncMonitor.jsx';
import Profile from './pages/Profile.jsx';

function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (currentPath === '/callback') {
    return <Callback />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner text="Initializing Automobile Ecosystem IAM & Governance..." />
      </div>
    );
  }

  if (!isAuthenticated || currentPath === '/login') {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard onNavigate={navigate} />;
      case '/tenants':
        return <Tenants onNavigate={navigate} />;
      case '/firms-brands':
        return <FirmsBrands onNavigate={navigate} />;
      case '/branches':
        return <Branches onNavigate={navigate} />;
      case '/users':
        return <Users onNavigate={navigate} />;
      case '/roles':
        return <RolesPermissions onNavigate={navigate} />;
      case '/applications':
        return <Applications onNavigate={navigate} />;
      case '/launcher':
        return <AppLauncher onNavigate={navigate} />;
      case '/audit-logs':
        return <AuditLogs onNavigate={navigate} />;
      case '/sync-monitor':
        return <SyncMonitor onNavigate={navigate} />;
      case '/profile':
        return <Profile onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar currentPath={currentPath} onNavigate={navigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
