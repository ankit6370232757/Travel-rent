import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Wallet, 
  Users, 
  LogOut, 
  Box, 
  X,
  CreditCard,
  History as HistoryIcon,
  Settings as SettingsIcon,
  BarChart2, 
  FileText, 
  UserCheck, 
  Sliders,
  Package,
  Banknote,
  TrendingUp 
} from "lucide-react";

// --- STYLED COMPONENTS ---

const Container = styled(motion.div)`
  width: 280px;
  height: 100vh;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(25px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 10px 0 40px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    width: 100%; 
    max-width: 300px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-left: 10px;
  flex-shrink: 0;
`;

const Logo = styled.h1`
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  text-shadow: 0 0 20px rgba(62, 166, 255, 0.3);

  span {
    color: #3ea6ff;
  }
`;

const CloseButton = styled.div`
  cursor: pointer;
  color: #888;
  display: none;
  transition: 0.2s;
  &:hover { color: #fff; }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 5px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  margin: 25px 0 10px 16px;
  letter-spacing: 1.2px;
  flex-shrink: 0;
`;

const MenuItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  color: ${props => props.$active 
    ? (props.$isAdmin ? "#ff6b6b" : "#fff") 
    : "#9ca3af"};

  background: ${props => props.$active 
    ? (props.$isAdmin 
        ? "linear-gradient(90deg, rgba(255, 107, 107, 0.1) 0%, transparent 100%)" 
        : "linear-gradient(90deg, rgba(62, 166, 255, 0.1) 0%, transparent 100%)")
    : "transparent"};

  border-left: 3px solid ${props => props.$active 
    ? (props.$isAdmin ? "#ff6b6b" : "#3ea6ff") 
    : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: #fff;
    padding-left: 20px;
  }
`;

const NotificationBadge = styled.span`
  background: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.4);
`;

const UserSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const UserAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3ea6ff, #8e2de2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(62, 166, 255, 0.3);
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
    font-size: 11px;
    color: #666;
  }
`;

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, isOpen, onClose, pendingCount }) {
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
            {/* 🛡️ ADMIN SECTION (Flattened - No Dropdown) */}
            {isAdmin ? (
              <>
                <SectionLabel style={{ color: '#ff6b6b' }}>Administration</SectionLabel>
                
                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-overview"} 
                  onClick={() => handleNav("admin-overview")}
                >
                  <BarChart2 size={18} /> Admin Dashboard
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-requests"} 
                  onClick={() => handleNav("admin-requests")}
                >
                  <FileText size={18} /> 
                  Requests
                  {/* 🟢 Show badge if count > 0 */}
                  {isAdmin && pendingCount > 0 && (
                    <NotificationBadge>{pendingCount}</NotificationBadge>
                  )}
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-users"} 
                  onClick={() => handleNav("admin-users")}
                >
                  <UserCheck size={18} /> User Manager
                </MenuItem>
                
                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-settings"} 
                  onClick={() => handleNav("admin-settings")}
                >
                  <Sliders size={18} /> System Settings
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-packages"} 
                  onClick={() => handleNav("admin-packages")}
                >
                  <Package size={18} /> Manage Plans
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-finance"} 
                  onClick={() => handleNav("admin-finance")}
                >
                  <Banknote size={18} /> Finance Log
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-payment-settings"} 
                  onClick={() => handleNav("admin-payment-settings")}
                >
                  <CreditCard size={18} /> Payment Settings
                </MenuItem>

                <MenuItem 
                  $isAdmin={true} 
                  $active={activeTab === "admin-withdraw-settings"} 
                  onClick={() => handleNav("admin-withdraw-settings")}
                >
                  <Banknote size={18} /> Withdraw Options
                </MenuItem>
              </>
            ) : (
              /* 👤 USER SECTION (Only visible to regular users) */
              <>
                <SectionLabel>Main Menu</SectionLabel>
                <MenuItem $active={activeTab === "dashboard"} onClick={() => handleNav("dashboard")}>
                  <Home size={18} /> Dashboard
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
                <MenuItem $active={activeTab === "earning-history"} onClick={() => handleNav("earning-history")}>
                   <TrendingUp size={18} /> Earning History
                </MenuItem>
                <MenuItem $active={activeTab === "earnings"} onClick={() => handleNav("earnings")}>
                <BarChart2 size={18} /> Growth Analytics
                </MenuItem>
                <MenuItem $active={activeTab === "settings"} onClick={() => handleNav("settings")}>
                  <SettingsIcon size={18} /> Settings
                </MenuItem>
              </>
            )}
          </Menu>

          <UserSection>
            <MenuItem onClick={onLogout} style={{ marginBottom: 10, color: '#ff6b6b' }}>
              <LogOut size={20} />
              Logout
            </MenuItem>
            
            <UserCard>
              <UserAvatar>{user?.name?.charAt(0).toUpperCase() || "U"}</UserAvatar>
              <UserMeta>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.email}</span>
                {isAdmin && <span style={{color: '#ff6b6b', fontSize: '10px', fontWeight: 'bold', marginTop: 4}}>ADMIN ACCESS</span>}
              </UserMeta>
            </UserCard>
          </UserSection>
        </Container>
      )}
    </AnimatePresence>
  );
}