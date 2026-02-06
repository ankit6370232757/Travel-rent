import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; 
import Sidebar from "../components/Sidebar";
import ChatBot from "../components/ChatBot";

// Components
import Wallet from "../dashboard/Wallet";
import Withdraw from "../dashboard/Withdraw";
import Referrals from "../dashboard/Referrals";
import Income from "../dashboard/Income";
import Packages from "../dashboard/Packages";
import History from "../dashboard/History";
import Settings from "../dashboard/Settings";
import AdminPanel from "../dashboard/AdminPanel"; // Ensure this path is correct based on your folder structure

// --- STYLED COMPONENTS ---

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #fff;
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  margin-left: 280px;
  padding: 40px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 20px;
  }
`;

const BackgroundGlow = styled.div`
  position: fixed;
  top: 10%;
  right: 10%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(62, 166, 255, 0.05) 0%, rgba(0,0,0,0) 60%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
`;

const MobileTopBar = styled.div`
  display: none;
  padding: 15px 20px;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 90;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    display: flex;
  }
`;

// --- WELCOME BANNER ---
const WelcomeBanner = styled(motion.div)`
  background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);

  h1 { 
    margin: 0 0 10px 0; 
    font-size: 2.2rem; 
    font-weight: 800;
    background: linear-gradient(90deg, #fff, #a0a0a0); 
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent; 
  }
  p { color: #888; margin: 0; font-size: 1.1rem; }
`;

// --- OVERVIEW SECTION ---
const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr; 
  gap: 25px;
  margin-bottom: 40px;

  @media (max-width: 1200px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const ChartWrapper = styled(motion.div)`
  @media (max-width: 1200px) { grid-column: span 2; }
  @media (max-width: 768px) { grid-column: span 1; }
`;

const SectionTitle = styled(motion.h3)`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  &::before {
    content: ''; width: 4px; height: 24px; background: #3ea6ff; border-radius: 2px;
  }
`;

// Animation Variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 60 } } };

const Overview = ({ user }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants}>
      <WelcomeBanner>
        <h1>Welcome back, {user?.name || "Investor"} 🚀</h1>
        <p>Your portfolio performance and active investments at a glance.</p>
      </WelcomeBanner>
    </motion.div>

    <OverviewGrid>
      <motion.div variants={itemVariants}><Wallet /></motion.div>
      <motion.div variants={itemVariants}><Withdraw /></motion.div>
      <ChartWrapper variants={itemVariants}><Income /></ChartWrapper>
    </OverviewGrid>

    <motion.div variants={itemVariants}>
      <SectionTitle>Available Packages</SectionTitle>
      <Packages />
    </motion.div>
  </motion.div>
);

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({ name: "User", email: "..." });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Load User (✅ FIXED: Handles Nested User Data)
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // If the data is like { token: "...", user: { role: "admin" } }
        // We need to grab the inner 'user' object.
        const realUser = parsedData.user || parsedData;
        setUser(realUser);
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);

  // 2. 🛡️ URL Sync (Admin Mode)
  useEffect(() => {
    if (location.pathname === "/admin") {
      setActiveTab("admin");
    } else {
      // If user navigates BACK to dashboard via URL, ensure tab updates
      if (activeTab === "admin") setActiveTab("dashboard");
    }
  }, [location.pathname]);

  // 3. 🛡️ Handle Tab Switching & Routing
  const handleTabChange = (tabId) => {
    if (tabId === 'admin') {
      navigate('/admin'); // Go to Admin URL
    } else {
      // If we are currently on the Admin page but clicking a User tab (like Wallet)
      // We must navigate back to the Dashboard URL to prevent getting stuck
      if (location.pathname === '/admin') {
        navigate('/dashboard');
      }
      setActiveTab(tabId);
    }
  };

  const handleLogout = () => {
    if(window.confirm("Log out now?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Overview user={user} />;
      case "wallet":    return <Wallet />;
      case "withdraw":  return <Withdraw />;
      case "history":   return <History />; 
      case "settings":  return <Settings />;
      case "network":   return <Referrals />;
      case "earnings":  return <Income />;
      case "packages":  return <Packages />;
      case "admin":     return <AdminPanel />; 
      default:          return <Overview user={user} />;
    }
  };

  return (
    <LayoutWrapper>
      <BackgroundGlow />
      
      <MobileTopBar>
        <span style={{ fontWeight: 800, fontSize: '20px' }}>Travel<span style={{color: '#3ea6ff'}}>Rent</span></span>
        <Menu onClick={() => setSidebarOpen(true)} color="white" />
      </MobileTopBar>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} // 👈 Using the smart handler
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