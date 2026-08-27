// App.jsx — Main app with routing
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './api/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import LevelMembers from './pages/LevelMembers.jsx';
import AddMember from './pages/AddMember.jsx';
import EditMember from './pages/EditMember.jsx';
import ViewMember from './pages/ViewMember.jsx';
import Attendance from './pages/Attendance.jsx';
import Messages from './pages/Messages.jsx';
import Halls from './pages/Halls.jsx';
import Alumni from './pages/Alumni.jsx';
import Reports from './pages/Reports.jsx';
import ExportPage from './pages/ExportPage.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
      <Route path="/members/level/:level" element={<ProtectedRoute><LevelMembers /></ProtectedRoute>} />
      <Route path="/members/add" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute><EditMember /></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><ViewMember /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/halls" element={<ProtectedRoute><Halls /></ProtectedRoute>} />
      <Route path="/alumni" element={<ProtectedRoute><Alumni /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
