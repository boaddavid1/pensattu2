// App.jsx — Main app with routing
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './api/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';

// Route-level code splitting — each page loads on demand.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Broadcast = lazy(() => import('./pages/Broadcast.jsx'));
const PrayerRequests = lazy(() => import('./pages/PrayerRequests.jsx'));
const ImportOld = lazy(() => import('./pages/ImportOld.jsx'));
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
      <Route path="/messages" element={<ProtectedRoute><Lazy><Messages /></Lazy></ProtectedRoute>} />
      <Route path="/broadcast" element={<ProtectedRoute><Lazy><Broadcast /></Lazy></ProtectedRoute>} />
      <Route path="/prayer" element={<ProtectedRoute><Lazy><PrayerRequests /></Lazy></ProtectedRoute>} />
      <Route path="/import-old" element={<ProtectedRoute><Lazy><ImportOld /></Lazy></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Lazy><Settings /></Lazy></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
