import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, TrendingUp, Users, DollarSign, Activity, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; 
import api from "../api/axios"; // 👈 Real Data Import

import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";
import RocketSplash from "../components/RocketSplash"; 

// Components
import Wallet from "../dashboard/Wallet";
import Withdraw from "../dashboard/Withdraw";
import Referrals from "../dashboard/Referrals";
import Income from "../dashboard/Income";
import Packages from "../dashboard/Packages";
import History from "../dashboard/History";
import Settings from "../dashboard/Settings";
import AdminPanel from "../dashboard/AdminPanel"; 

// --- STYLED COMPONENTS ---

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background-color: #08080a; /* Deep premium dark background */
  color: #fff;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  display: flex;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; /* Exact width of Sidebar */
  padding: 30px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  width: calc(100% - 280px); /* Ensures content doesn't overflow horizontally */
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 20px;
    padding-top: 80px; /* Space for Mobile Top Bar */
  }
`;

const BackgroundGlow = styled.div`
  position: fixed;
  top: 0; right: 0;
  width: 60vw; height: 60vw;
  background: radial-gradient(circle at 70% 20%, rgba(62, 166, 255, 0.08) 0%, rgba(0,0,0,0) 60%);
  z-index: 0; pointer-events: none;
`;

const SecondaryGlow = styled.div`
  position: fixed;
  bottom: 0; left: 0;
  width: 40vw; height: 40vw;
  background: radial-gradient(circle at 20% 80%, rgba(142, 45, 226, 0.06) 0%, rgba(0,0,0,0) 60%);
  z-index: 0; pointer-events: none;
`;

const MobileTopBar = styled.div`
  display: none;
  padding: 15px 20px;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 90;

  @media (max-width: 768px) { display: flex; }
`;

// --- DASHBOARD WIDGET STYLES ---

const WelcomeSection = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 30px;
`;

const WelcomeText = styled.div`
  h1 {
    font-size: 28px; font-weight: 800; margin: 0;
    background: linear-gradient(90deg, #fff, #a0a0a0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  p { font-size: 14px; color: #888; margin: 6px 0 0 0; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex; align-items: center; gap: 16px;
  transition: all 0.3s ease;
  position: relative; overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .icon-box {
    width: 50px; height: 50px; border-radius: 14px;
    background: ${props => props.$bg || 'rgba(62, 166, 255, 0.1)'};
    color: ${props => props.$color || '#3ea6ff'};
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  .info {
    display: flex; flex-direction: column;
    span { font-size: 12px; color: #888; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    strong { font-size: 20px; color: #fff; font-weight: 700; margin-top: 4px; }
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 25px;
  margin-bottom: 40px;
`;

const GridItem = styled(motion.div)`
  /* Layout Logic */
  &.wallet-section { grid-column: span 4; } /* 33% width */
  &.chart-section { grid-column: span 8; }  /* 66% width */
  &.packages-section { grid-column: span 12; } /* Full width */

  @media (max-width: 1200px) {
    &.wallet-section { grid-column: span 12; }
    &.chart-section { grid-column: span 12; }
  }
`;

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } } };

// --- OVERVIEW COMPONENT (With Real Data) ---
const Overview = ({ user }) => {
  const [stats, setStats] = useState({
    balance: 0,
    totalEarnings: 0,
    activePlans: 0,
    totalReferrals: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/auth/dashboard-stats"); 
        if(res.data) {
           setStats({
             balance: Number(res.data.balance) || 0,
             totalEarnings: Number(res.data.totalEarnings) || 0,
             activePlans: Number(res.data.activePlans) || 0,
             totalReferrals: Number(res.data.totalReferrals) || 0
           });
        }
      } catch (error) {
        console.error("Using default stats (API Error or Dev Mode)");
        setStats({ balance: 0, totalEarnings: 0, activePlans: 0, totalReferrals: 0 }); 
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <WelcomeSection>
        <WelcomeText>
          <h1>Hello, {user?.name?.split(' ')[0] || "User"} 👋</h1>
          <p>Here is your investment portfolio overview.</p>
        </WelcomeText>
      </WelcomeSection>

      <StatsRow>
         <StatCard variants={itemVariants}>
            <div className="icon-box"><DollarSign size={24}/></div>
            <div className="info">
              <span>Total Balance</span>
              <strong>${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
         </StatCard>
         
         <StatCard variants={itemVariants} $bg="rgba(46, 204, 113, 0.1)" $color="#2ecc71">
            <div className="icon-box"><TrendingUp size={24}/></div>
            <div className="info">
              <span>Total Profit</span>
              <strong>${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
         </StatCard>
         
         <StatCard variants={itemVariants} $bg="rgba(231, 76, 60, 0.1)" $color="#ff6b6b">
            <div className="icon-box"><Zap size={24}/></div>
            <div className="info">
              <span>Active Plans</span>
              <strong>{stats.activePlans} Running</strong>
            </div>
         </StatCard>
         
         <StatCard variants={itemVariants} $bg="rgba(142, 45, 226, 0.1)" $color="#8e2de2">
            <div className="icon-box"><Users size={24}/></div>
            <div className="info">
              <span>Network</span>
              <strong>{stats.totalReferrals} Partners</strong>
            </div>
         </StatCard>
      </StatsRow>

      <DashboardGrid>
        <GridItem className="wallet-section" variants={itemVariants}>
           <Wallet /> 
        </GridItem>
        <GridItem className="chart-section" variants={itemVariants}>
           <Income />
        </GridItem>
        <GridItem className="packages-section" variants={itemVariants}>
           <Packages />
        </GridItem>
      </DashboardGrid>
    </motion.div>
  );
};

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({ name: "User", email: "...", role: "user" });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true); 
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Load User
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const realUser = parsedData.user || parsedData;
        setUser(realUser);

        // 🛡️ INITIAL ROLE PROTECTION
        // If user is admin and the default tab is dashboard, switch to admin overview
        if (realUser.role === 'admin' && activeTab === "dashboard") {
          setActiveTab("admin-overview");
        }
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);

  // 2. 🛡️ URL Sync & ROLE PROTECTION
  useEffect(() => {
    if (!user || !user.email) return; 

    if (user.role === 'admin') {
       // If an admin somehow lands on "dashboard", force them to "admin-overview"
       if (activeTab === "dashboard") {
         setActiveTab("admin-overview");
         return;
       }
       if (!activeTab.startsWith("admin-")) {
          if (location.pathname !== '/admin') navigate('/admin');
       }
    } else {
       if (activeTab.startsWith("admin-") || location.pathname === '/admin') {
         setActiveTab('dashboard');
         navigate('/dashboard');
       }
    }
  }, [user, activeTab, location.pathname, navigate]);

  // 3. Handle Tab Switching
  const handleTabChange = (tabId) => {
    // If admin clicks a user-only tab, prevent it (optional safety)
    if (user.role === 'admin' && tabId === "dashboard") {
      setActiveTab("admin-overview");
      return;
    }

    if (tabId.startsWith("admin-")) {
       if (location.pathname !== '/admin') navigate('/admin');
    } else {
       if (location.pathname === '/admin') navigate('/dashboard');
    }
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    if(window.confirm("Log out now?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // Content Rendering Logic
  const renderContent = () => {
    if (activeTab.startsWith("admin-")) {
      const view = activeTab.replace("admin-", ""); 
      return <AdminPanel initialView={view} />;
    }

    switch (activeTab) {
      case "dashboard": 
        // 🛡️ Final check: Never render Overview for Admin
        if (user.role === 'admin') return <AdminPanel initialView="overview" />;
        return <Overview user={user} />;
      case "wallet":    return <Wallet />;
      case "withdraw":  return <Withdraw />;
      case "history":   return <History />; 
      case "settings":  return <Settings />;
      case "network":   return <Referrals />;
      case "earnings":  return <Income />;
      case "packages":  return <Packages />;
      default:          
        if (user.role === 'admin') return <AdminPanel initialView="overview" />;
        return <Overview user={user} />;
    }
  };

  return (
    <LayoutWrapper>
      <AnimatePresence>
        {showSplash && (
          <RocketSplash onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <BackgroundGlow />
      <SecondaryGlow />
      
      <MobileTopBar>
        <span style={{ fontWeight: 800, fontSize: '20px' }}>Travel<span style={{color: '#3ea6ff'}}>Rent</span></span>
        <Menu onClick={() => setSidebarOpen(true)} color="white" />
      </MobileTopBar>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={handleLogout}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <MainContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </MainContent>
      <ChatBot />
    </LayoutWrapper>
  );
}