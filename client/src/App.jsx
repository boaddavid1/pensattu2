import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import PwaPrompt from './components/PwaPrompt';
import Home from './pages/Home';
import About from './pages/About';
import Leadership from './pages/Leadership';
import Sermons from './pages/Sermons';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Announcements from './pages/Announcements';
import NoticeBoard from './pages/NoticeBoard';
import Gallery from './pages/Gallery';
import AlbumDetail from './pages/AlbumDetail';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminCrudPage from './admin/AdminCrudPage';
import AdminGallery from './admin/AdminGallery';
import AdminReadonly from './admin/AdminReadonly';
import AdminTeamForm from './admin/AdminTeamForm';
import AdminTeamYear from './admin/AdminTeamYear';
import AdminPastQuestions from './admin/AdminPastQuestions';
import AdminBooks from './admin/AdminBooks';
import AdminUsers from './admin/AdminUsers';
import { isLoggedIn } from './admin/adminApi';

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
      <Footer />
      <MobileTabBar moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </>
  );
}

function AdminShell() {
  return (
    <Routes>
      <Route index element={<Navigate to={isLoggedIn() ? '/admin/dashboard' : '/admin/login'} replace />} />
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout><Outlet /></AdminLayout>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ministries" element={<AdminCrudPage entity="ministries" title="Ministries" />} />
        <Route path="sermons" element={<AdminCrudPage entity="sermons" title="Sermons" />} />
        <Route path="team" element={<AdminCrudPage entity="team" title="Leadership Team" />} />
        <Route path="team/new" element={<AdminTeamForm />} />
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
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
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
