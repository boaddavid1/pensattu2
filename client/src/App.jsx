import { lazy, Suspense, useEffect, useState, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import PwaPrompt from './components/PwaPrompt';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import { isLoggedIn } from './admin/adminApi';
import { NavigationProvider } from './context/NavigationContext';

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem', maxWidth: '640px', margin: '4rem auto', background: '#1a1a2e', color: '#e0e0e0', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#ff6b6b', marginTop: 0, fontSize: '1.4rem' }}>Portal Error</h2>
          <p style={{ lineHeight: 1.5, color: '#aaa' }}>Something went wrong loading this section of the admin portal.</p>
          <pre style={{ background: '#12121e', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem', color: '#ff9999', margin: '1rem 0' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.6rem 1.4rem', background: '#2c5f4a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reload Page
            </button>
            <a
              href="/control-panel/dashboard"
              style={{ padding: '0.6rem 1.4rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route-level code splitting — each page loads on demand.
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Sermons = lazy(() => import('./pages/Sermons'));
const Contact = lazy(() => import('./pages/Contact'));
const Events = lazy(() => import('./pages/Events'));
const NoticeBoard = lazy(() => import('./pages/NoticeBoard'));
const NoticeDetail = lazy(() => import('./pages/NoticeDetail'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));
const Register = lazy(() => import('./pages/Register'));
const Ministries = lazy(() => import('./pages/Ministries'));
const DepartmentsTeams = lazy(() => import('./pages/Ministries'));
const MinistryDetail = lazy(() => import('./pages/MinistryDetail'));

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminCrudPage = lazy(() => import('./admin/AdminCrudPage'));
const AdminMinistryForm = lazy(() => import('./admin/AdminMinistryForm'));
const AdminGallery = lazy(() => import('./admin/AdminGallery'));
const AdminReadonly = lazy(() => import('./admin/AdminReadonly'));
const AdminTeamForm = lazy(() => import('./admin/AdminTeamForm'));
const AdminTeamYear = lazy(() => import('./admin/AdminTeamYear'));
const AdminPastQuestions = lazy(() => import('./admin/AdminPastQuestions'));
const AdminBooks = lazy(() => import('./admin/AdminBooks'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminPrayers = lazy(() => import('./prayer-admin/AdminPrayers'));
const AdminRegistrations = lazy(() => import('./admin/AdminRegistrations'));
const AdminNavigation = lazy(() => import('./admin/AdminNavigation'));
const AdminSermons = lazy(() => import('./admin/AdminSermons'));
const AdminPages = lazy(() => import('./admin/AdminPages'));

function PageLoader() {
  return <div className="loading">Loading...</div>;
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <ScrollToHash />
      <Header />
      <PwaPrompt />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/ministries/:id" element={<MinistryDetail />} />
          <Route path="/ministry/:id" element={<MinistryDetail />} />
          <Route path="/ministry" element={<Navigate to="/ministries" replace />} />
          <Route path="/departments-and-teams" element={<Ministries />} />
          <Route path="/departments-and-teams/:id" element={<MinistryDetail />} />
          <Route path="/departments/:id" element={<MinistryDetail />} />
          <Route path="/departments" element={<Navigate to="/ministries" replace />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Navigate to="/notice-board" replace />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/notice-board/:id" element={<NoticeDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:albumId" element={<AlbumDetail />} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileTabBar moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </>
  );
}

function RegisterShell() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Register />
    </Suspense>
  );
}

function AdminShell() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<Navigate to={isLoggedIn() ? '/control-panel/dashboard' : '/control-panel/login'} replace />} />
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="about" element={<AdminPages defaultTab="about" />} />
            <Route path="home" element={<AdminPages defaultTab="home" />} />
            <Route path="contact" element={<AdminPages defaultTab="contact" />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/:activeTab" element={<AdminPages />} />
            <Route path="navigation" element={<AdminNavigation />} />
            <Route path="ministries" element={<AdminCrudPage entity="ministries" title="Departments & Teams" />} />
            <Route path="ministries/new" element={<AdminMinistryForm isNew={true} />} />
            <Route path="ministries/:id/edit" element={<AdminMinistryForm />} />
            <Route path="departments" element={<Navigate to="/control-panel/ministries" replace />} />
            <Route path="departments-teams" element={<Navigate to="/control-panel/ministries" replace />} />
            <Route path="sermons" element={<AdminSermons />} />
            <Route path="team" element={<AdminCrudPage entity="team" title="Leadership Team" />} />
            <Route path="team/new" element={<AdminTeamForm isNew={true} />} />
            <Route path="team/year/:year" element={<AdminTeamYear />} />
            <Route path="team/:id/edit" element={<AdminTeamForm />} />
            <Route path="events" element={<AdminCrudPage entity="events" title="Events" />} />
            <Route path="announcements" element={<Navigate to="/control-panel/notices" replace />} />
            <Route path="notices" element={<AdminCrudPage entity="notices" title="Notices" />} />
            <Route path="visits" element={<AdminReadonly entity="visits" title="Visit Plans" />} />
            <Route path="subscribers" element={<AdminReadonly entity="subscribers" title="Subscribers" />} />
            <Route path="contacts" element={<AdminReadonly entity="contacts" title="Contact Messages" />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="past-questions" element={<AdminPastQuestions />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="prayers" element={<AdminPrayers />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminErrorBoundary>
  );
}

function App() {
  return (
    <NavigationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/control-panel/*" element={<AdminShell />} />
          <Route path="/register/*" element={<RegisterShell />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </NavigationProvider>
  );
}

export default App;
