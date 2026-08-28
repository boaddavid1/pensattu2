// App.jsx — Main app with routing
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './api/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';

// Route-level code splitting — each page loads on demand.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Members = lazy(() => import('./pages/Members.jsx'));
const LevelMembers = lazy(() => import('./pages/LevelMembers.jsx'));
const AddMember = lazy(() => import('./pages/AddMember.jsx'));
const EditMember = lazy(() => import('./pages/EditMember.jsx'));
const ViewMember = lazy(() => import('./pages/ViewMember.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Halls = lazy(() => import('./pages/Halls.jsx'));
const Alumni = lazy(() => import('./pages/Alumni.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const ExportPage = lazy(() => import('./pages/ExportPage.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function Lazy({ children }) {
  return <Suspense fallback={<div className="loading">Loading...</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Lazy><Dashboard /></Lazy></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><Lazy><Members /></Lazy></ProtectedRoute>} />
      <Route path="/members/level/:level" element={<ProtectedRoute><Lazy><LevelMembers /></Lazy></ProtectedRoute>} />
      <Route path="/members/add" element={<ProtectedRoute><Lazy><AddMember /></Lazy></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute><Lazy><EditMember /></Lazy></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><Lazy><ViewMember /></Lazy></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Lazy><Attendance /></Lazy></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Lazy><Messages /></Lazy></ProtectedRoute>} />
      <Route path="/halls" element={<ProtectedRoute><Lazy><Halls /></Lazy></ProtectedRoute>} />
      <Route path="/alumni" element={<ProtectedRoute><Lazy><Alumni /></Lazy></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Lazy><Reports /></Lazy></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><Lazy><ExportPage /></Lazy></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Lazy><Settings /></Lazy></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
