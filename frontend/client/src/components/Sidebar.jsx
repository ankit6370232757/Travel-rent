import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Wallet, 
  Users, 
  TrendingUp, 
  LogOut, 
  Box, 
  X,
  CreditCard,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ShieldAlert, 
  BarChart2, 
  FileText, 
  UserCheck, 
  ChevronDown, 
  ChevronRight,
  Sliders // 👈 Imported Sliders icon for Settings
} from "lucide-react";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  width: 280px;
  height: 100vh;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    width: 100%; 
    max-width: 300px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Logo = styled.h1`
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  span {
    color: #3ea6ff;
  }
`;

const CloseButton = styled.div`
  cursor: pointer;
  color: #888;
  display: none;
  &:hover { color: #fff; }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto; /* Allow scrolling if menu is tall */
  &::-webkit-scrollbar { display: none; }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  margin: 20px 0 10px 12px;
  letter-spacing: 1px;
`;

const MenuItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  
  /* 🎨 Dynamic Color based on Admin status */
  color: ${props => props.$active ? (props.$isAdmin ? "#e74c3c" : "#fff") : "#888"};
  
  background: ${props => props.$active ? (props.$isAdmin ? "rgba(231, 76, 60, 0.1)" : "linear-gradient(90deg, rgba(62, 166, 255, 0.15), rgba(62, 166, 255, 0.05))") : "transparent"};
  
  border: 1px solid ${props => props.$active ? (props.$isAdmin ? "rgba(231, 76, 60, 0.2)" : "rgba(62, 166, 255, 0.2)") : "transparent"};

  position: relative;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.$isAdmin ? "#e74c3c" : "#fff"};
    background: ${props => props.$isAdmin ? "rgba(231, 76, 60, 0.05)" : "rgba(255, 255, 255, 0.03)"};
  }
`;

const SubMenu = styled(motion.div)`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 12px;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 12px;
  margin-top: 5px;
`;

const UserSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  margin-top: auto;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ea6ff, #8e2de2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 18px;
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  strong {
    font-size: 14px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    font-size: 12px;
    color: #666;
  }
`;

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, isOpen, onClose }) {
  const [adminExpanded, setAdminExpanded] = useState(true);
  const isAdmin = user && user.role === 'admin';

  const handleNav = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 768) onClose();
  };

  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth > 768) && (
        <Container
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <Header>
            <Logo>Travel<span>Rent</span></Logo>
            <CloseButton onClick={onClose}><X size={24} /></CloseButton>
          </Header>

          <Menu>
            {/* 🛡️ ADMIN SECTION (Only for Admins) */}
            {isAdmin && (
              <>
                <SectionLabel style={{ color: '#e74c3c' }}>Administration</SectionLabel>
                
                {/* Collapsible Header */}
                <MenuItem 
                  $isAdmin={true} 
                  $active={false} 
                  onClick={() => setAdminExpanded(!adminExpanded)} 
                  style={{justifyContent: 'space-between'}}
                >
                  <div style={{display:'flex', gap:12, alignItems:'center'}}>
                    <ShieldAlert size={18}/> Admin Console
                  </div>
                  {adminExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </MenuItem>

                {/* Dropdown Items */}
                <AnimatePresence>
                  {adminExpanded && (
                    <SubMenu 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <MenuItem 
                        $isAdmin={true} 
                        $active={activeTab === "admin-overview"} 
                        onClick={() => handleNav("admin-overview")}
                      >
                        <BarChart2 size={16} /> Dashboard
                      </MenuItem>
                      <MenuItem 
                        $isAdmin={true} 
                        $active={activeTab === "admin-requests"} 
                        onClick={() => handleNav("admin-requests")}
                      >
                        <FileText size={16} /> Requests
                      </MenuItem>
                      <MenuItem 
                        $isAdmin={true} 
                        $active={activeTab === "admin-users"} 
                        onClick={() => handleNav("admin-users")}
                      >
                        <UserCheck size={16} /> User Manager
                      </MenuItem>
                      {/* 👇 NEW SETTINGS MENU ITEM */}
                      <MenuItem 
                        $isAdmin={true} 
                        $active={activeTab === "admin-settings"} 
                        onClick={() => handleNav("admin-settings")}
                      >
                        <Sliders size={16} /> System Settings
                      </MenuItem>
                    </SubMenu>
                  )}
                </AnimatePresence>
                
                {/* Divider for Admins */}
                <div style={{height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />
              </>
            )}

            {/* 👤 USER SECTION (For everyone, but Admins might not need it all) */}
            {!isAdmin && (
              <>
                <SectionLabel>Main Menu</SectionLabel>
                <MenuItem $active={activeTab === "dashboard"} onClick={() => handleNav("dashboard")}>
                  <Home size={18} /> Overview
                </MenuItem>
                <MenuItem $active={activeTab === "wallet"} onClick={() => handleNav("wallet")}>
                  <Wallet size={18} /> My Wallet
                </MenuItem>
                <MenuItem $active={activeTab === "withdraw"} onClick={() => handleNav("withdraw")}>
                  <CreditCard size={18} /> Withdraw
                </MenuItem>
                <MenuItem $active={activeTab === "packages"} onClick={() => handleNav("packages")}>
                  <Box size={18} /> Packages
                </MenuItem>
                <MenuItem $active={activeTab === "history"} onClick={() => handleNav("history")}>
                  <HistoryIcon size={18} /> History
                </MenuItem>
                <MenuItem $active={activeTab === "network"} onClick={() => handleNav("network")}>
                  <Users size={18} /> My Network
                </MenuItem>
                <MenuItem $active={activeTab === "settings"} onClick={() => handleNav("settings")}>
                  <SettingsIcon size={18} /> Settings
                </MenuItem>
              </>
            )}
          </Menu>

          <UserSection>
            <MenuItem onClick={onLogout} style={{ marginBottom: 10, color: '#ff5c5c' }}>
              <LogOut size={20} />
              Logout
            </MenuItem>
            
            <UserCard>
              <UserAvatar>{user?.name?.charAt(0).toUpperCase() || "U"}</UserAvatar>
              <UserMeta>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.email}</span>
                {isAdmin && <span style={{color: '#e74c3c', fontSize: '10px', fontWeight: 'bold', marginTop: 4}}>ADMIN ACCESS</span>}
              </UserMeta>
            </UserCard>
          </UserSection>
        </Container>
      )}
    </AnimatePresence>
  );
}