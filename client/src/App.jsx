import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import PwaPrompt from './components/PwaPrompt';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import { isLoggedIn } from './admin/adminApi';

// Route-level code splitting — each page loads on demand.
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Sermons = lazy(() => import('./pages/Sermons'));
const Contact = lazy(() => import('./pages/Contact'));
const Events = lazy(() => import('./pages/Events'));
const Announcements = lazy(() => import('./pages/Announcements'));
const NoticeBoard = lazy(() => import('./pages/NoticeBoard'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminCrudPage = lazy(() => import('./admin/AdminCrudPage'));
const AdminGallery = lazy(() => import('./admin/AdminGallery'));
const AdminReadonly = lazy(() => import('./admin/AdminReadonly'));
const AdminTeamForm = lazy(() => import('./admin/AdminTeamForm'));
const AdminTeamYear = lazy(() => import('./admin/AdminTeamYear'));
const AdminPastQuestions = lazy(() => import('./admin/AdminPastQuestions'));
const AdminBooks = lazy(() => import('./admin/AdminBooks'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminPrayers = lazy(() => import('./prayer-admin/AdminPrayers'));

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
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:albumId" element={<AlbumDetail />} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileTabBar moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </>
  );
}

function AdminShell() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route index element={<Navigate to={isLoggedIn() ? '/admin/dashboard' : '/admin/login'} replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout><Outlet /></AdminLayout>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="ministries" element={<AdminCrudPage entity="ministries" title="Ministries" />} />
          <Route path="sermons" element={<AdminCrudPage entity="sermons" title="Sermons" />} />
          <Route path="team" element={<AdminCrudPage entity="team" title="Leadership Team" />} />
          <Route path="team/new" element={<AdminTeamForm isNew={true} />} />
          <Route path="team/year/:year" element={<AdminTeamYear />} />
          <Route path="team/:id/edit" element={<AdminTeamForm />} />
          <Route path="events" element={<AdminCrudPage entity="events" title="Events" />} />
          <Route path="announcements" element={<AdminCrudPage entity="announcements" title="Announcements" />} />
          <Route path="notices" element={<AdminCrudPage entity="notices" title="Notices" />} />
          <Route path="visits" element={<AdminReadonly entity="visits" title="Visit Plans" />} />
          <Route path="subscribers" element={<AdminReadonly entity="subscribers" title="Subscribers" />} />
          <Route path="contacts" element={<AdminReadonly entity="contacts" title="Contact Messages" />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="past-questions" element={<AdminPastQuestions />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="prayers" element={<AdminPrayers />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminShell />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
