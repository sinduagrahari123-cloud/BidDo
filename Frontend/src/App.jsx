import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import CreateAuctionPage from './pages/Auction/CreateAuctionPage';
import JoinAuctionPage from './pages/Auction/JoinAuctionPage';
import AuctionRoomPage from './pages/Auction/AuctionRoomPage';
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import LandingPage from './pages/Landing/LandingPage';

function App() {
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create" element={<CreateAuctionPage />} />
        <Route path="/join" element={<JoinAuctionPage />} />
        <Route path="/:roomCode" element={<AuctionRoomPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;