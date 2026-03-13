import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, TrendingUp, Users, DollarSign, Zap, Bell, X, 
  ShieldCheck, Megaphone, LogOut, AlertTriangle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";
import RocketSplash from "../components/RocketSplash";

// Dashboard Sub-components
import Wallet from "../dashboard/Wallet";
import Withdraw from "../dashboard/Withdraw";
import Referrals from "../dashboard/Referrals";
import Income from "../dashboard/Income";
import Packages from "../dashboard/Packages";
import History from "../dashboard/History";
import Settings from "../dashboard/Settings";
import AdminPanel from "../dashboard/AdminPanel";
import EarningHistory from "../dashboard/EarningHistory";

// --- ANIMATIONS ---
const marquee = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotateX(0deg); }
  50% { transform: translateY(-5px) rotateX(1deg); }
`;

// --- STYLED COMPONENTS ---
const LayoutWrapper = styled.div`
  min-height: 100vh; width: 100vw;background-color: ${props => props.theme.bg}; /* 👈 Use Theme */
  color: ${props => props.theme.text}; background-color: #050507; color: #fff;
  display: flex; position: relative; overflow-x: hidden; font-family: 'Inter', sans-serif;
`;

const SidebarContainer = styled.div`
  position: fixed; top: 0; left: 0; height: 100vh; width: 260px; z-index: 1000;
  transition: transform 0.3s ease;
  @media (max-width: 1024px) { transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
`;

const MainContent = styled.main`
  flex: 1; margin-left: 260px; padding: 25px; min-height: 100vh; width: 100%;
  display: flex; flex-direction: column;
  background: radial-gradient(circle at 50% 0%, rgba(20, 20, 30, 0.4) 0%, rgba(5, 5, 7, 1) 100%);
  @media (max-width: 1024px) { margin-left: 0; padding: 85px 15px 30px 15px; }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 3000;
  display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px);
`;

const AnnouncementCard = styled(motion.div)`
  background: #0f0f13; width: 100%; max-width: 480px; border-radius: 24px;
  border: 1px solid rgba(62, 166, 255, 0.2); overflow: hidden; position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
`;

const ModalClose = styled.button`
  position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); border: none;
  color: white; width: 32px; height: 32px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; cursor: pointer; z-index: 10;
  transition: 0.2s; &:hover { background: #ff4757; transform: rotate(90deg); }
`;

const ModalImage = styled.img` width: 100%; height: auto; max-height: 280px; object-fit: cover; display: block; border-bottom: 1px solid rgba(255,255,255,0.1); `;

const ModalContent = styled.div`
  padding: 24px; text-align: center;
  h2 { font-size: 22px; margin-bottom: 12px; color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; }
  p { font-size: 14px; color: #a0a0a0; line-height: 1.6; margin-bottom: 20px; }
`;

const ConfirmButton = styled.button`
  width: 100%; padding: 14px; border-radius: 14px; background: linear-gradient(90deg, #3ea6ff, #2563eb);
  border: none; color: white; font-weight: 700; font-size: 15px; cursor: pointer;
  transition: 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(62, 166, 255, 0.4); }
`;

const LogoutActions = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; `;

const CancelButton = styled.button`
  padding: 14px; border-radius: 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; font-weight: 600; cursor: pointer; transition: 0.2s; &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const LogoutButton = styled.button`
  padding: 14px; border-radius: 14px; background: #ff4757; border: none; color: white; font-weight: 700;
  cursor: pointer; transition: 0.2s; &:hover { background: #ff2e44; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3); }
`;

const MarqueeContainer = styled(motion.div)`
  background: rgba(62, 166, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(62, 166, 255, 0.2);
  border-radius: 12px; margin-bottom: 20px; overflow: hidden; display: flex; align-items: center; height: 44px; position: relative;
`;

const MarqueeText = styled.div`
  white-space: nowrap; display: inline-block; padding-left: 100%; animation: ${marquee} 35s linear infinite;
  font-weight: 500; font-size: 13px; color: #fff; display: flex; align-items: center; &:hover { animation-play-state: paused; }
  .marquee-item { display: inline-flex; align-items: center; gap: 12px; margin-right: 80px; }
`;

const FixedLabel = styled.div`
  position: absolute; left: 0; background: linear-gradient(90deg, #3ea6ff, #2563eb); color: #fff; padding: 0 15px; height: 100%;
  display: flex; align-items: center; font-weight: 800; z-index: 5; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
`;

const MobileHeader = styled.div`
  display: none; position: fixed; top: 0; left: 0; right: 0; height: 60px; background: rgba(8, 8, 10, 0.85); backdrop-filter: blur(15px);
  padding: 0 20px; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); z-index: 900;
  @media (max-width: 1024px) { display: flex; }
`;

const StatsRow = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; `;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 18px;
  display: flex; align-items: center; gap: 12px; animation: ${float} 6s ease-in-out infinite; animation-delay: ${props => props.$delay || '0s'};
  .icon-box { width: 44px; height: 44px; border-radius: 12px; background: ${props => props.$bg || 'rgba(62, 166, 255, 0.1)'}; color: ${props => props.$color || '#3ea6ff'}; display: flex; align-items: center; justify-content: center; }
  .info { display: flex; flex-direction: column; span { font-size: 10px; color: #777; text-transform: uppercase; font-weight: 700; } strong { font-size: 18px; color: #fff; font-weight: 800; margin-top: 1px; } }
`;

const Overview = ({ user }) => {
  const [stats, setStats] = useState({ balance: 0, totalEarnings: 0, activePlans: 0, totalReferrals: 0 });
  useEffect(() => {
    api.get("/auth/dashboard-stats").then(res => {
      if(res.data) setStats({
        balance: Number(res.data.balance) || 0,
        totalEarnings: Number(res.data.totalEarnings) || 0,
        activePlans: Number(res.data.activePlans) || 0,
        totalReferrals: Number(res.data.totalReferrals) || 0
      });
    }).catch(e => console.error(e));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
          Welcome back, <span style={{ color: '#3ea6ff' }}>{user.name.split(' ')[0]}</span>
        </h1>
        <p style={{ color: '#555', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
           <ShieldCheck size={14} color="#2ecc71" /> Portfolio Status: <span style={{color: '#2ecc71', fontWeight: 700}}>Live</span>
        </p>
      </div>
      <StatsRow>
        <StatCard $delay="0s"><div className="icon-box"><DollarSign size={20}/></div><div className="info"><span>Balance</span><strong>${stats.balance.toLocaleString()}</strong></div></StatCard>
        <StatCard $bg="rgba(46, 204, 113, 0.1)" $color="#2ecc71" $delay="1s"><div className="icon-box"><TrendingUp size={20}/></div><div className="info"><span>Profit</span><strong>${stats.totalEarnings.toLocaleString()}</strong></div></StatCard>
        <StatCard $bg="rgba(231, 76, 60, 0.1)" $color="#ff6b6b" $delay="2s"><div className="icon-box"><Zap size={20}/></div><div className="info"><span>Engines</span><strong>{stats.activePlans}</strong></div></StatCard>
        <StatCard $bg="rgba(142, 45, 226, 0.1)" $color="#8e2de2" $delay="3s"><div className="icon-box"><Users size={20}/></div><div className="info"><span>Nodes</span><strong>{stats.totalReferrals}</strong></div></StatCard>
      </StatsRow>
      
      {/* 🟢 Updated Section: Removed Wallet, Income (Earning Analysis) now takes full width */}
      <div style={{ width: '100%' }}>
         <Income />
      </div>
    </motion.div>
  );
};

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({ name: "User", role: "user" });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [announcement, setAnnouncement] = useState({ text: "", image: "" });
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { 
    localStorage.removeItem("token"); 
    localStorage.removeItem("user"); 
    navigate("/login"); 
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) {
      const userData = stored.user || stored;
      setUser(userData);
      if (userData.role === 'admin' && activeTab === 'dashboard') setActiveTab('admin-overview');
    }
    
    api.get("/settings/announcement").then(res => {
      if (res.data) {
        setAnnouncement({ text: res.data.announcement_text, image: res.data.announcement_image });
        const role = user?.role || JSON.parse(localStorage.getItem("user"))?.role;
        const hasSeenPopup = sessionStorage.getItem("announcementSeen");
        if (res.data.announcement_image && role !== 'admin' && !hasSeenPopup) { 
          setShowModal(true); 
        }
      }
    });
  }, [user.role, activeTab]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get("/admin/pending-count")
        .then(res => setPendingCount(res.data.count))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleCloseModal = () => { 
    setShowModal(false); 
    sessionStorage.setItem("announcementSeen", "true"); 
  };

  const handleTabChange = (tabId) => { 
    setActiveTab(tabId); 
    setSidebarOpen(false); 
    if (tabId.startsWith('admin-')) navigate('/admin'); 
    else navigate('/dashboard'); 
  };

  const isAdminView = activeTab.startsWith("admin-");

  return (
    <LayoutWrapper>
      <AnimatePresence>
        {showSplash && <RocketSplash onComplete={() => setShowSplash(false)} />}
        {showModal && announcement.image && !isAdminView && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
            <AnnouncementCard 
              initial={{ scale: 0.7, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.7, opacity: 0, y: 50 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }} 
              onClick={(e) => e.stopPropagation()}
            >
              <ModalClose onClick={handleCloseModal}><X size={18}/></ModalClose>
              <ModalImage src={announcement.image} alt="Promotion" />
              <ModalContent>
                <h2><Megaphone size={20} /> Notice</h2>
                <p>{announcement.text || "New system updates are now live."}</p>
                <ConfirmButton onClick={handleCloseModal}>Got it!</ConfirmButton>
              </ModalContent>
            </AnnouncementCard>
          </ModalOverlay>
        )}
        {showLogoutModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutModal(false)}>
            <AnnouncementCard 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '400px' }}
            >
              <ModalContent style={{ padding: '40px 30px' }}>
                <div style={{ background: 'rgba(255, 71, 87, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 20px', color: '#ff4757' }}>
                  <LogOut size={30} />
                </div>
                <h2>End Session?</h2>
                <p>Are you sure you want to log out?</p>
                <LogoutActions>
                  <CancelButton onClick={() => setShowLogoutModal(false)}>Stay</CancelButton>
                  <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
                </LogoutActions>
              </ModalContent>
            </AnnouncementCard>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <MobileHeader>
        <div style={{fontWeight:900, fontSize:'18px'}}>Travel<span style={{color:'#3ea6ff'}}>Rent</span></div>
        <Menu onClick={() => setSidebarOpen(true)} size={22} style={{cursor:'pointer'}} />
      </MobileHeader>

      <SidebarContainer $isOpen={isSidebarOpen}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          user={user} 
          pendingCount={pendingCount} 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onLogout={() => setShowLogoutModal(true)} 
        />
      </SidebarContainer>

      <MainContent>
        {announcement.text && !isAdminView && (
          <MarqueeContainer initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <FixedLabel><Bell size={12} style={{marginRight: 6}}/> Info</FixedLabel>
            <MarqueeText>
              <div className="marquee-item">🚀 {announcement.text}</div>
              <div className="marquee-item">🚀 {announcement.text}</div>
            </MarqueeText>
          </MarqueeContainer>
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, rotateX: 5, y: 10 }} 
            animate={{ opacity: 1, rotateX: 0, y: 0 }} 
            exit={{ opacity: 0, rotateX: -5, y: -10 }} 
            transition={{ type: "spring", stiffness: 120, damping: 20 }} 
            style={{ transformStyle: 'preserve-3d', width: '100%' }}
          >
             {isAdminView ? ( 
               <AdminPanel initialView={activeTab.replace("admin-", "")} /> 
             ) : (
              activeTab === "wallet" ? <Wallet /> :
              activeTab === "withdraw" ? <Withdraw /> :
              activeTab === "history" ? <History /> :
              activeTab === "settings" ? <Settings /> :
              activeTab === "network" ? <Referrals /> :
              activeTab === "earnings" ? <Income /> :
              activeTab === "packages" ? <Packages /> :
              activeTab === "earning-history" ? <EarningHistory /> : <Overview user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </MainContent>

      <ChatBot />
    </LayoutWrapper>
  );
}