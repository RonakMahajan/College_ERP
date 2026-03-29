import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MasterProvider } from './context/MasterContext';
import { ApplicantProvider } from './context/ApplicantContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applicants from './pages/Applicants';
import ApplicantDetail from './pages/ApplicantDetail';
import SeatMatrix from './pages/SeatMatrix';
import Institutions from './pages/masters/Institutions';
import Campuses from './pages/masters/Campuses';
import Departments from './pages/masters/Departments';
import Programs from './pages/masters/Programs';
import Users from './pages/Users';

// Layout wrapper for authenticated pages
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MasterProvider>
          <ApplicantProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected - All roles */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/applicants" element={
                <ProtectedRoute>
                  <AppLayout><Applicants /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/applicants/:id" element={
                <ProtectedRoute>
                  <AppLayout><ApplicantDetail /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/programs" element={
                <ProtectedRoute>
                  <AppLayout><SeatMatrix /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Protected - Admin only */}
              <Route path="/masters/institutions" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout><Institutions /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/masters/campuses" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout><Campuses /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/masters/departments" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout><Departments /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/masters/programs" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout><Programs /></AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout><Users /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ApplicantProvider>
        </MasterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
