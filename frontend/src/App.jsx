import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './auth.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Challenges from './pages/Challenges.jsx';
import ChallengeDetail from './pages/ChallengeDetail.jsx';
import PrizeGame from './pages/PrizeGame.jsx';
import StickerOrder from './pages/StickerOrder.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/belepes" replace />;
  if (admin && !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kihivasok" element={<Challenges />} />
          <Route path="/kihivas/:slug" element={<ChallengeDetail />} />
          <Route path="/nyeremenyjatek" element={<PrizeGame />} />
          <Route path="/matrica-rendeles" element={<StickerOrder />} />
          <Route path="/profil" element={<Protected><Profile /></Protected>} />
          <Route path="/profil/:username" element={<Profile />} />
          <Route path="/belepes" element={<Login />} />
          <Route path="/regisztracio" element={<Register />} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
