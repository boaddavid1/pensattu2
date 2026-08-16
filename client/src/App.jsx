import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import Home from './pages/Home';
import About from './pages/About';
import Leadership from './pages/Leadership';
import Sermons from './pages/Sermons';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Announcements from './pages/Announcements';
import NoticeBoard from './pages/NoticeBoard';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notice-board" element={<NoticeBoard />} />
      </Routes>
      <Footer />
      <MobileTabBar moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
