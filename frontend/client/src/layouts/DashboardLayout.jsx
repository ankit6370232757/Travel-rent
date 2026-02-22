import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, TrendingUp, Users, DollarSign, Zap, Bell, X, 
  Sparkles, ShieldCheck, Maximize2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; 
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
  min-height: 100vh;
  width: 100vw;
  background-color: #050507; 
  color: #fff;
  display: flex;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  width: 260px; /* Slimmer sidebar */
  z-index: 1000;
  transition: transform 0.3s ease;
  @media (max-width: 1024px) {
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px; 
  padding: 25px; /* Reduced padding for density */
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 0%, rgba(20, 20, 30, 0.4) 0%, rgba(5, 5, 7, 1) 100%);
  
  @media (max-width: 1024px) {
    margin-left: 0;
    padding: 85px 15px 30px 15px;
  }
`;

const MarqueeContainer = styled(motion.div)`
  background: rgba(62, 166, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(62, 166, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  height: 44px; /* Slimmer ticker */
  position: relative;
`;

const MarqueeText = styled.div`
  white-space: nowrap;
  display: inline-block;
  padding-left: 100%;
  animation: ${marquee} 35s linear infinite;
  font-weight: 500;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  &:hover { animation-play-state: paused; }
  .marquee-item { display: inline-flex; align-items: center; gap: 12px; margin-right: 80px; }
`;

const AnnouncementImage = styled.img`
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  &:hover { transform: scale(1.1); border-color: #3ea6ff; }
`;

const FixedLabel = styled.div`
  position: absolute;
  left: 0; background: linear-gradient(90deg, #3ea6ff, #2563eb);
  color: #fff; padding: 0 15px; height: 100%;
  display: flex; align-items: center; font-weight: 800; z-index: 5;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
`;

const MobileHeader = styled.div`
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(8, 8, 10, 0.85);
  backdrop-filter: blur(15px);
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  z-index: 900;
  @media (max-width: 1024px) { display: flex; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Smaller min-width */
  gap: 15px;
  margin-bottom: 25px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; /* Smaller radius */
  padding: 18px; /* Reduced padding */
  display: flex; align-items: center; gap: 12px;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};

  .icon-box {
    width: 44px; height: 44px; border-radius: 12px;
    background: ${props => props.$bg || 'rgba(62, 166, 255, 0.1)'};
    color: ${props => props.$color || '#3ea6ff'};
    display: flex; align-items: center; justify-content: center;
    svg { size: 20px; }
  }
  
  .info {
    display: flex; flex-direction: column;
    span { font-size: 10px; color: #777; text-transform: uppercase; font-weight: 700; }
    strong { font-size: 18px; color: #fff; font-weight: 800; margin-top: 1px; }
  }
`;

// --- MODAL STYLES ---
const ImageOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.9);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(10px);
`;

const PreviewImage = styled(motion.img)`
  max-width: 90%; max-height: 80vh; border-radius: 12px;
  box-shadow: 0 0 50px rgba(62, 166, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

// --- OVERVIEW COMPONENT ---
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
          Welcome back, <span style={{ color: '#3ea6ff' }}>{user.name.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: '#555', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
           <ShieldCheck size={14} color="#2ecc71" /> Portfolio Status: <span style={{color: '#2ecc71', fontWeight: 700}}>Live</span>
        </p>
      </div>

      <StatsRow>
        <StatCard $delay="0s">
          <div className="icon-box"><DollarSign size={20}/></div>
          <div className="info"><span>Balance</span><strong>${stats.balance.toLocaleString()}</strong></div>
        </StatCard>
        <StatCard $bg="rgba(46, 204, 113, 0.1)" $color="#2ecc71" $delay="1s">
          <div className="icon-box"><TrendingUp size={20}/></div>
          <div className="info"><span>Profit</span><strong>${stats.totalEarnings.toLocaleString()}</strong></div>
        </StatCard>
        <StatCard $bg="rgba(231, 76, 60, 0.1)" $color="#ff6b6b" $delay="2s">
          <div className="icon-box"><Zap size={20}/></div>
          <div className="info"><span>Engines</span><strong>{stats.activePlans}</strong></div>
        </StatCard>
        <StatCard $bg="rgba(142, 45, 226, 0.1)" $color="#8e2de2" $delay="3s">
          <div className="icon-box"><Users size={20}/></div>
          <div className="info"><span>Nodes</span><strong>{stats.totalReferrals}</strong></div>
        </StatCard>
      </StatsRow>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
         <div style={{ gridColumn: 'span 12' }}><Packages /></div>
         <div style={{ gridColumn: 'span 12', lg: 'span 4' }}><Wallet /></div>
         <div style={{ gridColumn: 'span 12', lg: 'span 8' }}><Income /></div>
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
  const [previewImage, setPreviewImage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) {
      const userData = stored.user || stored;
      setUser(userData);
      if (userData.role === 'admin' && activeTab === 'dashboard') setActiveTab('admin-overview');
    }
    
    api.get("/settings/announcement").then(res => {
      if (res.data) setAnnouncement({ text: res.data.announcement_text, image: res.data.announcement_image });
    });
  }, []);

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
        
        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <ImageOverlay 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <X size={30} style={{position: 'absolute', top: 30, right: 30, cursor: 'pointer', color: '#888'}} />
            <PreviewImage 
              src={previewImage} 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </ImageOverlay>
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
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </SidebarContainer>

      <MainContent>
        {announcement.text && !isAdminView && (
          <MarqueeContainer initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <FixedLabel><Bell size={12} style={{marginRight: 6}}/> Info</FixedLabel>
            <MarqueeText>
              {[1, 2].map((i) => (
                <div className="marquee-item" key={i}>
                  {announcement.image && (
                    <AnnouncementImage 
                      src={announcement.image} 
                      alt="News" 
                      onClick={() => setPreviewImage(announcement.image)} 
                    />
                  )}
                  <span>🚀 {announcement.text}</span>
                </div>
              ))}
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
              activeTab === "packages" ? <Packages /> : <Overview user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </MainContent>

      <ChatBot />
    </LayoutWrapper>
  );
}